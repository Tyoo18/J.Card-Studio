// [INIT]: Mengimpor tipe data dan styling module bawaan
import type { Album } from "./data"; //[cite: 17]
import styles from "./studio-map.module.css"; //[cite: 17]

type JCardProps = {
  data: Album; //[cite: 17]
  index: number; //[cite: 17]
};

export default function JCard({ data, index }: JCardProps) {
  // [INIT]: Mengatur warna teks dan style border sesuai data album
  const textColor = data.text || "#e4ded2"; //[cite: 17]
  const borderStyle = { borderColor: `${textColor}22` }; //[cite: 17]

  return (
    <>
      {/* Kolom Kiri: Cover Art Kaset (Tetap utuh, gak bakal gepeng) */}
      <div
        className="w-77.5 h-full relative p-4.5 shrink-0 flex items-center justify-center" //[cite: 17]
        style={{ background: data.bg }} //[cite: 17]
      >
        <img
          src={data.cover} //[cite: 17]
          alt="Artwork" //[cite: 17]
          className={`w-full aspect-square object-cover rounded ${styles.coverImage}`} //[cite: 17]
        />
      </div>

      {/* Kolom Kanan: Info Album & Daftar Lagu */}
      <div
        className="p-6 flex grow flex-col justify-between font-mono" //[cite: 17]
        style={{ background: data.bg, color: textColor }} //[cite: 17]
      >
        <div>
          {/* Header Sistem Kaset */}
          <div
            className="text-[9px] tracking-[2px] opacity-40 border-b pb-2.5 mb-3.5 flex justify-between uppercase" //[cite: 17]
            style={borderStyle} //[cite: 17]
          >
            <span>NR SYSTEM [B]</span> {/*[cite: 17] */}
            <span>STEREO</span> {/*[cite: 17] */}
          </div>

          {/* Detail Album */}
          <div>
            <h1 className="serif-title text-[24px] leading-[1.1] tracking-tight mb-1 font-normal">
              {data.title} {/*[cite: 17] */}
            </h1>
            <p
              className="font-sans text-[11px] font-light uppercase tracking-wider" //[cite: 17]
              style={{ color: `${textColor}88` }} //[cite: 17]
            >
              {data.artist} {/*[cite: 17] */}
            </p>
          </div>

          {/* ─── ADJUSTMENT TRACKLIST DI SINI ─── */}
          {/* [STYLE]: Menaikkan maxHeight ke 130px agar 5 track muat full dan mematikan scrollbar */}
          <ul
            className={`font-mono text-[10px] list-none flex flex-col gap-1.5 mt-3.5 opacity-75 ${styles.tracklistContainer}`}
            style={{ maxHeight: "130px", overflowY: "hidden" }}
          >
            {data.tracks.map((track, idx) => (
              <li
                key={track} //[cite: 17]
                className="shrink-0 flex justify-between border-b border-dashed pb-1" //[cite: 17]
                style={{ borderColor: `${data.text}22` }} //[cite: 17]
              >
                <span className={styles.trackTitle}>
                  0{idx + 1}. {track} {/*[cite: 17] */}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer Kaset */}
        <div
          className="flex justify-between text-[8px] tracking-wider opacity-30 mt-auto uppercase" //[cite: 17]
          style={{ color: `${textColor}55` }} //[cite: 17]
        >
          <span>CAT-{1000 + Number(index)}</span> {/*[cite: 17] */}
          <span>DOLBY B</span> {/*[cite: 17] */}
        </div>
      </div>
    </>
  );
}
