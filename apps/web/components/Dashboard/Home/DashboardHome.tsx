'use client'
import React from 'react'
import Link from 'next/link'
import {
  PlusCircle,
  ChartBar,
  GearSix,
  Users,
  BookOpen,
} from '@phosphor-icons/react'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/keys'
import { useTranslation } from 'react-i18next'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { useOrg } from '@components/Contexts/OrgContext'
import { getAPIUrl } from '@services/config/config'
import { OrgUsageResponse, orgUsageFetcher } from '@services/orgs/usage'
import AdminAuthorization from '@components/Security/AdminAuthorization'
import { usePlan } from '@components/Hooks/usePlan'
import useAdminStatus from '@components/Hooks/useAdminStatus'
import SchoolAdminDashboard from './SchoolAdminDashboard'
import TeacherDashboard from './TeacherDashboard'
import QuickStats from './QuickStats'
import RecentBoards from './RecentBoards'
import RecentMembers from './RecentMembers'
import ContentOverview from './ContentOverview'
import UsageOverview from './UsageOverview'

const PLAN_COLORS: Record<string, { bg: string; text: string }> = {
  free: { bg: 'bg-gray-100', text: 'text-gray-600' },
  oss: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  standard: { bg: 'bg-blue-100', text: 'text-blue-700' },
  pro: { bg: 'bg-purple-100', text: 'text-purple-700' },
  enterprise: { bg: 'bg-amber-100', text: 'text-amber-700' },
}

export default function DashboardHome() {
  const { t } = useTranslation()
  const { canManageOrg } = useAdminStatus()
  const session = useLHSession() as any
  const org = useOrg() as any

  const token = session?.data?.tokens?.access_token
  const orgId = org?.id
  const username = session?.data?.user?.username || ''

  // TanStack Query will dedupe with UsageOverview's identical call via shared queryKey
  const { data: usageData } = useQuery<OrgUsageResponse>({
    queryKey: queryKeys.org.usage(orgId),
    queryFn: () => orgUsageFetcher(`${getAPIUrl()}orgs/${orgId}/usage`, token),
    enabled: !!token && !!orgId,
    staleTime: 60_000,
  })

  const plan = usePlan()
  const planStyle = PLAN_COLORS[plan] || PLAN_COLORS.free

  // If a teacher accesses the desktop dashboard from a mobile device, redirect to /dashv2
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile =
        window.innerWidth < 768 ||
        /mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/i.test(navigator.userAgent)
      if (isMobile && !canManageOrg) {
        const target = org?.slug ? `/orgs/${org.slug}/dashv2` : '/dashv2'
        window.location.replace(target)
      }
    }
  }, [canManageOrg, org?.slug])

  return (
    <div className="h-full w-full bg-[#f8f8f8]">
      <div className="px-4 sm:px-10 pt-8 pb-10">
        <div className="space-y-6 max-w-[1600px] mx-auto w-full">
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('dashboard.home.welcome_back')}{username ? `, ${username}` : ''}
              </h1>
              <div className="flex items-center gap-2 mt-1.5">
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${planStyle.bg} ${planStyle.text}`}
                >
                  {plan === 'oss' ? 'OSS' : `${plan} ${t('dashboard.home.plan')}`}
                </span>
                {org?.name && (
                  <span className="text-xs text-gray-400">{org.name}</span>
                )}
                {canManageOrg && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                    Okul Yönetimi
                  </span>
                )}
              </div>
            </div>

            {canManageOrg ? (
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href="/dash/classrooms"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors shadow-xs"
                >
                  <PlusCircle size={14} weight="bold" />
                  Sınıflar & Şubeler
                </Link>
                <Link
                  href="/dash/students"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-gray-700 bg-white rounded-lg nice-shadow hover:bg-gray-50 transition-colors"
                >
                  <Users size={14} weight="bold" />
                  Öğrenci İşleri
                </Link>
                <Link
                  href="/dash/finance"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-gray-700 bg-white rounded-lg nice-shadow hover:bg-gray-50 transition-colors"
                >
                  <ChartBar size={14} weight="bold" />
                  Giderler & Finans
                </Link>
                <Link
                  href="/dash/org/settings/general"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-gray-700 bg-white rounded-lg nice-shadow hover:bg-gray-50 transition-colors"
                >
                  <GearSix size={14} weight="bold" />
                  Okul Ayarları
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href="/dash/boards?new=true"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <PlusCircle size={14} weight="bold" />
                  {t('boards.create_board', 'Yeni Pano')}
                </Link>
                <Link
                  href="/dash/assignments"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-gray-600 bg-white rounded-lg nice-shadow hover:bg-gray-50 transition-colors"
                >
                  Ödevler
                </Link>
                <Link
                  href="/dash/classrooms"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-gray-600 bg-white rounded-lg nice-shadow hover:bg-gray-50 transition-colors"
                >
                  Sınıflar
                </Link>
              </div>
            )}
          </div>

          {canManageOrg ? (
            <SchoolAdminDashboard />
          ) : (
            <TeacherDashboard />
          )}
        </div>
      </div>
    </div>
  )
}
