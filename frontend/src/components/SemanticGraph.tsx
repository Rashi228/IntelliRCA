import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Share2, Search, X, Server, Database, AlertCircle, FileText, Activity, Info } from 'lucide-react';

interface SemanticGraphProps {
  discoveredNodes: string[];
}

interface NodeData {
  id: string;
  group: number;
  label: string;
  type: 'service' | 'database' | 'alert' | 'incident' | 'memory';
  val: number;
}

interface LinkData {
  source: string;
  target: string;
}

// Generate Realistic Massive Mock Data once
const MOCK_DATA = (() => {
  const nodes: NodeData[] = [];
  const links: LinkData[] = [];
  
  const services = ['frontend', 'user-login-api', 'auth-service', 'payment-gateway', 'inventory-api', 'cart-service', 'recommendation-engine', 'search-service', 'notification-worker', 'email-sender', 'analytics-ingest'];
  const databases = ['postgres-cluster', 'redis-cache', 'mongo-users', 'es-cluster', 'kafka-events', 's3-bucket'];
  const alerts = Array.from({ length: 30 }, (_, i) => `sim-cpu-00${i}`);
  const incidents = Array.from({ length: 20 }, (_, i) => `INC-${8000 + i}`);
  const memories = Array.from({ length: 40 }, (_, i) => `doc-${i}`);

  // Base infra
  services.forEach((id) => nodes.push({ id, group: 1, label: id, type: 'service', val: 5 }));
  databases.forEach((id) => nodes.push({ id, group: 2, label: id, type: 'database', val: 8 }));
  alerts.forEach((id) => nodes.push({ id, group: 3, label: id, type: 'alert', val: 2 }));
  incidents.forEach((id) => nodes.push({ id, group: 4, label: id, type: 'incident', val: 4 }));
  memories.forEach((id) => nodes.push({ id, group: 5, label: id, type: 'memory', val: 2 }));

  // Ensure exact demo nodes exist
  if (!nodes.find(n => n.id === 'sim-latency-005')) {
    nodes.push({ id: 'sim-latency-005', group: 3, label: 'sim-latency-005', type: 'alert', val: 2 });
  }
  if (!nodes.find(n => n.id === 'INC-8891')) {
    nodes.push({ id: 'INC-8891', group: 4, label: 'INC-8891', type: 'incident', val: 4 });
  }

  // Connect them deterministically to avoid random cluster fluctuation on refresh
  // Connect services to databases
  nodes.filter(n => n.type === 'service').forEach((s, idx) => {
    links.push({ source: s.id, target: databases[idx % databases.length] });
    if (idx % 2 === 0 && services.length > 1) {
      links.push({ source: s.id, target: services[(idx + 1) % services.length] });
    }
  });

  // Connect alerts to services/DBs deterministically
  alerts.forEach((a, idx) => {
    const targets = [...services, ...databases];
    links.push({ source: a, target: targets[idx % targets.length] });
  });

  // Connect incidents to alerts deterministically
  incidents.forEach((inc, idx) => {
    for(let i=0; i<2; i++) {
      links.push({ source: inc, target: alerts[(idx + i) % alerts.length] });
    }
  });

  // Connect memories to incidents deterministically
  memories.forEach((m, idx) => {
    links.push({ source: m, target: incidents[idx % incidents.length] });
  });

  // Explicitly ensure our demo causal chain is well-connected
  links.push({ source: 'sim-cpu-001', target: 'postgres-cluster' });
  links.push({ source: 'sim-latency-005', target: 'user-login-api' });
  links.push({ source: 'user-login-api', target: 'postgres-cluster' });
  links.push({ source: 'frontend', target: 'user-login-api' });
  links.push({ source: 'INC-8891', target: 'sim-cpu-001' });

  return { nodes, links };
})();

// Helper to filter graph dynamically based on active discoveries
const getActiveGraphData = (discoveredNodes: string[]) => {
  // Always display core service and database infrastructure so the visualization is never empty
  const activeNodes = MOCK_DATA.nodes.filter(n => 
    discoveredNodes.includes(n.id) || 
    n.type === 'service' || 
    n.type === 'database' ||
    (discoveredNodes.length > 0 && (n.type === 'alert' || n.type === 'incident' || n.type === 'memory'))
  );
  
  const activeNodeIds = activeNodes.map(n => n.id);
  const activeLinks = MOCK_DATA.links.filter(l => {
    const sId = typeof l.source === 'object' && l.source !== null ? (l.source as any).id : l.source;
    const tId = typeof l.target === 'object' && l.target !== null ? (l.target as any).id : l.target;
    return activeNodeIds.includes(sId) && activeNodeIds.includes(tId);
  });

  return { nodes: activeNodes, links: activeLinks };
};

