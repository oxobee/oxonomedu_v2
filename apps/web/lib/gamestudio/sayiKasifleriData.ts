// apps/web/lib/gamestudio/sayiKasifleriData.ts
'use client'

export type WorldId = 'world-1' | 'world-2' | 'world-3' | 'world-4'

export interface LevelQuestion {
  prompt: string
  subPrompt?: string
  targetVisualType: 'number-blocks' | 'comparison' | 'number-line' | 'object-groups' | 'missing-addend' | 'pattern' | 'crystal-gates'
  visualData?: any
  correctAnswer: number | string
  options: Array<{ id: string; value: number | string; label?: string; visualCount?: number }>
  hintText: string
  mathPedagogy: string
}

export interface GameLevel {
  id: number
  worldId: WorldId
  worldName: string
  title: string
  subtitle: string
  concept: string
  pedagogicalObjective: string
  crystalColor: string
  crystalName: string
  questions: LevelQuestion[]
  requiredScore: number
}

export interface GameProgress {
  gameId: string
  version: number
  unlockedLevel: number
  completedLevels: number[]
  levelStars: Record<number, number>
  bestScores: Record<number, number>
  totalCrystals: number
  settings: {
    soundEnabled: boolean
    reducedMotion: boolean
  }
  updatedAt: string
}

export const INITIAL_GAME_PROGRESS: GameProgress = {
  gameId: 'sayi-kasifleri',
  version: 1,
  unlockedLevel: 1,
  completedLevels: [],
  levelStars: {},
  bestScores: {},
  totalCrystals: 0,
  settings: {
    soundEnabled: true,
    reducedMotion: false,
  },
  updatedAt: new Date().toISOString(),
}

export const WORLDS_CONFIG: Array<{
  id: WorldId
  number: number
  title: string
  themeName: string
  description: string
  color: string
  accentGradient: string
  bgGradient: string
  levels: number[]
}> = [
  {
    id: 'world-1',
    number: 1,
    title: 'Sayı Ormanı',
    themeName: 'Doğal Kristal Ormanı',
    description: 'Sayıları tanı, büyük-küçük karşılaştır ve onluk köprülerini kur.',
    color: '#38BDF8',
    accentGradient: 'from-[#0284C7] to-[#38BDF8]',
    bgGradient: 'from-[#0C1E3C] via-[#0F294D] to-[#0A1628]',
    levels: [1, 2, 3],
  },
  {
    id: 'world-2',
    number: 2,
    title: 'Toplama Vadisi',
    themeName: 'Enerji Pınarları & Vadiler',
    description: 'Parçaları birleştir, kayıp sayıları bul ve hareketli platformları çalıştır.',
    color: '#2DD4BF',
    accentGradient: 'from-[#0D9488] to-[#2DD4BF]',
    bgGradient: 'from-[#062E2E] via-[#0B3D3C] to-[#071E1F]',
    levels: [4, 5, 6],
  },
  {
    id: 'world-3',
    number: 3,
    title: 'Çıkarma Mağaraları',
    themeName: 'Derin Kristal Mağarası',
    description: 'Eksilen kristalleri hesapla, sayı doğrusunda geriye doğru sıçra.',
    color: '#A78BFA',
    accentGradient: 'from-[#7C3AED] to-[#A78BFA]',
    bgGradient: 'from-[#20103A] via-[#2F1554] to-[#150A26]',
    levels: [7, 8, 9],
  },
  {
    id: 'world-4',
    number: 4,
    title: 'Ustalık Adası',
    themeName: 'Büyük Kristal Tapınağı',
    description: 'Sayı örüntülerini tamamla ve 3 aşamalı büyük kristali uyandır.',
    color: '#FBBF24',
    accentGradient: 'from-[#D97706] to-[#FBBF24]',
    bgGradient: 'from-[#332007] via-[#482D08] to-[#1C1204]',
    levels: [10, 11, 12],
  },
]

