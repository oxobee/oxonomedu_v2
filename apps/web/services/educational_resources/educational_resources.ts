import { getAPIUrl } from '@services/config/config'
import {
  RequestBodyWithAuthHeader,
  errorHandling,
} from '@services/utils/ts/requests'

export interface ResourceFolder {
  id: number
  folder_uuid: string
  org_id: number
  parent_id?: number | null
  name: string
  description?: string | null
  icon: string
  color: string
  is_locked?: boolean
  pin?: string | null
  target_type?: 'all' | 'classrooms' | 'students'
  target_ids?: {
    classroom_ids?: number[]
    student_ids?: number[]
  } | null
  created_by?: number
  creation_date?: string
  update_date?: string
  items_count?: number
}

export interface ResourceItem {
  id: number
  resource_uuid: string
  org_id: number
  folder_id?: number | null
  title: string
  description?: string | null
  resource_type: 'pdf' | 'document' | 'spreadsheet' | 'presentation' | 'image' | 'video' | 'audio' | 'link' | 'youtube'
  file_url?: string | null
  file_name?: string | null
  file_size?: number | null
  mime_type?: string | null
  external_url?: string | null
  subject?: string | null
  grade_level?: string | null
  is_downloadable?: boolean
  is_locked?: boolean
  pin?: string | null
  target_type?: 'all' | 'classrooms' | 'students'
  target_ids?: {
    classroom_ids?: number[]
    student_ids?: number[]
  } | null
  created_by?: number
  uploader_name?: string | null
  uploader_role?: string | null
  views_count?: number
  downloads_count?: number
  creation_date?: string
  update_date?: string
}

export interface ResourceAccessLog {
  id: number
  resource_id: number
  org_id: number
  user_id: number
  user_name: string
  user_role: string
  action: 'view' | 'download'
  timestamp: string
}

export const DEFAULT_RESOURCE_FOLDERS: ResourceFolder[] = [
  {
    id: 1,
    folder_uuid: 'fld_1st_grade_materials',
    org_id: 2,
    name: '1. Sınıf Temel Ders Materyalleri',
    description: 'Okuma-yazma, temel matematik ve çizgi çalışmaları klasörü',
    icon: 'FolderSimple',
    color: '#3b82f6',
    is_locked: false,
    target_type: 'all',
    created_by: 1,
    creation_date: '2026-10-01 10:00:00',
    update_date: '2026-10-01 10:00:00',
  },
  {
    id: 2,
    folder_uuid: 'fld_sunumlar_ve_slaytlar',
    org_id: 2,
    name: 'Görsel Sunumlar & Akıllı Tahta Slaytları',
    description: 'Ders içi interaktif sunumlar ve konu anlatım slaytları',
    icon: 'FilePpt',
    color: '#f97316',
    is_locked: false,
    target_type: 'all',
    created_by: 1,
    creation_date: '2026-10-01 10:00:00',
    update_date: '2026-10-01 10:00:00',
  },
  {
    id: 3,
    folder_uuid: 'fld_video_ve_dijital_icerik',
    org_id: 2,
    name: 'Video Dersler & Eğitici Medya',
    description: 'Uzman öğretmen anlatımlı konu videoları ve simülasyonlar',
    icon: 'VideoCamera',
    color: '#ec4899',
    is_locked: false,
    target_type: 'all',
    created_by: 1,
    creation_date: '2026-10-01 10:00:00',
    update_date: '2026-10-01 10:00:00',
  },
  {
    id: 4,
    folder_uuid: 'fld_veli_ve_ogretmen_ozel',
    org_id: 2,
    name: 'Öğretmen & Veli Özel Arşivi (PIN Korumalı)',
    description: 'Sadece yetkili öğretmen ve velilerin erişebileceği rehberlik bültenleri (PIN: 1234)',
    icon: 'Lock',
    color: '#10b981',
    is_locked: true,
    pin: '1234',
    target_type: 'classrooms',
    created_by: 1,
    creation_date: '2026-10-01 10:00:00',
    update_date: '2026-10-01 10:00:00',
  },
]

