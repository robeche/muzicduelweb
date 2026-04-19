"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Song } from "@/types";
import { SOUNDTRACK_STYLES, type MusicStyle } from "@/types";

// Declaración global para la API de YouTube
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: {
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (event: { target: YTPlayer }) => void;
            onStateChange?: (event: { data: number }) => void;
            onError?: (event: { data: number }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  destroy: () => void;
  getPlayerState: () => number;
}

interface DeezerTrack {
  id: number;
  title: string;
  artist: { name: string };
  preview: string;
}

type SongPlayerProps = {
  song: Song;
  revealed: boolean;
  onReveal: () => void;
  onNext: () => void;
};

// Variable global para saber si la API ya se cargó
let ytApiLoaded = false;
let ytApiLoading = false;
const ytApiCallbacks: (() => void)[] = [];

function loadYouTubeAPI(): Promise<void> {
  return new Promise((resolve) => {
    if (ytApiLoaded && window.YT) {
      resolve();
      return;
    }

    ytApiCallbacks.push(resolve);

    if (ytApiLoading) return;
    ytApiLoading = true;

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      ytApiLoaded = true;
      ytApiCallbacks.forEach((cb) => cb());
      ytApiCallbacks.length = 0;
    };
  });
}

// Buscar canción en Deezer usando JSONP (evita CORS)
function searchDeezerJSONP(query: string): Promise<DeezerTrack | null> {
  return new Promise((resolve) => {
    const callbackName = `deezerCallback_${Date.now()}`;
    const script = document.createElement('script');
    
    // Timeout después de 5 segundos
    const timeout = setTimeout(() => {
      cleanup();
      resolve(null);
    }, 5000);
    
    const cleanup = () => {
      clearTimeout(timeout);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any)[callbackName];
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any)[callbackName] = (data: { data?: DeezerTrack[] }) => {
      cleanup();
      if (data.data && data.data.length > 0) {
        resolve(data.data[0]);
      } else {
        resolve(null);
      }
    };
    
    script.src = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=5&output=jsonp&callback=${callbackName}`;
    script.onerror = () => {
      cleanup();
      resolve(null);
    };
    
    document.head.appendChild(script);
  });
}

async function searchDeezer(title: string, artist: string): Promise<DeezerTrack | null> {
  try {
    // Limpiar título y artista
    const cleanTitle = title.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim();
    const cleanArtist = artist.split(',')[0].split('&')[0].split(' feat')[0].split(' ft.')[0].trim();
    
    // Primera búsqueda: título + artista
    let result = await searchDeezerJSONP(`${cleanTitle} ${cleanArtist}`);
    if (result && result.preview) return result;
    
    // Segunda búsqueda: solo título
    result = await searchDeezerJSONP(cleanTitle);
    if (result && result.preview) return result;
    
    return null;
  } catch (error) {
    console.error('Error searching Deezer:', error);
    return null;
  }
}

export function SongPlayer({
  song,
  revealed,
  onReveal,
  onNext,
}: SongPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [deezerTrack, setDeezerTrack] = useState<DeezerTrack | null>(null);
  const [deezerSearched, setDeezerSearched] = useState(false);
  const playerRef = useRef<YTPlayer | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Detectar móvil al montar
  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);
  
  // Check if any of the song's styles is a soundtrack style
  const isSoundtrack = song.styles.some(s => SOUNDTRACK_STYLES.includes(s as MusicStyle));

  // Limpiar player cuando cambia la canción o se desmonta
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // Ignorar errores al destruir
        }
        playerRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [song.youtubeId]);

  // Reset state cuando cambia la canción
  useEffect(() => {
    setIsPlaying(false);
    setIsLoading(false);
    setError(null);
    setDeezerTrack(null);
    setDeezerSearched(false);
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch {
        // Ignorar errores al destruir
      }
      playerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, [song.youtubeId]);

  // Función para abrir en YouTube
  const openInYouTube = useCallback(() => {
    const videoId = song.youtubeId;
    const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobileDevice) {
      // Intentar deep link a la app de YouTube
      window.location.href = `youtube://www.youtube.com/watch?v=${videoId}`;
      // Fallback a web después de un breve delay
      setTimeout(() => {
        window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
      }, 500);
    } else {
      window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
    }
  }, [song.youtubeId]);

  // Reproducir en móvil con Deezer
  const handlePlayMobile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    // Buscar en Deezer si no lo hemos hecho
    if (!deezerSearched) {
      const track = await searchDeezer(song.title, song.artist);
      setDeezerTrack(track);
      setDeezerSearched(true);
      
      if (track && track.preview) {
        // Reproducir el preview de Deezer
        if (audioRef.current) {
          audioRef.current.pause();
        }
        audioRef.current = new Audio(track.preview);
        audioRef.current.play();
        audioRef.current.onended = () => setIsPlaying(false);
        audioRef.current.onerror = () => {
          setError('Error al reproducir preview');
          setIsPlaying(false);
        };
        setIsPlaying(true);
        setIsLoading(false);
      } else {
        setError('Canción no encontrada en Deezer');
        setIsLoading(false);
      }
    } else if (deezerTrack && deezerTrack.preview) {
      // Ya tenemos el track, solo reproducir
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        setIsPlaying(true);
      }
      setIsLoading(false);
    } else {
      setError('Canción no encontrada en Deezer');
      setIsLoading(false);
    }
  }, [song.title, song.artist, deezerSearched, deezerTrack]);

  // Reproducir en desktop con YouTube
  const handlePlayDesktop = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await loadYouTubeAPI();
      
      const containerId = `yt-player-${song.youtubeId}-${Date.now()}`;
      
      if (!playerContainerRef.current) {
        throw new Error("Container not found");
      }
      
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // Ignorar errores al destruir
        }
        playerRef.current = null;
      }
      
      // Crear elemento div para el player con tamaño mínimo para móviles
      const playerDiv = document.createElement("div");
      playerDiv.id = containerId;
      playerDiv.style.width = "100%";
      playerDiv.style.height = "100%";
      playerContainerRef.current.innerHTML = "";
      playerContainerRef.current.appendChild(playerDiv);
      
      // Crear el player de YouTube
      playerRef.current = new window.YT.Player(containerId, {
        videoId: song.youtubeId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            event.target.playVideo();
            setIsPlaying(true);
            setIsLoading(false);
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              setError(null);
            }
          },
          onError: (event) => {
            setIsLoading(false);
            const errorCodes: Record<number, string> = {
              2: "ID de video inválido",
              5: "Error de reproducción HTML5",
              100: "Video no encontrado",
              101: "Reproducción no permitida",
              150: "Reproducción no permitida",
            };
            setError(errorCodes[event.data] || "Error al cargar video");
            console.error("YouTube Error:", event.data);
          },
        },
      });
    } catch (err) {
      setIsLoading(false);
      setError("Error al inicializar reproductor");
      console.error("Error al inicializar YouTube API:", err);
    }
  }, [song.youtubeId]);

  // Pausar/Reanudar audio móvil
  const toggleMobilePlayback = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  }, [isPlaying]);

  return (
    <div className="glass-card p-6 sm:p-8 max-w-lg mx-auto">
      {/* Mobile: Deezer preview with vinyl animation */}
      {isMobile ? (
        <div className="relative w-full aspect-square max-w-xs mx-auto mb-6">
          {/* Vinyl record outer ring - spins when playing */}
          <div className={`
            absolute inset-0 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 
            border-4 border-slate-700 shadow-2xl
            ${isPlaying ? 'animate-spin' : ''}
          `} style={{ animationDuration: '3s' }}>
            {/* Grooves */}
            <div className="absolute inset-4 rounded-full border border-slate-600/30" />
            <div className="absolute inset-8 rounded-full border border-slate-600/30" />
            <div className="absolute inset-12 rounded-full border border-slate-600/30" />
          </div>
          
          {/* Center area - play/pause button */}
          <div className="absolute inset-[25%] rounded-full overflow-hidden bg-slate-900 border-2 border-slate-600 z-10">
            {/* Play button - shown when not playing */}
            {!isPlaying && !isLoading && (
              <button
                onClick={handlePlayMobile}
                className="absolute inset-0 flex items-center justify-center bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-r from-green-500 to-emerald-500">
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </button>
            )}
            
            {/* Pause button - shown when playing */}
            {isPlaying && !isLoading && (
              <button
                onClick={toggleMobilePlayback}
                className="absolute inset-0 flex items-center justify-center bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-r from-green-500 to-emerald-500">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                </div>
              </button>
            )}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Desktop: YouTube with vinyl animation */
        <div className="relative w-full aspect-square max-w-xs mx-auto mb-6">
          {/* Vinyl record outer ring - spins when playing */}
          <div className={`
            absolute inset-0 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 
            border-4 border-slate-700 shadow-2xl
            ${isPlaying ? 'animate-spin' : ''}
          `} style={{ animationDuration: '3s' }}>
            {/* Grooves */}
            <div className="absolute inset-4 rounded-full border border-slate-600/30" />
            <div className="absolute inset-8 rounded-full border border-slate-600/30" />
            <div className="absolute inset-12 rounded-full border border-slate-600/30" />
          </div>
          
          {/* Center area - YouTube player or play button */}
          <div className="absolute inset-[25%] rounded-full overflow-hidden bg-slate-900 border-2 border-slate-600 z-10">
            {/* YouTube Player for desktop - hidden but functional */}
            <div 
              ref={playerContainerRef}
              className={`absolute inset-0 ${isPlaying ? 'opacity-0' : 'hidden'}`}
            />
            
            {/* Play button - shown when not playing and no error */}
            {!isPlaying && !isLoading && !error && (
              <button
                onClick={handlePlayDesktop}
                className="absolute inset-0 flex items-center justify-center bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-r from-cyan-500 to-purple-500">
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </button>
            )}
            
            {/* Error state */}
            {error && !isLoading && (
              <button
                onClick={openInYouTube}
                className="absolute inset-0 flex items-center justify-center bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-r from-red-500 to-orange-500">
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
              </button>
            )}
            
            {/* Playing indicator */}
            {isPlaying && !isLoading && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                <div className="flex gap-1">
                  <span className="w-2 h-8 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-10 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-6 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile: Deezer info and YouTube link */}
      {isMobile && (
        <div className="text-center mb-4">
          {deezerSearched && deezerTrack && (
            <p className="text-green-400 text-sm mb-2">
              🎵 Preview de 30 segundos via Deezer
            </p>
          )}
          {error && (
            <p className="text-amber-400 text-sm mb-2">{error}</p>
          )}
          <button
            onClick={openInYouTube}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            Escuchar completa en YouTube
          </button>
        </div>
      )}

      {/* Desktop: Error message with YouTube button */}
      {!isMobile && error && !isLoading && (
        <div className="text-center mb-4">
          <p className="text-red-400 text-sm mb-2">{error}</p>
          <p className="text-slate-400 text-xs">Pulsa el icono de YouTube para abrir en nueva pestaña</p>
        </div>
      )}

      {/* Status indicator */}
      {isPlaying && (
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex gap-1">
            <span className="w-1 h-4 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-6 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-5 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
            <span className="w-1 h-7 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
            <span className="w-1 h-4 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '600ms' }} />
          </div>
          <span className="text-slate-400 text-sm ml-2">
            {isMobile ? 'Preview 30s...' : 'Reproduciendo...'}
          </span>
        </div>
      )}

      {/* Song info - hidden until revealed */}
      {revealed ? (
        <div className="text-center space-y-3 animate-in fade-in duration-500">
          <h2 className="text-2xl font-bold text-white">{song.title}</h2>
          <p className="text-lg text-slate-300">
            {song.artist}
          </p>
          {isSoundtrack && song.film && (
            <p className="text-xl font-semibold text-cyan-400">
              🎬 {song.film}
            </p>
          )}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full border border-cyan-400/30">
            <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              {song.year}
            </span>
          </div>
          
          <div className="pt-4">
            <button
              onClick={onNext}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
            >
              Siguiente canción →
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          {isSoundtrack && (
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full border border-amber-400/30">
              <span className="text-amber-400 font-semibold">🎬 Canción de película</span>
            </div>
          )}
          <p className="text-slate-400 mb-4">
            {isPlaying 
              ? (isSoundtrack ? "Escucha e intenta adivinar de qué película es y su año" : "Escucha la canción e intenta adivinar el año")
              : "Pulsa play para escuchar la canción"}
          </p>
          <button
            onClick={onReveal}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
          >
            Revelar canción 🎵
          </button>
        </div>
      )}
    </div>
  );
}