export const ALL_12_LEVELS: GameLevel[] = [
  // ── DÜNYA 1: SAYI ORMANI ──
  {
    id: 1,
    worldId: 'world-1',
    worldName: 'Sayı Ormanı',
    title: 'Kristalin Uyanışı',
    subtitle: 'Sayıları Tanıma & İlk Eşleştirme',
    concept: '1-20 Arası Sayı Tanıma',
    pedagogicalObjective: 'İki basamaklı sayıları görsel ve sembolik olarak doğru eşleştirebilme.',
    crystalColor: '#38BDF8',
    crystalName: 'Mavi Orman Kristali',
    requiredScore: 300,
    questions: [
      {
        prompt: 'Ağaç kapısındaki sayıyı eşleştir: "15"',
        subPrompt: 'Orman kapısının kilidini açmak için 15 numaralı kristal taşını seç.',
        targetVisualType: 'object-groups',
        visualData: { count: 15, shape: 'star', color: '#38BDF8' },
        correctAnswer: 15,
        options: [
          { id: 'opt-1', value: 12 },
          { id: 'opt-2', value: 15 },
          { id: 'opt-3', value: 18 },
        ],
        hintText: '10 ile 5\'in toplamı olan sayıyı arıyoruz: 15!',
        mathPedagogy: 'MEB 2. Sınıf: 20\'ye kadar olan sayıları tanıma ve sembolle eşleme.',
      },
      {
        prompt: '18 kristal parçasını temsil eden sayıyı bul:',
        subPrompt: '10 adet mavi elmas + 8 adet sarı elmas parıldıyor.',
        targetVisualType: 'object-groups',
        visualData: { count: 18, shape: 'gem', color: '#38BDF8' },
        correctAnswer: 18,
        options: [
          { id: 'opt-1', value: 16 },
          { id: 'opt-2', value: 18 },
          { id: 'opt-3', value: 19 },
        ],
        hintText: 'Onluk gruptan sonra 8 birlik say: 11, 12... 18!',
        mathPedagogy: 'Görsel sayma ve iki basamaklı sayı kavrayışı.',
      },
    ],
  },
  {
    id: 2,
    worldId: 'world-1',
    worldName: 'Sayı Ormanı',
    title: 'Büyük mü, Küçük mü?',
    subtitle: 'Sayıları Karşılaştırma',
    concept: 'Büyüklük - Küçüklük İlişkisi',
    pedagogicalObjective: 'İki sayı arasındaki büyüklük ilişkisini kavrayıp doğru karar verebilme.',
    crystalColor: '#60A5FA',
    crystalName: 'Akarsu Kristali',
    requiredScore: 350,
    questions: [
      {
        prompt: 'Hangi sayı DAHA BÜYÜK?',
        subPrompt: 'Kapıyı açmak için daha yüksek enerjiye sahip olan büyük sayıyı eşleştir.',
        targetVisualType: 'comparison',
        visualData: { numA: 34, numB: 27 },
        correctAnswer: 34,
        options: [
          { id: 'opt-1', value: 27, label: '27' },
          { id: 'opt-2', value: 34, label: '34' },
        ],
        hintText: 'Onluk basamağına bak: 3 onluk, 2 onluktan daha büyüktür!',
        mathPedagogy: 'İki basamaklı doğal sayılarda basamak değerine göre karşılaştırma.',
      },
      {
        prompt: 'Hangi sayı DAHA KÜÇÜK?',
        subPrompt: 'Köprünün altından geçebilmek için daha hafif/küçük olan sayıyı seç.',
        targetVisualType: 'comparison',
        visualData: { numA: 42, numB: 49 },
        correctAnswer: 42,
        options: [
          { id: 'opt-1', value: 42, label: '42' },
          { id: 'opt-2', value: 49, label: '49' },
        ],
        hintText: 'Onlukları eşit (40). Birliklere bak: 2 birlik, 9 birlikten daha küçüktür.',
        mathPedagogy: 'Eşit onluklu sayılarda birlik karşılaştırma analizi.',
      },
    ],
  },
  {
    id: 3,
    worldId: 'world-1',
    worldName: 'Sayı Ormanı',
    title: 'Onluk Köprü',
    subtitle: 'Onluk ve Birlik Blokları',
    concept: 'Basamak Değeri & Onluk Gruplama',
    pedagogicalObjective: 'Sayıları onluk blok ve birlik küp modelleriyle görselleştirebilme.',
    crystalColor: '#38BDF8',
    crystalName: 'Köprü Muhafızı Kristali',
    requiredScore: 400,
    questions: [
      {
        prompt: 'Görseldeki model hangi sayıyı gösteriyor?',
        subPrompt: '2 adet Onluk Çubuk (10+10) ve 5 adet Birlik Küp.',
        targetVisualType: 'number-blocks',
        visualData: { tens: 2, ones: 5 },
        correctAnswer: 25,
        options: [
          { id: 'opt-1', value: 20 },
          { id: 'opt-2', value: 25 },
          { id: 'opt-3', value: 52 },
        ],
        hintText: '2 onluk = 20, 5 birlik = 5. Toplam: 20 + 5 = 25.',
        mathPedagogy: 'Model üzerinde onluk ve birlikleri çözümleme.',
      },
      {
        prompt: 'Görseldeki model hangi sayıyı gösteriyor?',
        subPrompt: '3 adet Onluk Çubuk (10+10+10) ve 7 adet Birlik Küp.',
        targetVisualType: 'number-blocks',
        visualData: { tens: 3, ones: 7 },
        correctAnswer: 37,
        options: [
          { id: 'opt-1', value: 37 },
          { id: 'opt-2', value: 73 },
          { id: 'opt-3', value: 30 },
        ],
        hintText: '3 onluk = 30 eder, 7 birlik eklersek 37 olur!',
        mathPedagogy: 'Onluk-birlik modellerinde basamak yer değiştirme yanılgılarını önleme.',
      },
    ],
  },

  // ── DÜNYA 2: TOPLAMA VADİSİ ──
  {
    id: 4,
    worldId: 'world-2',
    worldName: 'Toplama Vadisi',
    title: 'Parçaları Birleştir',
    subtitle: 'Görsel Nesnelerle Toplama',
    concept: 'Doğal Sayılarla Toplama İşlemi',
    pedagogicalObjective: 'Görsel nesne kümelerini birleştirerek toplam sonucunu belirleme.',
    crystalColor: '#2DD4BF',
    crystalName: 'Vadi Zümrütü',
    requiredScore: 450,
    questions: [
      {
        prompt: 'Kapıyı açmak için toplamı bul: 7 + 6 = ?',
        subPrompt: '7 adet parlayan turkuaz taş ile 6 adet yeşil taşı birleştir.',
        targetVisualType: 'object-groups',
        visualData: { countA: 7, countB: 6, operation: '+' },
        correctAnswer: 13,
        options: [
          { id: 'opt-1', value: 12 },
          { id: 'opt-2', value: 13 },
          { id: 'opt-3', value: 14 },
        ],
        hintText: '7\'nin üzerine 6 ekleyelim: 8, 9, 10, 11, 12, 13!',
        mathPedagogy: 'Eldeli toplama mantığına görsel hazırlık.',
      },
      {
        prompt: 'Platform enerjisini eşitle: 9 + 5 = ?',
        subPrompt: '9 kristal enerjisine 5 ünite enerji daha eklendiğinde sonuç ne olur?',
        targetVisualType: 'object-groups',
        visualData: { countA: 9, countB: 5, operation: '+' },
        correctAnswer: 14,
        options: [
          { id: 'opt-1', value: 14 },
          { id: 'opt-2', value: 15 },
          { id: 'opt-3', value: 13 },
        ],
        hintText: '9\'a 1 ekleyip 10 yap, kalan 4\'ü ekle: 14!',
        mathPedagogy: '10\'a tamamlama stratejisiyle zihinden toplama.',
      },
    ],
  },
  {
    id: 5,
    worldId: 'world-2',
    worldName: 'Toplama Vadisi',
    title: 'Kayıp Sayı',
    subtitle: 'Verilmeyen Toplananı Bulma',
    concept: 'Eksik Parçayı Tamamlama',
    pedagogicalObjective: 'Bir toplama işleminde verilmeyen toplananı çıkarma ve mantık bağıyla bulabilme.',
    crystalColor: '#14B8A6',
    crystalName: 'Denge Kristali',
    requiredScore: 500,
    questions: [
      {
        prompt: 'Teraziyi dengele: 8 + ? = 13',
        subPrompt: 'Terazinin sağ kefesinde 13 var. Sol kefede 8 var. Eksik olan kaç?',
        targetVisualType: 'missing-addend',
        visualData: { known: 8, total: 13 },
        correctAnswer: 5,
        options: [
          { id: 'opt-1', value: 4 },
          { id: 'opt-2', value: 5 },
          { id: 'opt-3', value: 6 },
        ],
        hintText: '8\'den 13\'e kadar ileriye doğru say: 9, 10, 11, 12, 13 -> 5 adım!',
        mathPedagogy: 'Verilmeyen toplananı bulmada ileri sayma ve çıkarma ilişkisi.',
      },
      {
        prompt: 'Geçit şifresi: ? + 7 = 16',
        subPrompt: 'Geçidi tamamlamak için 7 ile toplandığında 16 eden sayıyı seç.',
        targetVisualType: 'missing-addend',
        visualData: { known: 7, total: 16 },
        correctAnswer: 9,
        options: [
          { id: 'opt-1', value: 8 },
          { id: 'opt-2', value: 9 },
          { id: 'opt-3', value: 10 },
        ],
        hintText: '16\'dan 7 çıkarırsan kaç kalır? 9!',
        mathPedagogy: 'Ters işlem ilişkisini kavrama.',
      },
    ],
  },
  {
    id: 6,
    worldId: 'world-2',
    worldName: 'Toplama Vadisi',
    title: 'Hareketli Platformlar',
    subtitle: 'Onluk ve İki Basamaklı Toplama',
    concept: 'İki Basamaklı Sayılarda Toplama',
    pedagogicalObjective: 'Onluk blokları koruyarak iki basamaklı sayılarla toplamayı modelleyebilme.',
    crystalColor: '#059669',
    crystalName: 'Sonsuzluk Kayası',
    requiredScore: 550,
    questions: [
      {
        prompt: 'Platformu karşıya ulaştır: 24 + 10 = ?',
        subPrompt: 'Her 10 birimlik enerji platformu bir basamak ileri taşır.',
        targetVisualType: 'number-blocks',
        visualData: { tens: 3, ones: 4 },
        correctAnswer: 34,
        options: [
          { id: 'opt-1', value: 34 },
          { id: 'opt-2', value: 44 },
          { id: 'opt-3', value: 25 },
        ],
        hintText: '24\'e 1 onluk (10) eklersen onluk basamağı 3 olur, birlik aynı kalır: 34!',
        mathPedagogy: 'Onar onar zihinden ekleme kuralı.',
      },
      {
        prompt: 'Köprüyü tamamla: 32 + 15 = ?',
        subPrompt: '3 onluk + 1 onluk = 4 onluk. 2 birlik + 5 birlik = 7 birlik.',
        targetVisualType: 'number-blocks',
        visualData: { tens: 4, ones: 7 },
        correctAnswer: 47,
        options: [
          { id: 'opt-1', value: 45 },
          { id: 'opt-2', value: 47 },
          { id: 'opt-3', value: 57 },
        ],
        hintText: '30 + 10 = 40 ve 2 + 5 = 7 -> Toplam 47!',
        mathPedagogy: 'Eldesiz iki basamaklı toplama algoritması.',
      },
    ],
  },

  // ── DÜNYA 3: ÇIKARMA MAĞARALARI ──
  {
    id: 7,
    worldId: 'world-3',
    worldName: 'Çıkarma Mağaraları',
    title: 'Eksilen Kristaller',
    subtitle: 'Görsel Çıkarma İşlemi',
    concept: 'Gruptan Eksiltme & Azalma',
    pedagogicalObjective: 'Bir gruptan nesne çıkarıldığında kalan miktarı bulabilme.',
    crystalColor: '#A78BFA',
    crystalName: 'Ametist Kristali',
    requiredScore: 600,
    questions: [
      {
        prompt: 'Kalan kristalleri bul: 15 - 6 = ?',
        subPrompt: '15 kristalden 6 tanesi mağara geçidine enerji vererek kayboldu.',
        targetVisualType: 'object-groups',
        visualData: { countA: 15, countB: 6, operation: '-' },
        correctAnswer: 9,
        options: [
          { id: 'opt-1', value: 8 },
          { id: 'opt-2', value: 9 },
          { id: 'opt-3', value: 11 },
        ],
        hintText: '15\'ten 5 çıkarırsan 10 kalır, 1 daha çıkarırsan 9 kalır!',
        mathPedagogy: '10 referanslı basamaklı çıkarma stratejisi.',
      },
      {
        prompt: 'Mağara kapısını arala: 18 - 9 = ?',
        subPrompt: '18 birim güçten 9 birim kullanıldığında kalan miktar nedir?',
        targetVisualType: 'object-groups',
        visualData: { countA: 18, countB: 9, operation: '-' },
        correctAnswer: 9,
        options: [
          { id: 'opt-1', value: 8 },
          { id: 'opt-2', value: 9 },
          { id: 'opt-3', value: 10 },
        ],
        hintText: '9 + 9 = 18 olduğuna göre, 18\'den 9 çıkınca 9 kalır!',
        mathPedagogy: 'İkiz sayılar kuralından yararlanarak çıkarma yapma.',
      },
    ],
  },
  {
    id: 8,
    worldId: 'world-3',
    worldName: 'Çıkarma Mağaraları',
    title: 'Geriye Say',
    subtitle: 'Sayı Doğrusunda Çıkarma',
    concept: 'Sayı Doğrusu Modeli',
    pedagogicalObjective: 'Sayı doğrusunda geriye doğru adımlarla çıkarma işlemini modelleme.',
    crystalColor: '#C084FC',
    crystalName: 'Yankı Taşı',
    requiredScore: 650,
    questions: [
      {
        prompt: 'Sayı doğrusunda 20\'den 4 adım geriye git:',
        subPrompt: '20 noktasından başlayıp sola doğru 4 adım sıçra. Nereye geldin?',
        targetVisualType: 'number-line',
        visualData: { start: 20, steps: 4, direction: 'left', result: 16 },
        correctAnswer: 16,
        options: [
          { id: 'opt-1', value: 16 },
          { id: 'opt-2', value: 15 },
          { id: 'opt-3', value: 17 },
        ],
        hintText: 'Geriye sayalım: 19, 18, 17, 16! Cevap 16.',
        mathPedagogy: 'Sayı doğrusu üzerinde çıkarma işlemini uzamsal kavrama.',
      },
      {
        prompt: 'Sayı doğrusunda 25\'ten 10 adım geriye git:',
        subPrompt: '1 tam onluk geriye zıplayış: 25 - 10 = ?',
        targetVisualType: 'number-line',
        visualData: { start: 25, steps: 10, direction: 'left', result: 15 },
        correctAnswer: 15,
        options: [
          { id: 'opt-1', value: 14 },
          { id: 'opt-2', value: 15 },
          { id: 'opt-3', value: 20 },
        ],
        hintText: 'Onar geri sayma: 25\'ten 1 onluk eksiltirsek 15 kalır.',
        mathPedagogy: 'Zihinden onluk eksiltme kabiliyeti.',
      },
    ],
  },
  {
    id: 9,
    worldId: 'world-3',
    worldName: 'Çıkarma Mağaraları',
    title: 'Mağara Kapısı',
    subtitle: 'Hedef Sonucu Veren İşlemi Seç',
    concept: 'Çoklu İşlem Değerlendirme',
    pedagogicalObjective: 'Birden fazla işlem arasından hedeflenen sayıya eşit olanı bulabilme.',
    crystalColor: '#8B5CF6',
    crystalName: 'Derinlik Kristali',
    requiredScore: 700,
    questions: [
      {
        prompt: 'Hangi işlemin sonucu "12" eder?',
        subPrompt: 'Mağara kilidinin üzerinde 12 parlıyor. Bu kilidi hangi işlem açar?',
        targetVisualType: 'comparison',
        visualData: { target: 12 },
        correctAnswer: '17 - 5',
        options: [
          { id: 'opt-1', value: '17 - 5', label: '17 - 5' },
          { id: 'opt-2', value: '20 - 7', label: '20 - 7' },
          { id: 'opt-3', value: '15 - 4', label: '15 - 4' },
        ],
        hintText: '17\'den 5 çıkaralım: 17 - 5 = 12!',
        mathPedagogy: 'Eşitlik ve işlem sonuçlarını karşılaştırmalı test etme.',
      },
      {
        prompt: 'Hangi işlemin sonucu "20" eder?',
        subPrompt: 'Kristal meşalesini yakmak için 20 değerine ulaşan işlemi eşleştir.',
        targetVisualType: 'comparison',
        visualData: { target: 20 },
        correctAnswer: '28 - 8',
        options: [
          { id: 'opt-1', value: '25 - 6', label: '25 - 6' },
          { id: 'opt-2', value: '28 - 8', label: '28 - 8' },
          { id: 'opt-3', value: '30 - 12', label: '30 - 12' },
        ],
        hintText: '28\'in birler basamağındaki 8\'i çıkarırsak tam 20 kalır!',
        mathPedagogy: 'Onluğa yuvarlama ve çıkarma analizi.',
      },
    ],
  },

  // ── DÜNYA 4: USTALIK ADASI ──
  {
    id: 10,
    worldId: 'world-4',
    worldName: 'Ustalık Adası',
    title: 'Sayı Örüntüsü',
    subtitle: 'Kuralı Bul ve Örüntüyü Tamamla',
    concept: 'Artan ve Azalan Örüntüler',
    pedagogicalObjective: 'Ritmik artan ve azalan sayı örüntülerindeki kuralı keşfedip kayıp sayıyı tamamlama.',
    crystalColor: '#F59E0B',
    crystalName: 'Güneş Taşı',
    requiredScore: 750,
    questions: [
      {
        prompt: 'Örüntüdeki kayıp sayıyı bul: 4, 8, 12, ?, 20',
        subPrompt: 'Adım kuralı: Sayılar dörder dörder artıyor (+4).',
        targetVisualType: 'pattern',
        visualData: { sequence: [4, 8, 12, '?', 20], rule: '+4' },
        correctAnswer: 16,
        options: [
          { id: 'opt-1', value: 14 },
          { id: 'opt-2', value: 15 },
          { id: 'opt-3', value: 16 },
        ],
        hintText: '12\'ye 4 ekleyelim: 13, 14, 15, 16!',
        mathPedagogy: 'Dörder ritmik sayma ve örüntü tamamlama.',
      },
      {
        prompt: 'Geriye doğru örüntü: 30, 25, 20, ?, 10',
        subPrompt: 'Adım kuralı: Sayılar beşer beşer azalıyor (-5).',
        targetVisualType: 'pattern',
        visualData: { sequence: [30, 25, 20, '?', 10], rule: '-5' },
        correctAnswer: 15,
        options: [
          { id: 'opt-1', value: 15 },
          { id: 'opt-2', value: 16 },
          { id: 'opt-3', value: 18 },
        ],
        hintText: '20\'den 5 geri sayarsak 15 kalır!',
        mathPedagogy: 'Beşer geriye ritmik sayma ve azalan örüntü mantığı.',
      },
    ],
  },
  {
    id: 11,
    worldId: 'world-4',
    worldName: 'Ustalık Adası',
    title: 'Karışık Mekanizmalar',
    subtitle: 'Toplama, Çıkarma ve Karşılaştırma',
    concept: 'Entegre Çoklu Problem Çözme',
    pedagogicalObjective: 'Öğrenilen temel işlemleri birleştirerek ardışık bulmacaları çözebilme.',
    crystalColor: '#EAB308',
    crystalName: 'Altın Muhafız Kristali',
    requiredScore: 800,
    questions: [
      {
        prompt: '1. Kilit: (14 + 6) - 5 işleminin sonucu nedir?',
        subPrompt: 'Önce parantezdeki toplamayı yap (14+6=20), sonra 5 çıkar!',
        targetVisualType: 'object-groups',
        visualData: { step1: '14 + 6 = 20', step2: '20 - 5 = ?' },
        correctAnswer: 15,
        options: [
          { id: 'opt-1', value: 14 },
          { id: 'opt-2', value: 15 },
          { id: 'opt-3', value: 16 },
        ],
        hintText: '14 + 6 = 20 eder. 20\'den 5 çıkarırsan 15 kalır!',
        mathPedagogy: 'İki aşamalı basit zihinsel işlem akışı.',
      },
      {
        prompt: '2. Kilit: Hangi kutu en büyük değere sahiptir?',
        subPrompt: 'A: 25+5 (30), B: 40-8 (32), C: 15+15 (30)',
        targetVisualType: 'comparison',
        visualData: { boxA: '25 + 5', boxB: '40 - 8', boxC: '15 + 15' },
        correctAnswer: '40 - 8',
        options: [
          { id: 'opt-1', value: '25 + 5', label: '25 + 5 (30)' },
          { id: 'opt-2', value: '40 - 8', label: '40 - 8 (32)' },
          { id: 'opt-3', value: '15 + 15', label: '15 + 15 (30)' },
        ],
        hintText: '40 - 8 = 32 eder ve 30\'dan daha büyüktür!',
        mathPedagogy: 'İşlem sonuçlarını zihinde tutup büyüklük karşılaştırması yapma.',
      },
    ],
  },
  {
    id: 12,
    worldId: 'world-4',
    worldName: 'Ustalık Adası',
    title: 'Büyük Kristal: Uyanış',
    subtitle: 'Büyük Final — 3 Aşamalı Ustalık Sınavı',
    concept: 'Kishōtenketsu Final & Tüm Becerilerin Birleşimi',
    pedagogicalObjective: 'Öğrenilen tüm 2. sınıf matematik kazanımlarını sergileyip büyük kristali etkinleştirme.',
    crystalColor: '#FBBF24',
    crystalName: 'KADİM ENERJİ KRİSTALİ',
    requiredScore: 900,
    questions: [
      {
        prompt: 'Aşama 1/3: 3 Onluk ve 4 Birlik kaç eder?',
        subPrompt: 'Büyük kristalin tabanını etkinleştirmek için sayıyı oluştur.',
        targetVisualType: 'number-blocks',
        visualData: { tens: 3, ones: 4 },
        correctAnswer: 34,
        options: [
          { id: 'opt-1', value: 34 },
          { id: 'opt-2', value: 43 },
          { id: 'opt-3', value: 30 },
        ],
        hintText: '3 onluk = 30, 4 birlik = 4. Sayımız 34!',
        mathPedagogy: 'Final Aşama 1: Basamak analizi ustalığı.',
      },
      {
        prompt: 'Aşama 2/3: Kristal çekirdeği dengesi: 18 + ? = 25',
        subPrompt: 'Enerji akışını tamamlamak için verilmeyen sayıyı bul.',
        targetVisualType: 'missing-addend',
        visualData: { known: 18, total: 25 },
        correctAnswer: 7,
        options: [
          { id: 'opt-1', value: 6 },
          { id: 'opt-2', value: 7 },
          { id: 'opt-3', value: 8 },
        ],
        hintText: '18\'den 25\'e: 19, 20, 21, 22, 23, 24, 25 -> 7 adım!',
        mathPedagogy: 'Final Aşama 2: Verilmeyen toplanan ve stratejik tamamlama.',
      },
      {
        prompt: 'Aşama 3/3 (Büyük Uyanış): 50 - 15 = ?',
        subPrompt: 'Tüm adaların enerjisini açacak son işlemi doğru eşleştir!',
        targetVisualType: 'object-groups',
        visualData: { countA: 50, countB: 15, operation: '-' },
        correctAnswer: 35,
        options: [
          { id: 'opt-1', value: 30 },
          { id: 'opt-2', value: 35 },
          { id: 'opt-3', value: 40 },
        ],
        hintText: '50\'den 10 çıkarırsan 40, 5 daha çıkarırsan 35 kalır!',
        mathPedagogy: 'Final Aşama 3: İki basamaklı stratejik çıkarma ile ustalık tacı.',
      },
    ],
  },
]

