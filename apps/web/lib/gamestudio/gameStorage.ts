// apps/web/lib/gamestudio/gameStorage.ts
'use client'

export interface EducationalGame {
  id: string
  title: string
  slug: string
  coverImage: string
  bannerImage?: string
  description: string
  shortDescription: string
  category: 'Matematik' | 'Fen Bilimleri' | 'Türkçe' | 'Yabancı Dil' | 'Bilişim & Kodlama' | 'Sosyal Bilgiler' | 'Zeka & Mantık'
  gameType: '2D Arcade' | 'Bulmaca' | 'Strateji' | 'Simülasyon' | 'Macera' | 'Hızlı Refleks'
  targetGrades: string[] // e.g. ['Okul Öncesi', '1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf', '9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf']
  subjects: string[] // e.g. ['Matematik', 'Geometri']
  topics: string[] // e.g. ['Dört İşlem', 'Kesirler', 'Problem Çözme']
  ageRange: string // e.g. '7 - 11 Yaş'
  difficulty: 'Başlangıç' | 'Orta' | 'İleri' | 'Dinamik Adaptif'
  rating: number // e.g. 4.9
  reviewCount: number
  playsCount: number
  isActive: boolean // Superadmin global status
  gameUrl: string // Launch / play URL
  learningObjectives: string[]
  badge?: string // e.g. 'Editörün Seçimi', 'Yeni', 'Popüler'
  developer: string
  version: string
  createdAt: string
  updatedAt: string
}

export interface PrincipalGameConfig {
  gameId: string
  schoolActive: boolean
  assignedGrades: string[] // e.g. ['5. Sınıf', '9-A', 'Tüm Sınıflar']
}

export const ALL_GRADE_OPTIONS = [
  'Okul Öncesi',
  '1. Sınıf',
  '2. Sınıf',
  '3. Sınıf',
  '4. Sınıf',
  '5. Sınıf',
  '6. Sınıf',
  '7. Sınıf',
  '8. Sınıf',
  '9. Sınıf',
  '10. Sınıf',
  '11. Sınıf',
  '12. Sınıf',
]

export const ALL_SUBJECT_OPTIONS = [
  'Matematik',
  'Fen Bilimleri',
  'Türkçe',
  'İngilizce',
  'Bilişim & Kodlama',
  'Sosyal Bilgiler',
  'Tarih',
  'Coğrafya',
  'Fizik',
  'Kimya',
  'Biyoloji',
  'Mantık & Zeka',
]

export const ALL_CATEGORIES = [
  'Matematik',
  'Fen Bilimleri',
  'Türkçe',
  'Yabancı Dil',
  'Bilişim & Kodlama',
  'Sosyal Bilgiler',
  'Zeka & Mantık',
] as const

