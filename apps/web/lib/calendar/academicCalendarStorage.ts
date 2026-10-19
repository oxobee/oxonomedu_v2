/**
 * MEB & Okul 2026-2027 Akademik Çalışma Takvimi & Etkinlik Deposu
 * Milli Eğitim Bakanlığı resmi takvimi ve kurum etkinliklerini yönetir.
 */

export type AcademicEventCategory =
  | 'holiday' // MEB Resmi Tatiller & Ara Tatiller
  | 'meb_exam' // MEB Ülke Geneli Ortak Sınavları
  | 'school_exam' // Okul İçi Sınav Haftaları
  | 'celebration' // Milli Bayramlar & Anma Günleri
  | 'meeting' // Veli & Zümre Toplantıları
  | 'activity' // Kültürel, Sanatsal & Bilimsel Etkinlikler

export interface AcademicCalendarEvent {
  id: string
  title: string
  category: AcademicEventCategory
  categoryLabel: string
  startDate: string // YYYY-MM-DD
  endDate?: string // YYYY-MM-DD
  time?: string // örn: "09:00 - 16:30" veya "Tam Gün"
  targetAudience: string // örn: "Tüm Okul", "9. Sınıflar", "Öğretmenler", "Veliler"
  location: string // örn: "Tüm Türkiye / Okul Kampüsü", "Konferans Salonu"
  description: string // MEB açıklaması ve etkinlik detayları
  isOfficialMeb: boolean
  color: string // Tailwind color key, örn: "rose", "indigo", "emerald", "amber", "cyan", "purple"
  createdAt?: string
}

export const ACADEMIC_CATEGORIES: {
  id: AcademicEventCategory
  label: string
  color: string
  badgeBg: string
  dot: string
}[] = [
  {
    id: 'holiday',
    label: 'MEB Resmi Tatiller',
    color: 'rose',
    badgeBg: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30',
    dot: 'bg-rose-500',
  },
  {
    id: 'meb_exam',
    label: 'MEB Ortak Sınavları',
    color: 'indigo',
    badgeBg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    dot: 'bg-indigo-500',
  },
  {
    id: 'celebration',
    label: 'Milli Bayramlar & Anma',
    color: 'amber',
    badgeBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
    dot: 'bg-amber-500',
  },
  {
    id: 'school_exam',
    label: 'Okul Sınav Haftaları',
    color: 'cyan',
    badgeBg: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
    dot: 'bg-cyan-500',
  },
  {
    id: 'meeting',
    label: 'Toplantılar & Kurullar',
    color: 'purple',
    badgeBg: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30',
    dot: 'bg-purple-500',
  },
  {
    id: 'activity',
    label: 'Etkinlik & Bilim Fuarları',
    color: 'emerald',
    badgeBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-500',
  },
]

