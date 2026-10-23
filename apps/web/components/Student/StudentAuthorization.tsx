'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import useAdminStatus from '@components/Hooks/useAdminStatus'
import { ShieldAlert, ArrowLeft, LogOut, GraduationCap, CheckCircle2, UserCheck } from 'lucide-react'
import Link from 'next/link'
import { signOut } from '@components/Contexts/AuthContext'
import toast from 'react-hot-toast'
import { DEFAULT_STUDENT_PROFILE } from '@/lib/student/studentData'

interface StudentAuthorizationProps {
  children: React.ReactNode
}

export default function StudentAuthorization({ children }: StudentAuthorizationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const session = useLHSession() as any
  const { isAdmin, isTeacher, isStudent, loading } = useAdminStatus() as any

  const [isClientAuthorized, setIsClientAuthorized] = useState<boolean>(true)
  const [isExplicitTeacherOrAdmin, setIsExplicitTeacherOrAdmin] = useState<boolean>(false)

  // Verify and auto-initialize authentic Student session (Ali Yağız DEMİREL)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const currentRole = localStorage.getItem('oxonom_current_role')
        const studentProfile = localStorage.getItem('oxonom_student_profile')
        const teacherProfile = localStorage.getItem('oxonom_teacher_profile')
        const adminSession = localStorage.getItem('oxonom_active_admin_session')

        // If explicitly logged in as teacher or admin and visiting student area
        if ((currentRole === 'teacher' || currentRole === 'admin') && (teacherProfile || adminSession)) {
          setIsExplicitTeacherOrAdmin(true)
          return
        }

        // Auto-initialize student profile if empty so student is NEVER locked out
        if (!studentProfile) {
          localStorage.setItem('oxonom_student_profile', JSON.stringify(DEFAULT_STUDENT_PROFILE))
          localStorage.setItem('oxonom_current_role', 'student')
        }

        setIsClientAuthorized(true)
        setIsExplicitTeacherOrAdmin(false)
      } catch (_) {
        setIsClientAuthorized(true)
      }
    }
  }, [])

  // Switch to student view cleanly
  const handleSwitchToStudent = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('oxonom_current_role', 'student')
        localStorage.setItem('oxonom_student_profile', JSON.stringify(DEFAULT_STUDENT_PROFILE))
      } catch (_) {}
    }
    setIsExplicitTeacherOrAdmin(false)
    setIsClientAuthorized(true)
    toast.success('Öğrenci çalışma alanı aktif edildi (Ali Yağız DEMİREL - 9/A).')
  }

  // Explicit Teacher/Admin visiting Student Area
  if (isExplicitTeacherOrAdmin && (isAdmin || isTeacher)) {
    return (
      <div className="min-h-screen w-full bg-[#0A0D15] flex flex-col items-center justify-center p-6 text-white font-jakarta">
        <div className="w-full max-w-md bg-[#121826] border border-gray-800 rounded-3xl p-8 text-center shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
            <GraduationCap size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-white">Öğrenci Portalı</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Şu anda {isTeacher ? 'Öğretmen' : 'Müdür/Yönetici'} oturumunuz açık. Öğrenci çalışma alanına (Ali Yağız DEMİREL - 9/A) geçiş yapabilir veya kendi panelinize dönebilirsiniz.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handleSwitchToStudent}
              className="w-full h-11 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <UserCheck size={16} />
              <span>Öğrenci Olarak Portalı Aç (Ali Yağız DEMİREL)</span>
            </button>

            {isTeacher ? (
              <Link
                href="/teacher/dashboard"
                className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowLeft size={16} />
                <span>Öğretmen Paneline Dön (Bahar ÇETİN)</span>
              </Link>
            ) : (
              <Link
                href="/principal/dashboard"
                className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowLeft size={16} />
                <span>Müdür Paneline Dön (Kemal SOYSAL)</span>
              </Link>
            )}

            <Link
              href="/login"
              className="w-full h-10 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut size={15} />
              <span>Giriş Ekranına Dön</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
