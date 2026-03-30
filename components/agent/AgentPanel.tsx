"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useDiagramStore } from "@/store/diagramStore";
import type { HardwareNode } from "@/types/hardware";
import type { Edge } from "@xyflow/react";

interface Message {
  role: "user" | "agent";
  text: string;
  nodes?: number;
  edges?: number;
  error?: boolean;
}

const EXAMPLES = [
  "PCIe Gen3 system with DDR4 and a VexRiscv CPU",
  "Ethernet + MIPI camera design with RISC-V",
  "Basic clock + DSP + RAM block design",
  "Full power tree for a Lattice Avant board",
];

export default function AgentPanel({ onClose }: { onClose: () => void }) {
  const { nodes, applyAgentDesign } = useDiagramStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "agent",
      text: "Describe the FPGA system you want to design and I'll build the block diagram for you. You can ask for a complete system or just specific subsystems.",
    },
  ]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [replace, setReplace]   = useState(true);
  const bottomRef               = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const prompt = input.trim();
    if (!prompt || loading) return;

    setInput("");
    setMessages((m) => [...m, { role: "user", text: prompt }]);
    setLoading(true);

    try {
      const existingInstanceNames = replace
        ? []
        : nodes.map((n) => n.data.instanceName);

      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, existingInstanceNames }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setMessages((m) => [
          ...m,
          { role: "agent", text: data.error ?? "Something went wrong.", error: true },
        ]);
        return;
      }

      // Apply to canvas
      applyAgentDesign(data.nodes as HardwareNode[], data.edges as Edge[], replace);

      setMessages((m) => [
        ...m,
        {
          role: "agent",
          text: data.message || "Design generated successfully.",
          nodes: data.nodes.length,
          edges: data.edges.length,
        },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "agent", text: `Network error: ${err instanceof Error ? err.message : "unknown"}`, error: true },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        width: 340,
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
          background: "#12121f",
        }}
      >
        <Sparkles size={14} color="#6366f1" />
        <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>
          AI Design Agent
        </span>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#52525b", display: "flex" }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px 0" }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              marginBottom: 12,
              display: "flex",
              flexDirection: "column",
              alignItems: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "88%",
                padding: "8px 10px",
                borderRadius: msg.role === "user" ? "10px 10px 2px 10px" : "10px 10px 10px 2px",
                background: msg.role === "user"
                  ? "#4f46e5"
                  : msg.error ? "#3f1212" : "#1e1e38",
                border: msg.error ? "1px solid #7f1d1d" : "1px solid transparent",
                fontSize: 12,
                color: msg.error ? "#fca5a5" : "#e2e8f0",
                lineHeight: 1.5,
              }}
            >
              {msg.text}
            </div>
            {msg.nodes !== undefined && (
              <div
                style={{
                  marginTop: 5,
                  display: "flex",
                  gap: 6,
                  fontSize: 10,
                  color: "#4ade80",
                  alignItems: "center",
                }}
              >
                <CheckCircle size={11} />
                {msg.nodes} blocks · {msg.edges} connections added to canvas
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div
              style={{
                padding: "8px 10px",
                borderRadius: "10px 10px 10px 2px",
                background: "#1e1e38",
                fontSize: 12,
                color: "#71717a",
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
              Generating design…
            </div>
          </div>
        )}

        {/* Example prompts (only show when empty) */}
        {messages.length === 1 && !loading && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 10, color: "#52525b", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Try an example
            </p>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setInput(ex)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  background: "none",
                  border: "1px solid #27272a",
                  borderRadius: 6,
                  padding: "6px 8px",
                  marginBottom: 5,
                  cursor: "pointer",
                  fontSize: 11,
                  color: "#71717a",
                  lineHeight: 1.4,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "#4f46e5";
                  (e.currentTarget as HTMLElement).style.color = "#a1a1aa";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "#27272a";
                  (e.currentTarget as HTMLElement).style.color = "#71717a";
                }}
              >
                {ex}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Mode toggle */}
      <div
        style={{
          padding: "8px 12px",
          borderTop: "1px solid #27272a",
          display: "flex",
          gap: 6,
          flexShrink: 0,
        }}
      >
        {(["replace", "add"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setReplace(mode === "replace")}
            style={{
              flex: 1,
              padding: "4px 0",
              borderRadius: 4,
              border: "1px solid",
              borderColor: (mode === "replace") === replace ? "#6366f1" : "#27272a",
              background: (mode === "replace") === replace ? "#1e1e4a" : "none",
              color: (mode === "replace") === replace ? "#a5b4fc" : "#52525b",
              fontSize: 10,
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            {mode === "replace" ? "Replace canvas" : "Add to canvas"}
          </button>
        ))}
      </div>

      {/* Input */}
      <div
        style={{
          padding: "8px 12px 12px",
          borderTop: "1px solid #27272a",
          display: "flex",
          gap: 8,
          flexShrink: 0,
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
          }}
          placeholder="Describe your FPGA system…"
          rows={3}
          style={{
            flex: 1,
            background: "#1e1e2e",
            border: "1px solid #3a3a5c",
            borderRadius: 6,
            padding: "7px 9px",
            fontSize: 11,
            color: "#e2e8f0",
            fontFamily: "inherit",
            resize: "none",
            outline: "none",
            lineHeight: 1.5,
          }}
          onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
          onBlur={(e) => (e.target.style.borderColor = "#3a3a5c")}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{
            alignSelf: "flex-end",
            width: 34,
            height: 34,
            borderRadius: 6,
            background: loading || !input.trim() ? "#27272a" : "#4f46e5",
            border: "none",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            color: "#e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {loading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={14} />}
        </button>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
