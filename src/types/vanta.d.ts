declare module "vanta/dist/vanta.globe.min" {
  interface VantaGlobeOptions {
    el: HTMLElement;
    THREE: typeof import("three");
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    scale?: number;
    scaleMobile?: number;
    color?: string | number;
    color2?: string | number;
    backgroundColor?: string | number;
    backgroundAlpha?: number;
    size?: number;
    points?: number;
    maxDistance?: number;
    spacing?: number;
    showDots?: boolean;
  }

  interface VantaGlobeEffect {
    destroy(): void;
    resize(): void;
    setOptions(options: Partial<VantaGlobeOptions>): void;
  }

  export default function GLOBE(options: VantaGlobeOptions): VantaGlobeEffect;
}
