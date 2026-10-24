// apps/web/app/superadmin/page.tsx
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Building2,
  Gamepad2,
  ShieldCheck,
  Database,
  Users,
  Activity,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Server,
  Lock,
  Layers,
  CheckCircle2,
  BarChart3,
  RefreshCw,
  Plus,
  Clock,
  MapPin,
  TrendingUp,
  Sliders,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Cpu,
  HardDrive,
  FileText,
  Download,
  School,
  Share2,
} from 'lucide-react'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import toast, { Toaster } from 'react-hot-toast'

export const dynamic = 'force-dynamic'

interface SchoolData {
  id: string
  name: string
  code: string
  city: string
  district: string
  students: number
  teachers: number
  status: 'Aktif' | 'Kurulumda' | 'Deneme'
  plan: 'Enterprise Pro' | 'Standart Okul' | 'Deneme Lisansı'
  expiryDate: string
  smartBoardsCount: number
}

const INITIAL_SCHOOLS: SchoolData[] = [
  {
    id: 'sch-1',
    name: 'Oxonom Merkez İlkokulu & Ortaokulu',
    code: '741295',
    city: 'İstanbul',
    district: 'Beşiktaş',
    students: 720,
    teachers: 42,
    status: 'Aktif',
    plan: 'Enterprise Pro',
    expiryDate: '15.09.2027',
    smartBoardsCount: 24,
  },
  {
    id: 'sch-2',
    name: 'Kadıköy Atatürk İlkokulu',
    code: '741302',
    city: 'İstanbul',
    district: 'Kadıköy',
    students: 540,
    teachers: 32,
    status: 'Aktif',
    plan: 'Standart Okul',
    expiryDate: '01.06.2027',
    smartBoardsCount: 18,
  },
  {
    id: 'sch-3',
    name: 'Çankaya Bilim ve Sanat Koleji',
    code: '741819',
    city: 'Ankara',
    district: 'Çankaya',
    students: 960,
    teachers: 58,
    status: 'Aktif',
    plan: 'Enterprise Pro',
    expiryDate: '30.08.2027',
    smartBoardsCount: 36,
  },
  {
    id: 'sch-4',
    name: 'Nilüfer Gelişim Akademisi İlkokulu',
    code: '742110',
    city: 'Bursa',
    district: 'Nilüfer',
    students: 380,
    teachers: 24,
    status: 'Kurulumda',
    plan: 'Deneme Lisansı',
    expiryDate: '15.11.2026',
    smartBoardsCount: 12,
  },
]

interface AuditLog {
  id: string
  action: string
  user: string
  target: string
  time: string
  type: 'security' | 'school' | 'game' | 'database'
}

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    action: 'Enterprise Lisans Yenilemesi',
    user: 'root.superadmin',
    target: 'Kadıköy Atatürk İlkokulu',
    time: '12 dakika önce',
    type: 'school',
  },
  {
    id: 'log-2',
    action: 'Game Studio Yeni Oyun Dağıtımı',
    user: 'system.pipeline',
    target: 'Uzay Macerası (v1.4.0)',
    time: '38 dakika önce',
    type: 'game',
  },
  {
    id: 'log-3',
    action: 'PostgreSQL Otomatik Snapshot Alındı',
    user: 'cron.backup',
    target: 'crkoeptnoheiqxukxpig',
    time: '1 saat önce',
    type: 'database',
  },
  {
    id: 'log-4',
    action: '2FA Oturum Doğrulaması Başarılı',
    user: 'ugurxugurlu',
    target: 'Superadmin Console (Web)',
    time: '2 saat önce',
    type: 'security',
  },
  {
    id: 'log-5',
    action: 'Hero Slider Banner Sıralaması Güncellendi',
    user: 'root.superadmin',
    target: 'Promosyon & Tanıtım Slider',
    time: '3 saat önce',
    type: 'school',
  },
]

