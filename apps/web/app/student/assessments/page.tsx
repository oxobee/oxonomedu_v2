import { Metadata } from 'next'
import React from 'react'
import StudentAssessmentsView from '@components/Student/views/StudentAssessmentsView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Sınavlarım — Öğrenci Portalı | Oxonom EDU',
  description: 'Yazılı sınavlar, mini testler ve yayımlanan sınav sonuçları.',
}

export default function StudentAssessmentsPage() {
  return <StudentAssessmentsView initialTab="all" />
}
