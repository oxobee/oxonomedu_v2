'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Phone,
  Mail,
  User,
  GraduationCap,
  Building2,
  Clock,
  Calendar,
  Edit3,
  Eye,
  CheckCircle2,
  ShieldCheck,
  FileText,
  AlertCircle,
  Save,
  Plus,
  School,
  Sparkles,
  Send,
  Bell,
  CreditCard,
  CalendarClock,
  Copy,
  Download,
  Check,
  BookOpen,
  FileCheck,
  Award,
  MessageSquare,
  Wallet,
  MapPin,
  HeartPulse,
  Lock,
  Key,
  Shield,
} from 'lucide-react'
import toast from 'react-hot-toast'
import MobileHeader from '@components/Mobile/MobileHeader'
import MobileAdminDock from './MobileAdminDock'
import MobileAdminMoreSheet from './MobileAdminMoreSheet'
import { useMobileTheme } from '@components/Mobile/useMobileTheme'
import { getOrgTeachers, SCHOOL_ORGS } from '@services/demo/schoolDirectory'

export interface MAdminTeachersClientProps {
  orgSlug?: string
  hideHeader?: boolean
  hideDock?: boolean
}

type DetailTabKey = 'ozluk' | 'gorev' | 'izin' | 'maas' | 'bildirim' | 'belgeler'

