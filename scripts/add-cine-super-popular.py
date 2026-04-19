#!/usr/bin/env python3
"""
Añade canciones SÚPER populares de películas a songs.json
Busca YouTube IDs con ytmusicapi
"""

import json
import os
from ytmusicapi import YTMusic

def search_youtube_id(ytmusic, title, artist, film=None):
    """Busca el YouTube ID de una canción"""
    # Primero buscar con título + artista
    queries = [
        f"{title} {artist}",
        f"{title} {artist} soundtrack",
        f"{title} {film}" if film else f"{title}",
        f"{title}"
    ]
    
    for query in queries:
        try:
            results = ytmusic.search(query, filter="songs", limit=5)
            if results:
                return results[0]['videoId']
        except:
            pass
    
    return None

def main():
    print("=" * 60)
    print("AÑADIENDO CANCIONES SÚPER POPULARES DE PELÍCULAS")
    print("=" * 60)
    
    # Cargar canciones actuales
    songs_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'songs.json')
    with open(songs_path, 'r', encoding='utf-8') as f:
        songs = json.load(f)
    
    # Crear índice de canciones existentes
    existing = set()
    for song in songs:
        key = (song['title'].lower(), song['artist'].lower())
        existing.add(key)
    
    # Cargar canciones nuevas
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'cine-super-popular.json')
    with open(data_path, 'r', encoding='utf-8') as f:
        new_songs = json.load(f)
    
    # Inicializar ytmusicapi
    ytmusic = YTMusic()
    
    added = 0
    skipped = 0
    
    for i, song_data in enumerate(new_songs, 1):
        title = song_data['title']
        artist = song_data['artist']
        year = song_data['year']
        film = song_data.get('film', '')
        film_es = song_data.get('film_es', film)
        
        key = (title.lower(), artist.lower())
        
        if key in existing:
            print(f"  [{i}/{len(new_songs)}] {title} - Ya existe, saltando...")
            skipped += 1
            continue
        
        # Buscar YouTube ID
        print(f"  [{i}/{len(new_songs)}] {title} ({film_es})...", end=" ", flush=True)
        
        yt_id = search_youtube_id(ytmusic, title, artist, film)
        
        if yt_id:
            print(f"OK {yt_id}")
            
            new_song = {
                "title": title,
                "artist": artist,
                "year": year,
                "youtubeId": yt_id,
                "styles": ["Cine"],
                "film": film_es
            }
            
            songs.append(new_song)
            existing.add(key)
            added += 1
        else:
            print("NO ENCONTRADO")
    
    # Guardar
    with open(songs_path, 'w', encoding='utf-8') as f:
        json.dump(songs, f, ensure_ascii=False, indent=2)
    
    print()
    print("=" * 60)
    print("RESUMEN")
    print("=" * 60)
    print(f"  Añadidas: {added}")
    print(f"  Ya existían: {skipped}")
    print(f"  Total en songs.json: {len(songs)}")

if __name__ == "__main__":
    main()
