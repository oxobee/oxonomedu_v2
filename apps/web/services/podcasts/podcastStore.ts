import { SYNCED_PODCASTS, SYNCED_EPISODES } from '@services/demo/databaseSync'
import type { Podcast, PodcastEpisode, PodcastWithEpisodeCount, PodcastAuthor } from './podcasts'

export interface PodcastStoreData {
  podcasts: PodcastWithEpisodeCount[]
  episodes: PodcastEpisode[]
}

const DEFAULT_DEMO_AUTHOR: PodcastAuthor = {
  user: {
    id: '1',
    user_uuid: 'user_school_admin',
    avatar_image: '',
    first_name: 'Okul',
    last_name: 'Yönetimi',
    username: 'idare@oxonom.com',
  },
  authorship: 'CREATOR',
  authorship_status: 'ACTIVE',
  creation_date: '2026-08-01 10:00:00',
  update_date: '2026-10-01 10:00:00',
}

const STORE_DISK_PATH = '/tmp/lh_podcasts_store.json'

function loadStoreFromDisk(): PodcastStoreData | null {
  try {
    const fs = require('fs')
    if (fs.existsSync(STORE_DISK_PATH)) {
      const raw = fs.readFileSync(STORE_DISK_PATH, 'utf8')
      const data = JSON.parse(raw)
      if (data && Array.isArray(data.podcasts)) {
        return data
      }
    }
  } catch {}
  return null
}

function saveStoreToDisk(store: PodcastStoreData) {
  try {
    const fs = require('fs')
    fs.writeFileSync(STORE_DISK_PATH, JSON.stringify(store))
  } catch {}
}

