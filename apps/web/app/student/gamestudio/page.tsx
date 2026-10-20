// apps/web/app/student/gamestudio/page.tsx
'use client'

import React from 'react'
import GameStoreHub from '@components/GameStudio/GameStoreHub'

export default function StudentGameStudioPage() {
  return <GameStoreHub role="student" userGrade="9-A" backPath="/student/dashboard" />
}
