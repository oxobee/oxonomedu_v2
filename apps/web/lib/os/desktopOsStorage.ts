'use client'

// ── TYPES ──
export interface DesktopHeroSlide {
  id: string
  title: string
  subtitle: string
  badge?: string // e.g. "Öne Çıkan", "Yeni", "Canlı Senkronizasyon"
  webImage: string // Recommended: 1920x800 px (16:9 or 2.4:1 cinematic)
  mobileImage: string // Recommended: 800x1200 px (2:3 or 3:4 portrait)
  actionText: string // e.g. "Hemen Başlat", "Tahtayı Aç", "Dersi Başlat"
  actionLink: string // window id: 'smartboard', 'attendance', 'schedule', etc. or external url
  secondaryActionText?: string
  secondaryActionLink?: string
  order: number
  isActive: boolean
}

export type ShortcutCategory = 'core' | 'students' | 'materials' | 'assessments' | 'planning'

export interface DesktopShortcutItem {
  id: string
  title: string // e.g. "Yoklama Al"
  subtitle: string // e.g. "Sınıf e-Yoklama Girişi"
  category: ShortcutCategory
  posterImage: string // Film afişi görseli (Önerilen: 600x900 px 2:3)
  format?: 'portrait' | 'landscape' // portrait: 2:3 dikey afiş, landscape: 16:9 yatay kart
  badge?: string // e.g. "Her Ders", "Canlı Pano", "MEB E-Kitap", "Yeni"
  badgeColor?: string // Tailwind classes e.g. "bg-emerald-500 text-white"
  tagInfo?: string // e.g. "HD · 2026", "Canlı", "Tam Ekran"
  windowId: string // Window identifier to open
  order: number
  isFeatured?: boolean
}

export interface DesktopOSConfig {
  heroSlides: DesktopHeroSlide[]
  shortcuts: DesktopShortcutItem[]
  version: number
  updatedAt: string
}

// ── CATEGORY DEFINITIONS ──
export const SHORTCUT_CATEGORIES: { id: ShortcutCategory | 'all'; title: string; desc: string }[] = [
  { id: 'all', title: 'Tümü', desc: 'Tüm öğretmen araçları ve menüler' },
  { id: 'core', title: 'Hızlı İşlemler & Ders', desc: 'Günlük derste en sık kullanılan ana modüller' },
  { id: 'students', title: 'Sınıf & Öğrenci Yönetimi', desc: 'Öğrenci listesi, gelişim takibi ve rehberlik' },
  { id: 'materials', title: 'Eğitim & Dijital Materyaller', desc: 'MEB e-kitaplar, ders sunumları ve dosyalar' },
  { id: 'assessments', title: 'Ölçme & Değerlendirme', desc: 'Sınavlar, quizler, yazılı takvimi ve ödevler' },
  { id: 'planning', title: 'Planlama & Takvim', desc: 'Haftalık program, zümre ajandası ve resmi takvim' },
]

// ── CURATED POSTER PRESETS FOR SUPERADMIN ──
export const CURATED_POSTER_PRESETS = [
  {
    name: 'Öğretmen & Yoklama (Sınıf)',
    url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=900&auto=format&fit=crop&q=80',
    type: 'portrait',
  },
  {
    name: 'Akıllı Tahta & Dijital Eğitim',
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=900&auto=format&fit=crop&q=80',
    type: 'portrait',
  },
  {
    name: 'Haftalık Program & Planlama',
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=900&auto=format&fit=crop&q=80',
    type: 'portrait',
  },
  {
    name: 'Ödevler & Masaüstü Çalışma',
    url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=900&auto=format&fit=crop&q=80',
    type: 'portrait',
  },
  {
    name: 'Sınav, Quiz & Değerlendirme',
    url: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=900&auto=format&fit=crop&q=80',
    type: 'portrait',
  },
  {
    name: 'Ders Kitapları & Kütüphane',
    url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=900&auto=format&fit=crop&q=80',
    type: 'portrait',
  },
  {
    name: 'Sınıf, Öğrenciler & Grup',
    url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=900&auto=format&fit=crop&q=80',
    type: 'portrait',
  },
  {
    name: 'Dosyalar, Materyal & Arşiv',
    url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&auto=format&fit=crop&q=80',
    type: 'portrait',
  },
  {
    name: 'Başarı & Veri Analitiği',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&auto=format&fit=crop&q=80',
    type: 'portrait',
  },
  {
    name: 'Öğrenci Gelişimi & Başarı',
    url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&auto=format&fit=crop&q=80',
    type: 'portrait',
  },
  {
    name: 'Ajanda & Günlük Notlar',
    url: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=900&auto=format&fit=crop&q=80',
    type: 'portrait',
  },
  {
    name: 'Akademik Takvim & Zaman',
    url: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=900&auto=format&fit=crop&q=80',
    type: 'portrait',
  },
  {
    name: 'Öğretmen Profili & Ayarlar',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=80',
    type: 'portrait',
  },
  {
    name: 'Yatay Sinematik Tahta (Landscape)',
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1280&auto=format&fit=crop&q=80',
    type: 'landscape',
  },
  {
    name: 'Yatay Kitaplık & Müfredat (Landscape)',
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1280&auto=format&fit=crop&q=80',
    type: 'landscape',
  },
]

