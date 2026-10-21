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

export const OBSOLETE_MOCKUP_IDS = [
  'game-math-champion',
  'game-science-galaxy',
  'game-code-quest',
  'game-word-voyager',
  'game-lingua-island',
  'game-history-chronos',
  'game-brain-matrix',
]

export const DEFAULT_GAMES: EducationalGame[] = [
  {
    id: 'sayi-kasifleri',
    title: 'Sayı Kaşifleri: Kayıp Kristaller',
    slug: 'sayi-kasifleri',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=1600&q=80',
    description: "Sayılar Adası'ndaki sönen enerjiyi kurtarmak için sevimli kaşifimizle macera dolu bir keşfe çık! 2. sınıf öğrencileri için onluk-birlik modelleri, sayı karşılaştırma, görsel nesnelerle toplama-çıkarma ve sayı örüntülerini Nintendo oyun felsefesiyle birleştiren 12 seviyeli özgün matematik macerası.",
    shortDescription: '2. Sınıf öğrencileri için 12 seviyeli özgün matematik ve kristal keşif macerası.',
    category: 'Matematik',
    gameType: 'Macera',
    targetGrades: ['2. Sınıf', '1. Sınıf', '3. Sınıf'],
    subjects: ['Matematik'],
    topics: ['Basamak Değeri (Onluk-Birlik)', 'Sayı Karşılaştırma', 'Toplama & Çıkarma', 'Sayı Örüntüleri'],
    ageRange: '7 - 8 Yaş',
    difficulty: 'Başlangıç',
    rating: 4.98,
    reviewCount: 512,
    playsCount: 24500,
    isActive: true,
    gameUrl: '/student/gamestudio/play/sayi-kasifleri',
    learningObjectives: [
      'Onluk ve birlik taban bloklarını somut modellerle kavrama',
      'Sayıları büyüklük-küçüklük yönünden doğru karşılaştırma',
      'Görsel modeller ve sayı doğrusuyla toplama ve çıkarma yapabilme',
      'Sayı örüntülerindeki eksik terimi kurala uygun bulma',
    ],
    badge: 'Editörün Seçimi',
    developer: 'Oxonom Game Studio (Yerleşik Motor)',
    version: '1.0.0',
    createdAt: '2026-10-21',
    updatedAt: '2026-10-21',
  },
  {
    id: '2048-sayi-mantik-bulmacasi',
    title: '2048: Sayı & Mantık Bulmacası',
    slug: '2048-sayi-mantik-bulmacasi',
    coverImage: '/games/2048-sayi-mantik-bulmacasi.png',
    bannerImage: '/games/2048-sayi-mantik-bulmacasi.png',
    description: 'Sayıları kaydırarak birbirinin katı olan karoları birleştir, zihinsel strateji kur ve 2048 karosuna ulaş! Matematiksel güç, odaklanma ve stratejik planlama becerilerini geliştirir.',
    shortDescription: 'Sayıları kaydır, katları birleştir ve 2048 hedefine ulaş.',
    category: 'Zeka & Mantık',
    gameType: 'Bulmaca',
    targetGrades: ['3. Sınıf', '4. Sınıf', '5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf', '9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'],
    subjects: ['Matematik', 'Mantık & Zeka'],
    topics: ['Üslü Sayılar', '2\'nin Katları', 'Stratejik Planlama', 'Görsel Odak'],
    ageRange: '8 - 18 Yaş',
    difficulty: 'Dinamik Adaptif',
    rating: 4.95,
    reviewCount: 420,
    playsCount: 31200,
    isActive: true,
    gameUrl: '/games/2048-sayi-mantik-bulmacasi.html',
    learningObjectives: [
      'Sayısal örüntüleri ve katları zihinden hesaplama',
      'Stratejik karar verme ve ileri hamle planlama',
      'Uzamsal dikkat ve konsantrasyon becerisi',
    ],
    badge: 'Popüler & Zeka',
    developer: 'Oxonom Mantık & Bulmaca (HTML5)',
    version: '2.0.0',
    createdAt: '2026-10-01',
    updatedAt: '2026-10-21',
  },
  {
    id: 'hafiza-kartlari-ciftini-bul',
    title: 'Hafıza Kartları: Çiftini Bul',
    slug: 'hafiza-kartlari-ciftini-bul',
    coverImage: '/games/hafiza-kartlari-ciftini-bul.png',
    bannerImage: '/games/hafiza-kartlari-ciftini-bul.png',
    description: 'Farklı eğitici sembol ve ikonlardan oluşan gizli kartları çevirerek eşlerini bul. Kısa süreli görsel hafızayı, görsel dikkati ve odaklanmayı artıran etkileşimli nöro-hafıza oyunu.',
    shortDescription: 'Gizli kartları çevir, eşlerini bul ve hafıza rekoru kır.',
    category: 'Zeka & Mantık',
    gameType: 'Bulmaca',
    targetGrades: ['Okul Öncesi', '1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf'],
    subjects: ['Mantık & Zeka'],
    topics: ['Görsel Hafıza', 'Eşleştirme', 'Dikkat & Odak', 'Çalışma Belleği'],
    ageRange: '5 - 12 Yaş',
    difficulty: 'Başlangıç',
    rating: 4.92,
    reviewCount: 380,
    playsCount: 22400,
    isActive: true,
    gameUrl: '/games/hafiza-kartlari-ciftini-bul.html',
    learningObjectives: [
      'Çalışma belleği (working memory) kapasitesini güçlendirme',
      'Görsel sembolleri hızlı tanıma ve eşleştirme',
      'Dikkat dağınıklığını azaltıcı odaklanma antrenmanı',
    ],
    badge: 'Çok Sevilen',
    developer: 'Oxonom Bilişsel Gelişim (HTML5)',
    version: '1.5.0',
    createdAt: '2026-09-15',
    updatedAt: '2026-10-21',
  },
  {
    id: 'kelime-avcisi-harf-cozucu',
    title: 'Kelime Avcısı: Harf & Sözcük Çözücü',
    slug: 'kelime-avcisi-harf-cozucu',
    coverImage: '/games/kelime-avcisi-harf-cozucu.png',
    bannerImage: '/games/kelime-avcisi-harf-cozucu.png',
    description: 'Harf çarkındaki harfleri birleştirerek gizli Türkçe kelimeleri ortaya çıkar. Sözcük dağarcığını zenginleştiren, imla ve hızlı düşünme becerilerini pekiştiren eğlenceli Türkçe oyunu.',
    shortDescription: 'Harfleri birleştir, gizli kelimeleri bul ve sözcük avını tamamla.',
    category: 'Türkçe',
    gameType: 'Bulmaca',
    targetGrades: ['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf', '6. Sınıf'],
    subjects: ['Türkçe'],
    topics: ['Kelime Dağarcığı', 'Harf Bilgisi', 'Hızlı Düşünme', 'Anlam Bilgisi'],
    ageRange: '7 - 14 Yaş',
    difficulty: 'Orta',
    rating: 4.88,
    reviewCount: 295,
    playsCount: 18900,
    isActive: true,
    gameUrl: '/games/kelime-avcisi-harf-cozucu.html',
    learningObjectives: [
      'Türkçe kelime haznesini %40 oranında genişletme',
      'Harflerden anlamlı kök ve türemiş sözcükler üretme',
      'Hızlı okuma ve sözcük tanıma reflekslerini geliştirme',
    ],
    badge: 'Türkçe & Dil',
    developer: 'Oxonom Dil Enstitüsü (HTML5)',
    version: '2.1.0',
    createdAt: '2026-09-20',
    updatedAt: '2026-10-21',
  },
  {
    id: 'orbit',
    title: 'Orbit: Yerçekimi & Gezegen Fiziği',
    slug: 'orbit',
    coverImage: '/games/orbit.png',
    bannerImage: '/games/orbit.png',
    description: 'Uzayda gezegenlerin yörüngelerini, kütle çekim kuvvetini ve Newton fiziğini interaktif olarak keşfet. Doğru açı ve hız ile uydunu yörüngeye oturt!',
    shortDescription: 'Yerçekimi ve kütle çekim fiziğini keşfet, uyduları yörüngeye oturt.',
    category: 'Fen Bilimleri',
    gameType: 'Simülasyon',
    targetGrades: ['5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf', '9. Sınıf', '10. Sınıf', '11. Sınıf'],
    subjects: ['Fen Bilimleri', 'Fizik'],
    topics: ['Kütle Çekim', 'Yörünge Hareketi', 'Kuvvet ve Hareket', 'Uzay Fiziği'],
    ageRange: '10 - 17 Yaş',
    difficulty: 'Dinamik Adaptif',
    rating: 4.89,
    reviewCount: 310,
    playsCount: 16400,
    isActive: true,
    gameUrl: '/games/orbit.html',
    learningObjectives: [
      'Kütle çekim kuvveti ile merkezkaç kuvveti dengesini kavrama',
      'Yörünge simülasyonları üzerinden hipotez geliştirme',
      'Fizik formüllerini sezgisel olarak deneyimleme',
    ],
    badge: 'Fizik & Uzay',
    developer: 'Oxonom STEM Labs (HTML5)',
    version: '3.0.0',
    createdAt: '2026-08-25',
    updatedAt: '2026-10-21',
  },
  {
    id: 'uzay-roket-matematik-gorevi',
    title: 'Uzay Roketi: Hızlı Matematik Görevi',
    slug: 'uzay-roket-matematik-gorevi',
    coverImage: 'https://images.unsplash.com/photo-1517976487548-d363590059b0?auto=format&fit=crop&w=800&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    description: 'Roketini uzayda doğru matematiksel kapılardan geçirerek hedefe ulaştır. Dört işlem ve hızlı zihinden hesaplama reflekslerini test eden heyecan verici roket yarışı.',
    shortDescription: 'Matematik işlemlerini doğru yanıtla, roketini fırlat ve hedefe var.',
    category: 'Matematik',
    gameType: '2D Arcade',
    targetGrades: ['2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf', '6. Sınıf'],
    subjects: ['Matematik'],
    topics: ['Dört İşlem', 'Hızlı Zihinsel Hesap', 'Refleks & Zamanlama'],
    ageRange: '7 - 13 Yaş',
    difficulty: 'Orta',
    rating: 4.91,
    reviewCount: 260,
    playsCount: 15200,
    isActive: true,
    gameUrl: '/games/uzay-roket-matematik-gorevi.html',
    learningObjectives: [
      'Zihinden dört işlem reflekslerini hızlandırma',
      'Zaman baskısı altında odaklanma ve doğru karar verme',
      'Matematiksel özgüven kazanımı',
    ],
    badge: 'Hızlı Refleks',
    developer: 'Oxonom Math Games (HTML5)',
    version: '1.2.0',
    createdAt: '2026-09-10',
    updatedAt: '2026-10-21',
  },
]

