
#!/bin/bash

# Script para gerenciar o Plate Recognizer SDK Offline
# Uso: npm run pr-sdk:start|stop|restart|status|logs

CONTAINER_NAME="platerecognizer-sdk"

case "$1" in
    "start")
        echo "🚀 Iniciando Plate Recognizer SDK..."
        if docker ps -a --format 'table {{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
            docker start ${CONTAINER_NAME}
            echo "✅ SDK iniciado com sucesso!"
        else
            echo "❌ Container não encontrado. Execute 'npm run pr-sdk:install' primeiro."
            exit 1
        fi
        ;;
    
    "stop")
        echo "⏹️  Parando Plate Recognizer SDK..."
        docker stop ${CONTAINER_NAME} 2>/dev/null || echo "Container já estava parado"
        echo "✅ SDK parado."
        ;;
    
    "restart")
        echo "🔄 Reiniciando Plate Recognizer SDK..."
        docker restart ${CONTAINER_NAME}
        echo "✅ SDK reiniciado com sucesso!"
        ;;
    
    "status")
        echo "📊 Status do Plate Recognizer SDK:"
        if docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep -q "${CONTAINER_NAME}"; then
            docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep "${CONTAINER_NAME}"
            echo ""
            echo "🌐 Endpoint: http://localhost:8081"
            echo "🧪 Teste: curl http://localhost:8081/health"
        else
            echo "❌ Container não está executando"
        fi
        ;;
    
    "logs")
        echo "📋 Logs do Plate Recognizer SDK:"
        docker logs ${CONTAINER_NAME} --tail=50 -f
        ;;
    
    "remove")
        echo "🗑️  Removendo Plate Recognizer SDK..."
        docker stop ${CONTAINER_NAME} 2>/dev/null || true
        docker rm ${CONTAINER_NAME} 2>/dev/null || true
        docker volume rm pr-license 2>/dev/null || true
        echo "✅ SDK removido completamente."
        ;;
    
    *)
        echo "Uso: $0 {start|stop|restart|status|logs|remove}"
        echo ""
        echo "Comandos disponíveis:"
        echo "  start   - Inicia o container do SDK"
        echo "  stop    - Para o container do SDK"
        echo "  restart - Reinicia o container do SDK"
        echo "  status  - Mostra o status do container"
        echo "  logs    - Mostra os logs do container"
        echo "  remove  - Remove completamente o container e volume"
        exit 1
        ;;
esac
