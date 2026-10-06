import { getOrganizationContextInfo } from '@services/organizations/orgs'
import { Metadata } from 'next'
import React from 'react'
import ConnectBoardClient from '@components/Dashboard/ConnectBoard/ConnectBoardClient'

type MetadataProps = {
  params: Promise<{ orgslug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(props: MetadataProps): Promise<Metadata> {
  const params = await props.params
  const org = await getOrganizationContextInfo(params.orgslug, {
    revalidate: 120,
    tags: ['organizations'],
  })

  return {
    title: `Tahtaya Bağlan — ${org.name}`,
    description: `Akıllı tahtaya QR kod veya 6 haneli kod ile bağlanın — ${org.name}`,
    robots: {
      index: false,
      follow: false,
    },
  }
}

async function ConnectBoardDashPage() {
  return (
    <div className="w-full flex-1">
      <ConnectBoardClient />
    </div>
  )
}

export default ConnectBoardDashPage
