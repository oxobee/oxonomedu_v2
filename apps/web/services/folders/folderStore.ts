import { TURKISH_FOLDERS, TURKISH_COURSES } from '@services/demo/turkishSchoolData'

export interface FolderItem {
  id: number
  folder_uuid: string
  name: string
  description?: string
  org_id: number
  parent_folder_uuid: string | null
  color?: string
  public?: boolean
  thumbnail_image?: string | null
  creation_date: string
  update_date: string
  items_count?: number
  total_items?: number
  items?: any[]
  subfolders?: FolderItem[]
  breadcrumbs?: Array<{ folder_uuid: string; name: string }>
}

export interface MediaItem {
  id: number
  media_uuid: string
  name: string
  media_type: 'UPLOAD' | 'EMBED'
  url?: string
  file_name?: string
  file_data?: string
  description?: string
  public?: boolean
  org_id: number
  folder_uuid?: string | null
  creation_date: string
  update_date: string
}

export interface FolderStoreData {
  folders: FolderItem[]
  rootItems: any[]
  media: MediaItem[]
}

let memoryFolderStore: FolderStoreData | null = null

function loadStoreFromDisk(): FolderStoreData | null {
  return memoryFolderStore
}

function saveStoreToDisk(store: FolderStoreData) {
  memoryFolderStore = store
}

const INITIAL_MEDIA: MediaItem[] = [
  {
    id: 1,
    media_uuid: 'media_meb_ogretim_programi_2026',
    name: 'MEB 2026-2027 Öğretim Programı & Yıllık Kazanım Planı',
    media_type: 'EMBED',
    url: 'https://mufredat.meb.gov.tr',
    description: 'Bakanlık tarafından güncellenen haftalık ders çizelgeleri ve ünite bazlı kazanım tabloları.',
    public: true,
    org_id: 2,
    folder_uuid: null,
    creation_date: '2026-09-30 10:00:00',
    update_date: '2026-10-01 10:00:00',
  },
  {
    id: 2,
    media_uuid: 'media_lgs_yks_basari_rehberi',
    name: 'Öğrenci Başarı ve Hedef Belirleme Kılavuzu (PDF)',
    media_type: 'EMBED',
    url: 'https://ogmmateryal.eba.gov.tr',
    description: 'Sınav stratejileri, zaman yönetimi ve verimli ders çalışma teknikleri rehber dokümanı.',
    public: true,
    org_id: 2,
    folder_uuid: null,
    creation_date: '2026-09-30 10:00:00',
    update_date: '2026-10-01 10:00:00',
  },
]

const INITIAL_ROOT_ITEMS: any[] = [
  {
    resource_uuid: 'media_meb_ogretim_programi_2026',
    resource_type: 'media',
    resource: {
      media_uuid: 'media_meb_ogretim_programi_2026',
      name: 'MEB 2026-2027 Öğretim Programı & Yıllık Kazanım Planı',
      media_type: 'EMBED',
      url: 'https://mufredat.meb.gov.tr',
      description: 'Bakanlık tarafından güncellenen haftalık ders çizelgeleri ve ünite bazlı kazanım tabloları.',
    },
    position: 0,
  },
  {
    resource_uuid: 'media_lgs_yks_basari_rehberi',
    resource_type: 'media',
    resource: {
      media_uuid: 'media_lgs_yks_basari_rehberi',
      name: 'Öğrenci Başarı ve Hedef Belirleme Kılavuzu (PDF)',
      media_type: 'EMBED',
      url: 'https://ogmmateryal.eba.gov.tr',
      description: 'Sınav stratejileri, zaman yönetimi ve verimli ders çalışma teknikleri rehber dokümanı.',
    },
    position: 1,
  },
]

