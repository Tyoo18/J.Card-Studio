"use client";

import { useState } from "react";
import Navbar from "./Navbar";
import HeroHeader from "./HeroHeader";
import { useStudioMapEngine } from "./useStudioMapEngine";

export default function StudioMap() {
  const [focused, setFocused] = useState(false);
  const { viewportRef, canvasRef } = useStudioMapEngine();

  return (
    <>
      <Navbar
        focused={focused}
        onAddTape={() => console.log("add tape - TODO")}
      />
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
          {/* tapes akan di-render di sini pada step berikutnya */}
        </div>
      </div>
    </>
  );
}
