export type MenuItemType = 'link' | 'dropdown' | 'megamenu';

export interface SubMenuItem {
  id: string;
  title: string;
  description?: string;
  path: string;
  icon?: string;
  badge?: string;
  category?: string;
  targetBlank?: boolean;
}

export interface NavMenuItem {
  id: string;
  title: string;
  path?: string;
  type: MenuItemType;
  badge?: string;
  active: boolean;
  order: number;
  megaMenuType?: 'products' | 'sectors' | 'packages' | 'custom';
  subItems?: SubMenuItem[];
  customCategories?: {
    categoryName: string;
    items: SubMenuItem[];
  }[];
}

export const DEFAULT_NAV_MENUS: NavMenuItem[] = [
  {
    id: 'menu-products',
    title: 'Özellikler',
    type: 'megamenu',
    megaMenuType: 'products',
    badge: 'Öğrenci',
    active: true,
    order: 1,
    subItems: [
      {
        id: 'sub-tahta',
        title: 'Akıllı Tahta',
        description: 'Sınıftaki tahta anında öğrenci profilinde',
        path: '/akilli-tahta',
        icon: 'Tv',
        category: 'Öğrenci Özellikleri',
      },
      {
        id: 'sub-dersler',
        title: 'Derslerim',
        description: 'İnteraktif tekrar ve tam öğrenme döngüsü',
        path: '/derslerim',
        icon: 'BookOpen',
        category: 'Öğrenci Özellikleri',
      },
      {
        id: 'sub-sinavlar',
        title: 'Sınavlarım',
        description: 'MEB zümre provaları & eksik konu analizi',
        path: '/sinavlarim',
        icon: 'Target',
        category: 'Öğrenci Özellikleri',
      },
      {
        id: 'sub-notlar',
        title: 'Notlarım & Ajanda',
        description: 'Kategorize ders notları ve çalışma takvimi',
        path: '/notlarim-ajanda',
        icon: 'FileText',
        category: 'Öğrenci Özellikleri',
      },
      {
        id: 'sub-gelisim',
        title: 'Gelişimim',
        description: 'Canlı röntgen & grafiksel karne takibi',
        path: '/gelisimim',
        icon: 'Award',
        category: 'Öğrenci Özellikleri',
      },
      {
        id: 'sub-kitaplik',
        title: 'Kitaplık',
        description: '312 MEB kitabı & interaktif flipbook',
        path: '/kitaplik',
        icon: 'Layers',
        category: 'Öğrenci Özellikleri',
      },
      {
        id: 'sub-oyunlar',
        title: 'Oyunlar',
        description: 'Eğlenerek öğrenmenin en keyifli hali',
        path: '/oyunlar',
        icon: 'Zap',
        category: 'Öğrenci Özellikleri',
      },
    ],
  },
  {
    id: 'menu-packages',
    title: 'Paketler',
    path: '/paketler',
    type: 'link',
    badge: '14 Gün Ücretsiz',
    active: true,
    order: 2,
  },
  {
    id: 'menu-sectors',
    title: 'Kademeler',
    type: 'megamenu',
    megaMenuType: 'sectors',
    active: true,
    order: 3,
    subItems: [
      { id: 'sub-ilkokul', title: 'İlkokul (1-4. Sınıf)', description: 'Okuma yazma & temel beceriler', path: '/sektorler/ilkokul', icon: 'School' },
      { id: 'sub-ortaokul', title: 'Ortaokul (5-8. Sınıf & LGS)', description: 'LGS hazırlık ve soru çözümü', path: '/sektorler/ortaokul', icon: 'Target' },
      { id: 'sub-okul', title: 'Akıllı Kampüs & LMS', description: 'K-12 okul kütük & yoklama motoru', path: '/web-site', icon: 'GraduationCap' },
      { id: 'sub-ogretmen', title: 'Öğretmen & Zümre', description: 'Ders planlama ve ortak tahta', path: '/sektorler/ogretmen-zumre', icon: 'Users' },
    ],
  },
  {
    id: 'menu-download',
    title: 'İndir',
    path: '/indir',
    type: 'link',
    badge: 'Uygulamalar',
    active: true,
    order: 4,
  },
  {
    id: 'menu-integrations',
    title: 'Entegrasyonlar',
    path: '/entegrasyonlar',
    type: 'link',
    active: true,
    order: 5,
  },
  {
    id: 'menu-about',
    title: 'Hakkımızda',
    path: '/hakkimizda',
    type: 'link',
    active: true,
    order: 6,
  },
  {
    id: 'menu-blog',
    title: 'Blog',
    path: '/blog',
    type: 'link',
    badge: 'Yeni',
    active: true,
    order: 7,
  },
];

const NAV_MENUS_STORAGE_KEY = 'oxonom_nav_menus_v5';
const NAV_MENU_EVENT = 'oxonom-nav-menus-updated';

export function getNavMenus(): NavMenuItem[] {
  if (typeof window === 'undefined') return DEFAULT_NAV_MENUS;
  try {
    const raw = localStorage.getItem(NAV_MENUS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(NAV_MENUS_STORAGE_KEY, JSON.stringify(DEFAULT_NAV_MENUS));
      return DEFAULT_NAV_MENUS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.sort((a, b) => a.order - b.order);
    }
    return DEFAULT_NAV_MENUS;
  } catch (err) {
    console.error('Failed to load nav menus:', err);
    return DEFAULT_NAV_MENUS;
  }
}

export function saveNavMenus(menus: NavMenuItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NAV_MENUS_STORAGE_KEY, JSON.stringify(menus));
    window.dispatchEvent(new Event(NAV_MENU_EVENT));
  } catch (err) {
    console.error('Failed to save nav menus:', err);
  }
}

export function resetNavMenusToDefault(): void {
  if (typeof window === 'undefined') return;
  saveNavMenus(DEFAULT_NAV_MENUS);
}

export function subscribeToNavMenuUpdates(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(NAV_MENU_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(NAV_MENU_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}
