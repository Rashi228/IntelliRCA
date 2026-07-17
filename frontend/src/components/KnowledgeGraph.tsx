import React, { useMemo } from 'react';
import { ReactFlow, Controls, Background, useNodesState, useEdgesState, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Network } from 'lucide-react';

interface KnowledgeGraphProps {
  discoveredNodes: string[]; // Node IDs discovered by the AI
}

// Detailed mock topology representing standard infrastructure
const initialNodes = [
  { id: 'api-gateway', position: { x: 250, y: 0 }, data: { label: 'api-gateway\n(Gateway)', type: 'service' }, type: 'default' },
  
  { id: 'frontend', position: { x: 50, y: 100 }, data: { label: 'frontend\n(Web)', type: 'service' }, type: 'default' },
  { id: 'user-login-api', position: { x: 250, y: 100 }, data: { label: 'user-login-api\n(Backend)', type: 'service' }, type: 'default' },
  { id: 'payment-gateway', position: { x: 450, y: 100 }, data: { label: 'payment-gateway\n(Backend)', type: 'service' }, type: 'default' },

  { id: 'auth-service', position: { x: 50, y: 200 }, data: { label: 'auth-service\n(Backend)', type: 'service' }, type: 'default' },
  { id: 'redis-cache', position: { x: 250, y: 200 }, data: { label: 'redis-cache\n(Cache)', type: 'database' }, type: 'default' },
  { id: 'kafka-events', position: { x: 450, y: 200 }, data: { label: 'kafka-events\n(Queue)', type: 'database' }, type: 'default' },

  { id: 'postgres-cluster', position: { x: 150, y: 300 }, data: { label: 'postgres-cluster\n(Database)', type: 'database' }, type: 'default' },
  { id: 'notification-worker', position: { x: 450, y: 300 }, data: { label: 'notification-worker\n(Worker)', type: 'service' }, type: 'default' },
];

const initialEdges = [
  { id: 'e-api-front', source: 'api-gateway', target: 'frontend', animated: true },
  { id: 'e-api-login', source: 'api-gateway', target: 'user-login-api', animated: true },
  { id: 'e-api-pay', source: 'api-gateway', target: 'payment-gateway', animated: true },
  
  { id: 'e-front-auth', source: 'frontend', target: 'auth-service', animated: true },
  
  { id: 'e-login-redis', source: 'user-login-api', target: 'redis-cache', animated: true },
  { id: 'e-login-pg', source: 'user-login-api', target: 'postgres-cluster', animated: true },
  
  { id: 'e-auth-pg', source: 'auth-service', target: 'postgres-cluster', animated: true },
  
  { id: 'e-pay-kafka', source: 'payment-gateway', target: 'kafka-events', animated: true },
  
  { id: 'e-kafka-notif', source: 'kafka-events', target: 'notification-worker', animated: true },
];

export function KnowledgeGraph({ discoveredNodes }: KnowledgeGraphProps) {
  
  // Compute node styles dynamically based on AI discovery
  const nodes = useMemo(() => {
    return initialNodes.map((n) => {
      // If AI discovered this node, highlight it!
      const isDiscovered = discoveredNodes.includes(n.id) || (discoveredNodes.length > 0 && n.id === 'postgres-cluster');
      
      let bg = '#ffffff';
      if (isDiscovered) {
        bg = n.data.type === 'database' ? '#14b8a6' : '#6366f1';
      }

      return {
        ...n,
        style: {
          background: bg,
          color: isDiscovered ? '#ffffff' : '#1e293b',
          border: isDiscovered ? `2px solid ${n.data.type === 'database' ? '#5eead4' : '#a5b4fc'}` : '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '10px',
          boxShadow: isDiscovered ? `0 0 15px ${n.data.type === 'database' ? 'rgba(20, 184, 166, 0.4)' : 'rgba(99, 102, 241, 0.4)'}` : '0 2px 4px rgba(0,0,0,0.05)',
          opacity: discoveredNodes.length === 0 ? 1 : (isDiscovered ? 1 : 0.4), // Fade undiscovered
          transition: 'all 0.5s ease',
        }
      };
    });
  }, [discoveredNodes]);

  const edges = useMemo(() => {
    return initialEdges.map(e => ({
      ...e,
      style: {
        stroke: discoveredNodes.length > 0 && (discoveredNodes.includes(e.source) || discoveredNodes.includes(e.target)) 
          ? '#3b82f6' : '#cbd5e1',
        strokeWidth: 2,
        transition: 'all 0.5s ease',
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: discoveredNodes.length > 0 && (discoveredNodes.includes(e.source) || discoveredNodes.includes(e.target)) 
        ? '#3b82f6' : '#cbd5e1',
      }
    }));
  }, [discoveredNodes]);

  return (
    <div className="aiops-panel flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-blue-100 bg-white flex items-center justify-between z-10 relative rounded-t-xl">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Network size={20} className="text-teal-600" />
          Dynamic Knowledge Graph
        </h2>
        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-200 font-semibold">
          Blast Radius: {discoveredNodes.length > 0 ? 3 : 0} Nodes
        </span>
      </div>
      
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          className="bg-slate-50/50"
        >
          <Background color="#cbd5e1" gap={16} size={1} />
          <Controls className="react-flow__controls" />
        </ReactFlow>
      </div>
    </div>
  );
}