export const DEFAULT_RESOURCE_ITEMS: ResourceItem[] = [
  {
    id: 1,
    resource_uuid: 'res_pdf_01',
    org_id: 2,
    folder_id: 1,
    title: '1-A Türkçe: Dik Temel Harfler Okuma & Çizgi Çalışma Kağıdı',
    description: 'MEB müfredatına tam uyumlu dik temel harfler 1. grup fasikülü. Çıktı alıp evde çalışabilirsiniz.',
    resource_type: 'pdf',
    file_url: '/sample.pdf',
    file_name: '1A_Temel_Harfler_Fasikul.pdf',
    file_size: 2450000,
    subject: 'Türkçe',
    is_downloadable: true,
    is_locked: false,
    views_count: 142,
    downloads_count: 98,
    created_by: 1,
    uploader_name: 'Bahar ÇETİN',
    uploader_role: '1-A Sınıf Öğretmeni',
    creation_date: '2026-10-01 11:30:00',
    update_date: '2026-10-01 11:30:00',
  },
  {
    id: 2,
    resource_uuid: 'res_doc_02',
    org_id: 2,
    folder_id: 1,
    title: 'Matematik: Ritmik Sayma & Sayı Basamakları Ders Notları',
    description: '1’er, 2’şer ve 5’er ileri-geri ritmik sayma kuralları ve örnek alıştırma soruları.',
    resource_type: 'document',
    file_url: '/sample.docx',
    file_name: 'Ritmik_Sayma_Ders_Notu.docx',
    file_size: 1120000,
    subject: 'Matematik',
    is_downloadable: true,
    is_locked: false,
    views_count: 95,
    downloads_count: 67,
    created_by: 1,
    uploader_name: 'Zeliha EMAN',
    uploader_role: '2-A Sınıf Öğretmeni',
    creation_date: '2026-10-01 12:00:00',
    update_date: '2026-10-01 12:00:00',
  },
  {
    id: 3,
    resource_uuid: 'res_xls_03',
    org_id: 2,
    folder_id: 1,
    title: 'Haftalık Kitap Okuma & Etkinlik Takip Çizelgesi',
    description: 'Öğrencinin günlük okuduğu sayfa sayısı ve ödev tamamlama tablosu.',
    resource_type: 'spreadsheet',
    file_url: '/sample.xlsx',
    file_name: 'Kitap_Okuma_Takip_Cizelgesi.xlsx',
    file_size: 450000,
    subject: 'Rehberlik & Etkinlik',
    is_downloadable: true,
    is_locked: false,
    views_count: 88,
    downloads_count: 73,
    created_by: 1,
    uploader_name: 'Bahar ÇETİN',
    uploader_role: '1-A Sınıf Öğretmeni',
    creation_date: '2026-10-01 12:30:00',
    update_date: '2026-10-01 12:30:00',
  },
  {
    id: 4,
    resource_uuid: 'res_ppt_04',
    org_id: 2,
    folder_id: 2,
    title: 'Fen Bilimleri: Canlılar Dünyası ve Doğal Çevre Sunumu',
    description: 'Bitkiler, hayvanlar ve ekosistem döngüsü görsel animasyonlu slayt seti.',
    resource_type: 'presentation',
    file_url: '/sample.pptx',
    file_name: 'Canlilar_Dunyasi_Sunum.pptx',
    file_size: 6800000,
    subject: 'Fen Bilimleri',
    is_downloadable: true,
    is_locked: false,
    views_count: 120,
    downloads_count: 54,
    created_by: 1,
    uploader_name: 'Bülent TURAN',
    uploader_role: 'Fen Bilimleri Öğretmeni',
    creation_date: '2026-10-01 13:00:00',
    update_date: '2026-10-01 13:00:00',
  },
  {
    id: 5,
    resource_uuid: 'res_img_05',
    org_id: 2,
    folder_id: 2,
    title: 'Güneş Sistemi, Gezegenler & Yörüngeler İnfografiği',
    description: 'Yüksek çözünürlüklü MEB onaylı Güneş Sistemi şeması ve gezegen özellikleri posteri.',
    resource_type: 'image',
    file_url: '/sample_solar.png',
    file_name: 'Gunes_Sistemi_Infografik.png',
    file_size: 3200000,
    subject: 'Fen Bilimleri',
    is_downloadable: true,
    is_locked: false,
    views_count: 210,
    downloads_count: 130,
    created_by: 1,
    uploader_name: 'Azime Nur IRMAK',
    uploader_role: 'Fen Bilimleri Öğretmeni',
    creation_date: '2026-10-01 13:30:00',
    update_date: '2026-10-01 13:30:00',
  },
  {
    id: 6,
    resource_uuid: 'res_vid_06',
    org_id: 2,
    folder_id: 3,
    title: 'Matematik: Çıkarma İşleminde Onluk Bozma Video Anlatımı',
    description: 'İnteraktif akıllı tahta üzerinde adım adım onluk bozarak çıkarma işlemi çözümleri.',
    resource_type: 'video',
    file_url: '/sample_video.mp4',
    file_name: 'Onluk_Bozma_Ders_Videosu.mp4',
    file_size: 18400000,
    subject: 'Matematik',
    is_downloadable: false,
    is_locked: false,
    views_count: 312,
    downloads_count: 0,
    created_by: 1,
    uploader_name: 'Mehmet Akif YEŞİLYURT',
    uploader_role: '2-B Sınıf Öğretmeni',
    creation_date: '2026-10-01 14:00:00',
    update_date: '2026-10-01 14:00:00',
  },
  {
    id: 7,
    resource_uuid: 'res_yt_07',
    org_id: 2,
    folder_id: 3,
    title: 'TRT EBA TV: 1. Sınıf İlk Okuma Yazma Eğitimi — Harfleri Tanıyalım',
    description: 'TRT EBA İlkokul resmi ders yayını: Sesleri hissetme ve hece oluşturma.',
    resource_type: 'youtube',
    external_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    subject: 'Türkçe',
    is_downloadable: false,
    is_locked: false,
    views_count: 450,
    downloads_count: 0,
    created_by: 1,
    uploader_name: 'Bahar ÇETİN',
    uploader_role: '1-A Sınıf Öğretmeni',
    creation_date: '2026-10-01 14:30:00',
    update_date: '2026-10-01 14:30:00',
  },
  {
    id: 8,
    resource_uuid: 'res_aud_08',
    org_id: 2,
    folder_id: 3,
    title: 'Türkçe Sesli Masal: Keloğlan ile Bilge Dede Masalı',
    description: 'Öğrencilerin dinleme ve anlama becerilerini pekiştirmek için hazırlanmış radyo tiyatrosu masalı.',
    resource_type: 'audio',
    file_url: '/sample_podcast.mp3',
    file_name: 'Keloglan_Sesli_Masal.mp3',
    file_size: 4200000,
    subject: 'Türkçe',
    is_downloadable: true,
    is_locked: false,
    views_count: 178,
    downloads_count: 62,
    created_by: 1,
    uploader_name: 'Fatma MARANGOZ',
    uploader_role: '1-F Sınıf Öğretmeni',
    creation_date: '2026-10-01 15:00:00',
    update_date: '2026-10-01 15:00:00',
  },
  {
    id: 9,
    resource_uuid: 'res_lnk_09',
    org_id: 2,
    folder_id: 1,
    title: 'Millî Eğitim Bakanlığı EBA (Eğitim Bilişim Ağı) Portalı',
    description: 'MEB resmi ders kitapları, interaktif testler ve kazanım değerlendirme portföyü.',
    resource_type: 'link',
    external_url: 'https://eba.gov.tr',
    subject: 'Genel',
    is_downloadable: false,
    is_locked: false,
    views_count: 530,
    downloads_count: 0,
    created_by: 1,
    uploader_name: 'Okul Yönetimi',
    uploader_role: 'Yönetici',
    creation_date: '2026-10-01 15:30:00',
    update_date: '2026-10-01 15:30:00',
  },
  {
    id: 10,
    resource_uuid: 'res_pin_10',
    org_id: 2,
    folder_id: 4,
    title: 'Okul Rehberlik Bülteni: Çocuklarda Dijital Ekran ve Akıllı Telefon Yönetimi',
    description: 'Veliler için evde ekran süresi yönetimi ve sağlıklı teknoloji kullanım rehberi. (PIN: 1234)',
    resource_type: 'pdf',
    file_url: '/sample.pdf',
    file_name: 'Ekran_Bagimliligi_Rehberi.pdf',
    file_size: 1980000,
    subject: 'Rehberlik & Etkinlik',
    is_downloadable: true,
    is_locked: true,
    pin: '1234',
    views_count: 84,
    downloads_count: 41,
    created_by: 1,
    uploader_name: 'Rehberlik Servisi',
    uploader_role: 'Psikolojik Danışman',
    creation_date: '2026-10-01 16:00:00',
    update_date: '2026-10-01 16:00:00',
  },
]

