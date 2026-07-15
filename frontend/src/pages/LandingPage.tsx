import { Link } from 'react-router-dom';
import { 
  Network, Database, Bot, Activity, ArrowRight, 
  ShieldAlert, Zap, Layers, ServerCog, CheckCircle2 
} from 'lucide-react';
import { motion } from 'framer-motion';

const WORKFLOW_STEPS = [
  { icon: ShieldAlert, title: 'Alert Ingestion & Normalization', desc: 'Connects directly to your Kafka streams. We parse raw logs and metrics from Prometheus, Grafana, and Kubernetes using advanced Drain3 templating to standardize the chaos into a canonical format.' },
  { icon: Network, title: 'Hybrid Temporal Correlation', desc: 'We don\'t just group by time. Our engine uses HDBSCAN clustering combined with topological maps to correlate alerts that are semantically and physically related in your infrastructure.' },
  { icon: Database, title: 'Dynamic Knowledge Graph', desc: 'As incidents unfold, we build a real-time Neo4j graph of affected services, hosts, and dependencies, preserving the exact state of your system at the time of failure for future memory.' },
  { icon: Bot, title: 'Multi-Agent Root Cause Analysis', desc: 'A fleet of LangGraph agents—including RCA, Memory, and Verification agents—work in consensus to traverse the graph, find the root cause, and estimate the blast radius.' }
];

const ARCHITECTURE_FEATURES = [
  'Event-Sourced Kafka streaming for real-time processing.',
  'BGE/E5 Semantic Embeddings for accurate historical incident matching.',
  'Neo4j Knowledge Graphs for complex topological relationship queries.',
  'LangGraph orchestrated LLM agents ensuring transparent, explainable decisions.',
  'CQRS pattern separating heavy AI reads from continuous alert writes.'
];

