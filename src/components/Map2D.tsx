"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { geoMercator, geoInterpolate } from "d3-geo";
import { haversineDistanceKm, greatCirclePoints } from "@/lib/geo";
import { City } from "@/lib/cities";

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

type Map2DProps = {
  from: City;
  to: City;
};

const Map2D: React.FC<Map2DProps> = ({ from, to }) => {
  const [glow, setGlow] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 980,
    height: 520,
  });

  useEffect(() => {
    const interval = setInterval(() => setGlow((prev) => !prev), 600);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({
          width: Math.max(480, width),
          height: Math.max(300, height),
        });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const srcCoords = useMemo<[number, number]>(
    () => [from.lon, from.lat],
    [from.lon, from.lat]
  );
  const destCoords = useMemo<[number, number]>(
    () => [to.lon, to.lat],
    [to.lon, to.lat]
  );

  const mid = useMemo<[number, number]>(() => {
    const interp = geoInterpolate(srcCoords, destCoords);
    const [lon, lat] = interp(0.5);
    return [lon, lat];
  }, [srcCoords, destCoords]);

  const routeKm = useMemo(
    () => haversineDistanceKm({ lat: from.lat, lon: from.lon }, { lat: to.lat, lon: to.lon }),
    [from, to]
  );

  // Scale primarily by container size so the map fills the pane; keeps a sensible range
  const dynamicScale = useMemo(() => {
    const sizeFactor = Math.max(0.5, Math.min(2.0, size.width / 980));
    const base = 200 * sizeFactor;
    return Math.max(120, Math.min(260, base));
  }, [size.width]);

  const gcPoints = useMemo(
    () => greatCirclePoints({ lat: from.lat, lon: from.lon }, { lat: to.lat, lon: to.lon }, 128),
    [from.lat, from.lon, to.lat, to.lon]
  );

  const { projection, rotateSetting } = useMemo(() => {
    if (gcPoints.length === 0) {
      const projFallback = geoMercator();
      return { projection: projFallback, rotateSetting: [0, 0, 0] as [number, number, number] };
    }

    const unwrapped: number[] = [];
    let prev = gcPoints[0].lon;
    unwrapped.push(prev);
    for (let i = 1; i < gcPoints.length; i++) {
      let lon = gcPoints[i].lon;
      while (lon - prev > 180) lon -= 360;
      while (lon - prev < -180) lon += 360;
      unwrapped.push(lon);
      prev = lon;
    }
    const minLon = Math.min(...unwrapped);
    const maxLon = Math.max(...unwrapped);
    const centerLonUnwrapped = (minLon + maxLon) / 2;
    const centerLon = ((centerLonUnwrapped + 540) % 360) - 180;
    const rotateArr: [number, number, number] = [-centerLon, 0, 0];

    const proj = geoMercator()
      .rotate(rotateArr)
      .scale(dynamicScale)
      .center([0, 0])
      .translate([size.width / 2, size.height / 2]);
    return { projection: proj, rotateSetting: rotateArr };
  }, [gcPoints, dynamicScale, mid, size.width, size.height]);

  const pathD = useMemo(() => {
    const projected = gcPoints
      .map(({ lat, lon }) => projection([lon, lat]))
      .filter(
        (p): p is [number, number] =>
          Array.isArray(p) && p.length === 2 && Number.isFinite(p[0]) && Number.isFinite(p[1])
      );
    if (projected.length === 0) return "";
    const [firstX, firstY] = projected[0];
    const rest = projected
      .slice(1)
      .map(([x, y]) => `L${x},${y}`)
      .join(" ");
    return `M${firstX},${firstY} ${rest}`;
  }, [gcPoints, projection]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center bg-gray-900 rounded-xl overflow-hidden"
    >
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: dynamicScale, center: [0, 0], rotate: rotateSetting }}
        width={size.width}
        height={size.height}
        style={{ width: "100%", height: "100%" }}
        className="w-full h-full"
      >
        <Geographies geography={geoUrl}>
          {({ geographies }: { geographies: Array<{ rsmKey: string }> }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#374151"
                stroke="#9ca3af"
                strokeWidth={0.3}
              />
            ))
          }
        </Geographies>

        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke={glow ? "yellow" : "orange"}
            strokeWidth={glow ? 3 : 2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        <Marker coordinates={srcCoords}>
          <circle r={6} fill="lime" stroke="white" strokeWidth={2} />
        </Marker>
        <Marker coordinates={destCoords}>
          <circle r={6} fill="red" stroke="white" strokeWidth={2} />
        </Marker>
      </ComposableMap>
    </div>
  );
};

export default Map2D;
