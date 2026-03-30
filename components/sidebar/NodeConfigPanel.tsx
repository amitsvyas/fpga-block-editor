"use client";

import { useCallback } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { useDiagramStore } from "@/store/diagramStore";
import { templateForKind } from "@/lib/nodeTemplates";
import type { Port, PortDirection, PortType } from "@/types/hardware";

const DIRECTIONS: PortDirection[] = ["input", "output", "bidir"];
const PORT_TYPES: PortType[] = ["clock", "data", "control", "axi", "power"];

const PORT_TYPE_COLORS: Record<PortType, string> = {
  clock:   "#facc15",
  data:    "#94a3b8",
  control: "#fb923c",
  axi:     "#a78bfa",
  power:   "#f87171",
};

// ── small reusable field components ─────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ fontSize: 10, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 3 }}>
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        background: "#1e1e2e",
        border: "1px solid #3a3a5c",
        borderRadius: 4,
        padding: "4px 8px",
        fontSize: 11,
        color: "#e2e8f0",
        fontFamily: "ui-monospace, monospace",
        outline: "none",
      }}
      onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
      onBlur={(e) => (e.target.style.borderColor = "#3a3a5c")}
    />
  );
}

function NumberInput({
  value,
  onChange,
  min = 0,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{
        width: "100%",
        background: "#1e1e2e",
        border: "1px solid #3a3a5c",
        borderRadius: 4,
        padding: "4px 8px",
        fontSize: 11,
        color: "#e2e8f0",
        fontFamily: "ui-monospace, monospace",
        outline: "none",
      }}
      onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
      onBlur={(e) => (e.target.style.borderColor = "#3a3a5c")}
    />
  );
}

function SelectInput<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: T[];
  onChange: (v: T) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      style={{
        width: "100%",
        background: "#1e1e2e",
        border: "1px solid #3a3a5c",
        borderRadius: 4,
        padding: "4px 8px",
        fontSize: 11,
        color: "#e2e8f0",
        fontFamily: "ui-monospace, monospace",
        outline: "none",
        cursor: "pointer",
      }}
    >
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "12px 0 8px" }}>
      <span style={{ fontSize: 9, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "#27272a" }} />
    </div>
  );
}

// ── Port row editor ──────────────────────────────────────────────────────────

function PortRow({
  port,
  index,
  nodeId,
}: {
  port: Port;
  index: number;
  nodeId: string;
}) {
  const { updatePort, removePort } = useDiagramStore();

  const update = useCallback(
    (patch: Partial<Port>) => updatePort(nodeId, index, patch),
    [nodeId, index, updatePort]
  );

  return (
    <div
      style={{
        background: "#1a1a2e",
        border: "1px solid #2a2a45",
        borderLeft: `3px solid ${PORT_TYPE_COLORS[port.type]}`,
        borderRadius: 4,
        padding: "6px 8px",
        display: "flex",
        flexDirection: "column",
        gap: 5,
      }}
    >
      {/* Row 1: id + delete */}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <TextInput
            value={port.id}
            placeholder="port_id"
            onChange={(v) => update({ id: v })}
          />
        </div>
        <button
          onClick={() => removePort(nodeId, index)}
          style={{
            background: "none",
            border: "1px solid #3a3a5c",
            borderRadius: 4,
            padding: "3px 6px",
            cursor: "pointer",
            color: "#71717a",
            display: "flex",
            alignItems: "center",
          }}
          title="Remove port"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Row 2: label */}
      <TextInput
        value={port.label}
        placeholder="display label"
        onChange={(v) => update({ label: v })}
      />

      {/* Row 3: direction + type + width */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 60px", gap: 5 }}>
        <SelectInput<PortDirection>
          value={port.direction}
          options={DIRECTIONS}
          onChange={(v) => update({ direction: v })}
        />
        <SelectInput<PortType>
          value={port.type}
          options={PORT_TYPES}
          onChange={(v) => update({ type: v })}
        />
        <NumberInput
          value={port.width}
          min={1}
          onChange={(v) => update({ width: v })}
        />
      </div>
    </div>
  );
}

