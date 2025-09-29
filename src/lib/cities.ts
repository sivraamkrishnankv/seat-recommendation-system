export type City = {
  name: string;
  country: string;
  iata: string;
  lat: number;
  lon: number;
  tz: string;
};

// Minimal curated list for demo; extendable without external APIs
export const CITIES: City[] = [
  { name: "New York", country: "USA", iata: "JFK", lat: 40.6413, lon: -73.7781, tz: "America/New_York" },
  { name: "Los Angeles", country: "USA", iata: "LAX", lat: 33.9416, lon: -118.4085, tz: "America/Los_Angeles" },
  { name: "San Francisco", country: "USA", iata: "SFO", lat: 37.6213, lon: -122.3790, tz: "America/Los_Angeles" },
  { name: "Chicago", country: "USA", iata: "ORD", lat: 41.9742, lon: -87.9073, tz: "America/Chicago" },
  { name: "London", country: "UK", iata: "LHR", lat: 51.4700, lon: -0.4543, tz: "Europe/London" },
  { name: "Paris", country: "France", iata: "CDG", lat: 49.0097, lon: 2.5479, tz: "Europe/Paris" },
  { name: "Tokyo", country: "Japan", iata: "HND", lat: 35.5494, lon: 139.7798, tz: "Asia/Tokyo" },
  { name: "Sydney", country: "Australia", iata: "SYD", lat: -33.9399, lon: 151.1753, tz: "Australia/Sydney" },
  { name: "Dubai", country: "UAE", iata: "DXB", lat: 25.2532, lon: 55.3657, tz: "Asia/Dubai" },
  { name: "Singapore", country: "Singapore", iata: "SIN", lat: 1.3644, lon: 103.9915, tz: "Asia/Singapore" },
  { name: "Delhi", country: "India", iata: "DEL", lat: 28.5562, lon: 77.1000, tz: "Asia/Kolkata" },
  { name: "São Paulo", country: "Brazil", iata: "GRU", lat: -23.4356, lon: -46.4731, tz: "America/Sao_Paulo" },
  { name: "Johannesburg", country: "South Africa", iata: "JNB", lat: -26.1392, lon: 28.2460, tz: "Africa/Johannesburg" },
  { name: "Toronto", country: "Canada", iata: "YYZ", lat: 43.6777, lon: -79.6248, tz: "America/Toronto" },
  { name: "Reykjavík", country: "Iceland", iata: "KEF", lat: 63.9850, lon: -22.6056, tz: "Atlantic/Reykjavik" }
];

export function cityLabel(city: City): string {
  return `${city.name} (${city.iata})`;
}

export function findCityByIata(iata: string): City | undefined {
  return CITIES.find(c => c.iata === iata);
}



