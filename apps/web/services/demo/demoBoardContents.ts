// Pre-populated rich pedagogical demo boards for Turkish schools (MEB curriculum)

export interface DemoBoardDocument {
  type: 'doc'
  content: any[]
}

/**
 * Generates rich, interactive initial canvas content (cards, sticky notes, todo lists, stickers, drawings)
 * based on the subject and grade level of the board.
 */
export function getDemoBoardInitialContent(board: any): DemoBoardDocument {
  if (board?.blank || board?.is_blank || board?.features?.blank || board?.is_custom) {
    return { type: 'doc', content: [] }
  }

  const uuid = (board?.board_uuid || '').toLowerCase()
  const name = (board?.name || '').toLowerCase()
  const desc = (board?.description || '').toLowerCase()
  const subject = (board?.features?.subject || '').toLowerCase()

  // 1. Türkçe / Edebiyat / Okuma
  if (
    uuid.includes('turkce') ||
    name.includes('türkçe') ||
    name.includes('turkce') ||
    desc.includes('türkçe') ||
    subject.includes('türkçe')
  ) {
    const isMiddle = name.includes('5-') || name.includes('6-') || name.includes('7-') || name.includes('8-') || name.includes('paragraf') || name.includes('sözel')
    return isMiddle ? getMiddleTurkceContent(board) : getPrimaryTurkceContent(board)
  }

  // 2. Matematik
  if (
    uuid.includes('mat') ||
    name.includes('matematik') ||
    desc.includes('matematik') ||
    subject.includes('matematik')
  ) {
    const isMiddle = name.includes('5-') || name.includes('6-') || name.includes('7-') || name.includes('8-') || name.includes('cebir') || name.includes('lgs')
    return isMiddle ? getMiddleMatContent(board) : getPrimaryMatContent(board)
  }

  // 3. Hayat Bilgisi & Fen Bilimleri
  if (
    uuid.includes('hayat') ||
    uuid.includes('fen') ||
    name.includes('hayat') ||
    name.includes('fen') ||
    desc.includes('hayat') ||
    desc.includes('fen')
  ) {
    const isMiddle = name.includes('5-') || name.includes('6-') || name.includes('7-') || name.includes('8-') || name.includes('kuvvet') || name.includes('hücre')
    return isMiddle ? getMiddleFenContent(board) : getPrimaryHayatContent(board)
  }

  // 4. Sınıf Panosu & LGS / Rehberlik
  if (
    uuid.includes('pano') ||
    uuid.includes('lgs') ||
    name.includes('pano') ||
    name.includes('nöbet') ||
    name.includes('rehberlik') ||
    desc.includes('pano')
  ) {
    const isLgs = uuid.includes('lgs') || name.includes('lgs')
    return isLgs ? getLgsPanoContent(board) : getClassPanoContent(board)
  }

  // 5. Edebiyat (Divan Edebiyatı etc.)
  if (name.includes('edebiyat') || name.includes('divan') || desc.includes('divan')) {
    return getDivanEdebiyatiContent(board)
  }

  // 6. Fizik Laboratuvarı
  if (name.includes('fizik') || name.includes('elektrik') || desc.includes('elektrik')) {
    return getFizikDevreleriContent(board)
  }

  // 7. Kimya
  if (name.includes('kimya') || name.includes('periyodik') || desc.includes('lewis')) {
    return getKimyaContent(board)
  }

  // Fallback: General interactive classroom board
  return getPrimaryTurkceContent(board)
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. PRIMARY TÜRKÇE (1-4. Sınıf)
// ─────────────────────────────────────────────────────────────────────────────
function getPrimaryTurkceContent(board: any): DemoBoardDocument {
  const teacher = board?.description?.includes('Öğretmen:')
    ? board.description.split('.')[0]
    : 'Öğretmen: Özlem ZOR'

  return {
    type: 'doc',
    content: [
      // Ana Okuma ve 5N1K Kartı
      {
        type: 'boardCard',
        attrs: { x: 80, y: 80, width: 440, height: 330, color: '#ffffff', zIndex: 1 },
        content: [
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: '📖 Okuma & Anlama: Küçük Karınca ve Güneş' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Küçük Karınca sabah erkenden yuvasından çıktı. Gökyüzündeki sıcacık güneşe neşeyle gülümsedi. Ormandaki arkadaşları Uğur Böceği ve Minik Arı ile buluşup rengarenk çiçeklerden polen toplamaya başladılar.\n\n',
              },
              {
                type: 'text',
                marks: [{ type: 'bold' }],
                text: '🎯 5N1K Çözüm Tablosu:\n',
              },
              { type: 'text', text: '• Kim? -> Küçük Karınca ve sevimli dostları\n' },
              { type: 'text', text: '• Ne zaman? -> Sabahın erken saatlerinde\n' },
              { type: 'text', text: '• Nerede? -> Çiçekli orman patikasında\n' },
              { type: 'text', text: '• Ne yaptı? -> Yuvasından çıkıp polen topladı\n' },
              { type: 'text', text: '• Niçin? -> Kış için neşeyle hazırlık yapmak amacıyla' },
            ],
          },
        ],
      },

      // Öğretmen Sarı Notu
      {
        type: 'noteBlock',
        attrs: { x: 550, y: 80, width: 280, height: 220, color: 'yellow', zIndex: 2 },
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', marks: [{ type: 'bold' }], text: '📌 ' + teacher + '\n\n' },
              {
                type: 'text',
                text: 'Sevgili öğrenciler, cümlelerimize daima BÜYÜK harfle başlıyoruz. Cümlenin sonuna nokta (.) koymayı unutmuyoruz. Bir hecede sadece bir tane sesli harf bulunur!',
              },
            ],
          },
        ],
      },

      // Görev Listesi (To-do)
      {
        type: 'todoBlock',
        attrs: {
          x: 860,
          y: 80,
          width: 300,
          height: 300,
          color: 'blue',
          zIndex: 1,
          title: '📋 Türkçe Ders Görevleri',
          items: [
            { id: 't1', text: 'Metni öğretmenle birlikte 2 kez sesli oku', done: true },
            { id: 't2', text: '5N1K sorularını tahtaya yaz', done: true },
            { id: 't3', text: 'Bilinmeyen 3 kelimeyi defterine hecele', done: false },
            { id: 't4', text: 'Ev ödevi: Çalışma kağıdı sayfa 14', done: false },
          ],
        },
      },

      // Heceleme ve Cümle Bilgisi Kartı
      {
        type: 'boardCard',
        attrs: { x: 80, y: 440, width: 440, height: 260, color: '#f8fafc', zIndex: 1 },
        content: [
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: '🔤 Heceleme ve Dil Bilgisi Kuralları' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', marks: [{ type: 'bold' }], text: 'Örnek Kelimeleri Hecelerine Ayıralım:\n' },
              { type: 'text', text: '• ka - rın - ca  (3 hece)\n' },
              { type: 'text', text: '• gök - yü - zü  (3 hece)\n' },
              { type: 'text', text: '• ar - ka - daş  (3 hece)\n' },
              { type: 'text', text: '• o - kul  (2 hece)\n\n' },
              { type: 'text', marks: [{ type: 'italic' }], text: 'İpucu: Kelimedeki ünlü (sesli) harf sayısı, o kelimenin hece sayısına eşittir.' },
            ],
          },
        ],
      },

      // Haftanın Yıldızı Pembe Not
      {
        type: 'noteBlock',
        attrs: { x: 550, y: 330, width: 280, height: 210, color: 'pink', zIndex: 2 },
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', marks: [{ type: 'bold' }], text: '🌟 Haftanın Yıldız Okuyucusu:\n\n' },
              {
                type: 'text',
                text: 'Erçil Evren UĞURLU tebrikler!\n1 dakikada 68 kelimeyi hatasız ve noktalama işaretlerine dikkat ederek okudun.',
              },
            ],
          },
        ],
      },

      // Hand-drawn checkmark / underline
      {
        type: 'drawingStroke',
        attrs: {
          x: 860,
          y: 410,
          pathData: 'M 20 50 L 55 85 L 130 25',
          strokeColor: '#10b981',
          strokeWidth: 4,
          viewBox: '0 0 150 110',
        },
      },

      // Stickerlar
      { type: 'stickerBlock', attrs: { x: 540, y: 570, emoji: '🌟' } },
      { type: 'stickerBlock', attrs: { x: 630, y: 570, emoji: '📚' } },
      { type: 'stickerBlock', attrs: { x: 720, y: 570, emoji: '🏆' } },
      { type: 'stickerBlock', attrs: { x: 810, y: 570, emoji: '✏️' } },
    ],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. PRIMARY MATEMATİK (1-4. Sınıf)
