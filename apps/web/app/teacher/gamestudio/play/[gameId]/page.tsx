// apps/web/app/teacher/gamestudio/play/[gameId]/page.tsx
import React from 'react'
import FullscreenGamePlayer from '@components/GameStudio/FullscreenGamePlayer'

export default async function TeacherGamePlayPage({
  params,
}: {
  params: Promise<{ gameId: string }>
}) {
  const { gameId } = await params
  return <FullscreenGamePlayer gameId={gameId} returnPath="/teacher/gamestudio" />
}
