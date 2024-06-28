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
  path: "/ws"
});

app.use(express.static(join(__dirname, 'public')));

app.get('/http-keep-alive', (req, res) => {
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Keep-Alive', 'timeout=5, max=1000');
  res.json({ message: '' + Date.now() });
});

app.get('/http-no-keep-alive', (req, res) => {
  res.setHeader('Connection', 'close');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.json({ message: '' + Date.now() });
});

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    ws.send(JSON.stringify({ message: '' + Date.now() }));
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