// ─────────────────────────────────────────────────────────────────────────────
function getPrimaryMatContent(board: any): DemoBoardDocument {
  const teacher = board?.description?.includes('Öğretmen:')
    ? board.description.split('.')[0]
    : 'Öğretmen: Mehmet Akif YEŞİLYURT'

  return {
    type: 'doc',
    content: [
      // Ritmik Sayma Kartı
      {
        type: 'boardCard',
        attrs: { x: 80, y: 80, width: 440, height: 320, color: '#ffffff', zIndex: 1 },
        content: [
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: '🔢 Ritmik Sayma & Basamak Değerleri' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', marks: [{ type: 'bold' }], text: 'İkişer Ritmik Sayma (1-20):\n' },
              { type: 'text', text: '2 - 4 - 6 - 8 - 10 - 12 - 14 - 16 - 18 - 20\n\n' },
              { type: 'text', marks: [{ type: 'bold' }], text: 'Beşer Ritmik Sayma (1-50):\n' },
              { type: 'text', text: '5 - 10 - 15 - 20 - 25 - 30 - 35 - 40 - 45 - 50\n\n' },
              { type: 'text', marks: [{ type: 'bold' }], text: 'Onar Ritmik Sayma (1-100):\n' },
              { type: 'text', text: '10 - 20 - 30 - 40 - 50 - 60 - 70 - 80 - 90 - 100' },
            ],
          },
        ],
      },

      // Yeşil Altın Kural Notu
      {
        type: 'noteBlock',
        attrs: { x: 550, y: 80, width: 280, height: 220, color: 'green', zIndex: 2 },
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', marks: [{ type: 'bold' }], text: '💡 ' + teacher + '\n\n' },
              {
                type: 'text',
                text: 'Altın Kural: Toplama işleminde toplanan sayıların yerleri değişse de TOPLAM asla değişmez!\n\n7 + 5 = 12\n5 + 7 = 12',
              },
            ],
          },
        ],
      },

      // Matematik To-do
      {
        type: 'todoBlock',
        attrs: {
          x: 860,
          y: 80,
          width: 300,
          height: 300,
          color: 'orange',
          zIndex: 1,
          title: '📐 Matematik Görevleri',
          items: [
            { id: 'm1', text: 'İkişer ritmik saymayı tahtada tamamla', done: true },
            { id: 'm2', text: 'Onluk ve birlik blokları eşleştir', done: true },
            { id: 'm3', text: '5 problem çözümünü deftere geçir', done: false },
            { id: 'm4', text: 'Ödev: Matematik çalışma kitabı sf. 28', done: false },
          ],
        },
      },

      // Örnek Problem Kartı
      {
        type: 'boardCard',
        attrs: { x: 80, y: 430, width: 440, height: 270, color: '#f8fafc', zIndex: 1 },
        content: [
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: '🍎 Örnek Problem ve Çözüm Adımları' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Soru: Ali kırtasiyeden 8 tane kurşun kalem, 6 tane de pastel boya kalemi aldı. Ali toplam kaç kalem almıştır?\n\n',
              },
              { type: 'text', marks: [{ type: 'bold' }], text: 'Adım 1 (Verilenler): ' },
              { type: 'text', text: '8 kurşun kalem, 6 pastel boya\n' },
              { type: 'text', marks: [{ type: 'bold' }], text: 'Adım 2 (İşlem): ' },
              { type: 'text', text: '8 + 6 = 14 kalem\n' },
              { type: 'text', marks: [{ type: 'bold' }], text: 'Adım 3 (Kontrol): ' },
              { type: 'text', text: '14 - 6 = 8 (Sonuç Doğru! ✅)' },
            ],
          },
        ],
      },

      // Sarı İpucu Notu
      {
        type: 'noteBlock',
        attrs: { x: 550, y: 330, width: 280, height: 200, color: 'yellow', zIndex: 2 },
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', marks: [{ type: 'bold' }], text: '⚡ Zihinden Toplama İpucu:\n\n' },
              {
                type: 'text',
                text: 'Büyük sayıyı aklında tut, küçük sayıyı parmaklarınla üzerine say!\n\n9 + 4 -> "Dokuz" dedik: 10, 11, 12, 13!',
              },
            ],
          },
        ],
      },

      // Hand-drawn arrow
      {
        type: 'drawingStroke',
        attrs: {
          x: 860,
          y: 410,
          pathData: 'M 10 30 Q 60 10 120 35 T 220 25',
          strokeColor: '#f97316',
          strokeWidth: 3,
          viewBox: '0 0 240 60',
        },
      },

      // Stickers
      { type: 'stickerBlock', attrs: { x: 540, y: 560, emoji: '📐' } },
      { type: 'stickerBlock', attrs: { x: 630, y: 560, emoji: '🎯' } },
      { type: 'stickerBlock', attrs: { x: 720, y: 560, emoji: '🏆' } },
      { type: 'stickerBlock', attrs: { x: 810, y: 560, emoji: '🔢' } },
    ],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. PRIMARY HAYAT BİLGİSİ & FEN (1-4. Sınıf)
