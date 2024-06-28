const NUM_REQUESTS = 100;
// const protocol = window.location.hostname == 'localhost' ? 'ws': 'wss'
const protocol = 'ws';

async function runHttpTestWithKeepAlive() {
  console.log('Starting HTTP test with Keep-Alive...');
  const startTime = performance.now();
  const times = [];
  for (let i = 0; i < NUM_REQUESTS; i++) {
    const reqStartTime = performance.now();
    await fetch('/http-keep-alive');
    const reqEndTime = performance.now();
    times.push(reqEndTime - reqStartTime);
  }
  const endTime = performance.now();
  console.log(
    `HTTP test with Keep-Alive completed in ${(endTime - startTime).toFixed(
      3
    )} ms`
  );
  return times;
}

async function runHttpTestWithoutKeepAlive() {
  console.log('Starting HTTP test without Keep-Alive...');
  const startTime = performance.now();
  const times = [];
  for (let i = 0; i < NUM_REQUESTS; i++) {
    const reqStartTime = performance.now();
    await fetch('/http-no-keep-alive');
    const reqEndTime = performance.now();
    times.push(reqEndTime - reqStartTime);
  }
  const endTime = performance.now();
  console.log(
    `HTTP test without Keep-Alive completed in ${(endTime - startTime).toFixed(
      3
    )} ms`
  );
  return times;
}

async function runWebSocketTest() {
  console.log('Starting WebSocket test...');
  const startTime = performance.now();
  
  const ws = new WebSocket(`${protocol}://${window.location.hostname}:3001/ws`);
  await new Promise((resolve) => ws.addEventListener('open', resolve));

  const times = [];
  for (let i = 0; i < NUM_REQUESTS; i++) {
    const reqStartTime = performance.now();
    ws.send('Hello');
    await new Promise((resolve) =>
      ws.addEventListener('message', resolve, { once: true })
    );
    const reqEndTime = performance.now();
    times.push(reqEndTime - reqStartTime);
  }

  ws.close();
  const endTime = performance.now();
  console.log(
    `WebSocket test completed in ${(endTime - startTime).toFixed(3)} ms`
  );
  return times;
}

function calculateStats(times) {
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  return { avg, min, max };
}

async function runTest() {
  const NUM_RUNS = 5;
  const WARM_UP_REQUESTS = 10;
  const resultsDiv = document.getElementById('results');

  resultsDiv.textContent = `Running ${NUM_REQUESTS} requests for each method, ${NUM_RUNS} times...\n`;

  const allResults = { keepAlive: [], noKeepAlive: [], webSocket: [] };

  for (let run = 0; run < NUM_RUNS; run++) {
    resultsDiv.textContent += `\nRun ${run + 1}:\n`;

    // Warm-up
    // for (let i = 0; i < WARM_UP_REQUESTS; i++) {
    //   await fetch('/http-keep-alive');
    //   await fetch('/http-no-keep-alive');
    //   const ws = new WebSocket(`${protocol}://${window.location.hostname}:3001/ws`);
    //   await new Promise((resolve) => ws.addEventListener('open', resolve));
    //   ws.close();
    // }

    const httpTimesWithKeepAlive = await runHttpTestWithKeepAlive();
    const httpTimesWithoutKeepAlive = await runHttpTestWithoutKeepAlive();
    const wssTimes = await runWebSocketTest();

    allResults.keepAlive.push(calculateStats(httpTimesWithKeepAlive));
    allResults.noKeepAlive.push(calculateStats(httpTimesWithoutKeepAlive));
    allResults.webSocket.push(calculateStats(wssTimes));

    // Display results for this run
    displayResults(
      resultsDiv,
      httpTimesWithKeepAlive,
      httpTimesWithoutKeepAlive,
      wssTimes
    );
  }

  // Calculate and display average results across all runs
  resultsDiv.textContent += '\nAverage Results Across All Runs:\n';
  displayAverageResults(resultsDiv, allResults);
}

function displayResults(resultsDiv, keepAliveTimes, noKeepAliveTimes, wsTimes) {
  const keepAliveStats = calculateStats(keepAliveTimes);
  const noKeepAliveStats = calculateStats(noKeepAliveTimes);
  const wssStats = calculateStats(wsTimes);

  resultsDiv.textContent += 'HTTP Fetch with Keep-Alive:\n';
  resultsDiv.textContent += `Average: ${keepAliveStats.avg.toFixed(3)} ms\n`;
  resultsDiv.textContent += `Min: ${keepAliveStats.min.toFixed(3)} ms\n`;
  resultsDiv.textContent += `Max: ${keepAliveStats.max.toFixed(3)} ms\n\n`;

  resultsDiv.textContent += 'HTTP Fetch without Keep-Alive:\n';
  resultsDiv.textContent += `Average: ${noKeepAliveStats.avg.toFixed(3)} ms\n`;
  resultsDiv.textContent += `Min: ${noKeepAliveStats.min.toFixed(3)} ms\n`;
  resultsDiv.textContent += `Max: ${noKeepAliveStats.max.toFixed(3)} ms\n\n`;

  resultsDiv.textContent += 'WebSocket:\n';
  resultsDiv.textContent += `Average: ${wssStats.avg.toFixed(3)} ms\n`;
  resultsDiv.textContent += `Min: ${wssStats.min.toFixed(3)} ms\n`;
  resultsDiv.textContent += `Max: ${wssStats.max.toFixed(3)} ms\n\n`;
}

function displayAverageResults(resultsDiv, allResults) {
  for (const [testName, results] of Object.entries(allResults)) {
    const avgStats = {
      avg: results.reduce((sum, r) => sum + r.avg, 0) / results.length,
      min: Math.min(...results.map((r) => r.min)),
      max: Math.max(...results.map((r) => r.max)),
    };

    resultsDiv.textContent += `${testName}:\n`;
    resultsDiv.textContent += `Average: ${avgStats.avg.toFixed(3)} ms\n`;
    resultsDiv.textContent += `Min: ${avgStats.min.toFixed(3)} ms\n`;
    resultsDiv.textContent += `Max: ${avgStats.max.toFixed(3)} ms\n\n`;
  }
}
document.getElementById('startTest').addEventListener('click', runTest);

async function test() {
  const ws = new WebSocket(`${protocol}://${window.location.hostname}:3001/ws`);
  console.log(ws);
  await new Promise((resolve) => ws.addEventListener('open', resolve));
  console.log('...open');
  ws.close();
}

test();