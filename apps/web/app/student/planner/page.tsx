import { Metadata } from 'next'
import React from 'react'
import StudentPlannerView from '@components/Student/views/StudentPlannerView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Notlarım & Ajanda — Öğrenci Portalı | Oxonom EDU',
  description: 'Kişisel ders notları, çalışma ajandası ve görevler.',
}

export default function StudentPlannerPage() {
  return <StudentPlannerView initialTab="all" />
}