// ─────────────────────────────────────────────────────────────────────────────
function getPrimaryHayatContent(board: any): DemoBoardDocument {
  return {
    type: 'doc',
    content: [
      {
        type: 'boardCard',
        attrs: { x: 80, y: 80, width: 440, height: 320, color: '#ffffff', zIndex: 1 },
        content: [
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: '🌍 Dünyamızın Katmanları & Mevsimler' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', marks: [{ type: 'bold' }], text: "Dünya'mızın Katmanları:\n" },
              { type: 'text', text: '1. Hava Katmanı (Atmosfer) -> Soluduğumuz hava\n' },
              { type: 'text', text: '2. Su Katmanı -> Denizler, göller ve okyanuslar\n' },
              { type: 'text', text: '3. Kara Katmanı -> Üzerinde yaşadığımız toprak ve dağlar\n' },
              { type: 'text', text: '4. Çekirdek ve Magma -> Dünyamızın sıcak merkezi\n\n' },
              { type: 'text', marks: [{ type: 'bold' }], text: '4 Mevsim: ' },
              { type: 'text', text: 'Sonbahar 🍂 • Kış ❄️ • İlkbahar 🌸 • Yaz ☀️' },
            ],
          },
        ],
      },
      {
        type: 'noteBlock',
        attrs: { x: 550, y: 80, width: 280, height: 220, color: 'blue', zIndex: 2 },
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', marks: [{ type: 'bold' }], text: '🌱 Canlıların Temel İhtiyaçları:\n\n' },
              {
                type: 'text',
                text: '• Temiz Hava (Oksijen)\n• Su\n• Besin\n• Güneş Işığı\n• Yaşam Alanı (Barınak)\n\nTüm canlılar çevreleriyle sürekli uyum içindedir.',
              },
            ],
          },
        ],
      },
      {
        type: 'todoBlock',
        attrs: {
          x: 860,
          y: 80,
          width: 300,
          height: 300,
          color: 'green',
          zIndex: 1,
          title: '🔬 Fen & Gözlem Görevleri',
          items: [
            { id: 'h1', text: 'Fasulye çimlendirme kabını pamukla hazırla', done: true },
            { id: 'h2', text: 'Her gün pamuğa 1 kaşık su ver', done: true },
            { id: 'h3', text: 'İlk filizlenmeyi günlüğüne çiz', done: false },
            { id: 'h4', text: 'Geri dönüşüm kutularını sınıfta grupla', done: false },
          ],
        },
      },
      {
        type: 'boardCard',
        attrs: { x: 80, y: 430, width: 440, height: 260, color: '#f8fafc', zIndex: 1 },
        content: [
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: '🥗 Sağlıklı Yaşam ve Dengeli Beslenme' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: '• Günde en az 8 bardak su içmeliyiz.\n' },
              { type: 'text', text: '• Sebze ve meyveleri mevsiminde bolca tüketmeliyiz.\n' },
              { type: 'text', text: '• Günde en az 9-10 saat düzenli uyumalıyız.\n' },
              { type: 'text', text: '• Yemekten önce ve sonra ellerimizi sabunla en az 20 saniye yıkamalıyız.\n' },
              { type: 'text', text: '• Açık havada hareket ve spor yapmayı ihmal etmemeliyiz.' },
            ],
          },
        ],
      },
      {
        type: 'noteBlock',
        attrs: { x: 550, y: 330, width: 280, height: 200, color: 'green', zIndex: 2 },
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', marks: [{ type: 'bold' }], text: '♻️ Doğayı Koruyalım:\n\n' },
              {
                type: 'text',
                text: 'Kağıt, cam, plastik ve pilleri ayrı geri dönüşüm kutularına atıyoruz. Temiz bir dünya hepimizin elinde!',
              },
            ],
          },
        ],
      },
      { type: 'stickerBlock', attrs: { x: 540, y: 560, emoji: '🌱' } },
      { type: 'stickerBlock', attrs: { x: 630, y: 560, emoji: '🌍' } },
      { type: 'stickerBlock', attrs: { x: 720, y: 560, emoji: '☀️' } },
      { type: 'stickerBlock', attrs: { x: 810, y: 560, emoji: '💧' } },
    ],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. SINIF PANOSU & NÖBETÇİ LİSTESİ
