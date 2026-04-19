import type { Song, MusicStyle } from "@/types";

let songsCache: Song[] | null = null;

export async function loadSongs(): Promise<Song[]> {
  if (songsCache) return songsCache;
  
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const response = await fetch(`${basePath}/songs.json`);
  const songs = await response.json() as Song[];
  songsCache = songs;
  return songs;
}

export function filterSongsByStyle(songs: Song[], style: MusicStyle): Song[] {
  return songs.filter(song => song.styles.includes(style));
}

export function filterSongsByStyles(songs: Song[], styles: MusicStyle[]): Song[] {
  if (styles.length === 0) return [];
  return songs.filter(song => song.styles.some(s => styles.includes(s as MusicStyle)));
}

export function filterSongsByYearRange(songs: Song[], minYear: number, maxYear: number): Song[] {
  return songs.filter(song => song.year >= minYear && song.year <= maxYear);
}

export function filterSongs(songs: Song[], styles: MusicStyle[], yearRange: [number, number]): Song[] {
  let filtered = songs;
  
  if (styles.length > 0) {
    filtered = filtered.filter(song => song.styles.some(s => styles.includes(s as MusicStyle)));
  }
  
  filtered = filtered.filter(song => song.year >= yearRange[0] && song.year <= yearRange[1]);
  
  return filtered;
}

export function getTotalSongsForStyles(songs: Song[], styles: MusicStyle[]): number {
  const uniqueSongs = new Set<string>();
  for (const song of songs) {
    if (song.styles.some(s => styles.includes(s as MusicStyle))) {
      uniqueSongs.add(song.youtubeId);
    }
  }
  return uniqueSongs.size;
}

export function getTotalSongsFiltered(songs: Song[], styles: MusicStyle[], yearRange: [number, number]): number {
  const filtered = filterSongs(songs, styles, yearRange);
  const uniqueSongs = new Set<string>();
  for (const song of filtered) {
    uniqueSongs.add(song.youtubeId);
  }
  return uniqueSongs.size;
}

export function getYearRange(songs: Song[]): [number, number] {
  if (songs.length === 0) return [1960, 2025];
  
  let min = Infinity;
  let max = -Infinity;
  
  for (const song of songs) {
    if (song.year < min) min = song.year;
    if (song.year > max) max = song.year;
  }
  
  // Limitar el rango mínimo a 1960 según las reglas del juego
  min = Math.max(min, 1960);
  max = Math.min(max, 2025);
  
  return [min, max];
}

export function getStyleStatsForYearRange(songs: Song[], yearRange: [number, number]): Record<string, number> {
  const filtered = filterSongsByYearRange(songs, yearRange[0], yearRange[1]);
  const stats: Record<string, number> = {};
  for (const song of filtered) {
    for (const style of song.styles) {
      stats[style] = (stats[style] || 0) + 1;
    }
  }
  return stats;
}

export function getRandomSong(songs: Song[]): Song | null {
  if (songs.length === 0) return null;
  const index = Math.floor(Math.random() * songs.length);
  return songs[index];
}

export function getRandomSongExcluding(songs: Song[], excludeIds: Set<string>): Song | null {
  const available = songs.filter(song => !excludeIds.has(song.youtubeId));
  return getRandomSong(available);
}

export function getYouTubeUrl(youtubeId: string): string {
  return `https://music.youtube.com/watch?v=${youtubeId}`;
}

export function getYouTubeEmbedUrl(youtubeId: string): string {
  return `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`;
}

export function getStyleStats(songs: Song[]): Record<string, number> {
  const stats: Record<string, number> = {};
  for (const song of songs) {
    for (const style of song.styles) {
      stats[style] = (stats[style] || 0) + 1;
    }
  }
  return stats;
}
