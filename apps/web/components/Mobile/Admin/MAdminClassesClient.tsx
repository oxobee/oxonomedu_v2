'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Phone,
  Mail,
  User,
  GraduationCap,
  CheckCircle2,
  Calendar,
  FileText,
  Sparkles,
  ShieldCheck,
  Check,
  Filter,
  Clock,
  Trash2,
  Edit3,
  Tv,
  Users,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Send,
  Download,
  BookOpen,
  School,
  Activity,
  Award,
  Copy,
  Save,
  Layers,
  HeartHandshake,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Archive,
} from 'lucide-react'
import toast from 'react-hot-toast'
import MobileHeader from '@components/Mobile/MobileHeader'
import MobileAdminDock from './MobileAdminDock'
import MobileAdminMoreSheet from './MobileAdminMoreSheet'
import { useMobileTheme } from '@components/Mobile/useMobileTheme'
import {
  SCHOOL_ORGS,
  getOrgTeachers,
  ALL_CLASSROOMS,
  generateClassStudents,
  DEMO_STUDENT,
} from '@services/demo/schoolDirectory'
import { useLHSession } from '@components/Contexts/LHSessionContext'

export interface MAdminClassesClientProps {
  orgSlug?: string
  hideHeader?: boolean
  hideDock?: boolean
}

export interface AdminClassroom {
  id: number
  code: string // e.g. "1-A", "3-B"
  name: string // e.g. "3-B Şubesi"
  gradeLevel: string // e.g. "3. Sınıf"
  gradeNumber: number // 1, 2, 3, 4, 5, 6, 7, 8
  orgId: number // 10 or 20
  roomName: string // e.g. "2. Kat · Derslik 204"
  teacherName: string // e.g. "Meryem MACİT"
  teacherBranch: string // e.g. "Sınıf Öğretmeni"
  teacherPhone: string // e.g. "+90 532 999 1019"
  teacherEmail: string // e.g. "meryemmacit@oxonom.com"
  studentCount: number // e.g. 30
  capacity: number // e.g. 32
  boysCount: number // e.g. 14
  girlsCount: number // e.g. 16
  presentToday: number // e.g. 29
  leaveToday: number // e.g. 1
  absentToday: number // e.g. 0
  attendanceRate: number // e.g. 96.7
  leaveNote?: string // e.g. "Burak KAYA (Sağlık Raporu)"
  academicAverage: number // e.g. 88.4
  courseAverages: {
    course: string
    average: number
    highest: number
    lowest: number
  }[]
  boardStatus: 'online' | 'offline'
  boardName: string
  scheduleSummary: string
  classPresident: string
  parentRepresentative: string
}

// Default initial primary classrooms (Necla Görer 1-4)
const DEFAULT_PRIMARY_CLASSES: AdminClassroom[] = [
  {
    id: 101,
    code: '1-A',
    name: '1-A Şubesi',
    gradeLevel: '1. Sınıf',
    gradeNumber: 1,
    orgId: 10,
    roomName: '1. Kat · Derslik 101',
    teacherName: 'Özlem ZOR',
    teacherBranch: 'Sınıf Öğretmeni',
    teacherPhone: '+90 532 999 1001',
    teacherEmail: 'ozlemzor@oxonom.com',
    studentCount: 30,
    capacity: 32,
    boysCount: 15,
    girlsCount: 15,
    presentToday: 29,
    leaveToday: 1,
    absentToday: 0,
    attendanceRate: 96.7,
    leaveNote: 'Ahmet YILDIZ (Sağlık Raporu)',
    academicAverage: 91.2,
    courseAverages: [
      { course: 'Türkçe', average: 92.5, highest: 100, lowest: 78 },
      { course: 'Matematik', average: 88.0, highest: 100, lowest: 75 },
      { course: 'Hayat Bilgisi', average: 94.0, highest: 100, lowest: 82 },
      { course: 'Görsel Sanatlar', average: 96.5, highest: 100, lowest: 88 },
    ],
    boardStatus: 'online',
    boardName: '1-A Akıllı Tahta',
    scheduleSummary: 'Haftalık 30 Saat',
    classPresident: 'Erçil Evren UĞURLU',
    parentRepresentative: 'Ebru UĞURLU',
  },
  {
    id: 102,
    code: '1-B',
    name: '1-B Şubesi',
    gradeLevel: '1. Sınıf',
    gradeNumber: 1,
    orgId: 10,
    roomName: '1. Kat · Derslik 102',
    teacherName: 'Beyzanur SALMANLI',
    teacherBranch: 'Sınıf Öğretmeni',
    teacherPhone: '+90 532 999 1002',
    teacherEmail: 'beyzanursalmanli@oxonom.com',
    studentCount: 28,
    capacity: 32,
    boysCount: 13,
    girlsCount: 15,
    presentToday: 28,
    leaveToday: 0,
    absentToday: 0,
    attendanceRate: 100,
    academicAverage: 89.5,
    courseAverages: [
      { course: 'Türkçe', average: 90.0, highest: 100, lowest: 74 },
      { course: 'Matematik', average: 87.5, highest: 100, lowest: 70 },
      { course: 'Hayat Bilgisi', average: 92.0, highest: 100, lowest: 80 },
    ],
    boardStatus: 'online',
    boardName: '1-B Akıllı Tahta',
    scheduleSummary: 'Haftalık 30 Saat',
    classPresident: 'Zeynep DEMİR',
    parentRepresentative: 'Murat DEMİR',
  },
  {
    id: 103,
    code: '1-C',
    name: '1-C Şubesi',
    gradeLevel: '1. Sınıf',
    gradeNumber: 1,
    orgId: 10,
    roomName: '1. Kat · Derslik 103',
    teacherName: 'Özge KABA',
    teacherBranch: 'Sınıf Öğretmeni',
    teacherPhone: '+90 532 999 1003',
    teacherEmail: 'ozgekaba@oxonom.com',
    studentCount: 29,
    capacity: 32,
    boysCount: 14,
    girlsCount: 15,
    presentToday: 27,
    leaveToday: 2,
    absentToday: 0,
    attendanceRate: 93.1,
    leaveNote: 'Can POLAT, Eylül AYDIN (Mazeret İzni)',
    academicAverage: 90.1,
    courseAverages: [
      { course: 'Türkçe', average: 91.0, highest: 100, lowest: 76 },
      { course: 'Matematik', average: 88.5, highest: 100, lowest: 72 },
      { course: 'Hayat Bilgisi', average: 93.0, highest: 100, lowest: 80 },
    ],
    boardStatus: 'online',
    boardName: '1-C Akıllı Tahta',
    scheduleSummary: 'Haftalık 30 Saat',
    classPresident: 'Mustafa KOÇ',
    parentRepresentative: 'Hülya KOÇ',
  },
  {
    id: 104,
    code: '2-A',
    name: '2-A Şubesi',
    gradeLevel: '2. Sınıf',
    gradeNumber: 2,
    orgId: 10,
    roomName: '1. Kat · Derslik 104',
    teacherName: 'Zeliha EMAN',
    teacherBranch: 'Sınıf Öğretmeni',
    teacherPhone: '+90 532 999 1008',
    teacherEmail: 'zelihaeman@oxonom.com',
    studentCount: 30,
    capacity: 32,
    boysCount: 16,
    girlsCount: 14,
    presentToday: 29,
    leaveToday: 1,
    absentToday: 0,
    attendanceRate: 96.7,
    academicAverage: 87.8,
    courseAverages: [
      { course: 'Türkçe', average: 88.0, highest: 100, lowest: 70 },
      { course: 'Matematik', average: 85.5, highest: 100, lowest: 68 },
      { course: 'Hayat Bilgisi', average: 90.0, highest: 100, lowest: 75 },
    ],
    boardStatus: 'online',
    boardName: '2-A Akıllı Tahta',
    scheduleSummary: 'Haftalık 30 Saat',
    classPresident: 'Defne ŞAHİN',
    parentRepresentative: 'Gökhan ŞAHİN',
  },
  {
    id: 105,
    code: '2-B',
    name: '2-B Şubesi',
    gradeLevel: '2. Sınıf',
    gradeNumber: 2,
    orgId: 10,
    roomName: '1. Kat · Derslik 105',
    teacherName: 'Mehmet Akif YEŞİLYURT',
    teacherBranch: 'Sınıf Öğretmeni',
    teacherPhone: '+90 532 999 1009',
    teacherEmail: 'mehmetakifyesilyurt@oxonom.com',
    studentCount: 29,
    capacity: 32,
    boysCount: 15,
    girlsCount: 14,
    presentToday: 29,
    leaveToday: 0,
    absentToday: 0,
    attendanceRate: 100,
    academicAverage: 88.0,
    courseAverages: [
      { course: 'Türkçe', average: 89.0, highest: 100, lowest: 72 },
      { course: 'Matematik', average: 86.0, highest: 100, lowest: 69 },
      { course: 'Hayat Bilgisi', average: 91.0, highest: 100, lowest: 78 },
    ],
    boardStatus: 'online',
    boardName: '2-B Akıllı Tahta',
    scheduleSummary: 'Haftalık 30 Saat',
    classPresident: 'Emir ÇELİK',
    parentRepresentative: 'Banu ÇELİK',
  },
  {
    id: 106,
    code: '2-C',
    name: '2-C Şubesi',
    gradeLevel: '2. Sınıf',
    gradeNumber: 2,
    orgId: 10,
    roomName: '1. Kat · Derslik 106',
    teacherName: 'Çiğdem TINGIR',
    teacherBranch: 'Sınıf Öğretmeni',
    teacherPhone: '+90 532 999 1010',
    teacherEmail: 'cigdemtingir@oxonom.com',
    studentCount: 31,
    capacity: 32,
    boysCount: 16,
    girlsCount: 15,
    presentToday: 30,
    leaveToday: 1,
    absentToday: 0,
    attendanceRate: 96.8,
    academicAverage: 86.4,
    courseAverages: [
      { course: 'Türkçe', average: 87.0, highest: 100, lowest: 68 },
      { course: 'Matematik', average: 84.0, highest: 100, lowest: 65 },
      { course: 'Hayat Bilgisi', average: 89.0, highest: 100, lowest: 74 },
    ],
    boardStatus: 'offline',
    boardName: '2-C Akıllı Tahta',
    scheduleSummary: 'Haftalık 30 Saat',
    classPresident: 'Yusuf ASLAN',
    parentRepresentative: 'Kemal ASLAN',
  },
  {
    id: 107,
    code: '3-A',
    name: '3-A Şubesi',
    gradeLevel: '3. Sınıf',
    gradeNumber: 3,
    orgId: 10,
    roomName: '2. Kat · Derslik 201',
    teacherName: 'Tansu ÜREK',
    teacherBranch: 'Sınıf Öğretmeni',
    teacherPhone: '+90 532 999 1018',
    teacherEmail: 'tansuurek@oxonom.com',
    studentCount: 30,
    capacity: 32,
    boysCount: 14,
    girlsCount: 16,
    presentToday: 29,
    leaveToday: 1,
    absentToday: 0,
    attendanceRate: 96.7,
    academicAverage: 87.5,
    courseAverages: [
      { course: 'Türkçe', average: 88.5, highest: 100, lowest: 70 },
      { course: 'Matematik', average: 85.0, highest: 100, lowest: 67 },
      { course: 'Fen Bilimleri', average: 89.0, highest: 100, lowest: 74 },
      { course: 'Hayat Bilgisi', average: 90.0, highest: 100, lowest: 75 },
    ],
    boardStatus: 'online',
    boardName: '3-A Akıllı Tahta',
    scheduleSummary: 'Haftalık 30 Saat',
    classPresident: 'Elif YILMAZ',
    parentRepresentative: 'Ahmet YILMAZ',
  },
  {
    id: 108,
    code: '3-B',
    name: '3-B Şubesi',
    gradeLevel: '3. Sınıf',
    gradeNumber: 3,
    orgId: 10,
    roomName: '2. Kat · Derslik 202',
    teacherName: 'Meryem MACİT',
    teacherBranch: 'Sınıf Öğretmeni',
    teacherPhone: '+90 532 999 1019',
    teacherEmail: 'meryemmacit@oxonom.com',
    studentCount: 30,
    capacity: 32,
    boysCount: 14,
    girlsCount: 16,
    presentToday: 29,
    leaveToday: 1,
    absentToday: 0,
    attendanceRate: 96.7,
    leaveNote: 'Burak KAYA (Sağlık Raporu - Veli Bilgilendirildi)',
    academicAverage: 88.4,
    courseAverages: [
      { course: 'Türkçe', average: 89.5, highest: 100, lowest: 72 },
      { course: 'Matematik', average: 84.2, highest: 100, lowest: 68 },
      { course: 'Hayat Bilgisi / Fen', average: 91.8, highest: 100, lowest: 75 },
      { course: 'Yabancı Dil (İngilizce)', average: 86.0, highest: 100, lowest: 70 },
      { course: 'Görsel Sanatlar & Müzik', average: 96.0, highest: 100, lowest: 85 },
    ],
    boardStatus: 'online',
    boardName: '3-B Akıllı Tahta',
    scheduleSummary: 'Haftalık 30 Saat',
    classPresident: 'Erçil Evren UĞURLU',
    parentRepresentative: 'Ebru UĞURLU',
  },
  {
    id: 109,
    code: '3-C',
    name: '3-C Şubesi',
    gradeLevel: '3. Sınıf',
    gradeNumber: 3,
    orgId: 10,
    roomName: '2. Kat · Derslik 203',
    teacherName: 'Hümeyra KARAALİOĞLU',
    teacherBranch: 'Sınıf Öğretmeni',
    teacherPhone: '+90 532 999 1020',
    teacherEmail: 'humeyrakaraalioglu@oxonom.com',
    studentCount: 29,
    capacity: 32,
    boysCount: 15,
    girlsCount: 14,
    presentToday: 28,
    leaveToday: 1,
    absentToday: 0,
    attendanceRate: 96.6,
    academicAverage: 89.0,
    courseAverages: [
      { course: 'Türkçe', average: 90.0, highest: 100, lowest: 72 },
      { course: 'Matematik', average: 86.5, highest: 100, lowest: 70 },
      { course: 'Fen Bilimleri', average: 91.0, highest: 100, lowest: 76 },
    ],
    boardStatus: 'online',
    boardName: '3-C Akıllı Tahta',
    scheduleSummary: 'Haftalık 30 Saat',
    classPresident: 'Kerem ÖZTÜRK',
    parentRepresentative: 'Filiz ÖZTÜRK',
  },
  {
    id: 110,
    code: '4-A',
    name: '4-A Şubesi',
    gradeLevel: '4. Sınıf',
    gradeNumber: 4,
    orgId: 10,
    roomName: '2. Kat · Derslik 204',
    teacherName: 'Hivda SADAK',
    teacherBranch: 'Sınıf Öğretmeni',
    teacherPhone: '+90 532 999 1025',
    teacherEmail: 'hivdasadak@oxonom.com',
    studentCount: 30,
    capacity: 32,
    boysCount: 14,
    girlsCount: 16,
    presentToday: 30,
    leaveToday: 0,
    absentToday: 0,
    attendanceRate: 100,
    academicAverage: 92.1,
    courseAverages: [
      { course: 'Türkçe', average: 93.0, highest: 100, lowest: 78 },
      { course: 'Matematik', average: 89.5, highest: 100, lowest: 74 },
      { course: 'Fen Bilimleri', average: 94.0, highest: 100, lowest: 80 },
      { course: 'Sosyal Bilgiler', average: 93.5, highest: 100, lowest: 79 },
    ],
    boardStatus: 'online',
    boardName: '4-A Akıllı Tahta',
    scheduleSummary: 'Haftalık 30 Saat',
    classPresident: 'Duru AYDIN',
    parentRepresentative: 'Bülent AYDIN',
  },
  {
    id: 111,
    code: '4-B',
    name: '4-B Şubesi',
    gradeLevel: '4. Sınıf',
    gradeNumber: 4,
    orgId: 10,
    roomName: '2. Kat · Derslik 205',
    teacherName: 'Vildan GÜNEŞ',
    teacherBranch: 'Sınıf Öğretmeni',
    teacherPhone: '+90 532 999 1026',
    teacherEmail: 'vildangunes@oxonom.com',
    studentCount: 29,
    capacity: 32,
    boysCount: 15,
    girlsCount: 14,
    presentToday: 28,
    leaveToday: 1,
    absentToday: 0,
    attendanceRate: 96.6,
    academicAverage: 90.4,
    courseAverages: [
      { course: 'Türkçe', average: 91.0, highest: 100, lowest: 75 },
      { course: 'Matematik', average: 88.0, highest: 100, lowest: 71 },
      { course: 'Fen Bilimleri', average: 92.0, highest: 100, lowest: 77 },
      { course: 'Sosyal Bilgiler', average: 92.0, highest: 100, lowest: 76 },
    ],
    boardStatus: 'online',
    boardName: '4-B Akıllı Tahta',
    scheduleSummary: 'Haftalık 30 Saat',
    classPresident: 'Ali ÇETİN',
    parentRepresentative: 'Sevda ÇETİN',
  },
  {
    id: 112,
    code: '4-C',
    name: '4-C Şubesi',
    gradeLevel: '4. Sınıf',
    gradeNumber: 4,
    orgId: 10,
    roomName: '2. Kat · Derslik 206',
    teacherName: 'Derya ÇOBAN',
    teacherBranch: 'Sınıf Öğretmeni',
    teacherPhone: '+90 532 999 1027',
    teacherEmail: 'deryacoban@oxonom.com',
    studentCount: 30,
    capacity: 32,
    boysCount: 16,
    girlsCount: 14,
    presentToday: 29,
    leaveToday: 1,
    absentToday: 0,
    attendanceRate: 96.7,
    academicAverage: 89.8,
    courseAverages: [
      { course: 'Türkçe', average: 90.5, highest: 100, lowest: 73 },
      { course: 'Matematik', average: 87.0, highest: 100, lowest: 70 },
      { course: 'Fen Bilimleri', average: 91.5, highest: 100, lowest: 76 },
      { course: 'Sosyal Bilgiler', average: 91.0, highest: 100, lowest: 75 },
    ],
    boardStatus: 'online',
    boardName: '4-C Akıllı Tahta',
    scheduleSummary: 'Haftalık 30 Saat',
    classPresident: 'Azra KARA',
    parentRepresentative: 'Sinan KARA',
  },
]

