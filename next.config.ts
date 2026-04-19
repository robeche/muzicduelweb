/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Ajustar basePath según el nombre del repositorio en GitHub Pages
  // Para repositorios con nombre de usuario (username.github.io), dejar vacío
  // Para repositorios de proyecto, usar '/nombre-repositorio'
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH ? `${process.env.NEXT_PUBLIC_BASE_PATH}/` : '',
};

export default nextConfig;
