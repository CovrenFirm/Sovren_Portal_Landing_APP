# Sovren Observability Stack

Production-grade monitoring infrastructure for Sovren Portal and H100 Cluster services.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ Linode Server (Sovren Portal)                                   │
│                                                                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │  Prometheus  │───▶│   Grafana    │    │   Blackbox   │      │
│  │  :9090       │    │   :3001      │    │   Exporter   │      │
│  └──────┬───────┘    └──────────────┘    └──────┬───────┘      │
│         │                                         │              │
│         │                                         │              │
│         └─────────────────┬───────────────────────┘              │
│                           │                                      │
│                           │ WireGuard Tunnel (wg0)               │
└───────────────────────────┼──────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ H100 Cluster (10.15.0.0/16)                                     │
│                                                                   │
│  g367 (10.15.38.1)        g374 (10.15.38.102)                   │
│  ├─ CRM Backend :8080     └─ Voila Duplex :8700                 │
│  ├─ TTS Kokoro :8200                                             │
│  ├─ Executives :8300                                             │
│  ├─ Governance :8400                                             │
│  └─ Voice Demo :8500                                             │
│                                                                   │
│  g333 (10.15.38.49)       g373 (10.15.38.78)                    │
│  └─ ICMP monitored        └─ ICMP monitored                      │
└─────────────────────────────────────────────────────────────────┘
```

## Components

### Prometheus (Port 9090)
- **Bind**: 127.0.0.1:9090 (local only)
- **Function**: Metrics collection and storage
- **Scrape Interval**: 5 seconds
- **Retention**: 30 days
- **Targets**:
  - Sovren Portal (host.docker.internal:3000)
  - CRM Backend (10.15.38.1:8080)
  - TTS Tier-1 Kokoro (10.15.38.1:8200)
  - Executives (10.15.38.1:8300)
  - Governance (10.15.38.1:8400)
  - Voice Demo (10.15.38.1:8500)
  - Voila Duplex (10.15.38.102:8700)

### Grafana (Port 3001)
- **Bind**: 127.0.0.1:3001 (SSH tunnel required)
- **Admin User**: admin
- **Admin Password**: sovren_observability_2025
- **Datasource**: Prometheus (auto-provisioned)
- **Dashboards**: Auto-provisioned from `/grafana/dashboards/`

### Blackbox Exporter (Port 9115)
- **Bind**: 127.0.0.1:9115 (local only)
- **Function**: Health probes for non-instrumented services
- **Probes**:
  - HTTP/2xx health checks
  - ICMP ping for WireGuard tunnel health

## Access Grafana

Grafana is secured behind localhost binding. Access via SSH tunnel:

```bash
# From your local machine
ssh -L 3001:127.0.0.1:3001 root@<LINODE_IP>

# Then open in browser:
http://localhost:3001

# Login:
Username: admin
Password: sovren_observability_2025
```

## Deployment

### Start the Stack

```bash
cd /opt/sovren-portal/observability
docker compose -f docker-compose.observability.yml up -d
```

### Stop the Stack

```bash
cd /opt/sovren-portal/observability
docker compose -f docker-compose.observability.yml down
```

### Restart Without Data Loss

```bash
cd /opt/sovren-portal/observability
docker compose -f docker-compose.observability.yml restart
```

### View Logs

```bash
# All services
docker compose -f docker-compose.observability.yml logs -f

# Specific service
docker compose -f docker-compose.observability.yml logs -f prometheus
docker compose -f docker-compose.observability.yml logs -f grafana
docker compose -f docker-compose.observability.yml logs -f blackbox
```

### Check Status

```bash
docker compose -f docker-compose.observability.yml ps
```

## Validation

### Verify Prometheus Targets

```bash
# Check all targets are UP
curl -s http://127.0.0.1:9090/api/v1/targets | jq '.data.activeTargets[] | {job: .labels.job, health: .health}'
```

Expected output (all should show `"health": "up"`):
```json
{"job": "portal", "health": "up"}
{"job": "crm", "health": "up"}
{"job": "tts-tier1-kokoro", "health": "up"}
{"job": "voila-duplex", "health": "up"}
{"job": "wireguard-icmp", "health": "up"}
```

### Verify WireGuard Connectivity

```bash
# Test ICMP to g367
curl -s 'http://127.0.0.1:9090/api/v1/query?query=probe_success{instance="10.15.38.1"}' | jq '.data.result[0].value[1]'
# Should return "1"