// Default middle school classrooms (Fevzi Kutlu 5-8)
const DEFAULT_MIDDLE_CLASSES: AdminClassroom[] = [
  {
    id: 201,
    code: '5-A',
    name: '5-A Şubesi',
    gradeLevel: '5. Sınıf',
    gradeNumber: 5,
    orgId: 20,
    roomName: '1. Kat · Derslik 101',
    teacherName: 'Esin AKKAN',
    teacherBranch: 'Matematik Öğretmeni',
    teacherPhone: '+90 532 999 2001',
    teacherEmail: 'esinakkan@oxonom.com',
    studentCount: 26,
    capacity: 30,
    boysCount: 13,
    girlsCount: 13,
    presentToday: 25,
    leaveToday: 1,
    absentToday: 0,
    attendanceRate: 96.2,
    academicAverage: 85.5,
    courseAverages: [
      { course: 'Türkçe', average: 87.0, highest: 100, lowest: 68 },
      { course: 'Matematik', average: 82.5, highest: 100, lowest: 60 },
      { course: 'Fen Bilimleri', average: 86.0, highest: 100, lowest: 65 },
      { course: 'İngilizce', average: 84.0, highest: 100, lowest: 62 },
    ],
    boardStatus: 'online',
    boardName: '5-A Akıllı Tahta',
    scheduleSummary: 'Haftalık 35 Saat',
    classPresident: 'Poyraz YILMAZ',
    parentRepresentative: 'Bülent YILMAZ',
  },
  {
    id: 202,
    code: '6-A',
    name: '6-A Şubesi',
    gradeLevel: '6. Sınıf',
    gradeNumber: 6,
    orgId: 20,
    roomName: '2. Kat · Derslik 201',
    teacherName: 'Bülent TURAN',
    teacherBranch: 'Fen Bilimleri',
    teacherPhone: '+90 532 999 2003',
    teacherEmail: 'bulentturan@oxonom.com',
    studentCount: 27,
    capacity: 30,
    boysCount: 14,
    girlsCount: 13,
    presentToday: 26,
    leaveToday: 1,
    absentToday: 0,
    attendanceRate: 96.3,
    academicAverage: 84.2,
    courseAverages: [
      { course: 'Türkçe', average: 85.0, highest: 100, lowest: 64 },
      { course: 'Matematik', average: 81.0, highest: 100, lowest: 58 },
      { course: 'Fen Bilimleri', average: 86.5, highest: 100, lowest: 66 },
    ],
    boardStatus: 'online',
    boardName: '6-A Akıllı Tahta',
    scheduleSummary: 'Haftalık 35 Saat',
    classPresident: 'Nehir ŞEN',
    parentRepresentative: 'Gül ŞEN',
  },
  {
    id: 203,
    code: '7-A',
    name: '7-A Şubesi',
    gradeLevel: '7. Sınıf',
    gradeNumber: 7,
    orgId: 20,
    roomName: '3. Kat · Derslik 301',
    teacherName: 'Beritan ŞENATEŞ',
    teacherBranch: 'Türkçe Öğretmeni',
    teacherPhone: '+90 532 999 2004',
    teacherEmail: 'beritansenates@oxonom.com',
    studentCount: 28,
    capacity: 30,
    boysCount: 14,
    girlsCount: 14,
    presentToday: 27,
    leaveToday: 1,
    absentToday: 0,
    attendanceRate: 96.4,
    academicAverage: 86.8,
    courseAverages: [
      { course: 'Türkçe', average: 88.5, highest: 100, lowest: 70 },
      { course: 'Matematik', average: 83.0, highest: 100, lowest: 60 },
      { course: 'Fen Bilimleri', average: 87.0, highest: 100, lowest: 65 },
    ],
    boardStatus: 'online',
    boardName: '7-A Akıllı Tahta',
    scheduleSummary: 'Haftalık 35 Saat',
    classPresident: 'Kaan ÇETİN',
    parentRepresentative: 'Ahmet ÇETİN',
  },
  {
    id: 204,
    code: '8-A (LGS)',
    name: '8-A (LGS Şubesi)',
    gradeLevel: '8. Sınıf',
    gradeNumber: 8,
    orgId: 20,
    roomName: '3. Kat · Derslik 304',
    teacherName: 'Orkun AYDIN',
    teacherBranch: 'Matematik / LGS Koçu',
    teacherPhone: '+90 532 999 2006',
    teacherEmail: 'orkunaydin@oxonom.com',
    studentCount: 26,
    capacity: 28,
    boysCount: 13,
    girlsCount: 13,
    presentToday: 26,
    leaveToday: 0,
    absentToday: 0,
    attendanceRate: 100,
    academicAverage: 91.5,
    courseAverages: [
      { course: 'Türkçe', average: 92.0, highest: 100, lowest: 78 },
      { course: 'LGS Matematik', average: 89.0, highest: 100, lowest: 72 },
      { course: 'Fen Bilimleri', average: 93.5, highest: 100, lowest: 80 },
      { course: 'İnkılap Tarihi', average: 94.0, highest: 100, lowest: 82 },
    ],
    boardStatus: 'online',
    boardName: '8-A Akıllı Tahta',
    scheduleSummary: 'Haftalık 36 Saat (Etüt Dahil)',
    classPresident: 'Asya KAYA',
    parentRepresentative: 'Engin KAYA',
  },
]

export function normalizeClassroom(c: AdminClassroom): AdminClassroom {
  const codeRaw = (c.code || '').trim()
  const gradeLevelRaw = (c.gradeLevel || '').trim()

  const matchGrade = gradeLevelRaw.match(/\d+/) || codeRaw.match(/^\d+/)
  const gradeNum = matchGrade ? matchGrade[0] : (c.gradeNumber ? String(c.gradeNumber) : '1')

  let branchLetter = ''
  if (codeRaw.includes('/') || codeRaw.includes('-')) {
    const parts = codeRaw.split(/[\/\-]/)
    branchLetter = parts[parts.length - 1].trim().toUpperCase()
  } else if (/^[A-Za-zÇĞİÖŞÜçğıöşü]+$/.test(codeRaw)) {
    branchLetter = codeRaw.toUpperCase()
  } else {
    const letterMatch = (c.name || '').match(/\b([A-ZÇĞİÖŞÜ])\b/)
    branchLetter = letterMatch ? letterMatch[1] : 'A'
  }

  const cleanCode = `${gradeNum}/${branchLetter}`
  let academicAverage = c.academicAverage
  let courseAverages = c.courseAverages

  if (typeof window !== 'undefined' && (cleanCode === '9/A' || c.code?.includes('9'))) {
    try {
      const rawStudents = localStorage.getItem('oxonom_m_students_v3')
      if (rawStudents) {
        const parsed = JSON.parse(rawStudents)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const classStudents = parsed.filter(
            (s: any) => s.className?.includes('9-A') || s.className?.includes('9/A')
          )
          if (classStudents.length > 0) {
            const student = classStudents[0]
            if (student.grades && student.grades.length > 0) {
              const valid = student.grades.filter(
                (g: any) =>
                  g.average !== undefined &&
                  g.average !== null &&
                  !isNaN(Number(g.average)) &&
                  String(g.average) !== ''
              )
              if (valid.length > 0) {
                const avg = Number(
                  (
                    valid.reduce((sum: number, g: any) => sum + Number(g.average), 0) /
                    valid.length
                  ).toFixed(1)
                )
                academicAverage = avg
                courseAverages = valid.map((g: any) => ({
                  course: g.courseName,
                  average: Number(g.average),
                  highest: Number(g.exam2 || g.exam1 || g.average),
                  lowest: Number(g.exam1 || g.average),
                }))
              }
            } else if (typeof student.gpa === 'number') {
              academicAverage = student.gpa
            }
          }
        }
      }
    } catch (_) {}
  }

  return {
    ...c,
    code: cleanCode,
    name: `${cleanCode} Şubesi`,
    roomName: c.roomName ? c.roomName.replace(/Derslik\s*(\d+)[\/-]([A-Za-z])/g, 'Derslik $1/$2') : `Derslik ${cleanCode}`,
    boardName: `${cleanCode} Akıllı Tahta`,
    academicAverage,
    courseAverages,
  }
}

// ── DEFAULT 1. SINIFTAN 8. SINIFA KADAR TÜM ŞUBELER (A, B, C, D — TOPLAM 32 ŞUBE) ──
// User Rule: "mevcut tüm sınıf şubeleri sil ve 1.sınıftan 8.sınıfa kadar sınıf ve A'dan D'ye kadar her sınıfa şube ekle."
export const GENERATE_CLASSES_1_TO_8_A_D = (): AdminClassroom[] => {
  const classes: AdminClassroom[] = []
  const branches = ['A', 'B', 'C', 'D']
  const teachers = [
    { name: 'Özlem ZOR', branch: 'Sınıf Öğretmeni' },
    { name: 'Beyzanur SALMANLI', branch: 'Sınıf Öğretmeni' },
    { name: 'Şevval ÇINAR', branch: 'Sınıf Öğretmeni' },
    { name: 'İpek ŞAHİN', branch: 'Sınıf Öğretmeni' },
    { name: 'Meryem MACİT', branch: 'Sınıf Öğretmeni' },
    { name: 'Hilal KAYA', branch: 'Sınıf Öğretmeni' },
    { name: 'Sümeyra Nur TAŞDEMİR', branch: 'Sınıf Öğretmeni' },
    { name: 'Aslı ERGÜN', branch: 'Sınıf Öğretmeni' },
    { name: 'Ebru TEKNECİ', branch: 'Türkçe / Edebiyat' },
    { name: 'Orkun AYDIN', branch: 'Matematik' },
    { name: 'Beritan ŞENATEŞ', branch: 'Fen Bilimleri' },
    { name: 'Deniz ARSLAN', branch: 'Sosyal Bilgiler' },
    { name: 'Canan YILDIRIM', branch: 'İngilizce' },
    { name: 'Murat DEMİR', branch: 'Bilişim Teknolojileri' },
    { name: 'Gülşah ÖZTÜRK', branch: 'Görsel Sanatlar' },
    { name: 'Selim AKSOY', branch: 'Beden Eğitimi' },
  ]

  let idCounter = 101
  for (let g = 1; g <= 8; g++) {
    for (const b of branches) {
      const teacherIdx = (idCounter - 101) % teachers.length
      const teacher = teachers[teacherIdx]
      const floor = Math.floor((g - 1) / 2) + 1
      const roomNum = `${g}0${branches.indexOf(b) + 1}`
      const is1A = g === 1 && b === 'A'
      const studentCount = is1A ? 1 : 0
      const presentToday = studentCount

      classes.push({
        id: idCounter,
        code: `${g}/${b}`,
        name: `${g}/${b} Şubesi`,
        gradeLevel: `${g}. Sınıf`,
        gradeNumber: g,
        orgId: 30,
        roomName: `${floor}. Kat · Derslik ${roomNum}`,
        teacherName: is1A ? 'Özlem ZOR' : teacher.name,
        teacherBranch: is1A ? 'Sınıf Öğretmeni (1/A)' : teacher.branch,
        teacherPhone: is1A ? '+90 532 999 1001' : `+90 532 999 ${1000 + (idCounter % 900)}`,
        teacherEmail: is1A ? 'ozlemzor@oxonom.com' : `${teacher.name.toLowerCase().replace(/[^a-z]/g, '')}@oxonom.com`,
        studentCount,
        capacity: 30,
        boysCount: is1A ? 1 : 0,
        girlsCount: 0,
        presentToday,
        leaveToday: 0,
        absentToday: 0,
        attendanceRate: 100,
        academicAverage: is1A ? 98.8 : 0,
        courseAverages: [
          { course: 'Türkçe', average: is1A ? 99.3 : 0, highest: 100, lowest: is1A ? 98 : 0 },
          { course: 'Matematik', average: is1A ? 98.0 : 0, highest: 100, lowest: is1A ? 96 : 0 },
          { course: g <= 4 ? 'Hayat Bilgisi' : 'Fen Bilimleri', average: is1A ? 99.0 : 0, highest: 100, lowest: is1A ? 98 : 0 },
        ],
        boardStatus: 'offline',
        boardName: `${g}/${b} Akıllı Tahta`,
        scheduleSummary: `Haftalık ${g <= 4 ? 30 : 35} Saat`,
        classPresident: is1A ? 'Erçil UĞURLU' : `Öğrenci Temsilcisi ${g}/${b}`,
        parentRepresentative: is1A ? 'Ebru UĞURLU' : `Veli Temsilcisi ${g}/${b}`,
      })
      idCounter++
    }
  }

  return classes
}

export const DEFAULT_OXONOM_CLASSES: AdminClassroom[] = GENERATE_CLASSES_1_TO_8_A_D()

