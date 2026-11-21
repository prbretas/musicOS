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
echo Rodando os testes unitarios...
echo.
call npx vitest run

echo.
pause
