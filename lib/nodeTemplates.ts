import type { NodeKind, NodeData, Port } from "@/types/hardware";

export interface NodeTemplate {
  kind: NodeKind;
  label: string;
  description: string;
  color: string;
  group: "Primitives" | "PCIe" | "High-Speed IO" | "Memory" | "Open Source IP" | "3rd Party Chip" | "Power";
  subGroup?: "Processors" | "Peripherals" | "Memory" | "Interconnect" | "Crypto & DSP"
           | "Clocking" | "Networking" | "Analog" | "Sensors & SOM" | "Display" | "Interface"
           | "Regulators" | "Power Management";
  sourceUrl: string;
  defaultData: NodeData;
}

const defaultPorts: Record<NodeKind, Port[]> = {
  // ── Primitives ────────────────────────────────────────────────────────────
  generic_ip: [
    { id: "clk",   label: "clk",       direction: "input",  width: 1,  type: "clock"   },
    { id: "rst_n", label: "rst_n",     direction: "input",  width: 1,  type: "control" },
    { id: "din",   label: "din[7:0]",  direction: "input",  width: 8,  type: "data"    },
    { id: "dout",  label: "dout[7:0]", direction: "output", width: 8,  type: "data"    },
  ],
  clock_domain: [
    { id: "ref_clk",  label: "ref_clk",  direction: "input",  width: 1, type: "clock"   },
    { id: "clk_out0", label: "clk_out0", direction: "output", width: 1, type: "clock"   },
    { id: "clk_out1", label: "clk_out1", direction: "output", width: 1, type: "clock"   },
    { id: "locked",   label: "locked",   direction: "output", width: 1, type: "control" },
  ],
  io_pad: [
    { id: "pad",  label: "PAD",  direction: "bidir",  width: 1, type: "data"    },
    { id: "din",  label: "din",  direction: "input",  width: 1, type: "data"    },
    { id: "dout", label: "dout", direction: "output", width: 1, type: "data"    },
    { id: "oe",   label: "oe",   direction: "input",  width: 1, type: "control" },
  ],
  dsp_block: [
    { id: "clk", label: "clk",      direction: "input",  width: 1,  type: "clock" },
    { id: "a",   label: "A[17:0]",  direction: "input",  width: 18, type: "data"  },
    { id: "b",   label: "B[17:0]",  direction: "input",  width: 18, type: "data"  },
    { id: "p",   label: "P[35:0]",  direction: "output", width: 36, type: "data"  },
  ],
  ram_block: [
    { id: "clk_a",  label: "clk_a",  direction: "input",  width: 1,  type: "clock"   },
    { id: "clk_b",  label: "clk_b",  direction: "input",  width: 1,  type: "clock"   },
    { id: "addr_a", label: "addr_a", direction: "input",  width: 10, type: "data"    },
    { id: "din_a",  label: "din_a",  direction: "input",  width: 32, type: "data"    },
    { id: "dout_b", label: "dout_b", direction: "output", width: 32, type: "data"    },
    { id: "we_a",   label: "we_a",   direction: "input",  width: 1,  type: "control" },
  ],

  // ── PCIe ─────────────────────────────────────────────────────────────────
  // SerDes PMA — analog front-end; handles differential TX/RX lanes
  serdes_pma: [
    { id: "ref_clk_p",   label: "ref_clk_p",    direction: "input",  width: 1,  type: "clock"   },
    { id: "ref_clk_n",   label: "ref_clk_n",     direction: "input",  width: 1,  type: "clock"   },
    { id: "pma_tx_data", label: "pma_tx[19:0]",  direction: "input",  width: 20, type: "data"    },
    { id: "pma_rx_data", label: "pma_rx[19:0]",  direction: "output", width: 20, type: "data"    },
    { id: "tx_p",        label: "TX_P",           direction: "output", width: 1,  type: "data"    },
    { id: "tx_n",        label: "TX_N",           direction: "output", width: 1,  type: "data"    },
    { id: "rx_p",        label: "RX_P",           direction: "input",  width: 1,  type: "data"    },
    { id: "rx_n",        label: "RX_N",           direction: "input",  width: 1,  type: "data"    },
    { id: "pll_lock",    label: "pll_lock",        direction: "output", width: 1,  type: "control" },
    { id: "powerdown",   label: "powerdown",       direction: "input",  width: 1,  type: "control" },
  ],

  // PCIe PCS — 8b/10b or 128b/130b encode/decode; bridges PMA ↔ controller
  pcie_pcs: [
    { id: "pcs_clk",     label: "pcs_clk",        direction: "input",  width: 1,  type: "clock"   },
    { id: "tx_clk_out",  label: "tx_clk_out",      direction: "output", width: 1,  type: "clock"   },
    { id: "rx_clk_out",  label: "rx_clk_out",      direction: "output", width: 1,  type: "clock"   },
    { id: "pma_tx",      label: "pma_tx[19:0]",    direction: "output", width: 20, type: "data"    },
    { id: "pma_rx",      label: "pma_rx[19:0]",    direction: "input",  width: 20, type: "data"    },
    { id: "pcs_tx_data", label: "pcs_tx[31:0]",    direction: "input",  width: 32, type: "data"    },
    { id: "pcs_rx_data", label: "pcs_rx[31:0]",    direction: "output", width: 32, type: "data"    },
    { id: "pcs_tx_datak",label: "tx_datak[3:0]",   direction: "input",  width: 4,  type: "control" },
    { id: "pcs_rx_datak",label: "rx_datak[3:0]",   direction: "output", width: 4,  type: "control" },
    { id: "block_lock",  label: "block_lock",       direction: "output", width: 1,  type: "control" },
    { id: "rx_valid",    label: "rx_valid",          direction: "output", width: 1,  type: "control" },
  ],

  // PCIe Controller — TLP / DLLP engine with AXI-S user interface
  pcie_ctrl: [
    { id: "pcie_clk",    label: "pcie_clk",         direction: "input",  width: 1,   type: "clock"   },
    { id: "perst_n",     label: "PERST_N",            direction: "input",  width: 1,   type: "control" },
    { id: "rst_n",       label: "rst_n",              direction: "input",  width: 1,   type: "control" },
    { id: "axi_aclk",   label: "axi_aclk",           direction: "output", width: 1,   type: "clock"   },
    { id: "pcs_tx",      label: "pcs_tx[31:0]",       direction: "output", width: 32,  type: "data"    },
    { id: "pcs_rx",      label: "pcs_rx[31:0]",       direction: "input",  width: 32,  type: "data"    },
    { id: "m_axis_rx",   label: "m_axis_rx[127:0]",   direction: "output", width: 128, type: "axi"     },
    { id: "s_axis_tx",   label: "s_axis_tx[127:0]",   direction: "input",  width: 128, type: "axi"     },
    { id: "cfg_interrupt",label: "cfg_interrupt",      direction: "input",  width: 1,   type: "control" },
    { id: "link_up",     label: "link_up",             direction: "output", width: 1,   type: "control" },
    { id: "link_gen",    label: "link_gen[1:0]",       direction: "output", width: 2,   type: "control" },
  ],

  // ── High-Speed IO ─────────────────────────────────────────────────────────
  // Ethernet MAC (10/100/1000 GMII / RGMII)
  ethernet_mac: [
    { id: "clk_125",    label: "clk_125",           direction: "input",  width: 1,  type: "clock"   },
    { id: "rst_n",      label: "rst_n",              direction: "input",  width: 1,  type: "control" },
    { id: "rgmii_txd",  label: "RGMII_TXD[3:0]",    direction: "output", width: 4,  type: "data"    },
    { id: "rgmii_tx_ctl",label:"RGMII_TX_CTL",       direction: "output", width: 1,  type: "control" },
    { id: "rgmii_txc",  label: "RGMII_TXC",          direction: "output", width: 1,  type: "clock"   },
    { id: "rgmii_rxd",  label: "RGMII_RXD[3:0]",    direction: "input",  width: 4,  type: "data"    },
    { id: "rgmii_rx_ctl",label:"RGMII_RX_CTL",       direction: "input",  width: 1,  type: "control" },
    { id: "rgmii_rxc",  label: "RGMII_RXC",          direction: "input",  width: 1,  type: "clock"   },
    { id: "mdio",       label: "MDIO",                direction: "bidir",  width: 1,  type: "control" },
    { id: "mdc",        label: "MDC",                 direction: "output", width: 1,  type: "clock"   },
    { id: "s_axis_tx",  label: "s_axis_tx[7:0]",     direction: "input",  width: 8,  type: "axi"     },
    { id: "m_axis_rx",  label: "m_axis_rx[7:0]",     direction: "output", width: 8,  type: "axi"     },
    { id: "tx_en",      label: "tx_en",               direction: "output", width: 1,  type: "control" },
    { id: "link_speed", label: "link_speed[1:0]",     direction: "output", width: 2,  type: "control" },
  ],

  // MIPI D-PHY (CSI-2 / DSI — 2-lane)
  mipi_dphy: [
    { id: "sys_clk",    label: "sys_clk",            direction: "input",  width: 1,  type: "clock"   },
    { id: "rst_n",      label: "rst_n",               direction: "input",  width: 1,  type: "control" },
    { id: "clk_p",      label: "CLK_P",               direction: "bidir",  width: 1,  type: "clock"   },
    { id: "clk_n",      label: "CLK_N",               direction: "bidir",  width: 1,  type: "clock"   },
    { id: "d0_p",       label: "D0_P",                direction: "bidir",  width: 1,  type: "data"    },
    { id: "d0_n",       label: "D0_N",                direction: "bidir",  width: 1,  type: "data"    },
    { id: "d1_p",       label: "D1_P",                direction: "bidir",  width: 1,  type: "data"    },
    { id: "d1_n",       label: "D1_N",                direction: "bidir",  width: 1,  type: "data"    },
    { id: "byte_clk",   label: "byte_clk",            direction: "output", width: 1,  type: "clock"   },
    { id: "rx_data",    label: "rx_data[31:0]",       direction: "output", width: 32, type: "data"    },
    { id: "rx_valid",   label: "rx_valid",             direction: "output", width: 1,  type: "control" },
    { id: "hs_en",      label: "hs_en",                direction: "input",  width: 1,  type: "control" },
    { id: "direction",  label: "direction",            direction: "input",  width: 1,  type: "control" },
  ],

  // ── Memory ────────────────────────────────────────────────────────────────
  // DDR3 Controller (16-bit data bus, AXI4 user interface)
  ddr3_ctrl: [
    { id: "sys_clk",       label: "sys_clk",           direction: "input",  width: 1,  type: "clock"   },
    { id: "clk_ref",       label: "clk_ref_200",        direction: "input",  width: 1,  type: "clock"   },
    { id: "rst_n",         label: "rst_n",              direction: "input",  width: 1,  type: "control" },
    { id: "ddr3_clk_p",    label: "DDR3_CLK_P",         direction: "output", width: 1,  type: "clock"   },
    { id: "ddr3_clk_n",    label: "DDR3_CLK_N",         direction: "output", width: 1,  type: "clock"   },
    { id: "ddr3_cke",      label: "DDR3_CKE",           direction: "output", width: 1,  type: "control" },
    { id: "ddr3_cs_n",     label: "DDR3_CS_N",          direction: "output", width: 1,  type: "control" },
    { id: "ddr3_ras_n",    label: "DDR3_RAS_N",         direction: "output", width: 1,  type: "control" },
    { id: "ddr3_cas_n",    label: "DDR3_CAS_N",         direction: "output", width: 1,  type: "control" },
    { id: "ddr3_we_n",     label: "DDR3_WE_N",          direction: "output", width: 1,  type: "control" },
    { id: "ddr3_ba",       label: "DDR3_BA[2:0]",       direction: "output", width: 3,  type: "data"    },
    { id: "ddr3_addr",     label: "DDR3_ADDR[13:0]",    direction: "output", width: 14, type: "data"    },
    { id: "ddr3_dq",       label: "DDR3_DQ[15:0]",      direction: "bidir",  width: 16, type: "data"    },
    { id: "ddr3_dqs_p",    label: "DDR3_DQS_P[1:0]",   direction: "bidir",  width: 2,  type: "clock"   },
    { id: "ddr3_dqs_n",    label: "DDR3_DQS_N[1:0]",   direction: "bidir",  width: 2,  type: "clock"   },
    { id: "ddr3_dm",       label: "DDR3_DM[1:0]",       direction: "output", width: 2,  type: "control" },
    { id: "ui_clk",        label: "ui_clk",             direction: "output", width: 1,  type: "clock"   },
    { id: "axi_awaddr",    label: "axi_aw[31:0]",       direction: "input",  width: 32, type: "axi"     },
    { id: "axi_araddr",    label: "axi_ar[31:0]",       direction: "input",  width: 32, type: "axi"     },
    { id: "axi_wdata",     label: "axi_wdata[127:0]",   direction: "input",  width: 128,type: "axi"     },
    { id: "axi_rdata",     label: "axi_rdata[127:0]",   direction: "output", width: 128,type: "axi"     },
    { id: "init_calib",    label: "init_calib_complete", direction: "output", width: 1,  type: "control" },
  ],

  // DDR4 Controller (16-bit data bus, AXI4 user interface)
  ddr4_ctrl: [
    { id: "sys_clk",       label: "sys_clk",            direction: "input",  width: 1,  type: "clock"   },
    { id: "clk_ref",       label: "clk_ref_200",         direction: "input",  width: 1,  type: "clock"   },
    { id: "rst_n",         label: "rst_n",               direction: "input",  width: 1,  type: "control" },
    { id: "ddr4_ck_t",     label: "DDR4_CK_T",           direction: "output", width: 1,  type: "clock"   },
    { id: "ddr4_ck_c",     label: "DDR4_CK_C",           direction: "output", width: 1,  type: "clock"   },
    { id: "ddr4_cke",      label: "DDR4_CKE",            direction: "output", width: 1,  type: "control" },
    { id: "ddr4_cs_n",     label: "DDR4_CS_N",           direction: "output", width: 1,  type: "control" },
    { id: "ddr4_act_n",    label: "DDR4_ACT_N",          direction: "output", width: 1,  type: "control" },
    { id: "ddr4_bg",       label: "DDR4_BG[1:0]",        direction: "output", width: 2,  type: "data"    },
    { id: "ddr4_ba",       label: "DDR4_BA[1:0]",        direction: "output", width: 2,  type: "data"    },
    { id: "ddr4_addr",     label: "DDR4_ADDR[16:0]",     direction: "output", width: 17, type: "data"    },
    { id: "ddr4_dq",       label: "DDR4_DQ[15:0]",       direction: "bidir",  width: 16, type: "data"    },
    { id: "ddr4_dqs_t",    label: "DDR4_DQS_T[1:0]",    direction: "bidir",  width: 2,  type: "clock"   },
    { id: "ddr4_dqs_c",    label: "DDR4_DQS_C[1:0]",    direction: "bidir",  width: 2,  type: "clock"   },
    { id: "ddr4_dm_n",     label: "DDR4_DM_N[1:0]",      direction: "bidir",  width: 2,  type: "control" },
    { id: "ddr4_odt",      label: "DDR4_ODT",            direction: "output", width: 1,  type: "control" },
    { id: "ddr4_reset_n",  label: "DDR4_RESET_N",        direction: "output", width: 1,  type: "control" },
    { id: "ui_clk",        label: "ui_clk",              direction: "output", width: 1,  type: "clock"   },
    { id: "axi_awaddr",    label: "axi_aw[31:0]",        direction: "input",  width: 32, type: "axi"     },
    { id: "axi_araddr",    label: "axi_ar[31:0]",        direction: "input",  width: 32, type: "axi"     },
    { id: "axi_wdata",     label: "axi_wdata[255:0]",    direction: "input",  width: 256,type: "axi"     },
    { id: "axi_rdata",     label: "axi_rdata[255:0]",    direction: "output", width: 256,type: "axi"     },
    { id: "init_calib",    label: "init_calib_complete",  direction: "output", width: 1,  type: "control" },
  ],

  // ── Open Source IPs ──────────────────────────────────────────────────────
  // VexRiscv — dual Wishbone iBus/dBus + interrupts
  oss_vexriscv: [
    { id: "clk",           label: "clk",              direction: "input",  width: 1,  type: "clock"   },
    { id: "reset",         label: "reset",             direction: "input",  width: 1,  type: "control" },
    { id: "ibus_adr",      label: "iBus_ADR[31:0]",   direction: "output", width: 32, type: "data"    },
    { id: "ibus_dat_r",    label: "iBus_DAT_R[31:0]", direction: "input",  width: 32, type: "data"    },
    { id: "ibus_cyc",      label: "iBus_CYC",          direction: "output", width: 1,  type: "control" },
    { id: "ibus_ack",      label: "iBus_ACK",          direction: "input",  width: 1,  type: "control" },
    { id: "dbus_adr",      label: "dBus_ADR[31:0]",   direction: "output", width: 32, type: "data"    },
    { id: "dbus_dat_r",    label: "dBus_DAT_R[31:0]", direction: "input",  width: 32, type: "data"    },
    { id: "dbus_dat_w",    label: "dBus_DAT_W[31:0]", direction: "output", width: 32, type: "data"    },
    { id: "dbus_we",       label: "dBus_WE",           direction: "output", width: 1,  type: "control" },
    { id: "dbus_sel",      label: "dBus_SEL[3:0]",    direction: "output", width: 4,  type: "control" },
    { id: "dbus_ack",      label: "dBus_ACK",          direction: "input",  width: 1,  type: "control" },
    { id: "timer_irq",     label: "timerInterrupt",    direction: "input",  width: 1,  type: "control" },
    { id: "ext_irq",       label: "externalInterrupt", direction: "input",  width: 1,  type: "control" },
  ],

  // PicoRV32 — native mem interface + IRQ vector
  oss_picorv32: [
    { id: "clk",           label: "clk",               direction: "input",  width: 1,  type: "clock"   },
    { id: "resetn",        label: "resetn",             direction: "input",  width: 1,  type: "control" },
    { id: "mem_valid",     label: "mem_valid",          direction: "output", width: 1,  type: "control" },
    { id: "mem_instr",     label: "mem_instr",          direction: "output", width: 1,  type: "control" },
    { id: "mem_ready",     label: "mem_ready",          direction: "input",  width: 1,  type: "control" },
    { id: "mem_addr",      label: "mem_addr[31:0]",    direction: "output", width: 32, type: "data"    },
    { id: "mem_wdata",     label: "mem_wdata[31:0]",   direction: "output", width: 32, type: "data"    },
    { id: "mem_wstrb",     label: "mem_wstrb[3:0]",    direction: "output", width: 4,  type: "control" },
    { id: "mem_rdata",     label: "mem_rdata[31:0]",   direction: "input",  width: 32, type: "data"    },
    { id: "irq",           label: "irq[31:0]",         direction: "input",  width: 32, type: "control" },
    { id: "eoi",           label: "eoi[31:0]",         direction: "output", width: 32, type: "control" },
  ],

  // SERV — 1-bit serial RISC-V, Wishbone
  oss_serv: [
    { id: "clk",           label: "clk",               direction: "input",  width: 1,  type: "clock"   },
    { id: "i_rst",         label: "i_rst",              direction: "input",  width: 1,  type: "control" },
    { id: "o_ibus_adr",    label: "o_ibus_adr[31:0]",  direction: "output", width: 32, type: "data"    },
    { id: "o_ibus_cyc",    label: "o_ibus_cyc",         direction: "output", width: 1,  type: "control" },
    { id: "i_ibus_rdt",    label: "i_ibus_rdt[31:0]",  direction: "input",  width: 32, type: "data"    },
    { id: "i_ibus_ack",    label: "i_ibus_ack",         direction: "input",  width: 1,  type: "control" },
    { id: "o_dbus_adr",    label: "o_dbus_adr[31:0]",  direction: "output", width: 32, type: "data"    },
    { id: "o_dbus_dat",    label: "o_dbus_dat[31:0]",  direction: "output", width: 32, type: "data"    },
    { id: "i_dbus_rdt",    label: "i_dbus_rdt[31:0]",  direction: "input",  width: 32, type: "data"    },
    { id: "o_dbus_we",     label: "o_dbus_we",          direction: "output", width: 1,  type: "control" },
    { id: "i_dbus_ack",    label: "i_dbus_ack",         direction: "input",  width: 1,  type: "control" },
    { id: "i_timer_irq",   label: "i_timer_irq",        direction: "input",  width: 1,  type: "control" },
  ],

  // ZipCPU — pipelined Wishbone master
  oss_zipcpu: [
    { id: "i_clk",         label: "i_clk",              direction: "input",  width: 1,  type: "clock"   },
    { id: "i_reset",       label: "i_reset",            direction: "input",  width: 1,  type: "control" },
    { id: "i_interrupt",   label: "i_interrupt",        direction: "input",  width: 1,  type: "control" },
    { id: "o_wb_cyc",      label: "o_wb_cyc",           direction: "output", width: 1,  type: "control" },
    { id: "o_wb_stb",      label: "o_wb_stb",           direction: "output", width: 1,  type: "control" },
    { id: "o_wb_we",       label: "o_wb_we",            direction: "output", width: 1,  type: "control" },
    { id: "o_wb_addr",     label: "o_wb_addr[29:0]",   direction: "output", width: 30, type: "data"    },
    { id: "o_wb_data",     label: "o_wb_data[31:0]",   direction: "output", width: 32, type: "data"    },
    { id: "o_wb_sel",      label: "o_wb_sel[3:0]",     direction: "output", width: 4,  type: "control" },
    { id: "i_wb_stall",    label: "i_wb_stall",         direction: "input",  width: 1,  type: "control" },
    { id: "i_wb_ack",      label: "i_wb_ack",           direction: "input",  width: 1,  type: "control" },
    { id: "i_wb_data",     label: "i_wb_data[31:0]",   direction: "input",  width: 32, type: "data"    },
    { id: "i_wb_err",      label: "i_wb_err",           direction: "input",  width: 1,  type: "control" },
  ],

  // UART 16550 — Wishbone slave + modem signals
  oss_uart16550: [
    { id: "clk",           label: "clk",               direction: "input",  width: 1,  type: "clock"   },
    { id: "wb_rst_i",      label: "wb_rst_i",           direction: "input",  width: 1,  type: "control" },
    { id: "wb_adr_i",      label: "wb_adr_i[2:0]",     direction: "input",  width: 3,  type: "data"    },
    { id: "wb_dat_i",      label: "wb_dat_i[7:0]",     direction: "input",  width: 8,  type: "data"    },
    { id: "wb_dat_o",      label: "wb_dat_o[7:0]",     direction: "output", width: 8,  type: "data"    },
    { id: "wb_we_i",       label: "wb_we_i",            direction: "input",  width: 1,  type: "control" },
    { id: "wb_stb_i",      label: "wb_stb_i",           direction: "input",  width: 1,  type: "control" },
    { id: "wb_cyc_i",      label: "wb_cyc_i",           direction: "input",  width: 1,  type: "control" },
    { id: "wb_ack_o",      label: "wb_ack_o",           direction: "output", width: 1,  type: "control" },
    { id: "int_o",         label: "int_o",              direction: "output", width: 1,  type: "control" },
    { id: "stx_pad_o",     label: "STX",                direction: "output", width: 1,  type: "data"    },
    { id: "srx_pad_i",     label: "SRX",                direction: "input",  width: 1,  type: "data"    },
    { id: "rts_pad_o",     label: "RTS_N",              direction: "output", width: 1,  type: "control" },
    { id: "cts_pad_i",     label: "CTS_N",              direction: "input",  width: 1,  type: "control" },
  ],

  // SPI Master — Wishbone slave + 4-wire SPI
  oss_spi_master: [
    { id: "clk_i",         label: "clk_i",              direction: "input",  width: 1,  type: "clock"   },
    { id: "rst_i",         label: "rst_i",              direction: "input",  width: 1,  type: "control" },
    { id: "wb_adr_i",      label: "wb_adr_i[4:0]",     direction: "input",  width: 5,  type: "data"    },
    { id: "wb_dat_i",      label: "wb_dat_i[31:0]",    direction: "input",  width: 32, type: "data"    },
    { id: "wb_dat_o",      label: "wb_dat_o[31:0]",    direction: "output", width: 32, type: "data"    },
    { id: "wb_we_i",       label: "wb_we_i",            direction: "input",  width: 1,  type: "control" },
    { id: "wb_stb_i",      label: "wb_stb_i",           direction: "input",  width: 1,  type: "control" },
    { id: "wb_cyc_i",      label: "wb_cyc_i",           direction: "input",  width: 1,  type: "control" },
    { id: "wb_ack_o",      label: "wb_ack_o",           direction: "output", width: 1,  type: "control" },
    { id: "wb_int_o",      label: "wb_int_o",           direction: "output", width: 1,  type: "control" },
    { id: "ss_pad_o",      label: "SS_N[7:0]",         direction: "output", width: 8,  type: "control" },
    { id: "sclk_pad_o",    label: "SCLK",               direction: "output", width: 1,  type: "clock"   },
    { id: "mosi_pad_o",    label: "MOSI",               direction: "output", width: 1,  type: "data"    },
    { id: "miso_pad_i",    label: "MISO",               direction: "input",  width: 1,  type: "data"    },
  ],

  // I2C Master — Wishbone slave + open-drain SCL/SDA
  oss_i2c_master: [
    { id: "clk",           label: "clk",               direction: "input",  width: 1,  type: "clock"   },
    { id: "rst",           label: "rst",               direction: "input",  width: 1,  type: "control" },
    { id: "wb_adr_i",      label: "wb_adr_i[2:0]",     direction: "input",  width: 3,  type: "data"    },
    { id: "wb_dat_i",      label: "wb_dat_i[7:0]",     direction: "input",  width: 8,  type: "data"    },
    { id: "wb_dat_o",      label: "wb_dat_o[7:0]",     direction: "output", width: 8,  type: "data"    },
    { id: "wb_we_i",       label: "wb_we_i",            direction: "input",  width: 1,  type: "control" },
    { id: "wb_stb_i",      label: "wb_stb_i",           direction: "input",  width: 1,  type: "control" },
    { id: "wb_cyc_i",      label: "wb_cyc_i",           direction: "input",  width: 1,  type: "control" },
    { id: "wb_ack_o",      label: "wb_ack_o",           direction: "output", width: 1,  type: "control" },
    { id: "wb_inta_o",     label: "wb_inta_o",          direction: "output", width: 1,  type: "control" },
    { id: "scl_pad_io",    label: "SCL",                direction: "bidir",  width: 1,  type: "clock"   },
    { id: "sda_pad_io",    label: "SDA",                direction: "bidir",  width: 1,  type: "data"    },
  ],

  // LiteEth — MII/RGMII MAC + Wishbone management
  oss_liteeth: [
    { id: "sys_clk",       label: "sys_clk",            direction: "input",  width: 1,  type: "clock"   },
    { id: "sys_rst",       label: "sys_rst",            direction: "input",  width: 1,  type: "control" },
    { id: "eth_ref_clk",   label: "eth_ref_clk",        direction: "input",  width: 1,  type: "clock"   },
    { id: "eth_rx_clk",    label: "eth_rx_clk",         direction: "input",  width: 1,  type: "clock"   },
    { id: "eth_rxd",       label: "eth_rxd[3:0]",      direction: "input",  width: 4,  type: "data"    },
    { id: "eth_rx_dv",     label: "eth_rx_dv",          direction: "input",  width: 1,  type: "control" },
    { id: "eth_rx_er",     label: "eth_rx_er",          direction: "input",  width: 1,  type: "control" },
    { id: "eth_tx_clk",    label: "eth_tx_clk",         direction: "input",  width: 1,  type: "clock"   },
    { id: "eth_txd",       label: "eth_txd[3:0]",      direction: "output", width: 4,  type: "data"    },
    { id: "eth_tx_en",     label: "eth_tx_en",          direction: "output", width: 1,  type: "control" },
    { id: "eth_mdc",       label: "MDC",                direction: "output", width: 1,  type: "clock"   },
    { id: "eth_mdio",      label: "MDIO",               direction: "bidir",  width: 1,  type: "control" },
    { id: "wb_adr",        label: "wb_adr[13:0]",      direction: "input",  width: 14, type: "data"    },
    { id: "wb_dat_w",      label: "wb_dat_w[31:0]",    direction: "input",  width: 32, type: "data"    },
    { id: "wb_dat_r",      label: "wb_dat_r[31:0]",    direction: "output", width: 32, type: "data"    },
    { id: "wb_we",         label: "wb_we",              direction: "input",  width: 1,  type: "control" },
    { id: "wb_cyc",        label: "wb_cyc",             direction: "input",  width: 1,  type: "control" },
    { id: "wb_stb",        label: "wb_stb",             direction: "input",  width: 1,  type: "control" },
    { id: "wb_ack",        label: "wb_ack",             direction: "output", width: 1,  type: "control" },
  ],

  // LiteDRAM — DDR/DDR2/DDR3 controller, Wishbone user port
  oss_litedram: [
    { id: "clk",           label: "clk",               direction: "input",  width: 1,  type: "clock"   },
    { id: "rst",           label: "rst",               direction: "input",  width: 1,  type: "control" },
    { id: "user_clk",      label: "user_clk",           direction: "output", width: 1,  type: "clock"   },
    { id: "user_rst",      label: "user_rst",           direction: "output", width: 1,  type: "control" },
    { id: "init_done",     label: "init_done",          direction: "output", width: 1,  type: "control" },
    { id: "init_error",    label: "init_error",         direction: "output", width: 1,  type: "control" },
    { id: "wb_adr",        label: "wb_adr[29:0]",      direction: "input",  width: 30, type: "data"    },
    { id: "wb_dat_w",      label: "wb_dat_w[31:0]",    direction: "input",  width: 32, type: "data"    },
    { id: "wb_dat_r",      label: "wb_dat_r[31:0]",    direction: "output", width: 32, type: "data"    },
    { id: "wb_we",         label: "wb_we",              direction: "input",  width: 1,  type: "control" },
    { id: "wb_cyc",        label: "wb_cyc",             direction: "input",  width: 1,  type: "control" },
    { id: "wb_stb",        label: "wb_stb",             direction: "input",  width: 1,  type: "control" },
    { id: "wb_ack",        label: "wb_ack",             direction: "output", width: 1,  type: "control" },
    { id: "ddram_a",       label: "ddram_a[14:0]",     direction: "output", width: 15, type: "data"    },
    { id: "ddram_ba",      label: "ddram_ba[2:0]",     direction: "output", width: 3,  type: "data"    },
    { id: "ddram_dq",      label: "ddram_dq[15:0]",    direction: "bidir",  width: 16, type: "data"    },
    { id: "ddram_dqs_p",   label: "ddram_dqs_p[1:0]", direction: "bidir",  width: 2,  type: "clock"   },
    { id: "ddram_dqs_n",   label: "ddram_dqs_n[1:0]", direction: "bidir",  width: 2,  type: "clock"   },
  ],

  // LiteHyperBus — HyperRAM/HyperFlash, Wishbone user port
  oss_litehyperbus: [
    { id: "clk",           label: "clk",               direction: "input",  width: 1,  type: "clock"   },
    { id: "rst",           label: "rst",               direction: "input",  width: 1,  type: "control" },
    { id: "wb_adr",        label: "wb_adr[20:0]",      direction: "input",  width: 21, type: "data"    },
    { id: "wb_dat_w",      label: "wb_dat_w[31:0]",    direction: "input",  width: 32, type: "data"    },
    { id: "wb_dat_r",      label: "wb_dat_r[31:0]",    direction: "output", width: 32, type: "data"    },
    { id: "wb_sel",        label: "wb_sel[3:0]",       direction: "input",  width: 4,  type: "control" },
    { id: "wb_we",         label: "wb_we",              direction: "input",  width: 1,  type: "control" },
    { id: "wb_cyc",        label: "wb_cyc",             direction: "input",  width: 1,  type: "control" },
    { id: "wb_stb",        label: "wb_stb",             direction: "input",  width: 1,  type: "control" },
    { id: "wb_ack",        label: "wb_ack",             direction: "output", width: 1,  type: "control" },
    { id: "hb_ck",         label: "HB_CK",              direction: "output", width: 1,  type: "clock"   },
    { id: "hb_ck_n",       label: "HB_CK_N",            direction: "output", width: 1,  type: "clock"   },
    { id: "hb_cs_n",       label: "HB_CS_N",            direction: "output", width: 1,  type: "control" },
    { id: "hb_dq",         label: "HB_DQ[7:0]",        direction: "bidir",  width: 8,  type: "data"    },
    { id: "hb_rwds",       label: "HB_RWDS",            direction: "bidir",  width: 1,  type: "control" },
  ],

  // Wishbone B4 Crossbar (wb2axip) — N master × M slave
  oss_wb_crossbar: [
    { id: "wb_clk",        label: "i_clk",              direction: "input",  width: 1,  type: "clock"   },
    { id: "wb_rst",        label: "i_reset",            direction: "input",  width: 1,  type: "control" },
    { id: "s_wb_cyc",      label: "s_wb_cyc",           direction: "input",  width: 1,  type: "control" },
    { id: "s_wb_stb",      label: "s_wb_stb",           direction: "input",  width: 1,  type: "control" },
    { id: "s_wb_we",       label: "s_wb_we",            direction: "input",  width: 1,  type: "control" },
    { id: "s_wb_adr",      label: "s_wb_adr[31:0]",    direction: "input",  width: 32, type: "data"    },
    { id: "s_wb_dat_w",    label: "s_wb_dat[31:0]",    direction: "input",  width: 32, type: "data"    },
    { id: "s_wb_sel",      label: "s_wb_sel[3:0]",     direction: "input",  width: 4,  type: "control" },
    { id: "s_wb_ack",      label: "s_wb_ack",           direction: "output", width: 1,  type: "control" },
    { id: "s_wb_dat_r",    label: "s_wb_rdata[31:0]",  direction: "output", width: 32, type: "data"    },
    { id: "m_wb_cyc",      label: "m_wb_cyc",           direction: "output", width: 1,  type: "control" },
    { id: "m_wb_stb",      label: "m_wb_stb",           direction: "output", width: 1,  type: "control" },
    { id: "m_wb_adr",      label: "m_wb_adr[31:0]",    direction: "output", width: 32, type: "data"    },
    { id: "m_wb_dat_w",    label: "m_wb_dat[31:0]",    direction: "output", width: 32, type: "data"    },
    { id: "m_wb_ack",      label: "m_wb_ack",           direction: "input",  width: 1,  type: "control" },
    { id: "m_wb_dat_r",    label: "m_wb_rdata[31:0]",  direction: "input",  width: 32, type: "data"    },
    { id: "m_wb_err",      label: "m_wb_err",           direction: "input",  width: 1,  type: "control" },
  ],

  // AXI4-Lite Crossbar (wb2axip) — single slave/master shown; expand per design
  oss_axi_crossbar: [
    { id: "aclk",          label: "S_AXI_ACLK",         direction: "input",  width: 1,  type: "clock"   },
    { id: "aresetn",       label: "S_AXI_ARESETN",       direction: "input",  width: 1,  type: "control" },
    { id: "s_awaddr",      label: "S_AXI_AWADDR[31:0]", direction: "input",  width: 32, type: "axi"     },
    { id: "s_awvalid",     label: "S_AXI_AWVALID",       direction: "input",  width: 1,  type: "axi"     },
    { id: "s_awready",     label: "S_AXI_AWREADY",       direction: "output", width: 1,  type: "axi"     },
    { id: "s_wdata",       label: "S_AXI_WDATA[31:0]",  direction: "input",  width: 32, type: "axi"     },
    { id: "s_wstrb",       label: "S_AXI_WSTRB[3:0]",   direction: "input",  width: 4,  type: "axi"     },
    { id: "s_wvalid",      label: "S_AXI_WVALID",        direction: "input",  width: 1,  type: "axi"     },
    { id: "s_wready",      label: "S_AXI_WREADY",        direction: "output", width: 1,  type: "axi"     },
    { id: "s_araddr",      label: "S_AXI_ARADDR[31:0]", direction: "input",  width: 32, type: "axi"     },
    { id: "s_arvalid",     label: "S_AXI_ARVALID",       direction: "input",  width: 1,  type: "axi"     },
    { id: "s_arready",     label: "S_AXI_ARREADY",       direction: "output", width: 1,  type: "axi"     },
    { id: "s_rdata",       label: "S_AXI_RDATA[31:0]",  direction: "output", width: 32, type: "axi"     },
    { id: "s_rvalid",      label: "S_AXI_RVALID",        direction: "output", width: 1,  type: "axi"     },
    { id: "s_rready",      label: "S_AXI_RREADY",        direction: "input",  width: 1,  type: "axi"     },
    { id: "m_awaddr",      label: "M_AXI_AWADDR[31:0]", direction: "output", width: 32, type: "axi"     },
    { id: "m_awvalid",     label: "M_AXI_AWVALID",       direction: "output", width: 1,  type: "axi"     },
    { id: "m_wdata",       label: "M_AXI_WDATA[31:0]",  direction: "output", width: 32, type: "axi"     },
    { id: "m_araddr",      label: "M_AXI_ARADDR[31:0]", direction: "output", width: 32, type: "axi"     },
    { id: "m_rdata",       label: "M_AXI_RDATA[31:0]",  direction: "input",  width: 32, type: "axi"     },
  ],

  // AES-128/192/256 — pipelined (secworks/aes)
  oss_aes128: [
    { id: "clk",           label: "clk",               direction: "input",  width: 1,   type: "clock"   },
    { id: "reset_n",       label: "reset_n",            direction: "input",  width: 1,   type: "control" },
    { id: "key",           label: "key[255:0]",         direction: "input",  width: 256, type: "data"    },
    { id: "keylen",        label: "keylen",             direction: "input",  width: 1,   type: "control" },
    { id: "init",          label: "init",               direction: "input",  width: 1,   type: "control" },
    { id: "next",          label: "next",               direction: "input",  width: 1,   type: "control" },
    { id: "encdec",        label: "encdec",             direction: "input",  width: 1,   type: "control" },
    { id: "ready",         label: "ready",              direction: "output", width: 1,   type: "control" },
    { id: "block_in",      label: "block[127:0]",       direction: "input",  width: 128, type: "data"    },
    { id: "result",        label: "result[127:0]",      direction: "output", width: 128, type: "data"    },
    { id: "result_valid",  label: "result_valid",        direction: "output", width: 1,   type: "control" },
  ],

  // FFT/IFFT — AXI-Stream (ZipCPU dblclockfft)
  oss_fft: [
    { id: "aclk",          label: "i_clk",              direction: "input",  width: 1,  type: "clock"   },
    { id: "aresetn",       label: "i_reset",            direction: "input",  width: 1,  type: "control" },
    { id: "s_axis_data",   label: "i_sample[31:0]",    direction: "input",  width: 32, type: "axi"     },
    { id: "s_axis_valid",  label: "i_ce",               direction: "input",  width: 1,  type: "control" },
    { id: "m_axis_data",   label: "o_result[63:0]",    direction: "output", width: 64, type: "axi"     },
    { id: "m_axis_valid",  label: "o_sync",             direction: "output", width: 1,  type: "control" },
    { id: "fwd_inv",       label: "i_inverse",          direction: "input",  width: 1,  type: "control" },
    { id: "scale_sch",     label: "i_shift[11:0]",     direction: "input",  width: 12, type: "control" },
    { id: "o_overflow",    label: "o_overflow",         direction: "output", width: 1,  type: "control" },
  ],

  // CORDIC — iterative sin/cos/atan/hypot (ZipCPU cordic)
  oss_cordic: [
    { id: "i_clk",         label: "i_clk",              direction: "input",  width: 1,  type: "clock"   },
    { id: "i_reset",       label: "i_reset",            direction: "input",  width: 1,  type: "control" },
    { id: "i_ce",          label: "i_ce",               direction: "input",  width: 1,  type: "control" },
    { id: "i_xval",        label: "i_xval[15:0]",      direction: "input",  width: 16, type: "data"    },
    { id: "i_yval",        label: "i_yval[15:0]",      direction: "input",  width: 16, type: "data"    },
    { id: "i_phase",       label: "i_phase[19:0]",     direction: "input",  width: 20, type: "data"    },
    { id: "i_aux",         label: "i_aux",              direction: "input",  width: 1,  type: "control" },
    { id: "o_xval",        label: "o_xval[15:0]",      direction: "output", width: 16, type: "data"    },
    { id: "o_yval",        label: "o_yval[15:0]",      direction: "output", width: 16, type: "data"    },
    { id: "o_aux",         label: "o_aux",              direction: "output", width: 1,  type: "control" },
  ],

  // LiteScope — embedded logic analyzer (LiteX)
  oss_litescope: [
    { id: "clk",           label: "clk",               direction: "input",  width: 1,   type: "clock"   },
    { id: "rst",           label: "rst",               direction: "input",  width: 1,   type: "control" },
    { id: "probe",         label: "probe[127:0]",       direction: "input",  width: 128, type: "data"    },
    { id: "wb_adr",        label: "wb_adr[13:0]",      direction: "input",  width: 14,  type: "data"    },
    { id: "wb_dat_w",      label: "wb_dat_w[31:0]",    direction: "input",  width: 32,  type: "data"    },
    { id: "wb_dat_r",      label: "wb_dat_r[31:0]",    direction: "output", width: 32,  type: "data"    },
    { id: "wb_we",         label: "wb_we",              direction: "input",  width: 1,   type: "control" },
    { id: "wb_cyc",        label: "wb_cyc",             direction: "input",  width: 1,   type: "control" },
    { id: "wb_stb",        label: "wb_stb",             direction: "input",  width: 1,   type: "control" },
    { id: "wb_ack",        label: "wb_ack",             direction: "output", width: 1,   type: "control" },
  ],

  // ── 3rd Party Chips — Clocking ───────────────────────────────────────────
  chip_clk_osc: [
    { id: "vdd",        label: "VDD",             direction: "input",  width: 1, type: "power"   },
    { id: "gnd",        label: "GND",             direction: "input",  width: 1, type: "power"   },
    { id: "clk_out",    label: "CLK_OUT",          direction: "output", width: 1, type: "clock"   },
    { id: "en",         label: "OE",               direction: "input",  width: 1, type: "control" },
  ],

  // Si5340 quad-output jitter-attenuating PLL — I2C configured
  chip_clk_synth: [
    { id: "vdd",        label: "VDD",             direction: "input",  width: 1, type: "power"   },
    { id: "refclk_p",   label: "IN0_P",            direction: "input",  width: 1, type: "clock"   },
    { id: "refclk_n",   label: "IN0_N",            direction: "input",  width: 1, type: "clock"   },
    { id: "out0_p",     label: "OUT0_P",           direction: "output", width: 1, type: "clock"   },
    { id: "out0_n",     label: "OUT0_N",           direction: "output", width: 1, type: "clock"   },
    { id: "out1_p",     label: "OUT1_P",           direction: "output", width: 1, type: "clock"   },
    { id: "out1_n",     label: "OUT1_N",           direction: "output", width: 1, type: "clock"   },
    { id: "out2_p",     label: "OUT2_P",           direction: "output", width: 1, type: "clock"   },
    { id: "out2_n",     label: "OUT2_N",           direction: "output", width: 1, type: "clock"   },
    { id: "out3_p",     label: "OUT3_P",           direction: "output", width: 1, type: "clock"   },
    { id: "out3_n",     label: "OUT3_N",           direction: "output", width: 1, type: "clock"   },
    { id: "sda",        label: "SDA",              direction: "bidir",  width: 1, type: "data"    },
    { id: "scl",        label: "SCL",              direction: "input",  width: 1, type: "clock"   },
    { id: "intr",       label: "INTRb",            direction: "output", width: 1, type: "control" },
    { id: "oe",         label: "OE",               direction: "input",  width: 1, type: "control" },
  ],

  // LMK00301 6-output clock buffer/fanout
  chip_clk_buf: [
    { id: "vdd",        label: "VDD",             direction: "input",  width: 1, type: "power"   },
    { id: "clkin_p",    label: "CLKIN_P",          direction: "input",  width: 1, type: "clock"   },
    { id: "clkin_n",    label: "CLKIN_N",          direction: "input",  width: 1, type: "clock"   },
    { id: "out0_p",     label: "Y0_P",             direction: "output", width: 1, type: "clock"   },
    { id: "out0_n",     label: "Y0_N",             direction: "output", width: 1, type: "clock"   },
    { id: "out1_p",     label: "Y1_P",             direction: "output", width: 1, type: "clock"   },
    { id: "out1_n",     label: "Y1_N",             direction: "output", width: 1, type: "clock"   },
    { id: "out2_p",     label: "Y2_P",             direction: "output", width: 1, type: "clock"   },
    { id: "out2_n",     label: "Y2_N",             direction: "output", width: 1, type: "clock"   },
    { id: "oe",         label: "OE",               direction: "input",  width: 1, type: "control" },
  ],

  // ── 3rd Party Chips — Memory ──────────────────────────────────────────────
  // Micron MT41K256M16 DDR3L SDRAM
  chip_ddr3_sdram: [
    { id: "vdd",        label: "VDD/VDDQ",         direction: "input",  width: 1,  type: "power"   },
    { id: "ck_p",       label: "CK_P",             direction: "input",  width: 1,  type: "clock"   },
    { id: "ck_n",       label: "CK_N",             direction: "input",  width: 1,  type: "clock"   },
    { id: "cke",        label: "CKE",              direction: "input",  width: 1,  type: "control" },
    { id: "cs_n",       label: "CS_N",             direction: "input",  width: 1,  type: "control" },
    { id: "ras_n",      label: "RAS_N",            direction: "input",  width: 1,  type: "control" },
    { id: "cas_n",      label: "CAS_N",            direction: "input",  width: 1,  type: "control" },
    { id: "we_n",       label: "WE_N",             direction: "input",  width: 1,  type: "control" },
    { id: "odt",        label: "ODT",              direction: "input",  width: 1,  type: "control" },
    { id: "reset_n",    label: "RESET_N",          direction: "input",  width: 1,  type: "control" },
    { id: "ba",         label: "BA[2:0]",          direction: "input",  width: 3,  type: "data"    },
    { id: "a",          label: "A[13:0]",          direction: "input",  width: 14, type: "data"    },
    { id: "dq",         label: "DQ[15:0]",         direction: "bidir",  width: 16, type: "data"    },
    { id: "dqs_p",      label: "DQS_P[1:0]",       direction: "bidir",  width: 2,  type: "clock"   },
    { id: "dqs_n",      label: "DQS_N[1:0]",       direction: "bidir",  width: 2,  type: "clock"   },
    { id: "dm",         label: "DM[1:0]",          direction: "input",  width: 2,  type: "control" },
  ],

  // Winbond W956D8MBYA HyperRAM
  chip_hyperram: [
    { id: "vcc",        label: "VCC",              direction: "input",  width: 1, type: "power"   },
    { id: "ck",         label: "CK",               direction: "input",  width: 1, type: "clock"   },
    { id: "ck_n",       label: "CK#",              direction: "input",  width: 1, type: "clock"   },
    { id: "cs_n",       label: "CS#",              direction: "input",  width: 1, type: "control" },
    { id: "dq",         label: "DQ[7:0]",          direction: "bidir",  width: 8, type: "data"    },
    { id: "rwds",       label: "RWDS",             direction: "bidir",  width: 1, type: "control" },
    { id: "reset_n",    label: "RESET#",           direction: "input",  width: 1, type: "control" },
  ],

  // Winbond W25Q128 QSPI NOR Flash
  chip_qspi_flash: [
    { id: "vcc",        label: "VCC",              direction: "input",  width: 1, type: "power"   },
    { id: "cs_n",       label: "CS#",              direction: "input",  width: 1, type: "control" },
    { id: "clk",        label: "CLK",              direction: "input",  width: 1, type: "clock"   },
    { id: "dq",         label: "DQ[3:0]",          direction: "bidir",  width: 4, type: "data"    },
    { id: "wp_n",       label: "WP#",              direction: "input",  width: 1, type: "control" },
    { id: "hold_n",     label: "HOLD#/RESET#",     direction: "input",  width: 1, type: "control" },
  ],

  // Cypress CY7C1382 Sync SRAM
  chip_sram: [
    { id: "vdd",        label: "VDD",              direction: "input",  width: 1,  type: "power"   },
    { id: "clk",        label: "CLK",              direction: "input",  width: 1,  type: "clock"   },
    { id: "ce_n",       label: "CE#",              direction: "input",  width: 1,  type: "control" },
    { id: "we_n",       label: "WE#",              direction: "input",  width: 1,  type: "control" },
    { id: "oe_n",       label: "OE#",              direction: "input",  width: 1,  type: "control" },
    { id: "bwe_n",      label: "BWE#[3:0]",        direction: "input",  width: 4,  type: "control" },
    { id: "a",          label: "A[17:0]",          direction: "input",  width: 18, type: "data"    },
    { id: "dq",         label: "DQ[35:0]",         direction: "bidir",  width: 36, type: "data"    },
  ],

  // ── 3rd Party Chips — Networking ──────────────────────────────────────────
  // TI DP83867 RGMII Ethernet PHY
  chip_eth_phy: [
    { id: "vdd",        label: "VDD",              direction: "input",  width: 1, type: "power"   },
    { id: "xtal_in",    label: "XI (25 MHz)",      direction: "input",  width: 1, type: "clock"   },
    { id: "clkout",     label: "CLKOUT",           direction: "output", width: 1, type: "clock"   },
    { id: "mdc",        label: "MDC",              direction: "input",  width: 1, type: "clock"   },
    { id: "mdio",       label: "MDIO",             direction: "bidir",  width: 1, type: "control" },
    { id: "txclk",      label: "TX_CLK",           direction: "input",  width: 1, type: "clock"   },
    { id: "txd",        label: "TXD[3:0]",         direction: "input",  width: 4, type: "data"    },
    { id: "tx_ctl",     label: "TX_CTL",           direction: "input",  width: 1, type: "control" },
    { id: "rxclk",      label: "RX_CLK",           direction: "output", width: 1, type: "clock"   },
    { id: "rxd",        label: "RXD[3:0]",         direction: "output", width: 4, type: "data"    },
    { id: "rx_ctl",     label: "RX_CTL",           direction: "output", width: 1, type: "control" },
    { id: "int_n",      label: "INT#",             direction: "output", width: 1, type: "control" },
    { id: "reset_n",    label: "RESET#",           direction: "input",  width: 1, type: "control" },
    { id: "tx_p",       label: "TXP",              direction: "output", width: 1, type: "data"    },
    { id: "tx_n",       label: "TXM",              direction: "output", width: 1, type: "data"    },
    { id: "rx_p",       label: "RXP",              direction: "input",  width: 1, type: "data"    },
    { id: "rx_n",       label: "RXM",              direction: "input",  width: 1, type: "data"    },
  ],

  // Microchip USB3300 ULPI USB2.0 PHY
  chip_usb_phy: [
    { id: "vdd33",      label: "VDD33",            direction: "input",  width: 1, type: "power"   },
    { id: "refclk",     label: "REFCLK (24 MHz)",  direction: "input",  width: 1, type: "clock"   },
    { id: "clk",        label: "CLK (60 MHz)",     direction: "output", width: 1, type: "clock"   },
    { id: "dir",        label: "DIR",              direction: "output", width: 1, type: "control" },
    { id: "nxt",        label: "NXT",              direction: "output", width: 1, type: "control" },
    { id: "stp",        label: "STP",              direction: "input",  width: 1, type: "control" },
    { id: "data",       label: "DATA[7:0]",        direction: "bidir",  width: 8, type: "data"    },
    { id: "dp",         label: "DP",               direction: "bidir",  width: 1, type: "data"    },
    { id: "dm",         label: "DM",               direction: "bidir",  width: 1, type: "data"    },
    { id: "reset_n",    label: "RESET#",           direction: "input",  width: 1, type: "control" },
    { id: "id",         label: "ID",               direction: "input",  width: 1, type: "control" },
  ],

  // TI SN65HVD230 CAN Bus Transceiver
  chip_can_xcvr: [
    { id: "vcc",        label: "VCC (3.3 V)",      direction: "input",  width: 1, type: "power"   },
    { id: "txd",        label: "TXD",              direction: "input",  width: 1, type: "data"    },
    { id: "rxd",        label: "RXD",              direction: "output", width: 1, type: "data"    },
    { id: "canh",       label: "CANH",             direction: "bidir",  width: 1, type: "data"    },
    { id: "canl",       label: "CANL",             direction: "bidir",  width: 1, type: "data"    },
    { id: "rs",         label: "RS (slope ctrl)",  direction: "input",  width: 1, type: "control" },
  ],

  // ESP32 WiFi + BT module (UART/SPI host interface)
  chip_wifi_bt: [
    { id: "vdd",        label: "VDD (3.3 V)",      direction: "input",  width: 1, type: "power"   },
    { id: "en",         label: "EN",               direction: "input",  width: 1, type: "control" },
    { id: "uart_tx",    label: "TX",               direction: "output", width: 1, type: "data"    },
    { id: "uart_rx",    label: "RX",               direction: "input",  width: 1, type: "data"    },
    { id: "spi_clk",    label: "SCLK",             direction: "input",  width: 1, type: "clock"   },
    { id: "spi_mosi",   label: "MOSI",             direction: "input",  width: 1, type: "data"    },
    { id: "spi_miso",   label: "MISO",             direction: "output", width: 1, type: "data"    },
    { id: "spi_cs_n",   label: "CS#",              direction: "input",  width: 1, type: "control" },
    { id: "gpio0",      label: "GPIO0 (boot)",     direction: "input",  width: 1, type: "control" },
    { id: "int",        label: "INT",              direction: "output", width: 1, type: "control" },
    { id: "reset_n",    label: "RESET#",           direction: "input",  width: 1, type: "control" },
    { id: "ant",        label: "ANT (2.4 GHz)",    direction: "bidir",  width: 1, type: "data"    },
  ],

  // Microchip KSZ8795 5-port GbE switch (SPI managed)
  chip_eth_switch: [
    { id: "vdd",        label: "VDD",              direction: "input",  width: 1, type: "power"   },
    { id: "xtal_in",    label: "XI (25 MHz)",      direction: "input",  width: 1, type: "clock"   },
    { id: "mdc",        label: "MDC",              direction: "input",  width: 1, type: "clock"   },
    { id: "mdio",       label: "MDIO",             direction: "bidir",  width: 1, type: "control" },
    { id: "spi_clk",    label: "SCLK",             direction: "input",  width: 1, type: "clock"   },
    { id: "spi_mosi",   label: "MOSI",             direction: "input",  width: 1, type: "data"    },
    { id: "spi_miso",   label: "MISO",             direction: "output", width: 1, type: "data"    },
    { id: "spi_cs_n",   label: "CS#",              direction: "input",  width: 1, type: "control" },
    { id: "int_n",      label: "INT#",             direction: "output", width: 1, type: "control" },
    { id: "reset_n",    label: "RST#",             direction: "input",  width: 1, type: "control" },
    { id: "p1_txd",     label: "P1 TXD[3:0]",     direction: "output", width: 4, type: "data"    },
    { id: "p1_rxd",     label: "P1 RXD[3:0]",     direction: "input",  width: 4, type: "data"    },
    { id: "rgmii_txd",  label: "CPU TXD[3:0]",    direction: "input",  width: 4, type: "data"    },
    { id: "rgmii_rxd",  label: "CPU RXD[3:0]",    direction: "output", width: 4, type: "data"    },
  ],

  // ── 3rd Party Chips — Analog ──────────────────────────────────────────────
  // Analog Devices AD9361 2×2 MIMO RF Transceiver
  chip_adc: [
    { id: "vdd",        label: "VDD",              direction: "input",  width: 1,  type: "power"   },
    { id: "refclk_p",   label: "XTALP",            direction: "input",  width: 1,  type: "clock"   },
    { id: "refclk_n",   label: "XTALN",            direction: "input",  width: 1,  type: "clock"   },
    { id: "rx1_p",      label: "RX1AP/RX1BP",      direction: "input",  width: 1,  type: "data"    },
    { id: "rx1_n",      label: "RX1AM/RX1BM",      direction: "input",  width: 1,  type: "data"    },
    { id: "rx2_p",      label: "RX2AP/RX2BP",      direction: "input",  width: 1,  type: "data"    },
    { id: "rx2_n",      label: "RX2AM/RX2BM",      direction: "input",  width: 1,  type: "data"    },
    { id: "tx1_p",      label: "TX1AP/TX1BP",      direction: "output", width: 1,  type: "data"    },
    { id: "tx1_n",      label: "TX1AM/TX1BM",      direction: "output", width: 1,  type: "data"    },
    { id: "tx2_p",      label: "TX2AP/TX2BP",      direction: "output", width: 1,  type: "data"    },
    { id: "tx2_n",      label: "TX2AM/TX2BM",      direction: "output", width: 1,  type: "data"    },
    { id: "data_clk",   label: "DATA_CLK_P",       direction: "output", width: 1,  type: "clock"   },
    { id: "rx_frame",   label: "RX_FRAME_P",       direction: "output", width: 1,  type: "data"    },
    { id: "p0_d",       label: "P0_D[11:0]",       direction: "output", width: 12, type: "data"    },
    { id: "fb_clk",     label: "FB_CLK_P",         direction: "input",  width: 1,  type: "clock"   },
    { id: "tx_frame",   label: "TX_FRAME_P",       direction: "input",  width: 1,  type: "data"    },
    { id: "p1_d",       label: "P1_D[11:0]",       direction: "input",  width: 12, type: "data"    },
    { id: "spi_clk",    label: "SPI_CLK",          direction: "input",  width: 1,  type: "clock"   },
    { id: "spi_di",     label: "SPI_DI",           direction: "input",  width: 1,  type: "data"    },
    { id: "spi_do",     label: "SPI_DO",           direction: "output", width: 1,  type: "data"    },
    { id: "spi_enb",    label: "SPI_ENB",          direction: "input",  width: 1,  type: "control" },
    { id: "resetb",     label: "RESETB",           direction: "input",  width: 1,  type: "control" },
    { id: "txnrx",      label: "TXNRX",            direction: "input",  width: 1,  type: "control" },
    { id: "en_agc",     label: "EN_AGC",           direction: "input",  width: 1,  type: "control" },
    { id: "ctrl_in",    label: "CTRL_IN[3:0]",     direction: "input",  width: 4,  type: "control" },
    { id: "ctrl_out",   label: "CTRL_OUT[7:0]",    direction: "output", width: 8,  type: "control" },
  ],

  // Analog Devices AD9744 14-bit 210 MSPS DAC
  chip_dac: [
    { id: "avdd",       label: "AVDD",             direction: "input",  width: 1,  type: "power"   },
    { id: "dvdd",       label: "DVDD",             direction: "input",  width: 1,  type: "power"   },
    { id: "clk",        label: "CLK",              direction: "input",  width: 1,  type: "clock"   },
    { id: "db",         label: "DB[13:0]",         direction: "input",  width: 14, type: "data"    },
    { id: "mode",       label: "MODE",             direction: "input",  width: 1,  type: "control" },
    { id: "sleep",      label: "SLEEP",            direction: "input",  width: 1,  type: "control" },
    { id: "iout",       label: "IOUT",             direction: "output", width: 1,  type: "data"    },
    { id: "ioutb",      label: "IOUTB",            direction: "output", width: 1,  type: "data"    },
    { id: "fs_adj",     label: "FS_ADJ",           direction: "input",  width: 1,  type: "data"    },
  ],

  // TI TPS65217 PMIC (3× DCDC + 4× LDO, I2C)
  chip_pmic: [
    { id: "vin",        label: "VIN (5 V)",        direction: "input",  width: 1, type: "power"   },
    { id: "vac",        label: "VAC",              direction: "input",  width: 1, type: "power"   },
    { id: "dcdc1",      label: "DCDC1_SW",         direction: "output", width: 1, type: "power"   },
    { id: "dcdc2",      label: "DCDC2_SW",         direction: "output", width: 1, type: "power"   },
    { id: "dcdc3",      label: "DCDC3_SW",         direction: "output", width: 1, type: "power"   },
    { id: "ldo1",       label: "LDO1_OUT",         direction: "output", width: 1, type: "power"   },
    { id: "ldo2",       label: "LDO2_OUT",         direction: "output", width: 1, type: "power"   },
    { id: "ldo3",       label: "LDO3_OUT",         direction: "output", width: 1, type: "power"   },
    { id: "ldo4",       label: "LDO4_OUT",         direction: "output", width: 1, type: "power"   },
    { id: "sda",        label: "SDA",              direction: "bidir",  width: 1, type: "data"    },
    { id: "scl",        label: "SCL",              direction: "input",  width: 1, type: "clock"   },
    { id: "int",        label: "INT#",             direction: "output", width: 1, type: "control" },
    { id: "pgood",      label: "PGOOD",            direction: "output", width: 1, type: "control" },
    { id: "pwr_btn",    label: "PB_IN",            direction: "input",  width: 1, type: "control" },
    { id: "wakeup",     label: "WAKEUP",           direction: "input",  width: 1, type: "control" },
  ],

  // ── 3rd Party Chips — Sensors & SOM ──────────────────────────────────────
  // Sony IMX219 8 MP MIPI CSI-2 image sensor
  chip_mipi_camera: [
    { id: "avdd",       label: "AVDD (2.8 V)",     direction: "input",  width: 1, type: "power"   },
    { id: "dovdd",      label: "DOVDD (1.8 V)",    direction: "input",  width: 1, type: "power"   },
    { id: "dvdd",       label: "DVDD (1.2 V)",     direction: "input",  width: 1, type: "power"   },
    { id: "extclk",     label: "EXTCLK (24 MHz)",  direction: "input",  width: 1, type: "clock"   },
    { id: "clk_p",      label: "CLK_P",            direction: "output", width: 1, type: "clock"   },
    { id: "clk_n",      label: "CLK_N",            direction: "output", width: 1, type: "clock"   },
    { id: "d0_p",       label: "D0_P",             direction: "output", width: 1, type: "data"    },
    { id: "d0_n",       label: "D0_N",             direction: "output", width: 1, type: "data"    },
    { id: "d1_p",       label: "D1_P",             direction: "output", width: 1, type: "data"    },
    { id: "d1_n",       label: "D1_N",             direction: "output", width: 1, type: "data"    },
    { id: "sda",        label: "SDA",              direction: "bidir",  width: 1, type: "data"    },
    { id: "scl",        label: "SCL",              direction: "input",  width: 1, type: "clock"   },
    { id: "reset_n",    label: "XCLR",             direction: "input",  width: 1, type: "control" },
    { id: "fsin",       label: "FSIN",             direction: "input",  width: 1, type: "control" },
  ],

  // TI AWR1843 76–81 GHz single-chip radar
  chip_radar_som: [
    { id: "vdd",        label: "VDD (1.0/1.8/3.3 V)", direction: "input", width: 1, type: "power"   },
    { id: "nreset",     label: "NRESET",           direction: "input",  width: 1, type: "control" },
    { id: "tx0",        label: "TX0 (76-81 GHz)",  direction: "output", width: 1, type: "data"    },
    { id: "tx1",        label: "TX1",              direction: "output", width: 1, type: "data"    },
    { id: "tx2",        label: "TX2",              direction: "output", width: 1, type: "data"    },
    { id: "rx0",        label: "RX0",              direction: "input",  width: 1, type: "data"    },
    { id: "rx1",        label: "RX1",              direction: "input",  width: 1, type: "data"    },
    { id: "rx2",        label: "RX2",              direction: "input",  width: 1, type: "data"    },
    { id: "rx3",        label: "RX3",              direction: "input",  width: 1, type: "data"    },
    { id: "spi_clk",    label: "SPI_CLK",          direction: "input",  width: 1, type: "clock"   },
    { id: "spi_mosi",   label: "SPI_MOSI",         direction: "input",  width: 1, type: "data"    },
    { id: "spi_miso",   label: "SPI_MISO",         direction: "output", width: 1, type: "data"    },
    { id: "spi_cs_n",   label: "SPI_CS#",          direction: "input",  width: 1, type: "control" },
    { id: "uart_tx",    label: "UART_TX",          direction: "output", width: 1, type: "data"    },
    { id: "uart_rx",    label: "UART_RX",          direction: "input",  width: 1, type: "data"    },
    { id: "gpio",       label: "GPIO[4:0]",        direction: "bidir",  width: 5, type: "control" },
    { id: "sync_in",    label: "SYNC_IN",          direction: "input",  width: 1, type: "clock"   },
  ],

  // Generic ToF / scanning LiDAR SOM
  chip_lidar_som: [
    { id: "vdd",        label: "VDD",              direction: "input",  width: 1,  type: "power"   },
    { id: "pwr_en",     label: "PWR_EN",           direction: "input",  width: 1,  type: "control" },
    { id: "trigger",    label: "TRIGGER",          direction: "input",  width: 1,  type: "control" },
    { id: "sync",       label: "SYNC",             direction: "input",  width: 1,  type: "clock"   },
    { id: "data_clk",   label: "DATA_CLK",         direction: "output", width: 1,  type: "clock"   },
    { id: "data_out",   label: "DATA[15:0]",       direction: "output", width: 16, type: "data"    },
    { id: "data_valid", label: "DATA_VALID",       direction: "output", width: 1,  type: "control" },
    { id: "uart_tx",    label: "UART_TX",          direction: "output", width: 1,  type: "data"    },
    { id: "uart_rx",    label: "UART_RX",          direction: "input",  width: 1,  type: "data"    },
    { id: "spi_clk",    label: "SPI_CLK",          direction: "input",  width: 1,  type: "clock"   },
    { id: "spi_mosi",   label: "SPI_MOSI",         direction: "input",  width: 1,  type: "data"    },
    { id: "spi_miso",   label: "SPI_MISO",         direction: "output", width: 1,  type: "data"    },
    { id: "spi_cs_n",   label: "SPI_CS#",          direction: "input",  width: 1,  type: "control" },
    { id: "status",     label: "STATUS",           direction: "output", width: 1,  type: "control" },
  ],

  // TDK InvenSense ICM-42688-P 6-axis IMU (SPI/I2C)
  chip_imu: [
    { id: "vdd",        label: "VDD (1.8 V)",      direction: "input",  width: 1, type: "power"   },
    { id: "sda_sdi",    label: "SDA/SDI",          direction: "bidir",  width: 1, type: "data"    },
    { id: "scl_sclk",   label: "SCL/SCLK",        direction: "input",  width: 1, type: "clock"   },
    { id: "ad0_sdo",    label: "AD0/SDO",          direction: "bidir",  width: 1, type: "data"    },
    { id: "cs_n",       label: "CS#",              direction: "input",  width: 1, type: "control" },
    { id: "int1",       label: "INT1",             direction: "output", width: 1, type: "control" },
    { id: "int2",       label: "INT2",             direction: "output", width: 1, type: "control" },
    { id: "fsync",      label: "FSYNC",            direction: "input",  width: 1, type: "control" },
    { id: "clkin",      label: "CLKIN",            direction: "input",  width: 1, type: "clock"   },
  ],

  // u-blox NEO-M9N multi-band GNSS module
  chip_gps_gnss: [
    { id: "vcc",        label: "VCC (3.3 V)",      direction: "input",  width: 1, type: "power"   },
    { id: "rf_in",      label: "RF_IN",            direction: "input",  width: 1, type: "data"    },
    { id: "uart_tx",    label: "TXD",              direction: "output", width: 1, type: "data"    },
    { id: "uart_rx",    label: "RXD",              direction: "input",  width: 1, type: "data"    },
    { id: "timepulse",  label: "TIMEPULSE (1PPS)", direction: "output", width: 1, type: "clock"   },
    { id: "sda",        label: "SDA",              direction: "bidir",  width: 1, type: "data"    },
    { id: "scl",        label: "SCL",              direction: "input",  width: 1, type: "clock"   },
    { id: "spi_clk",    label: "SPI_CLK",          direction: "input",  width: 1, type: "clock"   },
    { id: "spi_mosi",   label: "SPI_MOSI",         direction: "input",  width: 1, type: "data"    },
    { id: "spi_miso",   label: "SPI_MISO",         direction: "output", width: 1, type: "data"    },
    { id: "spi_cs_n",   label: "SPI_CS#",          direction: "input",  width: 1, type: "control" },
    { id: "reset_n",    label: "RESET#",           direction: "input",  width: 1, type: "control" },
    { id: "d_sel",      label: "D_SEL",            direction: "input",  width: 1, type: "control" },
  ],

  // Hailo-8 AI Accelerator SOM (PCIe gen3 x4 host interface)
  chip_ai_accel: [
    { id: "vdd",        label: "VDD (12 V)",       direction: "input",  width: 1, type: "power"   },
    { id: "pcie_tx_p",  label: "PCIE_TX_P[3:0]",  direction: "output", width: 4, type: "data"    },
    { id: "pcie_tx_n",  label: "PCIE_TX_N[3:0]",  direction: "output", width: 4, type: "data"    },
    { id: "pcie_rx_p",  label: "PCIE_RX_P[3:0]",  direction: "input",  width: 4, type: "data"    },
    { id: "pcie_rx_n",  label: "PCIE_RX_N[3:0]",  direction: "input",  width: 4, type: "data"    },
    { id: "pcie_refclk",label: "REFCLK_P",         direction: "input",  width: 1, type: "clock"   },
    { id: "perst_n",    label: "PERST#",           direction: "input",  width: 1, type: "control" },
    { id: "clkreq_n",   label: "CLKREQ#",          direction: "output", width: 1, type: "control" },
    { id: "wake_n",     label: "WAKE#",            direction: "output", width: 1, type: "control" },
    { id: "sda",        label: "SDA",              direction: "bidir",  width: 1, type: "data"    },
    { id: "scl",        label: "SCL",              direction: "input",  width: 1, type: "clock"   },
  ],

  // ── 3rd Party Chips — Display ─────────────────────────────────────────────
  // Analog Devices ADV7511W HDMI 1.4 Transmitter
  chip_hdmi_xcvr: [
    { id: "dvdd",       label: "DVDD (1.8 V)",     direction: "input",  width: 1,  type: "power"   },
    { id: "pvdd",       label: "PVDD (3.3 V)",     direction: "input",  width: 1,  type: "power"   },
    { id: "tmds_clk_p", label: "TMDS_CLK_P",       direction: "output", width: 1,  type: "clock"   },
    { id: "tmds_clk_n", label: "TMDS_CLK_N",       direction: "output", width: 1,  type: "clock"   },
    { id: "tmds_d0_p",  label: "TMDS_D0_P",        direction: "output", width: 1,  type: "data"    },
    { id: "tmds_d0_n",  label: "TMDS_D0_N",        direction: "output", width: 1,  type: "data"    },
    { id: "tmds_d1_p",  label: "TMDS_D1_P",        direction: "output", width: 1,  type: "data"    },
    { id: "tmds_d1_n",  label: "TMDS_D1_N",        direction: "output", width: 1,  type: "data"    },
    { id: "tmds_d2_p",  label: "TMDS_D2_P",        direction: "output", width: 1,  type: "data"    },
    { id: "tmds_d2_n",  label: "TMDS_D2_N",        direction: "output", width: 1,  type: "data"    },
    { id: "vid_d",      label: "VID_D[23:0]",      direction: "input",  width: 24, type: "data"    },
    { id: "hsync",      label: "HSYNC",            direction: "input",  width: 1,  type: "control" },
    { id: "vsync",      label: "VSYNC",            direction: "input",  width: 1,  type: "control" },
    { id: "de",         label: "DE",               direction: "input",  width: 1,  type: "control" },
    { id: "mclk",       label: "MCLK (audio)",     direction: "input",  width: 1,  type: "clock"   },
    { id: "sck",        label: "SCK",              direction: "input",  width: 1,  type: "clock"   },
    { id: "sd",         label: "SD (I2S)",         direction: "input",  width: 1,  type: "data"    },
    { id: "ws",         label: "WS (I2S)",         direction: "input",  width: 1,  type: "control" },
    { id: "sda",        label: "SDA (DDC)",        direction: "bidir",  width: 1,  type: "data"    },
    { id: "scl",        label: "SCL (DDC)",        direction: "input",  width: 1,  type: "clock"   },
    { id: "int",        label: "INT#",             direction: "output", width: 1,  type: "control" },
    { id: "hpd",        label: "HPD",              direction: "input",  width: 1,  type: "control" },
  ],

  // TI DS90CR285 LVDS 28-bit serialiser (FPD-Link)
  chip_lvds_serdes: [
    { id: "vdd",        label: "VDD (3.3 V)",      direction: "input",  width: 1,  type: "power"   },
    { id: "clkin",      label: "CLKIN",            direction: "input",  width: 1,  type: "clock"   },
    { id: "pdb",        label: "PDB",              direction: "input",  width: 1,  type: "control" },
    { id: "din",        label: "DATA[27:0]",       direction: "input",  width: 28, type: "data"    },
    { id: "lclkout_p",  label: "LCLKOUT+",         direction: "output", width: 1,  type: "clock"   },
    { id: "lclkout_n",  label: "LCLKOUT-",         direction: "output", width: 1,  type: "clock"   },
    { id: "out0_p",     label: "LOUT0+",           direction: "output", width: 1,  type: "data"    },
    { id: "out0_n",     label: "LOUT0-",           direction: "output", width: 1,  type: "data"    },
    { id: "out1_p",     label: "LOUT1+",           direction: "output", width: 1,  type: "data"    },
    { id: "out1_n",     label: "LOUT1-",           direction: "output", width: 1,  type: "data"    },
    { id: "out2_p",     label: "LOUT2+",           direction: "output", width: 1,  type: "data"    },
    { id: "out2_n",     label: "LOUT2-",           direction: "output", width: 1,  type: "data"    },
    { id: "out3_p",     label: "LOUT3+",           direction: "output", width: 1,  type: "data"    },
    { id: "out3_n",     label: "LOUT3-",           direction: "output", width: 1,  type: "data"    },
  ],

  // ── 3rd Party Chips — Interface ───────────────────────────────────────────
  // TI TXB0108 8-bit bidirectional level shifter
  chip_level_shift: [
    { id: "vcca",       label: "VCCA (1.2–3.6 V)", direction: "input",  width: 1, type: "power"   },
    { id: "vccb",       label: "VCCB (1.65–5.5 V)",direction: "input",  width: 1, type: "power"   },
    { id: "oe",         label: "OE",               direction: "input",  width: 1, type: "control" },
    { id: "a",          label: "A[7:0]",           direction: "bidir",  width: 8, type: "data"    },
    { id: "b",          label: "B[7:0]",           direction: "bidir",  width: 8, type: "data"    },
  ],

  // Diodes PI3EQX16904 PCIe Gen3 x4 redriver
  chip_pcie_redrv: [
    { id: "vdd",        label: "VDD (3.3 V)",      direction: "input",  width: 1, type: "power"   },
    { id: "tx_p",       label: "TX_P[3:0]",        direction: "bidir",  width: 4, type: "data"    },
    { id: "tx_n",       label: "TX_N[3:0]",        direction: "bidir",  width: 4, type: "data"    },
    { id: "rx_p",       label: "RX_P[3:0]",        direction: "bidir",  width: 4, type: "data"    },
    { id: "rx_n",       label: "RX_N[3:0]",        direction: "bidir",  width: 4, type: "data"    },
    { id: "eq",         label: "EQ[1:0]",          direction: "input",  width: 2, type: "control" },
    { id: "gain",       label: "GAIN[1:0]",        direction: "input",  width: 2, type: "control" },
    { id: "oe_n",       label: "OE#",              direction: "input",  width: 1, type: "control" },
  ],

  // Microchip MCP23017 16-bit I2C GPIO expander
  chip_gpio_expander: [
    { id: "vdd",        label: "VDD (1.8–5.5 V)",  direction: "input",  width: 1,  type: "power"   },
    { id: "sda",        label: "SDA",              direction: "bidir",  width: 1,  type: "data"    },
    { id: "scl",        label: "SCL",              direction: "input",  width: 1,  type: "clock"   },
    { id: "a",          label: "A[2:0]",           direction: "input",  width: 3,  type: "data"    },
    { id: "reset_n",    label: "RESET#",           direction: "input",  width: 1,  type: "control" },
    { id: "int_a",      label: "INTA",             direction: "output", width: 1,  type: "control" },
    { id: "int_b",      label: "INTB",             direction: "output", width: 1,  type: "control" },
    { id: "gpa",        label: "GPA[7:0]",         direction: "bidir",  width: 8,  type: "data"    },
    { id: "gpb",        label: "GPB[7:0]",         direction: "bidir",  width: 8,  type: "data"    },
  ],

  // ── LPDDR4 (existing — must come after chip block) ────────────────────────
  // LPDDR4 Controller (32-bit data bus x2 channels, AXI4 user interface)
  lpddr4_ctrl: [
    { id: "sys_clk",       label: "sys_clk",             direction: "input",  width: 1,  type: "clock"   },
    { id: "rst_n",         label: "rst_n",                direction: "input",  width: 1,  type: "control" },
    { id: "lpddr4_ck_t",   label: "LPDDR4_CK_T",          direction: "output", width: 1,  type: "clock"   },
    { id: "lpddr4_ck_c",   label: "LPDDR4_CK_C",          direction: "output", width: 1,  type: "clock"   },
    { id: "lpddr4_cke",    label: "LPDDR4_CKE[1:0]",      direction: "output", width: 2,  type: "control" },
    { id: "lpddr4_cs",     label: "LPDDR4_CS[1:0]",       direction: "output", width: 2,  type: "control" },
    { id: "lpddr4_ca",     label: "LPDDR4_CA[5:0]",       direction: "output", width: 6,  type: "data"    },
    { id: "lpddr4_dq",     label: "LPDDR4_DQ[31:0]",      direction: "bidir",  width: 32, type: "data"    },
    { id: "lpddr4_dqs_t",  label: "LPDDR4_DQS_T[3:0]",   direction: "bidir",  width: 4,  type: "clock"   },
    { id: "lpddr4_dqs_c",  label: "LPDDR4_DQS_C[3:0]",   direction: "bidir",  width: 4,  type: "clock"   },
    { id: "lpddr4_dmi",    label: "LPDDR4_DMI[3:0]",      direction: "bidir",  width: 4,  type: "control" },
    { id: "lpddr4_reset_n",label: "LPDDR4_RESET_N",        direction: "output", width: 1,  type: "control" },
    { id: "ui_clk",        label: "ui_clk",               direction: "output", width: 1,  type: "clock"   },
    { id: "axi_awaddr",    label: "axi_aw[32:0]",         direction: "input",  width: 33, type: "axi"     },
    { id: "axi_araddr",    label: "axi_ar[32:0]",         direction: "input",  width: 33, type: "axi"     },
    { id: "axi_wdata",     label: "axi_wdata[255:0]",     direction: "input",  width: 256,type: "axi"     },
    { id: "axi_rdata",     label: "axi_rdata[255:0]",     direction: "output", width: 256,type: "axi"     },
    { id: "init_calib",    label: "init_calib_complete",   direction: "output", width: 1,  type: "control" },
  ],

  // ── Power — Regulators ───────────────────────────────────────────────────
  pwr_ldo: [
    { id: "vin",  label: "VIN",     direction: "input",  width: 1, type: "power"   },
    { id: "vout", label: "VOUT",    direction: "output", width: 1, type: "power"   },
    { id: "en",   label: "EN",      direction: "input",  width: 1, type: "control" },
    { id: "pg",   label: "PG",      direction: "output", width: 1, type: "control" },
    { id: "gnd",  label: "GND",     direction: "input",  width: 1, type: "power"   },
  ],
  pwr_buck: [
    { id: "vin",  label: "VIN",     direction: "input",  width: 1, type: "power"   },
    { id: "vout", label: "VOUT",    direction: "output", width: 1, type: "power"   },
    { id: "en",   label: "EN",      direction: "input",  width: 1, type: "control" },
    { id: "pg",   label: "PG",      direction: "output", width: 1, type: "control" },
    { id: "sync", label: "SYNC",    direction: "input",  width: 1, type: "clock"   },
    { id: "gnd",  label: "GND",     direction: "input",  width: 1, type: "power"   },
  ],
  pwr_boost: [
    { id: "vin",  label: "VIN",     direction: "input",  width: 1, type: "power"   },
    { id: "vout", label: "VOUT",    direction: "output", width: 1, type: "power"   },
    { id: "en",   label: "EN",      direction: "input",  width: 1, type: "control" },
    { id: "pg",   label: "PG",      direction: "output", width: 1, type: "control" },
    { id: "gnd",  label: "GND",     direction: "input",  width: 1, type: "power"   },
  ],
  pwr_buck_boost: [
    { id: "vin",  label: "VIN",     direction: "input",  width: 1, type: "power"   },
    { id: "vout", label: "VOUT",    direction: "output", width: 1, type: "power"   },
    { id: "en",   label: "EN",      direction: "input",  width: 1, type: "control" },
    { id: "pg",   label: "PG",      direction: "output", width: 1, type: "control" },
    { id: "gnd",  label: "GND",     direction: "input",  width: 1, type: "power"   },
  ],
  pwr_multiphase: [
    { id: "vin",    label: "VIN",         direction: "input",  width: 1, type: "power"   },
    { id: "vout",   label: "VOUT (core)", direction: "output", width: 1, type: "power"   },
    { id: "en",     label: "EN",          direction: "input",  width: 1, type: "control" },
    { id: "pg",     label: "PG",          direction: "output", width: 1, type: "control" },
    { id: "vsen",   label: "VSEN",        direction: "input",  width: 1, type: "control" },
    { id: "pmbus",  label: "PMBus",       direction: "bidir",  width: 1, type: "control" },
    { id: "sync",   label: "SYNC",        direction: "input",  width: 1, type: "clock"   },
    { id: "gnd",    label: "GND",         direction: "input",  width: 1, type: "power"   },
  ],

  // ── Power — Management ───────────────────────────────────────────────────
  pwr_sequencer: [
    { id: "vin",    label: "VIN",         direction: "input",  width: 1, type: "power"   },
    { id: "en1",    label: "EN1",         direction: "output", width: 1, type: "control" },
    { id: "en2",    label: "EN2",         direction: "output", width: 1, type: "control" },
    { id: "en3",    label: "EN3",         direction: "output", width: 1, type: "control" },
    { id: "en4",    label: "EN4",         direction: "output", width: 1, type: "control" },
    { id: "pg1",    label: "PG1",         direction: "input",  width: 1, type: "control" },
    { id: "pg2",    label: "PG2",         direction: "input",  width: 1, type: "control" },
    { id: "pg3",    label: "PG3",         direction: "input",  width: 1, type: "control" },
    { id: "pg4",    label: "PG4",         direction: "input",  width: 1, type: "control" },
    { id: "fault",  label: "FAULT",       direction: "output", width: 1, type: "control" },
    { id: "mr",     label: "MR (mon-res)",direction: "input",  width: 1, type: "control" },
  ],
  pwr_pmbus_ctrl: [
    { id: "vin",    label: "VIN",         direction: "input",  width: 1, type: "power"   },
    { id: "vout",   label: "VOUT",        direction: "output", width: 1, type: "power"   },
    { id: "pmbus",  label: "PMBus",       direction: "bidir",  width: 1, type: "control" },
    { id: "sync",   label: "SYNC",        direction: "input",  width: 1, type: "clock"   },
    { id: "en",     label: "EN",          direction: "input",  width: 1, type: "control" },
    { id: "pg",     label: "PG",          direction: "output", width: 1, type: "control" },
    { id: "alert",  label: "ALERT#",      direction: "output", width: 1, type: "control" },
    { id: "gnd",    label: "GND",         direction: "input",  width: 1, type: "power"   },
  ],
};

