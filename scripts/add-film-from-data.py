"""
Script para añadir el campo 'film' a las canciones nuevas de Cine/Cine Infantil
usando los datos originales de los archivos JSON
"""

import json
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
SONGS_FILE = os.path.join(PROJECT_DIR, 'public/songs.json')
CINE_DATA = os.path.join(PROJECT_DIR, 'data/cine-new.json')
CINE_INFANTIL_DATA = os.path.join(PROJECT_DIR, 'data/cine-infantil-new.json')

# Traducciones de películas al castellano
FILM_TRANSLATIONS = {
    # CINE
    "Breakfast at Tiffany's": "Desayuno con diamantes",
    "A Hard Day's Night": "¡Qué noche la de aquel día!",
    "The Sound of Music": "Sonrisas y lágrimas",
    "The Graduate": "El graduado",
    "The Thomas Crown Affair": "El caso Thomas Crown",
    "The Godfather": "El padrino",
    "The Way We Were": "Tal como éramos",
    "Live and Let Die": "Vive y deja morir",
    "Star Wars": "La guerra de las galaxias",
    "The Spy Who Loved Me": "La espía que me amó",
    "Saturday Night Fever": "Fiebre del sábado noche",
    "Grease": "Grease (Brillantina)",
    "Fame": "Fama",
    "American Gigolo": "American Gigolo",
    "9 to 5": "Cómo eliminar a su jefe",
    "Arthur": "Arthur, el soltero de oro",
    "For Your Eyes Only": "Sólo para sus ojos",
    "Flashdance": "Flashdance",
    "Against All Odds": "Contra todo riesgo",
    "Ghostbusters": "Los cazafantasmas",
    "Purple Rain": "Purple Rain",
    "The NeverEnding Story": "La historia interminable",
    "The Breakfast Club": "El club de los cinco",
    "Mad Max Beyond Thunderdome": "Mad Max: Más allá de la cúpula del trueno",
    "St. Elmo's Fire": "El fuego de San Elmo",
    "Beverly Hills Cop": "Bev Hills Cop (Superdetective en Hollywood)",
    "The Karate Kid Part II": "Karate Kid II",
    "La Bamba": "La Bamba",
    "Cocktail": "Cocktail",
    "Batman": "Batman",
    "Young Guns II": "Jóvenes pistoleros II",
    "Robin Hood: Prince of Thieves": "Robin Hood: Príncipe de los ladrones",
    "The Bodyguard": "El guardaespaldas",
    "Up Close & Personal": "Íntimo y personal",
    "Armageddon": "Armageddon",
    "The Prince of Egypt": "El príncipe de Egipto",
    "Wild Wild West": "Wild Wild West",
    "She's All That": "Bello aunque bello",
    "Moulin Rouge!": "Moulin Rouge",
    "Spider-Man": "Spider-Man",
    "Gangs of New York": "Gangs of New York",
    "The Lord of the Rings: The Return of the King": "El Señor de los Anillos: El retorno del Rey",
    "Once": "Once (Una vez)",
    "Slumdog Millionaire": "Slumdog Millionaire",
    "Crazy Heart": "Corazón rebelde",
    "Toy Story 3": "Toy Story 3",
    "127 Hours": "127 horas",
    "The Muppets": "Los Muppets",
    "The Great Gatsby": "El gran Gatsby",
    "The Hunger Games: Catching Fire": "Los juegos del hambre: En llamas",
    "Selma": "Selma",
    "Fifty Shades of Grey": "Cincuenta sombras de Grey",
    "La La Land": "La La Land (La ciudad de las estrellas)",
    "Suicide Squad": "Escuadrón Suicida",
    "The Greatest Showman": "El gran showman",
    "A Star Is Born": "Ha nacido una estrella",
    "Rocketman": "Rocketman",
    "Aladdin": "Aladdín",
    "The Lion King": "El Rey León",
    "Encanto": "Encanto",
    "Don't Look Up": "No mires arriba",
    "RRR": "RRR",
    "Black Panther: Wakanda Forever": "Black Panther: Wakanda Forever",
    "Top Gun: Maverick": "Top Gun: Maverick",
    "Where the Crawdads Sing": "El canto del cangrejo",
    "Barbie": "Barbie",
    "The Super Mario Bros. Movie": "Super Mario Bros: La película",
    "Sing 2": "¡Canta! 2",
    
    # CINE INFANTIL
    "Snow White and the Seven Dwarfs": "Blancanieves y los siete enanitos",
    "Pinocchio": "Pinocho",
    "Dumbo": "Dumbo",
    "Cinderella": "La Cenicienta",
    "Alice in Wonderland": "Alicia en el país de las maravillas",
    "Peter Pan": "Peter Pan",
    "Lady and the Tramp": "La dama y el vagabundo",
    "Sleeping Beauty": "La bella durmiente",
    "One Hundred and One Dalmatians": "101 dálmatas",
    "Mary Poppins": "Mary Poppins",
    "The Jungle Book": "El libro de la selva",
    "Chitty Chitty Bang Bang": "Chitty Chitty Bang Bang",
    "The Aristocats": "Los aristogatos",
    "Robin Hood": "Robin Hood",
    "The Rescuers": "Los rescatadores",
    "The Little Mermaid": "La sirenita",
    "Beauty and the Beast": "La bella y la bestia",
    "The Lion King": "El Rey León",
    "Pocahontas": "Pocahontas",
    "The Hunchback of Notre Dame": "El jorobado de Notre Dame",
    "Hercules": "Hércules",
    "Mulan": "Mulán",
    "Tarzan": "Tarzán",
    "Toy Story": "Toy Story",
    "Toy Story 2": "Toy Story 2",
    "Shrek": "Shrek",
    "Shrek 2": "Shrek 2",
    "Finding Nemo": "Buscando a Nemo",
    "Madagascar": "Madagascar",
    "Enchanted": "Encantada",
    "Wreck-It Ralph": "¡Rompe Ralph!",
    "Kung Fu Panda": "Kung Fu Panda",
    "The Princess and the Frog": "Tiana y el sapo",
    "Tangled": "Enredados",
    "Space Jam": "Space Jam",
    "Madagascar 3": "Madagascar 3",
    "Frozen": "Frozen: El reino del hielo",
    "Despicable Me 2": "Gru 2, mi villano favorito",
    "The Lego Movie": "La LEGO película",
    "Zootopia": "Zootrópolis",
    "Moana": "Vaiana",
    "Trolls": "Trolls",
    "Coco": "Coco",
    "Black Panther": "Black Panther",
    "Spider-Man: Into the Spider-Verse": "Spider-Man: Un nuevo universo",
    "Frozen II": "Frozen 2",
    "Onward": "Onward",
    "Turning Red": "Red",
    "Luca": "Luca",
    "Wish": "Wish: El poder de los deseos",
    "The Lion King (Live Action)": "El Rey León (2019)",
}

