'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  Search,
  X,
  Users,
  Globe,
  Lock,
  MoreVertical,
  Settings2,
  Eye,
  Trash2,
  CheckSquare,
  Square,
  Copy,
  ArrowRight,
  BookOpen,
  Calendar,
  Sparkles,
  Clock,
  Filter,
  Plus,
  RefreshCw,
} from 'lucide-react'
import { ChalkboardSimple } from '@phosphor-icons/react'
import { useOrg } from '@components/Contexts/OrgContext'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { getUriWithOrg } from '@services/config/config'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/keys'
import { createBoard, deleteBoard, duplicateBoard, getBoards, getStoredCustomBoards } from '@services/boards/boards'
import { getBoardThumbnailMediaDirectory } from '@services/media/media'
import { getActiveClassroom, generateClassroomBoards, ALL_CLASSROOM_BOARDS } from '@services/demo/schoolDirectory'
import useAdminStatus from '@components/Hooks/useAdminStatus'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Breadcrumbs } from '@components/Objects/Breadcrumbs/Breadcrumbs'
import AuthenticatedClientElement from '@components/Security/AuthenticatedClientElement'
import FeatureGate from '@components/Dashboard/Shared/FeatureGate/FeatureGate'
import ConfirmationModal from '@components/Objects/StyledElements/ConfirmationModal/ConfirmationModal'
import BoardSettingsModal from '@components/Dashboard/Boards/BoardSettingsModal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu"
import Modal from '@components/Objects/StyledElements/Modal/Modal'
import { searchMatchesAny } from '@/lib/search/normalize'
import { useLHAnalytics, AnalyticsEvent } from '@services/analytics'
import CatalogPagination, { useCatalogPagination } from '@components/Objects/Catalog/CatalogPagination'

interface BoardListClientProps {
  org_id: number
  orgslug: string
}

