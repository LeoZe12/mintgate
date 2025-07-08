
#!/bin/bash

echo "🎥 Iniciando RTSP Proxy Server..."

# Verifica se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js primeiro."
    exit 1
fi

# Verifica se o FFmpeg está instalado
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  FFmpeg não encontrado. Por favor, instale o FFmpeg:"
    echo "  - Windows: Baixe de https://ffmpeg.org/download.html"
    echo "  - macOS: brew install ffmpeg"
    echo "  - Ubuntu/Debian: sudo apt install ffmpeg"
    exit 1
fi

# Cria diretório para o servidor proxy se não existir
mkdir -p rtsp-proxy-server
cd rtsp-proxy-server

# Verifica se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    if [ ! -f package.json ]; then
        npm init -y
    fi
    npm install express cors
fi

# Inicia o servidor proxy
echo "🚀 Iniciando servidor proxy na porta 3002..."
node ../scripts/rtsp-proxy-server.cjs
