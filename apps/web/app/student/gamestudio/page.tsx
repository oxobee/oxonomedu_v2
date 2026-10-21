// apps/web/app/student/gamestudio/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import GameStoreHub from '@components/GameStudio/GameStoreHub'
import { getSynchronizedStudentProfile } from '@/lib/student/studentData'

export default function StudentGameStudioPage() {
  const [userGrade, setUserGrade] = useState<string>('1/A')

  useEffect(() => {
    try {
      const p = getSynchronizedStudentProfile()
      if (p?.className) {
        setUserGrade(p.className)
      }
    } catch (_) {}
  }, [])

  return <GameStoreHub role="student" userGrade={userGrade} backPath="/student/dashboard" />
}
