// IntelliRCA API Service Client
// Exposes functions connecting to the backend services with high-fidelity local mock data fallback for demonstration.

export interface Alert {
  id: string;
  title: string;
  description: string;
  source: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  service: string;
  host: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning';
  status: 'active' | 'resolved';
  createdAt: string;
  affectedServices: string[];
  alerts: Alert[];
}

export interface GraphNode {
  id: string;
  type: string;
  label: string;
  status?: 'critical' | 'warning' | 'healthy';
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
}

export interface IncidentSubgraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface RcaReport {
  incident_id: string;
  root_cause: string;
  confidence_score: number;
  recommended_remediation: string;
  business_impact: string;
  agent_steps: {
    agent: string;
    message: string;
    status: 'pending' | 'running' | 'completed';
    timestamp: string;
  }[];
  markdown_report: string;
}

// ----------------------------------------------------
// Mock Data Store (Highly detailed SRE scenarios)
// ----------------------------------------------------

const mockIncidents: Incident[] = [
  {
    id: "INC-2026-001",
    title: "Checkout Service Cascade Failure",
    description: "Cascading database connection timeouts causing HTTP 500 on payments endpoint.",
    severity: "critical",
    status: "active",
    createdAt: "2026-07-17T02:30:00Z",
    affectedServices: ["checkout-service", "payment-service", "postgres-db"],
    alerts: [
      {
        id: "alert-101",
        title: "High HTTP 5xx Error Rate",
        description: "checkout-service error rate exceeded 15% on path /api/v1/checkout",
        source: "Prometheus",
        severity: "critical",
        timestamp: "2026-07-17T02:32:00Z",
        service: "checkout-service",
        host: "k8s-node-checkout-prod"
      },
      {
        id: "alert-102",
        title: "Postgres Connection Pool Exhausted",
        description: "Active connections reached max limit (100) on payment-db-replica",
        source: "CloudWatch",
        severity: "critical",
        timestamp: "2026-07-17T02:30:00Z",
        service: "postgres-db",
        host: "db-primary-aws-rds"
      },
      {
        id: "alert-103",
        title: "Slow DB Queries Detected",
        description: "Long running query on table 'orders' taking > 2500ms",
        source: "OpenTelemetry",
        severity: "warning",
        timestamp: "2026-07-17T02:31:00Z",
        service: "postgres-db",
        host: "db-primary-aws-rds"
      }
    ]
  },
  {
    id: "INC-2026-002",
    title: "Auth Gateway Latency Spike",
    description: "Redis cache memory exhaustion causing auth token validation latency.",
    severity: "warning",
    status: "active",
    createdAt: "2026-07-17T01:15:00Z",
    affectedServices: ["gateway-service", "auth-service", "redis-cache"],
    alerts: [
      {
        id: "alert-201",
        title: "API Gateway High Latency",
        description: "95th percentile response latency exceeded 800ms",
        source: "Grafana",
        severity: "critical",
        timestamp: "2026-07-17T01:16:00Z",
        service: "gateway-service",
        host: "gateway-pod-1"
      },
      {
        id: "alert-202",
        title: "Redis Out Of Memory",
        description: "Memory utilization reached 98% (volatile-lru exhaustion)",
        source: "Prometheus",
        severity: "critical",
        timestamp: "2026-07-17T01:15:00Z",
        service: "redis-cache",
        host: "redis-cluster-node-0"
      }
    ]
  }
];