const PROGRESS_STORAGE_KEY = 'oxonom_game_sayi_kasifleri_v1'

/**
 * Safely load player progression from localStorage
 */
export function loadGameProgress(): GameProgress {
  if (typeof window === 'undefined') return INITIAL_GAME_PROGRESS
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY)
    if (!raw) {
      saveGameProgress(INITIAL_GAME_PROGRESS)
      return INITIAL_GAME_PROGRESS
    }
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed.unlockedLevel === 'number') {
      return {
        ...INITIAL_GAME_PROGRESS,
        ...parsed,
        settings: {
          ...INITIAL_GAME_PROGRESS.settings,
          ...(parsed.settings || {}),
        },
      }
    }
    return INITIAL_GAME_PROGRESS
  } catch (err) {
    console.warn('Game progress load error (using fallback):', err)
    return INITIAL_GAME_PROGRESS
  }
}

/**
 * Safely save player progression to localStorage
 */
export function saveGameProgress(progress: GameProgress): boolean {
  if (typeof window === 'undefined') return false
  try {
    progress.updatedAt = new Date().toISOString()
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress))
    window.dispatchEvent(new CustomEvent('oxonom_sayi_kasifleri_progress_updated', { detail: progress }))
    return true
  } catch (err) {
    console.error('Failed to save progress:', err)
    return false
  }
}

