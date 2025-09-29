"use client";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { findCityByIata } from "@/lib/cities";
import { greatCirclePoints, initialBearing, haversineDistanceKm } from "@/lib/geo";
import { getSunPosition, scenicSideRelativeToHeading } from "@/lib/sun";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const Globe3D = dynamic(() => import("@/components/Globe3D"), { ssr: false });
const SeatingMap = dynamic(() => import("@/components/SeatingMap"), { ssr: false });

export default function VisualizeClient() {
  const params = useSearchParams();
  const from = params.get("from") || "JFK";
  const to = params.get("to") || "LHR";
  const dtStr = params.get("dt");
  const dt = useMemo(() => (dtStr ? new Date(dtStr) : new Date()), [dtStr]);

  const fromCity = findCityByIata(from)!;
  const toCity = findCityByIata(to)!;

  const arcPoints = useMemo(() => greatCirclePoints(
    { lat: fromCity.lat, lon: fromCity.lon },
    { lat: toCity.lat, lon: toCity.lon },
    128
  ), [fromCity, toCity]);

  const heading = useMemo(() => initialBearing(
    { lat: fromCity.lat, lon: fromCity.lon },
    { lat: toCity.lat, lon: toCity.lon }
  ), [fromCity, toCity]);

  const sun = useMemo(() => getSunPosition({ lat: fromCity.lat, lon: fromCity.lon }, dt), [fromCity, dt]);
  const scenicSide = useMemo(() => scenicSideRelativeToHeading(heading, sun.azimuth), [heading, sun.azimuth]);

  const [hoverT, setHoverT] = useState<number | null>(null);

  const distanceKm = useMemo(() => haversineDistanceKm(
    { lat: fromCity.lat, lon: fromCity.lon },
    { lat: toCity.lat, lon: toCity.lon }
  ), [fromCity, toCity]);
  const durationStr = useMemo(() => {
    const hours = distanceKm / 880; // visual cruise speed assumption
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  }, [distanceKm]);

  return (
    <div className="w-full min-h-screen p-4 md:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[calc(100vh-5.5rem)]">
        <motion.div className="col-span-1 lg:col-span-3 panel rounded-xl overflow-hidden soft-shadow relative" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Globe3D
            from={fromCity}
            to={toCity}
            arcPoints={arcPoints}
            sun={sun}
            onHoverProgress={setHoverT}
          />
        </motion.div>
        <motion.div className="col-span-1 lg:col-span-2 panel rounded-xl overflow-hidden flex flex-col soft-shadow" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <SeatingMap
            from={fromCity}
            to={toCity}
            scenicSide={scenicSide}
            hoverProgress={hoverT}
            date={dt}
          />
        </motion.div>
      </div>
      {/* Full-width bottom bar across both panes */}
      <div className="mt-4 panel rounded-xl p-3 soft-shadow">
        <div className="text-sm flex flex-wrap items-center gap-3">
          <span className="text-[color:var(--color-muted)]">Golden seats</span>
          {/* We cannot access seat list here directly without duplicating logic; show side and route summary */}
          <span className="px-2 py-1 rounded bg-white/5">{fromCity.iata} → {toCity.iata}</span>
          <span>Scenic side: <span className="text-[color:var(--color-gold)]">{scenicSide === 'none' ? 'both' : scenicSide}</span></span>
          <span>Duration: <span className="text-[color:var(--color-gold)]">{durationStr}</span></span>
          <span className="text-[color:var(--color-muted)]">{dt.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}