function CreateBoardForm({ onCreated, orgId, accessToken, usergroupId }: {
  onCreated: () => void
  orgId: number
  accessToken: string
  usergroupId?: number
}) {
  const { t } = useTranslation()
  const { track } = useLHAnalytics('dashboard')
  const [boardDate, setBoardDate] = useState(() => new Date().toISOString().split('T')[0])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const [requiresPin, setRequiresPin] = useState(false)
  const [pin, setPin] = useState('')
  const [shareType, setShareType] = useState<'public' | 'code' | 'view'>('public')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    try {
      const finalShareType = requiresPin ? 'code' : shareType
      const shareCode = requiresPin && pin.trim() ? pin.trim() : null
      await createBoard(orgId, { 
        name, 
        description,
        usergroup_id: usergroupId,
        creation_date: new Date(boardDate).toISOString(),
        board_date: boardDate,
        blank: true,
        share_type: finalShareType,
        share_code: shareCode,
        features: {
          requires_pin: requiresPin,
          pin: shareCode,
          read_only: shareType === 'view',
          board_date: boardDate,
          blank: true,
        }
      }, accessToken)
      track(AnalyticsEvent.BoardCreated, { has_description: !!description.trim() })
      toast.success(t('boards.board_created', { defaultValue: 'Pano başarıyla oluşturuldu' }))
      setName('')
      setDescription('')
      setRequiresPin(false)
      setPin('')
      setShareType('public')
      onCreated()
    } catch {
      toast.error(t('boards.board_created_error', { defaultValue: 'Pano oluşturulurken hata meydana geldi' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      <div>
        <label className="text-sm font-medium text-gray-700">Tarih</label>
        <input
          type="date"
          value={boardDate}
          onChange={(e) => setBoardDate(e.target.value)}
          className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">{t('boards.name', { defaultValue: 'Pano Adı' })}</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1"
          placeholder={t('boards.name_placeholder', { defaultValue: 'Örn: 1-A Türkçe Dersi Canlı Tahta' })}
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">{t('boards.description', { defaultValue: 'Açıklama' })}</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1"
          placeholder={t('boards.description_placeholder', { defaultValue: 'Pano içeriği ve kazanımları hakkında kısa bilgi...' })}
          rows={3}
        />
      </div>

      <div className="space-y-3 pt-2">
        <label className="text-sm font-medium text-gray-700">Paylaşma & Erişim Ayarları</label>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setShareType('public')
              setRequiresPin(false)
            }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              shareType === 'public' && !requiresPin
                ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-semibold'
                : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Globe size={16} className="text-indigo-600" />
              <span className="text-xs font-bold">Herkese Açık</span>
            </div>
            <p className="text-[11px] text-neutral-500 font-normal">Tüm kullanıcılar doğrudan katılabilir ve düzenleyebilir.</p>
          </button>

          <button
            type="button"
            onClick={() => {
              setShareType('view')
              setRequiresPin(false)
            }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              shareType === 'view' && !requiresPin
                ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-semibold'
                : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Eye size={16} className="text-indigo-600" />
              <span className="text-xs font-bold">Salt Okunur</span>
            </div>
            <p className="text-[11px] text-neutral-500 font-normal">Kullanıcılar panoyu sadece görüntüleyebilir, düzenleme yapamaz.</p>
          </button>
        </div>

        <div className="pt-1">
          <label className="flex items-start gap-2.5 p-3 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50 transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={requiresPin}
              onChange={(e) => {
                setRequiresPin(e.target.checked)
                if (e.target.checked) {
                  setShareType('code')
                  if (!pin) setPin(Math.floor(1000 + Math.random() * 9000).toString())
                } else {
                  setShareType('public')
                }
              }}
              className="mt-0.5 w-4 h-4 rounded text-black focus:ring-black border-neutral-300"
            />
            <div className="flex-1 text-xs">
              <div className="font-semibold text-neutral-800 flex items-center gap-1.5">
                <Lock size={13} className="text-amber-600" />
                <span>Şifre / PIN Koruması</span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5">Katılımcılar panoya erişebilmek için bu şifreyi girmelidir.</p>
            </div>
          </label>

          {requiresPin && (
            <div className="mt-2.5 p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-900">
                  Katılım Şifresi (PIN) *
                </label>
                <button
                  type="button"
                  onClick={() => setPin(Math.floor(1000 + Math.random() * 9000).toString())}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={12} />
                  <span>Yeni PIN Üret</span>
                </button>
              </div>
              <input
                type="text"
                maxLength={12}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Örn: 1234"
                className="w-full px-3 py-2 text-sm font-mono font-bold tracking-widest bg-white rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required={requiresPin}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={!name.trim()}
          className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-gray-800 transition-colors cursor-pointer"
        >
          {t('boards.create_board', { defaultValue: 'Pano Oluştur' })}
        </button>
      </div>
    </form>
  )
}

export default function BoardListClient({ org_id, orgslug }: BoardListClientProps) {
  const { t } = useTranslation()
  const org = useOrg() as any
  const session = useLHSession() as any
  const access_token = session?.data?.tokens?.access_token
  const queryClient = useQueryClient()
  const { isStudent, canManageOrg, isTeacher, isAdmin } = useAdminStatus()

  const isBoardsEnabled = org?.config?.config?.resolved_features?.boards?.enabled ?? org?.config?.config?.features?.boards?.enabled !== false

  const searchParams = useSearchParams()
  const [createModalOpen, setCreateModalOpen] = useState(false)

  useEffect(() => {
    if (searchParams?.get('new') === 'true') {
      setCreateModalOpen(true)
    }
  }, [searchParams])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState<string>('all')
  const [selectedBoards, setSelectedBoards] = useState<Set<string>>(new Set())
  const [settingsBoard, setSettingsBoard] = useState<any | null>(null)
  const [activeClassCode, setActiveClassCode] = useState<string>('1-A')

  // Resolve active classroom for student
  useEffect(() => {
    if (typeof window === 'undefined') return
    const cookieMatch = document.cookie.match(/oxonom_demo_student_active_class=([^;]+)/)
    const saved = cookieMatch ? decodeURIComponent(cookieMatch[1]) : localStorage.getItem('oxonom_demo_student_active_class')
    if (saved) setActiveClassCode(saved)
  }, [])

  // Listen to board updates across components
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.boards.list(orgslug) })
    }
    window.addEventListener('oxonom_boards_updated', handleUpdate)
    return () => window.removeEventListener('oxonom_boards_updated', handleUpdate)
  }, [queryClient, orgslug])

  const activeClass = useMemo(() => {
    return getActiveClassroom(activeClassCode)
  }, [activeClassCode])

  const { data: boardsData, isLoading } = useQuery({
    queryKey: queryKeys.boards.list(orgslug),
    queryFn: () => getBoards(org_id, access_token),
    enabled: isBoardsEnabled && !!org_id,
    staleTime: 60_000,
  })

  const usergroupIdParam = searchParams?.get('usergroupId')

  // Students ONLY see their classroom's boards; when usergroupId is provided, filter strictly by class
  const allBoards = useMemo(() => {
    if (usergroupIdParam) {
      const gid = Number(usergroupIdParam)
      const localCustom = getStoredCustomBoards()
      const classCustom = localCustom.filter((b) => Number(b.usergroup_id) === gid)
      const classBoards = ALL_CLASSROOM_BOARDS.filter((b) => Number(b.usergroup_id) === gid)
      const uuids = new Set(classCustom.map((b) => b.board_uuid))
      return [...classCustom, ...classBoards.filter((b) => !uuids.has(b.board_uuid))]
    }
    if (isStudent) {
      const localCustom = getStoredCustomBoards()
      const classCustom = localCustom.filter(
        (b) => Number(b.usergroup_id) === Number(activeClass?.id)
      )
      const classBoards = generateClassroomBoards(activeClass)
      const uuids = new Set(classBoards.map((b) => b.board_uuid))
      const uniqueLocal = classCustom.filter((b) => !uuids.has(b.board_uuid))
      return [...uniqueLocal, ...classBoards]
    }
    return boardsData || []
  }, [usergroupIdParam, isStudent, activeClass, boardsData])

  // Subject options
  const subjectOptions = useMemo(() => {
    const subjects = new Set<string>()
    allBoards.forEach((b: any) => {
      if (b.subject) {
        subjects.add(b.subject)
      } else if (b.name.includes('Türkçe')) {
        subjects.add('Türkçe')
      } else if (b.name.includes('Matematik')) {
        subjects.add('Matematik')
      } else if (b.name.includes('Hayat Bilgisi')) {
        subjects.add('Hayat Bilgisi')
      } else if (b.name.includes('Fen')) {
        subjects.add('Fen Bilimleri')
      } else if (b.name.includes('Pano')) {
        subjects.add('Sınıf Panosu')
      }
    })
    return ['all', ...Array.from(subjects)]
  }, [allBoards])

  // Categorized & Filtered Boards
  const filteredBoards = useMemo(() => {
    return allBoards.filter((board: any) => {
      // 1. Text search filter
      if (searchQuery.trim()) {
        const matches = searchMatchesAny([board.name, board.description, board.teacher_name, board.subject], searchQuery)
        if (!matches) return false
      }

      // 2. Subject filter
      if (selectedSubject !== 'all') {
        const boardSubject = board.subject || (
          board.name.includes('Türkçe') ? 'Türkçe' :
          board.name.includes('Matematik') ? 'Matematik' :
          board.name.includes('Hayat Bilgisi') ? 'Hayat Bilgisi' :
          board.name.includes('Fen') ? 'Fen Bilimleri' :
          board.name.includes('Pano') ? 'Sınıf Panosu' : ''
        )
        if (boardSubject !== selectedSubject) return false
      }

      // 3. Date / Timeframe filter
      if (selectedDate !== 'all') {
        const dateTag = board.date_tag || 'archive'
        if (dateTag !== selectedDate) return false
      }

      return true
    })
  }, [allBoards, searchQuery, selectedSubject, selectedDate])

  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedBoards,
    pageNumbers,
    goToPage: goToCatalogPage,
    resetPage,
  } = useCatalogPagination(filteredBoards)

  React.useEffect(() => {
    resetPage()
  }, [searchQuery, selectedSubject, selectedDate, resetPage])

  const handleCreated = () => {
    setCreateModalOpen(false)
    queryClient.invalidateQueries({ queryKey: queryKeys.boards.list(orgslug) })
  }

  const toggleBoardSelection = (boardUuid: string) => {
    if (isStudent) return
    const newSelection = new Set(selectedBoards)
    if (newSelection.has(boardUuid)) {
      newSelection.delete(boardUuid)
    } else {
      newSelection.add(boardUuid)
    }
    setSelectedBoards(newSelection)
  }

  const selectAllBoards = () => {
    if (isStudent) return
    const allBoardUuids = paginatedBoards.map((board: any) => board.board_uuid)
    setSelectedBoards(new Set(allBoardUuids))
  }

  const clearSelection = () => {
    setSelectedBoards(new Set())
  }

  const bulkDeleteBoards = async () => {
    if (isStudent) return
    const toastId = toast.loading(t('boards.deleting_boards', { count: selectedBoards.size }))
    let successCount = 0
    let errorCount = 0

    for (const boardUuid of selectedBoards) {
      try {
        await deleteBoard(boardUuid, access_token)
        successCount++
      } catch {
        errorCount++
      }
    }

    toast.dismiss(toastId)
    if (errorCount === 0) {
      toast.success(t('boards.boards_deleted_success', { count: successCount }))
    } else {
      toast.error(t('boards.boards_deleted_partial', { success: successCount, error: errorCount }))
    }

    clearSelection()
    queryClient.invalidateQueries({ queryKey: queryKeys.boards.list(orgslug) })
  }

  const handleDeleteBoard = async (boardUuid: string) => {
    if (isStudent) return
    const toastId = toast.loading(t('boards.deleting_board', { defaultValue: 'Pano siliniyor...' }))
    try {
      await deleteBoard(boardUuid, access_token)
      queryClient.invalidateQueries({ queryKey: queryKeys.boards.list(orgslug) })
      toast.success(t('boards.board_deleted_success', { defaultValue: 'Pano silindi' }))
    } catch {
      toast.error(t('boards.board_deleted_error', { defaultValue: 'Pano silinirken hata oluştu' }))
    } finally {
      toast.dismiss(toastId)
    }
  }

  const handleDuplicateBoard = async (boardUuid: string) => {
    if (isStudent) return
    const toastId = toast.loading(t('boards.duplicating_board', { defaultValue: 'Pano kopyalanıyor...' }))
    try {
      await duplicateBoard(boardUuid, access_token)
      queryClient.invalidateQueries({ queryKey: queryKeys.boards.list(orgslug) })
      toast.success(t('boards.board_duplicated_success', { defaultValue: 'Pano kopyalandı' }))
    } catch {
      toast.error(t('boards.board_duplicated_error', { defaultValue: 'Pano kopyalanırken hata oluştu' }))
    } finally {
      toast.dismiss(toastId)
    }
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      goToCatalogPage(page)
      setSelectedBoards(new Set())
    }
  }

  return (
    <FeatureGate feature="boards" orgslug={orgslug} context="dashboard">
      <div className="h-full w-full bg-[#f8f8f8] ps-4 pe-4 sm:ps-10 sm:pe-10 pb-16 dash-stagger-items">
        <div className="mb-6 pt-6">
          <Breadcrumbs items={[
            { label: t('boards.boards', { defaultValue: 'Panolar' }), href: '/dash/boards', icon: <ChalkboardSimple size={14} /> }
          ]} />

          {/* Student Welcome & Classroom Context Header */}
          {isStudent ? (
            <div className="mt-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 border border-indigo-900/30">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0 shadow-inner">
                  <ChalkboardSimple size={30} weight="fill" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black tracking-wide bg-emerald-400 text-slate-950 shadow-sm">
                      {activeClass.code} Sınıfı
                    </span>
                    <span className="text-xs text-indigo-200/90 font-medium flex items-center gap-1">
                      <span>Öğretmen:</span>
                      <strong className="text-white">{activeClass.teacher_name}</strong>
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1.5">
                    Sınıf Ders Tahtaları ve Panoları
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Yalnızca {activeClass.name} şubenize ait canlı akıllı tahta içeriklerine, ders notlarına ve haftalık duyuru panolarına tek tıkla bağlanın.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-bold border border-white/10 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{allBoards.length} Aktif Tahta</span>
                </span>

                {!isStudent && (
                  <Modal
                    isDialogOpen={createModalOpen}
                    onOpenChange={setCreateModalOpen}
                    dialogTitle="Yeni Akıllı Tahta Oluştur"
                    dialogDescription="Sınıfınız ve dersiniz için yeni bir interaktif tahta başlatın."
                    dialogContent={
                      <CreateBoardForm
                        onCreated={handleCreated}
                        orgId={org_id}
                        accessToken={access_token}
                        usergroupId={usergroupIdParam ? Number(usergroupIdParam) : undefined}
                      />
                    }
                    dialogTrigger={
                      <button className="rounded-xl bg-indigo-500 hover:bg-indigo-400 transition-all duration-150 p-2 px-3.5 my-auto text-xs font-bold text-white shadow-md flex space-x-1.5 items-center cursor-pointer">
                        <Plus size={14} className="stroke-[3]" />
                        <span>Yeni Tahta Oluştur</span>
                      </button>
                    }
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4">
              <div className="flex items-center space-x-4">
                <h1 className="text-3xl font-bold mb-4 sm:mb-0">Akıllı Tahtalar & Panolar</h1>
              </div>
              {!isStudent && (
                <Modal
                  isDialogOpen={createModalOpen}
                  onOpenChange={setCreateModalOpen}
                  dialogTitle="Yeni Akıllı Tahta Oluştur"
                  dialogDescription="Dersiniz veya sınıfınız için yeni bir etkileşimli akıllı tahta panosu başlatın."
                  dialogContent={
                    <CreateBoardForm
                      onCreated={handleCreated}
                      orgId={org_id}
                      accessToken={access_token}
                      usergroupId={usergroupIdParam ? Number(usergroupIdParam) : undefined}
                    />
                  }
                  dialogTrigger={
                    <button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-all duration-150 p-2.5 px-5 my-auto text-xs font-bold text-white shadow-md flex space-x-2 items-center cursor-pointer">
                      <Plus size={15} className="stroke-[3]" />
                      <span>+ Yeni Tahta Oluştur</span>
                    </button>
                  }
                />
              )}
            </div>
          )}
        </div>

        {/* Categorization & Filter Pills */}
        <div className="mb-6 space-y-3.5 bg-white p-4 sm:p-5 rounded-2xl nice-shadow border border-gray-100">
          <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute start-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pano veya ders adı ara..."
                className="w-full ps-10 pe-10 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute end-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Active filters reset */}
            {(selectedSubject !== 'all' || selectedDate !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedSubject('all')
                  setSelectedDate('all')
                  setSearchQuery('')
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 self-start md:self-auto cursor-pointer"
              >
                <X size={13} />
                <span>Filtreleri Temizle</span>
              </button>
            )}
          </div>

          {/* Subject Pills (Ders Filtresi) */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 border-t border-gray-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 shrink-0 flex items-center gap-1">
              <BookOpen size={12} />
              <span>Ders:</span>
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {subjectOptions.map((subj) => {
                const isSelected = selectedSubject === subj
                const label = subj === 'all' ? 'Tüm Dersler' : subj
                return (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => setSelectedSubject(subj)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                        : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/70 hover:text-gray-900'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Date / History Pills (Tarihsel Filtre) */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 border-t border-gray-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 shrink-0 flex items-center gap-1">
              <Calendar size={12} />
              <span>Tarih:</span>
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'Tüm Tarihler' },
                { id: 'today', label: '⚡ Bugün' },
                { id: 'this_week', label: '📅 Bu Hafta' },
                { id: 'archive', label: '📦 Arşiv' },
              ].map((dt) => {
                const isSelected = selectedDate === dt.id
                return (
                  <button
                    key={dt.id}
                    type="button"
                    onClick={() => setSelectedDate(dt.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/70 hover:text-gray-900'
                    }`}
                  >
                    {dt.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bulk Actions (Teachers / Admins only) */}
        {!isStudent && selectedBoards.size > 0 && (
          <AuthenticatedClientElement
            checkMethod="roles"
            action="delete"
            ressourceType="boards"
            orgId={org_id}
          >
            <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-white nice-shadow">
              <span className="text-xs font-bold text-gray-600 px-2">
                {t('boards.selected_count', { count: selectedBoards.size, defaultValue: `${selectedBoards.size} pano seçildi` })}
              </span>
              <button
                onClick={selectAllBoards}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <span>{t('boards.select_all', { defaultValue: 'Tümünü Seç' })}</span>
              </button>
              <button
                onClick={clearSelection}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>{t('boards.clear_selection', { defaultValue: 'Seçimi Kaldır' })}</span>
              </button>
              <ConfirmationModal
                confirmationButtonText={t('boards.delete_selected', { defaultValue: 'Seçilenleri Sil' })}
                confirmationMessage={t('boards.delete_selected_confirm', { count: selectedBoards.size, defaultValue: 'Seçilen panolar silinecektir. Onaylıyor musunuz?' })}
                dialogTitle={t('boards.delete_boards_title', { defaultValue: 'Panoları Sil' })}
                dialogTrigger={
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ms-auto cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('boards.delete_selected', { defaultValue: 'Seçilenleri Sil' })}</span>
                  </button>
                }
                functionToExecute={bulkDeleteBoards}
                status="warning"
              />
            </div>
          </AuthenticatedClientElement>
        )}

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-white nice-shadow overflow-hidden border border-gray-100">
                <div className="aspect-video bg-gray-100" />
                <div className="p-4 space-y-2.5">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-8 bg-gray-100 rounded-xl mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {paginatedBoards.map((board: any) => (
              <BoardCard
                key={board.board_uuid}
                board={board}
                orgslug={orgslug}
                orgUuid={org?.org_uuid}
                orgId={org_id}
                isStudent={isStudent}
                isSelected={selectedBoards.has(board.board_uuid)}
                onToggleSelect={toggleBoardSelection}
                onDuplicate={handleDuplicateBoard}
                onDelete={handleDeleteBoard}
                onOpenSettings={(b) => setSettingsBoard(b)}
              />
            ))}

            {/* No search results */}
            {filteredBoards.length === 0 && (
              <div className="col-span-full flex flex-col justify-center items-center py-16 bg-white rounded-3xl nice-shadow border border-gray-100 text-center px-4">
                <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-4">
                  <ChalkboardSimple size={32} weight="duotone" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Aradığınız kriterlere uygun pano bulunamadı
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-md">
                  Farklı bir arama terimi deneyebilir veya filtreleri temizleyerek tüm sınıf panolarını görüntüleyebilirsiniz.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSubject('all')
                    setSelectedDate('all')
                    setSearchQuery('')
                  }}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Tüm Panoları Göster
                </button>
              </div>
            )}
          </div>
        )}

        <CatalogPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageNumbers={pageNumbers}
          onPageChange={goToPage}
          previousLabel={t('boards.pagination.previous', { defaultValue: 'Önceki' })}
          nextLabel={t('boards.pagination.next', { defaultValue: 'Sonraki' })}
          className="mt-8 mb-6"
        />

        {totalPages > 1 && (
          <div className="mb-6 text-center text-xs text-gray-500 font-medium">
            {t('boards.pagination.page_of', { current: currentPage, total: totalPages, defaultValue: `Sayfa ${currentPage} / ${totalPages}` })}
          </div>
        )}

        {settingsBoard && (
          <BoardSettingsModal
            board={settingsBoard}
            isOpen={!!settingsBoard}
            onClose={() => setSettingsBoard(null)}
            accessToken={access_token}
            orgslug={orgslug}
            onDeleteBoard={handleDeleteBoard}
            onBoardUpdated={(_updatedBoard) => {
              queryClient.invalidateQueries({ queryKey: queryKeys.boards.list(orgslug) })
            }}
          />
        )}
      </div>
    </FeatureGate>
  )
}

function BoardCard({
  board,
  orgslug,
  orgUuid,
  orgId,
  isStudent,
  isSelected,
  onToggleSelect,
  onDuplicate,
  onDelete,
  onOpenSettings,
}: {
  board: any
  orgslug: string
  orgUuid: string
  orgId: number
  isStudent?: boolean
  isSelected: boolean
  onToggleSelect: (_boardUuid: string) => void
  onDuplicate: (_boardUuid: string) => Promise<void>
  onDelete: (_boardUuid: string) => Promise<void>
  onOpenSettings: (board: any) => void
}) {
  const { t } = useTranslation()
  const thumbnailImage = board.thumbnail_image
    ? getBoardThumbnailMediaDirectory(orgUuid, board.board_uuid, board.thumbnail_image)
    : ''

  // For students & teachers: Clicking opens the board directly.
  const boardOpenLink = `/board/${board.board_uuid.replace('board_', '')}`

  const handleSelectClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onToggleSelect(board.board_uuid)
  }

  // Resolve subject badge styling
  const subject = board.subject || (
    board.name.includes('Türkçe') ? 'Türkçe' :
    board.name.includes('Matematik') ? 'Matematik' :
    board.name.includes('Hayat Bilgisi') ? 'Hayat Bilgisi' :
    board.name.includes('Fen') ? 'Fen Bilimleri' :
    board.name.includes('Pano') ? 'Sınıf Panosu' : 'Ders'
  )

  const subjectBadgeColor =
    subject === 'Türkçe' ? 'bg-red-50 text-red-700 border-red-200' :
    subject === 'Matematik' ? 'bg-blue-50 text-blue-700 border-blue-200' :
    subject === 'Hayat Bilgisi' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
    subject === 'Fen Bilimleri' ? 'bg-purple-50 text-purple-700 border-purple-200' :
    'bg-amber-50 text-amber-700 border-amber-200'

  return (
    <div className={`group relative flex flex-col bg-white rounded-3xl nice-shadow overflow-hidden w-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100 ${isSelected ? 'ring-2 ring-indigo-600 ring-offset-2' : ''}`}>
      {/* Selection checkbox (Teachers/Admins only) */}
      {!isStudent && (
        <button
          onClick={handleSelectClick}
          aria-label={isSelected ? 'Deselect board' : 'Select board'}
          className={`absolute top-3 start-3 z-20 p-1.5 bg-white/90 backdrop-blur-sm rounded-xl hover:bg-white transition-all shadow-md ${
            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          {isSelected ? (
            <CheckSquare className="w-4 h-4 text-indigo-600" />
          ) : (
            <Square className="w-4 h-4 text-gray-500" />
          )}
        </button>
      )}

      {/* Options menu (Teachers/Admins only - NEVER for students) */}
      {!isStudent && (
        <BoardCardOptions
          board={board}
          orgslug={orgslug}
          orgId={orgId}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onOpenSettings={onOpenSettings}
        />
      )}

      {/* Visual Cover Banner */}
      <Link
        href={boardOpenLink}
        className="block relative aspect-video overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-4 flex flex-col justify-between cursor-pointer"
      >
        {thumbnailImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${thumbnailImage})` }}
          />
        ) : (
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
        )}
        <div className="absolute inset-0 bg-black/15 group-hover:bg-black/5 transition-colors duration-300" />

        {/* Top Badges */}
        <div className="relative z-10 flex items-center justify-between">
          <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-xl border backdrop-blur-md shadow-xs ${subjectBadgeColor}`}>
            {subject}
          </span>
          {board.public ? (
            <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-emerald-500/90 text-white rounded-lg backdrop-blur-sm shadow-xs">
              <Globe size={10} />
              <span>Açık</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-amber-500/90 text-white rounded-lg backdrop-blur-sm shadow-xs">
              <Lock size={10} />
              <span>PIN</span>
            </span>
          )}
        </div>

        {/* Bottom Chalkboard Visual Indicator */}
        <div className="relative z-10 flex items-center justify-between text-white/80 text-[11px] font-medium">
          <div className="flex items-center gap-1.5">
            <ChalkboardSimple size={16} weight="fill" className="text-indigo-400" />
            <span className="truncate max-w-[160px]">{board.usergroup_name || 'Sınıf Tahtası'}</span>
          </div>
          {board.last_activity && (
            <span className="text-[10px] text-white/60 flex items-center gap-1">
              <Clock size={10} />
              <span>{board.last_activity}</span>
            </span>
          )}
        </div>
      </Link>

      {/* Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Tarih (Önce Tarih) */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 mb-1">
            <Calendar size={13} className="text-indigo-500 shrink-0" />
            <span>
              {board.board_date
                ? new Date(board.board_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
                : board.creation_date
                  ? new Date(board.creation_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
                  : new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

          {/* Tahta Adı (Altında Tahta Adı) */}
          <Link
            href={boardOpenLink}
            className="text-sm sm:text-base font-black text-gray-900 leading-snug hover:text-indigo-600 transition-colors line-clamp-2 block cursor-pointer"
          >
            {board.name}
          </Link>

          {board.description && (
            <p className="text-xs text-gray-500 line-clamp-2 mt-1.5 leading-relaxed">
              {board.description}
            </p>
          )}
        </div>

        {/* Card Footer */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
            <Users size={13} />
            <span>{board.member_count || 24} Öğrenci</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Link
              href={boardOpenLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>{isStudent ? 'Tahtaya Katıl' : 'Tahtayı Aç'}</span>
              <ArrowRight size={13} />
            </Link>

            {!isStudent && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onOpenSettings(board)
                }}
                className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1 px-2 py-1.5 rounded-xl hover:bg-gray-100 cursor-pointer"
                title="Pano Ayarları"
              >
                <span>Ayarlar</span>
                <Settings2 size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function BoardCardOptions({ board, orgslug, orgId, onDuplicate, onDelete, onOpenSettings }: {
  board: any
  orgslug: string
  orgId: number
  onDuplicate: (_boardUuid: string) => Promise<void>
  onDelete: (_boardUuid: string) => Promise<void>
  onOpenSettings: (board: any) => void
}) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <AuthenticatedClientElement
      action="update"
      ressourceType="boards"
      checkMethod="roles"
      orgId={orgId}
    >
      <div className={`absolute top-3 end-3 z-20 transition-opacity ${
        !isOpen ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
      }`}>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <button aria-label="Board actions" className="p-1.5 bg-white/90 backdrop-blur-sm rounded-xl hover:bg-white transition-all shadow-md cursor-pointer">
              <MoreVertical size={16} className="text-gray-700" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 rounded-2xl shadow-xl border border-gray-100 p-1">
            <DropdownMenuItem asChild>
              <Link href={`/board/${board.board_uuid.replace('board_', '')}`} className="flex items-center gap-2 cursor-pointer text-xs font-semibold py-2 px-3 rounded-xl">
                <Eye className="h-4 w-4 text-gray-500" />
                <span>Tahtayı Aç</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <button
                type="button"
                onClick={() => onOpenSettings(board)}
                className="w-full text-start flex items-center gap-2 cursor-pointer text-xs font-semibold py-2 px-3 rounded-xl hover:bg-gray-50"
              >
                <Settings2 className="h-4 w-4 text-gray-500" />
                <span>Pano Ayarları</span>
              </button>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <ConfirmationModal
                confirmationButtonText="Panoyu Kopyala"
                confirmationMessage="Bu panonun tüm içeriğiyle bir kopyası oluşturulacaktır."
                dialogTitle={`${board.name} Kopyalansın mı?`}
                dialogTrigger={
                  <button className="w-full text-start flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                    <Copy className="h-4 w-4 text-gray-500" />
                    <span>Panoyu Kopyala</span>
                  </button>
                }
                functionToExecute={() => onDuplicate(board.board_uuid)}
                status="info"
              />
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <ConfirmationModal
                confirmationButtonText="Panoyu Sil"
                confirmationMessage="Bu işlem geri alınamaz. Panodaki tüm çizimler ve kartlar kalıcı olarak silinecektir."
                dialogTitle={`${board.name} Silinsin mi?`}
                dialogTrigger={
                  <button className="w-full text-start flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer">
                    <Trash2 className="h-4 w-4" />
                    <span>Panoyu Sil</span>
                  </button>
                }
                functionToExecute={() => onDelete(board.board_uuid)}
                status="warning"
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </AuthenticatedClientElement>
  )
}