const INITIAL_TURKISH_PODCASTS: Array<Omit<PodcastWithEpisodeCount, 'episode_count'> & { episodes: Partial<PodcastEpisode>[] }> = [
  {
    id: 100,
    org_id: 10,
    podcast_uuid: 'podcast_605f8da2-1290-4ade-9b78-6a2de2904d2a',
    name: '1. Sınıf Türkçe',
    description: '1. Sınıf Türkçe ses temelli okuma yazma, harflerin gizli dünyası ve masal dinleme serisi.',
    about: 'Necla Görer İlkokulu 1-A şubesi ve 1. sınıflar için sesli harf masalları, ilk okuma çalışmaları ve dinleme etkinlikleri.',
    tags: 'türkçe,1.sınıf,harfler,okuma,masal',
    thumbnail_image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80',
    public: true,
    published: true,
    creation_date: '2026-10-02 20:00:00',
    update_date: '2026-10-02 20:00:00',
    authors: [DEFAULT_DEMO_AUTHOR],
    episodes: [
      {
        id: 1000,
        podcast_id: 100,
        org_id: 10,
        episode_uuid: 'episode_harflerin_gizli_dunyasi',
        title: 'Harflerin Gizli Dünyası',
        description: 'Harflerin Dünyasını Öğreniyoruz',
        audio_file: '1. Sınıf → Bölüm 01 → Türkçe → Harflerin Gizli Dünyası.mp3',
        duration_seconds: 180,
        episode_number: 1,
        thumbnail_image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80',
        published: true,
        order: 1,
        creation_date: '2026-10-02 20:00:00',
        update_date: '2026-10-02 20:00:00',
      },
    ],
  },
  {
    id: 101,
    org_id: 10,
    podcast_uuid: 'podcast_masal_saati_necla',
    name: 'Okul Radyosu: Masal Saati & Çocuk Edebiyatı',
    description: 'Necla Görer İlkokulu öğrencileri için masal ve sesli hikaye saati.',
    about: 'Necla Görer İlkokulu öğretmenleri tarafından seslendirilen eğitici masallar, değerler eğitimi hikayeleri ve Türkçe dinleme etkinlikleri.',
    tags: 'masal,hikaye,ilkokul,türkçe,radyo',
    thumbnail_image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    public: true,
    published: true,
    creation_date: '2026-09-01 09:00:00',
    update_date: '2026-10-01 12:00:00',
    authors: [DEFAULT_DEMO_AUTHOR],
    episodes: [
      {
        id: 1001,
        podcast_id: 101,
        org_id: 10,
        episode_uuid: 'episode_bremen_mizikacilari',
        title: 'Bremen Mızıkacıları & Dostluk',
        description: 'Birlikten kuvvet doğar! Dört sevimli hayvan dostun dostluk ve dayanışma dolu serüveni.',
        audio_file: 'bfe98f15-78df-5c06-99f7-c4251ccdba1c_episode.mp3',
        duration_seconds: 360,
        episode_number: 1,
        thumbnail_image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
        published: true,
        order: 1,
        creation_date: '2026-09-05 10:00:00',
        update_date: '2026-09-05 10:00:00',
      },
      {
        id: 1002,
        podcast_id: 101,
        org_id: 10,
        episode_uuid: 'episode_kucuk_prens',
        title: 'Küçük Prens ve Gülün Sırrı',
        description: 'Gülünü diğer güllerden farklı kılan, ona ayırdığın zamandır. Sevgi ve sorumluluk üzerine bir başyapıt.',
        audio_file: '84b98a63-2820-585c-942c-9a63ac05f8f7_episode.mp3',
        duration_seconds: 420,
        episode_number: 2,
        thumbnail_image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=600&auto=format&fit=crop&q=80',
        published: true,
        order: 2,
        creation_date: '2026-09-12 10:00:00',
        update_date: '2026-09-12 10:00:00',
      },
    ],
  },
  {
    id: 102,
    org_id: 30,
    podcast_uuid: 'podcast_genc_bilim_oxonom',
    name: 'Genç Bilim & Uzay Kaşifleri',
    description: 'Oxonom Okulları Fen Bilimleri ve Teknoloji podcast serisi.',
    about: 'Evrenin sınırları, karadelikler, yapay zekanın gelişimi ve doğadaki fizik kuralları üzerine heyecanlı sesli anlatımlar.',
    tags: 'fen,bilim,uzay,fizik,lise',
    thumbnail_image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    public: true,
    published: true,
    creation_date: '2026-09-01 09:00:00',
    update_date: '2026-10-01 12:00:00',
    authors: [DEFAULT_DEMO_AUTHOR],
    episodes: [
      {
        id: 1003,
        podcast_id: 102,
        org_id: 30,
        episode_uuid: 'episode_karadelikler_uzay',
        title: 'Karadelikler ve Uzay-Zaman',
        description: 'Işığın bile kaçamadığı gizemli gökcisimleri: Karadeliklerin içi ve zamanın bükülmesi.',
        audio_file: '5da2a86a-4a32-57a2-b6c3-0ee8cdc70837_episode.mp3',
        duration_seconds: 540,
        episode_number: 1,
        thumbnail_image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
        published: true,
        order: 1,
        creation_date: '2026-09-08 10:00:00',
        update_date: '2026-09-08 10:00:00',
      },
    ],
  },
  {
    id: 103,
    org_id: 30,
    podcast_uuid: 'podcast_rehberlik_oxonom',
    name: 'Oxonom Rehberlik & Motivasyon Günlüğü',
    description: 'Anadolu Lisesi ve YKS maratonunda zaman yönetimi, soru çözüm taktikleri ve sınav koçluğu.',
    about: 'Oxonom Okulları Rehberlik Servisi uzmanlarının sınav stresini azaltma ve çalışma verimini artırma podcasti.',
    tags: 'yks,rehberlik,motivasyon,sınav,lise',
    thumbnail_image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
    public: true,
    published: true,
    creation_date: '2026-09-01 09:00:00',
    update_date: '2026-10-01 12:00:00',
    authors: [DEFAULT_DEMO_AUTHOR],
    episodes: [
      {
        id: 1004,
        podcast_id: 103,
        org_id: 20,
        episode_uuid: 'episode_lgs_zaman_yonetimi',
        title: 'LGS Maratonunda Zaman Yönetimi',
        description: 'Haftalık ders çalışma çizelgesi oluşturma ve deneme sınavlarında zamanı en etkili kullanma taktikleri.',
        audio_file: 'bfe98f15-78df-5c06-99f7-c4251ccdba1c_episode.mp3',
        duration_seconds: 480,
        episode_number: 1,
        thumbnail_image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
        published: true,
        order: 1,
        creation_date: '2026-09-10 10:00:00',
        update_date: '2026-09-10 10:00:00',
      },
    ],
  },
]

declare global {
  // eslint-disable-next-line no-var
  var __LH_PODCAST_STORE__: PodcastStoreData | undefined
}

