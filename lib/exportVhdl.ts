import type { Edge } from "@xyflow/react";
import type { HardwareNode, NodeKind } from "@/types/hardware";

// ── VHDL entity/component name for each block kind ───────────────────────
const VHDL_COMPONENT: Record<NodeKind, string> = {
  generic_ip:        "generic_ip",
  clock_domain:      "pll_core",        // Lattice: EHXPLLL  | Vivado: MMCME4_ADV
  io_pad:            "io_pad",          // promoted to entity port
  dsp_block:         "dsp_mult",        // Lattice: MULT18X18D | Vivado: DSP48E2
  ram_block:         "ram_block",       // Lattice: PDP16K    | Vivado: RAMB36E2
  serdes_pma:        "serdes_pma",      // Lattice: DCSC      | Vivado: GTHE4_CHANNEL
  pcie_pcs:          "pcie_pcs",
  pcie_ctrl:         "pcie_ctrl",
  ethernet_mac:      "ethernet_mac",
  mipi_dphy:         "mipi_dphy",
  ddr3_ctrl:         "ddr3_ctrl",
  ddr4_ctrl:         "ddr4_ctrl",
  lpddr4_ctrl:       "lpddr4_ctrl",
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
  pwr_ldo:           "ldo_reg",
  pwr_buck:          "buck_conv",
  pwr_boost:         "boost_conv",
  pwr_buck_boost:    "buck_boost",
  pwr_multiphase:    "multiphase_buck",
  pwr_sequencer:     "pwr_seq",
  pwr_pmbus_ctrl:    "pmbus_ctrl",
};

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

function vhdlType(width: number): string {
  return width === 1 ? "std_logic" : `std_logic_vector(${width - 1} downto 0)`;
}

function vhdlDir(dir: string): string {
  if (dir === "input")  return "in ";
  if (dir === "output") return "out";
  return "inout";
}

