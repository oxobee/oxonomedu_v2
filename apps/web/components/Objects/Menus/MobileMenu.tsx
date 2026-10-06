'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import {
  Signpost,
  ChalkboardSimple,
  ChatsCircle,
  Headphones,
  FolderSimple,
  SquaresFour,
  ChatCircleDots,
  SignOut,
  X,
  Sparkle,
  GraduationCap,
  Files,
  ArrowRight,
  User,
  ShieldCheck,
  Crown,
  MagnifyingGlass,
  Question,
  GameController,
} from '@phosphor-icons/react'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { useOrg } from '@components/Contexts/OrgContext'
import useAdminStatus from '@components/Hooks/useAdminStatus'
import { getUriWithOrg } from '@services/config/config'
import { getOrgLogoMediaDirectory } from '@services/media/media'
import UserAvatar from '@components/Objects/UserAvatar'
import { signOut } from '@components/Contexts/AuthContext'
import { SearchBar } from '@components/Objects/Search/SearchBar'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  orgslug: string
  primaryColor?: string
  onOpenFeedback?: () => void
  onOpenCopilot?: () => void
}

export default function MobileMenu({
  isOpen,
  onClose,
  orgslug,
  primaryColor = '',
  onOpenFeedback,
  onOpenCopilot,
}: MobileMenuProps) {
  const { t } = useTranslation()
  const pathname = usePathname()
  const session = useLHSession() as any
  const org = useOrg() as any
  const { canManageOrg, isAdmin, userRoles, isStudent, isTeacher } = useAdminStatus()

  const isAuthenticated = session?.status === 'authenticated'
  const user = session?.data?.user

  // Close menu on route change
  useEffect(() => {
    if (isOpen) {
      onClose()
    }
  }, [pathname])

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        document.body.style.overflow = ''
        window.removeEventListener('keydown', handleKeyDown)
      }
    } else {
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Role detection
  const roleTitle = canManageOrg
    ? 'Okul Yöneticisi'
    : isTeacher
    ? 'Öğretmen'
    : 'Öğrenci'

  const roleBadgeColor = canManageOrg
    ? 'bg-purple-100 text-purple-800 border-purple-200'
    : isTeacher
    ? 'bg-amber-100 text-amber-800 border-amber-200'
    : 'bg-emerald-100 text-emerald-800 border-emerald-200'

  const logoUrl = org?.logo_image
    ? getOrgLogoMediaDirectory(org.org_uuid, org.logo_image)
    : null

  const handleLogout = async () => {
    onClose()
    await signOut({ callbackUrl: getUriWithOrg(orgslug, '/') })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mobil Ana Menü"
      className="fixed inset-0 z-[99999] bg-white flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
    >
      {/* 1. TOP HEADER */}
      <div className="shrink-0 px-5 py-4 border-b border-gray-100 bg-white/95 backdrop-blur-md flex items-center justify-between gap-3 shadow-xs">
        <Link
          href={getUriWithOrg(orgslug, '/')}
          onClick={onClose}
          className="flex items-center gap-3 min-w-0"
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={org?.name || 'Okul Logosu'}
              className="w-10 h-10 object-contain rounded-xl border border-gray-100 p-0.5 bg-white shadow-xs shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
              {org?.name ? org.name.charAt(0) : 'O'}
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-gray-900 truncate tracking-tight">
              {org?.name || 'Oxonom Eğitim Portalı'}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${roleBadgeColor}`}
              >
                {roleTitle}
              </span>
              <span className="text-[11px] text-gray-400">&bull; Mobil Menü</span>
            </div>
          </div>
        </Link>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Menüyü Kapat"
          className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 transition-all cursor-pointer shrink-0"
        >
          <X size={20} weight="bold" />
        </button>
      </div>

      {/* 2. SEARCH BAR */}
      <div className="shrink-0 px-5 pt-3.5 pb-2 bg-gray-50/70 border-b border-gray-100">
        <SearchBar orgslug={orgslug} isMobile={true} className="w-full" />
      </div>

      {/* 3. SCROLLABLE CATEGORIZED NAVIGATION */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 space-y-6 overscroll-contain">
        {/* KATEGORİ 1: EĞİTİM & AKADEMİK PORTAL */}
        <div>
          <div className="flex items-center gap-2 mb-2.5 px-1">
            <span className="p-1 rounded-md bg-indigo-50 text-indigo-700">
              <GraduationCap size={15} weight="fill" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
              Akademik & Dersler
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {/* 1.1 Akademik Durum & Çalışma Portalı */}
            <Link
              href={getUriWithOrg(orgslug, '/trail')}
              onClick={onClose}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-purple-50/60 to-white border border-indigo-100/90 shadow-xs hover:border-indigo-300 active:scale-[0.99] transition-all group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Signpost size={20} weight="fill" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-indigo-700 transition-colors truncate">
                      Akademik Durum & Dersler
                    </h3>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-600 text-white tracking-wider">
                      Portal
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    Kayıtlı sınıflarım, ödevlerim ve favori panolarım
                  </p>
                </div>
              </div>
              <ArrowRight
                size={16}
                weight="bold"
                className="text-indigo-400 group-hover:text-indigo-700 group-hover:translate-x-1 transition-all shrink-0 ml-2"
              />
            </Link>

            {/* 1.2 Akıllı Tahta & Ders Panoları */}
            <Link
              href={getUriWithOrg(orgslug, '/boards')}
              onClick={onClose}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-gray-200/90 shadow-xs hover:border-emerald-300 active:scale-[0.99] transition-all group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <ChalkboardSimple size={20} weight="fill" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors truncate">
                    Akıllı Tahta & Ders Panoları
                  </h3>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    Ders anlatımları, interaktif tahta ve ders çizimleri
                  </p>
                </div>
              </div>
              <ArrowRight
                size={16}
                weight="bold"
                className="text-gray-300 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all shrink-0 ml-2"
              />
            </Link>

            {/* 1.3 Ev Ödevleri */}
            <Link
              href={getUriWithOrg(orgslug, isTeacher ? '/dash/assignments' : '/trail')}
              onClick={onClose}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-gray-200/90 shadow-xs hover:border-amber-300 active:scale-[0.99] transition-all group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Files size={20} weight="fill" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-amber-700 transition-colors truncate">
                    Sınıf Ev Ödevleri & Görevler
                  </h3>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    İnteraktif tahta, test ve çalışma kağıdı teslimleri
                  </p>
                </div>
              </div>
              <ArrowRight
                size={16}
                weight="bold"
                className="text-gray-300 group-hover:text-amber-700 group-hover:translate-x-1 transition-all shrink-0 ml-2"
              />
            </Link>

            {/* 1.4 Ders Materyalleri & Kitaplık */}
            <Link
              href={getUriWithOrg(orgslug, '/library')}
              onClick={onClose}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-gray-200/90 shadow-xs hover:border-blue-300 active:scale-[0.99] transition-all group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/80 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FolderSimple size={20} weight="fill" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                    Ders Kaynakları & Kitaplık
                  </h3>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    Ders notları, PDF dokümanları ve çalışma kağıtları
                  </p>
                </div>
              </div>
              <ArrowRight
                size={16}
                weight="bold"
                className="text-gray-300 group-hover:text-blue-700 group-hover:translate-x-1 transition-all shrink-0 ml-2"
              />
            </Link>

            {/* 1.5 Eğitici Oyunlar */}
            {isAuthenticated && org?.config?.config?.features?.games?.enabled !== false && (
              <Link
                href={getUriWithOrg(orgslug, '/games')}
                onClick={onClose}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-gray-200/90 shadow-xs hover:border-amber-300 active:scale-[0.99] transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/80 shadow-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <GameController size={20} weight="fill" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-amber-700 transition-colors truncate">
                      Eğitici Oyunlar
                    </h3>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      Zeka, matematik, fen ve kelime oyunları
                    </p>
                  </div>
                </div>
                <ArrowRight
                  size={16}
                  weight="bold"
                  className="text-gray-300 group-hover:text-amber-700 group-hover:translate-x-1 transition-all shrink-0 ml-2"
                />
              </Link>
            )}
          </div>
        </div>

        {/* KATEGORİ 2: OKUL & SINIF İLETİŞİMİ */}
        <div>
          <div className="flex items-center gap-2 mb-2.5 px-1">
            <span className="p-1 rounded-md bg-teal-50 text-teal-700">
              <ChatsCircle size={15} weight="fill" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-900">
              Sınıfım & İletişim
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {/* 2.1 Sınıflar & Şubeler */}
            <Link
              href={getUriWithOrg(orgslug, isTeacher ? '/dash/classrooms' : '/trail')}
              onClick={onClose}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-gray-200/90 shadow-xs hover:border-teal-300 active:scale-[0.99] transition-all group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/80 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <GraduationCap size={20} weight="fill" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-teal-700 transition-colors truncate">
                    {isTeacher ? 'Sınıf Yönetimi & Şubeler' : 'Kayıtlı Sınıfım & Şubem'}
                  </h3>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {isTeacher
                      ? 'Yoklama, katılım kodları ve sınıf listesi'
                      : 'Sınıf panoları, duyurular ve katılım kodum'}
                  </p>
                </div>
              </div>
              <ArrowRight
                size={16}
                weight="bold"
                className="text-gray-300 group-hover:text-teal-700 group-hover:translate-x-1 transition-all shrink-0 ml-2"
              />
            </Link>

            {/* Topluluk - Geçici Olarak Gizlendi */}
          </div>
        </div>

        {/* KATEGORİ 3: YÖNETİM & HIZLI ARAÇLAR */}
        <div>
          <div className="flex items-center gap-2 mb-2.5 px-1">
            <span className="p-1 rounded-md bg-slate-100 text-slate-700">
              <Sparkle size={15} weight="fill" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Hızlı Araçlar
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {/* 3.1 Öğretmen / Yönetici Paneli */}
            {!isStudent && (isTeacher || canManageOrg || isAdmin) && (
              <Link
                href={getUriWithOrg(orgslug, '/dash')}
                onClick={onClose}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 text-white shadow-md active:scale-[0.99] transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/20">
                    <SquaresFour size={20} weight="fill" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-white truncate">
                        {canManageOrg ? 'Okul Yönetim Masası' : 'Öğretmen Paneli'}
                      </h3>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/20 text-white uppercase tracking-wider">
                        Yönetim
                      </span>
                    </div>
                    <p className="text-xs text-white/70 truncate mt-0.5">
                      Ödev denetimi, sınıf yoklamaları ve yönetim araçları
                    </p>
                  </div>
                </div>
                <ArrowRight
                  size={16}
                  weight="bold"
                  className="text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0 ml-2"
                />
              </Link>
            )}

            {/* 3.2 AI Eğitim Asistanı (Copilot) */}
            {onOpenCopilot && org?.config?.config?.admin_toggles?.ai?.copilot_enabled !== false && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onOpenCopilot()
                }}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-gray-200/90 shadow-xs hover:border-violet-300 active:scale-[0.99] transition-all group text-start w-full cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-700 border border-violet-200/80 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <ChatCircleDots size={20} weight="fill" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-violet-700 transition-colors truncate">
                      AI Eğitim Asistanı
                    </h3>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      Ders konuları ve formüllerde yapay zeka desteği
                    </p>
                  </div>
                </div>
                <ArrowRight
                  size={16}
                  weight="bold"
                  className="text-gray-300 group-hover:text-violet-700 group-hover:translate-x-1 transition-all shrink-0 ml-2"
                />
              </button>
            )}


          </div>
        </div>
      </div>

      {/* 4. BOTTOM PROFILE & ACCOUNT FOOTER */}
      <div className="shrink-0 p-4 bg-white border-t border-gray-200/90 shadow-xl">
        {isAuthenticated && user ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <UserAvatar
                use_with_session={true}
                width={42}
                rounded="rounded-xl"
                username={user.username}
              />
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-gray-900 truncate">
                  {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.username}
                </h4>
                <p className="text-[11px] text-gray-400 truncate">{user.email || user.username}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Çıkış Yap"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <SignOut size={16} weight="bold" />
              <span>Çıkış Yap</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href={getUriWithOrg(orgslug, '/login')}
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold text-center transition-all shadow-xs"
            >
              Giriş Yap
            </Link>
            <Link
              href={getUriWithOrg(orgslug, '/signup')}
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs font-bold text-center transition-all"
            >
              Kayıt Ol
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
