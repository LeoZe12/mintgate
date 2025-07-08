
const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// Endpoint para converter RTSP para MJPEG usando FFmpeg
app.get('/stream/mjpeg', (req, res) => {
  const rtspUrl = req.query.url;
  
  if (!rtspUrl) {
    return res.status(400).json({ error: 'URL RTSP é obrigatória' });
  }

  console.log(`Iniciando stream RTSP: ${rtspUrl}`);

  // Configura headers para MJPEG stream
  res.writeHead(200, {
    'Content-Type': 'multipart/x-mixed-replace; boundary=--myboundary',
    'Cache-Control': 'no-cache',
    'Connection': 'close',
    'Pragma': 'no-cache'
  });

  // Comando FFmpeg para converter RTSP para MJPEG
  const ffmpeg = spawn('ffmpeg', [
    '-i', rtspUrl,
    '-c:v', 'mjpeg',
    '-f', 'mjpeg',
    '-q:v', '10',
    '-r', '5', // 5 FPS para reduzir bandwidth
    'pipe:1'
  ]);

  let frameBuffer = Buffer.alloc(0);

  ffmpeg.stdout.on('data', (data) => {
    frameBuffer = Buffer.concat([frameBuffer, data]);
    
    // Procura pelo marcador de fim de frame JPEG (FFD9)
    let endMarker = frameBuffer.indexOf(Buffer.from([0xFF, 0xD9]));
    
    while (endMarker !== -1) {
      // Extrai o frame completo
      const frame = frameBuffer.slice(0, endMarker + 2);
      frameBuffer = frameBuffer.slice(endMarker + 2);
      
      // Envia o frame como parte do MJPEG stream
      res.write('--myboundary\r\n');
      res.write('Content-Type: image/jpeg\r\n');
      res.write(`Content-Length: ${frame.length}\r\n\r\n`);
      res.write(frame);
      res.write('\r\n');
      
      // Procura pelo próximo frame
      endMarker = frameBuffer.indexOf(Buffer.from([0xFF, 0xD9]));
    }
  });

  ffmpeg.stderr.on('data', (data) => {
    console.error(`FFmpeg stderr: ${data}`);
  });

  ffmpeg.on('close', (code) => {
    console.log(`FFmpeg process exited with code ${code}`);
    res.end();
  });

  // Cleanup quando cliente desconecta
  req.on('close', () => {
    console.log('Cliente desconectou, parando FFmpeg');
    ffmpeg.kill('SIGTERM');
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'RTSP Proxy Server is running' });
});

app.listen(PORT, () => {
  console.log(`🎥 RTSP Proxy Server rodando na porta ${PORT}`);
  console.log(`📡 Endpoint: http://localhost:${PORT}/stream/mjpeg?url=<RTSP_URL>`);
  console.log(`⚠️  Certifique-se de ter o FFmpeg instalado no sistema`);
});
