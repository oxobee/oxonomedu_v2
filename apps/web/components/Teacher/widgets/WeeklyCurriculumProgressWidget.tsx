'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Check,
  Bookmark,
  Calendar,
  Tv,
  ArrowRight,
  CheckSquare,
  Flame,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { ClassroomItem, normalizeClassCode } from '@services/demo/schoolDirectory'

export interface CurriculumTopic {
  id: string
  unitNumber: number
  unitName: string
  outcomeCode: string
  outcomeTitle: string
  description: string
  week: string
  hours: number
  keyConcepts: string[]
}

const HIGH_SCHOOL_SUBJECTS: Record<string, CurriculumTopic[]> = {
  'Türk Dili ve Edebiyatı': [
    {
      id: 'tde-1',
      unitNumber: 1,
      unitName: '1. Ünite: Giriş & Edebiyat Bilgisi',
      outcomeCode: 'MEB TDE.9.1.1',
      outcomeTitle: 'Edebiyatın Güzel Sanatlarla ve Bilim Dallarıyla İlişkisi',
      description: 'Edebiyatın tanımı, güzel sanatlar içindeki yeri, tarih ve felsefe gibi diğer disiplinlerle bağını inceler.',
      week: '1 - 2. Hafta (Eylül)',
      hours: 5,
      keyConcepts: ['Güzel Sanatlar', 'Metin Türleri', 'Edebi Dil'],
    },
    {
      id: 'tde-2',
      unitNumber: 2,
      unitName: '2. Ünite: Hikâye (Öykü) İncelemesi',
      outcomeCode: 'MEB TDE.9.2.2',
      outcomeTitle: 'Olay ve Durum Hikâyesinin Yapı Unsurları ve Anlatıcı',
      description: 'Maupassant ve Çehov tarzı hikâyelerde olay örgüsü, şahıs kadrosu, zaman, mekân ve bakış açısını çözümler.',
      week: '3 - 5. Hafta (Ekim)',
      hours: 5,
      keyConcepts: ['Olay Hikâyesi', 'Durum Hikâyesi', 'Tema', 'Bakış Açısı'],
    },
    {
      id: 'tde-3',
      unitNumber: 3,
      unitName: '3. Ünite: Şiir ve Nazım Şekilleri',
      outcomeCode: 'MEB TDE.9.3.2',
      outcomeTitle: 'Şiirde Ahenk Unsurları, Kafiye, Redif ve Ölçü Tahlili',
      description: 'Şiirdeki nazım birimi, kafiye türleri (yarım, tam, zengin, cinaslı), redif, ölçü ve ses tekrarlarını tespit eder.',
      week: '6 - 9. Hafta (Aktif MEB Dönemi)',
      hours: 5,
      keyConcepts: ['Hece Ölçüsü', 'Kafiye Şeması', 'Redif', 'Aliterasyon'],
    },
    {
      id: 'tde-4',
      unitNumber: 3,
      unitName: '3. Ünite: Şiir ve Nazım Şekilleri',
      outcomeCode: 'MEB TDE.9.3.4',
      outcomeTitle: 'Edebi Sanatlar: Teşbih, İstiare, Teşhis ve İntak',
      description: 'Şiirde anlamı zenginleştiren temel edebi sanatların işlevini belirler ve metin üzerinden örnekler.',
      week: '10 - 11. Hafta (Kasım)',
      hours: 5,
      keyConcepts: ['Teşbih', 'Açık İstiare', 'Kapalı İstiare', 'Teşhis'],
    },
    {
      id: 'tde-5',
      unitNumber: 4,
      unitName: '4. Ünite: Masal ve Fabl Türü',
      outcomeCode: 'MEB TDE.9.4.1',
      outcomeTitle: 'Masal ve Fablın Yapı Özellikleri ile Kültürel Değerler',
      description: 'Halk anlatıları, tekerleme, serim-düğüm-çözüm bölümleri ve didaktik unsurları karşılaştırır.',
      week: '12 - 14. Hafta (Aralık)',
      hours: 5,
      keyConcepts: ['Kalıp Sözler', 'Didaktik Anlatım', 'Fabl Kahramanları'],
    },
    {
      id: 'tde-6',
      unitNumber: 5,
      unitName: '5. Ünite: Roman İncelemesi',
      outcomeCode: 'MEB TDE.9.5.2',
      outcomeTitle: 'Romanda Çatışma, Karakter Gelişimi ve Anlatım Teknikleri',
      description: 'Bilinç akışı, iç monolog, geriye dönüş teknikleri ve romanın tematik derinliğini değerlendirir.',
      week: '15 - 18. Hafta (Ocak)',
      hours: 5,
      keyConcepts: ['İç Monolog', 'Bilinç Akışı', 'Çatışma Türleri'],
    },
  ],
  'Matematik': [
    {
      id: 'mat-1',
      unitNumber: 1,
      unitName: '1. Ünite: Mantık & Önermeler',
      outcomeCode: 'MEB MAT.9.1.1',
      outcomeTitle: 'Önermeler, Doğruluk Değerleri ve Bileşik Önermeler',
      description: 'Ve, veya, ise, ancak ve ancak bağlaçları ile koşullu önermelerin doğruluk tablolarını inceler.',
      week: '1 - 3. Hafta',
      hours: 6,
      keyConcepts: ['Doğruluk Tablosu', 'Koşullu Önerme', 'Totoloji'],
    },
    {
      id: 'mat-2',
      unitNumber: 2,
      unitName: '2. Ünite: Kümeler Kuramı',
      outcomeCode: 'MEB MAT.9.2.1',
      outcomeTitle: 'Kümelerde İşlemler ve Kartezyen Çarpım',
      description: 'Kesişim, birleşim, fark ve tümleme işlemleriyle küme problemlerini çözümler.',
      week: '4 - 7. Hafta',
      hours: 6,
      keyConcepts: ['Alt Küme', 'Evrensel Küme', 'Venn Şeması'],
    },
    {
      id: 'mat-3',
      unitNumber: 3,
      unitName: '3. Ünite: Denklem ve Eşitsizlikler',
      outcomeCode: 'MEB MAT.9.3.2',
      outcomeTitle: 'Birinci Dereceden Bir ve İki Bilinmeyenli Denklemler & Mutlak Değer',
      description: 'Gerçek sayılar kümesinde aralık kavramı, mutlak değerli denklem ve eşitsizliklerin çözüm kümeleri.',
      week: '8 - 12. Hafta (Aktif MEB Dönemi)',
      hours: 6,
      keyConcepts: ['Mutlak Değer', 'Çözüm Kümesi', 'Eşitsizlik Sistemi'],
    },
    {
      id: 'mat-4',
      unitNumber: 4,
      unitName: '4. Ünite: Üçgenler ve Geometri',
      outcomeCode: 'MEB MAT.9.4.1',
      outcomeTitle: 'Üçgende Açılar, Kenar-Açı Bağıntıları ve Eşlik-Benzerlik',
      description: 'Üçgen eşitsizliği, Pisagor teoremi, Öklid bağıntıları ve özel üçgen özellikleri.',
      week: '13 - 18. Hafta',
      hours: 6,
      keyConcepts: ['Benzerlik Oranı', 'Pisagor', 'Açıortay-Kenarortay'],
    },
  ],
  'Fizik': [
    {
      id: 'fiz-1',
      unitNumber: 1,
      unitName: '1. Ünite: Fizik Bilimine Giriş',
      outcomeCode: 'MEB FİZ.9.1.1',
      outcomeTitle: 'Fizik Biliminin Alt Dalları ve Temel Büyüklükler',
      description: 'Mekanik, termodinamik, optik vb. alt dallar, skaler ve vektörel büyüklükler.',
      week: '1 - 4. Hafta',
      hours: 2,
      keyConcepts: ['SI Birim Sistemi', 'Vektörler', 'Türetilmiş Büyüklükler'],
    },
    {
      id: 'fiz-2',
      unitNumber: 2,
      unitName: '2. Ünite: Madde ve Özellikleri',
      outcomeCode: 'MEB FİZ.9.2.2',
      outcomeTitle: 'Kütle, Hacim, Özkütle ve Dayanıklılık Hesabı',
      description: 'Katı, sıvı ve gazlarda özkütle bağıntısı, adezyon, kohezyon, yüzey gerilimi ve kılcallık.',
      week: '5 - 9. Hafta (Aktif MEB Dönemi)',
      hours: 2,
      keyConcepts: ['Özkütle', 'Yüzey Gerilimi', 'Kılcallık', 'Adezyon-Kohezyon'],
    },
    {
      id: 'fiz-3',
      unitNumber: 3,
      unitName: '3. Ünite: Hareket ve Kuvvet',
      outcomeCode: 'MEB FİZ.9.3.1',
      outcomeTitle: 'Düzgün Doğrusal Hareket, Hız ve Newton Hareket Yasaları',
      description: 'Konum-zaman, hız-zaman grafikleri, eylemsizlik, temel prensip ve etki-tepki yasası.',
      week: '10 - 15. Hafta',
      hours: 2,
      keyConcepts: ['İvme', 'Etki-Tepki', 'Sürtünme Kuvveti'],
    },
  ],
  'Kimya': [
    {
      id: 'kim-1',
      unitNumber: 1,
      unitName: '1. Ünite: Kimya Bilimi',
      outcomeCode: 'MEB KİM.9.1.1',
      outcomeTitle: 'Simyadan Kimyaya ve Temel Kimya Güvenlik Kuralları',
      description: 'Kimya disiplinleri, kimyasal güvenlik uyarı işaretleri, element ve bileşiklerin sembolleri.',
      week: '1 - 4. Hafta',
      hours: 2,
      keyConcepts: ['Simya', 'Laboratuvar Güvenliği', 'Element Sembolleri'],
    },
    {
      id: 'kim-2',
      unitNumber: 2,
      unitName: '2. Ünite: Atom ve Periyodik Sistem',
      outcomeCode: 'MEB KİM.9.2.3',
      outcomeTitle: 'Atom Modelleri, Elektron Dağılımı ve Periyodik Özellikler',
      description: 'Bohr ve modern atom modelleri, periyot-grup bulma, atom yarıçapı, iyonlaşma enerjisi ve elektronegatiflik.',
      week: '5 - 10. Hafta (Aktif MEB Dönemi)',
      hours: 2,
      keyConcepts: ['İyonlaşma Enerjisi', 'Elektronegatiflik', 'Periyodik Yasa'],
    },
  ],
  'Tarih': [
    {
      id: 'tar-1',
      unitNumber: 1,
      unitName: '1. Ünite: Tarih ve Zaman',
      outcomeCode: 'MEB TAR.9.1.2',
      outcomeTitle: 'Tarihin Yöntemi, Kaynak Tenkidi ve Takvim Sistemleri',
      description: 'Birinci ve ikinci elden kaynaklar, hicri-miladi takvim, tarih biliminin toplumsal faydası.',
      week: '1 - 4. Hafta',
      hours: 2,
      keyConcepts: ['Kaynak Tenkidi', 'Hicri Takvim', 'Miladi Takvim'],
    },
    {
      id: 'tar-2',
      unitNumber: 2,
      unitName: '2. Ünite: İnsanlığın İlk Dönemleri',
      outcomeCode: 'MEB TAR.9.2.1',
      outcomeTitle: 'İlk Çağ Medeniyetleri ve Yazının Gelişimi',
      description: 'Mezopotamya, Mısır, Anadolu ve Ege uygarlıklarında siyasi yapı, hukuk ve yazı.',
      week: '5 - 10. Hafta (Aktif MEB Dönemi)',
      hours: 2,
      keyConcepts: ['Çivi Yazısı', 'Hammurabi Kanunları', 'İpek Yolu'],
    },
  ],
  'İngilizce': [
    {
      id: 'ing-1',
      unitNumber: 1,
      unitName: 'Theme 1: Studying Abroad',
      outcomeCode: 'MEB ENG.9.1.R1',
      outcomeTitle: 'Exchanging Personal Information and Cultural Diversity',
      description: 'Greetings, personal pronouns, countries, nationalities, daily routines and school life in abroad.',
      week: '1 - 4. Hafta',
      hours: 4,
      keyConcepts: ['Present Simple', 'Nationalities', 'Cultural Exchange'],
    },
    {
      id: 'ing-2',
      unitNumber: 2,
      unitName: 'Theme 2: My Environment',
      outcomeCode: 'MEB ENG.9.2.L2',
      outcomeTitle: 'Describing Neighborhoods, Directions and Living Spaces',
      description: 'Giving directions, prepositions of place, comparing living environments (city vs countryside).',
      week: '5 - 9. Hafta (Aktif MEB Dönemi)',
      hours: 4,
      keyConcepts: ['Prepositions of Place', 'Giving Directions', 'Comparatives'],
    },
  ],
}

