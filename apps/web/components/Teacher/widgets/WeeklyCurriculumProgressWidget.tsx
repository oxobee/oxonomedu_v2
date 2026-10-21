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
import { getSynchronizedClassWeeklySchedule } from '@/lib/student/studentData'

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

const GRADE_1_3_SUBJECTS: Record<string, CurriculumTopic[]> = {
  'Türkçe': [
    {
      id: 'g1-t-1',
      unitNumber: 1,
      unitName: '1. Tema: Birey ve Toplum & Okuma Yazmaya Başlangıç',
      outcomeCode: 'MEB T.1.1.1',
      outcomeTitle: 'Harf-Ses İlişkisi, Hece ve İlk Okuma Becerileri',
      description: 'Sesleri tanır, harfleri doğru kavrar, hece ve kelime oluşturarak akıcı okumaya ilk adımı atar.',
      week: '1 - 4. Hafta',
      hours: 10,
      keyConcepts: ['Ses Bilgisi', 'Harf Tanıma', 'Heceleme'],
    },
    {
      id: 'g1-t-2',
      unitNumber: 2,
      unitName: '2. Tema: Millî Kültürümüz & Erdemler',
      outcomeCode: 'MEB T.1.2.3',
      outcomeTitle: 'Görsellerden Hareketle Metin Anlama ve Cümle Kurma',
      description: 'Görsel okuma yapar, okuduğu basit cümlelerin anlamını kavrar ve düzgün el yazısıyla ifade eder.',
      week: '5 - 9. Hafta (Aktif MEB Dönemi)',
      hours: 10,
      keyConcepts: ['Okuduğunu Anlama', 'Cümle Bilgisi', 'Kelime Dağarcığı'],
    },
    {
      id: 'g1-t-3',
      unitNumber: 3,
      unitName: '3. Tema: Doğa ve Evren',
      outcomeCode: 'MEB T.1.3.2',
      outcomeTitle: 'Kısa Metinleri Noktalama İşaretlerine Uygun Okuma',
      description: 'Nokta ve soru işaretinin işlevini kavrayarak ses tonunu ayarlar ve kısa şiir/öykü okur.',
      week: '10 - 14. Hafta',
      hours: 10,
      keyConcepts: ['Noktalama', 'Vurgu ve Tonlama', 'Şiir Okuma'],
    },
  ],
  'Matematik': [
    {
      id: 'g1-m-1',
      unitNumber: 1,
      unitName: '1. Ünite: Doğal Sayılar (1-20 Arası)',
      outcomeCode: 'MEB MAT.1.1.1',
      outcomeTitle: 'Nesne Sayma, Rakamları Yazma ve Sıralama',
      description: '20’ye kadar olan nesneleri sayar, rakamları doğru yazar, sayı doğrusunda modeller.',
      week: '1 - 4. Hafta',
      hours: 5,
      keyConcepts: ['Rakamlar', 'Nesne Sayma', 'Sayı Doğrusu'],
    },
    {
      id: 'g1-m-2',
      unitNumber: 2,
      unitName: '2. Ünite: Doğal Sayılarla Toplama İşlemi',
      outcomeCode: 'MEB MAT.1.2.1',
      outcomeTitle: 'Toplama İşleminin Anlamı ve Temel Toplama Problemleri',
      description: 'İki grubu bir araya getirme, artı (+) ve eşittir (=) işaretlerinin anlamını günlük hayatla ilişkilendirir.',
      week: '5 - 9. Hafta (Aktif MEB Dönemi)',
      hours: 5,
      keyConcepts: ['Toplama', 'Artı İşareti', 'Toplam'],
    },
    {
      id: 'g1-m-3',
      unitNumber: 3,
      unitName: '3. Ünite: Doğal Sayılarla Çıkarma İşlemi',
      outcomeCode: 'MEB MAT.1.3.1',
      outcomeTitle: 'Eksilme, Azalma Kavramları ve Çıkarma İşlemi',
      description: 'Gruptan nesne eksiltme, farkı bulma ve eksi (-) sembolünü kullanarak zihinden ve yazılı işlemler yapar.',
      week: '10 - 14. Hafta',
      hours: 5,
      keyConcepts: ['Çıkarma', 'Fark', 'Eksilen-Çıkan'],
    },
  ],
  'Hayat Bilgisi': [
    {
      id: 'g1-hb-1',
      unitNumber: 1,
      unitName: '1. Ünite: Okulumuzda Hayat',
      outcomeCode: 'MEB HB.1.1.1',
      outcomeTitle: 'Kendini Tanıtma, Sınıf Kuralları ve Okul Çalışanları',
      description: 'Okul kurallarına uyar, sınıf arkadaşlarını ve okul personelini tanır, nezaket kurallarını benimser.',
      week: '1 - 5. Hafta',
      hours: 4,
      keyConcepts: ['Sınıf Kuralları', 'Nezaket', 'İletişim'],
    },
    {
      id: 'g1-hb-2',
      unitNumber: 2,
      unitName: '2. Ünite: Evimizde Hayat & Sağlıklı Yaşam',
      outcomeCode: 'MEB HB.1.2.2',
      outcomeTitle: 'Kişisel Bakım, Temizlik ve Düzenli Beslenme Alışkanlığı',
      description: 'El yıkama, diş fırçalama, sağlıklı besinleri seçme ve kişisel eşyalarını düzenli kullanma bilinci.',
      week: '6 - 10. Hafta (Aktif MEB Dönemi)',
      hours: 4,
      keyConcepts: ['Kişisel Temizlik', 'Dengeli Beslenme', 'Öz Bakım'],
    },
    {
      id: 'g1-hb-3',
      unitNumber: 3,
      unitName: '3. Ünite: Güvenli Hayat',
      outcomeCode: 'MEB HB.1.3.1',
      outcomeTitle: 'Okula Gidiş Geliş Güvenliği ve Trafik İşaretleri',
      description: 'Trafik ışıkları, yaya geçidi ve okul servis kurallarına uyarak güvenli seyahat eder.',
      week: '11 - 15. Hafta',
      hours: 4,
      keyConcepts: ['Yaya Geçidi', 'Trafik Güvenliği', 'Acil Durum'],
    },
  ],
  'Yabancı Dil (İngilizce)': [
    {
      id: 'g1-eng-1',
      unitNumber: 1,
      unitName: 'Unit 1: Words & Greetings',
      outcomeCode: 'MEB ENG.1.1.1',
      outcomeTitle: 'Hello, Goodbye and Basic Classroom Objects',
      description: 'Temel selamlama kalıplarını söyler, sınıf eşyalarını (pencil, book, table) İngilizce olarak adlandırır.',
      week: '1 - 5. Hafta',
      hours: 2,
      keyConcepts: ['Hello/Bye', 'School Objects', 'Listen & Point'],
    },
    {
      id: 'g1-eng-2',
      unitNumber: 2,
      unitName: 'Unit 2: Family & Colors',
      outcomeCode: 'MEB ENG.1.2.1',
      outcomeTitle: 'Identifying Family Members and Primary Colors',
      description: 'Aile bireylerini (mother, father) ve temel renkleri (red, blue, yellow, green) şarkılar eşliğinde öğrenir.',
      week: '6 - 10. Hafta (Aktif MEB Dönemi)',
      hours: 2,
      keyConcepts: ['Family', 'Colors', 'Songs & Chants'],
    },
    {
      id: 'g1-eng-3',
      unitNumber: 3,
      unitName: 'Unit 3: Numbers & Animals',
      outcomeCode: 'MEB ENG.1.3.1',
      outcomeTitle: 'Counting 1-10 and Naming Favorite Pets',
      description: '1’den 10’a kadar sayar, evcil ve sevimli hayvanların adlarını söyler.',
      week: '11 - 15. Hafta',
      hours: 2,
      keyConcepts: ['Numbers 1-10', 'Pets', 'Games'],
    },
  ],
  'Görsel Sanatlar': [
    {
      id: 'g1-gs-1',
      unitNumber: 1,
      unitName: '1. Ünite: Çizgiler, Renkler ve Noktalar',
      outcomeCode: 'MEB GS.1.1.1',
      outcomeTitle: 'Çizgi Çeşitleri ve Temel Renk Biçimlendirmeleri',
      description: 'Düz, eğri ve dalgalı çizgileri kullanarak özgün resim kompozisyonları oluşturur.',
      week: '1 - 6. Hafta',
      hours: 1,
      keyConcepts: ['Çizgi Türleri', 'Ana Renkler', 'Pastel Boya'],
    },
    {
      id: 'g1-gs-2',
      unitNumber: 2,
      unitName: '2. Ünite: Hayal Gücü ve Resim Sanatı',
      outcomeCode: 'MEB GS.1.2.1',
      outcomeTitle: 'Doğa ve Çevre Gözlemlerini Resme Aktarma',
      description: 'Çevresindeki canlıları ve mevsimsel renk değişimlerini gözlemleyerek resmeder.',
      week: '7 - 12. Hafta (Aktif MEB Dönemi)',
      hours: 1,
      keyConcepts: ['Kompozisyon', 'Doğa Sevgisi', 'Görsel Anlatım'],
    },
  ],
  'Müzik': [
    {
      id: 'g1-muz-1',
      unitNumber: 1,
      unitName: '1. Ünite: Ses ve Ritim Bilgisi',
      outcomeCode: 'MEB MÜZ.1.1.1',
      outcomeTitle: 'İnce-Kalın Sesleri Ayırt Etme ve Ritim Tutma',
      description: 'Çevresindeki sesleri dinler, vücut perküsyonu ve ritim çubuklarıyla vuruşları takip eder.',
      week: '1 - 6. Hafta',
      hours: 1,
      keyConcepts: ['Ses Kaynakları', 'Ritim Vuruşu', 'Beden Perküsyonu'],
    },
    {
      id: 'g1-muz-2',
      unitNumber: 2,
      unitName: '2. Ünite: Şarkı Dağarcığı ve Marşlarımız',
      outcomeCode: 'MEB MÜZ.1.2.1',
      outcomeTitle: 'Doğru Nefes ile Okul Şarkılarını Koro Halinde Söyleme',
      description: 'Nefes ve ses egzersizleri yaparak çocuk şarkılarını ve marşları sınıfça seslendirir.',
      week: '7 - 12. Hafta (Aktif MEB Dönemi)',
      hours: 1,
      keyConcepts: ['Koro', 'Nefes Kontrolü', 'Okul Şarkıları'],
    },
  ],
  'Beden Eğitimi ve Oyun': [
    {
      id: 'g1-beo-1',
      unitNumber: 1,
      unitName: '1. Ünite: Temel Hareket Yetkinliği',
      outcomeCode: 'MEB BEO.1.1.1',
      outcomeTitle: 'Yürüme, Koşma, Sıçrama ve Koordinasyon Becerileri',
      description: 'Farklı yön ve hızlarda dengeli hareket eder, alan farkındalığı kazanır.',
      week: '1 - 6. Hafta',
      hours: 5,
      keyConcepts: ['Denge', 'Koordinasyon', 'Lokomotor Hareketler'],
    },
    {
      id: 'g1-beo-2',
      unitNumber: 2,
      unitName: '2. Ünite: Eğitsel ve Geleneksel Çocuk Oyunları',
      outcomeCode: 'MEB BEO.1.2.1',
      outcomeTitle: 'Oyun Kurallarına Uyma, İş Birliği ve Fair-Play',
      description: 'Mendil kapmaca, yağ satarım gibi geleneksel oyunları arkadaşlarıyla kurallara uygun oynar.',
      week: '7 - 12. Hafta (Aktif MEB Dönemi)',
      hours: 5,
      keyConcepts: ['Çocuk Oyunları', 'İş Birliği', 'Sportif Nezaket'],
    },
  ],
  'Serbest Etkinlikler & Kodlama': [
    {
      id: 'g1-se-1',
      unitNumber: 1,
      unitName: '1. Ünite: Akıl Oyunları ve Görsel Mantık',
      outcomeCode: 'MEB SE.1.1.1',
      outcomeTitle: 'Tangram, Sudoku ve Labirent Çözümleme Stratejileri',
      description: 'Geometrik zeka oyunlarıyla problem çözme ve görsel dikkat becerilerini geliştirir.',
      week: '1 - 6. Hafta',
      hours: 2,
      keyConcepts: ['Tangram', 'Akıl Oyunları', 'Görsel Dikkat'],
    },
    {
      id: 'g1-se-2',
      unitNumber: 2,
      unitName: '2. Ünite: Algoritmik Düşünme & Kodlamaya Giriş',
      outcomeCode: 'MEB SE.1.2.1',
      outcomeTitle: 'Yön Yönergeleri ile Adım Adım Blok Algoritması Oluşturma',
      description: 'İleri, sağa, sola yönergeleriyle hedefe ulaşma simülasyonları ve ekran dışı kodlama aktiviteleri.',
      week: '7 - 12. Hafta (Aktif MEB Dönemi)',
      hours: 2,
      keyConcepts: ['Algoritma', 'Yönerge Takibi', 'Temel Kodlama'],
    },
  ],
}