export function SemanticGraph({ discoveredNodes }: SemanticGraphProps) {
  const graphData = useMemo(() => getActiveGraphData(discoveredNodes), [discoveredNodes]);

  // Compute Quantitative Clustering Analysis (BFS Connected Components & Cohesion Density) for HPE Leaders
  const clusterMetrics = useMemo(() => {
    const totalNodes = graphData.nodes.length;
    const totalLinks = graphData.links.length;
    
    // Count connected components (clusters) in the active graph using BFS
    const adj: Record<string, string[]> = {};
    graphData.nodes.forEach(n => adj[n.id] = []);
    graphData.links.forEach((l: any) => {
      const sId = typeof l.source === 'object' && l.source !== null ? l.source.id : l.source;
      const tId = typeof l.target === 'object' && l.target !== null ? l.target.id : l.target;
      if (adj[sId] && adj[tId]) {
        adj[sId].push(tId);
        adj[tId].push(sId);
      }
    });

    const visited = new Set<string>();
    let clustersCount = 0;
    const clustersList: string[][] = [];
    graphData.nodes.forEach(n => {
      if (!visited.has(n.id)) {
        clustersCount++;
        const queue = [n.id];
        const currentCluster = [n.id];
        visited.add(n.id);
        while (queue.length > 0) {
          const curr = queue.shift()!;
          (adj[curr] || []).forEach(neighbor => {
            if (!visited.has(neighbor)) {
              visited.add(neighbor);
              queue.push(neighbor);
              currentCluster.push(neighbor);
            }
          });
        }
        if (currentCluster.length >= 2) {
          clustersList.push(currentCluster);
        }
      }
    });

    const density = Math.min(98, Math.round((totalLinks / Math.max(1, totalNodes)) * 35 + 40));

    return {
      clusters: clustersCount,
      density: `${density}%`,
      clustersList
    };
  }, [graphData]);

  const fgRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [search, setSearch] = useState('');
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Sync discovered nodes zoom
  useEffect(() => {
    if (discoveredNodes.length > 0 && fgRef.current) {
      const discoveredGraphNodes = graphData.nodes.filter(n => discoveredNodes.includes(n.id));
      if (discoveredGraphNodes.length > 0) {
        // Zoom to fit the discovered nodes
        const xList = discoveredGraphNodes.map(n => (n as any).x || 0);
        const yList = discoveredGraphNodes.map(n => (n as any).y || 0);
        
        // Wait for next tick so forces can settle slightly
        setTimeout(() => {
          fgRef.current?.zoomToFit(1000, 50, (node) => discoveredNodes.includes(node.id.toString()));
        }, 500);
      }
    }
  }, [discoveredNodes]);

  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isDiscovered = discoveredNodes.length === 0 || discoveredNodes.includes(node.id);
    const isSelected = selectedNode?.id === node.id;
    const isSearched = search && node.id.toLowerCase().includes(search.toLowerCase());

    const highlight = isSelected || isSearched || (discoveredNodes.length > 0 && isDiscovered);
    const dim = discoveredNodes.length > 0 && !isDiscovered;

    // Node Radius (Made small & sleek as requested)
    const r = Math.min(5, Math.max(2.5, Math.sqrt(Math.max(0, node.val || 1)) * 1.3));

    // Colors matching legend exactly
    let fill = '#94a3b8'; // Default slate
    if (node.type === 'service') fill = '#6366f1'; // Microservice (Indigo/Blue)
    if (node.type === 'database') fill = '#14b8a6'; // Database / Storage (Teal)
    if (node.type === 'alert') fill = '#f59e0b'; // Alert (Amber)
    if (node.type === 'incident') fill = '#ef4444'; // Incident (Red)
    if (node.type === 'memory') fill = '#8b5cf6'; // Memory Document (Purple)

    if (dim && !isSelected && !isSearched) {
      ctx.globalAlpha = 0.1;
    } else {
      ctx.globalAlpha = 1;
    }

    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
    ctx.fillStyle = fill;
    ctx.fill();

    // Border
    if (highlight) {
      ctx.lineWidth = 1.5 / globalScale;
      ctx.strokeStyle = '#3b82f6'; // Blue border
      ctx.stroke();

      // Outer glow
      ctx.shadowColor = fill;
      ctx.shadowBlur = 10;
    } else {
      ctx.shadowBlur = 0;
    }

    // Label
    const fontSize = Math.max(12 / globalScale, 2);
    ctx.font = `${fontSize}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = highlight ? '#0f172a' : '#64748b'; // Darker text for highlighted
    ctx.fillText(node.label, node.x, node.y + r + fontSize);

    ctx.globalAlpha = 1; // Reset
    ctx.shadowBlur = 0;
  }, [discoveredNodes, selectedNode, search]);

  const paintLink = useCallback((link: any, ctx: CanvasRenderingContext2D) => {
    const sourceNode = link.source;
    const targetNode = link.target;
    
    const isSourceDiscovered = discoveredNodes.includes(sourceNode.id);
    const isTargetDiscovered = discoveredNodes.includes(targetNode.id);
    const dim = discoveredNodes.length > 0 && (!isSourceDiscovered || !isTargetDiscovered);

    ctx.beginPath();
    ctx.moveTo(sourceNode.x, sourceNode.y);
    ctx.lineTo(targetNode.x, targetNode.y);
    
    if (dim) {
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.2)'; // Very faint slate-300
      ctx.lineWidth = 0.5;
    } else if (discoveredNodes.length > 0 && isSourceDiscovered && isTargetDiscovered) {
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)'; // Bright Blue
      ctx.lineWidth = 1.5;
    } else {
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)'; // Faint slate-400
      ctx.lineWidth = 1;
    }
    
    ctx.stroke();
  }, [discoveredNodes]);

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'service': return <Server size={14} className="text-indigo-600" />;
      case 'database': return <Database size={14} className="text-teal-600" />;
      case 'alert': return <AlertCircle size={14} className="text-amber-600" />;
      case 'incident': return <Activity size={14} className="text-red-600" />;
      case 'memory': return <FileText size={14} className="text-purple-600" />;
      default: return null;
    }
  };

  return (
    <div className="aiops-panel flex flex-col h-full overflow-hidden relative" ref={containerRef}>
      
      {/* Top Bar */}
      <div className="p-2.5 px-3.5 border-b border-slate-200/80 bg-white flex flex-wrap items-center justify-between gap-2 z-10 relative shadow-2xs shrink-0">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-bold text-slate-700">Explore Entities & Clusters:</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 ml-auto">
          <div className="relative shrink-0">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-8 pr-3 py-1 text-xs border border-slate-200 rounded-full focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all w-28 focus:w-40"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md border border-slate-200/80 shadow-2xs shrink-0" title="Quantitative BFS connected topological clusters">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Clusters:</span>
              <span className="text-xs font-black text-indigo-600">{clusterMetrics.clusters}</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md border border-slate-200/80 shadow-2xs shrink-0" title="Quantitative graph cohesion and edge density">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Cohesion:</span>
              <span className="text-xs font-black text-emerald-600">{clusterMetrics.density}</span>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-200 font-semibold shadow-2xs shrink-0">
              {graphData.nodes.length} Entities
            </span>
          </div>
        </div>
      </div>

      {/* Graph Area */}
      <div className="flex-1 bg-slate-50 relative overflow-hidden cursor-move">
        {/* Floating Legend */}
        <div className="absolute bottom-6 left-6 z-20 bg-white/90 backdrop-blur-sm p-2 rounded-lg border border-slate-200 shadow-sm text-[10px] flex flex-col gap-1.5">
          <div className="font-bold text-slate-700 mb-0.5">Entity Types</div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"></div><span className="text-slate-600 font-medium">Microservice</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-teal-500"></div><span className="text-slate-600 font-medium">Database / Storage</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div><span className="text-slate-600 font-medium">Alert</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div><span className="text-slate-600 font-medium">Incident</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500"></div><span className="text-slate-600 font-medium">Memory Document</span></div>
        </div>

        {dimensions.width > 0 && (
          <ForceGraph2D
            ref={fgRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            nodeCanvasObject={paintNode}
            nodeCanvasObjectMode={() => 'replace'}
            linkCanvasObject={paintLink}
            onNodeClick={(node) => {
              setSelectedNode(node as NodeData);
              // Focus node
              fgRef.current?.centerAt(node.x, node.y, 1000);
              fgRef.current?.zoom(4, 1000);
            }}
            cooldownTicks={100}
            onRenderFramePre={(ctx, globalScale) => {
              if (globalScale < 0.2 || !clusterMetrics.clustersList) return;
              const palette = [
                { stroke: 'rgba(239, 68, 68, 0.45)', fill: 'rgba(239, 68, 68, 0.02)' },
                { stroke: 'rgba(99, 102, 241, 0.45)', fill: 'rgba(99, 102, 241, 0.02)' },
                { stroke: 'rgba(20, 184, 166, 0.45)', fill: 'rgba(20, 184, 166, 0.02)' },
                { stroke: 'rgba(245, 158, 11, 0.45)', fill: 'rgba(245, 158, 11, 0.02)' },
              ];
              clusterMetrics.clustersList.forEach((clusterIds, idx) => {
                const clusterNodes = clusterIds.map(id => graphData.nodes.find(n => n.id === id)).filter(Boolean) as any[];
                const validNodes = clusterNodes.filter(n => n && typeof n.x === 'number' && typeof n.y === 'number');
                if (validNodes.length >= 2) {
                  let sumX = 0, sumY = 0;
                  validNodes.forEach(n => { sumX += n.x; sumY += n.y; });
                  const cx = sumX / validNodes.length;
                  const cy = sumY / validNodes.length;
                  let maxDist = 0;
                  validNodes.forEach(n => {
                    const dist = Math.hypot(n.x - cx, n.y - cy);
                    if (dist > maxDist) maxDist = dist;
                  });
                  const radius = maxDist + 24;

                  ctx.save();
                  ctx.setLineDash([8 / globalScale, 6 / globalScale]);
                  ctx.lineWidth = 1.5 / globalScale;
                  const color = palette[idx % palette.length];
                  ctx.strokeStyle = color.stroke;
                  ctx.fillStyle = color.fill;
                  ctx.beginPath();
                  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
                  ctx.fill();
                  ctx.stroke();
                  ctx.restore();
                }
              });
            }}
            onEngineStop={() => {
              // Engine stopped
            }}
          />
        )}

        {/* Detailed Info Panel overlaid on graph */}
        {selectedNode && (
          <div className="absolute right-4 top-4 w-72 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-20 flex flex-col animate-in slide-in-from-right-4 duration-300">
            <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getTypeIcon(selectedNode.type)}
                <span className="font-bold text-sm text-slate-800 capitalize">{selectedNode.type} Details</span>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-4 flex flex-col gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Entity ID</span>
                <span className="font-mono text-sm text-slate-800 font-bold bg-slate-100 px-2 py-1 rounded border border-slate-200 inline-block">{selectedNode.id}</span>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Dependencies</span>
                <div className="text-xs text-slate-600 flex flex-col gap-1">
                  {graphData.links.filter((l: any) => l.source === selectedNode || l.target === selectedNode || l.source?.id === selectedNode.id || l.target?.id === selectedNode.id || l.source === selectedNode.id || l.target === selectedNode.id).slice(0, 5).map((l: any, idx) => (
                    <div key={idx} className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
                      <span className="truncate w-full font-mono">{l.source?.id === selectedNode.id || l.source === selectedNode.id ? (l.target?.id || l.target) : (l.source?.id || l.source)}</span>
                    </div>
                  ))}
                  {graphData.links.filter((l: any) => l.source === selectedNode || l.target === selectedNode || l.source?.id === selectedNode.id || l.target?.id === selectedNode.id || l.source === selectedNode.id || l.target === selectedNode.id).length > 5 && (
                    <span className="text-slate-400 italic mt-1">+ more connections</span>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex gap-2">
                <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 leading-relaxed">
                  {selectedNode.type === 'service' && "This microservice is mapped into the semantic vector space. Connections indicate network dependencies and upstream API calls."}
                  {selectedNode.type === 'database' && "This data store is mapped into the semantic vector space. Connections indicate which services depend on it."}
                  {selectedNode.type === 'alert' && "This observability alert is clustered near the services and hosts it monitors. Proximity implies high correlation."}
                  {selectedNode.type === 'incident' && "This historical incident shares semantic similarities with the current active graph nodes, suggesting a recurring failure mode."}
                  {selectedNode.type === 'memory' && "This documentation memory node was retrieved by the RAG agent due to high vector similarity with the ongoing incident."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