// MEB 2026-2027 Resmi Çalışma Takvimi ve Kurumsal Etkinlikler
export const CANONICAL_ACADEMIC_EVENTS: AcademicCalendarEvent[] = [
  {
    id: 'meb-2026-start',
    title: '2026–2027 Eğitim Öğretim Yılı Açılışı (1. Dönem Ders Zili)',
    category: 'holiday',
    categoryLabel: 'MEB Resmi Başlangıç',
    startDate: '2026-09-14',
    time: '08:30',
    targetAudience: 'Tüm Öğrenci, Öğretmen ve Veliler',
    location: 'Tüm MEB Okulları',
    description:
      'Milli Eğitim Bakanlığı 2026-2027 eğitim öğretim yılı birinci dönemi ilk ders ziliyle resmen başlamıştır. İlk hafta oryantasyon ve sınıf tanışma programları uygulanmaktadır.',
    isOfficialMeb: true,
    color: 'emerald',
  },
  {
    id: 'meb-2026-cumhuriyet',
    title: '29 Ekim Cumhuriyet Bayramı (Resmi Tatil)',
    category: 'celebration',
    categoryLabel: 'Milli Bayram',
    startDate: '2026-10-28',
    endDate: '2026-10-29',
    time: '1.5 Gün Resmi Tatil (28 Ekim 13:00 Başlar)',
    targetAudience: 'Tüm Okul',
    location: 'Okul Tören Alanı & Tüm Türkiye',
    description:
      'Cumhuriyetimizin 103. yılı kutlama etkinlikleri kapsamında okulumuzda resmi tören icra edilecek olup 28 Ekim Çarşamba saat 13:00 itibarıyla resmi tatil başlamaktadır.',
    isOfficialMeb: true,
    color: 'rose',
  },
  {
    id: 'meb-2026-ataturk',
    title: "10 Kasım Atatürk'ü Anma Günü ve Atatürk Haftası",
    category: 'celebration',
    categoryLabel: 'Resmi Anma Günü',
    startDate: '2026-11-10',
    time: '09:05 Anma Töreni',
    targetAudience: 'Tüm Öğrenci ve Öğretmenler',
    location: 'Okul Konferans Salonu',
    description:
      "Cumhuriyetimizin kurucusu Gazi Mustafa Kemal Atatürk'ün ebediyete irtihalinin 88. yıl dönümünde saat 09:05'te saygı duruşu ve anma programı gerçekleştirilecektir.",
    isOfficialMeb: true,
    color: 'amber',
  },
  {
    id: 'meb-2026-ortak-sinav-1',
    title: 'MEB 1. Dönem 1. Ülke Geneli Ortak Yazılı Sınavları',
    category: 'meb_exam',
    categoryLabel: 'MEB Ortak Sınavı',
    startDate: '2026-11-11',
    endDate: '2026-11-12',
    time: '09:25 - 11:00',
    targetAudience: '6, 7, 9 ve 10. Sınıflar',
    location: 'Sınıf Derslikleri',
    description:
      'Milli Eğitim Bakanlığı tarafından belirlenen derslerde açık uçlu ve kısa cevaplı sorularla ülke genelinde ortak yazılı sınavlar gerçekleştirilecektir. (11 Kasım: 6. Sınıf Matematik, 12 Kasım: 10. Sınıf Edebiyat).',
    isOfficialMeb: true,
    color: 'indigo',
  },
  {
    id: 'meb-2026-ara-tatil-1',
    title: '1. Dönem Ara Tatili (Kasım Tatili)',
    category: 'holiday',
    categoryLabel: 'MEB Ara Tatil',
    startDate: '2026-11-16',
    endDate: '2026-11-20',
    time: '5 İş Günü (Hafta sonuyla 9 Gün)',
    targetAudience: 'Tüm Öğrenciler ve Öğretmenler',
    location: 'Tüm Türkiye',
    description:
      '2026-2027 eğitim öğretim yılının ilk ara tatili 16 Kasım Pazartesi başlayıp 20 Kasım Cuma günü sona erecektir. Dersler 23 Kasım Pazartesi günü kaldığı yerden devam edecektir.',
    isOfficialMeb: true,
    color: 'rose',
  },
  {
    id: 'meb-2026-ogretmenler-gunu',
    title: '24 Kasım Öğretmenler Günü Özel Programı',
    category: 'celebration',
    categoryLabel: 'Özel Gün & Kutlama',
    startDate: '2026-11-24',
    time: '13:30 - 15:30',
    targetAudience: 'Tüm Öğretmen ve Öğrenciler',
    location: 'Okul Kültür Merkezi',
    description:
      'Geleceğimizin mimarı öğretmenlerimiz onuruna hazırlanan öğrenci şiir dinletisi, orkestra konseri ve plaket takdim töreni icra edilecektir.',
    isOfficialMeb: true,
    color: 'purple',
  },
  {
    id: 'school-2026-veli-toplantisi',
    title: '1. Dönem Genel Veli ve Akademik Değerlendirme Toplantısı',
    category: 'meeting',
    categoryLabel: 'Veli Toplantısı',
    startDate: '2026-12-13',
    time: '10:00 - 13:00',
    targetAudience: '9. ve 10. Sınıf Velileri',
    location: 'Sınıf Derslikleri & Konferans Salonu',
    description:
      'Öğrencilerimizin ilk çeyrek akademik not gelişimleri, devamsızlık analizleri ve rehberlik gözlemleri velilerimizle birebir paylaşılacaktır.',
    isOfficialMeb: false,
    color: 'purple',
  },
  {
    id: 'school-2026-bilim-fuari',
    title: 'Oxonom Geleneksel Bilim, Kodlama ve TÜBİTAK Proje Sergisi',
    category: 'activity',
    categoryLabel: 'Bilim & Proje Fuarı',
    startDate: '2026-12-23',
    endDate: '2026-12-24',
    time: '10:00 - 16:00',
    targetAudience: 'Tüm Okul ve Ziyaretçiler',
    location: 'Okul Kapalı Spor & Sergi Salonu',
    description:
      'Öğrencilerimizin akıllı tahta, Python yapay zeka, fen deneyleri ve robotik kodlama projelerinin sergilendiği yıl sonu bilim şenliği.',
    isOfficialMeb: false,
    color: 'emerald',
  },
  {
    id: 'meb-2027-yilbasi',
    title: 'Yılbaşı Resmi Tatili',
    category: 'holiday',
    categoryLabel: 'Resmi Tatil',
    startDate: '2027-01-01',
    time: 'Tam Gün',
    targetAudience: 'Tüm Okul',
    location: 'Tüm Türkiye',
    description: '1 Ocak Yılbaşı resmi tatili nedeniyle okullar tatildir.',
    isOfficialMeb: true,
    color: 'rose',
  },
  {
    id: 'meb-2027-ortak-sinav-2',
    title: 'MEB 1. Dönem 2. Ülke Geneli Ortak Yazılı Sınavları',
    category: 'meb_exam',
    categoryLabel: 'MEB Ortak Sınavı',
    startDate: '2027-01-05',
    endDate: '2027-01-06',
    time: '09:25 - 11:00',
    targetAudience: '7. ve 9. Sınıflar',
    location: 'Sınıf Derslikleri',
    description:
      'Milli Eğitim Bakanlığı ortak sınav takvimi uyarınca 5 Ocak Salı günü 7. Sınıf Türkçe, 6 Ocak Çarşamba günü 9. Sınıf Matematik ortak sınavları uygulanacaktır.',
    isOfficialMeb: true,
    color: 'indigo',
  },
  {
    id: 'meb-2027-karne-1',
    title: '1. Dönem Sonu ve Karne Dağıtım Töreni',
    category: 'school_exam',
    categoryLabel: 'Dönem Sonu / Karne',
    startDate: '2027-01-22',
    time: '10:00 - 12:30',
    targetAudience: 'Tüm Öğrenciler ve Veliler',
    location: 'Tüm Şube Derslikleri',
    description:
      '2026-2027 eğitim öğretim yılı 1. dönem karne, takdir, teşekkür ve onur belgelerinin öğrencilere takdim edilmesiyle birinci dönem tamamlanacaktır.',
    isOfficialMeb: true,
    color: 'cyan',
  },
  {
    id: 'meb-2027-somestr',
    title: 'Yarıyıl (Sömestr) Tatili',
    category: 'holiday',
    categoryLabel: 'Yarıyıl Tatili',
    startDate: '2027-01-25',
    endDate: '2027-02-05',
    time: '2 Hafta (15 Gün)',
    targetAudience: 'Tüm Öğrenciler',
    location: 'Tüm Türkiye',
    description:
      'Öğrencilerimiz için iki haftalık kış sömestr dinlenme tatili. 2. dönem ders zili 8 Şubat 2027 Pazartesi günü çalacaktır.',
    isOfficialMeb: true,
    color: 'rose',
  },
  {
    id: 'meb-2027-donem-2-baslangic',
    title: '2. Dönem Başlangıcı (İkinci Dönem İlk Ders Zili)',
    category: 'holiday',
    categoryLabel: 'MEB Dönem Başlangıcı',
    startDate: '2027-02-08',
    time: '08:30',
    targetAudience: 'Tüm Okul',
    location: 'Tüm MEB Okulları',
    description: '2026-2027 Eğitim Öğretim Yılı 2. Dönemi tüm kademelerde derslerle başlamaktadır.',
    isOfficialMeb: true,
    color: 'emerald',
  },
  {
    id: 'meb-2027-ara-tatil-2',
    title: '2. Dönem Ara Tatili (Bahar Tatili)',
    category: 'holiday',
    categoryLabel: 'MEB Ara Tatil',
    startDate: '2027-03-08',
    endDate: '2027-03-12',
    time: '5 İş Günü',
    targetAudience: 'Tüm Öğrenciler ve Öğretmenler',
    location: 'Tüm Türkiye',
    description:
      'İkinci dönemin ara tatili 8 Mart Pazartesi başlayıp 12 Mart Cuma günü tamamlanacaktır.',
    isOfficialMeb: true,
    color: 'rose',
  },
  {
    id: 'meb-2027-canakkale',
    title: '18 Mart Çanakkale Zaferi ve Şehitleri Anma Günü',
    category: 'celebration',
    categoryLabel: 'Tarihi Anma Günü',
    startDate: '2027-03-18',
    time: '10:00 - 12:00',
    targetAudience: 'Tüm Okul',
    location: 'Okul Konferans Salonu',
    description:
      'Çanakkale Deniz Zaferimizin 112. yıl dönümü anma ve şehitlerimizi minnetle yad etme töreni düzenlenecektir.',
    isOfficialMeb: true,
    color: 'amber',
  },
  {
    id: 'meb-2027-ortak-sinav-3',
    title: 'MEB 2. Dönem 1. Ülke Geneli Ortak Yazılı Sınavları',
    category: 'meb_exam',
    categoryLabel: 'MEB Ortak Sınavı',
    startDate: '2027-04-06',
    endDate: '2027-04-07',
    time: '09:25 - 11:00',
    targetAudience: '7. ve 9. Sınıflar',
    location: 'Sınıf Derslikleri',
    description:
      '6 Nisan Salı 7. Sınıf Matematik, 7 Nisan Çarşamba 9. Sınıf Türk Dili ve Edebiyatı ülke geneli ortak yazılı sınavları uygulanacaktır.',
    isOfficialMeb: true,
    color: 'indigo',
  },
  {
    id: 'meb-2027-23-nisan',
    title: '23 Nisan Ulusal Egemenlik ve Çocuk Bayramı (Resmi Tatil)',
    category: 'celebration',
    categoryLabel: 'Milli Bayram',
    startDate: '2027-04-23',
    time: 'Tam Gün Resmi Tatil & Şenlik',
    targetAudience: 'Tüm Okul ve Veliler',
    location: 'Okul Bahçesi & Stadyum',
    description:
      "TBMM'nin açılışı ve Atatürk'ün çocuklara armağan ettiği 23 Nisan Ulusal Egemenlik ve Çocuk Bayramı okulumuzda büyük coşkuyla kutlanacaktır.",
    isOfficialMeb: true,
    color: 'rose',
  },
  {
    id: 'meb-2027-1-mayis',
    title: '1 Mayıs Emek ve Dayanışma Günü (Resmi Tatil)',
    category: 'holiday',
    categoryLabel: 'Resmi Tatil',
    startDate: '2027-05-01',
    time: 'Tam Gün',
    targetAudience: 'Tüm Okul',
    location: 'Tüm Türkiye',
    description: '1 Mayıs Emek ve Dayanışma Günü resmi tatildir.',
    isOfficialMeb: true,
    color: 'rose',
  },
  {
    id: 'meb-2027-19-mayis',
    title: "19 Mayıs Atatürk'ü Anma, Gençlik ve Spor Bayramı (Resmi Tatil)",
    category: 'celebration',
    categoryLabel: 'Milli Bayram',
    startDate: '2027-05-19',
    time: 'Tam Gün Resmi Tatil & Gençlik Şöleni',
    targetAudience: 'Tüm Okul',
    location: 'Spor Kompleksi & Tören Alanı',
    description:
      "Milli Mücadelemizin başlangıcının ve Atatürk'ün gençliğe armağan ettiği 19 Mayıs Bayramı tören ve spor turnuvalarıyla kutlanacaktır.",
    isOfficialMeb: true,
    color: 'amber',
  },
  {
    id: 'meb-2027-lgs',
    title: '2027 LGS Merkezi Sınavı (Liselere Geçiş Sistemi)',
    category: 'meb_exam',
    categoryLabel: 'Bakanlık Merkezi Sınavı',
    startDate: '2027-06-06',
    time: '09:30 ve 11:30 (2 Oturum)',
    targetAudience: '8. Sınıf Öğrencileri',
    location: 'Belirlenen Sınav Merkezleri',
    description:
      'MEB tarafından nitelikli liselere yerleştirme amacıyla uygulanan LGS merkezi sınavı 6 Haziran 2027 Pazar günü icra edilecektir.',
    isOfficialMeb: true,
    color: 'indigo',
  },
  {
    id: 'meb-2027-yks',
    title: '2027 YKS (Yükseköğretim Kurumları Sınavı: TYT - AYT - YDT)',
    category: 'meb_exam',
    categoryLabel: 'ÖSYM Üniversite Sınavı',
    startDate: '2027-06-19',
    endDate: '2027-06-20',
    time: 'Cumartesi & Pazar Sabah Oturumları',
    targetAudience: '12. Sınıf ve Mezun Adaylar',
    location: 'ÖSYM Üniversite Sınav Merkezleri',
    description:
      'Üniversiteye giriş sınavı 1. Oturum TYT (19 Haziran) ve 2. Oturum AYT / YDT (20 Haziran) tarihlerinde ülke genelinde düzenlenecektir.',
    isOfficialMeb: true,
    color: 'indigo',
  },
  {
    id: 'meb-2027-kapanis',
    title: '2026–2027 Eğitim Öğretim Yılı Sonu & Yaz Tatili Başlangıcı',
    category: 'holiday',
    categoryLabel: 'Yıl Sonu & Yaz Tatili',
    startDate: '2027-06-25',
    time: '10:00 Karne Töreni',
    targetAudience: 'Tüm Öğrenciler ve Öğretmenler',
    location: 'Tüm MEB Okulları',
    description:
      '2026-2027 eğitim öğretim yılı 25 Haziran 2027 Cuma günü öğrencilere karnelerinin ve diplomalarının takdim edilmesiyle sona erecektir.',
    isOfficialMeb: true,
    color: 'emerald',
  },
]