// --- Folders API ---
export async function getFolders(
  orgId: number,
  parentId?: number | null,
  accessToken?: string
): Promise<ResourceFolder[]> {
  try {
    const url = new URL(`${getAPIUrl()}resources/folders`)
    url.searchParams.set('org_id', String(orgId))
    if (parentId !== undefined && parentId !== null) {
      url.searchParams.set('parent_id', String(parentId))
    }
    const result = await fetch(
      url.toString(),
      RequestBodyWithAuthHeader('GET', null, null, accessToken)
    )
    if (result.ok) {
      const data = await errorHandling(result)
      if (Array.isArray(data) && data.length > 0) return data
    }
  } catch (_e) {}

  return DEFAULT_RESOURCE_FOLDERS
}

export async function createFolder(
  data: Partial<ResourceFolder> & { org_id: number; name: string },
  accessToken: string
): Promise<ResourceFolder> {
  const result = await fetch(
    `${getAPIUrl()}resources/folders`,
    RequestBodyWithAuthHeader('POST', data, null, accessToken)
  )
  return errorHandling(result)
}

export async function updateFolder(
  folderUuid: string,
  data: Partial<ResourceFolder>,
  accessToken: string
): Promise<ResourceFolder> {
  const result = await fetch(
    `${getAPIUrl()}resources/folders/${folderUuid}`,
    RequestBodyWithAuthHeader('PUT', data, null, accessToken)
  )
  return errorHandling(result)
}

