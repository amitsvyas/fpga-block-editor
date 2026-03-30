"use client";

import { useState, useRef, useEffect } from "react";
import { Download, ChevronDown } from "lucide-react";
import { useDiagramStore } from "@/store/diagramStore";
import { exportToNetlist } from "@/lib/exportNetlist";
import { exportToVerilog } from "@/lib/exportVerilog";
import { exportToVhdl } from "@/lib/exportVhdl";

type Format = "json" | "verilog" | "vhdl";

const FORMAT_LABELS: Record<Format, string> = {
  json:    "JSON Netlist",
  verilog: "Verilog (.v)",
  vhdl:    "VHDL (.vhd)",
};

const FORMAT_HINTS: Record<Format, string> = {
  json:    "Hardware netlist — modules + nets",
  verilog: "Structural RTL — Radiant / Vivado",
  vhdl:    "Structural RTL — Radiant / Vivado",
};

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExportButton() {
  const { nodes, edges } = useDiagramStore();
  const [open, setOpen]   = useState(false);
  const ref               = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleExport(fmt: Format) {
    setOpen(false);
    const ts = Date.now();
    if (fmt === "json") {
      download(JSON.stringify(exportToNetlist(nodes, edges), null, 2),
               `fpga_schematic_${ts}.json`, "application/json");
    } else if (fmt === "verilog") {
      download(exportToVerilog(nodes, edges),
               `fpga_top_${ts}.v`, "text/plain");
    } else {
      download(exportToVhdl(nodes, edges),
               `fpga_top_${ts}.vhd`, "text/plain");
    }
  }

  const btnBase: React.CSSProperties = {
    display:     "flex",
    alignItems:  "center",
    background:  "none",
    border:      "none",
    cursor:      "pointer",
    color:       "#e2e8f0",
    fontSize:    11,
    fontWeight:  600,
    fontFamily:  "ui-monospace, monospace",
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Main split button row */}
      <div style={{
        display:      "flex",
        alignItems:   "center",
        background:   "#4f46e5",
        border:       "1px solid #6366f1",
        borderRadius: 4,
        overflow:     "hidden",
      }}>
        {/* Primary action: JSON export */}
        <button
          onClick={() => handleExport("json")}
          style={{ ...btnBase, gap: 6, padding: "4px 10px", letterSpacing: "0.04em" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
          title="Export JSON netlist"
        >
          <Download size={13} />
          Export
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 22, background: "#6366f1" }} />

        {/* Chevron — opens format picker */}
        <button
          onClick={() => setOpen((v) => !v)}
          style={{ ...btnBase, padding: "4px 6px" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
          title="Choose export format"
        >
          <ChevronDown size={11} />
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position:     "absolute",
          top:          "calc(100% + 4px)",
          right:        0,
          minWidth:     180,
          background:   "#1e1e38",
          border:       "1px solid #3a3a5c",
          borderRadius: 4,
          boxShadow:    "0 4px 12px rgba(0,0,0,0.5)",
          zIndex:       9999,
          overflow:     "hidden",
        }}>
          {(["json", "verilog", "vhdl"] as Format[]).map((fmt) => (
            <button
              key={fmt}
              onClick={() => handleExport(fmt)}
              style={{
                width:       "100%",
                display:     "flex",
                flexDirection: "column",
                alignItems:  "flex-start",
                padding:     "7px 12px",
                background:  "none",
                border:      "none",
                cursor:      "pointer",
                gap:         2,
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#2a2a4a")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
            >
              <span style={{ fontSize: 11, fontWeight: 600, color: "#e2e8f0", fontFamily: "ui-monospace, monospace" }}>
                {FORMAT_LABELS[fmt]}
              </span>
              <span style={{ fontSize: 9, color: "#71717a" }}>
                {FORMAT_HINTS[fmt]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
