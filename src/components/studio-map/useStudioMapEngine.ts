"use client";

import { useCallback, useEffect, useRef, useState } from "react";
// [INIT]: Ambil dataset dummy bawaan dan tipe data instance kaset
import { albumDataset, type Album, type TapeInstance } from "./data";
import type { TapeFocusPayload } from "./CassetteTape";
import styles from "./studio-map.module.css";

// [INIT]: Definisi konstanta dimensi kanvas & grid koordinat layout
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

// [INIT]: Struktur data untuk menyimpan referensi kaset yang sedang di-focus
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

// [INIT]: Interface data album hasil saringan dari Deezer API
export interface DeezerAlbum {
  albumId: string;
  artistName: string;
  albumName: string;
  coverUrl: string;
}

// [INIT]: Interface data lagu beserta durasi dan link preview audio
export interface DeezerTrack {
  trackNumber: number;
  title: string;
  duration: string;
}

export function useStudioMapEngine() {
  // ==========================================
  // 🏢 REFS & DOM ELEMENT MANAGEMENT
  // ==========================================
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

  // ==========================================
  // ⚡ STATE MANAGEMENT (EXISTING + DEEZER)
  // ==========================================
  const [tapes, setTapes] = useState<TapeInstance[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [focusedAlbum, setFocusedAlbum] = useState<Album | null>(null);

  // [STATE]: Menyimpan query teks pencarian dari input user
  const [searchQuery, setSearchQuery] = useState("");
  // [STATE]: Menampung daftar album hasil tembakan Deezer API
  const [searchResults, setSearchResults] = useState<DeezerAlbum[]>([]);
  // [STATE]: Indikator loading animasi saat nyari album
  const [isSearching, setIsSearching] = useState(false);
  // [STATE]: Menyimpan metadata album yang dipilih user dari daftar
  const [selectedAlbum, setSelectedAlbum] = useState<DeezerAlbum | null>(null);
  // [STATE]: Menampung daftar lagu dari album yang sukses di-lookup
  const [tracklist, setTracklist] = useState<DeezerTrack[]>([]);
  // [STATE]: Indikator loading saat memuat isi tracklist lagu
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  // [STATE]: Menyimpan lagu spesifik pilihan user untuk dijadikan kaset
  const [selectedTrack, setSelectedTrack] = useState<DeezerTrack | null>(null);
  // [STATE]: Menyimpan pesan error jika komunikasi API gagal
  const [engineError, setEngineError] = useState<string | null>(null);

  // ==========================================
  // 🎨 CANVAS TRANSFORMATION HANDLERS
  // ==========================================

  // [STYLE]: Update style transform matrix infinite canvas secara langsung via ref
  const updateTransform = () => {
    if (!canvasRef.current) return;
    canvasRef.current.style.transform = `translate(${panX.current}px, ${panY.current}px) scale(${scale.current})`;
  };

  // [CALC]: Hitung koordinat centering kamera saat kaset di-zoom focus
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

  // [HANDLER]: Mengatur transisi animasi zoom dan kemiringan kaset saat di-klik
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

  // [HANDLER]: Reset koordinat kanvas kembali ke posisi semula sebelum focus
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

      active.card.style.transform = "";

      activeTapeRef.current = null;
      setFocusedAlbum(null);
      isTransitioning.current = false;
    }, 850);
  }, []);

  // ==========================================
  // 🧮 UPGRADED 8-WAY NEIGHBOR GRID SEARCH ENGINE
  // ==========================================

  // [HANDLER]: Mencari sel kosong di sekeliling kaset aktif menggunakan skema 8 arah mata angin
  const getAvailableDiagonalNeighbors = useCallback(() => {
    const neighbors = new Set<string>();

    // [UTIL]: Formasi 8 arah komplit (4 Ortogonal + 4 Diagonal) biar sebaran kaset membentuk kluster organik
    const directions = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1], // Ortogonal (Kanan, Kiri, Bawah, Atas)
      [1, 1],
      [-1, -1],
      [1, -1],
      [-1, 1], // Diagonal (Miring)
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

  // ==========================================
  // 🕹️ TAPE SPAWNING CONTROLLER (REAL + DUMMY SUPPORT)
  // ==========================================

  // [HANDLER]: Menyuntikkan kaset baru ke grid koordinat pixel kanvas
  const spawnTapeInGrid = useCallback(
    (
      col: number,
      row: number,
      isAnchor = false,
      realData?: { album: DeezerAlbum; track: DeezerTrack; customBg?: string },
    ) => {
      const gridKey = `${col},${row}`;
      occupiedGrids.current.add(gridKey);
      tapeCount.current += 1;

      // [CALC]: Hitung koordinat dasar peletakan kaset berdasarkan rasio lebar-tinggi sel grid
      const baseLeft = CANVAS_CENTER + col * CELL_W - TAPE_W / 2;
      const baseTop = CANVAS_CENTER + row * CELL_H - TAPE_H / 2;
      const jitterX = isAnchor ? 0 : Math.random() * 80 - 40;
      const jitterY = isAnchor ? 0 : Math.random() * 60 - 30;

      // [CALC]: Berikan rotasi miring acak estetik yang tidak bertabrakan ekstrim dengan kaset sebelumnya
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

      // [UTIL]: Cari index fallback dari dataset dummy lama jika data API kosong
      const albumIndex = (tapeCount.current - 1) % albumDataset.length;

      // [FORMAT]: Susun payload data kaset akhir untuk di-render di dalam kanvas UI
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
          // [UTIL]: Masukkan data real dari Deezer ke dalam instance kaset (opsional fallback)
          isRealData: !!realData,
          artistName: realData?.album.artistName,
          albumName: realData?.album.albumName,
          coverUrl: realData?.album.coverUrl,
          trackTitle: realData?.track.title,
          duration: realData?.track.duration,
          customBg: realData?.customBg || "#1e1e24",
        },
      ]);
    },
    [],
  );

  // [HANDLER]: Aksi tombol demo lama untuk menambahkan kaset dummy secara acak
  const addRandomTape = useCallback(() => {
    if (activeTapeRef.current) return;
    const openSlots = getAvailableDiagonalNeighbors();
    if (openSlots.length === 0) return;
    const randomSlot = openSlots[Math.floor(Math.random() * openSlots.length)];
    const [col, row] = randomSlot.split(",").map(Number);
    spawnTapeInGrid(col, row);
  }, [getAvailableDiagonalNeighbors, spawnTapeInGrid]);

  // ==========================================
  // 🎵 DEEZER API HANDLER INFRASTRUCTURE
  // ==========================================

  // [HANDLER]: Mengambil daftar album dari proxy backend via input teks user
  const searchAlbums = async (queryText: string) => {
    if (!queryText.trim()) return;

    setIsSearching(true);
    setEngineError(null);
    setSearchResults([]);
    setSelectedAlbum(null);
    setTracklist([]);

    try {
      // [FETCH]: Tembak internal API search route Next.js
      const res = await fetch(`/api/search?q=${encodeURIComponent(queryText)}`);
      if (!res.ok) throw new Error("Gagal mendapatkan hasil pencarian");

      const data = await res.json();
      setSearchResults(data);
    } catch (err: any) {
      setEngineError(err.message || "Terjadi kesalahan saat mencari album");
    } finally {
      setIsSearching(false);
    }
  };

  // [HANDLER]: Navigasi mundur tanpa merestart query atau menghapus list album terpilih
  const handleBackToAlbums = () => {
    setSelectedAlbum(null);
    setTracklist([]);
  };

  // [HANDLER]: Mengunci album terpilih dan memicu penarikan data tracklist lagu
  const selectAlbum = async (album: DeezerAlbum) => {
    setSelectedAlbum(album);
    setIsLoadingTracks(true);
    setEngineError(null);
    setTracklist([]);
    setSelectedTrack(null);

    try {
      // [FETCH]: Tembak internal API detail album lookup via albumId
      const res = await fetch(`/api/album?id=${album.albumId}`);
      if (!res.ok) throw new Error("Gagal memuat tracklist lagu");

      const data = await res.json();
      setTracklist(data.tracks);
    } catch (err: any) {
      setEngineError(err.message || "Gagal memuat detail album");
    } finally {
      setIsLoadingTracks(false);
    }
  };

  // [HANDLER]: Mengunci lagu terpilih dan langsung mengeksekusi penambahan kaset ke kanvas
  const confirmAndSpawnRealTape = (
    track: DeezerTrack,
    customBgColor: string,
  ) => {
    if (!selectedAlbum) return;

    // [UTIL]: Cari sel grid kosong terdekat menggunakan algoritma 8 arah mata angin
    const openSlots = getAvailableDiagonalNeighbors();
    if (openSlots.length === 0) return;

    const randomSlot = openSlots[Math.floor(Math.random() * openSlots.length)];
    const [col, row] = randomSlot.split(",").map(Number);

    // [HANDLER]: Inject kaset berisi data lagu real ke koordinat grid kanvas terpilih
    spawnTapeInGrid(col, row, false, {
      album: selectedAlbum,
      track: track,
      customBg: customBgColor,
    });

    // [UTIL]: Bersihkan state pencarian agar UI panel kembali ke posisi default
    resetSearchFlow();
  };

  // [HANDLER]: Reset seluruh state alur pencarian musik ke kondisi awal
  const resetSearchFlow = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedAlbum(null);
    setTracklist([]);
    setSelectedTrack(null);
    setEngineError(null);
  };

  // ==========================================
  // 🔌 LIFE-CYCLE CORE EVENT LISTENERS (MOUSE/ZOOM/DRAG)
  // ==========================================
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

    const handleOutsideMouseDown = (e: MouseEvent) => {
      const active = activeTapeRef.current;
      if (!active || isTransitioning.current) return;

      const target = e.target as Node;
      const isInsideTape = active.wrapper.contains(target);
      const isInsidePanel = focusPanelRef.current?.contains(target) ?? false;

      if (isInsideTape || isInsidePanel) return;
      resetTapeFocus();
    };

    viewport.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    viewport.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousedown", handleOutsideMouseDown);

    return () => {
      viewport.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      viewport.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousedown", handleOutsideMouseDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // [RENDER]: Semburkan seluruh state kemudi kanvas dan engine search Deezer ke component UI
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
    // [UTIL]: Kembalikan kontrol state search baru agar siap dikonsumsi FocusPanel
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    handleBackToAlbums,
    selectedAlbum,
    tracklist,
    isLoadingTracks,
    selectedTrack,
    setSelectedTrack,
    engineError,
    searchAlbums,
    selectAlbum,
    confirmAndSpawnRealTape,
    resetSearchFlow,
  };
}
