@echo off
REM ============================================================
REM MusicOS — Fluxo de Git e GitHub
REM ============================================================
REM
REM Este script automatiza o fluxo de desenvolvimento:
REM 1. Atualizar main
REM 2. Criar branch para issue
REM 3. Commitar mudanças
REM 4. Push e criar PR
REM
REM Uso:
REM   git-workflow.bat init           (atualiza main)
REM   git-workflow.bat start ISSUE-001 (cria branch)
REM   git-workflow.bat commit "msg"   (commita)
REM   git-workflow.bat push           (push + PR)
REM
REM ============================================================

setlocal

set "PROJECT_DIR=%~dp0.."
set "DEFAULT_EDITOR=code"

:START
    if "%1"=="" goto HELP
    if "%1"=="init" goto INIT
    if "%1"=="start" goto START_FEATURE
    if "%1"=="commit" goto COMMIT
    if "%1"=="push" goto PUSH_PR
    if "%1"=="finish" goto FINISH
    if "%1"=="/?" goto HELP

:HELP
    echo.
    echo MusicOS — Fluxo de Git/GitHub
    echo.
    echo Comandos:
    echo   init ISSUE-001           Atualiza main e cria branch para issue
    echo   commit "mensagem"        Commita com mensagem descritiva
    echo   push                     Push e cria Pull Request
    echo   finish                   Faz merge e limpa branch
    echo.
    echo Fluxo completo:
    echo   git-workflow.bat init ISSUE-001
    echo   (desenvolvimento e testes)
    echo   git-workflow.bat commit "feat: descricao"
    echo   git-workflow.bat push
    echo   (revisão no GitHub)
    echo   git-workflow.bat finish
    echo.
    exit /b 0

:INIT
    if "%2"=="" (
        echo %COLOR_RED%[ERRO]%COLOR_RESET% Forneca o codigo da issue
        exit /b 1
    )
    set "ISSUE=%2"
    
    echo.
    echo %COLOR_YELLOW%[1/4]%COLOR_RESET% Atualizando main...
    cd /d "%PROJECT_DIR%"
    git checkout main
    git pull origin main
    echo %COLOR_GREEN%[OK]%COLOR_RESET% Main atualizada

    echo.
    echo %COLOR_YELLOW%[2/4]%COLOR_RESET% Verificando issues abertas...
    gh issue view %ISSUE% 2>nul
    if errorlevel 1 (
        echo %COLOR_RED%[ERRO]%COLOR_RESET% Issue %ISSUE% nao encontrada
        exit /b 1
    )
    echo %COLOR_GREEN%[OK]%COLOR_RESET% Issue encontrada

    echo.
    echo %COLOR_YELLOW%[3/4]%COLOR_RESET% Criando branch feature/%ISSUE%...
    git checkout -b feature/%ISSUE%
    echo %COLOR_GREEN%[OK]%COLOR_RESET% Branch criada

    echo.
    echo %COLOR_YELLOW%[4/4]%COLOR_RESET% Verificando testes...
    cd src\app-MusicOS
    npm run test:unit 2>nul
    if errorlevel 1 (
        echo %COLOR_YELLOW%[AVISO]%COLOR_RESET% Testes falharam - corrija antes de commitar
    ) else (
        echo %COLOR_GREEN%[OK]%COLOR_RESET% Testes passaram
    )

    echo.
    echo ============================================================
    echo  Branch feature/%ISSUE% criada com sucesso!
    echo ============================================================
    echo.
    echo Proximo passo:
    echo   1. Desenvolva a feature
    echo   2. Crie testes
    echo   3. Commite: git-workflow.bat commit "mensagem"
    echo.
    exit /b 0

