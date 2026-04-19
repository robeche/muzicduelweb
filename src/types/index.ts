export type MusicStyle =
  | "Rock Español"
  | "Heavy/Rock/Punk español"
  | "Pop español"
  | "Heavy metal clásico internacional"
  | "Rock clásico internacional"
  | "Pop internacional"
  | "Eurovision"
  | "Cine"
  | "Cine Infantil";

export const MUSIC_STYLES: MusicStyle[] = [
  "Rock Español",
  "Heavy/Rock/Punk español",
  "Pop español",
  "Heavy metal clásico internacional",
  "Rock clásico internacional",
  "Pop internacional",
  "Eurovision",
  "Cine",
  "Cine Infantil",
];

// Styles where artist field contains movie/series name instead of artist
export const SOUNDTRACK_STYLES: MusicStyle[] = ["Cine", "Cine Infantil"];

export type Song = {
  title: string;
  artist: string;
  year: number;
  youtubeId: string;
  styles: string[];
  film?: string; // Nombre de la película (para canciones de Cine/Cine Infantil)
};

export type GameState = "selecting" | "playing" | "revealed";

export type GameSession = {
  style: MusicStyle;
  currentSong: Song | null;
  revealed: boolean;
  score: number;
  totalPlayed: number;
};
