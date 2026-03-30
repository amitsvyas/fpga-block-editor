"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";
import type { PortType } from "@/types/hardware";

export interface BusEdgeData extends Record<string, unknown> {
  busWidth: number;
  signalType: PortType;
}

// Visual encoding per signal type
const SIGNAL_COLOR: Record<PortType, string> = {
  clock:   "#facc15",
  data:    "#94a3b8",
  control: "#fb923c",
  axi:     "#a78bfa",
  power:   "#f87171",
};

// Stroke width: 1px for 1-bit, grows logarithmically for wider buses
function strokeWidth(bits: number): number {
  return Math.max(1.5, Math.log2(bits + 1) * 1.2);
}

export default function BusEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}: EdgeProps) {
  const busWidth   = (data as BusEdgeData)?.busWidth   ?? 1;
  const signalType = (data as BusEdgeData)?.signalType ?? "data";

  const color  = SIGNAL_COLOR[signalType as PortType] ?? SIGNAL_COLOR.data;
  const width  = strokeWidth(busWidth);
  const isWide = busWidth > 1;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      {/* Shadow / glow for selected state */}
      {selected && (
        <BaseEdge
          id={`${id}-glow`}
          path={edgePath}
          style={{
            stroke: color,
            strokeWidth: width + 4,
            strokeOpacity: 0.25,
            fill: "none",
          }}
        />
      )}

      {/* Main edge line */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: selected ? color : `${color}cc`,
          strokeWidth: width,
          fill: "none",
          strokeDasharray: signalType === "clock" ? "6 3" : undefined,
        }}
      />

      {/* Bus-width label — only for buses wider than 1 bit */}
      {isWide && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan absolute pointer-events-none"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            <span
              className="font-mono text-[9px] px-1 py-0.5 rounded"
              style={{
                background: "#1e1e2e",
                color,
                border: `1px solid ${color}66`,
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              [{busWidth - 1}:0]
            </span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
