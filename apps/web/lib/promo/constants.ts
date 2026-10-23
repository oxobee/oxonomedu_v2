import { 
  GraduationCap, 
  BookOpen, 
  School, 
  PenTool, 
  Award, 
  Users, 
  LayoutDashboard, 
  Sparkles, 
  Languages, 
  ClipboardCheck, 
  LineChart, 
  Monitor, 
  ShieldCheck, 
  Layers, 
  Zap, 
  Lightbulb,
  CheckCircle2,
  CalendarDays,
  Target
} from 'lucide-react';

export const pricing = {
  payAsYouGo: {
    msg: { label: 'Öğrenci Başı', price: '₺25', unit: 'öğrenci / ay' },
    voice: { label: 'Akıllı Tahta', price: '₺490', unit: 'sınıf / ay' },
  },

  // ─── ÖĞRETMEN & BİREYSEL PAKETLER ───
  voice: [
    {
      id: 'ogretmen-temel',
      name: 'Öğretmen Başlangıç',
      minutes: '1 Sınıf',
      pricePerMin: '',
      totalPrice: '₺299',
      upsell: 'Pro paketine geçerek sınırsız şube ve tahta oturumu kazanın',
      popular: false,
      desc: 'Bireysel öğretmenler ve sınıf öğretmenleri için',
      features: [
        '1 Sınıf / Şube (40 Öğrenciye kadar)',
        'Akıllı İnteraktif Tahta (Infinite Canvas)',
        '1 Dk Hızlı Okuma & WPM Ölçüm Atölyesi',
        'MEB Kılavuz Çizgili Yazı Atölyesi',
        'Temel Yoklama ve Not Girişi',
        'Öğrenci Sınıf Katılım Kodu',
        'E-posta ve Topluluk Desteği',
      ],
      limits: {
        concurrentCalls: '1 Canlı Oturum',
        languages: 'Türkçe + İngilizce',
        analytics: 'Temel Raporlama',
        support: 'E-posta (24 Saat)'
      }
    },
    {
      id: 'ogretmen-pro',
      name: 'Öğretmen Pro',
      minutes: '5 Şube',
      pricePerMin: '',
      totalPrice: '₺599',
      upsell: 'Yıllık planda %25 indirim kazanın',
      popular: true,
      desc: 'Branş öğretmenleri ve yoğun ders veren eğitmenler için',
      features: [
        '5 Şube / 200 Öğrenciye kadar',
        'Sınırsız Akıllı Tahta Sayfası ve PDF İçe Aktarma',
        'Tüm İnteraktif Atölyeler (Okuma, Yazı, İngilizce)',
        'Gelişmiş Yoklama & GNO Karne Motoru',
        'Ödev Dağıtım ve Geri Bildirim Sistemi',
        'Sınırsız Tahta Kaydı ve Çevrimdışı İndirme',
        'Öncelikli WhatsApp ve Canlı Destek',
      ],
      limits: {
        concurrentCalls: '5 Eşzamanlı Tahta',
        languages: 'Tüm Diller & Formüller',
        analytics: 'Gelişmiş Gelişim Grafikleri',
        support: 'Öncelikli Destek (1 Saat)'
      }
    },
    {
      id: 'ogretmen-master',
      name: 'Öğretmen Master',
      minutes: 'Sınırsız',
      pricePerMin: '',
      totalPrice: '₺999',
      upsell: 'Okulunuz için Kurumsal Kampüs teklifi alın',
      popular: false,
      desc: 'Zümre başkanları, özel ders eğitmenleri ve koçlar için',
      features: [
        'Sınırsız Şube ve Öğrenci Kapasitesi',
        'Özel Müfredat Yükleme ve Yapay Zeka Soru Havuzu',
        'Detaylı Veli İlerleme Raporları ve PDF Çıktısı',
        'CRDT Canlı Ortak Çalışma (Collab Whiteboard)',
        'Tüm Atölye ve Mini Oyunlar Sınırsız',
        'Kişisel Alan Adı / Özel Öğretmen Profili',
        'Birebir Danışmanlık ve Eğitim Atölyesi',
      ],
      limits: {
        concurrentCalls: 'Sınırsız Tahta & Oturum',
        languages: 'Tüm Müfredat Seviyeleri',
        analytics: 'Yapay Zeka Destekli İçgörüler',
        support: '7/24 Birebir VIP Destek'
      }
    }
  ],

  // ─── OKUL & KAMPÜS PAKETLERİ (K-12 LMS) ───
  messaging: [
    {
      id: 'okul-starter',
      name: 'Okul Starter',
      conversations: '500 Öğrenci',
      pricePerConv: '',
      totalPrice: '₺4.900',
      period: '/ay',
      popular: false,
      desc: 'Butik okullar, anaokulu ve ilkokullar için',
      features: [
        '500 Öğrenciye kadar tam K-12 Kütük Yönetimi',
        'Tüm Sınıf Öğretmenleri İçin Akıllı Tahta Lisansı',
        'Hızlı K-12 Yoklama Motoru (Geldi, Geç, İzinli)',
        '1 Dk Okuma & MEB Çizgili Yazı Atölyesi Entegrasyonu',
        'Okul Dijital Bilgi Panosu (Pano TV)',
        'Otomatik Sınıf Katılım Kodları',
        'Haftalık Yönetim Özeti ve İstatistikler',
      ],
      channels: ['İlkokul & Anaokulu', 'Öğretmen Paneli', 'Öğrenci Portalı'],
      limits: {
        botCount: '15 Öğretmen Lisansı',
        history: '1 Eğitim Yılı',
        crm: 'Temel E-Okul Formatı',
        analytics: 'Haftalık Devamsızlık Raporu'
      }
    },
    {
      id: 'okul-pro',
      name: 'K-12 Kampüs',
      conversations: '1.500 Öğrenci',
      pricePerConv: '',
      totalPrice: '₺9.900',
      period: '/ay',
      popular: true,
      desc: 'Ortaokul ve liseler, tam kapsamlı K-12 kolejler için',
      features: [
        '1.500 Öğrenci ve 60 Öğretmen Hesabı',
        'Çok Kiracılı (Multi-Tenant) Şube & Kampüs Yönetimi',
        'Tüm Atölyeler (Okuma, Harf Çizgi, İngilizce Macera)',
        'GNO Motoru & E-Okul Uyumlu Dönemlik Karne',
        'Veli Bilgilendirme Portalı ve Bildirimler',
        'Hocuspocus Gerçek Zamanlı Collab Tahta Sunucusu',
        'Rehberlik ve Psikolojik Danışmanlık Not Modülü',
      ],
      channels: ['K-12 Tüm Kademeler', 'İdare Paneli', 'Veli & Öğrenci Paneli'],
      limits: {
        botCount: '60 Öğretmen Lisansı',
        history: 'Sınırsız Arşiv',
        crm: 'Tam MEB & E-Okul Uyumu',
        analytics: 'Detaylı Akademik Başarı Paneli'
      }
    },
    {
      id: 'okul-enterprise',
      name: 'Kolej Zinciri',
      conversations: 'Sınırsız',
      pricePerConv: '',
      totalPrice: 'Özel Teklif',
      period: '',
      popular: false,
      desc: 'Çok kampüslü kolejler ve eğitim vakıfları için',
      features: [
        'Sınırsız Kampüs, Öğretmen ve Öğrenci Kapasitesi',
        'Kolej Kurumsal Kimliğine Özel White-Label & Domain',
        'Özel Sunucu Kurulumu (On-Premise veya Bulut)',
        'Özel SIS / ERP ve Muhasebe Entegrasyonları',
        'Özel Müfredat ve Deneme Sınavı Yönetimi',
        'Kuruma Özel Hizmet Seviyesi Anlaşması (SLA %99.9)',
        'Atanmış Kurumsal Müşteri Yöneticisi ve Eğitmenler',
      ],
      channels: ['Tüm Kampüsler', 'Zincir Yönetimi', 'Özel Mobil PWA'],
      limits: {
        botCount: 'Sınırsız Öğretmen & İdareci',
        history: 'Kalıcı Kurumsal Bulut',
        crm: 'Özel API & Veri Tabanı Entegrasyonu',
        analytics: 'Yapay Zeka Destekli Kampüs Kıyaslama'
      }
    }
  ],

  // ─── KOMBİNE / PLUS PAKETLER ───
  combo: [
    {
      id: 'combo-butik',
      name: 'Kampüs Plus Butik',
      voiceMinutes: '300 Öğrenci',
      conversations: '20 Öğretmen',
      price: '₺5.490',
      originalPrice: '₺7.200',
      discount: '%24 İndirim',
      period: '/ay',
      popular: false,
      desc: 'Küçük okullar, özel kurslar ve etüt merkezleri için hepsi bir arada',
      savings: 'Tek tek alıma göre yıllık ₺20.520 tasarruf',
      features: [
        'Tam K-12 Öğrenci Bilgi ve Kütük Sistemi',
        'Sınırsız Akıllı İnteraktif Tahta Kullanımı',
        '3 İnteraktif Eğitim Atölyesi (Okuma, Yazı, İngilizce)',
        'Yoklama, Not ve Devamsızlık Takibi',
        'Dijital Okul Panosu Entegrasyonu',
        'Öğretmen ve Veli İletişim Portalı',
        'Teknik Destek ve Canlı Eğitim Seansı',
      ],
      breakdown: {
        voiceValue: 'LMS & Kütük Sistemi',
        msgValue: 'Akıllı Tahta & Atölyeler',
        extraValue: 'Pano TV & Veli Portalı'
      }
    },
    {
      id: 'combo-standart',
      name: 'Kampüs Plus Pro',
      voiceMinutes: '1.000 Öğrenci',
      conversations: '50 Öğretmen',
      price: '₺10.900',
      originalPrice: '₺14.800',
      discount: '%26 İndirim',
      period: '/ay',
      popular: true,
      desc: 'Gelişmiş okullar ve kolejler için tam dijital ekosistem',
      savings: 'Tek tek alıma göre yıllık ₺46.800 tasarruf',
      features: [
        '1.000 Öğrenci & 50 Öğretmen İçin Eksiksiz Yetkilendirme',
        'Tüm Atölyelerde Oyunlaştırma ve Canlı Skor Tabloları',
        'CRDT Tabanlı Çoklu Kullanıcı Akıllı Tahta',
        'Otomatik GNO, Başarı Sıralaması ve Gelişim Karnesi',
        'Yapay Zeka Destekli Ders ve Ödev Analitiği',
        'Kurumsal E-posta ve SMS Bildirim Entegrasyonu',
        'Öncelikli 7/24 Teknik ve Pedagojik Destek',
      ],
      breakdown: {
        voiceValue: 'Gelişmiş K-12 LMS',
        msgValue: 'Collab Tahta & Atölyeler',
        extraValue: 'Yapay Zeka Analitiği & Raporlar'
      }
    },
    {
      id: 'combo-premium',
      name: 'Kampüs Plus Elite',
      voiceMinutes: '2.500+ Öğrenci',
      conversations: 'Sınırsız Öğretmen',
      price: '₺19.900',
      originalPrice: '₺27.500',
      discount: '%28 İndirim',
      period: '/ay',
      popular: false,
      desc: 'Prestijli kolejler, çok kampüslü okullar ve eğitim grupları',
      savings: 'Tek tek alıma göre yıllık ₺91.200 tasarruf',
      features: [
        'Sınırsız Öğretmen ve Şube Lisansı',
        'Özel Alan Adı ve Kurumsal Markalama (White-Label)',
        'Tüm Geçmiş Eğitim Yılları İçin Kalıcı Arşiv',
        'Yüksek Hızlı Özel Collab WebSocket Sunucusu',
        'Öğretmenler İçin Hizmetiçi Eğitim Sertifikasyon Programı',
        'Veli Toplantı Modülü ve Randevu Sistemi',
        'VIP Müşteri Temsilcisi ve Yerinde Kurulum Desteği',
      ],
      breakdown: {
        voiceValue: 'White-Label Kurumsal LMS',
        msgValue: 'Özel Collab Kümesi',
        extraValue: 'VIP Destek & Sertifikasyon'
      }
    }
  ]
};