export default function MAdminTeachersClient({
  orgSlug,
  hideHeader = false,
  hideDock = false,
}: MAdminTeachersClientProps) {
  const { theme, toggleTheme } = useMobileTheme()
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false)
  const [selectedOrgId, setSelectedOrgId] = useState<number>(30)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('ALL')

  // Modals state
  const [selectedTeacherForDetail, setSelectedTeacherForDetail] = useState<any | null>(null)
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTabKey>('ozluk')
  const [teacherToEdit, setTeacherToEdit] = useState<any | null>(null)
  const [isNewTeacherModalOpen, setIsNewTeacherModalOpen] = useState(false)

  // Notification tab state
  const [notifChannel, setNotifChannel] = useState<'app_sms' | 'app_only' | 'official'>('app_sms')
  const [notifUrgency, setNotifUrgency] = useState<'normal' | 'high' | 'urgent'>('normal')
  const [notifTitle, setNotifTitle] = useState('')
  const [notifMessage, setNotifMessage] = useState('')
  const [sentNotifications, setSentNotifications] = useState<Array<{ id: string; title: string; date: string; channel: string }>>([
    {
      id: 'sn-1',
      title: 'Zümre Toplantısı Hatırlatması',
      date: 'Dün, 16:30',
      channel: 'Mobil Bildirim',
    },
  ])

  // Leave creation state
  const [isAddingLeave, setIsAddingLeave] = useState(false)
  const [newLeaveType, setNewLeaveType] = useState('Mazeret İzni')
  const [newLeaveDuration, setNewLeaveDuration] = useState('1 Gün')
  const [newLeaveReason, setNewLeaveReason] = useState('')
  const [teacherLeavesMap, setTeacherLeavesMap] = useState<
    Record<number, Array<{ id: string; type: string; duration: string; date: string; reason: string; status: string }>>
  >({})

  // Extended Edit Form Fields
  const [editTeacherSection, setEditTeacherSection] = useState<
    'ozluk' | 'gorev' | 'finans'
  >('ozluk')
  const [editName, setEditName] = useState('')
  const [editBranch, setEditBranch] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editMentorClass, setEditMentorClass] = useState('')
  const [editWeeklyHours, setEditWeeklyHours] = useState<number>(24)
  const [editEmploymentType, setEditEmploymentType] = useState<
    'Kadrolu' | 'Sözleşmeli'
  >('Kadrolu')
  const [editWorkingHours, setEditWorkingHours] = useState(
    '08:30 - 15:30 (Pazartesi - Cuma)'
  )
  const [editTcNo, setEditTcNo] = useState('')
  const [editBirthDate, setEditBirthDate] = useState('')
  const [editBloodType, setEditBloodType] = useState('')
  const [editUniversity, setEditUniversity] = useState('')
  const [editGraduationYear, setEditGraduationYear] = useState('')
  const [editSicilNo, setEditSicilNo] = useState('')
  const [editAddress, setEditAddress] = useState('')
  const [editEmergencyContact, setEditEmergencyContact] = useState('')
  const [editEmergencyPhone, setEditEmergencyPhone] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editDutyInfo, setEditDutyInfo] = useState('')
  const [editClub, setEditClub] = useState('')
  const [editAssignedClasses, setEditAssignedClasses] = useState('')
  const [editDegree, setEditDegree] = useState('')
  const [editBaseSalary, setEditBaseSalary] = useState<number>(52450)
  const [editExtraSalary, setEditExtraSalary] = useState<number>(19550)
  const [editBankName, setEditBankName] = useState('')
  const [editIban, setEditIban] = useState('')
  const [editAnnualLeave, setEditAnnualLeave] = useState<number>(16)
  const [editCasualLeave, setEditCasualLeave] = useState<number>(8)

  // Initial teacher dataset
  const [teachersList, setTeachersList] = useState<any[]>(() => {
    return getOrgTeachers(30)
  })

  // New Teacher Modal Form States
  const [newTeacherTab, setNewTeacherTab] = useState<'temel' | 'gorev' | 'ozluk' | 'finans'>('temel')
  const [newName, setNewName] = useState('')
  const [newTcNo, setNewTcNo] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('Ugur2803*')
  const [newPhone, setNewPhone] = useState('')
  const [newBranch, setNewBranch] = useState('Matematik Öğretmeni')
  const [newMentorClass, setNewMentorClass] = useState('9-A')
  const [newEmploymentType, setNewEmploymentType] = useState<'Kadrolu' | 'Sözleşmeli'>('Kadrolu')
  const [newWeeklyHours, setNewWeeklyHours] = useState<number>(30)
  const [newTitle, setNewTitle] = useState('Öğretmen')
  const [newDutyInfo, setNewDutyInfo] = useState('Salı · 1. Kat Koridor')
  const [newClub, setNewClub] = useState('Robotik & Kodlama Kulübü')
  const [newUniversity, setNewUniversity] = useState('')
  const [newGraduationYear, setNewGraduationYear] = useState('')
  const [newSicilNo, setNewSicilNo] = useState('')
  const [newAddress, setNewAddress] = useState('')
  const [newEmergencyContact, setNewEmergencyContact] = useState('')
  const [newEmergencyPhone, setNewEmergencyPhone] = useState('')
  const [newBankName, setNewBankName] = useState('Vakıfbank')
  const [newIban, setNewIban] = useState('')
  const [newBaseSalary, setNewBaseSalary] = useState<number>(55000)
  const [newExtraSalary, setNewExtraSalary] = useState<number>(18000)
  const [newAnnualLeave, setNewAnnualLeave] = useState<number>(20)
  const [newCreatedCredentials, setNewCreatedCredentials] = useState<{ email: string; pass: string; name: string } | null>(null)

  const handleNameChange = (val: string) => {
    setNewName(val)
    if (!newEmail || newEmail.endsWith('@oxonom.com')) {
      const slug = val
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]/g, '.')
        .replace(/\.+/g, '.')
        .replace(/^\.|\.$/g, '')
      if (slug) {
        setNewEmail(`${slug}@oxonom.com`)
      }
    }
  }

  const resetNewTeacherForm = () => {
    setNewTeacherTab('temel')
    setNewName('')
    setNewTcNo('')
    setNewEmail('')
    setNewPassword('Ugur2803*')
    setNewPhone('')
    setNewBranch('Matematik Öğretmeni')
    setNewMentorClass('9-A')
    setNewEmploymentType('Kadrolu')
    setNewWeeklyHours(30)
    setNewTitle('Öğretmen')
    setNewDutyInfo('Salı · 1. Kat Koridor')
    setNewClub('Robotik & Kodlama Kulübü')
    setNewUniversity('')
    setNewGraduationYear('')
    setNewSicilNo('')
    setNewAddress('')
    setNewEmergencyContact('')
    setNewEmergencyPhone('')
    setNewBankName('Vakıfbank')
    setNewIban('')
    setNewBaseSalary(55000)
    setNewExtraSalary(18000)
    setNewAnnualLeave(20)
    setNewCreatedCredentials(null)
  }

  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) {
      toast.error('Lütfen öğretmen ad ve soyadını giriniz.')
      setNewTeacherTab('temel')
      return
    }
    if (!newTcNo.trim() || newTcNo.length < 11) {
      toast.error('Lütfen 11 haneli geçerli bir TC Kimlik Numarası giriniz.')
      setNewTeacherTab('temel')
      return
    }
    if (!newEmail.trim()) {
      toast.error('Lütfen kurumsal e-posta adresini giriniz.')
      setNewTeacherTab('temel')
      return
    }

    const assignedEmail = newEmail.toLowerCase().trim()
    const assignedPassword = newPassword || 'Ugur2803*'
    const newTeacherId = Date.now()

    const newTeacherObj = {
      id: newTeacherId,
      name: newName.trim(),
      tcNo: newTcNo.trim(),
      email: assignedEmail,
      password: assignedPassword,
      phone: newPhone.trim() || '+90 532 000 0000',
      branch: newBranch.trim() || 'Öğretmen',
      mentorClass: newMentorClass || '9-A',
      assignedClasses: [newMentorClass || '9-A'],
      employmentType: newEmploymentType,
      weeklyHours: newWeeklyHours || 30,
      title: newTitle || 'Öğretmen',
      dutyInfo: newDutyInfo || 'Belirlenmedi',
      club: newClub || 'Belirlenmedi',
      university: newUniversity || 'Belirtilmedi (Öğretmen Tarafından Doldurulacak)',
      graduationYear: newGraduationYear || '',
      sicilNo: newSicilNo || `MEB-${Math.floor(10000000 + Math.random() * 90000000)}`,
      address: newAddress || 'Belirtilmedi (Öğretmen Tarafından Doldurulacak)',
      emergencyContact: newEmergencyContact || 'Belirtilmedi',
      emergencyPhone: newEmergencyPhone || '',
      bankName: newBankName || 'Vakıfbank',
      iban: newIban || '',
      baseSalary: newBaseSalary,
      extraSalary: newExtraSalary,
      annualLeave: newAnnualLeave,
      casualLeave: 8,
      status: 'active',
      isFirstLogin: true,
      profileCompleted: false,
      documents: [],
      leaves: [],
    }

    const updatedList = [newTeacherObj, ...teachersList]
    setTeachersList(updatedList)

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`oxonom_admin_teachers_${selectedOrgId}`, JSON.stringify(updatedList))
        const regRaw = localStorage.getItem('oxonom_registered_teachers')
        const registeredList = regRaw ? JSON.parse(regRaw) : []
        const filtered = registeredList.filter((t: any) => t.email !== assignedEmail)
        filtered.push({
          id: newTeacherId,
          name: newTeacherObj.name,
          email: assignedEmail,
          username: assignedEmail.split('@')[0],
          password: assignedPassword,
          tcNo: newTeacherObj.tcNo,
          branch: newTeacherObj.branch,
          phone: newTeacherObj.phone,
          isFirstLogin: true,
          profileCompleted: false,
        })
        localStorage.setItem('oxonom_registered_teachers', JSON.stringify(filtered))
      } catch (_) {}
    }

    setNewCreatedCredentials({
      name: newTeacherObj.name,
      email: assignedEmail,
      pass: assignedPassword,
    })
    toast.success(`${newTeacherObj.name} başarıyla sisteme eklendi!`, { duration: 4000 })
  }

  // Sync when school changes or load overrides
  useEffect(() => {
    const defaultList = getOrgTeachers(selectedOrgId)
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(
          `oxonom_admin_teachers_${selectedOrgId}`
        )
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTeachersList(parsed)
            return
          }
        }
      } catch (_) {}
    }
    setTeachersList(defaultList)
  }, [selectedOrgId])

  // Open Edit Modal with selected teacher data pre-filling all fields
  const handleOpenEdit = (teacher: any) => {
    setTeacherToEdit(teacher)
    setEditTeacherSection('ozluk')
    setEditName(teacher.name || '')
    setEditBranch(teacher.branch || '')
    setEditPhone(teacher.phone || '')
    setEditEmail(teacher.email || '')
    setEditMentorClass(teacher.mentorClass || '1-A')
    setEditWeeklyHours(teacher.weeklyHours || 24)
    setEditEmploymentType(teacher.employmentType || 'Kadrolu')
    setEditWorkingHours(
      teacher.workingHours || '08:30 - 15:30 (Pazartesi - Cuma)'
    )
    setEditTcNo(teacher.tcNo || '29182736401')
    setEditBirthDate(teacher.birthDate || '14.05.1989 (37 Yaşında)')
    setEditBloodType(teacher.bloodType || 'A Rh+')
    setEditUniversity(
      teacher.university ||
        'İstanbul Üniversitesi / Hasan Ali Yücel Eğitim Fakültesi'
    )
    setEditGraduationYear(teacher.graduationYear || '2016')
    setEditSicilNo(teacher.sicilNo || 'MEB-34019284')
    setEditAddress(teacher.address || 'Kadıköy / İstanbul')
    setEditEmergencyContact(teacher.emergencyContact || 'Eşi')
    setEditEmergencyPhone(teacher.emergencyPhone || '+90 532 111 2233')
    setEditTitle(teacher.title || 'Uzman Öğretmen (9 Yıl)')
    setEditDutyInfo(
      teacher.dutyInfo || 'Salı · 1. Kat Koridor & Bahçe Kapısı'
    )
    setEditClub(teacher.club || 'Satranç ve Akıl Oyunları Kulübü')
    setEditAssignedClasses(
      Array.isArray(teacher.assignedClasses)
        ? teacher.assignedClasses.join(', ')
        : teacher.assignedClasses || teacher.mentorClass || '1-A'
    )
    setEditDegree(teacher.degree || '1/4 Derece · Uzman')
    setEditBaseSalary(teacher.baseSalary ?? 52450)
    setEditExtraSalary(teacher.extraSalary ?? 19550)
    setEditBankName(teacher.bankName || 'Vakıfbank Kadıköy Şubesi')
    setEditIban(teacher.iban || 'TR45 0001 5001 5800 7392 1891 02')
    setEditAnnualLeave(teacher.annualLeave ?? 16)
    setEditCasualLeave(teacher.casualLeave ?? 8)
  }

  // Save Edit Changes - Updates ALL fields
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!teacherToEdit) return

    const parsedAssigned = editAssignedClasses
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const updatedTeacher = {
      name: editName,
      branch: editBranch,
      phone: editPhone,
      email: editEmail,
      mentorClass: editMentorClass,
      assignedClasses:
        parsedAssigned.length > 0 ? parsedAssigned : [editMentorClass],
      weeklyHours: editWeeklyHours,
      employmentType: editEmploymentType,
      workingHours: editWorkingHours,
      tcNo: editTcNo,
      birthDate: editBirthDate,
      bloodType: editBloodType,
      university: editUniversity,
      graduationYear: editGraduationYear,
      sicilNo: editSicilNo,
      address: editAddress,
      emergencyContact: editEmergencyContact,
      emergencyPhone: editEmergencyPhone,
      title: editTitle,
      dutyInfo: editDutyInfo,
      club: editClub,
      degree: editDegree,
      baseSalary: editBaseSalary,
      extraSalary: editExtraSalary,
      bankName: editBankName,
      iban: editIban,
      annualLeave: editAnnualLeave,
      casualLeave: editCasualLeave,
    }

    const updatedList = teachersList.map((t) => {
      if (t.id === teacherToEdit.id) {
        return {
          ...t,
          ...updatedTeacher,
        }
      }
      return t
    })

    setTeachersList(updatedList)

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          `oxonom_admin_teachers_${selectedOrgId}`,
          JSON.stringify(updatedList)
        )
      } catch (_) {}
    }

    toast.success(
      `${editName} öğretmeninin tüm bilgileri başarıyla güncellendi!`
    )
    setTeacherToEdit(null)
    if (selectedTeacherForDetail?.id === teacherToEdit.id) {
      setSelectedTeacherForDetail({
        ...selectedTeacherForDetail,
        ...updatedTeacher,
      })
    }
  }

  // Current teacher leave records
  const currentTeacherLeaves = useMemo(() => {
    if (!selectedTeacherForDetail) return []
    const custom = teacherLeavesMap[selectedTeacherForDetail.id]
    if (custom) return custom
    return [
      {
        id: 'l1',
        type: 'Mazeret İzni',
        duration: '1 Gün',
        date: '12.02.2026',
        reason: 'Ailevi mazeret izni',
        status: 'Onaylandı',
      },
      {
        id: 'l2',
        type: 'Hizmetiçi Eğitim İzni',
        duration: '2 Gün',
        date: '24.11.2025',
        reason: 'MEB ÖBA Dijital Eğitim Semineri',
        status: 'Onaylandı',
      },
      {
        id: 'l3',
        type: 'Sağlık Raporu',
        duration: '2 Gün',
        date: '10.10.2025',
        reason: 'Devlet Hastanesi KBB İstirahat',
        status: 'Raporlu',
      },
    ]
  }, [selectedTeacherForDetail, teacherLeavesMap])

  // Handle send notification
  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault()
    if (!notifTitle.trim() || !notifMessage.trim()) {
      toast.error('Lütfen bildirim başlığı ve mesaj metnini doldurunuz.')
      return
    }
    const channelName =
      notifChannel === 'app_sms'
        ? 'Mobil + SMS'
        : notifChannel === 'app_only'
        ? 'Mobil Bildirim'
        : 'Resmi Tebligat'
    setSentNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: notifTitle,
        date: 'Az önce',
        channel: channelName,
      },
      ...prev,
    ])
    toast.success(
      `${selectedTeacherForDetail?.name || 'Öğretmene'} anlık bildirim iletildi!`
    )
    setNotifTitle('')
    setNotifMessage('')
  }

  // Handle copy IBAN
  const handleCopyIban = (iban: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(iban)
    }
    toast.success('IBAN panoya kopyalandı!')
  }

  // Handle download payroll
  const handleDownloadPayroll = (month: string) => {
    toast.success(`${month} e-bordrosu PDF olarak indiriliyor...`)
  }

  // Handle create leave
  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeacherForDetail) return
    const newRecord = {
      id: `leave-${Date.now()}`,
      type: newLeaveType,
      duration: newLeaveDuration,
      date: new Date().toLocaleDateString('tr-TR'),
      reason: newLeaveReason || 'İdare Tarafından Onaylandı',
      status: 'Onaylandı',
    }
    setTeacherLeavesMap((prev) => ({
      ...prev,
      [selectedTeacherForDetail.id]: [
        newRecord,
        ...(prev[selectedTeacherForDetail.id] || [
          {
            id: 'l1',
            type: 'Mazeret İzni',
            duration: '1 Gün',
            date: '12.02.2026',
            reason: 'Ailevi mazeret izni',
            status: 'Onaylandı',
          },
          {
            id: 'l2',
            type: 'Hizmetiçi Eğitim İzni',
            duration: '2 Gün',
            date: '24.11.2025',
            reason: 'MEB ÖBA Dijital Eğitim Semineri',
            status: 'Onaylandı',
          },
        ]),
      ],
    }))
    toast.success(
      `${selectedTeacherForDetail.name} adına ${newLeaveType} tanımlandı ve onaylandı!`
    )
    setIsAddingLeave(false)
    setNewLeaveReason('')
  }

  // Handle upload document
  const handleUploadDocument = () => {
    toast.success('Özlük belgesi sisteme başarıyla yüklendi ve arşivlendi!')
  }

  // Filtered teachers
  const filteredTeachers = useMemo(() => {
    return teachersList.filter((t) => {
      if (selectedBranchFilter !== 'ALL' && t.branch !== selectedBranchFilter) {
        return false
      }
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        t.name.toLowerCase().includes(q) ||
        t.branch.toLowerCase().includes(q) ||
        (t.mentorClass && t.mentorClass.toLowerCase().includes(q)) ||
        t.email.toLowerCase().includes(q) ||
        t.phone.includes(q)
      )
    })
  }, [teachersList, selectedBranchFilter, searchQuery])

  const getUrl = (path: string) => {
    return orgSlug ? `/orgs/${orgSlug}${path}` : path
  }

  const activeOrg = SCHOOL_ORGS.find((o) => o.id === selectedOrgId) || SCHOOL_ORGS[0]

  const pageContent = (
    <div className="flex flex-col flex-1 w-full pb-6">
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
                <Briefcase size={13} className="text-[#34D399] shrink-0" />
                <span className="truncate">Öğretmen Yönetimi</span>
              </span>
            </nav>
          </div>

          <span className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-black shrink-0 border border-blue-200/50">
            {teachersList.length} Öğretmen
          </span>
        </div>

        {/* ── 2. KURUM VERİTABANI VE İZOLASYON ALANI ── */}
        <section className="px-4 mt-3">
          <div className="flex items-center justify-between p-2.5 px-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/20 dark:border-emerald-500/30">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs">
                <School size={16} />
              </span>
              <div>
                <div className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                  <span>Oxonom Okulları</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black">Aktif Kurum</span>
                </div>
                <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                  1 Sınıf
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. SEARCH & ADD BAR ── */}
        <section className="px-4 mt-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Öğretmen adı, branş veya e-posta ara..."
                className={`w-full h-11 pl-9 pr-3.5 rounded-2xl text-xs font-medium outline-hidden transition-all ${
                  theme === 'dark'
                    ? 'bg-[#121826] text-white placeholder-gray-500 border border-gray-800 focus:border-[#34D399]/60'
                    : 'bg-white text-gray-900 placeholder-gray-400 border border-gray-200/90 focus:border-[#10B981] shadow-xs'
                }`}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                resetNewTeacherForm()
                setIsNewTeacherModalOpen(true)
              }}
              className="h-11 px-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Yeni Ekle</span>
            </button>
          </div>
        </section>

        {/* ── 4. TEACHER CARDS LIST ── */}
        <section className="px-4 mt-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold px-1">
            <span>Kayıtlı Öğretmen Kadrosu ({filteredTeachers.length})</span>
            <span>{activeOrg.name}</span>
          </div>

          {filteredTeachers.map((teacher) => (
            <motion.div
              key={teacher.id}
              whileTap={{ scale: 0.99 }}
              onClick={() => setSelectedTeacherForDetail(teacher)}
              className="bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800/80 rounded-2xl p-3.5 shadow-xs transition-all hover:border-[#34D399]/40 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                {/* Avatar & Main Info */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/15 text-blue-700 dark:text-blue-300 font-black text-xs flex items-center justify-center border border-blue-500/20">
                      {teacher.name
                        .split(' ')
                        .map((p: string) => p[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#121826]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs font-black text-gray-900 dark:text-white truncate">
                        {teacher.name}
                      </h4>
                      <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/40">
                        {teacher.employmentType || 'Kadrolu'}
                      </span>
                    </div>

                    <div className="text-[11px] text-gray-600 dark:text-gray-300 font-semibold mt-0.5 truncate">
                      {teacher.branch}
                      {teacher.mentorClass ? ` · ${teacher.mentorClass} Rehberliği` : ''}
                    </div>

                    <div className="flex items-center gap-2 text-[10.5px] text-gray-400 mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        <span>{teacher.weeklyHours || 24} Saat/Hafta</span>
                      </span>
                      <span>·</span>
                      <span className="truncate">{teacher.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Edit & Detail Buttons */}
                <div className="shrink-0 flex items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenEdit(teacher)
                    }}
                    className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center transition-colors cursor-pointer"
                    title="Bilgileri Düzenle"
                  >
                    <Edit3 size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedTeacherForDetail(teacher)
                    }}
                    className="w-8 h-8 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-colors cursor-pointer"
                    title="Detayları İncele"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredTeachers.length === 0 && (
            <div className="py-12 text-center text-xs text-gray-400 bg-white dark:bg-[#121826] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              Arama kriterlerine uygun öğretmen bulunamadı.
            </div>
          )}
        </section>
      </motion.div>

      {/* ── MODAL 1: ÖĞRETMEN TÜM DETAYLARI MODALI (KATEGORİK VE SEKME BAZLI) ── */}
      <AnimatePresence>
        {selectedTeacherForDetail && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTeacherForDetail(null)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%', opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.8 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className={`relative w-full sm:max-w-md max-h-[90vh] rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col z-10 overflow-hidden ${
                theme === 'dark'
                  ? 'bg-[#0E131F] text-white border-t sm:border border-gray-800'
                  : 'bg-white text-gray-900 border-t sm:border border-gray-200'
              }`}
            >
              <div className="pt-3 pb-1 flex justify-center sm:hidden">
                <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
              </div>

              {/* Title Bar & Quick Profile */}
              <div className="px-4 sm:px-5 pt-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-sm">
                        {selectedTeacherForDetail.name
                          .split(' ')
                          .map((p: string) => p[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0E131F]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white truncate">
                          {selectedTeacherForDetail.name}
                        </h3>
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/40">
                          {selectedTeacherForDetail.employmentType || 'Kadrolu'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold truncate mt-0.5">
                        {selectedTeacherForDetail.branch}
                        {selectedTeacherForDetail.mentorClass
                          ? ` · ${selectedTeacherForDetail.mentorClass} Rehberi`
                          : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const t = selectedTeacherForDetail
                        handleOpenEdit(t)
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      title="Öğretmen Bilgilerini Düzenle"
                    >
                      <Edit3 size={13} />
                      <span>Düzenle</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTeacherForDetail(null)}
                      className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>

                {/* ── KATEGORİSEL SEKMELER PİLLS ── */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-3 -mx-1 px-1">
                  {[
                    { id: 'ozluk', label: 'Özlük & Künye', icon: User },
                    { id: 'gorev', label: 'Görev & Dersler', icon: Briefcase },
                    { id: 'izin', label: 'İzin Talepleri', icon: CalendarClock },
                    { id: 'maas', label: 'Maaş & Bordro', icon: CreditCard },
                    { id: 'bildirim', label: 'Bildirim Gönder', icon: Bell },
                    { id: 'belgeler', label: 'Özlük Belgeleri', icon: FileCheck },
                  ].map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeDetailTab === tab.id
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveDetailTab(tab.id as DetailTabKey)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#10B981] text-white shadow-sm shadow-emerald-500/20'
                            : 'bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon size={12} className={isActive ? 'text-white' : 'text-gray-400'} />
                        <span>{tab.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Scrollable Tab Body */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs">
                {/* ── SEKME 1: ÖZLÜK & KÜNYE ── */}
                {activeDetailTab === 'ozluk' && (
                  <div className="space-y-3">
                    {/* Hızlı İletişim Butonları */}
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`tel:${selectedTeacherForDetail.phone}`}
                        className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
                      >
                        <Phone size={14} />
                        <span>Telefonla Ara</span>
                      </a>
                      <a
                        href={`mailto:${selectedTeacherForDetail.email}`}
                        className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors truncate"
                      >
                        <Mail size={14} />
                        <span className="truncate">E-Posta Gönder</span>
                      </a>
                    </div>

                    {/* Bilgi Listesi */}
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                        <span className="text-gray-500 font-bold">T.C. Kimlik No</span>
                        <span className="font-extrabold text-gray-900 dark:text-white">
                          {selectedTeacherForDetail.tcNo || '29182736401'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                        <span className="text-gray-500 font-bold">Doğum Tarihi & Yaş</span>
                        <span className="font-extrabold text-gray-900 dark:text-white">
                          {selectedTeacherForDetail.birthDate || '14.05.1989 (37 Yaşında)'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                        <span className="text-gray-500 font-bold">Kan Grubu</span>
                        <span className="font-extrabold text-rose-600 dark:text-rose-400">
                          {selectedTeacherForDetail.bloodType || 'A Rh+'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                        <span className="text-gray-500 font-bold">Mezuniyet & Fakülte</span>
                        <span className="font-extrabold text-gray-900 dark:text-white text-right">
                          {selectedTeacherForDetail.university ||
                            'İstanbul Üniversitesi / Hasan Ali Yücel Eğitim Fakültesi'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                        <span className="text-gray-500 font-bold">Mezuniyet Yılı & Diploma</span>
                        <span className="font-extrabold text-gray-900 dark:text-white">
                          {selectedTeacherForDetail.graduationYear || '2016'} · DIP-84920
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                        <span className="text-gray-500 font-bold">MEBBİS Sicil No</span>
                        <span className="font-extrabold text-gray-900 dark:text-white">
                          {selectedTeacherForDetail.sicilNo || 'MEB-34019284'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                        <span className="text-gray-500 font-bold">İkametgah Adresi</span>
                        <span className="font-extrabold text-gray-900 dark:text-white text-right">
                          {selectedTeacherForDetail.address || 'Kadıköy / İstanbul'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                        <span className="text-gray-500 font-bold">Acil Durum İletişim</span>
                        <span className="font-extrabold text-gray-900 dark:text-white text-right">
                          {selectedTeacherForDetail.emergencyContact || 'Eşi'} ·{' '}
                          {selectedTeacherForDetail.emergencyPhone || '+90 532 111 2233'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── SEKME 2: GÖREV & DERSLER ── */}
                {activeDetailTab === 'gorev' && (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                          Akademik Görevlendirme
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                          Aktif
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-[10px] text-gray-500 font-bold">Branş & Unvan</div>
                          <div className="font-black text-gray-900 dark:text-white mt-0.5 truncate">
                            {selectedTeacherForDetail.branch}
                          </div>
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                            {selectedTeacherForDetail.title || 'Uzman Öğretmen (9 Yıl)'}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-500 font-bold">Kadro Şekli</div>
                          <div className="font-black text-gray-900 dark:text-white mt-0.5">
                            {selectedTeacherForDetail.employmentType || 'Kadrolu'}
                          </div>
                          <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                            MEB Kadrosu
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                        <span className="text-gray-500 font-bold">Sınıf Rehberliği</span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                          {selectedTeacherForDetail.mentorClass || '1-A'} Şubesi
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                        <span className="text-gray-500 font-bold">Haftalık Toplam Ders</span>
                        <span className="font-extrabold text-gray-900 dark:text-white">
                          {selectedTeacherForDetail.weeklyHours || 24} Saat / Hafta
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                        <span className="text-gray-500 font-bold">Ders Dağılımı</span>
                        <span className="font-extrabold text-gray-900 dark:text-white">
                          15 Saat Maaş Karşılığı +{' '}
                          {Math.max(0, (selectedTeacherForDetail.weeklyHours || 24) - 15)} Saat Ek
                          Ders
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                        <span className="text-gray-500 font-bold">Girdiği Şubeler</span>
                        <span className="font-extrabold text-gray-900 dark:text-white">
                          {(
                            selectedTeacherForDetail.assignedClasses || [
                              selectedTeacherForDetail.mentorClass || '1-A',
                            ]
                          ).join(', ')}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                        <span className="text-gray-500 font-bold">Haftalık Nöbet Günü & Yeri</span>
                        <span className="font-extrabold text-purple-600 dark:text-purple-400 text-right">
                          {selectedTeacherForDetail.dutyInfo || 'Salı · 1. Kat Koridor & Bahçe Kapısı'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                        <span className="text-gray-500 font-bold">Kulüp Danışmanlığı</span>
                        <span className="font-extrabold text-gray-900 dark:text-white text-right">
                          {selectedTeacherForDetail.club || 'Satranç ve Akıl Oyunları Kulübü'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                        <span className="text-gray-500 font-bold">Mesai Saatleri</span>
                        <span className="font-extrabold text-gray-900 dark:text-white text-right">
                          {selectedTeacherForDetail.workingHours ||
                            '08:30 - 15:30 (Pazartesi - Cuma)'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── SEKME 3: İZİN TALEPLERİ & DEVAMSIZLIK ── */}
                {activeDetailTab === 'izin' && (
                  <div className="space-y-3">
                    {/* İzin Sayaçları */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-900/50">
                        <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
                          {selectedTeacherForDetail.annualLeave ?? 16}
                        </div>
                        <div className="text-[10px] font-bold text-gray-500 mt-0.5">
                          Kalan Yıllık İzin
                        </div>
                        <div className="text-[9px] text-gray-400 font-semibold">(20 Gün Hak)</div>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-900/50">
                        <div className="text-base font-black text-blue-600 dark:text-blue-400">
                          {selectedTeacherForDetail.casualLeave ?? 8}
                        </div>
                        <div className="text-[10px] font-bold text-gray-500 mt-0.5">
                          Mazeret İzni
                        </div>
                        <div className="text-[9px] text-gray-400 font-semibold">(10 Gün Hak)</div>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/50 dark:border-purple-900/50">
                        <div className="text-base font-black text-purple-600 dark:text-purple-400">
                          2 Gün
                        </div>
                        <div className="text-[10px] font-bold text-gray-500 mt-0.5">
                          Sağlık Raporu
                        </div>
                        <div className="text-[9px] text-gray-400 font-semibold">(Bu Dönem)</div>
                      </div>
                    </div>

                    {/* İdare İzin Tanımlama Formu */}
                    <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-3 bg-gray-50/50 dark:bg-[#121826]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                          <CalendarClock size={13} className="text-[#10B981]" />
                          <span>İdare İzin Tanımlama</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsAddingLeave(!isAddingLeave)}
                          className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Plus size={12} />
                          <span>{isAddingLeave ? 'Vazgeç' : 'Yeni İzin Ekle'}</span>
                        </button>
                      </div>

                      {isAddingLeave && (
                        <form
                          onSubmit={handleCreateLeave}
                          className="mt-3 space-y-2.5 pt-2.5 border-t border-gray-200 dark:border-gray-800"
                        >
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 mb-1">
                                İzin Türü
                              </label>
                              <select
                                value={newLeaveType}
                                onChange={(e) => setNewLeaveType(e.target.value)}
                                className="w-full h-9 px-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-xs"
                              >
                                <option value="Mazeret İzni">Mazeret İzni</option>
                                <option value="Yıllık İzin">Yıllık İzin</option>
                                <option value="Sağlık Raporu">Sağlık Raporu</option>
                                <option value="İdari İzin">İdari İzin</option>
                                <option value="Hizmetiçi Eğitim">Hizmetiçi Eğitim</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 mb-1">
                                Süre
                              </label>
                              <select
                                value={newLeaveDuration}
                                onChange={(e) => setNewLeaveDuration(e.target.value)}
                                className="w-full h-9 px-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-xs"
                              >
                                <option value="1 Gün">1 Gün</option>
                                <option value="2 Gün">2 Gün</option>
                                <option value="3 Gün">3 Gün</option>
                                <option value="5 Gün">5 Gün</option>
                                <option value="1 Hafta">1 Hafta</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 mb-1">
                              Mazeret Açıklaması / Not
                            </label>
                            <input
                              type="text"
                              value={newLeaveReason}
                              onChange={(e) => setNewLeaveReason(e.target.value)}
                              placeholder="Örn: Ailevi mazeret, seminer katılımı..."
                              className="w-full h-9 px-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium text-xs"
                            />
                          </div>
                          <button
                            type="submit"
                            className="w-full h-9 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-black text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Check size={13} />
                            <span>İzni Kaydet ve Onayla</span>
                          </button>
                        </form>
                      )}
                    </div>

                    {/* İzin Geçmişi Listesi */}
                    <div>
                      <div className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-2">
                        Son İzin ve Rapor Geçmişi ({currentTeacherLeaves.length})
                      </div>
                      <div className="space-y-1.5">
                        {currentTeacherLeaves.map((l) => (
                          <div
                            key={l.id}
                            className="p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121826] flex items-center justify-between"
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-gray-900 dark:text-white text-xs">
                                  {l.type}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400">
                                  · {l.duration}
                                </span>
                              </div>
                              <div className="text-[10.5px] text-gray-500 dark:text-gray-400 mt-0.5">
                                {l.date} — {l.reason}
                              </div>
                            </div>
                            <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/50">
                              {l.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── SEKME 4: MAAŞ & BORDRO / FİNANS ── */}
                {activeDetailTab === 'maas' && (
                  <div className="space-y-3">
                    {/* Maaş Özeti Kartı */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider">
                          Aylık Net Tahakkuk
                        </span>
                        <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full">
                          {selectedTeacherForDetail.degree || '1/4 Derece · Uzman'}
                        </span>
                      </div>
                      <div className="text-2xl font-black mt-2">
                        ₺{((selectedTeacherForDetail.baseSalary ?? 52450) + (selectedTeacherForDetail.extraSalary ?? 19550)).toLocaleString('tr-TR')}{' '}
                        <span className="text-xs font-semibold text-emerald-100">/ Net</span>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-white/20 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-[10px] text-emerald-200 font-semibold">
                            Net Taban Maaş
                          </div>
                          <div className="font-bold">₺{(selectedTeacherForDetail.baseSalary ?? 52450).toLocaleString('tr-TR')}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-emerald-200 font-semibold">
                            Ek Ders + Tazminat
                          </div>
                          <div className="font-bold">₺{(selectedTeacherForDetail.extraSalary ?? 19550).toLocaleString('tr-TR')}</div>
                        </div>
                      </div>
                    </div>

                    {/* Banka & IBAN */}
                    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 font-bold">Maaş Bankası</span>
                        <span className="font-extrabold text-gray-900 dark:text-white">
                          {selectedTeacherForDetail.bankName || 'Vakıfbank Kadıköy Şubesi'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 font-bold">IBAN No</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                            {selectedTeacherForDetail.iban || 'TR45 0001 5001 5800 7392 1891 02'}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyIban(selectedTeacherForDetail.iban || 'TR45 0001 5001 5800 7392 1891 02')
                            }
                            className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                            title="IBAN Kopyala"
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* E-Bordro Arşivi */}
                    <div>
                      <div className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-2">
                        E-Bordro Geçmişi (Son 3 Ay)
                      </div>
                      <div className="space-y-1.5">
                        {[
                          { month: 'Mart 2026', size: '420 KB', amount: '₺72.000' },
                          { month: 'Şubat 2026', size: '418 KB', amount: '₺71.450' },
                          { month: 'Ocak 2026', size: '415 KB', amount: '₺68.900' },
                        ].map((b, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs bg-white dark:bg-[#121826]"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                <FileText size={15} />
                              </div>
                              <div>
                                <div className="font-extrabold text-gray-900 dark:text-white">
                                  {b.month} Bordrosu
                                </div>
                                <div className="text-[10px] text-gray-400 font-medium">
                                  {b.amount} · {b.size} · Onaylı
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDownloadPayroll(b.month)}
                              className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              <Download size={12} />
                              <span>İndir</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── SEKME 5: BİLDİRİM GÖNDER ── */}
                {activeDetailTab === 'bildirim' && (
                  <div className="space-y-3">
                    <form onSubmit={handleSendNotification} className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1">
                            Gönderim Kanalı
                          </label>
                          <select
                            value={notifChannel}
                            onChange={(e) => setNotifChannel(e.target.value as any)}
                            className="w-full h-9 px-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-xs"
                          >
                            <option value="app_sms">Mobil + SMS</option>
                            <option value="app_only">Yalnızca Mobil Bildirim</option>
                            <option value="official">Resmi İdari Tebligat</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1">
                            Aciliyet Düzeyi
                          </label>
                          <select
                            value={notifUrgency}
                            onChange={(e) => setNotifUrgency(e.target.value as any)}
                            className="w-full h-9 px-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-xs"
                          >
                            <option value="normal">Normal</option>
                            <option value="high">Yüksek Öncelikli</option>
                            <option value="urgent">Kritik / Acil</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">
                          Hızlı Mesaj Şablonları
                        </label>
                        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                          {[
                            {
                              title: 'Ders Programı Değişikliği',
                              msg: 'Haftalık ders programınızda güncelleme yapılmıştır. Lütfen portalınızdan kontrol ediniz.',
                            },
                            {
                              title: 'Zümre Toplantısı Uyarısı',
                              msg: 'Yarın saat 15:40’ta Öğretmenler Odasında Zümre Kurulu toplantısı yapılacaktır.',
                            },
                            {
                              title: 'Nöbet Görevi Hatırlatması',
                              msg: 'Yarınki nöbet görevinizi saat 08:15’te teslim almayı unutmayınız.',
                            },
                            {
                              title: 'Yazılı Sınav Evrakları',
                              msg: 'Dönem ortak sınavı soru ve cevap anahtarlarının idareye teslimi için son 2 gün.',
                            },
                          ].map((tmpl, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setNotifTitle(tmpl.title)
                                setNotifMessage(tmpl.msg)
                              }}
                              className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-[10px] font-bold text-gray-700 dark:text-gray-300 shrink-0 transition-colors cursor-pointer"
                            >
                              + {tmpl.title}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">
                          Bildirim Başlığı
                        </label>
                        <input
                          type="text"
                          value={notifTitle}
                          onChange={(e) => setNotifTitle(e.target.value)}
                          placeholder="Örn: Haftalık Ders Programı Güncellemesi"
                          className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-xs"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">
                          Mesaj Metni
                        </label>
                        <textarea
                          rows={3}
                          value={notifMessage}
                          onChange={(e) => setNotifMessage(e.target.value)}
                          placeholder="Öğretmene iletilecek mesajınızı buraya yazın..."
                          className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium text-xs resize-none"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full h-11 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Send size={14} />
                        <span>Öğretmene Anlık Bildirim Gönder</span>
                      </button>
                    </form>

                    {sentNotifications.length > 0 && (
                      <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                        <div className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-2">
                          Gönderilen Bildirim Geçmişi ({sentNotifications.length})
                        </div>
                        <div className="space-y-1.5">
                          {sentNotifications.map((sn) => (
                            <div
                              key={sn.id}
                              className="p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#121826] flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <Bell size={13} className="text-emerald-500 shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <div className="font-bold text-gray-900 dark:text-white truncate">
                                    {sn.title}
                                  </div>
                                  <div className="text-[10px] text-gray-400">
                                    {sn.channel} · {sn.date}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                                İletildi
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── SEKME 6: ÖZLÜK BELGELERİ & ARŞİV ── */}
                {activeDetailTab === 'belgeler' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-black text-gray-500 uppercase tracking-wider">
                        MEBBİS & Kurum Arşiv Belgeleri (5)
                      </div>
                      <button
                        type="button"
                        onClick={handleUploadDocument}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus size={11} />
                        <span>Yeni Belge Yükle</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {[
                        {
                          name: 'Lisans Diploması & Not Dökümü (Transkript)',
                          type: 'PDF · 2.1 MB',
                          status: 'Onaylı',
                          isShield: false,
                        },
                        {
                          name: 'Pedagojik Formasyon Sertifikası',
                          type: 'PDF · 1.4 MB',
                          status: 'Onaylı',
                          isShield: false,
                        },
                        {
                          name: 'Adli Sicil ve Arşiv Kayıt Belgesi (E-Devlet Barkodlu)',
                          type: 'PDF · 650 KB',
                          status: 'Doğrulandı',
                          isShield: true,
                        },
                        {
                          name: 'Sağlık Kurulu Heyet Raporu (Öğretmenlik)',
                          type: 'PDF · 1.2 MB',
                          status: 'Onaylı',
                          isShield: true,
                        },
                        {
                          name: 'Hizmet Sözleşmesi & SGK İşe Giriş Bildirgesi',
                          type: 'PDF · 890 KB',
                          status: 'İmzalı',
                          isShield: false,
                        },
                      ].map((doc, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs bg-white dark:bg-[#121826]"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            {doc.isShield ? (
                              <ShieldCheck size={16} className="text-blue-500 shrink-0" />
                            ) : (
                              <FileCheck size={16} className="text-emerald-500 shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="font-extrabold text-gray-900 dark:text-white truncate">
                                {doc.name}
                              </div>
                              <div className="text-[10px] text-gray-400 font-medium">
                                {doc.type}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/50 shrink-0 ml-2">
                            {doc.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 2: ÖĞRETMEN BİLGİLERİNİ DÜZENLE MODALI ── */}
      <AnimatePresence>
        {teacherToEdit && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTeacherToEdit(null)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%', opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.8 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className={`relative w-full sm:max-w-md max-h-[90vh] rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col z-10 overflow-hidden ${
                theme === 'dark'
                  ? 'bg-[#0E131F] text-white border-t sm:border border-gray-800'
                  : 'bg-white text-gray-900 border-t sm:border border-gray-200'
              }`}
            >
              <div className="pt-3 pb-1 flex justify-center sm:hidden">
                <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
              </div>

              {/* Title */}
              <div className="px-5 pt-3 pb-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Edit3 size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white">
                      Öğretmen Bilgilerini Düzenle
                    </h3>
                    <p className="text-[11px] text-gray-400">Özlük ve ders görevlendirmesi</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setTeacherToEdit(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Categorized Tab Bar for Edit Form */}
              <div className="flex items-center px-4 pt-3 pb-1 border-b border-gray-100 dark:border-gray-800 gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { key: 'ozluk', label: 'Özlük & İletişim', icon: User },
                  { key: 'gorev', label: 'Görev & Nöbet', icon: Briefcase },
                  { key: 'finans', label: 'Finans & İzin', icon: Wallet },
                ].map((tb) => {
                  const Icon = tb.icon
                  const isActive = editTeacherSection === tb.key
                  return (
                    <button
                      key={tb.key}
                      type="button"
                      onClick={() => setEditTeacherSection(tb.key as any)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-[#10B981] text-white shadow-sm'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon size={13} />
                      <span>{tb.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveEdit} className="p-5 overflow-y-auto space-y-3.5 text-xs">
                {editTeacherSection === 'ozluk' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">
                        Adı Soyadı
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">
                          T.C. Kimlik No
                        </label>
                        <input
                          type="text"
                          maxLength={11}
                          value={editTcNo}
                          onChange={(e) => setEditTcNo(e.target.value)}
                          placeholder="11 haneli TC"
                          className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono font-bold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">
                          Kan Grubu
                        </label>
                        <select
                          value={editBloodType}
                          onChange={(e) => setEditBloodType(e.target.value)}
                          className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-rose-600 dark:text-rose-400"
                        >
                          <option value="A Rh+">A Rh+</option>
                          <option value="A Rh-">A Rh-</option>
                          <option value="B Rh+">B Rh+</option>
                          <option value="B Rh-">B Rh-</option>
                          <option value="AB Rh+">AB Rh+</option>
                          <option value="AB Rh-">AB Rh-</option>
                          <option value="0 Rh+">0 Rh+</option>
                          <option value="0 Rh-">0 Rh-</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">
                          Telefon Numarası
                        </label>
                        <input
                          type="text"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">
                          E-Posta Adresi
                        </label>
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">
                          Doğum Tarihi & Yaş
                        </label>
                        <input
                          type="text"
                          value={editBirthDate}
                          onChange={(e) => setEditBirthDate(e.target.value)}
                          placeholder="Örn: 14.05.1989 (37 Yaşında)"
                          className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">
                          MEBBİS Sicil No
                        </label>
                        <input
                          type="text"
                          value={editSicilNo}
                          onChange={(e) => setEditSicilNo(e.target.value)}
                          placeholder="Örn: MEB-34019284"
                          className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">
                          Mezuniyet & Fakülte
                        </label>
                        <input
                          type="text"
                          value={editUniversity}
                          onChange={(e) => setEditUniversity(e.target.value)}
                          placeholder="Üniversite ve Fakülte"
                          className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">
                          Mezuniyet Yılı
                        </label>
                        <input
                          type="text"
                          value={editGraduationYear}
                          onChange={(e) => setEditGraduationYear(e.target.value)}
                          placeholder="2016"
                          className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-center"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">
                        İkametgah Adresi
                      </label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        placeholder="İlçe / Şehir"
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">
                          Acil Durum Kişisi
                        </label>
                        <input
                          type="text"
                          value={editEmergencyContact}
                          onChange={(e) => setEditEmergencyContact(e.target.value)}
                          placeholder="Örn: Eşi, Babası"
                          className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">
                          Acil Durum Telefonu
                        </label>
                        <input
                          type="text"
                          value={editEmergencyPhone}
                          onChange={(e) => setEditEmergencyPhone(e.target.value)}
                          placeholder="+90 532 ..."
                          className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {editTeacherSection === 'gorev' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">
                          Branş
                        </label>
                        <input
                          type="text"
                          value={editBranch}
                          onChange={(e) => setEditBranch(e.target.value)}
                          placeholder="Sınıf Öğretmeni, Matematik..."
                          className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">
                          Unvan & Kıdem
                        </label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Örn: Uzman Öğretmen (9 Yıl)"
                          className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">
                          Rehberlik Şubesi
                        </label>
                        <select
                          value={editMentorClass}
                          onChange={(e) => setEditMentorClass(e.target.value)}
                          className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                        >
                          <option value="1-A">1-A Şubesi</option>
                          <option value="1-B">1-B Şubesi</option>
                          <option value="1-C">1-C Şubesi</option>
                          <option value="2-A">2-A Şubesi</option>
                          <option value="2-B">2-B Şubesi</option>
                          <option value="3-A">3-A Şubesi</option>
                          <option value="3-B">3-B Şubesi</option>
                          <option value="4-A">4-A Şubesi</option>
                          <option value="4-B">4-B Şubesi</option>
                          <option value="5-A">5-A Şubesi</option>
                          <option value="6-A">6-A Şubesi</option>
                          <option value="7-A">7-A Şubesi</option>
                          <option value="8-A">8-A (LGS)</option>
                          <option value="-">Rehberlik Yok</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">
                          Kadro Şekli
                        </label>
                        <select
                          value={editEmploymentType}
                          onChange={(e) => setEditEmploymentType(e.target.value as any)}
                          className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                        >
                          <option value="Kadrolu">Kadrolu</option>
                          <option value="Sözleşmeli">Sözleşmeli</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">
                          Haftalık Toplam Ders
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={40}
                          value={editWeeklyHours}
                          onChange={(e) => setEditWeeklyHours(Number(e.target.value))}
                          className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">
                          Girdiği Şubeler
                        </label>
                        <input
                          type="text"
                          value={editAssignedClasses}
                          onChange={(e) => setEditAssignedClasses(e.target.value)}
                          placeholder="Örn: 1-A, 1-B, 2-A"
                          className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">
                        Haftalık Nöbet Günü & Yeri
                      </label>
                      <input
                        type="text"
                        value={editDutyInfo}
                        onChange={(e) => setEditDutyInfo(e.target.value)}
                        placeholder="Örn: Salı · 1. Kat Koridor & Bahçe Kapısı"
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">
                        Kulüp Danışmanlığı
                      </label>
                      <input
                        type="text"
                        value={editClub}
                        onChange={(e) => setEditClub(e.target.value)}
                        placeholder="Örn: Satranç ve Akıl Oyunları Kulübü"
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">
                        Mesai & Çalışma Saatleri
                      </label>
                      <input
                        type="text"
                        value={editWorkingHours}
                        onChange={(e) => setEditWorkingHours(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                      />
                    </div>
                  </div>
                )}

                {editTeacherSection === 'finans' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">
                        Kadro Derece & Kademe
                      </label>
                      <input
                        type="text"
                        value={editDegree}
                        onChange={(e) => setEditDegree(e.target.value)}
                        placeholder="Örn: 1/4 Derece · Uzman"
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                          Net Taban Maaş (₺)
                        </label>
                        <input
                          type="number"
                          step={50}
                          value={editBaseSalary}
                          onChange={(e) => setEditBaseSalary(Number(e.target.value))}
                          className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-emerald-200 dark:border-emerald-800 font-black text-emerald-600 dark:text-emerald-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-teal-600 dark:text-teal-400 mb-1">
                          Ek Ders + Tazminat (₺)
                        </label>
                        <input
                          type="number"
                          step={50}
                          value={editExtraSalary}
                          onChange={(e) => setEditExtraSalary(Number(e.target.value))}
                          className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-teal-200 dark:border-teal-800 font-black text-teal-600 dark:text-teal-400"
                        />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-900/50 flex justify-between items-center text-xs">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300">
                        Hesaplanan Toplam Net:
                      </span>
                      <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                        ₺{((editBaseSalary || 0) + (editExtraSalary || 0)).toLocaleString('tr-TR')}
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">
                        Maaş Bankası & Şube
                      </label>
                      <input
                        type="text"
                        value={editBankName}
                        onChange={(e) => setEditBankName(e.target.value)}
                        placeholder="Örn: Vakıfbank Kadıköy Şubesi"
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">
                        IBAN Numarası
                      </label>
                      <input
                        type="text"
                        value={editIban}
                        onChange={(e) => setEditIban(e.target.value)}
                        placeholder="TR..."
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono font-bold text-blue-600 dark:text-blue-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">
                          Kalan Yıllık İzin (Gün)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={60}
                          value={editAnnualLeave}
                          onChange={(e) => setEditAnnualLeave(Number(e.target.value))}
                          className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-black text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">
                          Mazeret İzni (Gün)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={30}
                          value={editCasualLeave}
                          onChange={(e) => setEditCasualLeave(Number(e.target.value))}
                          className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-black text-center"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-12 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Save size={16} />
                    <span>Öğretmen Bilgilerini Güncelle</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: YENİ ÖĞRETMEN & PERSONEL EKLEME (KATEGORİZE FORM) ── */}
      <AnimatePresence>
        {isNewTeacherModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.25 }}
              className="w-full sm:max-w-lg bg-white dark:bg-[#121826] rounded-t-[32px] sm:rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden relative"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shrink-0">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <span>Yeni Öğretmen / Personel Ekle</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                        Müdür Yetkisi
                      </span>
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Temel bilgileri tanımlayın; ilk girişte profilini tamamlayacaktır
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewTeacherModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Categorized Tabs Switcher */}
              <div className="px-4 pt-3 shrink-0">
                <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-gray-800/80 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setNewTeacherTab('temel')}
                    className={`py-2 rounded-xl transition-all cursor-pointer ${
                      newTeacherTab === 'temel'
                        ? 'bg-white dark:bg-[#1E293B] text-emerald-600 dark:text-emerald-400 shadow-sm font-black'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    1. Temel
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTeacherTab('gorev')}
                    className={`py-2 rounded-xl transition-all cursor-pointer ${
                      newTeacherTab === 'gorev'
                        ? 'bg-white dark:bg-[#1E293B] text-emerald-600 dark:text-emerald-400 shadow-sm font-black'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    2. Görev
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTeacherTab('ozluk')}
                    className={`py-2 rounded-xl transition-all cursor-pointer ${
                      newTeacherTab === 'ozluk'
                        ? 'bg-white dark:bg-[#1E293B] text-emerald-600 dark:text-emerald-400 shadow-sm font-black'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    3. Özlük
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTeacherTab('finans')}
                    className={`py-2 rounded-xl transition-all cursor-pointer ${
                      newTeacherTab === 'finans'
                        ? 'bg-white dark:bg-[#1E293B] text-emerald-600 dark:text-emerald-400 shadow-sm font-black'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    4. Finans
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCreateTeacher} className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* ── KATEGORİ 1: TEMEL & GİRİŞ BİLGİLERİ ── */}
                {newTeacherTab === 'temel' && (
                  <div className="space-y-3.5">
                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/40 flex items-start gap-2.5 text-xs">
                      <Sparkles size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div className="text-emerald-900 dark:text-emerald-200 leading-snug">
                        <span className="font-extrabold">Müdür Görevi:</span> Ad, TC Kimlik, kurumsal e-posta ve başlangıç şifresini belirleyin. Öğretmen ilk girişte kalıcı şifresini belirleyecek ve evraklarını yükleyecektir.
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Adı Soyadı <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newName}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="Örn: Zeynep KILIÇ"
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          TC Kimlik No <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={11}
                          value={newTcNo}
                          onChange={(e) => setNewTcNo(e.target.value.replace(/\D/g, ''))}
                          placeholder="11 haneli TC No"
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-mono font-bold text-gray-900 dark:text-white outline-hidden focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          İletişim Telefonu
                        </label>
                        <input
                          type="text"
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          placeholder="+90 532 ..."
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white outline-hidden focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Kurumsal E-posta Adresi <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="ad.soyad@oxonom.com"
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                          Başlangıç / Geçici Şifresi <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[10px] text-gray-400">Varsayılan: Ugur2803*</span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Ugur2803*"
                          className="w-full h-11 pl-3.5 pr-10 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-mono font-bold text-gray-900 dark:text-white outline-hidden focus:border-emerald-500"
                        />
                        <Lock size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                      <p className="text-[10.5px] text-gray-500 dark:text-gray-400 mt-1">
                        Öğretmen bu şifreyle giriş yaptıktan sonra yeni şifresini kendisi belirleyecektir.
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setNewTeacherTab('gorev')}
                        className="w-full h-11 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        <span>Sonraki Adım: Görev & Kadro Bilgileri</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* ── KATEGORİ 2: GÖREV & KADRO BİLGİLERİ ── */}
                {newTeacherTab === 'gorev' && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Branş / Uzmanlık Alanı <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newBranch}
                        onChange={(e) => setNewBranch(e.target.value)}
                        placeholder="Örn: Matematik Öğretmeni"
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Atanacağı Şube / Rehberlik
                        </label>
                        <select
                          value={newMentorClass}
                          onChange={(e) => setNewMentorClass(e.target.value)}
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white outline-hidden focus:border-emerald-500"
                        >
                          <option value="9-A">9-A Şubesi</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          İstihdam Türü
                        </label>
                        <select
                          value={newEmploymentType}
                          onChange={(e) => setNewEmploymentType(e.target.value as any)}
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white outline-hidden focus:border-emerald-500"
                        >
                          <option value="Kadrolu">Kadrolu</option>
                          <option value="Sözleşmeli">Sözleşmeli</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Haftalık Ders Saati
                        </label>
                        <input
                          type="number"
                          value={newWeeklyHours}
                          onChange={(e) => setNewWeeklyHours(Number(e.target.value))}
                          min={1}
                          max={45}
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white outline-hidden focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Ünvan / Kıdem
                        </label>
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="Örn: Uzman Öğretmen"
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white outline-hidden focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Haftalık Nöbet Görevi
                      </label>
                      <input
                        type="text"
                        value={newDutyInfo}
                        onChange={(e) => setNewDutyInfo(e.target.value)}
                        placeholder="Örn: Salı · 1. Kat Koridor & Bahçe Kapısı"
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-900 dark:text-white outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Danışman Kulüp
                      </label>
                      <input
                        type="text"
                        value={newClub}
                        onChange={(e) => setNewClub(e.target.value)}
                        placeholder="Örn: Robotik & Kodlama Kulübü"
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-900 dark:text-white outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setNewTeacherTab('ozluk')}
                        className="w-full h-11 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        <span>Sonraki Adım: Özlük & Mezuniyet</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* ── KATEGORİ 3: ÖZLÜK & MEZUNİYET BİLGİLERİ ── */}
                {newTeacherTab === 'ozluk' && (
                  <div className="space-y-3.5">
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Bu alanlar opsiyoneldir. Müdür boş bırakırsa, öğretmen ilk girişinde profil tamamlama adımında dolduracaktır.
                    </p>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Mezun Olduğu Üniversite & Fakülte
                      </label>
                      <input
                        type="text"
                        value={newUniversity}
                        onChange={(e) => setNewUniversity(e.target.value)}
                        placeholder="Örn: Boğaziçi Üniversitesi Eğitim Fakültesi"
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Mezuniyet Yılı
                        </label>
                        <input
                          type="text"
                          value={newGraduationYear}
                          onChange={(e) => setNewGraduationYear(e.target.value)}
                          placeholder="2018"
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white outline-hidden focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          MEB Sicil No
                        </label>
                        <input
                          type="text"
                          value={newSicilNo}
                          onChange={(e) => setNewSicilNo(e.target.value)}
                          placeholder="MEB-34..."
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-mono font-bold text-gray-900 dark:text-white outline-hidden focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        İkametgah Adresi
                      </label>
                      <input
                        type="text"
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        placeholder="Kadıköy / İstanbul"
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-900 dark:text-white outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Acil Durum Yakını
                        </label>
                        <input
                          type="text"
                          value={newEmergencyContact}
                          onChange={(e) => setNewEmergencyContact(e.target.value)}
                          placeholder="Eşi / Babası"
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-900 dark:text-white outline-hidden focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Acil Durum Tel
                        </label>
                        <input
                          type="text"
                          value={newEmergencyPhone}
                          onChange={(e) => setNewEmergencyPhone(e.target.value)}
                          placeholder="+90 532 ..."
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-900 dark:text-white outline-hidden focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setNewTeacherTab('finans')}
                        className="w-full h-11 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        <span>Sonraki Adım: Finans & Maaş</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* ── KATEGORİ 4: FİNANS & MAAŞ BİLGİLERİ ── */}
                {newTeacherTab === 'finans' && (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Maaş Bankası
                        </label>
                        <input
                          type="text"
                          value={newBankName}
                          onChange={(e) => setNewBankName(e.target.value)}
                          placeholder="Vakıfbank"
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white outline-hidden focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Yıllık İzin Hakkı (Gün)
                        </label>
                        <input
                          type="number"
                          value={newAnnualLeave}
                          onChange={(e) => setNewAnnualLeave(Number(e.target.value))}
                          min={0}
                          max={60}
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white outline-hidden focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        IBAN Numarası
                      </label>
                      <input
                        type="text"
                        value={newIban}
                        onChange={(e) => setNewIban(e.target.value)}
                        placeholder="TR..."
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-mono font-bold text-blue-600 dark:text-blue-400 outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Taban Maaş (₺)
                        </label>
                        <input
                          type="number"
                          value={newBaseSalary}
                          onChange={(e) => setNewBaseSalary(Number(e.target.value))}
                          step={500}
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-emerald-600 dark:text-emerald-400 outline-hidden focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Ek Ders Ücreti (₺)
                        </label>
                        <input
                          type="number"
                          value={newExtraSalary}
                          onChange={(e) => setNewExtraSalary(Number(e.target.value))}
                          step={250}
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-teal-600 dark:text-teal-400 outline-hidden focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-900/50 flex justify-between items-center text-xs">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300">
                        Toplam Net Hak Ediş:
                      </span>
                      <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                        ₺{((newBaseSalary || 0) + (newExtraSalary || 0)).toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </div>
                )}

                {/* Submit Action */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewTeacherModalOpen(false)}
                    className="flex-1 h-12 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121826] text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] h-12 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all cursor-pointer"
                  >
                    <CheckCircle2 size={16} />
                    <span>Öğretmeni Sisteme Kaydet</span>
                  </button>
                </div>
              </form>

              {/* ── SUCCESS CREDENTIALS POPUP (Müdürün Öğretmene İleteceği Bilgiler) ── */}
              {newCreatedCredentials && (
                <div className="absolute inset-0 z-30 bg-white/95 dark:bg-[#121826]/95 backdrop-blur-md p-6 flex flex-col justify-center items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shadow-lg border border-emerald-500/30">
                    <CheckCircle2 size={36} />
                  </div>

                  <div>
                    <h4 className="text-lg font-black text-gray-900 dark:text-white">
                      Öğretmen Hesabı Başarıyla Oluşturuldu!
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
                      <span className="font-bold text-gray-800 dark:text-gray-200">{newCreatedCredentials.name}</span> sisteme tanımlandı. Aşağıdaki giriş bilgilerini öğretmenle paylaşabilirsiniz.
                    </p>
                  </div>

                  <div className="w-full max-w-sm p-4 rounded-2xl bg-gray-50 dark:bg-[#0A0D15] border border-gray-200 dark:border-gray-800 text-left space-y-2.5 text-xs font-mono">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Giriş E-Postası:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 select-all">{newCreatedCredentials.email}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Geçici Şifre:</span>
                      <span className="font-bold text-gray-900 dark:text-white select-all">{newCreatedCredentials.pass}</span>
                    </div>
                    <div className="pt-1 text-[10.5px] text-amber-600 dark:text-amber-400 font-sans font-medium flex items-center gap-1.5">
                      <AlertCircle size={13} className="shrink-0" />
                      <span>Öğretmen ilk girişinde şifresini değiştirecek ve belgelerini yükleyecektir.</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 w-full max-w-sm pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const text = `Oxonom Okulları Öğretmen Giriş Bilgileri:\nE-Posta: ${newCreatedCredentials.email}\nGeçici Şifre: ${newCreatedCredentials.pass}\nGiriş: https://agenapos.vercel.app/m-login`
                        navigator.clipboard.writeText(text)
                        toast.success('Giriş bilgileri panoya kopyalandı!')
                      }}
                      className="flex-1 h-11 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Copy size={14} />
                      <span>Bilgileri Kopyala</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsNewTeacherModalOpen(false)
                        setNewCreatedCredentials(null)
                      }}
                      className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                    >
                      <span>Tamam & Kapat</span>
                    </button>
                  </div>
                </div>
              )}
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
      <div
        className="w-full sm:max-w-[390px] min-h-[100dvh] bg-[#F8FAFC] dark:bg-[#0A0D15] sm:shadow-2xl relative flex flex-col sm:border-x border-gray-200/60 dark:border-gray-800/80 overflow-x-hidden overscroll-y-none"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6.5rem)' }}
      >
        <MobileHeader theme={theme} onToggleTheme={toggleTheme} />
        <main className="flex-1 w-full flex flex-col">{pageContent}</main>
        {!hideDock && (
          <MobileAdminDock
            activeTab="teachers"
            onOpenMoreSheet={() => setIsMoreSheetOpen(true)}
            orgSlug={orgSlug}
            theme={theme}
          />
        )}
      </div>
    </div>
  )
}
