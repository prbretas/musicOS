@echo off
title MusicOS - Testes
cd /d "%~dp0src\app-MusicOS"

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js nao encontrado. Instale em https://nodejs.org e rode de novo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Instalando dependencias (so na primeira vez)...
  call npm install
)

echo.
echo === Testes unitarios ===
echo.
call npx vitest run

echo.
choice /c SN /n /m "Rodar tambem os testes E2E no navegador (leva alguns minutos)? [S/N] "
if errorlevel 2 goto fim

echo.
echo === Testes E2E (usa o Chrome instalado; sobe o sistema sozinho se ele nao estiver no ar) ===
echo.
call npx playwright test

:fim
echo.
pause
