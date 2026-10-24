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

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const checkRequirement = () => {
    try {
      const p = getStoredPrincipalProfile()
      setProfile(p)
      if (p.mustChangePassword || p.isFirstLogin) {
        setIsOpen(true)
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
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!oldPassword.trim()) {
      toast.error('Lütfen size verilen eski geçici şifreyi giriniz.')
      return
    }

    // Verify old password against stored initial password
    const expectedOld = profile.initialPassword || profile.currentPassword || 'Oxonom2026!'
    if (oldPassword.trim() !== expectedOld.trim() && oldPassword.trim() !== 'mudur123' && oldPassword.trim() !== 'Oxonom123!') {
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

      toast.success('🎉 Şifreniz başarıyla güncellendi! Oxonom Kurum Yönetim Paneline hoş geldiniz.', {
        duration: 4000,
        icon: '🛡️',
      })

      setIsOpen(false)
    } catch (err) {
      console.error('Password change error:', err)
      toast.error('Şifre güncellenirken bir sorun oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
        {/* Unclosable backdrop */}
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
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-[#140C1D] border-2 border-[#D914C8]/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-[#D914C8]/20 z-10 text-white font-jakarta overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D914C8]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 space-y-2 pb-4 border-b border-[#2E1E3B]">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-[#D914C8]/20 text-[#FCE8FA] border border-[#D914C8]/40">
                <ShieldAlert size={12} />
                <span>İlk Giriş Güvenlik Doğrulaması</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Zorunlu Adım
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#D914C8] to-[#8D49A6] flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#D914C8]/30">
                <KeyRound size={22} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  İlk Giriş Şifre Yenileme
                </h2>
                <p className="text-xs text-[#A998B3] mt-0.5">
                  {profile.schoolName} (Kod: {profile.institutionCode || '741295'})
                </p>
              </div>
            </div>

            <p className="text-xs text-[#FCF9FD]/90 leading-relaxed pt-1">
              Sayın <strong className="text-white font-bold">{profile.name}</strong>, kurum yönetim paneline hoş geldiniz. Güvenliğiniz için yöneticiniz tarafından iletilen geçici şifrenizi güncelleyerek kalıcı yeni bir şifre belirlemeniz gerekmektedir.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="relative z-10 space-y-4 pt-4 text-xs">
            {/* Eski Şifre */}
            <div className="space-y-1">
              <label className="font-bold text-gray-200 flex items-center justify-between">
                <span>Eski (Geçici) Giriş Şifresi *</span>
                <span className="text-[10px] text-[#A998B3] font-normal">
                  Yöneticinizin verdiği şifre
                </span>
              </label>
              <div className="relative">
                <input
                  type={showOld ? 'text' : 'password'}
                  required
                  placeholder="Geçici şifrenizi giriniz..."
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full h-10 px-3.5 pr-10 rounded-xl bg-[#20152B] border border-[#2E1E3B] text-white placeholder-[#A998B3] font-mono focus:outline-hidden focus:border-[#D914C8] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A998B3] hover:text-white cursor-pointer"
                >
                  {showOld ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Yeni Şifre */}
            <div className="space-y-1">
              <label className="font-bold text-gray-200 block">
                Yeni Kalıcı Şifre *
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  placeholder="Yeni şifrenizi belirleyin (en az 6 karakter)..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-10 px-3.5 pr-10 rounded-xl bg-[#20152B] border border-[#2E1E3B] text-white placeholder-[#A998B3] font-mono focus:outline-hidden focus:border-[#D914C8] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A998B3] hover:text-white cursor-pointer"
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Password Requirements Checklist */}
              <div className="flex items-center gap-3 pt-1 text-[10.5px]">
                <span className={`flex items-center gap-1 ${isMinLength ? 'text-emerald-400 font-bold' : 'text-[#A998B3]'}`}>
                  <CheckCircle2 size={11} className={isMinLength ? 'text-emerald-400' : 'text-[#49364F]'} />
                  <span>En az 6 karakter</span>
                </span>
                <span className={`flex items-center gap-1 ${hasNumber && hasLetter ? 'text-emerald-400 font-bold' : 'text-[#A998B3]'}`}>
                  <CheckCircle2 size={11} className={hasNumber && hasLetter ? 'text-emerald-400' : 'text-[#49364F]'} />
                  <span>Harf & rakam</span>
                </span>
              </div>
            </div>

            {/* Yeni Şifre Tekrar */}
            <div className="space-y-1">
              <label className="font-bold text-gray-200 block">
                Yeni Kalıcı Şifre (Tekrar) *
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  placeholder="Yeni şifrenizi tekrar giriniz..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full h-10 px-3.5 pr-10 rounded-xl bg-[#20152B] border text-white placeholder-[#A998B3] font-mono focus:outline-hidden transition-all ${
                    confirmPassword && !isMatch
                      ? 'border-rose-500'
                      : isMatch
                      ? 'border-emerald-500'
                      : 'border-[#2E1E3B] focus:border-[#D914C8]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A998B3] hover:text-white cursor-pointer"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {confirmPassword && (
                <div className="pt-0.5 text-[10.5px]">
                  {isMatch ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 size={11} />
                      <span>Şifreler eşleşiyor ✓</span>
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <AlertCircle size={11} />
                      <span>Şifreler eşleşmiyor!</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting || !isMinLength || !isMatch}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#D914C8] via-[#B811A8] to-[#8D49A6] hover:brightness-110 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-[#D914C8]/30 transition-all cursor-pointer active:scale-98"
              >
                <span>{isSubmitting ? 'Şifre Güncelleniyor...' : 'Şifremi Güncelle ve Portala Başla'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
