'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Plus,
  X,
  Check,
  Clock,
  Sparkles,
  Trash2,
  Edit3,
  RotateCcw,
  Wand2,
  Calendar,
  ChevronRight,
  GraduationCap,
  Building2,
  CheckCircle2,
  AlertCircle,
  Tv,
  Layers,
  ArrowRight,
  Copy,
  Users,
} from 'lucide-react'
import toast from 'react-hot-toast'
import MobileHeader from '@components/Mobile/MobileHeader'
import MobileAdminDock from './MobileAdminDock'
import MobileAdminMoreSheet from './MobileAdminMoreSheet'
import { useMobileTheme } from '@components/Mobile/useMobileTheme'
import {
  SCHOOL_ORGS,
  getOrgTeachers,
} from '@services/demo/schoolDirectory'

export interface MAdminCurriculumClientProps {
  orgSlug?: string
  hideHeader?: boolean
  hideDock?: boolean
}

// ── TYPES ──
export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri'

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

export interface CurriculumCourse {
  id: string
  code: string
  name: string
  category: 'Temel Ders' | 'Fen & Teknoloji' | 'Sosyal & Beşeri' | 'Sanat & Spor' | 'Yabancı Dil'
  gradeLevels: string[]
  orgId: number
  weeklyHours: number
  branchTeacher: string
  requiredRoom: string
  isSmartBoardReady: boolean
  isElective: boolean
  color: string
}

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

// ── COLOR THEMES ──
export const COLOR_OPTIONS: Record<string, { bg: string; text: string; border: string; badge: string; dot: string }> = {
  blue: {
    bg: 'bg-blue-500/10 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-800',
    badge: 'bg-blue-600 text-white',
    dot: 'bg-blue-500',
  },
  indigo: {
    bg: 'bg-indigo-500/10 dark:bg-indigo-950/40',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-300 dark:border-indigo-800',
    badge: 'bg-indigo-600 text-white',
    dot: 'bg-indigo-500',
  },
  teal: {
    bg: 'bg-teal-500/10 dark:bg-teal-950/40',
    text: 'text-teal-700 dark:text-teal-300',
    border: 'border-teal-300 dark:border-teal-800',
    badge: 'bg-teal-600 text-white',
    dot: 'bg-teal-500',
  },
  emerald: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-800',
    badge: 'bg-emerald-600 text-white',
    dot: 'bg-emerald-500',
  },
  orange: {
    bg: 'bg-orange-500/10 dark:bg-orange-950/40',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-300 dark:border-orange-800',
    badge: 'bg-orange-600 text-white',
    dot: 'bg-orange-500',
  },
  amber: {
    bg: 'bg-amber-500/10 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-800',
    badge: 'bg-amber-600 text-white',
    dot: 'bg-amber-500',
  },
  pink: {
    bg: 'bg-pink-500/10 dark:bg-pink-950/40',
    text: 'text-pink-700 dark:text-pink-300',
    border: 'border-pink-300 dark:border-pink-800',
    badge: 'bg-pink-600 text-white',
    dot: 'bg-pink-500',
  },
  purple: {
    bg: 'bg-purple-500/10 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-300 dark:border-purple-800',
    badge: 'bg-purple-600 text-white',
    dot: 'bg-purple-500',
  },
  cyan: {
    bg: 'bg-cyan-500/10 dark:bg-cyan-950/40',
    text: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-300 dark:border-cyan-800',
    badge: 'bg-cyan-600 text-white',
    dot: 'bg-cyan-500',
  },
}

function getColorStyle(color: string) {
  return COLOR_OPTIONS[color] || COLOR_OPTIONS.blue
}

// ── INITIAL PRESET DATASETS ──
const INITIAL_PRIMARY_COURSES: CurriculumCourse[] = [
  {
    id: 'c-1',
    code: 'TUR-101',
    name: 'Türkçe',
    category: 'Temel Ders',
    gradeLevels: ['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf'],
    orgId: 10,
    weeklyHours: 6,
    branchTeacher: 'Özlem ZOR',
    requiredRoom: 'Derslik 101',
    isSmartBoardReady: true,
    isElective: false,
    color: 'blue',
  },
  {
    id: 'c-2',
    code: 'MAT-101',
    name: 'Matematik',
    category: 'Temel Ders',
    gradeLevels: ['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf'],
    orgId: 10,
    weeklyHours: 5,
    branchTeacher: 'Özlem ZOR',
    requiredRoom: 'Derslik 101',
    isSmartBoardReady: true,
    isElective: false,
    color: 'indigo',
  },
  {
    id: 'c-3',
    code: 'HAY-101',
    name: 'Hayat Bilgisi',
    category: 'Sosyal & Beşeri',
    gradeLevels: ['1. Sınıf', '2. Sınıf', '3. Sınıf'],
    orgId: 10,
    weeklyHours: 4,
    branchTeacher: 'Özlem ZOR',
    requiredRoom: 'Derslik 101',
    isSmartBoardReady: true,
    isElective: false,
    color: 'teal',
  },
  {
    id: 'c-4',
    code: 'BED-101',
    name: 'Beden Eğitimi ve Oyun',
    category: 'Sanat & Spor',
    gradeLevels: ['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf'],
    orgId: 10,
    weeklyHours: 5,
    branchTeacher: 'Özlem ZOR',
    requiredRoom: 'Kapalı Spor Salonu',
    isSmartBoardReady: false,
    isElective: false,
    color: 'orange',
  },
  {
    id: 'c-5',
    code: 'ING-101',
    name: 'İngilizce',
    category: 'Yabancı Dil',
    gradeLevels: ['2. Sınıf', '3. Sınıf', '4. Sınıf'],
    orgId: 10,
    weeklyHours: 2,
    branchTeacher: 'Beyzanur SALMANLI',
    requiredRoom: 'Derslik 101',
    isSmartBoardReady: true,
    isElective: false,
    color: 'purple',
  },
  {
    id: 'c-6',
    code: 'GOR-101',
    name: 'Görsel Sanatlar',
    category: 'Sanat & Spor',
    gradeLevels: ['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf'],
    orgId: 10,
    weeklyHours: 1,
    branchTeacher: 'Özlem ZOR',
    requiredRoom: 'Görsel Sanatlar Atölyesi',
    isSmartBoardReady: false,
    isElective: false,
    color: 'amber',
  },
  {
    id: 'c-7',
    code: 'MUZ-101',
    name: 'Müzik',
    category: 'Sanat & Spor',
    gradeLevels: ['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf'],
    orgId: 10,
    weeklyHours: 1,
    branchTeacher: 'Özlem ZOR',
    requiredRoom: 'Müzik Dersliği',
    isSmartBoardReady: true,
    isElective: false,
    color: 'pink',
  },
  {
    id: 'c-8',
    code: 'DIN-101',
    name: 'Din Kültürü & Ahlak',
    category: 'Sosyal & Beşeri',
    gradeLevels: ['4. Sınıf'],
    orgId: 10,
    weeklyHours: 2,
    branchTeacher: 'Özge KABA',
    requiredRoom: 'Derslik 101',
    isSmartBoardReady: true,
    isElective: false,
    color: 'emerald',
  },
  {
    id: 'c-9',
    code: 'SER-101',
    name: 'Serbest Etkinlikler',
    category: 'Temel Ders',
    gradeLevels: ['1. Sınıf', '2. Sınıf'],
    orgId: 10,
    weeklyHours: 4,
    branchTeacher: 'Özlem ZOR',
    requiredRoom: 'Derslik 101',
    isSmartBoardReady: true,
    isElective: false,
    color: 'cyan',
  },
]

