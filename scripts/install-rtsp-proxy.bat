
@echo off
echo 🔧 Instalando dependências do RTSP Proxy Server...

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

REM Inicializa package.json se não existir
if not exist package.json (
    echo Inicializando package.json...
    npm init -y
)

REM Instala dependências
echo Instalando express e cors...
npm install express cors

echo ✅ Instalação concluída!
echo.
echo Para iniciar o servidor proxy:
echo   cd rtsp-proxy-server
echo   node ../scripts/rtsp-proxy-server.js
echo.
echo Ou execute: start-rtsp-proxy.bat

cd ..
pause
