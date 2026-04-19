/**
 * Script para corregir los años de las canciones usando OpenAI
 * Ejecutar: node scripts/fix-years.js
 */

const fs = require('fs');
const path = require('path');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY no está configurada');
  process.exit(1);
}

const SONGS_PATH = path.join(__dirname, '../public/songs.json');
const OUTPUT_PATH = path.join(__dirname, '../public/songs-fixed.json');
const PROGRESS_PATH = path.join(__dirname, '../public/fix-progress.json');
const BATCH_SIZE = 20; // Lotes pequeños para evitar errores

async function askOpenAI(songs, retries = 3) {
  const prompt = songs.map((s, i) => `${i + 1}. "${s.title}" - ${s.artist}`).join('\n');
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Devuelve SOLO un array JSON con ${songs.length} años (números enteros). Sin texto adicional. Ejemplo para 3 canciones: [1985,1990,1978]`
            },
            {
              role: 'user',
              content: `Año de lanzamiento ORIGINAL (no remaster) de:\n${prompt}`
            }
          ],
          temperature: 0,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`\n  HTTP ${response.status}: ${errText.slice(0, 100)}`);
        if (attempt < retries) await sleep(3000 * attempt);
        continue;
      }

      const data = await response.json();
      if (!data.choices?.[0]?.message?.content) {
        console.error(`\n  Sin contenido en respuesta`);
        if (attempt < retries) await sleep(2000 * attempt);
        continue;
      }

      const content = data.choices[0].message.content.trim();
      // Buscar array en la respuesta
      const match = content.match(/\[([\d,\s\n]+)\]/);
      if (match) {
        const years = JSON.parse(match[0]);
        // Aceptar si tiene la longitud correcta o +1 (error común del modelo)
        if (years.length === songs.length) return years;
        if (years.length === songs.length + 1) return years.slice(0, songs.length);
        console.error(`\n  Esperaba ${songs.length} años, recibí ${years.length}`);
      } else {
        console.error(`\n  No encontré array en: ${content.slice(0, 50)}...`);
      }
      if (attempt < retries) await sleep(1000);
    } catch (e) {
      console.error(`\n  Error (intento ${attempt}):`, e.message);
      if (attempt < retries) await sleep(2000 * attempt);
    }
  }
  return null;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function loadProgress() {
  try {
    if (fs.existsSync(PROGRESS_PATH)) {
      return JSON.parse(fs.readFileSync(PROGRESS_PATH, 'utf-8'));
    }
  } catch (e) {}
  return {};
}

function saveProgress(fixedYears) {
  fs.writeFileSync(PROGRESS_PATH, JSON.stringify(Object.fromEntries(fixedYears), null, 2), 'utf-8');
}

async function main() {
  console.log('Cargando canciones...');
  const allSongs = JSON.parse(fs.readFileSync(SONGS_PATH, 'utf-8'));
  
  // Cargar progreso previo
  const previousProgress = loadProgress();
  const fixedYears = new Map(Object.entries(previousProgress));
  console.log(`Progreso previo: ${fixedYears.size} canciones ya corregidas`);
  
  // Filtrar solo las que tienen año 2000 y no están ya corregidas
  const songsToFix = allSongs.filter(s => {
    if (s.year !== 2000) return false;
    const key = `${s.title}|${s.artist}`;
    return !fixedYears.has(key);
  });
  
  console.log(`Total: ${allSongs.length} canciones`);
  console.log(`Por corregir: ${songsToFix.length} canciones`);

  if (songsToFix.length === 0) {
    console.log('¡Todas las canciones ya están corregidas!');
  } else {
    const totalBatches = Math.ceil(songsToFix.length / BATCH_SIZE);
    let failed = 0;
    
    for (let i = 0; i < songsToFix.length; i += BATCH_SIZE) {
      const batch = songsToFix.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      process.stdout.write(`\rLote ${batchNum}/${totalBatches} (${fixedYears.size} ok, ${failed} fail)...`);
      
      const years = await askOpenAI(batch);
      
      if (years) {
        batch.forEach((song, idx) => {
          const key = `${song.title}|${song.artist}`;
          fixedYears.set(key, years[idx]);
        });
      } else {
        failed += batch.length;
        console.log(`\n  ✗ Lote ${batchNum} falló`);
      }
      
      // Guardar progreso cada lote
      saveProgress(fixedYears);
      await sleep(500);
    }
  }

  console.log(`\n\nTotal corregidas: ${fixedYears.size} canciones`);

  // Aplicar correcciones
  const fixedSongs = allSongs.map(song => {
    if (song.year === 2000) {
      const key = `${song.title}|${song.artist}`;
      const fixedYear = fixedYears.get(key);
      if (fixedYear) {
        return { ...song, year: fixedYear };
      }
    }
    return song;
  });

  // Ordenar por año
  fixedSongs.sort((a, b) => a.year - b.year);

  // Guardar
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(fixedSongs, null, 2), 'utf-8');
  console.log(`Guardado en: ${OUTPUT_PATH}`);
  
  // Mostrar distribución
  const decades = {};
  fixedSongs.forEach(s => {
    const decade = Math.floor(s.year / 10) * 10;
    decades[decade] = (decades[decade] || 0) + 1;
  });
  console.log('\nDistribución por décadas:');
  Object.entries(decades).sort((a, b) => a[0] - b[0]).forEach(([decade, count]) => {
    console.log(`  ${decade}s: ${count}`);
  });
  
  // Verificar cuántas quedaron sin corregir
  const stillYear2000 = fixedSongs.filter(s => s.year === 2000).length;
  if (stillYear2000 > 0) {
    console.log(`\n⚠ Aún quedan ${stillYear2000} canciones con año 2000`);
  }
}

main().catch(console.error);
