
#!/bin/bash

# Script para instalar o Plate Recognizer SDK Offline via Docker
# Uso: npm run pr-sdk:install

set -e

echo "🚀 Instalando Plate Recognizer SDK Offline..."

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Por favor, instale o Docker primeiro."
    echo "   Visite: https://docs.docker.com/get-docker/"
    exit 1
fi

# Verificar se a LICENSE_KEY está definida
if [ -z "${PLATERECOGNIZER_LICENSE_KEY}" ]; then
    echo "⚠️  PLATERECOGNIZER_LICENSE_KEY não encontrada."
    echo "   Configure a variável de ambiente ou no arquivo .env"
    echo "   Exemplo: export PLATERECOGNIZER_LICENSE_KEY=sua_license_key"
    exit 1
fi

echo "📦 Baixando imagem do Plate Recognizer..."
docker pull platerecognizer/alpr

echo "🔧 Criando volume para licença..."
docker volume create pr-license 2>/dev/null || true

echo "🏃 Iniciando container..."
docker run --restart="unless-stopped" -d \
    --name platerecognizer-sdk \
    -p 8081:8080 \
    -v pr-license:/license \
    -e LICENSE_KEY="${PLATERECOGNIZER_LICENSE_KEY}" \
    platerecognizer/alpr

echo "✅ Plate Recognizer SDK instalado com sucesso!"
echo "📍 Endpoint disponível em: http://localhost:8081"
echo ""
echo "🔍 Para verificar status:"
echo "   docker ps | grep platerecognizer"
echo ""
echo "📋 Para ver logs:"
echo "   docker logs platerecognizer-sdk"
echo ""
echo "⏹️  Para parar:"
echo "   docker stop platerecognizer-sdk"
echo ""
echo "🗑️  Para remover:"
echo "   docker rm platerecognizer-sdk"
