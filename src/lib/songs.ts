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

export function getTotalSongsForStyles(songs: Song[], styles: MusicStyle[]): number {
  const uniqueSongs = new Set<string>();
  for (const song of songs) {
    if (song.styles.some(s => styles.includes(s as MusicStyle))) {
      uniqueSongs.add(song.youtubeId);
    }
  }
  return uniqueSongs.size;
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
