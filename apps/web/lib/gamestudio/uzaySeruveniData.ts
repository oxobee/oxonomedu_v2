// apps/web/lib/gamestudio/uzaySeruveniData.ts
'use client'

export type GradeLevel = '1' | '2'

export interface SpaceQuestion {
  id: string
  prompt: string
  subPrompt?: string
  kozmoAdvice: string // Turkish guidance from Alien mascot Kozmo
  visualType: 'counting' | 'rhythmic' | 'addition' | 'subtraction' | 'comparison' | 'pattern'
  visualData?: any
  correctAnswer: number | string
  options: Array<{ id: string; value: number | string; label?: string }>
  hintText: string
}

export interface SpaceMission {
  id: number
  grade: GradeLevel
  title: string
  subtitle: string
  pedagogicalObjective: string
  rewardName: string
  rewardCoins: number
  questions: SpaceQuestion[]
}

export interface SpaceGameProgress {
  gameId: string
  version: number
  unlockedMission: number
  completedMissions: number[]
  missionStars: Record<number, number>
  totalCoins: number
  selectedGrade: GradeLevel
  openedRewards: string[]
  settings: {
    soundEnabled: boolean
  }
  updatedAt: string
}

export const INITIAL_SPACE_PROGRESS: SpaceGameProgress = {
  gameId: 'uzay-seruveni',
  version: 1,
  unlockedMission: 1,
  completedMissions: [],
  missionStars: {},
  totalCoins: 1500,
  selectedGrade: '1',
  openedRewards: [],
  settings: {
    soundEnabled: true,
  },
  updatedAt: new Date().toISOString(),
}

