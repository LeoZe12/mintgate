
@echo off
echo 🚀 Iniciando aplicação com RTSP Proxy...

REM Inicia o servidor proxy em segundo plano
echo Iniciando RTSP Proxy Server...
start /b "RTSP Proxy" cmd /c "cd /d %~dp0 && start-rtsp-proxy.bat"

REM Espera um pouco para o proxy iniciar
timeout /t 3 /nobreak >nul

REM Inicia o servidor de desenvolvimento
echo Iniciando servidor de desenvolvimento...
cd /d %~dp0..
npm run dev

pause
