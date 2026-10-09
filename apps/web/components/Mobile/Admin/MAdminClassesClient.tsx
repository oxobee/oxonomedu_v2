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
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false)
  const [selectedOrgId, setSelectedOrgId] = useState<number>(10) // 10: Necla Görer, 20: Fevzi Kalkancı
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

  // Teachers for selector
  const availableTeachers = useMemo(() => {
    return getOrgTeachers(selectedOrgId)
  }, [selectedOrgId])

  // Classrooms dataset with localStorage sync
  const [classesList, setClassesList] = useState<AdminClassroom[]>(() => {
    return DEFAULT_PRIMARY_CLASSES
  })

  // Synchronize when school org changes or load from localStorage
  useEffect(() => {
    const defaultClasses =
      selectedOrgId === 10 ? DEFAULT_PRIMARY_CLASSES : DEFAULT_MIDDLE_CLASSES
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(
          `oxonom_admin_classes_${selectedOrgId}`
        )
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setClassesList(parsed)
            return
          }
        }
      } catch (_) {}
    }
    setClassesList(defaultClasses)
    setSelectedGradeFilter('ALL')
  }, [selectedOrgId])

  // Save changes to localStorage helper
  const persistClasses = (updatedList: AdminClassroom[]) => {
    setClassesList(updatedList)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          `oxonom_admin_classes_${selectedOrgId}`,
          JSON.stringify(updatedList)
        )
      } catch (_) {}
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

    const updated = classesList.map((c) => {
      if (c.id === classToEdit.id) {
        return {
          ...c,
          code: formCode,
          name: `${formCode} Şubesi`,
          gradeLevel: formGradeLevel,
          gradeNumber: parseInt(formGradeLevel) || c.gradeNumber,
          roomName: formRoomName,
          teacherName: formTeacherName,
          teacherBranch: matchedTeacher?.branch || c.teacherBranch,
          teacherPhone: matchedTeacher?.phone || c.teacherPhone,
          teacherEmail: matchedTeacher?.email || c.teacherEmail,
          capacity: formCapacity,
          boardName: formBoardName,
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
    toast.success(`${formCode} şubesinin tüm bilgileri başarıyla güncellendi!`)
    setClassToEdit(null)

    if (selectedClassForDetail?.id === classToEdit.id) {
      const refreshed = updated.find((c) => c.id === classToEdit.id)
      if (refreshed) setSelectedClassForDetail(refreshed)
    }
  }

  // Open New Class Modal
  const handleOpenNewClass = () => {
    const defaultGrade = selectedOrgId === 10 ? '1. Sınıf' : '5. Sınıf'
    setFormGradeLevel(defaultGrade)
    setFormCode(selectedOrgId === 10 ? '1-D' : '5-B')
    setFormRoomName('1. Kat · Derslik 107')
    setFormTeacherName(availableTeachers[0]?.name || 'Özlem ZOR')
    setFormCapacity(32)
    setIsNewClassModalOpen(true)
  }

  // Save New Class
  const handleCreateNewClass = (e: React.FormEvent) => {
    e.preventDefault()
    const matchedTeacher = availableTeachers.find(
      (t) => t.name === formTeacherName
    )
    const newId = Date.now()
    const newClassItem: AdminClassroom = {
      id: newId,
      code: formCode,
      name: `${formCode} Şubesi`,
      gradeLevel: formGradeLevel,
      gradeNumber: parseInt(formGradeLevel) || (selectedOrgId === 10 ? 1 : 5),
      orgId: selectedOrgId,
      roomName: formRoomName,
      teacherName: formTeacherName,
      teacherBranch: matchedTeacher?.branch || 'Sınıf Öğretmeni',
      teacherPhone: matchedTeacher?.phone || '+90 532 999 1000',
      teacherEmail: matchedTeacher?.email || 'ogretmen@oxonom.com',
      studentCount: 28,
      capacity: formCapacity,
      boysCount: 14,
      girlsCount: 14,
      presentToday: 28,
      leaveToday: 0,
      absentToday: 0,
      attendanceRate: 100,
      academicAverage: 88.0,
      courseAverages: [
        { course: 'Türkçe', average: 89.0, highest: 100, lowest: 72 },
        { course: 'Matematik', average: 86.0, highest: 100, lowest: 68 },
        { course: 'Hayat Bilgisi', average: 91.0, highest: 100, lowest: 75 },
      ],
      boardStatus: 'online',
      boardName: `${formCode} Akıllı Tahta`,
      scheduleSummary: 'Haftalık 30 Saat',
      classPresident: 'Sınıf Temsilcisi',
      parentRepresentative: 'Veli Temsilcisi',
    }

    const updated = [newClassItem, ...classesList]
    persistClasses(updated)
    toast.success(`${formCode} şubesi başarıyla oluşturuldu ve sisteme eklendi!`)
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
      if (selectedGradeFilter !== 'ALL' && c.gradeLevel !== selectedGradeFilter) {
        return false
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
      school_name:
        selectedClassForDetail.orgId === 10
          ? 'Necla Görer İlkokulu'
          : 'Fevzi Kutlu Ortaokulu',
      school_slug: selectedClassForDetail.orgId === 10 ? 'neclagorer' : 'fevzikalkanci',
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
    if (classesList.length === 0) return 0
    const sum = classesList.reduce((acc, c) => acc + c.academicAverage, 0)
    return (sum / classesList.length).toFixed(1)
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
                <Building2 size={13} className="text-purple-500 shrink-0" />
                <span className="truncate">Sınıflar & Şubeler</span>
              </span>
            </nav>
          </div>

          <span className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-black shrink-0 border border-purple-200/50">
            {classesList.length} Şube Aktif
          </span>
        </div>

        {/* ── 2. OKUL SEÇİMİ (İlkokul 1-4 vs Ortaokul 5-8) ── */}
        <section className="px-4 mt-3">
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-gray-100 dark:bg-[#121826] border border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setSelectedOrgId(10)}
              className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                selectedOrgId === 10
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <School
                size={13}
                className={selectedOrgId === 10 ? 'text-[#10B981]' : 'text-gray-400'}
              />
              <span>Necla Görer (1–4)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedOrgId(20)}
              className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                selectedOrgId === 20
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <School
                size={13}
                className={selectedOrgId === 20 ? 'text-indigo-500' : 'text-gray-400'}
              />
              <span>Fevzi Kutlu (5–8)</span>
            </button>
          </div>
        </section>

        {/* ── 3. ÖZET İSTATİSTİK ŞERİDİ ── */}
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

        {/* ── 4. ARAMA & YENİ SINIF EKLE BUTONU ── */}
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
            <span className="hidden sm:inline">Yeni Şube</span>
            <span className="sm:hidden">Ekle</span>
          </button>
        </section>

        {/* ── 5. KADEME SEVİYESİ FİLTRELEME PİLLERİ ── */}
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
              Tüm Kademeler ({classesList.length})
            </button>

            {(selectedOrgId === 10
              ? ['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf']
              : ['5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf']
            ).map((grade) => {
              const count = classesList.filter(
                (c) => c.gradeLevel === grade
              ).length
              const isSelected = selectedGradeFilter === grade
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
                  {grade} ({count})
                </button>
              )
            })}
          </div>
        </section>

        {/* ── 6. SINIF KARTLARI LİSTESİ ── */}
        <section className="px-4 mt-3 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold px-1">
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
            <div className="py-12 text-center text-xs text-gray-400 bg-white dark:bg-[#121826] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              Arama kriterlerine uygun sınıf veya şube bulunamadı.
            </div>
          )}
        </section>
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
                                .map((p) => p[0])
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
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCreateNewClass} className="p-5 overflow-y-auto space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">
                      Kademe Seviyesi
                    </label>
                    <select
                      value={formGradeLevel}
                      onChange={(e) => setFormGradeLevel(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                    >
                      {selectedOrgId === 10 ? (
                        <>
                          <option value="1. Sınıf">1. Sınıf</option>
                          <option value="2. Sınıf">2. Sınıf</option>
                          <option value="3. Sınıf">3. Sınıf</option>
                          <option value="4. Sınıf">4. Sınıf</option>
                        </>
                      ) : (
                        <>
                          <option value="5. Sınıf">5. Sınıf</option>
                          <option value="6. Sınıf">6. Sınıf</option>
                          <option value="7. Sınıf">7. Sınıf</option>
                          <option value="8. Sınıf">8. Sınıf</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">
                      Şube Kodu / Adı
                    </label>
                    <input
                      type="text"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      placeholder="Örn: 1-D veya 3-E"
                      className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-black uppercase"
                      required
                    />
                  </div>
                </div>

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
                    Öğrenci Kapasitesi (Maksimum)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={45}
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(Number(e.target.value))}
                    className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-12 mt-3 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span>Sınıfı Oluştur ve Listeye Ekle</span>
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
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">
                          Kademe Seviyesi
                        </label>
                        <select
                          value={formGradeLevel}
                          onChange={(e) => setFormGradeLevel(e.target.value)}
                          className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                        >
                          {selectedOrgId === 10 ? (
                            <>
                              <option value="1. Sınıf">1. Sınıf</option>
                              <option value="2. Sınıf">2. Sınıf</option>
                              <option value="3. Sınıf">3. Sınıf</option>
                              <option value="4. Sınıf">4. Sınıf</option>
                            </>
                          ) : (
                            <>
                              <option value="5. Sınıf">5. Sınıf</option>
                              <option value="6. Sınıf">6. Sınıf</option>
                              <option value="7. Sınıf">7. Sınıf</option>
                              <option value="8. Sınıf">8. Sınıf</option>
                            </>
                          )}
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
