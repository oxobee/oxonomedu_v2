'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/keys'
import { useTranslation } from 'react-i18next'
import { useOrg } from '@components/Contexts/OrgContext'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { getBoards } from '@services/boards/boards'
import { getSchoolAssignments, SchoolAssignmentItem } from '@services/school_assignments/school_assignments'
import { ALL_CLASSROOMS, ClassroomItem } from '@services/demo/schoolDirectory'
import { SYNCED_BOARDS } from '@services/demo/databaseSync'
import {
  ChalkboardSimple,
  Files,
  GraduationCap,
  Users,
  PlusCircle,
  ArrowRight,
  Sparkle,
  TrendUp,
  FolderSimple,
  ChatsCircle,
  Headphones,
  Cube,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  BookOpen,
  Eye,
} from '@phosphor-icons/react'

export default function TeacherDashboard() {
  const { t } = useTranslation()
  const org = useOrg() as any
  const session = useLHSession() as any
  const token = session?.data?.tokens?.access_token
  const user = session?.data?.user

  const orgId = org?.id || 10
  const isPrimary = org?.slug === 'neclagorer' || orgId === 10
  const teacherName = (user?.first_name && user?.last_name)
    ? `${user.first_name} ${user.last_name}`
    : (isPrimary ? 'Özlem ZOR' : 'Esin AKKAN')

  // 1. Fetch Boards
  const { data: boardsData, isLoading: boardsLoading } = useQuery({
    queryKey: [...queryKeys.boards.list(orgId), 'teacher-dash'],
    queryFn: () => getBoards(orgId, token || ''),
    staleTime: 60_000,
  })
  const boards: any[] = Array.isArray(boardsData) && boardsData.length > 0
    ? boardsData
    : SYNCED_BOARDS.slice(0, 6)

  // 2. Fetch Assignments
  const { data: assignmentsData } = useQuery({
    queryKey: ['school-assignments', orgId, 'teacher-dash'],
    queryFn: () => getSchoolAssignments(orgId, {}, token || ''),
    staleTime: 60_000,
  })
  const assignments: SchoolAssignmentItem[] = Array.isArray(assignmentsData) && assignmentsData.length > 0
    ? assignmentsData
    : []

  // 3. Filter Classrooms for this school
  const schoolClassrooms = useMemo(() => {
    return ALL_CLASSROOMS.filter((c) => isPrimary ? c.org_id === 10 : c.org_id === 20)
  }, [isPrimary])

  const totalStudents = schoolClassrooms.length * 30
  const totalSubmissions = assignments.reduce((acc, a) => acc + (a.total_submissions || 0), 0)
  const totalGraded = assignments.reduce((acc, a) => acc + (a.graded_submissions || 0), 0)

  return (
    <div className="space-y-8 dash-stagger-items">
      {/* ── 1. Hero Teacher Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-indigo-900 p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-white/20 backdrop-blur-md text-white border border-white/20">
                <Sparkle size={14} weight="fill" className="text-amber-300" />
                <span>Öğretmen Çalışma Alanı</span>
              </span>
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                {org?.name || 'Oxonom Edu Kampüsü'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Hoş Geldiniz, {teacherName} 👋
            </h2>
            <p className="text-sm text-emerald-100/90 max-w-xl font-normal leading-relaxed">
              Ders içeriklerinizi yönetin, akıllı tahtalarda interaktif dersler işleyin ve öğrencilerinizin ödev teslimlerini anlık takip edin.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/dash/assignments"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-950 font-bold text-xs sm:text-sm hover:bg-emerald-50 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <PlusCircle size={17} weight="bold" className="text-emerald-700" />
              <span>Yeni Ödev Ver</span>
            </Link>
            <Link
              href="/dash/boards?new=true"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm backdrop-blur-md border border-white/20 transition-all cursor-pointer"
            >
              <ChalkboardSimple size={17} weight="bold" className="text-amber-300" />
              <span>Yeni Pano Aç</span>
            </Link>
            <Link
              href="/dash/classrooms"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm backdrop-blur-md border border-white/20 transition-all cursor-pointer"
            >
              <GraduationCap size={17} weight="bold" className="text-cyan-300" />
              <span>Sınıflarım ({schoolClassrooms.length})</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow circles */}
        <div className="absolute -end-16 -top-16 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -start-16 -bottom-16 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ── 2. Stat Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Boards Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 nice-shadow transition-all hover:shadow-md group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Akıllı Tahtalar</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
              <ChalkboardSimple size={22} weight="duotone" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">{boards.length || 14}</span>
            <span className="text-xs font-semibold text-rose-600 flex items-center gap-0.5">
              <TrendUp size={13} weight="bold" /> Aktif
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Ders panoları ve çizim tahtaları</p>
        </div>

        {/* Assignments Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 nice-shadow transition-all hover:shadow-md group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Verilen Ödevler</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
              <Files size={22} weight="duotone" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">{assignments.length || 7}</span>
            <span className="text-xs font-semibold text-indigo-600">
              {totalSubmissions || 184} Teslim
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Takip edilen aktif ödev görevleri</p>
        </div>

        {/* Classrooms Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 nice-shadow transition-all hover:shadow-md group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kayıtlı Şubeler</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <GraduationCap size={22} weight="duotone" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">{schoolClassrooms.length}</span>
            <span className="text-xs font-semibold text-emerald-600">
              {isPrimary ? '1-4. Sınıf' : '5-8. Sınıf'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Okuldaki tüm aktif şube listesi</p>
        </div>

        {/* Students Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 nice-shadow transition-all hover:shadow-md group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Toplam Öğrenci</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <Users size={22} weight="duotone" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">{totalStudents}</span>
            <span className="text-xs font-semibold text-amber-700">30 Öğr./Şube</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Okul kütüğünde kayıtlı öğrenciler</p>
        </div>
      </div>

      {/* ── 3. Akıllı Tahtalar (Panolar) Section ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <ChalkboardSimple size={18} weight="fill" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Akıllı Ders Panoları (Demo Tahtalar)</h3>
              <p className="text-xs text-gray-500">Müfredat kazanımlarına uygun etkileşimli çalışma panoları</p>
            </div>
          </div>
          <Link
            href="/dash/boards"
            className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 hover:text-rose-800 transition-colors"
          >
            <span>Tüm Panoları Gör ({boards.length})</span>
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.slice(0, 6).map((b: any, idx: number) => {
            const gradients = [
              'from-indigo-600 via-blue-600 to-cyan-500',
              'from-emerald-600 via-teal-600 to-cyan-600',
              'from-purple-600 via-pink-600 to-rose-500',
              'from-amber-600 via-orange-600 to-red-500',
              'from-sky-600 via-blue-700 to-indigo-800',
              'from-rose-600 via-pink-600 to-purple-600',
            ]
            const bgGrad = gradients[idx % gradients.length]
            const boardLink = b.board_uuid ? `/board/${b.board_uuid}` : `/dash/boards`

            return (
              <div
                key={b.id || idx}
                className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                {/* Visual Header */}
                <div className={`h-28 bg-gradient-to-br ${bgGrad} p-4 text-white relative flex flex-col justify-between`}>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-lg bg-black/25 backdrop-blur-sm text-[10px] font-black tracking-wide uppercase">
                      {b.features?.subject || (idx % 2 === 0 ? 'Matematik' : 'Fen Bilimleri')}
                    </span>
                    <span className="text-[11px] font-bold text-white/90 bg-white/20 px-2 py-0.5 rounded-md">
                      👥 30 Öğrenci
                    </span>
                  </div>
                  <h4 className="font-black text-sm text-white line-clamp-2 leading-snug drop-shadow-xs">
                    {b.name}
                  </h4>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {b.description || 'Akıllı tahta üzerinden canlı çizim, formül çözümleme ve sınıf içi etkileşimli etkinlik tahtası.'}
                  </p>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-gray-600">
                      Kod: <span className="font-bold text-emerald-800">{b.short_code || `PNO-${b.id || 10}`}</span>
                    </span>
                    <Link
                      href={boardLink}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
                    >
                      <span>Tahtayı Aç</span>
                      <ArrowRight size={13} weight="bold" />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 4. Ödevler & Takip Bölümü (Assignments Overview) ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Files size={18} weight="fill" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Ödevler ve Teslim Durumu (Demo Ödevler)</h3>
              <p className="text-xs text-gray-500">Öğrencilere verilen ödevlerin kontrol ve puanlama paneli</p>
            </div>
          </div>
          <Link
            href="/dash/assignments"
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 hover:text-indigo-800 transition-colors"
          >
            <span>Tüm Ödevleri Yönet ({assignments.length})</span>
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden nice-shadow">
          <div className="divide-y divide-gray-100">
            {assignments.slice(0, 5).map((asg) => {
              const totalSubs = asg.total_submissions || 28
              const gradedSubs = asg.graded_submissions || 25
              const pct = Math.round((gradedSubs / totalSubs) * 100)

              return (
                <div
                  key={asg.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/80 transition-colors"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-extrabold text-[11px] border border-indigo-200/80">
                        {asg.grade_level || '1. Sınıf'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[11px]">
                        {asg.subject || 'Ders'}
                      </span>
                      <span className="text-xs text-gray-600 font-medium flex items-center gap-1">
                        <Clock size={12} className="text-gray-400" />
                        Son: {asg.due_date ? new Date(asg.due_date).toLocaleDateString('tr-TR') : '15 Ekim'}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm sm:text-base text-gray-900 truncate">
                      {asg.title}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      {asg.description || 'Öğrenciler için hazırlanmış interaktif ödev etkinliği.'}
                    </p>
                  </div>

                  {/* Submission Progress & Action */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-end min-w-[100px]">
                      <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-gray-800">
                        <CheckCircle size={14} weight="fill" className="text-emerald-600" />
                        <span>{gradedSubs} / {totalSubs} Teslim</span>
                      </div>
                      <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1 ms-auto">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-600 font-bold">%{pct} Tamamlandı</span>
                    </div>

                    <Link
                      href="/dash/assignments"
                      className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors shrink-0"
                    >
                      İncele & Notlandır
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── 5. Şubelerim & Sınıflar (Classrooms Overview) ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <GraduationCap size={18} weight="fill" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Kayıtlı Sınıflar & Şubeler</h3>
              <p className="text-xs text-gray-500">Sınıf mevcudu, öğretmen atamaları ve katılım kodları</p>
            </div>
          </div>
          <Link
            href="/dash/classrooms"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-900 transition-colors"
          >
            <span>Tüm Şubeleri Aç ({schoolClassrooms.length})</span>
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {schoolClassrooms.slice(0, 14).map((cls) => (
            <Link
              key={cls.id}
              href={`/dash/classrooms/${cls.id}`}
              className="p-3.5 bg-white rounded-2xl border border-gray-200 hover:border-emerald-400 hover:shadow-xs transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <span className="text-base font-black text-gray-900 group-hover:text-emerald-700 transition-colors">
                  {cls.code}
                </span>
                <p className="text-[11px] font-bold text-gray-600 truncate mt-0.5">
                  {cls.teacher_name}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-600">
                <span>30 Öğrenci</span>
                <span className="font-mono font-bold text-emerald-700">{cls.join_code}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
