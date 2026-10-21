import { Metadata } from 'next'
import React from 'react'
import StudentPlannerView from '@components/Student/views/StudentPlannerView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Ders Notlarım & Ajanda — Öğrenci Portalı | Oxonom EDU',
  description: 'Kişisel ders notları, akıllı tahta çizimleri ve çalışma ajandası.',
}

export default function StudentNotesPage() {
  return <StudentPlannerView initialTab="notes" />
}