const INITIAL_MIDDLE_COURSES: CurriculumCourse[] = [
  {
    id: 'mc-1',
    code: 'TUR-701',
    name: 'Türkçe',
    category: 'Temel Ders',
    gradeLevels: ['5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf'],
    orgId: 20,
    weeklyHours: 5,
    branchTeacher: 'Beritan ŞENATEŞ',
    requiredRoom: 'Derslik 301',
    isSmartBoardReady: true,
    isElective: false,
    color: 'blue',
  },
  {
    id: 'mc-2',
    code: 'MAT-801',
    name: 'Matematik',
    category: 'Temel Ders',
    gradeLevels: ['5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf'],
    orgId: 20,
    weeklyHours: 5,
    branchTeacher: 'Orkun AYDIN',
    requiredRoom: 'Derslik 301',
    isSmartBoardReady: true,
    isElective: false,
    color: 'indigo',
  },
  {
    id: 'mc-3',
    code: 'FEN-701',
    name: 'Fen Bilimleri',
    category: 'Fen & Teknoloji',
    gradeLevels: ['5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf'],
    orgId: 20,
    weeklyHours: 4,
    branchTeacher: 'Bülent TURAN',
    requiredRoom: 'Fen Laboratuvarı',
    isSmartBoardReady: true,
    isElective: false,
    color: 'emerald',
  },
  {
    id: 'mc-4',
    code: 'SOS-701',
    name: 'Sosyal Bilgiler',
    category: 'Sosyal & Beşeri',
    gradeLevels: ['5. Sınıf', '6. Sınıf', '7. Sınıf'],
    orgId: 20,
    weeklyHours: 3,
    branchTeacher: 'Ayşe GÜL',
    requiredRoom: 'Derslik 301',
    isSmartBoardReady: true,
    isElective: false,
    color: 'amber',
  },
  {
    id: 'mc-5',
    code: 'ING-701',
    name: 'Yabancı Dil (İngilizce)',
    category: 'Yabancı Dil',
    gradeLevels: ['5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf'],
    orgId: 20,
    weeklyHours: 4,
    branchTeacher: 'Deniz ARSLAN',
    requiredRoom: 'Derslik 301',
    isSmartBoardReady: true,
    isElective: false,
    color: 'purple',
  },
  {
    id: 'mc-6',
    code: 'DIN-701',
    name: 'Din Kültürü ve Ahlak',
    category: 'Sosyal & Beşeri',
    gradeLevels: ['5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf'],
    orgId: 20,
    weeklyHours: 2,
    branchTeacher: 'Murat YILMAZ',
    requiredRoom: 'Derslik 301',
    isSmartBoardReady: true,
    isElective: false,
    color: 'teal',
  },
  {
    id: 'mc-7',
    code: 'BIL-701',
    name: 'Bilişim Teknolojileri & Kodlama',
    category: 'Fen & Teknoloji',
    gradeLevels: ['5. Sınıf', '6. Sınıf'],
    orgId: 20,
    weeklyHours: 2,
    branchTeacher: 'Emre ÇELİK',
    requiredRoom: 'Bilişim Laboratuvarı',
    isSmartBoardReady: true,
    isElective: false,
    color: 'cyan',
  },
  {
    id: 'mc-8',
    code: 'BED-701',
    name: 'Beden Eğitimi ve Spor',
    category: 'Sanat & Spor',
    gradeLevels: ['5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf'],
    orgId: 20,
    weeklyHours: 2,
    branchTeacher: 'Hakan DEMİR',
    requiredRoom: 'Kapalı Spor Salonu',
    isSmartBoardReady: false,
    isElective: false,
    color: 'orange',
  },
  {
    id: 'mc-9',
    code: 'GOR-701',
    name: 'Görsel Sanatlar',
    category: 'Sanat & Spor',
    gradeLevels: ['5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf'],
    orgId: 20,
    weeklyHours: 1,
    branchTeacher: 'Sema POLAT',
    requiredRoom: 'Resim Atölyesi',
    isSmartBoardReady: false,
    isElective: false,
    color: 'amber',
  },
  {
    id: 'mc-10',
    code: 'MUZ-701',
    name: 'Müzik',
    category: 'Sanat & Spor',
    gradeLevels: ['5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf'],
    orgId: 20,
    weeklyHours: 1,
    branchTeacher: 'Elif ŞAHİN',
    requiredRoom: 'Müzik Odası',
    isSmartBoardReady: true,
    isElective: false,
    color: 'pink',
  },
]

