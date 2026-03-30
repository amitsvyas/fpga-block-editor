import type { Node } from "@xyflow/react";

export type PortDirection = "input" | "output" | "bidir";
export type PortType = "clock" | "data" | "control" | "axi" | "power";
export type NodeKind =
  | "generic_ip"
  | "clock_domain"
  | "io_pad"
  | "dsp_block"
  | "ram_block"
  | "serdes_pma"
  | "pcie_pcs"
  | "pcie_ctrl"
  | "ethernet_mac"
  | "mipi_dphy"
  | "ddr3_ctrl"
  | "ddr4_ctrl"
  | "lpddr4_ctrl"
  // Open Source IPs — Processors
  | "oss_vexriscv"
  | "oss_picorv32"
  | "oss_serv"
  | "oss_zipcpu"
  // Open Source IPs — Peripherals
  | "oss_uart16550"
  | "oss_spi_master"
  | "oss_i2c_master"
  | "oss_liteeth"
  // Open Source IPs — Memory
  | "oss_litedram"
  | "oss_litehyperbus"
  // Open Source IPs — Interconnect
  | "oss_wb_crossbar"
  | "oss_axi_crossbar"
  // Open Source IPs — Crypto & DSP
  | "oss_aes128"
  | "oss_fft"
  | "oss_cordic"
  | "oss_litescope"
  // 3rd Party Chips — Clocking
  | "chip_clk_osc"
  | "chip_clk_synth"
  | "chip_clk_buf"
  // 3rd Party Chips — Memory
  | "chip_ddr3_sdram"
  | "chip_hyperram"
  | "chip_qspi_flash"
  | "chip_sram"
  // 3rd Party Chips — Networking
  | "chip_eth_phy"
  | "chip_usb_phy"
  | "chip_can_xcvr"
  | "chip_wifi_bt"
  | "chip_eth_switch"
  // 3rd Party Chips — Analog
  | "chip_adc"
  | "chip_dac"
  | "chip_pmic"
  // 3rd Party Chips — Sensors & SOM
  | "chip_mipi_camera"
  | "chip_radar_som"
  | "chip_lidar_som"
  | "chip_imu"
  | "chip_gps_gnss"
  | "chip_ai_accel"
  // 3rd Party Chips — Display
  | "chip_hdmi_xcvr"
  | "chip_lvds_serdes"
  // 3rd Party Chips — Interface
  | "chip_level_shift"
  | "chip_pcie_redrv"
  | "chip_gpio_expander"
  // Power — Regulators
  | "pwr_ldo"
  | "pwr_buck"
  | "pwr_boost"
  | "pwr_buck_boost"
  | "pwr_multiphase"
  // Power — Management
  | "pwr_sequencer"
  | "pwr_pmbus_ctrl";

export interface Port {
  id: string;
  label: string;
  direction: PortDirection;
  width: number;
  type: PortType;
}

export interface NodeData extends Record<string, unknown> {
  instanceName: string;
  kind: NodeKind;
  clockDomain: string;
  targetFmaxMhz: number;
  powerEstimate: string;
  ports: Port[];
}

export type HardwareNode = Node<NodeData, "hardware">;
