@echo off
REM Script para criar issues do MusicOS no GitHub
REM Uso: create_issues.bat GITHUB_TOKEN owner/repo

if "%1"=="" (
    echo Usage: create_issues.bat ^<GITHUB_TOKEN^> ^<owner/repo^>
    exit /b 1
)

if "%2"=="" (
    echo Usage: create_issues.bat ^<GITHUB_TOKEN^> ^<owner/repo^>
    exit /b 1
)

echo Criando issues no repositorio %2...
python docs/create_issues_script.py --token %1 --repo %2

echo Issues criadas com sucesso!
pause