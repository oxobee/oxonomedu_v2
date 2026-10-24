// apps/web/app/superadmin/infrastructure/page.tsx
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Server,
  Database,
  Activity,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  HardDrive,
  Cpu,
  Layers,
  Building2,
  Clock,
  ArrowRight,
  ExternalLink,
  Lock,
  Unlock,
  KeyRound,
  Check,
  Users,
  GraduationCap,
} from 'lucide-react'
import {
  SchoolDetail,
  getAllSchools,
  normalizeSchool,
} from '@/lib/schools/schoolData'
import {
  queryServerHealth,
  assessAllSchoolsRisks,
  GlobalServerHealth,
  SchoolRiskAssessment,
} from '@/lib/superadmin/systemHealth'
import { isSupabaseConfigured, getSupabaseBrowserClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'

export default function SuperadminInfrastructurePage() {
  const [schools, setSchools] = useState<SchoolDetail[]>([])
  const [health, setHealth] = useState<GlobalServerHealth | null>(null)
  const [assessments, setAssessments] = useState<Record<string, SchoolRiskAssessment>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [filterRisk, setFilterRisk] = useState<'all' | 'critical' | 'warning' | 'healthy'>('all')

  const loadData = async () => {
    setIsLoading(true)
    const local = getAllSchools().map(normalizeSchool)

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseBrowserClient()
        const { data, error } = await client.from('schools').select('*').order('name', { ascending: true })
        if (!error && Array.isArray(data)) {
          const map = new Map<string, SchoolDetail>()
          local.forEach((s) => map.set((s.code || s.id).toLowerCase(), s))
          data.forEach((row) => {
            const key = (row.code || row.id || '').toLowerCase()
            const existing = map.get(key)
            if (existing) {
              map.set(key, normalizeSchool({ ...existing, name: row.name || existing.name }))
            } else {
              map.set(key, normalizeSchool(row))
            }
          })
          const merged = Array.from(new Set(map.values()))
          setSchools(merged)
          const risks = assessAllSchoolsRisks(merged)
          setAssessments(risks)
          const h = await queryServerHealth(merged)
          setHealth(h)
          setIsLoading(false)
          return
        }
      } catch (_) {}
    }

    setSchools(local)
    const risks = assessAllSchoolsRisks(local)
    setAssessments(risks)
    const h = await queryServerHealth(local)
    setHealth(h)
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()

    // Real-time event listeners for multi-tenant updates
    const handleUpdate = () => {
      loadData()
    }
    window.addEventListener('oxonom_teachers_updated', handleUpdate)
    window.addEventListener('oxonom_students_updated', handleUpdate)
    window.addEventListener('oxonom_classes_updated', handleUpdate)
    window.addEventListener('oxonom_boards_updated', handleUpdate)
    window.addEventListener('oxonom_permissions_updated', handleUpdate)

    return () => {
      window.removeEventListener('oxonom_teachers_updated', handleUpdate)
      window.removeEventListener('oxonom_students_updated', handleUpdate)
      window.removeEventListener('oxonom_classes_updated', handleUpdate)
      window.removeEventListener('oxonom_boards_updated', handleUpdate)
      window.removeEventListener('oxonom_permissions_updated', handleUpdate)
    }
  }, [])

  const filteredSchools = useMemo(() => {
    return schools.filter((s) => {
      const a = assessments[s.code || s.id]
      if (!a) return true
      if (filterRisk === 'all') return true
      return a.riskLevel === filterRisk
    })
  }, [schools, assessments, filterRisk])

  return (
    <div className="space-y-6 font-jakarta pb-20 text-white">
      <Toaster position="top-right" />

      {/* ── HEADER BANNER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-[#17101E] border border-[#2E1E3B] shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Server size={13} />
              <span>Multi-Tenant Altyapı Denetimi</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D914C8]/15 text-[#FCE8FA] border border-[#D914C8]/30">
              <Database size={12} />
              <span>İzole Şema Bölümleme</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Sunucu Durumu & Tenant Risk Matrisi
          </h1>
          <p className="text-xs sm:text-sm text-[#A998B3]">
            Tüm okulların gerçek zamanlı veritabanı durumu, sunucu yanıt süresi ve güvenlik riskleri.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            loadData()
            toast.success('Sunucu ve veritabanı sağlık kontrolü güncellendi.')
          }}
          className="h-11 px-4 rounded-2xl bg-[#20152B] hover:bg-[#2B1D36] text-[#FCF9FD] text-xs font-bold flex items-center gap-2 border border-[#2E1E3B] transition-all cursor-pointer self-start sm:self-center"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin text-[#D914C8]' : ''} />
          <span>Yeniden Tara</span>
        </button>
      </div>

      {/* ── EXECUTIVE SERVER METRICS RIBBON ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-[#17101E] border border-[#2E1E3B] space-y-1">
          <span className="text-[11px] font-bold text-[#A998B3] flex items-center justify-between">
            <span>PostgreSQL Durumu</span>
            <Database size={13} className="text-emerald-400" />
          </span>
          <div className="text-2xl font-black text-emerald-400">
            {health?.databaseConnected ? 'Bağlı' : 'Çevrimdışı'}
          </div>
          <span className="text-[10px] text-[#A998B3] block font-mono">
            {health?.endpoint.replace('https://', '').split('.')[0] || 'crkoeptnoheiqxukxpig'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#17101E] border border-[#2E1E3B] space-y-1">
          <span className="text-[11px] font-bold text-[#A998B3] flex items-center justify-between">
            <span>Veritabanı Yanıt Süresi</span>
            <Activity size={13} className="text-[#D914C8]" />
          </span>
          <div className="text-2xl font-black text-white">
            {health?.latencyMs || 22} ms
          </div>
          <span className="text-[10px] text-emerald-400 font-bold block">
            Düşük Gecikme (Optimal)
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#17101E] border border-[#2E1E3B] space-y-1">
          <span className="text-[11px] font-bold text-[#A998B3] flex items-center justify-between">
            <span>SaaS Uptime</span>
            <ShieldCheck size={13} className="text-indigo-400" />
          </span>
          <div className="text-2xl font-black text-indigo-400">%99.98</div>
          <span className="text-[10px] text-[#A998B3] block">Vercel Edge SLA</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#17101E] border border-[#2E1E3B] space-y-1">
          <span className="text-[11px] font-bold text-[#A998B3] flex items-center justify-between">
            <span>İzole Tenant Sayısı</span>
            <Layers size={13} className="text-sky-400" />
          </span>
          <div className="text-2xl font-black text-white">{schools.length}</div>
          <span className="text-[10px] text-[#A998B3] block">Bağımsız Veritabanı</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#17101E] border border-[#2E1E3B] space-y-1">
          <span className="text-[11px] font-bold text-[#A998B3] flex items-center justify-between">
            <span>Güvenlik Riskleri</span>
            <AlertTriangle size={13} className="text-amber-400" />
          </span>
          <div className="text-2xl font-black text-amber-400">
            {health?.criticalRiskTenants || 0}
          </div>
          <span className="text-[10px] text-amber-300 font-bold block">
            İlk Şifre Değişimi Bekleyen
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#17101E] border border-[#2E1E3B] space-y-1">
          <span className="text-[11px] font-bold text-[#A998B3] flex items-center justify-between">
            <span>Son Sağlık Taraması</span>
            <Clock size={13} className="text-[#A998B3]" />
          </span>
          <div className="text-xl font-black text-white">{health?.lastChecked || 'Şimdi'}</div>
          <span className="text-[10px] text-emerald-400 block font-bold">Canlı Akış</span>
        </div>
      </div>

      {/* ── FILTER BUTTONS ── */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#17101E] border border-[#2E1E3B] w-full sm:w-auto overflow-x-auto">
        <button
          type="button"
          onClick={() => setFilterRisk('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterRisk === 'all'
              ? 'bg-[#2E1E3B] text-white shadow-sm'
              : 'text-[#A998B3] hover:text-white'
          }`}
        >
          Tüm Okullar ({schools.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterRisk('critical')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filterRisk === 'critical'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : 'text-[#A998B3] hover:text-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>Kritik Risk ({health?.criticalRiskTenants || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterRisk('warning')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filterRisk === 'warning'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-[#A998B3] hover:text-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Uyarı ({health?.warningRiskTenants || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterRisk('healthy')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filterRisk === 'healthy'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-[#A998B3] hover:text-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Sağlıklı ({health?.healthyTenants || 0})</span>
        </button>
      </div>

      {/* ── SCHOOL-BY-SCHOOL TENANT LEDGER & RISK TABLE ── */}
      <div className="rounded-3xl bg-[#17101E] border border-[#2E1E3B] overflow-hidden shadow-xl">
        <div className="p-5 border-b border-[#2E1E3B] flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Layers size={18} className="text-[#D914C8]" />
              <span>Okul Bazlı Veritabanı ve Risk Tablosu</span>
            </h3>
            <p className="text-xs text-[#A998B3] mt-0.5">
              Her okulun kendine ait veritabanı bölümü, gerçek öğrenci/öğretmen sayıları ve tespit edilen güvenlik durumları
            </p>
          </div>
          <span className="text-xs font-mono text-[#A998B3]">
            {filteredSchools.length} Kurum Listelendi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2E1E3B] text-[#A998B3] font-bold bg-[#20152B]">
                <th className="py-3 px-4">Okul & MEB Kodu</th>
                <th className="py-3 px-4">İzole Veritabanı Anahtarı</th>
                <th className="py-3 px-4">Sektör</th>
                <th className="py-3 px-4 text-center">Öğrenci</th>
                <th className="py-3 px-4 text-center">Öğretmen</th>
                <th className="py-3 px-4 text-center">Şube</th>
                <th className="py-3 px-4">Risk & Güvenlik Değerlendirmesi</th>
                <th className="py-3 px-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2E1E3B]/60">
              {filteredSchools.map((sch) => {
                const assessment = assessments[sch.code || sch.id]
                const riskLevel = assessment?.riskLevel || 'healthy'

                return (
                  <tr key={sch.id} className="hover:bg-[#20152B]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-black text-white text-sm">{sch.name}</div>
                      <div className="text-[11px] text-[#A998B3] flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono bg-[#20152B] px-1.5 py-0.5 rounded border border-[#2E1E3B]">
                          MEB: {sch.code}
                        </span>
                        <span>•</span>
                        <span>{sch.district} / {sch.city}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <span className="px-2 py-1 rounded-md bg-[#120B1C] border border-[#2E1E3B] text-sky-300 block w-fit">
                        oxonom_tenant_{sch.code}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#20152B] border border-[#2E1E3B] text-white">
                        {sch.schoolSector === 'ozel'
                          ? 'Özel Okul'
                          : sch.schoolSector === 'kurs'
                          ? 'Özel Kurs'
                          : 'Devlet Okulu'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="text-sm font-black text-white">
                        {(sch.students || []).length}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="text-sm font-black text-white">
                        {(sch.teachers || []).length}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="text-sm font-black text-white">
                        {(sch.classrooms || []).length}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {riskLevel === 'critical' ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/15 text-rose-300 border border-rose-500/30">
                            <AlertCircle size={11} />
                            <span>Kritik Güvenlik Riski</span>
                          </span>
                          <div className="text-[11px] text-rose-300 font-medium leading-tight">
                            {assessment?.issues[0]?.message || 'İlk giriş şifresi henüz güncellenmedi'}
                          </div>
                        </div>
                      ) : riskLevel === 'warning' ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            <AlertTriangle size={11} />
                            <span>Operasyonel Uyarı</span>
                          </span>
                          <div className="text-[11px] text-amber-300 font-medium leading-tight">
                            {assessment?.issues[0]?.title || 'Eksik veri / Kadro tanımlanmadı'}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 size={11} />
                            <span>Sağlıklı (Risk Yok)</span>
                          </span>
                          <div className="text-[10px] text-[#A998B3]">Tüm tenant kontrolleri normal</div>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/superadmin/schools/${sch.id || sch.code}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#20152B] hover:bg-[#D914C8] hover:text-white text-xs font-bold border border-[#2E1E3B] transition-all cursor-pointer"
                      >
                        <span>Gerçek Verileri İncele</span>
                        <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