export const ACADEMIC_CALENDAR_STORAGE_KEY = 'oxonom_academic_calendar_events_v1'

export function getStoredAcademicEvents(): AcademicCalendarEvent[] {
  if (typeof window === 'undefined') return CANONICAL_ACADEMIC_EVENTS
  try {
    const raw = localStorage.getItem(ACADEMIC_CALENDAR_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (_) {}
  return CANONICAL_ACADEMIC_EVENTS
}

export function saveStoredAcademicEvents(events: AcademicCalendarEvent[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(ACADEMIC_CALENDAR_STORAGE_KEY, JSON.stringify(events))
    window.dispatchEvent(new Event('oxonom_academic_calendar_updated'))
    window.dispatchEvent(new Event('storage'))
  } catch (_) {}
}

export function addAcademicEvent(event: AcademicCalendarEvent) {
  const current = getStoredAcademicEvents()
  const updated = [event, ...current.filter((e) => e.id !== event.id)]
  saveStoredAcademicEvents(updated)

  // Sync to server
  if (typeof fetch !== 'undefined') {
    fetch('/api/academic-calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event }),
    }).catch(() => {})
  }

  return updated
}

export function updateAcademicEvent(id: string, updates: Partial<AcademicCalendarEvent>) {
  const current = getStoredAcademicEvents()
  const updated = current.map((e) =>
    e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
  )
  saveStoredAcademicEvents(updated)

  // Sync to server
  if (typeof fetch !== 'undefined') {
    fetch('/api/academic-calendar', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, updates }),
    }).catch(() => {})
  }

  return updated
}

export function deleteAcademicEvent(id: string) {
  const current = getStoredAcademicEvents()
  const updated = current.filter((e) => e.id !== id)
  saveStoredAcademicEvents(updated)

  // Sync to server
  if (typeof fetch !== 'undefined') {
    fetch(`/api/academic-calendar?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }).catch(() => {})
  }

  return updated
}

export async function syncAcademicEventsFromServer(): Promise<AcademicCalendarEvent[] | null> {
  if (typeof window === 'undefined') return null
  try {
    const res = await fetch('/api/academic-calendar', { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    if (data && data.success && Array.isArray(data.events)) {
      saveStoredAcademicEvents(data.events)
      return data.events
    }
  } catch (_) {}
  return null
}

