/**
 * Sovren Portal Metrics Exporter
 *
 * Standalone metrics service that proxies Portal health
 * and exposes Prometheus metrics
 */

const express = require('express');
const client = require('prom-client');

const app = express();
const register = new client.Registry();

// Enable default metrics (CPU, memory, event loop, etc.)
client.collectDefaultMetrics({ register });

// Custom metrics
const portalUpGauge = new client.Gauge({
  name: 'portal_up',
  help: 'Portal service availability (1 = up, 0 = down)',
  registers: [register]
});

const portalHealthCheckDuration = new client.Histogram({
  name: 'portal_health_check_duration_seconds',
  help: 'Portal health check latency',
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
  registers: [register]
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests (proxied from Portal)',
  labelNames: ['method', 'status', 'route'],
  registers: [register]
});

// Health check Portal
async function checkPortalHealth() {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('http://host.docker.internal:3000', {
      signal: controller.signal,
      headers: { 'User-Agent': 'Prometheus-Metrics-Exporter/1.0' }
    });

    clearTimeout(timeoutId);

    const duration = (Date.now() - start) / 1000;
    portalHealthCheckDuration.observe(duration);

    if (response.ok) {
      portalUpGauge.set(1);
      return true;
    } else {
      portalUpGauge.set(0);
      return false;
    }
  } catch (error) {
    const duration = (Date.now() - start) / 1000;
    portalHealthCheckDuration.observe(duration);
    portalUpGauge.set(0);
    return false;
  }
}

// Periodic health checks
setInterval(checkPortalHealth, 5000);

// Initial check
checkPortalHealth();

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error);
  }
});

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'portal-metrics-exporter' });
});

const PORT = 9100;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Portal Metrics Exporter listening on port ${PORT}`);
  console.log(`Monitoring Portal at http://host.docker.internal:3000`);
});
