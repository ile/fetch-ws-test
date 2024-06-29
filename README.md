# fetch-ws-test

Compares the performance of `fetch()` with & without `keep-alive` and websocket.

Coded by Claude AI.

```
Performance Test
Start Test
Running 100 requests for each method, 2 times...

Run 1:
HTTP Fetch with Keep-Alive:
Average: 2.887 ms
Min: 1.600 ms
Max: 50.800 ms

HTTP Fetch without Keep-Alive:
Average: 2.064 ms
Min: 1.500 ms
Max: 30.400 ms

WebSocket:
Average: 0.137 ms
Min: 0.000 ms
Max: 0.800 ms


Run 2:
HTTP Fetch with Keep-Alive:
Average: 1.574 ms
Min: 1.300 ms
Max: 2.200 ms

HTTP Fetch without Keep-Alive:
Average: 1.537 ms
Min: 1.300 ms
Max: 2.400 ms

WebSocket:
Average: 0.157 ms
Min: 0.100 ms
Max: 0.300 ms


Average Results Across All Runs:
keepAlive:
Average: 2.230 ms
Min: 1.300 ms
Max: 50.800 ms

noKeepAlive:
Average: 1.800 ms
Min: 1.300 ms
Max: 30.400 ms

webSocket:
Average: 0.147 ms
Min: 0.000 ms
Max: 0.800 ms
```


