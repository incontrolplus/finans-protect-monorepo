import { useState, useEffect, useCallback } from 'react';

export interface NodeRamMetrics {
  used_pct: number;
  total_gb: number;
  used_gb: number;
  free_gb: number;
}

export interface ExternalSsdMetrics {
  name: string;
  mounted: boolean;
  mount_point: string;
  free_gb: number;
  total_gb: number;
  used_pct: number;
}

export interface NodeStorageMetrics {
  root_used_pct: number;
  root_free_gb: number;
  root_total_gb: number;
  external_ssd: ExternalSsdMetrics | null;
}

export interface TailscaleMetrics {
  connected: boolean;
  mode: string;
  peer_count: number;
}

export interface ClusterNodeTelemetry {
  id: string;
  canonical_name: string;
  display_name: string;
  role: string;
  ip: string;
  status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
  cpu_pct: number;
  ram: NodeRamMetrics;
  storage: NodeStorageMetrics;
  tailscale: TailscaleMetrics;
  last_heartbeat: string;
}

export interface ClusterTelemetrySummary {
  total_ram_gb: number;
  used_ram_gb: number;
  avg_ram_pct: number;
  total_storage_gb: number;
  free_storage_gb: number;
}

export interface ClusterTelemetryData {
  ok: boolean;
  timestamp: string;
  fleet_status: string;
  sla_target: string;
  total_nodes: number;
  healthy_nodes: number;
  summary: ClusterTelemetrySummary;
  nodes: ClusterNodeTelemetry[];
}

const FALLBACK_TELEMETRY: ClusterTelemetryData = {
  ok: true,
  timestamp: new Date().toISOString(),
  fleet_status: "HEALTHY",
  sla_target: "99.9%",
  total_nodes: 3,
  healthy_nodes: 3,
  summary: {
    total_ram_gb: 48,
    used_ram_gb: 29.9,
    avg_ram_pct: 62.3,
    total_storage_gb: 2383.6,
    free_storage_gb: 363.4
  },
  nodes: [
    {
      id: "dios-macbook-air",
      canonical_name: "dios-macbook-air",
      display_name: "MacBook Air M4 (Primary Agent)",
      role: "Agent CLI, WebChat UI & Workspaces",
      ip: "100.120.246.89",
      status: "HEALTHY",
      cpu_pct: 28.5,
      ram: {
        used_pct: 66.8,
        total_gb: 16.0,
        used_gb: 10.7,
        free_gb: 5.3
      },
      storage: {
        root_used_pct: 74.8,
        root_free_gb: 60.2,
        root_total_gb: 238.8,
        external_ssd: null
      },
      tailscale: {
        connected: true,
        mode: "Direct WireGuard Mesh",
        peer_count: 8
      },
      last_heartbeat: new Date().toISOString()
    },
    {
      id: "macmini-primary",
      canonical_name: "macmini-primary",
      display_name: "Mac Mini M4 — Leon (DevOps Core)",
      role: "Docker, n8n, Supabase, Kong & Firecrawl",
      ip: "100.83.83.8",
      status: "HEALTHY",
      cpu_pct: 22.0,
      ram: {
        used_pct: 67.3,
        total_gb: 16.0,
        used_gb: 10.8,
        free_gb: 5.2
      },
      storage: {
        root_used_pct: 90.7,
        root_free_gb: 21.9,
        root_total_gb: 238.8,
        external_ssd: null
      },
      tailscale: {
        connected: true,
        mode: "Direct WireGuard Mesh",
        peer_count: 8
      },
      last_heartbeat: new Date().toISOString()
    },
    {
      id: "macmini-secondary",
      canonical_name: "macmini-secondary",
      display_name: "Mac Mini M4 — Leon2 (Hot Standby)",
      role: "2TB PHILIPS SSD, Windows 11 VM & Deep Vault",
      ip: "100.70.181.127",
      status: "HEALTHY",
      cpu_pct: 23.5,
      ram: {
        used_pct: 52.5,
        total_gb: 16.0,
        used_gb: 8.4,
        free_gb: 7.6
      },
      storage: {
        root_used_pct: 13.0,
        root_free_gb: 79.5,
        root_total_gb: 228.0,
        external_ssd: {
          name: "PHILIPS_SSD (2TB NVMe)",
          mounted: true,
          mount_point: "/Volumes/PHILIPS_SSD",
          free_gb: 223.7,
          total_gb: 1906.0,
          used_pct: 88.3
        }
      },
      tailscale: {
        connected: true,
        mode: "Direct WireGuard Mesh",
        peer_count: 8
      },
      last_heartbeat: new Date().toISOString()
    }
  ]
};

export function useClusterHardwareTelemetry() {
  const [data, setData] = useState<ClusterTelemetryData>(FALLBACK_TELEMETRY);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState<boolean>(false);

  const fetchTelemetry = useCallback(async () => {
    try {
      const endpoints = [
        '/api/telemetry/nodes',
        '/api/cluster/hardware',
        'https://dashboard.openbalancer.com/api/telemetry/nodes'
      ];

      let fetchedData: ClusterTelemetryData | null = null;

      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint, {
            headers: { 'Accept': 'application/json' },
            cache: 'no-store'
          });
          if (res.ok) {
            const json = await res.json();
            if (json && json.nodes && Array.isArray(json.nodes)) {
              fetchedData = json;
              break;
            }
          }
        } catch (_) {
          // try next endpoint
        }
      }

      if (fetchedData) {
        setData(fetchedData);
        setIsLive(true);
        setError(null);
      } else {
        // Safe fallback
        setData(FALLBACK_TELEMETRY);
        setIsLive(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch cluster telemetry');
      setData(FALLBACK_TELEMETRY);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 15000);
    return () => clearInterval(interval);
  }, [fetchTelemetry]);

  return {
    data,
    loading,
    error,
    isLive,
    refresh: fetchTelemetry
  };
}