// Default pre-filled 1-A weekly template
const DEFAULT_1A_SCHEDULE: ScheduleEntry[] = [
  // Pazartesi (6 saat)
  { id: 'sc-1', orgId: 10, day: 'mon', period: 1, classCode: '1-A', subject: 'Türkçe', teacherName: 'Özlem ZOR', roomName: 'Derslik 101', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-2', orgId: 10, day: 'mon', period: 2, classCode: '1-A', subject: 'Türkçe', teacherName: 'Özlem ZOR', roomName: 'Derslik 101', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-3', orgId: 10, day: 'mon', period: 3, classCode: '1-A', subject: 'Matematik', teacherName: 'Özlem ZOR', roomName: 'Derslik 101', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-4', orgId: 10, day: 'mon', period: 4, classCode: '1-A', subject: 'Hayat Bilgisi', teacherName: 'Özlem ZOR', roomName: 'Derslik 101', color: 'teal', isSmartBoardActive: true },
  { id: 'sc-5', orgId: 10, day: 'mon', period: 5, classCode: '1-A', subject: 'Görsel Sanatlar', teacherName: 'Özlem ZOR', roomName: 'Görsel Sanatlar Atölyesi', color: 'amber', isSmartBoardActive: false },
  { id: 'sc-6', orgId: 10, day: 'mon', period: 6, classCode: '1-A', subject: 'Beden Eğitimi ve Oyun', teacherName: 'Özlem ZOR', roomName: 'Kapalı Spor Salonu', color: 'orange', isSmartBoardActive: false },
  // Salı (6 saat)
  { id: 'sc-7', orgId: 10, day: 'tue', period: 1, classCode: '1-A', subject: 'Matematik', teacherName: 'Özlem ZOR', roomName: 'Derslik 101', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-8', orgId: 10, day: 'tue', period: 2, classCode: '1-A', subject: 'Matematik', teacherName: 'Özlem ZOR', roomName: 'Derslik 101', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-9', orgId: 10, day: 'tue', period: 3, classCode: '1-A', subject: 'Türkçe', teacherName: 'Özlem ZOR', roomName: 'Derslik 101', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-10', orgId: 10, day: 'tue', period: 4, classCode: '1-A', subject: 'Hayat Bilgisi', teacherName: 'Özlem ZOR', roomName: 'Derslik 101', color: 'teal', isSmartBoardActive: true },
  { id: 'sc-11', orgId: 10, day: 'tue', period: 5, classCode: '1-A', subject: 'Müzik', teacherName: 'Özlem ZOR', roomName: 'Müzik Dersliği', color: 'pink', isSmartBoardActive: false },
  { id: 'sc-12', orgId: 10, day: 'tue', period: 6, classCode: '1-A', subject: 'Beden Eğitimi ve Oyun', teacherName: 'Özlem ZOR', roomName: 'Kapalı Spor Salonu', color: 'orange', isSmartBoardActive: false },
  // Çarşamba (6 saat)
  { id: 'sc-13', orgId: 10, day: 'wed', period: 1, classCode: '1-A', subject: 'Türkçe', teacherName: 'Özlem ZOR', roomName: 'Derslik 101', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-14', orgId: 10, day: 'wed', period: 2, classCode: '1-A', subject: 'Türkçe', teacherName: 'Özlem ZOR', roomName: 'Derslik 101', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-15', orgId: 10, day: 'wed', period: 3, classCode: '1-A', subject: 'Hayat Bilgisi', teacherName: 'Özlem ZOR', roomName: 'Derslik 101', color: 'teal', isSmartBoardActive: true },
  { id: 'sc-16', orgId: 10, day: 'wed', period: 4, classCode: '1-A', subject: 'İngilizce', teacherName: 'Beyzanur SALMANLI', roomName: 'Derslik 101', color: 'purple', isSmartBoardActive: true },
  { id: 'sc-17', orgId: 10, day: 'wed', period: 5, classCode: '1-A', subject: 'İngilizce', teacherName: 'Beyzanur SALMANLI', roomName: 'Derslik 101', color: 'purple', isSmartBoardActive: true },
  { id: 'sc-18', orgId: 10, day: 'wed', period: 6, classCode: '1-A', subject: 'Beden Eğitimi ve Oyun', teacherName: 'Özlem ZOR', roomName: 'Kapalı Spor Salonu', color: 'orange', isSmartBoardActive: false },
  // Perşembe (6 saat)
  { id: 'sc-19', orgId: 10, day: 'thu', period: 1, classCode: '1-A', subject: 'Matematik', teacherName: 'Özlem ZOR', roomName: 'Derslik 101', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-20', orgId: 10, day: 'thu', period: 2, classCode: '1-A', subject: 'Türkçe', teacherName: 'Özlem ZOR', roomName: 'Derslik 101', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-21', orgId: 10, day: 'thu', period: 3, classCode: '1-A', subject: 'Hayat Bilgisi', teacherName: 'Özlem ZOR', roomName: 'Derslik 101', color: 'teal', isSmartBoardActive: true },
  { id: 'sc-22', orgId: 10, day: 'thu', period: 4, classCode: '1-A', subject: 'Beden Eğitimi ve Oyun', teacherName: 'Özlem ZOR', roomName: 'Kapalı Spor Salonu', color: 'orange', isSmartBoardActive: false },
  { id: 'sc-23', orgId: 10, day: 'thu', period: 5, classCode: '1-A', subject: 'Beden Eğitimi ve Oyun', teacherName: 'Özlem ZOR', roomName: 'Kapalı Spor Salonu', color: 'orange', isSmartBoardActive: false },
  { id: 'sc-24', orgId: 10, day: 'thu', period: 6, classCode: '1-A', subject: 'Serbest Etkinlikler', teacherName: 'Özlem ZOR', roomName: 'Derslik 101', color: 'cyan', isSmartBoardActive: true },
  // Cuma (6 saat)
  { id: 'sc-25', orgId: 10, day: 'fri', period: 1, classCode: '1-A', subject: 'Matematik', teacherName: 'Özlem ZOR', roomName: 'Derslik 101', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-26', orgId: 10, day: 'fri', period: 2, classCode: '1-A', subject: 'Serbest Etkinlikler', teacherName: 'Özlem ZOR', roomName: 'Derslik 101', color: 'cyan', isSmartBoardActive: true },
  { id: 'sc-27', orgId: 10, day: 'fri', period: 3, classCode: '1-A', subject: 'Serbest Etkinlikler', teacherName: 'Özlem ZOR', roomName: 'Derslik 101', color: 'cyan', isSmartBoardActive: true },
  { id: 'sc-28', orgId: 10, day: 'fri', period: 4, classCode: '1-A', subject: 'Serbest Etkinlikler', teacherName: 'Özlem ZOR', roomName: 'Derslik 101', color: 'cyan', isSmartBoardActive: true },
  { id: 'sc-29', orgId: 10, day: 'fri', period: 5, classCode: '1-A', subject: 'Din Kültürü & Ahlak', teacherName: 'Özge KABA', roomName: 'Derslik 101', color: 'emerald', isSmartBoardActive: true },
  { id: 'sc-30', orgId: 10, day: 'fri', period: 6, classCode: '1-A', subject: 'Din Kültürü & Ahlak', teacherName: 'Özge KABA', roomName: 'Derslik 101', color: 'emerald', isSmartBoardActive: true },
]

export default function MAdminCurriculumClient({
  orgSlug,
  hideHeader = false,
  hideDock = false,
}: MAdminCurriculumClientProps) {
  const { theme, toggleTheme } = useMobileTheme()
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false)
  const [selectedOrgId, setSelectedOrgId] = useState<number>(10) // 10: İlkokul, 20: Ortaokul
  const [selectedClass, setSelectedClass] = useState<string>('1-A')
  const [activeDay, setActiveDay] = useState<DayKey>('mon')

  // Main View Tab: 'distribute' (Sürükle-Bırak Haftalık Çizelge) | 'catalog' (Ders Tanımları & Saatler)
  const [activeTab, setActiveTab] = useState<'distribute' | 'catalog'>('distribute')

  // Selected Active Course for 1-Tap Quick-Drop placement
  const [selectedCourseForDrop, setSelectedCourseForDrop] = useState<CurriculumCourse | null>(null)

  // Dragging state for desktop HTML5 drag & drop
  const [draggedCourseName, setDraggedCourseName] = useState<string | null>(null)

  // Dynamic Periods State (Allows adding extra lesson periods via + button)
  const [periods, setPeriods] = useState<PeriodSlot[]>(() => {
    return PRIMARY_PERIODS
  })

  // Modals state
  const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState(false)
  const [courseToEdit, setCourseToEdit] = useState<CurriculumCourse | null>(null)
  const [selectedSlotForAction, setSelectedSlotForAction] = useState<{
    entry?: ScheduleEntry
    day: DayKey
    period: number
  } | null>(null)

  // Class Selection Modals
  const [isBatchApplyModalOpen, setIsBatchApplyModalOpen] = useState(false)
  const [batchSelectedClasses, setBatchSelectedClasses] = useState<string[]>([])

  // Form Fields for Add/Edit Course
  const [formName, setFormName] = useState('')
  const [formCode, setFormCode] = useState('')
  const [formCategory, setFormCategory] = useState<'Temel Ders' | 'Fen & Teknoloji' | 'Sosyal & Beşeri' | 'Sanat & Spor' | 'Yabancı Dil'>('Temel Ders')
  const [formWeeklyHours, setFormWeeklyHours] = useState<number>(4)
  const [formBranchTeacher, setFormBranchTeacher] = useState('Sınıf Öğretmeni')
  const [formRequiredRoom, setFormRequiredRoom] = useState('Standart Derslik')
  const [formColor, setFormColor] = useState('blue')
  const [formIsSmartBoard, setFormIsSmartBoard] = useState(true)

  // Courses Catalog State with localStorage
  const [coursesList, setCoursesList] = useState<CurriculumCourse[]>(() => {
    return INITIAL_PRIMARY_COURSES
  })

  // Schedule Entries State with localStorage (shares same key with /m-admin-schedule!)
  const [scheduleList, setScheduleList] = useState<ScheduleEntry[]>(() => {
    return DEFAULT_1A_SCHEDULE
  })

  // Load from localStorage on school change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCourses = localStorage.getItem(`oxonom_admin_curriculum_${selectedOrgId}`)
        if (savedCourses) {
          const parsed = JSON.parse(savedCourses)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCoursesList(parsed)
          } else {
            setCoursesList(selectedOrgId === 10 ? INITIAL_PRIMARY_COURSES : INITIAL_MIDDLE_COURSES)
          }
        } else {
          setCoursesList(selectedOrgId === 10 ? INITIAL_PRIMARY_COURSES : INITIAL_MIDDLE_COURSES)
        }

        const savedSchedule = localStorage.getItem(`oxonom_admin_schedule_${selectedOrgId}`)
        if (savedSchedule) {
          const parsedSchedule = JSON.parse(savedSchedule)
          if (Array.isArray(parsedSchedule) && parsedSchedule.length > 0) {
            setScheduleList(parsedSchedule)
          } else {
            setScheduleList(selectedOrgId === 10 ? DEFAULT_1A_SCHEDULE : [])
          }
        } else {
          setScheduleList(selectedOrgId === 10 ? DEFAULT_1A_SCHEDULE : [])
        }
      } catch (_) {}
    }

    if (selectedOrgId === 10) {
      setSelectedClass('1-A')
      setPeriods(PRIMARY_PERIODS)
    } else {
      setSelectedClass('7-A')
      setPeriods(MIDDLE_PERIODS)
    }
    setSelectedCourseForDrop(null)
  }, [selectedOrgId])

  // Persist courses helper
  const persistCourses = (updated: CurriculumCourse[]) => {
    setCoursesList(updated)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`oxonom_admin_curriculum_${selectedOrgId}`, JSON.stringify(updated))
      } catch (_) {}
    }
  }

  // Persist schedule helper
  const persistSchedule = (updated: ScheduleEntry[]) => {
    setScheduleList(updated)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`oxonom_admin_schedule_${selectedOrgId}`, JSON.stringify(updated))
      } catch (_) {}
    }
  }

  const activeOrg = SCHOOL_ORGS.find((o) => o.id === selectedOrgId) || SCHOOL_ORGS[0]
  const availableClasses = selectedOrgId === 10
    ? ['1-A', '1-B', '1-C', '2-A', '2-B', '3-A', '4-A']
    : ['5-A', '6-A', '7-A', '8-A']

  // Haftalık toplam saat kapasitesi (Dinamik: günde kaç ders saati varsa x 5 gün)
  const targetWeeklyHours = periods.length * 5

  // Sınıfın haftalık yerleştirilmiş saatleri
  const classEntries = useMemo(() => {
    return scheduleList.filter(
      (e) => e.orgId === selectedOrgId && e.classCode === selectedClass
    )
  }, [scheduleList, selectedOrgId, selectedClass])

  // Ders başına yerleştirilen saat sayıları
  const placedSubjectCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    classEntries.forEach((e) => {
      counts[e.subject] = (counts[e.subject] || 0) + 1
    })
    return counts
  }, [classEntries])

  const totalAssignedHours = classEntries.length
  const remainingTotalHours = Math.max(0, targetWeeklyHours - totalAssignedHours)

  // Aktif günün dersleri
  const activeDayEntries = useMemo(() => {
    return classEntries.filter((e) => e.day === activeDay)
  }, [classEntries, activeDay])

  // ── DİNAMİK DERS SAATİ EKLEME (KULLANICI ARTI BUTONUNA BASINCA) ──
  const handleAddPeriod = () => {
    const nextNum = periods.length + 1
    const lastPeriod = periods[periods.length - 1]
    let nextTime = '15:30 - 16:10'

    if (lastPeriod && lastPeriod.time.includes('-')) {
      const parts = lastPeriod.time.split('-')
      if (parts[1]) {
        const [endH, endM] = parts[1].trim().split(':').map(Number)
        if (!isNaN(endH) && !isNaN(endM)) {
          const startMin = endH * 60 + endM + 15 // 15 dk teneffüs
          const endMin = startMin + 40 // 40 dk ders
          const sH = String(Math.floor(startMin / 60)).padStart(2, '0')
          const sM = String(startMin % 60).padStart(2, '0')
          const eH = String(Math.floor(endMin / 60)).padStart(2, '0')
          const eM = String(endMin % 60).padStart(2, '0')
          nextTime = `${sH}:${sM} - ${eH}:${eM}`
        }
      }
    }

    const newSlot: PeriodSlot = {
      periodNumber: nextNum,
      time: nextTime,
    }

    setPeriods((prev) => [...prev, newSlot])
    toast.success(`🎉 ${nextNum}. Ders saati (${nextTime}) programa eklendi!`)
  }

  // Dinamik eklenen ders saatini kaldırma
  const handleRemovePeriod = (periodNum: number) => {
    const updatedSchedule = scheduleList.filter(
      (e) => !(e.orgId === selectedOrgId && e.period === periodNum)
    )
    persistSchedule(updatedSchedule)
    setPeriods((prev) => prev.filter((p) => p.periodNumber !== periodNum))
    toast.success(`${periodNum}. Ders saati kaldırıldı.`)
  }

  // ── QUICK DROP / ASSIGN LOGIC ──
  const handleAssignCourseToSlot = (day: DayKey, period: number, courseToAssign: CurriculumCourse) => {
    // Check if slot already has an entry
    const existingIndex = scheduleList.findIndex(
      (e) => e.orgId === selectedOrgId && e.classCode === selectedClass && e.day === day && e.period === period
    )

    const newEntry: ScheduleEntry = {
      id: `sc-${Date.now()}-${day}-${period}`,
      orgId: selectedOrgId,
      day,
      period,
      classCode: selectedClass,
      subject: courseToAssign.name,
      teacherName: courseToAssign.branchTeacher,
      roomName: courseToAssign.requiredRoom,
      color: courseToAssign.color,
      isSmartBoardActive: courseToAssign.isSmartBoardReady,
    }

    let updatedList: ScheduleEntry[]
    if (existingIndex >= 0) {
      updatedList = [...scheduleList]
      updatedList[existingIndex] = newEntry
    } else {
      updatedList = [...scheduleList, newEntry]
    }

    persistSchedule(updatedList)
    toast.success(`✅ ${courseToAssign.name} (${DAYS_LIST.find((d) => d.key === day)?.label} ${period}. Ders) yerleştirildi!`, {
      duration: 1800,
    })
  }

  // Slot silme
  const handleRemoveSlot = (day: DayKey, period: number) => {
    const updated = scheduleList.filter(
      (e) => !(e.orgId === selectedOrgId && e.classCode === selectedClass && e.day === day && e.period === period)
    )
    persistSchedule(updated)
    toast.success('Ders saati boşaltıldı.')
    setSelectedSlotForAction(null)
  }

  // 1-Tıkla Otomatik Doldur
  const handleAutoDistributeMEB = () => {
    const newWeeklyEntries: ScheduleEntry[] = []
    let currentCourseIndex = 0
    const courseQueue: CurriculumCourse[] = []

    coursesList.forEach((c) => {
      for (let i = 0; i < c.weeklyHours; i++) {
        courseQueue.push(c)
      }
    })

    DAYS_LIST.forEach((day) => {
      periods.forEach((period) => {
        if (currentCourseIndex < courseQueue.length) {
          const course = courseQueue[currentCourseIndex]
          newWeeklyEntries.push({
            id: `sc-auto-${day.key}-${period.periodNumber}-${Date.now()}`,
            orgId: selectedOrgId,
            day: day.key,
            period: period.periodNumber,
            classCode: selectedClass,
            subject: course.name,
            teacherName: course.branchTeacher,
            roomName: course.requiredRoom,
            color: course.color,
            isSmartBoardActive: course.isSmartBoardReady,
          })
          currentCourseIndex++
        }
      })
    })

    const otherEntries = scheduleList.filter(
      (e) => !(e.orgId === selectedOrgId && e.classCode === selectedClass)
    )
    const combined = [...otherEntries, ...newWeeklyEntries]
    persistSchedule(combined)
    toast.success(`🎉 ${selectedClass} için ders programı otomatik dolduruldu!`)
  }

  // Tüm haftayı sıfırla
  const handleClearWeek = () => {
    const updated = scheduleList.filter(
      (e) => !(e.orgId === selectedOrgId && e.classCode === selectedClass)
    )
    persistSchedule(updated)
    toast.success(`${selectedClass} haftalık ders programı sıfırlandı.`)
  }

  // ── BİRDEN FAZLA SINIFA VE TÜMÜNE PROGRAMI KOPYALA / UYGULA ──
  const handleBatchApplySchedule = () => {
    if (batchSelectedClasses.length === 0) {
      toast.error('Lütfen en az bir hedef sınıf seçin!')
      return
    }

    const currentEntries = scheduleList.filter(
      (e) => e.orgId === selectedOrgId && e.classCode === selectedClass
    )

    if (currentEntries.length === 0) {
      toast.error(`${selectedClass} sınıfında henüz kayıtlı ders bulunmuyor!`)
      return
    }

    // Seçili sınıfların mevcut programlarını temizle ve kopyala
    const remaining = scheduleList.filter(
      (e) => !(e.orgId === selectedOrgId && batchSelectedClasses.includes(e.classCode))
    )

    const newBatchEntries: ScheduleEntry[] = []
    batchSelectedClasses.forEach((targetCls) => {
      currentEntries.forEach((entry) => {
        newBatchEntries.push({
          ...entry,
          id: `sc-batch-${targetCls}-${entry.day}-${entry.period}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          classCode: targetCls,
        })
      })
    })

    persistSchedule([...remaining, ...newBatchEntries])
    toast.success(`🎉 ${selectedClass} programı ${batchSelectedClasses.length} sınıfa (${batchSelectedClasses.join(', ')}) başarıyla uygulandı!`)
    setIsBatchApplyModalOpen(false)
  }

  // ── CREATE NEW COURSE ──
  const handleOpenNewCourseModal = () => {
    setFormName('')
    setFormCode('')
    setFormCategory('Temel Ders')
    setFormWeeklyHours(4)
    setFormBranchTeacher(selectedOrgId === 10 ? 'Sınıf Öğretmeni' : 'Branş Öğretmeni')
    setFormRequiredRoom('Standart Derslik')
    setFormColor('blue')
    setFormIsSmartBoard(true)
    setIsNewCourseModalOpen(true)
  }

  const handleCreateCourse = (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    const trimmedName = formName.trim()
    if (!trimmedName) {
      toast.error('Lütfen ders adını girin!')
      return
    }

    const autoCode = formCode.trim()
      ? formCode.trim().toUpperCase()
      : `${trimmedName.slice(0, 3).toUpperCase()}-101`

    const newCourse: CurriculumCourse = {
      id: `c-custom-${Date.now()}`,
      code: autoCode,
      name: trimmedName,
      category: formCategory,
      gradeLevels: selectedOrgId === 10 ? ['1. Sınıf', '2. Sınıf'] : ['5. Sınıf', '6. Sınıf'],
      orgId: selectedOrgId,
      weeklyHours: Number(formWeeklyHours) || 4,
      branchTeacher: formBranchTeacher.trim() || 'Sınıf Öğretmeni',
      requiredRoom: formRequiredRoom.trim() || 'Standart Derslik',
      isSmartBoardReady: Boolean(formIsSmartBoard),
      isElective: false,
      color: formColor,
    }

    const updated = [...coursesList, newCourse]
    persistCourses(updated)
    toast.success(`🎉 "${trimmedName}" (${newCourse.weeklyHours} Saat) ders kataloğuna eklendi!`)
    setIsNewCourseModalOpen(false)
    setSelectedCourseForDrop(newCourse)
  }

  // Edit Course
  const handleOpenEditCourse = (course: CurriculumCourse) => {
    setCourseToEdit(course)
    setFormName(course.name)
    setFormCode(course.code)
    setFormCategory(course.category)
    setFormWeeklyHours(course.weeklyHours)
    setFormBranchTeacher(course.branchTeacher)
    setFormRequiredRoom(course.requiredRoom)
    setFormColor(course.color)
    setFormIsSmartBoard(course.isSmartBoardReady)
  }

  const handleSaveEditCourse = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!courseToEdit) return

    const trimmedName = formName.trim() || courseToEdit.name
    const updated = coursesList.map((c) => {
      if (c.id === courseToEdit.id) {
        return {
          ...c,
          name: trimmedName,
          code: formCode.trim().toUpperCase() || c.code,
          category: formCategory,
          weeklyHours: Number(formWeeklyHours) || c.weeklyHours,
          branchTeacher: formBranchTeacher.trim() || c.branchTeacher,
          requiredRoom: formRequiredRoom.trim() || c.requiredRoom,
          color: formColor,
          isSmartBoardReady: Boolean(formIsSmartBoard),
        }
      }
      return c
    })

    persistCourses(updated)
    toast.success(`"${trimmedName}" ders bilgileri güncellendi!`)
    setCourseToEdit(null)
  }

  // Delete Course
  const handleDeleteCourse = (courseId: string) => {
    const course = coursesList.find((c) => c.id === courseId)
    const updated = coursesList.filter((c) => c.id !== courseId)
    persistCourses(updated)
    toast.success(`"${course?.name || 'Ders'}" ders kataloğundan silindi.`)
    if (selectedCourseForDrop?.id === courseId) {
      setSelectedCourseForDrop(null)
    }
  }

  return (
    <div
      className={`min-h-screen pb-24 font-jakarta select-none transition-colors duration-200 ${
        theme === 'dark' ? 'bg-[#0A0D15] text-white' : 'bg-[#F8FAFC] text-gray-900'
      }`}
    >
      {/* ── 1. HEADER ── */}
      {!hideHeader && (
        <MobileHeader
          title="MEB Müfredatı & Ders Dağıtımı"
          subtitle={activeOrg.name}
          showBack
          backHref={orgSlug ? `/orgs/${orgSlug}/m-admin` : '/m-admin'}
          theme={theme}
          onThemeToggle={toggleTheme}
        />
      )}

      <main className="max-w-[430px] sm:max-w-[460px] mx-auto min-h-screen">
        {/* ── 2. HERO CARD & OKUL / ŞUBE SEÇİCİ ── */}
        <section className="px-4 pt-3">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0E131F] via-[#121826] to-[#0A0D15] border border-gray-800 p-4 shadow-xl">
            {/* Animated Subtle Circles */}
            <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full pointer-events-none opacity-30">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                className="w-full h-full relative"
              >
                <div className="absolute inset-0 rounded-full border border-teal-400/20" />
                <div className="absolute inset-6 rounded-full border border-white/10 border-dashed" />
                <div className="absolute inset-12 rounded-full border border-teal-400/30" />
              </motion.div>
            </div>

            {/* School Switcher */}
            <div className="relative z-10 flex items-center justify-between pb-2.5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <BookOpen size={16} />
                </div>
                <div>
                  <div className="text-xs font-black text-white flex items-center gap-1.5">
                    <span>Haftalık MEB Ders Çizelgesi</span>
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-teal-500/20 text-teal-400 border border-teal-500/30">
                      e-Okul Uyumlu
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {activeOrg.name} · Maarif Modeli
                  </p>
                </div>
              </div>
            </div>

            {/* School Tabs */}
            <div className="grid grid-cols-2 gap-1.5 mt-2.5 p-1 rounded-2xl bg-white/5 border border-white/10">
              <button
                type="button"
                onClick={() => setSelectedOrgId(10)}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold text-center transition-all cursor-pointer ${
                  selectedOrgId === 10
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Necla Görer İlkokulu
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
                Fevzi Kalkancı Ortaokulu
              </button>
            </div>

            {/* ── 3. SINIF SEÇİN ALANI (FERAH, SADE, YATAY KAYDIRILABİLİR & ÇOKLU UYGULAMA) ── */}
            <div className="mt-2.5 p-2.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between px-0.5">
                <div className="flex items-center gap-1.5 text-xs font-black text-teal-300">
                  <GraduationCap size={15} />
                  <span>Sınıf Seçin:</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setBatchSelectedClasses([selectedClass])
                    setIsBatchApplyModalOpen(true)
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-[10px] font-black transition-all cursor-pointer shadow-xs"
                >
                  <Copy size={11} />
                  <span>Çoklu Sınıfa Uygula</span>
                </button>
              </div>

              {/* Yatay Rahat Kaydırılabilir Sınıf Rozetleri (Sıkışıklık Yok, Geniş ve Ferah) */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {availableClasses.map((cls) => {
                  const isSelected = selectedClass === cls
                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setSelectedClass(cls)}
                      className={`min-w-[60px] px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer text-center shrink-0 ${
                        isSelected
                          ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md ring-2 ring-teal-400/50 scale-105'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      {cls}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Weekly Load Progress Stats (Dinamik: Saat eklenince güncellenir) */}
            <div className="grid grid-cols-3 gap-2 mt-2.5 pt-2.5 border-t border-white/10 text-center">
              <div className="p-2 rounded-xl bg-white/5">
                <div className="text-sm font-black text-white">{targetWeeklyHours} Saat</div>
                <div className="text-[10px] text-gray-400 font-semibold mt-0.5">Haftalık Yük</div>
              </div>

              <div className="p-2 rounded-xl bg-white/5">
                <div className="text-sm font-black text-teal-400">{totalAssignedHours} Saat</div>
                <div className="text-[10px] text-gray-400 font-semibold mt-0.5">Dağıtılan Saat</div>
              </div>

              <div className="p-2 rounded-xl bg-white/5">
                <div className={`text-sm font-black ${remainingTotalHours === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {remainingTotalHours === 0 ? '0 Saat' : `${remainingTotalHours} Saat`}
                </div>
                <div className="text-[10px] text-gray-400 font-semibold mt-0.5">Kalan Boş Saat</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. ANA SEKMELER (SÜRÜKLE-BIRAK DAĞITIM / DERS KATALOĞU) ── */}
        <section className="px-4 mt-3">
          <div className="flex items-center p-1 rounded-2xl bg-gray-200/60 dark:bg-gray-800/60 text-xs font-bold gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('distribute')}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'distribute'
                  ? 'bg-white dark:bg-[#121826] text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Wand2 size={14} />
              <span>Sürükle - Bırak Dağıtım</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-white dark:bg-[#121826] text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Layers size={14} />
              <span>Ders Tanımları & Saatler</span>
            </button>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            SEKME 1: SÜRÜKLE - BIRAK VE PRATİK DOKUN-YERLEŞTİR HAFTALIK DAĞITIM
           ════════════════════════════════════════════════════════════ */}
        {activeTab === 'distribute' && (
          <div className="space-y-3 mt-3">
            {/* ── A. DERS HAVUZU (DRAGGABLE & 1-TAP PLACEMENT DOCK) ── */}
            <section className="px-4">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800/80 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={14} className="text-teal-500" />
                    <span className="text-xs font-black text-gray-900 dark:text-white">
                      Ders Havuzu ({coursesList.length} Ders)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenNewCourseModal}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[10px] font-black cursor-pointer hover:bg-teal-100"
                  >
                    <Plus size={11} strokeWidth={2.5} />
                    <span>Yeni Ders Ekle</span>
                  </button>
                </div>

                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2.5">
                  💡 <strong>Kullanım:</strong> Karta dokunun ve aşağıdaki boş ders saatine dokunarak yerleştirin (veya sürükleyip bırakın).
                </p>

                {/* Course Badges Horizontal Wrap / Grid */}
                <div className="flex flex-wrap gap-1.5">
                  {coursesList.map((course) => {
                    const style = getColorStyle(course.color)
                    const placedHours = placedSubjectCounts[course.name] || 0
                    const isFullyPlaced = placedHours >= course.weeklyHours
                    const isSelected = selectedCourseForDrop?.id === course.id

                    return (
                      <motion.div
                        key={course.id}
                        whileTap={{ scale: 0.96 }}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', course.name)
                          setDraggedCourseName(course.name)
                        }}
                        onDragEnd={() => setDraggedCourseName(null)}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedCourseForDrop(null)
                          } else {
                            setSelectedCourseForDrop(course)
                            toast(`🎯 "${course.name}" seçildi. Yerleştirmek istediğiniz ders saatine dokunun.`, {
                              icon: '👉',
                              duration: 2000,
                            })
                          }
                        }}
                        className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-grab active:cursor-grabbing flex items-center gap-1.5 ${
                          isSelected
                            ? 'ring-2 ring-teal-500 bg-teal-50 dark:bg-teal-950/80 border-teal-500 text-teal-900 dark:text-teal-100 shadow-sm'
                            : isFullyPlaced
                            ? 'bg-gray-100 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 opacity-80'
                            : `${style.bg} ${style.border} ${style.text}`
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                        <span>{course.name}</span>
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${
                            isFullyPlaced
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white/80 dark:bg-black/30 border border-current'
                          }`}
                        >
                          {placedHours}/{course.weeklyHours}s
                        </span>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Selected Feedback Banner */}
                {selectedCourseForDrop && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2.5 p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-teal-700 dark:text-teal-300">
                      <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                      <span>Seçili: <strong>{selectedCourseForDrop.name}</strong></span>
                      <span className="text-[10px] text-gray-500">
                        ({placedSubjectCounts[selectedCourseForDrop.name] || 0}/{selectedCourseForDrop.weeklyHours} Saat)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCourseForDrop(null)}
                      className="text-[10px] text-gray-400 hover:text-gray-600 font-bold px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700"
                    >
                      Vazgeç
                    </button>
                  </motion.div>
                )}
              </div>
            </section>

            {/* ── B. GÜN SEÇİCİ & OTOMATİK DOLDUR BUTONU ── */}
            <section className="px-4">
              <div className="flex items-center justify-between mb-1.5">
                <div className="grid grid-cols-5 gap-1 flex-1">
                  {DAYS_LIST.map((day) => {
                    const isActive = activeDay === day.key
                    const dayCount = classEntries.filter((e) => e.day === day.key).length
                    return (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => setActiveDay(day.key)}
                        className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isActive
                            ? 'bg-teal-600 text-white shadow-sm'
                            : 'bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800/80 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        <span className="text-[10px] font-bold opacity-80">{day.shortLabel}</span>
                        <span className="text-xs font-black">{day.label.slice(0, 3)}</span>
                        <span className={`text-[9px] mt-0.5 font-bold px-1 rounded-full ${isActive ? 'bg-white/20' : 'text-gray-400'}`}>
                          {dayCount}/{periods.length}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Fast Action Tools */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={handleAutoDistributeMEB}
                  className="h-8 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-[11px] flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Wand2 size={13} />
                  <span>Otomatik Doldur</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearWeek}
                  className="h-8 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>Haftayı Sıfırla</span>
                </button>
              </div>
            </section>

            {/* ── C. SEÇİLİ GÜNÜN DERS SAATLERİ (SÜRÜKLE BIRAK / DOKUN YERLEŞTİR + DİNAMİK SAAT EKLEME) ── */}
            <section className="px-4 space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Clock size={13} className="text-teal-500" />
                  <span>
                    {DAYS_LIST.find((d) => d.key === activeDay)?.label} Akışı ({activeDayEntries.length}/{periods.length} Saat)
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 font-semibold">
                  Dokunarak Yönetin
                </span>
              </div>

              <div className="space-y-2">
                {periods.map((slot) => {
                  const entry = activeDayEntries.find((e) => e.period === slot.periodNumber)
                  const style = entry ? getColorStyle(entry.color) : null
                  const isCustomPeriod = slot.periodNumber > (selectedOrgId === 10 ? 6 : 7)

                  return (
                    <motion.div
                      key={slot.periodNumber}
                      whileTap={{ scale: 0.98 }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        const subjectName = e.dataTransfer.getData('text/plain') || draggedCourseName
                        if (subjectName) {
                          const matched = coursesList.find((c) => c.name === subjectName)
                          if (matched) {
                            handleAssignCourseToSlot(activeDay, slot.periodNumber, matched)
                          }
                        }
                      }}
                      onClick={() => {
                        if (selectedCourseForDrop) {
                          handleAssignCourseToSlot(activeDay, slot.periodNumber, selectedCourseForDrop)
                        } else if (entry) {
                          setSelectedSlotForAction({
                            entry,
                            day: activeDay,
                            period: slot.periodNumber,
                          })
                        } else {
                          toast('Lütfen yukarıdaki Ders Havuzundan bir ders seçin veya Yeni Ders ekleyin.', {
                            icon: '☝️',
                          })
                        }
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer relative ${
                        entry
                          ? `bg-white dark:bg-[#121826] border-gray-200/90 dark:border-gray-800/80 shadow-xs hover:border-teal-400 dark:hover:border-teal-500`
                          : selectedCourseForDrop
                          ? 'border-2 border-dashed border-teal-400 bg-teal-50/40 dark:bg-teal-950/20 shadow-xs'
                          : 'border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 hover:border-teal-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        {/* Sol: Saat ve Periyot */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                              entry
                                ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300 font-black'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 font-bold'
                            }`}
                          >
                            <span className="text-[9px] uppercase leading-none opacity-80">DERS</span>
                            <span className="text-sm font-black leading-none mt-0.5">{slot.periodNumber}</span>
                          </div>

                          <div className="min-w-0">
                            {entry ? (
                              <>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-black text-gray-900 dark:text-white">
                                    {entry.subject}
                                  </span>
                                  <span
                                    className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md border ${style?.bg} ${style?.text} ${style?.border}`}
                                  >
                                    {entry.teacherName}
                                  </span>
                                  {isCustomPeriod && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50">
                                      Ek Ders
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400">
                                  <span>⏰ {slot.time}</span>
                                  <span>·</span>
                                  <span>{entry.roomName}</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="text-xs font-bold text-gray-400">
                                  {selectedCourseForDrop
                                    ? `👉 "${selectedCourseForDrop.name}" dersini buraya bırak/dokun`
                                    : 'Boş Ders Saati'}
                                </div>
                                <div className="text-[10px] text-gray-400">
                                  ⏰ {slot.time} {isCustomPeriod && '· İlave Ders Saati'}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Sağ: İkon veya İşlem */}
                        <div className="flex items-center gap-1 shrink-0">
                          {entry ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveSlot(activeDay, slot.periodNumber)
                              }}
                              className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-rose-500 flex items-center justify-center cursor-pointer transition-colors"
                              title="Dersi Kaldır"
                            >
                              <Trash2 size={13} />
                            </button>
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center">
                              <Plus size={14} />
                            </div>
                          )}

                          {/* İlave periyot ise periyodu tamamen kaldırma butonu */}
                          {isCustomPeriod && !entry && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemovePeriod(slot.periodNumber)
                              }}
                              className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-500 hover:bg-rose-100 flex items-center justify-center cursor-pointer transition-colors"
                              title="Ek Saati Sil"
                            >
                              <X size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}

                {/* ── + DAHA FAZLA DERS SAATİ EKLE BUTONU ── */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleAddPeriod}
                    className="w-full h-11 rounded-2xl border-2 border-dashed border-teal-500/40 hover:border-teal-500 bg-teal-50/30 dark:bg-teal-950/20 text-teal-700 dark:text-teal-300 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    <span>+ {periods.length + 1}. Ders Saatini Ekle</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            SEKME 2: DERS TANIMLARI & MEB SAAT KONTROLÜ (KATALOG)
           ════════════════════════════════════════════════════════════ */}
        {activeTab === 'catalog' && (
          <div className="space-y-3 mt-3 px-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-gray-900 dark:text-white">
                Tanımlı Dersler ({coursesList.length})
              </span>
              <button
                type="button"
                onClick={handleOpenNewCourseModal}
                className="h-8 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>Yeni Ders Tanımla</span>
              </button>
            </div>

            <div className="space-y-2">
              {coursesList.map((course) => {
                const style = getColorStyle(course.color)
                const placedHours = placedSubjectCounts[course.name] || 0

                return (
                  <div
                    key={course.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800/80 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-black text-gray-900 dark:text-white">
                            {course.name}
                          </span>
                          <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-800 text-gray-500">
                            {course.code}
                          </span>
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md border ${style.bg} ${style.text} ${style.border}`}
                          >
                            {course.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                          <span className="font-black text-teal-600 dark:text-teal-400">
                            ⏱ {course.weeklyHours} Saat / Hafta
                          </span>
                          <span>·</span>
                          <span>{course.branchTeacher}</span>
                          <span>·</span>
                          <span>{course.requiredRoom}</span>
                        </div>

                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="text-[10px] font-bold text-gray-500">
                            Haftalık Durum: {placedHours}/{course.weeklyHours} Saat Dağıtıldı
                          </span>
                          {placedHours >= course.weeklyHours && (
                            <span className="text-[10px] font-bold text-emerald-500">
                              (Tamam ✅)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditCourse(course)}
                          className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-teal-600 flex items-center justify-center transition-colors cursor-pointer"
                          title="Düzenle"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCourse(course.id)}
                          className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                          title="Sil"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* ── 5. DOCK MENU ── */}
      {!hideDock && (
        <MobileAdminDock
          activeTab="more"
          onOpenMoreSheet={() => setIsMoreSheetOpen(true)}
          orgSlug={orgSlug}
          theme={theme}
        />
      )}



      {/* ── MODAL B: ÇOKLU SINIFA / TÜMÜNE UYGULA MODALI ── */}
      <AnimatePresence>
        {isBatchApplyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBatchApplyModalOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%', opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.8 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className={`relative w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] p-5 shadow-2xl z-10 ${
                theme === 'dark' ? 'bg-[#121826] text-white border border-gray-800' : 'bg-white text-gray-900'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                    <Copy size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black">Programı Çoklu Sınıfa Uygula</h4>
                    <p className="text-[10px] text-gray-400">
                      Kaynak: <strong>{selectedClass}</strong> ({classEntries.length} Saat)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBatchApplyModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500">Hedef Sınıfları Seçin:</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (batchSelectedClasses.length === availableClasses.length) {
                        setBatchSelectedClasses([])
                      } else {
                        setBatchSelectedClasses([...availableClasses])
                      }
                    }}
                    className="text-[11px] font-black text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                  >
                    {batchSelectedClasses.length === availableClasses.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
                  </button>
                </div>

                {/* Sınıf Onay Kutuları */}
                <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto">
                  {availableClasses.map((cls) => {
                    const isChecked = batchSelectedClasses.includes(cls)
                    return (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setBatchSelectedClasses(batchSelectedClasses.filter((c) => c !== cls))
                          } else {
                            setBatchSelectedClasses([...batchSelectedClasses, cls])
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-teal-500/15 border-teal-500 text-teal-900 dark:text-teal-100 font-black'
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold'
                        }`}
                      >
                        <span className="text-xs">{cls} Şubesi</span>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center ${
                            isChecked ? 'bg-teal-500 text-white' : 'border border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {isChecked && <Check size={13} strokeWidth={3} />}
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/40 text-[10px] text-amber-800 dark:text-amber-300">
                  ⚠️ <strong>Bilgi:</strong> Seçili hedef sınıfların mevcut ders programları silinerek {selectedClass} şubesinin programı ile güncellenecektir.
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleBatchApplySchedule}
                    className="w-full h-12 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    <span>Seçili {batchSelectedClasses.length} Sınıfa Programı Kopyala ve Uygula</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 1: YENİ DERS TANIMLA MODALI ── */}
      <AnimatePresence>
        {isNewCourseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewCourseModalOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
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

              {/* Title */}
              <div className="px-5 pt-3 pb-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <Plus size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white">
                      Yeni Ders Tanımla
                    </h3>
                    <p className="text-[11px] text-gray-400">Müfredat kataloğuna yeni ders ekle</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNewCourseModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Form Content */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleCreateCourse()
                }}
                className="p-5 overflow-y-auto space-y-3.5 text-xs"
              >
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">
                      Ders Adı *
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Örn: Beden Eğitimi"
                      className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">
                      Ders Kodu
                    </label>
                    <input
                      type="text"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      placeholder="Örn: BED-101"
                      className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono font-black uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">
                      Kategori
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                    >
                      <option value="Temel Ders">Temel Ders</option>
                      <option value="Fen & Teknoloji">Fen & Teknoloji</option>
                      <option value="Sosyal & Beşeri">Sosyal & Beşeri</option>
                      <option value="Sanat & Spor">Sanat & Spor</option>
                      <option value="Yabancı Dil">Yabancı Dil</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">
                      Haftalık Saat *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={formWeeklyHours}
                      onChange={(e) => setFormWeeklyHours(Number(e.target.value))}
                      className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-black text-center"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">
                    Dersi Verecek Branş / Öğretmen
                  </label>
                  <input
                    type="text"
                    value={formBranchTeacher}
                    onChange={(e) => setFormBranchTeacher(e.target.value)}
                    placeholder="Sınıf Öğretmeni, Beden Öğretmeni..."
                    className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">
                    Fiziksel Derslik Alanı
                  </label>
                  <input
                    type="text"
                    value={formRequiredRoom}
                    onChange={(e) => setFormRequiredRoom(e.target.value)}
                    placeholder="Standart Derslik, Kapalı Spor Salonu..."
                    className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                  />
                </div>

                {/* Color Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5">
                    Kart Renk Teması
                  </label>
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {Object.keys(COLOR_OPTIONS).map((cKey) => {
                      const cStyle = COLOR_OPTIONS[cKey]
                      return (
                        <button
                          key={cKey}
                          type="button"
                          onClick={() => setFormColor(cKey)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                            cStyle.dot
                          } ${formColor === cKey ? 'ring-2 ring-offset-2 ring-teal-500 scale-110' : 'opacity-80'}`}
                        >
                          {formColor === cKey && <Check size={12} className="text-white" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault()
                      handleCreateCourse()
                    }}
                    className="w-full h-12 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    <span>+ Dersi Oluştur ve Kataloğa Ekle</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 2: DERS DÜZENLE MODALI ── */}
      <AnimatePresence>
        {courseToEdit && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCourseToEdit(null)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
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

              {/* Title */}
              <div className="px-5 pt-3 pb-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Edit3 size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white">
                      Ders Bilgilerini Güncelle
                    </h3>
                    <p className="text-[11px] text-gray-400">{courseToEdit.name} · {courseToEdit.code}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCourseToEdit(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Form Content */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSaveEditCourse()
                }}
                className="p-5 overflow-y-auto space-y-3.5 text-xs"
              >
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">
                      Ders Adı *
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">
                      Ders Kodu
                    </label>
                    <input
                      type="text"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono font-black uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">
                      Kategori
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                    >
                      <option value="Temel Ders">Temel Ders</option>
                      <option value="Fen & Teknoloji">Fen & Teknoloji</option>
                      <option value="Sosyal & Beşeri">Sosyal & Beşeri</option>
                      <option value="Sanat & Spor">Sanat & Spor</option>
                      <option value="Yabancı Dil">Yabancı Dil</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">
                      Haftalık Saat
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={formWeeklyHours}
                      onChange={(e) => setFormWeeklyHours(Number(e.target.value))}
                      className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-black text-center"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">
                    Dersi Verecek Branş / Öğretmen
                  </label>
                  <input
                    type="text"
                    value={formBranchTeacher}
                    onChange={(e) => setFormBranchTeacher(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">
                    Fiziksel Derslik Alanı
                  </label>
                  <input
                    type="text"
                    value={formRequiredRoom}
                    onChange={(e) => setFormRequiredRoom(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault()
                      handleSaveEditCourse()
                    }}
                    className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Check size={16} strokeWidth={2.5} />
                    <span>Değişiklikleri Kaydet</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 3: SLOT YÖNETİMİ / HIZLI DERS DEĞİŞTİRME ── */}
      <AnimatePresence>
        {selectedSlotForAction && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSlotForAction(null)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%', opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.8 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className={`relative w-full sm:max-w-sm rounded-t-[32px] sm:rounded-[32px] p-5 shadow-2xl z-10 ${
                theme === 'dark' ? 'bg-[#121826] text-white border border-gray-800' : 'bg-white text-gray-900'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h4 className="text-sm font-black">
                    {DAYS_LIST.find((d) => d.key === selectedSlotForAction.day)?.label} · {selectedSlotForAction.period}. Ders
                  </h4>
                  <p className="text-[11px] text-gray-400">
                    Mevcut: {selectedSlotForAction.entry?.subject || 'Boş'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSlotForAction(null)}
                  className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Course Replacement Options */}
              <div className="mt-3 space-y-2">
                <p className="text-[11px] font-bold text-gray-500">Bu saate başka ders ata:</p>
                <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {coursesList.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        handleAssignCourseToSlot(selectedSlotForAction.day, selectedSlotForAction.period, c)
                        setSelectedSlotForAction(null)
                      }}
                      className="p-2 rounded-xl text-left bg-gray-50 dark:bg-gray-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 border border-gray-200 dark:border-gray-700 text-xs font-bold transition-all cursor-pointer truncate"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delete Button */}
              {selectedSlotForAction.entry && (
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(selectedSlotForAction.day, selectedSlotForAction.period)}
                    className="w-full h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-rose-100"
                  >
                    <Trash2 size={13} />
                    <span>Bu Saati Boşalt (Kaldır)</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 6. MORE SHEET ── */}
      <MobileAdminMoreSheet
        isOpen={isMoreSheetOpen}
        onClose={() => setIsMoreSheetOpen(false)}
        theme={theme}
        orgSlug={orgSlug}
      />
    </div>
  )
}