def main():
    # Cargar datos
    with open(SONGS_FILE, 'r', encoding='utf-8') as f:
        all_songs = json.load(f)
    
    with open(CINE_DATA, 'r', encoding='utf-8') as f:
        cine_data = json.load(f)
    
    with open(CINE_INFANTIL_DATA, 'r', encoding='utf-8') as f:
        infantil_data = json.load(f)
    
    # Crear mapeo de (artista, titulo) -> film traducido
    film_map = {}
    
    for song in cine_data:
        key = (song['artist'].lower(), song['title'].lower())
        film_en = song.get('film', '')
        film_es = FILM_TRANSLATIONS.get(film_en, film_en)
        film_map[key] = film_es
    
    for song in infantil_data:
        key = (song['artist'].lower(), song['title'].lower())
        film_en = song.get('film', '')
        film_es = FILM_TRANSLATIONS.get(film_en, film_en)
        film_map[key] = film_es
    
    updated = 0
    
    for song in all_songs:
        # Solo procesar canciones de Cine que no tengan film
        if 'film' in song and song['film']:
            continue
        
        styles = song.get('styles', [])
        if 'Cine' not in styles and 'Cine Infantil' not in styles:
            continue
        
        key = (song['artist'].lower(), song['title'].lower())
        
        if key in film_map and film_map[key]:
            song['film'] = film_map[key]
            print(f"  + {song['title']} -> {film_map[key]}")
            updated += 1
    
    # Guardar
    with open(SONGS_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_songs, f, ensure_ascii=False, indent=2)
    
    print(f"\n{'='*60}")
    print(f"Actualizadas {updated} canciones con campo film")

if __name__ == '__main__':
    main()
