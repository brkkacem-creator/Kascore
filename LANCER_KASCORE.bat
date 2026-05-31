@echo off
chcp 65001 > nul
title Kascore — Coupe du Monde 2026

echo.
echo   ██╗  ██╗ █████╗ ███████╗ ██████╗ ██████╗ ██████╗ ███████╗
echo   ██╔══██╗██╔══██╗██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔════╝
echo   █████╔╝ ███████║███████╗██║     ██║   ██║██████╔╝█████╗
echo   ██╔═██╗ ██╔══██║╚════██║██║     ██║   ██║██╔══██╗██╔══╝
echo   ██║  ██╗██║  ██║███████║╚██████╗╚██████╔╝██║  ██║███████╗
echo   ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝
echo.
echo   Coupe du Monde FIFA 2026 — Pronostics
echo.

:: Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR: Node.js non trouve.
    echo Installe-le sur https://nodejs.org  (version 18+^)
    pause
    exit /b 1
)

for /f "tokens=1 delims=v." %%i in ('node --version') do set NODE_MAJOR=%%i
echo Node.js detecte.

:: Check .env.local
if not exist ".env.local" (
    echo.
    echo ATTENTION: Fichier .env.local introuvable !
    copy ".env.local.example" ".env.local"
    echo Fichier .env.local cree depuis l'exemple.
    echo Ouvre-le et remplis tes cles Supabase et Football API.
    echo.
    notepad .env.local
    pause
)

:: Install dependencies
if not exist "node_modules" (
    echo.
    echo Installation des dependances (premiere fois ~2 min)...
    npm install
    echo Dependances installees.
)

:: Open browser
echo.
echo  Demarrage de Kascore...
echo.
echo  +-----------------------------------------+
echo  ^|   Ouvre ton navigateur sur :            ^|
echo  ^|   http://localhost:3000                 ^|
echo  +-----------------------------------------+
echo.
echo  Ferme cette fenetre pour arreter
echo.

start "" http://localhost:3000
npm run dev

pause