:COMMIT
    if "%2"=="" (
        echo %COLOR_RED%[ERRO]%COLOR_RESET% Forneca uma mensagem de commit
        exit /b 1
    )
    
    set "MSG=%~2"
    
    echo.
    echo %COLOR_YELLOW%[1/3]%COLOR_RESET% Verificando arquivos modificados...
    git status --short
    if errorlevel 1 (
        echo %COLOR_RED%[ERRO]%COLOR_RESET% Nenhuma mudanca encontrada
        exit /b 1
    )

    echo.
    echo %COLOR_YELLOW%[2/3]%COLOR_RESET% Executando testes...
    cd src\app-MusicOS
    npm run test:unit 2>nul
    if errorlevel 1 (
        echo %COLOR_RED%[FALHA] Testes falharam - nao commite%COLOR_RESET%
        exit /b 1
    )
    echo %COLOR_GREEN%[OK] Testes passaram

    echo.
    echo %COLOR_YELLOW%[3/3]%COLOR_RESET% Commitando...
    cd /d "%PROJECT_DIR%"
    git add -A
    git commit -m "%MSG%"
    echo %COLOR_GREEN%[OK]%COLOR_RESET% Commit realizado

    echo.
    echo Proximo passo:
    echo   git-workflow.bat push
    echo.
    exit /b 0

:PUSH_PR
    echo.
    echo %COLOR_YELLOW%[1/4]%COLOR_RESET% Identificando issue...
    for /f "tokens=*" %%a in ('git branch --show-current') do set "BRANCH=%%a"
    echo Branch atual: %BRANCH%

    for /f "tokens=2 delims=/" %%a in ("%BRANCH%") do set "ISSUE=%%a"
    echo Issue: %ISSUE%

    echo.
    echo %COLOR_YELLOW%[2/4]%COLOR_RESET% Verificando testes finais...
    cd src\app-MusicOS
    npm run test:unit 2>nul
    if errorlevel 1 (
        echo %COLOR_RED%[FALHA] Testes falharam%COLOR_RESET%
        exit /b 1
    )
    npm run lint 2>nul
    if errorlevel 1 (
        echo %COLOR_RED%[FALHA] Lint falhou%COLOR_RESET%
        exit /b 1
    )
    echo %COLOR_GREEN%[OK] Verificacoes passaram

    echo.
    echo %COLOR_YELLOW%[3/4]%COLOR_RESET% Fazendo push...
    cd /d "%PROJECT_DIR%"
    git push -u origin %BRANCH%
    echo %COLOR_GREEN%[OK]%COLOR_RESET% Push realizado

    echo.
    echo %COLOR_YELLOW%[4/4]%COLOR_RESET% Criando Pull Request...
    gh pr create --title "feat(%ISSUE%): " --body "## Descricao" --assignee "@me"
    echo %COLOR_GREEN%[OK]%COLOR_RESET% PR criado

    echo.
    echo ============================================================
    echo  Pull Request criado com sucesso!
    echo ============================================================
    echo.
    echo Proximo passo:
    echo   1. Revise o PR no GitHub
    echo   2. Aprove o merge
    echo   3. Execute: git-workflow.bat finish
    echo.
    exit /b 0

:FINISH
    echo.
    echo %COLOR_YELLOW%[1/4]%COLOR_RESET% Voltando para main...
    git checkout main
    echo %COLOR_GREEN%[OK]%COLOR_RESET%

    echo.
    echo %COLOR_YELLOW%[2/4]%COLOR_RESET% Atualizando main...
    git pull origin main
    echo %COLOR_GREEN%[OK]%COLOR_RESET%

    echo.
    echo %COLOR_YELLOW%[3/4]%COLOR_RESET% Deletando branch de feature...
    git branch -d feature/*
    echo %COLOR_GREEN%[OK]%COLOR_RESET%

    echo.
    echo %COLOR_YELLOW%[4/4]%COLOR_RESET% Atualizando historico...
    echo ### [ISSUE] — [TITULO] >> docs/HISTORICO.md
    echo **Concluido em:** %date% >> docs/HISTORICO.md
    echo **PR:** [link]() >> docs/HISTORICO.md
    echo. >> docs/HISTORICO.md
    echo %COLOR_GREEN%[OK]%COLOR_RESET%

    echo.
    echo ============================================================
    echo  Issue concluida com sucesso!
    echo ============================================================
    exit /b 0

endlocal