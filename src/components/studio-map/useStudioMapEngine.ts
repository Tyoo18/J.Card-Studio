"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { albumDataset, type Album, type TapeInstance } from "./data";
import type { TapeFocusPayload } from "./CassetteTape";
import styles from "./studio-map.module.css";

const CANVAS_SIZE = 5000;
const MIN_SCALE = 0.12;
const MAX_SCALE = 2.0;
const ZOOM_FACTOR = 1.1;

const CELL_W = 620;
const CELL_H = 400;
const CANVAS_CENTER = 2500;
const TAPE_W = 540;
const TAPE_H = 340;

const FOCUS_SCALE = 1.05;
const FOCUS_GAP = 120;
const FOCUS_PANEL_WIDTH = 460;

type ActiveTape = {
  wrapper: HTMLDivElement;
  card: HTMLDivElement;
  shine: HTMLDivElement;
  origLeft: number;
  origTop: number;
  baseRotation: number;
  origPanX: number;
  origPanY: number;
  origScale: number;
};

export function useStudioMapEngine() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const focusPanelRef = useRef<HTMLDivElement>(null);

  const panX = useRef(0);
  const panY = useRef(0);
  const scale = useRef(0.45);

  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);

  const occupiedGrids = useRef<Set<string>>(new Set());
  const tapeCount = useRef(0);
  const lastAssignedRotation = useRef<number | null>(null);

  const activeTapeRef = useRef<ActiveTape | null>(null);
  const isTransitioning = useRef(false);

  const [tapes, setTapes] = useState<TapeInstance[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [focusedAlbum, setFocusedAlbum] = useState<Album | null>(null);

  const updateTransform = () => {
    if (!canvasRef.current) return;
    canvasRef.current.style.transform = `translate(${panX.current}px, ${panY.current}px) scale(${scale.current})`;
  };

  const calculateFocusPosition = useCallback(() => {
    const active = activeTapeRef.current;
    const focusPanel = focusPanelRef.current;
    if (!active || !focusPanel) return;

    const tapeWidth3D = TAPE_W * FOCUS_SCALE;
    const totalWidth = tapeWidth3D + FOCUS_GAP + FOCUS_PANEL_WIDTH;
    const leftMargin = (window.innerWidth - totalWidth) / 2;
    const viewCenterX = leftMargin + tapeWidth3D / 2;
    const viewCenterY = window.innerHeight / 2;

    const tapeCenterX = active.origLeft + TAPE_W / 2;
    const tapeCenterY = active.origTop + TAPE_H / 2;

    panX.current = viewCenterX - tapeCenterX * FOCUS_SCALE;
    panY.current = viewCenterY - tapeCenterY * FOCUS_SCALE;
    scale.current = FOCUS_SCALE;

    focusPanel.style.left = `${leftMargin + tapeWidth3D + FOCUS_GAP}px`;
  }, []);

  const focusTape = useCallback(
    (payload: TapeFocusPayload) => {
      if (activeTapeRef.current || isTransitioning.current) return;
      isTransitioning.current = true;

      setFocusedAlbum(payload.data);

      activeTapeRef.current = {
        wrapper: payload.wrapper,
        card: payload.card,
        shine: payload.shine,
        origLeft: payload.baseLeft,
        origTop: payload.baseTop,
        baseRotation: payload.baseRotation,
        origPanX: panX.current,
        origPanY: panY.current,
        origScale: scale.current,
      };

      setIsFocused(true);
      payload.wrapper.classList.add(styles.isActiveFocus);

      calculateFocusPosition();

      canvasRef.current?.classList.add(styles.smoothTransition);
      updateTransform();

      payload.card.style.transform = `rotateX(0deg) rotateY(0deg) rotateZ(0deg) scaleZ(1)`;

      setTimeout(() => {
        if (activeTapeRef.current) {
          activeTapeRef.current.card.classList.add(styles.instantlyResponsive);
          isTransitioning.current = false;
        }
      }, 850);
    },
    [calculateFocusPosition],
  );

  const resetTapeFocus = useCallback(() => {
    const active = activeTapeRef.current;
    if (!active || isTransitioning.current) return;
    isTransitioning.current = true;

    active.card.classList.remove(styles.instantlyResponsive);
    setIsFocused(false);

    active.card.style.transform = `rotateZ(${active.baseRotation}deg) scaleZ(0.001)`;
    active.shine.style.background = `radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 65%)`;

    panX.current = active.origPanX;
    panY.current = active.origPanY;
    scale.current = active.origScale;
    updateTransform();

    setTimeout(() => {
      active.wrapper.classList.remove(styles.isActiveFocus);
      canvasRef.current?.classList.remove(styles.smoothTransition);
      activeTapeRef.current = null;
      setFocusedAlbum(null);
      isTransitioning.current = false;
    }, 850);
  }, []);

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

      setTapes((prev) => [
        ...prev,
        {
          id: gridKey,
          index: tapeCount.current,
          col,
          row,
          left: baseLeft + jitterX,
          top: baseTop + jitterY,
          rotation,
          isAnchor,
          albumIndex,
        },
      ]);
    },
    [],
  );

  const addRandomTape = useCallback(() => {
    if (activeTapeRef.current) return;
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

    spawnTapeInGrid(0, 0, true);

    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (activeTapeRef.current) return;
      isDragging.current = true;
      startX.current = e.clientX - panX.current;
      startY.current = e.clientY - panY.current;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current && !activeTapeRef.current) {
        panX.current = e.clientX - startX.current;
        panY.current = e.clientY - startY.current;
        updateTransform();
        return;
      }

      const active = activeTapeRef.current;
      if (active && !isTransitioning.current) {
        const viewW = window.innerWidth;
        const viewH = window.innerHeight;
        const tapeWidth3D = TAPE_W * FOCUS_SCALE;
        const totalWidth = tapeWidth3D + FOCUS_GAP + FOCUS_PANEL_WIDTH;
        const leftMargin = (viewW - totalWidth) / 2;

        const xc = (e.clientX - (leftMargin + tapeWidth3D / 2)) / (viewW * 0.5);
        const yc = (viewH / 2 - e.clientY) / (viewH / 2);

        active.card.style.transform = `rotateX(${yc * 22}deg) rotateY(${xc * 22}deg) rotateZ(0deg) scaleZ(1)`;

        const percentageX = (e.clientX / viewW) * 100;
        const percentageY = (e.clientY / viewH) * 100;
        const sweepX = (1 - e.clientX / viewW) * 100;

        active.shine.style.background = `
          linear-gradient(135deg, 
            rgba(255,255,255,0) 30%, 
            rgba(255,255,255,0.04) 45%, 
            rgba(255,255,255,0.12) 50%, 
            rgba(255,255,255,0.04) 55%, 
            rgba(255,255,255,0) 70%
          ) ${sweepX}% 0% / 260% 100% no-repeat,
          radial-gradient(circle at ${percentageX}% ${percentageY}, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 65%)
        `;
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      if (activeTapeRef.current) return;
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

    const handleResize = () => {
      if (activeTapeRef.current && !isTransitioning.current) {
        calculateFocusPosition();
        updateTransform();
      }
    };

    // === Tambahan: menutup fokus saat klik di luar tape aktif dan di luar panel metadata ===
    const handleOutsideMouseDown = (e: MouseEvent) => {
      const active = activeTapeRef.current;
      if (!active || isTransitioning.current) return;

      const target = e.target as Node;
      const isInsideTape = active.wrapper.contains(target);
      const isInsidePanel = focusPanelRef.current?.contains(target) ?? false;

      // Jika klik di dalam tape atau di dalam panel, jangan tutup
      if (isInsideTape || isInsidePanel) return;

      // Jika tidak di dalam tape dan tidak di dalam panel, tutup focus
      resetTapeFocus();
    };

    viewport.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    viewport.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousedown", handleOutsideMouseDown); // <-- ditambahkan

    return () => {
      viewport.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      viewport.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousedown", handleOutsideMouseDown); // <-- cleanup
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    viewportRef,
    canvasRef,
    focusPanelRef,
    tapes,
    isFocused,
    focusedAlbum,
    addRandomTape,
    focusTape,
    resetTapeFocus,
  };
}
