import { Metadata } from 'next'
import React from 'react'
import TeacherDesktopOSView from '@components/Teacher/TeacherDesktopOSView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Öğretmen Masaüstü (OS) — Oxonom EDU',
  description: 'Sürükle-bırak ikonlu, yaşlı dostu ve pencereli öğretmen masaüstü işletim sistemi.',
}

export default function TeacherDesktopOSPage() {
  return <TeacherDesktopOSView />
}
