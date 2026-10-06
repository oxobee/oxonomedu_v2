import { useOrg } from '@components/Contexts/OrgContext'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { getUriWithOrg } from '@services/config/config'
import {
  Books, FolderSimple, ChatsCircle, Headphones, Cube, ShoppingBag,
  ChalkboardSimple, Files, GameController, GraduationCap, Sparkle
} from '@phosphor-icons/react'
import { menuIcon } from '@components/Objects/Menus/menuIcons'
import Link from 'next/link'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { getMenuColorClasses } from '@services/utils/ts/colorUtils'
import useAdminStatus from '@components/Hooks/useAdminStatus'

type Builtin = { feature: string; link: string; labelKey: string; Icon: any }

const BUILTIN: Record<string, Builtin> = {
  pano: { feature: 'pano', link: '/pano', labelKey: 'common.pano', Icon: Sparkle },
  classrooms: { feature: 'classrooms', link: '/dash/classrooms', labelKey: 'common.classrooms', Icon: GraduationCap },
  boards: { feature: 'boards', link: '/boards', labelKey: 'boards.boards', Icon: ChalkboardSimple },
  library: { feature: 'folders', link: '/library', labelKey: 'library.library', Icon: FolderSimple },
  communities: { feature: 'communities', link: '/communities', labelKey: 'communities.title', Icon: ChatsCircle },
  playgrounds: { feature: 'playgrounds', link: '/playgrounds', labelKey: 'common.playgrounds', Icon: Cube },
  podcasts: { feature: 'podcasts', link: '/podcasts', labelKey: 'podcasts.podcasts', Icon: Headphones },
  assignments: { feature: 'assignments', link: '/dash/assignments', labelKey: 'common.assignments', Icon: Files },
  games: { feature: 'games', link: '/games', labelKey: 'common.games', Icon: GameController },
  courses: { feature: 'courses', link: '/courses', labelKey: 'courses.courses', Icon: Books },
  store: { feature: 'payments', link: '/store', labelKey: 'common.store', Icon: ShoppingBag },
}

// Default order for Oxonom Edu (Pano is at the beginning, Games is at the very end)
const DEFAULT_ORDER = ['pano', 'classrooms', 'boards', 'library', 'playgrounds', 'games']

function MenuLinks(props: { orgslug: string; primaryColor?: string }) {
  const { t } = useTranslation()
  const org = useOrg() as any
  const session = useLHSession() as any
  const isAuthenticated = session?.status === 'authenticated' && !!session?.data?.user
  const { isStudent, isTeacher, canManageOrg } = useAdminStatus()
  const email = (session?.data?.user?.email || '').toLowerCase()
  const isTeacherOnly = (isTeacher || email.includes('ogretmen')) && !isStudent && !canManageOrg
  const colors = getMenuColorClasses(props.primaryColor || '')

  const rf = org?.config?.config?.resolved_features
  const isEnabled = (feature: string) => {
    if (feature === 'communities') return false // Topluluk sekmesini gizleyelim
    if (feature === 'pano' && !isTeacherOnly) return false // Pano sadece öğretmen profilinde
    if (feature === 'podcasts') return false
    if (!rf) return true
    if (rf[feature] === undefined) return true
    return rf[feature]?.enabled !== false
  }

  const configItems: any[] | undefined =
    org?.config?.config?.customization?.menu?.items ?? org?.config?.config?.general?.menu?.items

  // Build the items to render (games is always at the very end as requested)
  const source =
    configItems && configItems.length
      ? [...configItems]
          .filter((it) => it.type !== 'yansit')
          .sort((a, b) => {
            if (a.type === 'games') return 1
            if (b.type === 'games') return -1
            return (a.order ?? 0) - (b.order ?? 0)
          })
      : DEFAULT_ORDER.map((type, i) => ({ type, enabled: true, order: i, label: '', url: '' }))

  const rendered = source
    .map((item: any) => {
      if (item.type === 'custom') {
        if (!item.enabled || !item.url) return null
        const external = /^https?:\/\//i.test(item.url)
        return {
          key: `custom-${item.url}`,
          label: item.label || item.url,
          Icon: menuIcon(item.icon),
          href: external ? item.url : getUriWithOrg(props.orgslug, item.url),
          external,
          isSpecialGameTab: false,
        }
      }
      if (item.type === 'courses' || item.type === 'store' || item.type === 'yansit') return null
      if (item.type === 'classrooms') {
        if (!item.enabled) return null
        // Students should not have classrooms menu per policy
        if (isStudent) return null
        return {
          key: 'classrooms',
          label: item.label || t('common.classrooms', { defaultValue: 'Sınıflar' }),
          Icon: GraduationCap,
          href: getUriWithOrg(props.orgslug, '/dash/classrooms'),
          external: false,
          isSpecialGameTab: false,
        }
      }
      if (item.type === 'games') {
        if (!item.enabled) return null
        // Games is strictly auth-guarded like internal menus
        if (!isAuthenticated) return null
        const gamesDisabled = org?.config?.config?.features?.games?.enabled === false
        if (gamesDisabled) return null
        return {
          key: 'games',
          label: item.label || t('common.games', { defaultValue: 'Oyunlar' }),
          Icon: GameController,
          href: getUriWithOrg(props.orgslug, '/games'),
          external: false,
          isSpecialGameTab: true,
        }
      }
      const meta = BUILTIN[item.type]
      if (!meta) return null
      if (!item.enabled) return null
      if (!isEnabled(meta.feature)) return null // plan/feature gating
      return {
        key: item.type,
        label: item.label || t(meta.labelKey),
        Icon: meta.Icon,
        href: getUriWithOrg(props.orgslug, meta.link),
        external: false,
        isSpecialGameTab: false,
      }
    })
    .filter(Boolean) as any[]

  return (
    <div className="ps-1">
      <ul className="flex space-x-4 items-center">
        {rendered.map((it) => {
          const content = it.isSpecialGameTab ? (
            <li className="flex items-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 hover:from-purple-700 hover:via-indigo-700 hover:to-pink-600 rounded-xl shadow-xs hover:shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer ring-1 ring-purple-400/30">
                <it.Icon size={16} weight="fill" className="text-amber-300 animate-bounce" />
                <span className="tracking-wide">{it.label}</span>
                <span className="text-[10px] font-black uppercase bg-white/20 text-white px-1.5 py-0.2 rounded-md">Yeni</span>
              </span>
            </li>
          ) : (
            <li className={`flex space-x-2 items-center ${colors.text} font-semibold transition-colors hover:text-black`}>
              <it.Icon size={20} weight="fill" /> <span>{it.label}</span>
            </li>
          )
          return it.external ? (
            <a key={it.key} href={it.href} target="_blank" rel="noopener noreferrer">{content}</a>
          ) : (
            <Link key={it.key} href={it.href}>{content}</Link>
          )
        })}
      </ul>
    </div>
  )
}

export default MenuLinks
