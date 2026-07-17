import { useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { type IncidentSubgraph } from '../services/api';

interface IncidentGraphProps {
  subgraph: IncidentSubgraph;
}

export function IncidentGraph({ subgraph }: IncidentGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);

  useEffect(() => {
    const flowNodes = subgraph.nodes.map((node, index) => {
      // Calculate coordinates dynamically to prevent overlaps
      const x = 50 + index * 220;
      // Stagger y coordinates slightly for visual style
      const y = 150 + (index % 2 === 0 ? -40 : 40);

      // Determine border color based on SRE node status
      let statusColor = 'border-slate-800 text-slate-300 bg-[#090d16]';
      let badgeColor = 'bg-slate-800 text-slate-400';
      if (node.status === 'critical') {
        statusColor = 'border-red-500 text-red-100 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.15)]';
        badgeColor = 'bg-red-500 text-white animate-pulse';
      } else if (node.status === 'warning') {
        statusColor = 'border-amber-500 text-amber-100 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]';
        badgeColor = 'bg-amber-500 text-white';
      } else if (node.status === 'healthy') {
        statusColor = 'border-emerald-500 text-emerald-100 bg-emerald-500/10';
        badgeColor = 'bg-emerald-500 text-white';
      }

      return {
        id: node.id,
        position: { x, y },
        data: {
          label: (
            <div className={`p-4 rounded-xl border-2 text-left font-sans transition-all duration-300 ${statusColor} w-48 shadow-sm`}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {node.type}
                </span>
                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${badgeColor}`}>
                  {node.status?.toUpperCase() || 'UNKNOWN'}
                </span>
              </div>
              <div className="font-bold text-sm tracking-tight text-white truncate">{node.label}</div>
              <div className="text-[10px] text-slate-400 font-mono mt-1 font-semibold truncate">{node.id}</div>
            </div>
          )
        },
        style: {
          background: 'transparent',
          border: 'none',
          padding: 0,
        }
      };
    });

    const flowEdges = subgraph.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      animated: true,
      labelStyle: { fill: '#94a3b8', fontWeight: 600, fontSize: 10, fontFamily: 'monospace' },
      labelBgPadding: 4,
      labelBgBorderRadius: 4,
      labelBgStyle: { fill: '#0d111d', fillOpacity: 0.95, stroke: '#1e293b', strokeWidth: 1 },
      style: {
        stroke: edge.source === 'payment-service' || edge.source === 'redis-cache' ? '#ef4444' : '#3b82f6',
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 16,
        height: 16,
        color: edge.source === 'payment-service' || edge.source === 'redis-cache' ? '#ef4444' : '#3b82f6',
      },
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [subgraph, setNodes, setEdges]);

  return (
    <div className="w-full h-full min-h-[350px] bg-[#090d16] border border-slate-800/80 rounded-2xl relative overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background color="#1e293b" gap={16} size={1} />
        <Controls showInteractive={false} className="!bg-[#0d111d] !border-slate-800 !text-slate-200 !shadow-lg" />
      </ReactFlow>
    </div>
  );
}
