import Anthropic from "@anthropic-ai/sdk";
import { NODE_TEMPLATES, templateForKind } from "./nodeTemplates";
import type { HardwareNode, NodeKind } from "@/types/hardware";
import type { Edge } from "@xyflow/react";

// ── Tool definitions ─────────────────────────────────────────────────────────
export const TOOLS: Anthropic.Tool[] = [
  {
    name: "add_node",
    description: "Place a hardware block on the canvas. Call this before add_edge.",
    input_schema: {
      type: "object" as const,
      properties: {
        kind:           { type: "string", description: "NodeKind identifier from the block list" },
        instanceName:   { type: "string", description: "RTL instance name, e.g. u_pll, u_ddr4_ctrl" },
        x:              { type: "number", description: "Canvas X position (see positioning guide)" },
        y:              { type: "number", description: "Canvas Y position (row spacing: 250px)" },
        clockDomain:    { type: "string", description: "Clock domain name, e.g. clk_sys, clk_ddr" },
        targetFmaxMhz:  { type: "number", description: "Target Fmax in MHz (0 for non-fabric blocks)" },
      },
      required: ["kind", "instanceName", "x", "y"],
    },
  },
  {
    name: "add_edge",
    description: "Connect an output/bidir port to an input/bidir port. Both nodes must already exist.",
    input_schema: {
      type: "object" as const,
      properties: {
        sourceInstance: { type: "string", description: "instanceName of source node" },
        sourcePort:     { type: "string", description: "Port ID on source node (must be output or bidir)" },
        targetInstance: { type: "string", description: "instanceName of target node" },
        targetPort:     { type: "string", description: "Port ID on target node (must be input or bidir)" },
      },
      required: ["sourceInstance", "sourcePort", "targetInstance", "targetPort"],
    },
  },
];

// ── System prompt (generated from live template data) ────────────────────────
export function buildSystemPrompt(): string {
  const dir = (d: string) => d === "input" ? "in" : d === "output" ? "out" : "bi";
  const typ = (t: string) => ({ clock: "clk", data: "dat", control: "ctl", axi: "axi", power: "pwr" }[t] ?? t);

  const blockList = NODE_TEMPLATES.map((t) => {
    const ports = t.defaultData.ports
      .map((p) => `${p.id}(${dir(p.direction)},${typ(p.type)},${p.width}b)`)
      .join("  ");
    return `  ${t.kind.padEnd(22)} [${t.label}]\n    ports: ${ports}`;
  }).join("\n");

  return `You are an expert FPGA system architect for Lattice Avant FPGAs.
Design systems by calling add_node to place blocks, then add_edge to wire them.
Always add all nodes first, then add edges.

POSITIONING (canvas coordinates):
  x  50–250   : I/O pads, external clocks (world boundary)
  x 350–550   : Interface chips (PHY, clock synth, DRAM chips)
  x 650–850   : FPGA high-speed interfaces (SerDes, PCIe PCS/Ctrl, MAC, MIPI)
  x 950–1150  : FPGA fabric (processors, DSP blocks, AXI crossbar)
  x 1250–1450 : Memory controllers (DDR, HyperBus)
  x 1550–1750 : External memory chips
  y spacing   : 250px per row (50, 300, 550, 800, 1050)
  Power rail  : y = 1350+, spread across bottom

CONNECTION RULES:
  - out→in and bi↔in/out/bi are valid; in→in and out→out are invalid
  - clock ports only connect to clock ports
  - power ports only connect to power ports
  - data/control/axi can cross-connect freely

DESIGN PATTERNS:
  PCIe:       io_pad(refclk) → clock_domain → serdes_pma → pcie_pcs → pcie_ctrl
  DDR4:       ddr4_ctrl ↔ chip_ddr3_sdram (parallel bus); ddr4_ctrl.ui_clk→fabric
  Ethernet:   ethernet_mac.gmii_* ↔ chip_eth_phy.gmii_*
  CPU system: clock_domain.clk_out0 → oss_vexriscv.clk; oss_vexriscv.axi_m → oss_axi_crossbar
  Power:      pwr_multiphase → FPGA VCCCORE; pwr_ldo → I/O banks; pwr_sequencer controls all ENs
  Clock dist: clock_domain.clk_out0 → all fabric clk ports in same clock domain

IMPORTANT:
  - Always place an io_pad for every signal crossing the FPGA boundary
  - Use io_pad.dout for signals coming IN to the FPGA fabric (io_pad is an input pad)
  - Use io_pad.din for signals going OUT from the FPGA fabric (io_pad is an output pad)
  - Give every node a short descriptive instanceName (u_pll, u_cpu, u_ddr4, u_eth_mac)
  - Set clockDomain on every fabric block (e.g. "clk_sys", "clk_ddr", "clk_pcie")
  - Set targetFmaxMhz only on clocked FPGA fabric blocks (0 for chips)

AVAILABLE BLOCKS AND THEIR PORTS:
${blockList}`;
}

// ── Virtual canvas state (server-side during agentic loop) ───────────────────
interface VirtualState {
  nodes: HardwareNode[];
  edges: Edge[];
  instanceToId: Map<string, string>;
  nodeCounter: number;
  edgeCounter: number;
}

