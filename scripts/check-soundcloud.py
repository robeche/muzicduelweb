#!/usr/bin/env python3
"""
Verificar cuántas canciones están disponibles en SoundCloud
"""

import json
import requests
import time
import random

def search_soundcloud(title, artist):
    """Buscar una canción en SoundCloud usando su API pública"""
    query = f"{title} {artist}"
    
    # SoundCloud widget API - no requiere auth
    url = "https://api-v2.soundcloud.com/search/tracks"
    params = {
        "q": query,
        "client_id": "iZIs9mchVcX5lhVRyQGGAYlNPVldzAoX",  # Client ID público
        "limit": 5,
        "offset": 0
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("collection") and len(data["collection"]) > 0:
                # Verificar si alguno coincide razonablemente
                for track in data["collection"]:
                    track_title = track.get("title", "").lower()
                    track_artist = track.get("user", {}).get("username", "").lower()
                    
                    # Coincidencia aproximada
                    if title.lower() in track_title or track_title in title.lower():
                        return {
                            "found": True,
                            "id": track["id"],
                            "title": track["title"],
                            "artist": track["user"]["username"],
                            "url": track["permalink_url"]
                        }
                
                # Si no hay coincidencia exacta, tomar el primero como aproximado
                track = data["collection"][0]
                return {
                    "found": True,
                    "id": track["id"],
                    "title": track["title"],
                    "artist": track["user"]["username"],
                    "url": track["permalink_url"],
                    "approximate": True
                }
        return {"found": False}
    except Exception as e:
        return {"found": False, "error": str(e)}

def main():
    print("=" * 60)
    print("VERIFICANDO DISPONIBILIDAD EN SOUNDCLOUD")
    print("=" * 60)
    
    # Cargar canciones
    with open("public/songs.json", "r", encoding="utf-8") as f:
        songs = json.load(f)
    
    print(f"Total canciones a verificar: {len(songs)}")
    print()
    
    # Tomar una muestra aleatoria para test rápido
    sample_size = 50
    sample = random.sample(songs, min(sample_size, len(songs)))
    
    found = 0
    not_found = 0
    approximate = 0
    errors = 0
    
    found_songs = []
    not_found_songs = []
    
    print(f"Probando muestra de {len(sample)} canciones...")
    print()
    
    for i, song in enumerate(sample, 1):
        title = song["title"]
        artist = song["artist"]
        
        print(f"  [{i}/{len(sample)}] {title} - {artist}...", end=" ", flush=True)
        
        result = search_soundcloud(title, artist)
        
        if result.get("found"):
            if result.get("approximate"):
                print(f"~APROX~ {result['title'][:30]}")
                approximate += 1
            else:
                print(f"OK")
                found += 1
            found_songs.append({
                "original": f"{title} - {artist}",
                "soundcloud": result
            })
        elif result.get("error"):
            print(f"ERROR: {result['error'][:30]}")
            errors += 1
        else:
            print("NO ENCONTRADA")
            not_found += 1
            not_found_songs.append(f"{title} - {artist}")
        
        # Rate limiting
        time.sleep(0.5)
    
    print()
    print("=" * 60)
    print("RESULTADOS DE LA MUESTRA")
    print("=" * 60)
    print(f"  Encontradas exactas: {found}")
    print(f"  Encontradas aproximadas: {approximate}")
    print(f"  No encontradas: {not_found}")
    print(f"  Errores: {errors}")
    print()
    
    total_found = found + approximate
    percentage = (total_found / len(sample)) * 100
    print(f"  Tasa de éxito: {percentage:.1f}%")
    print()
    
    # Extrapolación
    estimated_available = int((percentage / 100) * len(songs))
    print(f"  Estimación para {len(songs)} canciones: ~{estimated_available} disponibles")
    
    if not_found_songs:
        print()
        print("Algunas canciones NO encontradas:")
        for song in not_found_songs[:10]:
            print(f"  - {song}")

if __name__ == "__main__":
    main()
