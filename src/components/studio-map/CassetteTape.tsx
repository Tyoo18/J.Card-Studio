import { useMemo, useRef } from "react";
import type { TapeInstance } from "./data";
import JCard from "./JCard";
import styles from "./studio-map.module.css";

export type TapeFocusPayload = {
  wrapper: HTMLDivElement;
  card: HTMLDivElement;
  shine: HTMLDivElement;
  data: TapeInstance;
  index: number;
  baseLeft: number;
  baseTop: number;
  baseRotation: number;
};

type CassetteTapeProps = {
  data: TapeInstance;
  index: number;
  left: number;
  top: number;
  rotation: number;
  onFocus: (payload: TapeFocusPayload) => void;
  isPulsing?: boolean;
};

const SLICE_COUNT = 30;
const MIN_Z = -25;
const MAX_Z = 25;
const FALLBACK_BG = "#1e1e24";

export default function CassetteTape({
  data,
  index,
  left,
  top,
  rotation,
  onFocus,
  isPulsing,
}: CassetteTapeProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);

  const bgColor = data.customBg || FALLBACK_BG;

  const slices = useMemo(() => {
    const hex = bgColor.replace("#", "");
    const isHex = /^[0-9a-fA-F]{6}$/.test(hex);
    const rBase = isHex ? parseInt(hex.substring(0, 2), 16) : 30;
    const gBase = isHex ? parseInt(hex.substring(2, 4), 16) : 30;
    const bBase = isHex ? parseInt(hex.substring(4, 6), 16) : 36;

    return Array.from({ length: SLICE_COUNT - 1 }, (_, idx) => {
      const i = idx + 1;
      const zVal = MIN_Z + (i * (MAX_Z - MIN_Z)) / SLICE_COUNT;
      const factor = 0.7 + (i / SLICE_COUNT) * 0.3;
      const r = Math.round(rBase * factor);
      const g = Math.round(gBase * factor);
      const b = Math.round(bBase * factor);
      return { zVal, color: `rgb(${r}, ${g}, ${b})` };
    });
  }, [bgColor]);

  const handleClick = () => {
    if (!wrapperRef.current || !cardRef.current || !shineRef.current) return;
    onFocus({
      wrapper: wrapperRef.current,
      card: cardRef.current,
      shine: shineRef.current,
      data,
      index,
      baseLeft: left,
      baseTop: top,
      baseRotation: rotation,
    });
  };

  return (
    <div ref={wrapperRef} className={styles.dummyTape} style={{ left, top }}>
      <div
        ref={cardRef}
        className={`${styles.cassetteCard} ${isPulsing ? styles.tapePulse : ""}`}
        style={{
          transform: `rotateZ(${rotation}deg) scaleZ(0.001)`,
          ["--base-rotation" as any]: `${rotation}deg`,
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
      >
        <div className={`${styles.outerSide} ${styles.outerSideTop}`} />
        <div className={`${styles.outerSide} ${styles.outerSideBottom}`} />
        <div className={`${styles.outerSide} ${styles.outerSideLeft}`} />
        <div className={`${styles.outerSide} ${styles.outerSideRight}`} />
        <div className={styles.outerBack} />
        <div className={styles.outerFront}>
          <div ref={shineRef} className={styles.shineOverlay} />
        </div>

        <div className={styles.innerBlock}>
          <div className={styles.innerBack} style={{ background: bgColor }} />
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