const GRADE_4_SUBJECTS: Record<string, CurriculumTopic[]> = {
  'Türkçe': [
    {
      id: 'g4-t-1',
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
      id: 'g4-t-2',
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
      id: 'g4-m-1',
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
      id: 'g4-m-2',
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
      id: 'g4-f-1',
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
      id: 'g4-f-2',
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
  'Sosyal Bilgiler': [
    {
      id: 'g4-sb-1',
      unitNumber: 1,
      unitName: '1. Ünite: Birey ve Toplum',
      outcomeCode: 'MEB SB.4.1.1',
      outcomeTitle: 'Resmi Kimlik Belgesi, Bireysel İlgi ve Yetenekler',
      description: 'T.C. kimlik kartının bölümleri, bireysel farklılıklara saygı ve empati becerisi.',
      week: '1 - 4. Hafta',
      hours: 3,
      keyConcepts: ['Kimlik Kartı', 'Farklılıklara Saygı', 'Kronoloji'],
    },
    {
      id: 'g4-sb-2',
      unitNumber: 2,
      unitName: '2. Ünite: Kültür ve Miras',
      outcomeCode: 'MEB SB.4.2.2',
      outcomeTitle: 'Millî Mücadele Kahramanları ve Aile Tarihi',
      description: 'Aile büyüklerinin tanıklığıyla sözlü tarih çalışması ve Millî Mücadele dönemi.',
      week: '5 - 9. Hafta (Aktif MEB Dönemi)',
      hours: 3,
      keyConcepts: ['Sözlü Tarih', 'Kültürel Miras', 'Millî Mücadele'],
    },
  ],
  'Yabancı Dil (İngilizce)': [
    {
      id: 'g4-eng-1',
      unitNumber: 1,
      unitName: 'Unit 1: Classroom Rules',
      outcomeCode: 'MEB ENG.4.1.1',
      outcomeTitle: 'Giving and Following Classroom Instructions',
      description: 'Sınıf içi izin isteme kalıpları (May I...?) ve yönergeleri kavrama.',
      week: '1 - 4. Hafta',
      hours: 2,
      keyConcepts: ['Classroom Rules', 'Polite Requests', 'Daily Routines'],
    },
    {
      id: 'g4-eng-2',
      unitNumber: 2,
      unitName: 'Unit 2: Nationality',
      outcomeCode: 'MEB ENG.4.2.1',
      outcomeTitle: 'Talking about Countries and Nationalities',
      description: 'Ülkeleri ve milletleri tanıtma (Where are you from? I am from Turkey).',
      week: '5 - 9. Hafta (Aktif MEB Dönemi)',
      hours: 2,
      keyConcepts: ['Countries', 'Nationalities', 'World Map'],
    },
  ],
  'Din Kültürü ve Ahlak Bilgisi': [
    {
      id: 'g4-dk-1',
      unitNumber: 1,
      unitName: '1. Ünite: Günlük Hayattaki Dini İfadeler',
      outcomeCode: 'MEB DK.4.1.1',
      outcomeTitle: 'Besmele, Selamlaşma, Şükür ve Dua Cümleleri',
      description: 'Günlük konuşmalarda geçen dini kavramları ve güzel temennileri anlamlandırır.',
      week: '1 - 5. Hafta',
      hours: 2,
      keyConcepts: ['Besmele', 'Selam', 'Şükür', 'Dua'],
    },
  ],
  'İnsan Hakları, Yurttaşlık ve Demokrasi': [
    {
      id: 'g4-ih-1',
      unitNumber: 1,
      unitName: '1. Ünite: İnsan Olmak ve Haklarımız',
      outcomeCode: 'MEB İH.4.1.1',
      outcomeTitle: 'Temel Hak ve Özgürlükler ile Sorumluluk Bilinci',
      description: 'Yaşama, eğitim, sağlık hakları ile çocuk hakları sözleşmesi maddelerini kavrar.',
      week: '1 - 5. Hafta',
      hours: 2,
      keyConcepts: ['Temel Haklar', 'Çocuk Hakları', 'Sorumluluk'],
    },
  ],
  'Trafik Güvenliği': [
    {
      id: 'g4-tg-1',
      unitNumber: 1,
      unitName: '1. Ünite: Trafikte Güvenlik Kuralları',
      outcomeCode: 'MEB TG.4.1.1',
      outcomeTitle: 'Trafik İşaret Levhaları ve Güvenli Geçiş Yerleri',
      description: 'Yaya geçidi, üst geçit, emniyet kemeri kullanımı ve okul servisi kurallarını uygular.',
      week: '1 - 5. Hafta',
      hours: 1,
      keyConcepts: ['Yaya Geçidi', 'Emniyet Kemeri', 'Trafik Işıkları'],
    },
  ],
  'Görsel Sanatlar': [
    {
      id: 'g4-gs-1',
      unitNumber: 1,
      unitName: '1. Ünite: Görsel Sanatlarda Biçimlendirme',
      outcomeCode: 'MEB GS.4.1.1',
      outcomeTitle: 'Renk Çemberi, Zıt Renkler ve Doku Çalışmaları',
      description: 'Sıcak-soğuk renkleri, zıtlıkları ve farklı yüzey dokularını resimlerinde kullanır.',
      week: '1 - 6. Hafta',
      hours: 1,
      keyConcepts: ['Zıt Renkler', 'Doku', 'Görsel Kompozisyon'],
    },
  ],
  'Müzik': [
    {
      id: 'g4-muz-1',
      unitNumber: 1,
      unitName: '1. Ünite: Müziksel Algı ve Bilgilenme',
      outcomeCode: 'MEB MÜZ.4.1.1',
      outcomeTitle: 'Nota İsimleri, Süreleri ve Ritim Çalgıları',
      description: 'Temel solfej bilgisi, portede nota yerleri ve İstiklal Marşı’nı usulüne uygun seslendirme.',
      week: '1 - 6. Hafta',
      hours: 1,
      keyConcepts: ['Porte', 'Sol Anahtarı', 'Nota Süreleri'],
    },
  ],
  'Beden Eğitimi ve Oyun': [
    {
      id: 'g4-beo-1',
      unitNumber: 1,
      unitName: '1. Ünite: Fiziksel Etkinlik ve Spor Becerileri',
      outcomeCode: 'MEB BEO.4.1.1',
      outcomeTitle: 'Düzen Alıştırmaları, Jimnastik ve Takım Oyunları',
      description: 'Sıra olma, dönüşler, temel esneklik hareketleri ve takım çalışmasında sorumluluk alma.',
      week: '1 - 6. Hafta',
      hours: 2,
      keyConcepts: ['Düzen Alıştırmaları', 'Takım Ruhu', 'Sağlıklı Yaşam'],
    },
  ],
}

const GRADE_5_7_SUBJECTS: Record<string, CurriculumTopic[]> = {
  'Türkçe': [
    {
      id: 'g5-t-1',
      unitNumber: 1,
      unitName: '1. Tema: Sözcükte ve Cümlede Anlam',
      outcomeCode: 'MEB T.6.1.1',
      outcomeTitle: 'Gerçek, Mecaz, Terim Anlam ve Örtülü Anlam Çözümleme',
      description: 'Metindeki sözcüklerin bağlamsal anlamını, deyimleri ve atasözlerini kavrar.',
      week: '1 - 4. Hafta',
      hours: 6,
      keyConcepts: ['Mecaz Anlam', 'Terim', 'Örtülü Anlam'],
    },
    {
      id: 'g5-t-2',
      unitNumber: 2,
      unitName: '2. Tema: Paragrafta Anlam ve Yapı',
      outcomeCode: 'MEB T.6.2.2',
      outcomeTitle: 'Düşünceyi Geliştirme Yolları ve Anlatım Biçimleri',
      description: 'Tanımlama, örneklendirme, tanık gösterme ve betimleyici-öyküleyici anlatımı tahlil eder.',
      week: '5 - 9. Hafta (Aktif MEB Dönemi)',
      hours: 6,
      keyConcepts: ['Anlatım Biçimleri', 'Tanımlama', 'Örnekleme'],
    },
  ],
  'Matematik': [
    {
      id: 'g5-m-1',
      unitNumber: 1,
      unitName: '1. Ünite: Doğal Sayılar ve İşlemler',
      outcomeCode: 'MEB MAT.6.1.1',
      outcomeTitle: 'Üslü İfadeler ve İşlem Önceliği Stratejileri',
      description: 'Doğal sayıların karesi ve küpü, parantezli işlemlerde kural sırasını uygular.',
      week: '1 - 4. Hafta',
      hours: 5,
      keyConcepts: ['Üslü Sayı', 'İşlem Önceliği', 'Ortak Çarpan'],
    },
    {
      id: 'g5-m-2',
      unitNumber: 2,
      unitName: '2. Ünite: Kesirler ve Ondalık Gösterim',
      outcomeCode: 'MEB MAT.6.2.1',
      outcomeTitle: 'Kesirlerle Dört İşlem ve Modelleme Problemleri',
      description: 'Paydaları eşitleme, sadeleştirme ve günlük yaşam senaryolarında kesir hesaplamaları.',
      week: '5 - 9. Hafta (Aktif MEB Dönemi)',
      hours: 5,
      keyConcepts: ['Kesirlerde Çarpma', 'Ondalık Gösterim', 'Sadeleştirme'],
    },
  ],
  'Fen Bilimleri': [
    {
      id: 'g5-f-1',
      unitNumber: 1,
      unitName: '1. Ünite: Güneş Sistemi ve Tutulmalar',
      outcomeCode: 'MEB FEN.6.1.1',
      outcomeTitle: 'Gezegenlerin Özellikleri ve Güneş-Ay Tutulması Modelleri',
      description: 'İç ve dış gezegenler, asteroit kuşağı, Güneş ve Ay tutulmalarının gerçekleşme koşulları.',
      week: '1 - 5. Hafta',
      hours: 4,
      keyConcepts: ['Güneş Sistemi', 'Güneş Tutulması', 'Ay Tutulması'],
    },
    {
      id: 'g5-f-2',
      unitNumber: 2,
      unitName: '2. Ünite: Vücudumuzdaki Sistemler',
      outcomeCode: 'MEB FEN.6.2.2',
      outcomeTitle: 'Dolaşım, Solunum ve Boşaltım Sistemlerinin Görevleri',
      description: 'Büyük ve küçük kan dolaşımı, akciğerlerin yapısı ve böbreklerin kanı filtrelemesi.',
      week: '6 - 10. Hafta (Aktif MEB Dönemi)',
      hours: 4,
      keyConcepts: ['Kan Dolaşımı', 'Kalbin Odacıkları', 'Böbrekler'],
    },
  ],
  'Sosyal Bilgiler': [
    {
      id: 'g5-sb-1',
      unitNumber: 1,
      unitName: '1. Ünite: Biz ve Değerlerimiz',
      outcomeCode: 'MEB SB.6.1.1',
      outcomeTitle: 'Toplumsal Roller, Kültürel Bağlar ve Ön Yargıyı Kırma',
      description: 'Kültürel zenginlik, yardımlaşma kurumları ve toplumsal uyum kuralları.',
      week: '1 - 4. Hafta',
      hours: 3,
      keyConcepts: ['Sosyal Roller', 'Ön Yargı', 'Toplumsal Birlik'],
    },
  ],
  'Yabancı Dil (İngilizce)': [
    {
      id: 'g5-eng-1',
      unitNumber: 1,
      unitName: 'Unit 1: Life & Daily Routines',
      outcomeCode: 'MEB ENG.6.1.1',
      outcomeTitle: 'Describing Daily Activities and Telling the Time',
      description: 'Simple Present Tense ile günlük program anlatımı ve saatleri ifade etme.',
      week: '1 - 4. Hafta',
      hours: 3,
      keyConcepts: ['Daily Routines', 'Simple Present', 'Telling Time'],
    },
  ],
  'Din Kültürü ve Ahlak Bilgisi': [
    {
      id: 'g5-dk-1',
      unitNumber: 1,
      unitName: '1. Ünite: Peygamber ve İlahi Kitap İnancı',
      outcomeCode: 'MEB DK.6.1.1',
      outcomeTitle: 'Peygamberlerin Nitelikleri ve Vahyin Amacı',
      description: 'Sıdk, emanet, tebliğ, fetanet ve ismet sıfatlarını örneklerle açıklar.',
      week: '1 - 4. Hafta',
      hours: 2,
      keyConcepts: ['Peygamber Sıfatları', 'İlahi Kitaplar', 'Mucize'],
    },
  ],
  'Bilişim Teknolojileri ve Yazılım': [
    {
      id: 'g5-bt-1',
      unitNumber: 1,
      unitName: '1. Ünite: Bilişim Etiği ve Dijital Vatandaşlık',
      outcomeCode: 'MEB BT.6.1.1',
      outcomeTitle: 'Siber Zorbalık, Güçlü Şifreleme ve Telif Hakları',
      description: 'Dijital ayak izi, güvenli internet kullanımı ve yaratıcı ortaklık (Creative Commons) lisansları.',
      week: '1 - 4. Hafta',
      hours: 2,
      keyConcepts: ['Siber Güvenlik', 'Telif Hakları', 'Dijital Ayak İzi'],
    },
    {
      id: 'g5-bt-2',
      unitNumber: 2,
      unitName: '2. Ünite: Blok Tabanlı Kodlama (Scratch)',
      outcomeCode: 'MEB BT.6.2.2',
      outcomeTitle: 'Döngüler, Koşul İfadeleri ve Etkileşimli Oyun Tasarımı',
      description: 'Eğer-ise blokları, değişkenler ve karakter animasyonlarıyla algoritma geliştirme.',
      week: '5 - 9. Hafta (Aktif MEB Dönemi)',
      hours: 2,
      keyConcepts: ['Scratch', 'Koşul İfadeleri', 'Döngü Bloğu'],
    },
  ],
  'Görsel Sanatlar': [
    {
      id: 'g5-gs-1',
      unitNumber: 1,
      unitName: '1. Ünite: Perspektif ve Mekân Derinliği',
      outcomeCode: 'MEB GS.6.1.1',
      outcomeTitle: 'Tek Kaçış Noktalı Perspektif ve Işık-Gölge',
      description: 'Ufuk çizgisi, kaçış noktası ve mekân çizimlerinde derinlik oluşturma.',
      week: '1 - 6. Hafta',
      hours: 1,
      keyConcepts: ['Perspektif', 'Kaçış Noktası', 'Işık-Gölge'],
    },
  ],
  'Müzik': [
    {
      id: 'g5-muz-1',
      unitNumber: 1,
      unitName: '1. Ünite: Türk Müziği Makamları ve Çalgıları',
      outcomeCode: 'MEB MÜZ.6.1.1',
      outcomeTitle: 'Nihavend ve Rast Makamında Şarkılar ve Bağlama',
      description: 'Geleneksel Türk çalgılarını tanır ve temel makam özelliklerini kavrar.',
      week: '1 - 6. Hafta',
      hours: 1,
      keyConcepts: ['Nihavend', 'Rast', 'Geleneksel Çalgılar'],
    },
  ],
  'Beden Eğitimi ve Spor': [
    {
      id: 'g5-bes-1',
      unitNumber: 1,
      unitName: '1. Ünite: Takım Sporları ve Voleybol Teknikleri',
      outcomeCode: 'MEB BES.6.1.1',
      outcomeTitle: 'Parmak Pas, Manşet Pas ve Servis Atma Kuralları',
      description: 'Voleybol temel kuralları, saha dizilişi ve sporcu disiplini.',
      week: '1 - 6. Hafta',
      hours: 2,
      keyConcepts: ['Manşet Pas', 'Parmak Pas', 'Takım Ruhu'],
    },
  ],
}

const GRADE_8_SUBJECTS: Record<string, CurriculumTopic[]> = {
  'Türkçe': [
    {
      id: 'g8-t-1',
      unitNumber: 1,
      unitName: '1. Tema: Fiilimsiler (Eylemsiler)',
      outcomeCode: 'MEB T.8.1.1',
      outcomeTitle: 'İsim-Fiil, Sıfat-Fiil ve Zarf-Fiil Eklerini Ayırt Etme',
      description: 'Cümledeki fiilimsileri bularak metin çözümlemelerinde ve LGS paragraf sorularında doğru uygular.',
      week: '1 - 4. Hafta',
      hours: 5,
      keyConcepts: ['İsim-Fiil', 'Sıfat-Fiil', 'Zarf-Fiil', 'Fiilimsi Ekleri'],
    },
    {
      id: 'g8-t-2',
      unitNumber: 2,
      unitName: '2. Tema: Cümlenin Ögeleri ve Anlatım Bozuklukları',
      outcomeCode: 'MEB T.8.2.2',
      outcomeTitle: 'Temel ve Yardımcı Ögeleri Çözümleme & LGS Mantık-Muhakeme',
      description: 'Yüklem, özne, nesne, yer tamlayıcısı ve zarf tamlayıcısı analizi.',
      week: '5 - 9. Hafta (Aktif MEB Dönemi)',
      hours: 5,
      keyConcepts: ['Özne-Yüklem', 'Nesne', 'Zarf Tamlayıcısı'],
    },
  ],
  'Matematik (LGS)': [
    {
      id: 'g8-m-1',
      unitNumber: 1,
      unitName: '1. Ünite: Çarpanlar ve Katlar',
      outcomeCode: 'MEB MAT.8.1.1',
      outcomeTitle: 'EBOB-EKOK Problemleri ve Aralarında Asal Sayılar',
      description: 'Pozitif tam sayıların asal çarpanları, en büyük ortak bölen ve yeni nesil LGS senaryoları.',
      week: '1 - 4. Hafta',
      hours: 5,
      keyConcepts: ['EBOB', 'EKOK', 'Aralarında Asal', 'Yeni Nesil Soru'],
    },
    {
      id: 'g8-m-2',
      unitNumber: 2,
      unitName: '2. Ünite: Üslü ve Kareköklü İfadeler',
      outcomeCode: 'MEB MAT.8.2.1',
      outcomeTitle: 'Tam Kare Sayılar, Kareköklü İfadelerde Dört İşlem',
      description: 'Karekök dışına çıkarma, yaklaşık değer bulma ve bilimsel gösterim.',
      week: '5 - 9. Hafta (Aktif MEB Dönemi)',
      hours: 5,
      keyConcepts: ['Kareköklü Sayılar', 'Tam Kare', 'Bilimsel Gösterim'],
    },
  ],
  'Fen Bilimleri (LGS)': [
    {
      id: 'g8-f-1',
      unitNumber: 1,
      unitName: '1. Ünite: Mevsimler ve İklim',
      outcomeCode: 'MEB FEN.8.1.1',
      outcomeTitle: 'Dünya’nın Eksen Eğikliği, Mevsim Oluşumu ve İklim-Hava Olayları',
      description: 'Güneş ışınlarının gelme açısı, gölge boyu hesabı ve küresel iklim değişikliği.',
      week: '1 - 4. Hafta',
      hours: 4,
      keyConcepts: ['Eksen Eğikliği', 'Dönenceler', 'İklim ve Hava Olayı'],
    },
    {
      id: 'g8-f-2',
      unitNumber: 2,
      unitName: '2. Ünite: DNA ve Genetik Kod',
      outcomeCode: 'MEB FEN.8.2.1',
      outcomeTitle: 'Nükleotidler, DNA Eşlenmesi, Mutasyon ve Modifikasyon',
      description: 'Genetik yapının aktarımı, adaptasyon, doğal seçilim ve biyoteknoloji.',
      week: '5 - 9. Hafta (Aktif MEB Dönemi)',
      hours: 4,
      keyConcepts: ['DNA Eşlenmesi', 'Mutasyon', 'Modifikasyon', 'Biyoteknoloji'],
    },
  ],
  'T.C. İnkılap Tarihi ve Atatürkçülük': [
    {
      id: 'g8-it-1',
      unitNumber: 1,
      unitName: '1. Ünite: Bir Kahraman Doğuyor',
      outcomeCode: 'MEB İNK.8.1.1',
      outcomeTitle: 'Mustafa Kemal’in Çocukluk ve Öğrenim Hayatı, Fikir Dünyası',
      description: 'Selanik’in jeopolitik konumu, Manastır ve İstanbul Askeri İdadisi etkileri.',
      week: '1 - 4. Hafta',
      hours: 2,
      keyConcepts: ['Selanik', 'Fikir Hayatı', 'Trablusgarp Savaşı'],
    },
    {
      id: 'g8-it-2',
      unitNumber: 2,
      unitName: '2. Ünite: Millî Uyanış: Bağımsızlık Yolunda Atılan Adımlar',
      outcomeCode: 'MEB İNK.8.2.2',
      outcomeTitle: '1. Dünya Savaşı, Mondros Ateşkesi ve Genelgeler-Kongreler',
      description: 'Havza ve Amasya Genelgesi, Erzurum ve Sivas Kongreleri kararları.',
      week: '5 - 9. Hafta (Aktif MEB Dönemi)',
      hours: 2,
      keyConcepts: ['Mondros', 'Kuvâ-yı Millîye', 'Misak-ı Millî'],
    },
  ],
  'Yabancı Dil (İngilizce)': [
    {
      id: 'g8-eng-1',
      unitNumber: 1,
      unitName: 'Unit 1: Friendship',
      outcomeCode: 'MEB ENG.8.1.1',
      outcomeTitle: 'Accepting, Refusing and Making Excuses with Friends',
      description: 'Arkadaşlık ilişkileri, davet etme ve kibarca mazeret bildirme kalıpları.',
      week: '1 - 4. Hafta',
      hours: 4,
      keyConcepts: ['Friendship', 'Accepting/Refusing', 'Making Excuses'],
    },
  ],
  'Din Kültürü ve Ahlak Bilgisi': [
    {
      id: 'g8-dk-1',
      unitNumber: 1,
      unitName: '1. Ünite: Kader ve Kaza İnancı',
      outcomeCode: 'MEB DK.8.1.1',
      outcomeTitle: 'Evrenin Yasaları (Fiziksel, Biyolojik, Toplumsal) ve Tevekkül',
      description: 'İnsanın iradesi, sorumluluğu, rızık, ömür ve tevekkül kavramlarını çözümler.',
      week: '1 - 4. Hafta',
      hours: 2,
      keyConcepts: ['Kader ve Kaza', 'Sünnetullah', 'Tevekkül'],
    },
  ],
  'Rehberlik ve Kariyer Planlama': [
    {
      id: 'g8-rk-1',
      unitNumber: 1,
      unitName: '1. Ünite: LGS Sınav Stratejileri ve Motivasyon',
      outcomeCode: 'MEB RK.8.1.1',
      outcomeTitle: 'Zaman Yönetimi, Deneme Analizi ve Hedef Belirleme',
      description: 'Verimli ders çalışma planı hazırlama, sınav kaygısıyla baş etme yöntemleri.',
      week: '1 - 8. Hafta',
      hours: 1,
      keyConcepts: ['Zaman Yönetimi', 'Deneme Analizi', 'Sınav Motivasyonu'],
    },
  ],
  'Bilişim & Kodlama Atölyesi': [
    {
      id: 'g8-bk-1',
      unitNumber: 1,
      unitName: '1. Ünite: Python ile Metin Tabanlı Kodlama',
      outcomeCode: 'MEB BT.8.1.1',
      outcomeTitle: 'Değişkenler, Veri Tipleri, Koşul ve Döngü Yapıları',
      description: 'Python sözdizimi, konsol girdisi alma ve matematiksel algoritma çözümleri.',
      week: '1 - 8. Hafta',
      hours: 2,
      keyConcepts: ['Python', 'Değişkenler', 'Koşullu Durumlar'],
    },
  ],
  'Görsel Sanatlar': [
    {
      id: 'g8-gs-1',
      unitNumber: 1,
      unitName: '1. Ünite: Grafik Tasarım ve İllüstrasyon',
      outcomeCode: 'MEB GS.8.1.1',
      outcomeTitle: 'Afiş, Logo ve Tipografi Tasarımı İlkeleri',
      description: 'Mesaj ileten görsel tasarımlar, semboller ve renk psikolojisi.',
      week: '1 - 6. Hafta',
      hours: 1,
      keyConcepts: ['Grafik Tasarım', 'Tipografi', 'Afiş'],
    },
  ],
  'Müzik': [
    {
      id: 'g8-muz-1',
      unitNumber: 1,
      unitName: '1. Ünite: Çok Sesli Müzik ve Batı Müziği Dönemleri',
      outcomeCode: 'MEB MÜZ.8.1.1',
      outcomeTitle: 'Barok, Klasik ve Romantik Dönem Bestecileri',
      description: 'Bach, Mozart, Beethoven eserlerini dinleme ve tahlil etme.',
      week: '1 - 6. Hafta',
      hours: 1,
      keyConcepts: ['Klasik Batı Müziği', 'Çok Seslilik', 'Büyük Besteciler'],
    },
  ],
  'Beden Eğitimi ve Spor': [
    {
      id: 'g8-bes-1',
      unitNumber: 1,
      unitName: '1. Ünite: Basketbol ve Atletizm Becerileri',
      outcomeCode: 'MEB BES.8.1.1',
      outcomeTitle: 'Top Sürme, Turnike, Şut Teknikleri ve Kondisyon',
      description: 'Oyun kuralları, hakem işaretleri ve sportmence rekabet bilinci.',
      week: '1 - 6. Hafta',
      hours: 2,
      keyConcepts: ['Basketbol Turnike', 'Kondisyon', 'Fair-Play'],
    },
  ],
}

function generateGenericCurriculumTopics(subjectName: string, gradeNum: number): CurriculumTopic[] {
  return [
    {
      id: `gen-${subjectName.toLowerCase().replace(/\s+/g, '-')}-1`,
      unitNumber: 1,
      unitName: `1. Ünite: ${subjectName} Temelleri`,
      outcomeCode: `MEB ${subjectName.slice(0, 3).toUpperCase()}.${gradeNum}.1.1`,
      outcomeTitle: `${subjectName} Temel Kavramları ve Giriş`,
      description: `${subjectName} dersinin ana hatları, temel tanımlar ve günlük yaşam ile bağlantıları.`,
      week: '1 - 4. Hafta',
      hours: 2,
      keyConcepts: ['Giriş', 'Temel Bilgiler', 'Uygulama'],
    },
    {
      id: `gen-${subjectName.toLowerCase().replace(/\s+/g, '-')}-2`,
      unitNumber: 2,
      unitName: `2. Ünite: ${subjectName} Uygulama ve Kavrama`,
      outcomeCode: `MEB ${subjectName.slice(0, 3).toUpperCase()}.${gradeNum}.2.1`,
      outcomeTitle: `${subjectName} Etkinlik ve Analiz Çalışmaları`,
      description: `Konuyla ilgili örnek olay incelemeleri, problem çözme ve ders içi etkinlikler.`,
      week: '5 - 9. Hafta (Aktif MEB Dönemi)',
      hours: 2,
      keyConcepts: ['Etkinlik', 'Kavrama', 'Değerlendirme'],
    },
    {
      id: `gen-${subjectName.toLowerCase().replace(/\s+/g, '-')}-3`,
      unitNumber: 3,
      unitName: `3. Ünite: ${subjectName} Pekiştirme ve Proje`,
      outcomeCode: `MEB ${subjectName.slice(0, 3).toUpperCase()}.${gradeNum}.3.1`,
      outcomeTitle: `${subjectName} Bireysel ve Grup Projeleri`,
      description: `Kazanımların derinleştirilmesi, araştırma ve sunum çalışmaları.`,
      week: '10 - 15. Hafta',
      hours: 2,
      keyConcepts: ['Proje', 'Araştırma', 'Sunum'],
    },
  ]
}

function getCatalogForClass(classItem?: ClassroomItem): Record<string, CurriculumTopic[]> {
  const rawGrade = classItem?.grade_level || classItem?.name || classItem?.code || '1'
  const match = rawGrade.match(/\d+/)
  const grade = match ? parseInt(match[0], 10) : 1

  let baseCatalog: Record<string, CurriculumTopic[]>
  if (grade >= 1 && grade <= 3) {
    baseCatalog = { ...GRADE_1_3_SUBJECTS }
  } else if (grade === 4) {
    baseCatalog = { ...GRADE_4_SUBJECTS }
  } else if (grade >= 5 && grade <= 7) {
    baseCatalog = { ...GRADE_5_7_SUBJECTS }
  } else if (grade === 8) {
    baseCatalog = { ...GRADE_8_SUBJECTS }
  } else {
    baseCatalog = { ...HIGH_SCHOOL_SUBJECTS }
  }

  // Also merge any additional subjects found in the weekly schedule for this class
  try {
    const classSchedule = getSynchronizedClassWeeklySchedule(classItem?.code || '1/A')
    if (Array.isArray(classSchedule)) {
      classSchedule.forEach((entry: any) => {
        const subj = entry.subject?.trim()
        if (subj && !baseCatalog[subj]) {
          baseCatalog[subj] = generateGenericCurriculumTopics(subj, grade)
        }
      })
    }
  } catch (_) {}

  return baseCatalog
}

interface WeeklyCurriculumProgressWidgetProps {
  selectedClass: ClassroomItem
  onOpenWhiteboard?: () => void
}

export default function WeeklyCurriculumProgressWidget({
  selectedClass,
  onOpenWhiteboard,
}: WeeklyCurriculumProgressWidgetProps) {
  // Dynamically compute the complete catalog of subjects belonging to the current selected class
  const subjectCatalog = useMemo(() => {
    return getCatalogForClass(selectedClass)
  }, [selectedClass])

  const subjectList = useMemo(() => Object.keys(subjectCatalog), [subjectCatalog])

  const [selectedSubject, setSelectedSubject] = useState<string>(() => {
    const initialCatalog = getCatalogForClass(selectedClass)
    const keys = Object.keys(initialCatalog)
    return keys[0] || 'Türkçe'
  })

  // Ensure selectedSubject is always valid for the current class catalog
  useEffect(() => {
    if (!subjectCatalog[selectedSubject]) {
      setSelectedSubject(subjectList[0] || 'Türkçe')
    }
  }, [subjectCatalog, selectedSubject, subjectList])

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
    const norm = normalizeClassCode(selectedClass?.code || '1/A').replace(/[\/\s]/g, '-')
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

          </div>
        </div>
      </div>
    </div>
  )
}
