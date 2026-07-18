"use client";

import { useEffect, useRef } from "react";
import styles from "./VantaGlobeBackground.module.css";

type VantaEffect = {
  destroy: () => void;
};

function readColor(token: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim();
}

export function VantaGlobeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let effect: VantaEffect | null = null;
    let disposed = false;
    let initialization = 0;

    async function initialize() {
      const currentInitialization = ++initialization;

      if (reducedMotion.matches || !containerRef.current) return;

      const [{ default: GLOBE }, THREE] = await Promise.all([
        import("vanta/dist/vanta.globe.min"),
        import("three"),
      ]);

      if (
        disposed ||
        reducedMotion.matches ||
        currentInitialization !== initialization ||
        !containerRef.current
      ) {
        return;
      }

      effect = GLOBE({
        el: containerRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        scale: 1,
        scaleMobile: 0.75,
        color: readColor("--color-accent"),
        color2: readColor("--color-accent-hover"),
        backgroundColor: readColor("--color-bg"),
        backgroundAlpha: 0,
        size: 0.85,
        points: 8,
        maxDistance: 18,
        spacing: 17,
        showDots: true,
      });
    }

    function handleMotionPreferenceChange() {
      initialization += 1;
      effect?.destroy();
      effect = null;

      if (!reducedMotion.matches) void initialize();
    }

    void initialize();
    reducedMotion.addEventListener("change", handleMotionPreferenceChange);

    return () => {
      disposed = true;
      initialization += 1;
      reducedMotion.removeEventListener("change", handleMotionPreferenceChange);
      effect?.destroy();
    };
  }, []);

  return <div ref={containerRef} className={styles.background} aria-hidden="true" />;
}