export const sectors = [
  {
    id: 'ilkokul',
    name: 'İlkokul (1-4. Sınıf)',
    title: 'İlkokul 1-4. Sınıflar İçin Pedagojik Dijital Öğrenme',
    subtitle: 'Temel okuma-yazma, harf yönü, hızlı okuma ve görsel oyunlarla kalıcı öğrenme temelleri.',
    description: 'İlkokul seviyesindeki öğrencilerin motor becerileri ve algı düzeylerine uygun olarak geliştirilmiş MEB Dik Temel Harf Çizgi Atölyesi, 1 Dakika Hızlı Okuma ve Sevimli Hikaye Kütüphanesi ile öğrenmeyi eğlenceye dönüştürün.',
    badge: '1-4. SINIF MEB MÜFREDATI',
    icon: BookOpen,
    accentColor: 'from-[#4B075F] to-[#8D49A6]',
    stats: [
      { value: '%48', label: 'Okuma Hızı Artışı' },
      { value: '%94', label: 'Harf Yazılış Doğruluğu' },
      { value: '3x', label: 'Ders İçi Dikkat Süresi' },
      { value: '100+', label: 'İnteraktif Hikaye & Oyun' }
    ],
    challenges: [
      {
        title: 'Harflerin Yazılış Yönünü Öğretme Zorluğu',
        desc: 'Geleneksel kağıt üzerinde harflerin hangi çizgiden başlayıp nereye biteceğini kontrol etmek ve düzeltmek zaman alır.'
      },
      {
        title: 'Okuma Hızı ve Telaffuz Takibi',
        desc: 'Her öğrencinin dakikada kaç kelime okuduğunu manuel kronometreyle ölçmek sınıf yönetimini aksatır.'
      },
      {
        title: 'Soyut Kavramların Görselleştirilmesi',
        desc: 'İlkokul çağındaki çocukların dikkatini ders boyunca canlı tutmak için zengin görsel ve oyunlaştırılmış içerik gerekir.'
      }
    ],
    solutions: [
      {
        title: 'MEB 4 Çizgili 3 Aralıklı Kılavuz Satır',
        desc: 'Birebir ilkokul yazı defteri standardında animasyonlu harf yazılış yönü, kalem kılavuzu ve silgi desteği.'
      },
      {
        title: '60 Saniye Canlı WPM Sayacı',
        desc: 'Öğrencinin okuduğu kelimeleri anlık sayan, hece piramitleriyle göz kaslarını geliştiren akıllı okuma motoru.'
      },
      {
        title: 'Görsel Macera & Sevimli Maskotlar',
        desc: 'Akıllı baykuş maskotu ve eğlenceli başarı rozetleriyle her tamamlanan aktivitede anlık motivasyon pekiştirmesi.'
      }
    ],
    useCases: [
      {
        role: '1. Sınıf Öğretmeni',
        scenario: 'Harf öğretimi dersinde akıllı tahtada harfin yazılış yönünü gösterir, ardından öğrencileri tahtada pratik yaptırır.'
      },
      {
        role: 'Rehber Öğretmen',
        scenario: 'Okuma güçlüğü (disleksi) çeken öğrencilerin okuma hızlarını hafta bazında grafiklerle takip eder.'
      },
      {
        role: 'Veli',
        scenario: 'Çocuğunun evde 1 dakikalık okuma egzersizlerini tamamladığını ve WPM skorunu veli portalından anlık görür.'
      }
    ],
    roi: {
      metric: 'Okuma Becerisi',
      saving: '%48 Daha Hızlı Okuma Gelişimi',
      explanation: 'Öğrenciler kelime piramidi egzersizleri ve sesli telaffuz desteğiyle ilk dönem sonunda akıcı okumaya geçer.'
    },
    faq: [
      {
        q: 'İlkokul modülü MEB müfredatına birebir uygun mu?',
        a: 'Evet. Harf sırası, 4 çizgili 3 aralıklı yazı defteri kılavuzları ve dik temel abece fontları Talim Terbiye Kurulu standartlarına tam uyumludur.'
      },
      {
        q: 'Tablette veya dokunmatik akıllı tahtada çalışır mı?',
        a: 'Evet. Tüm atölyeler ve tahta bileşenleri dokunmatik ekranlar, tabletler ve akıllı tahtalar için sıfır gecikmeyle optimize edilmiştir.'
      }
    ]
  },
  {
    id: 'ortaokul',
    name: 'Ortaokul (5-8. Sınıf)',
    title: 'Ortaokul 5-8. Sınıflar İçin LGS Hazırlık ve İnteraktif Dersler',
    subtitle: 'Matematik, Fen ve Türkçe derslerinde kavramsal anlama, testler ve dinamik soru çözümleri.',
    description: 'LGS hazırlık sürecindeki ortaokul öğrencilerinin soyut mantık yürütme, problem çözme ve zaman yönetimi becerilerini geliştiren akıllı tahta ve soru modülleri.',
    badge: '5-8. SINIF & LGS HAZIRLIK',
    icon: GraduationCap,
    accentColor: 'from-[#4B075F] to-[#D914C8]',
    stats: [
      { value: '%35', label: 'Net Ortalaması Artışı' },
      { value: '12.000+', label: 'Müfredat Soru Havuzu' },
      { value: '%92', label: 'Ödev Teslim Oranı' },
      { value: '4 Kat', label: 'Geri Bildirim Hızı' }
    ],
    challenges: [
      {
        title: 'LGS Yeni Nesil Soruları Anlama Güçlüğü',
        desc: 'Uzun metinli ve görsel ağırlıklı yeni nesil soruları klasik tahtada çözmek zaman kaybına yol açar.'
      },
      {
        title: 'Ödev Takibi ve Değerlendirme Yükü',
        desc: 'Öğretmenlerin yüzlerce sayfa ödevi kontrol edip her öğrenciye özel eksik analizi yapması güçtür.'
      },
      {
        title: 'Ders İçi Etkileşimin Azalması',
        desc: 'Ergenlik çağındaki öğrencilerin derse odaklanması için interaktif katılım gereklidir.'
      }
    ],
    solutions: [
      {
        title: 'PDF Üzerinde Doğrudan Çözüm Tahtası',
        desc: 'Öğretmen deneme sınavı veya soru bankası PDF ini akıllı tahtaya tek tıkla aktarır, şekil ve formüllerle çözer.'
      },
      {
        title: 'Otomatik Ödev ve Sınav Merkezi',
        desc: 'Çoktan seçmeli ve açık uçlu ödevler sistem üzerinden anında değerlendirilir, konu bazlı kazanım karnesi çıkarılır.'
      },
      {
        title: 'Oyunlaştırılmış Mini Testler',
        desc: 'Ders sonunda 4 seçenekli hızlı yarışmalarla öğrenilen konular sınıfça pekiştirilir.'
      }
    ],
    useCases: [
      {
        role: 'Matematik Öğretmeni',
        scenario: 'Geometrik şekiller ve doğrusal denklem grafiklerini akıllı tahtada dinamik olarak çizdirir ve açar.'
      },
      {
        role: 'LGS Öğrencisi',
        scenario: 'Yapamadığı soruların çözümlerini öğretmenin akıllı tahta kaydından evde zumlayarak tekrar izler.'
      }
    ],
    roi: {
      metric: 'LGS Başarısı',
      saving: '+18 Net Ortalama Gelişimi',
      explanation: 'Konu eksiklerinin erken tespiti ve interaktif tahta kayıtlarıyla sınav başarısı belirgin şekilde yükselir.'
    },
    faq: [
      {
        q: 'Ödevler telefondan veya tabletten teslim edilebilir mi?',
        a: 'Evet. Öğrenciler PWA destekli web arayüzünden ödevlerini fotoğraflayarak veya form üzerinden anında gönderebilir.'
      }
    ]
  },
  {
    id: 'lise-kolej',
    name: 'Lise & Kolej (9-12. Sınıf)',
    title: 'Lise ve Kolejler İçin YKS Odaklı Akademik Ekosistem',
    subtitle: 'LaTeX matematik motoru, gelişmiş fizik-kimya formülleri ve üniversiteye hazırlık kütüphanesi.',
    description: 'YKS (TYT/AYT) maratonunda öğrencilerin derinlemesine öğrenmesini sağlayan, formül ve grafik desteğiyle zenginleştirilmiş akıllı tahta ve akademik performans takip motoru.',
    badge: '9-12. SINIF & YKS',
    icon: School,
    accentColor: 'from-[#241329] to-[#8D49A6]',
    stats: [
      { value: '1.2M+', label: 'Çözülen Soru Sayısı' },
      { value: '%99.2', label: 'Platform Kesintisizliği' },
      { value: '%85', label: 'Hedef Bölüm Yerleşimi' },
      { value: '15 dk', label: 'Ders Planlama Süresi' }
    ],
    challenges: [
      {
        title: 'Karmaşık Formül ve Denklemler',
        desc: 'Türev, integral, organik kimya ve fizik vektörlerini dijitalde düzgün ifade etmek zordur.'
      },
      {
        title: 'Gelişmiş GNO ve Not Yönetimi',
        desc: 'Milli Eğitim katsayılarına göre ağırlıklı dönem not ortalaması hesaplamak idari yük oluşturur.'
      }
    ],
    solutions: [
      {
        title: 'LaTeX ve Tiptap Zengin Matematik Motoru',
        desc: 'Tüm bilimsel simgeler, kesirler, matrisler ve vektörler sonsuz tuvalde pürüzsüzce işlenir.'
      },
      {
        title: 'Akıllı GNO & Karne Hesaplayıcı',
        desc: 'Sınav ve sözlü notları girildiğinde ağırlıklı genel not ortalamasını tek tıkla hesaplar ve kütüğe işler.'
      }
    ],
    useCases: [
      {
        role: 'Fizik Öğretmeni',
        scenario: 'Elektrik devrelerini ve dalga boylarını canlı tahta üzerinde simüle eder ve öğrencilerle paylaşır.'
      }
    ],
    roi: {
      metric: 'Akademik Başarı',
      saving: 'Yıllık %32 Başarı Artışı',
      explanation: 'Öğrenciler tüm ders içeriklerine 7/24 erişebildiği için konu kayıpları sıfıra iner.'
    },
    faq: [
      {
        q: 'LaTeX formülleri dışa aktarılabilir mi?',
        a: 'Evet. Tahtadaki tüm matematiksel içerikler PDF, PNG veya SVG formatında yüksek çözünürlükle kaydedilebilir.'
      }
    ]
  },
  {
    id: 'ogretmen-zumre',
    name: 'Öğretmen & Zümre Odası',
    title: 'Öğretmenler ve Zümreler İçin İşbirlikli Ders Tasarımı',
    subtitle: 'Ortak ders planları, paylaşılan akıllı tahta kütüphanesi ve eşzamanlı içerik hazırlama.',
    description: 'Aynı branştaki öğretmenlerin ortak sınavlar hazırlayabildiği, ders şablonlarını paylaştığı ve gerçek zamanlı CRDT teknolojisiyle birlikte ders tasarladığı zümre platformu.',
    badge: 'ÖĞRETMEN YETKİLENDİRME',
    icon: PenTool,
    accentColor: 'from-[#4B075F] to-[#620B79]',
    stats: [
      { value: '%70', label: 'Hazırlık Süresi Tasarrufu' },
      { value: '500+', label: 'Hazır Ders Şablonu' },
      { value: '0 sn', label: 'Eşzamanlı Senkronizasyon' },
      { value: '%100', label: 'Öğretmen Memnuniyeti' }
    ],
    challenges: [
      {
        title: 'Zümre İçi Materyal Dağınıklığı',
        desc: 'Farklı şubelerdeki öğretmenlerin farklı materyaller kullanması okul standartlarını zedeler.'
      }
    ],
    solutions: [
      {
        title: 'Hocuspocus Gerçek Zamanlı Collab Tahta',
        desc: 'Aynı zümredeki öğretmenler tek bir tahta üzerinde eşzamanlı çalışarak ders materyali oluşturabilir.'
      }
    ],
    useCases: [
      {
        role: 'Zümre Başkanı',
        scenario: 'Tüm 9. sınıf matematik öğretmenleri için ortak 1. dönem kazanım planını ve tahta şablonlarını yayınlar.'
      }
    ],
    roi: {
      metric: 'Öğretmen Verimliliği',
      saving: 'Haftalık 6 Saat Tasarruf',
      explanation: 'Ders materyali ve yoklama yükü azalan öğretmenler öğrenci rehberliğine daha çok vakit ayırır.'
    },
    faq: [
      {
        q: 'Öğretmenler kendi özel materyallerini yükleyebilir mi?',
        a: 'Evet. PDF, görsel, Word veya video dosyaları kişisel kütüphaneye kolayca yüklenebilir.'
      }
    ]
  },
  {
    id: 'okul-idaresi',
    name: 'Okul Müdürü & İdare',
    title: 'Okul Yöneticileri İçin 360° Akıllı Kampüs Yönetimi',
    subtitle: 'Şubeli yapı, hızlı K-12 yoklama, kütük yönetimi, devamsızlık ve idari raporlar.',
    description: 'Okul idaresinin tüm sınıf, şube, öğretmen ve öğrencileri tek ekrandan yönetmesini sağlayan, rol tabanlı erişim kontrolü (RBAC) ile donatılmış yeni nesil idare paneli.',
    badge: 'K-12 İDARE & YÖNETİM',
    icon: LayoutDashboard,
    accentColor: 'from-[#241329] to-[#4B075F]',
    stats: [
      { value: '%99.8', label: 'Yoklama Doğruluğu' },
      { value: '1 Tıkla', label: 'Dönem Sonu Karnesi' },
      { value: '3 Kat', label: 'İdari Süreç Hızı' },
      { value: 'KVKK', label: 'Tam Uyumlu Veri Tabanı' }
    ],
    challenges: [
      {
        title: 'Manuel Yoklama ve Kağıt İsrafı',
        desc: 'Kağıt yoklama fişlerinin toplanması, idareye iletilmesi ve sisteme girilmesi saatler sürer.'
      }
    ],
    solutions: [
      {
        title: 'Tek Tıkla K-12 Hızlı Yoklama',
        desc: 'Öğretmen dersin ilk 2 dakikasında Geldi / Gelmedi / İzinli durumunu işaretler, idareye anında yansır.'
      }
    ],
    useCases: [
      {
        role: 'Müdür Yardımcısı',
        scenario: 'Sabah ilk ders sonrası tüm okulun devamsızlık özetini tek ekranda görür, velilere SMS bilgilendirmesi tetikler.'
      }
    ],
    roi: {
      metric: 'Operasyonel Tasarruf',
      saving: 'Yıllık %60 Kağıt & Zaman Tasarrufu',
      explanation: 'Yoklama fişleri, basılı duyurular ve evrak işleri tamamen dijital ortama taşınır.'
    },
    faq: [
      {
        q: 'E-Okul verileri içeri aktarılabilir mi?',
        a: 'Evet. Öğrenci kütük listeleri Excel veya CSV formatında tek tıkla topluca sisteme yüklenebilir.'
      }
    ]
  },
  {
    id: 'veli-rehberlik',
    name: 'Veli & Rehberlik Servisi',
    title: 'Veli İletişimi ve Rehberlik Gelişim Takip Modülü',
    subtitle: 'Şeffaf öğrenci gelişimi, rehberlik notları, devamsızlık uyarıları ve dijital pano.',
    description: 'Velilerin çocuklarının akademik başarısını, okuma hızını, derse katılımını ve ödev teslimlerini şeffaf şekilde takip etmesini sağlayan modern veli köprüsü.',
    badge: 'VELİ & REHBERLİK PORTALI',
    icon: Users,
    accentColor: 'from-[#8D49A6] to-[#D914C8]',
    stats: [
      { value: '%95', label: 'Veli Memnuniyeti' },
      { value: '24/7', label: 'Gelişim Takibi' },
      { value: '0 Gecikme', label: 'Önemli Duyurular' },
      { value: '%40', label: 'Rehberlik Görüşme Verimi' }
    ],
    challenges: [
      {
        title: 'Velinin Öğrenci Durumundan Geç Haberdar Olması',
        desc: 'Notlar veya devamsızlık sorunları ancak dönem sonu veli toplantılarında fark edildiğinde çok geç olabilir.'
      }
    ],
    solutions: [
      {
        title: 'Anlık Veli Bildirimleri ve Gelişim Karnesi',
        desc: 'Veli, öğrencinin WPM okuma skoru, tamamlanan ödevleri ve yoklama durumunu kendi panelinden anlık izler.'
      }
    ],
    useCases: [
      {
        role: 'Okul Psikolojik Danışmanı',
        scenario: 'Öğrencinin haftalık gelişim seyrini ve davranış notlarını güvenli şekilde kaydeder, veliyle paylaşır.'
      }
    ],
    roi: {
      metric: 'Veli Bağlılığı',
      saving: 'Şeffaf İletişim & Güven',
      explanation: 'Okul ile veli arasındaki bilgi kopukluğu giderilir, öğrenci başarısı kolektif olarak desteklenir.'
    },
    faq: [
      {
        q: 'Veliler birbirlerinin notlarını görebilir mi?',
        a: 'Hayır. Her veli sadece kendi öğrencisinin bilgilerini şifreli ve izole bir oturumla görür.'
      }
    ]
  },
  {
    id: 'etut-kurs',
    name: 'Kurs & Etüt Merkezleri',
    title: 'Özel Kurslar ve Etüt Merkezleri İçin Hızlı Sınıf Yönetimi',
    subtitle: 'Sınıf katılım kodları, birebir koçluk, hızlandırılmış atölyeler ve sınav takibi.',
    description: 'Etüt ve sınav hazırlık merkezleri için öğrencilerin tek bir kodla sınıflara katılabildiği, branş bazlı seviye tespit ve hızlandırma atölyeleri.',
    badge: 'KURS & ETÜT',
    icon: Award,
    accentColor: 'from-[#4B075F] to-[#8D49A6]',
    stats: [
      { value: '10 sn', label: 'Sınıfa Katılım Süresi' },
      { value: '3x', label: 'Öğrenci Kayıt Hızı' },
      { value: '%88', label: 'Sınav Başarı Oranı' },
      { value: '%100', label: 'Mobil Cihaz Uyumu' }
    ],
    challenges: [
      {
        title: 'Sürekli Değişen Öğrenci Listeleri',
        desc: 'Dönem ortasında gelen veya sınıf değiştiren öğrencileri geleneksel sistemlere tanımlamak karmaşıktır.'
      }
    ],
    solutions: [
      {
        title: 'Tek Tıkla Sınıf Katılım Kodu',
        desc: 'Öğretmen sınıfa özel 6 haneli kod üretir, öğrenciler kodu girerek anında sınıfa ve materyallere bağlanır.'
      }
    ],
    useCases: [
      {
        role: 'Etüt Merkezi Müdürü',
        scenario: 'Hafta sonu takviye kurslarına gelen yeni öğrencileri dakikalar içinde ilgili gruplara dağıtır.'
      }
    ],
    roi: {
      metric: 'Kayıt Verimliliği',
      saving: 'Sıfır İdari Bürokrasi',
      explanation: 'Öğrenciler kendi hesaplarını katılım koduyla eşleştirdiği için sekreterya yükü ortadan kalkar.'
    },
    faq: [
      {
        q: 'Kısa dönemli kamplar için kullanılabilir mi?',
        a: 'Evet. Yaz okulları, sömestr kampları ve hızlandırılmış LGS/YKS kampları için esnek paketlerimiz mevcuttur.'
      }
    ]
  },
  {
    id: 'dil-okullari',
    name: 'Dil Okulları & Yabancı Dil',
    title: 'Yabancı Dil Kursları İçin İngilizce Görsel Macera Atölyesi',
    subtitle: '8 tematik kategori, 100+ sesli kelime kartı, kopya önleyici mini testler ve interaktif telaffuz.',
    description: 'İngilizce öğreniminde çocukların ve gençlerin kelime dağarcığını kalıcı kılan, doğal en-US ses motoru ve eğlenceli oyunlaştırma mekanikleriyle donatılmış dil atölyesi.',
    badge: 'YABANCI DİL ATÖLYESİ',
    icon: Languages,
    accentColor: 'from-[#8D49A6] to-[#D914C8]',
    stats: [
      { value: '100+', label: 'Sesli Kelime Kartı' },
      { value: '8 Kategori', label: 'Hayvanlar, Renkler, Meslekler' },
      { value: 'en-US', label: 'Doğal Amerikan Telaffuzu' },
      { value: '%96', label: 'Kelime Kalıcılık Oranı' }
    ],
    challenges: [
      {
        title: 'Ezberlenen Kelimelerin Hızla Unutulması',
        desc: 'Görsel ve işitsel pekiştirme olmadan yapılan kelime listesi ezberleri birkaç gün içinde unutulur.'
      }
    ],
    solutions: [
      {
        title: 'Anti-Cheat Bulanıklık Kilidi & 4 Seçenekli Mini Oyun',
        desc: 'Mini oyun başladığında kartlar bulanıklaşarak öğrencinin ezberden kopya çekmesini engeller, kalıcı öğrenmeyi zorunlu kılar.'
      }
    ],
    useCases: [
      {
        role: 'İngilizce Öğretmeni',
        scenario: 'Dersin ilk 15 dakikasında hayvanlar kategorisini açarak telaffuz çalışması yapar, ardından sınıfça yarışma düzenler.'
      }
    ],
    roi: {
      metric: 'Dil Kalıcılığı',
      saving: '3 Kat Daha Hızlı Kelime Öğrenimi',
      explanation: 'Görsel hafıza ve işitsel telaffuz kombinasyonu kelime öğrenme süresini üçte bire indirir.'
    },
    faq: [
      {
        q: 'Farklı diller eklenecek mi?',
        a: 'Evet. Almanca, Fransızca ve İspanyolca kategorileri de yakında müfredata dahil edilecektir.'
      }
    ]
  }
];