export const SPACE_MISSIONS: SpaceMission[] = [
  // ==========================================
  // 1. SINIF GÖREVLERİ (1 - 5)
  // ==========================================
  {
    id: 1,
    grade: '1',
    title: 'Giriş: Yıldız Sayımı',
    subtitle: 'Uzay Üssünden Fırlatma',
    pedagogicalObjective: '1-10 Arası Nesneleri Sayma ve Eşleştirme',
    rewardName: 'Gümüş Kozmik Kask',
    rewardCoins: 200,
    questions: [
      {
        id: '1-1',
        prompt: 'Roketin etrafında kaç tane altın yıldız var?',
        subPrompt: 'Yıldızları tek tek sayalım!',
        kozmoAdvice: 'Merhaba Kaptan! Yıldızları sayıp doğru sayı kapsülüne dokun!',
        visualType: 'counting',
        visualData: { count: 6, symbol: '⭐' },
        correctAnswer: 6,
        options: [
          { id: 'opt-1', value: 4 },
          { id: 'opt-2', value: 6 },
          { id: 'opt-3', value: 8 },
        ],
        hintText: 'Yıldızları parmağınla say: 1, 2, 3, 4, 5, 6!',
      },
      {
        id: '1-2',
        prompt: 'Radarımıza 8 adet uydu takıldı. Hangi sayı 8?',
        subPrompt: 'Sekiz sayısını bul!',
        kozmoAdvice: 'Mükemmel! Şimdi radarın gösterdiği sayıyı seç!',
        visualType: 'counting',
        visualData: { count: 8, symbol: '🛰️' },
        correctAnswer: 8,
        options: [
          { id: 'opt-1', value: 7 },
          { id: 'opt-2', value: 8 },
          { id: 'opt-3', value: 9 },
        ],
        hintText: '8 sayısı, 7\'den hemen sonra gelir.',
      },
      {
        id: '1-3',
        prompt: 'Depomuzda 10 yakıt kapsülü olmalı. Kaç tane eksik?',
        subPrompt: 'Ekranda 7 kapsül var: 7\'yi 10\'a tamamlayalım.',
        kozmoAdvice: '10 yakıta ulaşmak için kaç yakıt daha toplamalıyız?',
        visualType: 'addition',
        visualData: { current: 7, target: 10, symbol: '🔋' },
        correctAnswer: 3,
        options: [
          { id: 'opt-1', value: 2 },
          { id: 'opt-2', value: 3 },
          { id: 'opt-3', value: 4 },
        ],
        hintText: '7\'nin üzerine sayalım: 8, 9, 10! Yani 3 tane!',
      },
    ],
  },
  {
    id: 2,
    grade: '1',
    title: 'İkişerli Işık Hızı',
    subtitle: 'Ritmik Sayma Kemeri',
    pedagogicalObjective: '20\'ye Kadar İkişerli İleriye Sayma',
    rewardName: 'Neon Mavi İtki Motoru',
    rewardCoins: 250,
    questions: [
      {
        id: '2-1',
        prompt: 'Sıradaki ışık halkası kaç olmalı?',
        subPrompt: '2 — 4 — 6 — ?',
        kozmoAdvice: 'İkişer ikişer atlayarak ışık hızına geçiyoruz!',
        visualType: 'rhythmic',
        visualData: { sequence: [2, 4, 6, '?'] },
        correctAnswer: 8,
        options: [
          { id: 'opt-1', value: 7 },
          { id: 'opt-2', value: 8 },
          { id: 'opt-3', value: 10 },
        ],
        hintText: '6 sayısına 2 eklersek 8 olur.',
      },
      {
        id: '2-2',
        prompt: 'Boş bırakılan gezegen numarasını bul!',
        subPrompt: '10 — 12 — ? — 16',
        kozmoAdvice: '12\'den 2 adım ileriye sıçra Kaptan!',
        visualType: 'rhythmic',
        visualData: { sequence: [10, 12, '?', 16] },
        correctAnswer: 14,
        options: [
          { id: 'opt-1', value: 13 },
          { id: 'opt-2', value: 14 },
          { id: 'opt-3', value: 15 },
        ],
        hintText: '12 + 2 = 14!',
      },
      {
        id: '2-3',
        prompt: '20\'ye ulaşmak için son adım kaç?',
        subPrompt: '14 — 16 — 18 — ?',
        kozmoAdvice: 'Bölümün son halkası! 18\'den sonra hangi çift sayı gelir?',
        visualType: 'rhythmic',
        visualData: { sequence: [14, 16, 18, '?'] },
        correctAnswer: 20,
        options: [
          { id: 'opt-1', value: 19 },
          { id: 'opt-2', value: 20 },
          { id: 'opt-3', value: 22 },
        ],
        hintText: '18\'e 2 ekleyince 20 olur!',
      },
    ],
  },
  {
    id: 3,
    grade: '1',
    title: 'Toplama İstasyonu',
    subtitle: 'Kozmik Enerji Birleştirme',
    pedagogicalObjective: '20 İçinde Eldesiz Basit Toplama',
    rewardName: 'Plazma Kalkan Rozeti',
    rewardCoins: 300,
    questions: [
      {
        id: '3-1',
        prompt: '5 Sarı Yıldız + 4 Mavi Yıldız kaç yıldız eder?',
        subPrompt: '5 + 4 = ?',
        kozmoAdvice: 'Yıldızları sepette birleştiriyoruz!',
        visualType: 'addition',
        visualData: { a: 5, b: 4 },
        correctAnswer: 9,
        options: [
          { id: 'opt-1', value: 8 },
          { id: 'opt-2', value: 9 },
          { id: 'opt-3', value: 10 },
        ],
        hintText: '5\'in üzerine 4 say: 6, 7, 8, 9!',
      },
      {
        id: '3-2',
        prompt: 'Roket sol depodan 7, sağ depodan 6 birim yakıt aldı.',
        subPrompt: '7 + 6 = ?',
        kozmoAdvice: 'Toplam gücümüzü hesapla Kaptan!',
        visualType: 'addition',
        visualData: { a: 7, b: 6 },
        correctAnswer: 13,
        options: [
          { id: 'opt-1', value: 12 },
          { id: 'opt-2', value: 13 },
          { id: 'opt-3', value: 14 },
        ],
        hintText: '7 + 3 = 10, 3 daha ekle: 13!',
      },
      {
        id: '3-3',
        prompt: '9 Enerji Kristali + 8 Yakıt Kristali toplamı kaçtır?',
        subPrompt: '9 + 8 = ?',
        kozmoAdvice: 'Son kapı şifresi bu toplamda gizli!',
        visualType: 'addition',
        visualData: { a: 9, b: 8 },
        correctAnswer: 17,
        options: [
          { id: 'opt-1', value: 16 },
          { id: 'opt-2', value: 17 },
          { id: 'opt-3', value: 18 },
        ],
        hintText: '9 + 8 = 17',
      },
    ],
  },
  {
    id: 4,
    grade: '1',
    title: 'Asteroit Temizliği',
    subtitle: 'Geriye Doğru Çıkarma',
    pedagogicalObjective: '20 İçinde Çıkarma İşlemi ve Eksileni Kavrama',
    rewardName: 'Altın Lazer Topu',
    rewardCoins: 300,
    questions: [
      {
        id: '4-1',
        prompt: '10 asteroitten 4 tanesini lazerle parçaladık. Kaç tane kaldı?',
        subPrompt: '10 - 4 = ?',
        kozmoAdvice: '10\'dan 4 geriye sayalım!',
        visualType: 'subtraction',
        visualData: { total: 10, remove: 4 },
        correctAnswer: 6,
        options: [
          { id: 'opt-1', value: 5 },
          { id: 'opt-2', value: 6 },
          { id: 'opt-3', value: 7 },
        ],
        hintText: '10\'dan 4 çıkarırsak 6 kalır.',
      },
      {
        id: '4-2',
        prompt: '15 yakıt kapsülümüz vardı, 5 tanesini kullandık.',
        subPrompt: '15 - 5 = ?',
        kozmoAdvice: 'Geriye kaç yakıtımız kaldı?',
        visualType: 'subtraction',
        visualData: { total: 15, remove: 5 },
        correctAnswer: 10,
        options: [
          { id: 'opt-1', value: 9 },
          { id: 'opt-2', value: 10 },
          { id: 'opt-3', value: 11 },
        ],
        hintText: '15\'in birliğini (5) atarsak geriye 10 kalır!',
      },
      {
        id: '4-3',
        prompt: '12 uzay taşından 7\'si yok oldu.',
        subPrompt: '12 - 7 = ?',
        kozmoAdvice: 'Rotamızı temizlemek için son işlem!',
        visualType: 'subtraction',
        visualData: { total: 12, remove: 7 },
        correctAnswer: 5,
        options: [
          { id: 'opt-1', value: 4 },
          { id: 'opt-2', value: 5 },
          { id: 'opt-3', value: 6 },
        ],
        hintText: '12 - 2 = 10, 10 - 5 = 5!',
      },
    ],
  },
  {
    id: 5,
    grade: '1',
    title: 'Büyük Gezegen Rotası',
    subtitle: 'Sayıları Karşılaştırma',
    pedagogicalObjective: 'Sayılar Arası Büyüklük-Küçüklük İlişkisi',
    rewardName: '1. Sınıf Kozmonot Madalyası',
    rewardCoins: 400,
    questions: [
      {
        id: '5-1',
        prompt: 'Hangi gezegenin koordinat sayısı DAHA BÜYÜKTÜR?',
        subPrompt: '14 mü yoksa 19 mu?',
        kozmoAdvice: 'Daha büyük sayıya sahip gezegene yöneliyoruz!',
        visualType: 'comparison',
        visualData: { a: 14, b: 19 },
        correctAnswer: 19,
        options: [
          { id: 'opt-1', value: 14 },
          { id: 'opt-2', value: 19 },
        ],
        hintText: '19, 14\'ten daha büyüktür.',
      },
      {
        id: '5-2',
        prompt: 'Hangi asteroit kümesi DAHA AZ taşa sahiptir?',
        subPrompt: '8 mi yoksa 12 mi daha küçük?',
        kozmoAdvice: 'Daha az ve güvenli rotayı seçelim!',
        visualType: 'comparison',
        visualData: { a: 8, b: 12 },
        correctAnswer: 8,
        options: [
          { id: 'opt-1', value: 8 },
          { id: 'opt-2', value: 12 },
        ],
        hintText: '8 sayısı 12\'den küçüktür.',
      },
      {
        id: '5-3',
        prompt: 'Hangi sayı 15\'ten BÜYÜK, 17\'den KÜÇÜKTÜR?',
        subPrompt: '15 ile 17 arasındaki sayıyı bul!',
        kozmoAdvice: 'İki sayının tam ortasındaki gizli sayı!',
        visualType: 'comparison',
        visualData: { between: [15, 17] },
        correctAnswer: 16,
        options: [
          { id: 'opt-1', value: 14 },
          { id: 'opt-2', value: 16 },
          { id: 'opt-3', value: 18 },
        ],
        hintText: '15, 16, 17!',
      },
    ],
  },

  // ==========================================
  // 2. SINIF GÖREVLERİ (6 - 10)
  // ==========================================
  {
    id: 6,
    grade: '2',
    title: 'Onluk-Birlik Blokları',
    subtitle: 'İki Basamaklı Sayı Yapısı',
    pedagogicalObjective: 'Basamak Değerini Kavrama (Onluk & Birlik)',
    rewardName: 'Kuantum Radar Anteni',
    rewardCoins: 350,
    questions: [
      {
        id: '6-1',
        prompt: '2 Onluk + 5 Birlik hangi sayıyı oluşturur?',
        subPrompt: '2 Onluk (20) + 5 Birlik (5) = ?',
        kozmoAdvice: 'Onluk çubuklarını ve tekil birlikleri birleştir Kaptan!',
        visualType: 'addition',
        visualData: { tens: 2, ones: 5 },
        correctAnswer: 25,
        options: [
          { id: 'opt-1', value: 20 },
          { id: 'opt-2', value: 25 },
          { id: 'opt-3', value: 52 },
        ],
        hintText: '2 onluk = 20, 5 birlik = 5. Toplam 25!',
      },
      {
        id: '6-2',
        prompt: '43 sayısında kaç ONLUK vardır?',
        subPrompt: 'Onlar basamağındaki rakamı bul.',
        kozmoAdvice: 'Sol taraftaki onlar basamağına dikkat et!',
        visualType: 'counting',
        visualData: { number: 43 },
        correctAnswer: 4,
        options: [
          { id: 'opt-1', value: 3 },
          { id: 'opt-2', value: 4 },
          { id: 'opt-3', value: 40 },
        ],
        hintText: '43 sayısı 4 onluk ve 3 birlikten oluşur. Onluk sayısı 4\'tür.',
      },
      {
        id: '6-3',
        prompt: '3 Onluk + 8 Birlik kaç eder?',
        subPrompt: '30 + 8 = ?',
        kozmoAdvice: 'Yakıt deposu gücünü hesapla!',
        visualType: 'addition',
        visualData: { tens: 3, ones: 8 },
        correctAnswer: 38,
        options: [
          { id: 'opt-1', value: 38 },
          { id: 'opt-2', value: 83 },
          { id: 'opt-3', value: 48 },
        ],
        hintText: '3 Onluk (30) ve 8 Birlik = 38',
      },
    ],
  },
  {
    id: 7,
    grade: '2',
    title: 'Beşerli & Onarlı Işık Hızı',
    subtitle: 'Genişletilmiş Ritmik Sayma',
    pedagogicalObjective: '100 İçinde 5\'erli ve 10\'arlı Ritmik Sayma',
    rewardName: 'Süpersonik Kanat Seti',
    rewardCoins: 400,
    questions: [
      {
        id: '7-1',
        prompt: '5\'er ritmik saymada sıradaki gezegen hangisi?',
        subPrompt: '15 — 20 — 25 — ?',
        kozmoAdvice: 'Beşer beşer uzay adımlarıyla ilerliyoruz!',
        visualType: 'rhythmic',
        visualData: { sequence: [15, 20, 25, '?'] },
        correctAnswer: 30,
        options: [
          { id: 'opt-1', value: 28 },
          { id: 'opt-2', value: 30 },
          { id: 'opt-3', value: 35 },
        ],
        hintText: '25 + 5 = 30!',
      },
      {
        id: '7-2',
        prompt: '10\'ar ritmik saymada eksik olan sayıyı bul!',
        subPrompt: '30 — 40 — ? — 60',
        kozmoAdvice: 'Onar onar zıplayarak büyük halkadan geç!',
        visualType: 'rhythmic',
        visualData: { sequence: [30, 40, '?', 60] },
        correctAnswer: 50,
        options: [
          { id: 'opt-1', value: 45 },
          { id: 'opt-2', value: 50 },
          { id: 'opt-3', value: 55 },
        ],
        hintText: '40 + 10 = 50',
      },
      {
        id: '7-3',
        prompt: 'Geriye doğru 5\'er sayarken: 45 — 40 — 35 — ?',
        subPrompt: 'Sıradaki sayıyı bul.',
        kozmoAdvice: 'Dikkat Kaptan, bu sefer geriye doğru sayıyoruz!',
        visualType: 'rhythmic',
        visualData: { sequence: [45, 40, 35, '?'] },
        correctAnswer: 30,
        options: [
          { id: 'opt-1', value: 30 },
          { id: 'opt-2', value: 25 },
          { id: 'opt-3', value: 32 },
        ],
        hintText: '35\'ten 5 eksiltirsek 30 kalır.',
      },
    ],
  },
  {
    id: 8,
    grade: '2',
    title: 'Çift Haneli Enerji Toplama',
    subtitle: 'Zihinden ve Basamaklı Toplama',
    pedagogicalObjective: 'İki Basamaklı ve Tek Basamaklı Sayıları Toplama',
    rewardName: 'Sonsuzluk Reaktör Çekirdeği',
    rewardCoins: 450,
    questions: [
      {
        id: '8-1',
        prompt: '24 + 5 işleminin sonucu kaçtır?',
        subPrompt: 'Birlikleri topla: 4 + 5 = 9, sonra onluğu ekle.',
        kozmoAdvice: 'Önce birlikleri birleştir, çok kolay olacak!',
        visualType: 'addition',
        visualData: { a: 24, b: 5 },
        correctAnswer: 29,
        options: [
          { id: 'opt-1', value: 28 },
          { id: 'opt-2', value: 29 },
          { id: 'opt-3', value: 30 },
        ],
        hintText: '24 + 5 = 29',
      },
      {
        id: '8-2',
        prompt: '32 + 14 = ?',
        subPrompt: 'Onlukları topla (30+10), birlikleri topla (2+4).',
        kozmoAdvice: '3 onluk + 1 onluk = 4 onluk (40). Birlikleri de ekle!',
        visualType: 'addition',
        visualData: { a: 32, b: 14 },
        correctAnswer: 46,
        options: [
          { id: 'opt-1', value: 44 },
          { id: 'opt-2', value: 46 },
          { id: 'opt-3', value: 48 },
        ],
        hintText: '40 + 6 = 46',
      },
      {
        id: '8-3',
        prompt: 'Eksik toplananı bul: 18 + ? = 25',
        subPrompt: '18\'e kaç eklersek 25 olur?',
        kozmoAdvice: '25\'ten 18 geriye sayabilir veya 18\'den 25\'e çıkabilirsin!',
        visualType: 'addition',
        visualData: { a: 18, total: 25 },
        correctAnswer: 7,
        options: [
          { id: 'opt-1', value: 6 },
          { id: 'opt-2', value: 7 },
          { id: 'opt-3', value: 8 },
        ],
        hintText: '18 + 2 = 20, 20 + 5 = 25. 2 + 5 = 7!',
      },
    ],
  },
  {
    id: 9,
    grade: '2',
    title: 'Gezegen Çıkarma Manevrası',
    subtitle: 'Onluk Bozmadan Çıkarma',
    pedagogicalObjective: 'İki Basamaklı Sayılarda Çıkarma Becerisi',
    rewardName: 'Işık Bükücü Motor',
    rewardCoins: 450,
    questions: [
      {
        id: '9-1',
        prompt: '48 asteroidin 6 tanesi rotadan saptı. Kaç asteroit kaldı?',
        subPrompt: '48 - 6 = ?',
        kozmoAdvice: 'Birliklerden 6 çıkar: 8 - 6 = 2!',
        visualType: 'subtraction',
        visualData: { a: 48, b: 6 },
        correctAnswer: 42,
        options: [
          { id: 'opt-1', value: 40 },
          { id: 'opt-2', value: 42 },
          { id: 'opt-3', value: 44 },
        ],
        hintText: '48 - 6 = 42',
      },
      {
        id: '9-2',
        prompt: '55 - 20 = ?',
        subPrompt: '5 onluktan 2 onluk çıkar: 3 onluk (30) kalır.',
        kozmoAdvice: 'Tam onluk çıkarma! Birlikler aynen kalır.',
        visualType: 'subtraction',
        visualData: { a: 55, b: 20 },
        correctAnswer: 35,
        options: [
          { id: 'opt-1', value: 35 },
          { id: 'opt-2', value: 25 },
          { id: 'opt-3', value: 45 },
        ],
        hintText: '55\'ten 20 çıkarırsan 35 kalır.',
      },
      {
        id: '9-3',
        prompt: '37 - 15 = ?',
        subPrompt: 'Birlikleri çıkar (7-5=2), onlukları çıkar (3-1=2).',
        kozmoAdvice: 'Son kapı şifresi Kaptan!',
        visualType: 'subtraction',
        visualData: { a: 37, b: 15 },
        correctAnswer: 22,
        options: [
          { id: 'opt-1', value: 20 },
          { id: 'opt-2', value: 22 },
          { id: 'opt-3', value: 24 },
        ],
        hintText: '2 onluk ve 2 birlik = 22',
      },
    ],
  },
  {
    id: 10,
    grade: '2',
    title: 'Büyük Galaksi Sandığı',
    subtitle: 'Ustalık Finali & Karışık Bulmaca',
    pedagogicalObjective: 'Örüntü, Dört İşlem ve Problem Çözme Sentezi',
    rewardName: 'Büyük Galaksi Hazine Sandığı',
    rewardCoins: 600,
    questions: [
      {
        id: '10-1',
        prompt: 'Gizli örüntüyü tamamla: 4 — 8 — 12 — ? — 20',
        subPrompt: 'Dörder artan uzay koordinatı.',
        kozmoAdvice: 'Dörder dörder ilerleyen ritmik sır!',
        visualType: 'pattern',
        visualData: { sequence: [4, 8, 12, '?', 20] },
        correctAnswer: 16,
        options: [
          { id: 'opt-1', value: 14 },
          { id: 'opt-2', value: 16 },
          { id: 'opt-3', value: 18 },
        ],
        hintText: '12 + 4 = 16',
      },
      {
        id: '10-2',
        prompt: 'Roket 25 altın, 15 mavi yakıt topladı. Toplam kaç enerji?',
        subPrompt: '25 + 15 = ?',
        kozmoAdvice: 'Birlikleri topla: 5 + 5 = 10! Bir onluk daha geldi!',
        visualType: 'addition',
        visualData: { a: 25, b: 15 },
        correctAnswer: 40,
        options: [
          { id: 'opt-1', value: 35 },
          { id: 'opt-2', value: 40 },
          { id: 'opt-3', value: 45 },
        ],
        hintText: '25 + 15 = 40 (Onluk tamamlama!)',
      },
      {
        id: '10-3',
        prompt: 'Hazine Sandığı Kilidi: 50 - 15 = ?',
        subPrompt: 'Sandığı açmak için son işlem!',
        kozmoAdvice: 'Büyük Galaksi Sandığı açılıyor! Son şifreyi gir Kaptan!',
        visualType: 'subtraction',
        visualData: { a: 50, b: 15 },
        correctAnswer: 35,
        options: [
          { id: 'opt-1', value: 30 },
          { id: 'opt-2', value: 35 },
          { id: 'opt-3', value: 40 },
        ],
        hintText: '50 - 10 = 40, 40 - 5 = 35!',
      },
    ],
  },
]

