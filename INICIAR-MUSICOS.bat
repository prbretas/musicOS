@echo off
title MusicOS
cd /d "%~dp0src\app-MusicOS"

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js nao encontrado. Instale em https://nodejs.org e rode de novo.
  pause
  exit /b 1
)

if not exist ".env.local" (
  echo Arquivo src\app-MusicOS\.env.local nao encontrado.
  echo Copie .env.local.example para .env.local e preencha as chaves do Supabase.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Instalando dependencias (so na primeira vez)...
  call npm install
  if errorlevel 1 (
    echo Falha ao instalar dependencias.
    pause
    exit /b 1
  )
)

echo.
echo MusicOS iniciando em http://localhost:3000
echo O navegador abre sozinho em alguns segundos.
echo Para parar o sistema, feche esta janela ou aperte Ctrl+C.
echo.

start "" cmd /c "timeout /t 20 /nobreak >nul & start http://localhost:3000"
call npm run dev

pause
