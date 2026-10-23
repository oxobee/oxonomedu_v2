export interface HeroBanner {
  id: string;
  badge: string;
  badgeIcon?: string;
  title: string;
  highlightText: string;
  description: string;
  primaryCtaText: string;
  primaryCtaUrl: string;
  secondaryCtaText: string;
  secondaryCtaUrl: string;
  imageUrl: string;
  speechBubbleText?: string;
  statsChipText?: string;
  active: boolean;
  order: number;
}

export interface ReadyBadgeIcon {
  id: string;
  name: string;
  type: 'image' | 'lucide';
  value: string;
  color?: string;
}

export const READY_BADGE_ICONS: ReadyBadgeIcon[] = [
  { id: 'trial-14', name: '14 Gün Ücretsiz', type: 'image', value: '/badge_14gun.png' },
  { id: 'mascot', name: 'Bilge Maskot', type: 'image', value: '/oxonom-mascot.png' },
  { id: 'graduation', name: 'Mezuniyet / Lisans', type: 'lucide', value: 'GraduationCap', color: '#4B075F' },
  { id: 'sparkles', name: 'Yapay Zeka / İnovasyon', type: 'lucide', value: 'Sparkles', color: '#D914C8' },
  { id: 'zap', name: 'Hızlı Okuma / Hız', type: 'lucide', value: 'Zap', color: '#B86B00' },
  { id: 'pencil', name: 'Sonsuz Beyaz Tahta', type: 'lucide', value: 'PenTool', color: '#16805D' },
  { id: 'book', name: 'Pedagojik Dersler', type: 'lucide', value: 'BookOpen', color: '#8D49A6' },
  { id: 'award', name: 'MEB Başarı / Onay', type: 'lucide', value: 'Award', color: '#F59E0B' },
  { id: 'school', name: 'Akıllı Kampüs / LMS', type: 'lucide', value: 'School', color: '#2563EB' },
  { id: 'target', name: 'LGS / YKS Hedef', type: 'lucide', value: 'Target', color: '#DC2626' },
  { id: 'shield', name: 'Güvenli e-Okul', type: 'lucide', value: 'ShieldCheck', color: '#059669' },
  { id: 'rocket', name: 'Geleceğin Eğitimi', type: 'lucide', value: 'Rocket', color: '#7C3AED' },
  { id: 'star', name: 'Yıldız / Özel', type: 'lucide', value: 'Star', color: '#F59E0B' },
  { id: 'flame', name: 'Popüler Atölye', type: 'lucide', value: 'Flame', color: '#EA580C' },
];

export interface HeroSliderSettings {
  autoPlay: boolean;
  intervalSeconds: number;
  transitionEffect: 'slide' | 'fade';
}