const mockSubgraphs: Record<string, IncidentSubgraph> = {
  "INC-2026-001": {
    nodes: [
      { id: "gateway-service", type: "Service", label: "Gateway Service", status: "healthy" },
      { id: "checkout-service", type: "Service", label: "Checkout Service", status: "warning" },
      { id: "payment-service", type: "Service", label: "Payment Service", status: "critical" },
      { id: "postgres-db", type: "Database", label: "Postgres DB", status: "critical" }
    ],
    edges: [
      { id: "e1", source: "gateway-service", target: "checkout-service", label: "Routes to" },
      { id: "e2", source: "checkout-service", target: "payment-service", label: "Calls" },
      { id: "e3", source: "payment-service", target: "postgres-db", label: "Queries" }
    ]
  },
  "INC-2026-002": {
    nodes: [
      { id: "gateway-service", type: "Service", label: "Gateway Service", status: "critical" },
      { id: "auth-service", type: "Service", label: "Auth Service", status: "warning" },
      { id: "redis-cache", type: "Database", label: "Redis Cache", status: "critical" }
    ],
    edges: [
      { id: "e4", source: "gateway-service", target: "auth-service", label: "Validates with" },
      { id: "e5", source: "auth-service", target: "redis-cache", label: "Reads/Writes" }
    ]
  }
};

const mockRcaReports: Record<string, RcaReport> = {
  "INC-2026-001": {
    incident_id: "INC-2026-001",
    root_cause: "Postgres Connection Pool Exhaustion on payment db due to lock contention.",
    confidence_score: 0.94,
    recommended_remediation: "Restart connection pools, run VACUUM ANALYZE on checkout/payment tables, and scale payment replica nodes.",
    business_impact: "Checkout checkouts failing. Immediate estimated loss: $14,200/hr.",
    agent_steps: [
      { agent: "Coordinator Agent", message: "Dispatched Graph and Topology analyzers.", status: "completed", timestamp: "02:32:05" },
      { agent: "Graph Analyzer", message: "Detected critical loop payment-service -> postgres-db.", status: "completed", timestamp: "02:32:12" },
      { agent: "Topology Analyzer", message: "Identified shared DB instance bottleneck on aws-rds.", status: "completed", timestamp: "02:32:18" },
      { agent: "Business Impact Agent", message: "Queried stripe API checkouts drop; loss rate computed.", status: "completed", timestamp: "02:32:25" },
      { agent: "Remediation Agent", message: "Retrieved similar playbook: DB-CONN-EXHAUSTION.", status: "completed", timestamp: "02:32:30" }
    ],
    markdown_report: `# Root Cause Analysis Report

## 🔍 Executive Summary
A cascading failure started at **02:30:00Z** when the payment database connection pool was exhausted. This caused the checkout service to run out of threads, ultimately breaking customer transactions at the API Gateway level.

---

## 🛠️ Causal Root Cause
- **Direct Cause**: Database Connection Pool Exhaustion on \`db-primary-aws-rds\`.
- **Underlying Cause**: Database table lock contention due to a long-running unindexed query on table \`orders\` initiated by an SRE query run at 02:29Z.

---

## 📊 Business Impact Analysis
- **Core Impact**: Users unable to process payments.
- **Estimated Revenue Impact**: **$14,200 / hour** based on normal payment throughput trends.
- **Affected Customers**: Approx. 340 checkout attempts rejected.

---

## 🔧 Actionable Remediation Plan
1. **Immediate (Mitigation)**:
   - Terminate connection ID \`41203\` executing the slow transaction.
   - Restart the \`payment-service\` connection pool container to clean deadlocks.
2. **Short-Term (Prevention)**:
   - Create missing index on \`orders(created_at, user_id)\`.
   - Implement query timeout limits of \`10s\` for all transactional client databases.
`
  },
  "INC-2026-002": {
    incident_id: "INC-2026-002",
    root_cause: "Redis Out of Memory (OOM) error crashing token caching store.",
    confidence_score: 0.88,
    recommended_remediation: "Scale memory limit on Redis instance, verify eviction policy is set to volatile-lru, and clear session cache.",
    business_impact: "Gateway latency increases by 650ms. SSO log-ins take up to 4 attempts.",
    agent_steps: [
      { agent: "Coordinator Agent", message: "Analysis initialized for auth latency.", status: "completed", timestamp: "01:17:02" },
      { agent: "Graph Analyzer", message: "Linked token verification failure to Redis node memory.", status: "completed", timestamp: "01:17:15" },
      { agent: "Remediation Agent", message: "Proposed cache flush script.", status: "completed", timestamp: "01:17:28" }
    ],
    markdown_report: `# Root Cause Analysis Report

## 🔍 Executive Summary
Auth latency spiked to **800ms** due to Redis cache reaching memory saturation. The Auth Gateway had to fall back to direct database lookups for OAuth validation, overloading the backing store.

---

## 🛠️ Causal Root Cause
- **Direct Cause**: Redis server OOM crashing.
- **Underlying Cause**: Redis eviction policy was misconfigured to \`noeviction\`, preventing old expired sessions from being deleted when the allocation hit 100%.

---

## 🔧 Actionable Remediation Plan
1. Set eviction policy to \`allkeys-lru\` in Redis configs.
2. Flush temporary session keys via \`redis-cli flushall\`.
`
  }
};

