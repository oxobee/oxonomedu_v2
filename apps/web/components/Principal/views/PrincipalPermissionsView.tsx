'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  Shield,
  Users,
  UserCheck,
  Search,
  Check,
  X,
  RotateCcw,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sliders,
  Eye,
  Lock,
  Unlock,
  Layers,
  BookOpen,
  Calendar,
  Tv,
  BarChart3,
  HeartHandshake,
  FileCheck,
  Briefcase,
  ChevronRight,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'
import {
  SYSTEM_SCREEN_PERMISSIONS,
  ROLE_DEFINITIONS,
  PERMISSION_CATEGORIES,
  getRoleDefaultPermissions,
  getTenantRolePermissions,
  saveTenantRolePermissions,
  getTeacherCustomPermissions,
  saveTeacherCustomPermissions,
  ScreenPermission,
  RoleDefinition,
} from '@/lib/permissions/screenPermissions'
import {
  getCurrentSchoolCode,
  getTenantTeachers,
  saveTenantTeachers,
  isDemoSchool,
} from '@/lib/schools/schoolTenantManager'
import { getStoredPrincipalProfile } from '@/lib/principal/principalProfileStorage'

export default function PrincipalPermissionsView() {
  const [schoolCode, setSchoolCode] = useState<string>('')
  const [schoolName, setSchoolName] = useState<string>('Oxonom Okulu')
  const [sectorType, setSectorType] = useState<string>('state')
  const [teachers, setTeachers] = useState<any[]>([])

  // Mode: 'role' (default role templates) | 'teacher' (individual teacher overrides)
  const [mode, setMode] = useState<'role' | 'teacher'>('role')
  const [selectedRoleId, setSelectedRoleId] = useState<string>('admin_assist')
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('')

  // Active permissions set for current view
  const [activePermissions, setActivePermissions] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [hasChanges, setHasChanges] = useState<boolean>(false)
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null)

  // Initialize data on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    const code = getCurrentSchoolCode()
    setSchoolCode(code)

    const profile = getStoredPrincipalProfile()
    if (profile) {
      if (profile.schoolName) setSchoolName(profile.schoolName)
    }
    const savedSector =
      localStorage.getItem(`oxonom_school_sector_${code}`) ||
      profile?.sectorType ||
      'devlet'
    setSectorType(savedSector)

    const schoolTeachers = getTenantTeachers(code) || []
    setTeachers(schoolTeachers)
    if (schoolTeachers.length > 0) {
      setSelectedTeacherId(schoolTeachers[0].id || schoolTeachers[0].email)
    }

    // Load initial permissions for role
    const initialPerms = getTenantRolePermissions('admin_assist', code)
    setActivePermissions(initialPerms)
  }, [])

  // When selected role or mode changes, load corresponding permissions
  useEffect(() => {
    if (!schoolCode) return

    if (mode === 'role') {
      const perms = getTenantRolePermissions(selectedRoleId, schoolCode)
      setActivePermissions(perms)
      setHasChanges(false)
    } else if (mode === 'teacher' && selectedTeacherId) {
      const teacher = teachers.find(
        (t) => (t.id || t.email) === selectedTeacherId
      )
      const roleTemplate = teacher?.roleTemplate || 'teacher'
      const perms = getTeacherCustomPermissions(
        selectedTeacherId,
        roleTemplate,
        schoolCode
      )
      setActivePermissions(perms)
      setHasChanges(false)
    }
  }, [mode, selectedRoleId, selectedTeacherId, schoolCode, teachers])

  // Current selected role definition
  const currentRole = useMemo(() => {
    return (
      ROLE_DEFINITIONS.find((r) => r.id === selectedRoleId) ||
      ROLE_DEFINITIONS[0]
    )
  }, [selectedRoleId])

  // Current selected teacher
  const currentTeacher = useMemo(() => {
    return teachers.find((t) => (t.id || t.email) === selectedTeacherId)
  }, [teachers, selectedTeacherId])

  // Toggle single permission
  const handleTogglePermission = (permId: string) => {
    setActivePermissions((prev) => {
      const next = prev.includes(permId)
        ? prev.filter((id) => id !== permId)
        : [...prev, permId]
      setHasChanges(true)
      return next
    })
  }

  // Toggle all permissions in a specific category
  const handleToggleCategory = (catName: string) => {
    const catPerms = SYSTEM_SCREEN_PERMISSIONS.filter(
      (p) => p.category === catName
    )
    const allAllowed = catPerms.every((p) => activePermissions.includes(p.id))

    setActivePermissions((prev) => {
      let next: string[]
      if (allAllowed) {
        next = prev.filter((id) => !catPerms.some((p) => p.id === id))
      } else {
        const toAdd = catPerms.map((p) => p.id)
        next = Array.from(new Set([...prev, ...toAdd]))
      }
      setHasChanges(true)
      return next
    })
  }

  // Toggle all permissions globally
  const handleSelectAll = () => {
    setActivePermissions(SYSTEM_SCREEN_PERMISSIONS.map((p) => p.id))
    setHasChanges(true)
    toast.success('Tüm ekran ve işlem yetkileri açıldı.')
  }

  const handleDeselectAll = () => {
    setActivePermissions([])
    setHasChanges(true)
    toast('Tüm yetkiler kapatıldı.', { icon: '🔒' })
  }

  // Reset to default matrix
  const handleResetToDefault = () => {
    if (mode === 'role') {
      const defaults = getRoleDefaultPermissions(selectedRoleId)
      setActivePermissions(defaults)
      setHasChanges(true)
      toast.success(`${currentRole.title} varsayılan yetki şablonuna sıfırlandı.`)
    } else if (currentTeacher) {
      const roleTemplate = currentTeacher.roleTemplate || 'teacher'
      const defaults = getTenantRolePermissions(roleTemplate, schoolCode)
      setActivePermissions(defaults)
      setHasChanges(true)
      toast.success(`${currentTeacher.name} yetkileri rol şablonuna sıfırlandı.`)
    }
  }

  // Save changes
  const handleSave = () => {
    setIsSaving(true)

    try {
      if (mode === 'role') {
        saveTenantRolePermissions(selectedRoleId, activePermissions, schoolCode)
        toast.success(
          `${currentRole.title} yetki şablonu başarıyla güncellendi ve tüm kadroya uygulandı!`
        )
      } else if (mode === 'teacher' && currentTeacher) {
        saveTeacherCustomPermissions(
          selectedTeacherId,
          activePermissions,
          schoolCode
        )

        // Also update teacher list in localStorage
        const updatedTeachers = teachers.map((t) => {
          if ((t.id || t.email) === selectedTeacherId) {
            return {
              ...t,
              permissions: activePermissions,
            }
          }
          return t
        })
        setTeachers(updatedTeachers)
        saveTenantTeachers(updatedTeachers, schoolCode)

        try {
          localStorage.setItem(
            `oxonom_admin_teachers_${schoolCode}`,
            JSON.stringify(updatedTeachers)
          )
        } catch (_) {}

        toast.success(
          `${currentTeacher.name} özel yetki matrisi başarıyla kaydedildi!`
        )
      }

      setHasChanges(false)
      const now = new Date()
      setLastSavedTime(
        `${now.getHours().toString().padStart(2, '0')}:${now
          .getMinutes()
          .toString()
          .padStart(2, '0')}`
      )
    } catch (err) {
      toast.error('Yetkiler kaydedilirken bir hata oluştu.')
    } finally {
      setIsSaving(false)
    }
  }

  // Filter permissions by search query
  const filteredPermissions = useMemo(() => {
    if (!searchQuery.trim()) return SYSTEM_SCREEN_PERMISSIONS
    const q = searchQuery.toLowerCase().trim()
    return SYSTEM_SCREEN_PERMISSIONS.filter(
      (p) =>
        p.label.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    )
  }, [searchQuery])

  // Get categories from filtered permissions
  const categoriesToShow = useMemo(() => {
    return Array.from(new Set(filteredPermissions.map((p) => p.category)))
  }, [filteredPermissions])

  // Category Icon helper
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Temel & Program':
        return Calendar
      case 'Ölçme & Yoklama':
        return FileCheck
      case 'Rehberlik & Dosyalar':
        return HeartHandshake
      case 'Akıllı Tahta & Donanım':
        return Tv
      case 'Raporlar & Dosyalar':
        return BarChart3
      case 'İdari & Yönetim':
        return Briefcase
      default:
        return Layers
    }
  }

  // Calculate percentage
  const totalCount = SYSTEM_SCREEN_PERMISSIONS.length
  const activeCount = activePermissions.length
  const percentActive = Math.round((activeCount / totalCount) * 100)

  return (
    <div className="space-y-6 pb-20">
      <Toaster position="top-right" />

      {/* ── HEADER BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#4B075F] via-[#350344] to-[#1F0228] p-6 sm:p-8 text-white shadow-xl shadow-purple-950/20 border border-purple-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-purple-200 border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Güvenlik & Rol Erişim Kontrolü</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Personel Yetki & Ekran Tanımlama
            </h1>
            <p className="text-sm text-purple-200/90 max-w-2xl font-medium leading-relaxed">
              Müdür yardımcısı, zümre başkanı, rehberlik ve branş öğretmenlerinin
              görebileceği ekranları, işlem yetkilerini ve e-Okul veri giriş
              sınırlarını kurumunuza özel yapılandırın.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-right">
              <div className="text-[10px] uppercase font-bold text-purple-300">
                Aktif Okul Kurum Kodu
              </div>
              <div className="text-sm font-black text-white tracking-wider flex items-center gap-1.5 justify-end">
                <Building2 className="w-3.5 h-3.5 text-purple-300" />
                {schoolCode || 'DEMO'}
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-right">
              <div className="text-[10px] uppercase font-bold text-purple-300">
                Kurum Statüsü
              </div>
              <div className="text-sm font-black text-emerald-300">
                {sectorType === 'ozel' || sectorType === 'private'
                  ? 'Özel Okul'
                  : sectorType === 'kurs' || sectorType === 'course'
                  ? 'Özel Kurs'
                  : 'Devlet Okulu'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODE SWITCHER TABS ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-1.5 rounded-2xl bg-gray-100/80 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setMode('role')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mode === 'role'
                ? 'bg-[#4B075F] text-white shadow-md shadow-purple-950/20'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Rol Bazlı Yetki Şablonları</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('teacher')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mode === 'teacher'
                ? 'bg-[#4B075F] text-white shadow-md shadow-purple-950/20'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Öğretmen Bazlı Özel Yetkilendirme</span>
            <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">
              {teachers.length}
            </span>
          </button>
        </div>

        {lastSavedTime && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 px-3">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Son Kayıt: {lastSavedTime}</span>
          </div>
        )}
      </div>

      {/* ── ROLE SELECTOR / TEACHER SELECTOR BAR ── */}
      {mode === 'role' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ROLE_DEFINITIONS.map((role) => {
            const isSelected = selectedRoleId === role.id
            const rolePerms = getTenantRolePermissions(role.id, schoolCode)

            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRoleId(role.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-purple-50/80 dark:bg-purple-950/30 border-[#4B075F] dark:border-purple-500 shadow-md ring-2 ring-[#4B075F]/20'
                    : 'bg-white dark:bg-[#121826] border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-800'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#4B075F] dark:bg-purple-400" />
                )}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/50 text-[#4B075F] dark:text-purple-300">
                    {role.badge}
                  </span>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    {rolePerms.length} / {SYSTEM_SCREEN_PERMISSIONS.length}
                  </span>
                </div>
                <div className="font-black text-sm text-gray-900 dark:text-white mb-1">
                  {role.title}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  {role.description}
                </p>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200 dark:border-gray-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#4B075F] dark:text-purple-400" />
                <span>Yetkilendirilecek Öğretmeni Seçin</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Seçtiğiniz personelin rol şablonundan bağımsız ekran izinlerini
                özelleştirin.
              </p>
            </div>

            {teachers.length > 0 && (
              <div className="text-xs font-bold text-gray-500">
                Toplam Kadro:{' '}
                <span className="text-gray-900 dark:text-white">
                  {teachers.length} Öğretmen
                </span>
              </div>
            )}
          </div>

          {teachers.length === 0 ? (
            <div className="p-8 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-dashed border-purple-200 dark:border-purple-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/50 text-[#4B075F] dark:text-purple-300 mx-auto flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div className="font-bold text-sm text-gray-900 dark:text-white">
                Bu Okulda Henüz Kayıtlı Öğretmen Bulunmuyor
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Bireysel öğretmen yetkilerini tanımlamak için önce Öğretmen ve
                Personel Yönetimi modülünden kadronuzu ekleyin.
              </p>
              <Link
                href="/principal/teachers"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4B075F] hover:bg-[#390449] text-white text-xs font-bold transition-all shadow-md shadow-purple-950/20"
              >
                <span>Öğretmen Kadrosu Ekle</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {teachers.map((teacher) => {
                const isSelected =
                  (teacher.id || teacher.email) === selectedTeacherId
                const teacherPerms = getTeacherCustomPermissions(
                  teacher.id || teacher.email,
                  teacher.roleTemplate || 'teacher',
                  schoolCode
                )

                return (
                  <button
                    key={teacher.id || teacher.email}
                    type="button"
                    onClick={() =>
                      setSelectedTeacherId(teacher.id || teacher.email)
                    }
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-purple-50 dark:bg-purple-950/40 border-[#4B075F] dark:border-purple-400 ring-2 ring-[#4B075F]/20'
                        : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700/60 hover:bg-gray-100'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-gray-900 dark:text-white truncate">
                        {teacher.name}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                        {teacher.branch || 'Branş Öğretmeni'}
                      </div>
                    </div>
                    <span className="shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-[#4B075F] dark:text-purple-300">
                      {teacherPerms.length} İzin
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── CONTROLS & SEARCH BAR ── */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Progress summary */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-center font-black text-sm text-[#4B075F] dark:text-purple-300 shrink-0">
            %{percentActive}
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>
                {activeCount} / {totalCount} Yetki Açık
              </span>
              {hasChanges && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-black animate-pulse">
                  Kaydedilmemiş Değişiklik
                </span>
              )}
            </div>
            <div className="w-48 h-2 rounded-full bg-gray-100 dark:bg-gray-800 mt-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${percentActive}%` }}
              />
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Ekran, yetki veya modül ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4B075F]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Batch Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="px-3 py-2 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 border border-purple-200 dark:border-purple-800 transition-all cursor-pointer"
          >
            Tümünü Aç
          </button>
          <button
            type="button"
            onClick={handleDeselectAll}
            className="px-3 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 transition-all cursor-pointer"
          >
            Tümünü Kapat
          </button>
          <button
            type="button"
            onClick={handleResetToDefault}
            title="Varsayılan Şablona Sıfırla"
            className="p-2 rounded-xl text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── PERMISSIONS MATRIX BY CATEGORY ── */}
      <div className="space-y-6">
        {categoriesToShow.map((catName) => {
          const catPerms = filteredPermissions.filter(
            (p) => p.category === catName
          )
          const allCatAllowed = catPerms.every((p) =>
            activePermissions.includes(p.id)
          )
          const someCatAllowed = catPerms.some((p) =>
            activePermissions.includes(p.id)
          )
          const activeInCatCount = catPerms.filter((p) =>
            activePermissions.includes(p.id)
          ).length
          const CatIcon = getCategoryIcon(catName)

          return (
            <div
              key={catName}
              className="rounded-3xl bg-white dark:bg-[#121826] border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xs"
            >
              {/* Category Header */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/60 dark:to-[#121826] border-b border-gray-200/80 dark:border-gray-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-[#4B075F] dark:text-purple-300 flex items-center justify-center shrink-0">
                    <CatIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <span>{catName}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
                        {activeInCatCount} / {catPerms.length} Açık
                      </span>
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Bu kategorideki ekran ve işlem izinlerini yönetin
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleCategory(catName)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    allCatAllowed
                      ? 'bg-purple-100 dark:bg-purple-900/50 text-[#4B075F] dark:text-purple-300 border-purple-200 dark:border-purple-700'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {allCatAllowed ? 'Kategoriyi Kapat' : 'Kategoriyi Aç'}
                </button>
              </div>

              {/* Permissions Cards Grid */}
              <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {catPerms.map((perm) => {
                  const isAllowed = activePermissions.includes(perm.id)

                  return (
                    <div
                      key={perm.id}
                      onClick={() => handleTogglePermission(perm.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-start justify-between gap-3 ${
                        isAllowed
                          ? 'bg-purple-50/70 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/80 shadow-xs'
                          : 'bg-gray-50/50 dark:bg-gray-800/20 border-gray-200/60 dark:border-gray-800/60 opacity-60 hover:opacity-90'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isAllowed ? 'bg-emerald-500' : 'bg-gray-400'
                            }`}
                          />
                          <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                            {perm.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                          {perm.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {perm.defaultForRoles.map((roleId) => {
                            const rDef = ROLE_DEFINITIONS.find(
                              (r) => r.id === roleId
                            )
                            return (
                              <span
                                key={roleId}
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                              >
                                {rDef?.title || roleId}
                              </span>
                            )
                          })}
                        </div>
                      </div>

                      {/* Switch Toggle */}
                      <div
                        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                          isAllowed
                            ? 'bg-[#4B075F] dark:bg-purple-600'
                            : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform flex items-center justify-center shadow-xs ${
                            isAllowed ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        >
                          {isAllowed ? (
                            <Check className="w-3 h-3 text-[#4B075F]" />
                          ) : (
                            <Lock className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── STICKY FOOTER SAVE BAR ── */}
      <div className="sticky bottom-4 z-40 p-4 rounded-3xl bg-white/95 dark:bg-[#121826]/95 backdrop-blur-md border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-[#4B075F] dark:text-purple-300 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-gray-900 dark:text-white">
              {mode === 'role'
                ? `${currentRole.title} Yetki Matrisi Düzenleniyor`
                : `${currentTeacher?.name || 'Öğretmen'} Özel İzinleri Düzenleniyor`}
            </div>
            <div className="text-[11px] text-gray-500">
              {hasChanges
                ? 'Kaydedilmemiş değişiklikler var. Değişiklikleri kaydettiğinizde personel girişlerinde anında yürürlüğe girer.'
                : 'Tüm yetki ayarları güncel ve canlı sistemde devrede.'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {hasChanges && (
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 transition-all cursor-pointer flex-1 sm:flex-initial text-center"
            >
              Vazgeç / Sıfırla
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black text-white bg-[#4B075F] hover:bg-[#390449] active:scale-98 transition-all cursor-pointer shadow-lg shadow-purple-950/20 flex items-center justify-center gap-2 flex-1 sm:flex-initial"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Kaydediliyor...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Yetki Matrisini Kaydet ve Canlıya Al</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
