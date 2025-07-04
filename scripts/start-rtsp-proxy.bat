
@echo off
echo 🎥 Iniciando RTSP Proxy Server...

REM Verifica se o Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado. Por favor, instale o Node.js primeiro.
    pause
    exit /b 1
)

REM Verifica se o FFmpeg está instalado
ffmpeg -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ FFmpeg não encontrado. Por favor, instale o FFmpeg:
    echo   - Baixe de https://ffmpeg.org/download.html
    echo   - Extraia e adicione ao PATH do Windows
    pause
    exit /b 1
)

REM Cria diretório para o servidor proxy se não existir
if not exist "rtsp-proxy-server" mkdir rtsp-proxy-server
cd rtsp-proxy-server

REM Verifica se as dependências estão instaladas
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    if not exist package.json npm init -y
    npm install express cors
)

REM Inicia o servidor proxy
echo 🚀 Iniciando servidor proxy na porta 3002...
node ../scripts/rtsp-proxy-server.js

pause