// ── DEFAULT INITIAL CONFIGURATION (STUNNING NETFLIX/STREAMING STYLE) ──
export const DEFAULT_DESKTOP_OS_CONFIG: DesktopOSConfig = {
  version: 2,
  updatedAt: new Date().toISOString(),
  heroSlides: [
    {
      id: 'slide-1',
      title: 'Akıllı Tahta Canlı Senkronizasyon',
      subtitle: 'Tek tıkla yoklama al, interaktif quiz ve ders materyallerini tahtaya yansıt.',
      badge: 'CANLI ETKİLEŞİM',
      webImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1920&auto=format&fit=crop&q=80',
      mobileImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
      actionText: 'Tahtaya Gönder',
      actionLink: 'smartboard',
      secondaryActionText: 'Yoklama Al',
      secondaryActionLink: 'attendance',
      order: 1,
      isActive: true,
    },
    {
      id: 'slide-2',
      title: '2026-2027 Eğitim Öğretim Yılı',
      subtitle: 'Yeni nesil MEB müfredat kitapları, zümre planları ve dijital ders akışları hazır.',
      badge: 'YENİ SEZON',
      webImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&auto=format&fit=crop&q=80',
      mobileImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
      actionText: 'Ders Programı',
      actionLink: 'schedule',
      secondaryActionText: 'Ders Kitapları',
      secondaryActionLink: 'courses',
      order: 2,
      isActive: true,
    },
    {
      id: 'slide-3',
      title: 'İnteraktif Sınav & Soru Bankası',
      subtitle: 'Boşluk doldurma, çoktan seçmeli ve eşleştirme sorularını anında sınıfa uygula.',
      badge: 'ÖLÇME & DEĞERLENDİRME',
      webImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1920&auto=format&fit=crop&q=80',
      mobileImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
      actionText: 'Sınav Hazırla',
      actionLink: 'assessments',
      secondaryActionText: 'Ödev Ver',
      secondaryActionLink: 'assignments',
      order: 3,
      isActive: true,
    },
  ],
  shortcuts: [
    // ── CORE (Hızlı İşlemler & Ders) ──
    {
      id: 'attendance',
      title: 'Yoklama Al',
      subtitle: 'Sınıf e-Yoklama Girişi',
      category: 'core',
      posterImage: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80',
      format: 'portrait',
      badge: 'HER DERS',
      badgeColor: 'bg-emerald-500 text-white',
      tagInfo: 'HD · Canlı',
      windowId: 'attendance',
      order: 1,
      isFeatured: true,
    },
    {
      id: 'smartboard',
      title: 'Akıllı Tahta',
      subtitle: 'Tahtaya Gönder & Canlı Pano',
      category: 'core',
      posterImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
      format: 'portrait',
      badge: 'CANLI PANO',
      badgeColor: 'bg-cyan-500 text-white',
      tagInfo: '4K · Senkron',
      windowId: 'smartboard',
      order: 2,
      isFeatured: true,
    },
    {
      id: 'schedule',
      title: 'Ders Programı',
      subtitle: 'Haftalık & Günlük Saatler',
      category: 'core',
      posterImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
      format: 'portrait',
      badge: 'BUGÜN 6 DERS',
      badgeColor: 'bg-indigo-500 text-white',
      tagInfo: 'Aktif',
      windowId: 'schedule',
      order: 3,
      isFeatured: true,
    },
    {
      id: 'assignments',
      title: 'Ödevler & Takip',
      subtitle: 'Ödev Gönder & İncele',
      category: 'core',
      posterImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80',
      format: 'portrait',
      badge: 'ÖDEV VER',
      badgeColor: 'bg-amber-500 text-white',
      tagInfo: 'Online',
      windowId: 'assignments',
      order: 4,
      isFeatured: true,
    },

    // ── STUDENTS (Sınıf & Öğrenci Yönetimi) ──
    {
      id: 'classes',
      title: 'Sınıf & Öğrenciler',
      subtitle: 'Öğrenci Listesi & Veli İletişimi',
      category: 'students',
      posterImage: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80',
      format: 'portrait',
      badge: 'REHBERLİK',
      badgeColor: 'bg-teal-500 text-white',
      tagInfo: '32 Öğrenci',
      windowId: 'classes',
      order: 5,
    },
    {
      id: 'progress',
      title: 'Öğrenci Gelişimi',
      subtitle: 'Akademik İlerleme & Takip',
      category: 'students',
      posterImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80',
      format: 'portrait',
      badge: 'GELİŞİM',
      badgeColor: 'bg-amber-600 text-white',
      tagInfo: 'Analitik',
      windowId: 'progress',
      order: 6,
    },
    {
      id: 'reports',
      title: 'Başarı & Raporlar',
      subtitle: 'Sınıf Ortalamaları & Grafikler',
      category: 'students',
      posterImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
      format: 'portrait',
      badge: 'GRAFİK',
      badgeColor: 'bg-violet-500 text-white',
      tagInfo: 'Detaylı',
      windowId: 'reports',
      order: 7,
    },

    // ── MATERIALS (Eğitim Materyalleri & Kütüphane) ──
    {
      id: 'courses',
      title: 'MEB Ders Kitapları',
      subtitle: 'Müfredat E-Kitapları ve PDF Okuyucu',
      category: 'materials',
      posterImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80',
      format: 'landscape',
      badge: 'MEB E-KİTAP',
      badgeColor: 'bg-emerald-600 text-white',
      tagInfo: 'Müfredat · 2026',
      windowId: 'courses',
      order: 8,
    },
    {
      id: 'files',
      title: 'Dosyalar & Materyal',
      subtitle: 'Tahta Çıktıları, Sunumlar ve PDF Arşivi',
      category: 'materials',
      posterImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
      format: 'landscape',
      badge: 'KÜTÜPHANE',
      badgeColor: 'bg-sky-500 text-white',
      tagInfo: 'Depolama',
      windowId: 'files',
      order: 9,
    },

    // ── ASSESSMENTS (Ölçme, Değerlendirme & Sınavlar) ──
    {
      id: 'assessments',
      title: 'Sınav & Quiz',
      subtitle: 'Soru Bankası & İnteraktif Yazılılar',
      category: 'assessments',
      posterImage: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&auto=format&fit=crop&q=80',
      format: 'portrait',
      badge: 'YAZILI TAKVİMİ',
      badgeColor: 'bg-rose-500 text-white',
      tagInfo: 'Pano Sınavı',
      windowId: 'assessments',
      order: 10,
    },

    // ── PLANNING (Planlama & Takvim) ──
    {
      id: 'agenda',
      title: 'Ajanda & Notlar',
      subtitle: 'Ders Notu & Zümre Takvimi',
      category: 'planning',
      posterImage: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&auto=format&fit=crop&q=80',
      format: 'portrait',
      badge: 'PLANLARIM',
      badgeColor: 'bg-purple-500 text-white',
      tagInfo: 'Not Defteri',
      windowId: 'agenda',
      order: 11,
    },
    {
      id: 'academicCalendar',
      title: 'Akademik Takvim',
      subtitle: 'MEB Çalışma ve Tatil Takvimi',
      category: 'planning',
      posterImage: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=800&auto=format&fit=crop&q=80',
      format: 'portrait',
      badge: '2026-2027',
      badgeColor: 'bg-blue-600 text-white',
      tagInfo: 'MEB Resmi',
      windowId: 'academicCalendar',
      order: 12,
    },
    {
      id: 'settings',
      title: 'Profil & Ayarlar',
      subtitle: 'Öğretmen Bilgileri & Hesap Güvenliği',
      category: 'planning',
      posterImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
      format: 'portrait',
      badge: 'AYARLAR',
      badgeColor: 'bg-gray-500 text-white',
      tagInfo: 'Sistem',
      windowId: 'settings',
      order: 13,
    },
  ],
}

