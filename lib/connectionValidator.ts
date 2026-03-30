import type { Connection, Edge } from "@xyflow/react";
import type { HardwareNode, Port, PortType } from "@/types/hardware";

// Signal types that must only connect to the same type
const STRICT_TYPES: PortType[] = ["clock", "power"];

// Strip bidir handle suffixes to get the base port ID
function basePortId(handleId: string): string {
  if (handleId.endsWith("_src") || handleId.endsWith("_tgt")) {
    return handleId.slice(0, -4);
  }
  return handleId;
}

function findPort(node: HardwareNode, handleId: string): Port | undefined {
  const base = basePortId(handleId);
  return node.data.ports.find((p) => p.id === base);
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export function validateConnection(
  connection: Connection | Edge,
  nodes: HardwareNode[]
): ValidationResult {
  const { source, target, sourceHandle, targetHandle } = connection;

  // 1. No self-connections
  if (source === target) {
    return { valid: false, reason: "Cannot connect a node to itself" };
  }

  // 2. Both handles must be specified
  if (!sourceHandle || !targetHandle) {
    return { valid: false, reason: "Missing handle information" };
  }

  const sourceNode = nodes.find((n) => n.id === source);
  const targetNode = nodes.find((n) => n.id === target);

  if (!sourceNode || !targetNode) {
    return { valid: false, reason: "Node not found" };
  }

  const sourcePort = findPort(sourceNode, sourceHandle);
  const targetPort = findPort(targetNode, targetHandle);

  if (!sourcePort || !targetPort) {
    // Unknown port — allow by default (graceful degradation)
    return { valid: true };
  }

  // 3. Direction rules
  //    Source handles come from: output ports and bidir _src handles
  //    Target handles come from: input ports and bidir _tgt handles
  //    React Flow already enforces source→target, so we only need to
  //    block output→output (two source handles on same connection attempt).
  if (sourcePort.direction === "output" && targetPort.direction === "output") {
    return { valid: false, reason: "Cannot connect two output ports" };
  }
  if (sourcePort.direction === "input" && targetPort.direction === "input") {
    return { valid: false, reason: "Cannot connect two input ports" };
  }

  // 4. Strict signal-type compatibility
  //    Clock and power rails must only connect to the same type.
  if (STRICT_TYPES.includes(sourcePort.type) || STRICT_TYPES.includes(targetPort.type)) {
    if (sourcePort.type !== targetPort.type) {
      return {
        valid: false,
        reason: `Type mismatch: cannot connect ${sourcePort.type} → ${targetPort.type}`,
      };
    }
  }

  return { valid: true };
}

// Returns a plain boolean for use in React Flow's isValidConnection prop
export function makeConnectionValidator(nodes: HardwareNode[]) {
  return (connection: Connection | Edge): boolean => {
    return validateConnection(connection, nodes).valid;
  };
}

// Given a connection and node list, return the source port (for edge enrichment)
export function resolveSourcePort(
  connection: Connection | Edge,
  nodes: HardwareNode[]
): Port | undefined {
  if (!connection.source || !connection.sourceHandle) return undefined;
  const node = nodes.find((n) => n.id === connection.source);
  if (!node) return undefined;
  return findPort(node, connection.sourceHandle);
}
