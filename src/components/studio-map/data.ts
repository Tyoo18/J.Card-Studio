export interface DeezerAlbum {
  albumId: string;
  artistName: string;
  albumName: string;
  coverUrl: string;
}

export interface DeezerTrack {
  trackNumber: number;
  title: string;
  duration: string;
  previewUrl?: string;
}

export const MAX_TAPE_FAVORITES = 5;

export type TapeInstance = {
  id: string;
  index: number;
  col: number;
  row: number;
  left: number;
  top: number;
  rotation: number;
  isAnchor: boolean;
  albumId?: string;
  artistName?: string;
  albumName?: string;
  coverUrl?: string;
  tracks?: DeezerTrack[];
  favoriteTrackNumbers?: number[];
  customBg?: string;
};
