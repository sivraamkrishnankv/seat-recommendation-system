import { geoInterpolate } from "d3-geo";

export type LatLng = { lat: number; lon: number };

export function toRadians(deg: number) {
  return (deg * Math.PI) / 180;
}

export function toDegrees(rad: number) {
  return (rad * 180) / Math.PI;
}

// Great-circle distance using haversine (km)
export function haversineDistanceKm(a: LatLng, b: LatLng): number {
  const R = 6371; // Earth radius
  const dLat = toRadians(b.lat - a.lat);
  const dLon = toRadians(b.lon - a.lon);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const sinDlat = Math.sin(dLat / 2);
  const sinDlon = Math.sin(dLon / 2);
  const h = sinDlat * sinDlat + Math.cos(lat1) * Math.cos(lat2) * sinDlon * sinDlon;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

// Flight bearing from a -> b (degrees from North, clockwise)
export function initialBearing(a: LatLng, b: LatLng): number {
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const dLon = toRadians(b.lon - a.lon);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const brng = Math.atan2(y, x);
  return (toDegrees(brng) + 360) % 360;
}

// Great-circle arc sampling N+1 points including endpoints
export function greatCirclePoints(a: LatLng, b: LatLng, segments = 64): LatLng[] {
  const interp = geoInterpolate([a.lon, a.lat], [b.lon, b.lat]);
  const points: LatLng[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const [lon, lat] = interp(t);
    points.push({ lat, lon });
  }
  return points;
}



