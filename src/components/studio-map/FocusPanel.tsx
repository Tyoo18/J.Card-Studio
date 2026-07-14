import { forwardRef } from "react";
import type { Album } from "./data";
import styles from "./studio-map.module.css";

type FocusPanelProps = {
  isFocused: boolean;
  album: Album | null;
  onClose: () => void;
};

function getTitleFontSize(title: string): string {
  const len = title.length;
  if (len > 22) return "32px";
  if (len > 16) return "42px";
  if (len > 11) return "52px";
  return "64px";
}

const FocusPanel = forwardRef<HTMLDivElement, FocusPanelProps>(
  ({ isFocused, album, onClose }, ref) => {
    return (
      <div
        ref={ref}
        className={`fixed top-0 w-115 h-screen py-15 flex flex-col justify-center z-100
    transition-all duration-850 ease-out
    ${isFocused ? "translate-x-0 opacity-100 pointer-events-auto" : "translate-x-15 opacity-0 pointer-events-none"}`}
      >
        {album && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="font-mono text-[10px] tracking-[2px] text-[#e4ded24d] uppercase"></div>
              <button
                onClick={onClose}
                onMouseDown={(e) => e.stopPropagation()} // <-- tambahan
                aria-label="Close focus panel"
                className="w-6 h-6 flex items-center justify-center border border-[#e4ded226] rounded-sm text-[#e4ded280] hover:text-[#e4ded2] hover:border-[#e4ded24d] transition-colors cursor-pointer shrink-0 pointer-events-auto"
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
            <h3 className="font-sans text-sm uppercase tracking-[2px] font-normal text-[#e4ded280] mb-8">
              {album.artist}
            </h3>
            <hr className="border-none h-px bg-[#e4ded21a] mb-8" />
            <div className="font-mono text-[10px] tracking-[1.5px] text-[#e4ded24d] uppercase mb-4.5">
              Tracklist Content
            </div>
            <div
              className={`flex flex-col gap-2 max-h-32 overflow-y-auto pr-2.5 ${styles.tracklistContainer}`}
            >
              {album.tracks.map((track, idx) => (
                <div
                  key={track}
                  className="group flex items-center justify-between h-14.5 px-5 bg-white/1.5 border border-white/3 rounded transition-colors hover:bg-white/4 hover:border-[#e4ded226]"
                >
                  <div className="flex items-center font-mono text-[11px] tracking-wide uppercase">
                    <span className="text-[#e4ded240] mr-4.5 text-[10px]">
                      0{idx + 1}
                    </span>
                    <span className="font-normal text-[#e4ded2d9]">
                      {track}
                    </span>
                  </div>
                  <svg
                    className="w-3 h-3 opacity-30 transition-opacity group-hover:opacity-85"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
                  </svg>
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
