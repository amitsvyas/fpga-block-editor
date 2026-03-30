import type { Edge } from "@xyflow/react";
import type { HardwareNode, NodeKind } from "@/types/hardware";

// ── Verilog module name for each block kind ───────────────────────────────
const VERILOG_MODULE: Record<NodeKind, string> = {
  // Primitives
  generic_ip:        "generic_ip",
  clock_domain:      "pll_core",        // Lattice: EHXPLLL  | Vivado: MMCME4_ADV
  io_pad:            "io_pad",          // promoted to top-level port
  dsp_block:         "dsp_mult",        // Lattice: MULT18X18D | Vivado: DSP48E2
  ram_block:         "ram_block",       // Lattice: PDP16K    | Vivado: RAMB36E2
  // PCIe / High-Speed IO / Memory controllers
  serdes_pma:        "serdes_pma",      // Lattice: DCSC      | Vivado: GTHE4_CHANNEL
  pcie_pcs:          "pcie_pcs",
  pcie_ctrl:         "pcie_ctrl",
  ethernet_mac:      "ethernet_mac",
  mipi_dphy:         "mipi_dphy",
  ddr3_ctrl:         "ddr3_ctrl",
  ddr4_ctrl:         "ddr4_ctrl",
  lpddr4_ctrl:       "lpddr4_ctrl",
  // Open Source IPs
  oss_vexriscv:      "VexRiscv",
  oss_picorv32:      "picorv32",
  oss_serv:          "serv",
  oss_zipcpu:        "zipcore",
  oss_uart16550:     "uart_16550",
  oss_spi_master:    "spi_master",
  oss_i2c_master:    "i2c_master",
  oss_liteeth:       "liteeth_mac",
  oss_litedram:      "litedram_core",
  oss_litehyperbus:  "litehyperbus",
  oss_wb_crossbar:   "wb_crossbar",
  oss_axi_crossbar:  "axi_crossbar",
  oss_aes128:        "aes128",
  oss_fft:           "fft_core",
  oss_cordic:        "cordic",
  oss_litescope:     "litescope",
  // 3rd Party Chips
  chip_clk_osc:      "clk_osc",
  chip_clk_synth:    "clk_synth",
  chip_clk_buf:      "clk_buf",
  chip_ddr3_sdram:   "ddr3_sdram",
  chip_hyperram:     "hyperram",
  chip_qspi_flash:   "qspi_flash",
  chip_sram:         "sram",
  chip_eth_phy:      "eth_phy",
  chip_usb_phy:      "usb_phy",
  chip_can_xcvr:     "can_xcvr",
  chip_wifi_bt:      "wifi_bt",
  chip_eth_switch:   "eth_switch",
  chip_adc:          "rf_adc",
  chip_dac:          "rf_dac",
  chip_pmic:         "pmic",
  chip_mipi_camera:  "mipi_camera",
  chip_radar_som:    "radar_som",
  chip_lidar_som:    "lidar_som",
  chip_imu:          "imu",
  chip_gps_gnss:     "gps_gnss",
  chip_ai_accel:     "ai_accel",
  chip_hdmi_xcvr:    "hdmi_xcvr",
  chip_lvds_serdes:  "lvds_serdes",
  chip_level_shift:  "level_shift",
  chip_pcie_redrv:   "pcie_redrv",
  chip_gpio_expander: "gpio_expander",
  // Power
  pwr_ldo:           "ldo_reg",
  pwr_buck:          "buck_conv",
  pwr_boost:         "boost_conv",
  pwr_buck_boost:    "buck_boost",
  pwr_multiphase:    "multiphase_buck",
  pwr_sequencer:     "pwr_seq",
  pwr_pmbus_ctrl:    "pmbus_ctrl",
};

// Hints shown as inline comments to guide primitive substitution
const VENDOR_HINTS: Partial<Record<NodeKind, string>> = {
  clock_domain: "Lattice Radiant → EHXPLLL  |  Xilinx Vivado → MMCME4_ADV / PLLE4_ADV",
  dsp_block:    "Lattice Radiant → MULT18X18D  |  Xilinx Vivado → DSP48E2",
  ram_block:    "Lattice Radiant → PDP16K / PDPW16KD  |  Xilinx Vivado → RAMB36E2 / URAM288",
  serdes_pma:   "Lattice Radiant → DCSC  |  Xilinx Vivado → GTHE4_CHANNEL / GTYE4_CHANNEL",
  io_pad:       "Lattice Radiant → IB/OB/BB  |  Xilinx Vivado → IBUF/OBUF/IOBUF",
};