export const DEFAULT_GAMES: EducationalGame[] = [
  {
    id: 'game-math-champion',
    title: 'Oxonom Matematik Şampiyonu: Sayı Avcıları',
    slug: 'matematik-sampiyonu',
    coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=1600&q=80',
    description: 'Eğlenceli uzay macerasında asteroitleri doğru matematik formülleri ve hızlı zihinsel işlemlerle parçala. Oyuncular işlem hızını artırırken analitik düşünme yetilerini güçlendirir.',
    shortDescription: 'Uzay arenasında zihinsel matematik ve hızlı işlem turnuvası.',
    category: 'Matematik',
    gameType: '2D Arcade',
    targetGrades: ['3. Sınıf', '4. Sınıf', '5. Sınıf', '6. Sınıf', '7. Sınıf'],
    subjects: ['Matematik'],
    topics: ['Dört İşlem', 'Kesirler', 'Çarpım Tablosu', 'Zihinden Hesap'],
    ageRange: '8 - 14 Yaş',
    difficulty: 'Dinamik Adaptif',
    rating: 4.9,
    reviewCount: 342,
    playsCount: 14820,
    isActive: true,
    gameUrl: '/student/gamestudio/play/game-math-champion',
    learningObjectives: [
      'Zihinden dört işlem yapabilme refleksini 2 kat hızlandırma',
      'Kesirli ve ondalık sayılar arasında mantıksal bağlantı kurma',
      'Zaman kısıtı altında stratejik karar verme yeteneği',
    ],
    badge: 'Editörün Seçimi',
    developer: 'Oxonom Game Studio',
    version: '1.4.0',
    createdAt: '2026-09-15',
    updatedAt: '2026-10-20',
  },
  {
    id: 'game-science-galaxy',
    title: 'Uzay Laboratuvarı: Elementler & Evren',
    slug: 'uzay-laboratuvari',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1600&q=80',
    description: 'Mikro alemden makro evrene uzanan interaktif bilim simülasyonu. Periyodik tablodaki atomları birleştir, kimyasal bileşikleri keşfet ve yerçekimi yasalarını test et.',
    shortDescription: 'Elementleri birleştir, kimyasal bağlar kur ve gezegenleri keşfet.',
    category: 'Fen Bilimleri',
    gameType: 'Simülasyon',
    targetGrades: ['6. Sınıf', '7. Sınıf', '8. Sınıf', '9. Sınıf', '10. Sınıf'],
    subjects: ['Fen Bilimleri', 'Fizik', 'Kimya'],
    topics: ['Atomun Yapısı', 'Periyodik Sistem', 'Kuvvet ve Hareket', 'Güneş Sistemi'],
    ageRange: '11 - 16 Yaş',
    difficulty: 'Orta',
    rating: 4.8,
    reviewCount: 289,
    playsCount: 9430,
    isActive: true,
    gameUrl: '/student/gamestudio/play/game-science-galaxy',
    learningObjectives: [
      'Kimyasal bağların oluşum mekanizmasını görselleştirme',
      'Yerçekimi ve kütle çekim yasalarının etkileşimini kavrama',
      'Bilimsel sorgulama ve hipotez kurma becerisi geliştirme',
    ],
    badge: 'Popüler',
    developer: 'Oxonom STEM Labs',
    version: '2.1.0',
    createdAt: '2026-08-10',
    updatedAt: '2026-10-18',
  },
  {
    id: 'game-code-quest',
    title: 'Siber Labirent: Algoritma & Python Görevi',
    slug: 'siber-labirent-kodlama',
    coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=80',
    description: 'Görsel bloklardan gerçek Python kod bloklarına geçiş yapan eğitici bulmaca oyunu. Siber güvenlik robotunu labirentten çıkarmak için döngüleri, şart bloklarını ve fonksiyonları kullan.',
    shortDescription: 'Blok ve metin tabanlı kodlama ile robotunu siber labirentten çıkar.',
    category: 'Bilişim & Kodlama',
    gameType: 'Bulmaca',
    targetGrades: ['4. Sınıf', '5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf', '9. Sınıf'],
    subjects: ['Bilişim & Kodlama'],
    topics: ['Algoritmik Düşünme', 'Döngüler (Loops)', 'Koşullu İfadeler (If/Else)', 'Değişkenler'],
    ageRange: '9 - 16 Yaş',
    difficulty: 'Dinamik Adaptif',
    rating: 4.95,
    reviewCount: 512,
    playsCount: 21300,
    isActive: true,
    gameUrl: '/student/gamestudio/play/game-code-quest',
    learningObjectives: [
      'Problem parçalama ve algoritmik akış oluşturma',
      'Mantıksal hata (bug) ayıklama becerisi kazanma',
      'Hesaplamalı düşünme vizyonunu pekiştirme',
    ],
    badge: 'Trend #1',
    developer: 'Oxonom AI & Code',
    version: '3.0.2',
    createdAt: '2026-07-20',
    updatedAt: '2026-10-19',
  },
  {
    id: 'game-word-voyager',
    title: 'Kelime Gezgini: Edebiyat & Türkçe Krallığı',
    slug: 'kelime-gezgini',
    coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1600&q=80',
    description: 'Türkçenin zengin söz dağarcığını, atasözlerini, deyimleri ve imla kurallarını keşfedeceğin büyülü bir macera. Karakterini geliştirmek için anagramları çöz ve eksik harfleri tamamla.',
    shortDescription: 'Sözcük avı, deyimler ve dil bilgisi bulmacalarıyla kelime dağarcığını katla.',
    category: 'Türkçe',
    gameType: 'Bulmaca',
    targetGrades: ['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf'],
    subjects: ['Türkçe'],
    topics: ['Sözcükte Anlam', 'Eş Anlamlı / Zıt Anlamlılar', 'Yazım Kuralları', 'Deyimler'],
    ageRange: '7 - 12 Yaş',
    difficulty: 'Kolay',
    rating: 4.75,
    reviewCount: 198,
    playsCount: 8120,
    isActive: true,
    gameUrl: '/student/gamestudio/play/game-word-voyager',
    learningObjectives: [
      'Kelime dağarcığını %40 oranında genişletme',
      'Hızlı okuma ve metin kavrama reflekslerini geliştirme',
      'Doğru yazım ve noktalama kurallarını pekiştirme',
    ],
    badge: 'Yeni',
    developer: 'Oxonom Dil Enstitüsü',
    version: '1.2.0',
    createdAt: '2026-10-01',
    updatedAt: '2026-10-15',
  },
  {
    id: 'game-lingua-island',
    title: 'Lingua Island: English Speaking & Vocab Safari',
    slug: 'lingua-island-english',
    coverImage: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80',
    description: 'Adadaki sevimli hayvan rehberlerle interaktif İngilizce diyaloglar kur, kelime safari görevlerini tamamla ve telaffuzunu yapay zekâ ses analiziyle puanla.',
    shortDescription: 'Yapay zekâ ses motoruyla eğlenceli İngilizce kelime ve konuşma safarisi.',
    category: 'Yabancı Dil',
    gameType: 'Macera',
    targetGrades: ['2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf'],
    subjects: ['İngilizce'],
    topics: ['Günlük Konuşmalar', 'A1-B1 Kelime Haznesi', 'Dinleme & Telaffuz', 'Gramer Oyunları'],
    ageRange: '8 - 15 Yaş',
    difficulty: 'Dinamik Adaptif',
    rating: 4.88,
    reviewCount: 420,
    playsCount: 16750,
    isActive: true,
    gameUrl: '/student/gamestudio/play/game-lingua-island',
    learningObjectives: [
      'İngilizce konuşma özgüvenini artırma',
      '500+ temel kelimeyi işitsel ve görsel hafızaya kalıcı kaydetme',
      'Aksan ve telaffuz netliğini anlık geri bildirimle iyileştirme',
    ],
    badge: 'Çok Sevilen',
    developer: 'Oxonom Global English',
    version: '2.0.4',
    createdAt: '2026-09-05',
    updatedAt: '2026-10-16',
  },
  {
    id: 'game-history-chronos',
    title: 'Zaman Çarkı: Tarih & Medeniyetler Stratejisi',
    slug: 'zaman-carki-tarih',
    coverImage: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=1600&q=80',
    description: 'İlk Çağ medeniyetlerinden Cumhuriyet dönemine kadar uzanan stratejik zaman yolculuğu. Tarihi olayları kronolojik sıraya diz, medeniyetlerin icatlarını keşfet ve tarihi simülasyonları yönet.',
    shortDescription: 'Tarihi çağlar boyunca medeniyet kur, kronolojik bulmacaları çöz.',
    category: 'Sosyal Bilgiler',
    gameType: 'Strateji',
    targetGrades: ['5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf', '9. Sınıf', '10. Sınıf', '11. Sınıf'],
    subjects: ['Sosyal Bilgiler', 'Tarih'],
    topics: ['İlk Çağ Uygarlıkları', 'Türk Tarihi', 'Cumhuriyet Dönemi', 'Kültür ve Miras'],
    ageRange: '10 - 17 Yaş',
    difficulty: 'Orta',
    rating: 4.82,
    reviewCount: 165,
    playsCount: 6540,
    isActive: true,
    gameUrl: '/student/gamestudio/play/game-history-chronos',
    learningObjectives: [
      'Tarihsel kronoloji ve neden-sonuç ilişkilerini çözümleme',
      'Kültürel miras bilincini interaktif hikâyelerle pekiştirme',
      'Harita ve coğrafi mekân algısını geliştirme',
    ],
    badge: 'Strateji',
    developer: 'Oxonom Tarih & Kültür Lab',
    version: '1.1.0',
    createdAt: '2026-08-28',
    updatedAt: '2026-10-10',
  },
  {
    id: 'game-brain-matrix',
    title: 'NöroMatris: Hafıza, Dikkat & Zeka Akıl Oyunları',
    slug: 'noromatris-zeka-oyunlari',
    coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80',
    description: 'Bilişsel esneklik, uzamsal zeka, görsel hafıza ve odaklanma süresini artıran nörobilim destekli 12 farklı mini zeka oyunu paketi. Günlük beyin antrenmanı için idealdir.',
    shortDescription: 'Bilişsel hafıza, uzamsal algı ve odaklanma için nörobilimsel mini oyunlar.',
    category: 'Zeka & Mantık',
    gameType: 'Bulmaca',
    targetGrades: ['Okul Öncesi', '1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf', '9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'],
    subjects: ['Mantık & Zeka'],
    topics: ['Uzamsal Algı', 'Görsel Hafıza', 'Akıl Yürütme', 'Odak & Dikkat'],
    ageRange: '6 - 18 Yaş',
    difficulty: 'Dinamik Adaptif',
    rating: 4.97,
    reviewCount: 680,
    playsCount: 31200,
    isActive: true,
    gameUrl: '/student/gamestudio/play/game-brain-matrix',
    learningObjectives: [
      'Çalışma belleği (working memory) kapasitesini artırma',
      'Görsel dikkat ve konsantrasyon süresini uzatma',
      'Stres altında analitik strateji geliştirme',
    ],
    badge: 'En Çok Oynanan',
    developer: 'Oxonom Bilişsel Gelişim Laboratuvarı',
    version: '4.0.0',
    createdAt: '2026-06-12',
    updatedAt: '2026-10-21',
  },
]

