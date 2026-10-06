'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Search,
  X,
  Globe,
  Lock,
  Users,
  Pencil,
  Trash2,
  Copy,
  Download,
  Eye,
  EyeOff,
  Sparkles,
  Calculator,
  Languages,
  Microscope,
  Code2,
  Layers,
  School,
  Play,
  Settings2,
  ExternalLink,
  Plus,
  SlidersHorizontal,
} from 'lucide-react'
import { Cube } from '@phosphor-icons/react'
import { getPlaygroundThumbnailMediaDirectory } from '@services/media/media'
import { useOrg } from '@components/Contexts/OrgContext'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/keys'
import {
  createPlayground,
  deletePlayground,
  duplicatePlayground,
  getOrgPlaygrounds,
  updatePlayground,
  Playground,
} from '@services/playgrounds/playgrounds'
import {
  getAllModuleAssignments,
  getModuleAssignment,
  saveModuleAssignment,
  bulkUpdateModuleAssignments,
  ModuleAssignment,
} from '@services/playgrounds/moduleAssignments'
import { detectCategory } from '@components/Playground/PlaygroundCard'
import ModuleVisualCover from '@components/Playground/ModuleVisualCover'
import ModuleVisibilityModal from '@components/Playground/ModuleVisibilityModal'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Breadcrumbs } from '@components/Objects/Breadcrumbs/Breadcrumbs'
import AuthenticatedClientElement from '@components/Security/AuthenticatedClientElement'
import FeatureGate from '@components/Dashboard/Shared/FeatureGate/FeatureGate'
import { searchMatchesAny } from '@/lib/search/normalize'
import { useLHAnalytics, AnalyticsEvent } from '@services/analytics'
import CatalogPagination, { useCatalogPagination } from '@components/Objects/Catalog/CatalogPagination'
import { getUriWithOrg } from '@services/config/config'

interface PlaygroundsListClientProps {
  org_id: number
  orgslug: string
}

const CATEGORIES = [
  { id: 'all', labelTr: 'Tüm Modüller', labelEn: 'All Modules', icon: Layers },
  { id: 'grade1', labelTr: '1. Sınıf Temel Beceriler', labelEn: '1st Grade Essentials', icon: Sparkles },
  { id: 'math', labelTr: 'Matematik & Sayılar', labelEn: 'Math & Numbers', icon: Calculator },
  { id: 'turkish', labelTr: 'Türkçe & Okuma-Yazma', labelEn: 'Turkish & Reading', icon: Languages },
  { id: 'science', labelTr: 'Fen & Doğa', labelEn: 'Science & Nature', icon: Microscope },
  { id: 'coding', labelTr: 'Mantık & Kodlama', labelEn: 'Logic & Coding', icon: Code2 },
]

