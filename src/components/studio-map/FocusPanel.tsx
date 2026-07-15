import { forwardRef } from "react";
import type { Album, DeezerTrack } from "./data";
import { MAX_TAPE_FAVORITES } from "./data";
import styles from "./studio-map.module.css";

type FocusPanelProps = {
  isFocused: boolean;
  album: Album | null;
  onClose: () => void;
  fullTracks?: DeezerTrack[];
  favoriteTrackNumbers?: number[];
  onToggleFavorite?: (track: DeezerTrack) => void;
};

// [UTIL]: Kalkulasi ukuran font judul secara dinamis
function getTitleFontSize(title: string): string {
  const len = title.length;
  if (len > 22) return "32px";
  if (len > 16) return "42px";
  if (len > 11) return "52px";
  return "64px";
}

const FocusPanel = forwardRef<HTMLDivElement, FocusPanelProps>(
  (
    {
      isFocused,
      album,
      onClose,
      fullTracks,
      favoriteTrackNumbers,
      onToggleFavorite,
    },
    ref,
  ) => {
    const favorites = favoriteTrackNumbers || [];
    const atCap = favorites.length >= MAX_TAPE_FAVORITES;
    const isRealTrackData = !!fullTracks;

    return (
      // [STYLE]: Fix z-[100] untuk block canvas click-through & manajemen interaksi kursor mouse
      <div
        ref={ref}
        className={`fixed top-1/2 -translate-y-1/2 w-115 h-fit max-h-[85vh] py-8 flex flex-col justify-center z-900
          transition-all duration-850 ease-out opacity-0 pointer-events-none
          ${isFocused ? "translate-x-0 opacity-100 pointer-events-auto" : "translate-x-15"}`}
      >
        {album && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="font-mono text-[10px] tracking-[2px] text-[#e4ded24d] uppercase">
                {album.isRealData ? "" : `ALBUM ARCHITECTURE // ${album.title}`}
              </div>
              <button
                onClick={onClose}
                aria-label="Close focus panel"
                className="w-6 h-6 flex items-center justify-center border border-[#e4ded226]
                  rounded-sm text-[#e4ded280] hover:text-[#e4ded2] hover:border-[#e4ded24d]
                  transition-colors cursor-pointer shrink-0"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                >
                  <path d="M1 1L9 9M9 1L1 9" />
                </svg>
              </button>
            </div>

            <h1
              className="serif-title leading-[1.05] mb-2"
              style={{
                fontSize: getTitleFontSize(album.title),
                textWrap: "balance",
              }}
            >
              {album.title}
            </h1>
            <h3 className="font-sans text-sm uppercase tracking-[2px] font-normal text-[#e4ded280] mb-4">
              {album.artist}
            </h3>
            <hr className="border-none h-px bg-[#e4ded21a] mb-4" />

            <div className="flex items-center justify-between mb-4.5">
              <div className="font-mono text-[10px] tracking-[1.5px] text-[#e4ded24d] uppercase">
                Tracklist Content
              </div>
              {isRealTrackData && (
                <div className="font-mono text-[9px] tracking-wide text-[#e4ded240] uppercase">
                  {favorites.length}/{MAX_TAPE_FAVORITES} on tape
                </div>
              )}
            </div>

            {/* [STYLE]: max-h-[176px] diset presisi memotong lagu ke-4 di tengah jalan sebagai visual hint scroll */}
            <div
              className={`flex flex-col gap-2 overflow-y-auto pr-2.5 max-h-44 mb-5 ${styles.tracklistContainer}`}
            >
              {isRealTrackData
                ? fullTracks!.map((track) => {
                    const isFav = favorites.includes(track.trackNumber);
                    const disabled = atCap && !isFav;
                    return (
                      // [RENDER]: Baris lagu dibuat lebih ramping (h-11) demi estetika layout premium
                      <div
                        key={track.trackNumber}
                        className="shrink-0 flex items-center justify-between h-11 px-4 bg-white/1.5 border border-white/3 rounded transition-colors hover:bg-white/4 hover:border-[#e4ded226]"
                      >
                        <div className="flex items-center font-mono text-[11px] tracking-wide uppercase overflow-hidden">
                          <span className="text-[#e4ded240] mr-4.5 text-[10px] shrink-0">
                            0{track.trackNumber}
                          </span>
                          <span className="font-normal text-[#e4ded2d9] truncate">
                            {track.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-mono text-[9px] text-[#e4ded240]">
                            {track.duration}
                          </span>
                          <button
                            onClick={() => {
                              if (!disabled) onToggleFavorite?.(track);
                            }}
                            disabled={disabled}
                            type="button"
                            aria-label={
                              isFav ? "Remove from tape" : "Add to tape"
                            }
                            title={
                              disabled
                                ? `Tape penuh (maks ${MAX_TAPE_FAVORITES} lagu)`
                                : isFav
                                  ? "Keluarkan dari tape"
                                  : "Tambahkan ke tape"
                            }
                            className={`w-8 h-8 flex items-center justify-center transition-colors
                              ${isFav ? "text-[#e2b865]" : "text-[#e4ded230]"}
                              ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:text-[#e2b865]"}`}
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill={isFav ? "currentColor" : "none"}
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              <path d="M12 2l2.9 6.26 6.9.6-5.2 4.53 1.6 6.76L12 16.9l-6.2 3.25 1.6-6.76-5.2-4.53 6.9-.6L12 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })
                : album.tracks.map((track, idx) => (
                    <div
                      key={track}
                      className="shrink-0 flex items-center justify-between h-11 px-4 bg-white/1.5 border border-white/3 rounded transition-colors hover:bg-white/4 hover:border-[#e4ded226]"
                    >
                      <div className="flex items-center font-mono text-[11px] tracking-wide uppercase">
                        <span className="text-[#e4ded240] mr-4.5 text-[10px]">
                          0{idx + 1}
                        </span>
                        <span className="font-normal text-[#e4ded2d9]">
                          {track}
                        </span>
                      </div>
                    </div>
                  ))}
            </div>
          </>
        )}
      </div>
    );
  },
);

FocusPanel.displayName = "FocusPanel";

export default FocusPanel;
