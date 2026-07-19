"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CircleHelp } from "lucide-react";
import styles from "./FieldTooltip.module.css";

interface FieldTooltipProps {
  fieldName: string;
  children: string;
}

interface TooltipPosition {
  left: number;
  top: number;
  ready: boolean;
}

const VIEWPORT_MARGIN = 12;
const TRIGGER_GAP = 8;
const HOVER_DELAY_MS = 400;

/**
 * Ayuda contextual para etiquetas de campo. Sigue el patrón de tooltip
 * simple de Material 3 y también se abre con foco o toque para no depender
 * exclusivamente de un mouse.
 */
export function FieldTooltip({ fieldName, children }: FieldTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>({
    left: 0,
    top: 0,
    ready: false,
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const hoverTimerRef = useRef<number | null>(null);
  const tooltipId = useId();

  function clearHoverTimer() {
    if (hoverTimerRef.current !== null) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }

  function showNow() {
    if (!visible) setPosition((current) => ({ ...current, ready: false }));
    setVisible(true);
  }

  function showAfterDelay() {
    clearHoverTimer();
    hoverTimerRef.current = window.setTimeout(showNow, HOVER_DELAY_MS);
  }

  function hideFromPointer() {
    clearHoverTimer();
    if (document.activeElement !== triggerRef.current) setVisible(false);
  }

  useLayoutEffect(() => {
    if (!visible) return;

    function positionTooltip() {
      const trigger = triggerRef.current;
      const tooltip = tooltipRef.current;
      if (!trigger || !tooltip) return;

      const triggerRect = trigger.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const centeredLeft = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
      const left = Math.min(
        Math.max(centeredLeft, VIEWPORT_MARGIN),
        window.innerWidth - tooltipRect.width - VIEWPORT_MARGIN
      );
      const fitsAbove = triggerRect.top >= tooltipRect.height + TRIGGER_GAP + VIEWPORT_MARGIN;
      const top = fitsAbove
        ? triggerRect.top - tooltipRect.height - TRIGGER_GAP
        : triggerRect.bottom + TRIGGER_GAP;

      setPosition({ left, top, ready: true });
    }

    positionTooltip();
    window.addEventListener("resize", positionTooltip);
    window.addEventListener("scroll", positionTooltip, true);
    return () => {
      window.removeEventListener("resize", positionTooltip);
      window.removeEventListener("scroll", positionTooltip, true);
    };
  }, [children, visible]);

  useEffect(() => {
    if (!visible) return;

    function dismiss(event: PointerEvent) {
      if (!triggerRef.current?.contains(event.target as Node)) setVisible(false);
    }

    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [visible]);

  useEffect(() => () => clearHoverTimer(), []);

  return (
    <span className={styles.wrapper}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label={`Ayuda sobre ${fieldName}`}
        aria-describedby={visible ? tooltipId : undefined}
        onMouseEnter={showAfterDelay}
        onMouseLeave={hideFromPointer}
        onFocus={() => {
          clearHoverTimer();
          showNow();
        }}
        onBlur={() => setVisible(false)}
        onClick={showNow}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setVisible(false);
            triggerRef.current?.blur();
          }
        }}
      >
        <CircleHelp size={16} strokeWidth={2} aria-hidden="true" />
      </button>

      {visible &&
        typeof document !== "undefined" &&
        createPortal(
          <span
            ref={tooltipRef}
            id={tooltipId}
            role="tooltip"
            className={styles.tooltip}
            data-ready={position.ready}
            style={{ left: position.left, top: position.top }}
          >
            {children}
          </span>,
          document.body
        )}
    </span>
  );
}
