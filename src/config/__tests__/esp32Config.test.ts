
import { validateConfiguration, ESP32_CONFIG, updateConfig, resetConfig } from '../esp32Config';
import { BASE_CONFIG } from '../esp32Config.base';

describe('ESP32 Configuration System', () => {
  describe('validateConfiguration', () => {
    it('deve validar configuração válida', () => {
      expect(validateConfiguration(BASE_CONFIG)).toBe(true);
    });

    it('deve rejeitar IP inválido', () => {
      const invalidConfig = {
        ...BASE_CONFIG,
        esp32: {
          ...BASE_CONFIG.esp32,
          ipAddress: 'invalid-ip'
        }
      };
      
      expect(validateConfiguration(invalidConfig)).toBe(false);
    });

    it('deve rejeitar porta inválida', () => {
      const invalidConfig = {
        ...BASE_CONFIG,
        esp32: {
          ...BASE_CONFIG.esp32,
          port: 70000 // Porta inválida
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
      expect(updatedConfig.esp32.ipAddress).toBe(ESP32_CONFIG.esp32.ipAddress);
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
