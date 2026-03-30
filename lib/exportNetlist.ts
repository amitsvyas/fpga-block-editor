import type { Edge } from "@xyflow/react";
import type { HardwareNode } from "@/types/hardware";

export interface NetlistPort {
  id: string;
  direction: string;
  width: number;
  type: string;
}

export interface NetlistModule {
  instance_id: string;
  instance_name: string;
  ip_type: string;
  clock_domain: string;
  target_fmax_mhz: number;
  power_estimate: string;
  ports: NetlistPort[];
  parameters: Record<string, unknown>;
}

export interface NetlistEndpoint {
  instance_id: string;
  port_id: string;
}

export interface NetlistNet {
  net_id: string;
  source: NetlistEndpoint;
  target: NetlistEndpoint;
  width: number;
  signal_type: string;
}

export interface NetlistJSON {
  schematic: {
    version: string;
    target_device: string;
    exported_at: string;
    modules: NetlistModule[];
    nets: NetlistNet[];
  };
}

function basePortId(handleId: string): string {
  // strip _src / _tgt suffixes added for bidir handles
  return handleId.replace(/_(src|tgt)$/, "");
}

export function exportToNetlist(nodes: HardwareNode[], edges: Edge[]): NetlistJSON {
  const modules: NetlistModule[] = nodes.map((n) => ({
    instance_id: n.id,
    instance_name: n.data.instanceName,
    ip_type: n.data.kind,
    clock_domain: n.data.clockDomain,
    target_fmax_mhz: n.data.targetFmaxMhz,
    power_estimate: n.data.powerEstimate,
    ports: n.data.ports.map((p) => ({
      id: p.id,
      direction: p.direction,
      width: p.width,
      type: p.type,
    })),
    parameters: {},
  }));

  const nets: NetlistNet[] = edges.map((e) => {
    const edgeData = (e.data ?? {}) as { busWidth?: number; signalType?: string };
    return {
      net_id: e.id,
      source: {
        instance_id: e.source,
        port_id: basePortId(e.sourceHandle ?? ""),
      },
      target: {
        instance_id: e.target,
        port_id: basePortId(e.targetHandle ?? ""),
      },
      width: edgeData.busWidth ?? 1,
      signal_type: edgeData.signalType ?? "data",
    };
  });

  return {
    schematic: {
      version: "1.0",
      target_device: "Lattice Avant",
      exported_at: new Date().toISOString(),
      modules,
      nets,
    },
  };
}