// ─────────────────────────────────────────────────────────────────────────────
function getClassPanoContent(board: any): DemoBoardDocument {
  const className = board?.name?.split(' ')[0] || '1-A'

  return {
    type: 'doc',
    content: [
      {
        type: 'boardCard',
        attrs: { x: 80, y: 80, width: 440, height: 320, color: '#ffffff', zIndex: 1 },
        content: [
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: `📌 ${className} Haftalık Ders Programı & Duyurular` }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', marks: [{ type: 'bold' }], text: 'Haftalık Akış:\n' },
              { type: 'text', text: '• Pazartesi: Bayrak Töreni, Türkçe, Matematik\n' },
              { type: 'text', text: '• Salı: Türkçe, Görsel Sanatlar, Müzik\n' },
              { type: 'text', text: '• Çarşamba: Matematik, Hayat Bilgisi, Beden Eğitimi\n' },
              { type: 'text', text: '• Perşembe: Türkçe, Oyun & Etkinlik, Serbest Zaman\n' },
              { type: 'text', text: '• Cuma: Haftalık Değerlendirme, Kütüphane Saati\n\n' },
              { type: 'text', marks: [{ type: 'bold' }], text: '📢 Önemli Duyuru: ' },
              { type: 'text', text: 'Cuma günü 4. derste okul bahçesinde sonbahar fidan dikimi yapılacaktır.' },
            ],
          },
        ],
      },
      {
        type: 'noteBlock',
        attrs: { x: 550, y: 80, width: 280, height: 220, color: 'pink', zIndex: 2 },
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', marks: [{ type: 'bold' }], text: '📋 Haftanın Nöbetçi Öğrencileri:\n\n' },
              {
                type: 'text',
                text: '• Erçil Evren UĞURLU (1. Sıra)\n• Zeynep KAYA (2. Sıra)\n\nGörevler: Ders aralarında tahtayı temizlemek, sınıf havalandırmasını sağlamak ve düzeni korumak.',
              },
            ],
          },
        ],
      },
      {
        type: 'todoBlock',
        attrs: {
          x: 860,
          y: 80,
          width: 300,
          height: 300,
          color: 'purple',
          zIndex: 1,
          title: '🌟 Sınıf Yıldız Hedefleri',
          items: [
            { id: 'p1', text: 'Zil çaldığında yerimize oturmak', done: true },
            { id: 'p2', text: 'Parmak kaldırarak söz almak', done: true },
            { id: 'p3', text: 'Kitap okuma saatini aksatmamak', done: true },
            { id: 'p4', text: 'Haftanın en temiz sırası ödülü', done: false },
          ],
        },
      },
      {
        type: 'boardCard',
        attrs: { x: 80, y: 430, width: 440, height: 250, color: '#f8fafc', zIndex: 1 },
        content: [
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: '🏆 Ayın Örnek Öğrencisi Köşesi' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', marks: [{ type: 'bold' }], text: 'Tebrikler: Erçil Evren UĞURLU 🎖️\n\n' },
              {
                type: 'text',
                text: 'Kazanımlar: Sorumluluk bilinci, arkadaşlarına karşı nazik yaklaşımı, düzenli ve zamanında ödev teslimi ile sınıfımıza örnek oldu.\n\nBaşarılarının ve örnek davranışlarının devamını dileriz.',
              },
            ],
          },
        ],
      },
      { type: 'stickerBlock', attrs: { x: 540, y: 340, emoji: '🎖️' } },
      { type: 'stickerBlock', attrs: { x: 630, y: 340, emoji: '🌈' } },
      { type: 'stickerBlock', attrs: { x: 720, y: 340, emoji: '⭐' } },
      { type: 'stickerBlock', attrs: { x: 810, y: 340, emoji: '🏅' } },
    ],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. MIDDLE SCHOOL MATEMATİK (5-8. Sınıf / LGS)