export const blogPosts: Array<{
  id: string;
  slug: string;
  category: string;
  categorySlug: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  readTime: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  tags: string[];
  featured?: boolean;
}> = [
  {
    id: '1',
    slug: 'egitimde-teknolojinin-onemi-akilli-tahta-ve-dijital-donusum',
    category: 'Eğitim Teknolojileri',
    categorySlug: 'egitim-teknolojileri',
    title: 'Eğitimde Teknolojinin Önemi: Akıllı Tahtadan Evdeki Ekrana Kesintisiz Öğrenme Köprüsü',
    summary: 'Geleneksel kara tahtalardan yapay zekâ destekli interaktif tuvale: Sınıfta işlenen derslerin anında dijitalleşip evde öğrenci profiline aktarılmasının kalıcı öğrenmeye bilimsel katkısı.',
    date: '24 Ekim 2026',
    readTime: '6 dk okuma',
    author: {
      name: 'Dr. Selin Aksoy',
      role: 'Eğitim Teknolojileri & Pedagoji Direktörü',
      avatar: '/mascot/mascot-reading.png'
    },
    tags: ['Eğitim Teknolojileri', 'Akıllı Tahta', 'Okul-Ev Köprüsü', '1-8. Sınıf', 'Kalıcı Öğrenme'],
    featured: true,
    content: `
      <h2>Dijital Çağda Sınıflar: Kara Tahtadan İnteraktif Akıllı Tuvale</h2>
      <p>Yüzyıllardır sınıf eğitiminin merkezinde yer alan geleneksel kara tahtalar, öğretmenin yazdıklarını yalnızca o an sınıfta bulunan öğrencilere aktarabilen ve ders zili çaldığında silinerek yok olan statik araçlardı. Oysa 21. yüzyıl pedagojisi, bilginin tek taraflı aktarılmasını değil; görsel, işitsel ve kinestetik uyaranlarla zenginleştirilerek kalıcı hale getirilmesini şart koşuyor.</p>
      <p>Bugün modern eğitim teknolojileri, akıllı tahtaları basit bir projeksiyon perdesi olmaktan çıkarıp <strong>sonsuz tuval (Infinite Canvas)</strong> özellikli, dinamik matematik formülleri çözen, MEB kazanımlı animasyonları sınıfla buluşturan ve en önemlisi <em>hafızası olan</em> birer öğrenme merkezine dönüştürdü.</p>

      <h2>Unutma Eğrisi (Ebbinghaus) ve Evdeki Tekrarın Gücü</h2>
      <p>Bilişsel psikolojinin temel taşlarından biri olan Hermann Ebbinghaus’un "Unutma Eğrisi" araştırmasına göre; bir öğrenci sınıfta öğrendiği bilgileri ilk 24 saat içinde tekrar etmezse, bilginin yaklaşık %70'ini unutmaktadır. Geleneksel düzende öğrenciler defter tuttuklarında öğretmenin tahtada anlattığı kritik ara adımları kaçırabilmekte, eve geldiklerinde eksik notlarla baş başa kalmaktadır.</p>
      <p>Oxonom Edu ekosisteminde ise öğretmen sınıftaki akıllı tahtaya yazdığı anda, her çizim, çözüm adımı ve öğretmen notu bulut teknolojisiyle <strong>doğrudan öğrencinin evdeki profiline kaydedilir</strong>. Öğrenci akşam evde masasının başına geçtiğinde, öğretmenin tahtadaki el yazısını ve çözüm basamaklarını birebir karşısında bulur. Bu kesintisiz okul-ev köprüsü, öğrenmedeki unutma eşiğini minimize ederek akademik başarıyı katlar.</p>

      <div class="my-10 p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#FCF9FD] via-white to-[#FCE8FA]/50 border border-[#E8DFEB] shadow-sm flex flex-col sm:flex-row items-center gap-6 not-prose">
        <img src="/mascot/mascot-14gun-badge.png" alt="Oxonom Edu 14 Gün Ücretsiz Deneme" class="w-24 h-24 object-contain shrink-0 drop-shadow-md" />
        <div class="flex-1 text-center sm:text-left">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4B075F]/10 text-[#4B075F] text-xs font-bold uppercase tracking-wider mb-2">
            💡 Pedagojik İpucu & Ücretsiz Keşif
          </div>
          <h4 class="text-base md:text-lg font-bold text-[#241329] mb-1">
            Çocuğunuzun Ders Başarısındaki Değişimi Gözlemleyin
          </h4>
          <p class="text-xs md:text-sm text-[#716779] leading-relaxed mb-3">
            Okuldaki akıllı tahta derslerini evde interaktif tekrara dönüştüren Oxonom Edu öğrenci platformunu 14 gün boyunca kredi kartsız, taahhütsüz deneyebilirsiniz.
          </p>
          <a href="/paketler" class="inline-flex items-center gap-2 text-xs md:text-sm font-bold text-[#4B075F] hover:text-[#D914C8] transition-colors">
            14 Gün Ücretsiz Deneyin <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      <h2>1. Sınıftan 8. Sınıfa Kadar Her Kademede Uyarlanabilir Pedagoji</h2>
      <p>Teknolojinin eğitimdeki gücü, her yaş grubunun gelişimsel ihtiyaçlarına adapte olabilmesinde yatar. 1. sınıftaki bir öğrencinin ince motor becerilerini destekleyen kılavuz çizgili yazı çalışmaları ve harf yönü animasyonları gerekirken; 8. sınıftaki bir LGS öğrencisinin zaman yönetimi, yeni nesil soru analizleri ve eksik konu tespiti yapabilen akıllı sınav modüllerine ihtiyacı vardır.</p>
      <p>Okul ile entegre çalışan akıllı eğitim platformları, öğrenciyi 1. sınıftan 8. sınıfa kadar kesintisiz takip ederek gelişim röntgenini çıkarır. Böylece veliler "Çocuğum bu derste nerede zorlanıyor?" sorusunun yanıtını afaki tahminlerle değil, somut öğrenme verileriyle anında görür.</p>

      <h2>Sonuç: Teknoloji Amaca Hizmet Ettiğinde Değerlidir</h2>
      <p>Eğitimde teknoloji, öğretmenin yerini almak için değil; öğretmenin rehberliğini ve öğrencinin çabasını güçlendirmek için vardır. Sınıfta başlayan ve evde interaktif araçlarla desteklenen bütünleşik bir öğrenme süreci, çocukların öğrenmeye karşı merakını artırır ve özgüvenli bireyler olarak yetişmelerini sağlar.</p>
    `
  },
  {
    id: '2',
    slug: 'bireysellestirilmis-egitim-ve-yapay-zeka-egitmen-destegi',
    category: 'Pedagoji & Yapay Zekâ',
    categorySlug: 'pedagoji-ve-yapay-zeka',
    title: 'Bireyselleştirilmiş Eğitim ve 7/24 AI Eğitmen: Her Öğrenci Kendi Hızında Öğrenir',
    summary: 'Her çocuğun kavrama süresi ve öğrenme stili farklıdır. Yapay zekâ destekli öğrenci koçluğunun ezberciliği kırarak Sokratik sorgulama yöntemiyle analitik düşünmeyi geliştirmesi.',
    date: '22 Ekim 2026',
    readTime: '7 dk okuma',
    author: {
      name: 'Emre Yalçın',
      role: 'Bilişsel Pedagoji & Yapay Zekâ Uzmanı',
      avatar: '/mascot/mascot-idea.png'
    },
    tags: ['Bireysel Eğitim', 'Yapay Zekâ Koçu', 'Sokratik Yöntem', 'MEB Müfredatı', 'Öğrenme Stilleri'],
    featured: false,
    content: `
      <h2>Tek Tip Eğitimden Bireye Özgü Öğrenme Yolculuğuna</h2>
      <p>Klasik sınıf ortamlarında bir öğretmen 30-40 kişilik bir gruba aynı tempoda ders anlatmak zorundadır. Ancak bilişsel bilim göstermektedir ki, bazı öğrenciler bir konuyu tek dinleyişte kavrarken, bazıları için görsel bir şema veya pratik bir uygulama gerekebilir. Sınıfın hızına yetişemeyen öğrenci dersten kopma tehlikesi yaşarken, hızlı anlayan öğrenci ise sıkılabilir.</p>
      <p>Bireyselleştirilmiş eğitim modelleri, her öğrencinin kendi hızında ve kendi algılama biçiminde ilerlemesine imkan tanır. Yapay zekâ teknolojisi burada devreye girerek her öğrenciye özel bir dijital mentorluk deneyimi sunar.</p>

      <h2>Sokratik Yöntem: Balık Vermek Yerine Balık Tutmayı Öğreten AI</h2>
      <p>Geleneksel ödev çözücü uygulamalar öğrenciye doğrudan cevabı sunarak düşünme kaslarını köreltir. Oysa pedagojik bir yapay zekâ eğitmen, <strong>Sokratik sorgulama metodu</strong> uygular. Öğrenci çözemediği bir matematik veya fen sorusu sorduğunda:</p>
      <ul>
        <li>Doğrudan cevabı vermez, sorunun kilit noktasını tespit eder.</li>
        <li>"Bu soruda bizden ne isteniyor, hangi formülü hatırlıyorsun?" şeklinde yönlendirici sorularla öğrenciyi düşünmeye teşvik eder.</li>
        <li>Öğrencinin takıldığı adımı fark ettiğinde ona özel ipucu sunar ve doğru cevaba çocuğun kendisinin ulaşmasını sağlar.</li>
      </ul>

      <div class="my-10 p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#FCF9FD] via-white to-[#FCE8FA]/50 border border-[#E8DFEB] shadow-sm flex flex-col sm:flex-row items-center gap-6 not-prose">
        <img src="/mascot/mascot-14gun-badge.png" alt="Oxonom Edu 14 Gün Ücretsiz Deneme" class="w-24 h-24 object-contain shrink-0 drop-shadow-md" />
        <div class="flex-1 text-center sm:text-left">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4B075F]/10 text-[#4B075F] text-xs font-bold uppercase tracking-wider mb-2">
            💡 Pedagojik İpucu & Ücretsiz Keşif
          </div>
          <h4 class="text-base md:text-lg font-bold text-[#241329] mb-1">
            Öğrencinize 7/24 Birebir Akıllı Eğitmen Desteği
          </h4>
          <p class="text-xs md:text-sm text-[#716779] leading-relaxed mb-3">
            Oxonom Edu'nun MEB müfredatına tam uyumlu yapay zekâ destekli öğrenci çalışma odasını 14 gün boyunca ücretsiz deneyimleyin.
          </p>
          <a href="/paketler" class="inline-flex items-center gap-2 text-xs md:text-sm font-bold text-[#4B075F] hover:text-[#D914C8] transition-colors">
            14 Gün Ücretsiz İnceleyin <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      <h2>Eksik Konu Tespiti ve Nokta Atışı Pekiştirme</h2>
      <p>Öğrencinin çözdüğü interaktif testler ve girdiği deneme sınavları sistem tarafından analiz edilir. Sistem, "Öğrenci Kesirlerde Toplama konusunda %90 başarılı ancak Kesirlerde Sadeleştirme konusunda takılıyor" gibi mikroskobik tespitler yapar. Vakit kaybettiren genel tekrarlar yerine, tam eksik olunan alt kazanıma yönelik 3 dakikalık mikro-dersler ve pekiştirme soruları önerir.</p>

      <h2>Sonuç: Özgüvenle Gelişen Öğrenciler</h2>
      <p>Kendi hızında öğrenen, takıldığı her soruda nazik ve sabırlı bir yapay zekâ rehberinden anında destek alan bir öğrencinin okula ve derslere bakışı tamamen değişir. Başarısızlık kaygısı yerini öğrenme sevincine bırakır.</p>
    `
  },
  {
    id: '3',
    slug: 'cocuklarin-bilissel-gelisiminde-egitsel-oyunlar-ve-oyunlastirma',
    category: 'Bilişsel Gelişim & Oyun',
    categorySlug: 'bilissel-gelisim',
    title: 'Çocukların Bilişsel Gelişiminde Eğitsel Zekâ Oyunları ve Oyunlaştırılmış Ders Tekrarı',
    summary: 'Sıkıcı ezberler yerine oyunlaştırma mekanikleri: Matematik 2048, kelime avcısı ve takistoskop WPM hızlı okuma egzersizlerinin dikkat, odaklanma ve sınav başarısına katkısı.',
    date: '19 Ekim 2026',
    readTime: '5 dk okuma',
    author: {
      name: 'Psk. Ayşe Karaca',
      role: 'Çocuk Gelişimi & Eğitim Danışmanı',
      avatar: '/mascot/mascot-laptop.png'
    },
    tags: ['Bilişsel Gelişim', 'Oyunlaştırma', 'Hızlı Okuma', 'WPM Egzersizleri', 'Problem Çözme'],
    featured: false,
    content: `
      <h2>Oyun ve Beyin Gelişimi: Nöro-Pedagojik Bakış</h2>
      <p>Çocuk beyni doğası gereği oyun oynayarak dünyayı keşfeder ve öğrenir. Beyinde dopamin salgılanmasını tetikleyen küçük başarı hisleri, hafıza merkezindeki sinaptik bağlantıları güçlendirir. Geleneksel eğitimde çocuklara dayatılan yoğun ve tekdüze soru çözümleri bir süre sonra zihinsel yorgunluğa ve isteksizliğe yol açar.</p>
      <p>Oyunlaştırılmış öğrenme (Gamification), müfredat kazanımlarını oyun dinamikleriyle harmanlayarak ders çalışmayı bir zorunluluk değil, merak uyandıran bir serüvene çevirir.</p>

      <h2>Hızlı Okuma ve Takistoskop: Dikkat Süresini Artırın</h2>
      <p>Yeni nesil sınavlarda (örneğin LGS ve bursluluk sınavları) uzun paragraflı sorular öğrencilerin en çok zorlandığı alandır. Soruyu okurken sonuna geldiğinde başını unutan çocukların temel sorunu okuma hızı değil, görsel algı ve odaklanma genişliğidir.</p>
      <p>Takistoskop egzersizleri ve 1 dakikalık WPM (Kelime/Dakika) okuma maratonları sayesinde:</p>
      <ul>
        <li>Göz kaslarının satırlar üzerinde gereksiz geri dönüşleri (regresyon) engellenir.</li>
        <li>Kelimeler tek tek değil, bloklar ve hece piramitleri halinde algılanır.</li>
        <li>Çocuğun okuma hızı 2 ila 3 kat artarken okuduğunu anlama oranı da yükselir.</li>
      </ul>

      <div class="my-10 p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#FCF9FD] via-white to-[#FCE8FA]/50 border border-[#E8DFEB] shadow-sm flex flex-col sm:flex-row items-center gap-6 not-prose">
        <img src="/mascot/mascot-14gun-badge.png" alt="Oxonom Edu 14 Gün Ücretsiz Deneme" class="w-24 h-24 object-contain shrink-0 drop-shadow-md" />
        <div class="flex-1 text-center sm:text-left">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4B075F]/10 text-[#4B075F] text-xs font-bold uppercase tracking-wider mb-2">
            💡 Pedagojik İpucu & Ücretsiz Keşif
          </div>
          <h4 class="text-base md:text-lg font-bold text-[#241329] mb-1">
            Eğitici Oyunlar ve Hızlı Okuma Atölyesini Keşfedin
          </h4>
          <p class="text-xs md:text-sm text-[#716779] leading-relaxed mb-3">
            Matematik 2048, kelime bulmacaları ve WPM hız egzersizlerini içeren öğrenci dünyamızı 14 gün boyunca ücretsiz deneyin.
          </p>
          <a href="/paketler" class="inline-flex items-center gap-2 text-xs md:text-sm font-bold text-[#4B075F] hover:text-[#D914C8] transition-colors">
            14 Gün Ücretsiz Başlayın <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      <h2>Matematik ve Mantık Oyunlarıyla Stres Olmadan Kazanım Edinimi</h2>
      <p>Matematik 2048, hafıza kartları ve problem çözme atölyeleri, çocukların sayısal işlemler karşısındaki ön yargılarını kırar. Çocuk puan toplamak ve rozet kazanmak için zihinden işlem yaparken, farkında olmadan 4 işlem ve mantıksal muhakeme hızını geliştirir.</p>

      <h2>Sonuç: Ekran Süresini Bilgiye Dönüştürün</h2>
      <p>Çocukları dijital ekranlardan tamamen izole etmek günümüz dünyasında gerçekçi bir çözüm değildir. Önemli olan, çocukların tablet veya bilgisayar başında geçirdiği süreyi pasif video tüketiminden çıkarıp, bilişsel becerilerini geliştiren interaktif ve eğitsel bir öğrenme aracına dönüştürmektir.</p>
    `
  }
];