const STORAGE_KEY_GAMES = 'oxonom_gamestudio_games_v2'
const STORAGE_KEY_PRINCIPAL_CONFIG = 'oxonom_gamestudio_principal_config_v2'

/**
 * Retrieve all games (superadmin state)
 */
export function getAllGames(): EducationalGame[] {
  if (typeof window === 'undefined') return DEFAULT_GAMES
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GAMES)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_GAMES, JSON.stringify(DEFAULT_GAMES))
      return DEFAULT_GAMES
    }
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
    }
    localStorage.setItem(STORAGE_KEY_GAMES, JSON.stringify(DEFAULT_GAMES))
    return DEFAULT_GAMES
  } catch (e) {
    console.error('Error reading games storage:', e)
    return DEFAULT_GAMES
  }
}

/**
 * Save games list (Superadmin)
 */
export function saveAllGames(games: EducationalGame[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY_GAMES, JSON.stringify(games))
    window.dispatchEvent(new CustomEvent('oxonom_games_updated', { detail: { games } }))
  } catch (e) {
    console.error('Error saving games:', e)
  }
}

/**
 * Superadmin: Add or Update a game
 */
export function upsertGame(game: Partial<EducationalGame> & { title: string }): EducationalGame {
  const current = getAllGames()
  const now = new Date().toISOString().split('T')[0]

  if (game.id) {
    const idx = current.findIndex((g) => g.id === game.id)
    if (idx !== -1) {
      const updated: EducationalGame = {
        ...current[idx],
        ...game,
        updatedAt: now,
      } as EducationalGame
      current[idx] = updated
      saveAllGames(current)
      return updated
    }
  }

  // Create new
  const newGame: EducationalGame = {
    id: game.id || `game-${Date.now()}`,
    title: game.title,
    slug: game.slug || game.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
    coverImage: game.coverImage || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
    bannerImage: game.bannerImage || game.coverImage,
    description: game.description || 'Yeni eklenen eğitici oyun.',
    shortDescription: game.shortDescription || game.description?.slice(0, 80) || 'Eğitici oyun.',
    category: game.category || 'Matematik',
    gameType: game.gameType || '2D Arcade',
    targetGrades: game.targetGrades && game.targetGrades.length > 0 ? game.targetGrades : ['5. Sınıf'],
    subjects: game.subjects && game.subjects.length > 0 ? game.subjects : ['Matematik'],
    topics: game.topics && game.topics.length > 0 ? game.topics : ['Genel Konular'],
    ageRange: game.ageRange || '8 - 14 Yaş',
    difficulty: game.difficulty || 'Orta',
    rating: game.rating || 5.0,
    reviewCount: game.reviewCount || 1,
    playsCount: game.playsCount || 0,
    isActive: game.isActive !== undefined ? game.isActive : true,
    gameUrl: game.gameUrl || `/student/gamestudio/play/${game.id || 'new'}`,
    learningObjectives: game.learningObjectives && game.learningObjectives.length > 0 ? game.learningObjectives : ['Analitik düşünme becerisi'],
    badge: game.badge || 'Yeni',
    developer: game.developer || 'Oxonom Game Studio',
    version: game.version || '1.0.0',
    createdAt: now,
    updatedAt: now,
  }

  const nextList = [newGame, ...current]
  saveAllGames(nextList)
  return newGame
}

