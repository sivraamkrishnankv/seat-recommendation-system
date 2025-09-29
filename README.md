Scenic Seat Finder — a Next.js app to pick the best sunrise/sunset seats on a flight.

## Features
- 3D interactive globe with great-circle arc and sun sphere
- Flight timing hover and animated dashes
- Airplane seating map (body-only) with golden seats
- Recommendations by comparing heading and sun azimuth
- Responsive dark UI, Framer Motion animations

## Tech
- Next.js App Router + TypeScript
- Tailwind CSS
- three + globe.gl
- suncalc, d3-geo, date-fns

## Getting Started
1. Install dependencies
```bash
npm install
```
2. Run dev server
```bash
npm run dev
```
3. Open http://localhost:3000

## Build
```bash
npm run build
npm start
```

## Deploy
- Vercel: connect repo and deploy. No extra config needed.
- Netlify: build command `npm run build`, publish `.next` using Next.js adapter or Next.js runtime.
- AWS Amplify: build with `npm ci && npm run build` and start `next start`.

## Environment
- No API keys required. All data is local.

## Notes
- City list is minimal and can be extended in `src/lib/cities.ts`.
- Seat logic: window seats on the side facing the sun are marked golden.
