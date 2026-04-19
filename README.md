# MuzicDuel

Juego web para adivinar el año de lanzamiento de canciones por estilo musical.

## Características

- 🎵 **9 estilos musicales**: Rock Español, Heavy/Rock/Punk español, Pop español, Heavy metal clásico internacional, Rock clásico internacional, Pop internacional, Eurovision, Cine y Cine Infantil
- 📱 **Códigos QR**: Cada canción tiene un QR que enlaza directamente a YouTube Music
- 🎮 **Mecánica simple**: Escucha la canción, intenta adivinar el año, revela la respuesta
- 📊 **+1600 canciones** disponibles en la base de datos

## Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

## Despliegue en GitHub Pages

El proyecto está configurado para desplegarse automáticamente en GitHub Pages usando GitHub Actions.

1. Habilita GitHub Pages en la configuración del repositorio
2. Selecciona "GitHub Actions" como fuente
3. El workflow se ejecutará automáticamente en cada push a `main`

## Estructura del proyecto

```
muzicduel/
├── public/
│   └── songs.json       # Base de datos de canciones
├── src/
│   ├── app/
│   │   ├── globals.css  # Estilos globales
│   │   ├── layout.tsx   # Layout principal
│   │   └── page.tsx     # Página principal
│   ├── components/
│   │   ├── StyleSelector.tsx
│   │   └── SongPlayer.tsx
│   ├── lib/
│   │   ├── songs.ts     # Utilidades de canciones
│   │   └── qrcode.ts    # Generación de QR
│   └── types/
│       └── index.ts     # Tipos TypeScript
└── package.json
```

## Estilos musicales disponibles

| Estilo | Canciones |
|--------|-----------|
| Rock clásico internacional | 270 |
| Heavy metal clásico internacional | 260 |
| Pop internacional | 255 |
| Pop español | 241 |
| Rock Español | 233 |
| Heavy/Rock/Punk español | 212 |
| Eurovision | 79 |
| Cine | 31 |
| Cine Infantil | 26 |

## Tecnologías

- [Next.js 15](https://nextjs.org/) - Framework React
- [Tailwind CSS 4](https://tailwindcss.com/) - Estilos
- [QRCode](https://www.npmjs.com/package/qrcode) - Generación de QR
- [TypeScript](https://www.typescriptlang.org/) - Tipado

## Licencia

MIT