/**
 * Superadmin: Delete a game
 */
export function deleteGame(id: string): void {
  const current = getAllGames()
  const filtered = current.filter((g) => g.id !== id)
  saveAllGames(filtered)
}

/**
 * Superadmin: Toggle game global active status
 */
export function toggleGameStatus(id: string): EducationalGame | null {
  const current = getAllGames()
  const idx = current.findIndex((g) => g.id === id)
  if (idx === -1) return null
  current[idx].isActive = !current[idx].isActive
  current[idx].updatedAt = new Date().toISOString().split('T')[0]
  saveAllGames(current)
  return current[idx]
}

/**
 * Principal Permissions & Class Visibility Storage
 */
export function getPrincipalConfigs(): Record<string, PrincipalGameConfig> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRINCIPAL_CONFIG)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch (e) {
    console.error('Error reading principal game config:', e)
    return {}
  }
}

export function savePrincipalConfigs(configs: Record<string, PrincipalGameConfig>): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY_PRINCIPAL_CONFIG, JSON.stringify(configs))
    window.dispatchEvent(new CustomEvent('oxonom_games_updated', { detail: { configs } }))
  } catch (e) {
    console.error('Error saving principal game configs:', e)
  }
}

export function setPrincipalGameConfig(gameId: string, schoolActive: boolean, assignedGrades: string[]): void {
  const all = getPrincipalConfigs()
  all[gameId] = {
    gameId,
    schoolActive,
    assignedGrades,
  }
  savePrincipalConfigs(all)
}

