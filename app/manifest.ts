import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'iVouch — JHB South Ward 23',
    short_name: 'iVouch',
    description: 'Find the help your neighbours vouched for.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F5F7FD',
    theme_color: '#2F6BFF',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  }
}
