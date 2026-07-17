import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { logAuditAction } from '../lib/audit';

export interface TimelineEvent {
  id: string;
  agent: string;
  status: 'started' | 'completed' | 'error' | 'finished';
  timestamp: number;
  details?: Record<string, any>;
}

export interface RCAReport {
  incident_id?: string;
  root_cause?: string;
  confidence_score?: number;
  blast_radius?: string;
  business_impact?: string;
  recommended_remediation?: string;
}

export function useIntelliRCAStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [rcaReport, setRcaReport] = useState<RCAReport | null>(null);
  const [graphNodes, setGraphNodes] = useState<string[]>([]);
  const [historicalIncidents, setHistoricalIncidents] = useState<any[]>([]);
  const [currentIncidentId, setCurrentIncidentId] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const stateRef = useRef({ events: [] as TimelineEvent[], rcaReport: null as RCAReport | null, graphNodes: [] as string[] });

  const startStream = useCallback(async (incidentId: string, payload: any) => {
    // Reset state
    setEvents([]);
    setRcaReport(null);
    setGraphNodes([]);
    setCurrentIncidentId(incidentId);
    stateRef.current = { events: [], rcaReport: null, graphNodes: [] };
    setIsStreaming(true);

    const { data: { session } } = await supabase!.auth.getSession();
    const token = session?.access_token || '';
    
    // We append the JWT token to the WebSocket query string for backend verification
    const wsUrl = `ws://localhost:8090/ws/rca/${incidentId}?token=${token}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify(payload));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        const newEvent = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          agent: data.agent,
          status: data.status,
          timestamp: Date.now(),
          details: data.updates
        };
        
        setEvents((prev) => [...prev, newEvent]);
        stateRef.current.events.push(newEvent);

        // If it's the RCA final report, save it
        if (data.agent === 'consensus_validator' && data.updates?.final_rca_report) {
          setRcaReport(data.updates.final_rca_report);
          stateRef.current.rcaReport = data.updates.final_rca_report;
        }

        // If it's graph nodes, save them for the Topology view
        if (data.agent === 'graph' && data.updates?.supporting_graph_nodes) {
          setGraphNodes(data.updates.supporting_graph_nodes);
          stateRef.current.graphNodes = data.updates.supporting_graph_nodes;
        }

        if (data.status === 'finished' || data.status === 'error') {
          setIsStreaming(false);
          ws.close();
          
          // Persist to Supabase
          if (isSupabaseConfigured() && stateRef.current.rcaReport) {
            supabase!.from('incidents').insert({
              target_id: incidentId,
              title: `RCA: ${stateRef.current.rcaReport.root_cause?.substring(0, 50) || 'Incident'}`,
              status: 'Resolved',
              rca_report: stateRef.current.rcaReport,
              confidence: stateRef.current.rcaReport.confidence_score || 0,
              blast_radius_nodes: stateRef.current.graphNodes,
              timeline_events: stateRef.current.events
            }).then(({ error }) => {
              if (error) console.error("Failed to persist incident:", error);
              else fetchHistoricalIncidents();
            });
            
            logAuditAction({
              action: 'RCA Generated',
              resource_type: 'Incident',
              resource_id: incidentId
            });
          }
        }
      } catch (err) {
        console.error("Failed to parse websocket message", err);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      setIsStreaming(false);
    };

    ws.onclose = () => {
      setIsStreaming(false);
    };
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const fetchHistoricalIncidents = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    const { data, error } = await supabase!.from('incidents').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setHistoricalIncidents(data);
    }
  }, []);

  const loadHistoricalIncident = useCallback((incident: any) => {
    setCurrentIncidentId(incident.target_id);
    setEvents(incident.timeline_events || []);
    setRcaReport(incident.rca_report);
    setGraphNodes(incident.blast_radius_nodes || []);
    
    logAuditAction({
      action: 'Incident Viewed',
      resource_type: 'Incident',
      resource_id: incident.target_id
    });
  }, []);

  return {
    isStreaming,
    events,
    rcaReport,
    graphNodes,
    historicalIncidents,
    currentIncidentId,
    startStream,
    disconnect,
    fetchHistoricalIncidents,
    loadHistoricalIncident
  };
}
