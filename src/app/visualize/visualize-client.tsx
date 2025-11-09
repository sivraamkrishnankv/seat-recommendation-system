"use client";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { findCityByIata } from "@/lib/cities";
import { greatCirclePoints, initialBearing, haversineDistanceKm } from "@/lib/geo";
import { getSunPosition, scenicSideRelativeToHeading } from "@/lib/sun";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

// Dynamic imports for client-only components
const Globe3D = dynamic(() => import("@/components/Globe3D"), { ssr: false });
const SeatingMap = dynamic(() => import("@/components/SeatingMap"), { ssr: false });
const Map2D = dynamic(() => import("@/components/Map2D"), { ssr: false });

export default function VisualizeClient() {
  const params = useSearchParams();
  const from = params.get("from") || "JFK";
  const to = params.get("to") || "LHR";
  const dtStr = params.get("dt");
  const dt = useMemo(() => (dtStr ? new Date(dtStr) : new Date()), [dtStr]);

  const fromCity = findCityByIata(from)!;
  const toCity = findCityByIata(to)!;

  const arcPoints = useMemo(
    () =>
      greatCirclePoints(
        { lat: fromCity.lat, lon: fromCity.lon },
        { lat: toCity.lat, lon: toCity.lon },
        128
      ),
    [fromCity, toCity]
  );

  const heading = useMemo(
    () => initialBearing({ lat: fromCity.lat, lon: fromCity.lon }, { lat: toCity.lat, lon: toCity.lon }),
    [fromCity, toCity]
  );

  const sun = useMemo(() => getSunPosition({ lat: fromCity.lat, lon: fromCity.lon }, dt), [fromCity, dt]);
  const scenicSide = useMemo(() => scenicSideRelativeToHeading(heading, sun.azimuth), [heading, sun.azimuth]);

  const [hoverT, setHoverT] = useState<number | null>(null);
  const [mode, setMode] = useState<"3d" | "2d">("3d");

  const distanceKm = useMemo(
    () => haversineDistanceKm({ lat: fromCity.lat, lon: fromCity.lon }, { lat: toCity.lat, lon: toCity.lon }),
    [fromCity, toCity]
  );

  const durationStr = useMemo(() => {
    const hours = distanceKm / 880;
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  }, [distanceKm]);

  const timings = ["2:00", "4:00", "6:00", "8:00"]; // Example timing array

  return (
    <div className="w-full min-h-screen p-4 md:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[calc(100vh-5.5rem)]">
        <motion.div
          className="col-span-1 lg:col-span-3 panel rounded-xl overflow-hidden soft-shadow relative"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Toggle Button */}
          <button
            onClick={() => setMode(mode === "3d" ? "2d" : "3d")}
            className="absolute top-4 right-4 z-10 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
          >
            {mode === "3d" ? "Switch to 2D" : "Switch to 3D"}
          </button>

          {mode === "3d" ? (
            <Globe3D from={fromCity} to={toCity} arcPoints={arcPoints} sun={sun} onHoverProgress={setHoverT} />
          ) : (
            <Map2D from={fromCity} to={toCity} timings={timings} />
          )}
        </motion.div>

        <motion.div
          className="col-span-1 lg:col-span-2 panel rounded-xl overflow-hidden flex flex-col soft-shadow"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <SeatingMap from={fromCity} to={toCity} scenicSide={scenicSide} hoverProgress={hoverT} date={dt} />
        </motion.div>
      </div>

      {/* Full-width bottom bar across both panes */}
      <div className="mt-4 panel rounded-xl p-3 soft-shadow">
        <div className="text-sm flex flex-wrap items-center gap-3">
          <span className="text-[color:var(--color-muted)]">Golden seats</span>
          <span className="px-2 py-1 rounded bg-white/5">{fromCity.iata} → {toCity.iata}</span>
          <span>
            Scenic side: <span className="text-[color:var(--color-gold)]">{scenicSide === "none" ? "both" : scenicSide}</span>
          </span>
          <span>
            Duration: <span className="text-[color:var(--color-gold)]">{durationStr}</span>
          </span>
          <span className="text-[color:var(--color-muted)]">{dt.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
