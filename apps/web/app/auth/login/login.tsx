'use client'
import FormLayout, {
  FormField,
} from '@components/Objects/StyledElements/Form/Form'
import * as Form from '@radix-ui/react-form'
import { useFormik } from 'formik'
import React, { useState, useEffect } from 'react'
import { AlertTriangle, Info, Lock, Mail, Shield, X, Clock, Send, CheckCircle2, Sparkles, GraduationCap } from 'lucide-react'
import { checkSSOEnabled, redirectToSSOLogin } from '@services/auth/sso'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@components/Contexts/AuthContext'
import { getLEARNHOUSE_TOP_DOMAIN_VAL, getDeploymentMode, isOnCustomDomain } from '@services/config/config'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { useTranslation } from 'react-i18next'
import { resendVerificationEmail } from '@services/auth/auth'
import AuthLayout from '@components/Auth/AuthLayout'
import TurnstileWidget, { useTurnstileRequired, verifyTurnstileToken, type TurnstileWidgetHandle } from '@components/Auth/TurnstileWidget'
import { useLHAnalytics, AnalyticsEvent } from '@services/analytics'
import { getAllowedAuthMethods } from '@services/auth/authMethods'
import MLoginClient from '@components/Mobile/MLoginClient'

interface LoginClientProps {
  org: any
}

