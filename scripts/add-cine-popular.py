"""
Script para añadir canciones populares de películas a songs.json
Usa ytmusicapi para buscar YouTube IDs
"""

import json
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
SONGS_FILE = os.path.join(PROJECT_DIR, 'public/songs.json')
CINE_POPULAR = os.path.join(PROJECT_DIR, 'data/cine-popular.json')

# Verificar ytmusicapi
try:
    from ytmusicapi import YTMusic
    ytmusic = YTMusic()
except ImportError:
    print("ERROR: ytmusicapi no está instalado. Ejecuta: pip install ytmusicapi")
    exit(1)

def search_youtube_id(artist, title):
    """Busca el YouTube ID de una canción"""
    queries = [
        f"{artist} {title}",
        f"{title} {artist}",
        f"{artist} {title} official",
        f"{title} soundtrack",
    ]
    
    for query in queries:
        try:
            results = ytmusic.search(query, filter="songs", limit=5)
            if results:
                # Buscar coincidencia razonable
                for r in results:
                    r_title = r.get('title', '').lower()
                    r_artist = ' '.join([a.get('name', '') for a in r.get('artists', [])]).lower()
                    
                    # Verificar si coincide razonablemente
                    title_words = set(title.lower().split())
                    r_title_words = set(r_title.split())
                    
                    if len(title_words & r_title_words) >= 1:
                        return r.get('videoId')
                
                # Si no hay coincidencia exacta, usar el primer resultado
                return results[0].get('videoId')
        except Exception as e:
            continue
    
    return None

def main():
    # Cargar songs.json
    with open(SONGS_FILE, 'r', encoding='utf-8') as f:
        all_songs = json.load(f)
    
    # Cargar datos de películas populares
    with open(CINE_POPULAR, 'r', encoding='utf-8') as f:
        popular_songs = json.load(f)
    
    # Set de títulos existentes (normalizado) para evitar duplicados
    existing = set()
    for s in all_songs:
        key = f"{s['artist'].lower()}|{s['title'].lower()}"
        existing.add(key)
    
    print("=" * 60)
    print("AÑADIENDO CANCIONES POPULARES DE PELÍCULAS")
    print("=" * 60)
    
    added = 0
    skipped = 0
    
    for i, song in enumerate(popular_songs):
        key = f"{song['artist'].lower()}|{song['title'].lower()}"
        if key in existing:
            print(f"  [SKIP] Ya existe: {song['artist']} - {song['title']}")
            skipped += 1
            continue
        
        print(f"  [{i+1}/{len(popular_songs)}] Buscando: {song['artist']} - {song['title']}...", end=" ", flush=True)
        
        youtube_id = search_youtube_id(song['artist'], song['title'])
        
        if youtube_id:
            # Determinar el estilo basado en la película
            style = "Cine"
            film_lower = song.get('film', '').lower()
            if any(kw in film_lower for kw in ['high school musical', 'camp rock', 'hannah montana', 'descendants', 'anastasia']):
                style = "Cine Infantil"
            
            new_song = {
                'title': song['title'],
                'artist': song['artist'],
                'year': song['year'],
                'youtubeId': youtube_id,
                'styles': [style],
                'film': song.get('film_es', song.get('film', ''))
            }
            all_songs.append(new_song)
            existing.add(key)
            added += 1
            print(f"OK {youtube_id}")
        else:
            print("NO ENCONTRADO")
    
    # Guardar
    with open(SONGS_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_songs, f, ensure_ascii=False, indent=2)
    
    # Resumen
    print(f"\n{'='*60}")
    print(f"RESUMEN")
    print(f"{'='*60}")
    print(f"  Añadidas: {added}")
    print(f"  Ya existían: {skipped}")
    print(f"  Total en songs.json: {len(all_songs)}")

if __name__ == '__main__':
    main()
