// apps/web/app/teacher/gamestudio/page.tsx
'use client'

import React from 'react'
import GameStoreHub from '@components/GameStudio/GameStoreHub'

export default function TeacherGameStudioPage() {
  return <GameStoreHub role="teacher" backPath="/teacher/dashboard" />
}