function san(s: string): string {
  return s.replace(/[^a-zA-Z0-9_]/g, "_");
}

function baseHandle(h: string): string {
  return h.replace(/_(src|tgt)$/, "");
}

function widthDecl(w: number): string {
  return w > 1 ? `[${w - 1}:0] ` : "";
}

export function exportToVerilog(
  nodes: HardwareNode[],
  edges: Edge[],
  topModule = "fpga_top"
): string {
  const lines: string[] = [];
  const nodeById = new Map(nodes.map((n) => [n.id, n]));

  // ── Step 1: assign a wire name to every edge ────────────────────────────
  const edgeWire = new Map<string, string>();   // edgeId → wire name
  const edgeWidth = new Map<string, number>();  // edgeId → bit width

  for (const edge of edges) {
    const src = nodeById.get(edge.source);
    if (!src) continue;
    const srcPort = baseHandle(edge.sourceHandle ?? "");
    edgeWire.set(edge.id, `w_${san(src.data.instanceName)}_${san(srcPort)}`);
    edgeWidth.set(edge.id, ((edge.data as { busWidth?: number })?.busWidth) ?? 1);
  }

  // ── Step 2: portToWire — nodeId:portId → wire / port name ───────────────
  const portToWire = new Map<string, string>();

  for (const edge of edges) {
    const wire = edgeWire.get(edge.id);
    if (!wire) continue;
    portToWire.set(`${edge.source}:${baseHandle(edge.sourceHandle ?? "")}`, wire);
    portToWire.set(`${edge.target}:${baseHandle(edge.targetHandle ?? "")}`, wire);
  }

  // ── Step 3: promote io_pad nodes to top-level ports ────────────────────
  type PortDir = "input" | "output" | "inout";
  interface TopPort { name: string; dir: PortDir; width: number; comment: string }
  const topPorts: TopPort[] = [];
  const ioPadIds = new Set<string>();

  for (const node of nodes) {
    if (node.data.kind !== "io_pad") continue;
    ioPadIds.add(node.id);
    const padName = san(node.data.instanceName);

    const hasDout = portToWire.has(`${node.id}:dout`); // io_pad sends to fabric → INPUT pad
    const hasDin  = portToWire.has(`${node.id}:din`);  // fabric drives io_pad  → OUTPUT pad

    const dir: PortDir = (hasDout && hasDin) ? "inout"
                       : hasDout             ? "input"
                       : hasDin              ? "output"
                       : "inout";

    const padPort = node.data.ports.find((p) => p.id === "pad");
    topPorts.push({ name: padName, dir, width: padPort?.width ?? 1, comment: `// ${node.data.instanceName}` });

    // Redirect all edges touching this io_pad to the top-level port name
    for (const edge of edges) {
      if (edge.source === node.id || edge.target === node.id) {
        const srcP = baseHandle(edge.sourceHandle ?? "");
        const tgtP = baseHandle(edge.targetHandle ?? "");
        portToWire.set(`${edge.source}:${srcP}`, padName);
        portToWire.set(`${edge.target}:${tgtP}`, padName);
        edgeWire.set(edge.id, padName); // prevents wire declaration
      }
    }
  }

  const topPortNames = new Set(topPorts.map((p) => p.name));
  const fabricNodes  = nodes.filter((n) => !ioPadIds.has(n.id));

  // ── Step 4: collect unique wire declarations (exclude top-level ports) ──
  const wireDecls = new Map<string, number>(); // wireName → width (deduplicated)
  for (const [edgeId, wire] of edgeWire) {
    if (topPortNames.has(wire) || wireDecls.has(wire)) continue;
    wireDecls.set(wire, edgeWidth.get(edgeId) ?? 1);
  }

  // ── Step 5: collect black-box module declarations ───────────────────────
  // All non-primitive kinds need a `(* syn_black_box *)` declaration for synthesis
  const LATTICE_PRIMITIVES = new Set<NodeKind>(["clock_domain", "dsp_block", "ram_block", "serdes_pma", "io_pad"]);
  const declaredModules = new Map<string, HardwareNode>(); // modName → representative node
  for (const node of fabricNodes) {
    if (LATTICE_PRIMITIVES.has(node.data.kind)) continue;
    const modName = VERILOG_MODULE[node.data.kind] ?? san(node.data.kind);
    if (!declaredModules.has(modName)) declaredModules.set(modName, node);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Emit Verilog
  // ═══════════════════════════════════════════════════════════════════════

  lines.push(`// ================================================================`);
  lines.push(`// Auto-generated structural Verilog`);
  lines.push(`// Tool: Lattice Avant FPGA Block Editor`);
  lines.push(`// Generated: ${new Date().toISOString()}`);
  lines.push(`//`);
  lines.push(`// HOW TO USE`);
  lines.push(`// ─────────────────────────────────────────────────────────────`);
  lines.push(`// Lattice Radiant:`);
  lines.push(`//   File > New > Design File, add this .v file.`);
  lines.push(`//   Then add IP source files for each instantiated module.`);
  lines.push(`//   Vendor primitives: replace module names per the hints below.`);
  lines.push(`//`);
  lines.push(`// Xilinx Vivado:`);
  lines.push(`//   Add Sources > Add or Create Design Sources, add this .v file.`);
  lines.push(`//   Add IP cores for each instantiated module via IP Catalog.`);
  lines.push(`//   Vendor primitives: replace module names per the hints below.`);
  lines.push(`// ================================================================`);
  lines.push(``);
  lines.push("`timescale 1ns / 1ps");
  lines.push(``);

  // Black-box declarations
  if (declaredModules.size > 0) {
    lines.push(`// ── Black-box declarations (non-vendor-primitive modules) ─────`);
    for (const [modName, node] of declaredModules) {
      lines.push(`(* syn_black_box *)`);  // Radiant / Synplify
      lines.push(`(* black_box *)`);       // Vivado
      lines.push(`module ${modName} (`);
      const ports = node.data.ports.map((p) => {
        const dir = p.direction === "bidir" ? "inout" : p.direction;
        return `  ${dir.padEnd(5)} wire ${widthDecl(p.width)}${san(p.id)}`;
      });
      lines.push(ports.join(",\n"));
      lines.push(`);`);
      lines.push(`endmodule`);
      lines.push(``);
    }
  }

  // Top module declaration
  lines.push(`// ── Top-level module ──────────────────────────────────────────`);
  lines.push(`module ${san(topModule)} (`);
  if (topPorts.length === 0) {
    lines.push(`  // No io_pad nodes found — add io_pad nodes to define top-level ports`);
  } else {
    topPorts.forEach((p, i) => {
      const comma = i < topPorts.length - 1 ? "," : "";
      lines.push(`  ${p.dir.padEnd(6)} wire ${widthDecl(p.width)}${p.name}${comma}  ${p.comment}`);
    });
  }
  lines.push(`);`);
  lines.push(``);

  // Wire declarations
  if (wireDecls.size > 0) {
    lines.push(`// ── Internal wires ────────────────────────────────────────────`);
    for (const [wire, width] of wireDecls) {
      lines.push(`wire ${widthDecl(width)}${wire};`);
    }
    lines.push(``);
  }

  // Module instantiations
  lines.push(`// ── Module instantiations ─────────────────────────────────────`);
  for (const node of fabricNodes) {
    const modName = VERILOG_MODULE[node.data.kind] ?? san(node.data.kind);
    const instName = san(node.data.instanceName);
    const hint = VENDOR_HINTS[node.data.kind];

    lines.push(hint
      ? `// [${node.data.kind}]  ${hint}`
      : `// [${node.data.kind}]`
    );

    if (node.data.clockDomain) {
      lines.push(`// clock domain: ${node.data.clockDomain}${node.data.targetFmaxMhz ? `  |  target fmax: ${node.data.targetFmaxMhz} MHz` : ""}`);
    }

    lines.push(`${modName} ${instName} (`);

    const portLines = node.data.ports.map((p, i) => {
      const wire = portToWire.get(`${node.id}:${p.id}`) ?? "";
      const comma = i < node.data.ports.length - 1 ? "," : "";
      const nc    = wire ? "" : "  // NC";
      return `  .${san(p.id).padEnd(20)}(${wire})${comma}${nc}`;
    });
    lines.push(portLines.join("\n"));
    lines.push(`);`);
    lines.push(``);
  }

  lines.push(`endmodule`);

  return lines.join("\n");
}
