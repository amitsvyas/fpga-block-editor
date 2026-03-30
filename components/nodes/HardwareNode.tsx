"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { templateForKind } from "@/lib/nodeTemplates";
import type { HardwareNode, Port, PortType } from "@/types/hardware";

const PORT_TYPE_COLORS: Record<PortType, string> = {
  clock:   "#facc15",
  data:    "#94a3b8",
  control: "#fb923c",
  axi:     "#a78bfa",
  power:   "#f87171",
};

const ROW_H = 26; // px per port row
const PADDING = 8; // top/bottom padding inside port body

function topForIndex(index: number, total: number): number {
  // Centre each handle within its evenly-spaced slot
  return PADDING + (index + 0.5) * (ROW_H);
}

export default function HardwareNode({ data, selected }: NodeProps<HardwareNode>) {
  const template = templateForKind(data.kind);

  const inputs  = data.ports.filter((p) => p.direction === "input");
  const outputs = data.ports.filter((p) => p.direction === "output");
  const bidirs  = data.ports.filter((p) => p.direction === "bidir");

  const rightPorts: Port[] = [...outputs, ...bidirs];
  const bodyHeight = Math.max(inputs.length, rightPorts.length) * ROW_H + PADDING * 2;

  const color = template.color;

  return (
    // NO overflow:hidden — handles extend beyond the boundary and must be clickable
    <div
      style={{
        minWidth: 210,
        background: "#252538",
        borderRadius: 6,
        border: selected ? `2px solid ${color}` : "1px solid #3a3a5c",
        boxShadow: selected
          ? `0 0 0 3px ${color}44, 0 4px 12px rgba(0,0,0,0.5)`
          : "0 2px 8px rgba(0,0,0,0.4)",
        fontFamily: "ui-monospace, monospace",
        fontSize: 11,
        userSelect: "none",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div
        style={{
          background: color,
          borderRadius: "4px 4px 0 0",
          padding: "5px 10px",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 11, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {data.instanceName}
        </span>
        <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", flexShrink: 0 }}>
          {template.label}
        </span>
      </div>

      {/* ── Port body ───────────────────────────────────────────────── */}
      {/*
          Handles are absolutely positioned WITHIN this div.
          This is the positioned ancestor, so top percentages work correctly.
          No overflow:hidden here — handles must poke outside at left:-6 / right:-6.
      */}
      <div style={{ position: "relative", height: bodyHeight }}>

        {/* Left side — input handles + labels */}
        {inputs.map((p, i) => {
          const top = topForIndex(i, inputs.length);
          return (
            <div key={p.id}>
              <Handle
                type="target"
                position={Position.Left}
                id={p.id}
                style={{
                  position: "absolute",
                  top,
                  left: -6,
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  background: PORT_TYPE_COLORS[p.type],
                  border: "2px solid #1e1e2e",
                  transform: "translateY(-50%)",
                  cursor: "crosshair",
                  zIndex: 10,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top,
                  left: 10,
                  transform: "translateY(-50%)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  maxWidth: "45%",
                  overflow: "hidden",
                }}
              >
                <span style={{ color: "#cbd5e1", fontSize: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {p.label}
                </span>
                {p.width > 1 && (
                  <span style={{ color: "#52525b", fontSize: 9, flexShrink: 0 }}>
                    [{p.width - 1}:0]
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Right side — output + bidir handles + labels */}
        {rightPorts.map((p, i) => {
          const top = topForIndex(i, rightPorts.length);
          const isBidir = p.direction === "bidir";
          const handleId = isBidir ? `${p.id}_src` : p.id;

          return (
            <div key={p.id}>
              {/* Source handle (output / bidir-src) */}
              <Handle
                type="source"
                position={Position.Right}
                id={handleId}
                style={{
                  position: "absolute",
                  top,
                  right: -6,
                  width: 11,
                  height: 11,
                  borderRadius: isBidir ? 2 : "50%",
                  background: PORT_TYPE_COLORS[p.type],
                  border: "2px solid #1e1e2e",
                  transform: "translateY(-50%)",
                  cursor: "crosshair",
                  zIndex: 10,
                }}
              />

              {/* Hidden target handle for bidir (allows incoming connections) */}
              {isBidir && (
                <Handle
                  type="target"
                  position={Position.Right}
                  id={`${p.id}_tgt`}
                  style={{
                    position: "absolute",
                    top,
                    right: -6,
                    width: 11,
                    height: 11,
                    background: "transparent",
                    border: "none",
                    transform: "translateY(-50%)",
                    zIndex: 9,
                  }}
                />
              )}

              {/* Label */}
              <div
                style={{
                  position: "absolute",
                  top,
                  right: 10,
                  transform: "translateY(-50%)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  maxWidth: "45%",
                  overflow: "hidden",
                  flexDirection: "row-reverse",
                }}
              >
                <span style={{ color: "#cbd5e1", fontSize: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {isBidir ? `↕ ${p.label}` : p.label}
                </span>
                {p.width > 1 && (
                  <span style={{ color: "#52525b", fontSize: 9, flexShrink: 0 }}>
                    [{p.width - 1}:0]
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      {data.clockDomain && (
        <div
          style={{
            padding: "3px 10px",
            fontSize: 9,
            color: "#52525b",
            borderTop: "1px solid #3a3a5c",
            borderRadius: "0 0 4px 4px",
            display: "flex",
            gap: 8,
          }}
        >
          <span>⏱ {data.clockDomain}</span>
          {data.targetFmaxMhz > 0 && <span>{data.targetFmaxMhz} MHz</span>}
        </div>
      )}
    </div>
  );
}
