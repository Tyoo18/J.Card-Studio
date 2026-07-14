"use client";

import { useState } from "react";
import Navbar from "./Navbar";
import HeroHeader from "./HeroHeader";
import CassetteTape from "./CassetteTape";
import { albumDataset } from "./data";
import { useStudioMapEngine } from "./useStudioMapEngine";

export default function StudioMap() {
  const [focused, setFocused] = useState(false);
  const { viewportRef, canvasRef, tapes, addRandomTape } = useStudioMapEngine();

  return (
    <>
      <Navbar focused={focused} onAddTape={addRandomTape} />
      <HeroHeader focused={focused} />

      <div
        ref={viewportRef}
        className="w-screen h-screen overflow-hidden relative cursor-grab active:cursor-grabbing"
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
              data={albumDataset[tape.albumIndex]}
              index={tape.index}
              left={tape.left}
              top={tape.top}
              rotation={tape.rotation}
              onClick={() => console.log("focus tape - TODO step 4", tape.id)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
