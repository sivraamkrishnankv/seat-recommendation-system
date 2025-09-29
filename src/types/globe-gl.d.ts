declare module "globe.gl" {
  import type { Scene, Material } from "three";
  export type GlobeInstance = {
    backgroundColor: (c: string) => GlobeInstance;
    globeImageUrl: (u: unknown) => GlobeInstance;
    bumpImageUrl: (u: unknown) => GlobeInstance;
    showAtmosphere: (b: boolean) => GlobeInstance;
    atmosphereColor: (c: string) => GlobeInstance;
    atmosphereAltitude: (n: number) => GlobeInstance;
    arcColor: (fn: () => [string, string]) => GlobeInstance;
    arcDashLength: (n: number) => GlobeInstance;
    arcDashGap: (n: number) => GlobeInstance;
    arcDashInitialGap: (fn: () => number) => GlobeInstance;
    arcStroke: (n: number) => GlobeInstance;
    arcAltitude: (n: number) => GlobeInstance;
    arcLabel: (fn: () => string) => GlobeInstance;
    pointColor: (fn: () => string) => GlobeInstance;
    pointAltitude: (n: number) => GlobeInstance;
    pointLabel: (key: string) => GlobeInstance;
    controls: () => { autoRotate: boolean; autoRotateSpeed: number };
    scene: () => Scene;
    arcsData: (data: Array<{ startLat: number; startLng: number; endLat: number; endLng: number }>) => GlobeInstance;
    globeMaterial: (m: Material) => GlobeInstance;
  };
  export type ConfigOptions = { waitForGlobeReady?: boolean };
  export default function Globe(options?: ConfigOptions): (el: HTMLElement) => GlobeInstance;
}


