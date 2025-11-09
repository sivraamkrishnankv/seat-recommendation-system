"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Globe, { GlobeInstance } from "globe.gl";
import * as THREE from "three";
import { City } from "@/lib/cities";
import { LatLng, haversineDistanceKm } from "@/lib/geo";
import { SunPosition, getSunPosition, getSunTimes } from "@/lib/sun";

type Props = {
  from: City;
  to: City;
  arcPoints: LatLng[];
  sun: SunPosition;
  onHoverProgress?: (t: number | null) => void;
};

export default function Globe3D({ from, to, arcPoints, sun, onHoverProgress }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeInstance | null>(null);
  const planeRef = useRef<THREE.Object3D | null>(null);
  const planeSpriteRef = useRef<THREE.Sprite | null>(null);
  const labelRef = useRef<THREE.Sprite | null>(null);
  const sunGroupRef = useRef<THREE.Group | null>(null);
  const sunAnimRef = useRef<number | null>(null);
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastLabelTextRef = useRef<string>("");

  const arcCoords = useMemo(() => arcPoints.map((p) => [p.lat, p.lon]), [arcPoints]);

  const totalDistanceKm = useMemo(
    () => haversineDistanceKm({ lat: from.lat, lon: from.lon }, { lat: to.lat, lon: to.lon }),
    [from, to]
  );
  const totalDurationHours = useMemo(() => totalDistanceKm / 880, [totalDistanceKm]); // visual speed

  // Initialize globe and objects
  useEffect(() => {
    if (!containerRef.current) return;

    const globe = Globe({ waitForGlobeReady: false })(containerRef.current)
      .backgroundColor("rgba(0,0,0,0)")
      .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-day.jpg")
      .bumpImageUrl("https://unpkg.com/three-globe/example/img/earth-topology.png")
      .showAtmosphere(true)
      .atmosphereColor("#80c0ff")
      .atmosphereAltitude(0.18)
      .arcColor(() => ["#7aa8ff", "#a0c7ff"])
      .arcStroke(1.5)
      .arcAltitude(0.2)
      .pointColor(() => "#fff")
      .pointAltitude(0.01);

    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.12;

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    globe.scene().add(ambient);
    const dir = new THREE.DirectionalLight(0xfff3b0, 1.1);
    dir.position.set(5, 3, 1);
    globe.scene().add(dir);

    // Sun group (mesh + glow)
    const sunGroup = new THREE.Group();
    const sunGeom = new THREE.SphereGeometry(0.22, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffd28a });
    const sunMesh = new THREE.Mesh(sunGeom, sunMat);
    sunGroup.add(sunMesh);
    const glowTex = new THREE.TextureLoader().load("https://unpkg.com/three-globe/example/img/halo.png");
    const glowMat = new THREE.SpriteMaterial({ map: glowTex, color: 0xffe3a1, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
    const glow = new THREE.Sprite(glowMat);
    glow.scale.set(3.0, 3.0, 1);
    sunGroup.add(glow);
    // Add point light to simulate sunlight and improve visibility
    const sunLight = new THREE.PointLight(0xfff1b0, 1.0, 0, 2);
    sunGroup.add(sunLight);
    sunGroup.renderOrder = 999;
    globe.scene().add(sunGroup);
    sunGroupRef.current = sunGroup;

    globeRef.current = globe;

    // Small 3D plane
    const plane = new THREE.Object3D();
    const fuselage = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.28, 24),
      new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.55, roughness: 0.25 })
    );
    fuselage.rotation.x = Math.PI / 2;
    plane.add(fuselage);

    globe.scene().add(plane);
    planeRef.current = plane;

    // Sprite plane for visibility
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    ctx.font = "200px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.fillText("✈️", 128, 128);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true }));
    sprite.scale.set(0.8, 0.5, 1);
    globe.scene().add(sprite);
    planeSpriteRef.current = sprite;

    // Label
    const labelCanvas = document.createElement("canvas");
    labelCanvas.width = 256;
    labelCanvas.height = 64;
    const labelCtx = labelCanvas.getContext("2d")!;
    const labelTex = new THREE.CanvasTexture(labelCanvas);
    const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTex, transparent: true }));
    label.scale.set(0.5, 0.125, 1);
    globe.scene().add(label);
    labelRef.current = label;

    // Animation
    const SPEED_T_PER_SEC = 0.08;
    const baseRadius = 1.03;
    const arcAltitude = 0.2;

    const updateLabel = (elapsedHours: number) => {
      if (!labelRef.current) return;
      const h = Math.floor(elapsedHours);
      const m = Math.floor((elapsedHours - h) * 60);
      const text = `${h}h ${m}m`;
      if (text === lastLabelTextRef.current) return;
      lastLabelTextRef.current = text;

      labelCtx.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
      labelCtx.font = "28px sans-serif";
      labelCtx.textAlign = "center";
      labelCtx.textBaseline = "middle";
      labelCtx.fillStyle = "rgba(0,0,0,0.35)";
      labelCtx.fillRect(0, 0, labelCanvas.width, labelCanvas.height);
      labelCtx.fillStyle = "#FFD700";
      labelCtx.fillText(text, labelCanvas.width / 2, labelCanvas.height / 2);
      labelTex.needsUpdate = true;
    };

    const step = (ts: number) => {
      if (startTimeRef.current == null) startTimeRef.current = ts;
      const elapsedMs = ts - startTimeRef.current;
      const t = ((elapsedMs / 1000) * SPEED_T_PER_SEC) % 1;

      const N = arcPoints.length;
      const ft = t * (N - 1);
      const i = Math.floor(ft);
      const localT = ft - i;

      const curr = arcPoints[i];
      const next = arcPoints[(i + 1) % N];

      // Compute plane along bulged arc
      const lat = curr.lat * (1 - localT) + next.lat * localT;
      const lon = curr.lon * (1 - localT) + next.lon * localT;
      const r = baseRadius + arcAltitude * Math.sin(Math.PI * t); // match arc altitude
      const pos = latLonToVector3(lat, lon, r);

      if (planeRef.current) {
        planeRef.current.position.copy(pos);

        // Orient along tangent
        const tangent = latLonToVector3(next.lat, next.lon, r).sub(latLonToVector3(curr.lat, curr.lon, r)).normalize();
        const lookTarget = pos.clone().add(tangent);
        planeRef.current.lookAt(lookTarget);
      }

      if (planeSpriteRef.current) {
        planeSpriteRef.current.position.copy(pos.clone().add(pos.clone().normalize().multiplyScalar(0.08)));
      }

      if (labelRef.current) {
        labelRef.current.position.copy(pos.clone().add(pos.clone().normalize().multiplyScalar(0.12)));
      }

      updateLabel(t * totalDurationHours);
      onHoverProgress?.(t);

      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (sunAnimRef.current) cancelAnimationFrame(sunAnimRef.current);
      globeRef.current = null;
    };
  }, []);

  // Update arcs + initial sun placement
  useEffect(() => {
    if (!globeRef.current) return;
    const globe = globeRef.current;

    globe.arcsData([{ startLat: from.lat, startLng: from.lon, endLat: to.lat, endLng: to.lon }]);

    if (sunGroupRef.current) {
      const dir = azAltToDirection(sun.azimuth, sun.altitude);
      sunGroupRef.current.position.set(dir.x * 5, dir.y * 5, dir.z * 5);
    }
  }, [from, to, arcCoords, sun.altitude, sun.azimuth]);

  // Animate sun position over time based on current date/time
  useEffect(() => {
    if (!sunGroupRef.current) return;
    const step = () => {
      const now = new Date();
      const sp = getSunPosition({ lat: from.lat, lon: from.lon }, now);
      const dir = azAltToDirection(sp.azimuth, sp.altitude);
      sunGroupRef.current!.position.set(dir.x * 5, dir.y * 5, dir.z * 5);
      sunAnimRef.current = requestAnimationFrame(step);
    };
    sunAnimRef.current = requestAnimationFrame(step);
    return () => {
      if (sunAnimRef.current) cancelAnimationFrame(sunAnimRef.current);
      sunAnimRef.current = null;
    };
  }, [from.lat, from.lon]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div ref={containerRef} className="relative w-[90%] h-[90%] flex items-center justify-center" />
      {/* Sunrise/Sunset info (bottom-left) */}
      <div className="absolute left-3 bottom-3 panel rounded-md px-3 py-2 text-[12px] soft-shadow bg-neutral-900/70">
        {(() => {
          const times = getSunTimes({ lat: from.lat, lon: from.lon }, new Date());
          const fmt = (d: Date) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
          return (
            <div className="flex flex-col gap-1">
              <div><span className="text-yellow-400">Sunrise</span>: {fmt(times.sunrise)} GMT</div>
              <div><span className="text-orange-400">Sunset</span>: {fmt(times.sunset)} GMT</div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// Helpers
function latLonToVector3(lat: number, lon: number, radius = 1) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

function azAltToDirection(azimuthDeg: number, altitudeDeg: number) {
  // azimuth: deg from North clockwise; altitude: deg above horizon
  const az = (azimuthDeg * Math.PI) / 180;
  const alt = (altitudeDeg * Math.PI) / 180;
  const x = Math.sin(az) * Math.cos(alt);
  const y = Math.sin(alt);
  const z = Math.cos(az) * Math.cos(alt);
  return new THREE.Vector3(x, y, z).normalize();
}
