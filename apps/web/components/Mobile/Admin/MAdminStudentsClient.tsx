'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap,
  Search,
  Plus,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  X,
  Phone,
  User,
  CheckCircle2,
  Calendar,
  Building2,
  FileText,
  Heart,
  Eye,
  Sparkles,
  ShieldCheck,
  Check,
  Filter,
  Edit3,
  Award,
  BookOpen,
  AlertCircle,
  Send,
  Download,
  MapPin,
  Activity,
  HeartHandshake,
  School,
  Clock,
  Save,
  RotateCcw,
} from 'lucide-react'
import toast from 'react-hot-toast'
import MobileHeader from '@components/Mobile/MobileHeader'
import MobileAdminDock from './MobileAdminDock'
import MobileAdminMoreSheet from './MobileAdminMoreSheet'
import { useMobileTheme } from '@components/Mobile/useMobileTheme'
import {
  ALL_CLASSROOMS,
  generateClassStudents,
  DEMO_STUDENT,
  validateTcKimlik,
  lookupTcRecord,
} from '@services/demo/schoolDirectory'

export interface MAdminStudentsClientProps {
  orgSlug?: string
  hideHeader?: boolean
  hideDock?: boolean
}

export default function MAdminStudentsClient({
  orgSlug,
  hideHeader = false,
  hideDock = false,
}: MAdminStudentsClientProps) {
  const { theme, toggleTheme } = useMobileTheme()
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false)
  const [selectedClassCode, setSelectedClassCode] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // ── MODALS & SELECTIONS ──
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<any | null>(null)
  const [isEditingStudent, setIsEditingStudent] = useState(false)
  const [activeDetailTab, setActiveDetailTab] = useState<'general' | 'school' | 'parents' | 'academic' | 'notes'>('general')

  const [isNewStudentModalOpen, setIsNewStudentModalOpen] = useState(false)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [studentToTransfer, setStudentToTransfer] = useState<any | null>(null)
  const [targetTransferClass, setTargetTransferClass] = useState<string>('1-B')

  // ── FORM STATES FOR NEW STUDENT ──
  const [newTcNo, setNewTcNo] = useState('')
  const [newFirstName, setNewFirstName] = useState('')
  const [newLastName, setNewLastName] = useState('')
  const [newClassCode, setNewClassCode] = useState('1-A')
  const [newStudentNo, setNewStudentNo] = useState('2026-105')
  const [newParentName, setNewParentName] = useState('')
  const [newParentPhone, setNewParentPhone] = useState('')

  // ── EDIT STUDENT FORM STATES ──
  const [editFirstName, setEditFirstName] = useState('')
  const [editLastName, setEditLastName] = useState('')
  const [editTcNo, setEditTcNo] = useState('')
  const [editStudentNo, setEditStudentNo] = useState('')
  const [editClassCode, setEditClassCode] = useState('1-A')
  const [editBirthDate, setEditBirthDate] = useState('')
  const [editBloodType, setEditBloodType] = useState('A Rh+')
  const [editGender, setEditGender] = useState<'Erkek' | 'Kız'>('Erkek')
  const [editParentName, setEditParentName] = useState('')
  const [editParentPhone, setEditParentPhone] = useState('')
  const [editMotherName, setEditMotherName] = useState('')
  const [editMotherPhone, setEditMotherPhone] = useState('')
  const [editAddress, setEditAddress] = useState('')
  const [editHealthNote, setEditHealthNote] = useState('')
  const [editAdminNote, setEditAdminNote] = useState('')

  // ── STUDENTS LIST WITH LOCALSTORAGE PERSISTENCE ──
  const [studentsList, setStudentsList] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('oxonom_admin_students_list')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
      } catch (_) {}
    }
    const list: any[] = []
    ALL_CLASSROOMS.slice(0, 8).forEach((cls) => {
      const clsStudents = generateClassStudents(cls)
      list.push(...clsStudents)
    })
    return list
  })

  // Sync to localStorage whenever studentsList changes
  const updateStudentsList = (newList: any[]) => {
    setStudentsList(newList)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('oxonom_admin_students_list', JSON.stringify(newList))
      } catch (_) {}
    }
  }

  // ── OPEN DETAIL MODAL & PREFILL FORM ──
  const handleOpenStudentDetail = (student: any) => {
    setSelectedStudentForDetail(student)
    setIsEditingStudent(false)
    setActiveDetailTab('general')

    const fName = student.first_name || (student.name ? student.name.split(' ')[0] : 'Öğrenci')
    const lName = student.last_name || (student.name ? student.name.split(' ').slice(1).join(' ') : '')

    setEditFirstName(fName)
    setEditLastName(lName)
    setEditTcNo(student.tcNo || '10000000146')
    setEditStudentNo(student.studentNo || '2026-001')
    setEditClassCode(student.className || '1-A')
    setEditBirthDate(student.birthDate || '15.06.2017')
    setEditBloodType(student.bloodType || 'A Rh+')
    setEditGender(student.gender || 'Erkek')
    setEditParentName(student.parentName || student.fatherName || 'Uğur UĞURLU')
    setEditParentPhone(student.parentPhone || student.fatherPhone || '+90 532 999 2200')
    setEditMotherName(student.motherName || 'Ebru UĞURLU')
    setEditMotherPhone(student.motherPhone || '+90 532 999 1100')
    setEditAddress(student.address || 'Bağdat Cad. No:114 Kadıköy / İstanbul')
    setEditHealthNote(student.specialHealthNote || 'Herhangi bir sağlık engeli veya alerjisi bulunmamaktadır.')
    setEditAdminNote(student.notes || 'Ders içi katılımı yüksek, örnek öğrenci.')
  }

  // ── SAVE STUDENT EDITS ──
  const handleSaveStudentEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudentForDetail) return

    const fullName = `${editFirstName.trim()} ${editLastName.trim()}`.trim()
    const updatedStudent = {
      ...selectedStudentForDetail,
      name: fullName,
      first_name: editFirstName.trim(),
      last_name: editLastName.trim(),
      tcNo: editTcNo.trim(),
      studentNo: editStudentNo.trim(),
      className: editClassCode,
      birthDate: editBirthDate.trim(),
      bloodType: editBloodType,
      gender: editGender,
      parentName: editParentName.trim(),
      parentPhone: editParentPhone.trim(),
      fatherName: editParentName.trim(),
      fatherPhone: editParentPhone.trim(),
      motherName: editMotherName.trim(),
      motherPhone: editMotherPhone.trim(),
      address: editAddress.trim(),
      specialHealthNote: editHealthNote.trim(),
      notes: editAdminNote.trim(),
    }

    const updatedList = studentsList.map((s) =>
      s.id === selectedStudentForDetail.id ? updatedStudent : s
    )

    updateStudentsList(updatedList)
    setSelectedStudentForDetail(updatedStudent)
    setIsEditingStudent(false)
    toast.success(`${fullName} öğrencisinin tüm bilgileri başarıyla güncellendi!`)
  }

  // ── HANDLE NEW STUDENT SUBMIT ──
  const handleRegisterStudent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTcNo || !newFirstName || !newLastName) {
      toast.error('Lütfen TC kimlik, ad ve soyad alanlarını doldurunuz.')
      return
    }

    const newId = Date.now()
    const fullName = `${newFirstName.trim()} ${newLastName.trim()}`
    const createdStudent = {
      id: newId,
      user_uuid: `user_${newId}`,
      studentNo: newStudentNo || `2026-${Math.floor(100 + Math.random() * 900)}`,
      tcNo: newTcNo.trim(),
      name: fullName,
      first_name: newFirstName.trim(),
      last_name: newLastName.trim(),
      className: newClassCode,
      gender: 'Erkek',
      birthDate: '01.01.2018 (8 Yaşında)',
      bloodType: 'A Rh+',
      parentName: newParentName.trim() || 'Veli Adı',
      parentPhone: newParentPhone.trim() || '+90 532 999 0000',
      fatherName: newParentName.trim() || 'Veli Adı',
      fatherPhone: newParentPhone.trim() || '+90 532 999 0000',
      motherName: 'Belirtilmedi',
      motherPhone: '+90 532 000 0000',
      address: 'İstanbul',
      status: 'active',
      enrollmentDate: new Date().toLocaleDateString('tr-TR'),
      gpa: 88.5,
      attendanceRate: 100,
      excusedDays: 0,
      unexcusedDays: 0,
      notes: 'Yeni kayıt öğrenci dosyası.',
      specialHealthNote: 'Herhangi bir sağlık engeli bulunmamaktadır.',
      mentorTeacher: 'Sınıf Öğretmeni',
      grades: [
        { courseName: 'Türkçe', average: 88.0 },
        { courseName: 'Matematik', average: 86.5 },
        { courseName: 'Hayat Bilgisi', average: 90.0 },
      ],
    }

    const updatedList = [createdStudent, ...studentsList]
    updateStudentsList(updatedList)

    toast.success(`${fullName} öğrencisi ${newClassCode} şubesine başarıyla kaydedildi!`)
    setIsNewStudentModalOpen(false)
    setNewTcNo('')
    setNewFirstName('')
    setNewLastName('')
    setNewParentName('')
    setNewParentPhone('')
  }

  // ── HANDLE NAKİL / TRANSFER ──
  const handleConfirmTransfer = () => {
    if (!studentToTransfer) return
    const updatedStudent = {
      ...studentToTransfer,
      className: targetTransferClass,
    }
    const updatedList = studentsList.map((s) =>
      s.id === studentToTransfer.id ? updatedStudent : s
    )
    updateStudentsList(updatedList)
    if (selectedStudentForDetail && selectedStudentForDetail.id === studentToTransfer.id) {
      setSelectedStudentForDetail(updatedStudent)
    }
    toast.success(
      `${studentToTransfer.name} öğrencisi başarıyla ${targetTransferClass} şubesine nakil edildi.`
    )
    setIsTransferModalOpen(false)
    setStudentToTransfer(null)
  }

  const getUrl = (path: string) => {
    return orgSlug ? `/orgs/${orgSlug}${path}` : path
  }

  const classList = ['ALL', '1-A', '1-B', '2-A', '2-B', '3-A', '3-B', '4-A', '4-B', '5-A', '6-A', '7-A', '8-A']

  // Filtered students by class and search
  const filteredStudents = useMemo(() => {
    return studentsList.filter((std) => {
      const matchesClass =
        selectedClassCode === 'ALL' || std.className === selectedClassCode
      if (!matchesClass) return false

      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        std.name.toLowerCase().includes(q) ||
        (std.studentNo && std.studentNo.toLowerCase().includes(q)) ||
        (std.tcNo && std.tcNo.includes(q)) ||
        (std.parentName && std.parentName.toLowerCase().includes(q))
      )
    })
  }, [studentsList, selectedClassCode, searchQuery])

  const pageContent = (
    <div className="flex flex-col flex-1 w-full pb-8 select-none font-jakarta">
      {/* ── STAGGERED PAGE CONTENT ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col flex-1 w-full dash-stagger-items"
      >
        {/* ── 1. SUBBAR & BREADCRUMB ── */}
        <div className="px-4 pt-3 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Link
              href={getUrl('/m-admin')}
              aria-label="İdare Paneline Dön"
              className="w-10 h-10 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121826] text-gray-800 dark:text-gray-200 flex items-center justify-center shrink-0 shadow-xs hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors"
            >
              <ChevronLeft size={20} strokeWidth={2.2} />
            </Link>

            <nav
              aria-label="Konum"
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 truncate"
            >
              <Link
                href={getUrl('/m-admin')}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                İdare
              </Link>
              <span className="text-gray-400">/</span>
              <span className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800 text-gray-900 dark:text-white font-bold shadow-xs truncate">
                <GraduationCap size={13} className="text-[#34D399] shrink-0" />
                <span className="truncate">Öğrenci Yönetimi</span>
              </span>
            </nav>
          </div>

          <span className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-black shrink-0 border border-emerald-200/50 dark:border-emerald-800/50">
            {studentsList.length} Kayıt
          </span>
        </div>

        {/* ── 2. QUICK ACTIONS BAR (+ Yeni Kayıt & ⇄ Nakil) ── */}
        <section className="px-4 mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIsNewStudentModalOpen(true)}
            className="h-11 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Yeni Öğrenci Ekle</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (filteredStudents.length > 0) {
                setStudentToTransfer(filteredStudents[0])
                setIsTransferModalOpen(true)
              } else {
                toast.error('Nakil yapılacak öğrenci bulunamadı.')
              }
            }}
            className="h-11 rounded-2xl bg-white dark:bg-[#121826] hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200/90 dark:border-gray-800/90 font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <ArrowLeftRight size={15} className="text-indigo-500" />
            <span>Şube Nakli</span>
          </button>
        </section>

        {/* ── 3. SEARCH BAR ── */}
        <section className="px-4 mt-3">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Öğrenci adı, okul no, TC veya veli ara..."
              className={`w-full h-11 pl-9 pr-3.5 rounded-2xl text-xs font-medium outline-hidden transition-all ${
                theme === 'dark'
                  ? 'bg-[#121826] text-white placeholder-gray-500 border border-gray-800 focus:border-[#34D399]/60'
                  : 'bg-white text-gray-900 placeholder-gray-400 border border-gray-200/90 focus:border-[#10B981] shadow-xs'
              }`}
            />
          </div>
        </section>

        {/* ── 4. HORIZONTAL CLASS PILLS FILTER ── */}
        <section className="px-4 mt-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {classList.map((cls) => {
              const isActive = selectedClassCode === cls
              return (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setSelectedClassCode(cls)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xs scale-102'
                      : 'bg-white dark:bg-[#121826] text-gray-600 dark:text-gray-400 border border-gray-200/80 dark:border-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {cls === 'ALL' ? 'Tüm Şubeler' : `${cls} Şubesi`}
                </button>
              )
            })}
          </div>
        </section>

        {/* ── 5. STUDENT CARDS LIST (TAM & ETKİLEŞİMLİ KARTLAR) ── */}
        <section className="px-4 mt-3 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold px-1">
            <span>Listelenen Öğrenciler ({filteredStudents.length})</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
              Karta dokunarak detayları açın &gt;
            </span>
          </div>

          {filteredStudents.map((student, idx) => (
            <motion.div
              key={`${student.id || 'std'}-${student.className || 'cls'}-${idx}`}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleOpenStudentDetail(student)}
              className="bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800/80 rounded-2xl p-3.5 shadow-xs transition-all hover:border-[#34D399]/60 hover:shadow-md cursor-pointer select-none group relative overflow-hidden"
            >
              {/* Top Accent Strip */}
              <div className="flex items-start justify-between gap-3">
                {/* Avatar & Main Info */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-md border border-emerald-400/20 group-hover:scale-105 transition-transform">
                      {student.name
                        .split(' ')
                        .map((p: string) => p[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-[#121826] shadow-xs" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs font-black text-gray-900 dark:text-white group-hover:text-emerald-500 transition-colors truncate">
                        {student.name}
                      </h4>
                      <span className="text-[9.5px] font-black px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {student.className}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 flex-wrap">
                      <span>No: <strong>{student.studentNo}</strong></span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <ShieldCheck size={11} className="text-emerald-500" />
                        <span>TC: {student.tcNo ? `${student.tcNo.slice(0, 3)}*****${student.tcNo.slice(-2)}` : '100*****146'}</span>
                      </span>
                    </div>

                    {/* Parent Info Strip */}
                    <div className="flex items-center gap-1.5 text-[10.5px] text-gray-600 dark:text-gray-400 mt-1.5 bg-gray-50 dark:bg-gray-800/60 px-2 py-1 rounded-lg truncate">
                      <User size={11} className="text-gray-400 shrink-0" />
                      <span className="truncate">Veli: {student.parentName || student.motherName || 'Uğur UĞURLU'}</span>
                      <span className="text-gray-400">·</span>
                      <Phone size={11} className="text-gray-400 shrink-0" />
                      <span className="truncate">{student.parentPhone || student.fatherPhone || '+90 532 999 2200'}</span>
                    </div>
                  </div>
                </div>

                {/* Right Status Pill & Open Arrow */}
                <div className="shrink-0 flex flex-col items-end gap-1.5">
                  <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50">
                    Aktif
                  </span>

                  <div className="flex items-center gap-1 mt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenStudentDetail(student)
                      }}
                      className="px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Detay ve Düzenle"
                    >
                      <Edit3 size={11} />
                      <span>Düzenle</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setStudentToTransfer(student)
                        setIsTransferModalOpen(true)
                      }}
                      className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-colors cursor-pointer"
                      title="Şube Nakil"
                    >
                      <ArrowLeftRight size={12} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Metric Highlights */}
              <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-3">
                  <span>Başarı: <strong className="text-emerald-600 dark:text-emerald-400">%{student.gpa || 98.5}</strong></span>
                  <span>·</span>
                  <span>Devamsızlık: <strong>{student.unexcusedDays || 0} Gün</strong></span>
                </div>
                <span className="text-emerald-500 font-extrabold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  <span>Detayları Aç</span>
                  <ChevronRight size={11} />
                </span>
              </div>
            </motion.div>
          ))}

          {filteredStudents.length === 0 && (
            <div className="py-12 text-center text-xs text-gray-400 bg-white dark:bg-[#121826] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              Arama kriterlerine uygun öğrenci kaydı bulunamadı.
            </div>
          )}
        </section>
      </motion.div>

      {/* ── MODAL 1: ÖĞRENCİ DETAY, KÜNYE VE DÜZENLEME MODALI ── */}
      <AnimatePresence>
        {selectedStudentForDetail && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedStudentForDetail(null)
                setIsEditingStudent(false)
              }}
              className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%', opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.8 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className={`relative w-full sm:max-w-md max-h-[92vh] rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col z-10 overflow-hidden ${
                theme === 'dark'
                  ? 'bg-[#0E131F] text-white border-t sm:border border-gray-800'
                  : 'bg-white text-gray-900 border-t sm:border border-gray-200'
              }`}
            >
              <div className="pt-3 pb-1 flex justify-center sm:hidden">
                <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
              </div>

              {/* Title & Edit Mode Toggle */}
              <div className="px-5 pt-3 pb-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xs">
                    <GraduationCap size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                      <span>Öğrenci Dosyası & Künye</span>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        {isEditingStudent ? 'DÜZENLEME' : 'RESMİ'}
                      </span>
                    </h3>
                    <p className="text-[10px] text-gray-400 font-medium">MEBBİS & MERNİS Onaylı Öğrenci Kaydı</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsEditingStudent(!isEditingStudent)}
                    className={`h-8 px-2.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                      isEditingStudent
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                  >
                    <Edit3 size={12} />
                    <span>{isEditingStudent ? 'Görüntüle' : 'Düzenle'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudentForDetail(null)
                      setIsEditingStudent(false)
                    }}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Scrollable Content Body */}
              <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
                {/* 1. Student Hero Profile Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-900 via-[#0D1829] to-[#08231A] text-white border border-emerald-500/30 relative overflow-hidden shadow-lg">
                  <div className="relative z-10 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-gray-950 font-black text-base flex items-center justify-center shadow-lg">
                          {selectedStudentForDetail.name
                            .split(' ')
                            .map((p: string) => p[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-gray-900 flex items-center justify-center">
                          <Check size={9} strokeWidth={3} className="text-white" />
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-base font-black text-white leading-tight">
                            {selectedStudentForDetail.name}
                          </h4>
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-emerald-400 text-gray-950">
                            {selectedStudentForDetail.className}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-300 font-bold mt-0.5">
                          Okul No: {selectedStudentForDetail.studentNo}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                          <School size={11} className="text-emerald-400" />
                          <span>Rehber Öğretmen: {selectedStudentForDetail.mentorTeacher || 'Özlem ZOR'}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Highlights Strip */}
                  <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-300">
                    <span className="flex items-center gap-1">
                      <Award size={11} className="text-amber-400" />
                      <span>Not Ort.: <strong>%{selectedStudentForDetail.gpa || 98.5}</strong></span>
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={11} className="text-emerald-400" />
                      <span>Devamsızlık: <strong>{selectedStudentForDetail.unexcusedDays || 0} Gün</strong></span>
                    </span>
                    <span className="text-emerald-400 font-bold">Aktif Kayıt</span>
                  </div>
                </div>

                {/* 2. IN-PLACE EDIT FORM (When isEditingStudent is true) */}
                {isEditingStudent ? (
                  <form onSubmit={handleSaveStudentEdit} className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                        <Edit3 size={13} className="text-emerald-500" />
                        <span>Öğrenci Bilgilerini Düzenle</span>
                      </span>
                      <span className="text-[10px] text-emerald-500 font-bold">Canlı Veri Kaydı</span>
                    </div>

                    {/* Ad & Soyad */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                          Öğrenci Adı
                        </label>
                        <input
                          type="text"
                          value={editFirstName}
                          onChange={(e) => setEditFirstName(e.target.value)}
                          className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                          Öğrenci Soyadı
                        </label>
                        <input
                          type="text"
                          value={editLastName}
                          onChange={(e) => setEditLastName(e.target.value)}
                          className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>
                    </div>

                    {/* TC No & Okul No */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                          T.C. Kimlik No
                        </label>
                        <input
                          type="text"
                          maxLength={11}
                          value={editTcNo}
                          onChange={(e) => setEditTcNo(e.target.value)}
                          className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                          Okul Numarası
                        </label>
                        <input
                          type="text"
                          value={editStudentNo}
                          onChange={(e) => setEditStudentNo(e.target.value)}
                          className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Şube Seçimi & Cinsiyet */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                          Kayıtlı Şube
                        </label>
                        <select
                          value={editClassCode}
                          onChange={(e) => setEditClassCode(e.target.value)}
                          className="w-full h-9 px-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        >
                          {['1-A', '1-B', '2-A', '2-B', '3-A', '3-B', '4-A', '4-B', '5-A', '6-A', '7-A', '8-A'].map((c) => (
                            <option key={c} value={c}>{c} Şubesi</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                          Kan Grubu
                        </label>
                        <select
                          value={editBloodType}
                          onChange={(e) => setEditBloodType(e.target.value)}
                          className="w-full h-9 px-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white focus:outline-none"
                        >
                          {['A Rh+', 'A Rh-', 'B Rh+', 'B Rh-', 'AB Rh+', 'AB Rh-', '0 Rh+', '0 Rh-'].map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Veli Bilgileri */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                        Birincil Veli Adı Soyadı
                      </label>
                      <input
                        type="text"
                        value={editParentName}
                        onChange={(e) => setEditParentName(e.target.value)}
                        className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                          Veli Telefonu
                        </label>
                        <input
                          type="tel"
                          value={editParentPhone}
                          onChange={(e) => setEditParentPhone(e.target.value)}
                          className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                          İkinci Veli / Anne Tel
                        </label>
                        <input
                          type="tel"
                          value={editMotherPhone}
                          onChange={(e) => setEditMotherPhone(e.target.value)}
                          className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Ev Adresi */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                        İkametgah Adresi
                      </label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs font-medium text-gray-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    {/* Sağlık & İdare Notu */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                        Sağlık / Özel Not
                      </label>
                      <textarea
                        rows={2}
                        value={editHealthNote}
                        onChange={(e) => setEditHealthNote(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs text-gray-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingStudent(false)}
                        className="h-10 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-300 transition-colors cursor-pointer text-xs"
                      >
                        Vazgeç
                      </button>
                      <button
                        type="submit"
                        className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md transition-colors cursor-pointer text-xs flex items-center justify-center gap-1.5"
                      >
                        <Check size={14} strokeWidth={2.5} />
                        <span>Değişiklikleri Kaydet</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  /* 3. STRUCTURED CATEGORY TABS (VIEW MODE) */
                  <div className="space-y-3">
                    {/* Tabs strip */}
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
                      {[
                        { id: 'general', label: 'Temel & Nüfus', icon: User },
                        { id: 'school', label: 'Okul & Şube', icon: Building2 },
                        { id: 'parents', label: 'Veli & İletişim', icon: HeartHandshake },
                        { id: 'academic', label: 'Notlar & Devamsızlık', icon: Award },
                        { id: 'notes', label: 'Sağlık & Notlar', icon: Activity },
                      ].map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeDetailTab === tab.id
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveDetailTab(tab.id as any)}
                            className={`px-2.5 py-1.5 rounded-xl text-[10.5px] font-bold shrink-0 flex items-center gap-1 transition-all cursor-pointer ${
                              isActive
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                            }`}
                          >
                            <Icon size={11} />
                            <span>{tab.label}</span>
                          </button>
                        )
                      })}
                    </div>

                    {/* TAB 1: TEMEL & NÜFUS */}
                    {activeDetailTab === 'general' && (
                      <div className="space-y-2">
                        <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                          <span className="text-gray-500 font-bold">T.C. Kimlik No</span>
                          <span className="font-extrabold text-gray-900 dark:text-white font-mono flex items-center gap-1">
                            <span>{selectedStudentForDetail.tcNo || '10000000146'}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                              MERNİS
                            </span>
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                          <span className="text-gray-500 font-bold">Ad Soyad</span>
                          <span className="font-extrabold text-gray-900 dark:text-white">
                            {selectedStudentForDetail.name}
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                          <span className="text-gray-500 font-bold">Doğum Tarihi</span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {selectedStudentForDetail.birthDate || '15.06.2017 (9 Yaşında)'}
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                          <span className="text-gray-500 font-bold">Cinsiyet & Kan Grubu</span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {selectedStudentForDetail.gender || 'Erkek'} · {selectedStudentForDetail.bloodType || 'A Rh+'}
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                          <span className="text-gray-500 font-bold">Resmi Öğrenci Durumu</span>
                          <span className="font-black text-emerald-600 dark:text-emerald-400">
                            Aktif Öğrenci (2025–2026)
                          </span>
                        </div>
                      </div>
                    )}

                    {/* TAB 2: OKUL & ŞUBE */}
                    {activeDetailTab === 'school' && (
                      <div className="space-y-2">
                        <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                          <span className="text-gray-500 font-bold">Kayıtlı Kurum</span>
                          <span className="font-extrabold text-gray-900 dark:text-white">
                            Necla Görer İlkokulu
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                          <span className="text-gray-500 font-bold">Sınıf & Şube</span>
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                            {selectedStudentForDetail.className} Şubesi
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                          <span className="text-gray-500 font-bold">Okul Numarası</span>
                          <span className="font-black text-gray-900 dark:text-white font-mono">
                            {selectedStudentForDetail.studentNo}
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                          <span className="text-gray-500 font-bold">Sınıf Rehber Öğretmeni</span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {selectedStudentForDetail.mentorTeacher || 'Özlem ZOR'}
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                          <span className="text-gray-500 font-bold">İlk Kayıt Tarihi</span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {selectedStudentForDetail.enrollmentDate || '15.09.2024'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setStudentToTransfer(selectedStudentForDetail)
                            setIsTransferModalOpen(true)
                          }}
                          className="w-full h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
                        >
                          <ArrowLeftRight size={13} />
                          <span>Bu Öğrenciyi Başka Şubeye Nakil Et</span>
                        </button>
                      </div>
                    )}

                    {/* TAB 3: VELİ & İLETİŞİM */}
                    {activeDetailTab === 'parents' && (
                      <div className="space-y-2">
                        <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                          <div>
                            <div className="text-[10px] text-gray-400 font-semibold">Birincil Veli / Baba</div>
                            <div className="font-extrabold text-gray-900 dark:text-white mt-0.5">
                              {selectedStudentForDetail.parentName || 'Uğur UĞURLU'}
                            </div>
                          </div>
                          <a
                            href={`tel:${selectedStudentForDetail.parentPhone || '+905329992200'}`}
                            className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1"
                          >
                            <Phone size={11} />
                            <span>Ara</span>
                          </a>
                        </div>

                        <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                          <div>
                            <div className="text-[10px] text-gray-400 font-semibold">Anne Adı & Telefon</div>
                            <div className="font-extrabold text-gray-900 dark:text-white mt-0.5">
                              {selectedStudentForDetail.motherName || 'Ebru UĞURLU'}
                            </div>
                          </div>
                          <span className="text-gray-500 font-mono text-[11px]">
                            {selectedStudentForDetail.motherPhone || '+90 532 999 1100'}
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                          <div className="text-[10px] text-gray-400 font-semibold">İkametgah Adresi</div>
                          <div className="font-medium text-gray-800 dark:text-gray-200 mt-1 flex items-start gap-1.5 leading-snug">
                            <MapPin size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                            <span>{selectedStudentForDetail.address || 'Bağdat Cad. No:114 Kadıköy / İstanbul'}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            toast.success(`${selectedStudentForDetail.name} velisine (${selectedStudentForDetail.parentPhone || '+90 532 999 2200'}) hızlı SMS bilgilendirmesi gönderildi.`)
                          }}
                          className="w-full h-10 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer mt-2"
                        >
                          <Send size={13} />
                          <span>Veliye SMS Bilgilendirmesi Gönder</span>
                        </button>
                      </div>
                    )}

                    {/* TAB 4: AKADEMİK NOTLAR & DEVAMSIZLIK */}
                    {activeDetailTab === 'academic' && (
                      <div className="space-y-2.5">
                        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold uppercase">
                              Dönem Ağırlıklı Not Ortalaması
                            </div>
                            <div className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
                              %{selectedStudentForDetail.gpa || 98.5}
                            </div>
                          </div>
                          <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-xl bg-emerald-500 text-gray-950">
                            Takdir Adayı
                          </span>
                        </div>

                        {/* Ders Notları Dökümü */}
                        <div className="space-y-1.5">
                          <div className="text-[11px] font-black text-gray-500 px-1 uppercase">Ders Başarıları</div>
                          {(selectedStudentForDetail.grades || [
                            { courseName: 'Türkçe', average: 99.3 },
                            { courseName: 'Matematik', average: 99.3 },
                            { courseName: 'Hayat Bilgisi / Fen', average: 98.0 },
                            { courseName: 'İngilizce', average: 99.3 },
                          ]).map((g: any) => (
                            <div
                              key={g.courseName}
                              className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 flex items-center justify-between"
                            >
                              <span className="font-bold text-gray-900 dark:text-white">{g.courseName}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-500 rounded-full"
                                    style={{ width: `${g.average}%` }}
                                  />
                                </div>
                                <span className="font-black text-xs text-gray-900 dark:text-white">{g.average}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Devamsızlık İstatistiği */}
                        <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-gray-500 text-[10px]">Devamsızlık Durumu</div>
                            <div className="font-black text-gray-900 dark:text-white mt-0.5">
                              Özürsüz: {selectedStudentForDetail.unexcusedDays || 0} Gün · Özürlü: {selectedStudentForDetail.excusedDays || 0} Gün
                            </div>
                          </div>
                          <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            Düzenli
                          </span>
                        </div>
                      </div>
                    )}

                    {/* TAB 5: SAĞLIK & REHBERLİK NOTLARI */}
                    {activeDetailTab === 'notes' && (
                      <div className="space-y-2">
                        <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-1">
                          <div className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                            <Activity size={12} className="text-teal-500" />
                            <span>Sağlık & Alerji Durumu</span>
                          </div>
                          <div className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                            {selectedStudentForDetail.specialHealthNote || 'Herhangi bir sağlık engeli veya alerjisi bulunmamaktadır.'}
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-1">
                          <div className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                            <FileText size={12} className="text-emerald-500" />
                            <span>İdari & Gelişim Notu</span>
                          </div>
                          <div className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                            {selectedStudentForDetail.notes || 'Sınıf birincisi, kitap okuma, zeka oyunları ve kodlama atölyelerinde yüksek başarı.'}
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                          <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold uppercase">
                            Rehberlik Servisi Görüşü
                          </div>
                          <div className="text-[11px] text-gray-700 dark:text-gray-300 leading-relaxed">
                            Öğrencinin analitik düşünme, hızlı kavrama ve ders içi motivasyonu en üst düzeydedir.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bottom Action Buttons in View Mode */}
                    <div className="pt-2 space-y-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingStudent(true)}
                        className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                      >
                        <Edit3 size={14} />
                        <span>Öğrenci Bilgilerini Düzenle & Güncelle</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          toast.success(`${selectedStudentForDetail.name} öğrencisinin resmi öğrenci belgesi PDF formatında hazırlandı ve indirildi!`)
                        }}
                        className="w-full h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-bold hover:bg-gray-200 transition-colors cursor-pointer text-xs flex items-center justify-center gap-1.5"
                      >
                        <Download size={13} />
                        <span>Öğrenci Belgesi İndir (MEB PDF)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 2: YENİ ÖĞRENCİ EKLE MODALI ── */}
      <AnimatePresence>
        {isNewStudentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewStudentModalOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%', opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.8 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className={`relative w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col z-10 overflow-hidden ${
                theme === 'dark'
                  ? 'bg-[#0E131F] text-white border-t sm:border border-gray-800'
                  : 'bg-white text-gray-900 border-t sm:border border-gray-200'
              }`}
            >
              <div className="pt-3 pb-1 flex justify-center sm:hidden">
                <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
              </div>

              <div className="px-5 pt-3 pb-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-black text-gray-900 dark:text-white">
                  Yeni Öğrenci Kaydı
                </h3>
                <button
                  type="button"
                  onClick={() => setIsNewStudentModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleRegisterStudent} className="p-5 space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">
                    T.C. Kimlik Numarası
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    value={newTcNo}
                    onChange={(e) => setNewTcNo(e.target.value)}
                    placeholder="11 haneli TC kimlik no"
                    className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Adı</label>
                    <input
                      type="text"
                      value={newFirstName}
                      onChange={(e) => setNewFirstName(e.target.value)}
                      placeholder="Öğrenci adı"
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Soyadı</label>
                    <input
                      type="text"
                      value={newLastName}
                      onChange={(e) => setNewLastName(e.target.value)}
                      placeholder="Soyadı"
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">
                      Şube Seçimi
                    </label>
                    <select
                      value={newClassCode}
                      onChange={(e) => setNewClassCode(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                    >
                      <option value="1-A">1-A Şubesi</option>
                      <option value="1-B">1-B Şubesi</option>
                      <option value="2-A">2-A Şubesi</option>
                      <option value="3-A">3-A Şubesi</option>
                      <option value="4-A">4-A Şubesi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">
                      Okul No
                    </label>
                    <input
                      type="text"
                      value={newStudentNo}
                      onChange={(e) => setNewStudentNo(e.target.value)}
                      placeholder="2026-105"
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">
                    Veli Adı & Telefon
                  </label>
                  <input
                    type="text"
                    value={newParentName}
                    onChange={(e) => setNewParentName(e.target.value)}
                    placeholder="Veli Adı Soyadı (örn: Mehmet Yılmaz)"
                    className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-12 mt-2 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
                >
                  Öğrenciyi Sisteme Kaydet
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 3: ŞUBE NAKİL İŞLEMLERİ ── */}
      <AnimatePresence>
        {isTransferModalOpen && studentToTransfer && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTransferModalOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%', opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.8 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className={`relative w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col z-10 overflow-hidden ${
                theme === 'dark'
                  ? 'bg-[#0E131F] text-white border-t sm:border border-gray-800'
                  : 'bg-white text-gray-900 border-t sm:border border-gray-200'
              }`}
            >
              <div className="pt-3 pb-1 flex justify-center sm:hidden">
                <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
              </div>

              <div className="px-5 pt-3 pb-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-black text-gray-900 dark:text-white">
                  Şube Nakil İşlemi
                </h3>
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="p-5 space-y-3.5 text-xs">
                <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-2xl">
                  <div className="font-bold text-gray-500 text-[11px]">Nakil Edilecek Öğrenci:</div>
                  <div className="text-sm font-black text-gray-900 dark:text-white mt-0.5">
                    {studentToTransfer.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    Mevcut Şubesi: <strong className="text-[#10B981]">{studentToTransfer.className}</strong>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">
                    Hedef Şube Seçiniz:
                  </label>
                  <select
                    value={targetTransferClass}
                    onChange={(e) => setTargetTransferClass(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-extrabold text-xs"
                  >
                    {classList.filter(c => c !== 'ALL').map((c) => (
                      <option key={c} value={c}>{c} Şubesi</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmTransfer}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
                >
                  Nakil İşlemini Onayla
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DİĞER MODÜLLER ÇEKMECESİ ── */}
      <MobileAdminMoreSheet
        isOpen={isMoreSheetOpen}
        onClose={() => setIsMoreSheetOpen(false)}
        theme={theme}
        orgSlug={orgSlug}
      />
    </div>
  )

  if (hideHeader) {
    return pageContent
  }

  return (
    <div
      className={`${theme} min-h-[100dvh] w-full bg-[#0A0D15] sm:bg-[#E2E8F0] sm:dark:bg-[#06090F] flex justify-center selection:bg-[#34D399]/30 font-jakarta overscroll-none transition-colors duration-200`}
    >
      <div className="w-full sm:max-w-[390px] min-h-[100dvh] bg-[#F8FAFC] dark:bg-[#0A0D15] sm:shadow-2xl relative flex flex-col pb-24 sm:border-x border-gray-200/60 dark:border-gray-800/80 overflow-x-hidden overscroll-y-none">
        {/* Master Pinned Header */}
        <MobileHeader theme={theme} onToggleTheme={toggleTheme} />

        {/* Page Content */}
        <main className="flex-1 w-full flex flex-col">{pageContent}</main>

        {/* Dedicated Admin Floating Dock (activeTab="student") */}
        {!hideDock && (
          <MobileAdminDock
            activeTab="student"
            onOpenMoreSheet={() => setIsMoreSheetOpen(true)}
            orgSlug={orgSlug}
            theme={theme}
          />
        )}
      </div>
    </div>
  )
}