const PROGRESS_KEY = 'oxonom_uzay_seruveni_progress_v1'

export function loadSpaceProgress(): SpaceGameProgress {
  if (typeof window === 'undefined') return INITIAL_SPACE_PROGRESS
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) {
      saveSpaceProgress(INITIAL_SPACE_PROGRESS)
      return INITIAL_SPACE_PROGRESS
    }
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed.unlockedMission === 'number') {
      return {
        ...INITIAL_SPACE_PROGRESS,
        ...parsed,
        settings: {
          ...INITIAL_SPACE_PROGRESS.settings,
          ...(parsed.settings || {}),
        },
      }
    }
    return INITIAL_SPACE_PROGRESS
  } catch {
    return INITIAL_SPACE_PROGRESS
  }
}

export function saveSpaceProgress(prog: SpaceGameProgress): boolean {
  if (typeof window === 'undefined') return false
  try {
    prog.updatedAt = new Date().toISOString()
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(prog))
    window.dispatchEvent(new CustomEvent('oxonom_uzay_seruveni_updated', { detail: prog }))
    return true
  } catch {
    return false
  }
}

export function recordMissionWin(
  missionId: number,
  starsWon: number,
  coinsEarned: number,
  rewardName?: string
): SpaceGameProgress {
  const current = loadSpaceProgress()
  const completed = new Set(current.completedMissions)
  completed.add(missionId)

  const prevStars = current.missionStars[missionId] || 0
  const bestStars = Math.max(prevStars, starsWon)

  const opened = new Set(current.openedRewards)
  if (rewardName) opened.add(rewardName)

  const updated: SpaceGameProgress = {
    ...current,
    unlockedMission: Math.min(10, Math.max(current.unlockedMission, missionId + 1)),
    completedMissions: Array.from(completed),
    missionStars: {
      ...current.missionStars,
      [missionId]: bestStars,
    },
    totalCoins: current.totalCoins + coinsEarned,
    openedRewards: Array.from(opened),
    updatedAt: new Date().toISOString(),
  }

  saveSpaceProgress(updated)
  return updated
}

export function resetSpaceProgress(): SpaceGameProgress {
  saveSpaceProgress(INITIAL_SPACE_PROGRESS)
  return INITIAL_SPACE_PROGRESS
}
