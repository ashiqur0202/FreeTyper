import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: 'FreeTyper',
    description: siteConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#323234',
    theme_color: '#e2b714',
    icons: [
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  };
}
