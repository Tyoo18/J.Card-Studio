type HeroHeaderProps = {
  focused: boolean;
};

export default function HeroHeader({ focused }: HeroHeaderProps) {
  return (
    <div
      className={`fixed top-35 left-15 max-w-120 z-100 pointer-events-none
        transition-all duration-850ms ease-out
        ${focused ? "-translate-x-10 opacity-0" : ""}`}
    >
      <h2 className="serif-title text-[54px] leading-[1.1] mb-6">
        J.Card Studio
      </h2>
      <p className="text-[13px] leading-[1.7] text-[#e4ded280] font-light">
        A physical-digital sanctuary for tangible soundscapes and modular layout
        configurations. Navigate through the infinite coordinate system, explore
        dynamic mika structures, or click any cassette card to reveal its
        embedded tracklist.
      </p>
    </div>
  );
}
