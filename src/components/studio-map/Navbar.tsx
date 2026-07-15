"use client";

import { useRef, useEffect } from "react";
import type { DeezerAlbum, DeezerTrack } from "./useStudioMapEngine";

type NavbarProps = {
  focused: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: DeezerAlbum[];
  isSearching: boolean;
  selectedAlbum: DeezerAlbum | null;
  tracklist: DeezerTrack[];
  isLoadingTracks: boolean;
  searchAlbums: (q: string) => void;
  selectAlbum: (album: DeezerAlbum) => void;
  confirmAndSpawnRealTape: (track: DeezerTrack, color: string) => void;
  resetSearchFlow: () => void;
  handleBackToAlbums: () => void;
};

export default function Navbar({
  focused,
  searchQuery,
  setSearchQuery,
  searchResults,
  isSearching,
  selectedAlbum,
  tracklist,
  isLoadingTracks,
  searchAlbums,
  selectAlbum,
  confirmAndSpawnRealTape,
  resetSearchFlow,
  handleBackToAlbums,
}: NavbarProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const showDropdown =
    searchResults.length > 0 || isSearching || !!selectedAlbum;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      searchAlbums(searchQuery);
    }
  };

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        resetSearchFlow();
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [resetSearchFlow]);

  const hideScrollbarStyle = {
    msOverflowStyle: "none",
    scrollbarWidth: "none",
  } as React.CSSProperties;

  return (
    <div ref={dropdownRef} className="relative z-100">
      <style
        dangerouslySetInnerHTML={{
          __html: `.no-scrollbar::-webkit-scrollbar { display: none; }`,
        }}
      />

      <nav
        className={`fixed top-0 left-0 w-screen h-16 flex items-center justify-between px-10
          bg-[#060608]/80 backdrop-blur-md border-b border-white/5
          transition-all duration-500 ease-out
          ${focused ? "-translate-y-5 opacity-0 pointer-events-none" : ""}`}
      >
        <div className="font-mono text-[11px] tracking-[3px] uppercase">
          <span className="opacity-40 mr-2">ARCHIVE //</span> STUDIO MAP
        </div>

        <div className="font-mono text-[10px] tracking-[1.5px] opacity-40 uppercase hidden md:flex items-center gap-2">
          press enter to search albums
        </div>

        <div className="flex items-center border border-[#e4ded240] rounded-sm bg-[#060608] px-3 py-1.5 transition-all w-64 md:w-80 font-mono">
          <input
            type="text"
            placeholder="SEARCH ARTIST / ALBUM..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent text-[#e4ded2] text-[11px] tracking-[1px] uppercase outline-none w-full font-light"
          />
          {(searchQuery || showDropdown) && (
            <button
              onClick={resetSearchFlow}
              className="text-[9px] opacity-40 hover:opacity-100 ml-2 cursor-pointer shrink-0"
            >
              ✕
            </button>
          )}
        </div>
      </nav>

      {showDropdown && (
        <div
          style={hideScrollbarStyle}
          className="no-scrollbar fixed top-16 right-10 w-80 md:w-96 max-h-120 bg-[#0c0c10] border border-white/5 shadow-2xl rounded-b-sm overflow-y-auto font-mono p-4 text-[#e4ded2] flex flex-col gap-4"
        >
          {isSearching && (
            <div className="text-[10px] uppercase opacity-40 py-6 text-center tracking-[1px]">
              Searching Deezer database...
            </div>
          )}

          {!selectedAlbum && searchResults.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="text-[9px] tracking-[1px] opacity-30 uppercase mb-1">
                Select Album
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {searchResults.map((album) => (
                  <div
                    key={album.albumId}
                    onClick={() => selectAlbum(album)}
                    className="flex gap-3 p-2 bg-white/2 border border-white/5 rounded-xs cursor-pointer hover:bg-white/5 hover:border-white/10 transition-all items-center"
                  >
                    <img
                      src={album.coverUrl}
                      alt={album.albumName}
                      className="w-10 h-10 object-cover rounded-xs shrink-0"
                    />
                    <div className="overflow-hidden">
                      <div className="text-[11px] text-[#e4ded2] truncate uppercase">
                        {album.albumName}
                      </div>
                      <div className="text-[9px] opacity-50 truncate uppercase">
                        {album.artistName}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedAlbum && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
                <button
                  onClick={handleBackToAlbums}
                  className="text-[10px] opacity-50 hover:opacity-100 cursor-pointer"
                >
                  ← BACK
                </button>
                <div className="text-[10px] tracking-[1px] opacity-30 uppercase">
                  / Select Track to Spawn
                </div>
              </div>

              <div className="flex gap-3 items-center bg-white/2 p-2 rounded-xs border border-white/5">
                <img
                  src={selectedAlbum.coverUrl}
                  alt="selected"
                  className="w-12 h-12 object-cover rounded-xs"
                />
                <div className="overflow-hidden">
                  <div className="text-[11px] text-[#e4ded2] truncate uppercase font-medium">
                    {selectedAlbum.albumName}
                  </div>
                  <div className="text-[9px] opacity-50 truncate uppercase">
                    {selectedAlbum.artistName}
                  </div>
                </div>
              </div>

              {isLoadingTracks ? (
                <div className="text-[10px] uppercase opacity-40 py-4 text-center">
                  Loading tracks...
                </div>
              ) : (
                <div
                  style={hideScrollbarStyle}
                  className="no-scrollbar flex flex-col gap-1 max-h-60 overflow-y-auto pr-1"
                >
                  {tracklist.map((track) => (
                    <div
                      key={track.trackNumber}
                      onClick={() => {
                        const randomHue = Math.floor(Math.random() * 360);
                        const customBgColor = `hsl(${randomHue}, 35%, 16%)`;
                        confirmAndSpawnRealTape(track, customBgColor);
                      }}
                      className="flex justify-between items-center p-2 rounded-xs cursor-pointer bg-white/1 hover:bg-white/5 border border-transparent hover:border-white/5 text-[10px] transition-all"
                    >
                      <div className="truncate uppercase max-w-60">
                        <span className="opacity-30 mr-2">
                          {track.trackNumber}.
                        </span>
                        {track.title}
                      </div>
                      <span className="opacity-40 text-[9px]">
                        {track.duration}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
