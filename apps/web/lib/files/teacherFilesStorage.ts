// apps/web/lib/files/teacherFilesStorage.ts
/**
 * Oxonom EDU — Teacher Files & Smartboard Dispatch Storage
 * Handles folder structure, file uploads, class sharing, and real-time smartboard projection.
 */

export interface TeacherFileItem {
  id: string
  name: string
  extension: 'pdf' | 'png' | 'jpg' | 'jpeg' | 'docx' | 'pptx' | 'xlsx' | 'txt'
  size: string
  updatedAt: string
  author: string
  sharedWithClass?: string
  downloadsCount: number
  dataUrl?: string // Base64 data for uploaded files (image/pdf/text)
  description?: string
}

export interface TeacherFolderCategory {
  id: string
  name: string
  description: string
  color: string
  iconColor: string
  bgLight: string
  files: TeacherFileItem[]
}

export interface SmartboardDispatchedItem {
  id: string
  boardId: string
  fileId: string
  fileName: string
  extension: string
  size: string
  author: string
  dispatchedAt: string
  timestamp: number
  dataUrl?: string
  targetMode?: 'card' | 'fullscreen'
}

export const INITIAL_TEACHER_FOLDERS: TeacherFolderCategory[] = [
  {
    id: 'folder-presentations',
    name: 'Ders Sunumları ve Slaytlar',
    description: 'Türk Dili ve Edebiyatı ders slaytları, interaktif konu sunumları ve PDF ders özetleri.',
    color: 'border-blue-200 dark:border-blue-900/50 hover:border-blue-400',
    iconColor: 'text-blue-600 dark:text-blue-400',
    bgLight: 'bg-blue-50/60 dark:bg-blue-950/30',
    files: [
      {
        id: 'f-1',
        name: '9-A_Edebiyat_Metin_Tahlili_Ders_Notlari.pdf',
        extension: 'pdf',
        size: '3.4 MB',
        updatedAt: 'Bugün 10:15',
        author: 'Bahar ÇETİN',
        sharedWithClass: '9-A',
        downloadsCount: 28,
        description: 'T.C. MEB 9. Sınıf Edebiyat 1. Dönem Metin Tahlili ve Edebi Türler Kazanım Notları.',
      },
      {
        id: 'f-2',
        name: 'Tanzimat_Donemi_Edebi_Akimlar_Sunumu.pptx',
        extension: 'pptx',
        size: '14.2 MB',
        updatedAt: 'Dün 16:40',
        author: 'Bahar ÇETİN',
        sharedWithClass: '9-A, 9-B',
        downloadsCount: 42,
        description: 'Tanzimat I. ve II. Dönem Karşılaştırmalı Edebiyat Sunumu ve Yazar-Eser Tabloları.',
      },
      {
        id: 'f-3',
        name: 'Divan_Edebiyati_Gazel_ve_Kaside_Tahlili.pdf',
        extension: 'pdf',
        size: '5.1 MB',
        updatedAt: '3 gün önce',
        author: 'Bahar ÇETİN',
        downloadsCount: 19,
        description: 'Fuzûlî ve Bâkî gazelleri aruz vezni ve kafiye şeması inceleme kılavuzu.',
      },
    ],
  },
  {
    id: 'folder-worksheets',
    name: 'Çalışma Kâğıtları ve Testler',
    description: 'Öğrenciler için MEB kazanım kavrama testleri, paragraf çözümleri ve kompozisyon ödev formları.',
    color: 'border-emerald-200 dark:border-emerald-900/50 hover:border-emerald-400',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    bgLight: 'bg-emerald-50/60 dark:bg-emerald-950/30',
    files: [
      {
        id: 'f-4',
        name: '9-A_Paragrafta_Anlam_Calisma_Kagidi_Hafta4.pdf',
        extension: 'pdf',
        size: '1.2 MB',
        updatedAt: 'Bugün 08:30',
        author: 'Bahar ÇETİN',
        sharedWithClass: '9-A',
        downloadsCount: 24,
        description: 'Paragrafta ana fikir, yardımcı fikir ve anlatım teknikleri 20 soruluk uygulama.',
      },
      {
        id: 'f-5',
        name: 'Noktalama_Isaretleri_Pratik_Uygulama.docx',
        extension: 'docx',
        size: '820 KB',
        updatedAt: '4 gün önce',
        author: 'Bahar ÇETİN',
        sharedWithClass: '9-B',
        downloadsCount: 21,
        description: 'Noktalı virgül, iki nokta ve kesme işareti kural tablosu ve pratik alıştırmalar.',
      },
      {
        id: 'f-6',
        name: 'Cumle_Turleri_Tarama_Testi_20_Soru.pdf',
        extension: 'pdf',
        size: '2.1 MB',
        updatedAt: 'Geçen hafta',
        author: 'Bahar ÇETİN',
        downloadsCount: 35,
        description: 'Yapılarına, yüklemin türüne ve anlamına göre cümleler tarama sınavı.',
      },
    ],
  },
  {
    id: 'folder-smartboard',
    name: 'Akıllı Tahta Ders Çizimleri',
    description: 'Pano ve sınıf akıllı tahtalarında işlenen derslerin canlı çizimleri, ekran çıktıları ve tahta özetleri.',
    color: 'border-teal-200 dark:border-teal-900/50 hover:border-teal-400',
    iconColor: 'text-teal-600 dark:text-teal-400',
    bgLight: 'bg-teal-50/60 dark:bg-teal-950/30',
    files: [
      {
        id: 'f-7',
        name: '9A_AkilliTahta_Siir_Tahlili_Sema_Cizimi.png',
        extension: 'png',
        size: '2.8 MB',
        updatedAt: 'Bugün 11:45',
        author: 'Bahar ÇETİN (Tahta)',
        sharedWithClass: '9-A',
        downloadsCount: 15,
        description: '9-A dersinde akıllı tahtada çizilen ahenk unsurları zihin haritası ve şematik özet.',
      },
      {
        id: 'f-8',
        name: 'BeyazTahta_Kelimede_Anlam_Zihin_Haritasi.png',
        extension: 'png',
        size: '1.9 MB',
        updatedAt: '2 gün önce',
        author: 'Bahar ÇETİN (Tahta)',
        sharedWithClass: '9-A',
        downloadsCount: 22,
        description: 'Gerçek, mecaz ve terim anlam ilişkilerini gösteren renkli tahta şeması.',
      },
      {
        id: 'f-9',
        name: 'Paragraf_Akis_Semasi_Canli_Cizim.png',
        extension: 'png',
        size: '3.1 MB',
        updatedAt: '5 gün önce',
        author: 'Bahar ÇETİN (Tahta)',
        downloadsCount: 18,
        description: 'Düşünceyi geliştirme yolları canlı tahta akış diyagramı.',
      },
    ],
  },
  {
    id: 'folder-meb-curriculum',
    name: 'MEB Müfredat Kılavuzları & Kitaplar',
    description: 'Bakanlık 9. Sınıf Edebiyat ders kitabı, yıllık planlar, zümre hedefleri ve kazanım tabloları.',
    color: 'border-purple-200 dark:border-purple-900/50 hover:border-purple-400',
    iconColor: 'text-purple-600 dark:text-purple-400',
    bgLight: 'bg-purple-50/60 dark:bg-purple-950/30',
    files: [
      {
        id: 'f-10',
        name: 'MEB_9_Sinif_Turk_Dili_ve_Edebiyati_Ders_Kitabi.pdf',
        extension: 'pdf',
        size: '42.5 MB',
        updatedAt: 'Eylül 2026',
        author: 'MEB Devlet Kitapları',
        downloadsCount: 110,
        description: 'Milli Eğitim Bakanlığı Talim ve Terbiye Kurulu onaylı 2026-2027 Resmi Ders Kitabı.',
      },
      {
        id: 'f-11',
        name: '2026_2027_Edebiyat_Yillik_Cerceve_Plani.docx',
        extension: 'docx',
        size: '1.4 MB',
        updatedAt: 'Eylül 2026',
        author: 'Bahar ÇETİN',
        downloadsCount: 45,
        description: '36 haftalık MEB müfredatı haftalık saat ve kazanım dağılım yıllık çerçeve planı.',
      },
      {
        id: 'f-12',
        name: 'MEB_Haftalik_Kazanim_ve_Degerlendirme_Tablosu.xlsx',
        extension: 'xlsx',
        size: '680 KB',
        updatedAt: '1 ay önce',
        author: 'Bahar ÇETİN',
        downloadsCount: 16,
        description: 'Kazanım takip matrisi, ortak sınav soru dağılım oranları ve değerlendirme rubriği.',
      },
    ],
  },
  {
    id: 'folder-official-docs',
    name: 'Zümre Tutanakları ve Resmi Evraklar',
    description: 'Sene başı ve dönem başı zümre toplantı tutanakları, şube öğretmenler kurulu kararları ve dilekçeler.',
    color: 'border-amber-200 dark:border-amber-900/50 hover:border-amber-400',
    iconColor: 'text-amber-600 dark:text-amber-400',
    bgLight: 'bg-amber-50/60 dark:bg-amber-950/30',
    files: [
      {
        id: 'f-13',
        name: '2026_2027_1_Donem_Zumre_Ogretmenler_Kurulu_Tutanagi.pdf',
        extension: 'pdf',
        size: '2.2 MB',
        updatedAt: '15 Eylül',
        author: 'Bahar ÇETİN',
        downloadsCount: 12,
        description: 'Edebiyat Zümresi 1. Dönem resmi kararları ve ortak sınav tarihleri tutanağı.',
      },
      {
        id: 'f-14',
        name: '9-A_Sube_Ogretmenler_Kurulu_Toplanti_Raporu.docx',
        extension: 'docx',
        size: '940 KB',
        updatedAt: '28 Eylül',
        author: 'Bahar ÇETİN',
        downloadsCount: 8,
        description: '9-A şube başarı durumu, devamsızlık ve rehberlik ihtiyaçları raporu.',
      },
    ],
  },
  {
    id: 'folder-student-projects',
    name: 'Öğrenci Proje & Ödev Arşivi',
    description: 'Öğrencilerin teslim ettiği dönem projeleri, şiir dinletisi ses kayıtları ve ödev derlemeleri.',
    color: 'border-rose-200 dark:border-rose-900/50 hover:border-rose-400',
    iconColor: 'text-rose-600 dark:text-rose-400',
    bgLight: 'bg-rose-50/60 dark:bg-rose-950/30',
    files: [
      {
        id: 'f-15',
        name: '101_Ercil_Ugurlu_Edebi_Metin_Incelemesi_Proje.pdf',
        extension: 'pdf',
        size: '4.8 MB',
        updatedAt: 'Dün',
        author: 'Ali Yağız DEMİREL',
        downloadsCount: 4,
        description: '9-A 101 Ali Yağız Demirel Dönem Proje Ödevi — Roman ve Hikaye İncelemesi.',
      },
      {
        id: 'f-16',
        name: '102_Zeynep_Yilmaz_Cumhuriyet_Donemi_Siirleri.pdf',
        extension: 'pdf',
        size: '3.6 MB',
        updatedAt: '3 gün önce',
        author: 'Zeynep YILMAZ',
        downloadsCount: 3,
        description: '9-A 102 Zeynep Yılmaz Şiir Tahlili ve Biyografi Çalışması.',
      },
    ],
  },
]

