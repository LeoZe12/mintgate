@echo off
echo 🎥 Iniciando RTSP Proxy Server...
echo.

REM Verifica se o Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado. Por favor, instale o Node.js primeiro.
    echo    Download: https://nodejs.org/
    pause
    exit /b 1
)

REM Verifica se o FFmpeg está instalado
ffmpeg -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  FFmpeg não encontrado. Por favor, instale o FFmpeg:
    echo    - Download: https://ffmpeg.org/download.html
    echo    - Extraia e adicione ao PATH do Windows
    echo.
    pause
    exit /b 1
)

REM Cria diretório para o proxy se não existir
if not exist "rtsp-proxy" (
    echo 📁 Criando diretório rtsp-proxy...
    mkdir rtsp-proxy
)

cd rtsp-proxy

REM Verifica se as dependências estão instaladas
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    if not exist package.json (
        echo ❌ package.json não encontrado. Reinstalando...
        cd ..
        echo 🔧 Execute primeiro: scripts\install-rtsp-proxy.bat
        pause
        exit /b 1
    )
    npm install
)

REM Verifica se o arquivo server.js existe
if not exist "server.js" (
    echo ❌ server.js não encontrado!
    cd ..
    echo 🔧 Execute primeiro: scripts\install-rtsp-proxy.bat
    pause
    exit /b 1
)

echo.
echo 🚀 Iniciando servidor proxy na porta 3002...
echo ⏹️  Para parar o servidor: Ctrl+C
echo.

node server.js

cd ..
pause