# Check RTT
curl -s 'http://127.0.0.1:9090/api/v1/query?query=probe_duration_seconds{instance="10.15.38.1"}' | jq '.data.result[0].value[1]'
# Should return low value (< 0.030 = 30ms)
```

### Verify Grafana Dashboards

1. SSH tunnel to Grafana (see above)
2. Navigate to http://localhost:3001
3. Go to **Dashboards** → **Sovren**
4. Verify all 5 dashboards exist:
   - **Sovren Portal Performance**
   - **CRM Backend (g367:8080)**
   - **Voice Pipeline (TTS + Duplex)**
   - **Engine Orchestration & System Health**
   - **WireGuard Network Health**

## Dashboards

### 1. Sovren Portal Performance
**Focus**: Next.js frontend and API proxy layer

**Key Panels**:
- Portal uptime status
- HTTP request rate
- 5xx error rate
- API proxy latency (P95/P50)
- Next.js page load times
- Memory usage
- Event loop lag

**Use Cases**:
- Frontend performance monitoring
- API proxy health
- Memory leak detection
- User experience metrics

---

### 2. CRM Backend (g367:8080)
**Focus**: CRM service and Shadow Board AI

**Key Panels**:
- CRM service health
- Contact operations rate (create/update/delete)
- Shadow Board analysis duration (P95)
- Shadow Board analysis rate and failures
- Strategic fit scores
- API request latency by endpoint
- ImmuDB operations
- Redis queue depth

**Use Cases**:
- Shadow Board AI performance
- Contact lifecycle monitoring
- Database operation health
- Event pipeline monitoring

---

### 3. Voice Pipeline (TTS + Duplex)
**Focus**: TTS synthesis and duplex voice systems

**Key Panels**:
- TTS Tier-1 Kokoro health (g367:8200)
- Voila Duplex health (g374:8700)
- Voice Demo health (g367:8500)
- TTS synthesis latency (P95/P50)
- TTS request rate and failures
- Duplex round-trip latency
- Active duplex sessions
- Service instrumentation status

**Use Cases**:
- Voice quality monitoring
- TTS performance optimization
- Duplex session tracking
- Service availability

---

### 4. Engine Orchestration & System Health
**Focus**: Multi-engine coordination and system overview

**Key Panels**:
- All services health overview
- WireGuard tunnel latency (ICMP)
- WireGuard tunnel health
- PhD Engine execution rate
- Redis event pipeline throughput
- Redis queue depth
- Service scrape success rate
- Prometheus scrape duration
- Last successful scrape times

**Use Cases**:
- Cross-service orchestration health
- Network performance monitoring
- Event pipeline coordination
- Service discovery validation

---

### 5. WireGuard Network Health
**Focus**: Tunnel connectivity and latency

**Key Panels**:
- Cluster nodes reachability (all 4 nodes)
- ICMP round-trip time (RTT)
- Packet loss detection
- Per-node health (g367, g333, g373, g374)
- Network statistics summary

**Use Cases**:
- Network troubleshooting
- Latency optimization
- Packet loss detection
- Multi-node connectivity validation

## Adding New Scrape Targets

### Add a New Service

1. Edit `prometheus/prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'my-new-service'
    scrape_interval: 5s
    scrape_timeout: 3s
    metrics_path: '/metrics'
    static_configs:
      - targets: ['10.15.38.1:9999']
        labels:
          service: 'my-service-name'
          tier: 'backend'
          node: 'g367'
          port: '9999'
```

2. Reload Prometheus config:

```bash
# Graceful reload (no downtime)
curl -X POST http://127.0.0.1:9090/-/reload

# OR restart container
docker compose -f docker-compose.observability.yml restart prometheus
```

3. Verify target:

```bash
curl -s http://127.0.0.1:9090/api/v1/targets | jq '.data.activeTargets[] | select(.labels.job=="my-new-service")'
```

### Add a Health Probe (Non-Instrumented Service)

If a service doesn't expose `/metrics` but has a `/health` endpoint:

1. Add to `prometheus/prometheus.yml` under `blackbox-http` job:

```yaml
- job_name: 'blackbox-http'
  # ... existing config ...
  static_configs:
    - targets:
        # ... existing targets ...
        - http://10.15.38.1:9999/health  # Your new service
