@echo off
echo 🔧 Configurando RTSP Proxy Server para MintGate...
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
    echo ℹ️  Continuando instalação (FFmpeg será necessário na execução)
)

REM Remove diretório antigo se existir
if exist "rtsp-proxy-server" (
    echo 🗑️  Removendo instalação antiga...
    rmdir /s /q "rtsp-proxy-server"
)

REM Cria novo diretório
echo 📁 Criando diretório rtsp-proxy...
if not exist "rtsp-proxy" mkdir rtsp-proxy

REM Copia arquivos necessários
echo 📋 Copiando arquivos do servidor...
copy /y "rtsp-proxy\package.json" "rtsp-proxy\package.json" >nul 2>&1
copy /y "rtsp-proxy\server.js" "rtsp-proxy\server.js" >nul 2>&1

cd rtsp-proxy

echo 📦 Instalando dependências...
npm install

if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependências
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo ✅ RTSP Proxy Server configurado com sucesso!
echo.
echo 📋 Próximos passos:
echo    1. Para iniciar o servidor: scripts\start-rtsp-proxy.bat
echo    2. Para testar: http://localhost:3002/health
echo    3. Para usar no app: URL será detectada automaticamente
echo.

pause