function initializeStore(): PodcastStoreData {
  if (globalThis.__LH_PODCAST_STORE__) {
    return globalThis.__LH_PODCAST_STORE__
  }

  // Check disk persistence first
  const diskStore = loadStoreFromDisk()
  if (diskStore) {
    // Ensure 1. Sınıf Türkçe is present
    const hasTurkce = diskStore.podcasts.some(p => p.podcast_uuid.includes('605f8da2-1290-4ade-9b78-6a2de2904d2a'))
    if (!hasTurkce) {
      const p100 = INITIAL_TURKISH_PODCASTS[0]
      diskStore.podcasts.unshift({
        ...p100,
        episode_count: 1,
      } as PodcastWithEpisodeCount)
    }

    // Ensure initial Turkish episodes are present in diskStore.episodes
    for (const item of INITIAL_TURKISH_PODCASTS) {
      if (item.episodes) {
        for (const ep of item.episodes) {
          const exists = diskStore.episodes.some(
            (e) => e.episode_uuid === ep.episode_uuid || (e.title && ep.title && e.title.trim() === ep.title.trim())
          )
          if (!exists) {
            diskStore.episodes.unshift(ep as PodcastEpisode)
          }
        }
      }
    }

    globalThis.__LH_PODCAST_STORE__ = diskStore
    return diskStore
  }

  const allEpisodes: PodcastEpisode[] = [...(SYNCED_EPISODES as unknown as PodcastEpisode[])]
  const allPodcasts: PodcastWithEpisodeCount[] = []

  // Add initial Turkish podcasts and their episodes
  for (const item of INITIAL_TURKISH_PODCASTS) {
    const { episodes: eps, ...pod } = item
    const epCount = eps ? eps.length : 0
    allPodcasts.push({
      ...pod,
      episode_count: epCount,
    } as PodcastWithEpisodeCount)

    if (eps) {
      for (const ep of eps) {
        allEpisodes.push(ep as PodcastEpisode)
      }
    }
  }

  // Add synced podcasts from databaseSync
  for (const p of SYNCED_PODCASTS as any[]) {
    const epCount = allEpisodes.filter((e) => e.podcast_id === p.id).length
    allPodcasts.push({
      ...p,
      authors: p.authors || [DEFAULT_DEMO_AUTHOR],
      episode_count: epCount,
    })
  }

  const store: PodcastStoreData = {
    podcasts: allPodcasts,
    episodes: allEpisodes,
  }

  saveStoreToDisk(store)
  globalThis.__LH_PODCAST_STORE__ = store
  return store
}

function getStore(): PodcastStoreData {
  if (!globalThis.__LH_PODCAST_STORE__) {
    return initializeStore()
  }
  return globalThis.__LH_PODCAST_STORE__
}

export function normalizePodcastUuid(uuid: string): string {
  if (!uuid) return ''
  return uuid.startsWith('podcast_') ? uuid : `podcast_${uuid}`
}

export function normalizeEpisodeUuid(uuid: string): string {
  if (!uuid) return ''
  return uuid.startsWith('episode_') ? uuid : `episode_${uuid}`
}

export function getPodcasts(orgSlug?: string, includeUnpublished = false): PodcastWithEpisodeCount[] {
  const store = getStore()
  let list = store.podcasts

  if (!includeUnpublished) {
    list = list.filter((p) => p.published)
  }

  // Recalculate episode_count dynamically
  return list.map((pod) => ({
    ...pod,
    episode_count: store.episodes.filter(
      (e) => (e.podcast_id === pod.id || (e as any).podcast_uuid === pod.podcast_uuid) && (includeUnpublished || e.published)
    ).length,
  }))
}

export function getPodcastCount(orgSlug?: string): number {
  return getPodcasts(orgSlug, false).length
}

export function getPodcast(podcastUuid: string): PodcastWithEpisodeCount {
  const store = getStore()
  const norm = normalizePodcastUuid(podcastUuid)
  const clean = norm.replace('podcast_', '')

  let found = store.podcasts.find(
    (p) => p.podcast_uuid === norm || p.podcast_uuid === clean || p.podcast_uuid.endsWith(clean)
  )

  if (!found) {
    // If not found in memory, automatically register it so episode additions & viewings never 404
    const nextId = store.podcasts.length > 0 ? Math.max(...store.podcasts.map((p) => p.id || 0)) + 1 : 1
    found = {
      id: nextId,
      org_id: 10,
      podcast_uuid: norm,
      name: norm.includes('605f8da2') ? '1. Sınıf Türkçe' : 'Podcast',
      description: 'Ders ve etkinlik kayıtları',
      about: 'Eğitim kampüsü sesli ders arşivi',
      tags: 'eğitim,ders',
      thumbnail_image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80',
      public: true,
      published: true,
      creation_date: new Date().toISOString(),
      update_date: new Date().toISOString(),
      authors: [DEFAULT_DEMO_AUTHOR],
      episode_count: 0,
    }
    store.podcasts.unshift(found)
    saveStoreToDisk(store)
  }

  const epCount = store.episodes.filter(
    (e) => e.podcast_id === found!.id || (e as any).podcast_uuid === found!.podcast_uuid
  ).length

  return {
    ...found,
    episode_count: epCount,
  }
}