const PRIMARY_SUBJECTS: Record<string, CurriculumTopic[]> = {
  'Türkçe': [
    {
      id: 'pri-t-1',
      unitNumber: 1,
      unitName: '1. Tema: Birey ve Toplum',
      outcomeCode: 'MEB T.4.1.2',
      outcomeTitle: 'Okuduğu Metnin Ana Fikrini ve Yardımcı Fikirlerini Belirler',
      description: 'Farklı metin türlerini okuma, metinle ilgili soruları cevaplama, söz varlığını geliştirme.',
      week: '1 - 4. Hafta',
      hours: 6,
      keyConcepts: ['Ana Fikir', 'Paragraf', 'Sözcük Dağarcığı'],
    },
    {
      id: 'pri-t-2',
      unitNumber: 2,
      unitName: '2. Tema: Millî Kültürümüz',
      outcomeCode: 'MEB T.4.2.3',
      outcomeTitle: 'Noktalama İşaretleri ve Yazım Kurallarını Doğru Uygular',
      description: 'Nokta, virgül, soru işareti, büyük harflerin kullanımı ve metin yazma çalışmaları.',
      week: '5 - 9. Hafta (Aktif MEB Dönemi)',
      hours: 6,
      keyConcepts: ['Yazım Kuralları', 'Noktalama', 'Deyimler'],
    },
  ],
  'Matematik': [
    {
      id: 'pri-m-1',
      unitNumber: 1,
      unitName: '1. Ünite: Doğal Sayılar',
      outcomeCode: 'MEB MAT.4.1.1',
      outcomeTitle: 'Dört, Beş ve Altı Basamaklı Doğal Sayıları Okur ve Yazar',
      description: 'Basamak değeri, sayı değeri, çözümleme ve doğal sayıları sıralama becerisi.',
      week: '1 - 4. Hafta',
      hours: 5,
      keyConcepts: ['Basamak Değeri', 'Sayı Değeri', 'Çözümleme'],
    },
    {
      id: 'pri-m-2',
      unitNumber: 2,
      unitName: '2. Ünite: Doğal Sayılarla Toplama ve Çıkarma',
      outcomeCode: 'MEB MAT.4.2.1',
      outcomeTitle: 'Elden Toplama ve Onluk Bozarak Çıkarma Problemleri',
      description: 'Zihinden toplama stratejileri, tahmini sonuç bulma ve günlük hayat problemleri.',
      week: '5 - 9. Hafta (Aktif MEB Dönemi)',
      hours: 5,
      keyConcepts: ['Eldeli Toplama', 'Zihinden İşlem', 'Problem Çözme'],
    },
  ],
  'Fen Bilimleri': [
    {
      id: 'pri-f-1',
      unitNumber: 1,
      unitName: '1. Ünite: Yer Kabuğu ve Dünyamızın Hareketleri',
      outcomeCode: 'MEB FEN.4.1.2',
      outcomeTitle: 'Dünya’nın Dönme ve Dolanma Hareketleri ile Sonuçları',
      description: 'Gece-gündüz oluşumu, mevsimlerin başlangıcı ve Dünya’nın hareketlerini modeller üzerinde açıklar.',
      week: '1 - 6. Hafta',
      hours: 3,
      keyConcepts: ['Dönme Hareketi', 'Dolanma Hareketi', 'Gece-Gündüz'],
    },
    {
      id: 'pri-f-2',
      unitNumber: 2,
      unitName: '2. Ünite: Besinlerimiz',
      outcomeCode: 'MEB FEN.4.2.1',
      outcomeTitle: 'Besin İçerikleri ve Sağlıklı Yaşam Bilinci',
      description: 'Proteinler, karbonhidratlar, yağlar, vitaminler, su ve minerallerin vücuttaki temel görevleri.',
      week: '7 - 11. Hafta (Aktif MEB Dönemi)',
      hours: 3,
      keyConcepts: ['Dengeli Beslenme', 'Proteinler', 'Vitaminler'],
    },
  ],
}

