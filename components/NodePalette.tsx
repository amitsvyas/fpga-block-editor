"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { NODE_TEMPLATES, type NodeTemplate } from "@/lib/nodeTemplates";
import type { NodeKind } from "@/types/hardware";

type VendorGroup = "Primitives" | "PCIe" | "High-Speed IO" | "Memory";
type OssSubGroup = "Processors" | "Peripherals" | "Memory" | "Interconnect" | "Crypto & DSP";
type ChipSubGroup = "Clocking" | "Memory" | "Networking" | "Analog" | "Sensors & SOM" | "Display" | "Interface";
type PowerSubGroup = "Regulators" | "Power Management";

const VENDOR_GROUP_ORDER: VendorGroup[] = ["Primitives", "PCIe", "High-Speed IO", "Memory"];
const OSS_SUBGROUP_ORDER: OssSubGroup[] = ["Processors", "Peripherals", "Memory", "Interconnect", "Crypto & DSP"];
const CHIP_SUBGROUP_ORDER: ChipSubGroup[] = ["Clocking", "Memory", "Networking", "Analog", "Sensors & SOM", "Display", "Interface"];
const POWER_SUBGROUP_ORDER: PowerSubGroup[] = ["Regulators", "Power Management"];

const vendorGroups = VENDOR_GROUP_ORDER.map((g) => ({
  group: g,
  templates: NODE_TEMPLATES.filter((t) => t.group === g),
}));

const ossTemplates = NODE_TEMPLATES.filter((t) => t.group === "Open Source IP");
const ossSubGroups = OSS_SUBGROUP_ORDER.map((sg) => ({
  subGroup: sg,
  templates: ossTemplates.filter((t) => t.subGroup === sg),
})).filter((g) => g.templates.length > 0);

const chipTemplates = NODE_TEMPLATES.filter((t) => t.group === "3rd Party Chip");
const chipSubGroups = CHIP_SUBGROUP_ORDER.map((sg) => ({
  subGroup: sg,
  templates: chipTemplates.filter((t) => t.subGroup === sg),
})).filter((g) => g.templates.length > 0);

const powerTemplates = NODE_TEMPLATES.filter((t) => t.group === "Power");
const powerSubGroups = POWER_SUBGROUP_ORDER.map((sg) => ({
  subGroup: sg,
  templates: powerTemplates.filter((t) => t.subGroup === sg),
})).filter((g) => g.templates.length > 0);

function PaletteBlock({ t, onDragStart }: { t: NodeTemplate; onDragStart: (e: React.DragEvent, kind: NodeKind) => void }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, t.kind)}
      className="rounded cursor-grab active:cursor-grabbing select-none"
      style={{ border: "1px solid #3a3a5c" }}
      title={t.sourceUrl ? `Source: ${t.sourceUrl}` : undefined}
    >
      <div
        className="px-2 py-1 text-[11px] font-semibold text-white rounded-t truncate"
        style={{ background: t.color }}
      >
        {t.label}
      </div>
      <div className="px-2 py-1 text-[10px] text-zinc-400 bg-[#1e1e38] rounded-b leading-tight">
        {t.description}
      </div>
    </div>
  );
}

