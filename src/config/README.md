
# Sistema de Configuração Centralizado

Este sistema permite modificar facilmente todas as configurações do ESP32 em um local centralizado.

## Como Usar

### 1. Modificar Configurações via Interface
- Acesse a aba "Configuração" no dashboard
- Altere os valores desejados
- Clique em "Salvar Todas as Configurações"

### 2. Modificar Configurações via Código
- Edite o arquivo `src/config/esp32Config.ts`
- Modifique os valores no objeto `ESP32_CONFIG`
- As mudanças serão aplicadas automaticamente em todo o sistema

## Estrutura de Configuração

```typescript
export const ESP32_CONFIG = {
  esp32: {
    ipAddress: '192.168.1.100',    // IP do ESP32 na rede local
    port: '80',                     // Porta do ESP32
    pollingInterval: 5000,          // Intervalo de polling em ms
    // ... outras configurações
  },
  
  gpio: {
    externalLoopPort: '2',          // Porta do laço externo
    internalLoopPort: '3',          // Porta do laço interno
    gateControlPort: '4',           // Porta de controle do portão
  },
  
  camera: {
    url: 'http://192.168.1.101:8080/video',  // URL da câmera
    // ... outras configurações
  },
  
  platRecognizer: {
    apiKey: '',                     // API Key do PlatRecognizer
    licenseKey: '',                 // License Key do PlatRecognizer
    // ... outras configurações
  }
};
```

## Arquivos que Usam a Configuração

- `src/hooks/useEsp32Status.ts` - Hook principal do ESP32
- `src/components/SystemConfig.tsx` - Interface de configuração
- Qualquer novo componente pode importar e usar as configurações

## Exemplo de Uso

```typescript
import { ESP32_CONFIG, getApiUrl, getEsp32Url } from '@/config/esp32Config';

// Usar configuração
const pollingInterval = ESP32_CONFIG.esp32.pollingInterval;
const apiUrl = getApiUrl('status');
const esp32Url = getEsp32Url('/gpio/status');
```

## Validação

O sistema inclui validação automática das configurações:
- IP válido
- Porta válida (1-65535)
- URL da câmera válida

## Benefícios

1. **Centralização**: Todas as configurações em um local
2. **Facilidade**: Mudanças rápidas sem procurar em vários arquivos
3. **Consistência**: Mesmas configurações em todo o código
4. **Validação**: Configurações são validadas antes de serem salvas
5. **Flexibilidade**: Interface gráfica ou edição direta do código
