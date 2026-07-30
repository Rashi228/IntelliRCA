import { Link } from 'react-router-dom';
import { 
  Network, Database, Bot, Activity, ArrowRight, 
  ShieldAlert, Zap, Layers,
  Cpu, Terminal, Send
} from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 text-slate-700 font-sans antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-blue-600 py-4 shadow-md border-b border-blue-700">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-white font-sans">IntelliRCA</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#pipeline" className="text-xs text-blue-100 hover:text-white transition-colors font-bold uppercase tracking-wider">PIPELINE</a>
            <a href="#features" className="text-xs text-blue-100 hover:text-white transition-colors font-bold uppercase tracking-wider">FEATURES</a>
            <Link to="/login" className="text-xs text-blue-100 hover:text-white transition-colors font-bold uppercase tracking-wider">SIGN IN</Link>
            <Link to="/signup" className="bg-white text-blue-600 hover:bg-blue-50 transition-all rounded-xl font-bold shadow-sm px-5 py-2.5 text-xs flex items-center">
              GET STARTED <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-36 pb-20 px-6 max-w-7xl mx-auto border-b border-blue-200/80 text-left">
        <div className="max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white text-xs font-bold border border-blue-700 rounded-full shadow-sm">
            <Zap className="w-3.5 h-3.5 text-yellow-300" /> DEPLOYING AGENTIC SRE OPERATIONS
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-blue-950 tracking-tight leading-tight font-sans">
            Autonomous Root Cause Discovery <br />
            for <span className="text-blue-600">Distributed Microservices</span>
          </h1>
          <p className="text-base text-slate-600 max-w-3xl leading-relaxed font-medium">
            IntelliRCA ingests system logs, Prometheus metrics, and infrastructure topologies to isolate silent failures and generate actionable remediation playbooks using LangGraph Multi-Agent consensus.
          </p>
          <div className="flex flex-col sm:flex-row items-start gap-4 pt-4">
            <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all text-sm flex items-center gap-2">
              START OPERATIONS CENTER <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#pipeline" className="bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 font-bold px-8 py-4 rounded-xl shadow-sm transition-all text-sm">
              VIEW PIPELINE BLUEPRINT
            </a>
          </div>
        </div>
      </header>

      {/* Technical Flowchart Section */}
      <section id="pipeline" className="py-20 bg-white/80 backdrop-blur-md border-b border-blue-100 text-left">
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-4 mb-12">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">SYSTEM ARCHITECTURE Blueprint</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-blue-950 font-sans tracking-tight">The 8-Stage Autonomous Pipeline</h2>
            <p className="text-sm text-slate-600 max-w-3xl font-medium">
              How raw telemetry is ingested, correlated, mapped, and solved top-to-bottom within milliseconds.
            </p>
          </div>

          {/* Flowchart Grid (Top to Bottom sequence) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 relative">
            
            {/* Box 1 */}
            <div className="bg-white border border-blue-200/80 shadow-lg shadow-blue-500/5 rounded-2xl hover:border-blue-400 hover:shadow-xl transition-all p-6 flex flex-col justify-between h-48 relative group">
              <div>
                <div className="text-[11px] font-bold text-blue-600 mb-2">STAGE 01</div>
                <h4 className="text-base font-bold text-blue-950 mb-2 flex items-center gap-2">
                  <ShieldAlert className="w-4.5 h-4.5 text-red-500" /> Alert Ingestion
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Ingests Webhook events from Prometheus, Kubernetes events, Grafana alerts, and OpenTelemetry logs.
                </p>
              </div>
              <div className="text-[10px] text-blue-700 font-bold uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-lg w-fit border border-blue-100">Kafka Stream Ingest</div>
            </div>

            {/* Box 2 */}
            <div className="bg-white border border-blue-200/80 shadow-lg shadow-blue-500/5 rounded-2xl hover:border-blue-400 hover:shadow-xl transition-all p-6 flex flex-col justify-between h-48 relative group">
              <div>
                <div className="text-[11px] font-bold text-blue-600 mb-2">STAGE 02</div>
                <h4 className="text-base font-bold text-blue-950 mb-2 flex items-center gap-2">
                  <Cpu className="w-4.5 h-4.5 text-blue-600" /> Normalization
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Drain3 parsing clusters raw log patterns to standardize inputs into a canonical event-schema payload.
                </p>
              </div>
              <div className="text-[10px] text-blue-700 font-bold uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-lg w-fit border border-blue-100">AIOKafka Normalizer</div>
            </div>

            {/* Box 3 */}
            <div className="bg-white border border-blue-200/80 shadow-lg shadow-blue-500/5 rounded-2xl hover:border-blue-400 hover:shadow-xl transition-all p-6 flex flex-col justify-between h-48 relative group">
              <div>
                <div className="text-[11px] font-bold text-blue-600 mb-2">STAGE 03</div>
                <h4 className="text-base font-bold text-blue-950 mb-2 flex items-center gap-2">
                  <Layers className="w-4.5 h-4.5 text-blue-600" /> Semantic Search
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  BGE/E5 embedding model creates vector embeddings of normalized events, storing them into the Qdrant DB.
                </p>
              </div>
              <div className="text-[10px] text-blue-700 font-bold uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-lg w-fit border border-blue-100">Qdrant Vector Database</div>
            </div>

            {/* Box 4 */}
            <div className="bg-white border border-blue-200/80 shadow-lg shadow-blue-500/5 rounded-2xl hover:border-blue-400 hover:shadow-xl transition-all p-6 flex flex-col justify-between h-48 relative group">
              <div>
                <div className="text-[11px] font-bold text-blue-600 mb-2">STAGE 04</div>
                <h4 className="text-base font-bold text-blue-950 mb-2 flex items-center gap-2">
                  <Network className="w-4.5 h-4.5 text-blue-600" /> Hybrid Correlation
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Aggregates noisy alerts into clean incidents using temporal proximity combined with HDBSCAN density clustering.
                </p>
              </div>
              <div className="text-[10px] text-blue-700 font-bold uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-lg w-fit border border-blue-100">HDBSCAN Correlation</div>
            </div>

            {/* Box 5 */}
            <div className="bg-white border border-blue-200/80 shadow-lg shadow-blue-500/5 rounded-2xl hover:border-blue-400 hover:shadow-xl transition-all p-6 flex flex-col justify-between h-48 relative group">
              <div>
                <div className="text-[11px] font-bold text-blue-600 mb-2">STAGE 05</div>
                <h4 className="text-base font-bold text-blue-950 mb-2 flex items-center gap-2">
                  <Database className="w-4.5 h-4.5 text-blue-600" /> Knowledge Graph
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Fills active incidents with live structural relationship models mapping hosts and microservice dependencies.
                </p>
              </div>
              <div className="text-[10px] text-blue-700 font-bold uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-lg w-fit border border-blue-100">Neo4j Dependency Graph</div>
            </div>

            {/* Box 6 */}
            <div className="bg-white border border-blue-200/80 shadow-lg shadow-blue-500/5 rounded-2xl hover:border-blue-400 hover:shadow-xl transition-all p-6 flex flex-col justify-between h-48 relative group">
              <div>
                <div className="text-[11px] font-bold text-blue-600 mb-2">STAGE 06</div>
                <h4 className="text-base font-bold text-blue-950 mb-2 flex items-center gap-2">
                  <Bot className="w-4.5 h-4.5 text-blue-600" /> Multi-Agent RCA
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  LangGraph agents (Graph Analyzer, Topology Inspector, Impact Evaluator) run asynchronous consensus.
                </p>
              </div>
              <div className="text-[10px] text-blue-700 font-bold uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-lg w-fit border border-blue-100">LangGraph Coordinator</div>
            </div>

            {/* Box 7 */}
            <div className="bg-white border border-blue-200/80 shadow-lg shadow-blue-500/5 rounded-2xl hover:border-blue-400 hover:shadow-xl transition-all p-6 flex flex-col justify-between h-48 relative group">
              <div>
                <div className="text-[11px] font-bold text-blue-600 mb-2">STAGE 07</div>
                <h4 className="text-base font-bold text-blue-950 mb-2 flex items-center gap-2">
                  <Terminal className="w-4.5 h-4.5 text-blue-600" /> Remediation Plan
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Assembles verified playbook files and step-by-step mitigation commands, estimating MTTA / MTTR targets.
                </p>
              </div>
              <div className="text-[10px] text-blue-700 font-bold uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-lg w-fit border border-blue-100">Actionable Playbooks</div>
            </div>

            {/* Box 8 */}
            <div className="bg-white border border-blue-200/80 shadow-lg shadow-blue-500/5 rounded-2xl hover:border-blue-400 hover:shadow-xl transition-all p-6 flex flex-col justify-between h-48 relative group">
              <div>
                <div className="text-[11px] font-bold text-blue-600 mb-2">STAGE 08</div>
                <h4 className="text-base font-bold text-blue-950 mb-2 flex items-center gap-2">
                  <Send className="w-4.5 h-4.5 text-blue-600" /> Feedback Loop
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  SREs review findings and input modifications directly into the memory vector system to retrain agent reasoning.
                </p>
              </div>
              <div className="text-[10px] text-blue-700 font-bold uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-lg w-fit border border-blue-100">Continuous Learning</div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Showcase Section (Dashboard Screenshots) */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-6 text-left">
        <div className="space-y-4 mb-16">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">PRODUCT CAPABILITIES</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-blue-950 font-sans tracking-tight">The Developer-Friendly Control Plane</h2>
          <p className="text-sm text-slate-600 max-w-3xl font-medium">
            Real screenshots of the operational SRE cockpit. Explore the actual layout utilized by teams to resolve microservice failure cascades.
          </p>
        </div>

        {/* Feature Grid (Image + Description blocks) */}
        <div className="space-y-20">
          
          {/* Feature 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 bg-white border border-blue-200/80 p-3 rounded-3xl shadow-xl shadow-blue-500/10">
              <img 
                src="/Active Incident Knowlwdge Graph.png" 
                alt="Active Incident Knowledge Graph Visualizer" 
                className="w-full h-auto border border-blue-100 rounded-2xl object-cover" 
              />
            </div>
            <div className="lg:col-span-5 space-y-4">
              <div className="w-8 h-8 bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center justify-center shadow-sm">01</div>
              <h3 className="text-xl font-bold text-blue-950 font-sans tracking-tight">Active Topology Dependency Mapping</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Connects directly to your Neo4j infrastructure to reconstruct the live dependency topology paths during failure cascades. Critical/Warning/Healthy statuses are visualised with instant indicator rings (e.g. Gateway Service → Checkout Service → Payment Service).
              </p>
              <div className="bg-blue-50/80 p-4 border border-blue-200 text-[11px] text-slate-700 font-mono rounded-xl">
                <span className="font-bold text-blue-950">Module 2.5 Dynamic Graph:</span> Querying dependencies at depth=2 in Neo4j database to identify bottlenecks.
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1 space-y-4">
              <div className="w-8 h-8 bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center justify-center shadow-sm">02</div>
              <h3 className="text-xl font-bold text-blue-950 font-sans tracking-tight">Alert Sequence Replay & JSON Inspector</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Aggregates downstream telemetry streams chronologically. SREs can inspect individual events, track precise timestamps, hostnames, and expand nested metadata payloads to view raw JSON telemetry.
              </p>
              <div className="bg-blue-50/80 p-4 border border-blue-200 text-[11px] text-slate-700 font-mono rounded-xl">
                <span className="font-bold text-blue-950">Module 2.12 Logs Timeline:</span> Trace raw Prometheus alert JSON payloads directly on the control page.
              </div>
            </div>
            <div className="lg:col-span-7 order-1 lg:order-2 bg-white border border-blue-200/80 p-3 rounded-3xl shadow-xl shadow-blue-500/10">
              <img 
                src="/Alert Sequence Reply.png" 
                alt="Alert Sequence Replay Console" 
                className="w-full h-auto border border-blue-100 rounded-2xl object-cover" 
              />
            </div>
          </div>

          {/* Workflow Diagram 1 (Feature 3 Replacement) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 bg-white border border-blue-200/80 p-3 rounded-3xl shadow-xl shadow-blue-500/10">
              <img 
                src="/workflow-2.png" 
                alt="Agentic Industrial Intelligence Platform Workflow" 
                className="w-full h-auto border border-blue-100 rounded-2xl object-cover" 
              />
            </div>
            <div className="lg:col-span-5 space-y-4">
              <div className="w-8 h-8 bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center justify-center shadow-sm">03</div>
              <h3 className="text-xl font-bold text-blue-950 font-sans tracking-tight">Agentic Industrial Intelligence Platform</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Our 5-stage autonomous incident resolution pipeline, integrating multi-source alert collection, HDBSCAN clustering, and LangGraph-powered Root Cause Intelligence.
              </p>
            </div>
          </div>

          {/* Workflow Diagram 2 (Feature 4 Replacement) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1 space-y-4">
              <div className="w-8 h-8 bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center justify-center shadow-sm">04</div>
              <h3 className="text-xl font-bold text-blue-950 font-sans tracking-tight">End-to-End Orchestration & Retrieval</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                A complete breakdown of our data flow, from raw telemetry ingestion and structure-aware chunking, to Qdrant/Neo4j hybrid retrieval and Multi-Agent verification.
              </p>
            </div>
            <div className="lg:col-span-7 order-1 lg:order-2 bg-white border border-blue-200/80 p-3 rounded-3xl shadow-xl shadow-blue-500/10">
              <img 
                src="/workflow-1.png" 
                alt="End-to-End Workflow Pipeline" 
                className="w-full h-auto border border-blue-100 rounded-2xl object-cover" 
              />
            </div>
          </div>

        </div>
      </section>

      {/* Tech Stack Spec Grid */}
      <section className="py-20 bg-white/80 backdrop-blur-md border-t border-b border-blue-100 text-left">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-blue-950 font-sans tracking-tight">Decoupled Microservice Technology Stack</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Decouples telemetry ingestion and vector/graph processing logic using CQRS patterns, preventing database read lockups during high alert volumes.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-blue-200 p-4 rounded-xl shadow-sm">
                  <div className="text-xs font-bold text-blue-950">Apache Kafka</div>
                  <div className="text-[10px] text-slate-500 mt-1 font-medium">KRaft event distribution broker</div>
                </div>
                <div className="bg-white border border-blue-200 p-4 rounded-xl shadow-sm">
                  <div className="text-xs font-bold text-blue-950">FastAPI (Python)</div>
                  <div className="text-[10px] text-slate-500 mt-1 font-medium">Non-blocking async web interfaces</div>
                </div>
                <div className="bg-white border border-blue-200 p-4 rounded-xl shadow-sm">
                  <div className="text-xs font-bold text-blue-950">Qdrant Vector</div>
                  <div className="text-[10px] text-slate-500 mt-1 font-medium">Semantic search vector indexing</div>
                </div>
                <div className="bg-white border border-blue-200 p-4 rounded-xl shadow-sm">
                  <div className="text-xs font-bold text-blue-950">Neo4j Database</div>
                  <div className="text-[10px] text-slate-500 mt-1 font-medium">Infrastructure topology relationships</div>
                </div>
              </div>
            </div>

            <div className="border border-blue-200 bg-white p-6 rounded-2xl shadow-lg shadow-blue-500/5 font-mono text-[11px] text-slate-600 space-y-4">
              <div className="font-bold text-blue-950">System Design Configuration Parameters</div>
              <div className="bg-blue-50/70 p-4 border border-blue-100 rounded-xl space-y-1.5 text-blue-900 font-semibold">
                <div>KAFKA_BOOTSTRAP_SERVERS: kafka:9092</div>
                <div>NEO4J_URI: bolt://neo4j:7687</div>
                <div>QDRANT_HOST: qdrant</div>
                <div>EMBEDDING_MODEL: BGE-small</div>
                <div>AI_PROVIDER: Groq (LLaMA3-70b)</div>
              </div>
              <p className="text-[10px] font-medium text-slate-500">
                Preserves event stream logs to allow complete historical debugging, timeline replay, and sandbox testing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="border-t border-blue-700 bg-blue-600 py-16 text-left text-white">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-xl font-bold text-white font-sans">IntelliRCA</span>
              </div>
              <p className="text-xs text-blue-100 max-w-sm font-medium">
                Next-generation automated incident intelligence and root cause discovery powered by agentic AI and graph architectures.
              </p>
            </div>
            <div className="flex gap-4">
              <Link to="/signup" className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-8 rounded-xl shadow-md text-xs transition-all">
                START FREE TRIAL
              </Link>
            </div>
          </div>
          
          <div className="pt-8 border-t border-blue-500 text-xs text-blue-100 flex flex-col md:flex-row justify-between items-center gap-4 font-medium">
            <p>© 2026 IntelliRCA Inc. All rights reserved.</p>
            <div className="flex gap-6 font-bold">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