export default function PlaygroundsListClient({ org_id, orgslug }: PlaygroundsListClientProps) {
  const org = useOrg() as any
  const effectiveOrgId = org_id || org?.id || 10
  const session = useLHSession() as any
  const access_token = session?.data?.tokens?.access_token
  const queryClient = useQueryClient()
  const router = useRouter()
  const { t, i18n } = useTranslation()
  const isTr = i18n.language?.startsWith('tr') !== false
  const { track } = useLHAnalytics('dashboard')

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'active' | 'hidden' | 'classes' | 'students'>('all')

  // Selection & bulk actions
  const [selectedUuids, setSelectedUuids] = useState<Set<string>>(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Creation modal
  const [isCreating, setIsCreating] = useState(false)
  const [showNameModal, setShowNameModal] = useState(false)
  const [newName, setNewName] = useState('')

  // Visibility assignment modal state
  const [visibilityModalModule, setVisibilityModalModule] = useState<Playground | null>(null)

  // Quick interactive preview modal
  const [previewModule, setPreviewModule] = useState<Playground | null>(null)

  // Assignments map state for live reactivity
  const [assignmentsMap, setAssignmentsMap] = useState<Record<string, ModuleAssignment>>({})

  const loadAssignments = () => {
    setAssignmentsMap(getAllModuleAssignments(effectiveOrgId))
  }

  useEffect(() => {
    loadAssignments()
    const handleStorageChange = () => loadAssignments()
    window.addEventListener('oxonom_module_assignments_changed', handleStorageChange)
    return () => window.removeEventListener('oxonom_module_assignments_changed', handleStorageChange)
  }, [effectiveOrgId])

  // Data fetching
  const { data: playgrounds, isLoading } = useQuery({
    queryKey: queryKeys.playgrounds.list(orgslug),
    queryFn: () => getOrgPlaygrounds(effectiveOrgId, access_token),
    enabled: !!effectiveOrgId,
    staleTime: 60_000,
  })

  const allPlaygrounds: any[] = Array.isArray(playgrounds) ? playgrounds : []

  // Count items per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allPlaygrounds.length }
    allPlaygrounds.forEach((pg) => {
      const cat = detectCategory(pg).key
      counts[cat] = (counts[cat] || 0) + 1
    })
    return counts
  }, [allPlaygrounds])

  // Filtered playgrounds by search, category and visibility
  const filtered = useMemo(() => {
    return allPlaygrounds.filter((pg: any) => {
      // 1. Category filter
      if (activeCategory !== 'all') {
        const cat = detectCategory(pg).key
        if (cat !== activeCategory) return false
      }

      // 2. Visibility filter
      const assignment = assignmentsMap[pg.playground_uuid]
      const isPub = assignment ? assignment.published && assignment.scope !== 'hidden' : pg.published !== false
      const currentScope = assignment?.scope || (isPub ? 'all' : 'hidden')

      if (visibilityFilter === 'active' && !isPub) return false
      if (visibilityFilter === 'hidden' && isPub) return false
      if (visibilityFilter === 'classes' && currentScope !== 'classes') return false
      if (visibilityFilter === 'students' && currentScope !== 'students') return false

      // 3. Search query
      if (searchQuery.trim()) {
        return searchMatchesAny([pg.name, pg.description], searchQuery)
      }

      return true
    })
  }, [allPlaygrounds, searchQuery, activeCategory, visibilityFilter, assignmentsMap])

  const {
    currentPage,
    totalPages,
    paginatedItems: paginated,
    pageNumbers,
    goToPage,
    resetPage,
  } = useCatalogPagination(filtered, 12)

  useEffect(() => {
    resetPage()
  }, [searchQuery, activeCategory, visibilityFilter, resetPage])

  const toggleSelect = (uuid: string) => {
    setSelectedUuids((prev) => {
      const next = new Set(prev)
      next.has(uuid) ? next.delete(uuid) : next.add(uuid)
      return next
    })
  }

  const selectAllFiltered = () => {
    setSelectedUuids(new Set(filtered.map((p) => p.playground_uuid)))
  }

  const clearSelection = () => setSelectedUuids(new Set())

  const selectedPlaygrounds = allPlaygrounds.filter((pg: any) =>
    selectedUuids.has(pg.playground_uuid)
  )

  // ── Actions ──────────────────────────────────────────────────────────────

  const openCreateModal = () => {
    setNewName('')
    setShowNameModal(true)
  }

  const handleCreate = async () => {
    if (isCreating) return
    const name = newName.trim() || (isTr ? 'Yeni Etkileşimli Modül' : 'Untitled Playground')
    setIsCreating(true)
    setShowNameModal(false)
    try {
      const pg = await createPlayground(
        effectiveOrgId,
        { name, access_type: 'authenticated' },
        access_token || ''
      )
      track(AnalyticsEvent.PlaygroundCreated, {
        name_provided: newName.trim().length > 0,
        source: 'dashboard',
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.playgrounds.list(orgslug) })
      toast.success(isTr ? 'Modül oluşturuldu' : 'Playground created')
      router.push(`/editor/playground/${pg.playground_uuid}/edit`)
    } catch {
      toast.error(isTr ? 'Modül oluşturulamadı' : 'Failed to create playground')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async () => {
    if (selectedUuids.size === 0) return
    const uuids = Array.from(selectedUuids)
    try {
      if (access_token) {
        await Promise.all(uuids.map((uuid) => deletePlayground(uuid, access_token)))
      }
      clearSelection()
      queryClient.invalidateQueries({ queryKey: queryKeys.playgrounds.list(orgslug) })
      toast.success(
        isTr
          ? `${uuids.length} modül silindi`
          : `Deleted ${uuids.length} playground${uuids.length > 1 ? 's' : ''}`
      )
    } catch {
      toast.error(isTr ? 'Bazı modüller silinemedi' : 'Failed to delete some playgrounds')
    } finally {
      setShowDeleteConfirm(false)
    }
  }

  const handleDuplicate = async () => {
    if (selectedUuids.size === 0) return
    const uuids = Array.from(selectedUuids)
    const tId = toast.loading(
      isTr ? `${uuids.length} modül kopyalanıyor…` : `Duplicating ${uuids.length} playground${uuids.length > 1 ? 's' : ''}…`
    )
    try {
      if (access_token) {
        await Promise.all(uuids.map((uuid) => duplicatePlayground(uuid, access_token)))
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.playgrounds.list(orgslug) })
      toast.success(
        isTr
          ? `${uuids.length} modül kopyalandı`
          : `Duplicated ${uuids.length} playground${uuids.length > 1 ? 's' : ''}`,
        { id: tId }
      )
    } catch {
      toast.error(isTr ? 'Kopyalama başarısız' : 'Failed to duplicate', { id: tId })
    }
  }

  const handleDownload = () => {
    for (const pg of selectedPlaygrounds) {
      const html = pg.html_content || ''
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${pg.name || 'modul'}.html`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  // Bulk visibility update
  const handleBulkSetVisibility = async (publish: boolean) => {
    if (selectedUuids.size === 0) return
    const uuids = Array.from(selectedUuids)
    bulkUpdateModuleAssignments(effectiveOrgId, uuids, {
      published: publish,
      scope: publish ? 'all' : 'hidden',
    })

    if (access_token) {
      try {
        await Promise.all(
          uuids.map((uuid) => updatePlayground(uuid, { published: publish }, access_token))
        )
      } catch {
        // Fallback handled
      }
    }

    loadAssignments()
    queryClient.invalidateQueries({ queryKey: queryKeys.playgrounds.list(orgslug) })
    toast.success(
      publish
        ? `${uuids.length} modül tüm öğrencilere açıldı (yayında).`
        : `${uuids.length} modül öğrencilerden gizlendi (pasif).`
    )
    clearSelection()
  }

  // Fast single-card toggle
  const handleToggleSingleVisibility = async (pg: Playground, e: React.MouseEvent) => {
    e.stopPropagation()
    const currentAssignment = getModuleAssignment(effectiveOrgId, pg.playground_uuid, pg.published !== false)
    const newPublished = !currentAssignment.published
    const newScope = newPublished ? (currentAssignment.scope === 'hidden' ? 'all' : currentAssignment.scope) : 'hidden'

    saveModuleAssignment(effectiveOrgId, pg.playground_uuid, {
      published: newPublished,
      scope: newScope,
    })

    if (access_token) {
      try {
        await updatePlayground(pg.playground_uuid, { published: newPublished }, access_token)
      } catch {
        // Handled
      }
    }

    loadAssignments()
    queryClient.invalidateQueries({ queryKey: queryKeys.playgrounds.list(orgslug) })
    toast.success(
      newPublished
        ? `✨ "${pg.name}" aktif edildi (yayında)`
        : `🔒 "${pg.name}" öğrencilerden gizlendi (pasif)`
    )
  }

  const hasSelection = selectedUuids.size > 0

  return (
    <FeatureGate feature="playgrounds" orgslug={orgslug} context="dashboard">
      <div className="h-full w-full bg-[#f8f9fa] ps-4 pe-4 sm:ps-8 sm:pe-8 pb-16">
        {/* Header */}
        <div className="mb-6 pt-6">
          <Breadcrumbs
            items={[
              {
                label: isTr ? 'Modüller' : 'Playgrounds',
                href: '/dash/playgrounds',
                icon: <Cube size={14} />,
              },
            ]}
          />
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
                <span>{isTr ? 'Etkileşimli Ders Modülleri' : 'Interactive Modules'}</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {allPlaygrounds.length} {isTr ? 'Modül' : 'Modules'}
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">
                {isTr
                  ? 'Sınıfınızdaki öğrencilere özel modüller atayın, dilediğiniz sınıf veya öğrencilere gösterin/gizleyin. Akıllı tahtada ders sırasında başlatıp inceleyin.'
                  : 'Manage interactive learning modules, assign to classes or individual students, and launch directly in class.'}
              </p>
            </div>

            <AuthenticatedClientElement
              checkMethod="roles"
              action="create"
              ressourceType="playgrounds"
              orgId={effectiveOrgId}
            >
              <button
                onClick={openCreateModal}
                disabled={isCreating}
                className="rounded-xl bg-slate-900 hover:bg-slate-800 transition-all duration-150 p-2.5 px-4 font-bold text-xs text-white shadow-md flex items-center gap-2 hover:scale-[1.02] cursor-pointer disabled:opacity-50 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{isTr ? 'Yeni Modül Oluştur' : 'New Playground'}</span>
              </button>
            </AuthenticatedClientElement>
          </div>
        </div>

        {/* Categorical Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none mb-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            const isActive = activeCategory === cat.id
            const count = categoryCounts[cat.id] || 0
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200/80 shadow-2xs'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-gray-500'}`} />
                <span>{isTr ? cat.labelTr : cat.labelEn}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search, Visibility Filter & Selection action bar */}
        <div className="mb-6 flex flex-wrap gap-3 items-center justify-between bg-white p-3 rounded-2xl border border-gray-200/80 shadow-xs">
          {/* Left: Search & Filter */}
          <div className="flex items-center gap-2.5 flex-1 flex-wrap">
            <div className="relative min-w-[220px] flex-1 max-w-md">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isTr ? 'Modül adı veya içeriğinde ara...' : 'Search playgrounds...'}
                className="w-full ps-9 pe-9 py-2 bg-gray-50/80 hover:bg-gray-50 focus:bg-white rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 border border-gray-200 transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Visibility filter dropdown */}
            <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-xl border border-gray-200 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-gray-700 outline-none cursor-pointer"
              >
                <option value="all">{isTr ? 'Tüm Görünürlükler' : 'All Visibilities'}</option>
                <option value="active">{isTr ? '🟢 Aktif (Öğrencilere Açık)' : 'Active (Visible)'}</option>
                <option value="hidden">{isTr ? '🔴 Pasif (Gizli Modüller)' : 'Hidden (Draft)'}</option>
                <option value="classes">{isTr ? '🏫 Sınıfa Atanmışlar' : 'Class Assigned'}</option>
                <option value="students">{isTr ? '👤 Özel Öğrenciye Atanmışlar' : 'Student Assigned'}</option>
              </select>
            </div>
          </div>

          {/* Right: Selection Action Bar */}
          {hasSelection && (
            <div className="flex items-center gap-1.5 flex-wrap bg-indigo-50/80 border border-indigo-200 rounded-xl px-3 py-1.5">
              <span className="text-xs font-bold text-indigo-950 pe-2 border-e border-indigo-200">
                {selectedUuids.size} {isTr ? 'seçildi' : 'selected'}
              </span>

              <button
                onClick={() => handleBulkSetVisibility(true)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 rounded-lg transition-colors cursor-pointer"
                title="Seçilen modülleri tüm öğrencilere aç"
              >
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isTr ? 'Yayına Al (Göster)' : 'Publish'}</span>
              </button>

              <button
                onClick={() => handleBulkSetVisibility(false)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-800 bg-amber-100/80 hover:bg-amber-200 rounded-lg transition-colors cursor-pointer"
                title="Seçilen modülleri öğrencilerden gizle"
              >
                <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                <span>{isTr ? 'Gizle (Pasif)' : 'Hide'}</span>
              </button>

              <button
                onClick={handleDuplicate}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{isTr ? 'Çoğalt' : 'Duplicate'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isTr ? 'İndir' : 'Download'}</span>
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isTr ? 'Sil' : 'Delete'}</span>
              </button>

              <button
                onClick={clearSelection}
                className="ms-1 text-gray-400 hover:text-gray-700 p-0.5 cursor-pointer"
                title="Seçimi kaldır"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {!hasSelection && (
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <span>{filtered.length} {isTr ? 'modül listeleniyor' : 'modules listed'}</span>
              {filtered.length > 0 && (
                <button
                  type="button"
                  onClick={selectAllFiltered}
                  className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
                >
                  {isTr ? 'Tümünü Seç' : 'Select All'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Grid of Modules with Visual Covers */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-xs">
                <div className="aspect-video bg-gray-200" />
                <div className="p-4 space-y-2.5">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginated.map((pg: any) => {
              const isSelected = selectedUuids.has(pg.playground_uuid)
              const assignment = assignmentsMap[pg.playground_uuid]
              const isPublished = assignment ? assignment.published && assignment.scope !== 'hidden' : pg.published !== false
              const scope = assignment?.scope || (isPublished ? 'all' : 'hidden')
              const category = detectCategory(pg)

              // Badge calculation
              let scopeBadge = {
                label: isTr ? 'Tüm Sınıflar' : 'All Classes',
                icon: Globe,
                className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
              }
              if (!isPublished || scope === 'hidden') {
                scopeBadge = {
                  label: isTr ? 'Gizli (Pasif)' : 'Hidden (Draft)',
                  icon: Lock,
                  className: 'bg-rose-50 text-rose-800 border-rose-200',
                }
              } else if (scope === 'classes') {
                const count = assignment?.assignedClasses?.length || 0
                scopeBadge = {
                  label: count > 0 ? `${count} ${isTr ? 'Sınıf' : 'Classes'}` : isTr ? 'Sınıfa Atanmış' : 'Class Assigned',
                  icon: School,
                  className: 'bg-blue-50 text-blue-800 border-blue-200',
                }
              } else if (scope === 'students') {
                const count = assignment?.assignedStudents?.length || 0
                scopeBadge = {
                  label: count > 0 ? `${count} ${isTr ? 'Öğrenci' : 'Students'}` : isTr ? 'Özel Öğrenci' : 'Student Assigned',
                  icon: Users,
                  className: 'bg-purple-50 text-purple-800 border-purple-200',
                }
              }

              const ScopeIcon = scopeBadge.icon
              const cleanDescription = (pg.description || '').replace(/\[.*?\]/g, '').trim()

              const thumbnailUrl =
                pg.thumbnail_image && pg.org_uuid
                  ? getPlaygroundThumbnailMediaDirectory(
                      pg.org_uuid,
                      pg.playground_uuid,
                      pg.thumbnail_image
                    )
                  : null

              const directViewUrl = getUriWithOrg(orgslug, `/playground/${pg.playground_uuid}`)

              return (
                <div
                  key={pg.playground_uuid}
                  className={`group relative flex flex-col bg-white rounded-2xl overflow-hidden w-full transition-all duration-300 border hover:shadow-lg ${
                    isSelected
                      ? 'border-slate-900 ring-2 ring-slate-900 shadow-md'
                      : 'border-gray-200/90 shadow-2xs hover:border-gray-300'
                  }`}
                >
                  {/* Selection Checkbox */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleSelect(pg.playground_uuid)
                    }}
                    className={`absolute top-2.5 start-2.5 z-20 w-5 h-5 rounded-lg flex items-center justify-center transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                        : 'bg-white/90 border-gray-300 opacity-0 group-hover:opacity-100 hover:border-slate-800 shadow-xs'
                    }`}
                    title={isTr ? 'Seç' : 'Select'}
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>

                  {/* Top Right Quick Action Buttons */}
                  <div className="absolute top-2.5 end-2.5 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Quick Visibility Eye Toggle */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleSingleVisibility(pg, e)}
                      className="p-1.5 bg-white/95 backdrop-blur-md rounded-xl hover:bg-white text-gray-700 hover:text-black transition-all shadow-md border border-gray-200 cursor-pointer"
                      title={
                        isPublished
                          ? isTr
                            ? 'Modülü Öğrencilerden Gizle'
                            : 'Hide from Students'
                          : isTr
                          ? 'Modülü Öğrencilere Aç (Yayına Al)'
                          : 'Show to Students'
                      }
                    >
                      {isPublished ? (
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-rose-600" />
                      )}
                    </button>

                    {/* Visibility & Class/Student Assignment Settings Modal */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setVisibilityModalModule(pg)
                      }}
                      className="p-1.5 bg-white/95 backdrop-blur-md rounded-xl hover:bg-white text-gray-700 hover:text-indigo-600 transition-all shadow-md border border-gray-200 cursor-pointer"
                      title={isTr ? 'Görünürlük & Sınıf/Öğrenci Ata' : 'Assign to Class / Student'}
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Visual Cover (Identical to student view) */}
                  <div
                    className="relative aspect-video overflow-hidden cursor-pointer"
                    onClick={() => setPreviewModule(pg)}
                    title={isTr ? 'Önizlemek için tıklayın' : 'Click to preview'}
                  >
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={pg.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <ModuleVisualCover
                        name={pg.name}
                        description={pg.description || ''}
                        className="transition-transform duration-500 group-hover:scale-105"
                      />
                    )}

                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                    {/* Scope Badge (Bottom Left) */}
                    <div className="absolute bottom-2.5 start-2.5 flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full border shadow-xs backdrop-blur-md bg-white/95 ${scopeBadge.className}`}
                      >
                        <ScopeIcon className="w-2.5 h-2.5" />
                        <span>{scopeBadge.label}</span>
                      </span>

                      {!isPublished && (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-amber-500 text-white rounded-full shadow-xs">
                          {isTr ? 'Pasif' : 'Draft'}
                        </span>
                      )}
                    </div>

                    {/* Launch / Play Hover Icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="w-11 h-11 rounded-2xl bg-white/90 text-slate-900 shadow-xl flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-5 h-5 fill-slate-900 ms-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-3.5 flex flex-col justify-between flex-1 space-y-2">
                    <div>
                      {/* Category Pill */}
                      <div className="mb-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md border ${category.color}`}
                        >
                          <span>{category.label}</span>
                        </span>
                      </div>

                      {/* Module Title */}
                      <h3
                        onClick={() => setPreviewModule(pg)}
                        className="text-sm font-bold text-gray-900 leading-snug hover:text-indigo-600 transition-colors line-clamp-2 cursor-pointer"
                        title={pg.name}
                      >
                        {pg.name}
                      </h3>

                      {cleanDescription && (
                        <p className="text-[11px] text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                          {cleanDescription}
                        </p>
                      )}
                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-2.5 flex items-center justify-between border-t border-gray-100 mt-2 gap-2">
                      {/* Open / Launch module directly */}
                      <Link
                        href={directViewUrl}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                        title={isTr ? 'Yeni sekmede tam ekran başlat' : 'Open in full view'}
                      >
                        <span>{isTr ? 'Görüntüle / Başlat' : 'Launch'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>

                      <div className="flex items-center gap-1.5">
                        {/* Assign to class/student */}
                        <button
                          type="button"
                          onClick={() => setVisibilityModalModule(pg)}
                          className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 text-gray-700 text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                          title={isTr ? 'Sınıf veya Öğrenci Ata' : 'Assign'}
                        >
                          <School className="w-3 h-3" />
                          <span>{isTr ? 'Ata' : 'Assign'}</span>
                        </button>

                        {/* Edit module */}
                        <Link
                          href={`/editor/playground/${pg.playground_uuid}/edit`}
                          className="p-1 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title={isTr ? 'Kodu / İçeriği Düzenle' : 'Edit'}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {filtered.length === 0 && searchQuery && (
              <div className="col-span-full flex flex-col justify-center items-center py-16 px-4 border-2 border-dashed border-gray-200 rounded-3xl bg-white text-center">
                <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-700 mb-1">
                  {isTr ? `"${searchQuery}" ile eşleşen modül bulunamadı` : 'No playgrounds found'}
                </h3>
                <p className="text-xs text-gray-400 max-w-sm mb-4">
                  {isTr
                    ? 'Farklı bir arama terimi deneyin veya filtreleri temizleyin.'
                    : 'Try a different search term or clear filters.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setActiveCategory('all')
                    setVisibilityFilter('all')
                  }}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
                >
                  {isTr ? 'Filtreleri Temizle' : 'Clear Filters'}
                </button>
              </div>
            )}

            {allPlaygrounds.length === 0 && !searchQuery && (
              <div className="col-span-full flex flex-col justify-center items-center py-16 px-4 border-2 border-dashed border-gray-200 rounded-3xl bg-white text-center">
                <div className="rounded-full bg-gray-100 p-4 w-fit mx-auto mb-3">
                  <Cube size={32} className="text-gray-400" />
                </div>
                <h2 className="text-lg font-bold text-gray-700 mb-1">
                  {isTr ? 'Henüz modül bulunmuyor' : t('playgrounds.no_playgrounds_yet')}
                </h2>
                <p className="text-xs text-gray-400 max-w-sm mb-4">
                  {isTr
                    ? 'Öğrencileriniz için yeni bir etkileşimli modül oluşturabilir veya var olanları inceleyebilirsiniz.'
                    : t('playgrounds.playgrounds_description')}
                </p>
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isTr ? 'Yeni Modül Oluştur' : 'New Playground'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        <CatalogPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageNumbers={pageNumbers}
          onPageChange={goToPage}
          previousLabel={isTr ? 'Önceki' : 'Previous'}
          nextLabel={isTr ? 'Sonraki' : 'Next'}
          className="mt-8 mb-4"
        />

        {totalPages > 1 && (
          <div className="mb-6 text-center text-xs text-gray-400">
            {isTr ? `Sayfa ${currentPage} / ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
          </div>
        )}
      </div>

      {/* Visibility & Class / Student Assignment Modal */}
      {visibilityModalModule && (
        <ModuleVisibilityModal
          isOpen={!!visibilityModalModule}
          onClose={() => setVisibilityModalModule(null)}
          module={visibilityModalModule}
          orgId={effectiveOrgId}
          onSaved={() => {
            loadAssignments()
            queryClient.invalidateQueries({ queryKey: queryKeys.playgrounds.list(orgslug) })
          }}
        />
      )}

      {/* Full-Responsive Interactive Module Window for Teacher & Smartboard */}
      {previewModule && (
        <div
          className="fixed inset-0 z-[100] flex flex-col w-full h-full bg-slate-900 text-white animate-in fade-in-50 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Topbar */}
          <div className="p-3 px-5 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/30">
                <Play className="w-4 h-4 fill-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white leading-tight">
                  {previewModule.name}
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">
                  {isTr ? 'Öğretmen & Sınıf Canlı Modülü' : 'Teacher & Class Live Module'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={getUriWithOrg(orgslug, `/playground/${previewModule.playground_uuid}`)}
                target="_blank"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{isTr ? 'Ayrı Sekmede Aç' : 'Open in New Tab'}</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  const pg = previewModule
                  setPreviewModule(null)
                  setVisibilityModalModule(pg)
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <School className="w-3.5 h-3.5" />
                <span>{isTr ? 'Sınıfa Ata' : 'Assign'}</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewModule(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
                title="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Iframe View: 100% full screen responsive */}
          <div className="flex-1 w-full h-full bg-slate-50 overflow-hidden relative">
            {previewModule.html_content ? (
              <iframe
                srcDoc={previewModule.html_content}
                title={previewModule.name}
                className="w-full h-full border-0 block"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              />
            ) : (
              <iframe
                src={getUriWithOrg(orgslug, `/playground/${previewModule.playground_uuid}`)}
                title={previewModule.name}
                className="w-full h-full border-0 block"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              />
            )}
          </div>
        </div>
      )}

      {/* Create modal */}
      {showNameModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={() => setShowNameModal(false)}
        >
          <div
            className="bg-white rounded-3xl nice-shadow p-6 w-full max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-bold text-gray-900 mb-1">
              {isTr ? 'Yeni Modül Oluştur' : 'New Playground'}
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              {isTr
                ? 'Modülünüze bir başlık vererek başlayın.'
                : 'Give your playground a name to get started.'}
            </p>
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate()
                if (e.key === 'Escape') setShowNameModal(false)
              }}
              placeholder={isTr ? 'Örn: Çarpım Tablosu Oyunu' : 'e.g. Photosynthesis Quiz'}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 mb-4 font-medium"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowNameModal(false)}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors"
              >
                {isTr ? 'Vazgeç' : 'Cancel'}
              </button>
              <button
                onClick={handleCreate}
                disabled={isCreating}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isCreating ? (isTr ? 'Oluşturuluyor…' : 'Creating…') : isTr ? 'Oluştur' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-3xl nice-shadow p-6 w-full max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-bold text-gray-900 mb-1">
              {isTr
                ? `${selectedUuids.size} Modülü Sil`
                : `Delete ${selectedUuids.size} playground${selectedUuids.size > 1 ? 's' : ''}`}
            </h2>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              {isTr
                ? 'Bu işlem geri alınamaz. Seçili modüller sistemden tamamen silinecektir.'
                : 'This action is permanent and cannot be undone.'}
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors"
              >
                {isTr ? 'Vazgeç' : 'Cancel'}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors cursor-pointer"
              >
                {isTr ? 'Evet, Sil' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </FeatureGate>
  )
}
