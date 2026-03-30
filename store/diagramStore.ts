import { create } from "zustand";
import { applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import type {
  NodeChange,
  EdgeChange,
  Edge,
  Connection,
} from "@xyflow/react";
import { addEdge } from "@xyflow/react";
import type { HardwareNode, NodeData, Port } from "@/types/hardware";

interface DiagramState {
  nodes: HardwareNode[];
  edges: Edge[];
  selectedNodeId: string | null;

  // React Flow change handlers
  onNodesChange: (changes: NodeChange<HardwareNode>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection | Edge) => void;

  // Canvas mutations
  addNode: (node: HardwareNode) => void;
  setEdges: (updater: (edges: Edge[]) => Edge[]) => void;

  // Selection
  setSelectedNodeId: (id: string | null) => void;

  // Node data editing
  updateNodeData: (id: string, patch: Partial<NodeData>) => void;
  updatePort: (nodeId: string, portIndex: number, patch: Partial<Port>) => void;
  addPort: (nodeId: string, port: Port) => void;
  removePort: (nodeId: string, portIndex: number) => void;

  // Agent design
  applyAgentDesign: (nodes: HardwareNode[], edges: Edge[], replace: boolean) => void;
}

export const useDiagramStore = create<DiagramState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,

  onNodesChange: (changes) =>
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    })),

  onEdgesChange: (changes) =>
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    })),

  onConnect: (connection) =>
    set((state) => ({
      edges: addEdge(connection, state.edges),
    })),

  addNode: (node) =>
    set((state) => ({ nodes: [...state.nodes, node] })),

  setEdges: (updater) =>
    set((state) => ({ edges: updater(state.edges) })),

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  updateNodeData: (id, patch) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...patch } } : n
      ),
    })),

  updatePort: (nodeId, portIndex, patch) =>
    set((state) => ({
      nodes: state.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        const ports = n.data.ports.map((p, i) =>
          i === portIndex ? { ...p, ...patch } : p
        );
        return { ...n, data: { ...n.data, ports } };
      }),
    })),

  addPort: (nodeId, port) =>
    set((state) => ({
      nodes: state.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        return { ...n, data: { ...n.data, ports: [...n.data.ports, port] } };
      }),
    })),

  removePort: (nodeId, portIndex) =>
    set((state) => ({
      nodes: state.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        const ports = n.data.ports.filter((_, i) => i !== portIndex);
        return { ...n, data: { ...n.data, ports } };
      }),
    })),

  applyAgentDesign: (newNodes, newEdges, replace) =>
    set((state) => ({
      nodes: replace ? newNodes : [...state.nodes, ...newNodes],
      edges: replace ? newEdges : [...state.edges, ...newEdges],
    })),
}));
