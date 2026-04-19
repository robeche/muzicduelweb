"""
Script para añadir el campo 'film' a las canciones de Cine/Cine Infantil
con el título en castellano de España, y corregir los artistas
"""

import json
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SONGS_FILE = os.path.join(SCRIPT_DIR, '../public/songs.json')

# Diccionario de traducción de películas (inglés -> castellano España)
FILM_TRANSLATIONS = {
    # CINE - Clásicos
    "Rocky": "Rocky",
    "Saturday Night Fever": "Fiebre del sábado noche",
    "Grease": "Grease (Brillantina)",
    "Flashdance": "Flashdance",
    "Footloose": "Footloose",
    "Back to the Future": "Regreso al futuro",
    "Top Gun": "Top Gun (Ídolos del aire)",
    "Dirty Dancing": "Dirty Dancing",
    "Ghost": "Ghost (Más allá del amor)",
    "Philadelphia": "Philadelphia",
    "Batman Forever": "Batman Forever",
    "Dangerous Minds": "Mentes peligrosas",
    "Titanic": "Titanic",
    "Men in Black": "Men in Black (Hombres de negro)",
    "City of Angels": "City of Angels (Un ángel enamorado)",
    "8 Mile": "8 Millas",
    "Skyfall": "Skyfall",
    "Despicable Me 2": "Gru 2, mi villano favorito",
    "Furious 7": "Fast & Furious 7",
    "Spectre": "Spectre",
    "The Greatest Showman": "El gran showman",
    "A Star Is Born": "Ha nacido una estrella",
    "Bohemian Rhapsody": "Bohemian Rhapsody",
    "No Time to Die": "Sin tiempo para morir",
    
    # CINE - Añadidas nuevas
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
    "Fame": "Fama",
    "American Gigolo": "American Gigolo",
    "9 to 5": "Cómo eliminar a su jefe",
    "Arthur": "Arthur, el soltero de oro",
    "For Your Eyes Only": "Sólo para sus ojos",
    "Against All Odds": "Contra todo riesgo",
    "Ghostbusters": "Los cazafantasmas",
    "Purple Rain": "Purple Rain",
    "The NeverEnding Story": "La historia interminable",
    "The Breakfast Club": "El club de los cinco",
    "Mad Max Beyond Thunderdome": "Mad Max: Más allá de la cúpula del trueno",
    "St. Elmo's Fire": "El fuego de San Elmo",
    "Beverly Hills Cop": "Bev Hills Cop (Buscando un diamante en bruto)",
    "The Karate Kid Part II": "Karate Kid II",
    "La Bamba": "La Bamba",
    "Cocktail": "Cocktail",
    "Batman": "Batman",
    "Young Guns II": "Jóvenes pistoleros II",
    "Robin Hood: Prince of Thieves": "Robin Hood, príncipe de los ladrones",
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
    "Once": "Once",
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
    "Rocketman": "Rocketman",
    "Aladdin": "Aladdin",
    "The Lion King": "El Rey León",
    "Don't Look Up": "No mires arriba",
    "RRR": "RRR",
    "Black Panther: Wakanda Forever": "Black Panther: Wakanda Forever",
    "Top Gun: Maverick": "Top Gun: Maverick",
    "Where the Crawdads Sing": "El canto del cangrejo",
    "Barbie": "Barbie",
    "The Super Mario Bros. Movie": "Super Mario Bros: La película",
    "Sing 2": "¡Canta! 2",
    "Encanto": "Encanto",
    
    # CINE INFANTIL - Disney clásico
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
    
    # CINE INFANTIL - Renacimiento Disney
    "The Little Mermaid": "La sirenita",
    "Beauty and the Beast": "La bella y la bestia",
    "Aladdin": "Aladdín",
    "The Lion King": "El Rey León",
    "Pocahontas": "Pocahontas",
    "The Hunchback of Notre Dame": "El jorobado de Notre Dame",
    "Hercules": "Hércules",
    "Mulan": "Mulán",
    "Tarzan": "Tarzán",
    "Toy Story": "Toy Story",
    "Toy Story 2": "Toy Story 2",
    
    # CINE INFANTIL - Pixar/DreamWorks/Modern
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
    
    # CINE INFANTIL - Era moderna
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
    
    # La Sirenita y otras ya existentes
    "La Sirenita": "La sirenita",
    "La Bella y la Bestia": "La bella y la bestia",
    "El Rey León": "El Rey León",
    "Hércules": "Hércules",
    "Enredados": "Enredados",
}