// ── Main panel ───────────────────────────────────────────────────────────────

export default function NodeConfigPanel() {
  const { nodes, selectedNodeId, setSelectedNodeId, updateNodeData, addPort } =
    useDiagramStore();

  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;
  const nodeId = node.id;

  const { data } = node;
  const template = templateForKind(data.kind);

  function handleAddPort() {
    const newPort: Port = {
      id: `port_${Date.now()}`,
      label: "new_port",
      direction: "input",
      width: 1,
      type: "data",
    };
    addPort(nodeId, newPort);
  }

  return (
    <aside
      style={{
        width: 260,
        flexShrink: 0,
        background: "#16162a",
        borderLeft: "1px solid #3a3a5c",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "10px 12px 8px",
          borderBottom: "1px solid #27272a",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: template.color,
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, overflow: "hidden" }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#e2e8f0", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {data.instanceName}
          </p>
          <p style={{ fontSize: 9, color: "#52525b", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {template.label}
          </p>
        </div>
        <button
          onClick={() => setSelectedNodeId(null)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#52525b", padding: 2, display: "flex" }}
          title="Close"
        >
          <X size={14} />
        </button>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 12px 16px" }}>

        {/* ── Identity ─────────────────────────────────────────── */}
        <SectionDivider label="Identity" />

        <div style={{ marginBottom: 8 }}>
          <FieldLabel>Instance Name</FieldLabel>
          <TextInput
            value={data.instanceName}
            onChange={(v) => updateNodeData(nodeId, { instanceName: v })}
          />
        </div>

        <div style={{ marginBottom: 8 }}>
          <FieldLabel>Clock Domain</FieldLabel>
          <TextInput
            value={data.clockDomain}
            onChange={(v) => updateNodeData(nodeId, { clockDomain: v })}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          <div>
            <FieldLabel>Target Fmax (MHz)</FieldLabel>
            <NumberInput
              value={data.targetFmaxMhz}
              onChange={(v) => updateNodeData(nodeId, { targetFmaxMhz: v })}
            />
          </div>
          <div>
            <FieldLabel>IP Type</FieldLabel>
            <input
              type="text"
              value={data.kind}
              disabled
              style={{
                width: "100%",
                background: "#12121f",
                border: "1px solid #27272a",
                borderRadius: 4,
                padding: "4px 8px",
                fontSize: 11,
                color: "#3f3f5c",
                fontFamily: "ui-monospace, monospace",
                cursor: "not-allowed",
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 8 }}>
          <FieldLabel>Power Estimate</FieldLabel>
          <TextInput
            value={data.powerEstimate}
            placeholder="e.g. 150 mW"
            onChange={(v) => updateNodeData(nodeId, { powerEstimate: v })}
          />
        </div>

        {/* ── Ports ────────────────────────────────────────────── */}
        <SectionDivider label={`Ports (${data.ports.length})`} />

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {data.ports.map((port, i) => (
            <PortRow key={`${port.id}-${i}`} port={port} index={i} nodeId={nodeId} />
          ))}
        </div>

        <button
          onClick={handleAddPort}
          style={{
            marginTop: 8,
            width: "100%",
            background: "none",
            border: "1px dashed #3a3a5c",
            borderRadius: 4,
            padding: "6px 0",
            cursor: "pointer",
            color: "#52525b",
            fontSize: 11,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#a1a1aa";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#52525b";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#52525b";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#3a3a5c";
          }}
        >
          <Plus size={12} />
          Add Port
        </button>

        {/* ── Node ID (read-only debug info) ────────────────────── */}
        <SectionDivider label="Debug" />
        <div style={{ fontSize: 9, color: "#3f3f5c", fontFamily: "ui-monospace, monospace" }}>
          <div>ID: {nodeId}</div>
          <div>x: {Math.round(node.position.x)} y: {Math.round(node.position.y)}</div>
        </div>
      </div>
    </aside>
  );
}
