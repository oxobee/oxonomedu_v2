'use client'
import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/keys'
import { useOrg } from '@components/Contexts/OrgContext'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { getAPIUrl, getUriWithOrg } from '@services/config/config'
import { apiFetch, asArray } from '@services/utils/ts/requests'
import { deleteUserGroup } from '@services/usergroups/usergroups'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import {
  GraduationCap,
  Plus,
  KeyRound,
  Users,
  Search,
  Copy,
  Check,
  Trash2,
  Sparkles,
  BookOpen,
} from 'lucide-react'
import JoinClassModal from '@components/Dashboard/Classrooms/JoinClassModal'
import CreateClassModal from '@components/Dashboard/Classrooms/CreateClassModal'
import ManageUsers from '@components/Objects/Modals/Dash/OrgUserGroups/ManageUsers'
import Modal from '@components/Objects/StyledElements/Modal/Modal'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import { searchMatchesAny } from '@/lib/search/normalize'
import useAdminStatus from '@components/Hooks/useAdminStatus'

export default function ClassroomsClient({ orgslug }: { orgslug: string }) {
  const { canManageOrg, isStudent, loading: adminLoading } = useAdminStatus()
  const router = useRouter()
  const org = useOrg() as any
  const session = useLHSession() as any
  const token = session?.data?.tokens?.access_token
  const queryClient = useQueryClient()

  React.useEffect(() => {
    if (!adminLoading && isStudent) {
      toast.error('Öğrenci hesapları sınıflar paneline erişemez.')
      router.replace(getUriWithOrg(orgslug, '/dash/boards'))
    }
  }, [adminLoading, isStudent, router, orgslug])

  if (isStudent) return null

  // Modals state
  const [isJoinOpen, setIsJoinOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [managingClassId, setManagingClassId] = useState<number | null>(null)
  const [deletingClassId, setDeletingClassId] = useState<number | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [selectedGrade, setSelectedGrade] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<number | null>(null)

  // Fetch all classes for the org
  const { data: rawClasses, isLoading } = useQuery({
    queryKey: queryKeys.usergroups.list(org?.id),
    queryFn: () => apiFetch(`${getAPIUrl()}usergroups/org/${org.id}?org_id=${org.id}`, token),
    select: (res: any) => asArray<any>(res),
    enabled: !!org?.id && !!token,
    staleTime: 30_000,
  })

  const classrooms = rawClasses || []

  // Extract unique grade levels
  const gradeLevels = useMemo(() => {
    const set = new Set<string>()
    classrooms.forEach((c: any) => {
      if (c.grade_level) set.add(c.grade_level)
    })
    return Array.from(set)
  }, [classrooms])

  // Filtered classes
  const filteredClasses = useMemo(() => {
    return classrooms.filter((cls: any) => {
      const matchesSearch = !search.trim() || searchMatchesAny([cls.name, cls.description, cls.join_code], search)
      const matchesGrade = selectedGrade === 'all' || cls.grade_level === selectedGrade
      return matchesSearch && matchesGrade
    })
  }, [classrooms, search, selectedGrade])

  const copyCode = (cls: any) => {
    if (!cls.join_code) return
    navigator.clipboard.writeText(cls.join_code)
    setCopiedId(cls.id)
    toast.success(`'${cls.join_code}' kodu kopyalandı!`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDelete = async () => {
    if (!deletingClassId) return
    const toastId = toast.loading('Sınıf siliniyor...')
    try {
      const res = await deleteUserGroup(deletingClassId, org.id, token)
      if (res.status === 200) {
        toast.success('Sınıf başarıyla silindi.', { id: toastId })
        queryClient.invalidateQueries({ queryKey: queryKeys.usergroups.list(org.id) })
        setDeletingClassId(null)
      } else {
        toast.error('Sınıf silinemedi.', { id: toastId })
      }
    } catch {
      toast.error('Bağlantı hatası.', { id: toastId })
    }
  }

  return (
    <div className="h-full w-full bg-[#f8f8f8]">
      <div className="px-4 sm:px-10 pt-8 pb-16 max-w-[1600px] mx-auto w-full space-y-6 dash-stagger-items">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <GraduationCap size={22} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Sınıflar ve Şubeler</h1>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Okul sınıflarını yönetin, 6 haneli katılım kodları üretin ve öğrenci mevcudunu takip edin.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {!canManageOrg && (
              <button
                onClick={() => setIsJoinOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors shadow-xs"
              >
                <KeyRound size={15} />
                <span>Sınıfa Katıl</span>
              </button>
            )}
            {canManageOrg && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
              >
                <Plus size={15} />
                <span>Yeni Sınıf Aç</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Grade pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedGrade('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedGrade === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tüm Sınıflar ({classrooms.length})
            </button>
            {gradeLevels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedGrade(lvl)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  selectedGrade === lvl
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Sınıf adı veya kod ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs ps-9 pe-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500 transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Classrooms Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs animate-pulse space-y-4">
                <div className="h-6 bg-gray-100 rounded w-1/2" />
                <div className="h-14 bg-gray-50 rounded-xl" />
                <div className="h-8 bg-gray-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-xs">
            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <GraduationCap size={28} />
            </div>
            <h3 className="text-base font-bold text-gray-800">
              {search || selectedGrade !== 'all' ? 'Aramanıza uygun sınıf bulunamadı' : 'Henüz sınıf açılmamış'}
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              {canManageOrg
                ? 'Yeni bir sınıf ve şube oluşturarak öğrenci ve öğretmen atamalarını gerçekleştirebilirsiniz.'
                : 'Yeni bir sınıf oluşturabilir veya 6 haneli kodla bir sınıfa dahil olabilirsiniz.'}
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              {!canManageOrg && (
                <button
                  onClick={() => setIsJoinOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                >
                  <KeyRound size={14} />
                  <span>Sınıfa Katıl</span>
                </button>
              )}
              {canManageOrg && (
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors"
                >
                  <Plus size={14} />
                  <span>Yeni Sınıf Aç</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredClasses.map((cls: any) => (
              <div
                key={cls.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6">
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700">
                      {cls.grade_level || 'Sınıf'}
                    </span>
                    {canManageOrg && (
                      <button
                        onClick={() => setDeletingClassId(cls.id)}
                        title="Sınıfı Sil"
                        className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  {/* Class Name */}
                  <Link href={`/dash/classrooms/${cls.id}`} className="group/title block">
                    <h3 className="text-lg font-bold text-gray-900 group-hover/title:text-indigo-600 transition-colors line-clamp-1">
                      {cls.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 min-h-[32px]">
                    {cls.description || 'Açıklama belirtilmemiş.'}
                  </p>

                  {/* Join Code Box */}
                  <div className="mt-4 p-3 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Katılım Kodu
                      </span>
                      <span className="font-mono text-base font-extrabold text-slate-900 tracking-wider">
                        {cls.join_code || 'KOD YOK'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => copyCode(cls)}
                        title="Katılım Kodunu Kopyala"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors shadow-2xs"
                      >
                        {copiedId === cls.id ? (
                          <>
                            <Check size={14} className="text-emerald-600" />
                            <span className="text-emerald-600 text-xs font-bold">Kopyalandı</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span className="text-xs">Kodu Kopyala</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer / Actions */}
                <div className="px-6 py-3.5 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                    <Users size={14} className="text-gray-400" />
                    <span>{cls.member_count !== undefined ? cls.member_count : '—'} Öğrenci</span>
                  </div>

                  <Link
                    href={`/dash/classrooms/${cls.id}`}
                    className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                  >
                    <span>Sınıfı Yönet & Tahtalar</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Join Class Modal */}
      <JoinClassModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
      />

      {/* Create Class Modal */}
      <CreateClassModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />


      {/* Manage Students Modal */}
      <Modal
        isDialogOpen={!!managingClassId}
        onOpenChange={() => setManagingClassId(null)}
        dialogTitle="Sınıf Öğrenci Listesi"
        dialogTrigger={<span className="hidden" />}
        dialogContent={<ManageUsers usergroup_id={managingClassId} />}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deletingClassId} onOpenChange={(open) => !open && setDeletingClassId(null)}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Sınıfı Sil</DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-2">
              Bu sınıfı silmek istediğinize emin misiniz? Sınıfa kayıtlı öğrenciler gruptan ayrılacaktır.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setDeletingClassId(null)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Vazgeç
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
            >
              Evet, Sil
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
