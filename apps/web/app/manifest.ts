import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Oxonom EDU — Akıllı Okul Portalı',
    short_name: 'Oxonom EDU',
    description: 'MEB Uyumlu Dijital Okul Yönetimi, Akıllı Tahta, Ders Programı ve Öğrenci Portalı',
    start_url: '/m-login',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'window-controls-overlay'],
    background_color: '#0A0D15',
    theme_color: '#0A0D15',
    orientation: 'portrait',
    lang: 'tr',
    categories: ['education', 'productivity'],
    icons: [
      {
        src: '/pwa-icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/pwa-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
    shortcuts: [
      {
        name: 'İdare Paneli',
        short_name: 'İdare',
        description: 'Okul Yönetim Portalı',
        url: '/m-admin',
        icons: [{ src: '/pwa-icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Ders Programı',
        short_name: 'Program',
        description: 'Haftalık Ders Dağılım Çizelgesi',
        url: '/m-admin-schedule',
        icons: [{ src: '/pwa-icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Öğrenci Yönetimi',
        short_name: 'Öğrenciler',
        description: 'Öğrenci Künye ve Kayıtları',
        url: '/m-admin-students',
        icons: [{ src: '/pwa-icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Akademik Raporlar',
        short_name: 'Raporlar',
        description: 'Başarı ve Devamsızlık Analizi',
        url: '/m-admin-reports',
        icons: [{ src: '/pwa-icon-192.png', sizes: '192x192' }],
      },
    ],
  }
}