const STORAGE_KEY = 'oxonom_desktop_os_config_v2'

// ── GET CONFIG ──
export function getDesktopOSConfig(): DesktopOSConfig {
  if (typeof window === 'undefined') {
    return DEFAULT_DESKTOP_OS_CONFIG
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_DESKTOP_OS_CONFIG
    const parsed = JSON.parse(raw)
    // Validate shape
    if (parsed && Array.isArray(parsed.shortcuts) && Array.isArray(parsed.heroSlides)) {
      return parsed
    }
  } catch (err) {
    console.error('Failed to parse desktop OS config:', err)
  }
  return DEFAULT_DESKTOP_OS_CONFIG
}

// ── SAVE CONFIG ──
export function saveDesktopOSConfig(config: DesktopOSConfig): void {
  if (typeof window === 'undefined') return
  try {
    const payload = {
      ...config,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    // Trigger cross-component and cross-tab update event
    window.dispatchEvent(new CustomEvent('oxonom-os-config-updated', { detail: payload }))
  } catch (err) {
    console.error('Failed to save desktop OS config:', err)
  }
}

// ── RESET TO DEFAULTS ──
export function resetDesktopOSConfig(): DesktopOSConfig {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY)
      window.dispatchEvent(new CustomEvent('oxonom-os-config-updated', { detail: DEFAULT_DESKTOP_OS_CONFIG }))
    } catch (_) {}
  }
  return DEFAULT_DESKTOP_OS_CONFIG
}
