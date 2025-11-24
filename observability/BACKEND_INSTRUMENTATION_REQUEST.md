# Backend Service Instrumentation Request

## Services Requiring Prometheus Metrics

The following H100 cluster services need Prometheus `/metrics` endpoints added:

### 1. Executives Service (g367:8300)
**Current Status**: Returns 404 on `/metrics`
**Required**: Prometheus metrics endpoint

**Recommended Metrics**:
```
# Executive analysis metrics
executive_analysis_total{executive="ceo|cfo|cto"}
executive_analysis_duration_seconds
executive_analysis_failures_total
executive_consensus_score

# API metrics
http_requests_total{method,status,endpoint}
http_request_duration_seconds

# Health
service_health_status
```

---

### 2. Governance Service (g367:8400)
**Current Status**: Returns 404 on `/metrics`
**Required**: Prometheus metrics endpoint

**Recommended Metrics**:
```
# Governance deliberation metrics
governance_deliberation_total
governance_deliberation_duration_seconds
governance_vote_total{outcome="approved|rejected"}
governance_policy_violations_total

# API metrics
http_requests_total{method,status,endpoint}
http_request_duration_seconds

# Health
service_health_status
```

---

### 3. Voila Duplex Service (g374:8700)
**Current Status**: Connection timeout (node may be offline or firewall blocking)
**Required**: Verify service is running and accessible, then add Prometheus endpoint

**Recommended Metrics**:
```
# Duplex voice metrics
duplex_sessions_active
duplex_sessions_total
duplex_rtt_seconds
duplex_audio_quality_score

# API metrics
http_requests_total{method,status,endpoint}
http_request_duration_seconds

# Health
service_health_status
```

---

## Implementation Guide

### Python (FastAPI/Flask)
```python
from prometheus_client import Counter, Histogram, Gauge, generate_latest

# Define metrics
requests_total = Counter('http_requests_total', 'Total requests', ['method', 'status', 'endpoint'])
request_duration = Histogram('http_request_duration_seconds', 'Request latency')
service_health = Gauge('service_health_status', 'Service health (1=healthy, 0=down)')

# Metrics endpoint
@app.get("/metrics")
async def metrics():
    return Response(content=generate_latest(), media_type="text/plain")
```

### Go
```go
import (
    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promhttp"
)

// Register metrics endpoint
http.Handle("/metrics", promhttp.Handler())
```

### Node.js
```javascript
const client = require('prom-client');
const register = new client.Registry();

client.collectDefaultMetrics({ register });

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});
```

---

## Prometheus Configuration

Once instrumented, these services will be automatically scraped by Prometheus:

```yaml
# Already configured in prometheus.yml:
- job_name: 'executives'
  static_configs:
    - targets: ['10.15.38.1:8300']

- job_name: 'governance'
  static_configs:
    - targets: ['10.15.38.1:8400']

- job_name: 'voila-duplex'
  static_configs:
    - targets: ['10.15.38.102:8700']
```

---

## Priority

**HIGH** - These services are currently showing as DOWN in the observability stack. Production-grade monitoring requires all services to expose metrics.

---

## Contact

Observability stack deployed on Linode Portal server.
Grafana accessible via SSH tunnel: `ssh -L 3001:127.0.0.1:3001 root@<LINODE-IP>`

Dashboard: "Engine Orchestration & System Health" will show these services as UP once instrumented.