// ─────────────────────────────────────────────────────────────────────────────
function getMiddleMatContent(board: any): DemoBoardDocument {
  return {
    type: 'doc',
    content: [
      {
        type: 'boardCard',
        attrs: { x: 80, y: 80, width: 450, height: 330, color: '#ffffff', zIndex: 1 },
        content: [
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: '📐 Cebirsel İfadeler & Birinci Dereceden Denklemler' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', marks: [{ type: 'bold' }], text: 'Denklem Çözme Kuralları:\n' },
              { type: 'text', text: '1. Eşitliğin her iki tarafına aynı sayı eklenebilir veya çıkarılabilir.\n' },
              { type: 'text', text: '2. Eşitliğin her iki tarafı sıfırdan farklı aynı sayı ile çarpılabilir / bölünebilir.\n\n' },
              { type: 'text', marks: [{ type: 'bold' }], text: 'Örnek Soru: ' },
              { type: 'text', text: '4x - 7 = 2x + 13 denklemini çözelim.\n' },
              { type: 'text', text: '-> 4x - 2x = 13 + 7\n' },
              { type: 'text', text: '-> 2x = 20\n' },
              { type: 'text', marks: [{ type: 'bold' }], text: '-> x = 10 ✅' },
            ],
          },
        ],
      },
      {
        type: 'noteBlock',
        attrs: { x: 560, y: 80, width: 280, height: 220, color: 'yellow', zIndex: 2 },
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', marks: [{ type: 'bold' }], text: '⚠️ LGS Yeni Nesil İpucu:\n\n' },
              {
                type: 'text',
                text: 'Parantez önündeki eksi (-) işareti parantez içindeki bütün terimlerin işaretini değiştirir:\n\n-(3x - 5) = -3x + 5\n\nİşaret hatası yapmamak için parantezi adım adım açın!',
              },
            ],
          },
        ],
      },
      {
        type: 'todoBlock',
        attrs: {
          x: 870,
          y: 80,
          width: 300,
          height: 300,
          color: 'blue',
          zIndex: 1,
          title: '🎯 LGS Matematik Hedefleri',
          items: [
            { id: 'lm1', text: 'Konu kavrama testi (20 soru)', done: true },
            { id: 'lm2', text: 'MEB Örnek Soruları çözümü', done: true },
            { id: 'lm3', text: 'Yeni nesil sayısal mantık soruları (10 soru)', done: false },
            { id: 'lm4', text: 'Haftalık LGS Matematik Denemesi', done: false },
          ],
        },
      },
      {
        type: 'drawingStroke',
        attrs: {
          x: 870,
          y: 410,
          pathData: 'M 20 50 L 55 85 L 130 25',
          strokeColor: '#3b82f6',
          strokeWidth: 4,
          viewBox: '0 0 150 110',
        },
      },
      { type: 'stickerBlock', attrs: { x: 560, y: 340, emoji: '🧠' } },
      { type: 'stickerBlock', attrs: { x: 650, y: 340, emoji: '📐' } },
      { type: 'stickerBlock', attrs: { x: 740, y: 340, emoji: '🏆' } },
    ],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. MIDDLE SCHOOL FEN BİLİMLERİ (5-8. Sınıf)