# Mapeo de canciones a sus verdaderos artistas (para corregir las que tienen película como artista)
SONG_CORRECTIONS = {
    # Rocky
    ("Gonna Fly Now (Theme From \"Rocky\")", "Rocky"): ("Bill Conti", "Rocky"),
    # Saturday Night Fever
    ("Stayin' Alive (From \"Saturday Night Fever\" Soundtrack)", "Saturday Night Fever"): ("Bee Gees", "Fiebre del sábado noche"),
    # Grease
    ('Summer Nights (From "Grease")', "Grease"): ("John Travolta & Olivia Newton-John", "Grease (Brillantina)"),
    ('You\'re The One That I Want (From "Grease")', "Grease"): ("John Travolta & Olivia Newton-John", "Grease (Brillantina)"),
    # Rocky III
    ("Eye of the Tiger", "Rocky III"): ("Survivor", "Rocky III"),
    # Flashdance
    ("Flashdance... What a Feeling (Radio Mix)", "Flashdance"): ("Irene Cara", "Flashdance"),
    # Footloose
    ("Footloose (From \"Footloose\" Soundtrack)", "Footloose"): ("Kenny Loggins", "Footloose"),
    # Back to the Future
    ("Power of Love", "Back to the Future"): ("Huey Lewis and the News", "Regreso al futuro"),
    # Top Gun
    ("Take My Breath Away (Love Theme from \"Top Gun\")", "Top Gun"): ("Berlin", "Top Gun (Ídolos del aire)"),
    ("Danger Zone (From \"Top Gun\" Original Soundtrack)", "Top Gun"): ("Kenny Loggins", "Top Gun (Ídolos del aire)"),
    # Dirty Dancing
    ("(I've Had) The Time Of My Life (From \"Dirty Dancing\" Soundtrack)", "Dirty Dancing"): ("Bill Medley & Jennifer Warnes", "Dirty Dancing"),
    ("She's Like the Wind (From \"Dirty Dancing\" Soundtrack) (feat. Wendy Fraser)", "Dirty Dancing"): ("Patrick Swayze", "Dirty Dancing"),
    ("Hungry Eyes (From \"Dirty Dancing\" Soundtrack)", "Dirty Dancing"): ("Eric Carmen", "Dirty Dancing"),
    # Ghost
    ("Unchained Melody", "Ghost"): ("The Righteous Brothers", "Ghost (Más allá del amor)"),
    # Philadelphia
    ("Streets of Philadelphia", "Philadelphia"): ("Bruce Springsteen", "Philadelphia"),
    # Batman Forever
    ("Kiss from a Rose", "Batman Forever"): ("Seal", "Batman Forever"),
    # Dangerous Minds
    ("Gangsta's Paradise", "Dangerous Minds"): ("Coolio feat. L.V.", "Mentes peligrosas"),
    # Titanic
    ("My Heart Will Go On (Love Theme from \"Titanic\")", "Titanic"): ("Celine Dion", "Titanic"),
    # Men in Black
    ("Men In Black (From \"Men In Black\" Soundtrack)", "Men in Black"): ("Will Smith", "Men in Black (Hombres de negro)"),
    # City of Angels
    ("Iris", "City of Angels"): ("Goo Goo Dolls", "City of Angels (Un ángel enamorado)"),
    # 8 Mile
    ("Lose Yourself", "8 Mile"): ("Eminem", "8 Millas"),
    # Skyfall
    ("Skyfall", "Skyfall"): ("Adele", "Skyfall"),
    # Despicable Me 2
    ("Happy (From \"Despicable Me 2\")", "Despicable Me 2"): ("Pharrell Williams", "Gru 2, mi villano favorito"),
    # Furious 7
    ("See You Again (feat. Charlie Puth)", "Furious 7"): ("Wiz Khalifa feat. Charlie Puth", "Fast & Furious 7"),
    # Spectre
    ("Writing's On The Wall (From \"Spectre\" Soundtrack)", "Spectre"): ("Sam Smith", "Spectre"),
    # The Greatest Showman
    ("This Is Me", "The Greatest Showman"): ("Keala Settle", "El gran showman"),
    ("A Million Dreams", "The Greatest Showman"): ("Ziv Zaifman, Hugh Jackman & Michelle Williams", "El gran showman"),
    ("Rewrite The Stars", "The Greatest Showman"): ("Zac Efron & Zendaya", "El gran showman"),
    # A Star Is Born
    ("Shallow", "A Star Is Born"): ("Lady Gaga & Bradley Cooper", "Ha nacido una estrella"),
    # Bohemian Rhapsody
    ("Bohemian Rhapsody", "Bohemian Rhapsody"): ("Queen", "Bohemian Rhapsody"),
    # No Time to Die
    ("No Time To Die", "No Time to Die"): ("Billie Eilish", "Sin tiempo para morir"),
    
    # CINE INFANTIL - La Sirenita
    ("Under the Sea", "La Sirenita"): ("Samuel E. Wright", "La sirenita"),
    ("Part of Your World", "La Sirenita"): ("Jodi Benson", "La sirenita"),
    # La Bella y la Bestia
    ("Beauty and the Beast (from the Soundtrack \"Beauty and the Beast\")", "La Bella y la Bestia"): ("Celine Dion & Peabo Bryson", "La bella y la bestia"),
    # Aladdin
    ("A Whole New World (Aladdin's Theme)", "Aladdin"): ("Brad Kane & Lea Salonga", "Aladdín"),
    # El Rey León
    ("Circle of Life (From \"The Lion King\"/Soundtrack Version)", "El Rey León"): ("Carmen Twillie", "El Rey León"),
    ("Hakuna Matata (From \"The Lion King\" Soundtrack)", "El Rey León"): ("Nathan Lane, Ernie Sabella & Jason Weaver", "El Rey León"),
    ("Can You Feel the Love Tonight (End Title/ From \"The Lion King\"/Soundtrack Version)", "El Rey León"): ("Elton John", "El Rey León"),
    # Toy Story
    ("You've Got a Friend in Me", "Toy Story"): ("Randy Newman", "Toy Story"),
    # Pocahontas
    ("Colors of the Wind (End Title)", "Pocahontas"): ("Vanessa Williams", "Pocahontas"),
    # Hércules
    ("Go the Distance", "Hércules"): ("Roger Bart", "Hércules"),
    # Mulan
    ("Reflection (2020) (From \"Mulan\")", "Mulan"): ("Christina Aguilera", "Mulán"),
    # Toy Story 2
    ("When She Loved Me", "Toy Story 2"): ("Sarah McLachlan", "Toy Story 2"),
    # Shrek
    ("I'm A Believer", "Shrek"): ("Smash Mouth", "Shrek"),
    ("All Star", "Shrek"): ("Smash Mouth", "Shrek"),
    # Enredados
    ("I See the Light (From \"Tangled\" / Soundtrack Version)", "Enredados"): ("Mandy Moore & Zachary Levi", "Enredados"),
    # Frozen
    ("Let It Go (From \"Frozen\"/Soundtrack Version)", "Frozen"): ("Idina Menzel", "Frozen: El reino del hielo"),
    ("Do You Want to Build a Snowman? (From \"Frozen\"/Soundtrack Version)", "Frozen"): ("Kristen Bell", "Frozen: El reino del hielo"),
    # The Lego Movie
    ("Everything Is AWESOME!!! (feat. The Lonely Island)", "The Lego Movie"): ("Tegan and Sara", "La LEGO película"),
    # Moana
    ("How Far I'll Go", "Moana"): ("Auli'i Cravalho", "Vaiana"),
    ("You're Welcome", "Moana"): ("Dwayne Johnson", "Vaiana"),
    # Trolls
    ("CAN'T STOP THE FEELING! (from DreamWorks Animation's \"TROLLS\")", "Trolls"): ("Justin Timberlake", "Trolls"),
    # Coco
    ("Remember Me (Dúo) (feat. Natalia Lafourcade)", "Coco"): ("Miguel feat. Natalia Lafourcade", "Coco"),
    ("Un Poco Loco", "Coco"): ("Anthony Gonzalez & Gael García Bernal", "Coco"),
    # Frozen II
    ("Into the Unknown", "Frozen II"): ("Idina Menzel & AURORA", "Frozen 2"),
    # Encanto
    ("We Don't Talk About Bruno", "Encanto"): ("Carolina Gaitán & Mauro Castillo & otros", "Encanto"),
    ("Surface Pressure", "Encanto"): ("Jessica Darrow", "Encanto"),
}