const STORAGE_KEY = 'oxonom_teacher_files_v2'

export function getStoredTeacherFolders(): TeacherFolderCategory[] {
  if (typeof window === 'undefined') return INITIAL_TEACHER_FOLDERS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TEACHER_FOLDERS))
      return INITIAL_TEACHER_FOLDERS
    }
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
    }
  } catch (e) {
    console.warn('Could not read stored teacher files, using defaults:', e)
  }
  return INITIAL_TEACHER_FOLDERS
}

export function saveStoredTeacherFolders(folders: TeacherFolderCategory[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(folders))
    window.dispatchEvent(new CustomEvent('oxonom_teacher_files_updated', { detail: folders }))
  } catch (e) {
    console.error('Failed to save teacher files:', e)
  }
}

export function addTeacherFile(
  folderId: string,
  newFile: TeacherFileItem
): TeacherFolderCategory[] {
  const current = getStoredTeacherFolders()
  const updated = current.map((folder) => {
    if (folder.id === folderId) {
      return {
        ...folder,
        files: [newFile, ...folder.files],
      }
    }
    return folder
  })
  saveStoredTeacherFolders(updated)
  return updated
}

export function updateFileSharing(
  fileId: string,
  sharedWithClass: string
): TeacherFolderCategory[] {
  const current = getStoredTeacherFolders()
  const updated = current.map((folder) => ({
    ...folder,
    files: folder.files.map((file) =>
      file.id === fileId ? { ...file, sharedWithClass } : file
    ),
  }))
  saveStoredTeacherFolders(updated)
  return updated
}