export function reconcileClassesWithRealData(classes: AdminClassroom[], orgId: number = 30): AdminClassroom[] {
  if (typeof window === 'undefined') return classes
  try {
    const rawStudents =
      localStorage.getItem(`oxonom_admin_students_list_${orgId}`) ||
      localStorage.getItem('oxonom_admin_students_list_30') ||
      localStorage.getItem('oxonom_m_students_v3')
    
    let students: any[] = []
    if (rawStudents) {
      try {
        const parsed = JSON.parse(rawStudents)
        if (Array.isArray(parsed)) students = parsed
      } catch (_) {}
    }

    let needsSave = false

    // Normalize any stale student (e.g. Erçil, 101, or old 9-A) to 1/A
    students = students.map((s: any) => {
      const name = (s.name || '').toLowerCase()
      const isErcil = name.includes('erçil') || s.studentNo === '101' || s.id === 3001 || s.id === 's-1'
      const isStaleClass = s.className && (s.className.includes('9') || s.className === '9-A' || s.className === '9/A')
      if (isErcil || isStaleClass) {
        needsSave = true
        return {
          ...s,
          id: s.id || 3001,
          name: 'Erçil UĞURLU',
          className: '1/A',
          gradeLevel: '1. Sınıf',
          studentNo: '101',
          gpa: 98.8,
          gender: 'Erkek',
          mentorTeacher: 'Özlem ZOR',
          status: 'active',
          birthDate: '15.06.2018 (7 Yaşında)',
          bloodType: 'A Rh+',
          parentName: 'Ebru UĞURLU',
          parentPhone: '+90 532 999 1100',
        }
      }
      return s
    })

    // If Erçil in 1/A is missing, add him
    const has1A = students.some((s: any) => {
      const c = (s.className || '').replace('-', '/').trim().toUpperCase()
      return c === '1/A'
    })
    if (!has1A) {
      students.push({
        id: 3001,
        name: 'Erçil UĞURLU',
        className: '1/A',
        gradeLevel: '1. Sınıf',
        studentNo: '101',
        gpa: 98.8,
        gender: 'Erkek',
        mentorTeacher: 'Özlem ZOR',
        status: 'active',
        birthDate: '15.06.2018 (7 Yaşında)',
        bloodType: 'A Rh+',
        parentName: 'Ebru UĞURLU',
        parentPhone: '+90 532 999 1100',
      })
      needsSave = true
    }

    if (needsSave) {
      try {
        const studentJson = JSON.stringify(students)
        localStorage.setItem(`oxonom_admin_students_list_${orgId}`, studentJson)
        localStorage.setItem('oxonom_admin_students_list_30', studentJson)
        localStorage.setItem('oxonom_m_students_v3', studentJson)
      } catch (_) {}
    }

    const rawActiveBoards = localStorage.getItem('oxonom_principal_active_boards')
    let activeBoards: any[] = []
    if (rawActiveBoards) {
      try {
        const parsed = JSON.parse(rawActiveBoards)
        if (Array.isArray(parsed)) activeBoards = parsed
      } catch (_) {}
    }

    return classes.map((cls) => {
      const clsCodeNorm = (cls.code || '').replace('-', '/').trim().toUpperCase()

      const classStudents = students.filter((s: any) => {
        const sClassNorm = (s.className || '').replace('-', '/').trim().toUpperCase()
        return sClassNorm === clsCodeNorm
      })

      const studentCount = classStudents.length
      const boysCount = classStudents.filter((s: any) => s.gender === 'Erkek').length
      const girlsCount = classStudents.filter((s: any) => s.gender === 'Kız').length
      const presentToday = studentCount

      let academicAverage = 0
      if (studentCount > 0) {
        const sumGpa = classStudents.reduce((acc: number, s: any) => acc + (Number(s.gpa) || 98.8), 0)
        academicAverage = Number((sumGpa / studentCount).toFixed(1))
      }

      const isBoardActive = activeBoards.some((b: any) => {
        const bClassNorm = (b.className || '').replace('-', '/').trim().toUpperCase()
        const bCodeNorm = (b.code || '').replace('-', '/').trim().toUpperCase()
        return bClassNorm.includes(clsCodeNorm) || bCodeNorm.includes(clsCodeNorm)
      })

      return {
        ...cls,
        studentCount,
        boysCount,
        girlsCount,
        presentToday,
        leaveToday: 0,
        absentToday: 0,
        attendanceRate: 100,
        academicAverage,
        boardStatus: isBoardActive ? ('online' as const) : ('offline' as const),
      }
    })
  } catch (_) {
    return classes
  }
}

type ClassDetailTabKey =
  | 'genel'
  | 'yoklama'
  | 'akademik'
  | 'ogrenciler'
  | 'program'
  | 'islemler'

