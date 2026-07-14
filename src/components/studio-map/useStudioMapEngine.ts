"use client";

import { useEffect, useRef } from "react";

const CANVAS_SIZE = 5000;
const MIN_SCALE = 0.12;
const MAX_SCALE = 2.0;
const ZOOM_FACTOR = 1.1;

export function useStudioMapEngine() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Pan/zoom state lives in refs, not React state — this changes every frame.
  const panX = useRef(0);
  const panY = useRef(0);
  const scale = useRef(0.45);

  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);

  const updateTransform = () => {
    if (!canvasRef.current) return;
    canvasRef.current.style.transform = `translate(${panX.current}px, ${panY.current}px) scale(${scale.current})`;
  };

  useEffect(() => {
    // Center canvas on mount, same as original init.
    panX.current = (window.innerWidth - CANVAS_SIZE * scale.current) / 2;
    panY.current = (window.innerHeight - CANVAS_SIZE * scale.current) / 2;
    updateTransform();

    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      startX.current = e.clientX - panX.current;
      startY.current = e.clientY - panY.current;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      panX.current = e.clientX - startX.current;
      panY.current = e.clientY - startY.current;
      updateTransform();
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const nextScale =
        e.deltaY < 0
          ? scale.current * ZOOM_FACTOR
          : scale.current / ZOOM_FACTOR;
      const clampedScale = Math.min(Math.max(MIN_SCALE, nextScale), MAX_SCALE);

      const rect = viewport.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Zoom toward cursor position, not canvas origin.
      const canvasX = (mouseX - panX.current) / scale.current;
      const canvasY = (mouseY - panY.current) / scale.current;

      panX.current = mouseX - canvasX * clampedScale;
      panY.current = mouseY - canvasY * clampedScale;
      scale.current = clampedScale;

      updateTransform();
    };

    const handleResize = () => {
      // Keep it simple for now — recenter isn't required here since
      // focus-mode recalculation will own this later.
    };

    viewport.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    viewport.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("resize", handleResize);

    return () => {
      viewport.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      viewport.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return { viewportRef, canvasRef };
}
