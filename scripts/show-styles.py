import json

songs = json.load(open('public/songs.json', encoding='utf-8'))

cine = [s for s in songs if 'Cine' in s.get('styles', []) and 'Cine Infantil' not in s.get('styles', [])]
infantil = [s for s in songs if 'Cine Infantil' in s.get('styles', [])]

print(f"=== CINE ({len(cine)} canciones) ===")
for s in sorted(cine, key=lambda x: x['year']):
    print(f"  {s['year']} - {s['artist']} - {s['title']}")

print(f"\n=== CINE INFANTIL ({len(infantil)} canciones) ===")
for s in sorted(infantil, key=lambda x: x['year']):
    print(f"  {s['year']} - {s['artist']} - {s['title']}")
