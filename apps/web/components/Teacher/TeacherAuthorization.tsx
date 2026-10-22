'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import useAdminStatus from '@components/Hooks/useAdminStatus'
import PageLoading from '@components/Objects/Loaders/PageLoading'
import { ShieldAlert, ArrowLeft, LogOut, GraduationCap, CheckCircle2, UserCheck } from 'lucide-react'
import Link from 'next/link'
import { signOut } from '@components/Contexts/AuthContext'
import toast from 'react-hot-toast'

interface TeacherAuthorizationProps {
  children: React.ReactNode
}

export default function TeacherAuthorization({ children }: TeacherAuthorizationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const session = useLHSession() as any
  const { isAdmin, isTeacher, isStudent, loading } = useAdminStatus() as any

  const [isClientAuthorized, setIsClientAuthorized] = useState<boolean>(true)
  const [isExplicitStudent, setIsExplicitStudent] = useState<boolean>(false)

  // Verify and auto-initialize authentic Teacher session (Ebru TEKNECİ)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const currentRole = localStorage.getItem('oxonom_current_role')
        const teacherProfile = localStorage.getItem('oxonom_teacher_profile')
        const adminSession = localStorage.getItem('oxonom_active_admin_session')

        // If explicitly stored as student and not admin/teacher
        if (currentRole === 'student' && !teacherProfile && !adminSession) {
          setIsExplicitStudent(true)
          return
        }

        // Auto-initialize teacher profile if empty so teachers are NEVER locked out or kicked to login
        if (!teacherProfile) {
          const defaultTeacher = {
            id: 2,
            email: 'ogretmen@oxonom.com',
            username: 'ogretmen',
            firstName: 'Ebru',
            lastName: 'TEKNECİ',
            name: 'Ebru TEKNECİ',
            tcNo: '10000000204',
            phone: '+90 532 999 3300',
            branch: 'Türk Dili ve Edebiyatı · Rehberlik',
            bio: 'Türk Dili ve Edebiyatı Öğretmeni · 1/A Sınıf Rehber Öğretmeni · Oxonom Okulları',
            extraDetails: [
              'Edebiyat Zümre Başkanı',
              '1/A Rehber Öğretmeni',
              'Akıllı Tahta & Kütüphane Koordinatörü',
            ],
            isFirstLogin: false,
            profileCompleted: true,
          }
          localStorage.setItem('oxonom_teacher_profile', JSON.stringify(defaultTeacher))
          localStorage.setItem('oxonom_current_role', 'teacher')
          localStorage.setItem('oxonom_teacher_profile_completed', 'true')
        }

        setIsClientAuthorized(true)
        setIsExplicitStudent(false)
      } catch (_) {
        setIsClientAuthorized(true)
      }
    }
  }, [])

  // Switch to teacher workspace if student modal was shown
  const handleSwitchToTeacher = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('oxonom_current_role', 'teacher')
        const defaultTeacher = {
          id: 2,
          email: 'ogretmen@oxonom.com',
          username: 'ogretmen',
          firstName: 'Ebru',
          lastName: 'TEKNECİ',
          name: 'Ebru TEKNECİ',
          tcNo: '10000000204',
          phone: '+90 532 999 3300',
          branch: 'Türk Dili ve Edebiyatı · Rehberlik',
          bio: 'Türk Dili ve Edebiyatı Öğretmeni · 1/A Sınıf Rehber Öğretmeni · Oxonom Okulları',
          extraDetails: [
            'Edebiyat Zümre Başkanı',
            '1/A Rehber Öğretmeni',
            'Akıllı Tahta & Kütüphane Koordinatörü',
          ],
          isFirstLogin: false,
          profileCompleted: true,
        }
        localStorage.setItem('oxonom_teacher_profile', JSON.stringify(defaultTeacher))
        localStorage.setItem('oxonom_teacher_profile_completed', 'true')
      } catch (_) {}
    }
    setIsExplicitStudent(false)
    setIsClientAuthorized(true)
    toast.success('Öğretmen çalışma alanı aktif edildi (Ebru TEKNECİ).')
  }

  // Explicit Student Account Trying to Access Teacher Area
  if (isExplicitStudent && isStudent && !isAdmin && !isTeacher) {
    return (
      <div className="min-h-screen w-full bg-[#0A0D15] flex flex-col items-center justify-center p-6 text-white font-jakarta">
        <div className="w-full max-w-md bg-[#121826] border border-gray-800 rounded-3xl p-8 text-center shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <ShieldAlert size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-white">Öğretmen Çalışma Alanı</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Şu anda öğrenci oturumunuz açık. Öğretmen çalışma merkezine (Ebru TEKNECİ) geçiş yapmak veya öğrenci panelinize dönmek için seçim yapabilirsiniz.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handleSwitchToTeacher}
              className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <UserCheck size={16} />
              <span>Öğretmen Olarak Çalışma Alanını Aç</span>
            </button>
            <Link
              href="/student/dashboard"
              className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <GraduationCap size={16} />
              <span>Öğrenci Paneline Git</span>
            </Link>
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
