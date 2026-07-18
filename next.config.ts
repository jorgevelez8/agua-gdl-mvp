import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El indicador de dev tools de Next.js (el círculo y su panel) no es
  // parte del diseño del producto — se apaga para que la vista local
  // coincida con lo que se ve en producción.
  devIndicators: false,
};

export default nextConfig;
