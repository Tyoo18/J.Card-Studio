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
  if (len > 22) return "28px";
  if (len > 16) return "36px";
  return "46px";
}

const FocusPanel = forwardRef<HTMLDivElement, FocusPanelProps>(
  ({ isFocused, album, onClose }, ref) => {
    return (
      <div
        ref={ref}
        className={`fixed bottom-0 right-12 w-100 h-screen py-20 flex flex-col justify-center z-100
        transition-all duration-855 ease-out font-mono
        ${isFocused ? "translate-x-0 opacity-100 pointer-events-auto" : "translate-x-12 opacity-0 pointer-events-none"}`}
      >
        {album && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="text-[10px] tracking-[2px] text-[#e4ded24d] uppercase">
                {album.isRealData
                  ? "DEEZER DIGITAL ARCHIVE"
                  : "LOCAL CACHED ARCHIVE"}
              </div>
              <button
                onClick={onClose}
                onMouseDown={(e) => e.stopPropagation()}
                aria-label="Close focus panel"
                className="w-6 h-6 flex items-center justify-center border border-[#e4ded226] rounded-xs text-[#e4ded280] hover:text-[#e4ded2] hover:border-[#e4ded24d] transition-colors cursor-pointer shrink-0"
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
              className="serif-title leading-[1.1] mb-2 font-normal text-[#e4ded2]"
              style={{
                fontSize: getTitleFontSize(album.title),
                textWrap: "balance",
              }}
            >
              {album.title}
            </h1>
            <h3 className="font-sans text-xs uppercase tracking-[2px] font-normal text-[#e4ded280] mb-6">
              {album.artist}
            </h3>
            <hr className="border-none h-px bg-[#e4ded21a] mb-6" />

            <div className="text-[10px] tracking-[1.5px] text-[#e4ded24d] uppercase mb-4">
              Tracklist Content
            </div>
            <div
              className={`flex flex-col gap-2 max-h-[340px] overflow-y-auto pr-2 ${styles.tracklistContainer}`}
            >
              {album.tracks.map((track, idx) => (
                <div
                  key={idx}
                  className="group flex items-center justify-between h-13 px-4 bg-white/2 border border-white/5 rounded-xs transition-colors hover:bg-white/5"
                >
                  <div className="flex items-center text-[11px] tracking-wide uppercase">
                    <span className="text-[#e4ded240] mr-4 text-[10px]">
                      {idx < 9 ? `0${idx + 1}` : idx + 1}
                    </span>
                    <span className="font-normal text-[#e4ded2d9] text-ellipsis overflow-hidden max-w-64 white-space-nowrap">
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
