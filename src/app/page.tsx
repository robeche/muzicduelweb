"use client";

import { useEffect, useState, useCallback } from "react";
import type { Song, MusicStyle } from "@/types";
import { loadSongs, filterSongs, getRandomSongExcluding, getStyleStatsForYearRange, getTotalSongsFiltered, getYearRange } from "@/lib/songs";
import { StyleSelector } from "@/components/StyleSelector";
import { YearRangeSlider } from "@/components/YearRangeSlider";
import { SongPlayer } from "@/components/SongPlayer";
import { GameInstructions } from "@/components/GameInstructions";

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [styleStats, setStyleStats] = useState<Record<string, number>>({});
  const [globalYearRange, setGlobalYearRange] = useState<[number, number]>([1960, 2025]);
  const [yearRange, setYearRange] = useState<[number, number]>([1960, 2025]);
  
  const [selectedStyles, setSelectedStyles] = useState<MusicStyle[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [playedSongs, setPlayedSongs] = useState<Set<string>>(new Set());
  const [gameStarted, setGameStarted] = useState(false);

  // Load songs on mount
  useEffect(() => {
    loadSongs()
      .then((data) => {
        setSongs(data);
        const range = getYearRange(data);
        setGlobalYearRange(range);
        setYearRange(range);
        setStyleStats(getStyleStatsForYearRange(data, range));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Update style stats when year range changes
  useEffect(() => {
    if (songs.length > 0) {
      setStyleStats(getStyleStatsForYearRange(songs, yearRange));
    }
  }, [songs, yearRange]);

  // Pick a new song when style changes
  const pickNewSong = useCallback(() => {
    if (selectedStyles.length === 0 || songs.length === 0) return;
    
    const styleSongs = filterSongs(songs, selectedStyles, yearRange);
    const newSong = getRandomSongExcluding(styleSongs, playedSongs);
    
    if (newSong) {
      setCurrentSong(newSong);
      setRevealed(false);
      setPlayedSongs((prev) => new Set(prev).add(newSong.youtubeId));
    } else {
      // All songs played, reset
      setPlayedSongs(new Set());
      const freshSong = getRandomSongExcluding(styleSongs, new Set());
      if (freshSong) {
        setCurrentSong(freshSong);
        setRevealed(false);
        setPlayedSongs(new Set([freshSong.youtubeId]));
      }
    }
  }, [selectedStyles, songs, playedSongs, yearRange]);

  const handleToggleStyle = (style: MusicStyle) => {
    setSelectedStyles((prev) => {
      if (prev.includes(style)) {
        return prev.filter((s) => s !== style);
      }
      return [...prev, style];
    });
  };

  const handleYearRangeChange = (range: [number, number]) => {
    setYearRange(range);
  };

  const handleStartPlaying = () => {
    setGameStarted(true);
    pickNewSong();
  };

  const handleReveal = () => {
    setRevealed(true);
  };

  const handleNext = () => {
    pickNewSong();
  };

  const handleChangeStyle = () => {
    setSelectedStyles([]);
    setCurrentSong(null);
    setRevealed(false);
    setPlayedSongs(new Set());
    setGameStarted(false);
  };

  const totalAvailableSongs = getTotalSongsFiltered(songs, selectedStyles, yearRange);
  const songsInYearRange = getTotalSongsFiltered(songs, selectedStyles.length > 0 ? selectedStyles : [], yearRange);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando canciones...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-3">
            MuzicDuel
          </h1>
          <p className="text-slate-400 text-lg">
            Escucha canciones y adivina el año de lanzamiento
          </p>
          <div className="flex items-center justify-center gap-4 mt-3">
            {songs.length > 0 && (
              <p className="text-slate-500 text-sm">
                {songs.length} canciones disponibles
              </p>
            )}
            <GameInstructions />
          </div>
        </header>

        {/* Game area */}
        {!gameStarted ? (
          // Style selection
          <section className="glass-card p-6 sm:p-8">
            {/* Year Range Filter */}
            <div className="mb-8 pb-6 border-b border-white/10">
              <YearRangeSlider
                minYear={globalYearRange[0]}
                maxYear={globalYearRange[1]}
                yearRange={yearRange}
                onRangeChange={handleYearRangeChange}
                songCount={songsInYearRange}
              />
            </div>

            <h2 className="text-xl font-semibold text-white mb-2">
              Elige los estilos musicales
            </h2>
            <p className="text-slate-400 mb-6">
              Selecciona uno o varios estilos para jugar
            </p>
            <StyleSelector
              selectedStyles={selectedStyles}
              onToggleStyle={handleToggleStyle}
              styleStats={styleStats}
            />
            
            {selectedStyles.length > 0 && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="text-slate-300">
                    <span className="font-semibold text-cyan-400">{selectedStyles.length}</span> estilo{selectedStyles.length !== 1 ? 's' : ''} seleccionado{selectedStyles.length !== 1 ? 's' : ''}
                    <span className="text-slate-500 mx-2">•</span>
                    <span className="font-semibold text-purple-400">{totalAvailableSongs}</span> canciones
                  </div>
                  <button
                    onClick={handleStartPlaying}
                    className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
                  >
                    Comenzar 🎵
                  </button>
                </div>
              </div>
            )}
          </section>
        ) : (
          // Playing
          <section>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
              <div className="flex flex-wrap gap-2">
                {selectedStyles.map((style) => (
                  <span
                    key={style}
                    className="inline-flex items-center px-3 py-1.5 bg-cyan-400/10 border border-cyan-400/30 rounded-full text-cyan-300 text-sm"
                  >
                    {style}
                  </span>
                ))}
              </div>
              <button
                onClick={handleChangeStyle}
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                Cambiar estilos
              </button>
            </div>
            
            {currentSong && (
              <SongPlayer
                song={currentSong}
                revealed={revealed}
                onReveal={handleReveal}
                onNext={handleNext}
              />
            )}
            
            {playedSongs.size > 0 && (
              <p className="text-center text-slate-500 text-sm mt-6">
                {playedSongs.size} de {totalAvailableSongs} canciones jugadas
              </p>
            )}
          </section>
        )}

        {/* Footer */}
        <footer className="text-center text-slate-600 text-sm mt-12">
          <p>
            Desarrollado con Next.js • Canciones de YouTube Music
          </p>
        </footer>
      </div>
    </main>
  );
}