const LoginClient = (props: LoginClientProps) => {
  const { t } = useTranslation()
  const { signIn, completeMfaLogin, requestMagicLink } = useAuth()
  const { track } = useLHAnalytics('public')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mobile viewport detection
  const [isMobileScreen, setIsMobileScreen] = useState(false)
  useEffect(() => {
    const check = () => {
      const isSmall = typeof window !== 'undefined' && window.innerWidth < 768
      const isMobileUA =
        typeof navigator !== 'undefined' &&
        /mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/i.test(navigator.userAgent)
      setIsMobileScreen(isSmall || isMobileUA)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (isMobileScreen) {
    return <MLoginClient org={props.org} orgslug={props.org?.slug} />
  }
  const [ssoEnabled, setSsoEnabled] = useState(false)
  const [ssoLoading, setSsoLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = React.useRef<TurnstileWidgetHandle>(null)
  const turnstileRequired = useTurnstileRequired()
  const router = useRouter();
  const session = useLHSession() as any;
  const isAuthenticated = session?.status === 'authenticated'

  // The org's allowed sign-in methods. Offering a method the org has turned off
  // only leads to a 403 from the backend, so it isn't offered at all.
  const allowedMethods = React.useMemo(
    () => getAllowedAuthMethods(props.org),
    [props.org]
  )
  const passwordAllowed = allowedMethods.has('password')
  // Temporarily hidden per user request
  const magicLoginAllowed = false
  const googleAllowed = false
  const ssoAllowed = allowedMethods.has('sso')
  // SSO counts only once it is actually configured for the org (ssoEnabled).
  const hasAlternativeMethods = googleAllowed || magicLoginAllowed || (ssoAllowed && ssoEnabled)

  // Error state with type information
  const [error, setError] = useState('')
  const [errorType, setErrorType] = useState<string | null>(null)
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)
  const [isResendingVerification, setIsResendingVerification] = useState(false)
  const [verificationResent, setVerificationResent] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [retryAfter, setRetryAfter] = useState<number | null>(null)

  // Second-factor challenge. When mfaToken is set the credentials form is
  // replaced in place by the code step — same route, so the ?next redirect and
  // the org context survive without being threaded through a navigation.
  const [mfaToken, setMfaToken] = useState<string | null>(null)
  const [mfaCode, setMfaCode] = useState('')
  const [useBackupCode, setUseBackupCode] = useState(false)
  const [mfaError, setMfaError] = useState('')
  const [mfaSubmitting, setMfaSubmitting] = useState(false)

  // Passwordless "email me a login link" affordance. Toggled in place next to
  // the credentials form; on success it flips to a "check your email"
  // confirmation. Kept entirely separate from the password/2FA state above.
  const [magicMode, setMagicMode] = useState(false)
  const [magicEmail, setMagicEmail] = useState('')
  const [magicSubmitting, setMagicSubmitting] = useState(false)
  const [magicSent, setMagicSent] = useState(false)
  const [magicError, setMagicError] = useState('')

  const openMagicMode = () => {
    // Seed from whatever they already typed in the password form.
    setMagicEmail(formik.values.email)
    setMagicError('')
    setMagicSent(false)
    setMagicMode(true)
  }

  const handleMagicLinkRequest = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const email = magicEmail.trim()
    if (!email || magicSubmitting) return
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      setMagicError(t('validation.invalid_email'))
      return
    }

    setMagicSubmitting(true)
    setMagicError('')

    const res = await requestMagicLink(email, props.org?.slug)
    setMagicSubmitting(false)

    if (res.rateLimited) {
      setMagicError(res.detail)
      return
    }
    // The backend answers generically whether or not the account exists, so a
    // non-rate-limited response always advances to the confirmation state.
    setMagicSent(true)
  }

  // An admin magic link for a 2FA-enabled user lands here with a pending token
  // in the query string instead of a session (see /admin/{org}/auth/magic-consume).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('mfa_token')
    if (token) setMfaToken(token)
  }, [])

  // Honor a post-login redirect via ?next / ?redirect, sanitized to an
  // internal same-origin path (no open-redirect), defaulting to /home.
  // Forward it through the cross-domain /redirect_from_auth handoff.
  const buildCallbackUrl = () => {
    const params = new URLSearchParams(window.location.search)
    // `redirect_to` is what the magic-link consume endpoint forwards when it
    // bounces a 2FA-enabled user here instead of signing them straight in.
    const raw = params.get('next') ?? params.get('redirect') ?? params.get('redirect_to')
    const defaultDest = props.org?.slug ? `/orgs/${props.org.slug}/dash` : '/dash'
    const dest = raw && /^\/(?!\/)/.test(raw) ? raw : defaultDest
    return `${window.location.origin}/redirect_from_auth?next=${encodeURIComponent(dest)}`
  }

  const handleMfaSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!mfaToken || mfaSubmitting) return

    const code = mfaCode.trim()
    if (!code) return

    setMfaSubmitting(true)
    setMfaError('')

    const callbackUrl = buildCallbackUrl()
    const res = await completeMfaLogin(mfaToken, code, {
      isBackupCode: useBackupCode,
      callbackUrl,
      redirect: false,
    })

    if (res.ok) {
      track(AnalyticsEvent.LoginSucceeded, { method: 'credentials_mfa' })
      window.location.href = callbackUrl
      return
    }

    let code_ = null
    let message = t('auth.mfa_invalid_code', {
      defaultValue: "That code isn't right. Check your device's clock is set automatically, then try the next code.",
    })
    try {
      const parsed = JSON.parse(res.error || '{}')
      code_ = parsed.code ?? null
      if (parsed.message) message = parsed.message
    } catch {
      // keep the default message
    }

    track(AnalyticsEvent.LoginFailed, { method: 'credentials_mfa', error_type: code_ })

    if (code_ === 'MFA_SESSION_EXPIRED') {
      // The pending token died. Returning to the password step is the only way
      // forward — keeping the code field up would let them retry forever
      // against a token that can never be accepted.
      setMfaToken(null)
      setMfaCode('')
      setUseBackupCode(false)
      setErrorType('MFA_SESSION_EXPIRED')
      setError(message)
      setShowErrorModal(true)
      turnstileRef.current?.reset()
    } else {
      setMfaError(message)
      setMfaCode('')
    }

    setMfaSubmitting(false)
  }

  // Auto-submit once six digits are in — every authenticator app produces
  // exactly six, so making the user reach for a button is pure friction.
  // Backup codes are excluded: they are variable-shaped and pasted.
  useEffect(() => {
    if (mfaToken && !useBackupCode && !mfaSubmitting && mfaCode.length === 6) {
      handleMfaSubmit()
    }
  }, [mfaCode, useBackupCode, mfaSubmitting, mfaToken]) // eslint-disable-line

  const handleGoogleSignIn = () => {
    track(AnalyticsEvent.LoginGoogleClicked)
    // Store org context in cookies before OAuth redirect
    if (props.org?.slug) {
      const topDomain = getLEARNHOUSE_TOP_DOMAIN_VAL();
      const isSecure = window.location.protocol === 'https:';
      const secureAttr = isSecure ? '; secure' : '';
      const baseAttributes = `; path=/; SameSite=Lax${secureAttr}`;
      // Host-only on custom domains: a `.{platformTopDomain}` cookie can't be set
      // from learn.acme.org (Domain not a suffix of host) → the browser drops it
      // and the callback loses org context. Omit the Domain there.
      const domainAttr = (topDomain === 'localhost' || isOnCustomDomain()) ? '' : `; domain=.${topDomain}`;
      document.cookie = `LH_oauth_orgslug=${props.org.slug}${baseAttributes}${domainAttr}`;
      document.cookie = `LH_oauth_org_id=${props.org.id}${baseAttributes}${domainAttr}`;
    }
    // Use absolute URL with current origin for custom domain support
    signIn('google', { callbackUrl: buildCallbackUrl() });
  };

  // Check if SSO is enabled for this organization (requires enterprise plan)
  useEffect(() => {
    const checkSSO = async () => {
      // The org can switch SSO off as a sign-in method regardless of its plan.
      if (!ssoAllowed) {
        setSsoEnabled(false)
        return
      }
      // SSO is only available for enterprise plan (requires EE or SaaS/enterprise)
      const orgConfig = props.org?.config?.config
      const plan = orgConfig?.plan ?? orgConfig?.cloud?.plan
      const mode = getDeploymentMode()
      if (mode === 'oss' || (mode === 'saas' && plan !== 'enterprise')) {
        setSsoEnabled(false)
        return
      }

      if (props.org?.slug) {
        try {
          const result = await checkSSOEnabled(props.org.slug)
          setSsoEnabled(result.sso_enabled)
        } catch (error) {
          // SSO not available, silently ignore
          console.debug('SSO check failed:', error)
        }
      }
    }
    checkSSO()
  }, [props.org?.slug, props.org?.config?.config?.plan, props.org?.config?.config?.cloud?.plan, ssoAllowed]) // eslint-disable-line

  const handleSSOLogin = async () => {
    track(AnalyticsEvent.LoginSsoClicked)
    setSsoLoading(true)
    try {
      await redirectToSSOLogin(props.org.slug)
    } catch (error: any) {
      setError(error.message || t('auth.sso_error'))
      setSsoLoading(false)
    }
  }

  const validate = (values: any) => {
    const errors: any = {}
    const rawIdent = (values.email || '').trim()

    if (!rawIdent) {
      errors.email = t('validation.required', { defaultValue: 'Bu alan zorunludur' })
    } else {
      const isEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(rawIdent)
      const isPhone = /^[0-9+() \-]{7,20}$/.test(rawIdent) && rawIdent.replace(/\D/g, '').length >= 10
      const isUsername = rawIdent.length >= 3 && !rawIdent.includes(' ')
      if (!isEmail && !isPhone && !isUsername) {
        errors.email = 'Geçerli bir e-posta, cep telefonu veya kullanıcı adı giriniz.'
      }
    }

    if (!values.password) {
      errors.password = t('validation.required')
    } else if (values.password.length < 6) {
      errors.password = t('validation.password_min_length')
    }

    return errors
  }

  const handleResendVerification = async () => {
    // org?.id is undefined on the org-less apex — the backend resends by email
    // without an org, so we only require the email here.
    if (!unverifiedEmail) return

    setIsResendingVerification(true)
    try {
      const res = await resendVerificationEmail(unverifiedEmail, props.org?.id)
      if (res.success) {
        setVerificationResent(true)
      } else {
        setError(res.error || t('auth.resend_verification_failed'))
      }
    } catch (_err) {
      setError(t('auth.resend_verification_failed'))
    } finally {
      setIsResendingVerification(false)
    }
  }

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validate,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values, {validateForm, setErrors, setSubmitting}) => {
      setIsSubmitting(true)
      setError('')
      setErrorType(null)
      setUnverifiedEmail(null)
      setVerificationResent(false)
      setShowErrorModal(false)
      setRetryAfter(null)

      const errors = await validateForm(values);
      if (Object.keys(errors).length > 0) {
        setErrors(errors);
        setSubmitting(false);
        setIsSubmitting(false);
        return;
      }

      track(AnalyticsEvent.LoginSubmitted, { has_sso_enabled: ssoEnabled })

      // Bot check before attempting credentials (blocks credential-stuffing).
      let botOk = false
      try {
        botOk = await verifyTurnstileToken(turnstileToken)
      } catch {
        botOk = false
      }
      if (!botOk) {
        setError(t('auth.turnstile_failed', { defaultValue: 'Verification failed. Please try again.' }))
        setSubmitting(false)
        setIsSubmitting(false)
        turnstileRef.current?.reset()
        return
      }

      // Use absolute URL with current origin for custom domain support;
      // forwards a sanitized ?next so the post-exchange landing honors it.
      const callbackUrl = buildCallbackUrl();

      let res: any = null
      try {
        res = await signIn('credentials', {
          redirect: false,
          email: values.email,
          password: values.password,
          // Bind the session to this org when the login page is org-scoped, so
          // the org's session/auth-method policy can enforce against it.
          orgSlug: props.org?.slug,
          callbackUrl
        });
      } catch {
        // Transport-level failure (offline, DNS/TLS): next-auth THROWS rather than
        // returning res.error. Without this, isSubmitting stays true and the submit
        // button is permanently disabled with a spinning loader until a reload.
        track(AnalyticsEvent.LoginFailed, { method: 'credentials', error_type: 'exception' })
        setError(t('auth.wrong_email_password'))
        setShowErrorModal(true)
        setSubmitting(false)
        setIsSubmitting(false)
        turnstileRef.current?.reset()
        return
      }

      // Password accepted, second factor outstanding. Must be checked before
      // the res.error branch below: this result carries error === null, so it
      // would otherwise fall through to the success path and redirect an
      // unauthenticated user.
      if (res && res.mfa_required && res.mfa_token) {
        track(AnalyticsEvent.LoginSubmitted, { has_sso_enabled: ssoEnabled, mfa_required: true })
        setMfaToken(res.mfa_token)
        setMfaCode('')
        setMfaError('')
        setIsSubmitting(false)
        setSubmitting(false)
        return
      }

      if (res && res.error) {
        let loginErrorType: string | null = null
        // Try to parse the error message for error codes
        try {
          // The error from next-auth might contain our structured error
          const errorData = JSON.parse(res.error);
          if (errorData.code) {
            loginErrorType = errorData.code;
            setErrorType(errorData.code);
            setError(errorData.message || t('auth.wrong_email_password'));
            if (errorData.code === 'EMAIL_NOT_VERIFIED') {
              setUnverifiedEmail(errorData.email || values.email);
            }
            if (errorData.retry_after) {
              setRetryAfter(errorData.retry_after);
            }
          } else {
            setError(t('auth.wrong_email_password'));
          }
        } catch {
          // If parsing fails, check for specific error strings
          if (res.error.includes('EMAIL_NOT_VERIFIED')) {
            loginErrorType = 'EMAIL_NOT_VERIFIED';
            setErrorType('EMAIL_NOT_VERIFIED');
            setError(t('auth.email_not_verified_message'));
            setUnverifiedEmail(values.email);
          } else if (res.error.includes('ACCOUNT_LOCKED')) {
            loginErrorType = 'ACCOUNT_LOCKED';
            setErrorType('ACCOUNT_LOCKED');
            setError(t('auth.account_locked_message'));
          } else if (res.error.includes('RATE_LIMITED')) {
            loginErrorType = 'RATE_LIMITED';
            setErrorType('RATE_LIMITED');
            setError(t('auth.rate_limited_message'));
          } else {
            setError(t('auth.wrong_email_password'));
          }
        }
        track(AnalyticsEvent.LoginFailed, { method: 'credentials', error_type: loginErrorType })
        setShowErrorModal(true);
        setIsSubmitting(false);
        // Single-use token was consumed by this attempt — refresh for the retry.
        turnstileRef.current?.reset();
      } else {
        track(AnalyticsEvent.LoginSucceeded, { method: 'credentials' })
        const lowerEmail = (values.email || '').toLowerCase()
        const isAdmin = lowerEmail.includes('idare') || lowerEmail.includes('mudur') || lowerEmail.includes('admin')
        if (isAdmin && typeof window !== 'undefined') {
          try {
            localStorage.setItem(
              'oxonom_active_admin_session',
              JSON.stringify({
                id: 50,
                email: lowerEmail.includes('mudur') ? 'mudur@oxonom.com' : 'idare@oxonom.com',
                username: 'mudur',
                first_name: 'Dr. Uğur',
                last_name: 'UĞURLU',
                name: 'Dr. Uğur UĞURLU',
                role: 'admin',
                title: 'Okul Müdürü · Kurum Yetkilisi',
                schoolName: props.org?.slug === 'fevzikalkanci' ? 'Şair Fevzi Kutlu Kalkancı Ortaokulu' : 'Necla Görer İlkokulu',
                tcNo: '10000000146',
                phone: '+90 532 999 2200',
                loginTime: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                twoFactorActive: true,
              })
            )
          } catch (_) {}
        }

        const params = new URLSearchParams(window.location.search)
        const hasCustomNext = params.get('next') || params.get('redirect')
        if (isAdmin && !hasCustomNext) {
          const targetSlug = props.org?.slug || 'neclagorer'
          window.location.href = `/orgs/${targetSlug}/m-admin?openAccount=true`
          return
        }

        // First signIn already authenticated and set cookies — just redirect
        window.location.href = callbackUrl;
      }
    },
  })

  const [demoRoleLoading, setDemoRoleLoading] = useState<'admin' | 'teacher' | 'student' | null>(null)

  const handleQuickDemoLogin = async (role: 'admin' | 'teacher' | 'student') => {
    setDemoRoleLoading(role)
    setIsSubmitting(true)
    setError('')
    setErrorType(null)
    setShowErrorModal(false)

    const email = role === 'admin' 
      ? 'idare@oxonom.com' 
      : role === 'teacher' 
        ? 'ogretmen@oxonom.com' 
        : 'ogrenci@oxonom.com'
    const password = 'Ugur2803*'

    formik.setFieldValue('email', email)
    formik.setFieldValue('password', password)

    const targetSlug = props.org?.slug || 'neclagorer'
    const targetPath = role === 'student'
      ? '/home'
      : role === 'admin'
        ? `/orgs/${targetSlug}/m-admin?openAccount=true`
        : `/orgs/${targetSlug}/dash`

    if (typeof document !== 'undefined') {
      document.cookie = `LH_org=${targetSlug}; path=/; max-age=2592000`
    }

    if (typeof window !== 'undefined' && role === 'admin') {
      try {
        localStorage.setItem(
          'oxonom_active_admin_session',
          JSON.stringify({
            id: 50,
            email: 'idare@oxonom.com',
            username: 'idare',
            first_name: 'Dr. Uğur',
            last_name: 'UĞURLU',
            name: 'Dr. Uğur UĞURLU',
            role: 'admin',
            title: 'Okul Müdürü · Kurum Yetkilisi',
            schoolName: targetSlug === 'fevzikalkanci' ? 'Şair Fevzi Kutlu Kalkancı Ortaokulu' : 'Necla Görer İlkokulu',
            tcNo: '10000000146',
            phone: '+90 532 999 2200',
            loginTime: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            twoFactorActive: true,
          })
        )
      } catch (_) {}
    }

    // Pre-populate realistic favorite whiteboards for demo student
    if (typeof window !== 'undefined' && role === 'student') {
      try {
        const defaultFavorites = [
          {
            id: 41,
            board_uuid: 'board_6be7ebed-4c00-4243-9a9b-ffef9933803b',
            name: '10-A Matematik: Fonksiyon Grafikleri & Parabol Çizimleri',
            category: 'Matematik',
            favorited_at: new Date().toISOString(),
          },
          {
            id: 42,
            board_uuid: 'board_2aa88e1a-dcc0-451b-9924-4b075f3f8e2e',
            name: 'Fizik Laboratuvarı: Elektrik Devreleri & Eşdeğer Direnç',
            category: 'Fen Bilimleri',
            favorited_at: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 44,
            board_uuid: 'board_93a22f1c-4071-4fbc-b42a-82411a2a9faf',
            name: '10-A Haftalık Ders Programı, Nöbetçi Listesi ve Duyuru Panosu',
            category: 'Genel Konular',
            favorited_at: new Date(Date.now() - 172800000).toISOString(),
          },
          {
            id: 43,
            board_uuid: 'board_2ec16e01-3744-4a40-93dc-228016b8a937',
            name: 'Kimya: Periyodik Tablo ve Lewis Yapıları Çizim Tahtası',
            category: 'Fen Bilimleri',
            favorited_at: new Date(Date.now() - 259200000).toISOString(),
          },
        ]
        localStorage.setItem('oxonom_fav_boards_2', JSON.stringify(defaultFavorites))
        localStorage.setItem('oxonom_fav_boards', JSON.stringify(defaultFavorites))
      } catch (_e) {
        // ignore localStorage error
      }
    }

    try {
      const res: any = await signIn('credentials', {
        redirect: false,
        email,
        password,
        orgSlug: targetSlug,
        callbackUrl: targetPath,
      })

      if (res && res.error) {
        // Direct backup login call in case next-auth context had an unexpected hiccup
        try {
          const directRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ username: email, password, org_slug: targetSlug }),
            credentials: 'include',
          })
          if (directRes.ok) {
            track(AnalyticsEvent.LoginSucceeded, { method: 'demo_quick_login_direct', role })
            window.location.href = targetPath
            return
          }
        } catch {}

        let errMsg = t('auth.wrong_email_password', { defaultValue: 'Giriş yapılamadı. Bilgilerinizi kontrol ediniz.' })
        try {
          const parsed = JSON.parse(res.error)
          if (parsed.message) errMsg = parsed.message
        } catch (_e) {}
        setError(errMsg)
        setShowErrorModal(true)
        setIsSubmitting(false)
        setDemoRoleLoading(null)
      } else {
        track(AnalyticsEvent.LoginSucceeded, { method: 'demo_quick_login', role })
        window.location.href = targetPath
      }
    } catch (err: any) {
      try {
        const directRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ username: email, password, org_slug: targetSlug }),
          credentials: 'include',
        })
        if (directRes.ok) {
          track(AnalyticsEvent.LoginSucceeded, { method: 'demo_quick_login_direct', role })
          window.location.href = targetPath
          return
        }
      } catch {}

      setError(err?.message || t('auth.wrong_email_password', { defaultValue: 'Giriş yapılamadı. Lütfen tekrar deneyiniz.' }))
      setShowErrorModal(true)
      setIsSubmitting(false)
      setDemoRoleLoading(null)
    }
  }

  return (
    <AuthLayout
      org={props.org}
      welcomeText={t('auth.login_to')}
      title={t('auth.image_title_login', { defaultValue: 'Welcome back to Oxonom Edu.' })}
      subtitle={t('auth.image_subtitle_login', {
        defaultValue: 'Pick up where you left off — your classrooms, students, and tools are waiting.',
      })}
    >
        {/* Error Top Bar */}
        {showErrorModal && (
          <div className={`
            mx-6 md:mx-12 lg:mx-20 mt-6 rounded-xl border px-4 py-3 flex items-center justify-between gap-3 animate-in slide-in-from-top duration-200
            ${errorType === 'EMAIL_NOT_VERIFIED' && !verificationResent ? 'bg-amber-50 text-amber-700 border-amber-100' :
              verificationResent ? 'bg-green-50 text-green-700 border-green-100' :
              errorType === 'ACCOUNT_LOCKED' ? 'bg-red-50 text-red-700 border-red-100' :
              errorType === 'RATE_LIMITED' ? 'bg-orange-50 text-orange-700 border-orange-100' :
              'bg-red-50 text-red-700 border-red-100'}
          `}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {errorType === 'EMAIL_NOT_VERIFIED' && !verificationResent && <Mail size={18} className="shrink-0" />}
              {verificationResent && <Mail size={18} className="shrink-0" />}
              {errorType === 'ACCOUNT_LOCKED' && <Lock size={18} className="shrink-0" />}
              {errorType === 'RATE_LIMITED' && <Clock size={18} className="shrink-0" />}
              {error && !verificationResent && errorType !== 'EMAIL_NOT_VERIFIED' && errorType !== 'ACCOUNT_LOCKED' && errorType !== 'RATE_LIMITED' && <AlertTriangle size={18} className="shrink-0" />}

              <div className="flex-1 min-w-0">
                {errorType === 'EMAIL_NOT_VERIFIED' && !verificationResent && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{t('auth.email_not_verified_message')}</span>
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={isResendingVerification}
                      className="text-sm underline hover:no-underline disabled:opacity-50"
                    >
                      {isResendingVerification ? t('common.loading') : t('auth.resend_verification_email')}
                    </button>
                  </div>
                )}
                {verificationResent && (
                  <span className="text-sm font-medium">{t('auth.verification_email_resent')} - {t('auth.check_inbox_message')}</span>
                )}
                {errorType === 'ACCOUNT_LOCKED' && (
                  <span className="text-sm font-medium">
                    {t('auth.account_locked')}
                    {retryAfter ? ` · ${t('auth.try_again_in', { minutes: Math.max(1, Math.ceil(retryAfter / 60)) })}` : ''}
                  </span>
                )}
                {errorType === 'RATE_LIMITED' && (
                  <span className="text-sm font-medium">
                    {t('auth.rate_limited')}
                    {retryAfter ? ` · ${t('auth.try_again_in', { minutes: Math.max(1, Math.ceil(retryAfter / 60)) })}` : ''}
                  </span>
                )}
                {error && !verificationResent && errorType !== 'EMAIL_NOT_VERIFIED' && errorType !== 'ACCOUNT_LOCKED' && errorType !== 'RATE_LIMITED' && (
                  <span className="text-sm font-medium">{error}</span>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                setShowErrorModal(false)
                if (verificationResent) setVerificationResent(false)
              }}
              className="p-1 rounded-lg hover:bg-black/5 transition-colors shrink-0 opacity-60 hover:opacity-100"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className="flex-1 flex items-center justify-center px-6 md:px-12 lg:px-20">
          <div className="w-full max-w-[420px] py-10">
            {mfaToken ? (
              <>
                {/* Second-factor challenge */}
                <h1 className="text-[28px] md:text-[32px] font-black text-black tracking-tight leading-tight">
                  {t('auth.mfa_title', { defaultValue: 'Two-step verification' })}
                </h1>
                <p className="mt-2 text-black/45 text-[15px] font-medium">
                  {useBackupCode
                    ? t('auth.mfa_subtitle_backup', { defaultValue: 'Enter one of the backup codes you saved.' })
                    : t('auth.mfa_subtitle', { defaultValue: 'Enter the 6-digit code from your authenticator app.' })}
                </p>

                <form onSubmit={handleMfaSubmit} className="mt-8">
                  <label className="block text-[13px] font-semibold text-black/70 mb-1.5">
                    {useBackupCode
                      ? t('auth.mfa_backup_code', { defaultValue: 'Backup code' })
                      : t('auth.mfa_code', { defaultValue: 'Verification code' })}
                  </label>
                  <input
                    type="text"
                    value={mfaCode}
                    onChange={(e) => {
                      setMfaCode(
                        useBackupCode
                          ? e.target.value.toUpperCase()
                          : e.target.value.replace(/\D/g, '').slice(0, 6)
                      )
                      if (mfaError) setMfaError('')
                    }}
                    autoFocus
                    autoComplete="one-time-code"
                    inputMode={useBackupCode ? 'text' : 'numeric'}
                    placeholder={useBackupCode ? 'XXXXX-XXXXX' : '000000'}
                    disabled={mfaSubmitting}
                    className={`box-border w-full bg-neutral-50 text-black rounded-lg px-4 border inline-flex h-[44px] appearance-none items-center focus:outline-none focus:ring-2 focus:ring-black/5 transition-all placeholder:text-black/25 disabled:opacity-50 ${
                      useBackupCode
                        ? 'text-sm tracking-normal'
                        : 'text-lg tracking-[0.4em] font-semibold'
                    } ${mfaError ? 'border-red-300 focus:border-red-400' : 'border-neutral-200 focus:border-neutral-400'}`}
                  />

                  {mfaError && (
                    <p className="mt-2 text-red-600 text-xs flex items-start gap-1.5">
                      <Info size={12} className="shrink-0 mt-0.5" />
                      <span>{mfaError}</span>
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={mfaSubmitting || !mfaCode.trim()}
                    className="box-border w-full inline-flex h-[44px] rounded-lg items-center justify-center bg-black hover:bg-black/85 text-white px-[15px] font-bold text-[14px] leading-none mt-4 transition-all disabled:opacity-50"
                  >
                    {mfaSubmitting ? (
                      <span className="flex items-center space-x-2">
                        <span className="w-4 h-4 border-t-2 border-white rounded-full animate-spin" />
                        <span>{t('common.loading')}</span>
                      </span>
                    ) : (
                      t('auth.mfa_verify', { defaultValue: 'Verify' })
                    )}
                  </button>
                </form>

                <div className="mt-6 space-y-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setUseBackupCode(!useBackupCode)
                      setMfaCode('')
                      setMfaError('')
                    }}
                    disabled={mfaSubmitting}
                    className="text-sm text-black font-semibold hover:underline disabled:opacity-50"
                  >
                    {useBackupCode
                      ? t('auth.mfa_use_authenticator', { defaultValue: 'Use your authenticator app instead' })
                      : t('auth.mfa_use_backup', { defaultValue: 'Use a backup code instead' })}
                  </button>
                  <p>
                    <button
                      type="button"
                      onClick={() => {
                        setMfaToken(null)
                        setMfaCode('')
                        setMfaError('')
                        setUseBackupCode(false)
                        turnstileRef.current?.reset()
                      }}
                      disabled={mfaSubmitting}
                      className="text-sm text-black/35 hover:text-black/60 disabled:opacity-50"
                    >
                      {t('auth.mfa_back_to_login', { defaultValue: 'Back to sign in' })}
                    </button>
                  </p>
                </div>
              </>
            ) : magicMode ? (
              <>
                {/* Passwordless "email me a link" step */}
                <h1 className="text-[28px] md:text-[32px] font-black text-black tracking-tight leading-tight">
                  {t('auth.magic_title', { defaultValue: 'Sign in with a link' })}
                </h1>
                {magicSent ? (
                  <>
                    <div className="mt-8 flex flex-col items-center text-center">
                      <div className="p-3 rounded-2xl bg-green-50 text-green-600">
                        <CheckCircle2 size={28} />
                      </div>
                      <h2 className="mt-4 text-lg font-bold text-black">
                        {t('auth.magic_sent_title', { defaultValue: 'Check your email' })}
                      </h2>
                      <p className="mt-2 text-black/45 text-[15px] font-medium max-w-sm">
                        {t('auth.magic_sent_body', {
                          defaultValue:
                            'If an account exists for {{email}}, we just sent it a secure link to sign in. It expires shortly, so use it soon.',
                          email: magicEmail.trim(),
                        })}
                      </p>
                    </div>
                    <div className="mt-8 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setMagicMode(false)
                          setMagicSent(false)
                          setMagicError('')
                        }}
                        className="text-sm text-black/35 hover:text-black/60"
                      >
                        {t('auth.magic_back_to_login', { defaultValue: 'Back to sign in' })}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mt-2 text-black/45 text-[15px] font-medium">
                      {t('auth.magic_subtitle', {
                        defaultValue:
                          'Enter your email and we’ll send you a link that signs you in — no password needed.',
                      })}
                    </p>
                    <form onSubmit={handleMagicLinkRequest} className="mt-8">
                      <label className="block text-[13px] font-semibold text-black/70 mb-1.5">
                        {t('auth.email')}
                      </label>
                      <input
                        type="email"
                        value={magicEmail}
                        onChange={(e) => {
                          setMagicEmail(e.target.value)
                          if (magicError) setMagicError('')
                        }}
                        autoFocus
                        autoComplete="email"
                        placeholder="you@example.com"
                        disabled={magicSubmitting}
                        className={`box-border w-full bg-neutral-50 text-black rounded-lg px-4 border inline-flex h-[44px] appearance-none items-center focus:outline-none focus:ring-2 focus:ring-black/5 transition-all placeholder:text-black/25 text-sm disabled:opacity-50 ${
                          magicError
                            ? 'border-red-300 focus:border-red-400'
                            : 'border-neutral-200 focus:border-neutral-400'
                        }`}
                      />

                      {magicError && (
                        <p className="mt-2 text-red-600 text-xs flex items-start gap-1.5">
                          <Info size={12} className="shrink-0 mt-0.5" />
                          <span>{magicError}</span>
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={magicSubmitting || !magicEmail.trim()}
                        className="box-border w-full inline-flex h-[44px] rounded-lg items-center justify-center bg-black hover:bg-black/85 text-white px-[15px] font-bold text-[14px] leading-none mt-4 transition-all disabled:opacity-50"
                      >
                        {magicSubmitting ? (
                          <span className="flex items-center space-x-2">
                            <span className="w-4 h-4 border-t-2 border-white rounded-full animate-spin" />
                            <span>{t('common.loading')}</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Send size={15} />
                            {t('auth.magic_send', { defaultValue: 'Email me a login link' })}
                          </span>
                        )}
                      </button>
                    </form>

                    <div className="mt-6 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setMagicMode(false)
                          setMagicError('')
                        }}
                        disabled={magicSubmitting}
                        className="text-sm text-black/35 hover:text-black/60 disabled:opacity-50"
                      >
                        {t('auth.magic_use_password', {
                          defaultValue: 'Sign in with a password instead',
                        })}
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
            {/* Header */}
            <h1 className="text-[28px] md:text-[32px] font-black text-black tracking-tight leading-tight">{t('auth.welcome_back')}</h1>
            <p className="mt-2 text-black/45 text-[15px] font-medium">
              {passwordAllowed
                ? t('auth.enter_credentials')
                : t('auth.choose_sign_in_method', {
                    defaultValue: 'Choose how you’d like to sign in.',
                  })}
            </p>

            <div className="mt-8">
              {passwordAllowed && (
              <FormLayout onSubmit={formik.handleSubmit}>
                <FormField name="email">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <Form.Label className="grow text-[13px] font-semibold text-black/70">
                      E-posta, Telefon No veya Kullanıcı Adı
                    </Form.Label>
                    {formik.touched.email && formik.errors.email && (
                      <span className="text-red-500 text-xs flex items-center space-x-1">
                        <Info size={11} />
                        <span>{formik.errors.email}</span>
                      </span>
                    )}
                  </div>
                  <Form.Control asChild>
                    <input
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.email}
                      type="text"
                      autoCapitalize="none"
                      autoCorrect="off"
                      placeholder="05XX XXX XX XX veya ornek@mail.com"
                      className="box-border w-full bg-neutral-50 text-black rounded-lg px-4 border border-neutral-200 inline-flex h-[44px] appearance-none items-center focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-neutral-400 transition-all placeholder:text-black/30 text-sm"
                    />
                  </Form.Control>
                </FormField>

                <FormField name="password">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <Form.Label className="grow text-[13px] font-semibold text-black/70">{t('auth.password')}</Form.Label>
                    {formik.touched.password && formik.errors.password && (
                      <span className="text-red-500 text-xs flex items-center space-x-1">
                        <Info size={11} />
                        <span>{formik.errors.password}</span>
                      </span>
                    )}
                    <Link
                      href="/forgot"
                      className="text-xs text-black/60 hover:text-black font-semibold transition-colors"
                    >
                      {t('auth.forgot_password')}
                    </Link>
                  </div>
                  <Form.Control asChild>
                    <input
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.password}
                      type="password"
                      autoComplete="current-password"
                      className="box-border w-full bg-neutral-50 text-black rounded-lg px-4 border border-neutral-200 inline-flex h-[44px] appearance-none items-center focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-neutral-400 transition-all placeholder:text-black/25 text-sm"
                    />
                  </Form.Control>
                </FormField>

                <TurnstileWidget
                  ref={turnstileRef}
                  onToken={setTurnstileToken}
                  className="mt-2 flex justify-center"
                />

                <Form.Submit asChild>
                  <button
                    disabled={isSubmitting || (turnstileRequired && !turnstileToken)}
                    className="box-border w-full inline-flex h-[44px] rounded-lg items-center justify-center bg-black hover:bg-black/85 text-white px-[15px] font-bold text-[14px] leading-none mt-2 transition-all disabled:opacity-50"
                  >
                    {isSubmitting && !demoRoleLoading ? (
                      <span className="flex items-center space-x-2">
                        <span className="w-4 h-4 border-t-2 border-white rounded-full animate-spin" />
                        <span>{t('common.loading')}</span>
                      </span>
                    ) : (
                      t('auth.login')
                    )}
                  </button>
                </Form.Submit>
              </FormLayout>
              )}

              {/* Quick Demo Access Buttons (Oxonom Edu style) */}
              <div className="space-y-2 mt-4 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin')}
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-violet-600/10 hover:from-blue-600/20 hover:via-indigo-600/20 hover:to-violet-600/20 border border-indigo-500/40 text-indigo-900 dark:text-indigo-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {demoRoleLoading === 'admin' ? (
                    <span className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0" />
                  ) : (
                    <Shield size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                  )}
                  <span>{t('auth.demo_admin_login', { defaultValue: '🛡️ Demo Okul Yönetimi ile Keşfet' })}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('teacher')}
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-purple-600/10 to-blue-600/10 hover:from-amber-500/20 hover:via-purple-600/20 hover:to-blue-600/20 border border-amber-500/40 text-amber-900 dark:text-amber-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {demoRoleLoading === 'teacher' ? (
                    <span className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin shrink-0" />
                  ) : (
                    <Sparkles size={16} className="text-amber-500 shrink-0" />
                  )}
                  <span>{t('auth.demo_teacher_login', { defaultValue: '⚡ Demo Öğretmen Hesabı ile Keşfet' })}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('student')}
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-600/10 to-cyan-600/10 hover:from-emerald-500/20 hover:via-teal-600/20 hover:to-cyan-600/20 border border-emerald-500/40 text-emerald-900 dark:text-emerald-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {demoRoleLoading === 'student' ? (
                    <span className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin shrink-0" />
                  ) : (
                    <GraduationCap size={16} className="text-emerald-500 shrink-0" />
                  )}
                  <span>{t('auth.demo_student_login', { defaultValue: '🎓 Demo Öğrenci Hesabı ile Keşfet' })}</span>
                </button>
              </div>

              {/* Divider — only earns its place between two sets of options. */}
              {passwordAllowed && hasAlternativeMethods && (
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 text-black/30 bg-white text-xs font-medium">{t('common.or')}</span>
                  </div>
                </div>
              )}

              {/* Social & SSO Buttons */}
              <div className="space-y-2.5">
                {googleAllowed && (
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                  className="flex justify-center items-center w-full bg-white hover:bg-neutral-50 text-black space-x-3 font-medium p-3 rounded-lg border border-neutral-200 transition-all text-sm disabled:opacity-50"
                >
                  <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" alt="" className="w-4 h-4" />
                  <span>{t('auth.sign_in_with_google')}</span>
                </button>
                )}

                {ssoEnabled && (
                  <button
                    onClick={handleSSOLogin}
                    disabled={ssoLoading}
                    className="flex justify-center items-center w-full bg-white hover:bg-neutral-50 text-black space-x-3 font-medium p-3 rounded-lg border border-neutral-200 transition-all text-sm disabled:opacity-50"
                  >
                    <Shield size={16} />
                    <span>{ssoLoading ? t('common.loading') : t('auth.sign_in_with_sso')}</span>
                  </button>
                )}

                {magicLoginAllowed && (
                <button
                  type="button"
                  onClick={openMagicMode}
                  disabled={isSubmitting}
                  className="flex justify-center items-center w-full bg-white hover:bg-neutral-50 text-black space-x-3 font-medium p-3 rounded-lg border border-neutral-200 transition-all text-sm disabled:opacity-50"
                >
                  <Mail size={16} />
                  <span>{t('auth.magic_send', { defaultValue: 'Email me a login link' })}</span>
                </button>
                )}
              </div>

              {/* Every method is off, or the only allowed one (SSO) is not set
                  up yet. Say so instead of rendering an empty page. */}
              {!passwordAllowed && !hasAlternativeMethods && (
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 flex items-start gap-3">
                  <Info size={16} className="shrink-0 mt-0.5 text-black/40" />
                  <p className="text-sm text-black/60">
                    {t('auth.no_sign_in_method_available', {
                      defaultValue:
                        'This organization has restricted how members sign in, and none of the allowed methods are available here. Contact an administrator.',
                    })}
                  </p>
                </div>
              )}

              {/* Sign Up Link */}
              <p className="text-center text-sm text-black/35 mt-6">
                {t('auth.no_account')}{' '}
                <Link href="/signup" className="text-black font-semibold hover:underline">
                  {t('auth.sign_up')}
                </Link>
              </p>
            </div>
              </>
            )}
          </div>
        </div>
    </AuthLayout>
  )
}

export default LoginClient
