@echo off
REM ============================================================
REM MusicOS — Script de Testes Automatizados
REM ============================================================
REM 
REM Este script executa TODOS os testes do projeto:
REM - Testes Unitários (Vitest)
REM - Testes de Integração (Vitest)
REM - Testes E2E (Playwright)
REM - Verificação de Lint
REM - Build do projeto
REM
REM Uso:
REM   run-tests.bat          (executa tudo)
REM   run-tests.bat unit     (apenas unitários)
REM   run-tests.bat e2e      (apenas E2E)
REM   run-tests.bat ci       (modo CI/CD)
REM
REM ============================================================

setlocal

REM Configurações
set "PROJECT_DIR=%~dp0..\src\app-MusicOS"
set "NPM_CMD=npm --prefix %PROJECT_DIR%"
set "COLOR_RED=[93m"
set "COLOR_GREEN=[92m"
set "COLOR_YELLOW=[93m"
set "COLOR_RESET=[0m"

:RUN
    echo ============================================================
    echo  MusicOS — Script de Testes Automatizados
    echo ============================================================
    echo.

    if "%1"=="unit" goto UNIT_ONLY
    if "%1"=="e2e" goto E2E_ONLY
    if "%1"=="ci" goto CI_MODE
    if "%1"=="/?" goto HELP
    if "%1"=="-h" goto HELP

    REM Modo completo
    echo %COLOR_YELLOW%[1/5]%COLOR_RESET% Verificando dependencias...
    if not exist "%PROJECT_DIR%\node_modules" (
        echo %COLOR_RED%[node_modules nao encontrado]%COLOR_RESET%
        echo Instalando dependencias...
        cd /d "%PROJECT_DIR%"
        call npm ci
    )

    echo.
    echo %COLOR_YELLOW%[2/5]%COLOR_RESET% Executando testes unitarios...
    call %NPM_CMD% run test:unit
    if errorlevel 1 (
        echo %COLOR_RED%[FALHA] Testes unitarios falharam%COLOR_RESET%
        exit /b 1
    )
    echo %COLOR_GREEN%[OK] Testes unitarios passaram%COLOR_RESET%

    echo.
    echo %COLOR_YELLOW%[3/5]%COLOR_RESET% Verificando lint...
    call %NPM_CMD% run lint
    if errorlevel 1 (
        echo %COLOR_RED%[FALHA] Lint falhou%COLOR_RESET%
        exit /b 1
    )
    echo %COLOR_GREEN%[OK] Lint passou%COLOR_RESET%

    echo.
    echo %COLOR_YELLOW%[4/5]%COLOR_RESET% Executando build...
    call %NPM_CMD% run build
    if errorlevel 1 (
        echo %COLOR_RED%[FALHA] Build falhou%COLOR_RESET%
        exit /b 1
    )
    echo %COLOR_GREEN%[OK] Build passou%COLOR_RESET%

    echo.
    echo %COLOR_YELLOW%[5/5]%COLOR_RESET% Testes E2E (Playwright)...
    echo %COLOR_YELLOW%[AVISO]%COLOR_RESET% Certifique-se que o servidor esta rodando em localhost:3000
    call %NPM_CMD% run test:e2e
    if errorlevel 1 (
        echo %COLOR_RED%[FALHA] Testes E2E falharam%COLOR_RESET%
        exit /b 1
    )
    echo %COLOR_GREEN%[OK] Testes E2E passaram%COLOR_RESET%

    echo.
    echo ============================================================
    echo  %COLOR_GREEN%TODOS OS TESTES PASSARAM!%COLOR_RESET%
    echo ============================================================
    exit /b 0

:UNIT_ONLY
    echo %COLOR_YELLOW%Executando apenas testes unitarios...%COLOR_RESET%
    call %NPM_CMD% run test:coverage
    if errorlevel 1 (
        echo %COLOR_RED%[FALHA] Testes unitarios falharam%COLOR_RESET%
        exit /b 1
    )
    echo %COLOR_GREEN%[OK] Testes unitarios passaram%COLOR_RESET%
    exit /b 0

:E2E_ONLY
    echo %COLOR_YELLOW%Executando apenas testes E2E...%COLOR_RESET%
    call %NPM_CMD% run test:e2e
    if errorlevel 1 (
        echo %COLOR_RED%[FALHA] Testes E2E falharam%COLOR_RESET%
        exit /b 1
    )
    echo %COLOR_GREEN%[OK] Testes E2E passaram%COLOR_RESET%
    exit /b 0

:CI_MODE
    echo %COLOR_YELLOW%Modo CI/CD - Execucao completa sem interacao%COLOR_RESET%
    cd /d "%PROJECT_DIR%"
    call npm ci
    if errorlevel 1 exit /b 1
    call npm run test:coverage
    if errorlevel 1 exit /b 1
    call npm run lint
    if errorlevel 1 exit /b 1
    call npm run build
    if errorlevel 1 exit /b 1
    echo %COLOR_GREEN%[OK] CI completo%COLOR_RESET%
    exit /b 0

:HELP
    echo.
    echo MusicOS — Script de Testes Automatizados
    echo.
    echo Uso: run-tests.bat [opcao]
    echo.
    echo Opcoes:
    echo   (nenhuma)  Executa todos os testes
    echo   unit       Executa apenas testes unitarios
    echo   e2e        Executa apenas testes E2E
    echo   ci         Modo CI/CD (sem interacao)
    echo   -h, /?     Mostra esta ajuda
    echo.
    echo Requisitos:
    echo   - Node.js 20+
    echo   - npm instalado
    echo   - Para E2E: servidor rodando em localhost:3000
    echo.
    exit /b 0

endlocal