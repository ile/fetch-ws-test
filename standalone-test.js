import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import fetch from 'node-fetch';
import { Agent } from 'http';

const NUM_REQUESTS = 10000;

// Create a custom agent with keep-alive enabled
const keepAliveAgent = new Agent({
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxSockets: 1, // Limit to one socket for this test
});

function createServer(port, keepAlive = true) {
  const server = http.createServer((req, res) => {
    if (req.url === '/http-endpoint') {
      if (keepAlive) {
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Keep-Alive', 'timeout=5, max=1000');
      } else {
        res.setHeader('Connection', 'close');
      }
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Hello from HTTP!' }));
    }
  });

  if (keepAlive) {
    server.keepAliveTimeout = 5000; // 5 seconds
    server.headersTimeout = 6000; // slightly higher than keepAliveTimeout
  }

  return new Promise((resolve) => {
    server.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
      resolve(server);
    });
  });
}

async function runHttpTestWithKeepAlive(port) {
  console.log('Starting HTTP test with Keep-Alive...');
  const startTime = process.hrtime.bigint();
  const times = [];
  for (let i = 0; i < NUM_REQUESTS; i++) {
    const reqStartTime = process.hrtime.bigint();
    await fetch(`http://localhost:${port}/http-endpoint`, { agent: keepAliveAgent });
    const reqEndTime = process.hrtime.bigint();
    times.push(Number(reqEndTime - reqStartTime) / 1e6); // Convert to milliseconds
  }
  const endTime = process.hrtime.bigint();
  const duration = Number(endTime - startTime) / 1e6;
  console.log(`HTTP test with Keep-Alive completed in ${duration.toFixed(3)} ms`);
  return times;
}

async function runHttpTestWithoutKeepAlive(port) {
  console.log('Starting HTTP test without Keep-Alive...');
  const startTime = process.hrtime.bigint();
  const times = [];
  for (let i = 0; i < NUM_REQUESTS; i++) {
    const reqStartTime = process.hrtime.bigint();
    await fetch(`http://localhost:${port}/http-endpoint`, { agent: null }); // Disable keep-alive
    const reqEndTime = process.hrtime.bigint();
    times.push(Number(reqEndTime - reqStartTime) / 1e6); // Convert to milliseconds
  }
  const endTime = process.hrtime.bigint();
  const duration = Number(endTime - startTime) / 1e6;
  console.log(`HTTP test without Keep-Alive completed in ${duration.toFixed(3)} ms`);
  return times;
}

async function runWebSocketTest(port) {
  console.log('Starting WebSocket test...');
  const startTime = process.hrtime.bigint();
  const ws = new WebSocket(`ws://localhost:${port}`);
  await new Promise(resolve => ws.on('open', resolve));

  const times = [];
  for (let i = 0; i < NUM_REQUESTS; i++) {
    const reqStartTime = process.hrtime.bigint();
    ws.send('Hello');
    await new Promise(resolve => ws.once('message', resolve));
    const reqEndTime = process.hrtime.bigint();
    times.push(Number(reqEndTime - reqStartTime) / 1e6); // Convert to milliseconds
  }

  ws.close();
  const endTime = process.hrtime.bigint();
  const duration = Number(endTime - startTime) / 1e6;
  console.log(`WebSocket test completed in ${duration.toFixed(3)} ms`);
  return times;
}

function calculateStats(times) {
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  return { avg, min, max };
}

async function runTest() {
  console.log(`Running ${NUM_REQUESTS} requests for each method...`);

  // HTTP with Keep-Alive
  const serverWithKeepAlive = await createServer(3000, true);
  const httpTimesWithKeepAlive = await runHttpTestWithKeepAlive(3000);
  serverWithKeepAlive.close();

  // HTTP without Keep-Alive
  const serverWithoutKeepAlive = await createServer(3001, false);
  const httpTimesWithoutKeepAlive = await runHttpTestWithoutKeepAlive(3001);
  serverWithoutKeepAlive.close();

  // WebSocket
  const wsServer = await createServer(3002, true);
  const wss = new WebSocketServer({ server: wsServer });
  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      ws.send(JSON.stringify({ message: 'Hello from WebSocket!' }));
    });
  });
  const wssTimes = await runWebSocketTest(3002);
  wsServer.close();

  const keepAliveStats = calculateStats(httpTimesWithKeepAlive);
  const noKeepAliveStats = calculateStats(httpTimesWithoutKeepAlive);
  const wssStats = calculateStats(wssTimes);

  console.log('\nResults:');
  console.log('\nHTTP Fetch with Keep-Alive:');
  console.log(`Average: ${keepAliveStats.avg.toFixed(3)} ms`);
  console.log(`Min: ${keepAliveStats.min.toFixed(3)} ms`);
  console.log(`Max: ${keepAliveStats.max.toFixed(3)} ms`);

  console.log('\nHTTP Fetch without Keep-Alive:');
  console.log(`Average: ${noKeepAliveStats.avg.toFixed(3)} ms`);
  console.log(`Min: ${noKeepAliveStats.min.toFixed(3)} ms`);
  console.log(`Max: ${noKeepAliveStats.max.toFixed(3)} ms`);

  console.log('\nWebSocket:');
  console.log(`Average: ${wssStats.avg.toFixed(3)} ms`);
  console.log(`Min: ${wssStats.min.toFixed(3)} ms`);
  console.log(`Max: ${wssStats.max.toFixed(3)} ms`);
}

runTest();