const STORAGE_KEY_GAMES = 'oxonom_gamestudio_games_v2'
const STORAGE_KEY_DELETED = 'oxonom_gamestudio_deleted_games_v2'
const STORAGE_KEY_PRINCIPAL_CONFIG = 'oxonom_gamestudio_principal_config_v2'

/**
 * Retrieve all games (superadmin state)
 */
export function getAllGames(): EducationalGame[] {
  if (typeof window === 'undefined') return DEFAULT_GAMES
  try {
    const rawDeleted = localStorage.getItem(STORAGE_KEY_DELETED)
    const deletedSet = new Set<string>(rawDeleted ? JSON.parse(rawDeleted) : [])

    const raw = localStorage.getItem(STORAGE_KEY_GAMES)
    if (!raw) {
      const initial = DEFAULT_GAMES.filter((g) => !deletedSet.has(g.id) && !deletedSet.has(g.slug))
      localStorage.setItem(STORAGE_KEY_GAMES, JSON.stringify(initial))
      return initial
    }

    let parsed: EducationalGame[] = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      const originalCount = parsed.length

      // Filter out obsolete mockups and deleted games
      parsed = parsed.filter(
        (g) =>
          !OBSOLETE_MOCKUP_IDS.includes(g.id) &&
          !deletedSet.has(g.id) &&
          !deletedSet.has(g.slug)
      )

      // Ensure verified default games are present unless explicitly deleted
      let updated = parsed.length !== originalCount
      DEFAULT_GAMES.forEach((defGame) => {
        if (
          !deletedSet.has(defGame.id) &&
          !deletedSet.has(defGame.slug) &&
          !parsed.some((g: EducationalGame) => g.id === defGame.id || g.slug === defGame.slug)
        ) {
          parsed.push(defGame)
          updated = true
        }
      })

      if (updated) {
        localStorage.setItem(STORAGE_KEY_GAMES, JSON.stringify(parsed))
      }
      return parsed
    }

    const fallback = DEFAULT_GAMES.filter((g) => !deletedSet.has(g.id) && !deletedSet.has(g.slug))
    localStorage.setItem(STORAGE_KEY_GAMES, JSON.stringify(fallback))
    return fallback
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
 * Superadmin: Delete a game permanently
 */
export function deleteGame(id: string): void {
  if (typeof window === 'undefined') return
  try {
    // 1. Record ID in deleted set
    const rawDeleted = localStorage.getItem(STORAGE_KEY_DELETED)
    const deletedSet = new Set<string>(rawDeleted ? JSON.parse(rawDeleted) : [])
    deletedSet.add(id)
    localStorage.setItem(STORAGE_KEY_DELETED, JSON.stringify(Array.from(deletedSet)))

    // 2. Remove from active games list
    const current = getAllGames()
    const filtered = current.filter((g) => g.id !== id && g.slug !== id)
    localStorage.setItem(STORAGE_KEY_GAMES, JSON.stringify(filtered))

    // 3. Dispatch global sync event
    window.dispatchEvent(new CustomEvent('oxonom_games_updated', { detail: { games: filtered } }))
  } catch (e) {
    console.error('Error deleting game:', e)
  }
}

/**
 * Purge all obsolete/non-working mockup games in one click
 */
export function purgeMockupGames(): number {
  if (typeof window === 'undefined') return 0
  try {
    const rawDeleted = localStorage.getItem(STORAGE_KEY_DELETED)
    const deletedSet = new Set<string>(rawDeleted ? JSON.parse(rawDeleted) : [])
    OBSOLETE_MOCKUP_IDS.forEach((id) => deletedSet.add(id))
    localStorage.setItem(STORAGE_KEY_DELETED, JSON.stringify(Array.from(deletedSet)))

    const raw = localStorage.getItem(STORAGE_KEY_GAMES)
    const current: EducationalGame[] = raw ? JSON.parse(raw) : DEFAULT_GAMES
    const filtered = current.filter((g) => !OBSOLETE_MOCKUP_IDS.includes(g.id))
    const removedCount = current.length - filtered.length
    localStorage.setItem(STORAGE_KEY_GAMES, JSON.stringify(filtered))
    window.dispatchEvent(new CustomEvent('oxonom_games_updated', { detail: { games: filtered } }))
    return removedCount
  } catch (e) {
    console.error('Error purging mockup games:', e)
    return 0
  }
}

/**
 * Reset catalog to verified working games
 */
export function resetToDefaultGames(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY_DELETED)
    localStorage.setItem(STORAGE_KEY_GAMES, JSON.stringify(DEFAULT_GAMES))
    window.dispatchEvent(new CustomEvent('oxonom_games_updated', { detail: { games: DEFAULT_GAMES } }))
  } catch (e) {
    console.error('Error resetting games:', e)
  }
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

    // 3. For student: Only filter out if school principal explicitly restricted to other classes
    if (role === 'student' && studentGrade && pConf && pConf.assignedGrades && pConf.assignedGrades.length > 0) {
      if (!pConf.assignedGrades.includes('Tüm Sınıflar')) {
        const matchPrincipalGrade = pConf.assignedGrades.some((grade) =>
          studentGrade.includes(grade) || grade.includes(studentGrade)
        )
        if (!matchPrincipalGrade) return false
      }
    }

    return true
  })
}
