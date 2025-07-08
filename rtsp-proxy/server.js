const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'RTSP Proxy Server is running',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: 'RTSP Proxy Server is working correctly',
    endpoints: {
      health: '/health',
      stream: '/stream/mjpeg?url=<RTSP_URL>',
      test: '/test'
    }
  });
});

// RTSP to MJPEG stream converter
app.get('/stream/mjpeg', (req, res) => {
  const rtspUrl = req.query.url;
  
  if (!rtspUrl) {
    return res.status(400).json({ 
      error: 'URL RTSP é obrigatória',
      usage: 'GET /stream/mjpeg?url=rtsp://user:pass@host:port/path'
    });
  }

  console.log(`🎥 [${new Date().toLocaleTimeString()}] Iniciando stream RTSP: ${rtspUrl}`);

  // Configura headers para MJPEG stream
  res.writeHead(200, {
    'Content-Type': 'multipart/x-mixed-replace; boundary=--mjpegboundary',
    'Cache-Control': 'no-cache, no-store, max-age=0',
    'Connection': 'close',
    'Pragma': 'no-cache',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type'
  });

  // Comando FFmpeg otimizado para conversão RTSP -> MJPEG
  const ffmpegArgs = [
    '-fflags', '+genpts+discardcorrupt',
    '-rtsp_transport', 'tcp',
    '-i', rtspUrl,
    '-f', 'mjpeg',
    '-vcodec', 'mjpeg',
    '-q:v', '8',          // Qualidade (1-31, menor = melhor)
    '-r', '10',           // 10 FPS para reduzir bandwidth
    '-s', '640x480',      // Resolução otimizada
    '-an',                // Sem áudio
    '-reset_timestamps', '1',
    'pipe:1'
  ];

  const ffmpeg = spawn('ffmpeg', ffmpegArgs, {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let frameBuffer = Buffer.alloc(0);
  let streamActive = true;

  // Processa dados do FFmpeg
  ffmpeg.stdout.on('data', (data) => {
    if (!streamActive) return;
    
    frameBuffer = Buffer.concat([frameBuffer, data]);
    
    // Procura pelo marcador de início JPEG (FFD8) e fim (FFD9)
    let startMarker = frameBuffer.indexOf(Buffer.from([0xFF, 0xD8]));
    let endMarker = frameBuffer.indexOf(Buffer.from([0xFF, 0xD9]));
    
    while (startMarker !== -1 && endMarker !== -1 && endMarker > startMarker) {
      // Extrai o frame completo
      const frame = frameBuffer.slice(startMarker, endMarker + 2);
      frameBuffer = frameBuffer.slice(endMarker + 2);
      
      try {
        // Envia o frame como parte do MJPEG stream
        res.write('--mjpegboundary\r\n');
        res.write('Content-Type: image/jpeg\r\n');
        res.write(`Content-Length: ${frame.length}\r\n\r\n`);
        res.write(frame);
        res.write('\r\n');
      } catch (error) {
        console.log('⚠️ Cliente desconectou durante envio do frame');
        streamActive = false;
        break;
      }
      
      // Procura pelo próximo frame
      startMarker = frameBuffer.indexOf(Buffer.from([0xFF, 0xD8]));
      endMarker = frameBuffer.indexOf(Buffer.from([0xFF, 0xD9]));
    }
  });

  // Log de erros do FFmpeg
  ffmpeg.stderr.on('data', (data) => {
    const error = data.toString();
    if (!error.includes('frame=') && !error.includes('fps=') && !error.includes('bitrate=')) {
      console.error(`🔥 FFmpeg: ${error.trim()}`);
    }
  });

  // Cleanup quando FFmpeg termina
  ffmpeg.on('close', (code) => {
    console.log(`📺 [${new Date().toLocaleTimeString()}] Stream RTSP encerrado (código: ${code})`);
    streamActive = false;
    if (!res.headersSent) {
      res.end();
    }
  });

  // Cleanup quando cliente desconecta
  req.on('close', () => {
    console.log(`👋 [${new Date().toLocaleTimeString()}] Cliente desconectou, parando stream`);
    streamActive = false;
    ffmpeg.kill('SIGTERM');
    
    // Force kill se necessário
    setTimeout(() => {
      if (!ffmpeg.killed) {
        ffmpeg.kill('SIGKILL');
      }
    }, 5000);
  });

  // Timeout de segurança
  const timeout = setTimeout(() => {
    console.log('⏰ Timeout do stream RTSP');
    streamActive = false;
    ffmpeg.kill('SIGTERM');
  }, 300000); // 5 minutos

  req.on('close', () => {
    clearTimeout(timeout);
  });
});

// Middleware de erro global
app.use((error, req, res, next) => {
  console.error('❌ Erro no servidor:', error);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: error.message
  });
});

// Inicia o servidor
const server = app.listen(PORT, () => {
  console.log('🎥═══════════════════════════════════════════════════════════');
  console.log(`🎥 RTSP Proxy Server INICIADO com sucesso!`);
  console.log(`🎥 Porta: ${PORT}`);
  console.log(`🎥 Health Check: http://localhost:${PORT}/health`);
  console.log(`🎥 Stream MJPEG: http://localhost:${PORT}/stream/mjpeg?url=<RTSP_URL>`);
  console.log(`🎥 Teste: http://localhost:${PORT}/test`);
  console.log('🎥═══════════════════════════════════════════════════════════');
  console.log('📋 Certifique-se de ter o FFmpeg instalado no sistema');
  console.log('🔗 Para parar: Ctrl+C');
  console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Parando RTSP Proxy Server...');
  server.close(() => {
    console.log('✅ Servidor parado com sucesso');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Recebido SIGTERM, parando servidor...');
  server.close(() => {
    console.log('✅ Servidor parado com sucesso');
    process.exit(0);
  });
});