/**
 * Record a level completion with stars & scores
 */
export function recordLevelCompletion(
  levelId: number,
  earnedStars: number,
  score: number,
  crystalsWon: number
): GameProgress {
  const current = loadGameProgress()

  const completedSet = new Set(current.completedLevels)
  completedSet.add(levelId)

  // Keep best stars
  const previousStars = current.levelStars[levelId] || 0
  const bestStars = Math.max(previousStars, earnedStars)

  // Keep best score
  const previousScore = current.bestScores[levelId] || 0
  const bestScore = Math.max(previousScore, score)

  // Unlock next level up to 12
  const nextLevel = Math.min(12, Math.max(current.unlockedLevel, levelId + 1))

  // Add crystals once or incrementally
  const newCrystals = current.totalCrystals + crystalsWon

  const updated: GameProgress = {
    ...current,
    unlockedLevel: nextLevel,
    completedLevels: Array.from(completedSet),
    levelStars: {
      ...current.levelStars,
      [levelId]: bestStars,
    },
    bestScores: {
      ...current.bestScores,
      [levelId]: bestScore,
    },
    totalCrystals: newCrystals,
    updatedAt: new Date().toISOString(),
  }

  saveGameProgress(updated)
  return updated
}

/**
 * Reset progression
 */
export function resetGameProgress(): GameProgress {
  saveGameProgress(INITIAL_GAME_PROGRESS)
  return INITIAL_GAME_PROGRESS
}
