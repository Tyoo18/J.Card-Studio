"use client";

import Navbar from "./Navbar";
import HeroHeader from "./HeroHeader";
import FocusPanel from "./FocusPanel";
import CassetteTape from "./CassetteTape";
import type { Album, DeezerTrack } from "./data";
import { albumDataset } from "./data";
import { useStudioMapEngine } from "./useStudioMapEngine";

export default function StudioMap() {
  const engine = useStudioMapEngine();
  const {
    viewportRef,
    canvasRef,
    focusPanelRef,
    tapes,
    isFocused,
    focusedAlbum,
    focusTape,
    resetTapeFocus,
    toggleFavoriteTrack,
    pulsingTapeId,
  } = engine;

  const getMappedAlbumData = (tape: any): Album => {
    if (tape?.isRealData) {
      const favoriteNumbers: number[] = tape.favoriteTrackNumbers || [];
      const orderedFavorites: DeezerTrack[] = favoriteNumbers
        .map((num) =>
          (tape.tracks || []).find((t: DeezerTrack) => t.trackNumber === num),
        )
        .filter(Boolean) as DeezerTrack[];

      return {
        title: tape.albumName || "Unknown Album",
        artist: tape.artistName || "Unknown Artist",
        bg: tape.customBg || "#1e1e24",
        text: "#f4efe6",
        cover:
          tape.coverUrl ||
          "https://images.unsplash.com/photo-1507838153414-b4b713384a76",
        tracks: orderedFavorites.map((t) => t.title),
        isRealData: true,
        albumId: tape.albumId,
      };
    }

    const validIndex =
      tape && typeof tape.albumIndex === "number" ? tape.albumIndex : 0;
    return albumDataset[validIndex] || albumDataset[0];
  };

  const activeTape = focusedAlbum
    ? tapes.find((t) =>
        focusedAlbum.albumId
          ? t.albumId === focusedAlbum.albumId
          : t.albumIndex ===
            albumDataset.findIndex((a) => a.title === focusedAlbum.title),
      )
    : undefined;

  return (
    <>
      {/* Vignette - hanya efek visual, tidak punya pointer events */}
      <div
        className={`fixed inset-0 pointer-events-none z-10 transition-opacity duration-1000
          ${isFocused ? "opacity-100" : "opacity-0"}`}
        style={{
          background: isFocused
            ? "radial-gradient(circle at 30% center, transparent 0%, rgba(6,6,8,0.3) 30%, rgba(4,4,6,0.7) 60%, rgba(4,4,6,0.98) 100%)"
            : "radial-gradient(circle at center, transparent 20%, rgba(6,6,8,0.92) 100%)",
        }}
      />

      <Navbar
        focused={isFocused}
        searchQuery={engine.searchQuery}
        setSearchQuery={engine.setSearchQuery}
        searchResults={engine.searchResults}
        isSearching={engine.isSearching}
        selectedAlbum={engine.selectedAlbum}
        tracklist={engine.tracklist}
        isLoadingTracks={engine.isLoadingTracks}
        searchAlbums={engine.searchAlbums}
        selectAlbum={engine.selectAlbum}
        confirmAndSpawnRealTape={engine.confirmAndSpawnRealTape}
        resetSearchFlow={engine.resetSearchFlow}
        handleBackToAlbums={engine.handleBackToAlbums}
      />

      <HeroHeader focused={isFocused} />

      <FocusPanel
        ref={focusPanelRef}
        isFocused={isFocused}
        album={activeTape ? getMappedAlbumData(activeTape) : null}
        onClose={resetTapeFocus}
        fullTracks={activeTape?.isRealData ? activeTape.tracks : undefined}
        favoriteTrackNumbers={activeTape?.favoriteTrackNumbers}
        onToggleFavorite={
          activeTape
            ? (trackNumber: number) =>
                toggleFavoriteTrack(activeTape.id, trackNumber)
            : undefined
        }
      />

      <div
        ref={viewportRef}
        className={`w-screen h-screen overflow-hidden relative ${
          isFocused ? "cursor-default" : "cursor-grab active:cursor-grabbing"
        }`}
      >
        <div
          ref={canvasRef}
          className="w-[5000px] h-[5000px] absolute origin-top-left bg-[#060608]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.015) 1.5px, transparent 1.5px)",
            backgroundSize: "40px 40px",
          }}
        >
          {tapes.map((tape) => {
            const finalAlbumData = getMappedAlbumData(tape);
            const isThisTapeFocused = isFocused && tape.id === activeTape?.id;
            return (
              <CassetteTape
                key={tape.id}
                data={finalAlbumData}
                index={tape.index}
                left={tape.left}
                top={tape.top}
                rotation={tape.rotation}
                onFocus={focusTape}
                isPulsing={tape.id === pulsingTapeId}
                isInteractionLocked={isFocused && !isThisTapeFocused}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
