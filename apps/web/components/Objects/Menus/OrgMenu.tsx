'use client'
import React, { useEffect, useState } from 'react'
import CopilotBubble from '@components/Copilot/CopilotBubble'
import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/keys'
import { getUriWithOrg } from '@services/config/config'
import { fetchRAGChatSessions, RAGChatSession } from '@services/ai/ai'
import { HeaderProfileBox } from '@components/Security/HeaderProfileBox'
import MenuLinks from './OrgMenuLinks'
import MobileMenu from './MobileMenu'
import { getOrgLogoMediaDirectory } from '@services/media/media'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { useOrg } from '@components/Contexts/OrgContext'
import { SearchBar } from '@components/Objects/Search/SearchBar'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import useAdminStatus from '@components/Hooks/useAdminStatus'
import {
  Question,
  Book,
  Globe,
  ChatCircleDots,
  ChatCircle,
  SquaresFour,
  ChalkboardSimple,
  Signpost,
  List,
  X,
  House,
  GraduationCap,
  Student,
  ChalkboardTeacher,
  Receipt,
  Buildings,
  Files,
  FolderSimple,
  ChatsCircle,
  Headphones,
  Cube,
} from '@phosphor-icons/react'
import { DiscordIcon } from '@components/Objects/Icons/DiscordIcon'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu"
import { FeedbackModal } from '@components/Objects/Modals/FeedbackModal'
import { DASHBOARD_MENU_ITEMS, DashboardMenuItem } from '@/lib/dashboard-menu-items'
import { isFeatureAvailable } from '@services/plans/plans'
import { getMenuColorClasses } from '@services/utils/ts/colorUtils'
import AuthenticatedClientElement from '@components/Security/AuthenticatedClientElement'
import { useJoinBannerVisible, JOIN_BANNER_HEIGHT } from '@components/Objects/Banners/OrgJoinBanner'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@components/ui/tooltip'
import { useLHAnalytics, AnalyticsEvent } from '@services/analytics'

