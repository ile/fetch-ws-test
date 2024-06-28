import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const PORT = 3000;
const PORTWS = 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({
  port: PORTWS,
  path: "/ws",
  perMessageDeflate: {
    zlibDeflateOptions: {
      // See zlib defaults.
      chunkSize: 1024,
      memLevel: 7,
      level: 3
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    },
    // Other options settable:
    clientNoContextTakeover: true, // Defaults to negotiated value.
    serverNoContextTakeover: true, // Defaults to negotiated value.
    serverMaxWindowBits: 10, // Defaults to negotiated value.
    // Below options specified as default values.
    concurrencyLimit: 10, // Limits zlib concurrency for perf.
    threshold: 1024 // Size (in bytes) below which messages
    // should not be compressed if context takeover is disabled.
  }
});

app.use(express.static(join(__dirname, 'public')));

app.get('/http-keep-alive', (req, res) => {
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Keep-Alive', 'timeout=5, max=1000');
  res.json({ message: 'Hello from HTTP Keep-Alive!' + Date.now() });
});

app.get('/http-no-keep-alive', (req, res) => {
  res.setHeader('Connection', 'close');
  res.json({ message: 'Hello from HTTP without Keep-Alive!' + Date.now() });
});

wss.on('connection', (ws) => {
  console.log('connection');
  ws.on('message', (message) => {
    ws.send(JSON.stringify({ message: 'Hello from WebSocket! ' + Date.now() }));
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
