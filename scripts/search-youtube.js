/**
 * Script para buscar canciones de Eurovision en YouTube Music via DuckDuckGo
 * Uso: node scripts/search-youtube.js [startIndex] [count]
 * Ejemplo: node scripts/search-youtube.js 0 10  (busca canciones 0-9)
 */

const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '../data/eurovision-combined.json');
const OUTPUT_FILE = path.join(__dirname, '../data/eurovision-with-youtube.json');

// Delay entre búsquedas para evitar rate limiting
const DELAY_MS = 2000;

async function searchYouTube(artist, title, year) {
  const query = encodeURIComponent(`site:youtube.com ${artist} ${title} ${year} official`);
  const url = `https://html.duckduckgo.com/html/?q=${query}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const html = await response.text();
    
    // Buscar video IDs de YouTube en la respuesta
    // Formato: youtube.com/watch?v=XXXXXXXXXXX
    const videoIdRegex = /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/g;
    const matches = [...html.matchAll(videoIdRegex)];
    
    if (matches.length > 0) {
      // Devolver el primer video ID encontrado
      return matches[0][1];
    }
    
    // Intentar también formato music.youtube.com
    const musicIdRegex = /music\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/g;
    const musicMatches = [...html.matchAll(musicIdRegex)];
    
    if (musicMatches.length > 0) {
      return musicMatches[0][1];
    }
    
    return null;
  } catch (error) {
    console.error(`Error buscando "${artist} - ${title}":`, error.message);
    return null;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  // Leer argumentos
  const startIndex = parseInt(process.argv[2]) || 0;
  const count = parseInt(process.argv[3]) || 10;
  
  // Leer canciones
  const songs = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
  
  // Leer progreso existente si existe
  let results = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    results = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
    console.log(`Cargado progreso existente: ${results.length} canciones`);
  } else {
    // Copiar estructura inicial
    results = songs.map(s => ({ ...s }));
  }
  
  const endIndex = Math.min(startIndex + count, songs.length);
  console.log(`\nBuscando canciones ${startIndex} a ${endIndex - 1} de ${songs.length} total\n`);
  
  let found = 0;
  let notFound = 0;
  
  for (let i = startIndex; i < endIndex; i++) {
    const song = songs[i];
    
    // Si ya tiene youtubeId, saltar
    if (results[i].youtubeId) {
      console.log(`[${i}] ✓ Ya existe: ${song.artist} - ${song.title}`);
      found++;
      continue;
    }
    
    console.log(`[${i}] Buscando: ${song.artist} - ${song.title} (${song.year})...`);
    
    const videoId = await searchYouTube(song.artist, song.title, song.year);
    
    if (videoId) {
      results[i].youtubeId = videoId;
      results[i].youtubeUrl = `https://music.youtube.com/watch?v=${videoId}`;
      console.log(`    ✓ Encontrado: ${videoId}`);
      found++;
    } else {
      console.log(`    ✗ No encontrado`);
      notFound++;
    }
    
    // Guardar progreso después de cada búsqueda
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
    
    // Esperar antes de la siguiente búsqueda
    if (i < endIndex - 1) {
      await sleep(DELAY_MS);
    }
  }
  
  console.log(`\n--- Resumen ---`);
  console.log(`Encontradas: ${found}`);
  console.log(`No encontradas: ${notFound}`);
  console.log(`Progreso guardado en: ${OUTPUT_FILE}`);
  
  // Mostrar estadísticas globales
  const withYoutube = results.filter(r => r.youtubeId).length;
  console.log(`\nTotal con YouTube: ${withYoutube}/${results.length}`);
}

main().catch(console.error);