// ─────────────────────────────────────────────────────────────────────────────
function getMiddleFenContent(board: any): DemoBoardDocument {
  return {
    type: 'doc',
    content: [
      {
        type: 'boardCard',
        attrs: { x: 80, y: 80, width: 450, height: 330, color: '#ffffff', zIndex: 1 },
        content: [
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: '🔬 Hücre Organelleri ve Görevleri' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', marks: [{ type: 'bold' }], text: 'Hücre Organelleri:\n' },
              { type: 'text', text: '• Mitokondri: Hücrenin enerji santralidir (ATP üretir).\n' },
              { type: 'text', text: '• Ribozom: Protein sentezi yapar (En küçük organeldir).\n' },
              { type: 'text', text: '• Kloroplast: Bitki hücrelerinde fotosentez yaparak besin ve oksijen üretir.\n' },
              { type: 'text', text: '• Golgi Aygıtı: Salgı maddelerini üretir ve paketler.\n' },
              { type: 'text', text: '• Koful: Hücredeki atık ve besin maddelerini depolar.' },
            ],
          },
        ],
      },
      {
        type: 'noteBlock',
        attrs: { x: 560, y: 80, width: 280, height: 220, color: 'green', zIndex: 2 },
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', marks: [{ type: 'bold' }], text: '🌿 Bitki vs Hayvan Hücresi:\n\n' },
              {
                type: 'text',
                text: 'Bitki Hücresi: Köşeli şekilli, hücre duvarı var, kloroplast var, kofulları büyük ve az sayıdadır.\n\nHayvan Hücresi: Yuvarlak şekilli, hücre duvarı yok, sentrozom var, kofulları küçük ve çok sayıdadır.',
              },
            ],
          },
        ],
      },
      {
        type: 'todoBlock',
        attrs: {
          x: 870,
          y: 80,
          width: 300,
          height: 300,
          color: 'green',
          zIndex: 1,
          title: '🧪 Fen Laboratuvar Görevleri',
          items: [
            { id: 'lf1', text: 'Mikroskopta soğan zarı incelemesi yap', done: true },
            { id: 'lf2', text: 'Organel şemasını renkli çiz', done: true },
            { id: 'lf3', text: 'Deney raporunu tamamla', done: false },
            { id: 'lf4', text: 'LGS Fen Denemesi (20 soru)', done: false },
          ],
        },
      },
      { type: 'stickerBlock', attrs: { x: 560, y: 340, emoji: '🧬' } },
      { type: 'stickerBlock', attrs: { x: 650, y: 340, emoji: '🌱' } },
      { type: 'stickerBlock', attrs: { x: 740, y: 340, emoji: '🔬' } },
    ],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. MIDDLE SCHOOL TÜRKÇE (5-8. Sınıf)
// ─────────────────────────────────────────────────────────────────────────────
function getMiddleTurkceContent(board: any): DemoBoardDocument {
  return {
    type: 'doc',
    content: [
      {
        type: 'boardCard',
        attrs: { x: 80, y: 80, width: 450, height: 330, color: '#ffffff', zIndex: 1 },
        content: [
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: '📚 Paragrafta Anlam & Sözel Mantık' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', marks: [{ type: 'bold' }], text: 'Paragraf Çözüm Taktikleri:\n' },
              { type: 'text', text: '1. Önce soru kökünü okuyun (olumlu mu, olumsuz mu?).\n' },
              { type: 'text', text: '2. Ana düşünce genellikle paragrafın başında veya sonunda vurgulanır.\n' },
              { type: 'text', text: '3. Paragrafta yer almayan kendi bilginizi soruya dahil etmeyin.\n\n' },
              { type: 'text', marks: [{ type: 'bold' }], text: 'Sözel Mantık Tablosu:\n' },
              { type: 'text', text: 'Kesin bilinenleri tabloya yerleştirin, olasılıkları oklarla bağlayın.' },
            ],
          },
        ],
      },
      {
        type: 'noteBlock',
        attrs: { x: 560, y: 80, width: 280, height: 220, color: 'blue', zIndex: 2 },
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', marks: [{ type: 'bold' }], text: '💡 Fiilimsiler (Eylemsiler):\n\n' },
              {
                type: 'text',
                text: '• İsim-Fiil: -ma, -ış, -mak (Mayışmak)\n• Sıfat-Fiil: -an, -ası, -mez, -ar, -dik, -ecek, -miş (Anası mezar dikecekmiş)\n• Zarf-Fiil: -ken, -alı, -esiye, -meden, -erek...',
              },
            ],
          },
        ],
      },
      {
        type: 'todoBlock',
        attrs: {
          x: 870,
          y: 80,
          width: 300,
          height: 300,
          color: 'purple',
          zIndex: 1,
          title: '📝 Türkçe LGS Görevleri',
          items: [
            { id: 'lt1', text: 'Günde 25 paragraf sorusu çöz', done: true },
            { id: 'lt2', text: 'Fiilimsiler kavrama testi', done: true },
            { id: 'lt3', text: 'Sözel mantık soru çözümleri', done: false },
            { id: 'lt4', text: 'Haftalık LGS Türkçe Denemesi', done: false },
          ],
        },
      },
      { type: 'stickerBlock', attrs: { x: 560, y: 340, emoji: '📖' } },
      { type: 'stickerBlock', attrs: { x: 650, y: 340, emoji: '✍️' } },
      { type: 'stickerBlock', attrs: { x: 740, y: 340, emoji: '🎯' } },
    ],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. LGS TAKİP & REHBERLİK PANOSU (8. Sınıf)
