import type { Album } from "./data";
import styles from "./studio-map.module.css";

type JCardProps = {
  data: Album;
  index: number;
};

export default function JCard({ data, index }: JCardProps) {
  const textColor = data.text || "#e4ded2";
  const borderStyle = { borderColor: `${textColor}22` };

  return (
    <>
      <div
        className="w-77.5 h-full relative p-4.5 shrink-0 flex items-center justify-center"
        style={{ background: data.bg }}
      >
        <img
          src={data.cover}
          alt="Artwork"
          className={`w-full aspect-square object-cover rounded ${styles.coverImage}`}
        />
      </div>
      <div
        className="p-6 flex grow flex-col justify-between font-mono"
        style={{ background: data.bg, color: textColor }}
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
              {data.title}
            </h1>
            <p
              className="font-sans text-[11px] font-light uppercase tracking-wider"
              style={{ color: `${textColor}88` }}
            >
              {data.artist}
            </p>
          </div>
          <ul
            className={`font-mono text-[10px] list-none flex flex-col gap-1.5 mt-3.5 opacity-75 overflow-y-auto pr-1 ${styles.tracklistContainer}`}
            style={{ maxHeight: "100px" }}
          >
            {data.tracks.map((track, idx) => (
              <li
                key={track}
                className="shrink-0 flex justify-between border-b border-dashed pb-1"
                style={{ borderColor: `${data.text}22` }}
              >
                <span className={styles.trackTitle}>
                  0{idx + 1}. {track}
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
