<#
.SYNOPSIS
  MusicOS no Podman (Windows / PowerShell).

.DESCRIPTION
  Uso (na raiz do repositório):
    .\podman.ps1 up       # cria o .env.local se faltar, constrói a imagem e sobe em http://localhost:3000
    .\podman.ps1 stop     # pausa o container (mantém tudo)
    .\podman.ps1 start    # retoma
    .\podman.ps1 logs     # acompanha os logs (Ctrl+C sai)
    .\podman.ps1 rebuild  # reconstrói a imagem e sobe de novo (após git pull ou mudar .env.local)
    .\podman.ps1 down     # remove o container e a imagem

  Se o PowerShell bloquear o script, rode uma vez:
    Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
#>
param(
  [Parameter(Position = 0)]
  [ValidateSet('up', 'stop', 'start', 'logs', 'rebuild', 'down', 'status')]
  [string]$Action = 'up',
  [int]$Port = 3000
)

$ErrorActionPreference = 'Continue'   # comandos externos (podman) são checados pelo $LASTEXITCODE
$Root = $PSScriptRoot
$App = Join-Path $Root 'src\app-MusicOS'
$EnvFile = Join-Path $App '.env.local'
$Image = 'musicos:latest'
$Name = 'musicos'

function Ensure-Podman {
  if (-not (Get-Command podman -ErrorAction SilentlyContinue)) {
    throw 'Podman não encontrado. Instale o Podman Desktop (https://podman-desktop.io) e abra o PowerShell de novo.'
  }
  $machines = podman machine list --format '{{.Name}} {{.Running}}' 2>$null
  if (-not $machines) {
    Write-Host '>> Criando a máquina do Podman (só na primeira vez)...' -ForegroundColor Cyan
    podman machine init
  }
  if (-not ($machines -match 'true')) {
    Write-Host '>> Iniciando a máquina do Podman...' -ForegroundColor Cyan
    podman machine start | Out-Null
  }
}

function Ensure-EnvFile {
  if (-not (Test-Path $EnvFile)) {
    Copy-Item (Join-Path $App '.env.local.example') $EnvFile
    Write-Host ">> Criei $EnvFile" -ForegroundColor Yellow
    Write-Host '   Preencha as chaves do Supabase e do Stripe, salve e rode .\podman.ps1 up de novo.' -ForegroundColor Yellow
    notepad $EnvFile
    exit 0
  }
  $vars = @{}
  Get-Content $EnvFile | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]*)=(.*)$') { $vars[$matches[1].Trim()] = $matches[2].Trim().Trim('"') }
  }
  foreach ($k in 'NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'STRIPE_SECRET_KEY') {
    if (-not $vars[$k] -or $vars[$k] -match 'seu-|sua-|^sk_test_\.\.\.$|^price_\.\.\.$') {
      throw "A variável $k ainda não foi preenchida em $EnvFile"
    }
  }
  if (-not $vars['NEXT_PUBLIC_APP_URL']) { $vars['NEXT_PUBLIC_APP_URL'] = "http://localhost:$Port" }
  return $vars
}

function Build-Image($vars) {
  Write-Host '>> Construindo a imagem (a primeira vez leva alguns minutos)...' -ForegroundColor Cyan
  podman build -t $Image `
    --build-arg "NEXT_PUBLIC_SUPABASE_URL=$($vars.NEXT_PUBLIC_SUPABASE_URL)" `
    --build-arg "NEXT_PUBLIC_SUPABASE_ANON_KEY=$($vars.NEXT_PUBLIC_SUPABASE_ANON_KEY)" `
    --build-arg "NEXT_PUBLIC_APP_URL=$($vars.NEXT_PUBLIC_APP_URL)" `
    $App
  if ($LASTEXITCODE -ne 0) { throw 'Falha no build da imagem.' }
}

function Remove-Container {
  podman container exists $Name 2>$null
  if ($LASTEXITCODE -eq 0) { podman rm -f $Name | Out-Null }
}

function Run-Container {
  Remove-Container
  Write-Host ">> Subindo o container na porta $Port..." -ForegroundColor Cyan
  podman run -d --name $Name -p "${Port}:3000" --env-file $EnvFile --restart unless-stopped $Image | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'Falha ao iniciar o container.' }
  Start-Sleep -Seconds 3
  Write-Host ">> MusicOS no ar: http://localhost:$Port" -ForegroundColor Green
  Write-Host '   Logs: .\podman.ps1 logs   |   Parar: .\podman.ps1 stop'
  Start-Process "http://localhost:$Port"
}

Ensure-Podman

switch ($Action) {
  'up' {
    $vars = Ensure-EnvFile
    podman image exists $Image 2>$null
    if ($LASTEXITCODE -ne 0) { Build-Image $vars }
    Run-Container
  }
  'rebuild' {
    $vars = Ensure-EnvFile
    Build-Image $vars
    Run-Container
  }
  'stop'   {
    podman stop $Name | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Nenhum container "musicos" para parar. Suba com .\podman.ps1 up' }
    Write-Host '>> Container pausado. Retome com .\podman.ps1 start' -ForegroundColor Green
  }
  'start'  {
    podman start $Name | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Container "musicos" não existe neste modo do Podman. Rode .\podman.ps1 up (ele reconstrói a imagem se preciso).' }
    Write-Host ">> No ar: http://localhost:$Port" -ForegroundColor Green
  }
  'logs'   { podman logs -f $Name }
  'status' { podman ps -a --filter "name=$Name" }
  'down'   {
    Remove-Container
    podman image exists $Image 2>$null
    if ($LASTEXITCODE -eq 0) { podman rmi $Image | Out-Null }
    Write-Host '>> Container e imagem removidos.' -ForegroundColor Green
  }
}