function getInitialFolders(): FolderItem[] {
  return TURKISH_FOLDERS.map((f: any) => ({
    id: f.id,
    folder_uuid: f.folder_uuid,
    name: f.name,
    description: f.description || '',
    org_id: f.org_id || 2,
    parent_folder_uuid: f.parent_folder_uuid || null,
    color: f.color || (f.id === 1 ? 'indigo' : f.id === 2 ? 'blue' : f.id === 3 ? 'amber' : f.id === 4 ? 'emerald' : 'violet'),
    public: true,
    thumbnail_image: null,
    creation_date: f.creation_date || '2026-09-30 10:00:00',
    update_date: f.update_date || '2026-10-01 10:00:00',
    items_count: f.items_count || 0,
    total_items: f.items_count || 0,
    items: f.id === 1 && TURKISH_COURSES[0] ? [
      {
        resource_uuid: TURKISH_COURSES[0].course_uuid,
        resource_type: 'courses',
        resource: TURKISH_COURSES[0],
        position: 0,
      }
    ] : [],
    subfolders: [],
  }))
}

let store: FolderStoreData = {
  folders: getInitialFolders(),
  rootItems: [...INITIAL_ROOT_ITEMS],
  media: [...INITIAL_MEDIA],
}

let initialized = false

function initStore() {
  if (initialized) return
  const fromDisk = loadStoreFromDisk()
  if (fromDisk && Array.isArray(fromDisk.folders) && fromDisk.folders.length > 0) {
    store = fromDisk
  } else {
    store = {
      folders: getInitialFolders(),
      rootItems: [...INITIAL_ROOT_ITEMS],
      media: [...INITIAL_MEDIA],
    }
    saveStoreToDisk(store)
  }
  initialized = true
}

export function cleanFolderUuid(uuid?: string | null): string {
  if (!uuid) return ''
  return String(uuid).replace(/^folder_/, '').trim()
}

export function getOrgFoldersFromStore(orgId?: number, parentFolderUuid?: string | null): FolderItem[] {
  initStore()
  let list = store.folders

  if (parentFolderUuid) {
    const cleanParent = cleanFolderUuid(parentFolderUuid)
    list = list.filter((f) => cleanFolderUuid(f.parent_folder_uuid) === cleanParent)
  } else {
    // Root level folders only
    list = list.filter((f) => !f.parent_folder_uuid)
  }

  // Populate total_items for each folder
  return list.map((f) => {
    const cleanCurrent = cleanFolderUuid(f.folder_uuid)
    const childFolders = store.folders.filter((cf) => cleanFolderUuid(cf.parent_folder_uuid) === cleanCurrent)
    const itemsLen = f.items?.length || 0
    return {
      ...f,
      subfolders: childFolders,
      total_items: itemsLen + childFolders.length,
      items_count: itemsLen + childFolders.length,
    }
  })
}

export function getFolderFromStore(folderUuid: string): FolderItem | null {
  initStore()
  const clean = cleanFolderUuid(folderUuid)
  const f = store.folders.find(
    (folder) => cleanFolderUuid(folder.folder_uuid) === clean || String(folder.id) === clean
  )
  if (!f) return null

  const cleanCurrent = cleanFolderUuid(f.folder_uuid)
  const subfolders = store.folders.filter((cf) => cleanFolderUuid(cf.parent_folder_uuid) === cleanCurrent)

  // Build breadcrumbs
  const breadcrumbs: Array<{ folder_uuid: string; name: string }> = []
  let currParentUuid = f.parent_folder_uuid
  while (currParentUuid) {
    const parentFolder = store.folders.find(
      (pf) => cleanFolderUuid(pf.folder_uuid) === cleanFolderUuid(currParentUuid)
    )
    if (parentFolder) {
      breadcrumbs.unshift({ folder_uuid: parentFolder.folder_uuid, name: parentFolder.name })
      currParentUuid = parentFolder.parent_folder_uuid
    } else {
      break
    }
  }
  breadcrumbs.push({ folder_uuid: f.folder_uuid, name: f.name })

  const items = f.items || []

  return {
    ...f,
    subfolders,
    items,
    breadcrumbs,
    total_items: items.length + subfolders.length,
    items_count: items.length + subfolders.length,
  }
}

