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
  Mail,
  Bus,
  Utensils,
  FolderCheck,
  CheckSquare,
  Square,
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
  SCHOOL_ORGS,
  getOrgStudents,
  getOrgClassrooms,
  getSingleSourceOfTruthStudents,
  saveSingleSourceOfTruthStudents,
} from '@services/demo/schoolDirectory'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { getStoredPrincipalProfile } from '@/lib/principal/principalProfileStorage'
import { getStudentAttendanceSummary } from '@services/demo/attendanceService'

export interface MAdminStudentsClientProps {
  orgSlug?: string
  hideHeader?: boolean
  hideDock?: boolean
}

export function formatClassCode(className?: string): string {
  if (!className) return '1/A'
  const trimmed = className.replace(/Şubesi|Sınıfı/gi, '').trim()
  if (trimmed === 'ALL' || trimmed === 'all') return 'Tüm Şubeler'
  return trimmed.replace('-', '/')
}

export default function MAdminStudentsClient({
  orgSlug,
  hideHeader = false,
  hideDock = false,
}: MAdminStudentsClientProps) {
  const { theme, toggleTheme } = useMobileTheme()
  const session = useLHSession() as any
  const user = session?.data?.user

  // ── MULTI-TENANT ISOLATED SCHOOL ORG STATE ──
  const [selectedOrgId, setSelectedOrgId] = useState<number>(30)

  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false)
  const [selectedClassCode, setSelectedClassCode] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // ── MODALS & SELECTIONS ──
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<any | null>(null)
  const [isEditingStudent, setIsEditingStudent] = useState(false)
  const [activeDetailTab, setActiveDetailTab] = useState<
    'general' | 'school' | 'parents' | 'emergency' | 'documents' | 'academic'
  >('general')

  const [isNewStudentModalOpen, setIsNewStudentModalOpen] = useState(false)
  const [newStudentTab, setNewStudentTab] = useState<
    'kimlik' | 'okul' | 'ebeveyn' | 'adres' | 'evraklar'
  >('kimlik')
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [studentToTransfer, setStudentToTransfer] = useState<any | null>(null)
  const [targetTransferClass, setTargetTransferClass] = useState<string>('1/A')

  // ── FORM STATES FOR NEW STUDENT (A-Z OFFICIAL REGISTRATION) ──
  const [newTcNo, setNewTcNo] = useState('')
  const [newFirstName, setNewFirstName] = useState('')
  const [newLastName, setNewLastName] = useState('')
  const [newClassCode, setNewClassCode] = useState('1/A')
  const [newStudentNo, setNewStudentNo] = useState('102')
  const [newGender, setNewGender] = useState<'Erkek' | 'Kız'>('Erkek')
  const [newBirthDate, setNewBirthDate] = useState('15.06.2017')
  const [newBirthPlace, setNewBirthPlace] = useState('Kadıköy / İstanbul')
  const [newBloodType, setNewBloodType] = useState('A Rh+')
  const [newHealthNote, setNewHealthNote] = useState('Herhangi bir sağlık engeli veya alerjisi bulunmamaktadır.')
  const [newBepStatus, setNewBepStatus] = useState<'Yok' | 'BEP Raporu Var'>('Yok')

  const [newEnrollmentType, setNewEnrollmentType] = useState('Yeni Kayıt')
  const [newEnrollmentDate, setNewEnrollmentDate] = useState('12.10.2026')
  const [newBusService, setNewBusService] = useState('Kullanmıyor')
  const [newCafeteriaPlan, setNewCafeteriaPlan] = useState('Öğle Yemeği + İkindi Kahvaltısı')

  // Anne
  const [newMotherName, setNewMotherName] = useState('')
  const [newMotherTc, setNewMotherTc] = useState('')
  const [newMotherPhone, setNewMotherPhone] = useState('')
  const [newMotherEmail, setNewMotherEmail] = useState('')
  const [newMotherJob, setNewMotherJob] = useState('')
  const [newMotherLivingStatus, setNewMotherLivingStatus] = useState<'Hayatta' | 'Vefat'>('Hayatta')
  const [newMotherIsLegalGuardian, setNewMotherIsLegalGuardian] = useState(false)

  // Baba
  const [newFatherName, setNewFatherName] = useState('')
  const [newFatherTc, setNewFatherTc] = useState('')
  const [newFatherPhone, setNewFatherPhone] = useState('')
  const [newFatherEmail, setNewFatherEmail] = useState('')
  const [newFatherJob, setNewFatherJob] = useState('')
  const [newFatherLivingStatus, setNewFatherLivingStatus] = useState<'Hayatta' | 'Vefat'>('Hayatta')
  const [newFatherIsLegalGuardian, setNewFatherIsLegalGuardian] = useState(true)

  // Adres & Acil
  const [newAddress, setNewAddress] = useState('')
  const [newCityDistrict, setNewCityDistrict] = useState('İstanbul / Kadıköy')
  const [newEmergency1Name, setNewEmergency1Name] = useState('')
  const [newEmergency1Relation, setNewEmergency1Relation] = useState('Anne')
  const [newEmergency1Phone, setNewEmergency1Phone] = useState('')
  const [newEmergency2Name, setNewEmergency2Name] = useState('')
  const [newEmergency2Relation, setNewEmergency2Relation] = useState('Amca / Teyze')
  const [newEmergency2Phone, setNewEmergency2Phone] = useState('')

  // Evraklar
  const [newDocIdCard, setNewDocIdCard] = useState(true)
  const [newDocResidence, setNewDocResidence] = useState(true)
  const [newDocHealthReport, setNewDocHealthReport] = useState(true)
  const [newDocBiometricPhotos, setNewDocBiometricPhotos] = useState(true)
  const [newDocSignedContract, setNewDocSignedContract] = useState(true)
  const [newDocTransferReport, setNewDocTransferReport] = useState(false)

  // ── EDIT STUDENT FORM STATES ──
  const [editFirstName, setEditFirstName] = useState('')
  const [editLastName, setEditLastName] = useState('')
  const [editTcNo, setEditTcNo] = useState('')
  const [editStudentNo, setEditStudentNo] = useState('')
  const [editClassCode, setEditClassCode] = useState('1/A')
  const [editBirthDate, setEditBirthDate] = useState('')
  const [editBirthPlace, setEditBirthPlace] = useState('')
  const [editBloodType, setEditBloodType] = useState('A Rh+')
  const [editGender, setEditGender] = useState<'Erkek' | 'Kız'>('Erkek')
  const [editHealthNote, setEditHealthNote] = useState('')
  const [editBepStatus, setEditBepStatus] = useState<'Yok' | 'BEP Raporu Var'>('Yok')

  const [editEnrollmentType, setEditEnrollmentType] = useState('Yeni Kayıt')
  const [editEnrollmentDate, setEditEnrollmentDate] = useState('')
  const [editBusService, setEditBusService] = useState('Kullanmıyor')
  const [editCafeteriaPlan, setEditCafeteriaPlan] = useState('Öğle Yemeği + İkindi Kahvaltısı')

  const [editMotherName, setEditMotherName] = useState('')
  const [editMotherTc, setEditMotherTc] = useState('')
  const [editMotherPhone, setEditMotherPhone] = useState('')
  const [editMotherEmail, setEditMotherEmail] = useState('')
  const [editMotherJob, setEditMotherJob] = useState('')
  const [editMotherLivingStatus, setEditMotherLivingStatus] = useState<'Hayatta' | 'Vefat'>('Hayatta')
  const [editMotherIsLegalGuardian, setEditMotherIsLegalGuardian] = useState(false)

  const [editFatherName, setEditFatherName] = useState('')
  const [editFatherTc, setEditFatherTc] = useState('')
  const [editFatherPhone, setEditFatherPhone] = useState('')
  const [editFatherEmail, setEditFatherEmail] = useState('')
  const [editFatherJob, setEditFatherJob] = useState('')
  const [editFatherLivingStatus, setEditFatherLivingStatus] = useState<'Hayatta' | 'Vefat'>('Hayatta')
  const [editFatherIsLegalGuardian, setEditFatherIsLegalGuardian] = useState(true)

  const [editAddress, setEditAddress] = useState('')
  const [editCityDistrict, setEditCityDistrict] = useState('')
  const [editEmergency1Name, setEditEmergency1Name] = useState('')
  const [editEmergency1Relation, setEditEmergency1Relation] = useState('')
  const [editEmergency1Phone, setEditEmergency1Phone] = useState('')
  const [editEmergency2Name, setEditEmergency2Name] = useState('')
  const [editEmergency2Relation, setEditEmergency2Relation] = useState('')
  const [editEmergency2Phone, setEditEmergency2Phone] = useState('')

  const [editDocIdCard, setEditDocIdCard] = useState(true)
  const [editDocResidence, setEditDocResidence] = useState(true)
  const [editDocHealthReport, setEditDocHealthReport] = useState(true)
  const [editDocBiometricPhotos, setEditDocBiometricPhotos] = useState(true)
  const [editDocSignedContract, setEditDocSignedContract] = useState(true)
  const [editDocTransferReport, setEditDocTransferReport] = useState(false)
  const [editAdminNote, setEditAdminNote] = useState('')

  // ── ENRICH STUDENT WITH REAL LIVE ATTENDANCE & TEACHER GRADES ──
  const enrichStudentWithRealData = (student: any) => {
    const enriched = { ...student }

    // 1. Live attendance calculation from actual attendance records
    try {
      const att = getStudentAttendanceSummary(enriched.id, enriched.studentNo, enriched.className)
      enriched.attendanceRate = att.attendanceRate
      enriched.unexcusedDays = att.unexcusedDays
      enriched.excusedDays = att.excusedDays
    } catch (_) {}

    // 2. Live grades calculation from teacher portal records (oxonom_m_students_v3)
    try {
      if (typeof window !== 'undefined') {
        const mRaw = localStorage.getItem('oxonom_m_students_v3')
        if (mRaw) {
          const mList = JSON.parse(mRaw)
          if (Array.isArray(mList)) {
            const match = mList.find((st: any) => st.id === enriched.id || st.studentNo === enriched.studentNo)
            if (match) {
              if (match.grades && Array.isArray(match.grades) && match.grades.length > 0) {
                enriched.grades = match.grades
              }
              if (match.gpa !== undefined && match.gpa !== null && Number(match.gpa) > 0) {
                enriched.gpa = match.gpa
              }
            }
          }
        }
      }
    } catch (_) {}

    return enriched
  }

  // Helper: auto-generate next sequential available student number
  const getNextAvailableStudentNo = (list: any[]): string => {
    const numericNos = list
      .map((s) => {
        const raw = String(s.studentNo || '').trim()
        const match = raw.match(/\d+/)
        return match ? parseInt(match[0], 10) : 0
      })
      .filter((n) => n > 0)
    if (numericNos.length === 0) return '101'
    const maxNo = Math.max(...numericNos)
    return String(maxNo + 1)
  }

  // ── STUDENTS LIST WITH STRICT MULTI-TENANT ISOLATION (OXONOM OKULLARI) ──
  const [studentsList, setStudentsList] = useState<any[]>(() => {
    const baseList = getSingleSourceOfTruthStudents(30)
    return baseList.map(enrichStudentWithRealData)
  })

  // Synchronize when school org changes or load from isolated localStorage partition
  const loadStudents = () => {
    const baseList = getSingleSourceOfTruthStudents(selectedOrgId)
    const enrichedList = baseList.map(enrichStudentWithRealData)
    setStudentsList(enrichedList)

    // Also update selectedStudentForDetail if modal is open
    setSelectedStudentForDetail((prev: any) => {
      if (!prev) return null
      const updated = enrichedList.find((s) => s.id === prev.id || s.studentNo === prev.studentNo)
      return updated ? enrichStudentWithRealData(updated) : prev
    })
  }

  useEffect(() => {
    loadStudents()
    setSelectedClassCode('ALL')

    const handleSync = () => {
      loadStudents()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('oxonom_attendance_updated', handleSync)
      window.addEventListener('oxonom_student_updated', handleSync)
      window.addEventListener('oxonom_admin_students_updated', handleSync)
      window.addEventListener('storage', handleSync)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('oxonom_attendance_updated', handleSync)
        window.removeEventListener('oxonom_student_updated', handleSync)
        window.removeEventListener('oxonom_admin_students_updated', handleSync)
        window.removeEventListener('storage', handleSync)
      }
    }
  }, [selectedOrgId])

  // Sync to isolated localStorage partition whenever studentsList changes
  const updateStudentsList = (newList: any[]) => {
    saveSingleSourceOfTruthStudents(newList, selectedOrgId)
    const enriched = newList.map(enrichStudentWithRealData)
    setStudentsList(enriched)
  }

  // ── OPEN DETAIL MODAL & PREFILL FORM ──
  const handleOpenStudentDetail = (student: any) => {
    const freshStudent = enrichStudentWithRealData(student)
    setSelectedStudentForDetail(freshStudent)
    setIsEditingStudent(false)
    setActiveDetailTab('general')

    const fName = student.first_name || (student.name ? student.name.split(' ')[0] : 'Öğrenci')
    const lName = student.last_name || (student.name ? student.name.split(' ').slice(1).join(' ') : '')

    setEditFirstName(fName)
    setEditLastName(lName)
    setEditTcNo(student.tcNo || '10000000146')
    setEditStudentNo(student.studentNo || '101')
    setEditClassCode(formatClassCode(student.className) || '1/A')
    setEditBirthDate(student.birthDate || '15.06.2010 (16 Yaşında)')
    setEditBirthPlace(student.birthPlace || 'Kadıköy / İstanbul')
    setEditBloodType(student.bloodType || 'A Rh+')
    setEditGender(student.gender || 'Erkek')
    setEditHealthNote(student.specialHealthNote || 'Herhangi bir sağlık engeli veya alerjisi bulunmamaktadır.')
    setEditBepStatus(student.bepStatus || 'Yok')

    setEditEnrollmentType(student.enrollmentType || 'Yeni Kayıt')
    setEditEnrollmentDate(student.enrollmentDate || '01.09.2024')
    setEditBusService(student.busService || 'Kullanmıyor')
    setEditCafeteriaPlan(student.cafeteriaPlan || 'Öğle Yemeği + İkindi Kahvaltısı')

    setEditMotherName(student.motherName || 'Ebru UĞURLU')
    setEditMotherTc(student.motherTc || '28374910284')
    setEditMotherPhone(student.motherPhone || '+90 532 999 1100')
    setEditMotherEmail(student.motherEmail || 'ebru@oxonom.com')
    setEditMotherJob(student.motherJob || 'Mimar')
    setEditMotherLivingStatus(student.motherLivingStatus || 'Hayatta')
    setEditMotherIsLegalGuardian(student.motherIsLegalGuardian ?? false)

    const storedPrincipal = getStoredPrincipalProfile()
    setEditFatherName(student.fatherName || `${storedPrincipal.name} (Okul Müdürü)`)
    setEditFatherTc(student.fatherTc || storedPrincipal.tcNo || '19482019482')
    setEditFatherPhone(student.fatherPhone || storedPrincipal.phone || '+90 532 999 2200')
    setEditFatherEmail(student.fatherEmail || storedPrincipal.email || 'mudur@oxonom.com')
    setEditFatherJob(student.fatherJob || `${storedPrincipal.title || 'Okul Müdürü'} · Kurum Yetkilisi`)
    setEditFatherLivingStatus(student.fatherLivingStatus || 'Hayatta')
    setEditFatherIsLegalGuardian(student.fatherIsLegalGuardian ?? true)

    setEditAddress(student.address || 'Caddebostan Mah. Bağdat Cad. No: 142/5 Kadıköy / İstanbul')
    setEditCityDistrict(student.cityDistrict || 'İstanbul / Kadıköy')
    setEditEmergency1Name(student.emergency1Name || storedPrincipal.name)
    setEditEmergency1Relation(student.emergency1Relation || 'Baba (Okul Müdürü)')
    setEditEmergency1Phone(student.emergency1Phone || storedPrincipal.phone || '+90 532 999 2200')
    setEditEmergency2Name(student.emergency2Name || 'Ebru UĞURLU')
    setEditEmergency2Relation(student.emergency2Relation || 'Anne')
    setEditEmergency2Phone(student.emergency2Phone || '+90 532 999 1100')

    setEditDocIdCard(student.docIdCard ?? true)
    setEditDocResidence(student.docResidence ?? true)
    setEditDocHealthReport(student.docHealthReport ?? true)
    setEditDocBiometricPhotos(student.docBiometricPhotos ?? true)
    setEditDocSignedContract(student.docSignedContract ?? true)
    setEditDocTransferReport(student.docTransferReport ?? false)

    setEditAdminNote(student.notes || 'Ders içi katılımı yüksek, örnek öğrenci.')
  }

  // ── SAVE STUDENT EDITS ──
  const handleSaveStudentEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudentForDetail) return

    const fullName = `${editFirstName.trim()} ${editLastName.trim()}`.trim()
    const targetCode = formatClassCode(editClassCode)
    const matchedClass = ALL_CLASSROOMS.find((c) => c.code === targetCode) || ALL_CLASSROOMS[0]

    const updatedStudent = {
      ...selectedStudentForDetail,
      name: fullName,
      first_name: editFirstName.trim(),
      last_name: editLastName.trim(),
      tcNo: editTcNo.trim(),
      studentNo: editStudentNo.trim(),
      className: matchedClass.code,
      classroomName: matchedClass.name,
      classroomId: matchedClass.id,
      gradeLevel: matchedClass.grade_level,
      mentorTeacher: matchedClass.teacher_name
        ? `${matchedClass.teacher_name} (Sınıf Öğretmeni)`
        : (selectedStudentForDetail.mentorTeacher || 'Özlem ZOR (Sınıf Öğretmeni)'),
      schoolName: matchedClass.school_name || 'Oxonom Okulları',
      birthDate: editBirthDate.trim(),
      birthPlace: editBirthPlace.trim(),
      bloodType: editBloodType,
      gender: editGender,
      specialHealthNote: editHealthNote.trim(),
      bepStatus: editBepStatus,

      enrollmentType: editEnrollmentType,
      enrollmentDate: editEnrollmentDate,
      busService: editBusService,
      cafeteriaPlan: editCafeteriaPlan,

      motherName: editMotherName.trim(),
      motherTc: editMotherTc.trim(),
      motherPhone: editMotherPhone.trim(),
      motherEmail: editMotherEmail.trim(),
      motherJob: editMotherJob.trim(),
      motherLivingStatus: editMotherLivingStatus,
      motherIsLegalGuardian: editMotherIsLegalGuardian,

      fatherName: editFatherName.trim(),
      fatherTc: editFatherTc.trim(),
      fatherPhone: editFatherPhone.trim(),
      fatherEmail: editFatherEmail.trim(),
      fatherJob: editFatherJob.trim(),
      fatherLivingStatus: editFatherLivingStatus,
      fatherIsLegalGuardian: editFatherIsLegalGuardian,

      parentName: editFatherIsLegalGuardian ? editFatherName.trim() : editMotherName.trim(),
      parentPhone: editFatherIsLegalGuardian ? editFatherPhone.trim() : editMotherPhone.trim(),

      address: editAddress.trim(),
      cityDistrict: editCityDistrict.trim(),
      emergency1Name: editEmergency1Name.trim(),
      emergency1Relation: editEmergency1Relation.trim(),
      emergency1Phone: editEmergency1Phone.trim(),
      emergency2Name: editEmergency2Name.trim(),
      emergency2Relation: editEmergency2Relation.trim(),
      emergency2Phone: editEmergency2Phone.trim(),

      docIdCard: editDocIdCard,
      docResidence: editDocResidence,
      docHealthReport: editDocHealthReport,
      docBiometricPhotos: editDocBiometricPhotos,
      docSignedContract: editDocSignedContract,
      docTransferReport: editDocTransferReport,

      notes: editAdminNote.trim(),
    }

    const updatedList = studentsList.map((s) =>
      s.id === selectedStudentForDetail.id ? updatedStudent : s
    )

    updateStudentsList(updatedList)
    setSelectedStudentForDetail(updatedStudent)
    setIsEditingStudent(false)
    toast.success(`${fullName} öğrencisinin tüm resmi kütük bilgileri başarıyla güncellendi!`)
  }

  // ── HANDLE NEW STUDENT SUBMIT ──
  const handleRegisterStudent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTcNo || !newFirstName || !newLastName) {
      toast.error('Lütfen TC kimlik, ad ve soyad alanlarını doldurunuz.')
      return
    }

    // Duplicate Student Number Check
    const trimmedNo = (newStudentNo || '').trim()
    if (trimmedNo) {
      const duplicateStudent = studentsList.find(
        (s) => String(s.studentNo || '').trim().toLowerCase() === trimmedNo.toLowerCase()
      )
      if (duplicateStudent) {
        toast.error(`"${trimmedNo}" okul numarası zaten sistemde kayıtlı (${duplicateStudent.name})! Lütfen farklı bir numara giriniz.`)
        return
      }
    }

    // Duplicate TC Check
    const trimmedTc = newTcNo.trim()
    const duplicateTc = studentsList.find(
      (s) => String(s.tcNo || '').trim() === trimmedTc
    )
    if (duplicateTc) {
      toast.error(`"${trimmedTc}" T.C. kimlik numarası zaten sistemde kayıtlı (${duplicateTc.name})!`)
      return
    }

    const finalStudentNo = trimmedNo || getNextAvailableStudentNo(studentsList)
    const newId = Date.now()
    const fullName = `${newFirstName.trim()} ${newLastName.trim()}`
    const finalClassCode = formatClassCode(newClassCode)
    const matchedClass = ALL_CLASSROOMS.find((c) => c.code === finalClassCode) || ALL_CLASSROOMS[0]

    const createdStudent = {
      id: newId,
      user_uuid: `user_${newId}`,
      studentNo: finalStudentNo,
      tcNo: newTcNo.trim(),
      name: fullName,
      first_name: newFirstName.trim(),
      last_name: newLastName.trim(),
      className: matchedClass.code,
      classroomName: matchedClass.name,
      classroomId: matchedClass.id,
      gradeLevel: matchedClass.grade_level,
      mentorTeacher: matchedClass.teacher_name
        ? `${matchedClass.teacher_name} (Sınıf Öğretmeni)`
        : 'Özlem ZOR (Sınıf Öğretmeni)',
      schoolName: matchedClass.school_name || 'Oxonom Okulları',
      gender: newGender,
      birthDate: newBirthDate,
      birthPlace: newBirthPlace,
      bloodType: newBloodType,
      specialHealthNote: newHealthNote,
      bepStatus: newBepStatus,

      enrollmentType: newEnrollmentType,
      enrollmentDate: newEnrollmentDate || new Date().toLocaleDateString('tr-TR'),
      busService: newBusService,
      cafeteriaPlan: newCafeteriaPlan,

      motherName: newMotherName.trim() || 'Belirtilmedi',
      motherTc: newMotherTc.trim(),
      motherPhone: newMotherPhone.trim(),
      motherEmail: newMotherEmail.trim(),
      motherJob: newMotherJob.trim(),
      motherLivingStatus: newMotherLivingStatus,
      motherIsLegalGuardian: newMotherIsLegalGuardian,

      fatherName: newFatherName.trim() || 'Belirtilmedi',
      fatherTc: newFatherTc.trim(),
      fatherPhone: newFatherPhone.trim(),
      fatherEmail: newFatherEmail.trim(),
      fatherJob: newFatherJob.trim(),
      fatherLivingStatus: newFatherLivingStatus,
      fatherIsLegalGuardian: newFatherIsLegalGuardian,

      parentName: newFatherIsLegalGuardian
        ? (newFatherName.trim() || newMotherName.trim() || 'Veli')
        : (newMotherName.trim() || newFatherName.trim() || 'Veli'),
      parentPhone: newFatherIsLegalGuardian
        ? (newFatherPhone.trim() || newMotherPhone.trim() || '+90 532 000 0000')
        : (newMotherPhone.trim() || newFatherPhone.trim() || '+90 532 000 0000'),

      address: newAddress.trim() || 'İstanbul',
      cityDistrict: newCityDistrict.trim() || 'İstanbul',
      emergency1Name: newEmergency1Name.trim() || newFatherName.trim() || newMotherName.trim(),
      emergency1Relation: newEmergency1Relation.trim(),
      emergency1Phone: newEmergency1Phone.trim() || newFatherPhone.trim() || newMotherPhone.trim(),
      emergency2Name: newEmergency2Name.trim(),
      emergency2Relation: newEmergency2Relation.trim(),
      emergency2Phone: newEmergency2Phone.trim(),

      docIdCard: newDocIdCard,
      docResidence: newDocResidence,
      docHealthReport: newDocHealthReport,
      docBiometricPhotos: newDocBiometricPhotos,
      docSignedContract: newDocSignedContract,
      docTransferReport: newDocTransferReport,

      status: 'active',
      gpa: 95.0,
      attendanceRate: 100,
      excusedDays: 0,
      unexcusedDays: 0,
      notes: 'Yeni kayıt resmi MEB onaylı öğrenci kütüğü.',
      grades: [
        { courseName: 'Türkçe', average: 95.0 },
        { courseName: 'Matematik', average: 92.0 },
        { courseName: 'Fen Bilimleri', average: 96.0 },
      ],
    }

    const updatedList = [createdStudent, ...studentsList]
    updateStudentsList(updatedList)

    toast.success(`${fullName} öğrencisi ${matchedClass.name} kütüğüne başarıyla kaydedildi!`)
    setIsNewStudentModalOpen(false)
    setNewTcNo('')
    setNewFirstName('')
    setNewLastName('')
    setNewMotherName('')
    setNewMotherPhone('')
    setNewFatherName('')
    setNewFatherPhone('')
    setNewAddress('')
  }

  // ── HANDLE NAKİL / TRANSFER ──
  const handleConfirmTransfer = () => {
    if (!studentToTransfer) return
    const formattedTarget = formatClassCode(targetTransferClass)
    const matchedClass = ALL_CLASSROOMS.find((c) => c.code === formattedTarget) || ALL_CLASSROOMS[0]
    const updatedStudent = {
      ...studentToTransfer,
      className: matchedClass.code,
      classroomName: matchedClass.name,
      classroomId: matchedClass.id,
      gradeLevel: matchedClass.grade_level,
      mentorTeacher: matchedClass.teacher_name
        ? `${matchedClass.teacher_name} (Sınıf Öğretmeni)`
        : (studentToTransfer.mentorTeacher || 'Özlem ZOR (Sınıf Öğretmeni)'),
      class: matchedClass.code,
    }
    const updatedList = studentsList.map((s) =>
      s.id === studentToTransfer.id ? updatedStudent : s
    )
    updateStudentsList(updatedList)

    // Update selectedStudentForDetail and editClassCode so Tab 2 and view mode update immediately
    if (selectedStudentForDetail && selectedStudentForDetail.id === studentToTransfer.id) {
      setSelectedStudentForDetail(updatedStudent)
      setEditClassCode(formattedTarget)
    }

    // Also sync active student profile if applicable
    try {
      if (typeof window !== 'undefined') {
        const rawProfile = localStorage.getItem('oxonom_student_profile')
        if (rawProfile) {
          const prof = JSON.parse(rawProfile)
          if (
            prof.id === studentToTransfer.id ||
            prof.studentNo === studentToTransfer.studentNo ||
            prof.name === studentToTransfer.name
          ) {
            prof.className = formattedTarget
            prof.class = formattedTarget
            localStorage.setItem('oxonom_student_profile', JSON.stringify(prof))
          }
        }
      }
    } catch (_) {}

    toast.success(
      `${studentToTransfer.name} öğrencisi başarıyla ${formattedTarget} şubesine nakil edildi.`
    )
    setIsTransferModalOpen(false)
    setStudentToTransfer(null)
  }

  const getUrl = (path: string) => {
    return orgSlug ? `/orgs/${orgSlug}${path}` : path
  }

  const activeOrg = useMemo(() => {
    return SCHOOL_ORGS.find((o) => o.id === selectedOrgId) || SCHOOL_ORGS[0]
  }, [selectedOrgId])

  const orgClassrooms = useMemo(() => {
    return getOrgClassrooms(selectedOrgId)
  }, [selectedOrgId])

  const classList = useMemo(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`oxonom_admin_classes_${selectedOrgId}`)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            const list = parsed.map((c: any) => formatClassCode(c.code))
            return ['ALL', ...Array.from(new Set(list))]
          }
        }
      } catch (_) {}
    }
    const codes = orgClassrooms.map((c) => formatClassCode(c.code))
    return ['ALL', ...Array.from(new Set(codes))]
  }, [orgClassrooms, selectedOrgId])

  // Filtered students by class and search
  const filteredStudents = useMemo(() => {
    return studentsList.filter((std) => {
      const stdCode = formatClassCode(std.className)
      const matchesClass =
        selectedClassCode === 'ALL' ||
        std.className === selectedClassCode ||
        stdCode === selectedClassCode ||
        stdCode === formatClassCode(selectedClassCode)
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

        {/* ── 1.5. KURUM VERİTABANI VE İZOLASYON ALANI ── */}
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

        {/* ── 2. QUICK ACTIONS BAR (+ Yeni Kayıt & ⇄ Nakil) ── */}
        <section className="px-4 mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              const defaultClass = classList.find((c) => c !== 'ALL') || orgClassrooms[0]?.code || '1/A'
              setNewClassCode(formatClassCode(defaultClass))
              setNewStudentNo(getNextAvailableStudentNo(studentsList))
              setNewStudentTab('kimlik')
              setIsNewStudentModalOpen(true)
            }}
            className="h-11 rounded-2xl bg-brand-gradient hover:opacity-95 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-950/20 transition-all cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Yeni Öğrenci Ekle</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (filteredStudents.length > 0) {
                setStudentToTransfer(filteredStudents[0])
                setTargetTransferClass(orgClassrooms[0]?.code || '9-A')
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
                  {cls === 'ALL' ? 'Tüm Şubeler' : `${formatClassCode(cls)} Şubesi`}
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
                        {formatClassCode(student.className)}
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
              className={`relative w-full sm:max-w-4xl lg:max-w-5xl max-h-[92vh] rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col z-10 overflow-hidden ${
                theme === 'dark'
                  ? 'bg-[#0E131F] text-white border-t sm:border border-gray-800'
                  : 'bg-white text-gray-900 border-t sm:border border-gray-200'
              }`}
            >
              <div className="pt-3 pb-1 flex justify-center sm:hidden">
                <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
              </div>

              {/* Title & Edit Mode Toggle */}
              <div className="px-6 pt-4 pb-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <span>{selectedStudentForDetail.name}</span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        {isEditingStudent ? 'DÜZENLEME MODU' : 'RESMİ KÜTÜK DOSYASI'}
                      </span>
                    </h3>
                    <p className="text-[11px] text-gray-400 font-medium">
                      MEB & MERNİS Onaylı Öğrenci Sicil Kütüğü · No: {selectedStudentForDetail.studentNo} · {formatClassCode(isEditingStudent ? editClassCode : selectedStudentForDetail.className)} Şubesi
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingStudent(!isEditingStudent)}
                    className={`h-9 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isEditingStudent
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        : 'bg-[#4B075F] hover:bg-[#620B79] text-white shadow-xs'
                    }`}
                  >
                    <Edit3 size={13} />
                    <span>{isEditingStudent ? 'Önizleme / Görüntüle' : 'Dosyayı Düzenle'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudentForDetail(null)
                      setIsEditingStudent(false)
                    }}
                    className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Scrollable Content Body */}
              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                {/* 1. Student Hero Profile Banner */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-gray-900 via-[#0D1829] to-[#08231A] text-white border border-emerald-500/30 relative overflow-hidden shadow-xl">
                  <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-gray-950 font-black text-xl flex items-center justify-center shadow-lg">
                          {selectedStudentForDetail.name
                            .split(' ')
                            .map((p: string) => p[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-gray-900 flex items-center justify-center">
                          <Check size={11} strokeWidth={3} className="text-white" />
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-lg font-black text-white leading-tight">
                            {selectedStudentForDetail.name}
                          </h4>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-lg bg-emerald-400 text-gray-950">
                            {formatClassCode(isEditingStudent ? editClassCode : selectedStudentForDetail.className)}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white/10 text-emerald-300">
                            {selectedStudentForDetail.enrollmentType || 'Yeni Kayıt'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-gray-300 mt-1 flex-wrap">
                          <span>Okul No: <strong className="text-white font-mono">{selectedStudentForDetail.studentNo}</strong></span>
                          <span>·</span>
                          <span>TC: <strong className="text-white font-mono">{selectedStudentForDetail.tcNo || '10000000146'}</strong></span>
                          <span>·</span>
                          <span className="flex items-center gap-1 text-emerald-300">
                            <School size={12} />
                            <span>Rehber: {selectedStudentForDetail.mentorTeacher || 'Özlem ZOR (Sınıf Öğretmeni)'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats Badges */}
                    <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">
                      <div className="px-3 py-1.5 rounded-xl bg-white/10 text-center">
                        <div className="text-[10px] text-gray-400 font-bold">Not Ortalaması</div>
                        <div className="text-sm font-black text-amber-300">%{typeof selectedStudentForDetail.gpa === 'number' ? selectedStudentForDetail.gpa : (Number(selectedStudentForDetail.gpa) || 0)}</div>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-white/10 text-center">
                        <div className="text-[10px] text-gray-400 font-bold">Devamsızlık</div>
                        <div className="text-sm font-black text-emerald-400">{selectedStudentForDetail.unexcusedDays || 0} Gün</div>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-center">
                        <div className="text-[10px] text-emerald-300 font-bold">Sicil & Disiplin</div>
                        <div className="text-xs font-black text-emerald-400">Temiz Sicil</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. IN-PLACE EDIT FORM (When isEditingStudent is true) */}
                {isEditingStudent ? (
                  <form onSubmit={handleSaveStudentEdit} className="space-y-4">
                    {/* BÖLÜM 1: KİMLİK & NÜFUS BİLGİLERİ */}
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-3">
                      <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2 uppercase tracking-wider pb-2 border-b border-gray-200 dark:border-gray-700">
                        <User size={14} />
                        <span>1. Kimlik & Nüfus Bilgileri (MERNİS Uyumlu)</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                            Öğrenci Adı *
                          </label>
                          <input
                            type="text"
                            value={editFirstName}
                            onChange={(e) => setEditFirstName(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 font-bold text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                            Öğrenci Soyadı *
                          </label>
                          <input
                            type="text"
                            value={editLastName}
                            onChange={(e) => setEditLastName(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 font-bold text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                            T.C. Kimlik No *
                          </label>
                          <input
                            type="text"
                            maxLength={11}
                            value={editTcNo}
                            onChange={(e) => setEditTcNo(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 font-mono font-bold text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                            Cinsiyet
                          </label>
                          <select
                            value={editGender}
                            onChange={(e) => setEditGender(e.target.value as any)}
                            className="w-full h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 font-bold text-gray-900 dark:text-white"
                          >
                            <option value="Erkek">Erkek</option>
                            <option value="Kız">Kız</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                            Doğum Tarihi
                          </label>
                          <input
                            type="text"
                            value={editBirthDate}
                            onChange={(e) => setEditBirthDate(e.target.value)}
                            placeholder="15.06.2017"
                            className="w-full h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 font-bold text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                            Doğum Yeri
                          </label>
                          <input
                            type="text"
                            value={editBirthPlace}
                            onChange={(e) => setEditBirthPlace(e.target.value)}
                            placeholder="Kadıköy / İstanbul"
                            className="w-full h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 font-medium text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                            Kan Grubu
                          </label>
                          <select
                            value={editBloodType}
                            onChange={(e) => setEditBloodType(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 font-bold text-gray-900 dark:text-white"
                          >
                            {['A Rh+', 'A Rh-', 'B Rh+', 'B Rh-', 'AB Rh+', 'AB Rh-', '0 Rh+', '0 Rh-'].map((b) => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                            Kronik Sağlık / Alerji Durumu
                          </label>
                          <input
                            type="text"
                            value={editHealthNote}
                            onChange={(e) => setEditHealthNote(e.target.value)}
                            placeholder="Örn: Polen alerjisi, astım vb."
                            className="w-full h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 font-medium text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                            Özel Eğitim / BEP & RAM Durumu
                          </label>
                          <select
                            value={editBepStatus}
                            onChange={(e) => setEditBepStatus(e.target.value as any)}
                            className="w-full h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 font-bold text-gray-900 dark:text-white"
                          >
                            <option value="Yok">Özel Eğitim / BEP Kaydı Yok (Standart)</option>
                            <option value="BEP Raporu Var">BEP (Bireyselleştirilmiş Eğitim Planı) Var</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* BÖLÜM 2: AKADEMİK & OKUL KAYIT BİLGİLERİ */}
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-3">
                      <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2 uppercase tracking-wider pb-2 border-b border-gray-200 dark:border-gray-700">
                        <Building2 size={14} />
                        <span>2. Akademik & Okul Kayıt Bilgileri</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                            Okul Numarası
                          </label>
                          <input
                            type="text"
                            value={editStudentNo}
                            onChange={(e) => setEditStudentNo(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 font-bold text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                            Kayıtlı Şube
                          </label>
                          <select
                            value={editClassCode}
                            onChange={(e) => setEditClassCode(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 font-bold text-gray-900 dark:text-white"
                          >
                            {classList.filter(c => c !== 'ALL').map((c) => (
                              <option key={c} value={c}>{c} Şubesi</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                            Kayıt Türü
                          </label>
                          <select
                            value={editEnrollmentType}
                            onChange={(e) => setEditEnrollmentType(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 font-bold text-gray-900 dark:text-white"
                          >
                            <option value="Yeni Kayıt">Yeni Kayıt</option>
                            <option value="Başka Okuldan Nakil">Başka Okuldan Nakil</option>
                            <option value="Burslu Kayıt">Burslu Kayıt</option>
                            <option value="Şehit/Gazi Yakını Kontenjanı">Şehit/Gazi Yakını Kontenjanı</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                            Kayıt Tarihi
                          </label>
                          <input
                            type="text"
                            value={editEnrollmentDate}
                            onChange={(e) => setEditEnrollmentDate(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 font-medium text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                            Servis & Taşımalı Durumu
                          </label>
                          <input
                            type="text"
                            value={editBusService}
                            onChange={(e) => setEditBusService(e.target.value)}
                            placeholder="Örn: Kullanmıyor veya A-04 Hattı (Kadıköy - Bostancı)"
                            className="w-full h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 font-medium text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                            Yemekhane Durumu
                          </label>
                          <select
                            value={editCafeteriaPlan}
                            onChange={(e) => setEditCafeteriaPlan(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 font-bold text-gray-900 dark:text-white"
                          >
                            <option value="Öğle Yemeği + İkindi Kahvaltısı">Öğle Yemeği + İkindi Kahvaltısı</option>
                            <option value="Yalnızca Öğle Yemeği">Yalnızca Öğle Yemeği</option>
                            <option value="Beslenme Çantası / Yemekhane Yok">Beslenme Çantası / Yemekhane Yok</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* BÖLÜM 3 & 4: ANNE & BABA BİLGİLERİ */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Anne Bilgileri */}
                      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-2.5">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-xs font-black text-pink-600 dark:text-pink-400 flex items-center gap-1.5 uppercase">
                            <Heart size={14} />
                            <span>Anne Bilgileri</span>
                          </span>
                          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-gray-600 dark:text-gray-300">
                            <input
                              type="checkbox"
                              checked={editMotherIsLegalGuardian}
                              onChange={(e) => setEditMotherIsLegalGuardian(e.target.checked)}
                              className="rounded text-emerald-600"
                            />
                            <span>Yasal Veli</span>
                          </label>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-500 mb-1">Adı Soyadı</label>
                          <input
                            type="text"
                            value={editMotherName}
                            onChange={(e) => setEditMotherName(e.target.value)}
                            className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 font-bold"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-gray-500 mb-1">T.C. Kimlik No</label>
                            <input
                              type="text"
                              maxLength={11}
                              value={editMotherTc}
                              onChange={(e) => setEditMotherTc(e.target.value)}
                              className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 font-mono text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-gray-500 mb-1">Telefon</label>
                            <input
                              type="tel"
                              value={editMotherPhone}
                              onChange={(e) => setEditMotherPhone(e.target.value)}
                              className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-gray-500 mb-1">E-Posta</label>
                            <input
                              type="email"
                              value={editMotherEmail}
                              onChange={(e) => setEditMotherEmail(e.target.value)}
                              className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-gray-500 mb-1">Meslek</label>
                            <input
                              type="text"
                              value={editMotherJob}
                              onChange={(e) => setEditMotherJob(e.target.value)}
                              className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-500 mb-1">Sağlık / Hayatta mı?</label>
                          <select
                            value={editMotherLivingStatus}
                            onChange={(e) => setEditMotherLivingStatus(e.target.value as any)}
                            className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs font-bold"
                          >
                            <option value="Hayatta">Hayatta</option>
                            <option value="Vefat">Vefat</option>
                          </select>
                        </div>
                      </div>

                      {/* Baba Bilgileri */}
                      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-2.5">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-xs font-black text-blue-600 dark:text-blue-400 flex items-center gap-1.5 uppercase">
                            <User size={14} />
                            <span>Baba Bilgileri</span>
                          </span>
                          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-gray-600 dark:text-gray-300">
                            <input
                              type="checkbox"
                              checked={editFatherIsLegalGuardian}
                              onChange={(e) => setEditFatherIsLegalGuardian(e.target.checked)}
                              className="rounded text-emerald-600"
                            />
                            <span>Yasal Veli</span>
                          </label>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-500 mb-1">Adı Soyadı</label>
                          <input
                            type="text"
                            value={editFatherName}
                            onChange={(e) => setEditFatherName(e.target.value)}
                            className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 font-bold"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-gray-500 mb-1">T.C. Kimlik No</label>
                            <input
                              type="text"
                              maxLength={11}
                              value={editFatherTc}
                              onChange={(e) => setEditFatherTc(e.target.value)}
                              className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 font-mono text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-gray-500 mb-1">Telefon</label>
                            <input
                              type="tel"
                              value={editFatherPhone}
                              onChange={(e) => setEditFatherPhone(e.target.value)}
                              className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-gray-500 mb-1">E-Posta</label>
                            <input
                              type="email"
                              value={editFatherEmail}
                              onChange={(e) => setEditFatherEmail(e.target.value)}
                              className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-gray-500 mb-1">Meslek</label>
                            <input
                              type="text"
                              value={editFatherJob}
                              onChange={(e) => setEditFatherJob(e.target.value)}
                              className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-500 mb-1">Sağlık / Hayatta mı?</label>
                          <select
                            value={editFatherLivingStatus}
                            onChange={(e) => setEditFatherLivingStatus(e.target.value as any)}
                            className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs font-bold"
                          >
                            <option value="Hayatta">Hayatta</option>
                            <option value="Vefat">Vefat</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* BÖLÜM 5: İKAMETGAH & ACİL DURUM İRTİBATLARI */}
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-3">
                      <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2 uppercase tracking-wider pb-2 border-b border-gray-200 dark:border-gray-700">
                        <MapPin size={14} />
                        <span>5. İkametgah Adresi & Acil Durum İrtibatları</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                            İkametgah Açık Adresi
                          </label>
                          <input
                            type="text"
                            value={editAddress}
                            onChange={(e) => setEditAddress(e.target.value)}
                            placeholder="Cadde, Sokak, No, Daire"
                            className="w-full h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                            İl / İlçe
                          </label>
                          <input
                            type="text"
                            value={editCityDistrict}
                            onChange={(e) => setEditCityDistrict(e.target.value)}
                            placeholder="İstanbul / Kadıköy"
                            className="w-full h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {/* 1. Acil Durum */}
                        <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 space-y-2">
                          <div className="text-[11px] font-bold text-gray-500 uppercase">1. Acil Durum İrtibatı</div>
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="text"
                              placeholder="Ad Soyad"
                              value={editEmergency1Name}
                              onChange={(e) => setEditEmergency1Name(e.target.value)}
                              className="col-span-1 h-8 px-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs"
                            />
                            <input
                              type="text"
                              placeholder="Yakınlık (Anne)"
                              value={editEmergency1Relation}
                              onChange={(e) => setEditEmergency1Relation(e.target.value)}
                              className="col-span-1 h-8 px-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs"
                            />
                            <input
                              type="tel"
                              placeholder="Telefon"
                              value={editEmergency1Phone}
                              onChange={(e) => setEditEmergency1Phone(e.target.value)}
                              className="col-span-1 h-8 px-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs"
                            />
                          </div>
                        </div>

                        {/* 2. Acil Durum */}
                        <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 space-y-2">
                          <div className="text-[11px] font-bold text-gray-500 uppercase">2. Acil Durum İrtibatı</div>
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="text"
                              placeholder="Ad Soyad"
                              value={editEmergency2Name}
                              onChange={(e) => setEditEmergency2Name(e.target.value)}
                              className="col-span-1 h-8 px-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs"
                            />
                            <input
                              type="text"
                              placeholder="Yakınlık (Amca)"
                              value={editEmergency2Relation}
                              onChange={(e) => setEditEmergency2Relation(e.target.value)}
                              className="col-span-1 h-8 px-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs"
                            />
                            <input
                              type="tel"
                              placeholder="Telefon"
                              value={editEmergency2Phone}
                              onChange={(e) => setEditEmergency2Phone(e.target.value)}
                              className="col-span-1 h-8 px-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* BÖLÜM 6: RESMİ EVRAKLAR & ARŞİV KONTROL LİSTESİ */}
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-3">
                      <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2 uppercase tracking-wider pb-2 border-b border-gray-200 dark:border-gray-700">
                        <FolderCheck size={14} />
                        <span>6. Resmi Evraklar & Arşiv Kontrol Listesi</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {[
                          { label: 'Nüfus Cüzdanı Fotokopisi', state: editDocIdCard, setter: setEditDocIdCard },
                          { label: 'İkametgah Belgesi (Yerleşim Yeri)', state: editDocResidence, setter: setEditDocResidence },
                          { label: 'Sağlık Raporu / Aşı Kartı', state: editDocHealthReport, setter: setEditDocHealthReport },
                          { label: '4 Adet Biyometrik Fotoğraf', state: editDocBiometricPhotos, setter: setEditDocBiometricPhotos },
                          { label: 'İmzalı Kayıt Sözleşmesi & KVKK Onayı', state: editDocSignedContract, setter: setEditDocSignedContract },
                          { label: 'Varsa Nakil Tasdiknamesi & Transkript', state: editDocTransferReport, setter: setEditDocTransferReport },
                        ].map((doc, idx) => (
                          <label
                            key={idx}
                            className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-colors ${
                              doc.state
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold'
                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={doc.state}
                              onChange={(e) => doc.setter(e.target.checked)}
                              className="rounded text-emerald-600"
                            />
                            <span className="text-xs leading-tight">{doc.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* BÖLÜM 7: İDARİ VE REHBERLİK NOTU */}
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-2">
                      <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300">
                        İdari / Rehberlik Gözlem Notu
                      </label>
                      <textarea
                        rows={2}
                        value={editAdminNote}
                        onChange={(e) => setEditAdminNote(e.target.value)}
                        className="w-full p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs font-medium text-gray-900 dark:text-white"
                      />
                    </div>

                    {/* Form Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingStudent(false)}
                        className="h-11 px-5 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-300 transition-colors cursor-pointer text-xs"
                      >
                        Vazgeç
                      </button>
                      <button
                        type="submit"
                        className="h-11 px-6 rounded-xl bg-[#4B075F] hover:bg-[#620B79] text-white font-black shadow-md shadow-purple-950/20 transition-all cursor-pointer text-xs flex items-center justify-center gap-2"
                      >
                        <Save size={15} strokeWidth={2.5} />
                        <span>Değişiklikleri ve Kütüğü Kaydet</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  /* 3. STRUCTURED CATEGORY TABS (VIEW MODE) */
                  <div className="space-y-4">
                    {/* Tabs strip */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-gray-100 dark:border-gray-800">
                      {[
                        { id: 'general', label: 'Kimlik & Nüfus', icon: User },
                        { id: 'school', label: 'Akademik & Okul', icon: Building2 },
                        { id: 'parents', label: 'Anne & Baba', icon: HeartHandshake },
                        { id: 'emergency', label: 'İkametgah & Acil', icon: MapPin },
                        { id: 'documents', label: 'Resmi Evraklar', icon: FolderCheck },
                        { id: 'academic', label: 'Notlar & Devamsızlık', icon: Award },
                      ].map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeDetailTab === tab.id
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveDetailTab(tab.id as any)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                              isActive
                                ? 'bg-[#4B075F] text-white shadow-xs'
                                : 'bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                          >
                            <Icon size={13} />
                            <span>{tab.label}</span>
                          </button>
                        )
                      })}
                    </div>

                    {/* TAB 1: KİMLİK & NÜFUS */}
                    {activeDetailTab === 'general' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                          <span className="text-gray-500 font-bold">T.C. Kimlik Numarası</span>
                          <span className="font-extrabold text-gray-900 dark:text-white font-mono flex items-center gap-1.5">
                            <span>{selectedStudentForDetail.tcNo || '10000000146'}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-sans font-black">
                              MERNİS ONAYLI
                            </span>
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                          <span className="text-gray-500 font-bold">Ad Soyad</span>
                          <span className="font-black text-gray-900 dark:text-white">
                            {selectedStudentForDetail.name}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                          <span className="text-gray-500 font-bold">Cinsiyet & Kan Grubu</span>
                          <span className="font-black text-gray-900 dark:text-white">
                            {selectedStudentForDetail.gender || 'Erkek'} · <span className="text-red-500 font-extrabold">{selectedStudentForDetail.bloodType || 'A Rh+'}</span>
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                          <span className="text-gray-500 font-bold">Doğum Tarihi & Yeri</span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {selectedStudentForDetail.birthDate || '15.06.2010'} ({selectedStudentForDetail.birthPlace || 'Kadıköy / İstanbul'})
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex justify-between items-center sm:col-span-2">
                          <span className="text-gray-500 font-bold">Kronik Sağlık & Alerji Durumu</span>
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            {selectedStudentForDetail.specialHealthNote || 'Herhangi bir sağlık engeli veya alerjisi bulunmamaktadır.'}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex justify-between items-center sm:col-span-2">
                          <span className="text-gray-500 font-bold">Özel Eğitim / BEP & RAM Durumu</span>
                          <span className="font-bold text-gray-700 dark:text-gray-300">
                            {selectedStudentForDetail.bepStatus || 'Standart Müfredat (BEP Raporu Yok)'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* TAB 2: AKADEMİK & OKUL */}
                    {activeDetailTab === 'school' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                          <span className="text-gray-500 font-bold">Kayıtlı Kurum</span>
                          <span className="font-extrabold text-gray-900 dark:text-white">
                            {selectedStudentForDetail.schoolName || activeOrg.name}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                          <span className="text-gray-500 font-bold">Sınıf & Şube</span>
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                            {formatClassCode(selectedStudentForDetail.className)} Şubesi
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                          <span className="text-gray-500 font-bold">Okul Numarası</span>
                          <span className="font-black text-gray-900 dark:text-white font-mono">
                            {selectedStudentForDetail.studentNo}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                          <span className="text-gray-500 font-bold">Sınıf Rehber Öğretmeni</span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {selectedStudentForDetail.mentorTeacher || 'Özlem ZOR (Sınıf Öğretmeni)'}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                          <span className="text-gray-500 font-bold">Kayıt Türü & Tarihi</span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {selectedStudentForDetail.enrollmentType || 'Yeni Kayıt'} · {selectedStudentForDetail.enrollmentDate || '01.09.2024'}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                          <span className="text-gray-500 font-bold">Servis & Yemekhane</span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {selectedStudentForDetail.busService || 'Servis Yok'} · {selectedStudentForDetail.cafeteriaPlan || 'Öğle Yemeği'}
                          </span>
                        </div>

                        <div className="sm:col-span-2 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setStudentToTransfer(selectedStudentForDetail)
                              setIsTransferModalOpen(true)
                            }}
                            className="w-full h-11 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                          >
                            <ArrowLeftRight size={15} />
                            <span>Bu Öğrenciyi Başka Şubeye Nakil Et</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* TAB 3: ANNE & BABA */}
                    {activeDetailTab === 'parents' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Anne Kartı */}
                        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/60 space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-xs font-black text-pink-600 dark:text-pink-400 flex items-center gap-1.5 uppercase">
                              <Heart size={14} />
                              <span>Anne Bilgileri</span>
                            </span>
                            {selectedStudentForDetail.motherIsLegalGuardian && (
                              <span className="text-[10px] font-black bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 px-2 py-0.5 rounded-full">
                                Yasal Veli
                              </span>
                            )}
                          </div>

                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Ad Soyad:</span>
                              <span className="font-black text-gray-900 dark:text-white">{selectedStudentForDetail.motherName || 'Ebru UĞURLU'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">T.C. Kimlik:</span>
                              <span className="font-mono font-bold text-gray-800 dark:text-gray-200">{selectedStudentForDetail.motherTc || '28374910284'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400">Telefon:</span>
                              <a
                                href={`tel:${selectedStudentForDetail.motherPhone || '+905329991100'}`}
                                className="font-mono text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                              >
                                <Phone size={11} />
                                <span>{selectedStudentForDetail.motherPhone || '+90 532 999 1100'}</span>
                              </a>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400">E-Posta:</span>
                              <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStudentForDetail.motherEmail || 'ebru@oxonom.com'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Meslek:</span>
                              <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStudentForDetail.motherJob || 'Mimar'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Durum:</span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedStudentForDetail.motherLivingStatus || 'Hayatta'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Baba Kartı */}
                        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/60 space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-xs font-black text-blue-600 dark:text-blue-400 flex items-center gap-1.5 uppercase">
                              <User size={14} />
                              <span>Baba Bilgileri</span>
                            </span>
                            {(selectedStudentForDetail.fatherIsLegalGuardian ?? true) && (
                              <span className="text-[10px] font-black bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                Birincil Yasal Veli
                              </span>
                            )}
                          </div>

                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Ad Soyad:</span>
                              <span className="font-black text-gray-900 dark:text-white">
                                {selectedStudentForDetail.fatherName || `${getStoredPrincipalProfile().name} (Okul Müdürü)`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">T.C. Kimlik:</span>
                              <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                                {selectedStudentForDetail.fatherTc || getStoredPrincipalProfile().tcNo || '19482019482'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400">Telefon:</span>
                              <a
                                href={`tel:${selectedStudentForDetail.fatherPhone || getStoredPrincipalProfile().phone || '+905329992200'}`}
                                className="font-mono text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                              >
                                <Phone size={11} />
                                <span>{selectedStudentForDetail.fatherPhone || getStoredPrincipalProfile().phone || '+90 532 999 2200'}</span>
                              </a>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400">E-Posta:</span>
                              <span className="font-medium text-gray-800 dark:text-gray-200">
                                {selectedStudentForDetail.fatherEmail || getStoredPrincipalProfile().email || 'mudur@oxonom.com'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Meslek:</span>
                              <span className="font-medium text-gray-800 dark:text-gray-200">
                                {selectedStudentForDetail.fatherJob || `${getStoredPrincipalProfile().title || 'Okul Müdürü'} · Kurum Yetkilisi`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Durum:</span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedStudentForDetail.fatherLivingStatus || 'Hayatta'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 4: İKAMETGAH & ACİL */}
                    {activeDetailTab === 'emergency' && (
                      <div className="space-y-3">
                        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-2">
                          <div className="text-[11px] font-bold text-gray-400 uppercase flex items-center gap-1">
                            <MapPin size={13} className="text-emerald-500" />
                            <span>Kayıtlı İkametgah Adresi</span>
                          </div>
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {selectedStudentForDetail.address || 'Caddebostan Mah. Bağdat Cad. No: 142/5 Kadıköy / İstanbul'}
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            İl / İlçe: {selectedStudentForDetail.cityDistrict || 'İstanbul / Kadıköy'}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-1.5">
                            <div className="text-[10px] text-gray-400 font-bold uppercase">1. Acil Durum İrtibatı</div>
                            <div className="text-sm font-black text-gray-900 dark:text-white">
                              {selectedStudentForDetail.emergency1Name || getStoredPrincipalProfile().name} ({selectedStudentForDetail.emergency1Relation || 'Baba - Okul Müdürü'})
                            </div>
                            <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                              {selectedStudentForDetail.emergency1Phone || getStoredPrincipalProfile().phone || '+90 532 999 2200'}
                            </div>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-1.5">
                            <div className="text-[10px] text-gray-400 font-bold uppercase">2. Acil Durum İrtibatı</div>
                            <div className="text-sm font-black text-gray-900 dark:text-white">
                              {selectedStudentForDetail.emergency2Name || 'Ebru UĞURLU'} ({selectedStudentForDetail.emergency2Relation || 'Anne'})
                            </div>
                            <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                              {selectedStudentForDetail.emergency2Phone || '+90 532 999 1100'}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            toast.success(`${selectedStudentForDetail.name} velisine acil durum SMS bildirimi gönderildi.`)
                          }}
                          className="w-full h-11 rounded-2xl bg-[#4B075F] hover:bg-[#620B79] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                        >
                          <Send size={14} />
                          <span>Veliye ve Acil İrtibat Numaralarına SMS Gönder</span>
                        </button>
                      </div>
                    )}

                    {/* TAB 5: RESMİ EVRAKLAR & ARŞİV */}
                    {activeDetailTab === 'documents' && (
                      <div className="space-y-3">
                        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FolderCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
                            <div>
                              <div className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                                Öğrenci Özlük Dosyası & Evrak Arşivi
                              </div>
                              <div className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80">
                                MEB İlçe Milli Eğitim Müdürlüğü Kayıt Standartları Kontrolü
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-xl bg-emerald-600 text-white">
                            Eksiksiz Arşiv
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {[
                            { name: 'Nüfus Cüzdanı Fotokopisi', status: selectedStudentForDetail.docIdCard ?? true },
                            { name: 'İkametgah Belgesi (Yerleşim Yeri)', status: selectedStudentForDetail.docResidence ?? true },
                            { name: 'Sağlık Raporu / Aşı Kartı', status: selectedStudentForDetail.docHealthReport ?? true },
                            { name: '4 Adet Biyometrik Fotoğraf', status: selectedStudentForDetail.docBiometricPhotos ?? true },
                            { name: 'İmzalı Kayıt Sözleşmesi & KVKK Onayı', status: selectedStudentForDetail.docSignedContract ?? true },
                            { name: 'Varsa Nakil Tasdiknamesi & Transkript', status: selectedStudentForDetail.docTransferReport ?? false },
                          ].map((doc, idx) => (
                            <div
                              key={idx}
                              className={`p-3 rounded-xl border flex items-center justify-between ${
                                doc.status
                                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-300'
                                  : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 text-gray-500'
                              }`}
                            >
                              <div className="flex items-center gap-2 font-bold text-xs">
                                {doc.status ? (
                                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                                ) : (
                                  <AlertCircle size={16} className="text-amber-500 shrink-0" />
                                )}
                                <span>{doc.name}</span>
                              </div>
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                                  doc.status
                                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                }`}
                              >
                                {doc.status ? 'Teslim Edildi' : 'Gerekli Değil / Eksik'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TAB 6: NOTLAR & DEVAMSIZLIK */}
                    {activeDetailTab === 'academic' && (
                      <div className="space-y-3">
                        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold uppercase">
                              Dönem Ağırlıklı Not Ortalaması
                            </div>
                            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
                              %{typeof selectedStudentForDetail.gpa === 'number' ? selectedStudentForDetail.gpa : (Number(selectedStudentForDetail.gpa) || 0)}
                            </div>
                          </div>
                          <span className={`text-xs font-black uppercase px-3 py-1 rounded-xl ${
                            (Number(selectedStudentForDetail.gpa) || 0) >= 85
                              ? 'bg-emerald-500 text-gray-950'
                              : (Number(selectedStudentForDetail.gpa) || 0) >= 60
                              ? 'bg-indigo-500 text-white'
                              : 'bg-rose-500 text-white'
                          }`}>
                            {(Number(selectedStudentForDetail.gpa) || 0) >= 85
                              ? 'Takdir Belgesi & Üstün Başarı'
                              : (Number(selectedStudentForDetail.gpa) || 0) >= 60
                              ? 'Teşekkür / Gelişim Sürecinde'
                              : 'Akademik Destek / Birebir Etüt'}
                          </span>
                        </div>

                        {/* Ders Notları */}
                        <div className="space-y-2">
                          <div className="text-xs font-black text-gray-500 px-1 uppercase tracking-wider">
                            Ders Başarı Ortalamaları
                          </div>
                          {(selectedStudentForDetail.grades || []).map((g: any) => (
                            <div
                              key={g.courseName}
                              className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 flex items-center justify-between"
                            >
                              <span className="font-bold text-gray-900 dark:text-white text-xs">{g.courseName}</span>
                              <div className="flex items-center gap-3">
                                <div className="w-28 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-500 rounded-full"
                                    style={{ width: `${g.average}%` }}
                                  />
                                </div>
                                <span className="font-black text-xs text-gray-900 dark:text-white min-w-8 text-right font-mono">
                                  {g.average}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Devamsızlık İstatistiği */}
                        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-gray-500 text-[10px]">Devamsızlık Durumu</div>
                            <div className="font-black text-gray-900 dark:text-white mt-0.5">
                              Özürsüz: {selectedStudentForDetail.unexcusedDays || 0} Gün · Özürlü: {selectedStudentForDetail.excusedDays || 0} Gün
                            </div>
                          </div>
                          <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            Düzenli Katılım
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Bottom Action Buttons in View Mode */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingStudent(true)}
                        className="h-11 rounded-2xl bg-[#4B075F] hover:bg-[#620B79] text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-950/20 transition-all cursor-pointer"
                      >
                        <Edit3 size={15} />
                        <span>Öğrenci Kütük Bilgilerini Düzenle</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          toast.success(`${selectedStudentForDetail.name} öğrencisinin resmi öğrenci belgesi PDF formatında hazırlandı ve indirildi!`)
                        }}
                        className="h-11 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold transition-colors cursor-pointer text-xs flex items-center justify-center gap-2"
                      >
                        <Download size={14} />
                        <span>Resmi Öğrenci Belgesi İndir (MEB PDF)</span>
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
              className={`relative w-full sm:max-w-4xl lg:max-w-5xl max-h-[92vh] rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col z-10 overflow-hidden ${
                theme === 'dark'
                  ? 'bg-[#0E131F] text-white border-t sm:border border-gray-800'
                  : 'bg-white text-gray-900 border-t sm:border border-gray-200'
              }`}
            >
              <div className="pt-3 pb-1 flex justify-center sm:hidden">
                <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
              </div>

              {/* Title & Close */}
              <div className="px-6 pt-4 pb-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#F0D8FA] text-[#4B075F] flex items-center justify-center font-black">
                    <Plus size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-900 dark:text-white">
                      Yeni Resmi Öğrenci Kaydı & Kütük Açılışı
                    </h3>
                    <p className="text-[11px] text-gray-400 font-medium">
                      MEBBİS & E-Okul Standartlarında A'dan Z'ye Eksiksiz Öğrenci Sicil Formu
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNewStudentModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Subtabs strip */}
              <div className="px-6 pt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-gray-100 dark:border-gray-800 pb-2.5">
                {[
                  { id: 'kimlik', label: '1. Kimlik & Nüfus', icon: User },
                  { id: 'okul', label: '2. Okul & Kayıt', icon: Building2 },
                  { id: 'ebeveyn', label: '3. Anne & Baba', icon: HeartHandshake },
                  { id: 'adres', label: '4. İkametgah & Acil', icon: MapPin },
                  { id: 'evraklar', label: '5. Resmi Evraklar', icon: FolderCheck },
                ].map((tab) => {
                  const Icon = tab.icon
                  const isActive = newStudentTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setNewStudentTab(tab.id as any)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#4B075F] text-white shadow-xs'
                          : 'bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon size={13} />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Form Body */}
              <form onSubmit={handleRegisterStudent} className="p-6 overflow-y-auto space-y-4 text-xs">
                {/* 1. KİMLİK & NÜFUS */}
                {newStudentTab === 'kimlik' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                          T.C. Kimlik Numarası *
                        </label>
                        <input
                          type="text"
                          maxLength={11}
                          value={newTcNo}
                          onChange={(e) => setNewTcNo(e.target.value)}
                          placeholder="11 Haneli T.C. Kimlik"
                          className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-mono font-bold text-gray-900 dark:text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                          Öğrenci Adı *
                        </label>
                        <input
                          type="text"
                          value={newFirstName}
                          onChange={(e) => setNewFirstName(e.target.value)}
                          placeholder="Örn: Erçil"
                          className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-bold text-gray-900 dark:text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                          Öğrenci Soyadı *
                        </label>
                        <input
                          type="text"
                          value={newLastName}
                          onChange={(e) => setNewLastName(e.target.value)}
                          placeholder="Örn: UĞURLU"
                          className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-bold text-gray-900 dark:text-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                          Cinsiyet
                        </label>
                        <select
                          value={newGender}
                          onChange={(e) => setNewGender(e.target.value as any)}
                          className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-bold"
                        >
                          <option value="Erkek">Erkek</option>
                          <option value="Kız">Kız</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                          Doğum Tarihi
                        </label>
                        <input
                          type="text"
                          value={newBirthDate}
                          onChange={(e) => setNewBirthDate(e.target.value)}
                          placeholder="15.06.2017"
                          className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                          Doğum Yeri
                        </label>
                        <input
                          type="text"
                          value={newBirthPlace}
                          onChange={(e) => setNewBirthPlace(e.target.value)}
                          placeholder="Kadıköy / İstanbul"
                          className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                          Kan Grubu
                        </label>
                        <select
                          value={newBloodType}
                          onChange={(e) => setNewBloodType(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-bold"
                        >
                          {['A Rh+', 'A Rh-', 'B Rh+', 'B Rh-', 'AB Rh+', 'AB Rh-', '0 Rh+', '0 Rh-'].map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                          Kronik Sağlık & Alerji Notu
                        </label>
                        <input
                          type="text"
                          value={newHealthNote}
                          onChange={(e) => setNewHealthNote(e.target.value)}
                          placeholder="Herhangi bir kronik rahatsızlık veya alerji"
                          className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                          Özel Eğitim / BEP & RAM Durumu
                        </label>
                        <select
                          value={newBepStatus}
                          onChange={(e) => setNewBepStatus(e.target.value as any)}
                          className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-bold"
                        >
                          <option value="Yok">Yok (Standart Müfredat)</option>
                          <option value="BEP Raporu Var">BEP Raporu Mevcut</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setNewStudentTab('okul')}
                        className="h-10 px-5 rounded-xl bg-[#4B075F] hover:bg-[#620B79] text-white font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <span>İleri: Okul & Kayıt Bilgileri</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. OKUL & KAYIT */}
                {newStudentTab === 'okul' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                          Kayıtlı Şube
                        </label>
                        <select
                          value={newClassCode}
                          onChange={(e) => setNewClassCode(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-bold"
                        >
                          {classList.filter(c => c !== 'ALL').map((c) => (
                            <option key={c} value={c}>{c} Şubesi</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300">
                            Okul Numarası
                          </label>
                          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                            Sistem Sıralı Verdi
                          </span>
                        </div>
                        <input
                          type="text"
                          value={newStudentNo}
                          onChange={(e) => setNewStudentNo(e.target.value)}
                          placeholder="102"
                          className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                          Kayıt Türü
                        </label>
                        <select
                          value={newEnrollmentType}
                          onChange={(e) => setNewEnrollmentType(e.target.value as any)}
                          className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-bold"
                        >
                          <option value="Yeni Kayıt">Yeni Kayıt</option>
                          <option value="Başka Okuldan Nakil">Başka Okuldan Nakil</option>
                          <option value="Burslu Kayıt">Burslu Kayıt</option>
                          <option value="Şehit/Gazi Yakını Kontenjanı">Şehit/Gazi Yakını Kontenjanı</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                          Kayıt Tarihi
                        </label>
                        <input
                          type="text"
                          value={newEnrollmentDate}
                          onChange={(e) => setNewEnrollmentDate(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                          Servis / Taşımalı Güzergahı
                        </label>
                        <input
                          type="text"
                          value={newBusService}
                          onChange={(e) => setNewBusService(e.target.value)}
                          placeholder="Örn: Kullanmıyor veya A-04 Hattı"
                          className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                          Yemekhane Tercihi
                        </label>
                        <select
                          value={newCafeteriaPlan}
                          onChange={(e) => setNewCafeteriaPlan(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-bold"
                        >
                          <option value="Öğle Yemeği + İkindi Kahvaltısı">Öğle Yemeği + İkindi Kahvaltısı</option>
                          <option value="Yalnızca Öğle Yemeği">Yalnızca Öğle Yemeği</option>
                          <option value="Beslenme Çantası / Yemekhane Yok">Beslenme Çantası / Yemekhane Yok</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setNewStudentTab('kimlik')}
                        className="h-10 px-4 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <ChevronLeft size={14} />
                        <span>Geri</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewStudentTab('ebeveyn')}
                        className="h-10 px-5 rounded-xl bg-[#4B075F] hover:bg-[#620B79] text-white font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <span>İleri: Anne & Baba Bilgileri</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. ANNE & BABA BİLGİLERİ */}
                {newStudentTab === 'ebeveyn' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Anne Bilgileri */}
                      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 space-y-2.5">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-xs font-black text-pink-600 dark:text-pink-400 flex items-center gap-1.5 uppercase">
                            <Heart size={14} />
                            <span>Anne Bilgileri</span>
                          </span>
                          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-gray-600 dark:text-gray-300">
                            <input
                              type="checkbox"
                              checked={newMotherIsLegalGuardian}
                              onChange={(e) => setNewMotherIsLegalGuardian(e.target.checked)}
                              className="rounded text-emerald-600"
                            />
                            <span>Yasal Veli</span>
                          </label>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-500 mb-1">Adı Soyadı</label>
                          <input
                            type="text"
                            value={newMotherName}
                            onChange={(e) => setNewMotherName(e.target.value)}
                            placeholder="Anne Adı Soyadı"
                            className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 font-bold"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-gray-500 mb-1">T.C. Kimlik</label>
                            <input
                              type="text"
                              maxLength={11}
                              value={newMotherTc}
                              onChange={(e) => setNewMotherTc(e.target.value)}
                              placeholder="TC Kimlik"
                              className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 font-mono text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-gray-500 mb-1">Telefon</label>
                            <input
                              type="tel"
                              value={newMotherPhone}
                              onChange={(e) => setNewMotherPhone(e.target.value)}
                              placeholder="+90 5XX XXX XX XX"
                              className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-gray-500 mb-1">E-Posta</label>
                            <input
                              type="email"
                              value={newMotherEmail}
                              onChange={(e) => setNewMotherEmail(e.target.value)}
                              placeholder="anne@eposta.com"
                              className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-gray-500 mb-1">Meslek</label>
                            <input
                              type="text"
                              value={newMotherJob}
                              onChange={(e) => setNewMotherJob(e.target.value)}
                              placeholder="Meslek"
                              className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-500 mb-1">Sağlık / Hayatta mı?</label>
                          <select
                            value={newMotherLivingStatus}
                            onChange={(e) => setNewMotherLivingStatus(e.target.value as any)}
                            className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs font-bold"
                          >
                            <option value="Hayatta">Hayatta</option>
                            <option value="Vefat">Vefat</option>
                          </select>
                        </div>
                      </div>

                      {/* Baba Bilgileri */}
                      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 space-y-2.5">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-xs font-black text-blue-600 dark:text-blue-400 flex items-center gap-1.5 uppercase">
                            <User size={14} />
                            <span>Baba Bilgileri</span>
                          </span>
                          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-gray-600 dark:text-gray-300">
                            <input
                              type="checkbox"
                              checked={newFatherIsLegalGuardian}
                              onChange={(e) => setNewFatherIsLegalGuardian(e.target.checked)}
                              className="rounded text-emerald-600"
                            />
                            <span>Birincil Yasal Veli</span>
                          </label>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-500 mb-1">Adı Soyadı</label>
                          <input
                            type="text"
                            value={newFatherName}
                            onChange={(e) => setNewFatherName(e.target.value)}
                            placeholder="Baba Adı Soyadı"
                            className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 font-bold"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-gray-500 mb-1">T.C. Kimlik</label>
                            <input
                              type="text"
                              maxLength={11}
                              value={newFatherTc}
                              onChange={(e) => setNewFatherTc(e.target.value)}
                              placeholder="TC Kimlik"
                              className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 font-mono text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-gray-500 mb-1">Telefon</label>
                            <input
                              type="tel"
                              value={newFatherPhone}
                              onChange={(e) => setNewFatherPhone(e.target.value)}
                              placeholder="+90 5XX XXX XX XX"
                              className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-gray-500 mb-1">E-Posta</label>
                            <input
                              type="email"
                              value={newFatherEmail}
                              onChange={(e) => setNewFatherEmail(e.target.value)}
                              placeholder="baba@eposta.com"
                              className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-gray-500 mb-1">Meslek</label>
                            <input
                              type="text"
                              value={newFatherJob}
                              onChange={(e) => setNewFatherJob(e.target.value)}
                              placeholder="Meslek"
                              className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-500 mb-1">Sağlık / Hayatta mı?</label>
                          <select
                            value={newFatherLivingStatus}
                            onChange={(e) => setNewFatherLivingStatus(e.target.value as any)}
                            className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs font-bold"
                          >
                            <option value="Hayatta">Hayatta</option>
                            <option value="Vefat">Vefat</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setNewStudentTab('okul')}
                        className="h-10 px-4 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <ChevronLeft size={14} />
                        <span>Geri</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewStudentTab('adres')}
                        className="h-10 px-5 rounded-xl bg-[#4B075F] hover:bg-[#620B79] text-white font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <span>İleri: İkametgah & Acil İrtibat</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. İKAMETGAH & ACİL İRTİBAT */}
                {newStudentTab === 'adres' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                          İkametgah Açık Adresi
                        </label>
                        <input
                          type="text"
                          value={newAddress}
                          onChange={(e) => setNewAddress(e.target.value)}
                          placeholder="Mahalle, Cadde, Sokak, Dış Kapı No, Daire"
                          className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                          İl / İlçe
                        </label>
                        <input
                          type="text"
                          value={newCityDistrict}
                          onChange={(e) => setNewCityDistrict(e.target.value)}
                          placeholder="İstanbul / Kadıköy"
                          className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {/* 1. Acil Durum */}
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 space-y-2">
                        <div className="text-[11px] font-bold text-gray-500 uppercase">1. Acil Durum İrtibatı</div>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Ad Soyad"
                            value={newEmergency1Name}
                            onChange={(e) => setNewEmergency1Name(e.target.value)}
                            className="col-span-1 h-8 px-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Yakınlık (Anne)"
                            value={newEmergency1Relation}
                            onChange={(e) => setNewEmergency1Relation(e.target.value)}
                            className="col-span-1 h-8 px-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs"
                          />
                          <input
                            type="tel"
                            placeholder="Telefon"
                            value={newEmergency1Phone}
                            onChange={(e) => setNewEmergency1Phone(e.target.value)}
                            className="col-span-1 h-8 px-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs"
                          />
                        </div>
                      </div>

                      {/* 2. Acil Durum */}
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 space-y-2">
                        <div className="text-[11px] font-bold text-gray-500 uppercase">2. Acil Durum İrtibatı</div>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Ad Soyad"
                            value={newEmergency2Name}
                            onChange={(e) => setNewEmergency2Name(e.target.value)}
                            className="col-span-1 h-8 px-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Yakınlık (Amca)"
                            value={newEmergency2Relation}
                            onChange={(e) => setNewEmergency2Relation(e.target.value)}
                            className="col-span-1 h-8 px-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs"
                          />
                          <input
                            type="tel"
                            placeholder="Telefon"
                            value={newEmergency2Phone}
                            onChange={(e) => setNewEmergency2Phone(e.target.value)}
                            className="col-span-1 h-8 px-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setNewStudentTab('ebeveyn')}
                        className="h-10 px-4 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <ChevronLeft size={14} />
                        <span>Geri</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewStudentTab('evraklar')}
                        className="h-10 px-5 rounded-xl bg-[#4B075F] hover:bg-[#620B79] text-white font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <span>İleri: Resmi Evraklar</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* 5. RESMİ EVRAKLAR & ARŞİV KONTROLÜ */}
                {newStudentTab === 'evraklar' && (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                      <FolderCheck size={16} />
                      <span>Teslim alınan resmi evrakları işaretleyiniz:</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {[
                        { label: 'Nüfus Cüzdanı Fotokopisi', state: newDocIdCard, setter: setNewDocIdCard },
                        { label: 'İkametgah Belgesi (Yerleşim Yeri)', state: newDocResidence, setter: setNewDocResidence },
                        { label: 'Sağlık Raporu / Aşı Kartı', state: newDocHealthReport, setter: setNewDocHealthReport },
                        { label: '4 Adet Biyometrik Fotoğraf', state: newDocBiometricPhotos, setter: setNewDocBiometricPhotos },
                        { label: 'İmzalı Kayıt Sözleşmesi & KVKK Onayı', state: newDocSignedContract, setter: setNewDocSignedContract },
                        { label: 'Varsa Nakil Tasdiknamesi & Transkript', state: newDocTransferReport, setter: setNewDocTransferReport },
                      ].map((doc, idx) => (
                        <label
                          key={idx}
                          className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-colors ${
                            doc.state
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold'
                              : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={doc.state}
                            onChange={(e) => doc.setter(e.target.checked)}
                            className="rounded text-emerald-600"
                          />
                          <span className="text-xs leading-tight">{doc.label}</span>
                        </label>
                      ))}
                    </div>

                    <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                      <button
                        type="button"
                        onClick={() => setNewStudentTab('adres')}
                        className="h-11 px-5 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <ChevronLeft size={14} />
                        <span>Geri</span>
                      </button>
                      <button
                        type="submit"
                        className="h-11 px-7 rounded-2xl bg-brand-gradient hover:opacity-95 text-white font-black text-sm shadow-md shadow-purple-950/20 transition-all cursor-pointer flex items-center gap-2"
                      >
                        <Check size={16} strokeWidth={2.5} />
                        <span>Öğrenciyi Sisteme & Kütüğe Kaydet</span>
                      </button>
                    </div>
                  </div>
                )}
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
                    Mevcut Şubesi: <strong className="text-[#10B981]">{formatClassCode(studentToTransfer.className)}</strong>
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
                      <option key={c} value={c}>{formatClassCode(c)} Şubesi</option>
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
      <div
        className="w-full sm:max-w-[390px] min-h-[100dvh] bg-[#F8FAFC] dark:bg-[#0A0D15] sm:shadow-2xl relative flex flex-col sm:border-x border-gray-200/60 dark:border-gray-800/80 overflow-x-hidden overscroll-y-none"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6.5rem)' }}
      >
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