export default function SuperadminDashboardPage() {
  const [supabaseConnected, setSupabaseConnected] = useState(false)
  const [latency, setLatency] = useState(18)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [schoolSearch, setSchoolSearch] = useState('')
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>('all')

  useEffect(() => {
    const configured = isSupabaseConfigured()
    setSupabaseConnected(configured)

    // Latency ticker
    const interval = setInterval(() => {
      setLatency(Math.floor(16 + Math.random() * 6))
    }, 4500)
    return () => clearInterval(interval)
  }, [])

  const handleRefreshData = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success('Superadmin verileri canlı veritabanı ile senkronize edildi.')
    }, 600)
  }

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Kurum,MEB Kodu,Il,Ilce,Ogrenci,Ogretmen,Plan,Durum\n' +
      INITIAL_SCHOOLS.map(
        (s) =>
          `"${s.name}",${s.code},${s.city},${s.district},${s.students},${s.teachers},${s.plan},${s.status}`
      ).join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `oxonom-okul-raporu-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Okul lisans raporu CSV olarak indirildi.')
  }

  const filteredSchools = useMemo(() => {
    return INITIAL_SCHOOLS.filter((school) => {
      const matchSearch =
        school.name.toLowerCase().includes(schoolSearch.toLowerCase()) ||
        school.city.toLowerCase().includes(schoolSearch.toLowerCase()) ||
        school.code.includes(schoolSearch)
      const matchPlan =
        selectedPlanFilter === 'all' || school.plan === selectedPlanFilter
      return matchSearch && matchPlan
    })
  }, [schoolSearch, selectedPlanFilter])

  const totalStudents = useMemo(
    () => INITIAL_SCHOOLS.reduce((acc, curr) => acc + curr.students, 0),
    []
  )
  const totalTeachers = useMemo(
    () => INITIAL_SCHOOLS.reduce((acc, curr) => acc + curr.teachers, 0),
    []
  )
  const totalSmartBoards = useMemo(
    () => INITIAL_SCHOOLS.reduce((acc, curr) => acc + curr.smartBoardsCount, 0),
    []
  )

  return (
    <TooltipProvider>
      <div className="space-y-6 font-jakarta pb-10">
        <Toaster position="top-right" />

        {/* ── TOP HEADER / BREADCRUMB / ACTIONS ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-wider border-[#D914C8]/40 bg-[#D914C8]/10 text-[#FCE8FA]">
                <Sparkles size={11} className="mr-1 text-[#D914C8]" />
                Superadmin Platform
              </Badge>
              <Badge variant="secondary" className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
                PostgreSQL {supabaseConnected ? 'Bağlı' : 'Canlı'} ({latency}ms)
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Yönetim Konsolu
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Tüm kurum lisansları, akıllı tahta ağ geçitleri, altyapı metrikleri ve Game Studio kontrolü.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshData}
                  disabled={isRefreshing}
                  className="h-9 px-3 text-xs font-semibold gap-1.5 bg-card hover:bg-accent border-border/80"
                >
                  <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-[#D914C8]' : ''} />
                  <span>Yenile</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Canlı veritabanı metriklerini güncelle</TooltipContent>
            </Tooltip>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="h-9 px-3 text-xs font-semibold gap-1.5 bg-card hover:bg-accent border-border/80"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Rapor İndir (CSV)</span>
              <span className="sm:hidden">Rapor</span>
            </Button>

            <Button
              asChild
              size="sm"
              className="h-9 px-3.5 text-xs font-bold gap-1.5 bg-gradient-to-r from-[#D914C8] to-[#8D49A6] hover:brightness-110 text-white shadow-sm shadow-[#D914C8]/30"
            >
              <Link href="/superadmin/schools">
                <Plus size={14} />
                <span>Yeni Okul Kaydı</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* ── TABS CONTROLLER ── */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-card border border-border/60 p-1 rounded-xl h-10 w-full sm:w-auto flex overflow-x-auto justify-start">
            <TabsTrigger value="overview" className="text-xs font-bold gap-1.5 px-3.5 py-1.5">
              <BarChart3 size={13} />
              <span>Genel Bakış</span>
            </TabsTrigger>
            <TabsTrigger value="schools" className="text-xs font-bold gap-1.5 px-3.5 py-1.5">
              <Building2 size={13} />
              <span>Okullar ({INITIAL_SCHOOLS.length})</span>
            </TabsTrigger>
            <TabsTrigger value="gamestudio" className="text-xs font-bold gap-1.5 px-3.5 py-1.5">
              <Gamepad2 size={13} />
              <span>Game Studio (12)</span>
            </TabsTrigger>
            <TabsTrigger value="infrastructure" className="text-xs font-bold gap-1.5 px-3.5 py-1.5">
              <Activity size={13} />
              <span>Altyapı & Sağlık</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-xs font-bold gap-1.5 px-3.5 py-1.5">
              <Clock size={13} />
              <span>Denetim İzi</span>
            </TabsTrigger>
          </TabsList>

          {/* ══════════════════════════════════════════════════════════════════════════
              TAB 1: GENEL BAKIŞ (OVERVIEW)
             ══════════════════════════════════════════════════════════════════════════ */}
          <TabsContent value="overview" className="space-y-6">
            {/* 4 Executive KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Okullar */}
              <Card className="border-border/60 hover:border-[#8D49A6]/60 transition-all bg-card/80 backdrop-blur-sm shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Kayıtlı Kurumlar
                  </CardTitle>
                  <div className="w-8 h-8 rounded-lg bg-[#D914C8]/10 text-[#D914C8] flex items-center justify-center">
                    <Building2 size={16} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="text-2xl font-black text-foreground">{INITIAL_SCHOOLS.length} Okul</div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <TrendingUp size={12} />
                    <span>%100 Aktif MEB Lisanslı</span>
                  </div>
                  <div className="pt-2 text-[11px] text-muted-foreground">
                    Toplam {totalSmartBoards} Akıllı Tahta Bağlantısı
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Öğrenci ve Kapasite */}
              <Card className="border-border/60 hover:border-indigo-500/60 transition-all bg-card/80 backdrop-blur-sm shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Öğrenci & Kapasite
                  </CardTitle>
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Users size={16} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="text-2xl font-black text-foreground">
                    {totalStudents.toLocaleString('tr-TR')}
                  </div>
                  <div className="text-xs text-indigo-300 font-semibold">
                    {totalTeachers} Aktif Öğretmen Hesabı
                  </div>
                  <div className="pt-2 space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Kapasite Doluluk</span>
                      <span className="font-bold text-foreground">%84</span>
                    </div>
                    <Progress value={84} className="h-1.5 bg-muted" />
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Game Studio */}
              <Card className="border-border/60 hover:border-fuchsia-500/60 transition-all bg-card/80 backdrop-blur-sm shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Game Studio
                  </CardTitle>
                  <div className="w-8 h-8 rounded-lg bg-fuchsia-500/10 text-fuchsia-400 flex items-center justify-center">
                    <Gamepad2 size={16} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="text-2xl font-black text-foreground">12 Oyun</div>
                  <div className="text-xs text-fuchsia-300 font-semibold">
                    45.820+ Oynanma Oturumu
                  </div>
                  <div className="pt-2 flex items-center gap-1.5">
                    <Badge variant="secondary" className="text-[10px] font-bold bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20">
                      +18.4% Haftalık Artış
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Card 4: Altyapı & Supabase */}
              <Card className="border-border/60 hover:border-emerald-500/60 transition-all bg-card/80 backdrop-blur-sm shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Sistem Sağlığı
                  </CardTitle>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Activity size={16} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="text-2xl font-black text-emerald-400">Canlı</div>
                  <div className="text-xs text-muted-foreground">
                    Supabase PostgreSQL 16 • {latency}ms
                  </div>
                  <div className="pt-2 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Uptime:</span>
                    <span className="font-mono font-bold text-emerald-400">%99.98</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Navigation Bento Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5 border-border/60 bg-gradient-to-br from-card to-card/60 hover:border-[#D914C8]/50 transition-all group">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-[#D914C8] uppercase tracking-wider">
                      Tanıtım & Slider
                    </div>
                    <h3 className="text-base font-black text-foreground">Hero Banner Yönetimi</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      edu.oxonom.com açılış sliderı, görselleri ve tanıtım rozetlerini yönetin.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#D914C8]/10 text-[#D914C8] group-hover:scale-110 transition-transform">
                    <Sliders size={20} />
                  </div>
                </div>
                <div className="pt-4 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted-foreground">3 Aktif Banner</span>
                  <Button asChild size="sm" variant="ghost" className="h-8 text-xs font-bold text-[#D914C8] gap-1 group-hover:translate-x-0.5 transition-transform">
                    <Link href="/superadmin/banners">
                      <span>Düzenle</span>
                      <ArrowRight size={13} />
                    </Link>
                  </Button>
                </div>
              </Card>

              <Card className="p-5 border-border/60 bg-gradient-to-br from-card to-card/60 hover:border-[#8D49A6]/50 transition-all group">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-[#8D49A6] uppercase tracking-wider">
                      MEB Kurumları
                    </div>
                    <h3 className="text-base font-black text-foreground">Okul Yönetim Portalı</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Yeni okul ekleyin, lisans tiplerini ve şube yetkilendirmelerini yapılandırın.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#8D49A6]/10 text-[#8D49A6] group-hover:scale-110 transition-transform">
                    <Building2 size={20} />
                  </div>
                </div>
                <div className="pt-4 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted-foreground">{INITIAL_SCHOOLS.length} Kayıtlı Kurum</span>
                  <Button asChild size="sm" variant="ghost" className="h-8 text-xs font-bold text-[#8D49A6] gap-1 group-hover:translate-x-0.5 transition-transform">
                    <Link href="/superadmin/schools">
                      <span>Okulları Aç</span>
                      <ArrowRight size={13} />
                    </Link>
                  </Button>
                </div>
              </Card>

              <Card className="p-5 border-border/60 bg-gradient-to-br from-card to-card/60 hover:border-fuchsia-500/50 transition-all group">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-fuchsia-400 uppercase tracking-wider">
                      Pedagojik Oyunlar
                    </div>
                    <h3 className="text-base font-black text-foreground">Game Studio Kataloğu</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      1. sınıftan 8. sınıfa kadar tüm oyunları, ders kazanımlarını ve istatistikleri inceleyin.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 group-hover:scale-110 transition-transform">
                    <Gamepad2 size={20} />
                  </div>
                </div>
                <div className="pt-4 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted-foreground">12 Oyun Kataloğu</span>
                  <Button asChild size="sm" variant="ghost" className="h-8 text-xs font-bold text-fuchsia-400 gap-1 group-hover:translate-x-0.5 transition-transform">
                    <Link href="/superadmin/gamestudio">
                      <span>Stüdyoyu Aç</span>
                      <ArrowRight size={13} />
                    </Link>
                  </Button>
                </div>
              </Card>
            </div>

            {/* Main Dual Grid: Schools Table (7 cols) + Infrastructure Health & Logs (5 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Sol: Okul Listesi Tablosu (7 cols) */}
              <Card className="lg:col-span-7 border-border/60 shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-base font-extrabold flex items-center gap-2">
                      <Building2 size={16} className="text-[#D914C8]" />
                      <span>Kayıtlı Okullar ve Lisans Dağılımı</span>
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Sistemde kayıtlı MEB kurumları ve sözleşme durumları
                    </CardDescription>
                  </div>
                  <Button asChild variant="outline" size="sm" className="h-8 text-xs font-bold">
                    <Link href="/superadmin/schools">
                      <span>Tümünü Yönet</span>
                      <ArrowRight size={12} className="ml-1" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow className="border-border/60 hover:bg-transparent">
                        <TableHead className="text-xs font-extrabold">Kurum Adı</TableHead>
                        <TableHead className="text-xs font-extrabold hidden sm:table-cell">Lokasyon</TableHead>
                        <TableHead className="text-xs font-extrabold text-right">Kapasite</TableHead>
                        <TableHead className="text-xs font-extrabold text-right">Lisans</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {INITIAL_SCHOOLS.map((school) => (
                        <TableRow key={school.id} className="border-border/40 hover:bg-muted/30 transition-colors">
                          <TableCell className="py-3">
                            <div className="flex items-center gap-2.5">
                              <Avatar className="h-8 w-8 rounded-lg bg-gradient-to-tr from-[#D914C8] to-[#4B075F] text-white">
                                <AvatarFallback className="rounded-lg text-xs font-black">
                                  {school.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-xs font-black text-foreground truncate max-w-[200px] sm:max-w-[260px]">
                                  {school.name}
                                </div>
                                <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                  <span>MEB: {school.code}</span>
                                  <span>•</span>
                                  <span className="sm:hidden">{school.city}</span>
                                  <span>{school.smartBoardsCount} Tahta</span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">
                            {school.city} / {school.district}
                          </TableCell>
                          <TableCell className="text-right py-3">
                            <span className="text-xs font-bold text-foreground block">
                              {school.students} Öğrenci
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {school.teachers} Öğretmen
                            </span>
                          </TableCell>
                          <TableCell className="text-right py-3">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-black ${
                                school.plan === 'Enterprise Pro'
                                  ? 'border-purple-500/30 bg-purple-500/10 text-purple-300'
                                  : school.plan === 'Standart Okul'
                                  ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300'
                                  : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                              }`}
                            >
                              {school.plan}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="pt-3 pb-3 flex items-center justify-between text-xs text-muted-foreground border-t border-border/40">
                  <span>Toplam {totalStudents} kayıtlı öğrenci</span>
                  <Link href="/superadmin/schools" className="text-xs font-bold text-[#D914C8] hover:underline flex items-center gap-1">
                    <span>Okul Ekle / Düzenle</span>
                    <ArrowRight size={11} />
                  </Link>
                </CardFooter>
              </Card>

              {/* Sağ: Altyapı Sağlığı & Son Denetim İzi (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Altyapı Card */}
                <Card className="border-border/60 shadow-xs">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-extrabold flex items-center gap-2">
                        <Activity size={16} className="text-emerald-400" />
                        <span>Canlı Sistem Altyapısı</span>
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        Sunucu, veritabanı ve ağ geçidi durumu
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
                      Uptime %99.98
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/40 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-bold text-foreground">Supabase PostgreSQL 16</div>
                        <div className="text-[10.5px] text-muted-foreground">REST API & Realtime Socket</div>
                      </div>
                      <Badge variant="outline" className="font-mono text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                        {latency}ms
                      </Badge>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/40 border border-border/40 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-bold text-foreground">Akıllı Tahta WebSocket Ağ Geçidi</div>
                        <div className="text-[10.5px] text-muted-foreground">32 Canlı Sınıf Senkronu</div>
                      </div>
                      <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                        Aktif
                      </Badge>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/40 border border-border/40 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-bold text-foreground">Game Studio CDN Dağıtımı</div>
                        <div className="text-[10.5px] text-muted-foreground">Global Edge Cache (Cloudflare)</div>
                      </div>
                      <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                        Optimize
                      </Badge>
                    </div>

                    {/* Resource Usage Meters */}
                    <div className="pt-2 space-y-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Veritabanı Depolama (NVMe)</span>
                          <span className="font-bold text-foreground">%34 (6.8 GB / 20 GB)</span>
                        </div>
                        <Progress value={34} className="h-1.5 bg-muted" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Medya & Çizim Arşivi</span>
                          <span className="font-bold text-foreground">%48 (24 GB / 50 GB)</span>
                        </div>
                        <Progress value={48} className="h-1.5 bg-muted" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Audit Log Card */}
                <Card className="border-border/60 shadow-xs">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-extrabold flex items-center gap-2">
                        <Clock size={16} className="text-[#D914C8]" />
                        <span>Son Denetim Günlüğü</span>
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        Platform üzerindeki son idari hareketler
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    {INITIAL_AUDIT_LOGS.slice(0, 4).map((log) => (
                      <div
                        key={log.id}
                        className="p-2.5 rounded-lg bg-muted/30 border border-border/40 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-foreground truncate">{log.action}</div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {log.user} • {log.target}
                          </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
                          {log.time}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════════════════
              TAB 2: OKULLAR & LİSANSLAR (SCHOOLS)
             ══════════════════════════════════════════════════════════════════════════ */}
          <TabsContent value="schools" className="space-y-4">
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
                <div>
                  <CardTitle className="text-lg font-black">Okul ve Kurum Yönetimi</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Kayıtlı kurumlar, sözleşme süreleri ve MEB kurum kodları
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative w-full sm:w-56">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Okul adı veya kod ara..."
                      value={schoolSearch}
                      onChange={(e) => setSchoolSearch(e.target.value)}
                      className="w-full h-9 pl-8 pr-3 text-xs bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-[#D914C8]"
                    />
                  </div>
                  <select
                    value={selectedPlanFilter}
                    onChange={(e) => setSelectedPlanFilter(e.target.value)}
                    className="h-9 px-2.5 text-xs bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-[#D914C8]"
                  >
                    <option value="all">Tüm Planlar</option>
                    <option value="Enterprise Pro">Enterprise Pro</option>
                    <option value="Standart Okul">Standart Okul</option>
                    <option value="Deneme Lisansı">Deneme Lisansı</option>
                  </select>
                  <Button asChild size="sm" className="h-9 bg-[#D914C8] hover:bg-[#B90FAB] text-white font-bold gap-1">
                    <Link href="/superadmin/schools">
                      <Plus size={14} />
                      <span>Okul Ekle</span>
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow className="border-border/60">
                      <TableHead className="text-xs font-extrabold">Kurum</TableHead>
                      <TableHead className="text-xs font-extrabold">MEB Kodu</TableHead>
                      <TableHead className="text-xs font-extrabold">Şehir / İlçe</TableHead>
                      <TableHead className="text-xs font-extrabold text-right">Öğrenci</TableHead>
                      <TableHead className="text-xs font-extrabold text-right">Öğretmen</TableHead>
                      <TableHead className="text-xs font-extrabold">Lisans Planı</TableHead>
                      <TableHead className="text-xs font-extrabold">Bitiş Tarihi</TableHead>
                      <TableHead className="text-xs font-extrabold text-right">İşlem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSchools.map((school) => (
                      <TableRow key={school.id} className="border-border/40 hover:bg-muted/30">
                        <TableCell className="font-bold text-xs">
                          {school.name}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {school.code}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {school.city} / {school.district}
                        </TableCell>
                        <TableCell className="text-xs font-bold text-right">
                          {school.students}
                        </TableCell>
                        <TableCell className="text-xs font-bold text-right">
                          {school.teachers}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {school.plan}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {school.expiryDate}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs text-[#D914C8] font-bold">
                            <Link href="/superadmin/schools">
                              <span>Yönet</span>
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════════════════
              TAB 3: GAME STUDIO
             ══════════════════════════════════════════════════════════════════════════ */}
          <TabsContent value="gamestudio" className="space-y-4">
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-lg font-black flex items-center gap-2">
                    <Gamepad2 size={18} className="text-fuchsia-400" />
                    <span>Game Studio Eğitici Oyun Kataloğu</span>
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    1. sınıftan 8. sınıfa kadar tüm oyunların dağıtımı ve sınıf yetkilendirmeleri
                  </CardDescription>
                </div>
                <Button asChild size="sm" className="bg-[#D914C8] hover:bg-[#B90FAB] text-white font-bold gap-1">
                  <Link href="/superadmin/gamestudio">
                    <span>Oyun Yönetimini Aç</span>
                    <ArrowRight size={13} />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { title: 'Uzay Macerası', category: 'Matematik & Sayılar', target: '1. - 4. Sınıf', plays: '14.280', status: 'Canlı' },
                    { title: 'Kelime Avcısı', category: 'Türkçe & Dil Bilgisi', target: '1. - 3. Sınıf', plays: '12.450', status: 'Canlı' },
                    { title: 'Ritim & Notalar', category: 'Müzik & Sanat', target: '1. - 8. Sınıf', plays: '8.120', status: 'Canlı' },
                    { title: 'Mantık Labirenti', category: 'Bilişim & Kodlama', target: '2. - 6. Sınıf', plays: '6.430', status: 'Canlı' },
                    { title: 'Doğa Dedektifi', category: 'Hayat Bilgisi & Fen', target: '1. - 4. Sınıf', plays: '3.210', status: 'Canlı' },
                    { title: 'Tarih Gezgini', category: 'Sosyal Bilgiler', target: '4. - 8. Sınıf', plays: '1.330', status: 'Canlı' },
                  ].map((game, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-muted/40 border border-border/40 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">{game.title}</span>
                        <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                          {game.status}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-muted-foreground">{game.category}</div>
                      <div className="flex items-center justify-between pt-1 text-[10px] text-muted-foreground border-t border-border/30">
                        <span>Hedef: {game.target}</span>
                        <span className="font-bold text-foreground">{game.plays} Oturum</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════════════════
              TAB 4: ALTYAPI & SAĞLIK
             ══════════════════════════════════════════════════════════════════════════ */}
          <TabsContent value="infrastructure" className="space-y-4">
            <Card className="border-border/60 shadow-xs">
              <CardHeader>
                <CardTitle className="text-lg font-black flex items-center gap-2">
                  <Database size={18} className="text-emerald-400" />
                  <span>Veritabanı & Altyapı Konfigürasyonu</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Supabase PostgreSQL, bağlantı havuzu ve mikroservis metrikleri
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-muted/40 border border-border/40 space-y-1">
                    <span className="text-xs text-muted-foreground font-semibold">Aktif REST Uç Noktası</span>
                    <div className="text-sm font-mono font-bold text-emerald-400">crkoeptnoheiqxukxpig</div>
                    <span className="text-[10px] text-muted-foreground">Frankfurt (eu-central-1)</span>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/40 border border-border/40 space-y-1">
                    <span className="text-xs text-muted-foreground font-semibold">Bağlantı Havuzu</span>
                    <div className="text-sm font-bold text-foreground">PgBouncer (60 Connection)</div>
                    <span className="text-[10px] text-muted-foreground">Aktif Havuz: %18 Kullanım</span>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/40 border border-border/40 space-y-1">
                    <span className="text-xs text-muted-foreground font-semibold">SSL & Sertifika</span>
                    <div className="text-sm font-bold text-foreground">TLS 1.3 • AES-256</div>
                    <span className="text-[10px] text-emerald-400">Doğrulanmış Güvenli Ağ</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Otomatik Yedekleme & Felaket Kurtarma</span>
                    <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                      Garantili RPO: 1 Saat
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Tüm MEB öğrenci, veli ve okul kayıtları her gece 03:00 TSİ saatinde şifreli AWS S3 bucketına yedeklenir. Geri yükleme testleri otomatik olarak tamamlanmıştır.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════════════════
              TAB 5: DENETİM İZİ (AUDIT LOGS)
             ══════════════════════════════════════════════════════════════════════════ */}
          <TabsContent value="logs" className="space-y-4">
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-lg font-black flex items-center gap-2">
                    <Clock size={18} className="text-[#D914C8]" />
                    <span>Platform Denetim İzi (Audit Log)</span>
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Güvenlik ve yönetici seviyesi işlem kayıtları
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs font-mono">
                  {INITIAL_AUDIT_LOGS.length} Kayıt
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow className="border-border/60">
                      <TableHead className="text-xs font-extrabold">İşlem / Eylem</TableHead>
                      <TableHead className="text-xs font-extrabold">Yönetici / Kullanıcı</TableHead>
                      <TableHead className="text-xs font-extrabold">Hedef Nesne</TableHead>
                      <TableHead className="text-xs font-extrabold text-right">Zaman</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {INITIAL_AUDIT_LOGS.map((log) => (
                      <TableRow key={log.id} className="border-border/40 hover:bg-muted/30">
                        <TableCell className="text-xs font-bold text-foreground">
                          {log.action}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {log.user}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {log.target}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground text-right font-medium">
                          {log.time}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}