export async function deleteFolder(
  folderUuid: string,
  accessToken: string
): Promise<any> {
  const result = await fetch(
    `${getAPIUrl()}resources/folders/${folderUuid}`,
    RequestBodyWithAuthHeader('DELETE', null, null, accessToken)
  )
  return errorHandling(result)
}

// --- Resources API ---
export async function getResources(
  orgId: number,
  params?: {
    folderId?: number | null
    subject?: string
    resourceType?: string
    search?: string
  },
  accessToken?: string
): Promise<ResourceItem[]> {
  try {
    const url = new URL(`${getAPIUrl()}resources/items`)
    url.searchParams.set('org_id', String(orgId))
    if (params?.folderId !== undefined && params?.folderId !== null) {
      url.searchParams.set('folder_id', String(params.folderId))
    }
    if (params?.subject && params.subject !== 'all') {
      url.searchParams.set('subject', params.subject)
    }
    if (params?.resourceType && params.resourceType !== 'all') {
      url.searchParams.set('resource_type', params.resourceType)
    }
    if (params?.search && params.search.trim()) {
      url.searchParams.set('search', params.search.trim())
    }

    const result = await fetch(
      url.toString(),
      RequestBodyWithAuthHeader('GET', null, null, accessToken)
    )
    if (result.ok) {
      const data = await errorHandling(result)
      if (Array.isArray(data) && data.length > 0) return data
    }
  } catch (_e) {}

  let list = [...DEFAULT_RESOURCE_ITEMS]
  if (params?.folderId !== undefined && params?.folderId !== null) {
    list = list.filter((r) => r.folder_id === params.folderId)
  }
  if (params?.subject && params.subject !== 'all') {
    list = list.filter((r) => r.subject === params.subject)
  }
  if (params?.resourceType && params.resourceType !== 'all') {
    list = list.filter((r) => r.resource_type === params.resourceType)
  }
  if (params?.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase()
    list = list.filter((r) => r.title.toLowerCase().includes(q) || (r.description && r.description.toLowerCase().includes(q)))
  }
  return list
}

export async function createResource(
  data: Partial<ResourceItem> & { org_id: number; title: string },
  accessToken: string
): Promise<ResourceItem> {
  const result = await fetch(
    `${getAPIUrl()}resources/items`,
    RequestBodyWithAuthHeader('POST', data, null, accessToken)
  )
  return errorHandling(result)
}

export async function updateResource(
  resourceUuid: string,
  data: Partial<ResourceItem>,
  accessToken: string
): Promise<ResourceItem> {
  const result = await fetch(
    `${getAPIUrl()}resources/items/${resourceUuid}`,
    RequestBodyWithAuthHeader('PUT', data, null, accessToken)
  )
  return errorHandling(result)
}

export async function deleteResource(
  resourceUuid: string,
  accessToken: string
): Promise<any> {
  const result = await fetch(
    `${getAPIUrl()}resources/items/${resourceUuid}`,
    RequestBodyWithAuthHeader('DELETE', null, null, accessToken)
  )
  return errorHandling(result)
}

export async function trackResourceAccess(
  resourceUuid: string,
  action: 'view' | 'download',
  accessToken: string
): Promise<{ status: string; views: number; downloads: number }> {
  const result = await fetch(
    `${getAPIUrl()}resources/items/${resourceUuid}/track`,
    RequestBodyWithAuthHeader('POST', { action }, null, accessToken)
  )
  return errorHandling(result)
}

export async function getResourceLogs(
  resourceUuid: string,
  accessToken: string
): Promise<{
  resource_uuid: string
  title: string
  views_count: number
  downloads_count: number
  logs: ResourceAccessLog[]
}> {
  const result = await fetch(
    `${getAPIUrl()}resources/items/${resourceUuid}/logs`,
    RequestBodyWithAuthHeader('GET', null, null, accessToken)
  )
  return errorHandling(result)
}

export async function uploadResourceFile(
  file: File,
  orgId: number,
  accessToken: string
): Promise<{
  file_url: string
  file_name: string
  file_size: number
  resource_type: string
}> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('org_id', String(orgId))

  const result = await fetch(`${getAPIUrl()}resources/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  })
  return errorHandling(result)
}
