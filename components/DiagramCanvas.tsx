"use client";

import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type EdgeTypes,
  type NodeTypes,
  type IsValidConnection,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useRef, useState } from "react";

import HardwareNode from "@/components/nodes/HardwareNode";
import BusEdge from "@/components/edges/BusEdge";
import NodePalette from "@/components/NodePalette";
import NodeConfigPanel from "@/components/sidebar/NodeConfigPanel";
import ExportButton from "@/components/toolbar/ExportButton";
import AgentPanel from "@/components/agent/AgentPanel";
import { Sparkles } from "lucide-react";
import { templateForKind } from "@/lib/nodeTemplates";
import { makeConnectionValidator, resolveSourcePort } from "@/lib/connectionValidator";
import { useDiagramStore } from "@/store/diagramStore";
import type { NodeKind, HardwareNode as HardwareNodeType } from "@/types/hardware";

const nodeTypes: NodeTypes = { hardware: HardwareNode };
const edgeTypes: EdgeTypes = { bus: BusEdge };

let nodeCounter = 1;

function FlowCanvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    setEdges,
    addNode,
    setSelectedNodeId,
  } = useDiagramStore();

  const { screenToFlowPosition } = useReactFlow();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const isValidConnection: IsValidConnection = useCallback(
    (connection) => makeConnectionValidator(nodes)(connection),
    [nodes]
  );

  const onConnect = useCallback(
    (connection: Parameters<typeof addEdge>[0]) => {
      const sourcePort = resolveSourcePort(connection, nodes);
      const enriched: Edge = {
        ...(connection as Edge),
        type: "bus",
        data: {
          busWidth:   sourcePort?.width   ?? 1,
          signalType: sourcePort?.type    ?? "data",
        },
      };
      setEdges((eds) => addEdge(enriched, eds));
    },
    [nodes, setEdges]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const kind = e.dataTransfer.getData("application/fpga-node-kind") as NodeKind;
      if (!kind) return;

      const template = templateForKind(kind);
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });

      const newNode: HardwareNodeType = {
        id: `node_${nodeCounter++}`,
        type: "hardware",
        position,
        data: {
          ...template.defaultData,
          instanceName: `${template.defaultData.instanceName}_${nodeCounter - 1}`,
          ports: template.defaultData.ports.map((p) => ({ ...p })),
        },
      };

      addNode(newNode);
    },
    [screenToFlowPosition, addNode]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: HardwareNodeType) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  return (
    <div className="flex h-full w-full">
      <NodePalette />

      <div
        ref={wrapperRef}
        className="flex-1 h-full"
        onDragOver={onDragOver}
        onDrop={onDrop}
        style={{ background: "#1e1e2e" }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          isValidConnection={isValidConnection}
          snapToGrid
          snapGrid={[16, 16]}
          fitView
          colorMode="dark"
          defaultEdgeOptions={{ type: "bus", animated: false }}
          style={{ background: "#1e1e2e" }}
          deleteKeyCode="Delete"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1.5}
            color="#4a4a6a"
          />
          <Controls position="bottom-right" style={{ bottom: 24, right: 24 }} />
          <MiniMap
            position="bottom-left"
            style={{
              bottom: 24,
              left: 24,
              background: "#2a2a3e",
              border: "1px solid #4a4a6a",
            }}
            maskColor="rgba(10,10,20,0.5)"
            nodeColor="#6366f1"
          />
        </ReactFlow>
      </div>

      <NodeConfigPanel />
    </div>
  );
}

export default function DiagramCanvas() {
  const [agentOpen, setAgentOpen] = useState(false);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Toolbar */}
      <div
        style={{
          height: 36,
          background: "#12121f",
          borderBottom: "1px solid #3a3a5c",
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          gap: 8,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 11, color: "#52525b", fontFamily: "ui-monospace, monospace", marginRight: "auto" }}>
          Lattice Avant — FPGA Block Editor
        </span>
        <button
          onClick={() => setAgentOpen((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 12px",
            background: agentOpen ? "#1e1e4a" : "none",
            border: `1px solid ${agentOpen ? "#6366f1" : "#3a3a5c"}`,
            borderRadius: 4,
            color: agentOpen ? "#a5b4fc" : "#71717a",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "ui-monospace, monospace",
            letterSpacing: "0.04em",
          }}
        >
          <Sparkles size={13} />
          AI Agent
        </button>
        <ExportButton />
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-hidden flex flex-row">
        <ReactFlowProvider>
          <FlowCanvas />
        </ReactFlowProvider>
        {agentOpen && <AgentPanel onClose={() => setAgentOpen(false)} />}
      </div>
    </div>
  );
}