// ----------------------------------------------------
// API Client Functions (Easily swapped with fetch calls)
// ----------------------------------------------------

const BASE_URLS = {
  ingest: "http://localhost:8000/api/v1",
  kg: "http://localhost:8084/api/v1",
  rca: "http://localhost:8085/api/v1",
  memory: "http://localhost:8087/api/v1"
};

// Ingest raw alert
export async function ingestAlert(alert: Omit<Alert, 'id' | 'timestamp'>): Promise<any> {
  const payload = {
    ...alert,
    alert_id: `sim-${Date.now()}`,
    timestamp: new Date().toISOString()
  };
  try {
    const response = await fetch(`${BASE_URLS.ingest}/alerts/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await response.json();
  } catch (error) {
    console.warn("API Ingestion unavailable, returning mock success.", error);
    return { status: "accepted", alert_id: payload.alert_id };
  }
}

// Get incidents
export async function getIncidents(): Promise<Incident[]> {
  // Can expand to query a backend database if incident aggregator endpoint gets added.
  return Promise.resolve(mockIncidents);
}

// Get topological subgraph from Neo4j
export async function getIncidentSubgraph(incidentId: string): Promise<IncidentSubgraph> {
  try {
    const response = await fetch(`${BASE_URLS.kg}/graph/incident/${incidentId}?depth=2`);
    const data = await response.json();
    return data.subgraph;
  } catch (error) {
    console.warn("KG API unavailable, returning mock topology.", error);
    return mockSubgraphs[incidentId] || { nodes: [], edges: [] };
  }
}

// Run Multi-Agent RCA Workflow
export async function analyzeIncident(incidentId: string, rawIncidentData: any): Promise<RcaReport> {
  try {
    const response = await fetch(`${BASE_URLS.rca}/rca/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incident_id: incidentId, raw_incident_data: rawIncidentData })
    });
    const data = await response.json();
    return {
      incident_id: incidentId,
      root_cause: data.rca_report?.root_cause || "Calculated Root Cause",
      confidence_score: data.rca_report?.confidence_score || 0.9,
      recommended_remediation: data.rca_report?.recommended_remediation || "",
      business_impact: data.rca_report?.business_impact || "",
      agent_steps: mockRcaReports[incidentId]?.agent_steps || [],
      markdown_report: data.rca_report?.markdown_report || data.rca_report || ""
    };
  } catch (error) {
    console.warn("RCA API unavailable, returning mock report.", error);
    // Simulate short network delay for loading state SRE feels
    await new Promise(resolve => setTimeout(resolve, 1500));
    return mockRcaReports[incidentId];
  }
}

// Submit feedback to memory vector database (Module 2.11)
export async function submitFeedback(feedback: {
  incident_id: string;
  corrected_root_cause: string;
  corrected_remediation: string;
  severity: string;
  affected_services: string[];
}): Promise<any> {
  try {
    const response = await fetch(`${BASE_URLS.memory}/memory/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedback)
    });
    return await response.json();
  } catch (error) {
    console.warn("Memory API unavailable, mocking feedback success.", error);
    return { status: "success", message: "Memory version incremented." };
  }
}
