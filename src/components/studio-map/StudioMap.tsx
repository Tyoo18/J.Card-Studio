"use client";

import Navbar from "./Navbar";
import HeroHeader from "./HeroHeader";
import FocusPanel from "./FocusPanel";
import CassetteTape from "./CassetteTape";
import type { DeezerTrack } from "./data";
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

  const activeTape = focusedAlbum
    ? tapes.find((t) => t.albumId === focusedAlbum.albumId)
    : undefined;

  return (
    <>
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
        album={activeTape || null}
        onClose={resetTapeFocus}
        fullTracks={activeTape?.tracks}
        favoriteTrackNumbers={activeTape?.favoriteTrackNumbers}
        onToggleFavorite={
          activeTape
            ? (track: DeezerTrack) =>
                toggleFavoriteTrack(activeTape.id, track.trackNumber)
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
          {tapes.map((tape) => (
            <CassetteTape
              key={tape.id}
              data={tape}
              index={tape.index}
              left={tape.left}
              top={tape.top}
              rotation={tape.rotation}
              onFocus={focusTape}
              isPulsing={tape.id === pulsingTapeId}
            />
          ))}
        </div>
      </div>
    </>
  );
}
