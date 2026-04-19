"""
Script para agregar las canciones de Eurovision que faltan a songs.json
"""

import json
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
EUROVISION_FILE = os.path.join(SCRIPT_DIR, '../data/eurovision-with-youtube.json')
SONGS_FILE = os.path.join(SCRIPT_DIR, '../public/songs.json')

def main():
    # Cargar Eurovision songs
    with open(EUROVISION_FILE, 'r', encoding='utf-8') as f:
        eurovision_songs = json.load(f)
    
    # Cargar songs.json existente
    with open(SONGS_FILE, 'r', encoding='utf-8') as f:
        all_songs = json.load(f)
    
    # Crear un set de youtubeIds existentes para búsqueda rápida
    existing_ids = {s.get('youtubeId') for s in all_songs if s.get('youtubeId')}
    
    # Contar canciones Eurovision existentes
    existing_eurovision = [s for s in all_songs if 'Eurovision' in s.get('styles', [])]
    print(f"Canciones Eurovision existentes en songs.json: {len(existing_eurovision)}")
    print(f"Canciones en eurovision-with-youtube.json: {len(eurovision_songs)}")
    
    # Agregar canciones que faltan
    added = 0
    skipped = 0
    
    for song in eurovision_songs:
        youtube_id = song.get('youtubeId')
        
        if not youtube_id:
            print(f"  ⚠ Sin youtubeId: {song['artist']} - {song['title']}")
            skipped += 1
            continue
            
        if youtube_id in existing_ids:
            # Ya existe - verificar que tenga el estilo Eurovision
            for s in all_songs:
                if s.get('youtubeId') == youtube_id:
                    if 'Eurovision' not in s.get('styles', []):
                        s.setdefault('styles', []).append('Eurovision')
                        print(f"  + Añadido estilo Eurovision: {song['artist']} - {song['title']}")
                    break
            skipped += 1
            continue
        
        # Crear nueva entrada
        new_song = {
            'title': song['title'],
            'artist': song['artist'],
            'year': song['year'],
            'youtubeId': youtube_id,
            'styles': ['Eurovision']
        }
        
        all_songs.append(new_song)
        existing_ids.add(youtube_id)
        print(f"  ✓ Añadida: {song['artist']} - {song['title']} ({song['year']})")
        added += 1
    
    # Guardar
    with open(SONGS_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_songs, f, ensure_ascii=False, indent=2)
    
    # Verificar resultado
    final_eurovision = [s for s in all_songs if 'Eurovision' in s.get('styles', [])]
    
    print(f"\n{'='*60}")
    print(f"RESUMEN:")
    print(f"  Añadidas: {added}")
    print(f"  Ya existían: {skipped}")
    print(f"  Total canciones Eurovision ahora: {len(final_eurovision)}")
    print(f"  Total canciones en songs.json: {len(all_songs)}")

if __name__ == '__main__':
    main()
