"""
Script para buscar canciones de Eurovision en YouTube Music usando ytmusicapi
Instalar: pip install ytmusicapi
Uso: python scripts/search-ytmusic.py
"""

import json
import os
import time
from ytmusicapi import YTMusic

# Rutas
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_FILE = os.path.join(SCRIPT_DIR, '../data/eurovision-combined.json')
OUTPUT_FILE = os.path.join(SCRIPT_DIR, '../data/eurovision-with-youtube.json')

# Delay entre búsquedas (para evitar rate limiting)
DELAY_MS = 500

def search_song(ytmusic, artist, title, year):
    """Busca una canción en YouTube Music y devuelve el videoId"""
    try:
        # Intentar búsqueda con artista + título + año
        query = f"{artist} {title} {year}"
        results = ytmusic.search(query, filter="songs", limit=5)
        
        if results:
            # Devolver el primer resultado
            return results[0].get('videoId')
        
        # Si no encuentra, intentar solo artista + título
        query = f"{artist} {title}"
        results = ytmusic.search(query, filter="songs", limit=5)
        
        if results:
            return results[0].get('videoId')
        
        # Último intento: búsqueda general de videos
        query = f"{artist} {title} Eurovision"
        results = ytmusic.search(query, filter="videos", limit=5)
        
        if results:
            return results[0].get('videoId')
            
        return None
        
    except Exception as e:
        print(f"  Error: {e}")
        return None

def main():
    print("Iniciando búsqueda en YouTube Music...")
    print("=" * 60)
    
    # Inicializar YTMusic (sin autenticación para búsquedas públicas)
    ytmusic = YTMusic()
    
    # Cargar canciones
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        songs = json.load(f)
    
    # Cargar progreso existente si existe
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
            results = json.load(f)
        print(f"Cargado progreso existente: {len(results)} canciones")
    else:
        results = [dict(s) for s in songs]
    
    total = len(songs)
    found = 0
    not_found = 0
    skipped = 0
    
    for i, song in enumerate(songs):
        artist = song['artist']
        title = song['title']
        year = song['year']
        
        # Si ya tiene youtubeId, saltar
        if results[i].get('youtubeId'):
            print(f"[{i+1}/{total}] ✓ Ya existe: {artist} - {title}")
            skipped += 1
            continue
        
        print(f"[{i+1}/{total}] Buscando: {artist} - {title} ({year})...", end=" ")
        
        video_id = search_song(ytmusic, artist, title, year)
        
        if video_id:
            results[i]['youtubeId'] = video_id
            results[i]['youtubeUrl'] = f"https://music.youtube.com/watch?v={video_id}"
            print(f"✓ {video_id}")
            found += 1
        else:
            print("✗ No encontrado")
            not_found += 1
        
        # Guardar progreso cada 10 canciones
        if (i + 1) % 10 == 0:
            with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
                json.dump(results, f, ensure_ascii=False, indent=2)
            print(f"  [Guardado progreso: {i+1} canciones procesadas]")
        
        # Delay entre búsquedas
        time.sleep(DELAY_MS / 1000)
    
    # Guardar resultado final
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print("\n" + "=" * 60)
    print(f"RESUMEN:")
    print(f"  Total canciones: {total}")
    print(f"  Ya existían:     {skipped}")
    print(f"  Encontradas:     {found}")
    print(f"  No encontradas:  {not_found}")
    print(f"\nResultados guardados en: {OUTPUT_FILE}")

if __name__ == '__main__':
    main()
