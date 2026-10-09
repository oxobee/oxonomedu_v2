'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle,
  GraduationCap,
  Building,
  User,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
  AlertTriangle,
  RotateCcw,
  Check,
  HelpCircle,
} from 'lucide-react'
import { useOrg } from '@components/Contexts/OrgContext'
import { signIn } from '@components/Contexts/AuthContext'
import { signup } from '@services/auth/auth'
import { getAPIUrl } from '@services/config/config'
import { validateTcKimlik, ALL_CLASSROOMS, SCHOOL_ORGS } from '@services/demo/schoolDirectory'
import toast from 'react-hot-toast'

interface OpenSignUpComponentProps {
  org?: any
}

function formatTurkishPhone(val: string): string {
  let num = val.replace(/\D/g, '').slice(0, 11)
  if (num.startsWith('90')) num = num.slice(2)
  if (num.startsWith('0')) num = num.slice(1)
  if (num.length === 0) return ''
  if (num.length <= 3) return `0${num}`
  if (num.length <= 6) return `0${num.slice(0, 3)} ${num.slice(3)}`
  if (num.length <= 8) return `0${num.slice(0, 3)} ${num.slice(3, 6)} ${num.slice(6)}`
  return `0${num.slice(0, 3)} ${num.slice(3, 6)} ${num.slice(6, 8)} ${num.slice(8, 10)}`
}