export function LandingPage() {
  return (
    <div className="min-h-screen saas-bg">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">IntelliRCA</span>
          </div>
          <div>
            <Link to="/signup" className="btn-primary">
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-40 pb-20 px-6 max-w-7xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold border border-blue-100">
            <Zap className="w-4 h-4" /> Introducing Agentic Incident Intelligence
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
            Stop investigating alerts. <br />
            <span className="text-gradient">Start resolving incidents.</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            IntelliRCA transforms thousands of noisy alerts into a single, explainable root cause using a Multi-Agent architecture and Dynamic Knowledge Graphs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/signup" className="btn-primary text-lg px-8 py-4">
              Start Free Trial
            </Link>
            <a href="#architecture" className="btn-secondary text-lg px-8 py-4">
              View Architecture
            </a>
          </div>
        </motion.div>
      </main>

      {/* The Problem Section */}
      <section className="py-24 bg-white/30 backdrop-blur-md border-y border-white/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                Alert fatigue is burning out your SREs.
              </h2>
              <div className="space-y-4 text-lg text-slate-600 leading-relaxed">
                <p>
                  Modern microservice architectures generate thousands of alerts per minute during an outage. Human engineers cannot manually correlate logs, metrics, and traces across dozens of dashboards fast enough to meet SLAs.
                </p>
                <p>
                  Traditional rules-based correlation fails when topologies change dynamically. You don't need another dashboard—you need an intelligence layer that reasons about your infrastructure exactly like your best engineer would.
                </p>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <ServerCog className="w-64 h-64" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-6 relative z-10">The IntelliRCA Solution</h3>
              <ul className="space-y-4 relative z-10">
                {[
                  'Injest millions of raw events via Kafka.',
                  'Dynamically build the dependency graph.',
                  'Deploy 5 specialized AI agents to investigate.',
                  'Provide a single, explainable Root Cause.'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <span className="text-slate-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Workflow Section */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">The Autonomous Pipeline</h2>
          <p className="text-lg text-slate-600">
            From raw metric spike to a remediation plan, our 14-step pipeline operates entirely autonomously in real-time.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {WORKFLOW_STEPS.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="card-elegant flex flex-col"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6">
                <step.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
              <p className="text-slate-600 leading-relaxed flex-1">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Architecture Deep Dive */}
      <section id="architecture" className="py-24 mt-12 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                Enterprise-Grade Architecture
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Built for scale, IntelliRCA employs a highly decoupled, event-driven microservices architecture. We utilize Command Query Responsibility Segregation (CQRS) to ensure alert ingestion never bottlenecks AI reasoning.
              </p>
              <div className="space-y-4">
                {ARCHITECTURE_FEATURES.map((feature, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-4 rounded-xl border border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                    <Layers className="w-5 h-5 text-blue-600 shrink-0" />
                    <span className="text-slate-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-6 md:p-8 h-full min-h-[450px] shadow-[0_8px_32px_rgba(31,38,135,0.05)] flex flex-col justify-center relative overflow-hidden"
            >
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.03)_0%,transparent_100%)]"></div>
               
               {/* CSS Block Architecture Diagram */}
               <div className="relative z-10 w-full flex flex-col items-center gap-4">
                 
                 {/* Row 1 */}
                 <div className="flex items-center gap-4">
                   <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex flex-col items-center text-center shadow-sm w-32">
                     <ShieldAlert className="w-6 h-6 text-slate-700 mb-2" />
                     <span className="text-xs font-bold text-slate-800">Alert Sources</span>
                   </div>
                   <ArrowRight className="w-5 h-5 text-slate-400" />
                   <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex flex-col items-center text-center shadow-sm w-32">
                     <Zap className="w-6 h-6 text-blue-600 mb-2" />
                     <span className="text-xs font-bold text-blue-800">Kafka Stream</span>
                   </div>
                 </div>

                 {/* Vertical Arrow */}
                 <div className="flex justify-center w-full my-1">
                   <div className="h-6 border-l-2 border-dashed border-slate-300 relative">
                     <div className="absolute -bottom-2 -left-[5px] w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-transparent border-t-slate-400"></div>
                   </div>
                 </div>

                 {/* Row 2 */}
                 <div className="flex items-center gap-4">
                   <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 flex flex-col items-center text-center shadow-sm w-32">
                     <Network className="w-6 h-6 text-indigo-600 mb-2" />
                     <span className="text-xs font-bold text-indigo-800">Correlation</span>
                   </div>
                   <ArrowRight className="w-5 h-5 text-slate-400" />
                   <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex flex-col items-center text-center shadow-sm w-32">
                     <Database className="w-6 h-6 text-emerald-600 mb-2" />
                     <span className="text-xs font-bold text-emerald-800">Graph DB</span>
                   </div>
                 </div>

                 {/* Vertical Arrow */}
                 <div className="flex justify-center w-full my-1">
                   <div className="h-6 border-l-2 border-dashed border-slate-300 relative">
                     <div className="absolute -bottom-2 -left-[5px] w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-transparent border-t-slate-400"></div>
                   </div>
                 </div>

                 {/* Row 3 */}
                 <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-center justify-center gap-6 shadow-sm w-full max-w-[300px]">
                   <div className="flex flex-col items-center text-center">
                     <Bot className="w-6 h-6 text-purple-600 mb-2" />
                     <span className="text-xs font-bold text-purple-800">Multi-Agent RCA</span>
                   </div>
                   <ArrowRight className="w-5 h-5 text-purple-400" />
                   <div className="flex flex-col items-center text-center">
                     <Activity className="w-6 h-6 text-red-500 mb-2" />
                     <span className="text-xs font-bold text-red-700">Root Cause</span>
                   </div>
                 </div>

               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-white/30 backdrop-blur-md border-t border-white/40 pt-16 pb-8 mt-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-blue-600" />
                <span className="text-xl font-bold tracking-tight text-slate-900">IntelliRCA</span>
              </div>
              <p className="text-slate-500 max-w-sm leading-relaxed">
                Next-generation automated incident intelligence and root cause discovery powered by Agentic AI and Graph architectures.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-3 text-slate-500 font-medium text-sm">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Architecture</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Company</h4>
              <ul className="space-y-3 text-slate-500 font-medium text-sm">
                <li><a href="#" className="hover:text-blue-600 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 text-center md:text-left text-slate-400 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <p>© 2026 IntelliRCA Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-slate-600">Privacy Policy</a>
              <a href="#" className="hover:text-slate-600">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