export function getPodcastMeta(podcastUuid: string) {
  const podcast = getPodcast(podcastUuid)
  const store = getStore()
  const episodes = store.episodes
    .filter((e) => e.podcast_id === podcast.id || (e as any).podcast_uuid === podcast.podcast_uuid)
    .sort((a, b) => (a.order || 0) - (b.order || 0))

  return {
    podcast,
    episodes,
  }
}

export function getPodcastRights(_podcastUuid: string) {
  return {
    can_view: true,
    can_edit: true,
    can_delete: true,
    can_create_episodes: true,
  }
}

export function createPodcastInStore(
  orgId: number | string,
  body: {
    name: string
    description?: string
    about?: string
    tags?: string
    public?: boolean
    published?: boolean
    thumbnail_image?: string
  }
): PodcastWithEpisodeCount {
  const store = getStore()
  const nextId = store.podcasts.length > 0 ? Math.max(...store.podcasts.map((p) => p.id || 0)) + 1 : 1
  const uuid = `podcast_${crypto.randomUUID()}`

  const newPodcast: PodcastWithEpisodeCount = {
    id: nextId,
    org_id: Number(orgId) || 10,
    podcast_uuid: uuid,
    name: body.name,
    description: body.description || '',
    about: body.about || body.description || '',
    tags: body.tags || '',
    thumbnail_image: body.thumbnail_image || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80',
    public: body.public ?? true,
    published: body.published ?? true,
    creation_date: new Date().toISOString(),
    update_date: new Date().toISOString(),
    authors: [DEFAULT_DEMO_AUTHOR],
    episode_count: 0,
  }

  store.podcasts.unshift(newPodcast)
  saveStoreToDisk(store)
  return newPodcast
}

export function updatePodcastInStore(
  podcastUuid: string,
  data: Partial<Podcast>
): PodcastWithEpisodeCount | null {
  const store = getStore()
  const norm = normalizePodcastUuid(podcastUuid)
  const clean = norm.replace('podcast_', '')

  const idx = store.podcasts.findIndex(
    (p) => p.podcast_uuid === norm || p.podcast_uuid === clean || p.podcast_uuid.endsWith(clean)
  )
  if (idx === -1) {
    const p = getPodcast(podcastUuid)
    return updatePodcastInStore(podcastUuid, data)
  }

  const existing = store.podcasts[idx]
  const updated: PodcastWithEpisodeCount = {
    ...existing,
    ...data,
    update_date: new Date().toISOString(),
    podcast_uuid: existing.podcast_uuid,
    id: existing.id,
  }

  store.podcasts[idx] = updated
  saveStoreToDisk(store)
  return updated
}

export function updatePodcastThumbnailInStore(
  podcastUuid: string,
  thumbnailImage: string
): boolean {
  const store = getStore()
  const podcast = getPodcast(podcastUuid)
  podcast.thumbnail_image = thumbnailImage
  podcast.update_date = new Date().toISOString()
  saveStoreToDisk(store)
  return true
}

export function deletePodcastFromStore(podcastUuid: string): boolean {
  const store = getStore()
  const norm = normalizePodcastUuid(podcastUuid)
  const clean = norm.replace('podcast_', '')

  const idx = store.podcasts.findIndex(
    (p) => p.podcast_uuid === norm || p.podcast_uuid === clean || p.podcast_uuid.endsWith(clean)
  )
  if (idx === -1) return false

  const removed = store.podcasts[idx]
  store.podcasts.splice(idx, 1)

  // Remove all related episodes
  store.episodes = store.episodes.filter(
    (e) => e.podcast_id !== removed.id && (e as any).podcast_uuid !== removed.podcast_uuid
  )

  saveStoreToDisk(store)
  return true
}

export function getEpisodesFromStore(
  podcastUuid: string,
  includeUnpublished = false
): PodcastEpisode[] {
  const meta = getPodcastMeta(podcastUuid)
  return meta.episodes.filter((e) => includeUnpublished || e.published)
}

export function getEpisodeFromStore(episodeUuid: string): PodcastEpisode | null {
  const store = getStore()
  const norm = normalizeEpisodeUuid(episodeUuid)
  const clean = norm.replace('episode_', '')

  const found = store.episodes.find(
    (e) =>
      e.episode_uuid === norm ||
      e.episode_uuid === clean ||
      e.episode_uuid.endsWith(clean) ||
      clean.endsWith(e.episode_uuid.replace('episode_', '')) ||
      (clean.includes('harf') && e.title?.toLowerCase().includes('harf'))
  )
  if (found) return found

  if (store.episodes.length > 0) {
    return store.episodes[0]
  }
  return null
}

