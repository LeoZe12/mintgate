
export interface VideoCaptureConfig {
  width?: number;
  height?: number;
  frameRate?: number;
  facingMode?: 'user' | 'environment';
}

export class VideoCaptureService {
  private stream: MediaStream | null = null;
  private video: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  private isCapturing = false;

  async initialize(config: VideoCaptureConfig = {}): Promise<void> {
    const constraints: MediaStreamConstraints = {
      video: {
        width: config.width || 640,
        height: config.height || 480,
        frameRate: config.frameRate || 30,
        facingMode: config.facingMode || 'environment',
      },
      audio: false,
    };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      this.video = document.createElement('video');
      this.video.srcObject = this.stream;
      this.video.play();

      this.canvas = document.createElement('canvas');
      this.context = this.canvas.getContext('2d');

      await new Promise((resolve) => {
        this.video!.onloadedmetadata = resolve;
      });

      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;
    } catch (error) {
      throw new Error(`Erro ao inicializar captura de vídeo: ${error}`);
    }
  }

  captureFrame(): File | null {
    if (!this.video || !this.canvas || !this.context) return null;

    this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    
    return new Promise((resolve) => {
      this.canvas!.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `frame_${Date.now()}.jpg`, { type: 'image/jpeg' });
          resolve(file);
        } else {
          resolve(null);
        }
      }, 'image/jpeg', 0.8);
    }) as any;
  }

  async captureBatch(count: number, intervalMs: number = 500): Promise<File[]> {
    const frames: File[] = [];
    
    for (let i = 0; i < count; i++) {
      const frame = this.captureFrame();
      if (frame) {
        frames.push(frame);
      }
      
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }

    return frames;
  }

  startContinuousCapture(callback: (frame: File) => void, intervalMs: number = 1000): void {
    if (this.isCapturing) return;

    this.isCapturing = true;
    const capture = () => {
      if (!this.isCapturing) return;

      const frame = this.captureFrame();
      if (frame) {
        callback(frame);
      }

      setTimeout(capture, intervalMs);
    };

    capture();
  }

  stopContinuousCapture(): void {
    this.isCapturing = false;
  }

  async stop(): Promise<void> {
    this.stopContinuousCapture();
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.video) {
      this.video.srcObject = null;
      this.video = null;
    }

    this.canvas = null;
    this.context = null;
  }

  getVideoElement(): HTMLVideoElement | null {
    return this.video;
  }

  isInitialized(): boolean {
    return this.stream !== null && this.video !== null;
  }
}

export const videoCaptureService = new VideoCaptureService();
