const express = require('express');
const client = require('prom-client');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ── Prometheus metrics setup ────────────────────────────────
const register = new client.Registry();

// Collect default metrics (CPU, memory, event loop lag, etc.)
client.collectDefaultMetrics({ register });

// Custom counter — total HTTP requests by method, route, status
const httpRequests = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

// Custom histogram — response time in milliseconds
const httpDuration = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'HTTP request duration in milliseconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000],
  registers: [register],
});

// Middleware — track every request automatically
app.use((req, res, next) => {
  const end = httpDuration.startTimer();
  res.on('finish', () => {
    httpRequests.inc({
      method: req.method,
      route: req.path,
      status: res.statusCode,
    });
    end({
      method: req.method,
      route: req.path,
      status: res.statusCode,
    });
  });
  next();
});

// ── Routes ──────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    app: 'cicd-pipeline-demo',
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.get('/ready', (req, res) => {
  res.status(200).json({ status: 'ready' });
});

// Prometheus metrics endpoint — scraped every 15s by Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// ── Start server ────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Server running on port ${PORT}`);
  console.log(`[${new Date().toISOString()}] Metrics available at /metrics`);
});

module.exports = { app, server };