export function createFolderInStore(data: Partial<FolderItem>): FolderItem {
  initStore()
  const now = new Date().toISOString()
  const id = Date.now()
  const cleanId = Math.random().toString(36).substring(2, 8)
  const folderUuid = `folder_${id}_${cleanId}`

  const newFolder: FolderItem = {
    id,
    folder_uuid: folderUuid,
    name: data.name?.trim() || 'Yeni Klasör',
    description: data.description?.trim() || '',
    org_id: Number(data.org_id) || 2,
    parent_folder_uuid: data.parent_folder_uuid ? String(data.parent_folder_uuid) : null,
    color: data.color || 'violet',
    public: data.public !== false,
    thumbnail_image: data.thumbnail_image || null,
    creation_date: now,
    update_date: now,
    items_count: 0,
    total_items: 0,
    items: [],
    subfolders: [],
  }

  store.folders.unshift(newFolder)
  saveStoreToDisk(store)
  return newFolder
}

export function updateFolderInStore(folderUuid: string, updates: Partial<FolderItem>): FolderItem | null {
  initStore()
  const clean = cleanFolderUuid(folderUuid)
  const idx = store.folders.findIndex(
    (f) => cleanFolderUuid(f.folder_uuid) === clean || String(f.id) === clean
  )
  if (idx === -1) {
    // If not found, create it with the requested updates
    const created = createFolderInStore({
      folder_uuid: folderUuid.startsWith('folder_') ? folderUuid : `folder_${folderUuid}`,
      ...updates,
    })
    return created
  }

  const existing = store.folders[idx]
  const updated: FolderItem = {
    ...existing,
    ...updates,
    name: updates.name !== undefined ? updates.name : existing.name,
    description: updates.description !== undefined ? updates.description : existing.description,
    color: updates.color !== undefined ? updates.color : existing.color,
    public: updates.public !== undefined ? updates.public : existing.public,
    thumbnail_image: updates.thumbnail_image !== undefined ? updates.thumbnail_image : existing.thumbnail_image,
    update_date: new Date().toISOString(),
  }

  store.folders[idx] = updated
  saveStoreToDisk(store)
  return updated
}

export function deleteFolderFromStore(folderUuid: string): boolean {
  initStore()
  const clean = cleanFolderUuid(folderUuid)
  const target = store.folders.find(
    (f) => cleanFolderUuid(f.folder_uuid) === clean || String(f.id) === clean
  )
  if (!target) return false

  const targetUuid = target.folder_uuid
  // Delete folder and all its descendant subfolders
  store.folders = store.folders.filter(
    (f) => f.folder_uuid !== targetUuid && f.parent_folder_uuid !== targetUuid
  )
  saveStoreToDisk(store)
  return true
}

export function addFolderContentInStore(folderUuid: string, resourceUuid: string, position: number = 0): boolean {
  initStore()
  const clean = cleanFolderUuid(folderUuid)
  const folder = store.folders.find(
    (f) => cleanFolderUuid(f.folder_uuid) === clean || String(f.id) === clean
  )
  if (!folder) return false

  if (!folder.items) folder.items = []
  const existingIdx = folder.items.findIndex((i: any) => i.resource_uuid === resourceUuid)
  if (existingIdx !== -1) return true

  // Check if it's a media item
  const media = store.media.find((m) => m.media_uuid === resourceUuid)
  const course = TURKISH_COURSES.find((c) => c.course_uuid === resourceUuid)

  const newItem = {
    resource_uuid: resourceUuid,
    resource_type: media ? 'media' : course ? 'courses' : 'media',
    resource: media ? { ...media } : course ? { ...course } : { resource_uuid: resourceUuid, name: 'Materyal' },
    position,
  }

  folder.items.splice(position, 0, newItem)
  folder.items_count = (folder.items_count || 0) + 1
  folder.total_items = (folder.total_items || 0) + 1
  saveStoreToDisk(store)
  return true
}

export function removeFolderContentFromStore(folderUuid: string, resourceUuid: string): boolean {
  initStore()
  const clean = cleanFolderUuid(folderUuid)
  const folder = store.folders.find(
    (f) => cleanFolderUuid(f.folder_uuid) === clean || String(f.id) === clean
  )
  if (!folder || !folder.items) return false

  folder.items = folder.items.filter((i: any) => i.resource_uuid !== resourceUuid)
  folder.items_count = Math.max(0, (folder.items_count || 1) - 1)
  folder.total_items = Math.max(0, (folder.total_items || 1) - 1)
  saveStoreToDisk(store)
  return true
}

