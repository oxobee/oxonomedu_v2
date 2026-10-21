// Oxonom Edu — Akıllı Tahta Notları (Saved Board Notes Storage)
// Allows saving smart board captures to designated student classrooms

export interface SavedBoardNote {
  id: string
  title: string // Template: "{Ders Adı} - {Tarih}"
  courseName: string
  dateStr: string
  timestamp: number
  classCodes: string[]
  imageUrl: string
  teacherName?: string
  boardInfo?: string
}

export const BOARD_NOTES_STORAGE_KEY = 'oxonom_saved_board_notes'

// Sample initial chalkboard/whiteboard vectors for realistic first-time display
function createMockBoardSvg(subject: string, topic: string, date: string): string {
  const bg = '#161B26'
  const text = '#E2E8F0'
  const accent = subject === 'Türkçe' ? '#C084FC' : subject === 'Matematik' ? '#38BDF8' : '#34D399'
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" width="1200" height="750">
    <rect width="1200" height="750" fill="${bg}"/>
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#232C3F" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="1200" height="750" fill="url(#grid)"/>
    
    <!-- Header border -->
    <rect x="40" y="30" width="1120" height="70" rx="16" fill="#1E2738" stroke="#334155" stroke-width="2"/>
    <text x="70" y="75" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="bold" fill="${accent}">
      ${subject} Dersi Akıllı Tahta Çizim Özeti
    </text>
    <text x="1120" y="75" text-anchor="end" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="#94A3B8">
      Tarih: ${date}
    </text>

    <!-- Main Content Box -->
    <rect x="40" y="130" width="700" height="570" rx="16" fill="#182234" stroke="#2D3B54" stroke-width="2"/>
    <text x="70" y="180" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="bold" fill="${text}">
      📌 Konu Başlığı: ${topic}
    </text>
    
    <!-- Bullets & formulas -->
    <text x="70" y="240" font-family="system-ui, -apple-system, sans-serif" font-size="17" fill="#CBD5E1">
      • Temel kurallar ve kavram analizleri akıllı tahtada interaktif işlenmiştir.
    </text>
    <text x="70" y="280" font-family="system-ui, -apple-system, sans-serif" font-size="17" fill="#CBD5E1">
      • Örnek soru çözümü ve uygulama adımları tahtada detaylandırılmıştır.
    </text>
    
    <!-- Schematic Diagram drawing -->
    <rect x="80" y="330" width="620" height="320" rx="12" fill="#121826" stroke="${accent}" stroke-width="2" stroke-dasharray="6 6"/>
    <circle cx="240" cy="490" r="80" fill="none" stroke="${accent}" stroke-width="4"/>
    <circle cx="480" cy="490" r="80" fill="none" stroke="#F472B6" stroke-width="4"/>
    <text x="240" y="495" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="bold" fill="${accent}">Kavram A</text>
    <text x="480" y="495" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="bold" fill="#F472B6">Kavram B</text>
    <text x="360" y="495" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="bold" fill="#F8FAFC">Kesişim</text>
    
    <!-- Teacher Notes Box -->
    <rect x="760" y="130" width="400" height="570" rx="16" fill="#1A202C" stroke="#2D3748" stroke-width="2"/>
    <text x="790" y="180" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="bold" fill="#FBBF24">
      ✏️ Öğretmen Notları & Ev Ödevi
    </text>
    <text x="790" y="230" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="#E2E8F0">
      1. Tahtaya çizilen şemayı defterinize
    </text>
    <text x="790" y="260" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="#E2E8F0">
      eksiksiz aktarınız.
    </text>
    <text x="790" y="310" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="#E2E8F0">
      2. Sayfa 42-45 arası ünite sorularını
    </text>
    <text x="790" y="340" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="#E2E8F0">
      çözüp yarın kontrole getiriniz.
    </text>
    
    <rect x="790" y="580" width="340" height="80" rx="12" fill="#243046" stroke="#3B82F6" stroke-width="1"/>
    <text x="810" y="625" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="bold" fill="#60A5FA">
      ✅ Akıllı Tahta Canlı Eşitlemesi Aktif
    </text>
  </svg>`

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export const INITIAL_DEFAULT_BOARD_NOTES: SavedBoardNote[] = [
  {
    id: 'note-turkce-20261021',
    title: 'Türkçe - 21 Ekim 2026',
    courseName: 'Türkçe',
    dateStr: '21 Ekim 2026',
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    classCodes: ['1/A', '1/B'],
    imageUrl: createMockBoardSvg('Türkçe', 'Sözcükte Anlam ve Cümle Bilgisi', '21 Ekim 2026'),
    teacherName: 'Ebru TEKNECİ',
    boardInfo: '1A-01',
  },
  {
    id: 'note-mat-20261020',
    title: 'Matematik - 20 Ekim 2026',
    courseName: 'Matematik',
    dateStr: '20 Ekim 2026',
    timestamp: Date.now() - 1000 * 60 * 60 * 26,
    classCodes: ['1/A'],
    imageUrl: createMockBoardSvg('Matematik', 'Doğal Sayılar ve Geometrik Şekiller', '20 Ekim 2026'),
    teacherName: 'Orkun AYDIN',
    boardInfo: '1A-01',
  },
  {
    id: 'note-fen-20261019',
    title: 'Fen Bilimleri - 19 Ekim 2026',
    courseName: 'Fen Bilimleri',
    dateStr: '19 Ekim 2026',
    timestamp: Date.now() - 1000 * 60 * 60 * 50,
    classCodes: ['1/A', '2/A'],
    imageUrl: createMockBoardSvg('Fen Bilimleri', 'Güneş Sistemi ve Gezegenler', '19 Ekim 2026'),
    teacherName: 'Beritan ŞENATEŞ',
    boardInfo: '1A-01',
  },
]

export function getSavedBoardNotes(studentClassCode?: string): SavedBoardNote[] {
  if (typeof window === 'undefined') return INITIAL_DEFAULT_BOARD_NOTES

  try {
    const raw = localStorage.getItem(BOARD_NOTES_STORAGE_KEY)
    let notes: SavedBoardNote[] = []
    if (raw) {
      notes = JSON.parse(raw)
    } else {
      notes = INITIAL_DEFAULT_BOARD_NOTES
      localStorage.setItem(BOARD_NOTES_STORAGE_KEY, JSON.stringify(notes))
    }

    if (!studentClassCode) return notes

    const cleanTarget = studentClassCode.trim().toUpperCase().replace(/[-_]/g, '/')
    return notes.filter((n) => {
      if (!n.classCodes || n.classCodes.length === 0) return true
      return n.classCodes.some((c) => c.trim().toUpperCase().replace(/[-_]/g, '/') === cleanTarget)
    })
  } catch (e) {
    console.warn('Failed to read saved board notes:', e)
    return INITIAL_DEFAULT_BOARD_NOTES
  }
}

export function saveBoardNote(noteData: {
  courseName: string
  classCodes: string[]
  imageUrl: string
  teacherName?: string
  boardInfo?: string
  customDateStr?: string
}): SavedBoardNote {
  const now = new Date()
  const turkishMonths = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
  ]
  const dateStr = noteData.customDateStr || `${now.getDate()} ${turkishMonths[now.getMonth()]} ${now.getFullYear()}`
  const courseName = noteData.courseName || 'Ders Notu'
  const title = `${courseName} - ${dateStr}`

  const newNote: SavedBoardNote = {
    id: `board-note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title,
    courseName,
    dateStr,
    timestamp: Date.now(),
    classCodes: noteData.classCodes.length > 0 ? noteData.classCodes : ['1/A'],
    imageUrl: noteData.imageUrl,
    teacherName: noteData.teacherName || 'Ders Öğretmeni',
    boardInfo: noteData.boardInfo || '1A-01',
  }

  try {
    const current = getSavedBoardNotes()
    const updated = [newNote, ...current]
    localStorage.setItem(BOARD_NOTES_STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('oxonom_board_notes_updated', { detail: newNote }))
  } catch (err) {
    console.error('Failed to save board note:', err)
    throw err
  }

  return newNote
}

export function deleteBoardNote(noteId: string): void {
  try {
    const current = getSavedBoardNotes()
    const filtered = current.filter((n) => n.id !== noteId)
    localStorage.setItem(BOARD_NOTES_STORAGE_KEY, JSON.stringify(filtered))
    window.dispatchEvent(new CustomEvent('oxonom_board_notes_updated', { detail: { deletedId: noteId } }))
  } catch (e) {
    console.error('Failed to delete board note:', e)
  }
}