// ─────────────────────────────────────────────────────────────────────────────
function getLgsPanoContent(board: any): DemoBoardDocument {
  return {
    type: 'doc',
    content: [
      {
        type: 'boardCard',
        attrs: { x: 80, y: 80, width: 450, height: 330, color: '#ffffff', zIndex: 1 },
        content: [
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: '🚀 LGS Çalışma Programı & Deneme Takip' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', marks: [{ type: 'bold' }], text: 'Günlük Soru Hedefi: 100 Soru\n' },
              { type: 'text', text: '• Türkçe: 25 Soru (Paragraf & Fiilimsi)\n' },
              { type: 'text', text: '• Matematik: 25 Soru (Yeni Nesil Cebir & Geometri)\n' },
              { type: 'text', text: '• Fen Bilimleri: 25 Soru (Mevsimler & Hücre)\n' },
              { type: 'text', text: '• İnkılap / Din / İngilizce: 25 Soru\n\n' },
              { type: 'text', marks: [{ type: 'bold' }], text: 'Hedef Liseler: ' },
              { type: 'text', text: 'Galatasaray Lisesi • Kabataş Erkek Lisesi • İstanbul Erkek Lisesi' },
            ],
          },
        ],
      },
      {
        type: 'noteBlock',
        attrs: { x: 560, y: 80, width: 280, height: 220, color: 'orange', zIndex: 2 },
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', marks: [{ type: 'bold' }], text: '⏱️ Pomodoro Tekniği:\n\n' },
              {
                type: 'text',
                text: '25 dakika tam odaklanma + 5 dakika mola.\n4 periyot tamamlandıktan sonra 20-30 dakika uzun mola verilir.\n\nTelefon ve bildirimler çalışma esnasında kapalı tutulmalıdır!',
              },
            ],
          },
        ],
      },
      {
        type: 'todoBlock',
        attrs: {
          x: 870,
          y: 80,
          width: 300,
          height: 300,
          color: 'pink',
          zIndex: 1,
          title: '📅 Haftalık LGS Takvimi',
          items: [
            { id: 'lg1', text: '1. Genel LGS Denemesi (Sözel + Sayısal)', done: true },
            { id: 'lg2', text: 'Yanlış soru analiz defterini doldur', done: true },
            { id: 'lg3', text: 'Matematik eksik konu tekrarı: Üslü Sayılar', done: false },
            { id: 'lg4', text: 'Rehber öğretmenle haftalık değerlendirme', done: false },
          ],
        },
      },
      { type: 'stickerBlock', attrs: { x: 560, y: 340, emoji: '🚀' } },
      { type: 'stickerBlock', attrs: { x: 650, y: 340, emoji: '💯' } },
      { type: 'stickerBlock', attrs: { x: 740, y: 340, emoji: '🏆' } },
    ],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. HIGH SCHOOL / EDEBİYAT & FİZİK & KİMYA
// ─────────────────────────────────────────────────────────────────────────────
function getDivanEdebiyatiContent(board: any): DemoBoardDocument {
  return {
    type: 'doc',
    content: [
      {
        type: 'boardCard',
        attrs: { x: 80, y: 80, width: 450, height: 330, color: '#ffffff', zIndex: 1 },
        content: [
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: '📜 Divan Edebiyatı Nazım Şekilleri' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', marks: [{ type: 'bold' }], text: 'Beyitlerle Kurulanlar:\n' },
              { type: 'text', text: '• Gazel: Aşk, şarap, güzellik. Kafiye: aa, ba, ca, da...\n' },
              { type: 'text', text: '• Kaside: Din ve devlet büyüklerini övgü. Kafiye: aa, ba, ca...\n' },
              { type: 'text', text: '• Mesnevi: Uzun aşk ve kahramanlık hikayeleri. Her beyit kendi içinde kafiyeli (aa, bb, cc...)\n\n' },
              { type: 'text', marks: [{ type: 'bold' }], text: 'Dörtlük ve Bentlerle Kurulanlar:\n' },
              { type: 'text', text: '• Rubai • Tuyuğ (Türklerin kazandırdığı) • Şarkı (Nedim)' },
            ],
          },
        ],
      },
      {
        type: 'noteBlock',
        attrs: { x: 560, y: 80, width: 280, height: 220, color: 'yellow', zIndex: 2 },
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', marks: [{ type: 'bold' }], text: '🌟 Önemli Divan Şairleri:\n\n' },
              {
                type: 'text',
                text: '• Fuzuli: Aşk ve ızdırap şairi (Su Kasidesi, Leyla ile Mecnun)\n• Baki: Sultanüş-Şuara (Kanuni Mersiyesi)\n• Nedim: Lale Devri ve İstanbul şairi\n• Şeyh Galip: Hüsn ü Aşk',
              },
            ],
          },
        ],
      },
      {
        type: 'todoBlock',
        attrs: {
          x: 870,
          y: 80,
          width: 300,
          height: 300,
          color: 'blue',
          zIndex: 1,
          title: '📋 Edebiyat Çalışma Planı',
          items: [
            { id: 'ed1', text: 'Gazel ve kaside bölümlerini ezberle', done: true },
            { id: 'ed2', text: 'Su Kasidesi ilk 5 beyit tahlili', done: true },
            { id: 'ed3', text: 'Aruz vezni tefile bulma alıştırması', done: false },
          ],
        },
      },
      { type: 'stickerBlock', attrs: { x: 560, y: 340, emoji: '📜' } },
      { type: 'stickerBlock', attrs: { x: 650, y: 340, emoji: '✒️' } },
      { type: 'stickerBlock', attrs: { x: 740, y: 340, emoji: '🏛️' } },
    ],
  }
}

