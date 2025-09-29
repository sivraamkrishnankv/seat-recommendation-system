import SunCalc from "suncalc";
import { LatLng } from "./geo";

export type SunPosition = { azimuth: number; altitude: number };

// Returns sun azimuth (deg from North, clockwise) and altitude (deg from horizon)
export function getSunPosition(latlng: LatLng, at: Date): SunPosition {
  const pos = SunCalc.getPosition(at, latlng.lat, latlng.lon);
  const azimuthFromNorth = (90 - (pos.azimuth * 180) / Math.PI + 360) % 360; // convert from radians east-from-south
  const altitudeDeg = (pos.altitude * 180) / Math.PI;
  return { azimuth: azimuthFromNorth, altitude: altitudeDeg };
}

// Decide left/right views relative to aircraft heading (0=N, 90=E)
export function scenicSideRelativeToHeading(headingDeg: number, sunAzimuthDeg: number): "left" | "right" | "none" {
  const diff = ((sunAzimuthDeg - headingDeg + 540) % 360) - 180; // -180..180
  if (Math.abs(diff) < 15) return "none"; // sun straight ahead or behind: no side
  return diff > 0 ? "right" : "left";
}

export function getSunTimes(latlng: LatLng, at: Date): { sunrise: Date; sunset: Date } {
  const t = SunCalc.getTimes(at, latlng.lat, latlng.lon);
  return { sunrise: t.sunrise, sunset: t.sunset };
}