def get_film_from_title(title):
    """Intenta extraer el nombre de la película del título de la canción"""
    import re
    # Buscar patrones como (From "Movie"), (from "Movie"), From "Movie"
    patterns = [
        r'\(From "([^"]+)"\)',
        r'\(from "([^"]+)"\)',
        r'From "([^"]+)"',
        r'\(From "([^"]+)" Soundtrack\)',
        r'\(From "([^"]+)"/Soundtrack',
        r'\(from ([^)]+)\)',
    ]
    for pattern in patterns:
        match = re.search(pattern, title, re.IGNORECASE)
        if match:
            return match.group(1)
    return None

def main():
    # Cargar songs.json
    with open(SONGS_FILE, 'r', encoding='utf-8') as f:
        all_songs = json.load(f)
    
    updated = 0
    
    for song in all_songs:
        styles = song.get('styles', [])
        has_cine = 'Cine' in styles or 'Cine Infantil' in styles
        
        if not has_cine:
            continue
        
        title = song['title']
        artist = song['artist']
        key = (title, artist)
        
        # Buscar si hay corrección para esta canción
        if key in SONG_CORRECTIONS:
            new_artist, film_es = SONG_CORRECTIONS[key]
            song['artist'] = new_artist
            song['film'] = film_es
            print(f"  ✓ Corregido: {title}")
            print(f"    Artista: {artist} -> {new_artist}")
            print(f"    Película: {film_es}")
            updated += 1
        else:
            # Intentar encontrar la película en FILM_TRANSLATIONS
            # Primero buscar si el artist es el nombre de la película
            if artist in FILM_TRANSLATIONS:
                song['film'] = FILM_TRANSLATIONS[artist]
                print(f"  + Añadido film: {title} -> {song['film']}")
                updated += 1
            else:
                # Intentar extraer del título
                film_en = get_film_from_title(title)
                if film_en and film_en in FILM_TRANSLATIONS:
                    song['film'] = FILM_TRANSLATIONS[film_en]
                    print(f"  + Extraído film: {title} -> {song['film']}")
                    updated += 1
                elif film_en:
                    # Usar el nombre en inglés si no hay traducción
                    song['film'] = film_en
                    print(f"  ? Sin traducción: {title} -> {film_en}")
                    updated += 1
    
    # Guardar
    with open(SONGS_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_songs, f, ensure_ascii=False, indent=2)
    
    print(f"\n{'='*60}")
    print(f"Actualizadas {updated} canciones")

if __name__ == '__main__':
    main()