export function deleteTeacherFile(fileId: string): TeacherFolderCategory[] {
  const current = getStoredTeacherFolders()
  const updated = current.map((folder) => ({
    ...folder,
    files: folder.files.filter((f) => f.id !== fileId),
  }))
  saveStoredTeacherFolders(updated)
  return updated
}

// ── Real-time Smartboard Dispatch Helper ──
export function dispatchFileToSmartboard(
  boardId: string,
  file: TeacherFileItem,
  targetMode: 'card' | 'fullscreen' = 'card'
): SmartboardDispatchedItem {
  const cleanBoardId = boardId.trim().toUpperCase()

  const item: SmartboardDispatchedItem = {
    id: `disp-${Date.now()}`,
    boardId: cleanBoardId,
    fileId: file.id,
    fileName: file.name,
    extension: file.extension,
    size: file.size,
    author: file.author || 'Bahar ÇETİN',
    dispatchedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    timestamp: Date.now(),
    dataUrl: file.dataUrl,
    targetMode,
  }

  if (typeof window !== 'undefined') {
    try {
      // 1. Save specific board payload
      localStorage.setItem(`oxonom_board_content_${cleanBoardId}`, JSON.stringify(item))
      localStorage.setItem('oxonom_last_dispatched_board_id', cleanBoardId)

      // 2. Append to board history queue
      const queueKey = `oxonom_board_queue_${cleanBoardId}`
      const rawQueue = localStorage.getItem(queueKey)
      const queue: SmartboardDispatchedItem[] = rawQueue ? JSON.parse(rawQueue) : []
      queue.unshift(item)
      localStorage.setItem(queueKey, JSON.stringify(queue.slice(0, 20)))

      // 3. Dispatch in-window event
      window.dispatchEvent(
        new CustomEvent('oxonom_smartboard_dispatch', { detail: item })
      )

      // 4. BroadcastChannel across all open tabs/windows
      if ('BroadcastChannel' in window) {
        try {
          const bc = new BroadcastChannel('oxonom_smartboard_channel')
          bc.postMessage(item)
          bc.close()
        } catch (_) {}
      }
    } catch (e) {
      console.error('Error dispatching content to smartboard:', e)
    }
  }

  return item
}

export function getSmartboardQueue(boardId: string): SmartboardDispatchedItem[] {
  if (typeof window === 'undefined') return []
  try {
    const cleanBoardId = boardId.trim().toUpperCase()
    const raw = localStorage.getItem(`oxonom_board_queue_${cleanBoardId}`)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}
