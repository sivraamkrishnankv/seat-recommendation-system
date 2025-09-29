"use client";
import { useMemo } from "react";
import { City } from "@/lib/cities";

type Props = {
  from: City;
  to: City;
  scenicSide: "left" | "right" | "none";
  hoverProgress: number | null;
  date: Date;
};

type Seat = { id: string; row: number; col: string; side: "left" | "right"; window: boolean };

// Simple narrow-body body-only layout (A B C - D E F) with window seats A and F
function generateSeats(rows = 24): Seat[] {
  const cols = ["A", "B", "C", "D", "E", "F"];
  const seats: Seat[] = [];
  for (let r = 1; r <= rows; r++) {
    for (const c of cols) {
      const side = c < "D" ? "left" : "right";
      const window = c === "A" || c === "F";
      seats.push({ id: `${r}${c}`, row: r, col: c, side, window });
    }
  }
  return seats;
}

export default function SeatingMap({ from, to, scenicSide, hoverProgress: _hoverProgress, date }: Props) {
  const seats = useMemo(() => generateSeats(28), []);
  const goldenIds = useMemo(() => {
    if (scenicSide === "none") {
      return new Set(seats.filter(s => s.window).map(s => s.id));
    }
    return new Set(seats.filter(s => s.window && s.side === scenicSide).map(s => s.id));
  }, [seats, scenicSide]);

  const goldenList = useMemo(() => Array.from(goldenIds).sort((a, b) => parseInt(a) - parseInt(b)), [goldenIds]);

  const width = 600;
  const height = 520;
  const rowH = 16;
  const colW = 36;
  const xOffset = 60;
  const yOffset = 40;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/10">
        <div className="text-lg font-medium">Seats — Scenic side: <span className="text-[color:var(--color-gold)]">{scenicSide}</span></div>
        <div className="text-sm text-[color:var(--color-muted)]">{from.iata} → {to.iata} • {date.toLocaleString()}</div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          {/* Fuselage silhouette */}
          <path d={`M ${width/2} 20
                   C ${width*0.75} 40, ${width*0.9} 80, ${width-40} ${height-120}
                   L ${width-40} ${height-80}
                   C ${width-40} ${height-60}, ${width*0.75} ${height-40}, ${width/2} ${height-40}
                   C ${width*0.25} ${height-40}, 40 ${height-60}, 40 ${height-80}
                   L 40 ${height-120}
                   C ${width*0.1} 80, ${width*0.25} 40, ${width/2} 20
                  `}
                className="fill-[color:var(--color-panel)] stroke-white/10" />
          {/* Cabin rectangle for seats */}
          <rect x={60} y={60} width={width-120} height={height-160} rx={40} className="fill-[color:var(--color-panel)] stroke-white/10" />
          {/* Aisle divider */}
          <line x1={width/2} y1={60} x2={width/2} y2={height-100} className="stroke-white/10" />
          {seats.map((s) => {
            const colIndex = "ABCDEF".indexOf(s.col);
            const x = xOffset + colIndex * colW + (colIndex >= 3 ? 40 : 0);
            const y = yOffset + (s.row - 1) * rowH;
            const golden = goldenIds.has(s.id);
            const base = golden ? "fill-[color:var(--color-gold)]/85 stroke-[color:var(--color-gold)] glow-gold" : "fill-white/15 stroke-white/15";
            return (
              <g key={s.id}>
                <rect x={x} y={y} width={28} height={12} rx={3} className={`${base}`} />
                <text x={x+14} y={y+9} textAnchor="middle" className="fill-black text-[8px] font-semibold">{s.col}</text>
                {s.col === "A" && <text x={x-22} y={y+9} textAnchor="end" className="fill-white/50 text-[8px]">{s.row}</text>}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="p-3 border-t border-white/10 text-sm flex items-center justify-between gap-4">
        <div className="truncate">Golden seats: <span className="text-[color:var(--color-gold)]">{goldenList.slice(0, 30).join(", ")}{goldenList.length>30?"…":""}</span></div>
        <div className="text-[color:var(--color-muted)]">{scenicSide === "left" ? "Prefer left window (A) for sun views" : scenicSide === "right" ? "Prefer right window (F) for sun views" : "Either side is okay at this time"}</div>
      </div>
    </div>
  );
}


