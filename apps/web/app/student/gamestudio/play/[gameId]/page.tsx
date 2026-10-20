// apps/web/app/student/gamestudio/play/[gameId]/page.tsx
import React from 'react'
import FullscreenGamePlayer from '@components/GameStudio/FullscreenGamePlayer'

export default async function StudentGamePlayPage({
  params,
}: {
  params: Promise<{ gameId: string }>
}) {
  const { gameId } = await params
  return <FullscreenGamePlayer gameId={gameId} returnPath="/student/gamestudio" />
}
