
import type { ValidationResult } from '../types/plateRecognizer';

class ImageValidatorService {
  private readonly validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  private readonly maxSize = 10 * 1024 * 1024; // 10MB
  private readonly minSize = 1024; // 1KB

  validateImageFile(file: File): ValidationResult {
    if (!this.validTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de arquivo inválido. Tipos aceitos: ${this.validTypes.join(', ')}`
      };
    }

    if (file.size > this.maxSize) {
      return {
        valid: false,
        error: `Arquivo muito grande. Tamanho máximo: ${(this.maxSize / 1024 / 1024).toFixed(1)}MB`
      };
    }

    if (file.size < this.minSize) {
      return {
        valid: false,
        error: `Arquivo muito pequeno. Tamanho mínimo: ${(this.minSize / 1024).toFixed(1)}KB`
      };
    }

    return { valid: true };
  }
}

export const imageValidatorService = new ImageValidatorService();