function getFizikDevreleriContent(board: any): DemoBoardDocument {
  return {
    type: 'doc',
    content: [
      {
        type: 'boardCard',
        attrs: { x: 80, y: 80, width: 450, height: 330, color: '#ffffff', zIndex: 1 },
        content: [
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: '⚡ Elektrik Devreleri & Ohm Kanunu' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', marks: [{ type: 'bold' }], text: 'Ohm Kanunu: V = I . R\n\n' },
              { type: 'text', text: '• Seri Bağlama:\n' },
              { type: 'text', text: '  - Eşdeğer direnç: R_eş = R1 + R2 + R3\n' },
              { type: 'text', text: '  - Devreden geçen akım her noktada eşittir (I1 = I2 = I_ana).\n\n' },
              { type: 'text', text: '• Paralel Bağlama:\n' },
              { type: 'text', text: '  - 1 / R_eş = 1/R1 + 1/R2\n' },
              { type: 'text', text: '  - Her kolun uçları arasındaki potansiyel farkı (gerilim) eşittir (V1 = V2 = V_üreteç).' },
            ],
          },
        ],
      },
      {
        type: 'noteBlock',
        attrs: { x: 560, y: 80, width: 280, height: 220, color: 'blue', zIndex: 2 },
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', marks: [{ type: 'bold' }], text: '💡 Kirchhoff Kuralları:\n\n' },
              {
                type: 'text',
                text: '1. Düğüm Kuralı: Bir düğüme giren akımların toplamı, o düğümden çıkan akımların toplamına eşittir.\n2. İlmek Kuralı: Kapalı bir devre ilmeğindeki potansiyel değişimlerinin toplamı sıfırdır.',
              },
            ],
          },
        ],
      },
      {
        type: 'todoBlock',
        attrs: {
          x: 870,
          y: 80,
          width: 300,
          height: 300,
          color: 'orange',
          zIndex: 1,
          title: '🔬 Fizik Laboratuvarı',
          items: [
            { id: 'fz1', text: 'Seri devre direnç ölçümü', done: true },
            { id: 'fz2', text: 'Paralel devre akım paylaşımı hesabı', done: true },
            { id: 'fz3', text: 'Ampermetre & voltmetre devre bağlantısı', done: false },
          ],
        },
      },
      { type: 'stickerBlock', attrs: { x: 560, y: 340, emoji: '⚡' } },
      { type: 'stickerBlock', attrs: { x: 650, y: 340, emoji: '🔌' } },
      { type: 'stickerBlock', attrs: { x: 740, y: 340, emoji: '💡' } },
    ],
  }
}

function getKimyaContent(board: any): DemoBoardDocument {
  return {
    type: 'doc',
    content: [
      {
        type: 'boardCard',
        attrs: { x: 80, y: 80, width: 450, height: 330, color: '#ffffff', zIndex: 1 },
        content: [
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: '🧪 Periyodik Tablo ve Lewis Yapıları' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', marks: [{ type: 'bold' }], text: 'Periyodik Eğilimler (Soldan Sağa):\n' },
              { type: 'text', text: '• Atom yarıçapı azalır.\n' },
              { type: 'text', text: '• İyonlaşma enerjisi ve elektronegatiflik genellikle artar.\n' },
              { type: 'text', text: '• Ametalik özellik artar.\n\n' },
              { type: 'text', marks: [{ type: 'bold' }], text: 'Kimyasal Türler Arası Etkileşimler:\n' },
              { type: 'text', text: '• Güçlü: İyonik bağ, kovalent bağ, metalik bağ.\n' },
              { type: 'text', text: '• Zayıf: Hidrojen bağı, Van der Waals kuvvetleri.' },
            ],
          },
        ],
      },
      {
        type: 'noteBlock',
        attrs: { x: 560, y: 80, width: 280, height: 220, color: 'green', zIndex: 2 },
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', marks: [{ type: 'bold' }], text: '📌 Lewis Elektron Nokta Yapısı:\n\n' },
              {
                type: 'text',
                text: 'Element sembolünün etrafına değerlik elektron sayısı kadar nokta konur. Önce 4 yöne birer nokta, fazlası varsa çiftlenir. H2O molekülünde oksijenin üzerinde 2 bağ yapmayan elektron çifti vardır.',
              },
            ],
          },
        ],
      },
      {
        type: 'todoBlock',
        attrs: {
          x: 870,
          y: 80,
          width: 300,
          height: 300,
          color: 'blue',
          zIndex: 1,
          title: '📋 Kimya Ödev Listesi',
          items: [
            { id: 'km1', text: 'İlk 20 elementin elektron dizilimini yaz', done: true },
            { id: 'km2', text: 'NaCl ve H2O Lewis yapılarını çiz', done: true },
            { id: 'km3', text: 'Elektronegatiflik farkına göre bağ türünü bul', done: false },
          ],
        },
      },
      { type: 'stickerBlock', attrs: { x: 560, y: 340, emoji: '🧪' } },
      { type: 'stickerBlock', attrs: { x: 650, y: 340, emoji: '⚗️' } },
      { type: 'stickerBlock', attrs: { x: 740, y: 340, emoji: '🔬' } },
    ],
  }
}
