#!/bin/bash

echo "🔧 Configurando RTSP Proxy Server para MintGate..."
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
    echo ""
    echo "ℹ️  Continuando instalação (FFmpeg será necessário na execução)"
fi

# Remove diretório antigo se existir
if [ -d "rtsp-proxy-server" ]; then
    echo "🗑️  Removendo instalação antiga..."
    rm -rf rtsp-proxy-server
fi

# Cria novo diretório
echo "📁 Criando diretório rtsp-proxy..."
mkdir -p rtsp-proxy

# Os arquivos já foram criados pelo sistema, apenas instala dependências
cd rtsp-proxy

echo "📦 Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências"
    cd ..
    exit 1
fi

cd ..

echo ""
echo "✅ RTSP Proxy Server configurado com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Para iniciar o servidor: ./scripts/start-rtsp-proxy.sh"
echo "   2. Para testar: http://localhost:3002/health"
echo "   3. Para usar no app: URL será detectada automaticamente"
echo ""