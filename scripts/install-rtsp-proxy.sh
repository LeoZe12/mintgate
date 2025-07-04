
#!/bin/bash

echo "🔧 Instalando dependências do RTSP Proxy Server..."

# Verifica se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js primeiro."
    exit 1
fi

# Verifica se o FFmpeg está instalado
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  FFmpeg não encontrado. Instalando..."
    
    # Detecta o sistema operacional
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt update && sudo apt install -y ffmpeg
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install ffmpeg
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        echo "No Windows, baixe o FFmpeg de https://ffmpeg.org/download.html"
        echo "E adicione ao PATH do sistema"
    fi
fi

# Cria diretório para o servidor proxy se não existir
mkdir -p rtsp-proxy-server
cd rtsp-proxy-server

# Inicializa package.json se não existir
if [ ! -f package.json ]; then
    npm init -y
fi

# Instala dependências
npm install express cors

echo "✅ Instalação concluída!"
echo ""
echo "Para iniciar o servidor proxy:"
echo "  cd rtsp-proxy-server"
echo "  node ../scripts/rtsp-proxy-server.js"
echo ""
echo "Ou execute: npm run start:rtsp-proxy"