export const DEFAULT_HERO_BANNERS: HeroBanner[] = [
  {
    id: 'banner-1',
    badge: '14 GÜN ÜCRETSİZ DENEYİN — YENİ NESİL PLATFORM',
    badgeIcon: 'trial-14',
    title: 'Öğrenmenin',
    highlightText: 'yeni nesli.',
    description: 'Daha fazlasını keşfet, geleceğini sen tasarla. K-12 okulları, kolejler, öğretmenler ve öğrenciler için hepsi bir arada akıllı okul yönetim sistemi, canlı interaktif tahta ve MEB uyumlu pedagojik eğitim atölyeleri.',
    primaryCtaText: 'Canlı Okul Portalını Keşfet',
    primaryCtaUrl: 'https://edu.oxonom.com/login',
    secondaryCtaText: 'Modülleri & Atölyeleri İncele',
    secondaryCtaUrl: '/web-site',
    imageUrl: '/oxonom-mascot.png',
    active: true,
    order: 1,
  },
  {
    id: 'banner-2',
    badge: '0ms GECİKMELİ İNTERAKTİF TUVAL',
    badgeIcon: 'pencil',
    title: 'Fikirleri ve formülleri',
    highlightText: 'birlikte keşfedin.',
    description: 'Doğal LaTeX desteği, akıllı şekil tanıma ve geometri cetvelleriyle donatılmış sonsuz beyaz tahta. Öğretmen ve öğrenciler canlı olarak aynı tahtada soru çözer, anında PDF çıktısı alır.',
    primaryCtaText: 'Beyaz Tahtayı İncele',
    primaryCtaUrl: '/whatsapp',
    secondaryCtaText: 'Pedagojik Modüller',
    secondaryCtaUrl: '/sektorler',
    imageUrl: '/oxonom-mascot.png',
    active: true,
    order: 2,
  },
  {
    id: 'banner-3',
    badge: 'BİLİMSEL TAKİSTOSKOP METODU',
    badgeIcon: 'zap',
    title: 'Okuma hızını ve anlamayı',
    highlightText: '3 katına çıkarın.',
    description: '1 Dakikada Hızlı Okuma laboratuvarı ile MEB müfredatına uygun seviyeli metinler, kelime bloklama egzersizleri ve anlama testleri. Öğrencinin gelişim grafiğini gün gün raporlayın.',
    primaryCtaText: 'Hızlı Okuma Atölyesi',
    primaryCtaUrl: '/web-site',
    secondaryCtaText: 'Tüm Lisans Paketleri',
    secondaryCtaUrl: '/paketler',
    imageUrl: '/oxonom-mascot.png',
    active: true,
    order: 3,
  },
];

export const DEFAULT_SLIDER_SETTINGS: HeroSliderSettings = {
  autoPlay: true,
  intervalSeconds: 6,
  transitionEffect: 'slide',
};

const BANNERS_STORAGE_KEY = 'oxonom_hero_banners_v1';
const SETTINGS_STORAGE_KEY = 'oxonom_hero_slider_settings_v1';
const EVENT_NAME = 'oxonom-hero-banners-updated';

export function getHeroBanners(): HeroBanner[] {
  if (typeof window === 'undefined') return DEFAULT_HERO_BANNERS;
  try {
    const raw = localStorage.getItem(BANNERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(DEFAULT_HERO_BANNERS));
      return DEFAULT_HERO_BANNERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.sort((a, b) => a.order - b.order);
    }
    return DEFAULT_HERO_BANNERS;
  } catch (err) {
    console.error('Failed to load hero banners from localStorage:', err);
    return DEFAULT_HERO_BANNERS;
  }
}

export function saveHeroBanners(banners: HeroBanner[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(banners));
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch (err) {
    console.error('Failed to save hero banners to localStorage:', err);
  }
}

export function getHeroSliderSettings(): HeroSliderSettings {
  if (typeof window === 'undefined') return DEFAULT_SLIDER_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SLIDER_SETTINGS));
      return DEFAULT_SLIDER_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    return {
      autoPlay: typeof parsed.autoPlay === 'boolean' ? parsed.autoPlay : DEFAULT_SLIDER_SETTINGS.autoPlay,
      intervalSeconds: Number(parsed.intervalSeconds) || DEFAULT_SLIDER_SETTINGS.intervalSeconds,
      transitionEffect: parsed.transitionEffect === 'fade' ? 'fade' : 'slide',
    };
  } catch (err) {
    console.error('Failed to load hero slider settings:', err);
    return DEFAULT_SLIDER_SETTINGS;
  }
}

export function saveHeroSliderSettings(settings: HeroSliderSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch (err) {
    console.error('Failed to save hero slider settings:', err);
  }
}

export function resetHeroBannersToDefault(): void {
  if (typeof window === 'undefined') return;
  saveHeroBanners(DEFAULT_HERO_BANNERS);
  saveHeroSliderSettings(DEFAULT_SLIDER_SETTINGS);
}

export function subscribeToBannerUpdates(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener('storage', callback);
  };
}