```

2. Reload Prometheus (see above)

## Modifying Dashboards

### Update Existing Dashboard

1. Edit the JSON file in `/opt/sovren-portal/observability/grafana/dashboards/`
2. Grafana will auto-reload within 10 seconds (configured in `provisioning/dashboards/dashboards.yml`)
3. Refresh the Grafana UI

### Add New Dashboard

1. Create a new JSON file:

```bash
touch /opt/sovren-portal/observability/grafana/dashboards/my-dashboard.json
```

2. Add dashboard JSON content (can export from Grafana UI)
3. Grafana will auto-provision within 10 seconds

## Alert Configuration

Alert rules are defined in `prometheus/alerts.yml`.

### Current Alerts

- **ServiceDown**: Service unavailable for 30+ seconds
- **HighErrorRate**: 5xx errors > 5% for 1 minute
- **WireGuardHighLatency**: RTT > 30ms for 1 minute
- **WireGuardNodeUnreachable**: ICMP probe failing for 30+ seconds
- **CRMHighContactCreationLatency**: P95 > 1s for 2 minutes
- **ShadowBoardAnalysisFailures**: Failure rate > 0.01/sec for 2 minutes
- **TTSHighLatency**: P95 synthesis > 2s for 2 minutes
- **VoilaDuplexDown**: Service down for 30+ seconds
- **PrometheusTargetDown**: Prometheus self-check failing
- **PrometheusScrapeFailures**: Scrape limit exceeded

### Add New Alert

1. Edit `prometheus/alerts.yml`:

```yaml
groups:
  - name: my_alerts
    interval: 10s
    rules:
      - alert: MyCustomAlert
        expr: my_metric > 100
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "My custom alert fired"
          description: "Metric exceeded threshold: {{ $value }}"
```

2. Reload Prometheus:

```bash
curl -X POST http://127.0.0.1:9090/-/reload
```

3. Verify alert rule:

```bash
curl -s http://127.0.0.1:9090/api/v1/rules | jq '.data.groups[] | select(.name=="my_alerts")'
```

## Troubleshooting

### Prometheus Can't Scrape Portal

**Symptom**: `up{job="portal"} == 0`

**Solution**:
```bash
# Verify Portal is running
curl -s http://localhost:3000/api/health

# Check Prometheus logs
docker logs sovren-prometheus

# Verify host.docker.internal resolves
docker exec sovren-prometheus ping -c 1 host.docker.internal
```

### Prometheus Can't Scrape WireGuard Targets

**Symptom**: `up{job="crm"} == 0`

**Solution**:
```bash
# Verify WireGuard is up
sudo wg show

# Test connectivity from host
curl -s http://10.15.38.1:8080/health

# Test connectivity from Prometheus container
docker exec sovren-prometheus wget -O- http://10.15.38.1:8080/health

# Check routing
ip route | grep wg0
```

### Grafana Shows No Data

**Symptom**: Dashboards display "No data"

**Solution**:
```bash
# Verify Prometheus datasource
curl -s http://127.0.0.1:3001/api/datasources | jq '.[] | select(.type=="prometheus")'

# Test query manually
curl -s 'http://127.0.0.1:9090/api/v1/query?query=up' | jq .

# Check Grafana logs
docker logs sovren-grafana
```

### Blackbox Exporter Probes Failing

**Symptom**: `probe_success{job="wireguard-icmp"} == 0`

**Solution**:
```bash
# Test ICMP manually
ping -c 3 10.15.38.1

# Check blackbox config
docker exec sovren-blackbox cat /etc/blackbox/blackbox.yml

# Test blackbox directly
curl -s 'http://127.0.0.1:9115/probe?module=icmp&target=10.15.38.1' | grep probe_success
```

### Data Not Persisting

**Symptom**: Metrics disappear after restart

**Solution**:
```bash
# Verify volumes exist
docker volume ls | grep sovren

# Check volume mounts
docker inspect sovren-prometheus | jq '.[0].Mounts'