/**
 * Filtered games visible to a student or teacher:
 * Takes into account:
 * 1. Superadmin global isActive
 * 2. Principal schoolActive (if set)
 * 3. Class/grade matching if student has a specific grade (e.g. '9-A', '9. Sınıf')
 */
export function getAvailableGamesForRole(
  role: 'student' | 'teacher' | 'principal' | 'superadmin',
  studentGrade?: string
): EducationalGame[] {
  const games = getAllGames()
  if (role === 'superadmin') return games

  const principalConfigs = getPrincipalConfigs()

  return games.filter((g) => {
    // 1. Must be globally active in Superadmin
    if (!g.isActive) return false

    // 2. Check principal overrides
    const pConf = principalConfigs[g.id]
    if (pConf && pConf.schoolActive === false) {
      return false
    }

    // Principal sees all games that are not globally disabled
    if (role === 'principal' || role === 'teacher') return true

    // 3. For student: Check grade accessibility
    if (role === 'student' && studentGrade) {
      // Check if principal set specific class restrictions
      if (pConf && pConf.assignedGrades && pConf.assignedGrades.length > 0) {
        if (pConf.assignedGrades.includes('Tüm Sınıflar')) return true
        const matchPrincipalGrade = pConf.assignedGrades.some((grade) =>
          studentGrade.includes(grade) || grade.includes(studentGrade)
        )
        if (!matchPrincipalGrade) return false
      }

      // Check default target grades of the game
      if (g.targetGrades && g.targetGrades.length > 0) {
        const matchesTarget = g.targetGrades.some((tg) =>
          studentGrade.includes(tg) || tg.includes(studentGrade) || tg === 'Tüm Sınıflar'
        )
        // If not explicit match, allow if student grade is compatible or general
        return matchesTarget || g.targetGrades.includes('9. Sınıf') || studentGrade.includes('9')
      }
    }

    return true
  })
}
