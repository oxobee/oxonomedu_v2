'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Clock,
  Search,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Edit3,
  Trash2,
  Download,
  Share2,
  Send,
  Building2,
  User,
  GraduationCap,
  Sparkles,
  Layers,
  School,
  Tv,
  Eye,
  History,
  FileText,
  Save,
  Copy,
  ArrowRightLeft,
  Smartphone,
  ShieldCheck,
  Zap,
  ArrowRight,
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
} from '@services/demo/schoolDirectory'

export interface MAdminScheduleClientProps {
  orgSlug?: string
  hideHeader?: boolean
  hideDock?: boolean
}

// ── TYPES ──
export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri'
export type ViewMode = 'class' | 'teacher' | 'room'

export interface DayInfo {
  key: DayKey
  shortLabel: string
  label: string
}

export const DAYS_LIST: DayInfo[] = [
  { key: 'mon', shortLabel: 'Pzt', label: 'Pazartesi' },
  { key: 'tue', shortLabel: 'Sal', label: 'Salı' },
  { key: 'wed', shortLabel: 'Çar', label: 'Çarşamba' },
  { key: 'thu', shortLabel: 'Per', label: 'Perşembe' },
  { key: 'fri', shortLabel: 'Cum', label: 'Cuma' },
]

export interface PeriodSlot {
  periodNumber: number
  time: string
  isLunchAfter?: boolean
}

export const PRIMARY_PERIODS: PeriodSlot[] = [
  { periodNumber: 1, time: '08:30 - 09:10' },
  { periodNumber: 2, time: '09:25 - 10:05' },
  { periodNumber: 3, time: '10:20 - 11:00' },
  { periodNumber: 4, time: '11:15 - 11:55', isLunchAfter: true },
  { periodNumber: 5, time: '12:45 - 13:25' },
  { periodNumber: 6, time: '13:40 - 14:20' },
]

export const MIDDLE_PERIODS: PeriodSlot[] = [
  { periodNumber: 1, time: '08:30 - 09:10' },
  { periodNumber: 2, time: '09:25 - 10:05' },
  { periodNumber: 3, time: '10:20 - 11:00' },
  { periodNumber: 4, time: '11:15 - 11:55', isLunchAfter: true },
  { periodNumber: 5, time: '12:45 - 13:25' },
  { periodNumber: 6, time: '13:40 - 14:20' },
  { periodNumber: 7, time: '14:35 - 15:15' },
]

export interface ScheduleEntry {
  id: string
  orgId: number
  day: DayKey
  period: number
  classCode: string
  subject: string
  teacherName: string
  roomName: string
  color: string
  isSmartBoardActive: boolean
}

export interface ScheduleRevision {
  id: string
  version: string
  date: string
  time: string
  author: string
  note: string
  status: 'published' | 'draft'
}

// ── DEFAULT ROOMS ──
export const SCHOOL_ROOMS = [
  'Derslik 101 (1. Kat)',
  'Derslik 102 (1. Kat)',
  'Derslik 103 (1. Kat)',
  'Derslik 104 (1. Kat)',
  'Derslik 201 (2. Kat)',
  'Derslik 202 (2. Kat)',
  'Derslik 203 (2. Kat)',
  'Derslik 301 (3. Kat)',
  'Derslik 5-A (1. Kat)',
  'Fen Laboratuvarı',
  'Bilişim & Kodlama Atölyesi',
  'Müzik Dersliği',
  'Görsel Sanatlar Atölyesi',
  'Kapalı Spor Salonu',
]

// ── SUBJECTS WITH THEMES ──
export const SUBJECT_OPTIONS = [
  { name: 'Türkçe', color: 'blue', weeklyHoursMEB: 6 },
  { name: 'Matematik', color: 'indigo', weeklyHoursMEB: 5 },
  { name: 'Hayat Bilgisi', color: 'teal', weeklyHoursMEB: 4 },
  { name: 'Fen Bilimleri', color: 'emerald', weeklyHoursMEB: 4 },
  { name: 'İngilizce', color: 'purple', weeklyHoursMEB: 2 },
  { name: 'Müzik', color: 'pink', weeklyHoursMEB: 1 },
  { name: 'Görsel Sanatlar', color: 'amber', weeklyHoursMEB: 1 },
  { name: 'Beden Eğitimi & Oyun', color: 'orange', weeklyHoursMEB: 5 },
  { name: 'Din Kültürü & Ahlak', color: 'emerald', weeklyHoursMEB: 2 },
  { name: 'Sosyal Bilgiler', color: 'amber', weeklyHoursMEB: 3 },
  { name: 'Bilişim & Yazılım', color: 'cyan', weeklyHoursMEB: 2 },
  { name: 'LGS Koçluk & Etüt', color: 'rose', weeklyHoursMEB: 2 },
]

// Helper for color styles
function getSubjectBadgeColors(color: string) {
  switch (color) {
    case 'blue':
      return {
        bg: 'bg-blue-50 dark:bg-blue-950/60',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-900/60',
        dot: 'bg-blue-500',
      }
    case 'indigo':
      return {
        bg: 'bg-indigo-50 dark:bg-indigo-950/60',
        text: 'text-indigo-700 dark:text-indigo-300',
        border: 'border-indigo-200 dark:border-indigo-900/60',
        dot: 'bg-indigo-500',
      }
    case 'teal':
      return {
        bg: 'bg-teal-50 dark:bg-teal-950/60',
        text: 'text-teal-700 dark:text-teal-300',
        border: 'border-teal-200 dark:border-teal-900/60',
        dot: 'bg-teal-500',
      }
    case 'emerald':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/60',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-900/60',
        dot: 'bg-emerald-500',
      }
    case 'purple':
      return {
        bg: 'bg-purple-50 dark:bg-purple-950/60',
        text: 'text-purple-700 dark:text-purple-300',
        border: 'border-purple-200 dark:border-purple-900/60',
        dot: 'bg-purple-500',
      }
    case 'pink':
      return {
        bg: 'bg-pink-50 dark:bg-pink-950/60',
        text: 'text-pink-700 dark:text-pink-300',
        border: 'border-pink-200 dark:border-pink-900/60',
        dot: 'bg-pink-500',
      }
    case 'amber':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/60',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-900/60',
        dot: 'bg-amber-500',
      }
    case 'orange':
      return {
        bg: 'bg-orange-50 dark:bg-orange-950/60',
        text: 'text-orange-700 dark:text-orange-300',
        border: 'border-orange-200 dark:border-orange-900/60',
        dot: 'bg-orange-500',
      }
    case 'cyan':
      return {
        bg: 'bg-cyan-50 dark:bg-cyan-950/60',
        text: 'text-cyan-700 dark:text-cyan-300',
        border: 'border-cyan-200 dark:border-cyan-900/60',
        dot: 'bg-cyan-500',
      }
    case 'rose':
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/60',
        text: 'text-rose-700 dark:text-rose-300',
        border: 'border-rose-200 dark:border-rose-900/60',
        dot: 'bg-rose-500',
      }
    default:
      return {
        bg: 'bg-gray-50 dark:bg-gray-800',
        text: 'text-gray-700 dark:text-gray-300',
        border: 'border-gray-200 dark:border-gray-700',
        dot: 'bg-gray-500',
      }
  }
}