export const OrgMenu = (props: any) => {
  const orgslug = props.orgslug
  const session = useLHSession() as any;
  const _access_token = session?.data?.tokens?.access_token;
  const org = useOrg() as any;
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [isFocusMode, setIsFocusMode] = useState(false)
  const pathname = usePathname()
  const { t } = useTranslation()
  const { rights, canManageOrg, isStudent, isTeacher, isAdmin } = useAdminStatus()
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)
  const { isVisible: isJoinBannerVisible } = useJoinBannerVisible()
  const { track } = useLHAnalytics()

  // Copilot bubble state
  const [bubbleOpen, setBubbleOpen] = useState(false)
  const [bubbleSessionToLoad, setBubbleSessionToLoad] = useState<string | null>(null)
  const [isBubbleMode, setIsBubbleMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem('copilot-bubble-mode')
    return stored === 'true'
  })

  const toggleBubbleMode = (value: boolean) => {
    setIsBubbleMode(value)
    localStorage.setItem('copilot-bubble-mode', String(value))
    if (!value) setBubbleOpen(false)
  }

  const openBubbleWithSession = (sessionUuid?: string) => {
    if (sessionUuid) setBubbleSessionToLoad(sessionUuid)
    setBubbleOpen(true)
  }
  const topOffset = isJoinBannerVisible ? JOIN_BANNER_HEIGHT : 0

  // Get primary color from org config (v2: customization.general.color, v1: general.color)
  const config = org?.config?.config
  const primaryColor = config?.customization?.general?.color || config?.general?.color || ''
  const colors = getMenuColorClasses(primaryColor)

  // Bounce animation when a favorite is added
  const [isTrailBouncing, setIsTrailBouncing] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout
    const handleBounce = () => {
      setIsTrailBouncing(false)
      setTimeout(() => {
        setIsTrailBouncing(true)
      }, 10)
      timer = setTimeout(() => {
        setIsTrailBouncing(false)
      }, 1200)
    }

    window.addEventListener('academic-trail-bounce', handleBounce)
    return () => {
      window.removeEventListener('academic-trail-bounce', handleBounce)
      clearTimeout(timer)
    }
  }, [])

  // Filter dashboard menu items by resolved_features from API
  const rf = config?.resolved_features
  const teacherAllowedIds = new Set([
    'home',
    'assignments',
    'library',
    'classrooms',
    'boards',
    'playgrounds',
  ])

  const visibleDashboardItems = DASHBOARD_MENU_ITEMS.filter((item: DashboardMenuItem) => {
    // For teachers (cannot manage org), only show menus permitted for teachers
    if (!canManageOrg && !teacherAllowedIds.has(item.id)) return false
    if (!item.featureKey) return true
    if (rf?.[item.featureKey]) return rf[item.featureKey].enabled
    return isFeatureAvailable(item.featureKey)
  })

  useEffect(() => {
    // Only check focus mode if we're in an activity page
    if (typeof window !== 'undefined' && pathname?.includes('/activity/')) {
      const saved = localStorage.getItem('globalFocusMode');
      setIsFocusMode(saved === 'true');
    } else {
      setIsFocusMode(false);
    }

    // Add storage event listener for cross-window changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'globalFocusMode' && pathname?.includes('/activity/')) {
        setIsFocusMode(e.newValue === 'true');
      }
    };

    // Add custom event listener for same-window changes
    const handleFocusModeChange = (e: CustomEvent) => {
      if (pathname?.includes('/activity/')) {
        setIsFocusMode(e.detail.isFocusMode);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focusModeChange', handleFocusModeChange as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focusModeChange', handleFocusModeChange as EventListener);
    };
  }, [pathname]);

  function toggleMenu() {
    setIsMenuOpen(!isMenuOpen)
  }

  // Only hide menu if we're in an activity page and focus mode is enabled
  if (pathname?.includes('/activity/') && isFocusMode) {
    return null;
  }

  return (
    <>
      <div className="backdrop-blur-lg h-[60px] blur-3xl" style={{ zIndex: 'var(--z-behind)', marginTop: topOffset }}></div>
      <nav
        aria-label="Top navigation"
        className={`backdrop-blur-lg fixed start-0 end-0 h-[60px] ${!primaryColor ? 'bg-white/90 nice-shadow' : ''}`}
        style={{
          zIndex: 'var(--z-nav)',
          backgroundColor: primaryColor || undefined,
          top: topOffset
        }}
      >
        <div className="flex items-center justify-between w-full max-w-(--breakpoint-2xl) mx-auto px-4 sm:px-6 lg:px-8 h-full gap-2">
          {/* LEFT: Brand & Identity */}
          <div className="flex items-center space-x-4 md:space-x-5 shrink-0 min-w-0">
            <div className="logo flex items-center shrink-0">
              <Link href={getUriWithOrg(orgslug, '/')} className="flex items-center gap-2.5 py-1 group select-none min-w-0">
                {org?.logo_image ? (
                  <img
                    src={`${getOrgLogoMediaDirectory(org.org_uuid, org?.logo_image)}`}
                    alt={org?.name || 'Okul Logosu'}
                    className="w-9 h-9 object-contain rounded-xl border border-gray-100 p-0.5 bg-white shadow-xs shrink-0 group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    {org?.name ? org.name.charAt(0).toUpperCase() : 'O'}
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="font-extrabold text-sm sm:text-base tracking-tight text-gray-900 group-hover:text-indigo-600 transition-colors truncate max-w-[150px] sm:max-w-[220px] md:max-w-none leading-snug">
                    {org?.name || 'Oxonom Edu'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium truncate hidden min-[380px]:block leading-none mt-0.5">
                    Eğitim Portalı
                  </span>
                </div>
              </Link>
            </div>
            <div className="hidden md:flex">
              <MenuLinks orgslug={orgslug} primaryColor={primaryColor} />
            </div>
          </div>

          {/* Search Section */}
          <div className="hidden md:flex flex-1 justify-center max-w-lg px-4">
            <SearchBar orgslug={orgslug} className="w-full" primaryColor={primaryColor} />
          </div>

          <div className="flex items-center space-x-2">
            {/* Progress / Trail */}
            <AuthenticatedClientElement checkMethod="authentication">
              <div className="flex">
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        id="nav-academic-trail-btn"
                        data-academic-trail-nav="true"
                        href={getUriWithOrg(orgslug, '/trail')}
                        className={`p-2 rounded-lg transition-all relative ${colors.iconBtn} ${
                          isTrailBouncing
                            ? 'animate-elastic-trail text-amber-500 bg-amber-50 ring-2 ring-amber-400 shadow-md shadow-amber-300/40'
                            : ''
                        }`}
                        aria-label="Akademik Durum & Dersler"
                      >
                        <Signpost
                          size={20}
                          weight="fill"
                          className={`transition-colors ${isTrailBouncing ? 'text-amber-500' : ''}`}
                        />
                        {isTrailBouncing && (
                          <span className="absolute inset-0 rounded-lg bg-amber-400/30 animate-ping pointer-events-none" />
                        )}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      Akademik Durum & Dersler
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </AuthenticatedClientElement>
            {/* Boards */}
            {rf?.boards?.enabled && (
              <AuthenticatedClientElement checkMethod="authentication">
                <div className="hidden md:flex">
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={getUriWithOrg(orgslug, '/boards')}
                          className={`p-2 rounded-lg transition-colors ${colors.iconBtn}`}
                          aria-label={t('common.boards', 'Panolar')}
                        >
                          <ChalkboardSimple size={20} weight="fill" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        {t('common.boards', 'Panolar')}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </AuthenticatedClientElement>
            )}
            {/* AI Copilot */}
            {rf?.ai?.enabled && config?.admin_toggles?.ai?.copilot_enabled !== false && (
              <AuthenticatedClientElement checkMethod="authentication">
                <div className="hidden md:flex">
                  <CopilotMenuButton
                    orgslug={orgslug}
                    iconBtnClass={colors.iconBtn}
                    isBubbleMode={isBubbleMode}
                    onToggleBubbleMode={toggleBubbleMode}
                    bubbleOpen={bubbleOpen}
                    onOpenBubble={openBubbleWithSession}
                  />
                </div>
              </AuthenticatedClientElement>
            )}
            {/* Dashboard Dropdown - Only visible to teachers / staff / admins (NEVER students) */}
            {session?.status === 'authenticated' && !isStudent && (canManageOrg || isTeacher || isAdmin || rights?.dashboard?.action_access) && (
              <div className="hidden md:flex">
                <DropdownMenu>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <button
                            className={`p-2 rounded-lg transition-colors ${colors.iconBtn}`}
                            aria-label={t('common.dashboard')}
                          >
                            <SquaresFour size={20} weight="fill" />
                          </button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        {t('common.dashboard')}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <DropdownMenuContent align="end" className="w-60 p-1.5 shadow-xl rounded-2xl border border-gray-100">
                    <DropdownMenuLabel className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-900 border-b border-gray-100 mb-1">
                      <SquaresFour size={16} weight="fill" className="text-indigo-600" />
                      <span>{canManageOrg ? 'Okul Yönetimi Paneli' : 'Öğretmen Paneli'}</span>
                    </DropdownMenuLabel>
                    {(canManageOrg ? [
                      { id: 'home', href: getUriWithOrg(orgslug, '/dash'), icon: House, label: 'Ana Sayfa' },
                      { id: 'classrooms', href: getUriWithOrg(orgslug, '/dash/classrooms'), icon: GraduationCap, label: 'Sınıflar & Şubeler' },
                      { id: 'students', href: getUriWithOrg(orgslug, '/dash/students'), icon: Student, label: 'Öğrenci İşleri' },
                      { id: 'teachers', href: getUriWithOrg(orgslug, '/dash/teachers'), icon: ChalkboardTeacher, label: 'Öğretmenler' },
                      { id: 'finance', href: getUriWithOrg(orgslug, '/dash/finance'), icon: Receipt, label: 'Finans & Giderler' },
                      { id: 'settings', href: getUriWithOrg(orgslug, '/dash/org/settings/general'), icon: Buildings, label: 'Okul Ayarları' },
                      ...(session?.data?.user?.is_superadmin ? [{ id: 'feedbacks', href: getUriWithOrg(orgslug, '/dash/feedbacks'), icon: ChatCircleDots, label: 'Geri Bildirimler' }] : []),
                    ] : [
                      { id: 'home', href: getUriWithOrg(orgslug, '/dash'), icon: House, label: 'Ana Sayfa' },
                      { id: 'assignments', href: getUriWithOrg(orgslug, '/dash/assignments'), icon: Files, label: 'Ödevler' },
                      { id: 'library', href: getUriWithOrg(orgslug, '/dash/library'), icon: FolderSimple, label: 'Kütüphane' },
                      { id: 'classrooms', href: getUriWithOrg(orgslug, '/dash/classrooms'), icon: GraduationCap, label: 'Sınıflar' },
                      { id: 'boards', href: getUriWithOrg(orgslug, '/dash/boards'), icon: ChalkboardSimple, label: 'Akıllı Tahtalar' },
                      { id: 'playgrounds', href: getUriWithOrg(orgslug, '/dash/playgrounds'), icon: Cube, label: 'Modüller' },
                    ]).map((item) => {
                      const IconComponent = item.icon
                      return (
                        <DropdownMenuItem key={item.id} asChild className="rounded-xl cursor-pointer py-2 px-3 text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 focus:bg-gray-50 transition-colors">
                          <Link
                            href={item.href}
                            className="flex items-center gap-2.5 w-full"
                            onClick={() => track(AnalyticsEvent.DashboardEntered, { source: 'org_menu', item: item.id })}
                          >
                            <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 shrink-0">
                              <IconComponent size={14} weight="fill" />
                            </div>
                            <span>{item.label}</span>
                          </Link>
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}



            <div className="hidden md:flex">
              <HeaderProfileBox primaryColor={primaryColor} />
            </div>
            {/* Mobile Menu Button */}
            <button
              type="button"
              className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-800 transition-all font-bold text-xs shadow-xs border border-gray-200/80 cursor-pointer shrink-0"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? 'Menüyü Kapat' : 'Menüyü Aç'}
            >
              {isMenuOpen ? (
                <X size={18} weight="bold" />
              ) : (
                <List size={18} weight="bold" />
              )}
              <span className="text-xs font-bold text-gray-800 hidden min-[360px]:inline">Menü</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Full-Screen Categorized Mobile Menu */}
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        orgslug={orgslug}
        primaryColor={primaryColor}
        onOpenFeedback={() => setFeedbackModalOpen(true)}
        onOpenCopilot={config?.admin_toggles?.ai?.copilot_enabled !== false ? () => setBubbleOpen(true) : undefined}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        open={feedbackModalOpen}
        onOpenChange={setFeedbackModalOpen}
        theme="light"
        userName={session?.data?.user?.username}
        userEmail={session?.data?.user?.email}
      />

      {/* Copilot floating bubble */}
      {config?.admin_toggles?.ai?.copilot_enabled !== false && isBubbleMode && (
        <CopilotBubble
          orgslug={orgslug}
          open={bubbleOpen}
          onOpenChange={setBubbleOpen}
          sessionToLoad={bubbleSessionToLoad}
        />
      )}
    </>
  )
}

const CopilotMenuButton = ({
  orgslug,
  isBubbleMode,
  onToggleBubbleMode,
  bubbleOpen,
  onOpenBubble,
}: {
  orgslug: string
  iconBtnClass: string
  isBubbleMode: boolean
  onToggleBubbleMode: (_v: boolean) => void
  bubbleOpen: boolean
  onOpenBubble: (_sessionUuid?: string) => void
}) => {
  const session = useLHSession() as any
  const accessToken = session?.data?.tokens?.access_token
  const [isOpen, setIsOpen] = useState(false)

  // Only fetch when the dropdown is open — avoids firing on every page load
  const { data: sessions } = useQuery<RAGChatSession[]>({
    queryKey: queryKeys.ai.ragSessions(orgslug),
    queryFn: () => fetchRAGChatSessions(accessToken, orgslug),
    enabled: isOpen && !!accessToken && !!orgslug,
    staleTime: 60_000,
  })

  const recentSessions = (sessions || []).slice(0, 5)

  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button
                className="relative p-2 rounded-lg transition-colors hover:bg-violet-500/10"
                aria-label="Copilot"
              >
                <ChatCircle size={20} weight="fill" className="text-violet-500" />
                {/* Active indicator dot */}
                {isBubbleMode && bubbleOpen && (
                  <span className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-violet-500 ring-2 ring-white dark:ring-neutral-900" />
                )}
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Copilot
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <ChatCircle size={16} weight="fill" className="text-violet-500" />
          <span>Copilot</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {recentSessions.length > 0 ? (
          <>
            {recentSessions.map((s) => (
              isBubbleMode ? (
                <DropdownMenuItem
                  key={s.aichat_uuid}
                  onSelect={() => onOpenBubble(s.aichat_uuid)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <ChatCircleDots size={14} weight="fill" className="shrink-0 text-neutral-400" />
                  <span className="truncate text-sm">{s.title || 'Untitled'}</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem key={s.aichat_uuid} asChild>
                  <Link href={getUriWithOrg(orgslug, `/copilot?chat=${s.aichat_uuid}`)} className="flex items-center gap-2">
                    <ChatCircleDots size={14} weight="fill" className="shrink-0 text-neutral-400" />
                    <span className="truncate text-sm">{s.title || 'Untitled'}</span>
                  </Link>
                </DropdownMenuItem>
              )
            ))}
            <DropdownMenuSeparator />
          </>
        ) : (
          <div className="px-2 py-3 text-center">
            <p className="text-xs text-neutral-400">No conversations yet</p>
          </div>
        )}

        {/* Primary action */}
        {isBubbleMode ? (
          <DropdownMenuItem
            onSelect={() => onOpenBubble()}
            className="flex items-center gap-2 font-medium cursor-pointer"
          >
            <ChatCircle size={14} weight="fill" className="text-violet-500" />
            <span>{recentSessions.length > 0 ? 'New conversation' : 'Start a conversation'}</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild>
            <Link href={getUriWithOrg(orgslug, '/copilot')} className="flex items-center gap-2 font-medium">
              <ChatCircle size={14} weight="fill" className="text-violet-500" />
              <span>{recentSessions.length > 0 ? 'View all conversations' : 'Start a conversation'}</span>
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Bubble mode toggle */}
        <button
          onClick={() => onToggleBubbleMode(!isBubbleMode)}
          className="w-full flex items-center justify-between px-2 py-2 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group"
        >
          <span className="text-xs text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors">
            Open in bubble
          </span>
          <span
            className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors flex-shrink-0 ${
              isBubbleMode ? 'bg-violet-500' : 'bg-neutral-200 dark:bg-neutral-600'
            }`}
          >
            <span
              className={`inline-block h-3 w-3 rounded-full bg-white shadow-sm transition-transform ${
                isBubbleMode ? 'translate-x-3.5 rtl:-translate-x-3.5' : 'translate-x-0.5 rtl:-translate-x-0.5'
              }`}
            />
          </span>
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const LearnHouseLogo = ({ logoFilter }: { logoFilter: string }) => {
  return (
    <Image
      src="/lrn-text.svg"
      alt="LearnHouse logo"
      width={133}
      height={40}
      style={{ height: 'auto', filter: logoFilter }}
    />
  )
}