export function exportToVhdl(
  nodes: HardwareNode[],
  edges: Edge[],
  topEntity = "fpga_top"
): string {
  const lines: string[] = [];
  const nodeById = new Map(nodes.map((n) => [n.id, n]));

  // ── Step 1: wire name per edge ──────────────────────────────────────────
  const edgeWire  = new Map<string, string>();
  const edgeWidth = new Map<string, number>();

  for (const edge of edges) {
    const src = nodeById.get(edge.source);
    if (!src) continue;
    const srcPort = baseHandle(edge.sourceHandle ?? "");
    edgeWire.set(edge.id, `w_${san(src.data.instanceName)}_${san(srcPort)}`);
    edgeWidth.set(edge.id, ((edge.data as { busWidth?: number })?.busWidth) ?? 1);
  }

  // ── Step 2: portToWire map ──────────────────────────────────────────────
  const portToWire = new Map<string, string>();
  for (const edge of edges) {
    const wire = edgeWire.get(edge.id);
    if (!wire) continue;
    portToWire.set(`${edge.source}:${baseHandle(edge.sourceHandle ?? "")}`, wire);
    portToWire.set(`${edge.target}:${baseHandle(edge.targetHandle ?? "")}`, wire);
  }

  // ── Step 3: io_pad → entity ports ──────────────────────────────────────
  type VhdlDir = "in" | "out" | "inout";
  interface EntityPort { name: string; dir: VhdlDir; width: number; comment: string }
  const entityPorts: EntityPort[] = [];
  const ioPadIds = new Set<string>();

  for (const node of nodes) {
    if (node.data.kind !== "io_pad") continue;
    ioPadIds.add(node.id);
    const padName = san(node.data.instanceName);

    const hasDout = portToWire.has(`${node.id}:dout`);
    const hasDin  = portToWire.has(`${node.id}:din`);
    const dir: VhdlDir = (hasDout && hasDin) ? "inout" : hasDout ? "in" : hasDin ? "out" : "inout";
    const padPort = node.data.ports.find((p) => p.id === "pad");
    entityPorts.push({ name: padName, dir, width: padPort?.width ?? 1, comment: `-- ${node.data.instanceName}` });

    for (const edge of edges) {
      if (edge.source === node.id || edge.target === node.id) {
        portToWire.set(`${edge.source}:${baseHandle(edge.sourceHandle ?? "")}`, padName);
        portToWire.set(`${edge.target}:${baseHandle(edge.targetHandle ?? "")}`, padName);
        edgeWire.set(edge.id, padName);
      }
    }
  }

  const entityPortNames = new Set(entityPorts.map((p) => p.name));
  const fabricNodes     = nodes.filter((n) => !ioPadIds.has(n.id));

  // ── Step 4: deduplicated signal declarations ────────────────────────────
  const signalDecls = new Map<string, number>();
  for (const [edgeId, wire] of edgeWire) {
    if (entityPortNames.has(wire) || signalDecls.has(wire)) continue;
    signalDecls.set(wire, edgeWidth.get(edgeId) ?? 1);
  }

  // ── Step 5: unique component declarations ──────────────────────────────
  const compDecls = new Map<string, HardwareNode>();
  for (const node of fabricNodes) {
    const compName = VHDL_COMPONENT[node.data.kind] ?? san(node.data.kind);
    if (!compDecls.has(compName)) compDecls.set(compName, node);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Emit VHDL
  // ═══════════════════════════════════════════════════════════════════════

  lines.push(`-- ================================================================`);
  lines.push(`-- Auto-generated structural VHDL`);
  lines.push(`-- Tool: Lattice Avant FPGA Block Editor`);
  lines.push(`-- Generated: ${new Date().toISOString()}`);
  lines.push(`--`);
  lines.push(`-- HOW TO USE`);
  lines.push(`-- ─────────────────────────────────────────────────────────────`);
  lines.push(`-- Lattice Radiant:`);
  lines.push(`--   File > New > Design File, add this .vhd file.`);
  lines.push(`--   Add the IP source files for each component declared below.`);
  lines.push(`--   Vendor primitives: replace component names per the hints.`);
  lines.push(`--`);
  lines.push(`-- Xilinx Vivado:`);
  lines.push(`--   Add Sources > Add or Create Design Sources, add this .vhd file.`);
  lines.push(`--   Set the top entity to "${san(topEntity)}" in Design Sources.`);
  lines.push(`--   Add IP cores for each component via the IP Catalog.`);
  lines.push(`-- ================================================================`);
  lines.push(``);
  lines.push(`library ieee;`);
  lines.push(`use ieee.std_logic_1164.all;`);
  lines.push(`use ieee.numeric_std.all;`);
  lines.push(``);

  // Entity
  lines.push(`-- ── Entity (top-level ports from io_pad nodes) ─────────────────`);
  lines.push(`entity ${san(topEntity)} is`);
  if (entityPorts.length === 0) {
    lines.push(`  -- No io_pad nodes found — add io_pad nodes to define top-level ports`);
  } else {
    lines.push(`  port (`);
    entityPorts.forEach((p, i) => {
      const semi = i < entityPorts.length - 1 ? ";" : "";
      lines.push(`    ${p.name.padEnd(24)}: ${p.dir.padEnd(5)} ${vhdlType(p.width)}${semi}  ${p.comment}`);
    });
    lines.push(`  );`);
  }
  lines.push(`end entity ${san(topEntity)};`);
  lines.push(``);

  // Architecture
  lines.push(`architecture structural of ${san(topEntity)} is`);
  lines.push(``);

  // Component declarations
  lines.push(`  -- ── Component declarations ─────────────────────────────────`);
  for (const [compName, node] of compDecls) {
    const hint = VENDOR_HINTS[node.data.kind];
    if (hint) lines.push(`  -- ${hint}`);
    lines.push(`  component ${compName} is`);
    lines.push(`    port (`);
    node.data.ports.forEach((p, i) => {
      const semi = i < node.data.ports.length - 1 ? ";" : "";
      lines.push(`      ${san(p.id).padEnd(20)}: ${vhdlDir(p.direction).padEnd(5)} ${vhdlType(p.width)}${semi}`);
    });
    lines.push(`    );`);
    lines.push(`  end component;`);
    lines.push(``);
  }

  // Signal declarations
  if (signalDecls.size > 0) {
    lines.push(`  -- ── Internal signals ────────────────────────────────────────`);
    for (const [sig, width] of signalDecls) {
      lines.push(`  signal ${sig.padEnd(36)}: ${vhdlType(width)};`);
    }
    lines.push(``);
  }

  lines.push(`begin`);
  lines.push(``);

  // Instantiations
  lines.push(`  -- ── Module instantiations ───────────────────────────────────`);
  for (const node of fabricNodes) {
    const compName = VHDL_COMPONENT[node.data.kind] ?? san(node.data.kind);
    const instName = san(node.data.instanceName);
    const hint = VENDOR_HINTS[node.data.kind];

    lines.push(hint
      ? `  -- [${node.data.kind}]  ${hint}`
      : `  -- [${node.data.kind}]`
    );
    if (node.data.clockDomain) {
      lines.push(`  -- clock domain: ${node.data.clockDomain}${node.data.targetFmaxMhz ? `  |  target fmax: ${node.data.targetFmaxMhz} MHz` : ""}`);
    }

    lines.push(`  ${instName} : ${compName}`);
    lines.push(`    port map (`);
    node.data.ports.forEach((p, i) => {
      const wire   = portToWire.get(`${node.id}:${p.id}`) ?? "open";
      const comma  = i < node.data.ports.length - 1 ? "," : "";
      const nc     = wire === "open" ? "  -- NC" : "";
      lines.push(`      ${san(p.id).padEnd(20)} => ${wire}${comma}${nc}`);
    });
    lines.push(`    );`);
    lines.push(``);
  }

  lines.push(`end architecture structural;`);

  return lines.join("\n");
}
