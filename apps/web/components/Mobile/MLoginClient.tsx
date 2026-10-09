'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  QrCode,
  ShieldCheck,
  Check,
  Monitor,
  BookOpen,
  Sparkles,
  X,
  Rocket,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { useAuth } from '@components/Contexts/AuthContext'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import toast, { Toaster } from 'react-hot-toast'

interface MLoginClientProps {
  org?: any
  orgslug?: string
}

export default function MLoginClient({ org, orgslug }: MLoginClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn } = useAuth()
  const session = useLHSession() as any

  // Form states
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [focusedField, setFocusedField] = useState<'identifier' | 'password' | null>(null)

  // Cute QR modal state
  const [isQRPopupOpen, setIsQRPopupOpen] = useState(false)

  // Pre-fill if already known or redirect if already authenticated
  useEffect(() => {
    if (session?.status === 'authenticated') {
      const next = searchParams.get('next') || searchParams.get('redirect') || '/dashv2'
      router.replace(next)
    }
  }, [session, router, searchParams])

  // Quick fill helper for testing/convenience
  const handleFillDemoTeacher = () => {
    setIdentifier('ogretmen@oxonom.com')
    setPassword('Ugur2803*')
    toast.success('Öğretmen demo bilgileri dolduruldu!', {
      icon: '⚡',
      duration: 2500,
    })
  }

  // Handle Form Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const rawIdent = identifier.trim()
    if (!rawIdent) {
      toast.error('Lütfen e-posta veya kullanıcı adınızı giriniz.')
      return
    }
    if (!password) {
      toast.error('Lütfen şifrenizi giriniz.')
      return
    }

    setIsSubmitting(true)

    try {
      const next = searchParams.get('next') || searchParams.get('redirect') || '/dashv2'
      const activeOrgSlug = orgslug || org?.slug || 'neclagorer'

      const res = await signIn('credentials', {
        redirect: false,
        email: rawIdent,
        password: password,
        orgSlug: activeOrgSlug,
        callbackUrl: next,
      })

      if (res && !res.ok) {
        let errorMsg = 'E-posta veya şifre hatalı. Lütfen kontrol ediniz.'
        try {
          const parsed = JSON.parse(res.error || '{}')
          if (parsed.message) errorMsg = parsed.message
        } catch (_) {}
        toast.error(errorMsg)
        setIsSubmitting(false)
        return
      }

      toast.success('Giriş başarılı! Yönlendiriliyorsunuz...', {
        icon: '👋',
      })

      // Short delay for smooth feedback then navigate
      setTimeout(() => {
        window.location.href = next
      }, 500)
    } catch (err: any) {
      console.error('Mobile login error:', err)
      toast.error('Giriş yapılırken bir sorun oluştu. Lütfen tekrar deneyiniz.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[100dvh] w-full bg-[#05070B] flex justify-center items-start selection:bg-[#34D399]/30">
      <Toaster position="top-center" />

      {/* ── MOBILE CONTAINER (MATCHING Login.dc.html EXACTLY) ── */}
      <div
        className="w-full max-w-[430px] min-h-[100dvh] flex flex-col justify-between relative overflow-hidden font-jakarta text-white shadow-2xl"
        style={{
          backgroundColor: '#0A0D15',
          backgroundImage: `
            radial-gradient(circle at 94% 7%, transparent 0 70px, rgba(52,211,153,.34) 70px 71.5px, transparent 71.5px 118px, rgba(52,211,153,.24) 118px 119.5px, transparent 119.5px 172px, rgba(52,211,153,.16) 172px 173.5px, transparent 173.5px 232px, rgba(52,211,153,.10) 232px 233.5px, transparent 233.5px),
            radial-gradient(circle at 100% 0%, rgba(52,211,153,.32) 0%, rgba(52,211,153,0) 48%),
            radial-gradient(circle at 0% 45%, rgba(99,102,241,.24) 0%, rgba(99,102,241,0) 55%),
            linear-gradient(45deg, rgba(255,255,255,.05) 1px, transparent 1px),
            linear-gradient(-45deg, rgba(255,255,255,.05) 1px, transparent 1px)
          `,
          backgroundSize: 'auto, auto, auto, 26px 26px, 26px 26px',
        }}
      >
        {/* ── 1. HEADER (BRAND LOGO) ── */}
        <header className="px-5 pt-6 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#34D399] flex items-center justify-center text-[#0A0D15] font-black text-base shadow-sm">
              O
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[17px] tracking-tight leading-none text-white">
                OXONOM <span className="text-[#34D399]">EDU</span>
              </span>
              <span className="text-[10px] text-gray-400 font-medium tracking-wide">
                Öğretmen Çalışma Alanı
              </span>
            </div>
          </div>

          {/* Quick Demo Pill */}
          <button
            type="button"
            onClick={handleFillDemoTeacher}
            className="text-[11px] font-bold text-[#34D399] bg-[#34D399]/10 hover:bg-[#34D399]/20 border border-[#34D399]/30 px-2.5 py-1 rounded-full transition-all flex items-center gap-1 active:scale-95"
            title="Demo öğretmen bilgilerini tek tıkla doldur"
          >
            <Sparkles size={12} className="text-[#34D399]" />
            <span>Demo Doldur</span>
          </button>
        </header>

        {/* ── 2. HERO SECTION ── */}
        <section className="px-5 pt-6 sm:pt-8 flex flex-col gap-3.5">
          {/* Eyebrow Pill */}
          <div className="flex items-center gap-2.5 text-[11px] font-bold tracking-[0.14em] text-[#34D399]">
            <span className="w-[26px] h-[3px] rounded-full bg-[#34D399]"></span>
            ÖĞRETMEN GİRİŞİ
          </div>

          {/* Headline */}
          <h1 className="text-[34px] sm:text-[36px] font-extrabold leading-[1.1] tracking-[-0.03em] text-white m-0">
            Sınıfınızı
            <br />
            <span className="bg-gradient-to-r from-[#34D399] to-[#5EEAD4] bg-clip-text text-transparent">
              akıllı tahtadan
            </span>
            <br />
            yönetin.
          </h1>

          {/* Subtitle */}
          <p className="text-[14px] leading-relaxed text-[#B4BDCC] max-w-[300px] m-0">
            Yoklama, ödev ve interaktif ders sunumları tek bir uygulamada.
          </p>

          {/* Feature Badges */}
          <div className="flex flex-wrap gap-2 mt-1">
            <span className="inline-flex items-center gap-1.5 h-[34px] px-3.5 rounded-[17px] bg-white/[0.08] border border-white/[0.18] text-[12px] font-bold text-[#E2E8F0] backdrop-blur-xs">
              <Check size={14} strokeWidth={2.4} className="text-[#34D399]" />
              Yoklama
            </span>

            <span className="inline-flex items-center gap-1.5 h-[34px] px-3.5 rounded-[17px] bg-white/[0.08] border border-white/[0.18] text-[12px] font-bold text-[#E2E8F0] backdrop-blur-xs">
              <Monitor size={14} strokeWidth={2.2} className="text-[#34D399]" />
              Akıllı Tahta
            </span>

            <span className="inline-flex items-center gap-1.5 h-[34px] px-3.5 rounded-[17px] bg-white/[0.08] border border-white/[0.18] text-[12px] font-bold text-[#E2E8F0] backdrop-blur-xs">
              <BookOpen size={14} strokeWidth={2.2} className="text-[#34D399]" />
              Ödevler
            </span>
          </div>
        </section>

        {/* Flexible Spacer */}
        <div className="flex-1 min-h-6"></div>

        {/* ── 3. BOTTOM SHEET LOGIN FORM (WHITE CARD WITH TOP RADIUS 36PX) ── */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          aria-label="Giriş formu"
          className="bg-white rounded-t-[36px] px-5 pt-3.5 pb-6 flex flex-col gap-4 shadow-[0_-24px_60px_rgba(0,0,0,0.5)] text-[#0F172A]"
        >
          {/* Grab Handle */}
          <div className="w-11 h-[5px] rounded-full bg-[#E1E6EE] self-center"></div>

          {/* Form Header */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[24px] font-extrabold tracking-[-0.02em] text-[#0F172A] m-0">
                Giriş Yap
              </h2>
              <p className="text-[13px] text-[#5B6577] mt-1 mb-0 font-medium">
                Hesabınıza erişmek için bilgilerinizi girin.
              </p>
            </div>

            <span
              aria-hidden="true"
              className="w-[46px] h-[46px] rounded-[15px] bg-[#0A0D15] text-[#34D399] flex items-center justify-center shrink-0 shadow-[0_8px_18px_rgba(10,13,21,0.25)]"
            >
              <ShieldCheck size={24} strokeWidth={2.2} />
            </span>
          </div>

          {/* Login Form Fields */}
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3.5">
            {/* Input: E-posta veya kullanıcı adı */}
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-bold text-[#0F172A]">
                E-posta veya kullanıcı adı
              </span>
              <div
                className={`flex items-center gap-2.5 min-h-[54px] px-3.5 rounded-[18px] transition-all ${
                  focusedField === 'identifier'
                    ? 'bg-white border-[1.5px] border-[#34D399] shadow-[0_0_0_4px_rgba(52,211,153,0.18)]'
                    : 'bg-[#F6F8FC] border border-[#E1E6EE]'
                }`}
              >
                <span className="text-[#0F766E] flex items-center justify-center shrink-0">
                  <Mail size={19} strokeWidth={2} />
                </span>
                <input
                  type="text"
                  aria-label="E-posta veya kullanıcı adı"
                  placeholder="ornek@okul.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  onFocus={() => setFocusedField('identifier')}
                  onBlur={() => setFocusedField(null)}
                  autoComplete="username"
                  required
                  className="flex-1 min-w-0 border-0 outline-none bg-transparent text-[14px] font-medium text-[#0F172A] placeholder:text-[#94A3B8]"
                />
              </div>
            </label>

            {/* Input: Şifre */}
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-bold text-[#0F172A]">Şifre</span>
              <div
                className={`flex items-center gap-2.5 min-h-[54px] px-3.5 rounded-[18px] transition-all ${
                  focusedField === 'password'
                    ? 'bg-white border-[1.5px] border-[#34D399] shadow-[0_0_0_4px_rgba(52,211,153,0.18)]'
                    : 'bg-[#F6F8FC] border border-[#E1E6EE]'
                }`}
              >
                <span className="text-[#5B6577] flex items-center justify-center shrink-0">
                  <Lock size={19} strokeWidth={2} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  aria-label="Şifre"
                  placeholder="Şifrenizi girin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  autoComplete="current-password"
                  required
                  className="flex-1 min-w-0 border-0 outline-none bg-transparent text-[14px] font-medium text-[#0F172A] placeholder:text-[#94A3B8]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  className="text-[#5B6577] hover:text-[#0F172A] p-1 flex items-center justify-center transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </label>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <label className="flex items-center gap-2 text-[13px] font-semibold text-[#334155] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 accent-[#0F766E] cursor-pointer"
                />
                <span>Beni hatırla</span>
              </label>

              <Link
                href="/forgot"
                className="text-[13px] font-bold text-[#4338CA] hover:text-[#3730A3] transition-colors"
              >
                Şifremi unuttum
              </Link>
            </div>

            {/* Primary Submit Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="h-[56px] sm:h-[58px] rounded-[19px] bg-gradient-to-r from-[#34D399] to-[#2DD4BF] hover:from-[#2fe0a0] hover:to-[#26c4b0] text-[#0A0D15] text-[15px] font-black flex items-center justify-center gap-2 shadow-[0_14px_28px_rgba(52,211,153,0.40)] active:shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin text-[#0A0D15]" />
                  <span>Giriş Yapılıyor...</span>
                </span>
              ) : (
                <>
                  <span>Giriş Yap</span>
                  <ArrowRight size={18} strokeWidth={2.6} />
                </>
              )}
            </motion.button>
          </form>

          {/* VEYA Divider */}
          <div className="flex items-center gap-3 text-[11px] font-bold tracking-[0.08em] text-[#5B6577] my-0.5">
            <span className="flex-1 h-[1px] bg-[#E1E6EE]"></span>
            VEYA
            <span className="flex-1 h-[1px] bg-[#E1E6EE]"></span>
          </div>

          {/* Secondary Button: QR Kod ile Giriş Yap */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setIsQRPopupOpen(true)}
            className="h-[52px] sm:h-[54px] rounded-[19px] border border-[#E1E6EE] bg-[#F6F8FC] hover:bg-[#EEF2F7] text-[#0F172A] text-[13px] font-extrabold flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-2xs group"
          >
            <QrCode
              size={19}
              className="text-[#0F766E] group-hover:scale-110 transition-transform"
            />
            <span>QR Kod ile Giriş Yap</span>
          </motion.button>

          {/* Footer Note */}
          <div className="text-center text-[11px] text-[#5B6577] font-medium pt-1">
            Oxonom EDU v2.0 · Mobil ve Web Çalışma Alanı
          </div>
        </motion.section>
      </div>

      {/* ── 4. SEVİMLİ VE MODERN "ÇOK YAKINDA" QR MODAL POPUP ── */}
      <AnimatePresence>
        {isQRPopupOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsQRPopupOpen(false)}
              className="absolute inset-0 bg-[#0A0D15]/80 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 25 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 320 }}
              className="relative w-full max-w-[340px] bg-white rounded-[32px] p-6 text-center shadow-2xl border border-emerald-100 flex flex-col items-center gap-4 z-10 overflow-hidden"
            >
              {/* Close X Button */}
              <button
                type="button"
                onClick={() => setIsQRPopupOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Kapat"
              >
                <X size={16} />
              </button>

              {/* Decorative Glow Circle */}
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-300/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-teal-300/20 rounded-full blur-2xl pointer-events-none" />

              {/* Cute Animated Floating Badge */}
              <motion.div
                animate={{
                  y: [0, -6, 0],
                  rotate: [0, -3, 3, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  ease: 'easeInOut',
                }}
                className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-100 via-teal-50 to-amber-50 border-2 border-emerald-200/80 flex items-center justify-center shadow-lg shadow-emerald-500/15 relative"
              >
                <div className="text-3xl select-none">🚀</div>
                <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#34D399] text-[#0A0D15] flex items-center justify-center text-xs shadow-sm">
                  ✨
                </div>
              </motion.div>

              {/* Pill Tag */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-[11px] font-black tracking-wider uppercase">
                <Sparkles size={12} className="text-emerald-600" />
                Çok Yakında
              </span>

              {/* Heading & Copy */}
              <div className="space-y-1.5">
                <h3 className="text-[20px] font-black text-gray-900 tracking-tight leading-snug">
                  QR Kod ile Hızlı Giriş
                  <br />
                  <span className="text-[#059669]">Çok Yakında Sizlerle!</span> 🎉
                </h3>
                <p className="text-[13px] text-gray-600 leading-relaxed font-medium px-1">
                  Akıllı tahtanızdaki QR kodu okutarak şifresiz, tek saniyede oturum açma özelliği
                  laboratuvarda tamamlanmak üzere.
                </p>
              </div>

              {/* Cute Tip Box */}
              <div className="w-full bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 text-left flex items-start gap-2.5">
                <span className="text-base select-none mt-0.5">💡</span>
                <p className="text-[12px] text-emerald-950 font-medium leading-normal">
                  Şimdilik e-posta veya kullanıcı adınızla güvenle giriş yapabilirsiniz.
                </p>
              </div>

              {/* Dismiss Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => setIsQRPopupOpen(false)}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#34D399] to-[#2DD4BF] text-[#0A0D15] font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-400/25 cursor-pointer transition-all"
              >
                <span>Harika, Anladım! 👍</span>
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
