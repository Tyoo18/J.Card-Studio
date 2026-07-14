type NavbarProps = {
  focused: boolean;
  onAddTape: () => void;
};

export default function Navbar({ focused, onAddTape }: NavbarProps) {
  return (
    <nav
      className={`fixed top-0 left-0 w-screen h-16 z-100 flex items-center justify-between px-10
        bg-linear-to-b from-[#060608cc] to-transparent backdrop-blur-md border-b border-white/3
        transition-all duration-500 ease-out
        ${focused ? "-translate-y-5 opacity-0 pointer-events-none" : ""}`}
    >
      <div className="font-mono text-[11px] tracking-[3px] uppercase">
        <span className="opacity-40 mr-2">ARCHIVE //</span> STUDIO MAP
      </div>
      <div className="font-mono text-[10px] tracking-[1.5px] opacity-40 uppercase flex items-center gap-2">
        click any tape to see track
      </div>
      <button
        onClick={onAddTape}
        className="bg-transparent text-[#e4ded2] border border-[#e4ded240] px-4 py-2 font-mono text-[11px]
          tracking-[1px] uppercase rounded-sm cursor-pointer transition-all
          hover:bg-[#e4ded2] hover:text-[#060608] hover:border-[#e4ded2]"
      >
        Add Tape
      </button>
    </nav>
  );
}