export const NODE_TEMPLATES: NodeTemplate[] = [
  // ── Primitives ──────────────────────────────────────────────────────────
  {
    kind: "generic_ip",    label: "Generic IP",       description: "Configurable soft IP block",              color: "#3b82f6", group: "Primitives",    sourceUrl: "",
    defaultData: { instanceName: "u_ip",     kind: "generic_ip",    clockDomain: "clk_sys",  targetFmaxMhz: 200,  powerEstimate: "", ports: defaultPorts.generic_ip },
  },
  {
    kind: "clock_domain",  label: "Clock Domain",     description: "PLL / clock generation block",            color: "#a855f7", group: "Primitives",    sourceUrl: "",
    defaultData: { instanceName: "u_pll",    kind: "clock_domain",  clockDomain: "clk_ref",  targetFmaxMhz: 0,    powerEstimate: "", ports: defaultPorts.clock_domain },
  },
  {
    kind: "io_pad",        label: "I/O Pad",           description: "GPIO / I/O pin",                         color: "#22c55e", group: "Primitives",    sourceUrl: "",
    defaultData: { instanceName: "u_pad",    kind: "io_pad",        clockDomain: "clk_sys",  targetFmaxMhz: 0,    powerEstimate: "", ports: defaultPorts.io_pad },
  },
  {
    kind: "dsp_block",     label: "DSP Block",         description: "Multiply-accumulate / DSP48",             color: "#f97316", group: "Primitives",    sourceUrl: "",
    defaultData: { instanceName: "u_dsp",    kind: "dsp_block",     clockDomain: "clk_sys",  targetFmaxMhz: 300,  powerEstimate: "", ports: defaultPorts.dsp_block },
  },
  {
    kind: "ram_block",     label: "RAM Block",         description: "BRAM / EBR memory",                      color: "#ef4444", group: "Primitives",    sourceUrl: "",
    defaultData: { instanceName: "u_ram",    kind: "ram_block",     clockDomain: "clk_sys",  targetFmaxMhz: 250,  powerEstimate: "", ports: defaultPorts.ram_block },
  },

  // ── PCIe ────────────────────────────────────────────────────────────────
  {
    kind: "serdes_pma",    label: "SerDes PMA",        description: "Physical Medium Attachment — differential TX/RX lanes", color: "#0ea5e9", group: "PCIe", sourceUrl: "",
    defaultData: { instanceName: "u_pma",    kind: "serdes_pma",    clockDomain: "clk_ref",  targetFmaxMhz: 0,    powerEstimate: "", ports: defaultPorts.serdes_pma },
  },
  {
    kind: "pcie_pcs",      label: "PCIe PCS",          description: "Physical Coding Sublayer — 8b/10b encode/decode",      color: "#38bdf8", group: "PCIe", sourceUrl: "",
    defaultData: { instanceName: "u_pcs",    kind: "pcie_pcs",      clockDomain: "clk_pcs",  targetFmaxMhz: 250,  powerEstimate: "", ports: defaultPorts.pcie_pcs },
  },
  {
    kind: "pcie_ctrl",     label: "PCIe Controller",   description: "TLP/DLLP engine with AXI-Stream user interface",       color: "#7c3aed", group: "PCIe", sourceUrl: "",
    defaultData: { instanceName: "u_pcie",   kind: "pcie_ctrl",     clockDomain: "clk_pcie", targetFmaxMhz: 250,  powerEstimate: "", ports: defaultPorts.pcie_ctrl },
  },

  // ── High-Speed IO ────────────────────────────────────────────────────────
  {
    kind: "ethernet_mac",  label: "Ethernet MAC",      description: "10/100/1000 RGMII MAC with AXI-Stream",  color: "#059669", group: "High-Speed IO", sourceUrl: "",
    defaultData: { instanceName: "u_emac",   kind: "ethernet_mac",  clockDomain: "clk_125",  targetFmaxMhz: 125,  powerEstimate: "", ports: defaultPorts.ethernet_mac },
  },
  {
    kind: "mipi_dphy",     label: "MIPI D-PHY",        description: "CSI-2 / DSI D-PHY — 2-lane differential", color: "#db2777", group: "High-Speed IO", sourceUrl: "",
    defaultData: { instanceName: "u_dphy",   kind: "mipi_dphy",     clockDomain: "clk_byte", targetFmaxMhz: 0,    powerEstimate: "", ports: defaultPorts.mipi_dphy },
  },

  // ── Memory ───────────────────────────────────────────────────────────────
  {
    kind: "ddr3_ctrl",     label: "DDR3 Controller",   description: "DDR3 SDRAM — 16-bit bus, AXI4 UI",        color: "#d97706", group: "Memory",        sourceUrl: "",
    defaultData: { instanceName: "u_ddr3",   kind: "ddr3_ctrl",     clockDomain: "ui_clk",   targetFmaxMhz: 800,  powerEstimate: "", ports: defaultPorts.ddr3_ctrl },
  },
  {
    kind: "ddr4_ctrl",     label: "DDR4 Controller",   description: "DDR4 SDRAM — 16-bit bus, AXI4 UI",        color: "#ea580c", group: "Memory",        sourceUrl: "",
    defaultData: { instanceName: "u_ddr4",   kind: "ddr4_ctrl",     clockDomain: "ui_clk",   targetFmaxMhz: 1600, powerEstimate: "", ports: defaultPorts.ddr4_ctrl },
  },
  {
    kind: "lpddr4_ctrl",   label: "LPDDR4 Controller", description: "LPDDR4 — 32-bit bus x2 ch, AXI4 UI",      color: "#be123c", group: "Memory",        sourceUrl: "",
    defaultData: { instanceName: "u_lpddr4", kind: "lpddr4_ctrl",   clockDomain: "ui_clk",   targetFmaxMhz: 2133, powerEstimate: "", ports: defaultPorts.lpddr4_ctrl },
  },

  // ── Open Source IP — Processors ──────────────────────────────────────────
  {
    kind: "oss_vexriscv",  label: "VexRiscv",          description: "Configurable 32-bit RISC-V (SpinalHDL)",  color: "#4f46e5", group: "Open Source IP", subGroup: "Processors",
    sourceUrl: "https://github.com/SpinalHDL/VexRiscv",
    defaultData: { instanceName: "u_cpu",    kind: "oss_vexriscv",  clockDomain: "clk_sys",  targetFmaxMhz: 100,  powerEstimate: "", ports: defaultPorts.oss_vexriscv },
  },
  {
    kind: "oss_picorv32",  label: "PicoRV32",          description: "Minimal RISC-V RV32IMC (YosysHQ)",        color: "#4338ca", group: "Open Source IP", subGroup: "Processors",
    sourceUrl: "https://github.com/YosysHQ/picorv32",
    defaultData: { instanceName: "u_cpu",    kind: "oss_picorv32",  clockDomain: "clk_sys",  targetFmaxMhz: 100,  powerEstimate: "", ports: defaultPorts.oss_picorv32 },
  },
  {
    kind: "oss_serv",      label: "SERV",              description: "Serial RISC-V — world's smallest RV32I",  color: "#3730a3", group: "Open Source IP", subGroup: "Processors",
    sourceUrl: "https://github.com/olofk/serv",
    defaultData: { instanceName: "u_serv",   kind: "oss_serv",      clockDomain: "clk_sys",  targetFmaxMhz: 80,   powerEstimate: "", ports: defaultPorts.oss_serv },
  },
  {
    kind: "oss_zipcpu",    label: "ZipCPU",            description: "32-bit Wishbone RISC CPU (Gisselquist)",  color: "#312e81", group: "Open Source IP", subGroup: "Processors",
    sourceUrl: "https://github.com/ZipCPU/zipcpu",
    defaultData: { instanceName: "u_zip",    kind: "oss_zipcpu",    clockDomain: "clk_sys",  targetFmaxMhz: 100,  powerEstimate: "", ports: defaultPorts.oss_zipcpu },
  },

  // ── Open Source IP — Peripherals ─────────────────────────────────────────
  {
    kind: "oss_uart16550", label: "UART 16550",        description: "16550-compatible UART (OpenCores)",       color: "#0f766e", group: "Open Source IP", subGroup: "Peripherals",
    sourceUrl: "https://opencores.org/projects/uart16550",
    defaultData: { instanceName: "u_uart",   kind: "oss_uart16550", clockDomain: "clk_sys",  targetFmaxMhz: 100,  powerEstimate: "", ports: defaultPorts.oss_uart16550 },
  },
  {
    kind: "oss_spi_master",label: "SPI Master",        description: "Wishbone SPI master (OpenCores)",         color: "#0e7490", group: "Open Source IP", subGroup: "Peripherals",
    sourceUrl: "https://opencores.org/projects/spi",
    defaultData: { instanceName: "u_spi",    kind: "oss_spi_master",clockDomain: "clk_sys",  targetFmaxMhz: 100,  powerEstimate: "", ports: defaultPorts.oss_spi_master },
  },
  {
    kind: "oss_i2c_master",label: "I2C Master",        description: "Wishbone I2C master/slave (OpenCores)",   color: "#155e75", group: "Open Source IP", subGroup: "Peripherals",
    sourceUrl: "https://opencores.org/projects/i2c",
    defaultData: { instanceName: "u_i2c",    kind: "oss_i2c_master",clockDomain: "clk_sys",  targetFmaxMhz: 100,  powerEstimate: "", ports: defaultPorts.oss_i2c_master },
  },
  {
    kind: "oss_liteeth",   label: "LiteEth",           description: "10/100/1000 Ethernet MAC (LiteX)",        color: "#047857", group: "Open Source IP", subGroup: "Peripherals",
    sourceUrl: "https://github.com/enjoy-digital/liteeth",
    defaultData: { instanceName: "u_eth",    kind: "oss_liteeth",   clockDomain: "clk_sys",  targetFmaxMhz: 125,  powerEstimate: "", ports: defaultPorts.oss_liteeth },
  },

  // ── Open Source IP — Memory ───────────────────────────────────────────────
  {
    kind: "oss_litedram",  label: "LiteDRAM",          description: "DRAM controller — DDR/DDR2/DDR3 (LiteX)", color: "#92400e", group: "Open Source IP", subGroup: "Memory",
    sourceUrl: "https://github.com/enjoy-digital/litedram",
    defaultData: { instanceName: "u_dram",   kind: "oss_litedram",  clockDomain: "user_clk", targetFmaxMhz: 150,  powerEstimate: "", ports: defaultPorts.oss_litedram },
  },
  {
    kind: "oss_litehyperbus", label: "LiteHyperBus",   description: "HyperRAM / HyperFlash controller (LiteX)",color: "#78350f", group: "Open Source IP", subGroup: "Memory",
    sourceUrl: "https://github.com/litex-hub/litehyperbus",
    defaultData: { instanceName: "u_hbus",   kind: "oss_litehyperbus", clockDomain: "clk_sys", targetFmaxMhz: 100, powerEstimate: "", ports: defaultPorts.oss_litehyperbus },
  },

  // ── Open Source IP — Interconnect ─────────────────────────────────────────
  {
    kind: "oss_wb_crossbar", label: "WB Crossbar",     description: "Wishbone B4 N×M crossbar (wb2axip)",      color: "#475569", group: "Open Source IP", subGroup: "Interconnect",
    sourceUrl: "https://github.com/ZipCPU/wb2axip",
    defaultData: { instanceName: "u_wbx",    kind: "oss_wb_crossbar",  clockDomain: "wb_clk",  targetFmaxMhz: 100,  powerEstimate: "", ports: defaultPorts.oss_wb_crossbar },
  },
  {
    kind: "oss_axi_crossbar", label: "AXI4-Lite Xbar",  description: "AXI4-Lite N×M crossbar (wb2axip)",       color: "#334155", group: "Open Source IP", subGroup: "Interconnect",
    sourceUrl: "https://github.com/ZipCPU/wb2axip",
    defaultData: { instanceName: "u_axix",   kind: "oss_axi_crossbar", clockDomain: "aclk",    targetFmaxMhz: 200,  powerEstimate: "", ports: defaultPorts.oss_axi_crossbar },
  },

  // ── Open Source IP — Crypto & DSP ─────────────────────────────────────────
  {
    kind: "oss_aes128",    label: "AES-128",           description: "Pipelined AES-128/192/256 (OpenCores)",   color: "#7e22ce", group: "Open Source IP", subGroup: "Crypto & DSP",
    sourceUrl: "https://github.com/secworks/aes",
    defaultData: { instanceName: "u_aes",    kind: "oss_aes128",    clockDomain: "clk_sys",  targetFmaxMhz: 324,  powerEstimate: "", ports: defaultPorts.oss_aes128 },
  },
  {
    kind: "oss_fft",       label: "FFT Core",          description: "AXI-Stream FFT/IFFT (FPGA FFT)",          color: "#6b21a8", group: "Open Source IP", subGroup: "Crypto & DSP",
    sourceUrl: "https://github.com/ZipCPU/dblclockfft",
    defaultData: { instanceName: "u_fft",    kind: "oss_fft",       clockDomain: "aclk",     targetFmaxMhz: 200,  powerEstimate: "", ports: defaultPorts.oss_fft },
  },
  {
    kind: "oss_cordic",    label: "CORDIC",            description: "Iterative CORDIC — sin/cos/atan/hypot",   color: "#581c87", group: "Open Source IP", subGroup: "Crypto & DSP",
    sourceUrl: "https://github.com/ZipCPU/cordic",
    defaultData: { instanceName: "u_cordic", kind: "oss_cordic",    clockDomain: "clk_sys",  targetFmaxMhz: 250,  powerEstimate: "", ports: defaultPorts.oss_cordic },
  },
  {
    kind: "oss_litescope", label: "LiteScope",         description: "Embedded logic analyzer (LiteX)",         color: "#1e293b", group: "Open Source IP", subGroup: "Crypto & DSP",
    sourceUrl: "https://github.com/enjoy-digital/litescope",
    defaultData: { instanceName: "u_scope",  kind: "oss_litescope", clockDomain: "clk_sys",  targetFmaxMhz: 100,  powerEstimate: "", ports: defaultPorts.oss_litescope },
  },

  // ── 3rd Party Chips — Clocking ────────────────────────────────────────────
  {
    kind: "chip_clk_osc",   label: "Crystal Oscillator", description: "TCXO/VCTCXO reference clock (e.g. ASTX-H11)", color: "#a16207", group: "3rd Party Chip", subGroup: "Clocking", sourceUrl: "https://www.abracon.com",
    defaultData: { instanceName: "X1", kind: "chip_clk_osc", clockDomain: "", targetFmaxMhz: 0, powerEstimate: "", ports: defaultPorts.chip_clk_osc },
  },
  {
    kind: "chip_clk_synth",  label: "Clock Synthesizer",  description: "Jitter-attenuating PLL/synth (e.g. Si5340)", color: "#b45309", group: "3rd Party Chip", subGroup: "Clocking", sourceUrl: "https://www.skyworksinc.com/products/timing/jitter-attenuators-and-clock-synthesizers",
    defaultData: { instanceName: "U_SYNTH", kind: "chip_clk_synth", clockDomain: "", targetFmaxMhz: 0, powerEstimate: "", ports: defaultPorts.chip_clk_synth },
  },
  {
    kind: "chip_clk_buf",    label: "Clock Buffer",        description: "Low-skew fanout buffer (e.g. LMK00301)",     color: "#ca8a04", group: "3rd Party Chip", subGroup: "Clocking", sourceUrl: "https://www.ti.com/product/LMK00301",
    defaultData: { instanceName: "U_CLKBUF", kind: "chip_clk_buf", clockDomain: "", targetFmaxMhz: 0, powerEstimate: "", ports: defaultPorts.chip_clk_buf },
  },

  // ── 3rd Party Chips — Memory ──────────────────────────────────────────────
  {
    kind: "chip_ddr3_sdram", label: "DDR3 SDRAM",          description: "DDR3L SDRAM die (e.g. Micron MT41K256M16)", color: "#0e7490", group: "3rd Party Chip", subGroup: "Memory", sourceUrl: "https://www.micron.com/products/dram/ddr3-sdram",
    defaultData: { instanceName: "U_DDR3", kind: "chip_ddr3_sdram", clockDomain: "", targetFmaxMhz: 0, powerEstimate: "", ports: defaultPorts.chip_ddr3_sdram },
  },
  {
    kind: "chip_hyperram",   label: "HyperRAM",             description: "HyperBus PSRAM (e.g. W956D8MBYA, IS66WVH)", color: "#0891b2", group: "3rd Party Chip", subGroup: "Memory", sourceUrl: "https://www.infineon.com/cms/en/product/memories/nor-flash/hyperram",
    defaultData: { instanceName: "U_HRAM", kind: "chip_hyperram", clockDomain: "", targetFmaxMhz: 0, powerEstimate: "", ports: defaultPorts.chip_hyperram },
  },
  {
    kind: "chip_qspi_flash", label: "QSPI Flash",           description: "Quad-SPI NOR Flash (e.g. W25Q128, MT25Q)", color: "#06b6d4", group: "3rd Party Chip", subGroup: "Memory", sourceUrl: "https://www.winbond.com/hq/product/code-storage-flash-memory/serial-nor-flash",
    defaultData: { instanceName: "U_FLASH", kind: "chip_qspi_flash", clockDomain: "", targetFmaxMhz: 0, powerEstimate: "", ports: defaultPorts.chip_qspi_flash },
  },
  {
    kind: "chip_sram",       label: "SRAM",                  description: "Async/sync SRAM (e.g. CY7C1382, IS61WV)",  color: "#22d3ee", group: "3rd Party Chip", subGroup: "Memory", sourceUrl: "https://www.infineon.com/cms/en/product/memories/sram",
    defaultData: { instanceName: "U_SRAM", kind: "chip_sram", clockDomain: "", targetFmaxMhz: 0, powerEstimate: "", ports: defaultPorts.chip_sram },
  },

  // ── 3rd Party Chips — Networking ──────────────────────────────────────────
  {
    kind: "chip_eth_phy",    label: "Ethernet PHY",          description: "10/100/1000 PHY (e.g. KSZ9031, DP83867)", color: "#15803d", group: "3rd Party Chip", subGroup: "Networking", sourceUrl: "https://www.ti.com/product/DP83867IS",
    defaultData: { instanceName: "U_PHY", kind: "chip_eth_phy", clockDomain: "", targetFmaxMhz: 0, powerEstimate: "", ports: defaultPorts.chip_eth_phy },
  },
  {
    kind: "chip_usb_phy",    label: "USB PHY (ULPI)",         description: "Hi-Speed USB 2.0 PHY (e.g. USB3300)",     color: "#16a34a", group: "3rd Party Chip", subGroup: "Networking", sourceUrl: "https://www.microchip.com/en-us/product/USB3300",
    defaultData: { instanceName: "U_USBPHY", kind: "chip_usb_phy", clockDomain: "", targetFmaxMhz: 0, powerEstimate: "", ports: defaultPorts.chip_usb_phy },
  },
  {
    kind: "chip_can_xcvr",   label: "CAN Transceiver",        description: "CAN bus PHY (e.g. SN65HVD230, MCP2551)", color: "#22c55e", group: "3rd Party Chip", subGroup: "Networking", sourceUrl: "https://www.ti.com/product/SN65HVD230",
    defaultData: { instanceName: "U_CAN", kind: "chip_can_xcvr", clockDomain: "", targetFmaxMhz: 0, powerEstimate: "", ports: defaultPorts.chip_can_xcvr },
  },
  {
    kind: "chip_wifi_bt",    label: "WiFi / BT Module",       description: "WiFi+BT combo (e.g. ESP32, CYW43455)",    color: "#4ade80", group: "3rd Party Chip", subGroup: "Networking", sourceUrl: "https://www.espressif.com/en/products/socs/esp32",
    defaultData: { instanceName: "U_WIFI", kind: "chip_wifi_bt", clockDomain: "", targetFmaxMhz: 0, powerEstimate: "", ports: defaultPorts.chip_wifi_bt },
  },
  {
    kind: "chip_eth_switch",  label: "Ethernet Switch",        description: "Multi-port GbE switch (e.g. KSZ8795)",   color: "#86efac", group: "3rd Party Chip", subGroup: "Networking", sourceUrl: "https://www.microchip.com/en-us/product/KSZ8795",
    defaultData: { instanceName: "U_SW", kind: "chip_eth_switch", clockDomain: "", targetFmaxMhz: 0, powerEstimate: "", ports: defaultPorts.chip_eth_switch },
  },

  // ── 3rd Party Chips — Analog ──────────────────────────────────────────────
  {
    kind: "chip_adc",        label: "RF ADC (AD9361)",        description: "2×2 MIMO RF transceiver 70 MHz–6 GHz",   color: "#be123c", group: "3rd Party Chip", subGroup: "Analog", sourceUrl: "https://www.analog.com/en/products/ad9361.html",
    defaultData: { instanceName: "U_ADC", kind: "chip_adc", clockDomain: "", targetFmaxMhz: 0, powerEstimate: "", ports: defaultPorts.chip_adc },
  },
  {
    kind: "chip_dac",        label: "High-Speed DAC",          description: "14-bit 210 MSPS DAC (e.g. AD9744)",      color: "#e11d48", group: "3rd Party Chip", subGroup: "Analog", sourceUrl: "https://www.analog.com/en/products/ad9744.html",
    defaultData: { instanceName: "U_DAC", kind: "chip_dac", clockDomain: "", targetFmaxMhz: 0, powerEstimate: "", ports: defaultPorts.chip_dac },
  },
  {
    kind: "chip_pmic",       label: "PMIC",                    description: "Power management IC (e.g. TPS65217)",    color: "#fb7185", group: "3rd Party Chip", subGroup: "Analog", sourceUrl: "https://www.ti.com/product/TPS65217",
    defaultData: { instanceName: "U_PMIC", kind: "chip_pmic", clockDomain: "", targetFmaxMhz: 0, powerEstimate: "", ports: defaultPorts.chip_pmic },
  },

  // ── 3rd Party Chips — Sensors & SOM ──────────────────────────────────────
  {
    kind: "chip_mipi_camera", label: "MIPI Camera",            description: "MIPI CSI-2 image sensor (e.g. IMX219)",  color: "#c2410c", group: "3rd Party Chip", subGroup: "Sensors & SOM", sourceUrl: "https://www.sony-semicon.com/en/products/is/industry/imx219.html",
    defaultData: { instanceName: "U_CAM", kind: "chip_mipi_camera", clockDomain: "", targetFmaxMhz: 0, powerEstimate: "", ports: defaultPorts.chip_mipi_camera },
  },
  {
    kind: "chip_radar_som",  label: "Radar SOM",               description: "76–81 GHz FMCW radar (e.g. TI AWR1843)", color: "#ea580c", group: "3rd Party Chip", subGroup: "Sensors & SOM", sourceUrl: "https://www.ti.com/product/AWR1843",
    defaultData: { instanceName: "U_RADAR", kind: "chip_radar_som", clockDomain: "", targetFmaxMhz: 0, powerEstimate: "", ports: defaultPorts.chip_radar_som },
  },
  {
    kind: "chip_lidar_som",  label: "LiDAR SOM",               description: "ToF / scanning LiDAR module",            color: "#f97316", group: "3rd Party Chip", subGroup: "Sensors & SOM", sourceUrl: "https://ouster.com",
    defaultData: { instanceName: "U_LIDAR", kind: "chip_lidar_som", clockDomain: "", targetFmaxMhz: 0, powerEstimate: "", ports: defaultPorts.chip_lidar_som },
  },
  {
    kind: "chip_imu",        label: "IMU",                     description: "6-axis IMU (e.g. ICM-42688-P, BMI088)",  color: "#fb923c", group: "3rd Party Chip", subGroup: "Sensors & SOM", sourceUrl: "https://invensense.tdk.com/products/motion-tracking/6-axis/icm-42688-p",
    defaultData: { instanceName: "U_IMU", kind: "chip_imu", clockDomain: "", targetFmaxMhz: 0, powerEstimate: "", ports: defaultPorts.chip_imu },
  },
  {
    kind: "chip_gps_gnss",   label: "GPS / GNSS",              description: "Multi-band GNSS (e.g. u-blox NEO-M9N)",  color: "#fdba74", group: "3rd Party Chip", subGroup: "Sensors & SOM", sourceUrl: "https://www.u-blox.com/en/product/neo-m9n-module",
    defaultData: { instanceName: "U_GPS", kind: "chip_gps_gnss", clockDomain: "", targetFmaxMhz: 0, powerEstimate: "", ports: defaultPorts.chip_gps_gnss },
  },
  {
    kind: "chip_ai_accel",   label: "AI Accelerator",          description: "Edge inference SOM (e.g. Hailo-8, Coral)", color: "#fed7aa", group: "3rd Party Chip", subGroup: "Sensors & SOM", sourceUrl: "https://hailo.ai/products/hailo-8",
    defaultData: { instanceName: "U_AI", kind: "chip_ai_accel", clockDomain: "", targetFmaxMhz: 0, powerEstimate: "", ports: defaultPorts.chip_ai_accel },
  },

  // ── 3rd Party Chips — Display ─────────────────────────────────────────────
  {
    kind: "chip_hdmi_xcvr",  label: "HDMI Transceiver",        description: "HDMI 1.4 TX (e.g. ADV7511, SiI9022A)",  color: "#1d4ed8", group: "3rd Party Chip", subGroup: "Display", sourceUrl: "https://www.analog.com/en/products/adv7511.html",
    defaultData: { instanceName: "U_HDMI", kind: "chip_hdmi_xcvr", clockDomain: "", targetFmaxMhz: 0, powerEstimate: "", ports: defaultPorts.chip_hdmi_xcvr },
  },
  {
    kind: "chip_lvds_serdes", label: "LVDS SerDes",            description: "FPD-Link serialiser (e.g. DS90CR285)",   color: "#2563eb", group: "3rd Party Chip", subGroup: "Display", sourceUrl: "https://www.ti.com/product/DS90CR285",
    defaultData: { instanceName: "U_SER", kind: "chip_lvds_serdes", clockDomain: "", targetFmaxMhz: 0, powerEstimate: "", ports: defaultPorts.chip_lvds_serdes },
  },

  // ── 3rd Party Chips — Interface ───────────────────────────────────────────
  {
    kind: "chip_level_shift", label: "Level Shifter",          description: "Bidirectional 8-ch shifter (TXB0108)",  color: "#4b5563", group: "3rd Party Chip", subGroup: "Interface", sourceUrl: "https://www.ti.com/product/TXB0108",
    defaultData: { instanceName: "U_LS", kind: "chip_level_shift", clockDomain: "", targetFmaxMhz: 0, powerEstimate: "", ports: defaultPorts.chip_level_shift },
  },
  {
    kind: "chip_pcie_redrv",  label: "PCIe Redriver",          description: "Gen3 x4 redriver (e.g. PI3EQX16904)",   color: "#374151", group: "3rd Party Chip", subGroup: "Interface", sourceUrl: "https://www.diodes.com/products/connectivity/pcie-usb-redriver",
    defaultData: { instanceName: "U_RDR", kind: "chip_pcie_redrv", clockDomain: "", targetFmaxMhz: 0, powerEstimate: "", ports: defaultPorts.chip_pcie_redrv },
  },
  {
    kind: "chip_gpio_expander", label: "GPIO Expander",        description: "16-bit I2C I/O expander (MCP23017)",    color: "#6b7280", group: "3rd Party Chip", subGroup: "Interface", sourceUrl: "https://www.microchip.com/en-us/product/MCP23017",
    defaultData: { instanceName: "U_GPIO", kind: "chip_gpio_expander", clockDomain: "", targetFmaxMhz: 0, powerEstimate: "", ports: defaultPorts.chip_gpio_expander },
  },

  // ── Power — Regulators ───────────────────────────────────────────────────
  {
    kind: "pwr_ldo",         label: "LDO Regulator",       description: "Low-dropout linear reg (e.g. TPS7A47, MAX8887)",  color: "#7c3aed", group: "Power", subGroup: "Regulators", sourceUrl: "https://www.ti.com/product/TPS7A47",
    defaultData: { instanceName: "U_LDO", kind: "pwr_ldo", clockDomain: "", targetFmaxMhz: 0, powerEstimate: "", ports: defaultPorts.pwr_ldo },
  },
  {
    kind: "pwr_buck",        label: "Buck Converter",       description: "Sync step-down DC/DC (e.g. TPS62840, MP2315S)",   color: "#6d28d9", group: "Power", subGroup: "Regulators", sourceUrl: "https://www.ti.com/product/TPS62840",
    defaultData: { instanceName: "U_BUCK", kind: "pwr_buck", clockDomain: "", targetFmaxMhz: 0, powerEstimate: "", ports: defaultPorts.pwr_buck },
  },
  {
    kind: "pwr_boost",       label: "Boost Converter",      description: "Step-up DC/DC (e.g. TPS61023, MP3426GL)",        color: "#5b21b6", group: "Power", subGroup: "Regulators", sourceUrl: "https://www.ti.com/product/TPS61023",
    defaultData: { instanceName: "U_BOOST", kind: "pwr_boost", clockDomain: "", targetFmaxMhz: 0, powerEstimate: "", ports: defaultPorts.pwr_boost },
  },
  {
    kind: "pwr_buck_boost",  label: "Buck-Boost Converter", description: "4-switch buck-boost (e.g. TPS63020, LTC3789)",   color: "#4c1d95", group: "Power", subGroup: "Regulators", sourceUrl: "https://www.ti.com/product/TPS63020",
    defaultData: { instanceName: "U_BB", kind: "pwr_buck_boost", clockDomain: "", targetFmaxMhz: 0, powerEstimate: "", ports: defaultPorts.pwr_buck_boost },
  },
  {
    kind: "pwr_multiphase",  label: "Multi-Phase Buck",     description: "FPGA core VCC regulator (e.g. RAA229004, TPS53647)", color: "#3b0764", group: "Power", subGroup: "Regulators", sourceUrl: "https://www.renesas.com/en/products/power-power-management/multi-phase-controllers",
    defaultData: { instanceName: "U_MPBUCK", kind: "pwr_multiphase", clockDomain: "", targetFmaxMhz: 0, powerEstimate: "", ports: defaultPorts.pwr_multiphase },
  },

  // ── Power — Management ───────────────────────────────────────────────────
  {
    kind: "pwr_sequencer",   label: "Power Sequencer",      description: "Supervisory sequencer (e.g. TPS3700, ADM1066)",  color: "#86198f", group: "Power", subGroup: "Power Management", sourceUrl: "https://www.ti.com/product/TPS3700",
    defaultData: { instanceName: "U_SEQ", kind: "pwr_sequencer", clockDomain: "", targetFmaxMhz: 0, powerEstimate: "", ports: defaultPorts.pwr_sequencer },
  },
  {
    kind: "pwr_pmbus_ctrl",  label: "PMBus Controller",     description: "Digital power mgmt via PMBus (e.g. UCD9090, ISL68137)", color: "#a21caf", group: "Power", subGroup: "Power Management", sourceUrl: "https://www.ti.com/product/UCD9090",
    defaultData: { instanceName: "U_PMBUS", kind: "pwr_pmbus_ctrl", clockDomain: "", targetFmaxMhz: 0, powerEstimate: "", ports: defaultPorts.pwr_pmbus_ctrl },
  },
];

export function templateForKind(kind: NodeKind): NodeTemplate {
  return NODE_TEMPLATES.find((t) => t.kind === kind)!;
}