export default function MAdminClassesClient({
  orgSlug,
  hideHeader = false,
  hideDock = false,
}: MAdminClassesClientProps) {
  const { theme, toggleTheme } = useMobileTheme()
  const session = useLHSession() as any
  const user = session?.data?.user

  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false)
  const [selectedOrgId, setSelectedOrgId] = useState<number>(30)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('ALL')

  // Modals state
  const [selectedClassForDetail, setSelectedClassForDetail] =
    useState<AdminClassroom | null>(null)
  const [activeDetailTab, setActiveDetailTab] =
    useState<ClassDetailTabKey>('genel')
  const [classToEdit, setClassToEdit] = useState<AdminClassroom | null>(null)
  const [classToDelete, setClassToDelete] = useState<AdminClassroom | null>(null)
  const [isNewClassModalOpen, setIsNewClassModalOpen] = useState(false)

  // Edit / Create Form fields
  const [formCode, setFormCode] = useState('')
  const [formGradeLevel, setFormGradeLevel] = useState('1. Sınıf')
  const [formRoomName, setFormRoomName] = useState('')
  const [formTeacherName, setFormTeacherName] = useState('')
  const [formCapacity, setFormCapacity] = useState<number>(32)

  // Extended form fields for full class editing
  const [editClassSection, setEditClassSection] = useState<
    'temel' | 'rehber' | 'mevcut' | 'akademik'
  >('temel')
  const [formBoardName, setFormBoardName] = useState('')
  const [formBoardStatus, setFormBoardStatus] = useState<'online' | 'offline'>('online')
  const [formScheduleSummary, setFormScheduleSummary] = useState('Haftalık 30 Saat')
  const [formClassPresident, setFormClassPresident] = useState('')
  const [formParentRepresentative, setFormParentRepresentative] = useState('')
  const [formStudentCount, setFormStudentCount] = useState<number>(30)
  const [formGirlsCount, setFormGirlsCount] = useState<number>(16)
  const [formBoysCount, setFormBoysCount] = useState<number>(14)
  const [formPresentToday, setFormPresentToday] = useState<number>(29)
  const [formLeaveToday, setFormLeaveToday] = useState<number>(1)
  const [formAbsentToday, setFormAbsentToday] = useState<number>(0)
  const [formLeaveNote, setFormLeaveNote] = useState('')
  const [formAcademicAverage, setFormAcademicAverage] = useState<number>(88.4)
  const [formCourseTurkish, setFormCourseTurkish] = useState<number>(89.5)
  const [formCourseMath, setFormCourseMath] = useState<number>(84.2)
  const [formCourseScience, setFormCourseScience] = useState<number>(91.8)
  const [formCourseEnglish, setFormCourseEnglish] = useState<number>(86.0)

  // Quick SMS to class parents form state
  const [smsTitle, setSmsTitle] = useState('')
  const [smsBody, setSmsBody] = useState('')

  // Student search within class detail
  const [detailStudentSearch, setDetailStudentSearch] = useState('')

  // ── SUB-VIEW NAVIGATION: ŞUBELER & SINIFLAR | DÖNEM SONU ATLATMA & NAKİL ──
  type ClassesSubView = 'classes' | 'promotion'
  const [activeSubView, setActiveSubView] = useState<ClassesSubView>('classes')

  // ── DİNAMİK KADEME YÖNETİMİ STATES ──
  const [gradeLevels, setGradeLevels] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('oxonom_school_grade_levels')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
      } catch (_) {}
    }
    return ['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf', '9. Sınıf']
  })
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false)
  const [newGradeName, setNewGradeName] = useState('')
  const [editingGradeIndex, setEditingGradeIndex] = useState<number | null>(null)
  const [editingGradeName, setEditingGradeName] = useState('')

  // Dropdown in new class modal
  const [isGradeDropdownOpen, setIsGradeDropdownOpen] = useState(false)

  // ── ŞUBE NAKİL & DÖNEM SONU SINIF ATLATMA STATES ──
  const [transferTabMode, setTransferTabMode] = useState<'internal' | 'external' | 'bulk'>('internal')
  const [transferStudentSearchQuery, setTransferStudentSearchQuery] = useState<string>('')
  const [transferSourceClassId, setTransferSourceClassId] = useState<number>(0)
  const [transferTargetClassId, setTransferTargetClassId] = useState<number>(0)
  const [transferStudentName, setTransferStudentName] = useState<string>('')
  const [transferReason, setTransferReason] = useState<string>('Veli Talebi & İkametgah Değişikliği')
  const [transferHistory, setTransferHistory] = useState<Array<{ id: string; student: string; from: string; to: string; date: string; reason: string }>>([
    {
      id: 'tr-1',
      student: 'Can AKSOY',
      from: '3-A',
      to: '3-B',
      date: '08 Ekim 2026',
      reason: 'Rehberlik Servisi Şube Dengeleme Önerisi',
    },
    {
      id: 'tr-2',
      student: 'Elif YILDIZ',
      from: '2-B',
      to: '2-A',
      date: '02 Ekim 2026',
      reason: 'İkiz Kardeş Ayrımı Talebi',
    },
  ])

  // External School Transfer State (Başka Okuldan Nakil)
  const [extSchoolName, setExtSchoolName] = useState('')
  const [extSchoolCode, setExtSchoolCode] = useState('')
  const [extSchoolCity, setExtSchoolCity] = useState('İstanbul / Kadıköy')
  const [extPrevClass, setExtPrevClass] = useState('1-A')
  const [extEokulDocNo, setExtEokulDocNo] = useState('')
  const [extTransferReason, setExtTransferReason] = useState('İkametgah Değişikliği ve Nakil')
  const [extTcNo, setExtTcNo] = useState('')
  const [extStudentName, setExtStudentName] = useState('')
  const [extGender, setExtGender] = useState<'Erkek' | 'Kız'>('Erkek')
  const [extBirthDate, setExtBirthDate] = useState('12.04.2018')
  const [extBloodType, setExtBloodType] = useState('A Rh+')
  const [extTargetClassId, setExtTargetClassId] = useState<number>(0)
  const [extParentName, setExtParentName] = useState('')
  const [extParentPhone, setExtParentPhone] = useState('')
  const [extParentEmail, setExtParentEmail] = useState('')

  // Promotion parameters
  const [currentAcademicTerm, setCurrentAcademicTerm] = useState('2025-2026 Bahar')
  const [targetAcademicTerm, setTargetAcademicTerm] = useState('2026-2027 Güz')
  const [carryTeachersWithClass, setCarryTeachersWithClass] = useState(true)
  const [preserveSectionCodes, setPreserveSectionCodes] = useState(true)
  const [archiveGraduates, setArchiveGraduates] = useState(true)
  const [repeatingStudents, setRepeatingStudents] = useState<string[]>([
    'Murat YILMAZ (3-A · ŞÖK Kararı & Devamsızlık)',
  ])
  const [newRepeatingInput, setNewRepeatingInput] = useState('')
  const [isConfirmPromotionOpen, setIsConfirmPromotionOpen] = useState(false)
  const [backupClassesList, setBackupClassesList] = useState<AdminClassroom[] | null>(null)

  // Teachers for selector
  const availableTeachers = useMemo(() => {
    return getOrgTeachers(selectedOrgId)
  }, [selectedOrgId])

  // Classrooms dataset with localStorage sync
  const [classesList, setClassesList] = useState<AdminClassroom[]>(() => {
    const initialOrgId = user?.school_org_id || 30
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`oxonom_admin_classes_${initialOrgId}`)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length >= 10) {
            return reconcileClassesWithRealData(parsed.map(normalizeClassroom), initialOrgId)
          }
        }
      } catch (_) {}
    }
    return reconcileClassesWithRealData(DEFAULT_OXONOM_CLASSES.map(normalizeClassroom), initialOrgId)
  })

  // Synchronize when school org changes or load from localStorage
  useEffect(() => {
    const defaultClasses = DEFAULT_OXONOM_CLASSES.map(normalizeClassroom)
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(
          `oxonom_admin_classes_${selectedOrgId}`
        )
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length >= 10) {
            const normalized = reconcileClassesWithRealData(parsed.map(normalizeClassroom), selectedOrgId)
            setClassesList(normalized)
            setSelectedGradeFilter('ALL')
            return
          }
        }
        // Initialize with 1 to 8 (A to D) classes
        const reconciled = reconcileClassesWithRealData(defaultClasses, selectedOrgId)
        localStorage.setItem(`oxonom_admin_classes_${selectedOrgId}`, JSON.stringify(reconciled))
        localStorage.setItem('oxonom_admin_classes_30', JSON.stringify(reconciled))
        setClassesList(reconciled)
        setSelectedGradeFilter('ALL')
        return
      } catch (_) {}
    }
    const reconciled = reconcileClassesWithRealData(defaultClasses, selectedOrgId)
    setClassesList(reconciled)
    setSelectedGradeFilter('ALL')
  }, [selectedOrgId])

  // Save changes to localStorage helper
  const persistClasses = (updatedList: AdminClassroom[]) => {
    const normalized = updatedList.map(normalizeClassroom)
    setClassesList(normalized)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          `oxonom_admin_classes_${selectedOrgId}`,
          JSON.stringify(normalized)
        )
      } catch (_) {}
    }
  }

  // ── DİNAMİK KADEME İŞLEMLERİ ──
  const persistGradeLevels = (newList: string[]) => {
    setGradeLevels(newList)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('oxonom_school_grade_levels', JSON.stringify(newList))
      } catch (_) {}
    }
  }

  const handleAddGrade = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error('Lütfen bir kademe adı yazınız.')
      return
    }
    if (gradeLevels.includes(trimmed)) {
      toast.error('Bu kademe zaten tanımlı.')
      return
    }
    const updated = [...gradeLevels, trimmed]
    persistGradeLevels(updated)
    setFormGradeLevel(trimmed)
    setNewGradeName('')
    setIsGradeModalOpen(false)
    toast.success(`"${trimmed}" kademesi başarıyla eklendi!`)
  }

  const handleDeleteGrade = (gradeToDelete: string) => {
    const isUsed = classesList.some((c) => c.gradeLevel === gradeToDelete)
    if (isUsed) {
      toast.error(`"${gradeToDelete}" kademesine bağlı kayıtlı şubeler var. Önce şubeleri silmeli veya taşımalısınız.`)
      return
    }
    const updated = gradeLevels.filter((g) => g !== gradeToDelete)
    persistGradeLevels(updated)
    if (formGradeLevel === gradeToDelete) {
      setFormGradeLevel(updated[0] || '1. Sınıf')
    }
    toast.success(`"${gradeToDelete}" kademesi kaldırıldı.`)
  }

  const handleSaveEditGrade = (index: number) => {
    const trimmed = editingGradeName.trim()
    if (!trimmed) return
    const oldName = gradeLevels[index]
    const updated = [...gradeLevels]
    updated[index] = trimmed
    persistGradeLevels(updated)

    // Update classes that used oldName
    const updatedClasses = classesList.map((c) =>
      c.gradeLevel === oldName ? { ...c, gradeLevel: trimmed } : c
    )
    persistClasses(updatedClasses)

    setEditingGradeIndex(null)
    setEditingGradeName('')
    toast.success(`Kademe "${trimmed}" olarak güncellendi.`)
  }

  // ── ŞUBE NAKİL İŞLEMİ ──
  const handleExecuteStudentTransfer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!transferSourceClassId || !transferTargetClassId) {
      toast.error('Lütfen kaynak ve hedef şubeleri seçiniz.')
      return
    }
    if (transferSourceClassId === transferTargetClassId) {
      toast.error('Kaynak ve hedef şube aynı olamaz.')
      return
    }
    if (!transferStudentName.trim()) {
      toast.error('Lütfen nakil edilecek öğrenci adını giriniz.')
      return
    }

    const sourceCls = classesList.find((c) => c.id === transferSourceClassId)
    const targetCls = classesList.find((c) => c.id === transferTargetClassId)

    if (!sourceCls || !targetCls) {
      toast.error('Şube bilgileri doğrulanamadı.')
      return
    }

    if (targetCls.studentCount >= targetCls.capacity) {
      toast.error(`Hedef şubenin (${targetCls.code}) kontenjanı dolu (${targetCls.capacity} öğrenci).`)
      return
    }

    const updatedClasses = classesList.map((c) => {
      if (c.id === transferSourceClassId) {
        return {
          ...c,
          studentCount: Math.max(0, c.studentCount - 1),
          presentToday: Math.max(0, (c.presentToday || 0) - 1),
        }
      }
      if (c.id === transferTargetClassId) {
        return {
          ...c,
          studentCount: c.studentCount + 1,
          presentToday: (c.presentToday || 0) + 1,
        }
      }
      return c
    })

    persistClasses(updatedClasses)

    const newRecord = {
      id: `tr-${Date.now()}`,
      student: transferStudentName.trim(),
      from: sourceCls.code,
      to: targetCls.code,
      date: 'Bugün',
      reason: transferReason,
    }
    setTransferHistory((prev) => [newRecord, ...prev])

    toast.success(
      `${transferStudentName} öğrencisi ${sourceCls.code} şubesinden ${targetCls.code} şubesine başarıyla nakledildi!`
    )
    setTransferStudentName('')
    setTransferStudentSearchQuery('')
  }

  // Enrolled students helper for internal transfer selection
  const enrolledStudents = useMemo(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`oxonom_admin_students_list_${selectedOrgId}`)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
      } catch (_) {}
    }
    return generateClassStudents(ALL_CLASSROOMS[0])
  }, [selectedOrgId])

  const filteredEnrolledStudents = useMemo(() => {
    if (!transferStudentSearchQuery.trim()) return enrolledStudents
    const q = transferStudentSearchQuery.toLowerCase()
    return enrolledStudents.filter((s: any) =>
      (s.name || '').toLowerCase().includes(q) ||
      (s.studentNo || '').toLowerCase().includes(q) ||
      (s.tcNo || '').includes(q)
    )
  }, [enrolledStudents, transferStudentSearchQuery])

  // ── BAŞKA OKULDAN GELEN NAKİL İŞLEMİ (EXTERNAL TRANSFER IN) ──
  const handleExecuteExternalTransfer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!extStudentName.trim() || !extTcNo.trim()) {
      toast.error('Lütfen öğrenci T.C. kimlik ve isim bilgilerini doldurunuz.')
      return
    }
    if (!extTargetClassId) {
      toast.error('Lütfen öğrencinin yerleştirileceği hedef sınıfı seçiniz.')
      return
    }

    const targetCls = classesList.find((c) => c.id === extTargetClassId)
    if (!targetCls) {
      toast.error('Hedef sınıf bulunamadı.')
      return
    }

    // Increment target class studentCount
    const updatedClasses = classesList.map((c) => {
      if (c.id === extTargetClassId) {
        return {
          ...c,
          studentCount: c.studentCount + 1,
          presentToday: (c.presentToday || 0) + 1,
        }
      }
      return c
    })
    persistClasses(updatedClasses)

    // Add to transfer history
    const newTr = {
      id: `tr-${Date.now()}`,
      student: extStudentName.trim(),
      from: `${extSchoolName || 'Dış Okul'} (${extPrevClass})`,
      to: targetCls.code,
      date: 'Bugün',
      reason: extTransferReason || 'Başka Okuldan Nakil Kaydı',
    }
    setTransferHistory((prev) => [newTr, ...prev])

    // Save to students list in localStorage
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`oxonom_admin_students_list_${selectedOrgId}`)
        const list = saved ? JSON.parse(saved) : generateClassStudents(ALL_CLASSROOMS[0])
        const newStudentObj = {
          id: Date.now(),
          name: extStudentName.trim(),
          first_name: extStudentName.trim().split(' ')[0],
          last_name: extStudentName.trim().split(' ').slice(1).join(' '),
          studentNo: `2026-${Math.floor(100 + Math.random() * 900)}`,
          tcNo: extTcNo.trim(),
          gender: extGender,
          birthDate: extBirthDate,
          bloodType: extBloodType,
          className: targetCls.code,
          classroomId: targetCls.id,
          parentName: extParentName.trim() || 'Veli',
          parentPhone: extParentPhone.trim() || '+90 532 000 0000',
          parentEmail: extParentEmail.trim(),
          registrationType: 'Başka Okuldan Nakil',
          prevSchool: extSchoolName.trim(),
        }
        list.push(newStudentObj)
        localStorage.setItem(`oxonom_admin_students_list_${selectedOrgId}`, JSON.stringify(list))
      } catch (_) {}
    }

    toast.success(`${extStudentName} isimli öğrencinin ${extSchoolName || 'dış okuldan'} ${targetCls.code} şubesine resmi nakil kaydı başarıyla tamamlandı!`)
    // Reset form
    setExtStudentName('')
    setExtTcNo('')
    setExtSchoolName('')
    setExtSchoolCode('')
    setExtParentName('')
    setExtParentPhone('')
  }

  // ── DÖNEM SONU OTOMATİK SINIF ATLATMA (BULK PROMOTION) ──
  const handleExecuteBulkPromotion = () => {
    // 1. Save current backup
    setBackupClassesList([...classesList])
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`oxonom_classes_backup_${selectedOrgId}`, JSON.stringify(classesList))
      } catch (_) {}
    }

    // 2. Advance classes
    const updated = classesList
      .map((c) => {
        const numMatch = c.code.match(/^(\d+)/)
        const currentNum = numMatch ? parseInt(numMatch[1], 10) : c.gradeNumber || 1

        const isGraduating = (selectedOrgId === 10 && currentNum >= 4) ||
          (selectedOrgId === 20 && currentNum >= 8) ||
          (selectedOrgId === 30 && currentNum >= 12)

        if (isGraduating) {
          if (archiveGraduates) {
            return null // Graduated & archived
          }
          return c
        }

        const nextNum = currentNum + 1
        const letterPart = c.code.replace(/^.*[\/-]/, '').trim().toUpperCase() || 'A'
        const nextCode = `${nextNum}/${letterPart}`
        const nextGradeLevel = `${nextNum}. Sınıf`

        return {
          ...c,
          code: preserveSectionCodes ? nextCode : c.code,
          name: `${preserveSectionCodes ? nextCode : c.code} Şubesi`,
          gradeNumber: nextNum,
          gradeLevel: nextGradeLevel,
          academicAverage: 85.0,
        }
      })
      .filter(Boolean) as AdminClassroom[]

    // Add fresh Grade 1 branch if none exists
    const hasGrade1 = updated.some((c) => c.gradeNumber === 1 || c.code.startsWith('1-'))
    if (!hasGrade1 && selectedOrgId === 10) {
      updated.unshift({
        id: Date.now(),
        code: '1-A',
        name: '1-A Şubesi (Yeni Kayıt)',
        gradeLevel: '1. Sınıf',
        gradeNumber: 1,
        orgId: selectedOrgId,
        roomName: '1. Kat · Derslik 101',
        teacherName: 'Atanacak',
        teacherBranch: 'Sınıf Öğretmeni',
        teacherPhone: '+90 532 000 0000',
        teacherEmail: 'bilgi@oxonom.com',
        studentCount: 28,
        capacity: 32,
        boysCount: 14,
        girlsCount: 14,
        presentToday: 28,
        leaveToday: 0,
        absentToday: 0,
        attendanceRate: 100,
        academicAverage: 90.0,
        courseAverages: [],
        boardStatus: 'online',
        boardName: '1-A Akıllı Tahta',
        scheduleSummary: 'Haftalık 30 Saat',
        classPresident: 'Seçilecek',
        parentRepresentative: 'Seçilecek',
      })
    }

    persistClasses(updated)
    setIsConfirmPromotionOpen(false)
    toast.success(
      `${currentAcademicTerm} dönemi başarıyla kapatıldı! Tüm sınıflar ${targetAcademicTerm} dönemine terfi ettirildi ve mezunlar kütüğe arşivlendi.`
    )
  }

  // Rollback promotion
  const handleRollbackPromotion = () => {
    let backup = backupClassesList
    if (!backup && typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(`oxonom_classes_backup_${selectedOrgId}`)
        if (raw) backup = JSON.parse(raw)
      } catch (_) {}
    }
    if (backup && backup.length > 0) {
      persistClasses(backup)
      setBackupClassesList(null)
      toast.success('Dönem sonu sınıf atlatma işlemi geri alındı (Rollback tamamlandı).')
    } else {
      toast.error('Geri alınacak yedek bulunamadı.')
    }
  }

  // Open Edit Modal with ALL fields pre-filled
  const handleOpenEdit = (cls: AdminClassroom) => {
    setClassToEdit(cls)
    setEditClassSection('temel')
    setFormCode(cls.code)
    setFormGradeLevel(cls.gradeLevel)
    setFormRoomName(cls.roomName)
    setFormTeacherName(cls.teacherName)
    setFormCapacity(cls.capacity)
    setFormBoardName(cls.boardName || `${cls.code} Akıllı Tahta`)
    setFormBoardStatus(cls.boardStatus || 'online')
    setFormScheduleSummary(cls.scheduleSummary || 'Haftalık 30 Saat')
    setFormClassPresident(cls.classPresident || 'Sınıf Temsilcisi')
    setFormParentRepresentative(cls.parentRepresentative || 'Veli Temsilcisi')
    setFormStudentCount(cls.studentCount || 30)
    setFormGirlsCount(cls.girlsCount || 15)
    setFormBoysCount(cls.boysCount || 15)
    setFormPresentToday(cls.presentToday || cls.studentCount || 29)
    setFormLeaveToday(cls.leaveToday ?? 1)
    setFormAbsentToday(cls.absentToday ?? 0)
    setFormLeaveNote(cls.leaveNote || '')
    setFormAcademicAverage(cls.academicAverage || 88.0)

    const tur =
      cls.courseAverages?.find((c) => c.course.includes('Türk'))?.average || 89.5
    const mat =
      cls.courseAverages?.find((c) => c.course.includes('Mat'))?.average || 84.2
    const fen =
      cls.courseAverages?.find(
        (c) => c.course.includes('Fen') || c.course.includes('Hayat')
      )?.average || 91.8
    const ing =
      cls.courseAverages?.find(
        (c) => c.course.includes('İng') || c.course.includes('Dil')
      )?.average || 86.0
    setFormCourseTurkish(tur)
    setFormCourseMath(mat)
    setFormCourseScience(fen)
    setFormCourseEnglish(ing)
  }

  // Save Edit Changes - Updates ALL fields
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!classToEdit) return

    const matchedTeacher = availableTeachers.find(
      (t) => t.name === formTeacherName
    )
    const totalAtt = formPresentToday + formLeaveToday + formAbsentToday
    const calculatedRate =
      totalAtt > 0
        ? Number(((formPresentToday / totalAtt) * 100).toFixed(1))
        : 100

    const matchGrade = formGradeLevel.match(/\d+/)
    const gradeNum = matchGrade ? matchGrade[0] : (classToEdit.gradeNumber ? String(classToEdit.gradeNumber) : '1')
    const branchLetter = formCode.replace(/^.*[\/-]/, '').trim().toUpperCase() || 'A'
    const finalCode = `${gradeNum}/${branchLetter}`
    const finalName = `${finalCode} Şubesi`

    const updated = classesList.map((c) => {
      if (c.id === classToEdit.id) {
        return {
          ...c,
          code: finalCode,
          name: finalName,
          gradeLevel: formGradeLevel.includes('Sınıf') || formGradeLevel.includes('/') ? formGradeLevel : `${formGradeLevel}. Sınıf`,
          gradeNumber: parseInt(gradeNum) || c.gradeNumber,
          roomName: formRoomName,
          teacherName: formTeacherName,
          teacherBranch: matchedTeacher?.branch || c.teacherBranch,
          teacherPhone: matchedTeacher?.phone || c.teacherPhone,
          teacherEmail: matchedTeacher?.email || c.teacherEmail,
          capacity: formCapacity,
          boardName: formBoardName || `${finalCode} Akıllı Tahta`,
          boardStatus: formBoardStatus,
          scheduleSummary: formScheduleSummary,
          classPresident: formClassPresident,
          parentRepresentative: formParentRepresentative,
          studentCount: formStudentCount,
          girlsCount: formGirlsCount,
          boysCount: formBoysCount,
          presentToday: formPresentToday,
          leaveToday: formLeaveToday,
          absentToday: formAbsentToday,
          attendanceRate: calculatedRate,
          leaveNote: formLeaveNote,
          academicAverage: formAcademicAverage,
          courseAverages: [
            {
              course: 'Türkçe',
              average: formCourseTurkish,
              highest: 100,
              lowest: Math.max(50, formCourseTurkish - 18),
            },
            {
              course: 'Matematik',
              average: formCourseMath,
              highest: 100,
              lowest: Math.max(50, formCourseMath - 16),
            },
            {
              course:
                selectedOrgId === 10
                  ? 'Hayat Bilgisi / Fen'
                  : 'Fen Bilimleri',
              average: formCourseScience,
              highest: 100,
              lowest: Math.max(50, formCourseScience - 15),
            },
            {
              course: 'Yabancı Dil (İngilizce)',
              average: formCourseEnglish,
              highest: 100,
              lowest: Math.max(50, formCourseEnglish - 16),
            },
          ],
        }
      }
      return c
    })

    persistClasses(updated)
    toast.success(`${finalCode} şubesinin tüm bilgileri başarıyla güncellendi!`)
    setClassToEdit(null)

    if (selectedClassForDetail?.id === classToEdit.id) {
      const refreshed = updated.find((c) => c.id === classToEdit.id)
      if (refreshed) setSelectedClassForDetail(refreshed)
    }
  }

  // Open New Class Modal
  const handleOpenNewClass = () => {
    const defaultGrade = selectedOrgId === 30 ? '9. Sınıf' : selectedOrgId === 10 ? '1. Sınıf' : '5. Sınıf'
    setFormGradeLevel(defaultGrade)
    setFormCode(selectedOrgId === 30 ? '9/B' : selectedOrgId === 10 ? '1/B' : '5/B')
    setFormRoomName(selectedOrgId === 30 ? '1. Kat · Derslik 102' : '1. Kat · Derslik 107')
    setFormTeacherName(availableTeachers[0]?.name || (selectedOrgId === 30 ? 'Ebru TEKNECİ' : 'Özlem ZOR'))
    setFormCapacity(32)
    setIsNewClassModalOpen(true)
  }

  // Save New Class
  const handleCreateNewClass = (e: React.FormEvent) => {
    e.preventDefault()
    const matchedTeacher = availableTeachers.find(
      (t) => t.name === formTeacherName
    )
    const matchGrade = formGradeLevel.match(/\d+/)
    const gradeNum = matchGrade ? matchGrade[0] : (selectedOrgId === 30 ? '9' : selectedOrgId === 10 ? '1' : '5')
    const branchLetter = formCode.replace(/^.*[\/-]/, '').trim().toUpperCase() || 'A'
    const finalCode = `${gradeNum}/${branchLetter}`
    const finalName = `${finalCode} Şubesi`

    // Duplicate check: User Rule: "sınıf eklerken eğer eklenen sınıf ve şube varsa bu şube mevcut uyarısı versin"
    const isDuplicate = classesList.some((c) => {
      const existing = (c.code || '').trim().replace('-', '/').toUpperCase()
      const target = finalCode.trim().replace('-', '/').toUpperCase()
      return existing === target
    })
    if (isDuplicate) {
      toast.error(`${finalCode} şubesi sistemde zaten mevcut! Lütfen farklı bir şube harfi veya kademe seçiniz.`)
      return
    }

    const newId = Date.now()
    const newClassItem: AdminClassroom = {
      id: newId,
      code: finalCode,
      name: finalName,
      gradeLevel: formGradeLevel.includes('Sınıf') || formGradeLevel.includes('/') ? formGradeLevel : `${formGradeLevel}. Sınıf`,
      gradeNumber: parseInt(gradeNum) || (selectedOrgId === 30 ? 9 : selectedOrgId === 10 ? 1 : 5),
      orgId: selectedOrgId,
      roomName: formRoomName,
      teacherName: formTeacherName,
      teacherBranch: matchedTeacher?.branch || (selectedOrgId === 30 ? 'Türk Dili ve Edebiyatı' : 'Sınıf Öğretmeni'),
      teacherPhone: matchedTeacher?.phone || '+90 532 999 1000',
      teacherEmail: matchedTeacher?.email || 'ogretmen@oxonom.com',
      studentCount: 0,
      capacity: formCapacity,
      boysCount: 0,
      girlsCount: 0,
      presentToday: 0,
      leaveToday: 0,
      absentToday: 0,
      attendanceRate: 100,
      academicAverage: selectedOrgId === 30 ? 98.8 : 88.0,
      courseAverages: [
        { course: selectedOrgId === 30 ? 'Türk Dili ve Edebiyatı' : 'Türkçe', average: 89.0, highest: 100, lowest: 72 },
        { course: 'Matematik', average: 86.0, highest: 100, lowest: 68 },
        {
          course:
            selectedOrgId === 30
              ? 'Bilişim & Kodlama'
              : selectedOrgId === 10
              ? 'Hayat Bilgisi'
              : 'Fen Bilimleri',
          average: 91.0,
          highest: 100,
          lowest: 75,
        },
      ],
      boardStatus: 'online',
      boardName: `${finalCode} Akıllı Tahta`,
      scheduleSummary: selectedOrgId === 30 ? 'Haftalık 35 Saat' : selectedOrgId === 10 ? 'Haftalık 30 Saat' : 'Haftalık 35 Saat',
      classPresident: selectedOrgId === 30 ? 'Erçil UĞURLU' : 'Sınıf Temsilcisi',
      parentRepresentative: selectedOrgId === 30 ? 'Uğur UĞURLU' : 'Veli Temsilcisi',
    }

    const updated = [newClassItem, ...classesList]
    persistClasses(updated)
    toast.success(`${finalCode} şubesi başarıyla oluşturuldu ve sisteme eklendi!`)
    setIsNewClassModalOpen(false)
  }

  // Delete Class Confirm
  const handleConfirmDelete = () => {
    if (!classToDelete) return
    const updated = classesList.filter((c) => c.id !== classToDelete.id)
    persistClasses(updated)
    toast.success(`${classToDelete.name} sistemden başarıyla silindi.`)
    if (selectedClassForDetail?.id === classToDelete.id) {
      setSelectedClassForDetail(null)
    }
    setClassToDelete(null)
  }

  // Filtered classes list
  const filteredClasses = useMemo(() => {
    return classesList.filter((c) => {
      if (selectedGradeFilter !== 'ALL') {
        const matchesExact = c.gradeLevel === selectedGradeFilter
        const filterDigits = selectedGradeFilter.match(/\d+/)
        const classDigits = c.gradeLevel.match(/\d+/) || c.code.match(/^\d+/)
        const matchesDigits = Boolean(filterDigits && classDigits && filterDigits[0] === classDigits[0])
        if (!matchesExact && !matchesDigits) {
          return false
        }
      }
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.teacherName.toLowerCase().includes(q) ||
        c.roomName.toLowerCase().includes(q) ||
        c.gradeLevel.toLowerCase().includes(q)
      )
    })
  }, [classesList, selectedGradeFilter, searchQuery])

  // Mock student roster for the selected class in detail modal
  const classStudents = useMemo(() => {
    if (!selectedClassForDetail) return []
    // Match an existing ClassroomItem or simulate
    const matchedClassItem = ALL_CLASSROOMS.find(
      (c) => c.code === selectedClassForDetail.code
    ) || {
      id: selectedClassForDetail.id,
      usergroup_uuid: `ug_${selectedClassForDetail.code}`,
      name: selectedClassForDetail.name,
      code: selectedClassForDetail.code,
      join_code: `OKUL-${selectedClassForDetail.code.replace('-', '')}`,
      grade_level: selectedClassForDetail.gradeLevel,
      org_id: selectedClassForDetail.orgId,
      school_name: 'Oxonom Okulları',
      school_slug: 'oxonom',
      description: `Sınıf Öğretmeni: ${selectedClassForDetail.teacherName}`,
      teacher_name: selectedClassForDetail.teacherName,
      teacher_email: selectedClassForDetail.teacherEmail,
      student_count: selectedClassForDetail.studentCount,
      boards_count: 3,
    }

    const raw = generateClassStudents(matchedClassItem)
    if (!detailStudentSearch.trim()) return raw
    const q = detailStudentSearch.toLowerCase()
    return raw.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.studentNo.toLowerCase().includes(q) ||
        s.parentName.toLowerCase().includes(q)
    )
  }, [selectedClassForDetail, detailStudentSearch])

  // Aggregate stats
  const totalStudentsCount = useMemo(() => {
    return classesList.reduce((acc, c) => acc + c.studentCount, 0)
  }, [classesList])

  const overallAverage = useMemo(() => {
    const withStudents = classesList.filter((c) => c.studentCount > 0)
    if (withStudents.length === 0) return '98.8'
    const sum = withStudents.reduce((acc, c) => acc + c.academicAverage, 0)
    return (sum / withStudents.length).toFixed(1)
  }, [classesList])

  const activeOrg =
    SCHOOL_ORGS.find((o) => o.id === selectedOrgId) || SCHOOL_ORGS[0]

  const getUrl = (path: string) => {
    return orgSlug ? `/orgs/${orgSlug}${path}` : path
  }

  // Send SMS to class parents
  const handleSendClassSms = (e: React.FormEvent) => {
    e.preventDefault()
    if (!smsTitle.trim() || !smsBody.trim()) {
      toast.error('Lütfen duyuru başlığı ve mesaj metnini yazınız.')
      return
    }
    toast.success(
      `${selectedClassForDetail?.code} şubesi velilerine (${selectedClassForDetail?.studentCount} veli) SMS bildirimi başarıyla iletildi!`
    )
    setSmsTitle('')
    setSmsBody('')
  }

  const pageContent = (
    <div className="flex flex-col flex-1 w-full pb-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col flex-1 w-full dash-stagger-items"
      >
        {/* ── 1. HEADER & KPI SECTION (CLEAN & CATEGORIZED) ── */}
        {hideHeader ? (
          <div className="space-y-4 pb-2 px-1">
            {/* Executive Title & Primary Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-200 dark:border-gray-800">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-black mb-2 border border-purple-500/20">
                  <Building2 size={14} />
                  <span>Akademik Birimler & Şube Yönetimi</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  Sınıflar & Şubeler
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
                  Oxonom Okulları bünyesindeki tüm şubeler, rehber öğretmenler, sınıf mevcudu, akıllı tahta bağlantıları ve başarı durumları.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setActiveSubView(activeSubView === 'promotion' ? 'classes' : 'promotion')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-black shadow-xs cursor-pointer transition-all active:scale-98 ${
                    activeSubView === 'promotion'
                      ? 'bg-[#4B075F] text-white border-[#4B075F]'
                      : 'bg-white dark:bg-[#121826] hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200/90 dark:border-gray-800 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <Sparkles size={15} className={activeSubView === 'promotion' ? 'text-white' : 'text-[#8D49A6]'} />
                  <span>{activeSubView === 'promotion' ? 'Şubeler Listesine Dön' : 'Dönem Sonu Sınıf Atlatma & Nakil'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenNewClass}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-gradient hover:opacity-95 text-white text-xs font-black shadow-lg shadow-purple-950/20 cursor-pointer transition-all active:scale-98"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span>Yeni Sınıf / Şube Ekle</span>
                </button>
              </div>
            </div>

            {/* 4-Card KPI Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800 shadow-xs flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Building2 size={22} />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                    {classesList.length} Şube
                  </div>
                  <div className="text-xs font-semibold text-gray-400 mt-0.5">Toplam Aktif Şube</div>
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800 shadow-xs flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Users size={22} />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                    {totalStudentsCount} Öğrenci
                  </div>
                  <div className="text-xs font-semibold text-gray-400 mt-0.5">Toplam Kayıtlı Mevcut</div>
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800 shadow-xs flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <TrendingUp size={22} />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                    {overallAverage}
                  </div>
                  <div className="text-xs font-semibold text-gray-400 mt-0.5">Okul Akademik Ortalaması</div>
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800 shadow-xs flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Tv size={22} />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                    {classesList.filter((c) => c.boardStatus === 'online').length} / {classesList.length}
                  </div>
                  <div className="text-xs font-semibold text-gray-400 mt-0.5">Akıllı Tahta Çevrimiçi</div>
                </div>
              </div>
            </div>

            {/* Sub-bar Filter & Search */}
            {activeSubView === 'classes' && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800">
                {/* Kademe Filtreleri */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  <button
                    type="button"
                    onClick={() => setSelectedGradeFilter('ALL')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                      selectedGradeFilter === 'ALL'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    Tüm Sınıflar ({classesList.length})
                  </button>

                  {gradeLevels.map((grade) => {
                    const count = classesList.filter((c) => {
                      if (c.gradeLevel === grade) return true
                      const gNum = grade.match(/\d+/)
                      const cNum = c.gradeLevel.match(/\d+/) || c.code.match(/^\d+/)
                      return Boolean(gNum && cNum && gNum[0] === cNum[0])
                    }).length
                    const isSelected = selectedGradeFilter === grade
                    const labelText = grade.includes('Sınıf') || grade.includes('/') ? grade : `${grade}. Sınıf`
                    return (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => setSelectedGradeFilter(grade)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                          isSelected
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {labelText} ({count})
                      </button>
                    )
                  })}

                  <button
                    type="button"
                    onClick={() => setIsGradeModalOpen(true)}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1 cursor-pointer shrink-0"
                    title="Yeni Kademe Ekle veya Yönet"
                  >
                    <Plus size={13} />
                    <span>Kademe Ekle</span>
                  </button>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-72">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Şube (örn. 9/A), öğretmen veya derslik ara..."
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-gray-50 dark:bg-[#1A2234] border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Mobile View */
          <>
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
                    <Building2 size={13} className="text-purple-500 shrink-0" />
                    <span className="truncate">Sınıflar & Şubeler</span>
                  </span>
                </nav>
              </div>

              <span className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-black shrink-0 border border-purple-200/50">
                {classesList.length} Şube Aktif
              </span>
            </div>

            <section className="px-4 mt-3">
              <div className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-[#121826] rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
                <button
                  type="button"
                  onClick={() => setActiveSubView('classes')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeSubView === 'classes'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Building2 size={14} />
                  <span>Şubeler & Sınıflar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubView('promotion')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeSubView === 'promotion'
                      ? 'bg-[#4B075F] text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Sparkles size={14} />
                  <span>Dönem Sonu Sınıf Atlatma & Nakil</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenNewClass}
                  className="py-2 px-3.5 rounded-xl text-xs font-black bg-[#4B075F] hover:bg-[#620B79] text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus size={15} strokeWidth={2.5} />
                  <span>Yeni Sınıf</span>
                </button>
              </div>
            </section>

            {activeSubView === 'classes' && (
              <>
                <section className="px-4 mt-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800 shadow-xs">
                      <div className="text-sm font-black text-purple-600 dark:text-purple-400">
                        {classesList.length} Şube
                      </div>
                      <div className="text-[10px] font-bold text-gray-500 mt-0.5 truncate">
                        Toplam Şube
                      </div>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800 shadow-xs">
                      <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        {totalStudentsCount}
                      </div>
                      <div className="text-[10px] font-bold text-gray-500 mt-0.5 truncate">
                        Kayıtlı Öğrenci
                      </div>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800 shadow-xs">
                      <div className="text-sm font-black text-amber-600 dark:text-amber-400">
                        {overallAverage}
                      </div>
                      <div className="text-[10px] font-bold text-gray-500 mt-0.5 truncate">
                        Okul Başarısı
                      </div>
                    </div>
                  </div>
                </section>

                <section className="px-4 mt-3 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Şube (örn. 3-B), öğretmen veya derslik ara..."
                      className={`w-full h-11 pl-9 pr-3.5 rounded-2xl text-xs font-medium outline-hidden transition-all ${
                        theme === 'dark'
                          ? 'bg-[#121826] text-white placeholder-gray-500 border border-gray-800 focus:border-purple-500/60'
                          : 'bg-white text-gray-900 placeholder-gray-400 border border-gray-200/90 focus:border-purple-600 shadow-xs'
                      }`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenNewClass}
                    className="h-11 px-3.5 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white font-black text-xs flex items-center gap-1.5 shrink-0 shadow-md transition-all cursor-pointer"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    <span className="hidden sm:inline">Yeni Sınıf</span>
                    <span className="sm:hidden">Ekle</span>
                  </button>
                </section>

                <section className="px-4 mt-2.5">
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                    <button
                      type="button"
                      onClick={() => setSelectedGradeFilter('ALL')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                        selectedGradeFilter === 'ALL'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-white dark:bg-[#121826] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
                      }`}
                    >
                      Tüm Sınıflar ({classesList.length})
                    </button>

                    {gradeLevels.map((grade) => {
                      const count = classesList.filter((c) => {
                        if (c.gradeLevel === grade) return true
                        const gNum = grade.match(/\d+/)
                        const cNum = c.gradeLevel.match(/\d+/) || c.code.match(/^\d+/)
                        return Boolean(gNum && cNum && gNum[0] === cNum[0])
                      }).length
                      const isSelected = selectedGradeFilter === grade
                      const labelText = grade.includes('Sınıf') || grade.includes('/') ? grade : `${grade}. Sınıf`
                      return (
                        <button
                          key={grade}
                          type="button"
                          onClick={() => setSelectedGradeFilter(grade)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'bg-white dark:bg-[#121826] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
                          }`}
                        >
                          {labelText} ({count})
                        </button>
                      )
                    })}

                    <button
                      type="button"
                      onClick={() => setIsGradeModalOpen(true)}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold shrink-0 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 flex items-center gap-1 cursor-pointer"
                      title="Yeni Kademe Ekle veya Yönet"
                    >
                      <Plus size={13} />
                      <span>Kademe Yönetimi</span>
                    </button>
                  </div>
                </section>
              </>
            )}
          </>
        )}

        {/* ── 3. CLASSES VIEW WRAPPER ── */}
        {activeSubView === 'classes' && (
          <>
            {/* ── 6. SINIF KARTLARI LİSTESİ ── */}
            <section className={`px-4 mt-3 ${hideHeader ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 space-y-0' : 'space-y-2.5'}`}>
              <div className={`flex items-center justify-between text-xs text-gray-500 font-bold px-1 ${hideHeader ? 'col-span-full' : ''}`}>
                <span>Mevcut Şubeler ({filteredClasses.length})</span>
                <span>{activeOrg.name}</span>
              </div>

          {filteredClasses.map((cls) => (
            <motion.div
              key={cls.id}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                setSelectedClassForDetail(cls)
                setActiveDetailTab('genel')
              }}
              className="bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800/80 rounded-2xl p-3.5 shadow-xs transition-all hover:border-purple-500/40 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                {/* Sol Kısım: Sınıf Rozeti & Ana Bilgiler */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600/20 to-indigo-600/15 text-purple-700 dark:text-purple-300 font-black text-sm flex items-center justify-center border border-purple-500/20">
                      {cls.code}
                    </div>
                    {cls.boardStatus === 'online' && (
                      <span
                        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#121826]"
                        title="Akıllı Tahta Çevrimiçi"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs font-black text-gray-900 dark:text-white truncate">
                        {cls.name}
                      </h4>
                      <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/40">
                        {cls.gradeLevel}
                      </span>
                    </div>

                    <div className="text-[11px] text-gray-600 dark:text-gray-300 font-semibold mt-0.5 truncate flex items-center gap-1">
                      <User size={11} className="text-gray-400" />
                      <span>Rehber: {cls.teacherName}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[10.5px] text-gray-400 mt-1 flex-wrap">
                      <span>{cls.roomName}</span>
                      <span>·</span>
                      <span className="font-bold text-gray-700 dark:text-gray-300">
                        {cls.studentCount} / {cls.capacity} Öğrenci
                      </span>
                      <span>·</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        %{cls.attendanceRate} Katılım
                      </span>
                    </div>

                    {/* Kapasite Barı */}
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (cls.studentCount / cls.capacity) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Sağ Kısım: Aksiyon Butonları */}
                <div className="shrink-0 flex items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenEdit(cls)
                    }}
                    className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center transition-colors cursor-pointer"
                    title="Şube Bilgilerini Düzenle"
                  >
                    <Edit3 size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setClassToDelete(cls)
                    }}
                    className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                    title="Şubeyi Sil"
                  >
                    <Trash2 size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedClassForDetail(cls)
                      setActiveDetailTab('genel')
                    }}
                    className="w-8 h-8 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-600 dark:text-purple-400 flex items-center justify-center transition-colors cursor-pointer"
                    title="Detayları İncele"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

            {filteredClasses.length === 0 && (
              <div className={`py-12 text-center text-xs text-gray-400 bg-white dark:bg-[#121826] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 ${hideHeader ? 'col-span-full' : ''}`}>
                Arama kriterlerine uygun sınıf veya şube bulunamadı.
              </div>
            )}
          </section>
        </>
      )}

      {/* ── 7. SUB-VIEW: DÖNEM SONU SINIF ATLATMA & ŞUBE NAKİL ── */}
      {activeSubView === 'promotion' && (
        <div className="px-4 mt-3 space-y-4">
          {/* ── DÖNEM GEÇİŞ & TERFİ YÖNETİMİ HERO BANNER ── */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black shadow-md shadow-emerald-500/20">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900 dark:text-white">
                    Dönem Sonu Sınıf Kütüğü & Terfi / Nakil Yönetimi
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Öğrenci şube nakilleri, başka okuldan gelen nakil kayıtları ve dönem sonu otomatik sınıf atlatma
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {currentAcademicTerm} ➔ {targetAcademicTerm}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">Mevcut Dönem</label>
                <input
                  type="text"
                  value={currentAcademicTerm}
                  onChange={(e) => setCurrentAcademicTerm(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">Hedef Yeni Dönem</label>
                <input
                  type="text"
                  value={targetAcademicTerm}
                  onChange={(e) => setTargetAcademicTerm(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-emerald-600 dark:text-emerald-400"
                />
              </div>
              <div className="flex items-end">
                <div className="text-[11px] text-gray-500 font-medium">
                  Kütük aktarımı onaylandığında şubeler otomatik bir üst sınıfa aktarılır.
                </div>
              </div>
            </div>

            {/* Sub-Tab Selector for Transfer Modes */}
            <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800/60 rounded-2xl">
              <button
                type="button"
                onClick={() => setTransferTabMode('internal')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  transferTabMode === 'internal'
                    ? 'bg-white dark:bg-[#121826] text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Okul İçi Şube Nakli
              </button>
              <button
                type="button"
                onClick={() => setTransferTabMode('external')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  transferTabMode === 'external'
                    ? 'bg-white dark:bg-[#121826] text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Başka Okuldan Gelen Nakil
              </button>
              <button
                type="button"
                onClick={() => setTransferTabMode('bulk')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  transferTabMode === 'bulk'
                    ? 'bg-white dark:bg-[#121826] text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Toplu Sınıf Atlatma
              </button>
            </div>
          </div>

          {/* ── MOD 1: OKUL İÇİ ŞUBE NAKLİ ── */}
          {transferTabMode === 'internal' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HeartHandshake className="text-purple-600" size={18} />
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                    Okul İçi Şube Nakil İşlemleri
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-gray-400">Mevcut Öğrenci Şube Değişimi</span>
              </div>

              {/* Student Search & Select from Enrolled Students */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-gray-500">
                  Öğrenci Ara veya Listeden Seç
                </label>
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={transferStudentSearchQuery}
                    onChange={(e) => {
                      setTransferStudentSearchQuery(e.target.value)
                      setTransferStudentName(e.target.value)
                    }}
                    placeholder="Öğrenci adı (örn: Erçil UĞURLU) veya numara ile ara..."
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold"
                  />
                </div>

                {/* Quick dropdown pills of matching students */}
                <div className="flex flex-wrap gap-1.5 pt-1 max-h-28 overflow-y-auto">
                  {filteredEnrolledStudents.slice(0, 8).map((std: any) => (
                    <button
                      key={std.id || std.username}
                      type="button"
                      onClick={() => {
                        setTransferStudentName(std.name)
                        setTransferStudentSearchQuery(std.name)
                        const matchingCls = classesList.find((c) => c.code === std.className || c.id === std.classroomId)
                        if (matchingCls) {
                          setTransferSourceClassId(matchingCls.id)
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                        transferStudentName === std.name
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {std.name} · {std.className || '9-A'} ({std.studentNo || '2026-001'})
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleExecuteStudentTransfer} className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Mevcut (Kaynak) Şube</label>
                    <select
                      value={transferSourceClassId}
                      onChange={(e) => setTransferSourceClassId(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-xs"
                      required
                    >
                      <option value={0}>Kaynak Şube Seçiniz</option>
                      {classesList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} ({c.studentCount} Öğrenci)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Nakil Edilecek Öğrenci</label>
                    <input
                      type="text"
                      value={transferStudentName}
                      onChange={(e) => setTransferStudentName(e.target.value)}
                      placeholder="Öğrenci Adı Soyadı"
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Hedef Şube</label>
                    <select
                      value={transferTargetClassId}
                      onChange={(e) => setTransferTargetClassId(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-xs"
                      required
                    >
                      <option value={0}>Hedef Şube Seçiniz</option>
                      {classesList
                        .filter((c) => c.id !== transferSourceClassId)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.code} ({c.studentCount} / {c.capacity})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Resmi Nakil Gerekçesi</label>
                    <select
                      value={transferReason}
                      onChange={(e) => setTransferReason(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium text-xs"
                    >
                      <option value="Veli Talebi & İkametgah Değişikliği">Veli Talebi & İkametgah Değişikliği</option>
                      <option value="Rehberlik Servisi Şube Dengeleme Önerisi">Rehberlik Servisi Şube Dengeleme Önerisi</option>
                      <option value="İkiz Kardeş Ayrımı Talebi">İkiz Kardeş Ayrımı Talebi</option>
                      <option value="Sınıf Kontenjan Dengelemesi">Sınıf Kontenjan Dengelemesi</option>
                      <option value="Özel Eğitim & Kaynaştırma Uyarlaması">Özel Eğitim & Kaynaştırma Uyarlaması</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full h-10 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                      <HeartHandshake size={15} />
                      <span>Şube Naklini Gerçekleştir</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Son Nakil Geçmişi */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
                <div className="text-[11px] font-black text-gray-500 uppercase">Son Şube Nakil İşlem Kayıtları</div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {transferHistory.map((tr) => (
                    <div
                      key={tr.id}
                      className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 dark:text-white">{tr.student}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                          {tr.from} ➔ {tr.to}
                        </span>
                      </div>
                      <div className="text-[10.5px] text-gray-400">
                        {tr.reason} ({tr.date})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── MOD 2: BAŞKA OKULDAN GELEN NAKİL (EXTERNAL SCHOOL TRANSFER IN) ── */}
          {transferTabMode === 'external' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="text-emerald-600" size={18} />
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                    Başka Okuldan Gelen Öğrenci Nakil Kaydı
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  MEB E-Okul Nakil Modülü
                </span>
              </div>

              <form onSubmit={handleExecuteExternalTransfer} className="space-y-4 text-xs">
                {/* 1. Önceki Okul Bilgileri */}
                <div className="p-3.5 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-200/70 dark:border-gray-800 space-y-3">
                  <div className="text-[11px] font-black uppercase tracking-wider text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                    <School size={13} className="text-emerald-500" />
                    <span>Önceki Okul Bilgileri</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">Geldiği Okulun Resmi Adı</label>
                      <input
                        type="text"
                        value={extSchoolName}
                        onChange={(e) => setExtSchoolName(e.target.value)}
                        placeholder="Örn: Kadıköy Atatürk İlkokulu"
                        className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">MEB Kurum Kodu</label>
                      <input
                        type="text"
                        value={extSchoolCode}
                        onChange={(e) => setExtSchoolCode(e.target.value)}
                        placeholder="Örn: 748921"
                        className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">Geldiği Şehir / İlçe</label>
                      <input
                        type="text"
                        value={extSchoolCity}
                        onChange={(e) => setExtSchoolCity(e.target.value)}
                        placeholder="İstanbul / Kadıköy"
                        className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">Önceki Sınıfı & Şubesi</label>
                      <input
                        type="text"
                        value={extPrevClass}
                        onChange={(e) => setExtPrevClass(e.target.value)}
                        placeholder="Örn: 2-B"
                        className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">E-Okul Nakil Belge No</label>
                      <input
                        type="text"
                        value={extEokulDocNo}
                        onChange={(e) => setExtEokulDocNo(e.target.value)}
                        placeholder="NKL-2026/0419"
                        className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-mono font-bold text-emerald-600"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Öğrenci Kimlik ve Hedef Sınıf */}
                <div className="p-3.5 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-200/70 dark:border-gray-800 space-y-3">
                  <div className="text-[11px] font-black uppercase tracking-wider text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                    <User size={13} className="text-emerald-500" />
                    <span>Öğrenci Bilgileri & Hedef Şube</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">T.C. Kimlik No</label>
                      <input
                        type="text"
                        maxLength={11}
                        value={extTcNo}
                        onChange={(e) => setExtTcNo(e.target.value)}
                        placeholder="11 Haneli TC Kimlik"
                        className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-mono font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">Öğrenci Adı Soyadı</label>
                      <input
                        type="text"
                        value={extStudentName}
                        onChange={(e) => setExtStudentName(e.target.value)}
                        placeholder="Öğrenci Adı Soyadı"
                        className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">Cinsiyet</label>
                      <select
                        value={extGender}
                        onChange={(e) => setExtGender(e.target.value as any)}
                        className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-bold"
                      >
                        <option value="Erkek">Erkek</option>
                        <option value="Kız">Kız</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">Doğum Tarihi</label>
                      <input
                        type="text"
                        value={extBirthDate}
                        onChange={(e) => setExtBirthDate(e.target.value)}
                        placeholder="GG.AA.YYYY"
                        className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">Kan Grubu</label>
                      <select
                        value={extBloodType}
                        onChange={(e) => setExtBloodType(e.target.value)}
                        className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-bold text-rose-600"
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
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">Kurumumuzda Hedef Şube</label>
                      <select
                        value={extTargetClassId}
                        onChange={(e) => setExtTargetClassId(Number(e.target.value))}
                        className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-bold text-emerald-600"
                        required
                      >
                        <option value={0}>Hedef Şube Seçiniz</option>
                        {classesList.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.code} ({c.studentCount} / {c.capacity})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3. Veli İletişim Bilgileri */}
                <div className="p-3.5 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-200/70 dark:border-gray-800 space-y-3">
                  <div className="text-[11px] font-black uppercase tracking-wider text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                    <HeartHandshake size={13} className="text-emerald-500" />
                    <span>Veli Bilgileri</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">Veli Adı Soyadı</label>
                      <input
                        type="text"
                        value={extParentName}
                        onChange={(e) => setExtParentName(e.target.value)}
                        placeholder="Anne / Baba Adı"
                        className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">Veli Telefon Numarası</label>
                      <input
                        type="text"
                        value={extParentPhone}
                        onChange={(e) => setExtParentPhone(e.target.value)}
                        placeholder="+90 532 ..."
                        className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">Resmi Nakil Sebebi</label>
                      <select
                        value={extTransferReason}
                        onChange={(e) => setExtTransferReason(e.target.value)}
                        className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-medium"
                      >
                        <option value="İkametgah Değişikliği ve Nakil">İkametgah Değişikliği ve Nakil</option>
                        <option value="Özel Okula Geçiş / Kurum Tercihi">Özel Okula Geçiş / Kurum Tercihi</option>
                        <option value="Rehberlik / Eğitim Odaklı Nakil">Rehberlik / Eğitim Odaklı Nakil</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-11 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span>Başka Okuldan Nakil Kaydını Onayla ve Sınıfa Ekle</span>
                </button>
              </form>
            </div>
          )}

          {/* ── MOD 3: DÖNEM SONU TOPLU SINIF ATLATMA ── */}
          {transferTabMode === 'bulk' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="text-emerald-600" size={18} />
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                  Toplu Sınıf Atlatma & Mezuniyet Matrisi
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Otomatik Terfi
              </span>
            </div>

            {/* Kurallar ve Seçenekler */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/70 dark:border-gray-700/60 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={carryTeachersWithClass}
                  onChange={(e) => setCarryTeachersWithClass(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Rehber Öğretmenleri Sınıfla Taşı</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={preserveSectionCodes}
                  onChange={(e) => setPreserveSectionCodes(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Şube Kodlarını Koru (1/A ➔ 2/A)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={archiveGraduates}
                  onChange={(e) => setArchiveGraduates(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Son Kademeyi Mezunlara Arşivle</span>
              </label>
            </div>

            {/* İstisna / Sınıf Tekrarı Listesi */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-700 dark:text-gray-300">
                  Sınıf Tekrarına Kalan Öğrenciler (ŞÖK İstisnaları)
                </span>
                <span className="text-[10px] text-gray-400">Bu öğrenciler üst kademeye geçmez</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRepeatingInput}
                  onChange={(e) => setNewRepeatingInput(e.target.value)}
                  placeholder="Öğrenci Adı ve Şube (Örn: Can AKSOY - 2-B)"
                  className="flex-1 h-9 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newRepeatingInput.trim()) {
                      setRepeatingStudents([...repeatingStudents, newRepeatingInput.trim()])
                      setNewRepeatingInput('')
                    }
                  }}
                  className="h-9 px-3 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-800 dark:text-gray-200 font-bold text-xs"
                >
                  İstisna Ekle
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {repeatingStudents.map((st, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-[11px] font-bold"
                  >
                    <span>{st}</span>
                    <button
                      type="button"
                      onClick={() => setRepeatingStudents(repeatingStudents.filter((_, i) => i !== idx))}
                      className="hover:text-rose-500 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Simülasyon / Önizleme Listesi */}
            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="text-xs font-black text-gray-900 dark:text-white">
                Dönem Sonu Terfi Simülasyonu & Dağılımı ({classesList.length} Şube)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {classesList.map((c) => {
                  const numMatch = c.code.match(/^(\d+)/)
                  const currentNum = numMatch ? parseInt(numMatch[1], 10) : c.gradeNumber || 1
                  const isGraduating = (selectedOrgId === 10 && currentNum >= 4) ||
                    (selectedOrgId === 20 && currentNum >= 8) ||
                    (selectedOrgId === 30 && currentNum >= 12)
                  const branchLetter = c.code.replace(/^.*[\/-]/, '').trim().toUpperCase() || 'A'
                  const nextCode = isGraduating
                    ? '🎓 Mezunlar Kütüğü'
                    : `${currentNum + 1}/${branchLetter}`

                  return (
                    <div
                      key={c.id}
                      className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/70 dark:border-gray-700/60 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-purple-600 dark:text-purple-400">{c.code}</span>
                        <ArrowRight size={13} className="text-gray-400" />
                        <span className={`font-black text-xs ${isGraduating ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {nextCode}
                        </span>
                      </div>
                      <div className="text-[10.5px] text-gray-500 flex justify-between">
                        <span>{c.studentCount} Öğrenci</span>
                        <span>{carryTeachersWithClass ? c.teacherName : 'Yeni Öğretmen'}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Aksiyon Butonları */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={handleRollbackPromotion}
                className="px-4 h-11 rounded-2xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-bold text-xs flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
              >
                <RotateCcw size={15} />
                <span>Önceki Döneme Geri Al (Rollback)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsConfirmPromotionOpen(true)}
                className="px-6 h-11 rounded-2xl bg-brand-gradient hover:opacity-95 text-white font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-950/20 w-full sm:w-auto justify-center"
              >
                <Sparkles size={16} />
                <span>Dönem Sonu Sınıf Atlatmayı Başlat ve Onayla</span>
              </button>
            </div>
          </div>
        )}
      </div>
      )}
      </motion.div>

      {/* ── MODAL 1: SINIF TÜM DETAYLARI MODALI (KATEGORİK VE SEKME BAZLI) ── */}
      <AnimatePresence>
        {selectedClassForDetail && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedClassForDetail(null)}
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
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-sm">
                      {selectedClassForDetail.code}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white truncate">
                          {selectedClassForDetail.name}
                        </h3>
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/40">
                          {selectedClassForDetail.gradeLevel}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold truncate mt-0.5">
                        {selectedClassForDetail.roomName} · Rehber:{' '}
                        {selectedClassForDetail.teacherName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const c = selectedClassForDetail
                        handleOpenEdit(c)
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      title="Şube Bilgilerini Düzenle"
                    >
                      <Edit3 size={13} />
                      <span>Düzenle</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedClassForDetail(null)}
                      className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>

                {/* ── KATEGORİSEL SEKMELER PİLLS ── */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-3 -mx-1 px-1">
                  {[
                    { id: 'genel', label: 'Genel Bakış', icon: Building2 },
                    { id: 'yoklama', label: 'Günlük Yoklama', icon: Activity },
                    { id: 'akademik', label: 'Başarı & Sınavlar', icon: BarChart3 },
                    { id: 'ogrenciler', label: 'Öğrenci Listesi', icon: Users },
                    { id: 'program', label: 'Ders Programı', icon: Calendar },
                    { id: 'islemler', label: 'İdari İşlemler', icon: Send },
                  ].map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeDetailTab === tab.id
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() =>
                          setActiveDetailTab(tab.id as ClassDetailTabKey)
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                          isActive
                            ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                            : 'bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon
                          size={12}
                          className={isActive ? 'text-white' : 'text-gray-400'}
                        />
                        <span>{tab.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Scrollable Tab Body */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs">
                {/* ── SEKME 1: GENEL BAKIŞ & KÜNYE ── */}
                {activeDetailTab === 'genel' && (
                  <div className="space-y-3">
                    {/* Sınıf Rehber Öğretmeni Kartı */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-purple-500/10 to-indigo-500/10 border border-purple-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-black text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                          Sınıf Rehber Öğretmeni
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500 text-white">
                          Atandı
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                            {selectedClassForDetail.teacherName
                              .split(' ')
                              .map((p) => p[0])
                              .join('')
                              .slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-black text-gray-900 dark:text-white text-xs">
                              {selectedClassForDetail.teacherName}
                            </div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">
                              {selectedClassForDetail.teacherBranch} · Uzman Öğretmen
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <a
                            href={`tel:${selectedClassForDetail.teacherPhone}`}
                            className="p-2 rounded-xl bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50"
                            title="Ara"
                          >
                            <Phone size={13} />
                          </a>
                          <a
                            href={`mailto:${selectedClassForDetail.teacherEmail}`}
                            className="p-2 rounded-xl bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50"
                            title="E-Posta"
                          >
                            <Mail size={13} />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Sınıf Bilgi Tablosu */}
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                        <span className="text-gray-500 font-bold">Fiziksel Derslik</span>
                        <span className="font-extrabold text-gray-900 dark:text-white">
                          {selectedClassForDetail.roomName}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                        <span className="text-gray-500 font-bold">Akıllı Tahta Durumu</span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Tv size={13} />
                          <span>{selectedClassForDetail.boardName} (Çevrimiçi)</span>
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                        <span className="text-gray-500 font-bold">Kapasite & Mevcut</span>
                        <span className="font-extrabold text-gray-900 dark:text-white">
                          {selectedClassForDetail.studentCount} / {selectedClassForDetail.capacity} Öğrenci
                          (%
                          {Math.round(
                            (selectedClassForDetail.studentCount /
                              selectedClassForDetail.capacity) *
                              100
                          )}{' '}
                          Dolu)
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                        <span className="text-gray-500 font-bold">Cinsiyet Dağılımı</span>
                        <span className="font-extrabold text-gray-900 dark:text-white">
                          {selectedClassForDetail.girlsCount} Kız (%
                          {Math.round(
                            (selectedClassForDetail.girlsCount /
                              selectedClassForDetail.studentCount) *
                              100
                          )}
                          ) · {selectedClassForDetail.boysCount} Erkek (%
                          {Math.round(
                            (selectedClassForDetail.boysCount /
                              selectedClassForDetail.studentCount) *
                              100
                          )}
                          )
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                        <span className="text-gray-500 font-bold">Sınıf Temsilcisi</span>
                        <span className="font-extrabold text-purple-600 dark:text-purple-400">
                          {selectedClassForDetail.classPresident}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                        <span className="text-gray-500 font-bold">Sınıf Veli Temsilcisi</span>
                        <span className="font-extrabold text-gray-900 dark:text-white text-right">
                          {selectedClassForDetail.parentRepresentative}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── SEKME 2: GÜNLÜK YOKLAMA & DEVAMSIZLIK ── */}
                {activeDetailTab === 'yoklama' && (
                  <div className="space-y-3">
                    {/* Bugünkü Katılım Kartı */}
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200 dark:border-gray-800 shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-xs font-black text-gray-900 dark:text-white">
                            Bugünkü Yoklama Durumu
                          </span>
                          <p className="text-[10px] text-gray-400">Sabah Yoklaması Tamamlandı</p>
                        </div>
                        <span className="text-xs font-black text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-xl">
                          %{selectedClassForDetail.attendanceRate} Katılım
                        </span>
                      </div>

                      {/* Bar */}
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden flex">
                        <div
                          className="bg-[#10B981] h-full"
                          style={{
                            width: `${selectedClassForDetail.attendanceRate}%`,
                          }}
                        />
                        <div
                          className="bg-amber-400 h-full"
                          style={{
                            width: `${100 - selectedClassForDetail.attendanceRate}%`,
                          }}
                        />
                      </div>

                      {/* Sayılar */}
                      <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800 text-center">
                        <div>
                          <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                            {selectedClassForDetail.presentToday}
                          </div>
                          <div className="text-[10px] text-gray-500 font-bold">Mevcut</div>
                        </div>
                        <div>
                          <div className="text-sm font-black text-amber-500">
                            {selectedClassForDetail.leaveToday}
                          </div>
                          <div className="text-[10px] text-gray-500 font-bold">İzinli / Rapor</div>
                        </div>
                        <div>
                          <div className="text-sm font-black text-gray-400">
                            {selectedClassForDetail.absentToday}
                          </div>
                          <div className="text-[10px] text-gray-500 font-bold">Devamsız</div>
                        </div>
                      </div>
                    </div>

                    {/* İzinli Öğrenci Bilgisi */}
                    {selectedClassForDetail.leaveNote && (
                      <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5">
                        <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[11px] font-black text-amber-900 dark:text-amber-300">
                            İzinli / Raporlu Öğrenci Kaydı
                          </span>
                          <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 mt-0.5">
                            {selectedClassForDetail.leaveNote}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Haftalık Yoklama Trendi */}
                    <div>
                      <div className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-2">
                        Haftalık Katılım Trendi (Pzt - Cuma)
                      </div>
                      <div className="grid grid-cols-5 gap-1.5 text-center">
                        {[
                          { day: 'Pzt', rate: '%98.0' },
                          { day: 'Sal', rate: '%96.7' },
                          { day: 'Çar', rate: '%97.2' },
                          { day: 'Per', rate: '%96.7' },
                          { day: 'Cum', rate: '%94.5' },
                        ].map((d, i) => (
                          <div
                            key={i}
                            className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800"
                          >
                            <div className="text-[10px] font-bold text-gray-400">{d.day}</div>
                            <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                              {d.rate}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Link
                      href={getUrl('/m-admin-students')}
                      className="w-full h-9 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Tüm Öğrenci Devamsızlıklarını İncele</span>
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                )}

                {/* ── SEKME 3: AKADEMİK BAŞARI & SINAV NOTLARI & GRAFİKLER ── */}
                {activeDetailTab === 'akademik' && (
                  <div className="space-y-3">
                    {/* Sınıf Genel Başarı Ortalaması Kartı */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-purple-100 uppercase tracking-wider">
                          Sınıf Başarı Ortalaması
                        </span>
                        <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <TrendingUp size={11} /> Okuldan +4.3 Puan
                        </span>
                      </div>
                      <div className="text-2xl font-black mt-2">
                        {selectedClassForDetail.academicAverage}{' '}
                        <span className="text-xs font-semibold text-purple-100">/ 100</span>
                      </div>
                      <div className="text-[11px] text-purple-100 mt-1">
                        Kademe seviyesi ve zümre ortalamalarında 1. sırada yer almaktadır.
                      </div>
                    </div>

                    {/* Ders Bazlı Ortalamalar & Grafikler */}
                    <div>
                      <div className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-2">
                        Ders Bazlı Başarı Grafikleri
                      </div>
                      <div className="space-y-2.5">
                        {selectedClassForDetail.courseAverages.map((ca, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800"
                          >
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-extrabold text-gray-900 dark:text-white">
                                {ca.course}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-400">
                                  En Yüksek: {ca.highest} · En Düşük: {ca.lowest}
                                </span>
                                <span className="font-black text-purple-600 dark:text-purple-400">
                                  {ca.average}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-purple-600 h-full rounded-full transition-all duration-500"
                                style={{ width: `${ca.average}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Başarı Dağılım Dilimleri */}
                    <div className="p-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121826]">
                      <div className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-2">
                        Öğrenci Başarı Dilimleri
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/40">
                          <div className="text-sm font-black">18 Öğrenci</div>
                          <div className="text-[10px]">85–100 (Pekiyi)</div>
                        </div>
                        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold border border-blue-200/40">
                          <div className="text-sm font-black">9 Öğrenci</div>
                          <div className="text-[10px]">70–84 (İyi)</div>
                        </div>
                        <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold border border-amber-200/40">
                          <div className="text-sm font-black">3 Öğrenci</div>
                          <div className="text-[10px]">55–69 (Orta)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── SEKME 4: ÖĞRENCİ LİSTESİ ── */}
                {activeDetailTab === 'ogrenciler' && (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        value={detailStudentSearch}
                        onChange={(e) => setDetailStudentSearch(e.target.value)}
                        placeholder="Öğrenci adı veya numarası ara..."
                        className="w-full h-9 pl-8 pr-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-500 font-bold">
                      <span>Sınıf Mevcudu ({classStudents.length} Öğrenci)</span>
                      <span>Kız: {selectedClassForDetail.girlsCount} · Erkek: {selectedClassForDetail.boysCount}</span>
                    </div>

                    <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-0.5">
                      {classStudents.map((std, idx) => (
                        <div
                          key={std.id || idx}
                          className="p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121826] flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 text-purple-700 dark:text-purple-300 font-black text-[11px] flex items-center justify-center shrink-0">
                              {std.name
                                .split(' ')
                                .map((p: string) => p[0])
                                .join('')
                                .slice(0, 2)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-extrabold text-gray-900 dark:text-white truncate flex items-center gap-1.5">
                                <span>{std.name}</span>
                                {std.is_demo && (
                                  <span className="text-[9px] font-black px-1 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                                    Başkan
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-gray-400 font-medium truncate">
                                No: {std.studentNo} · Veli: {std.parentName}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-1.5">
                            <a
                              href={`tel:${std.fatherPhone || std.motherPhone}`}
                              className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-gray-200"
                              title="Veli Telefonu"
                            >
                              <Phone size={11} />
                            </a>
                            <Link
                              href={getUrl('/m-admin-students')}
                              className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 hover:bg-purple-100"
                              title="Öğrenci Detayı"
                            >
                              <ChevronRight size={13} />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── SEKME 5: HAFTALIK DERS PROGRAMI & DERSLİK ── */}
                {activeDetailTab === 'program' && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-purple-600 dark:text-purple-400" />
                        <div>
                          <div className="font-black text-purple-900 dark:text-purple-300">
                            Haftalık Toplam 30 Ders Saati
                          </div>
                          <div className="text-[10px] text-purple-800/80 dark:text-purple-400/80">
                            Derslik: {selectedClassForDetail.roomName}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200">
                        MEB Uyumlu
                      </span>
                    </div>

                    {/* Günün Akışı */}
                    <div>
                      <div className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-2">
                        Bugünkü Ders Akışı (Pazartesi)
                      </div>
                      <div className="space-y-1.5">
                        {[
                          { time: '08:40 - 09:20', course: 'Türkçe (Okuma & Anlama)', teacher: selectedClassForDetail.teacherName },
                          { time: '09:35 - 10:15', course: 'Türkçe (Yazım Kuralları)', teacher: selectedClassForDetail.teacherName },
                          { time: '10:30 - 11:10', course: 'Matematik (Doğal Sayılar)', teacher: selectedClassForDetail.teacherName },
                          { time: '11:25 - 12:05', course: 'Beden Eğitimi ve Oyun', teacher: selectedClassForDetail.teacherName },
                          { time: '12:50 - 13:30', course: 'Hayat Bilgisi / Fen', teacher: selectedClassForDetail.teacherName },
                          { time: '13:45 - 14:25', course: 'Yabancı Dil (İngilizce)', teacher: 'İngilizce Zümresi' },
                        ].map((slot, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121826] flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-bold text-gray-400">
                                {slot.time}
                              </span>
                              <span className="font-extrabold text-gray-900 dark:text-white">
                                {slot.course}
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-500 font-semibold truncate">
                              {slot.teacher}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── SEKME 6: HIZLI İDARİ İŞLEMLER & BİLDİRİM ── */}
                {activeDetailTab === 'islemler' && (
                  <div className="space-y-3">
                    {/* Sınıf Velilerine Toplu SMS */}
                    <form onSubmit={handleSendClassSms} className="p-3.5 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200 dark:border-gray-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                          <Send size={13} className="text-purple-600" />
                          <span>Sınıf Velilerine Toplu SMS / Duyuru</span>
                        </span>
                        <span className="text-[10px] font-black text-purple-600 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-md">
                          {selectedClassForDetail.studentCount} Veliye İletilir
                        </span>
                      </div>

                      <div>
                        <input
                          type="text"
                          value={smsTitle}
                          onChange={(e) => setSmsTitle(e.target.value)}
                          placeholder="Duyuru Başlığı (örn: Veli Toplantısı Duyurusu)"
                          className="w-full h-9 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-xs"
                          required
                        />
                      </div>

                      <div>
                        <textarea
                          rows={2}
                          value={smsBody}
                          onChange={(e) => setSmsBody(e.target.value)}
                          placeholder="Velilere gönderilecek SMS mesajı..."
                          className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium text-xs resize-none"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full h-10 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Send size={13} />
                        <span>Sınıf Velilerine Bildirimi Gönder</span>
                      </button>
                    </form>

                    {/* Dışa Aktarma Butonları */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          toast.success(
                            `${selectedClassForDetail.code} sınıf listesi Excel formatında indirildi.`
                          )
                        }
                        className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/80 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Download size={13} />
                        <span>Excel Sınıf Listesi</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          toast.success(
                            `${selectedClassForDetail.code} başarı ve karne raporu PDF olarak oluşturuldu.`
                          )
                        }
                        className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/80 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <FileText size={13} />
                        <span>PDF Başarı Raporu</span>
                      </button>
                    </div>

                    {/* Şubeyi Sil Butonu */}
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                      <button
                        type="button"
                        onClick={() => {
                          const c = selectedClassForDetail
                          setClassToDelete(c)
                        }}
                        className="w-full h-10 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-black text-xs border border-rose-200/50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>Bu Şubeyi Sistemden Kaldır / Sil</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 2: YENİ SINIF / ŞUBE OLUŞTUR MODALI ── */}
      <AnimatePresence>
        {isNewClassModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewClassModalOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%', opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.8 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className={`relative w-full sm:max-w-xl lg:max-w-2xl max-h-[92vh] rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col z-10 overflow-hidden ${
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
                    <Plus size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white">
                      Yeni Sınıf / Şube Tanımla
                    </h3>
                    <p className="text-[11px] text-gray-400">{activeOrg.name}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNewClassModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCreateNewClass} className="p-5 overflow-y-auto space-y-4 text-xs">
                {/* 1. Kademe Seviyesi Custom Dropdown with Inline Edit/Delete/Add */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-bold text-gray-500">
                      Kademe Seviyesi
                    </label>
                    <span className="text-[10px] text-gray-400 font-medium">
                      Tıklayarak kademeyi seçebilir, düzenleyebilir veya silebilirsiniz
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsGradeDropdownOpen(!isGradeDropdownOpen)}
                    className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold flex items-center justify-between text-left cursor-pointer hover:border-emerald-500 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Layers size={16} className="text-emerald-500 shrink-0" />
                      <span className="text-sm font-black text-gray-900 dark:text-white">
                        {formGradeLevel}
                      </span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform duration-200 ${
                        isGradeDropdownOpen ? 'rotate-180 text-emerald-500' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isGradeDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-white dark:bg-[#151C2C] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-2.5 space-y-1 max-h-64 overflow-y-auto">
                      <div className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase tracking-wider flex items-center justify-between">
                        <span>Mevcut Sınıf Kademeleri ({gradeLevels.length})</span>
                        <span>Seç / Düzenle / Sil</span>
                      </div>

                      {gradeLevels.map((lvl, idx) => (
                        <div
                          key={lvl}
                          className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                            formGradeLevel === lvl
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800/70 text-gray-700 dark:text-gray-200 font-bold'
                          }`}
                        >
                          {editingGradeIndex === idx ? (
                            <div
                              className="flex items-center gap-1.5 flex-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="text"
                                value={editingGradeName}
                                onChange={(e) => setEditingGradeName(e.target.value)}
                                className="flex-1 h-7 px-2 rounded-lg bg-white dark:bg-gray-900 border border-emerald-500 text-xs font-bold text-gray-900 dark:text-white"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleSaveEditGrade(idx)
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveEditGrade(idx)}
                                className="w-7 h-7 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center cursor-pointer transition-colors"
                                title="Kaydet"
                              >
                                <Check size={12} strokeWidth={3} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingGradeIndex(null)}
                                className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center cursor-pointer"
                                title="Vazgeç"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormGradeLevel(lvl)
                                  setIsGradeDropdownOpen(false)
                                  const match = lvl.match(/\d+/)
                                  if (match) {
                                    setFormCode(`${match[0]}-A`)
                                  }
                                }}
                                className="flex items-center gap-2 flex-1 text-left cursor-pointer"
                              >
                                <span>{lvl}</span>
                                {formGradeLevel === lvl && (
                                  <Check size={13} className="text-emerald-500 shrink-0" />
                                )}
                              </button>
                              <div
                                className="flex items-center gap-1 shrink-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingGradeIndex(idx)
                                    setEditingGradeName(lvl)
                                  }}
                                  className="w-6 h-6 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center justify-center cursor-pointer transition-colors"
                                  title="Kademeyi Düzenle"
                                >
                                  <Edit3 size={11} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteGrade(lvl)}
                                  className="w-6 h-6 rounded-md hover:bg-red-500/20 text-gray-400 hover:text-red-500 flex items-center justify-center cursor-pointer transition-colors"
                                  title="Kademeyi Sil"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}

                      {/* Add New Grade Section at the bottom */}
                      <div
                        className="pt-2 mt-1 border-t border-gray-100 dark:border-gray-800"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={newGradeName}
                            onChange={(e) => setNewGradeName(e.target.value)}
                            placeholder="Yeni Kademe (Örn: 10. Sınıf)"
                            className="flex-1 h-8 px-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-bold"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleAddGrade(newGradeName)
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleAddGrade(newGradeName)}
                            className="h-8 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                          >
                            <Plus size={13} strokeWidth={2.5} />
                            <span>Ekle</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Şube Kodu / Adı with Quick Letter Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-bold text-gray-500">
                      Şube Kodu / Adı
                    </label>
                    <span className="text-[10px] text-gray-400 font-medium">
                      Harfe tıklayarak hızlıca atayabilirsiniz
                    </span>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      placeholder="Örn: 10/G veya 9/A"
                      className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-black uppercase text-sm tracking-wider"
                      required
                    />

                    {/* Quick Select Letter Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-gray-400 mr-1">Hızlı Şube:</span>
                      {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((letter) => {
                        const match = formGradeLevel.match(/\d+/)
                        const targetCode = match ? `${match[0]}/${letter}` : letter
                        const isSelected = formCode === targetCode || formCode === letter || formCode.endsWith(`/${letter}`) || formCode.endsWith(`-${letter}`)
                        return (
                          <button
                            key={letter}
                            type="button"
                            onClick={() => setFormCode(targetCode)}
                            className={`w-8 h-7 rounded-lg text-xs font-black cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-purple-600 text-white shadow-xs scale-105'
                                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                            }`}
                          >
                            {letter}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* 3. Fiziksel Derslik & Kapasite */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">
                      Fiziksel Derslik Alanı
                    </label>
                    <input
                      type="text"
                      value={formRoomName}
                      onChange={(e) => setFormRoomName(e.target.value)}
                      placeholder="Örn: 2. Kat · Derslik 205"
                      className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">
                      Öğrenci Kapasitesi (Maksimum)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={45}
                      value={formCapacity}
                      onChange={(e) => setFormCapacity(Number(e.target.value))}
                      className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                      required
                    />
                  </div>
                </div>

                {/* 4. Sınıf Rehber Öğretmeni */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">
                    Sınıf Rehber Öğretmeni
                  </label>
                  <select
                    value={formTeacherName}
                    onChange={(e) => setFormTeacherName(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                  >
                    {availableTeachers.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name} ({t.branch})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full h-12 mt-4 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plus size={18} strokeWidth={2.5} />
                  <span>Sınıfı Kaydet ve Listeye Ekle</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 3: SINIF BİLGİLERİNİ GÜNCELLE MODALI ── */}
      <AnimatePresence>
        {classToEdit && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setClassToEdit(null)}
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
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Edit3 size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white">
                      Sınıf Bilgilerini Düzenle
                    </h3>
                    <p className="text-[11px] text-gray-400">{classToEdit.name}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setClassToEdit(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Categorized Tab Bar for Edit Form */}
              <div className="flex items-center px-4 pt-3 pb-1 border-b border-gray-100 dark:border-gray-800 gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { key: 'temel', label: 'Temel & Derslik', icon: Layers },
                  { key: 'rehber', label: 'Rehber & Temsil', icon: GraduationCap },
                  { key: 'mevcut', label: 'Mevcut & Yoklama', icon: Users },
                  { key: 'akademik', label: 'Başarı & Notlar', icon: Award },
                ].map((tb) => {
                  const Icon = tb.icon
                  const isActive = editClassSection === tb.key
                  return (
                    <button
                      key={tb.key}
                      type="button"
                      onClick={() => setEditClassSection(tb.key as any)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-purple-600 text-white shadow-sm'
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
                {editClassSection === 'temel' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-bold text-gray-500">
                            Kademe Seviyesi
                          </label>
                          <button
                            type="button"
                            onClick={() => setIsGradeModalOpen(true)}
                            className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <Plus size={11} />
                            <span>Yeni Kademe</span>
                          </button>
                        </div>
                        <select
                          value={formGradeLevel}
                          onChange={(e) => setFormGradeLevel(e.target.value)}
                          className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                        >
                          {gradeLevels.map((lvl) => (
                            <option key={lvl} value={lvl}>
                              {lvl}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">
                          Şube Kodu
                        </label>
                        <input
                          type="text"
                          value={formCode}
                          onChange={(e) => setFormCode(e.target.value)}
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-black uppercase"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">
                          Fiziksel Derslik / Kat
                        </label>
                        <input
                          type="text"
                          value={formRoomName}
                          onChange={(e) => setFormRoomName(e.target.value)}
                          placeholder="Örn: 2. Kat · Derslik 202"
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">
                          Öğrenci Kapasitesi
                        </label>
                        <input
                          type="number"
                          min={10}
                          max={50}
                          value={formCapacity}
                          onChange={(e) => setFormCapacity(Number(e.target.value))}
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">
                          Akıllı Tahta Tanımı
                        </label>
                        <input
                          type="text"
                          value={formBoardName}
                          onChange={(e) => setFormBoardName(e.target.value)}
                          placeholder="Örn: 1-A Akıllı Tahta"
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">
                          Tahta Bağlantı Durumu
                        </label>
                        <select
                          value={formBoardStatus}
                          onChange={(e) => setFormBoardStatus(e.target.value as any)}
                          className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                        >
                          <option value="online">Aktif (Çevrim İçi)</option>
                          <option value="offline">Pasif (Çevrim Dışı)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">
                        Haftalık Program Yükü
                      </label>
                      <input
                        type="text"
                        value={formScheduleSummary}
                        onChange={(e) => setFormScheduleSummary(e.target.value)}
                        placeholder="Örn: Haftalık 30 Saat"
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                      />
                    </div>
                  </div>
                )}

                {editClassSection === 'rehber' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">
                        Sınıf Rehber Öğretmeni
                      </label>
                      <select
                        value={formTeacherName}
                        onChange={(e) => setFormTeacherName(e.target.value)}
                        className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                      >
                        {availableTeachers.map((t) => (
                          <option key={t.id} value={t.name}>
                            {t.name} ({t.branch})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">
                        Sınıf Başkanı (Öğrenci)
                      </label>
                      <input
                        type="text"
                        value={formClassPresident}
                        onChange={(e) => setFormClassPresident(e.target.value)}
                        placeholder="Örn: Ali Efe YILMAZ"
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">
                        Sınıf Veli Temsilcisi
                      </label>
                      <input
                        type="text"
                        value={formParentRepresentative}
                        onChange={(e) => setFormParentRepresentative(e.target.value)}
                        placeholder="Örn: Ayşe YILMAZ"
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                      />
                    </div>
                  </div>
                )}

                {editClassSection === 'mevcut' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">
                          Toplam Kayıtlı
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={formStudentCount}
                          onChange={(e) => setFormStudentCount(Number(e.target.value))}
                          className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-pink-500 mb-1">
                          Kız Öğrenci
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={50}
                          value={formGirlsCount}
                          onChange={(e) => setFormGirlsCount(Number(e.target.value))}
                          className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-pink-200 dark:border-pink-900/50 font-bold text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-blue-500 mb-1">
                          Erkek Öğrenci
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={50}
                          value={formBoysCount}
                          onChange={(e) => setFormBoysCount(Number(e.target.value))}
                          className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-blue-200 dark:border-blue-900/50 font-bold text-center"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-2.5">
                      <div className="text-[11px] font-black text-gray-700 dark:text-gray-300">
                        Bugünkü Yoklama Durumu
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-emerald-600 mb-1">
                            Mevcut (Gelen)
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={50}
                            value={formPresentToday}
                            onChange={(e) => setFormPresentToday(Number(e.target.value))}
                            className="w-full h-10 px-2 rounded-xl bg-white dark:bg-gray-800 border border-emerald-300 dark:border-emerald-800 font-black text-center text-emerald-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-amber-500 mb-1">
                            İzinli / Raporlu
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={50}
                            value={formLeaveToday}
                            onChange={(e) => setFormLeaveToday(Number(e.target.value))}
                            className="w-full h-10 px-2 rounded-xl bg-white dark:bg-gray-800 border border-amber-300 dark:border-amber-800 font-black text-center text-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-rose-500 mb-1">
                            Devamsız
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={50}
                            value={formAbsentToday}
                            onChange={(e) => setFormAbsentToday(Number(e.target.value))}
                            className="w-full h-10 px-2 rounded-xl bg-white dark:bg-gray-800 border border-rose-300 dark:border-rose-800 font-black text-center text-rose-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">
                          İzin / Mazeret Notu
                        </label>
                        <input
                          type="text"
                          value={formLeaveNote}
                          onChange={(e) => setFormLeaveNote(e.target.value)}
                          placeholder="Örn: 1 Öğrenci sağlık raporlu"
                          className="w-full h-10 px-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {editClassSection === 'akademik' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-purple-600 dark:text-purple-400 mb-1">
                        Sınıf Genel Başarı Ortalaması (100 Üzerinden)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min={0}
                        max={100}
                        value={formAcademicAverage}
                        onChange={(e) => setFormAcademicAverage(Number(e.target.value))}
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-purple-200 dark:border-purple-800 font-black text-sm text-purple-600 dark:text-purple-400"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">
                          Türkçe Ortalaması
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min={0}
                          max={100}
                          value={formCourseTurkish}
                          onChange={(e) => setFormCourseTurkish(Number(e.target.value))}
                          className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">
                          Matematik Ortalaması
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min={0}
                          max={100}
                          value={formCourseMath}
                          onChange={(e) => setFormCourseMath(Number(e.target.value))}
                          className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">
                          Fen / Hayat Bilgisi
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min={0}
                          max={100}
                          value={formCourseScience}
                          onChange={(e) => setFormCourseScience(Number(e.target.value))}
                          className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">
                          Yabancı Dil (İngilizce)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min={0}
                          max={100}
                          value={formCourseEnglish}
                          onChange={(e) => setFormCourseEnglish(Number(e.target.value))}
                          className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-12 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Save size={16} />
                    <span>Şube Bilgilerini Güncelle</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 4: SINIF SİLME ONAY MODALI ── */}
      <AnimatePresence>
        {classToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setClassToDelete(null)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-[#121826] p-5 shadow-2xl z-10 border border-gray-200 dark:border-gray-800"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
                <Trash2 size={22} />
              </div>

              <h3 className="text-center font-black text-sm text-gray-900 dark:text-white">
                Şubeyi Silmek İstiyor Musunuz?
              </h3>

              <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                <strong className="text-gray-900 dark:text-white">
                  {classToDelete.name}
                </strong>{' '}
                ve bu şubeye ait tüm atamalar kaldırılacaktır. Bu şubede kayıtlı{' '}
                <strong>{classToDelete.studentCount} öğrenci</strong> bulunmaktadır.
              </p>

              <div className="grid grid-cols-2 gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => setClassToDelete(null)}
                  className="h-10 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 font-bold text-xs text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-colors cursor-pointer"
                >
                  Evet, Sil
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 5: KADEME YÖNETİMİ MODALI (EKLE / DÜZENLE / SİL) ── */}
      <AnimatePresence>
        {isGradeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGradeModalOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#121826] p-5 shadow-2xl z-10 border border-gray-200 dark:border-gray-800 space-y-4 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Layers size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white">Sınıf Kademeleri Yönetimi</h3>
                    <p className="text-[11px] text-gray-400">Yeni kademe ekleyin, mevcut kademeleri düzenleyin veya silin</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGradeModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Add New Grade Form */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGradeName}
                  onChange={(e) => setNewGradeName(e.target.value)}
                  placeholder="Yeni Kademe Adı (Örn: Anaokulu veya 10. Sınıf)"
                  className="flex-1 h-10 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold"
                />
                <button
                  type="button"
                  onClick={() => handleAddGrade(newGradeName)}
                  className="px-4 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0"
                >
                  <Plus size={14} />
                  <span>Ekle</span>
                </button>
              </div>

              {/* Existing Grades List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                <div className="text-[11px] font-black text-gray-500 uppercase tracking-wider">
                  Mevcut Kademeler ({gradeLevels.length})
                </div>

                {gradeLevels.map((lvl, idx) => {
                  const classCount = classesList.filter((c) => c.gradeLevel === lvl).length
                  const isEditing = editingGradeIndex === idx

                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between gap-2"
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editingGradeName}
                            onChange={(e) => setEditingGradeName(e.target.value)}
                            className="flex-1 h-8 px-2 rounded-lg bg-white dark:bg-gray-900 border border-purple-500 text-xs font-bold"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditGrade(idx)}
                            className="px-2.5 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs cursor-pointer"
                          >
                            Kaydet
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingGradeIndex(null)}
                            className="px-2 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 text-xs cursor-pointer"
                          >
                            İptal
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-gray-900 dark:text-white">{lvl}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                              {classCount} Şube
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingGradeIndex(idx)
                                setEditingGradeName(lvl)
                              }}
                              className="w-7 h-7 rounded-lg bg-gray-200/80 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center hover:bg-gray-300 cursor-pointer"
                              title="Düzenle"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteGrade(lvl)}
                              className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center hover:bg-rose-200 cursor-pointer"
                              title="Sil"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 6: DÖNEM SONU TERFİ ONAY MODALI ── */}
      <AnimatePresence>
        {isConfirmPromotionOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfirmPromotionOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-[#121826] p-5 shadow-2xl z-10 border border-gray-200 dark:border-gray-800 space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <Sparkles size={24} />
              </div>

              <h3 className="text-center font-black text-sm text-gray-900 dark:text-white">
                Dönem Sonu Sınıf Atlatmayı Onaylıyor Musunuz?
              </h3>

              <p className="text-center text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Bu işlemle tüm sınıflar <strong className="text-emerald-600 dark:text-emerald-400">{targetAcademicTerm}</strong> dönemine devredilecek, son kademe öğrencileri mezun kütüğe aktarılacaktır. Mevcut durum otomatik yedeklenecektir.
              </p>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmPromotionOpen(false)}
                  className="h-10 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 font-bold text-xs text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={handleExecuteBulkPromotion}
                  className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-colors cursor-pointer shadow-sm"
                >
                  Evet, Terfiyi Başlat
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
      className={`${theme} min-h-[100dvh] w-full bg-[#0A0D15] sm:bg-[#E2E8F0] sm:dark:bg-[#06090F] flex justify-center selection:bg-purple-500/30 font-jakarta overscroll-none transition-colors duration-200`}
    >
      <div className="w-full sm:max-w-[390px] min-h-[100dvh] bg-[#F8FAFC] dark:bg-[#0A0D15] sm:shadow-2xl relative flex flex-col pb-24 sm:border-x border-gray-200/60 dark:border-gray-800/80 overflow-x-hidden overscroll-y-none">
        <MobileHeader theme={theme} onToggleTheme={toggleTheme} />
        <main className="flex-1 w-full flex flex-col">{pageContent}</main>
        {!hideDock && (
          <MobileAdminDock
            activeTab="classes"
            onOpenMoreSheet={() => setIsMoreSheetOpen(true)}
            orgSlug={orgSlug}
            theme={theme}
          />
        )}
      </div>
    </div>
  )
}