# Verify data directory
docker exec sovren-prometheus ls -lh /prometheus
```

## Metrics Reference

### Portal Metrics
- `http_requests_total{job="portal"}` - HTTP request counter
- `http_request_duration_seconds` - Request latency histogram
- `nodejs_heap_size_used_bytes` - Node.js heap usage
- `nodejs_eventloop_lag_seconds` - Event loop lag

### CRM Backend Metrics
- `crm_contact_created_total` - Contacts created
- `crm_api_requests_total` - API requests by endpoint
- `shadowboard_analysis_total` - Shadow Board analyses
- `shadowboard_analysis_duration_seconds` - Analysis duration
- `shadowboard_strategic_fit_score` - Strategic fit score (0-100)
- `redis_queue_depth` - Redis event queue depth
- `immudb_writes_total` - ImmuDB write operations

### Voice Pipeline Metrics
- `tts_synthesis_duration_seconds` - TTS synthesis latency
- `tts_requests_total` - TTS requests
- `duplex_rtt_seconds` - Duplex round-trip time
- `duplex_active_sessions` - Active voice sessions

### WireGuard Metrics
- `probe_success` - ICMP probe success (0/1)
- `probe_duration_seconds` - ICMP RTT in seconds

## Security

### Port Binding
All services bind to `127.0.0.1` only:
- ✅ Grafana: 127.0.0.1:3001 (SSH tunnel required)
- ✅ Prometheus: 127.0.0.1:9090 (local only)
- ✅ Blackbox: 127.0.0.1:9115 (local only)

### No Public Exposure
```bash
# Verify no public binding
ss -tlnp | grep -E ':(3001|9090|9115)'
# Should show 127.0.0.1 only
```

### Change Grafana Password

```bash
# Stop Grafana
docker compose -f docker-compose.observability.yml stop grafana

# Reset password via CLI
docker compose -f docker-compose.observability.yml run --rm grafana grafana-cli admin reset-admin-password 'NEW_PASSWORD'

# Restart
docker compose -f docker-compose.observability.yml start grafana
```

## Maintenance

### Disk Space Management

Prometheus data retention is 30 days. Estimate ~10GB for full retention.

```bash
# Check current usage
docker exec sovren-prometheus du -sh /prometheus

# Clean old data (dangerous - will lose metrics!)
docker compose -f docker-compose.observability.yml down
docker volume rm sovren_prometheus_data
docker compose -f docker-compose.observability.yml up -d
```

### Backup Configuration

```bash
# Backup all configs
tar -czf observability-backup-$(date +%Y%m%d).tar.gz \
  /opt/sovren-portal/observability/{prometheus,grafana,blackbox,docker-compose.observability.yml,README.md}

# Restore
tar -xzf observability-backup-YYYYMMDD.tar.gz -C /
```

### Upgrade Components

```bash
# Edit docker-compose.observability.yml
# Update image tags:
#   prometheus: prom/prometheus:v2.48.0 -> v2.XX.0
#   grafana: grafana/grafana:10.2.2 -> 10.X.X

# Pull new images
docker compose -f docker-compose.observability.yml pull

# Recreate containers
docker compose -f docker-compose.observability.yml up -d
```

## Support

### Logs Location
- Prometheus: `docker logs sovren-prometheus`
- Grafana: `docker logs sovren-grafana`
- Blackbox: `docker logs sovren-blackbox`

### Configuration Files
- Prometheus: `/opt/sovren-portal/observability/prometheus/prometheus.yml`
- Alerts: `/opt/sovren-portal/observability/prometheus/alerts.yml`
- Grafana Datasource: `/opt/sovren-portal/observability/grafana/provisioning/datasources/`
- Grafana Dashboards: `/opt/sovren-portal/observability/grafana/dashboards/`

### Useful Commands

```bash
# Query Prometheus API
curl -s 'http://127.0.0.1:9090/api/v1/query?query=up'

# List all metrics
curl -s http://127.0.0.1:9090/api/v1/label/__name__/values | jq .

# Check Prometheus config
curl -s http://127.0.0.1:9090/api/v1/status/config | jq .

# Reload Prometheus (graceful)
curl -X POST http://127.0.0.1:9090/-/reload
```

---

**Production Deployment**: ✅ Complete
**Security**: ✅ Localhost-only binding
**Data Persistence**: ✅ Named volumes
**Auto-Provisioning**: ✅ Datasources + Dashboards
**Real Metrics**: ✅ No mocks
**WireGuard Integration**: ✅ Full cluster coverage
