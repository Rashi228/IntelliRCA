# IntelliRCA - Agentic Industrial Intelligence

IntelliRCA is a proactive, multi-agent AI incident investigation platform designed for Site Reliability Engineering (SRE) teams. Instead of simply answering questions like a standard chatbot, IntelliRCA deploys a swarm of autonomous AI agents that act immediately when an infrastructure alert fires. 

By autonomously traversing causal topology, retrieving historical resolution memories, and analyzing logs, IntelliRCA identifies the root cause of production incidents in seconds, drastically reducing Mean Time to Identify (MTTI) and preventing massive business impact.

---

## 🚀 The Core Problem & Our Solution
**The Problem:** In modern microservice architectures, a single database failure can trigger a cascade of hundreds of alerts across dozens of services. SREs waste hours manually correlating logs, checking metrics, and looking for historical runbooks.
**The Solution:** IntelliRCA acts as an "AI Colleague". The moment a latency spike or CPU alert occurs, IntelliRCA spins up specialized LangGraph agents to investigate the alert, trace the blast radius, read the logs, and provide a verified Root Cause Analysis (RCA) report *before* the SRE even opens their laptop.

---

## 💻 Tech Stack & Architecture

### Frontend (User Interface)
- **React 18 & Vite:** Chosen for blazing-fast HMR and optimized production builds.
- **TypeScript:** Ensures strict typing and prevents runtime errors across complex AI streaming payloads.
- **Tailwind CSS:** Used for a highly customized, glassmorphic "Light Blue" enterprise aesthetic.
- **react-force-graph-2d (Canvas + D3):** Used for the massive **Semantic Cluster Map** to render physics-based node clustering smoothly.
- **React Flow:** Used for the **Causal Flow Diagram** to render strict, deterministic architectural topology.

### Backend & AI Orchestration (Conceptualized for Production)
- **Supabase:** Provides secure JWT-based Authentication, Row Level Security (RLS), and PostgreSQL data storage.
- **LangChain / LangGraph:** Orchestrates the multi-agent workflow (Coordinator, Topology Analyzer, Memory Agent, Consensus Validator).
- **WebSockets:** Streams the autonomous agent reasoning and graph updates in real-time to the frontend.

---

## 🔑 Role-Based Access Control (RBAC)

The platform implements a strict dual-role system:

1. **Admin (Engineering Manager / System Admin)**
   - Full access to all dashboard features.
   - Can view the entire Semantic Vector Space and Causal Topology.
   - **Exclusive Right:** Can trigger mock Incident Simulations to test the AI pipeline.
   
2. **SRE (Site Reliability Engineer)**
   - Operational access focused on incident resolution.
   - Can view live streaming RCA reports, timeline events, and graph highlights.
   - Cannot trigger artificial simulations (the "Trigger" button is locked). They strictly react to real incoming alerts.

---

## 🌟 Key Features & Dashboard Walkthrough

### 1. Command Center & AI Intelligence
The left-hand panel serves as the primary control surface. 
- **Trigger Simulation:** (Admin only). Simulates a critical infrastructure failure (e.g., `INC-8876`). 
- **AI Intelligence Panel:** Once an incident fires, this panel dynamically populates with the final RCA output:
  - **Confidence Score:** The mathematical certainty of the Root Cause (e.g., 85%).
  - **MTTI:** The estimated time it took the agents to identify the issue (e.g., < 15s).
  - **Business Impact:** Plain-english explanation of what customer-facing features are broken.
  - **Remediation & Root Cause:** The actionable steps the SRE must take to fix the database or service.

### 2. Explainable AI Timeline
AI shouldn't be a black box. The center panel provides a real-time, streaming timeline of the Agent execution.
- As the AI works, you see exactly what the **Topology Agent**, **Memory Analyzer**, and **Consensus Validator** are thinking. 
- It streams the exact internal reasoning, ensuring complete transparency and trust for the SREs.

### 3. Dual-Visualization Knowledge Graph
The right-hand panel features two distinct ways to visualize the AI's understanding of the system, toggleable via the bottom-right floating tab switcher.

#### A. Semantic Cluster (Force-Directed Graph)
A physics-based representation of the AI's vector database. 
- Displays over 100 entities (Microservices, Databases, Alerts, Historical Incidents, and Memory Documents).
- **Dynamic Physics:** When an incident triggers, the AI isolates the blast radius. The graph physically zooms in, dims irrelevant nodes, and highlights the closely correlated entities in a glowing aura.
- **Interactive:** Click on any node to view a sliding details panel explaining its dependencies and semantic relevance.

#### B. Causal Flow (Infrastructure Topology)
A strict, architectural diagram (React Flow) mapping the exact HTTP and TCP connections of the microservices (API Gateway -> Frontend -> Backend -> Database).
- **Blast Radius Tracing:** When an incident triggers, the specific causal chain that failed (e.g., `api-gateway` -> `user-login-api` -> `postgres-cluster`) lights up, immediately showing the SRE the exact physical route of the failure.

---

## ⚙️ How to Run Locally

1. Clone the repository.
2. Navigate to the `frontend` directory: `cd frontend`
3. Install dependencies: `npm install`
4. Run the development server: `npm run dev`
5. Open `http://localhost:5173` in your browser.
6. Sign up for a new account (Requires valid Supabase credentials in the `.env` file).