export function getRootItemsFromStore(_orgId?: number): any[] {
  initStore()
  return store.rootItems || []
}

export function addRootContentInStore(_orgId: number, resourceUuid: string, position: number = 0): boolean {
  initStore()
  if (!store.rootItems) store.rootItems = []
  const existingIdx = store.rootItems.findIndex((i: any) => i.resource_uuid === resourceUuid)
  if (existingIdx !== -1) return true

  const media = store.media.find((m) => m.media_uuid === resourceUuid)
  const course = TURKISH_COURSES.find((c) => c.course_uuid === resourceUuid)

  const newItem = {
    resource_uuid: resourceUuid,
    resource_type: media ? 'media' : course ? 'courses' : 'media',
    resource: media ? { ...media } : course ? { ...course } : { resource_uuid: resourceUuid, name: 'Materyal' },
    position,
  }

  store.rootItems.splice(position, 0, newItem)
  saveStoreToDisk(store)
  return true
}

export function removeRootContentFromStore(_orgId: number, resourceUuid: string): boolean {
  initStore()
  if (!store.rootItems) return false
  store.rootItems = store.rootItems.filter((i: any) => i.resource_uuid !== resourceUuid)
  saveStoreToDisk(store)
  return true
}

export function searchLibraryInStore(_orgId: number, query: string): { folders: FolderItem[]; items: any[] } {
  initStore()
  const q = query.trim().toLowerCase()
  if (!q) {
    return {
      folders: store.folders.filter((f) => !f.parent_folder_uuid),
      items: store.rootItems || [],
    }
  }

  const matchingFolders = store.folders.filter(
    (f) => f.name.toLowerCase().includes(q) || (f.description && f.description.toLowerCase().includes(q))
  )

  const matchingItems = (store.rootItems || []).filter((i: any) => {
    const name = i.resource?.name || i.resource?.title || ''
    const desc = i.resource?.description || ''
    return name.toLowerCase().includes(q) || desc.toLowerCase().includes(q)
  })

  return { folders: matchingFolders, items: matchingItems }
}

export function createMediaInStore(data: Partial<MediaItem>): MediaItem {
  initStore()
  const now = new Date().toISOString()
  const id = Date.now()
  const mediaUuid = `media_${id}_${Math.random().toString(36).substring(2, 7)}`

  const newMedia: MediaItem = {
    id,
    media_uuid: mediaUuid,
    name: data.name?.trim() || 'Yeni Medya',
    media_type: data.media_type || 'UPLOAD',
    url: data.url || '',
    file_name: data.file_name || '',
    file_data: data.file_data || '',
    description: data.description?.trim() || '',
    public: data.public !== false,
    org_id: Number(data.org_id) || 2,
    folder_uuid: data.folder_uuid || null,
    creation_date: now,
    update_date: now,
  }

  store.media.unshift(newMedia)

  const resourceItem = {
    resource_uuid: mediaUuid,
    resource_type: 'media',
    resource: { ...newMedia },
    position: 0,
  }

  if (data.folder_uuid) {
    addFolderContentInStore(data.folder_uuid, mediaUuid, 0)
  } else {
    store.rootItems.unshift(resourceItem)
  }

  saveStoreToDisk(store)
  return newMedia
}

export function getOrgMediaFromStore(_orgId?: number): MediaItem[] {
  initStore()
  return store.media || []
}

export function getMediaFromStore(mediaUuid: string): MediaItem | null {
  initStore()
  const clean = mediaUuid.replace(/^media_/, '')
  const m = store.media.find(
    (item) => item.media_uuid === mediaUuid || item.media_uuid.includes(clean)
  )
  return m || null
}

export function deleteMediaFromStore(mediaUuid: string): boolean {
  initStore()
  store.media = store.media.filter((m) => m.media_uuid !== mediaUuid)
  store.rootItems = store.rootItems.filter((i: any) => i.resource_uuid !== mediaUuid)
  store.folders.forEach((f) => {
    if (f.items) {
      f.items = f.items.filter((i: any) => i.resource_uuid !== mediaUuid)
    }
  })
  saveStoreToDisk(store)
  return true
}
