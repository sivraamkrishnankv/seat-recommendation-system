"use client";
import { useMemo } from "react";
import { City } from "@/lib/cities";

type Props = {
  from: City;
  to: City;
  scenicSide: "left" | "right" | "none";
  date: Date;
};

type Seat = { id: string; row: number; col: string; side: "left" | "right"; window: boolean };

// Simple narrow-body layout (A B C - D E F)
function generateSeats(rows = 24): Seat[] {
  const cols = ["A", "B", "C", "D", "E", "F"];
  const seats: Seat[] = [];

  // Header row for seat types
  for (let c = 0; c < cols.length; c++) {
    seats.push({ id: `0${cols[c]}`, row: 0, col: cols[c], side: c < 3 ? "left" : "right", window: false });
  }

  // Actual seats
  for (let r = 1; r <= rows; r++) {
    for (const c of cols) {
      const side = c < "D" ? "left" : "right";
      const window = c === "A" || c === "F";
      seats.push({ id: `${r}${c}`, row: r, col: c, side, window });
    }
  }

  return seats;
}

export default function SeatingMap({ from, to, scenicSide, date }: Props) {
  const seats = useMemo(() => generateSeats(28), []);

  const goldenIds = useMemo(() => {
    if (scenicSide === "none") {
      return new Set(seats.filter(s => s.window && s.row > 0).map(s => s.id));
    }
    return new Set(seats.filter(s => s.window && s.side === scenicSide && s.row > 0).map(s => s.id));
  }, [seats, scenicSide]);

  const goldenList = useMemo(() => Array.from(goldenIds).sort((a, b) => parseInt(a) - parseInt(b)), [goldenIds]);

  // width retained for layout math (keep in use to avoid unused var)
  const width = 700;
  const rowH = 26;        // row height (enlarged)
  const colW = 52;        // column width (enlarged)
  const xOffset = 70;
  const yOffset = 12;     // internal content offset used for layout math
  const totalRows = 29;   // header + 28 rows
  const topPadding = 24;  // visual padding inside capsule
  const bottomPadding = 24;
  const height = topPadding + totalRows * rowH + bottomPadding; // compact, no extra slack
  const aisleGap = 24;   // aisle width
  // Compute horizontal centering offset so seat grid is centered within the SVG
  const seatContentWidth = 5 * colW + aisleGap + 42; // from left edge to far right seat edge (seat width 42)
  const svgWidth = seatContentWidth + 120; // minimal side gutters
  const targetLeft = 60; // minimal left gutter inside capsule
  const dx = targetLeft - xOffset;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[color:var(--color-foreground)]/10">
        <div className="text-lg font-medium">Seats — Scenic side: <span className="text-[color:var(--color-gold)]">{scenicSide}</span></div>
        <div className="text-sm text-[color:var(--color-muted)]">{from.iata} → {to.iata} • {date.toLocaleString()}</div>
      </div>

      {/* Seats with legend */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="flex gap-6 h-full">
          {/* Plane shell using flex + rounded capsule (wings removed as requested) */}
          <div className="relative flex-1 rounded-[56px] border border-[color:var(--color-foreground)]/15 bg-[color:var(--color-panel)]/50 overflow-hidden">

            {/* Seats SVG (only aisle + seats) */}
            <svg viewBox={`0 0 ${svgWidth} ${height}`} className="w-full h-full">
              <g transform={`translate(${dx},${topPadding - yOffset})`}>
                {/* Aisle removed as requested */}

                {/* Seats */}
                {seats.map((s) => {
                const colIndex = "ABCDEF".indexOf(s.col);
                const x = colIndex < 3 ? xOffset + colIndex * colW : xOffset + colIndex * colW + aisleGap;
                const y = yOffset + s.row * rowH;

                // Header row for abbreviations
                if (s.row === 0) {
                  const seatTypes = ["LW", "C", "LA", "RA", "C", "RW"];
                  return (
                    <text
                      key={s.id}
                      x={x + colW / 2}
                      y={y + rowH / 2 + 2}
                      textAnchor="middle"
                      className="fill-[color:var(--color-muted)] text-[10px] font-semibold"
                    >
                      {seatTypes[colIndex]}
                    </text>
                  );
                }

            const golden = goldenIds.has(s.id);
                const base = golden
                  ? "fill-[color:var(--color-gold)]/85 stroke-[color:var(--color-gold)] glow-gold"
                  : "fill-[color:var(--color-foreground)]/15 stroke-[color:var(--color-foreground)]/20";
                const labelClass = golden
                  ? "fill-[color:var(--color-background)] text-[10px] font-semibold"
                  : "fill-[color:var(--color-foreground)] text-[10px] font-semibold";

                return (
                  <g key={s.id}>
                    <rect x={x} y={y} width={42} height={18} rx={5} className={base} />
                    <text x={x + 21} y={y + 13} textAnchor="middle" className={labelClass}>{s.col}</text>
                    {s.col === "A" && <text x={x - 30} y={y + 13} textAnchor="end" className="fill-[color:var(--color-foreground)]/50 text-[10px]">{s.row}</text>}
                  </g>
                );
                })}
              </g>
            </svg>
          </div>

          {/* Legend column outside the shell */}
          <div className="w-48 shrink-0 rounded-xl border border-[color:var(--color-foreground)]/10 bg-[color:var(--color-panel)]/40 p-3 h-fit self-start">
            <div className="text-[12px] font-semibold text-[color:var(--color-muted)] mb-2">Legend:</div>
            <ul className="space-y-1 text-[11px] text-[color:var(--color-muted)]">
              <li>LW - Left Window</li>
              <li>C - Center</li>
              <li>LA - Left Aisle</li>
              <li>RA - Right Aisle</li>
              <li>RW - Right Window</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[color:var(--color-foreground)]/10 text-sm flex items-start justify-between gap-4">
        <div className="flex-1 whitespace-normal break-words leading-relaxed">
          Golden seats: <span className="text-[color:var(--color-gold)]">{goldenList.join(", ")}</span>
        </div>
        <div className="text-[color:var(--color-muted)]">
          {scenicSide === "left" ? "Prefer left window (A) for sun views" : scenicSide === "right" ? "Prefer right window (F) for sun views" : "Either side is okay at this time"}
        </div>
      </div>
    </div>
  );
}
