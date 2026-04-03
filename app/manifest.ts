import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Lang Blog',
    short_name: 'Lang',
    description: 'Lang\'s Blog',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/favicon.ico',
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
    ],
  }
}