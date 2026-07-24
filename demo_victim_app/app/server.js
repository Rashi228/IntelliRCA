const express = require('express');
const client = require('prom-client');

const app = express();
const port = 3000;

// Prometheus metrics registry
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});
register.registerMetric(httpRequestDurationMicroseconds);

// Middleware to record metrics
app.use((req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.path, code: res.statusCode });
  });
  next();
});

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// State variables for Chaos Engineering
let isDbCrashed = false;
let isCpuSpiking = false;
let isMemoryLeaking = false;
let isApiFailing = false;
let memoryLeakArray = [];

// Normal endpoint
app.get('/', (req, res) => {
  if (isApiFailing) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
  if (isDbCrashed) {
    return res.status(503).json({ error: "Service Unavailable: Database Connection Lost" });
  }
  res.json({ message: "Victim App is running smoothly." });
});

// Chaos UI (Simple HTML)
app.get('/chaos', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>IntelliRCA Chaos Dashboard</title>
        <style>
          body { 
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
            background: #f0f7ff; 
            color: #1e3a8a; 
            padding: 40px; 
            max-width: 800px;
            margin: 0 auto;
          }
          h1 { color: #2563eb; font-weight: 800; border-bottom: 2px solid #bfdbfe; padding-bottom: 10px; }
          p { font-size: 1.1em; color: #475569; margin-bottom: 30px; }
          .button-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          button { 
            padding: 15px 25px; 
            font-size: 16px; 
            font-weight: bold; 
            cursor: pointer; 
            border-radius: 8px; 
            border: none; 
            transition: all 0.2s ease;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          button:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
          button:active { transform: translateY(0); }
          .db { background: #ef4444; color: white; }
          .cpu { background: #f59e0b; color: white; }
          .mem { background: #3b82f6; color: white; }
          .api { background: #8b5cf6; color: white; }
          .reset { 
            background: #10b981; 
            color: white; 
            display: block; 
            width: 100%;
            margin-top: 30px; 
            padding: 20px;
            font-size: 1.2em;
          }
        </style>
      </head>
      <body>
        <h1>IntelliRCA Chaos Dashboard</h1>
        <p>Click a button below to simulate a critical failure. Prometheus will detect the metric anomaly and fire a webhook to the IntelliRCA platform.</p>
        <div class="button-grid">
          <button class="db" onclick="fetch('/crash-db')">💥 Crash Database</button>
          <button class="cpu" onclick="fetch('/spike-cpu')">🔥 Spike CPU</button>
          <button class="mem" onclick="fetch('/leak-memory')">💧 Memory Leak</button>
          <button class="api" onclick="fetch('/fail-api')">🛑 API 500 Errors</button>
        </div>
        <button class="reset" onclick="fetch('/reset')">✅ Reset System to Normal</button>
        <script>
          // Make UI feel responsive
          document.querySelectorAll('button').forEach(b => {
            b.addEventListener('click', () => {
              b.style.opacity = '0.5';
              setTimeout(() => b.style.opacity = '1', 500);
            });
          });
        </script>
      </body>
    </html>
  `);
});

// Chaos Endpoints
app.get('/crash-db', (req, res) => {
  isDbCrashed = true;
  console.log("CRASH: Database disconnected!");
  res.send("DB Crashed");
});

app.get('/spike-cpu', (req, res) => {
  isCpuSpiking = true;
  console.log("CRASH: Spiking CPU!");
  // Asynchronous CPU spike so we don't block the event loop entirely (otherwise Prometheus can't scrape)
  const spike = () => {
    if (!isCpuSpiking) return;
    const start = Date.now();
    while (Date.now() - start < 100) {
      // Burn CPU for 100ms
      Math.random() * Math.random();
    }
    setTimeout(spike, 0); // Yield to event loop, then burn again
  };
  spike();
  res.send("CPU Spiking");
});

app.get('/leak-memory', (req, res) => {
  isMemoryLeaking = true;
  console.log("CRASH: Leaking Memory!");
  const leak = setInterval(() => {
    if (!isMemoryLeaking) {
      clearInterval(leak);
      return;
    }
    // Allocate ~10MB every second
    memoryLeakArray.push(new Array(1024 * 1024).fill('IntelliRCA_Memory_Leak'));
  }, 1000);
  res.send("Memory Leaking");
});

app.get('/fail-api', (req, res) => {
  isApiFailing = true;
  console.log("CRASH: API is now returning 500s!");
  res.send("API Failing");
});

app.get('/reset', (req, res) => {
  isDbCrashed = false;
  isCpuSpiking = false;
  isMemoryLeaking = false;
  isApiFailing = false;
  memoryLeakArray = [];
  if (global.gc) {
    global.gc();
  }
  console.log("RESET: System restored to normal.");
  res.send("Reset");
});

app.listen(port, () => {
  console.log(`Victim app listening on port ${port}`);
  
  // Simulate continuous background user traffic (10 requests per second)
  setInterval(() => {
    fetch(`http://localhost:${port}/`).catch(() => {});
  }, 100);
});
