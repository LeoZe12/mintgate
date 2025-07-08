#!/bin/bash

echo "🎥 Iniciando RTSP Proxy Server..."
echo ""

# Verifica se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js primeiro."
    echo "   Download: https://nodejs.org/"
    exit 1
fi

# Verifica se o FFmpeg está instalado
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  FFmpeg não encontrado. Por favor, instale o FFmpeg:"
    echo "  - Windows: https://ffmpeg.org/download.html"
    echo "  - macOS: brew install ffmpeg"
    echo "  - Ubuntu/Debian: sudo apt install ffmpeg"
    exit 1
fi

# Cria diretório para o proxy se não existir
if [ ! -d "rtsp-proxy" ]; then
    echo "📁 Criando diretório rtsp-proxy..."
    mkdir -p rtsp-proxy
fi

cd rtsp-proxy

# Verifica se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    if [ ! -f package.json ]; then
        echo "❌ package.json não encontrado. Reinstalando..."
        cd ..
        echo "🔧 Execute primeiro: ./scripts/install-rtsp-proxy.sh"
        exit 1
    fi
    npm install
fi

# Verifica se o arquivo server.js existe
if [ ! -f "server.js" ]; then
    echo "❌ server.js não encontrado!"
    cd ..
    echo "🔧 Execute primeiro: ./scripts/install-rtsp-proxy.sh"
    exit 1
fi

echo ""
echo "🚀 Iniciando servidor proxy na porta 3002..."
echo "⏹️  Para parar o servidor: Ctrl+C"
echo ""

node server.js

cd ..