export default function NodePalette() {
  const [ossOpen, setOssOpen] = useState(false);
  const [ossSubOpen, setOssSubOpen] = useState<Record<string, boolean>>({});
  const [chipOpen, setChipOpen] = useState(false);
  const [chipSubOpen, setChipSubOpen] = useState<Record<string, boolean>>({});
  const [powerOpen, setPowerOpen] = useState(false);
  const [powerSubOpen, setPowerSubOpen] = useState<Record<string, boolean>>({});

  function onDragStart(e: React.DragEvent, kind: NodeKind) {
    e.dataTransfer.setData("application/fpga-node-kind", kind);
    e.dataTransfer.effectAllowed = "move";
  }

  function toggleSub(sg: string) {
    setOssSubOpen((prev) => ({ ...prev, [sg]: !prev[sg] }));
  }

  function toggleChipSub(sg: string) {
    setChipSubOpen((prev) => ({ ...prev, [sg]: !prev[sg] }));
  }

  function togglePowerSub(sg: string) {
    setPowerSubOpen((prev) => ({ ...prev, [sg]: !prev[sg] }));
  }

  return (
    <aside
      className="flex flex-col w-52 shrink-0 overflow-y-auto"
      style={{ background: "#16162a", borderRight: "1px solid #3a3a5c" }}
    >
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-zinc-700 shrink-0">
        <p className="text-[11px] font-semibold text-zinc-300 tracking-wide">IP Block Palette</p>
        <p className="text-[9px] text-zinc-500 mt-0.5">Drag blocks onto canvas</p>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-3">
        {/* ── Vendor / Primitive groups ── */}
        {vendorGroups.map(({ group, templates }) => (
          <div key={group}>
            <p className="text-[9px] uppercase tracking-widest text-zinc-500 px-1 mb-1.5">{group}</p>
            <div className="flex flex-col gap-1">
              {templates.map((t) => (
                <PaletteBlock key={t.kind} t={t} onDragStart={onDragStart} />
              ))}
            </div>
          </div>
        ))}

        {/* ── Open Source IP — collapsible top section ── */}
        <div>
          <button
            onClick={() => setOssOpen((v) => !v)}
            className="w-full flex items-center justify-between px-1 mb-1.5 group"
          >
            <p className="text-[9px] uppercase tracking-widest text-zinc-400 group-hover:text-zinc-200 transition-colors">
              Open Source IPs
            </p>
            {ossOpen
              ? <ChevronDown size={11} className="text-zinc-400" />
              : <ChevronRight size={11} className="text-zinc-500" />}
          </button>

          {ossOpen && (
            <div className="flex flex-col gap-2 pl-1 border-l border-zinc-700">
              {ossSubGroups.map(({ subGroup, templates }) => (
                <div key={subGroup}>
                  <button
                    onClick={() => toggleSub(subGroup)}
                    className="w-full flex items-center gap-1 py-0.5 group"
                  >
                    {ossSubOpen[subGroup]
                      ? <ChevronDown size={10} className="text-zinc-500 shrink-0" />
                      : <ChevronRight size={10} className="text-zinc-500 shrink-0" />}
                    <p className="text-[9px] uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300 transition-colors">
                      {subGroup}
                    </p>
                    <span className="ml-auto text-[9px] text-zinc-600">{templates.length}</span>
                  </button>

                  {ossSubOpen[subGroup] && (
                    <div className="flex flex-col gap-1 mt-1">
                      {templates.map((t) => (
                        <PaletteBlock key={t.kind} t={t} onDragStart={onDragStart} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Power — collapsible section ── */}
        <div>
          <button
            onClick={() => setPowerOpen((v) => !v)}
            className="w-full flex items-center justify-between px-1 mb-1.5 group"
          >
            <p className="text-[9px] uppercase tracking-widest text-zinc-400 group-hover:text-zinc-200 transition-colors">
              Power
            </p>
            {powerOpen
              ? <ChevronDown size={11} className="text-zinc-400" />
              : <ChevronRight size={11} className="text-zinc-500" />}
          </button>

          {powerOpen && (
            <div className="flex flex-col gap-2 pl-1 border-l border-zinc-700">
              {powerSubGroups.map(({ subGroup, templates }) => (
                <div key={subGroup}>
                  <button
                    onClick={() => togglePowerSub(subGroup)}
                    className="w-full flex items-center gap-1 py-0.5 group"
                  >
                    {powerSubOpen[subGroup]
                      ? <ChevronDown size={10} className="text-zinc-500 shrink-0" />
                      : <ChevronRight size={10} className="text-zinc-500 shrink-0" />}
                    <p className="text-[9px] uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300 transition-colors">
                      {subGroup}
                    </p>
                    <span className="ml-auto text-[9px] text-zinc-600">{templates.length}</span>
                  </button>

                  {powerSubOpen[subGroup] && (
                    <div className="flex flex-col gap-1 mt-1">
                      {templates.map((t) => (
                        <PaletteBlock key={t.kind} t={t} onDragStart={onDragStart} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 3rd Party Chips — collapsible section ── */}
        <div>
          <button
            onClick={() => setChipOpen((v) => !v)}
            className="w-full flex items-center justify-between px-1 mb-1.5 group"
          >
            <p className="text-[9px] uppercase tracking-widest text-zinc-400 group-hover:text-zinc-200 transition-colors">
              3rd Party Chips
            </p>
            {chipOpen
              ? <ChevronDown size={11} className="text-zinc-400" />
              : <ChevronRight size={11} className="text-zinc-500" />}
          </button>

          {chipOpen && (
            <div className="flex flex-col gap-2 pl-1 border-l border-zinc-700">
              {chipSubGroups.map(({ subGroup, templates }) => (
                <div key={subGroup}>
                  <button
                    onClick={() => toggleChipSub(subGroup)}
                    className="w-full flex items-center gap-1 py-0.5 group"
                  >
                    {chipSubOpen[subGroup]
                      ? <ChevronDown size={10} className="text-zinc-500 shrink-0" />
                      : <ChevronRight size={10} className="text-zinc-500 shrink-0" />}
                    <p className="text-[9px] uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300 transition-colors">
                      {subGroup}
                    </p>
                    <span className="ml-auto text-[9px] text-zinc-600">{templates.length}</span>
                  </button>

                  {chipSubOpen[subGroup] && (
                    <div className="flex flex-col gap-1 mt-1">
                      {templates.map((t) => (
                        <PaletteBlock key={t.kind} t={t} onDragStart={onDragStart} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Signal type legend */}
      <div className="px-3 py-3 border-t border-zinc-700 shrink-0">
        <p className="text-[9px] uppercase tracking-widest text-zinc-500 mb-1.5">Signal Types</p>
        {[
          { color: "#facc15", label: "Clock"   },
          { color: "#94a3b8", label: "Data"    },
          { color: "#fb923c", label: "Control" },
          { color: "#a78bfa", label: "AXI"     },
          { color: "#f87171", label: "Power"   },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2 py-0.5">
            <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
            <span className="text-[10px] text-zinc-400">{label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