function executeTool(
  name: string,
  input: Record<string, unknown>,
  state: VirtualState
): string {
  // ── add_node ──────────────────────────────────────────────────────────────
  if (name === "add_node") {
    const kind = String(input.kind ?? "");
    const instanceName = String(input.instanceName ?? "");
    const x = Number(input.x ?? 0);
    const y = Number(input.y ?? 0);
    const clockDomain = String(input.clockDomain ?? "");
    const targetFmaxMhz = Number(input.targetFmaxMhz ?? 0);

    // Validate kind
    const allKinds = NODE_TEMPLATES.map((t) => t.kind);
    if (!allKinds.includes(kind as NodeKind)) {
      return `Error: unknown kind "${kind}". Valid kinds: ${allKinds.slice(0, 10).join(", ")}...`;
    }

    if (state.instanceToId.has(instanceName)) {
      return `Error: instanceName "${instanceName}" already used. Choose a different name.`;
    }

    const template = templateForKind(kind as NodeKind);
    const nodeId = `agent_${Date.now()}_${state.nodeCounter++}`;

    const node: HardwareNode = {
      id: nodeId,
      type: "hardware",
      position: { x, y },
      data: {
        ...template.defaultData,
        instanceName,
        clockDomain,
        targetFmaxMhz,
        ports: template.defaultData.ports.map((p) => ({ ...p })),
      },
    };

    state.nodes.push(node);
    state.instanceToId.set(instanceName, nodeId);

    const portList = node.data.ports
      .map((p) => `${p.id}(${p.direction})`)
      .join(", ");
    return `OK: added ${instanceName} (${kind}) at (${x},${y}). Ports: ${portList}`;
  }

  // ── add_edge ──────────────────────────────────────────────────────────────
  if (name === "add_edge") {
    const sourceInstance = String(input.sourceInstance ?? "");
    const sourcePort     = String(input.sourcePort ?? "");
    const targetInstance = String(input.targetInstance ?? "");
    const targetPort     = String(input.targetPort ?? "");

    const srcId = state.instanceToId.get(sourceInstance);
    const tgtId = state.instanceToId.get(targetInstance);

    if (!srcId) return `Error: no node named "${sourceInstance}". Add it first.`;
    if (!tgtId) return `Error: no node named "${targetInstance}". Add it first.`;

    const srcNode = state.nodes.find((n) => n.id === srcId)!;
    const tgtNode = state.nodes.find((n) => n.id === tgtId)!;

    const srcPortObj = srcNode.data.ports.find((p) => p.id === sourcePort);
    const tgtPortObj = tgtNode.data.ports.find((p) => p.id === targetPort);

    if (!srcPortObj)
      return `Error: port "${sourcePort}" not found on ${sourceInstance}. Available: ${srcNode.data.ports.map((p) => p.id).join(", ")}`;
    if (!tgtPortObj)
      return `Error: port "${targetPort}" not found on ${targetInstance}. Available: ${tgtNode.data.ports.map((p) => p.id).join(", ")}`;

    if (srcPortObj.direction === "input")
      return `Error: "${sourcePort}" on ${sourceInstance} is an input — cannot be a source.`;
    if (tgtPortObj.direction === "output")
      return `Error: "${targetPort}" on ${targetInstance} is an output — cannot be a target.`;

    const sourceHandle = srcPortObj.direction === "bidir" ? `${sourcePort}_src` : sourcePort;
    const targetHandle = tgtPortObj.direction === "bidir" ? `${targetPort}_tgt` : targetPort;

    const edgeId = `agent_edge_${Date.now()}_${state.edgeCounter++}`;
    state.edges.push({
      id: edgeId,
      source: srcId,
      sourceHandle,
      target: tgtId,
      targetHandle,
      type: "bus",
      animated: false,
      data: {
        busWidth: srcPortObj.width,
        signalType: srcPortObj.type,
      },
    });

    return `OK: connected ${sourceInstance}.${sourcePort} → ${targetInstance}.${targetPort} (${srcPortObj.width}b ${srcPortObj.type})`;
  }

  return `Error: unknown tool "${name}"`;
}

// ── Agentic loop ─────────────────────────────────────────────────────────────
export interface AgentResult {
  success: boolean;
  message: string;
  nodes: HardwareNode[];
  edges: Edge[];
  error?: string;
}

export async function executeAgentLoop(
  userPrompt: string,
  existingInstanceNames: string[]
): Promise<AgentResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      message: "",
      nodes: [],
      edges: [],
      error: "ANTHROPIC_API_KEY is not set. Add it to your .env.local file (local) or Vercel environment variables.",
    };
  }

  const anthropic = new Anthropic({ apiKey });

  const state: VirtualState = {
    nodes: [],
    edges: [],
    instanceToId: new Map(),
    nodeCounter: 0,
    edgeCounter: 0,
  };

  const contextNote =
    existingInstanceNames.length > 0
      ? `\n\nExisting blocks already on the canvas (do not recreate these): ${existingInstanceNames.join(", ")}`
      : "";

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: userPrompt + contextNote },
  ];

  let finalMessage = "";
  const MAX_ROUNDS = 8;

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: buildSystemPrompt(),
      tools: TOOLS,
      messages,
    });

    if (response.stop_reason === "end_turn") {
      const textBlock = response.content.find((b) => b.type === "text");
      finalMessage = textBlock ? (textBlock as Anthropic.TextBlock).text : "Design generated.";
      break;
    }

    if (response.stop_reason === "tool_use") {
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of response.content) {
        if (block.type === "tool_use") {
          const result = executeTool(
            block.name,
            block.input as Record<string, unknown>,
            state
          );
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: result,
          });
        }
      }

      messages.push({ role: "assistant", content: response.content });
      messages.push({ role: "user", content: toolResults });
    }
  }

  if (!finalMessage && state.nodes.length > 0) {
    finalMessage = `Design complete: ${state.nodes.length} blocks, ${state.edges.length} connections.`;
  }

  return {
    success: true,
    message: finalMessage,
    nodes: state.nodes,
    edges: state.edges,
  };
}
