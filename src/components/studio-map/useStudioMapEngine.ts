"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { albumDataset, type TapeInstance } from "./data";

const CANVAS_SIZE = 5000;
const MIN_SCALE = 0.12;
const MAX_SCALE = 2.0;
const ZOOM_FACTOR = 1.1;

const CELL_W = 620;
const CELL_H = 400;
const CANVAS_CENTER = 2500;
const TAPE_W = 540;
const TAPE_H = 340;

export function useStudioMapEngine() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const panX = useRef(0);
  const panY = useRef(0);
  const scale = useRef(0.45);

  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);

  // Spawn bookkeeping — pure algorithm state, no need to trigger renders.
  const occupiedGrids = useRef<Set<string>>(new Set());
  const tapeCount = useRef(0);
  const lastAssignedRotation = useRef<number | null>(null);

  const [tapes, setTapes] = useState<TapeInstance[]>([]);

  const updateTransform = () => {
    if (!canvasRef.current) return;
    canvasRef.current.style.transform = `translate(${panX.current}px, ${panY.current}px) scale(${scale.current})`;
  };

  const getAvailableDiagonalNeighbors = useCallback(() => {
    const neighbors = new Set<string>();
    const directions = [
      [1, 1],
      [-1, -1],
      [1, -1],
      [-1, 1],
    ];

    occupiedGrids.current.forEach((gridKey) => {
      const [col, row] = gridKey.split(",").map(Number);
      directions.forEach(([dCol, dRow]) => {
        const targetKey = `${col + dCol},${row + dRow}`;
        if (!occupiedGrids.current.has(targetKey)) neighbors.add(targetKey);
      });
    });

    return Array.from(neighbors);
  }, []);

  const spawnTapeInGrid = useCallback(
    (col: number, row: number, isAnchor = false) => {
      const gridKey = `${col},${row}`;
      occupiedGrids.current.add(gridKey);
      tapeCount.current += 1;

      const baseLeft = CANVAS_CENTER + col * CELL_W - TAPE_W / 2;
      const baseTop = CANVAS_CENTER + row * CELL_H - TAPE_H / 2;
      const jitterX = isAnchor ? 0 : Math.random() * 80 - 40;
      const jitterY = isAnchor ? 0 : Math.random() * 60 - 30;

      let rotation = 0;
      if (!isAnchor) {
        let attempts = 0;
        let validRotation = false;
        while (!validRotation && attempts < 20) {
          rotation = Math.random() * 44 - 22;
          if (
            lastAssignedRotation.current === null ||
            Math.abs(rotation - lastAssignedRotation.current) > 10
          ) {
            validRotation = true;
          }
          attempts++;
        }
        lastAssignedRotation.current = rotation;
      } else {
        rotation = -3;
      }

      const albumIndex = (tapeCount.current - 1) % albumDataset.length;

      const newTape: TapeInstance = {
        id: gridKey,
        index: tapeCount.current,
        col,
        row,
        left: baseLeft + jitterX,
        top: baseTop + jitterY,
        rotation,
        isAnchor,
        albumIndex,
      };

      setTapes((prev) => [...prev, newTape]);
    },
    [],
  );

  const addRandomTape = useCallback(() => {
    const openSlots = getAvailableDiagonalNeighbors();
    if (openSlots.length === 0) return;
    const randomSlot = openSlots[Math.floor(Math.random() * openSlots.length)];
    const [col, row] = randomSlot.split(",").map(Number);
    spawnTapeInGrid(col, row);
  }, [getAvailableDiagonalNeighbors, spawnTapeInGrid]);

  useEffect(() => {
    panX.current = (window.innerWidth - CANVAS_SIZE * scale.current) / 2;
    panY.current = (window.innerHeight - CANVAS_SIZE * scale.current) / 2;
    updateTransform();

    // Spawn the anchor tape once on mount.
    spawnTapeInGrid(0, 0, true);

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

      const canvasX = (mouseX - panX.current) / scale.current;
      const canvasY = (mouseY - panY.current) / scale.current;

      panX.current = mouseX - canvasX * clampedScale;
      panY.current = mouseY - canvasY * clampedScale;
      scale.current = clampedScale;

      updateTransform();
    };

    viewport.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    viewport.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      viewport.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      viewport.removeEventListener("wheel", handleWheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { viewportRef, canvasRef, tapes, addRandomTape };
}
