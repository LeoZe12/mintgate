
# Sistema de Configuração Centralizado ESP32

Este sistema de configuração foi completamente refatorado para oferecer maior robustez, validação de tipos e flexibilidade para diferentes ambientes.

## 🚀 Principais Melhorias

### ✅ Schema de Validação com Zod
- Validação automática de todos os campos de configuração
- Tipos TypeScript gerados automaticamente
- Mensagens de erro claras e específicas
- Validação em tempo de build e runtime

### ✅ Configuração por Ambiente
- Arquivos separados para base, desenvolvimento e produção
- Merge inteligente de configurações usando Lodash
- Detecção automática do ambiente (`development` vs `production`)

### ✅ Segurança de Credenciais
- Credenciais do PlatRecognizer movidas para variáveis de ambiente
- Não há mais credenciais hard-coded no código
- Suporte a `.env` files e variáveis do sistema

### ✅ Tipos Seguros
- Portas convertidas de `string` para `number`
- Validação de ranges (portas 1-65535, GPIO 0-39, etc.)
- Enums para valores específicos (tema, qualidade, formato)

### ✅ Testes Automatizados
- Cobertura completa de testes unitários
- Validação de cenários válidos e inválidos
- Testes de integração do sistema de configuração

## 📁 Estrutura de Arquivos

```
src/config/
├── schema.ts              # Schema Zod e tipos TypeScript
├── esp32Config.base.ts    # Configuração base (padrões)
├── esp32Config.dev.ts     # Overrides para desenvolvimento
├── esp32Config.prod.ts    # Overrides para produção
├── esp32Config.ts         # Configuração final compilada
├── README.md              # Esta documentação
└── __tests__/
    └── esp32Config.test.ts # Testes unitários
```

## 🔧 Como Usar

### 1. Configuração via Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# PlatRecognizer Credentials
PLATERECOGNIZER_API_KEY=your_api_key_here
PLATERECOGNIZER_LICENSE_KEY=your_license_key_here

# Opcional: Override outras configurações
VITE_ESP32_IP=192.168.1.100
VITE_ESP32_PORT=80
VITE_CAMERA_URL=http://192.168.1.101:8080/video
```

### 2. Configuração via Código

```typescript
import { ESP32_CONFIG, updateConfig } from '@/config/esp32Config';

// Usar configuração atual
const currentIP = ESP32_CONFIG.esp32.ipAddress;
const pollingInterval = ESP32_CONFIG.esp32.pollingInterval;

// Atualizar configuração em runtime
const newConfig = updateConfig({
  esp32: {
    debugMode: true,
    pollingInterval: 3000
  }
});
```

### 3. Configuração via Interface

- Acesse a aba "Configuração" no dashboard
- Altere os valores desejados
- Clique em "Salvar Todas as Configurações"

## 🏗️ Configuração por Ambiente

### Base (`esp32Config.base.ts`)
Configurações padrão compartilhadas entre todos os ambientes.

### Desenvolvimento (`esp32Config.dev.ts`)
```typescript
export const DEV_CONFIG = {
  esp32: {
    debugMode: true,           // Logs detalhados
    pollingInterval: 2000,     // Polling mais frequente
  },
  ui: {
    showDebugInfo: true,       // Mostrar informações de debug
    refreshRate: 500,          // UI mais responsiva
  }
};
```

### Produção (`esp32Config.prod.ts`)
```typescript
export const PROD_CONFIG = {
  esp32: {
    debugMode: false,          // Sem logs desnecessários
    pollingInterval: 10000,    // Polling menos frequente
    timeout: 8000,             // Timeout maior para rede
  },
  ui: {
    showDebugInfo: false,      // Sem informações de debug
    refreshRate: 2000,         // UI menos frequente
  }
};
```

## 📋 Schema de Configuração

### ESP32
```typescript
esp32: {
  ipAddress: string (IP válido),
  port: number (1-65535),
  maxRetries: number (1-10),
  timeout: number (min 1000ms),
  pollingInterval: number (min 1000ms),
  autoReconnect: boolean,
  debugMode: boolean
}
```

### GPIO
```typescript
gpio: {
  externalLoopPort: number (0-39),
  internalLoopPort: number (0-39),
  gateControlPort: number (0-39)
}
```

### Câmera
```typescript
camera: {
  url: string (URL válida),
  streamFormat: 'mjpeg' | 'rtsp' | 'http',
  quality: 'low' | 'medium' | 'high',
  fps: number (1-60)
}
```

### PlatRecognizer
```typescript
platRecognizer: {
  apiKey: string (obrigatório),
  licenseKey: string (obrigatório),
  apiUrl: string (URL válida),
  confidenceThreshold: number (0-1),
  regions: string[]
}
```

## 🔍 Validação e Debugging

### Validação Automática
```typescript
import { validateConfig } from '@/config/esp32Config';

try {
  const config = validateConfig(userInput);
  console.log('Configuração válida:', config);
} catch (error) {
  console.error('Erro de validação:', error.message);
}
```

### Debug Mode
Quando `debugMode: true`, o sistema exibe:
- Configuração carregada no console
- Ambiente detectado
- Status das credenciais
- Logs detalhados das operações

## 🧪 Executar Testes

```bash
# Executar todos os testes
npm test

# Executar apenas testes de configuração
npm test -- src/config

# Executar com coverage
npm run test:coverage
```

## 🔧 Funções Utilitárias

```typescript
import { 
  getApiUrl, 
  getEsp32Url, 
  updateConfig, 
  resetConfig 
} from '@/config/esp32Config';

// URLs da API
const statusUrl = getApiUrl('status');
const esp32Url = getEsp32Url('/gpio/status');

// Gerenciamento de configuração
const newConfig = updateConfig({ esp32: { debugMode: true } });
const defaultConfig = resetConfig();
```

## 🚨 Solução de Problemas

### Erro: "API Key é obrigatória"
Configure as variáveis de ambiente:
```bash
PLATERECOGNIZER_API_KEY=your_key_here
PLATERECOGNIZER_LICENSE_KEY=your_license_here
```

### Erro: "Porta deve estar entre 1 e 65535"
Verifique se a porta do ESP32 está no range válido.

### Erro: "URL da câmera inválida"
Certifique-se de que a URL da câmera está no formato correto:
```
http://192.168.1.101:8080/video
```

### Erro: "Porta GPIO deve estar entre 0 e 39"
As portas GPIO do ESP32 devem estar no range 0-39.

## 📚 Links Úteis

- [PlatRecognizer API](https://platerecognizer.com/)
- [ESP32 GPIO Reference](https://randomnerdtutorials.com/esp32-pinout-reference-gpios/)
- [Zod Documentation](https://zod.dev/)
- [Lodash Merge](https://lodash.com/docs/4.17.15#merge)

## 🔄 Migração da Versão Anterior

O sistema é totalmente compatível com o anterior. As principais mudanças:

1. **Portas agora são `number`** ao invés de `string`
2. **Credenciais movidas para variáveis de ambiente**
3. **Validação automática** com mensagens de erro claras
4. **Configuração por ambiente** automática

Não é necessário alterar código existente que usa `ESP32_CONFIG`.