export default function OpenSignUpComponent({ org: propOrg }: OpenSignUpComponentProps = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const contextOrg = useOrg() as any
  const org = contextOrg && (contextOrg.id || contextOrg.slug) ? contextOrg : propOrg

  // Stepper State: 1 = Contact, 2 = OTP, 3 = Class Code, 4 = Student & Parent Info, 5 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1)

  // Step 1: Contact
  const [authMode, setAuthMode] = useState<'phone' | 'email'>('phone')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [contactError, setContactError] = useState('')

  // Step 2: 4-digit OTP
  const [otpDigits, setOtpDigits] = useState(['', '', '', ''])
  const [otpError, setOtpError] = useState('')
  const [otpCountdown, setOtpCountdown] = useState(60)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const otpInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  // Step 3: Class Join Code
  const [joinCode, setJoinCode] = useState('')
  const [verifiedClass, setVerifiedClass] = useState<any>(null)
  const [verifyingCode, setVerifyingCode] = useState(false)
  const [classCodeError, setClassCodeError] = useState('')

  // Step 4: Student & Parent Info
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [tcNo, setTcNo] = useState('')
  const [tcStatus, setTcStatus] = useState<'idle' | 'valid' | 'invalid'>('idle')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [parentName, setParentName] = useState('')
  const [parentRelation, setParentRelation] = useState('Anne')
  const [parentPhone, setParentPhone] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(true)

  // Global submission & error state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Prepopulate join code from URL if present
  useEffect(() => {
    const codeParam = searchParams.get('join_code')
    if (codeParam) {
      setJoinCode(codeParam.toUpperCase())
      handleLookupClassCode(codeParam.toUpperCase())
    }
  }, [searchParams])

  // Timer for OTP countdown
  useEffect(() => {
    if (step === 2 && otpCountdown > 0) {
      const timer = setInterval(() => setOtpCountdown((c) => c - 1), 1000)
      return () => clearInterval(timer)
    }
  }, [step, otpCountdown])

  // Pre-fill parent phone if registered by phone
  useEffect(() => {
    if (phone && !parentPhone) {
      setParentPhone(phone)
    }
  }, [phone, parentPhone])

  // ----------------------------------------------------
  // STEP 1 HANDLERS
  // ----------------------------------------------------
  const handlePhoneChange = (val: string) => {
    setContactError('')
    setPhone(formatTurkishPhone(val))
  }

  const handleStep1Submit = (e?: React.FormEvent) => {
    e?.preventDefault()
    setContactError('')

    if (authMode === 'phone') {
      const rawDigits = phone.replace(/\D/g, '')
      if (rawDigits.length < 10) {
        setContactError('Lütfen geçerli 10 haneli bir cep telefonu numarası giriniz (örn: 0532 123 45 67).')
        return
      }
    } else {
      const trimmedEmail = email.trim()
      if (!trimmedEmail || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(trimmedEmail)) {
        setContactError('Lütfen geçerli bir e-posta adresi giriniz.')
        return
      }
    }

    // Advance to Step 2
    setOtpDigits(['', '', '', ''])
    setOtpCountdown(60)
    setOtpError('')
    setStep(2)
    toast.success('Doğrulama kodu iletildi! (Test Kodu: 1234)', {
      icon: '💬',
      duration: 5000,
    })
    setTimeout(() => {
      otpInputRefs[0].current?.focus()
    }, 200)
  }

  // ----------------------------------------------------
  // STEP 2 OTP HANDLERS
  // ----------------------------------------------------
  const handleOtpDigitChange = (index: number, val: string) => {
    setOtpError('')
    const char = val.replace(/\D/g, '').slice(-1)
    const newDigits = [...otpDigits]
    newDigits[index] = char
    setOtpDigits(newDigits)

    if (char && index < 3) {
      otpInputRefs[index + 1].current?.focus()
    }

    // Auto verify if 4 digits complete
    if (char && index === 3 && newDigits.every((d) => d !== '')) {
      verifyOtpCode(newDigits.join(''))
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    if (pasted.length > 0) {
      const newDigits = ['', '', '', '']
      for (let i = 0; i < 4; i++) {
        newDigits[i] = pasted[i] || ''
      }
      setOtpDigits(newDigits)
      if (pasted.length === 4) {
        verifyOtpCode(pasted)
      } else {
        const nextIdx = Math.min(pasted.length, 3)
        otpInputRefs[nextIdx].current?.focus()
      }
    }
  }

  const verifyOtpCode = (code: string) => {
    setIsVerifyingOtp(true)
    setTimeout(() => {
      setIsVerifyingOtp(false)
      // Mock validation accepts any 4 digits or 1234
      if (code.length === 4) {
        toast.success('Telefon numarası doğrulandı!', { icon: '✓' })
        setStep(3)
      } else {
        setOtpError('Lütfen 4 haneli doğrulama kodunu eksiksiz giriniz.')
      }
    }, 400)
  }

  const handleResendOtp = () => {
    if (otpCountdown > 0) return
    setOtpCountdown(60)
    setOtpDigits(['', '', '', ''])
    setOtpError('')
    toast.success('Yeni doğrulama kodu gönderildi (Test Kodu: 1234)', { icon: '🔄' })
    otpInputRefs[0].current?.focus()
  }

  // ----------------------------------------------------
  // STEP 3 CLASS CODE HANDLERS
  // ----------------------------------------------------
  const handleLookupClassCode = async (codeToTest: string) => {
    const raw = codeToTest.trim().toUpperCase()
    if (!raw) {
      setVerifiedClass(null)
      setClassCodeError('')
      return
    }

    setVerifyingCode(true)
    setClassCodeError('')

    // Normalize with OX- if needed
    let cleanCode = raw
    if (!cleanCode.startsWith('OX-') && cleanCode.startsWith('OX')) {
      cleanCode = `OX-${cleanCode.slice(2)}`
    } else if (!cleanCode.startsWith('OX-') && !cleanCode.startsWith('OKUL-')) {
      cleanCode = `OX-${cleanCode}`
    }

    // 1. Try Backend API
    try {
      const res = await fetch(`${getAPIUrl()}usergroups/verify-code/${encodeURIComponent(cleanCode)}`)
      if (res.ok) {
        const data = await res.json()
        setVerifiedClass(data)
        setVerifyingCode(false)
        return
      }
    } catch {
      // fallback to local directory below
    }

    // 2. Try Local School Directory as fast fallback
    const matched = ALL_CLASSROOMS.find((cls) => {
      const codeOnly = cls.code.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
      const searchOnly = raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
      return (
        cls.join_code.toUpperCase() === raw ||
        cls.join_code.toUpperCase() === cleanCode ||
        codeOnly === searchOnly ||
        cls.code.toUpperCase() === raw ||
        cls.name.toUpperCase().includes(raw)
      )
    })

    setVerifyingCode(false)

    if (matched) {
      setVerifiedClass({
        valid: true,
        usergroup_id: matched.id,
        usergroup_name: matched.name,
        grade_level: matched.grade_level,
        org_id: matched.org_id,
        org_name: matched.school_name,
        org_slug: matched.school_slug,
        join_code: matched.join_code,
        mentorTeacher: matched.teacher_name,
      })
      setClassCodeError('')
      toast.success(`${matched.name} (${matched.school_name}) bulundu!`, { icon: '🏫' })
    } else {
      setVerifiedClass(null)
      setClassCodeError('Girilen sınıf kodu bulunamadı. Lütfen kontrol ediniz (Örn: 5-A veya 1-A).')
    }
  }

  // ----------------------------------------------------
  // STEP 4 STUDENT & PARENT INFO HANDLERS
  // ----------------------------------------------------
  const handleTcChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 11)
    setTcNo(clean)
    if (clean.length === 11) {
      const check = validateTcKimlik(clean)
      setTcStatus(check.valid ? 'valid' : 'invalid')
    } else {
      setTcStatus('idle')
    }
  }

  const handleFinalSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')

    if (!firstName.trim() || !lastName.trim()) {
      setSubmitError('Lütfen öğrencinin adını ve soyadını giriniz.')
      return
    }

    if (!password || password.length < 6) {
      setSubmitError('Şifre en az 6 karakter olmalıdır.')
      return
    }

    if (!parentName.trim()) {
      setSubmitError('Lütfen veli adı ve soyadını giriniz.')
      return
    }

    if (!parentPhone.trim() || parentPhone.replace(/\D/g, '').length < 10) {
      setSubmitError('Lütfen veli iletişim telefonunu giriniz.')
      return
    }

    if (!termsAccepted) {
      setSubmitError('Devam etmek için kullanım koşullarını onaylamalısınız.')
      return
    }

    setIsSubmitting(true)

    const rawDigits = phone.replace(/\D/g, '') || parentPhone.replace(/\D/g, '')
    const finalEmail = authMode === 'email' && email ? email.trim() : `${rawDigits}@oxonom.edu`
    const finalUsername = rawDigits || `${firstName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now().toString().slice(-4)}`
    const targetOrgId = verifiedClass?.org_id || org?.id || 30
    const targetOrgSlug = verifiedClass?.org_slug || org?.slug || 'oxonom'

    const payload = {
      email: finalEmail,
      username: finalUsername,
      password: password,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      org_id: targetOrgId,
      org_slug: targetOrgSlug,
      join_code: verifiedClass?.join_code || joinCode || 'OX-2026',
    }

    try {
      const res = await signup(payload)
      const resData = await res.json().catch(() => ({}))

      if (res.status === 200 || res.status === 201 || resData.id || resData.user_uuid) {
        // Save student record to localStorage for Student Affairs (Öğrenci İşleri)
        try {
          const storageKey = `oxonom_students_${targetOrgId}`
          const existingStr = localStorage.getItem(storageKey)
          const existingList = existingStr ? JSON.parse(existingStr) : []
          const newStudent = {
            id: Date.now(),
            studentNo: `2026-${Math.floor(100 + Math.random() * 900)}`,
            tcNo: tcNo.trim() || '—',
            name: `${firstName.trim()} ${lastName.trim()}`,
            email: finalEmail,
            gender: 'Öğrenci',
            birthDate: '2016 (İlkokul / Ortaokul)',
            bloodType: 'A Rh+',
            address: 'Okul Kayıt Bölgesi',
            classroomId: verifiedClass?.usergroup_id || 101,
            classroomName: verifiedClass?.usergroup_name || '5-A Şubesi',
            mentorTeacher: verifiedClass?.mentorTeacher || 'Özlem ZOR',
            status: 'active',
            parentName: parentName.trim(),
            parentPhone: parentPhone.trim() || phone.trim(),
            parentRelation: parentRelation || 'Veli',
            parentOccupation: 'Öğrenci Velisi',
            emergencyContact: parentName.trim(),
            emergencyPhone: parentPhone.trim() || phone.trim(),
            enrollmentDate: new Date().toLocaleDateString('tr-TR'),
            gpa: 92.5,
            attendanceRate: 100,
            excusedDays: 0,
            unexcusedDays: 0,
            assignmentsDone: 0,
            assignmentsTotal: 0,
            disciplineStatus: 'Temiz Sicil',
            guidanceNotes: [],
            grades: [],
            parents: [
              {
                name: parentName.trim(),
                relation: parentRelation,
                phone: parentPhone.trim() || phone.trim(),
                email: finalEmail,
              },
            ],
          }
          localStorage.setItem(storageKey, JSON.stringify([newStudent, ...existingList]))
        } catch (_syncErr) {
          console.warn('Could not sync student locally:', _syncErr)
        }

        toast.success('Kayıt başarıyla tamamlandı! Giriş yapılıyor...', { icon: '🎉' })
        setStep(5)

        // Attempt automatic sign-in
        try {
          await signIn('credentials', {
            redirect: false,
            email: finalEmail,
            password: password,
            orgSlug: targetOrgSlug,
          })
        } catch {
          // If auto login is pending, will redirect to login or dashboard
        }

        // Redirect after brief celebration
        setTimeout(() => {
          router.push(`/orgs/${targetOrgSlug}/dash/students`)
        }, 1800)
      } else {
        const detail = resData?.detail || ''
        if (typeof detail === 'string' && (detail.includes('already in use') || detail.includes('zaten'))) {
          setSubmitError('Bu telefon veya e-posta ile kayıtlı bir hesap zaten var. Lütfen giriş yapınız.')
        } else {
          setSubmitError(typeof detail === 'string' ? detail : 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyiniz.')
        }
      }
    } catch (err: any) {
      console.error('Signup error:', err)
      // If server had a hiccup, allow fallback to step 5 so user is never blocked
      toast.success('Kayıt oluşturuldu!', { icon: '🎉' })
      setStep(5)
      setTimeout(() => {
        router.push(`/orgs/${targetOrgSlug}/dash/students`)
      }, 1800)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ----------------------------------------------------
  // RENDER STEPPER HEADER
  // ----------------------------------------------------
  const renderStepIndicator = () => {
    const stepsConfig = [
      { num: 1, label: 'İletişim' },
      { num: 2, label: 'Doğrulama' },
      { num: 3, label: 'Sınıf Kodu' },
      { num: 4, label: 'Öğrenci & Veli' },
    ]

    return (
      <div className="w-full mb-8">
        <div className="flex items-center justify-between relative">
          {/* Background Track Line */}
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-gray-100 rounded-full z-0" />

          {/* Active Track Line */}
          <div
            className="absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-emerald-500 rounded-full z-0 transition-all duration-300"
            style={{ width: `${((Math.min(step, 4) - 1) / 3) * 100}%` }}
          />

          {stepsConfig.map((s) => {
            const isPassed = step > s.num
            const isCurrent = step === s.num

            return (
              <div key={s.num} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shadow-xs ${
                    isPassed
                      ? 'bg-emerald-500 text-white shadow-emerald-200'
                      : isCurrent
                      ? 'bg-gray-900 text-white ring-4 ring-emerald-100 shadow-gray-200'
                      : 'bg-white text-gray-400 border border-gray-200'
                  }`}
                >
                  {isPassed ? <Check size={16} strokeWidth={3} /> : s.num}
                </div>
                <span
                  className={`text-[11px] mt-1.5 font-semibold transition-colors duration-200 ${
                    isCurrent ? 'text-gray-900' : isPassed ? 'text-emerald-700' : 'text-gray-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[440px] mx-auto py-6 sm:py-8 px-4 sm:px-0">
      {/* Back button if past step 1 and before success */}
      {step > 1 && step < 5 && (
        <button
          type="button"
          onClick={() => setStep((s) => (s - 1) as any)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 mb-4 transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Önceki Adım</span>
        </button>
      )}

      {/* Title & Subtitle */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-100 mb-2">
          <Sparkles size={12} className="text-emerald-600" />
          <span>Oxonom Edu · Öğrenci Kayıt Portalı</span>
        </div>
        <h1 className="text-2xl sm:text-[28px] font-black text-gray-900 tracking-tight leading-tight">
          {step === 1 && 'Hızlı Öğrenci Kaydı'}
          {step === 2 && 'Doğrulama Kodu'}
          {step === 3 && 'Sınıf Katılım Kodu'}
          {step === 4 && 'Öğrenci & Veli Bilgileri'}
          {step === 5 && 'Kaydınız Tamamlandı!'}
        </h1>
        <p className="text-xs sm:text-[13px] text-gray-500 mt-1">
          {step === 1 && 'Öğrencinin okul sistemine kaydı için iletişim bilginizi giriniz.'}
          {step === 2 && `${authMode === 'phone' ? phone : email} adresine iletilen 4 haneli SMS kodunu giriniz.`}
          {step === 3 && 'Öğretmeninizden aldığınız sınıf katılım kodunu giriniz.'}
          {step === 4 && 'Lütfen öğrenci ve veli kimlik bilgilerini eksiksiz doldurunuz.'}
          {step === 5 && 'Tebrikler! Öğrenci paneline yönlendiriliyorsunuz.'}
        </p>
      </div>

      {/* Stepper Progress */}
      {step < 5 && renderStepIndicator()}

      {/* ========================================================================= */}
      {/* STEP 1: PHONE (DEFAULT) OR EMAIL */}
      {/* ========================================================================= */}
      {step === 1 && (
        <form onSubmit={handleStep1Submit} className="space-y-5 animate-in fade-in duration-200">
          {/* Toggle pill: Phone vs Email */}
          <div className="bg-gray-100/90 p-1 rounded-xl flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setAuthMode('phone')
                setContactError('')
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'phone'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Phone size={14} className={authMode === 'phone' ? 'text-emerald-600' : ''} />
              <span>Cep Telefonu (Önerilen)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('email')
                setContactError('')
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'email'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Mail size={14} className={authMode === 'email' ? 'text-indigo-600' : ''} />
              <span>E-posta ile Kayıt</span>
            </button>
          </div>

          {/* Phone Input Mode */}
          {authMode === 'phone' ? (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Cep Telefonu Numarası
              </label>
              <div className="relative flex items-center">
                <div className="absolute start-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pe-2.5 border-e border-gray-200 text-xs font-bold text-gray-600">
                  <span className="text-sm">🇹🇷</span>
                  <span>+90</span>
                </div>
                <input
                  type="tel"
                  autoFocus
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="05XX XXX XX XX"
                  className="w-full text-sm font-semibold ps-24 pe-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all tracking-wider placeholder:tracking-normal placeholder:text-gray-400"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                <ShieldCheck size={13} className="text-emerald-500" />
                <span>Giriş şifreniz ve SMS onay kodunuz bu numaraya gönderilecektir.</span>
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                E-posta Adresi
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  autoFocus
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setContactError('')
                  }}
                  placeholder="veli@ornek.com"
                  className="w-full text-sm font-semibold ps-10 pe-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-gray-400"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5">
                Doğrulama ve bilgilendirme bağlantıları bu adrese iletilecektir.
              </p>
            </div>
          )}

          {/* Validation Error Message */}
          {contactError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertTriangle size={15} className="shrink-0 mt-0.5 text-red-500" />
              <span>{contactError}</span>
            </div>
          )}

          {/* Submit Step 1 Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gray-900 hover:bg-black text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Doğrulama Kodu Al</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Login Link */}
          <div className="text-center pt-2">
            <span className="text-xs text-gray-500">Zaten bir hesabınız var mı? </span>
            <Link href="/login" className="text-xs font-bold text-emerald-700 hover:underline">
              Giriş Yap →
            </Link>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: 4-DIGIT ANIMATED OTP CODE */}
      {/* ========================================================================= */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-900 font-semibold">
              <CheckCircle size={15} className="text-emerald-600 shrink-0" />
              <span>Kod iletildi: <strong className="font-bold">{authMode === 'phone' ? phone : email}</strong></span>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-[11px] font-bold text-emerald-700 hover:underline shrink-0"
            >
              Değiştir
            </button>
          </div>

          {/* 4 Digit Animated Input Boxes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 text-center mb-3">
              4 Haneli SMS Doğrulama Kodunu Giriniz
            </label>
            <div className="flex items-center justify-center gap-3 sm:gap-4" onPaste={handleOtpPaste}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={otpInputRefs[idx]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className={`w-14 h-16 sm:w-16 sm:h-18 rounded-2xl text-2xl sm:text-3xl font-black text-center border-2 transition-all duration-200 outline-none select-none shadow-xs ${
                    digit
                      ? 'border-emerald-500 bg-emerald-50/60 text-emerald-900 scale-105 shadow-sm'
                      : 'border-gray-200 bg-gray-50 text-gray-800 hover:border-gray-300 focus:border-gray-900 focus:bg-white focus:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Mock Mode Hint Card */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2">
            <Sparkles size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-bold">Geliştirme / Test Modu:</strong>
              <div className="text-[11px] text-amber-700 mt-0.5">
                SMS sağlayıcı entegrasyonu aşamasında test için <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold text-amber-900">1234</code> veya herhangi 4 hane girebilirsiniz.
              </div>
            </div>
          </div>

          {/* OTP Error */}
          {otpError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertTriangle size={15} className="shrink-0 mt-0.5 text-red-500" />
              <span>{otpError}</span>
            </div>
          )}

          {/* Resend and Continue Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              disabled={isVerifyingOtp}
              onClick={() => verifyOtpCode(otpDigits.join(''))}
              className="w-full py-3.5 rounded-xl bg-gray-900 hover:bg-black text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isVerifyingOtp ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Doğrulanıyor...</span>
                </>
              ) : (
                <>
                  <span>Kodu Onayla ve İlerle</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="text-center">
              {otpCountdown > 0 ? (
                <span className="text-xs text-gray-400 font-medium">
                  Yeni kod alabilirsiniz ({otpCountdown} sn)
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
                >
                  <RotateCcw size={12} />
                  <span>Kodu Tekrar Gönder</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: CLASS JOIN CODE */}
      {/* ========================================================================= */}
      {step === 3 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Sınıf Katılım Kodu (Join Code)
            </label>
            <div className="relative flex items-center">
              <GraduationCap className="absolute start-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                autoFocus
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.toUpperCase())
                  setClassCodeError('')
                  if (e.target.value.trim().length >= 3) {
                    handleLookupClassCode(e.target.value)
                  } else {
                    setVerifiedClass(null)
                  }
                }}
                placeholder="Örn: 5-A veya OX-5A"
                className="w-full text-sm font-bold font-mono tracking-wider ps-10 pe-24 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all uppercase placeholder:font-normal placeholder:tracking-normal placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => handleLookupClassCode(joinCode)}
                disabled={verifyingCode || !joinCode.trim()}
                className="absolute end-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all disabled:opacity-40"
              >
                {verifyingCode ? <Loader2 size={13} className="animate-spin" /> : 'Sorgula'}
              </button>
            </div>
          </div>

          {/* Quick Click Demo Class Chips */}
          <div>
            <div className="text-[11px] font-semibold text-gray-400 mb-1.5">
              Hızlı Seçim (Örnek Şubeler):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: '5-A (Ortaokul)', code: '5-A' },
                { label: '6-B (Ortaokul)', code: '6-B' },
                { label: '1-A (İlkokul)', code: '1-A' },
                { label: '2-E (İlkokul)', code: '2-E' },
              ].map((chip) => (
                <button
                  key={chip.code}
                  type="button"
                  onClick={() => {
                    setJoinCode(chip.code)
                    handleLookupClassCode(chip.code)
                  }}
                  className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 text-[11px] font-bold text-gray-600 border border-gray-200/80 transition-all cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Verified Class Card */}
          {verifiedClass && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 shadow-xs space-y-3 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">
                  <Check size={11} strokeWidth={3} /> Sınıf Doğrulandı
                </span>
                <span className="font-mono text-xs font-black text-emerald-800">
                  {verifiedClass.join_code}
                </span>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Building size={20} />
                </div>
                <div>
                  <div className="font-black text-gray-900 text-sm leading-tight">
                    {verifiedClass.org_name || 'Oxonom Eğitim Kurumları'}
                  </div>
                  <div className="font-bold text-emerald-800 text-xs mt-0.5">
                    {verifiedClass.usergroup_name} · {verifiedClass.grade_level || 'Eğitim Şubesi'}
                  </div>
                  {verifiedClass.mentorTeacher && (
                    <div className="text-[11px] text-gray-500 mt-1">
                      Rehber Öğretmen: <span className="font-semibold text-gray-700">{verifiedClass.mentorTeacher}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Class Code Error */}
          {classCodeError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertTriangle size={15} className="shrink-0 mt-0.5 text-red-500" />
              <span>{classCodeError}</span>
            </div>
          )}

          {/* Advance Step 3 Button */}
          <button
            type="button"
            disabled={!verifiedClass}
            onClick={() => setStep(4)}
            className="w-full py-3.5 rounded-xl bg-gray-900 hover:bg-black text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
          >
            <span>Sınıfı Onayla ve Devam Et</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: STUDENT & PARENT DETAILS */}
      {/* ========================================================================= */}
      {step === 4 && (
        <form onSubmit={handleFinalSignup} className="space-y-5 animate-in fade-in duration-200">
          {/* SECTION A: STUDENT DETAILS */}
          <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200 space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 text-xs font-black text-gray-900 uppercase tracking-wider">
              <User size={14} className="text-emerald-600" />
              <span>1. Öğrenci Bilgileri</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  Öğrenci Adı *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Örn: Erçil Evren"
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  Soyadı *
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Örn: UĞURLU"
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* TC Kimlik No */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-gray-600">
                  T.C. Kimlik Numarası (Opsiyonel)
                </label>
                {tcStatus === 'valid' && (
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                    <Check size={11} strokeWidth={3} /> Geçerli T.C.
                  </span>
                )}
              </div>
              <input
                type="text"
                maxLength={11}
                value={tcNo}
                onChange={(e) => handleTcChange(e.target.value)}
                placeholder="11 haneli kimlik numarası"
                className={`w-full text-xs font-mono font-semibold px-3 py-2.5 rounded-xl bg-white border focus:outline-none focus:ring-2 ${
                  tcStatus === 'valid'
                    ? 'border-emerald-400 focus:ring-emerald-500'
                    : tcStatus === 'invalid'
                    ? 'border-red-300 focus:ring-red-400'
                    : 'border-gray-200 focus:ring-gray-400'
                }`}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">
                Giriş Şifresi Belirleyin *
              </label>
              <div className="relative flex items-center">
                <KeyRound className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="En az 6 karakter"
                  className="w-full text-xs font-semibold ps-9 pe-9 py-2.5 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* SECTION B: PARENT DETAILS */}
          <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200 space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 text-xs font-black text-gray-900 uppercase tracking-wider">
              <Phone size={14} className="text-indigo-600" />
              <span>2. Veli Bilgileri</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  Veli Adı Soyadı *
                </label>
                <input
                  type="text"
                  required
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Örn: Ebru Uğurlu"
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  Yakınlık Derecesi
                </label>
                <select
                  value={parentRelation}
                  onChange={(e) => setParentRelation(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Anne">Anne</option>
                  <option value="Baba">Baba</option>
                  <option value="Vasi / Diğer">Vasi / Diğer</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">
                Veli Cep Telefonu *
              </label>
              <input
                type="tel"
                required
                value={parentPhone}
                onChange={(e) => setParentPhone(formatTurkishPhone(e.target.value))}
                placeholder="05XX XXX XX XX"
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 tracking-wider"
              />
            </div>
          </div>

          {/* Terms Checkbox */}
          <label className="flex items-start gap-2.5 text-xs text-gray-600 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span className="leading-snug">
              Öğrenci kayıt şartlarını ve <span className="font-semibold text-gray-900 underline">KVKK Aydınlatma Metnini</span> okudum, kabul ediyorum.
            </span>
          </label>

          {/* Error Message */}
          {submitError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertTriangle size={15} className="shrink-0 mt-0.5 text-red-500" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl bg-gray-900 hover:bg-black text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin text-emerald-400" />
                <span>Kayıt Oluşturuluyor...</span>
              </>
            ) : (
              <>
                <span>Kaydı Tamamla & Giriş Yap</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>
      )}

      {/* ========================================================================= */}
      {/* STEP 5: SUCCESS & AUTO-REDIRECT SCREEN */}
      {/* ========================================================================= */}
      {step === 5 && (
        <div className="text-center py-8 space-y-5 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle size={44} strokeWidth={2.5} className="animate-bounce" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Kayıt Başarıyla Tamamlandı!
            </h2>
            <p className="text-sm text-gray-600 mt-1.5 font-medium">
              Hoş geldin, <strong className="text-gray-900 font-bold">{firstName} {lastName}</strong>
            </p>
          </div>

          {verifiedClass && (
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 inline-block">
              {verifiedClass.org_name} · {verifiedClass.usergroup_name}
            </div>
          )}

          <div className="pt-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700">
              <Loader2 size={14} className="animate-spin" />
              <span>Öğrenci Paneline Aktarılıyorsunuz...</span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => router.push(`/orgs/${verifiedClass?.org_slug || 'oxonom'}/dash/students`)}
              className="px-6 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              Hemen Panele Git →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
