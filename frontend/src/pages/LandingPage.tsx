import { Link } from 'react-router-dom';
import { 
  Network, Database, Bot, Activity, ArrowRight, 
  ShieldAlert, Zap, Layers, ServerCog, CheckSquare,
  Cpu, Terminal, BarChart4, History, Send
} from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-300 font-mono antialiased selection:bg-indigo-950">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d111d]/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-none bg-blue-600 flex items-center justify-center shadow-sm">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-sans">IntelliRCA</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#pipeline" className="text-xs text-slate-400 hover:text-slate-200 transition-colors font-semibold">PIPELINE</a>
            <a href="#features" className="text-xs text-slate-400 hover:text-slate-200 transition-colors font-semibold">FEATURES</a>
            <Link to="/login" className="text-xs text-slate-400 hover:text-slate-200 transition-colors font-semibold">SIGN IN</Link>
            <Link to="/signup" className="btn-primary py-1.5 px-4 text-xs font-bold">
              GET STARTED <ArrowRight className="w-3 h-3 ml-1.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-16 px-6 max-w-7xl mx-auto border-b border-slate-800/60 text-left">
        <div className="max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
            <Zap className="w-3.5 h-3.5" /> DEPLOYING AGENTIC SRE OPERATIONS
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight font-sans">
            Autonomous Root Cause Discovery <br />
            for <span className="text-gradient">Distributed Microservices</span>
          </h1>
          <p className="text-base text-slate-400 max-w-3xl leading-relaxed">
            IntelliRCA ingests system logs, Prometheus metrics, and infrastructure topologies to isolate silent failures and generate actionable remediation playbooks using LangGraph Multi-Agent consensus.
          </p>
          <div className="flex flex-col sm:flex-row items-start gap-4 pt-2">
            <Link to="/signup" className="btn-primary text-xs px-6 py-3 font-extrabold">
              START OPERATIONS CENTER
            </Link>
            <a href="#pipeline" className="btn-secondary text-xs px-6 py-3 font-extrabold">
              VIEW PIPELINE BLUEPRINT
            </a>
          </div>
        </div>
      </header>

      {/* Technical Flowchart Section */}
      <section id="pipeline" className="py-20 bg-[#0d111d]/50 border-b border-slate-800/60 text-left">
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-4 mb-12">
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">SYSTEM ARCHITECTURE Blueprint</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white font-sans tracking-tight">The 8-Stage Autonomous Pipeline</h2>
            <p className="text-sm text-slate-400 max-w-3xl">
              How raw telemetry is ingested, correlated, mapped, and solved top-to-bottom within milliseconds.
            </p>
          </div>

          {/* Flowchart Grid (Top to Bottom sequence) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            
            {/* Box 1 */}
            <div className="bg-[#131825] border border-slate-800 p-5 flex flex-col justify-between h-48 relative">
              <div>
                <div className="text-[10px] font-bold text-slate-500 mb-2">STAGE 01</div>
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-500" /> Alert Ingestion
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Ingests Webhook events from Prometheus, Kubernetes events, Grafana alerts, and OpenTelemetry logs.
                </p>
              </div>
              <div className="text-[9px] text-blue-400 font-bold uppercase tracking-wider">Kafka Stream Ingest</div>
            </div>

            {/* Box 2 */}
            <div className="bg-[#131825] border border-slate-800 p-5 flex flex-col justify-between h-48 relative">
              <div>
                <div className="text-[10px] font-bold text-slate-500 mb-2">STAGE 02</div>
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-blue-400" /> Normalization
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Drain3 parsing clusters raw log patterns to standardize inputs into a canonical event-schema payload.
                </p>
              </div>
              <div className="text-[9px] text-blue-400 font-bold uppercase tracking-wider">AIOKafka Normalizer</div>
            </div>

            {/* Box 3 */}
            <div className="bg-[#131825] border border-slate-800 p-5 flex flex-col justify-between h-48 relative">
              <div>
                <div className="text-[10px] font-bold text-slate-500 mb-2">STAGE 03</div>
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-400" /> Semantic Search
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  BGE/E5 embedding model creates vector embeddings of normalized events, storing them into the Qdrant DB.
                </p>
              </div>
              <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Qdrant Vector Database</div>
            </div>

            {/* Box 4 */}
            <div className="bg-[#131825] border border-slate-800 p-5 flex flex-col justify-between h-48 relative">
              <div>
                <div className="text-[10px] font-bold text-slate-500 mb-2">STAGE 04</div>
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
                  <Network className="w-4 h-4 text-amber-400" /> Hybrid Correlation
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Aggregates noisy alerts into clean incidents using temporal proximity combined with HDBSCAN density clustering.
                </p>
              </div>
              <div className="text-[9px] text-amber-400 font-bold uppercase tracking-wider">HDBSCAN Correlation</div>
            </div>

            {/* Box 5 */}
            <div className="bg-[#131825] border border-slate-800 p-5 flex flex-col justify-between h-48 relative">
              <div>
                <div className="text-[10px] font-bold text-slate-500 mb-2">STAGE 05</div>
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-blue-400" /> Knowledge Graph
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Fills active incidents with live structural relationship models mapping hosts and microservice dependencies.
                </p>
              </div>
              <div className="text-[9px] text-blue-400 font-bold uppercase tracking-wider">Neo4j Dependency Graph</div>
            </div>

            {/* Box 6 */}
            <div className="bg-[#131825] border border-slate-800 p-5 flex flex-col justify-between h-48 relative">
              <div>
                <div className="text-[10px] font-bold text-slate-500 mb-2">STAGE 06</div>
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-indigo-400" /> Multi-Agent RCA
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  LangGraph agents (Graph Analyzer, Topology Inspector, Impact Evaluator) run asynchronous consensus.
                </p>
              </div>
              <div className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider">LangGraph Coordinator</div>
            </div>

            {/* Box 7 */}
            <div className="bg-[#131825] border border-slate-800 p-5 flex flex-col justify-between h-48 relative">
              <div>
                <div className="text-[10px] font-bold text-slate-500 mb-2">STAGE 07</div>
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-emerald-400" /> Remediation Plan
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Assembles verified playbook files and step-by-step mitigation commands, estimating MTTA / MTTR targets.
                </p>
              </div>
              <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Actionable Playbooks</div>
            </div>

            {/* Box 8 */}
            <div className="bg-[#131825] border border-slate-800 p-5 flex flex-col justify-between h-48 relative">
              <div>
                <div className="text-[10px] font-bold text-slate-500 mb-2">STAGE 08</div>
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-indigo-400" /> Feedback Loop
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  SREs review findings and input modifications directly into the memory vector system to retrain agent reasoning.
                </p>
              </div>
              <div className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider">Continuous Learning</div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Showcase Section (Dashboard Screenshots) */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-6 text-left">
        <div className="space-y-4 mb-16">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">PRODUCT CAPABILITIES</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white font-sans tracking-tight">The Developer-Friendly Control Plane</h2>
          <p className="text-sm text-slate-400 max-w-3xl">
            Real screenshots of the operational SRE cockpit. Explore the actual layout utilized by teams to resolve microservice failure cascades.
          </p>
        </div>

        {/* Feature Grid (Image + Description blocks) */}
        <div className="space-y-20">
          
          {/* Feature 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 bg-[#0d111d] border border-slate-850 p-2">
              <img 
                src="/Active Incident Knowlwdge Graph.png" 
                alt="Active Incident Knowledge Graph Visualizer" 
                className="w-full h-auto border border-slate-800 object-cover" 
              />
            </div>
            <div className="lg:col-span-5 space-y-4">
              <div className="w-8 h-8 bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">01</div>
              <h3 className="text-xl font-bold text-white font-sans">Active Topology Dependency Mapping</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connects directly to your Neo4j infrastructure to reconstruct the live dependency topology paths during failure cascades. Critical/Warning/Healthy statuses are visualised with instant indicator rings (e.g. Gateway Service → Checkout Service → Payment Service).
              </p>
              <div className="bg-[#131825]/60 p-4 border border-slate-800 text-[11px] text-slate-400 font-mono">
                <span className="font-bold text-slate-200">Module 2.5 Dynamic Graph:</span> Querying dependencies at depth=2 in Neo4j database to identify bottlenecks.
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1 space-y-4">
              <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">02</div>
              <h3 className="text-xl font-bold text-white font-sans">Alert Sequence Replay & JSON Inspector</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Aggregates downstream telemetry streams chronologically. SREs can inspect individual events, track precise timestamps, hostnames, and expand nested metadata payloads to view raw JSON telemetry.
              </p>
              <div className="bg-[#131825]/60 p-4 border border-slate-800 text-[11px] text-slate-400 font-mono">
                <span className="font-bold text-slate-200">Module 2.12 Logs Timeline:</span> Trace raw Prometheus alert JSON payloads directly on the control page.
              </div>
            </div>
            <div className="lg:col-span-7 order-1 lg:order-2 bg-[#0d111d] border border-slate-850 p-2">
              <img 
                src="/Alert Sequence Reply.png" 
                alt="Alert Sequence Replay Console" 
                className="w-full h-auto border border-slate-800 object-cover" 
              />
            </div>
          </div>

          {/* Feature 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 bg-[#0d111d] border border-slate-850 p-2">
              <img 
                src="/Multi Agent AI RCA Engine.png" 
                alt="Multi-Agent AI RCA Engine Verdict" 
                className="w-full h-auto border border-slate-800 object-cover" 
              />
            </div>
            <div className="lg:col-span-5 space-y-4">
              <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs">03</div>
              <h3 className="text-xl font-bold text-white font-sans">Autonomous AI Reasoning Consensus</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Asynchronous LLM Agent workflows operate under Coordinator orchestration to yield final Root Cause verdicts. The console displays calculated confidence levels, estimated financial impact metrics, and step-by-step SRE mitigation command guides.
              </p>
              <div className="bg-[#131825]/60 p-4 border border-slate-800 text-[11px] text-slate-400 font-mono">
                <span className="font-bold text-slate-200">Module 2.8 LangGraph:</span> Executes coordinator logic yielding a 94% confidence verdict for lock contention bottlenecks.
              </div>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1 space-y-4">
              <div className="w-8 h-8 bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">04</div>
              <h3 className="text-xl font-bold text-white font-sans">Continuous SRE Training Weight Adjuster</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Builds SRE confidence via transparency and learning. SREs correct AI verdicts, input custom remediations, and commit revisions directly into Qdrant databases for continuous vector indexing.
              </p>
              <div className="bg-[#131825]/60 p-4 border border-slate-800 text-[11px] text-slate-400 font-mono">
                <span className="font-bold text-slate-200">Module 2.11 Learning Engine:</span> Saves SRE manual incident revisions to vector indexes as versioned nodes.
              </div>
            </div>
            <div className="lg:col-span-7 order-1 lg:order-2 bg-[#0d111d] border border-slate-850 p-2 flex justify-center items-center">
              <div className="bg-[#090d16] border border-slate-800 p-8 w-full flex justify-between items-center max-w-lg">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Agent Confidence Standard</div>
                  <div className="text-xs font-semibold text-slate-300">Continuous Vector Index Retraining</div>
                </div>
                <img 
                  src="/Agent RCA Target.png" 
                  alt="Agent RCA Target metrics badge" 
                  className="h-16 w-auto border border-slate-800" 
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Tech Stack Spec Grid */}
      <section className="py-20 bg-[#0d111d]/30 border-t border-slate-800/60 text-left">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white font-sans">Decoupled Microservice Technology Stack</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Decouples telemetry ingestion and vector/graph processing logic using CQRS patterns, preventing database read lockups during high alert volumes.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#131825] border border-slate-800 p-4">
                  <div className="text-xs font-bold text-white">Apache Kafka</div>
                  <div className="text-[10px] text-slate-450 mt-1">KRaft event distribution broker</div>
                </div>
                <div className="bg-[#131825] border border-slate-800 p-4">
                  <div className="text-xs font-bold text-white">FastAPI (Python)</div>
                  <div className="text-[10px] text-slate-450 mt-1">Non-blocking async web interfaces</div>
                </div>
                <div className="bg-[#131825] border border-slate-800 p-4">
                  <div className="text-xs font-bold text-white">Qdrant Vector</div>
                  <div className="text-[10px] text-slate-450 mt-1">Semantic search vector indexing</div>
                </div>
                <div className="bg-[#131825] border border-slate-800 p-4">
                  <div className="text-xs font-bold text-white">Neo4j Database</div>
                  <div className="text-[10px] text-slate-450 mt-1">Infrastructure topology relationships</div>
                </div>
              </div>
            </div>

            <div className="border border-slate-800 bg-[#0d111d] p-6 font-mono text-[11px] text-slate-400 space-y-4">
              <div className="font-bold text-slate-200">System Design Configuration Parameters</div>
              <div className="bg-[#090d16] p-4 border border-slate-850 rounded-none space-y-1">
                <div>KAFKA_BOOTSTRAP_SERVERS: kafka:9092</div>
                <div>NEO4J_URI: bolt://neo4j:7687</div>
                <div>QDRANT_HOST: qdrant</div>
                <div>EMBEDDING_MODEL: BGE-small</div>
                <div>AI_PROVIDER: Groq (LLaMA3-70b)</div>
              </div>
              <p className="text-[10px]">
                Preserves event stream logs to allow complete historical debugging, timeline replay, and sandbox testing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0d111d] py-16 text-left">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 flex items-center justify-center">
                  <Activity className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-base font-bold text-white font-sans">IntelliRCA</span>
              </div>
              <p className="text-xs text-slate-500 max-w-sm">
                Next-generation automated incident intelligence and root cause discovery powered by agentic AI and graph architectures.
              </p>
            </div>
            <div className="flex gap-4">
              <Link to="/signup" className="btn-primary py-2 px-6 text-xs">
                START FREE TRIAL
              </Link>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800/80 text-xs text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
            <p>© 2026 IntelliRCA Inc. All rights reserved.</p>
            <div className="flex gap-6 font-semibold">
              <a href="#" className="hover:text-slate-355 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-355 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
