# Lattice Avant FPGA Block Editor — User Guide

## What is this tool?

The FPGA Block Editor is a web-based visual design tool for Lattice Avant FPGAs. It lets Field and Regional Application Engineers build block-level system diagrams where every block, port, and connection maps directly to real hardware — and then export that diagram as a hardware netlist or synthesisable RTL (Verilog / VHDL) that can be imported straight into Lattice Radiant or Xilinx Vivado.

It replaces ad-hoc PowerPoint block diagrams with a structured, exportable design intent.

---

## Accessing the Tool

| Method | How |
|---|---|
| **Web (recommended)** | Open the Vercel URL shared by your team in any modern browser (Chrome, Edge, Firefox) |
| **Offline / local file** | Extract `fpga-editor.zip`, open `out/index.html` in Microsoft Edge |
| **Run locally** | Install Node.js 22, run `npm install` then `npm run dev`, open `http://localhost:3000` |

---

## Interface Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  Toolbar: "Lattice Avant — FPGA Block Editor"     [Export ▾]    │
├───────────────┬─────────────────────────────────┬───────────────┤
│               │                                 │               │
│  IP Block     │        Canvas                   │  Node Config  │
│  Palette      │   (drag, connect, pan, zoom)    │  Panel        │
│               │                                 │  (appears on  │
│  - Primitives │                                 │   node click) │
│  - PCIe       │                                 │               │
│  - High-Speed │                                 │               │
│  - Memory     │                                 │               │
│  - OSS IPs ▾  │                                 │               │
│  - Power ▾    │                                 │               │
│  - 3rd Party▾ │                                 │               │
│               │                                 │               │
│  [Signal key] │                        [MiniMap]│               │
└───────────────┴─────────────────────────────────┴───────────────┘
```

---

## Step-by-Step: Building a Design

### 1. Add blocks to the canvas

- In the **IP Block Palette** (left sidebar), find the component you need.
- **Drag it** onto the canvas and drop it where you want it.
- Collapsible sections (Open Source IPs, Power, 3rd Party Chips) — click the section header to expand.

### 2. Pan and zoom the canvas

| Action | How |
|---|---|
| Pan | Click and drag on empty canvas space |
| Zoom | Scroll wheel |
| Fit all blocks | Use the zoom controls (bottom-right) |
| Overview | MiniMap (bottom-left) |

### 3. Connect ports

- Hover over a block — small **coloured circles** appear on the left and right edges. These are the ports.
- **Left side** = input ports (data flows in)
- **Right side** = output ports (data flows out); bidirectional ports appear on both sides
- **Click and drag** from one port circle to another to draw a connection.
- Invalid connections (e.g. output→output, clock→data) are automatically rejected.

The wire colour and thickness tell you what's connected:

| Colour | Signal type | Thickness |
|---|---|---|
| Yellow (dashed) | Clock | 1px |
| Light grey | Data | Scales with bus width |
| Orange | Control | Scales with bus width |
| Purple | AXI | Scales with bus width |
| Red | Power | 1px |

### 4. Edit a block's properties

- **Click any block** on the canvas — the **Node Config Panel** opens on the right.
- Fields you can edit:
  - **Instance Name** — the RTL instance name (e.g. `u_pll`, `u_ddr4`)
  - **Clock Domain** — which clock domain this block belongs to
  - **Target Fmax (MHz)** — your timing target for this block
  - **Power Estimate** — free-form power budget note (e.g. `350 mW`)
- **Port editor** — every port on the block is listed. You can:
  - Rename the port ID and label
  - Change direction (input / output / bidir)
  - Change signal type (clock / data / control / axi / power)
  - Change bus width (number of bits)
  - Delete a port with the trash icon
  - Add a new port with **+ Add Port**
- Click **×** (top-right of the panel) to close it.

### 5. Delete a block or wire

- Select a block or wire by clicking it, then press the **Delete** key.

---

## Component Library

### Primitives (Lattice Avant fabric)
| Block | Description |
|---|---|
| Generic IP | Placeholder for any custom soft IP |
| PLL / Clock Domain | On-chip PLL — maps to `EHXPLLL` in Radiant |
| I/O Pad | Top-level FPGA pin — becomes a port in the exported RTL |
| DSP Block | 18×18 multiplier — maps to `MULT18X18D` in Radiant |
| RAM Block | Dual-port BRAM — maps to `PDP16K` in Radiant |

### PCIe
SerDes PMA, PCIe PCS, PCIe Controller

### High-Speed IO
Ethernet MAC (10/100/1G), MIPI D-PHY

### Memory Controllers
DDR3, DDR4, LPDDR4

### Open Source IPs
- **Processors:** VexRiscv, PicoRV32, SERV, ZipCPU
- **Peripherals:** UART 16550, SPI Master, I2C Master, LiteEth
- **Memory:** LiteDRAM, LiteHyperBus
- **Interconnect:** Wishbone Crossbar, AXI Crossbar
- **Crypto & DSP:** AES-128, FFT, CORDIC, LiteScope

### Power
- **Regulators:** LDO, Buck, Boost, Buck-Boost, Multi-Phase Buck
- **Management:** Power Sequencer, PMBus Controller

### 3rd Party Chips
Clocking (oscillator, synth, buffer), Memory (DDR3 SDRAM, HyperRAM, QSPI Flash, SRAM), Networking (Ethernet PHY, USB PHY, CAN, WiFi/BT, Switch), Analog (RF ADC, DAC, PMIC), Sensors & SOM (MIPI Camera, Radar, LiDAR, IMU, GNSS, AI Accelerator), Display (HDMI, LVDS SerDes), Interface (Level Shifter, PCIe Redriver, GPIO Expander)

---

## Exporting Your Design

Click the **Export** button (top-right toolbar) and choose a format from the dropdown:

### JSON Netlist
A structured machine-readable description of all modules and nets. Useful for:
- Version control / design review
- Feeding into custom scripts or automation

```json
{
  "schematic": {
    "version": "1.0",
    "target_device": "Lattice Avant",
    "modules": [ { "instance_name": "u_pll", "ip_type": "clock_domain", ... } ],
    "nets":    [ { "source": { "instance_id": "...", "port_id": "clk_out0" }, ... } ]
  }
}
```

### Verilog (.v)
Structural Verilog with:
- Top-level ports from your `io_pad` nodes
- `wire` declarations for all internal connections
- Module instantiations for every block
- Black-box declarations for 3rd-party / OSS IPs
- Inline comments with vendor primitive substitution hints

**Import into Lattice Radiant:** File → New → Design File → add the `.v` file, then add IP sources for each module.

**Import into Xilinx Vivado:** Add Sources → Add or Create Design Sources → add the `.v` file, then use IP Catalog for each module.

### VHDL (.vhd)
Same connectivity, VHDL syntax — `entity` / `architecture structural` style with full `component` declarations and `signal` declarations.

---

## Tips

- **I/O Pad direction is auto-detected** in the exported RTL — a pad only driven by internal logic becomes an `output`; a pad that only drives internal logic becomes an `input`. Place `io_pad` blocks for every physical FPGA pin.
- **Instance names matter** — they become the RTL instance identifiers. Use short, descriptive names like `u_pll`, `u_ddr4_ctrl`.
- **Clock domain field** is carried into the exported RTL as a comment — useful for timing constraint scripts.
- **Bus width on ports** controls the wire width in the exported Verilog (`wire [31:0]` etc.).
- The MiniMap (bottom-left) is helpful for navigating large designs.

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Delete` | Delete selected node or edge |
| Scroll | Zoom in/out |
| Click + drag (canvas) | Pan |
| Click + drag (port dot) | Draw a connection |

---

## Frequently Asked Questions

**Q: I drew a connection but it disappeared — why?**
The connection validator rejected it. Common reasons: connecting two outputs together, connecting a clock port to a data port, or connecting a port to itself. Check that the source is an output/bidir and the target is an input/bidir, and that signal types are compatible.

**Q: Can I add my own custom IP not in the palette?**
Yes — drag a **Generic IP** block onto the canvas, click it to open the config panel, rename it, and use **+ Add Port** to define exactly the ports you need.

**Q: Will the exported Verilog synthesise directly?**
The export is a structural connectivity template — it instantiates modules and connects wires. You still need to provide (or generate via IP Catalog) the actual RTL or netlists for each module. Think of it as the "top-level glue" file.

**Q: Can I use this for non-Lattice FPGAs?**
Yes. The Verilog/VHDL export is vendor-neutral structural RTL. The vendor hints in comments are suggestions only — replace the module names with your vendor's primitives as needed.
