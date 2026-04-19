"""
Script para añadir canciones de Cine y Cine Infantil a songs.json
Usa ytmusicapi para buscar YouTube IDs
"""

import json
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
SONGS_FILE = os.path.join(PROJECT_DIR, 'public/songs.json')
CINE_DATA = os.path.join(PROJECT_DIR, 'data/cine-new.json')
CINE_INFANTIL_DATA = os.path.join(PROJECT_DIR, 'data/cine-infantil-new.json')

# Verificar ytmusicapi
try:
    from ytmusicapi import YTMusic
    ytmusic = YTMusic()
except ImportError:
    print("ERROR: ytmusicapi no está instalado. Ejecuta: pip install ytmusicapi")
    sys.exit(1)

def search_youtube_id(artist, title, year):
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
    
    # Set de títulos existentes (normalizado) para evitar duplicados
    existing = set()
    for s in all_songs:
        key = f"{s['artist'].lower()}|{s['title'].lower()}"
        existing.add(key)
    
    # Procesar Cine
    print("=" * 60)
    print("PROCESANDO CINE")
    print("=" * 60)
    
    with open(CINE_DATA, 'r', encoding='utf-8') as f:
        cine_songs = json.load(f)
    added_cine = 0
    
    for i, song in enumerate(cine_songs):
        key = f"{song['artist'].lower()}|{song['title'].lower()}"
        if key in existing:
            print(f"  ⏭ Ya existe: {song['artist']} - {song['title']}")
            continue
        
        print(f"  [{i+1}/{len(cine_songs)}] Buscando: {song['artist']} - {song['title']}...", end=" ")
        
        youtube_id = search_youtube_id(song['artist'], song['title'], song['year'])
        
        if youtube_id:
            new_song = {
                'title': song['title'],
                'artist': song['artist'],
                'year': song['year'],
                'youtubeId': youtube_id,
                'styles': ['Cine']
            }
            all_songs.append(new_song)
            existing.add(key)
            added_cine += 1
            print(f"✓ {youtube_id}")
        else:
            print("✗ No encontrado")
    
    print(f"\nAñadidas {added_cine} canciones de Cine")
    
    # Procesar Cine Infantil
    print("\n" + "=" * 60)
    print("PROCESANDO CINE INFANTIL")
    print("=" * 60)
    
    with open(CINE_INFANTIL_DATA, 'r', encoding='utf-8') as f:
        infantil_songs = json.load(f)
    added_infantil = 0
    
    for i, song in enumerate(infantil_songs):
        key = f"{song['artist'].lower()}|{song['title'].lower()}"
        if key in existing:
            print(f"  ⏭ Ya existe: {song['artist']} - {song['title']}")
            continue
        
        print(f"  [{i+1}/{len(infantil_songs)}] Buscando: {song['artist']} - {song['title']}...", end=" ")
        
        youtube_id = search_youtube_id(song['artist'], song['title'], song['year'])
        
        if youtube_id:
            new_song = {
                'title': song['title'],
                'artist': song['artist'],
                'year': song['year'],
                'youtubeId': youtube_id,
                'styles': ['Cine Infantil']
            }
            all_songs.append(new_song)
            existing.add(key)
            added_infantil += 1
            print(f"✓ {youtube_id}")
        else:
            print("✗ No encontrado")
    
    print(f"\nAñadidas {added_infantil} canciones de Cine Infantil")
    
    # Guardar
    with open(SONGS_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_songs, f, ensure_ascii=False, indent=2)
    
    # Resumen
    final_cine = len([s for s in all_songs if 'Cine' in s.get('styles', []) and 'Cine Infantil' not in s.get('styles', [])])
    final_infantil = len([s for s in all_songs if 'Cine Infantil' in s.get('styles', [])])
    
    print("\n" + "=" * 60)
    print("RESUMEN FINAL")
    print("=" * 60)
    print(f"  Canciones Cine: {final_cine}")
    print(f"  Canciones Cine Infantil: {final_infantil}")
    print(f"  Total en songs.json: {len(all_songs)}")

if __name__ == '__main__':
    main()