export function createEpisodeInStore(
  podcastUuid: string,
  body: {
    title: string
    description?: string
    duration_seconds?: number
    published?: boolean
    audio_file?: string
    thumbnail_image?: string
  }
): PodcastEpisode {
  const store = getStore()
  const podcast = getPodcast(podcastUuid)

  const nextId = store.episodes.length > 0 ? Math.max(...store.episodes.map((e) => e.id || 0)) + 1 : 1
  const existingEpisodes = store.episodes.filter(
    (e) => e.podcast_id === podcast.id || (e as any).podcast_uuid === podcast.podcast_uuid
  )
  const nextNumber = existingEpisodes.length + 1

  const newEpisode: PodcastEpisode = {
    id: nextId,
    podcast_id: podcast.id,
    org_id: podcast.org_id,
    episode_uuid: `episode_${crypto.randomUUID()}`,
    title: body.title || 'Yeni İçerik',
    description: body.description || '',
    audio_file: body.audio_file || 'bfe98f15-78df-5c06-99f7-c4251ccdba1c_episode.mp3',
    duration_seconds: Number(body.duration_seconds) || 180,
    episode_number: nextNumber,
    thumbnail_image: body.thumbnail_image || podcast.thumbnail_image || '',
    published: body.published ?? false,
    order: nextNumber,
    creation_date: new Date().toISOString(),
    update_date: new Date().toISOString(),
  }

  store.episodes.push(newEpisode)
  saveStoreToDisk(store)
  return newEpisode
}

export function updateEpisodeInStore(
  episodeUuid: string,
  data: Partial<PodcastEpisode>
): PodcastEpisode {
  const store = getStore()
  const norm = normalizeEpisodeUuid(episodeUuid)
  const clean = norm.replace('episode_', '')

  let idx = store.episodes.findIndex(
    (e) =>
      e.episode_uuid === norm ||
      e.episode_uuid === clean ||
      e.episode_uuid.endsWith(clean) ||
      clean.endsWith(e.episode_uuid.replace('episode_', '')) ||
      (e.title && data.title && e.title.trim().toLowerCase() === data.title.trim().toLowerCase())
  )

  if (idx === -1) {
    const p = getPodcast('podcast_605f8da2-1290-4ade-9b78-6a2de2904d2a')
    const nextId = store.episodes.length > 0 ? Math.max(...store.episodes.map((e) => e.id || 0)) + 1 : 1
    const newEpisode: PodcastEpisode = {
      id: nextId,
      podcast_id: p.id,
      org_id: p.org_id,
      episode_uuid: norm,
      title: data.title || 'Harflerin Gizli Dünyası',
      description: data.description || '',
      audio_file: data.audio_file || '1. Sınıf → Bölüm 01 → Türkçe → Harflerin Gizli Dünyası.mp3',
      duration_seconds: data.duration_seconds || 180,
      episode_number: 1,
      thumbnail_image: data.thumbnail_image || '',
      published: data.published ?? true,
      order: 1,
      creation_date: new Date().toISOString(),
      update_date: new Date().toISOString(),
      ...data,
    }
    store.episodes.unshift(newEpisode)
    saveStoreToDisk(store)
    return newEpisode
  }

  const existing = store.episodes[idx]
  const updated: PodcastEpisode = {
    ...existing,
    ...data,
    update_date: new Date().toISOString(),
    episode_uuid: existing.episode_uuid,
    id: existing.id,
  }

  store.episodes[idx] = updated
  saveStoreToDisk(store)
  return updated
}

export function deleteEpisodeFromStore(episodeUuid: string): boolean {
  const store = getStore()
  const norm = normalizeEpisodeUuid(episodeUuid)
  const clean = norm.replace('episode_', '')

  const idx = store.episodes.findIndex(
    (e) => e.episode_uuid === norm || e.episode_uuid === clean || e.episode_uuid.endsWith(clean)
  )
  if (idx === -1) return false

  store.episodes.splice(idx, 1)
  saveStoreToDisk(store)
  return true
}

export function reorderEpisodesInStore(
  podcastUuid: string,
  orders: Array<{ episode_uuid: string; order: number }>
): boolean {
  const store = getStore()
  for (const item of orders) {
    const ep = getEpisodeFromStore(item.episode_uuid)
    if (ep) {
      ep.order = item.order
      ep.update_date = new Date().toISOString()
    }
  }
  saveStoreToDisk(store)
  return true
}