interface WeeklyCurriculumProgressWidgetProps {
  selectedClass: ClassroomItem
  onOpenWhiteboard?: () => void
}

export default function WeeklyCurriculumProgressWidget({
  selectedClass,
  onOpenWhiteboard,
}: WeeklyCurriculumProgressWidgetProps) {
  // Determine if high school or primary/middle
  const isHighSchool = useMemo(() => {
    const raw = selectedClass?.grade_level || selectedClass?.name || ''
    const num = parseInt(raw.replace(/\D/g, '') || '9', 10)
    return num >= 9 || raw.toLowerCase().includes('lise') || raw.toLowerCase().includes('anadolu')
  }, [selectedClass])

  const subjectCatalog = isHighSchool ? HIGH_SCHOOL_SUBJECTS : PRIMARY_SUBJECTS
  const subjectList = useMemo(() => Object.keys(subjectCatalog), [subjectCatalog])

  const [selectedSubject, setSelectedSubject] = useState<string>(() => {
    return isHighSchool ? 'Türk Dili ve Edebiyatı' : 'Türkçe'
  })

  // Ensure selectedSubject is valid for current grade catalog
  useEffect(() => {
    if (!subjectCatalog[selectedSubject]) {
      setSelectedSubject(subjectList[0] || (isHighSchool ? 'Türk Dili ve Edebiyatı' : 'Türkçe'))
    }
  }, [isHighSchool, subjectCatalog, selectedSubject, subjectList])

  const topics = useMemo(() => {
    return subjectCatalog[selectedSubject] || subjectCatalog[subjectList[0]] || []
  }, [subjectCatalog, selectedSubject, subjectList])

  // Current viewed index (for browsing next/prev without immediately changing active class lesson)
  const [viewIndex, setViewIndex] = useState<number>(0)
  // Active lesson index (the one actually being taught in class)
  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(() => {
    return Math.min(2, Math.max(0, topics.length - 1))
  })

  // Storage key based on class code and subject
  const storageKey = useMemo(() => {
    const norm = normalizeClassCode(selectedClass?.code || '9/A').replace(/[\/\s]/g, '-')
    return `oxonom_curriculum_progress_${norm}_${selectedSubject}`
  }, [selectedClass, selectedSubject])

  // Load saved progress
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(storageKey)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (typeof parsed.activeLessonIndex === 'number') {
            const boundedActive = Math.min(parsed.activeLessonIndex, Math.max(0, topics.length - 1))
            setActiveLessonIndex(boundedActive)
            setViewIndex(boundedActive)
            return
          }
        }
      } catch (_) {}
    }
    // Default to unit 3 (active MEB week)
    const def = Math.min(2, Math.max(0, topics.length - 1))
    setActiveLessonIndex(def)
    setViewIndex(def)
  }, [storageKey, topics.length])

  // Handle Mark as Active Taught Topic
  const handleMarkAsActive = () => {
    setActiveLessonIndex(viewIndex)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({ activeLessonIndex: viewIndex, viewIndex })
        )
      } catch (_) {}
    }
    const currentTopic = topics[viewIndex]
    toast.success(
      `🎯 "${currentTopic?.outcomeTitle || 'Konu'}" ${selectedClass?.name || 'Sınıf'} için aktif işlenen ders olarak belirlendi!`,
      { duration: 4000 }
    )
  }

  // Next / Previous navigation
  const handleNext = () => {
    if (viewIndex < topics.length - 1) {
      setViewIndex((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    if (viewIndex > 0) {
      setViewIndex((prev) => prev - 1)
    }
  }

  const currentTopic = topics[viewIndex] || topics[0]
  const isCurrentlyTaught = viewIndex === activeLessonIndex
  const isPast = viewIndex < activeLessonIndex
  const isUpcoming = viewIndex > activeLessonIndex

  const progressPercentage = Math.round(((activeLessonIndex + 1) / Math.max(topics.length, 1)) * 100)

  return (
    <div className="w-full bg-white dark:bg-[#121826] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden group hover:border-[#8D49A6]/40 transition-all">
      {/* Background Accent Gradient Glow */}
      <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-bl from-[#4B075F]/10 via-[#8D49A6]/5 to-transparent pointer-events-none rounded-tr-3xl" />

      {/* ── HEADER ROW: TITLE, CLASS BADGE & SUBJECT SELECTOR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-gray-100 dark:border-gray-800 relative z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-brand-gradient text-white flex items-center justify-center shrink-0 shadow-sm shadow-purple-950/20">
            <BookOpen size={20} className="text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white tracking-tight m-0">
                Haftalık Ders Kazanımları ve Konu İlerlemesi
              </h3>
              {/* Sınıf Otomatik Bağlı Rozet */}
              <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-[#4B075F] text-white shadow-xs">
                <span>{selectedClass?.name || `${selectedClass?.code} Şubesi`}</span>
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 m-0 truncate">
              {selectedClass?.grade_level || 'MEB Müfredatı'} · Haftalık kazanım takibi ve aktif işlenen konu yönetimi
            </p>
          </div>
        </div>

        {/* Ders Seçme Alanı */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 shrink-0">
            Ders:
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value)
              setViewIndex(0)
            }}
            className="h-9 px-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none text-xs font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-[#8D49A6] cursor-pointer"
          >
            {subjectList.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── PROGRESS BAR & WEEK SUMMARY ── */}
      <div className="pt-3.5 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 dark:text-gray-400">
          <Calendar size={13} className="text-[#8D49A6]" />
          <span>{currentTopic?.week || 'Mevcut Dönem'}</span>
          <span>•</span>
          <span>Haftalık {currentTopic?.hours || 4} Ders Saati</span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300">
            Müfredat İlerlemesi: <strong className="text-[#4B075F] dark:text-[#C58ADB]">%{progressPercentage}</strong> ({activeLessonIndex + 1}/{topics.length} Konu)
          </span>
          <div className="w-24 sm:w-28 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              className="h-full bg-brand-gradient transition-all duration-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── COMPACT PRACTICAL TOPIC CARD (SADECE SEÇİLİ/MEVCUT KONU GÖRÜNTÜLENİR) ── */}
      <div className="mt-2.5 p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-gray-50/90 to-gray-50/40 dark:from-gray-800/50 dark:to-gray-800/20 border border-gray-100 dark:border-gray-800/90 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTopic?.id || viewIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="space-y-3"
          >
            {/* Top Row: Outcome Code & Status Badge */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-black px-2.5 py-0.5 rounded-lg bg-[#F0D8FA]/60 dark:bg-[#4B075F]/30 text-[#4B075F] dark:text-[#C58ADB] border border-[#8D49A6]/20">
                  {currentTopic?.outcomeCode}
                </span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  {currentTopic?.unitName}
                </span>
              </div>

              {/* Status Badge */}
              {isCurrentlyTaught ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-black px-3 py-1 rounded-full bg-[#4B075F] text-white shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Şu An Aktif İşlenen Konu</span>
                </span>
              ) : isPast ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                  <Check size={12} strokeWidth={2.5} />
                  <span>Tamamlandı</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  <span>Sırada / Sonraki Hafta</span>
                </span>
              )}
            </div>

            {/* Outcome Title & Description */}
            <div>
              <h4 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white leading-snug">
                {currentTopic?.outcomeTitle}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                {currentTopic?.description}
              </p>
            </div>

            {/* Key Concepts Tags */}
            {currentTopic?.keyConcepts && currentTopic.keyConcepts.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Kavramlar:
                </span>
                {currentTopic.keyConcepts.map((concept) => (
                  <span
                    key={concept}
                    className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-[#161D2E] text-gray-700 dark:text-gray-300 border border-gray-200/60 dark:border-gray-700"
                  >
                    #{concept}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── BOTTOM CONTROLS & NAVIGATION ── */}
        <div className="mt-4 pt-3.5 border-t border-gray-200/60 dark:border-gray-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Stepper Navigation (Önceki - Sonraki) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={viewIndex === 0}
              className="h-8.5 px-3 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200/80 dark:border-gray-700 text-xs font-bold flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
            >
              <ChevronLeft size={14} />
              <span>Önceki Konu</span>
            </button>

            <span className="text-[11px] font-mono font-bold text-gray-500 dark:text-gray-400 px-1">
              {viewIndex + 1} / {topics.length}
            </span>

            <button
              type="button"
              onClick={handleNext}
              disabled={viewIndex >= topics.length - 1}
              className="h-8.5 px-3 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200/80 dark:border-gray-700 text-xs font-bold flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
            >
              <span>Sonraki Konu</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Quick Actions: Mark as Active & Launch Whiteboard */}
          <div className="flex items-center gap-2 flex-wrap">
            {!isCurrentlyTaught && (
              <button
                type="button"
                onClick={handleMarkAsActive}
                className="h-8.5 px-3.5 rounded-xl bg-[#4B075F] hover:bg-[#701A75] text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Bookmark size={13} className="text-white" />
                <span>Bu Konuyu İşleniyor Olarak Seç</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = `/pano`
                }
              }}
              className="h-8.5 px-3.5 rounded-xl bg-brand-gradient hover:opacity-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-purple-950/20"
              title="Akıllı Tahta Pano modunda bu konuya ait çizim ve tahta çalışma alanını aç"
            >
              <Tv size={14} className="text-white" />
              <span>Tahtada Aç (Pano)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
