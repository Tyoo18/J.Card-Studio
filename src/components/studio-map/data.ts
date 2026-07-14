export type Album = {
  title: string;
  artist: string;
  bg: string;
  text: string;
  cover: string;
  tracks: [string, string, string];
};

export const albumDataset: Album[] = [
  {
    title: "Freudian",
    artist: "Daniel Caesar",
    bg: "#1f2d3d",
    text: "#f4efe6",
    cover:
      "https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=600&auto=format&fit=crop",
    tracks: ["Get You", "Best Part", "We Find Each Other"],
  },
  {
    title: "Depression Cherry",
    artist: "Beach House",
    bg: "#771d1d",
    text: "#fcdada",
    cover:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop",
    tracks: ["Levitation", "Sparks", "Space Song"],
  },
  {
    title: "Soundtrack Archive II",
    artist: "Malibu Sync",
    bg: "#1a1a1c",
    text: "#e2b865",
    cover:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop",
    tracks: ["Grid Protocol", "Synthetic Crease", "Static Velvet"],
  },
  {
    title: "Melancholia in Blue",
    artist: "Arthur S.",
    bg: "#b5693c",
    text: "#22120b",
    cover:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop",
    tracks: ["Resonance Frequency", "Lost In Tokyo", "Closing Loop"],
  },
];

export type TapeInstance = {
  id: string;
  index: number; // tapeCount at spawn time, used for CAT-#### label
  col: number;
  row: number;
  left: number;
  top: number;
  rotation: number;
  isAnchor: boolean;
  albumIndex: number;
};
