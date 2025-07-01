
# Sistema de Controle ESP32 - Portão Automático

Sistema de controle de portão automático com ESP32, reconhecimento de placas e monitoramento em tempo real.

## 🚀 Como Rodar o Projeto

### 1. Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn
- Conta no [PlatRecognizer](https://platerecognizer.com/) para obter as chaves de API

### 2. Instalação

No diretório raiz do projeto, execute:

```bash
npm install
```

Este comando instala todas as dependências listadas no `package.json`.

### 3. Configuração de Variáveis de Ambiente

1. **Copie o arquivo de exemplo:**
   ```bash
   cp .env.example .env
   ```

2. **Configure as variáveis obrigatórias no arquivo `.env`:**
   ```bash
   # === OBRIGATÓRIAS ===
   PLATERECOGNIZER_API_KEY=sua_api_key_aqui
   PLATERECOGNIZER_LICENSE_KEY=sua_license_key_aqui
   
   # === OPCIONAIS (sobrescreve os padrões) ===
   VITE_ESP32_IP=192.168.1.100
   VITE_ESP32_PORT=80
   VITE_CAMERA_URL=http://192.168.1.101:8080/video
   VITE_GPIO_EXTERNAL_LOOP=2
   VITE_GPIO_INTERNAL_LOOP=3
   VITE_GPIO_GATE_CONTROL=4
   ```

3. **Obtenha suas chaves do PlatRecognizer:**
   - Acesse [platerecognizer.com](https://platerecognizer.com/)
   - Crie uma conta ou faça login
   - Vá para a seção de API Keys
   - Copie sua API Key e License Key

### 4. Executar o Projeto

```bash
npm run dev
```

O projeto será executado em `http://localhost:5173`

### 5. Executar Testes

```bash
# Executar todos os testes
npm test

# Executar com coverage
npm run test:coverage

# Executar apenas testes de configuração
npm test -- src/config
```

## 🔧 Configuração do Sistema

### Sistema de Configuração Centralizado

O projeto utiliza um sistema de configuração robusto e flexível:

- **Arquivo Base**: `src/config/esp32Config.base.ts` - configurações padrão
- **Desenvolvimento**: `src/config/esp32Config.dev.ts` - overrides para dev
- **Produção**: `src/config/esp32Config.prod.ts` - overrides para produção
- **Schema**: `src/config/schema.ts` - validação com Zod
- **Principal**: `src/config/esp32Config.ts` - configuração final compilada

### Configurações Disponíveis

#### ESP32
- `ipAddress`: IP do ESP32 na rede local
- `port`: Porta de comunicação (padrão: 80)
- `maxRetries`: Tentativas de reconexão (1-10)
- `timeout`: Timeout das requisições (ms)
- `pollingInterval`: Intervalo de polling (ms)
- `autoReconnect`: Reconexão automática
- `debugMode`: Modo debug (logs detalhados)

#### GPIO
- `externalLoopPort`: Porta do laço externo (0-39)
- `internalLoopPort`: Porta do laço interno (0-39)  
- `gateControlPort`: Porta controle do portão (0-39)

#### Câmera
- `url`: URL completa da câmera
- `streamFormat`: Formato do stream (mjpeg/rtsp/http)
- `quality`: Qualidade (low/medium/high)
- `fps`: Frames por segundo (1-60)

#### PlatRecognizer
- `apiKey`: Chave da API (obrigatória)
- `licenseKey`: Chave de licença (obrigatória)
- `confidenceThreshold`: Threshold de confiança (0-1)
- `regions`: Regiões para reconhecimento

### Como Alterar Configurações

#### Opção 1: Via Interface Web
1. Acesse a aba "Configuração" no dashboard
2. Altere os valores desejados
3. Clique em "Salvar Todas as Configurações"

#### Opção 2: Via Variáveis de Ambiente
Edite o arquivo `.env` e reinicie a aplicação.

#### Opção 3: Via Código
Edite os arquivos em `src/config/` conforme o ambiente:

```typescript
// src/config/esp32Config.dev.ts
export const DEV_CONFIG = {
  esp32: {
    debugMode: true,
    pollingInterval: 2000, // Mais frequente em dev
  }
};
```

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React + TypeScript + Vite
- **UI/UX**: Tailwind CSS + shadcn/ui
- **Validação**: Zod (schema validation)
- **Utilitários**: Lodash (merge de configurações)
- **Testes**: Jest + Testing Library
- **Backend**: Supabase (dados e autenticação)
- **API Externa**: PlatRecognizer (reconhecimento de placas)

## 🏗️ Arquitetura do Projeto

```
src/
├── components/          # Componentes React
│   ├── Esp32Status.tsx   # Status do ESP32
│   ├── SystemConfig.tsx  # Configurações do sistema
│   └── ui/              # Componentes UI (shadcn)
├── config/              # Sistema de configuração
│   ├── schema.ts        # Schema Zod
│   ├── esp32Config.base.ts
│   ├── esp32Config.dev.ts
│   ├── esp32Config.prod.ts
│   └── esp32Config.ts   # Configuração final
├── hooks/               # React Hooks
│   └── useEsp32Status.ts
└── integrations/        # Integrações externas
    └── supabase/
```

## 🔍 Validação e Debugging

### Modo Debug
Ative o modo debug para ver logs detalhados:

```bash
# No .env
VITE_DEBUG_MODE=true
```

### Validação de Schema
O sistema valida automaticamente todas as configurações no startup. Em caso de erro:

1. Verifique os valores no `.env`
2. Consulte as mensagens de erro no console
3. Verifique os ranges permitidos (portas, IPs, etc.)

### Solução de Problemas Comuns

#### "API Key é obrigatória"
```bash
# Configure no .env
PLATERECOGNIZER_API_KEY=sua_chave_aqui
PLATERECOGNIZER_LICENSE_KEY=sua_licenca_aqui
```

#### "Porta deve estar entre 1 e 65535"
Verifique se a porta do ESP32 está no range correto.

#### "URL da câmera inválida"
Certifique-se de usar uma URL completa:
```bash
VITE_CAMERA_URL=http://192.168.1.101:8080/video
```

#### "Porta GPIO deve estar entre 0 e 39"
ESP32 possui 40 pinos GPIO (0-39).

## 🔄 Deploy e Produção

### Build para Produção
```bash
npm run build
```

### Deploy no Lovable
1. Clique no botão "Publish" no editor
2. Configure seu domínio personalizado (plano pago)

### Variáveis de Ambiente em Produção
Configure as mesmas variáveis do `.env` na plataforma de deploy.

## 📚 Links Úteis

- [Documentação PlatRecognizer](https://platerecognizer.com/)
- [ESP32 GPIO Reference](https://randomnerdtutorials.com/esp32-pinout-reference-gpios/)
- [Supabase Documentation](https://supabase.com/docs)
- [Lovable Documentation](https://docs.lovable.dev/)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Execute os testes: `npm test`
4. Commit suas mudanças
5. Faça um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