// ── INITIAL PRE-FILLED SCHEDULE ENTRIES ──
export const INITIAL_SCHEDULE_ENTRIES: ScheduleEntry[] = [
  // ── OXONOM OKULLARI: 5-A ŞUBESİ (Ahmet YILMAZ) ──
  { id: 'sc-ox-1', orgId: 30, day: 'mon', period: 1, classCode: '5-A', subject: 'Türkçe', teacherName: 'Ahmet YILMAZ', roomName: 'Derslik 5-A (1. Kat)', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-ox-2', orgId: 30, day: 'mon', period: 2, classCode: '5-A', subject: 'Türkçe', teacherName: 'Ahmet YILMAZ', roomName: 'Derslik 5-A (1. Kat)', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-ox-3', orgId: 30, day: 'mon', period: 3, classCode: '5-A', subject: 'Matematik', teacherName: 'Ahmet YILMAZ', roomName: 'Derslik 5-A (1. Kat)', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-ox-4', orgId: 30, day: 'mon', period: 4, classCode: '5-A', subject: 'Fen Bilimleri', teacherName: 'Ahmet YILMAZ', roomName: 'Fen Laboratuvarı', color: 'emerald', isSmartBoardActive: true },
  { id: 'sc-ox-5', orgId: 30, day: 'mon', period: 5, classCode: '5-A', subject: 'Sosyal Bilgiler', teacherName: 'Ahmet YILMAZ', roomName: 'Derslik 5-A (1. Kat)', color: 'amber', isSmartBoardActive: true },
  { id: 'sc-ox-6', orgId: 30, day: 'mon', period: 6, classCode: '5-A', subject: 'İngilizce', teacherName: 'Ahmet YILMAZ', roomName: 'Derslik 5-A (1. Kat)', color: 'purple', isSmartBoardActive: true },
  { id: 'sc-ox-7', orgId: 30, day: 'mon', period: 7, classCode: '5-A', subject: 'Bilişim & Yazılım', teacherName: 'Ahmet YILMAZ', roomName: 'Bilişim & Kodlama Atölyesi', color: 'cyan', isSmartBoardActive: true },

  // ── NECLA GÖRER İLKOKULU: 1-A ŞUBESİ ──
  // Pazartesi
  { id: 'sc-1', orgId: 10, day: 'mon', period: 1, classCode: '1-A', subject: 'Türkçe', teacherName: 'Özlem ZOR', roomName: 'Derslik 101 (1. Kat)', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-2', orgId: 10, day: 'mon', period: 2, classCode: '1-A', subject: 'Türkçe', teacherName: 'Özlem ZOR', roomName: 'Derslik 101 (1. Kat)', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-3', orgId: 10, day: 'mon', period: 3, classCode: '1-A', subject: 'Matematik', teacherName: 'Özlem ZOR', roomName: 'Derslik 101 (1. Kat)', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-4', orgId: 10, day: 'mon', period: 4, classCode: '1-A', subject: 'Hayat Bilgisi', teacherName: 'Özlem ZOR', roomName: 'Derslik 101 (1. Kat)', color: 'teal', isSmartBoardActive: true },
  { id: 'sc-5', orgId: 10, day: 'mon', period: 5, classCode: '1-A', subject: 'Görsel Sanatlar', teacherName: 'Özlem ZOR', roomName: 'Görsel Sanatlar Atölyesi', color: 'amber', isSmartBoardActive: false },
  { id: 'sc-6', orgId: 10, day: 'mon', period: 6, classCode: '1-A', subject: 'Beden Eğitimi & Oyun', teacherName: 'Özlem ZOR', roomName: 'Kapalı Spor Salonu', color: 'orange', isSmartBoardActive: false },

  // Salı
  { id: 'sc-7', orgId: 10, day: 'tue', period: 1, classCode: '1-A', subject: 'Matematik', teacherName: 'Özlem ZOR', roomName: 'Derslik 101 (1. Kat)', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-8', orgId: 10, day: 'tue', period: 2, classCode: '1-A', subject: 'Matematik', teacherName: 'Özlem ZOR', roomName: 'Derslik 101 (1. Kat)', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-9', orgId: 10, day: 'tue', period: 3, classCode: '1-A', subject: 'Türkçe', teacherName: 'Özlem ZOR', roomName: 'Derslik 101 (1. Kat)', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-10', orgId: 10, day: 'tue', period: 4, classCode: '1-A', subject: 'Hayat Bilgisi', teacherName: 'Özlem ZOR', roomName: 'Derslik 101 (1. Kat)', color: 'teal', isSmartBoardActive: true },
  { id: 'sc-11', orgId: 10, day: 'tue', period: 5, classCode: '1-A', subject: 'Müzik', teacherName: 'Özlem ZOR', roomName: 'Müzik Dersliği', color: 'pink', isSmartBoardActive: false },
  { id: 'sc-12', orgId: 10, day: 'tue', period: 6, classCode: '1-A', subject: 'Beden Eğitimi & Oyun', teacherName: 'Özlem ZOR', roomName: 'Kapalı Spor Salonu', color: 'orange', isSmartBoardActive: false },

  // Çarşamba
  { id: 'sc-13', orgId: 10, day: 'wed', period: 1, classCode: '1-A', subject: 'Türkçe', teacherName: 'Özlem ZOR', roomName: 'Derslik 101 (1. Kat)', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-14', orgId: 10, day: 'wed', period: 2, classCode: '1-A', subject: 'Türkçe', teacherName: 'Özlem ZOR', roomName: 'Derslik 101 (1. Kat)', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-15', orgId: 10, day: 'wed', period: 3, classCode: '1-A', subject: 'Hayat Bilgisi', teacherName: 'Özlem ZOR', roomName: 'Derslik 101 (1. Kat)', color: 'teal', isSmartBoardActive: true },
  { id: 'sc-16', orgId: 10, day: 'wed', period: 4, classCode: '1-A', subject: 'İngilizce', teacherName: 'Beyzanur SALMANLI', roomName: 'Derslik 101 (1. Kat)', color: 'purple', isSmartBoardActive: true },
  { id: 'sc-17', orgId: 10, day: 'wed', period: 5, classCode: '1-A', subject: 'İngilizce', teacherName: 'Beyzanur SALMANLI', roomName: 'Derslik 101 (1. Kat)', color: 'purple', isSmartBoardActive: true },
  { id: 'sc-18', orgId: 10, day: 'wed', period: 6, classCode: '1-A', subject: 'Beden Eğitimi & Oyun', teacherName: 'Özlem ZOR', roomName: 'Kapalı Spor Salonu', color: 'orange', isSmartBoardActive: false },

  // Perşembe
  { id: 'sc-19', orgId: 10, day: 'thu', period: 1, classCode: '1-A', subject: 'Matematik', teacherName: 'Özlem ZOR', roomName: 'Derslik 101 (1. Kat)', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-20', orgId: 10, day: 'thu', period: 2, classCode: '1-A', subject: 'Türkçe', teacherName: 'Özlem ZOR', roomName: 'Derslik 101 (1. Kat)', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-21', orgId: 10, day: 'thu', period: 3, classCode: '1-A', subject: 'Hayat Bilgisi', teacherName: 'Özlem ZOR', roomName: 'Derslik 101 (1. Kat)', color: 'teal', isSmartBoardActive: true },
  { id: 'sc-22', orgId: 10, day: 'thu', period: 4, classCode: '1-A', subject: 'Beden Eğitimi & Oyun', teacherName: 'Özlem ZOR', roomName: 'Kapalı Spor Salonu', color: 'orange', isSmartBoardActive: false },
  { id: 'sc-23', orgId: 10, day: 'thu', period: 5, classCode: '1-A', subject: 'Beden Eğitimi & Oyun', teacherName: 'Özlem ZOR', roomName: 'Kapalı Spor Salonu', color: 'orange', isSmartBoardActive: false },
  { id: 'sc-24', orgId: 10, day: 'thu', period: 6, classCode: '1-A', subject: 'Serbest Etkinlik', teacherName: 'Özlem ZOR', roomName: 'Derslik 101 (1. Kat)', color: 'cyan', isSmartBoardActive: true },

  // Cuma
  { id: 'sc-25', orgId: 10, day: 'fri', period: 1, classCode: '1-A', subject: 'Türkçe', teacherName: 'Özlem ZOR', roomName: 'Derslik 101 (1. Kat)', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-26', orgId: 10, day: 'fri', period: 2, classCode: '1-A', subject: 'Matematik', teacherName: 'Özlem ZOR', roomName: 'Derslik 101 (1. Kat)', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-27', orgId: 10, day: 'fri', period: 3, classCode: '1-A', subject: 'Din Kültürü & Ahlak', teacherName: 'Özge KABA', roomName: 'Derslik 101 (1. Kat)', color: 'emerald', isSmartBoardActive: true },
  { id: 'sc-28', orgId: 10, day: 'fri', period: 4, classCode: '1-A', subject: 'Din Kültürü & Ahlak', teacherName: 'Özge KABA', roomName: 'Derslik 101 (1. Kat)', color: 'emerald', isSmartBoardActive: true },
  { id: 'sc-29', orgId: 10, day: 'fri', period: 5, classCode: '1-A', subject: 'Müzik & Ritim', teacherName: 'Özlem ZOR', roomName: 'Derslik 101 (1. Kat)', color: 'pink', isSmartBoardActive: true },
  { id: 'sc-30', orgId: 10, day: 'fri', period: 6, classCode: '1-A', subject: 'Rehberlik & Kapanış', teacherName: 'Özlem ZOR', roomName: 'Derslik 101 (1. Kat)', color: 'teal', isSmartBoardActive: true },

  // ── 2-A ŞUBESİ (Zeliha EMAN) ──
  { id: 'sc-31', orgId: 10, day: 'mon', period: 1, classCode: '2-A', subject: 'Matematik', teacherName: 'Zeliha EMAN', roomName: 'Derslik 104 (1. Kat)', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-32', orgId: 10, day: 'mon', period: 2, classCode: '2-A', subject: 'Matematik', teacherName: 'Zeliha EMAN', roomName: 'Derslik 104 (1. Kat)', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-33', orgId: 10, day: 'mon', period: 3, classCode: '2-A', subject: 'Türkçe', teacherName: 'Zeliha EMAN', roomName: 'Derslik 104 (1. Kat)', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-34', orgId: 10, day: 'mon', period: 4, classCode: '2-A', subject: 'Hayat Bilgisi', teacherName: 'Zeliha EMAN', roomName: 'Derslik 104 (1. Kat)', color: 'teal', isSmartBoardActive: true },
  { id: 'sc-35', orgId: 10, day: 'mon', period: 5, classCode: '2-A', subject: 'Beden Eğitimi', teacherName: 'Zeliha EMAN', roomName: 'Kapalı Spor Salonu', color: 'orange', isSmartBoardActive: false },
  { id: 'sc-36', orgId: 10, day: 'mon', period: 6, classCode: '2-A', subject: 'Görsel Sanatlar', teacherName: 'Zeliha EMAN', roomName: 'Derslik 104 (1. Kat)', color: 'amber', isSmartBoardActive: true },

  // ── 7-A ŞUBESİ (Beritan ŞENATEŞ - Fevzi Kalkancı Ortaokulu) ──
  { id: 'sc-50', orgId: 20, day: 'mon', period: 1, classCode: '7-A', subject: 'Türkçe', teacherName: 'Beritan ŞENATEŞ', roomName: 'Derslik 301 (3. Kat)', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-51', orgId: 20, day: 'mon', period: 2, classCode: '7-A', subject: 'Türkçe', teacherName: 'Beritan ŞENATEŞ', roomName: 'Derslik 301 (3. Kat)', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-52', orgId: 20, day: 'mon', period: 3, classCode: '7-A', subject: 'Matematik', teacherName: 'Orkun AYDIN', roomName: 'Derslik 301 (3. Kat)', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-53', orgId: 20, day: 'mon', period: 4, classCode: '7-A', subject: 'Fen Bilimleri', teacherName: 'Bülent TURAN', roomName: 'Fen Laboratuvarı', color: 'emerald', isSmartBoardActive: true },
  { id: 'sc-54', orgId: 20, day: 'mon', period: 5, classCode: '7-A', subject: 'Fen Bilimleri', teacherName: 'Bülent TURAN', roomName: 'Fen Laboratuvarı', color: 'emerald', isSmartBoardActive: true },
  { id: 'sc-55', orgId: 20, day: 'mon', period: 6, classCode: '7-A', subject: 'Sosyal Bilgiler', teacherName: 'Ayşe GÜL', roomName: 'Derslik 301 (3. Kat)', color: 'amber', isSmartBoardActive: true },
  { id: 'sc-56', orgId: 20, day: 'mon', period: 7, classCode: '7-A', subject: 'Bilişim & Kodlama', teacherName: 'Emre ÇELİK', roomName: 'Bilişim & Kodlama Atölyesi', color: 'cyan', isSmartBoardActive: true },
]

export default function MAdminScheduleClient({
  orgSlug,
  hideHeader = false,
  hideDock = false,
}: MAdminScheduleClientProps) {
  const { theme, toggleTheme } = useMobileTheme()
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false)
  const [selectedOrgId, setSelectedOrgId] = useState<number>(() => {
    if (orgSlug === 'neclagorer') return 10
    if (orgSlug === 'fevzi-kutlu' || orgSlug === 'sfg') return 20
    return 30
  })

  // View Mode: Sınıf Bazlı, Öğretmen Bazlı, Derslik Bazlı
  const [viewMode, setViewMode] = useState<ViewMode>('class')

  // Selected Day: mon..fri
  const [activeDay, setActiveDay] = useState<DayKey>('mon')

  // Selected Targets
  const [selectedClass, setSelectedClass] = useState<string>(() => {
    if (orgSlug === 'neclagorer') return '1-A'
    if (orgSlug === 'fevzi-kutlu' || orgSlug === 'sfg') return '7-A'
    return '5-A'
  })
  const [selectedTeacher, setSelectedTeacher] = useState<string>(() => {
    if (orgSlug === 'neclagorer') return 'Özlem ZOR'
    if (orgSlug === 'fevzi-kutlu' || orgSlug === 'sfg') return 'Beritan ŞENATEŞ'
    return 'Ahmet YILMAZ'
  })
  const [selectedRoom, setSelectedRoom] = useState<string>(() => {
    if (orgSlug === 'neclagorer') return 'Derslik 101 (1. Kat)'
    if (orgSlug === 'fevzi-kutlu' || orgSlug === 'sfg') return 'Derslik 301 (3. Kat)'
    return 'Derslik 5-A (1. Kat)'
  })

  // Modals state
  const [quickSelectedSubject, setQuickSelectedSubject] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [slotToEdit, setSlotToEdit] = useState<{
    entry?: ScheduleEntry
    day: DayKey
    period: number
  } | null>(null)

  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false)
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false)
  const [isSmsShareModalOpen, setIsSmsShareModalOpen] = useState(false)

  // Edit Slot Form State
  const [formSubject, setFormSubject] = useState('Türkçe')
  const [formTeacher, setFormTeacher] = useState('Özlem ZOR')
  const [formRoom, setFormRoom] = useState('Derslik 101 (1. Kat)')
  const [formClassCode, setFormClassCode] = useState('1-A')
  const [formSmartBoard, setFormSmartBoard] = useState(true)

  // Publish Form State
  const [publishVersion, setPublishVersion] = useState('v2.5')
  const [publishNote, setPublishNote] = useState('Ders programı saatleri optimize edildi ve onaylandı.')

  // SMS Form State
  const [smsTarget, setSmsTarget] = useState<'all_parents' | 'class_parents' | 'teachers'>('all_parents')
  const [smsContent, setSmsContent] = useState(
    'Sayın Velimiz, 2026-2027 Eğitim Öğretim Yılı haftalık ders programımız güncellenmiştir. Öğrencinizin güncel programını mobil portaldan takip edebilirsiniz.'
  )

  // Revisions History List
  const [revisionsList, setRevisionsList] = useState<ScheduleRevision[]>([
    {
      id: 'rev-3',
      version: 'v2.4',
      date: '08 Ekim 2026',
      time: '17:45',
      author: 'Müdür Ahmet KAYA',
      note: '2-B Matematik ve 1-A Hayat Bilgisi derslikleri optimize edildi.',
      status: 'published',
    },
    {
      id: 'rev-2',
      version: 'v2.3',
      date: '05 Ekim 2026',
      time: '11:20',
      author: 'Müdür Yrd. Fatma ŞEN',
      note: 'Laboratuvar saat çakışması giderildi, Fen dersliği güncellendi.',
      status: 'published',
    },
    {
      id: 'rev-1',
      version: 'v2.2',
      date: '18 Eylül 2026',
      time: '09:00',
      author: 'Müdür Ahmet KAYA',
      note: 'MEB 2026-2027 Güz Dönemi başlangıç taslağı onaylandı.',
      status: 'published',
    },
  ])

  // Current Schedule Dataset with localStorage Sync
  const [scheduleList, setScheduleList] = useState<ScheduleEntry[]>(() => {
    return INITIAL_SCHEDULE_ENTRIES
  })

  // Synchronize when school org changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`oxonom_admin_schedule_${selectedOrgId}`)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setScheduleList(parsed)
            return
          }
        }
      } catch (_) {}
    }
    setScheduleList(INITIAL_SCHEDULE_ENTRIES)
    if (selectedOrgId === 30) {
      setSelectedClass('5-A')
      setSelectedTeacher('Ahmet YILMAZ')
      setSelectedRoom('Derslik 5-A (1. Kat)')
    } else if (selectedOrgId === 10) {
      setSelectedClass('1-A')
      setSelectedTeacher('Özlem ZOR')
      setSelectedRoom('Derslik 101 (1. Kat)')
    } else {
      setSelectedClass('7-A')
      setSelectedTeacher('Beritan ŞENATEŞ')
      setSelectedRoom('Derslik 301 (3. Kat)')
    }
  }, [selectedOrgId])

  // Save changes to localStorage helper
  const persistSchedule = (updated: ScheduleEntry[]) => {
    setScheduleList(updated)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          `oxonom_admin_schedule_${selectedOrgId}`,
          JSON.stringify(updated)
        )
      } catch (_) {}
    }
  }

  // Teachers for selector
  const availableTeachers = useMemo(() => {
    return getOrgTeachers(selectedOrgId)
  }, [selectedOrgId])

  // Classrooms list for selector
  const availableClasses = useMemo(() => {
    if (selectedOrgId === 30) {
      return ['5-A']
    }
    if (selectedOrgId === 10) {
      return ['1-A', '1-B', '1-C', '2-A', '2-B', '3-A', '3-B', '4-A', '4-B']
    }
    return ['5-A', '6-A', '7-A', '8-A (LGS)']
  }, [selectedOrgId])

  // Active periods list based on school stage
  const periods = useMemo(() => {
    return selectedOrgId === 10 ? PRIMARY_PERIODS : MIDDLE_PERIODS
  }, [selectedOrgId])

  // ── SMART CONFLICT DETECTION ──
  // 1. Teacher conflicts (Same teacher assigned to >1 class on same day & period)
  const teacherConflicts = useMemo(() => {
    const orgEntries = scheduleList.filter((e) => e.orgId === selectedOrgId)
    const map: Record<string, ScheduleEntry[]> = {}
    orgEntries.forEach((e) => {
      const key = `${e.day}_${e.period}_${e.teacherName}`
      if (!map[key]) map[key] = []
      map[key].push(e)
    })
    const conflicts: Array<{ teacher: string; day: DayKey; period: number; entries: ScheduleEntry[] }> = []
    Object.entries(map).forEach(([_, entries]) => {
      if (entries.length > 1) {
        conflicts.push({
          teacher: entries[0].teacherName,
          day: entries[0].day,
          period: entries[0].period,
          entries,
        })
      }
    })
    return conflicts
  }, [scheduleList, selectedOrgId])

  // 2. Room conflicts (Same room assigned to >1 class on same day & period)
  const roomConflicts = useMemo(() => {
    const orgEntries = scheduleList.filter((e) => e.orgId === selectedOrgId)
    const map: Record<string, ScheduleEntry[]> = {}
    orgEntries.forEach((e) => {
      const key = `${e.day}_${e.period}_${e.roomName}`
      if (!map[key]) map[key] = []
      map[key].push(e)
    })
    const conflicts: Array<{ room: string; day: DayKey; period: number; entries: ScheduleEntry[] }> = []
    Object.entries(map).forEach(([_, entries]) => {
      if (entries.length > 1) {
        conflicts.push({
          room: entries[0].roomName,
          day: entries[0].day,
          period: entries[0].period,
          entries,
        })
      }
    })
    return conflicts
  }, [scheduleList, selectedOrgId])

  const totalConflictsCount = teacherConflicts.length + roomConflicts.length

  // Filtered entries for current view mode and target
  const displayedEntries = useMemo(() => {
    return scheduleList.filter((entry) => {
      if (entry.orgId !== selectedOrgId) return false
      if (entry.day !== activeDay) return false

      if (viewMode === 'class') {
        return entry.classCode === selectedClass
      }
      if (viewMode === 'teacher') {
        return entry.teacherName === selectedTeacher
      }
      if (viewMode === 'room') {
        return entry.roomName === selectedRoom
      }
      return true
    })
  }, [scheduleList, selectedOrgId, activeDay, viewMode, selectedClass, selectedTeacher, selectedRoom])

  // Curriculum hours breakdown for current selected class
  const curriculumStats = useMemo(() => {
    const classEntries = scheduleList.filter(
      (e) => e.orgId === selectedOrgId && e.classCode === selectedClass
    )
    const subjectCounts: Record<string, number> = {}
    classEntries.forEach((e) => {
      subjectCounts[e.subject] = (subjectCounts[e.subject] || 0) + 1
    })
    const totalAssigned = classEntries.length
    const targetTotal = selectedOrgId === 10 ? 30 : 35
    return {
      subjectCounts,
      totalAssigned,
      targetTotal,
      isCompliant: totalAssigned >= targetTotal,
    }
  }, [scheduleList, selectedOrgId, selectedClass])

  // Live conflict warning during slot modal editing
  const modalLiveConflict = useMemo(() => {
    if (!slotToEdit) return null

    // Check if picked teacher is busy elsewhere
    const busyTeacher = scheduleList.find(
      (e) =>
        e.orgId === selectedOrgId &&
        e.day === slotToEdit.day &&
        e.period === slotToEdit.period &&
        e.teacherName === formTeacher &&
        e.classCode !== formClassCode &&
        e.id !== slotToEdit.entry?.id
    )
    if (busyTeacher) {
      return {
        type: 'teacher',
        message: `⚠️ Öğretmen Çakışması: ${formTeacher} bu saatte ${busyTeacher.classCode} sınıfında ders vermektedir!`,
      }
    }

    // Check if picked room is occupied elsewhere
    const busyRoom = scheduleList.find(
      (e) =>
        e.orgId === selectedOrgId &&
        e.day === slotToEdit.day &&
        e.period === slotToEdit.period &&
        e.roomName === formRoom &&
        e.classCode !== formClassCode &&
        e.id !== slotToEdit.entry?.id
    )
    if (busyRoom) {
      return {
        type: 'room',
        message: `⚠️ Derslik Çakışması: ${formRoom} bu saatte ${busyRoom.classCode} tarafından kullanılmaktadır!`,
      }
    }

    return null
  }, [slotToEdit, formTeacher, formRoom, formClassCode, scheduleList, selectedOrgId])

  // Open Edit Slot Modal
  const handleOpenEditSlot = (period: number, existing?: ScheduleEntry) => {
    // If quick-select mode is active and slot is empty, assign instantly
    if (quickSelectedSubject && !existing) {
      const matchedSubject = SUBJECT_OPTIONS.find((s) => s.name === quickSelectedSubject)
      const color = matchedSubject?.color || 'blue'
      const newEntry: ScheduleEntry = {
        id: `sc-custom-${Date.now()}`,
        orgId: selectedOrgId,
        day: activeDay,
        period,
        classCode: viewMode === 'class' ? selectedClass : availableClasses[0] || '1-A',
        subject: quickSelectedSubject,
        teacherName: viewMode === 'teacher' ? selectedTeacher : availableTeachers[0]?.name || 'Özlem ZOR',
        roomName: viewMode === 'room' ? selectedRoom : 'Derslik 101 (1. Kat)',
        color,
        isSmartBoardActive: true,
      }
      persistSchedule([...scheduleList, newEntry])
      toast.success(`✅ ${quickSelectedSubject} (${DAYS_LIST.find((d) => d.key === activeDay)?.label} ${period}. Ders) atandı!`)
      return
    }

    setSlotToEdit({
      entry: existing,
      day: activeDay,
      period,
    })
    if (existing) {
      setFormSubject(existing.subject)
      setFormTeacher(existing.teacherName)
      setFormRoom(existing.roomName)
      setFormClassCode(existing.classCode)
      setFormSmartBoard(existing.isSmartBoardActive)
    } else {
      setFormSubject('Türkçe')
      setFormTeacher(viewMode === 'teacher' ? selectedTeacher : availableTeachers[0]?.name || 'Özlem ZOR')
      setFormRoom(viewMode === 'room' ? selectedRoom : 'Derslik 101 (1. Kat)')
      setFormClassCode(viewMode === 'class' ? selectedClass : availableClasses[0] || '1-A')
      setFormSmartBoard(true)
    }
    setIsEditModalOpen(true)
  }

  // Save Slot Edit
  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault()
    if (!slotToEdit) return

    const matchedSubject = SUBJECT_OPTIONS.find((s) => s.name === formSubject)
    const color = matchedSubject?.color || 'blue'

    if (slotToEdit.entry) {
      // Update existing
      const updated = scheduleList.map((entry) => {
        if (entry.id === slotToEdit.entry?.id) {
          return {
            ...entry,
            subject: formSubject,
            teacherName: formTeacher,
            roomName: formRoom,
            classCode: formClassCode,
            color,
            isSmartBoardActive: formSmartBoard,
          }
        }
        return entry
      })
      persistSchedule(updated)
      toast.success(`${formClassCode} · ${slotToEdit.period}. Ders güncellendi!`)
    } else {
      // Create new slot entry
      const newEntry: ScheduleEntry = {
        id: `sc-custom-${Date.now()}`,
        orgId: selectedOrgId,
        day: slotToEdit.day,
        period: slotToEdit.period,
        classCode: formClassCode,
        subject: formSubject,
        teacherName: formTeacher,
        roomName: formRoom,
        color,
        isSmartBoardActive: formSmartBoard,
      }
      persistSchedule([...scheduleList, newEntry])
      toast.success(`${formClassCode} için ${slotToEdit.period}. Ders programa eklendi!`)
    }

    setIsEditModalOpen(false)
    setSlotToEdit(null)
  }

  // Delete Slot
  const handleDeleteSlot = () => {
    if (!slotToEdit?.entry) return
    const updated = scheduleList.filter((e) => e.id !== slotToEdit.entry?.id)
    persistSchedule(updated)
    toast.success('Ders slotu programdan kaldırıldı.')
    setIsEditModalOpen(false)
    setSlotToEdit(null)
  }

  // Publish Revision Action
  const handlePublishSchedule = (e: React.FormEvent) => {
    e.preventDefault()
    const newRev: ScheduleRevision = {
      id: `rev-${Date.now()}`,
      version: publishVersion,
      date: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }),
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      author: 'Müdür Ahmet KAYA',
      note: publishNote,
      status: 'published',
    }
    const updatedRevs = [newRev, ...revisionsList]
    setRevisionsList(updatedRevs)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`oxonom_admin_schedule_revisions_${selectedOrgId}`, JSON.stringify(updatedRevs))
      } catch (_) {}
    }
    setIsPublishModalOpen(false)
    toast.success(`🎉 Ders programı ${publishVersion} sürümüyle başarıyla canlıya yayımlandı!`)
  }

  // Send SMS Announcement
  const handleSendSms = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSmsShareModalOpen(false)
    toast.success('📱 Haftalık ders programı SMS bildirimleri tüm alıcılara iletildi!')
  }

  // Export PDF Simulation
  const handleExportPdf = () => {
    toast.success(
      `📄 ${
        viewMode === 'class'
          ? `${selectedClass} Sınıfı`
          : viewMode === 'teacher'
          ? `${selectedTeacher} Öğretmeni`
          : selectedRoom
      } Haftalık Ders Programı PDF olarak indirildi!`
    )
  }

  const activeOrg = SCHOOL_ORGS.find((o) => o.id === selectedOrgId) || SCHOOL_ORGS[0]

  return (
    <div
      className={`min-h-screen font-jakarta select-none transition-colors duration-200 ${
        theme === 'dark' ? 'bg-[#0A0D15] text-white' : 'bg-[#F8FAFC] text-gray-900'
      }`}
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6.5rem)' }}
    >
      {/* ── 1. HEADER ── */}
      {!hideHeader && (
        <MobileHeader
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      <main className="max-w-[430px] sm:max-w-[460px] mx-auto min-h-screen">
        {/* ── 2. HERO CARD & PROGRAM SUMMARY STATS ── */}
        <section className="px-4 pt-3">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0E131F] via-[#121826] to-[#0A0D15] border border-gray-800 p-4 shadow-xl">
            {/* Animated Background Circles */}
            <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full pointer-events-none opacity-40">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
                className="w-full h-full relative"
              >
                <div className="absolute inset-0 rounded-full border border-indigo-400/20" />
                <div className="absolute inset-6 rounded-full border border-white/10 border-dashed" />
                <div className="absolute inset-12 rounded-full border border-indigo-400/30" />
              </motion.div>
            </div>

            {/* School Switcher */}
            <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Calendar size={16} />
                </div>
                <div>
                  <div className="text-xs font-black text-white flex items-center gap-1.5">
                    <span>Haftalık Ders Dağıtımı</span>
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      CANLI · v2.4
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {activeOrg.name} · MEB Müfredat Uyumlu
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsRevisionModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-[10px] font-bold transition-all cursor-pointer"
              >
                <History size={12} className="text-indigo-400" />
                <span>Geçmiş</span>
              </button>
            </div>

            {/* Quick School Tabs */}
            <div className="grid grid-cols-3 gap-1.5 mt-2.5 p-1 rounded-2xl bg-white/5 border border-white/10">
              <button
                type="button"
                onClick={() => setSelectedOrgId(30)}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold text-center transition-all cursor-pointer ${
                  selectedOrgId === 30
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Oxonom
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrgId(10)}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold text-center transition-all cursor-pointer ${
                  selectedOrgId === 10
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Necla Görer
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrgId(20)}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold text-center transition-all cursor-pointer ${
                  selectedOrgId === 20
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Fevzi Kutlu
              </button>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10 text-center">
              <div className="p-2 rounded-xl bg-white/5">
                <div className="text-sm font-black text-white">
                  {selectedOrgId === 10 ? '30 Saat' : '35 Saat'}
                </div>
                <div className="text-[10px] text-gray-400 font-semibold mt-0.5">
                  Haftalık Yük
                </div>
              </div>

              <div
                onClick={() => setIsConflictModalOpen(true)}
                className={`p-2 rounded-xl cursor-pointer transition-colors ${
                  totalConflictsCount > 0
                    ? 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                    : 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-300'
                }`}
              >
                <div className="text-sm font-black flex items-center justify-center gap-1">
                  {totalConflictsCount > 0 ? (
                    <>
                      <AlertTriangle size={13} className="text-rose-400" />
                      <span>{totalConflictsCount} Çakışma</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={13} className="text-emerald-400" />
                      <span>0 Çakışma</span>
                    </>
                  )}
                </div>
                <div className="text-[10px] font-semibold mt-0.5">
                  {totalConflictsCount > 0 ? 'İncele' : 'Tam Uyumlu'}
                </div>
              </div>

              <div className="p-2 rounded-xl bg-white/5">
                <div className="text-sm font-black text-indigo-400">
                  {selectedOrgId === 10 ? '12 Şube' : '8 Şube'}
                </div>
                <div className="text-[10px] text-gray-400 font-semibold mt-0.5">
                  Aktif Çizelge
                </div>
              </div>
            </div>

            {/* Fast Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(true)}
                className="h-9 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Zap size={14} />
                <span>Programı Yayımla</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleExportPdf}
                  title="PDF Olarak İndir"
                  className="flex-1 h-9 rounded-xl bg-white/10 hover:bg-white/15 text-white font-extrabold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <Download size={13} />
                  <span>PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSmsShareModalOpen(true)}
                  title="Velilere Duyur"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/15 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                >
                  <Send size={13} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. VIEW MODE SELECTOR (Sınıf Bazlı / Öğretmen Bazlı / Derslik Bazlı) ── */}
        <section className="px-4 mt-3">
          <div className="flex items-center p-1 rounded-2xl bg-gray-200/60 dark:bg-gray-800/60 text-xs font-bold gap-1">
            <button
              type="button"
              onClick={() => setViewMode('class')}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'class'
                  ? 'bg-white dark:bg-[#121826] text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap size={14} />
              <span>Sınıf Bazlı</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('teacher')}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'teacher'
                  ? 'bg-white dark:bg-[#121826] text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <User size={14} />
              <span>Öğretmen Bazlı</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('room')}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'room'
                  ? 'bg-white dark:bg-[#121826] text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Building2 size={14} />
              <span>Derslik Bazlı</span>
            </button>
          </div>
        </section>

        {/* ── 4. TARGET SELECTOR (DROPDOWN / HORIZONTAL PILLS) ── */}
        <section className="px-4 mt-2.5">
          <div className="bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800/80 rounded-2xl p-2.5 shadow-xs flex items-center justify-between gap-2">
            <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 shrink-0 flex items-center gap-1">
              {viewMode === 'class' ? (
                <>
                  <GraduationCap size={13} className="text-indigo-500" />
                  <span>Şube:</span>
                </>
              ) : viewMode === 'teacher' ? (
                <>
                  <User size={13} className="text-teal-500" />
                  <span>Öğretmen:</span>
                </>
              ) : (
                <>
                  <Building2 size={13} className="text-purple-500" />
                  <span>Derslik:</span>
                </>
              )}
            </div>

            {viewMode === 'class' && (
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full h-8 px-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-black text-gray-900 dark:text-white cursor-pointer"
              >
                {availableClasses.map((c) => (
                  <option key={c} value={c}>
                    {c} Şubesi Programı
                  </option>
                ))}
              </select>
            )}

            {viewMode === 'teacher' && (
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full h-8 px-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-black text-gray-900 dark:text-white cursor-pointer"
              >
                {availableTeachers.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name} ({t.branch})
                  </option>
                ))}
              </select>
            )}

            {viewMode === 'room' && (
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full h-8 px-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-black text-gray-900 dark:text-white cursor-pointer"
              >
                {SCHOOL_ROOMS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            )}
          </div>
        </section>

        {/* ── 5. DAY PICKER (PAZARTESİ - CUMA) ── */}
        <section className="px-4 mt-2.5">
          <div className="grid grid-cols-5 gap-1.5">
            {DAYS_LIST.map((day) => {
              const isActive = activeDay === day.key
              // Count lessons on that day
              const dayLessonsCount = scheduleList.filter((e) => {
                if (e.orgId !== selectedOrgId || e.day !== day.key) return false
                if (viewMode === 'class') return e.classCode === selectedClass
                if (viewMode === 'teacher') return e.teacherName === selectedTeacher
                if (viewMode === 'room') return e.roomName === selectedRoom
                return true
              }).length

              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => setActiveDay(day.key)}
                  className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="text-[10px] font-bold opacity-80">{day.shortLabel}</span>
                  <span className="text-xs font-black mt-0.5">{day.label.slice(0, 3)}</span>
                  <span
                    className={`mt-1 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                    }`}
                  >
                    {dayLessonsCount} Ders
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* ── 6. CURRICULUM PROGRESS CARD (WHEN IN CLASS MODE) ── */}
        {viewMode === 'class' && (
          <section className="px-4 mt-3">
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-black text-indigo-950 dark:text-indigo-300">
                    {selectedClass} MEB Haftalık Müfredat Dağılımı
                  </span>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                  {curriculumStats.totalAssigned} / {curriculumStats.targetTotal} Saat
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-indigo-200 dark:bg-indigo-900/60 rounded-full h-2 mt-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      (curriculumStats.totalAssigned / curriculumStats.targetTotal) * 100
                    )}%`,
                  }}
                />
              </div>

              {/* Mini Badges of Key Courses */}
              <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar text-[10px] font-bold">
                {Object.entries(curriculumStats.subjectCounts).map(([subj, count]) => (
                  <span
                    key={subj}
                    className="px-2 py-0.5 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shrink-0"
                  >
                    {subj}: <strong>{count}s</strong>
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── 6.5 QUICK ASSIGNMENT DOCK (WHEN IN CLASS MODE) ── */}
        {viewMode === 'class' && (
          <section className="px-4 mt-2.5">
            <div className="p-3 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-gray-900 dark:text-white">
                  <Sparkles size={13} className="text-indigo-500" />
                  <span>Hızlı Ders Atama Paleti</span>
                </div>
                <Link
                  href={orgSlug ? `/orgs/${orgSlug}/m-admin-curriculum` : '/m-admin-curriculum'}
                  className="text-[10px] font-black text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-0.5"
                >
                  <span>Sürükle-Bırak Sayfası</span>
                  <ArrowRight size={10} />
                </Link>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {SUBJECT_OPTIONS.map((subj) => {
                  const isSelected = quickSelectedSubject === subj.name
                  return (
                    <button
                      key={subj.name}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setQuickSelectedSubject(null)
                        } else {
                          setQuickSelectedSubject(subj.name)
                          toast(`🎯 "${subj.name}" seçildi. Boş ders saatine dokunarak yerleştirin.`, {
                            icon: '👉',
                            duration: 2000,
                          })
                        }
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500 text-indigo-900 dark:text-indigo-100 shadow-xs'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span>{subj.name}</span>
                    </button>
                  )
                })}
              </div>

              {quickSelectedSubject && (
                <div className="mt-2 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-between">
                  <span>👉 Seçili: <strong>{quickSelectedSubject}</strong> — Boş saate dokunun</span>
                  <button
                    type="button"
                    onClick={() => setQuickSelectedSubject(null)}
                    className="text-[10px] text-gray-400 hover:text-gray-600 underline"
                  >
                    Vazgeç
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── 7. HOURLY TIMETABLE PERIOD SLOTS ── */}
        <section className="px-4 mt-3 space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-1.5">
              <Clock size={14} className="text-indigo-500" />
              <span>
                {DAYS_LIST.find((d) => d.key === activeDay)?.label} Akışı ({displayedEntries.length} Ders)
              </span>
            </div>

            <span className="text-[10px] text-gray-400 font-semibold">
              Dokunarak Düzenle
            </span>
          </div>

          <div className="space-y-2">
            {periods.map((slot) => {
              // Find matching entry for this period
              const entry = displayedEntries.find((e) => e.period === slot.periodNumber)
              const badgeColors = entry ? getSubjectBadgeColors(entry.color) : null

              return (
                <React.Fragment key={slot.periodNumber}>
                  {/* Period Slot Card */}
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOpenEditSlot(slot.periodNumber, entry)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer relative ${
                      entry
                        ? 'bg-white dark:bg-[#121826] border-gray-200/90 dark:border-gray-800/80 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600'
                        : 'bg-dashed border-2 border-dashed border-gray-200 dark:border-gray-800/80 hover:border-indigo-400/50 bg-gray-50/50 dark:bg-gray-900/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      {/* Left: Period Number & Time */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center shrink-0">
                          <span className="text-xs font-black text-gray-900 dark:text-white">
                            {slot.periodNumber}
                          </span>
                          <span className="text-[8px] font-bold text-gray-400 -mt-0.5">Ders</span>
                        </div>

                        {entry ? (
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${badgeColors?.bg} ${badgeColors?.text} ${badgeColors?.border} truncate`}
                              >
                                {entry.subject}
                              </span>

                              {viewMode !== 'class' && (
                                <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50">
                                  {entry.classCode}
                                </span>
                              )}

                              {entry.isSmartBoardActive && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                                  <Tv size={10} />
                                  <span>Tahta</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 mt-1 truncate">
                              {viewMode !== 'teacher' && (
                                <span className="font-semibold truncate">
                                  👤 {entry.teacherName}
                                </span>
                              )}
                              {viewMode !== 'room' && (
                                <span className="truncate">
                                  📍 {entry.roomName}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                            <Plus size={14} className="text-gray-400" />
                            <span>Boş Saat — Ders Atamak İçin Dokunun</span>
                          </div>
                        )}
                      </div>

                      {/* Right: Time and Action Icon */}
                      <div className="text-right shrink-0">
                        <div className="text-[10px] font-mono font-bold text-gray-400">
                          {slot.time}
                        </div>
                        <div className="mt-1 flex justify-end">
                          <div className="w-6 h-6 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 flex items-center justify-center">
                            <Edit3 size={11} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Lunch Break Divider after 4th period */}
                  {slot.isLunchAfter && (
                    <div className="py-1 px-3 flex items-center justify-between rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/40 text-[10px] font-extrabold text-amber-700 dark:text-amber-400">
                      <span>🥪 Öğle Yemeği & Dinlenme Arası</span>
                      <span className="font-mono">11:55 - 12:45 (50 Dk)</span>
                    </div>
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </section>

        {/* ── 8. CONFLICT NOTIFICATION BANNER IF CONFLICT DETECTED ── */}
        {totalConflictsCount > 0 && (
          <section className="px-4 mt-3">
            <div
              onClick={() => setIsConflictModalOpen(true)}
              className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <div className="text-xs font-black text-rose-900 dark:text-rose-200">
                    {totalConflictsCount} Adet Çakışma Tespit Edildi
                  </div>
                  <p className="text-[10px] text-rose-700 dark:text-rose-300">
                    Öğretmen veya derslik aynı saatte birden fazla şubeye atanmış.
                  </p>
                </div>
              </div>
              <span className="text-xs font-black text-rose-600 dark:text-rose-400 underline shrink-0">
                Çöz
              </span>
            </div>
          </section>
        )}
      </main>

      {/* ── DOCK MENU ── */}
      {!hideDock && (
        <MobileAdminDock
          activeTab="schedule"
          onOpenMoreSheet={() => setIsMoreSheetOpen(false)}
          orgSlug={orgSlug}
          theme={theme}
        />
      )}

      {/* ── MODAL 1: DERS SLOTU ATAMA / DÜZENLE MODALI ── */}
      <AnimatePresence>
        {isEditModalOpen && slotToEdit && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
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
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white">
                      {slotToEdit.entry ? 'Ders Saatini Düzenle' : 'Yeni Ders Saati Ata'}
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      {DAYS_LIST.find((d) => d.key === slotToEdit.day)?.label} · {slotToEdit.period}. Ders Saati
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveSlot} className="p-5 overflow-y-auto space-y-3.5 text-xs">
                {/* Live Conflict Alert within form */}
                {modalLiveConflict && (
                  <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[11px] font-bold">
                    {modalLiveConflict.message}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">
                      Şube / Sınıf
                    </label>
                    <select
                      value={formClassCode}
                      onChange={(e) => setFormClassCode(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                    >
                      {availableClasses.map((c) => (
                        <option key={c} value={c}>
                          {c} Şubesi
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">
                      Ders Adı
                    </label>
                    <select
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                    >
                      {SUBJECT_OPTIONS.map((s) => (
                        <option key={s.name} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">
                    Dersi Veren Öğretmen
                  </label>
                  <select
                    value={formTeacher}
                    onChange={(e) => setFormTeacher(e.target.value)}
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
                    Fiziksel Derslik / Atölye
                  </label>
                  <select
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                  >
                    {SCHOOL_ROOMS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Tv size={16} className="text-emerald-500" />
                    <div>
                      <div className="font-bold text-xs">Akıllı Tahta Kullanımı</div>
                      <div className="text-[10px] text-gray-400">Bu derste akıllı tahta aktif oturumu açılır</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formSmartBoard}
                    onChange={(e) => setFormSmartBoard(e.target.checked)}
                    className="w-5 h-5 rounded-md accent-emerald-600 cursor-pointer"
                  />
                </div>

                <div className="pt-2 flex items-center gap-2">
                  {slotToEdit.entry && (
                    <button
                      type="button"
                      onClick={handleDeleteSlot}
                      className="h-12 px-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Trash2 size={15} />
                      <span>Kaldır</span>
                    </button>
                  )}

                  <button
                    type="submit"
                    className="flex-1 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Save size={16} />
                    <span>{slotToEdit.entry ? 'Dersi Güncelle' : 'Dersi Programa Ekle'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 2: PROGRAMI YAYIMLA ONAY MODALI ── */}
      <AnimatePresence>
        {isPublishModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPublishModalOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`relative w-full max-w-sm rounded-[32px] p-5 shadow-2xl z-10 ${
                theme === 'dark' ? 'bg-[#121826] text-white border border-gray-800' : 'bg-white text-gray-900'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-3">
                <Zap size={24} />
              </div>

              <h3 className="text-base font-black text-center mb-1">
                Ders Programını Yayımla
              </h3>
              <p className="text-xs text-center text-gray-400 mb-4">
                Bu işlem programı canlıya aktarır. Tüm öğretmen ve veli ekranlarında güncel program aktif olacaktır.
              </p>

              <form onSubmit={handlePublishSchedule} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">
                    Sürüm Kodu
                  </label>
                  <input
                    type="text"
                    value={publishVersion}
                    onChange={(e) => setPublishVersion(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">
                    Değişiklik Notu / Açıklama
                  </label>
                  <input
                    type="text"
                    value={publishNote}
                    onChange={(e) => setPublishNote(e.target.value)}
                    placeholder="Örn: 2-B saatleri güncellendi..."
                    className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPublishModalOpen(false)}
                    className="h-11 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check size={16} strokeWidth={2.5} />
                    <span>Yayımla</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 3: PROGRAM REVİZYON GEÇMİŞİ MODALI ── */}
      <AnimatePresence>
        {isRevisionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRevisionModalOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%', opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.8 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className={`relative w-full sm:max-w-md max-h-[85vh] rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col z-10 overflow-hidden ${
                theme === 'dark' ? 'bg-[#0E131F] text-white border-t sm:border border-gray-800' : 'bg-white text-gray-900'
              }`}
            >
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History size={16} className="text-indigo-400" />
                  <h3 className="text-sm font-black text-gray-900 dark:text-white">
                    Program Değişiklik Geçmişi
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRevisionModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-2.5 text-xs">
                {revisionsList.map((rev, index) => (
                  <div
                    key={rev.id}
                    className="p-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-indigo-600 dark:text-indigo-400">
                          {rev.version}
                        </span>
                        {index === 0 && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-400">
                            YAYINDA
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {rev.date} · {rev.time}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                      {rev.note}
                    </p>

                    <div className="text-[10px] text-gray-400 font-semibold pt-1 border-t border-gray-200/50 dark:border-gray-700/50 flex items-center gap-1">
                      <User size={10} />
                      <span>{rev.author}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 4: ÇAKIŞMA DETAY LİSTESİ MODALI ── */}
      <AnimatePresence>
        {isConflictModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConflictModalOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`relative w-full max-w-sm rounded-[32px] p-5 shadow-2xl z-10 ${
                theme === 'dark' ? 'bg-[#121826] text-white border border-gray-800' : 'bg-white text-gray-900'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={17} className="text-rose-500" />
                  <h3 className="text-sm font-black">
                    Çakışma Kontrol Raporu ({totalConflictsCount})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsConflictModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="py-3 max-h-[60vh] overflow-y-auto space-y-2 text-xs">
                {totalConflictsCount === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
                    <div className="font-black text-gray-900 dark:text-white">Çakışma Bulunmuyor!</div>
                    <p className="text-[11px] mt-1">Tüm öğretmen ve derslik atamaları MEB kurallarına uygun.</p>
                  </div>
                ) : (
                  <>
                    {teacherConflicts.map((c, i) => (
                      <div
                        key={`tc-${i}`}
                        className="p-3 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60"
                      >
                        <div className="font-extrabold text-rose-800 dark:text-rose-300">
                          Öğretmen: {c.teacher}
                        </div>
                        <div className="text-[11px] text-gray-600 dark:text-gray-300 mt-1">
                          {DAYS_LIST.find((d) => d.key === c.day)?.label} · {c.period}. Ders saatinde birden fazla sınıfta:
                        </div>
                        <div className="mt-1 flex gap-1 flex-wrap">
                          {c.entries.map((e) => (
                            <span
                              key={e.id}
                              className="px-2 py-0.5 rounded-md bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200 text-[10px] font-black"
                            >
                              {e.classCode} ({e.subject})
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}

                    {roomConflicts.map((c, i) => (
                      <div
                        key={`rc-${i}`}
                        className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60"
                      >
                        <div className="font-extrabold text-amber-800 dark:text-amber-300">
                          Derslik: {c.room}
                        </div>
                        <div className="text-[11px] text-gray-600 dark:text-gray-300 mt-1">
                          {DAYS_LIST.find((d) => d.key === c.day)?.label} · {c.period}. Ders saatinde iki sınıf aynı alanda:
                        </div>
                        <div className="mt-1 flex gap-1 flex-wrap">
                          {c.entries.map((e) => (
                            <span
                              key={e.id}
                              className="px-2 py-0.5 rounded-md bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 text-[10px] font-black"
                            >
                              {e.classCode} ({e.subject})
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsConflictModalOpen(false)}
                className="w-full mt-2 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-black text-xs cursor-pointer"
              >
                Kapat
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 5: VELİLERE & ÖĞRETMENLERE SMS DUYURU MODALI ── */}
      <AnimatePresence>
        {isSmsShareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSmsShareModalOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`relative w-full max-w-sm rounded-[32px] p-5 shadow-2xl z-10 ${
                theme === 'dark' ? 'bg-[#121826] text-white border border-gray-800' : 'bg-white text-gray-900'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Send size={16} className="text-indigo-400" />
                  <h3 className="text-sm font-black">Program Duyurusu Gönder</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSmsShareModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={handleSendSms} className="mt-3 space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">
                    Hedef Kitle
                  </label>
                  <select
                    value={smsTarget}
                    onChange={(e) => setSmsTarget(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                  >
                    <option value="all_parents">Tüm Okul Velileri (312 Veli)</option>
                    <option value="class_parents">{selectedClass} Şubesi Velileri (30 Veli)</option>
                    <option value="teachers">Tüm Öğretmen Kadrosu (24 Öğretmen)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">
                    SMS & Bildirim Metni
                  </label>
                  <textarea
                    rows={4}
                    value={smsContent}
                    onChange={(e) => setSmsContent(e.target.value)}
                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium resize-none text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsSmsShareModalOpen(false)}
                    className="h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send size={14} />
                    <span>Gönder</span>
                  </button>
                </div>
              </form>
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
}
