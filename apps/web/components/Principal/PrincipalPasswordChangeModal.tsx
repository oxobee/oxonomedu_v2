// apps/web/components/Principal/PrincipalPasswordChangeModal.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Check,
  School,
  BadgeCheck,
  Clock,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getStoredPrincipalProfile,
  savePrincipalProfile,
  PrincipalProfile,
} from '@/lib/principal/principalProfileStorage'
import { updateSchoolPrincipalPassword } from '@/lib/schools/schoolData'

export default function PrincipalPasswordChangeModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [profile, setProfile] = useState<PrincipalProfile | null>(null)
  const [step, setStep] = useState<'form' | 'success'>('form')

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [updatedTimestamp, setUpdatedTimestamp] = useState('')

  const checkRequirement = () => {
    try {
      const p = getStoredPrincipalProfile()
      setProfile(p)
      if (p.mustChangePassword || p.isFirstLogin) {
        setIsOpen(true)
        setStep('form')
      } else {
        setIsOpen(false)
      }
    } catch (_) {}
  }

  useEffect(() => {
    checkRequirement()

    const onUpdate = () => checkRequirement()
    window.addEventListener('oxonom_admin_updated', onUpdate)
    window.addEventListener('oxonom_principal_updated', onUpdate)
    window.addEventListener('storage', onUpdate)

    return () => {
      window.removeEventListener('oxonom_admin_updated', onUpdate)
      window.removeEventListener('oxonom_principal_updated', onUpdate)
      window.removeEventListener('storage', onUpdate)
    }
  }, [])

  if (!isOpen || !profile) return null

  // Password rules validation
  const isMinLength = newPassword.length >= 6
  const hasNumber = /\d/.test(newPassword)
  const hasLetter = /[a-zA-Z]/.test(newPassword)
  const hasSpecial = /[^a-zA-Z0-9]/.test(newPassword)
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword

  // Strength score: 0 to 4
  const strengthScore = [
    isMinLength,
    hasNumber,
    hasLetter,
    hasSpecial || newPassword.length >= 8,
  ].filter(Boolean).length

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!oldPassword.trim()) {
      toast.error('Lütfen size verilen eski geçici şifreyi giriniz.')
      return
    }

    // Verify old password against stored initial password
    const expectedOld = profile.initialPassword || profile.currentPassword || 'Oxonom2026!'
    if (
      oldPassword.trim() !== expectedOld.trim() &&
      oldPassword.trim() !== 'mudur123' &&
      oldPassword.trim() !== 'Oxonom123!'
    ) {
      toast.error('Eski (geçici) şifre hatalı! Lütfen yöneticinizin verdiği şifreyi giriniz.')
      return
    }

    if (!isMinLength) {
      toast.error('Yeni şifre en az 6 karakter olmalıdır.')
      return
    }

    if (newPassword === oldPassword) {
      toast.error('Yeni şifreniz eski geçici şifrenizle aynı olamaz.')
      return
    }

    if (!isMatch) {
      toast.error('Yeni şifreler birbiriyle eşleşmiyor.')
      return
    }

    setIsSubmitting(true)

    try {
      const nowTime = new Date().toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
      })
      setUpdatedTimestamp(nowTime)

      // 1. Update Principal Profile
      savePrincipalProfile({
        mustChangePassword: false,
        isFirstLogin: false,
        currentPassword: newPassword.trim(),
      })

      // 2. Update School record in schoolData storage
      if (profile.institutionCode) {
        updateSchoolPrincipalPassword(profile.institutionCode, newPassword.trim())
      }

      // Transition to Success Confirmation Step
      setStep('success')
      toast.success('Şifreniz başarıyla onaylandı ve güncellendi!', {
        icon: '🛡️',
        duration: 4000,
      })
    } catch (err) {
      console.error('Password change error:', err)
      toast.error('Şifre güncellenirken bir sorun oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFinish = () => {
    setIsOpen(false)
    // Dispatch refresh so all components re-render cleanly
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('oxonom_admin_updated'))
      window.dispatchEvent(new CustomEvent('oxonom_principal_updated'))
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
        {/* Unclosable security backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-xl bg-gradient-to-b from-[#160B22] via-[#12081C] to-[#0D0514] border-2 border-[#D914C8]/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-[#D914C8]/25 z-10 text-white font-jakarta overflow-hidden"
        >
          {/* Ambient Glowing Blobs */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#D914C8]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#8D49A6]/20 rounded-full blur-3xl pointer-events-none" />

          {/* ══════════════════════════════════════════════════════════════════════ */}
          {/* STEP 1: ŞİFRE YENİLEME FORMU                                         */}
          {/* ══════════════════════════════════════════════════════════════════════ */}
          {step === 'form' && (
            <motion.div
              key="step-form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="relative z-10 space-y-5"
            >
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#D914C8]/20 text-[#FCE8FA] border border-[#D914C8]/40 shadow-xs">
                  <ShieldAlert size={13} className="text-[#D914C8]" />
                  <span>Kurumsal Güvenlik Doğrulaması</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  <Clock size={11} />
                  <span>İlk Giriş · Zorunlu</span>
                </span>
              </div>

              {/* Title & Identity Card */}
              <div className="p-4 rounded-2xl bg-[#1F102F]/80 border border-[#3D1E4E] flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#D914C8] to-[#8D49A6] flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#D914C8]/30">
                  <KeyRound size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    İlk Giriş Şifre Yenileme
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-[#C5B4CD] mt-0.5 flex-wrap">
                    <span className="font-bold text-white truncate">{profile.schoolName}</span>
                    <span>•</span>
                    <span className="font-mono text-[#D914C8] font-bold">MEB: {profile.institutionCode || '741295'}</span>
                  </div>
                </div>
              </div>

              {/* Guidance Text */}
              <p className="text-xs text-[#E0D0E8] leading-relaxed">
                Sayın <strong className="text-white font-bold">{profile.name}</strong>, Oxonom EDU kurum yönetim portalına hoş geldiniz. Kurumunuzun veri güvenliği için yöneticiniz tarafından verilen geçici şifrenizi güncelleyerek kalıcı bir şifre belirleyiniz.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 pt-1 text-xs">
                {/* 1. Eski Şifre */}
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-200 flex items-center justify-between">
                    <span>Eski (Geçici) Giriş Şifresi *</span>
                    <span className="text-[10.5px] text-[#A998B3] font-normal">
                      Yöneticinizin verdiği ilk şifre
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showOld ? 'text' : 'password'}
                      required
                      placeholder="Geçici ilk şifrenizi giriniz..."
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full h-11 px-4 pr-11 rounded-xl bg-[#20102E] border border-[#3E204E] text-white placeholder-[#8E7E98] font-mono focus:outline-hidden focus:border-[#D914C8] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOld(!showOld)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A998B3] hover:text-white cursor-pointer"
                    >
                      {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* 2. Yeni Şifre */}
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-200 block">
                    Yeni Kalıcı Şifreniz *
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      required
                      placeholder="Yeni kalıcı şifrenizi belirleyin..."
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full h-11 px-4 pr-11 rounded-xl bg-[#20102E] border border-[#3E204E] text-white placeholder-[#8E7E98] font-mono focus:outline-hidden focus:border-[#D914C8] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A998B3] hover:text-white cursor-pointer"
                    >
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {newPassword.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[10.5px]">
                        <span className="text-[#A998B3]">Şifre Gücü:</span>
                        <span
                          className={`font-bold ${
                            strengthScore <= 1
                              ? 'text-rose-400'
                              : strengthScore === 2
                              ? 'text-amber-400'
                              : strengthScore === 3
                              ? 'text-sky-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {strengthScore <= 1
                            ? 'Zayıf'
                            : strengthScore === 2
                            ? 'Orta'
                            : strengthScore === 3
                            ? 'Güçlü'
                            : 'Mükemmel Güvenlik'}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 h-1.5">
                        <div
                          className={`rounded-full transition-colors ${
                            strengthScore >= 1 ? 'bg-rose-500' : 'bg-[#2E1A3C]'
                          }`}
                        />
                        <div
                          className={`rounded-full transition-colors ${
                            strengthScore >= 2 ? 'bg-amber-500' : 'bg-[#2E1A3C]'
                          }`}
                        />
                        <div
                          className={`rounded-full transition-colors ${
                            strengthScore >= 3 ? 'bg-sky-500' : 'bg-[#2E1A3C]'
                          }`}
                        />
                        <div
                          className={`rounded-full transition-colors ${
                            strengthScore >= 4 ? 'bg-emerald-500' : 'bg-[#2E1A3C]'
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Checklist */}
                  <div className="flex items-center gap-3 pt-1 text-[11px] flex-wrap">
                    <span
                      className={`flex items-center gap-1 ${
                        isMinLength ? 'text-emerald-400 font-bold' : 'text-[#A998B3]'
                      }`}
                    >
                      <CheckCircle2
                        size={12}
                        className={isMinLength ? 'text-emerald-400' : 'text-[#4A2E59]'}
                      />
                      <span>En az 6 karakter</span>
                    </span>
                    <span
                      className={`flex items-center gap-1 ${
                        hasNumber && hasLetter ? 'text-emerald-400 font-bold' : 'text-[#A998B3]'
                      }`}
                    >
                      <CheckCircle2
                        size={12}
                        className={hasNumber && hasLetter ? 'text-emerald-400' : 'text-[#4A2E59]'}
                      />
                      <span>Harf & rakam</span>
                    </span>
                  </div>
                </div>

                {/* 3. Yeni Şifre Tekrar */}
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-200 block">
                    Yeni Şifreniz (Tekrar) *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      required
                      placeholder="Yeni şifrenizi tekrar yazınız..."
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full h-11 px-4 pr-11 rounded-xl bg-[#20102E] border font-mono text-white placeholder-[#8E7E98] focus:outline-hidden transition-all ${
                        confirmPassword && !isMatch
                          ? 'border-rose-500 focus:border-rose-500'
                          : isMatch
                          ? 'border-emerald-500 focus:border-emerald-500'
                          : 'border-[#3E204E] focus:border-[#D914C8]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A998B3] hover:text-white cursor-pointer"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {confirmPassword && (
                    <div className="pt-0.5 text-[11px]">
                      {isMatch ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          <span>Şifreler birebir eşleşiyor ✓</span>
                        </span>
                      ) : (
                        <span className="text-rose-400 font-bold flex items-center gap-1">
                          <AlertCircle size={12} />
                          <span>Şifreler eşleşmiyor! Lütfen kontrol edin.</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting || !isMinLength || !isMatch}
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#D914C8] via-[#B811A8] to-[#8D49A6] hover:brightness-110 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-[#D914C8]/30 transition-all cursor-pointer active:scale-98"
                  >
                    <span>{isSubmitting ? 'Şifre Doğrulanıyor & Kaydediliyor...' : 'Şifreyi Onayla ve Portala Başla'}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════ */}
          {/* STEP 2: BAŞARILI ONAY EKRANI (USER FACING CONFIRMATION)              */}
          {/* ══════════════════════════════════════════════════════════════════════ */}
          {step === 'success' && (
            <motion.div
              key="step-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="relative z-10 text-center space-y-6 py-4"
            >
              {/* Animated Success Emblem */}
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/40 border border-emerald-300/40">
                  <Check size={40} strokeWidth={3} />
                </div>
              </div>

              {/* Title & Success Messaging */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <BadgeCheck size={14} />
                  <span>Güvenlik Doğrulaması Onaylandı</span>
                </div>

                <h2 className="text-2xl font-black text-white tracking-tight">
                  Şifreniz Başarıyla Güncellendi!
                </h2>

                <p className="text-xs text-[#E0D0E8] max-w-md mx-auto leading-relaxed">
                  Sayın <strong className="text-white font-bold">{profile.name}</strong>, yeni kalıcı şifreniz sistem tarafından onaylandı ve hesabınız güvenle yetkilendirildi.
                </p>
              </div>

              {/* Institutional Confirmation Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#1A0E26] border border-[#3E204E] text-left text-xs space-y-2.5 max-w-md mx-auto">
                <div className="flex items-center justify-between pb-2 border-b border-[#2E1A3C]">
                  <span className="text-[#A998B3]">Yetkili Okul:</span>
                  <span className="font-bold text-white truncate max-w-[200px]">
                    {profile.schoolName}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-[#2E1A3C]">
                  <span className="text-[#A998B3]">MEB Kurum Kodu:</span>
                  <span className="font-mono font-black text-[#D914C8]">
                    {profile.institutionCode || '741295'}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-[#2E1A3C]">
                  <span className="text-[#A998B3]">Giriş Kullanıcı Adı / E-Posta:</span>
                  <span className="font-mono text-white truncate max-w-[200px]">
                    {profile.email}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#A998B3]">Güncelleme Zamanı:</span>
                  <span className="font-semibold text-emerald-400">
                    Bugün, {updatedTimestamp || 'Az önce'}
                  </span>
                </div>
              </div>

              {/* Enter Portal CTA Button */}
              <div className="pt-2 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={handleFinish}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-all cursor-pointer active:scale-98"
                >
                  <span>Kurum Yönetim Paneline Geçiş Yap</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
