# IntelliRCA Backend

IntelliRCA is an **Event-Driven AIOps Platform** designed to automatically ingest, normalize, and correlate system alerts, ultimately using a Multi-Agent AI system to generate detailed Root Cause Analysis (RCA) reports.

## 🏗️ Tech Stack
* **Microservices Framework**: FastAPI (Python 3.11)
* **Event Streaming & Message Broker**: Apache Kafka (KRaft Mode) & `aiokafka`
* **Vector Database (Semantic Search)**: Qdrant
* **Graph Database (Topology)**: Neo4j
* **AI Orchestration**: LangGraph & LangChain
* **LLM Provider**: Groq (LLaMA3-70b)
* **Containerization**: Docker & Docker Compose

## 🚀 Architecture Overview
The backend is divided into 11 specialized microservices working together in a highly decoupled, event-driven pipeline:

1. **Ingestion API** (`api`): Receives raw alerts (e.g., from Prometheus) and publishes them to the `alerts.raw` Kafka topic.
2. **Normalization Worker**: Consumes raw alerts, standardizes their schema, and publishes to `alerts.normalized`.
3. **Semantic Worker**: Embeds normalized alerts into vector embeddings and stores them in Qdrant for similarity search.
4. **Correlation Worker**: Analyzes new alerts against active incidents. If related, groups them; otherwise, creates a new incident in `incidents.active`.
5. **Knowledge Graph Worker**: Enriches active incidents with infrastructure topology data mapped in Neo4j.
6. **RCA Engine** (`rca_api` & `rca_worker`): A LangGraph state-machine that utilizes specialized agents (Coordinator, Graph Analyzer, Topology Analyzer, Business Impact Analyzer, Remediation Agent) to investigate the incident and generate a final Root Cause Analysis report.

## 🛠️ Recent Stabilization Fixes
To ensure production-grade reliability, the following infrastructure improvements were successfully implemented:
* **Kafka KRaft Stability**: Resolved `[Errno 111] Connection refused` by properly configuring `KAFKA_ADVERTISED_LISTENERS` for internal Docker DNS resolution (`kafka:9092`).
* **Resilient Startup Sequences**: Added `restart: unless-stopped` to all microservices, allowing them to automatically recover and reconnect if they boot faster than the Kafka broker.
* **Silent Failure Prevention**: Modified the `AIOKafkaProducer` implementation to intentionally raise connection exceptions on startup, allowing Docker's restart policies to effectively manage the container lifecycle.
* **LangGraph State Collision**: Resolved a LangGraph `ValueError` by differentiating the state dictionary channel (`business_impact`) from the node name (`business_impact_analyzer`).
* **Dependency Conflicts**: Upgraded `aiokafka` and pinned `huggingface-hub` to prevent segmentation faults and import errors in Python 3.11.

## 🏃‍♂️ Running Locally
1. Ensure Docker Desktop is running.
2. Add your Groq API key to the `.env` file.
3. Start the entire ecosystem:
   ```bash
   docker-compose up -d
   ```
4. Check the status of all 15 containers:
   ```bash
   docker-compose ps
   ```

## 🧪 Testing the Pipeline
You can simulate a Prometheus alert entering the system by sending a POST request to the Ingestion API:
```bash
curl -X POST http://localhost:8000/api/v1/alerts/ingest \
-H "Content-Type: application/json" \
-d '{
    "source": "prometheus",
    "alert_id": "sim-cpu-001",
    "title": "High CPU Usage",
    "description": "CPU utilization exceeded 95%",
    "severity": "critical",
    "timestamp": "2026-07-15T12:00:00Z"
}'
```
