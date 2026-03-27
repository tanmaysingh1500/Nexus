# Nexus

Nexus is an AI-assisted on-call command center for incident detection, triage, and remediation.

It combines real-time incident operations with guided automation so teams can resolve production issues faster and with better visibility.

## Highlights

- Incident lifecycle management: triggered, acknowledged, resolved
- AI-assisted analysis and remediation recommendations
- Approval/plan/autonomous execution modes
- PagerDuty webhook ingestion
- Kubernetes-aware operational workflows
- Dashboard metrics and activity timeline

## Architecture

- Frontend: Next.js + TypeScript
- Backend: FastAPI + Python
- Data: PostgreSQL
- Integrations: PagerDuty, Kubernetes MCP, extensible connectors

## Repository Structure

```text
Nexus/
  backend/      API services, agent logic, integrations
  frontend/     Dashboard UI and frontend API routes
  docs/         Deployment and integration documentation
  k8s/          Kubernetes deployment manifests
  monitoring/   Prometheus/Grafana alerting configuration
  tests/        Integration and scenario tests
```

## Quick Start

### Backend

```bash
cd backend
pip install uv
uv sync
uv run python api_server.py
```

Backend default: http://localhost:8001

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend default: http://localhost:3000

## Environment

1. Copy sample env files where applicable.
2. Set your API keys and integration secrets.
3. Keep secrets out of git.

Use [`.env.example`](.env.example) as a starting point for root-level deployment configuration.

## Deployment Options

- Docker Compose: [`docker-compose.yml`](docker-compose.yml)
- Monitoring stack overlay: [`docker-compose.monitoring.yml`](docker-compose.monitoring.yml)
- Kubernetes manifests: [`k8s/`](k8s/)

Detailed guides are available in [`docs/`](docs/).

## Suggested Demo Flow

1. Open dashboard and inspect active incidents.
2. Trigger a test incident.
3. Review AI analysis and recommended actions.
4. Acknowledge and resolve the incident.

## Security Notes

- Never commit real credentials or webhook secrets.
- Use environment-specific secrets management for staging/production.
- Review integration permissions before enabling autonomous actions.

## License

Choose and add your preferred license (for example, MIT) before publishing.
