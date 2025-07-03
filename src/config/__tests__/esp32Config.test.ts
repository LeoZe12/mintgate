
import { validateConfiguration, ESP32_CONFIG, updateConfig, resetConfig } from '../esp32Config';
import { BASE_CONFIG } from '../esp32Config.base';

describe('ESP32 Configuration System', () => {
  describe('validateConfiguration', () => {
    it('deve validar configuração válida', () => {
      expect(validateConfiguration(BASE_CONFIG)).toBe(true);
    });

    it('deve rejeitar porta serial inválida', () => {
      const invalidConfig = {
        ...BASE_CONFIG,
        esp32: {
          ...BASE_CONFIG.esp32,
          serialPort: '' // Porta serial vazia
        }
      };
      
      expect(validateConfiguration(invalidConfig)).toBe(false);
    });

    it('deve rejeitar baud rate inválido', () => {
      const invalidConfig = {
        ...BASE_CONFIG,
        esp32: {
          ...BASE_CONFIG.esp32,
          baudRate: 1000000000 // Baud rate muito alto
        }
      };
      
      expect(validateConfiguration(invalidConfig)).toBe(false);
    });
  });

  describe('updateConfig', () => {
    it('deve atualizar configuração parcialmente', () => {
      const updates = {
        esp32: {
          debugMode: true
        }
      };
      
      const updatedConfig = updateConfig(updates);
      expect(updatedConfig.esp32.debugMode).toBe(true);
      expect(updatedConfig.esp32.serialPort).toBe(ESP32_CONFIG.esp32.serialPort);
    });
  });

  describe('resetConfig', () => {
    it('deve resetar para configuração base', () => {
      const resetted = resetConfig();
      expect(resetted.esp32.debugMode).toBe(BASE_CONFIG.esp32.debugMode);
    });
  });

  describe('Configuration Loading', () => {
    it('deve carregar configuração sem erros', () => {
      expect(() => ESP32_CONFIG).not.toThrow();
    });

    it('deve ter todas as propriedades obrigatórias', () => {
      expect(ESP32_CONFIG.esp32).toBeDefined();
      expect(ESP32_CONFIG.gpio).toBeDefined();
      expect(ESP32_CONFIG.camera).toBeDefined();
      expect(ESP32_CONFIG.platRecognizer).toBeDefined();
      expect(ESP32_CONFIG.api).toBeDefined();
      expect(ESP32_CONFIG.ui).toBeDefined();
    });
  });
});
