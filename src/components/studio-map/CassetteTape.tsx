import { useMemo } from "react";
import type { Album } from "./data";
import JCard from "./JCard";
import styles from "./studio-map.module.css";

type CassetteTapeProps = {
  data: Album;
  index: number;
  left: number;
  top: number;
  rotation: number;
  onClick: () => void;
};

const SLICE_COUNT = 30;
const MIN_Z = -25;
const MAX_Z = 25;

export default function CassetteTape({
  data,
  index,
  left,
  top,
  rotation,
  onClick,
}: CassetteTapeProps) {
  // Depth slices only depend on the album's base color — compute once per album.
  const slices = useMemo(() => {
    const hex = data.bg.replace("#", "");
    const rBase = parseInt(hex.substring(0, 2), 16);
    const gBase = parseInt(hex.substring(2, 4), 16);
    const bBase = parseInt(hex.substring(4, 6), 16);

    return Array.from({ length: SLICE_COUNT - 1 }, (_, idx) => {
      const i = idx + 1;
      const zVal = MIN_Z + (i * (MAX_Z - MIN_Z)) / SLICE_COUNT;
      const factor = 0.7 + (i / SLICE_COUNT) * 0.3;
      const r = Math.round(rBase * factor);
      const g = Math.round(gBase * factor);
      const b = Math.round(bBase * factor);
      return { zVal, color: `rgb(${r}, ${g}, ${b})` };
    });
  }, [data.bg]);

  return (
    <div
      className={styles.dummyTape}
      style={{ left, top }}
      data-tape-index={index}
    >
      <div
        className={styles.cassetteCard}
        style={{ transform: `rotateZ(${rotation}deg) scaleZ(0.001)` }}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <div className={`${styles.outerSide} ${styles.outerSideTop}`} />
        <div className={`${styles.outerSide} ${styles.outerSideBottom}`} />
        <div className={`${styles.outerSide} ${styles.outerSideLeft}`} />
        <div className={`${styles.outerSide} ${styles.outerSideRight}`} />
        <div className={styles.outerBack} />
        <div className={styles.outerFront}>
          <div className={styles.shineOverlay} />
        </div>

        <div className={styles.innerBlock}>
          <div className={styles.innerBack} style={{ background: data.bg }} />
          {slices.map((slice, i) => (
            <div
              key={i}
              className={styles.innerSlice}
              style={{
                transform: `translateZ(${slice.zVal}px)`,
                background: slice.color,
              }}
            />
          ))}
          <div className={styles.innerFront}>
            <JCard data={data} index={index} />
          </div>
        </div>
      </div>
    </div>
  );
}
