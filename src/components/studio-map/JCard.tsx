import type { TapeInstance, DeezerTrack } from "./data";
import styles from "./studio-map.module.css";

type JCardProps = {
  data: TapeInstance;
  index: number;
};

const DEFAULT_BG = "#1e1e24";
const DEFAULT_TEXT = "#e4ded2";
const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=600&auto=format&fit=crop";

export default function JCard({ data, index }: JCardProps) {
  const bgColor = data.customBg || DEFAULT_BG;
  const textColor = DEFAULT_TEXT;
  const borderStyle = { borderColor: `${textColor}22` };

  const favoriteNumbers = data.favoriteTrackNumbers || [];
  const displayTracks: DeezerTrack[] = favoriteNumbers
    .map((num) => (data.tracks || []).find((t) => t.trackNumber === num))
    .filter((t): t is DeezerTrack => Boolean(t));

  return (
    <>
      <div
        className="w-77.5 h-full relative p-4.5 shrink-0 flex items-center justify-center"
        style={{ background: bgColor }}
      >
        <img
          src={data.coverUrl || FALLBACK_COVER}
          alt="Artwork"
          className={`w-full aspect-square object-cover rounded ${styles.coverImage}`}
        />
      </div>

      <div
        className="p-6 flex grow flex-col justify-between font-mono"
        style={{ background: bgColor, color: textColor }}
      >
        <div>
          <div
            className="text-[9px] tracking-[2px] opacity-40 border-b pb-2.5 mb-3.5 flex justify-between uppercase"
            style={borderStyle}
          >
            <span>NR SYSTEM [B]</span>
            <span>STEREO</span>
          </div>

          <div>
            <h1 className="serif-title text-[24px] leading-[1.1] tracking-tight mb-1 font-normal">
              {data.albumName || "Unknown Album"}
            </h1>
            <p
              className="font-sans text-[11px] font-light uppercase tracking-wider"
              style={{ color: `${textColor}88` }}
            >
              {data.artistName || "Unknown Artist"}
            </p>
          </div>

          <ul
            className={`font-mono text-[10px] list-none flex flex-col gap-1.5 mt-3.5 opacity-75 ${styles.tracklistContainer}`}
            style={{ maxHeight: "130px", overflowY: "hidden" }}
          >
            {displayTracks.map((track, idx) => (
              <li
                key={track.trackNumber}
                className="shrink-0 flex justify-between border-b border-dashed pb-1"
                style={{ borderColor: `${textColor}22` }}
              >
                <span className={styles.trackTitle}>
                  0{idx + 1}. {track.title}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="flex justify-between text-[8px] tracking-wider opacity-30 mt-auto uppercase"
          style={{ color: `${textColor}55` }}
        >
          <span>CAT-{1000 + Number(index)}</span>
          <span>DOLBY B</span>
        </div>
      </div>
    </>
  );
}
