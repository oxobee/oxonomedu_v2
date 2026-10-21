// Oxonom Edu — Akıllı Tahta Notları (Saved Board Notes Storage)
// Allows saving smart board captures to designated student classrooms
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client'

export interface SavedBoardNote {
  id: string
  title: string // Template: "{Ders Adı} - {Tarih}"
  courseName: string
  dateStr: string
  timestamp: number
  classCodes: string[]
  imageUrl: string
  teacherName?: string
  boardInfo?: string
  studentNote?: string // Personal student study note attached to this board
  studentNoteUpdatedAt?: number
}

export const BOARD_NOTES_STORAGE_KEY = 'oxonom_saved_board_notes'

// Convert SVG to reliable base64 data URI
export function svgToDataUrl(svg: string): string {
  try {
    if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
      return `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(svg)))}`
    }
  } catch {
    // fallback
  }
  if (typeof Buffer !== 'undefined') {
    return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf-8').toString('base64')}`
  }
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

// Rich educational chalkboard vectors for realistic display
function createMockBoardSvg(subject: string, topic: string, date: string): string {
  if (subject === 'Türkçe') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" width="1200" height="750">
      <defs>
        <pattern id="gridT" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1E2536" stroke-width="1"/>
        </pattern>
        <linearGradient id="headerGradT" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#4B075F" />
          <stop offset="100%" stop-color="#8D49A6" />
        </linearGradient>
      </defs>
      <rect width="1200" height="750" fill="#131722"/>
      <rect width="1200" height="750" fill="url(#gridT)"/>

      <!-- Header bar -->
      <rect x="30" y="24" width="1140" height="66" rx="14" fill="#1A2030" stroke="#334155" stroke-width="2"/>
      <rect x="42" y="36" width="10" height="42" rx="4" fill="url(#headerGradT)"/>
      <text x="64" y="65" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="900" fill="#F1F5F9">
        TÜRKÇE DERSİ — CÜMLENİN ÖGELERİ VE ANLAM İLİŞKİLERİ
      </text>
      <text x="1140" y="64" text-anchor="end" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700" fill="#A78BFA">
        📅 ${date} • Öğretmen: Ebru TEKNECİ
      </text>

      <!-- Left diagram box: Syntax Hierarchy -->
      <rect x="30" y="110" width="750" height="610" rx="16" fill="#171D2B" stroke="#2B364D" stroke-width="2"/>
      <text x="55" y="150" font-family="system-ui, -apple-system, sans-serif" font-size="19" font-weight="800" fill="#38BDF8">
        📌 1. Cümle Ögeleri Hiyerarşisi
      </text>

      <!-- Sentence Box -->
      <rect x="55" y="175" width="700" height="95" rx="12" fill="#0F1420" stroke="#475569" stroke-width="1.5"/>
      <text x="75" y="210" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" fill="#94A3B8">
        Örnek Cümle İncelemesi:
      </text>
      <text x="75" y="245" font-family="system-ui, -apple-system, sans-serif" font-size="19" font-weight="bold" fill="#F8FAFC">
        &quot;Çalışkan öğrenciler, kütüphanede sınav sorularını dikkatle çözdüler.&quot;
      </text>

      <!-- Syntax breakdown cards -->
      <g transform="translate(55, 290)">
        <!-- Özne -->
        <rect x="0" y="0" width="160" height="85" rx="10" fill="#1E293B" stroke="#38BDF8" stroke-width="2"/>
        <text x="80" y="32" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="900" fill="#38BDF8">ÖZNE</text>
        <text x="80" y="55" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#F1F5F9">&quot;Çalışkan öğrenciler&quot;</text>
        <text x="80" y="72" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#94A3B8">Kim? (Gerçek Özne)</text>

        <!-- Dolaylı Tümleç -->
        <rect x="180" y="0" width="160" height="85" rx="10" fill="#1E293B" stroke="#F59E0B" stroke-width="2"/>
        <text x="260" y="32" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="900" fill="#F59E0B">YER TAMLAYICISI</text>
        <text x="260" y="55" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#F1F5F9">&quot;kütüphanede&quot;</text>
        <text x="260" y="72" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#94A3B8">Nerede? (-de hali)</text>

        <!-- Nesne -->
        <rect x="360" y="0" width="160" height="85" rx="10" fill="#1E293B" stroke="#10B981" stroke-width="2"/>
        <text x="440" y="32" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="900" fill="#10B981">BELİRTİLİ NESNE</text>
        <text x="440" y="55" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#F1F5F9">&quot;sınav sorularını&quot;</text>
        <text x="440" y="72" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#94A3B8">Neyi? (-i hali)</text>

        <!-- Yüklem -->
        <rect x="540" y="0" width="160" height="85" rx="10" fill="#1E293B" stroke="#F43F5E" stroke-width="2"/>
        <text x="620" y="32" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="900" fill="#F43F5E">YÜKLEM</text>
        <text x="620" y="55" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#F1F5F9">&quot;çözdüler&quot;</text>
        <text x="620" y="72" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#94A3B8">Temel Yargı (Fiil)</text>
      </g>

      <!-- Golden Rule Callout -->
      <rect x="55" y="405" width="700" height="150" rx="12" fill="#201A30" stroke="#C084FC" stroke-width="1.5" stroke-dasharray="6 4"/>
      <text x="80" y="440" font-family="sans-serif" font-size="16" font-weight="900" fill="#E879F9">
        ⭐ Önemli Altın Kural (Sınav Sorusu Çözüm Yolu):
      </text>
      <text x="80" y="475" font-family="sans-serif" font-size="14" fill="#E2E8F0">
        1. İlk önce kesinlikle <tspan font-weight="bold" fill="#F43F5E">YÜKLEM</tspan> bulunur. Yüklem bulunmadan diğer ögelere geçilmez.
      </text>
      <text x="80" y="505" font-family="sans-serif" font-size="14" fill="#E2E8F0">
        2. Yükleme ilk olarak <tspan font-weight="bold" fill="#38BDF8">&quot;Kim?&quot; veya &quot;Ne?&quot;</tspan> soruları sorularak ÖZNE tespit edilir.
      </text>
      <text x="80" y="535" font-family="sans-serif" font-size="14" fill="#E2E8F0">
        3. İsim ve sıfat tamlamaları, deyimler ve birleşik fiiller ASLA bölünemez!
      </text>

      <!-- Smartboard Live badge -->
      <rect x="55" y="665" width="280" height="36" rx="8" fill="#1E293B"/>
      <circle cx="75" cy="683" r="6" fill="#10B981"/>
      <text x="92" y="688" font-family="sans-serif" font-size="13" font-weight="bold" fill="#CBD5E1">
        Akıllı Tahta Bulut Arşivi Aktif
      </text>

      <!-- Right Teacher Note Sticky -->
      <rect x="805" y="110" width="365" height="610" rx="16" fill="#1C1827" stroke="#3D2952" stroke-width="2"/>
      <rect x="825" y="130" width="325" height="42" rx="8" fill="#2E1B42"/>
      <text x="840" y="157" font-family="sans-serif" font-size="16" font-weight="900" fill="#F59E0B">
        ✏️ Öğretmen Notları &amp; Ödev
      </text>
      <text x="830" y="210" font-family="sans-serif" font-size="15" fill="#E2E8F0">
        1. Tahtaya çizilen şemayı ders
      </text>
      <text x="830" y="235" font-family="sans-serif" font-size="15" fill="#E2E8F0">
        defterinize renkli kalemlerle aktarınız.
      </text>
      <text x="830" y="280" font-family="sans-serif" font-size="15" fill="#E2E8F0">
        2. Ders kitabı sayfa 42-45 arası
      </text>
      <text x="830" y="305" font-family="sans-serif" font-size="15" fill="#E2E8F0">
        ünite sorularını çözüp yarın getiriniz.
      </text>
      <text x="830" y="350" font-family="sans-serif" font-size="15" fill="#E2E8F0">
        3. Cuma günkü mini quizde ögeler
      </text>
      <text x="830" y="375" font-family="sans-serif" font-size="15" fill="#E2E8F0">
        konusundan 5 soru gelecektir.
      </text>

      <rect x="825" y="580" width="325" height="110" rx="12" fill="#261730" stroke="#8D49A6" stroke-width="1.5"/>
      <text x="845" y="615" font-family="sans-serif" font-size="14" font-weight="bold" fill="#D914C8">
        💡 Sınav Hazırlığı Tüyosu:
      </text>
      <text x="845" y="645" font-family="sans-serif" font-size="13" fill="#E2E8F0">
        Özne ile belirtisiz nesneyi karıştırmamak
      </text>
      <text x="845" y="668" font-family="sans-serif" font-size="13" fill="#E2E8F0">
        için önce mutlaka özneyi bulunuz!
      </text>
    </svg>`
    return svgToDataUrl(svg)
  }

  if (subject === 'Matematik') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" width="1200" height="750">
      <defs>
        <pattern id="gridM" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#162E3B" stroke-width="1"/>
        </pattern>
        <linearGradient id="headerGradM" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0284C7" />
          <stop offset="100%" stop-color="#38BDF8" />
        </linearGradient>
      </defs>
      <rect width="1200" height="750" fill="#0C1B24"/>
      <rect width="1200" height="750" fill="url(#gridM)"/>

      <!-- Header bar -->
      <rect x="30" y="24" width="1140" height="66" rx="14" fill="#132B3A" stroke="#1E4E68" stroke-width="2"/>
      <rect x="42" y="36" width="10" height="42" rx="4" fill="url(#headerGradM)"/>
      <text x="64" y="65" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="900" fill="#F0F9FF">
        MATEMATİK DERSİ — DOĞAL SAYILAR &amp; DİK ÜÇGEN PİSAGOR BAĞINTISI
      </text>
      <text x="1140" y="64" text-anchor="end" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700" fill="#38BDF8">
        📅 ${date} • Öğretmen: Orkun AYDIN
      </text>

      <!-- Geometry Canvas Left -->
      <rect x="30" y="110" width="750" height="610" rx="16" fill="#102534" stroke="#1B425B" stroke-width="2"/>
      <text x="55" y="150" font-family="system-ui, -apple-system, sans-serif" font-size="19" font-weight="800" fill="#FDE047">
        📐 Pisagor Bağıntısı: a² + b² = c²
      </text>

      <!-- Drawn Right Triangle -->
      <polygon points="120,530 460,530 460,270" fill="#0E384D" stroke="#38BDF8" stroke-width="4"/>
      <!-- Right angle marker -->
      <rect x="430" y="500" width="30" height="30" fill="none" stroke="#F43F5E" stroke-width="2"/>
      <circle cx="445" cy="515" r="3" fill="#F43F5E"/>

      <!-- Side Labels -->
      <text x="290" y="565" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="bold" fill="#34D399">
        Komşu Dik Kenar: b = 4 cm
      </text>
      <text x="495" y="410" font-family="sans-serif" font-size="18" font-weight="bold" fill="#F59E0B">
        a = 3 cm (Karşı)
      </text>
      <text x="250" y="375" font-family="sans-serif" font-size="20" font-weight="900" fill="#F472B6">
        Hipotenüs c = 5 cm
      </text>

      <!-- Proof Formula Step Box -->
      <g transform="translate(520, 180)">
        <rect x="0" y="0" width="235" height="180" rx="12" fill="#0C202D" stroke="#38BDF8" stroke-width="1.5"/>
        <text x="20" y="35" font-family="sans-serif" font-size="15" font-weight="bold" fill="#38BDF8">İşlem Adımları:</text>
        <text x="20" y="70" font-family="sans-serif" font-size="16" fill="#F8FAFC">a² + b² = c²</text>
        <text x="20" y="105" font-family="sans-serif" font-size="16" fill="#F8FAFC">3² + 4² = c²</text>
        <text x="20" y="135" font-family="sans-serif" font-size="16" fill="#F8FAFC">9 + 16 = 25</text>
        <text x="20" y="165" font-family="sans-serif" font-size="17" font-weight="bold" fill="#34D399">c = √25 = 5 cm ✓</text>
      </g>

      <!-- Special Right Triangles Pill Row -->
      <rect x="55" y="595" width="700" height="100" rx="12" fill="#0E2332" stroke="#2563EB" stroke-width="1.5"/>
      <text x="75" y="630" font-family="sans-serif" font-size="16" font-weight="900" fill="#60A5FA">
        🎯 Sık Çıkan Özel Dik Üçgen Kalıpları:
      </text>
      <text x="75" y="665" font-family="sans-serif" font-size="15" font-weight="bold" fill="#E2E8F0">
        • 3 - 4 - 5  |  • 5 - 12 - 13  |  • 8 - 15 - 17  |  • 7 - 24 - 25
      </text>

      <!-- Right Teacher Notes -->
      <rect x="805" y="110" width="365" height="610" rx="16" fill="#112431" stroke="#1B425B" stroke-width="2"/>
      <rect x="825" y="130" width="325" height="42" rx="8" fill="#18364B"/>
      <text x="840" y="157" font-family="sans-serif" font-size="16" font-weight="900" fill="#38BDF8">
        ✏️ Sınav Öncesi Dikkat!
      </text>

      <text x="830" y="215" font-family="sans-serif" font-size="15" fill="#E2E8F0">
        1. Hipotenüs daima 90 derecenin
      </text>
      <text x="830" y="240" font-family="sans-serif" font-size="15" fill="#E2E8F0">
        karşısındaki en uzun kenardır.
      </text>
      <text x="830" y="290" font-family="sans-serif" font-size="15" fill="#E2E8F0">
        2. Özel üçgenlerin katları da diktir:
      </text>
      <text x="830" y="315" font-family="sans-serif" font-size="15" font-weight="bold" fill="#FDE047">
        (Örn: 6-8-10, 9-12-15)
      </text>
      <text x="830" y="365" font-family="sans-serif" font-size="15" fill="#E2E8F0">
        3. Koordinat düzleminde iki nokta
      </text>
      <text x="830" y="390" font-family="sans-serif" font-size="15" fill="#E2E8F0">
        arası uzaklık Pisagor ile hesaplanır.
      </text>

      <rect x="825" y="560" width="325" height="135" rx="12" fill="#0C1D28" stroke="#38BDF8" stroke-width="1.5"/>
      <text x="845" y="595" font-family="sans-serif" font-size="15" font-weight="bold" fill="#FBBF24">
        📌 1. Yazılı Sınav Hatırlatması:
      </text>
      <text x="845" y="625" font-family="sans-serif" font-size="13" fill="#E2E8F0">
        Bu bağıntı 1. yazılı sınavda 20 puanlık
      </text>
      <text x="845" y="650" font-family="sans-serif" font-size="13" fill="#E2E8F0">
        büyük soru olarak gelecektir.
      </text>
      <text x="845" y="675" font-family="sans-serif" font-size="13" font-weight="bold" fill="#34D399">
        Örnek soruları tekrar ediniz!
      </text>
    </svg>`
    return svgToDataUrl(svg)
  }

  // Fen Bilimleri SVG
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" width="1200" height="750">
    <defs>
      <radialGradient id="sunG" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FEF08A"/>
        <stop offset="50%" stop-color="#F59E0B"/>
        <stop offset="100%" stop-color="#DC2626"/>
      </radialGradient>
      <pattern id="gridF" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="20" cy="20" r="1" fill="#1E2A40"/>
      </pattern>
    </defs>
    <rect width="1200" height="750" fill="#090E17"/>
    <rect width="1200" height="750" fill="url(#gridF)"/>

    <!-- Header bar -->
    <rect x="30" y="24" width="1140" height="66" rx="14" fill="#131B29" stroke="#22334F" stroke-width="2"/>
    <rect x="42" y="36" width="10" height="42" rx="4" fill="#10B981"/>
    <text x="64" y="65" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="900" fill="#F0FDF4">
      FEN BİLİMLERİ — GÜNEŞ SİSTEMİ &amp; GEZEGENLERİN YÖRÜNGELERİ
    </text>
    <text x="1140" y="64" text-anchor="end" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700" fill="#34D399">
      📅 ${date} • Öğretmen: Beritan ŞENATEŞ
    </text>

    <!-- Solar System Canvas -->
    <rect x="30" y="110" width="750" height="610" rx="16" fill="#0D1524" stroke="#1D2A42" stroke-width="2"/>
    <text x="55" y="150" font-family="system-ui, -apple-system, sans-serif" font-size="19" font-weight="800" fill="#34D399">
      🪐 Güneş Sistemi Gezegen Sıralaması
    </text>

    <!-- Sun on Left -->
    <circle cx="70" cy="400" r="95" fill="url(#sunG)"/>
    <text x="70" y="405" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="bold" fill="#FFFFFF">GÜNEŞ</text>

    <!-- Orbits and planets -->
    <!-- Merkür -->
    <ellipse cx="70" cy="400" rx="150" ry="140" fill="none" stroke="#334155" stroke-width="1.5" stroke-dasharray="4 4"/>
    <circle cx="220" cy="400" r="8" fill="#94A3B8"/>
    <text x="220" y="425" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#CBD5E1">Merkür</text>

    <!-- Venüs -->
    <ellipse cx="70" cy="400" rx="220" ry="190" fill="none" stroke="#334155" stroke-width="1.5" stroke-dasharray="4 4"/>
    <circle cx="290" cy="400" r="14" fill="#FBBF24"/>
    <text x="290" y="435" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#CBD5E1">Venüs</text>

    <!-- Dünya -->
    <ellipse cx="70" cy="400" rx="300" ry="240" fill="none" stroke="#334155" stroke-width="1.5" stroke-dasharray="4 4"/>
    <circle cx="370" cy="400" r="16" fill="#38BDF8"/>
    <circle cx="395" cy="390" r="4" fill="#E2E8F0"/>
    <text x="370" y="435" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#38BDF8">Dünya</text>

    <!-- Mars -->
    <ellipse cx="70" cy="400" rx="390" ry="290" fill="none" stroke="#334155" stroke-width="1.5" stroke-dasharray="4 4"/>
    <circle cx="460" cy="400" r="12" fill="#EF4444"/>
    <text x="460" y="435" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#F87171">Mars</text>

    <!-- Asteroid belt -->
    <line x1="510" y1="180" x2="510" y2="620" stroke="#64748B" stroke-width="6" stroke-dasharray="2 12"/>
    <text x="510" y="165" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#94A3B8">Asteroit Kuşağı</text>

    <!-- Jüpiter -->
    <circle cx="590" cy="400" r="38" fill="#F97316"/>
    <text x="590" y="460" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#FDBA74">Jüpiter</text>

    <!-- Satürn with ring -->
    <ellipse cx="700" cy="400" rx="42" ry="12" fill="none" stroke="#FDE047" stroke-width="4"/>
    <circle cx="700" cy="400" r="28" fill="#EAB308"/>
    <text x="700" y="460" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#FDE047">Satürn</text>

    <!-- Legend Box -->
    <rect x="55" y="605" width="700" height="90" rx="12" fill="#111B2C" stroke="#10B981" stroke-width="1.5"/>
    <text x="75" y="635" font-family="sans-serif" font-size="14" font-weight="bold" fill="#34D399">
      💡 Akılda Kalıcı Kodlama:
    </text>
    <text x="75" y="665" font-family="sans-serif" font-size="14" fill="#F1F5F9">
      &quot;<tspan font-weight="bold" fill="#FBBF24">M</tspan>eraklı <tspan font-weight="bold" fill="#FBBF24">V</tspan>edat <tspan font-weight="bold" fill="#38BDF8">D</tspan>ünkü <tspan font-weight="bold" fill="#EF4444">M</tspan>açta <tspan font-weight="bold" fill="#F97316">J</tspan>aleye <tspan font-weight="bold" fill="#FDE047">S</tspan>ordu: <tspan font-weight="bold" fill="#67E8F9">U</tspan>mut <tspan font-weight="bold" fill="#38BDF8">N</tspan>erede?&quot;
    </text>

    <!-- Right Teacher Notes -->
    <rect x="805" y="110" width="365" height="610" rx="16" fill="#101928" stroke="#1E2E4A" stroke-width="2"/>
    <rect x="825" y="130" width="325" height="42" rx="8" fill="#192842"/>
    <text x="840" y="157" font-family="sans-serif" font-size="16" font-weight="900" fill="#34D399">
      ✏️ Özet &amp; Hatırlatmalar
    </text>

    <text x="830" y="215" font-family="sans-serif" font-size="15" fill="#E2E8F0">
      1. İç Gezegenler (Karasal):
    </text>
    <text x="830" y="240" font-family="sans-serif" font-size="14" font-weight="bold" fill="#38BDF8">
      Merkür, Venüs, Dünya, Mars
    </text>
    <text x="830" y="290" font-family="sans-serif" font-size="15" fill="#E2E8F0">
      2. Dış Gezegenler (Gazsal):
    </text>
    <text x="830" y="315" font-family="sans-serif" font-size="14" font-weight="bold" fill="#FBBF24">
      Jüpiter, Satürn, Uranüs, Neptün
    </text>
    <text x="830" y="365" font-family="sans-serif" font-size="15" fill="#E2E8F0">
      3. Uydusu Olmayanlar:
    </text>
    <text x="830" y="390" font-family="sans-serif" font-size="14" font-weight="bold" fill="#F87171">
      Merkür ve Venüs
    </text>

    <rect x="825" y="560" width="325" height="135" rx="12" fill="#0C1726" stroke="#10B981" stroke-width="1.5"/>
    <text x="845" y="595" font-family="sans-serif" font-size="15" font-weight="bold" fill="#34D399">
      🔬 Fen Projesi Duyurusu:
    </text>
    <text x="845" y="625" font-family="sans-serif" font-size="13" fill="#E2E8F0">
      Haftaya kadar karton veya atık
    </text>
    <text x="845" y="650" font-family="sans-serif" font-size="13" fill="#E2E8F0">
      malzemelerle bir Güneş Sistemi modeli
    </text>
    <text x="845" y="675" font-family="sans-serif" font-size="13" font-weight="bold" fill="#FBBF24">
      hazırlayıp sınıfa getiriniz.
    </text>
  </svg>`
  return svgToDataUrl(svg)
}

export const INITIAL_DEFAULT_BOARD_NOTES: SavedBoardNote[] = [
  {
    id: 'note-turkce-20261021',
    title: 'Türkçe - 21 Ekim 2026',
    courseName: 'Türkçe',
    dateStr: '21 Ekim 2026',
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    classCodes: ['1/A', '1/B'],
    imageUrl: createMockBoardSvg('Türkçe', 'Cümlenin Ögeleri ve Anlam Bilgisi', '21 Ekim 2026'),
    teacherName: 'Ebru TEKNECİ',
    boardInfo: '1A-01',
    studentNote: '⭐ Yüklem daima ilk bulunur! Tamlamalar asla bölünmez. Cuma günkü mini quize çalış.',
    studentNoteUpdatedAt: Date.now() - 1000 * 60 * 30,
  },
  {
    id: 'note-mat-20261020',
    title: 'Matematik - 20 Ekim 2026',
    courseName: 'Matematik',
    dateStr: '20 Ekim 2026',
    timestamp: Date.now() - 1000 * 60 * 60 * 26,
    classCodes: ['1/A'],
    imageUrl: createMockBoardSvg('Matematik', 'Doğal Sayılar ve Dik Üçgen Pisagor Bağıntısı', '20 Ekim 2026'),
    teacherName: 'Orkun AYDIN',
    boardInfo: '1A-01',
    studentNote: '📐 Pisagor 3-4-5 ve 5-12-13 üçgeni 1. Yazılıda 20 puanlık soru olarak çıkacak!',
    studentNoteUpdatedAt: Date.now() - 1000 * 60 * 60 * 5,
  },
  {
    id: 'note-fen-20261019',
    title: 'Fen Bilimleri - 19 Ekim 2026',
    courseName: 'Fen Bilimleri',
    dateStr: '19 Ekim 2026',
    timestamp: Date.now() - 1000 * 60 * 60 * 50,
    classCodes: ['1/A', '2/A'],
    imageUrl: createMockBoardSvg('Fen Bilimleri', 'Güneş Sistemi ve Gezegenler', '19 Ekim 2026'),
    teacherName: 'Beritan ŞENATEŞ',
    boardInfo: '1A-01',
    studentNote: '🪐 Kodlama: Meraklı Vedat Dünkü Maçta Jaleye Sordu: Umut Nerede? Merkür ve Venüsün uydusu yok!',
    studentNoteUpdatedAt: Date.now() - 1000 * 60 * 60 * 24,
  },
]

export function getSavedBoardNotes(studentClassCode?: string): SavedBoardNote[] {
  if (typeof window === 'undefined') return INITIAL_DEFAULT_BOARD_NOTES

  try {
    const raw = localStorage.getItem(BOARD_NOTES_STORAGE_KEY)
    let notes: SavedBoardNote[] = []
    if (raw) {
      notes = JSON.parse(raw)
      // Migration: Ensure mock SVGs use working base64 URLs
      let hasChanges = false
      notes = notes.map((n) => {
        if (n.imageUrl && n.imageUrl.startsWith('data:image/svg+xml;utf8')) {
          hasChanges = true
          return {
            ...n,
            imageUrl: createMockBoardSvg(n.courseName, n.title, n.dateStr),
          }
        }
        return n
      })
      if (hasChanges) {
        localStorage.setItem(BOARD_NOTES_STORAGE_KEY, JSON.stringify(notes))
      }
    } else {
      notes = INITIAL_DEFAULT_BOARD_NOTES
      localStorage.setItem(BOARD_NOTES_STORAGE_KEY, JSON.stringify(notes))
    }

    if (!studentClassCode) return notes

    const cleanTarget = studentClassCode.trim().toUpperCase().replace(/[-_]/g, '/')
    return notes.filter((n) => {
      if (!n.classCodes || n.classCodes.length === 0) return true
      return n.classCodes.some((c) => c.trim().toUpperCase().replace(/[-_]/g, '/') === cleanTarget)
    })
  } catch (e) {
    console.warn('Failed to read saved board notes:', e)
    return INITIAL_DEFAULT_BOARD_NOTES
  }
}

export function saveBoardNote(noteData: {
  courseName: string
  classCodes: string[]
  imageUrl: string
  teacherName?: string
  boardInfo?: string
  customDateStr?: string
  studentNote?: string
}): SavedBoardNote {
  const now = new Date()
  const turkishMonths = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
  ]
  const dateStr = noteData.customDateStr || `${now.getDate()} ${turkishMonths[now.getMonth()]} ${now.getFullYear()}`
  const courseName = noteData.courseName || 'Ders Notu'
  const title = `${courseName} - ${dateStr}`

  const newNote: SavedBoardNote = {
    id: `board-note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title,
    courseName,
    dateStr,
    timestamp: Date.now(),
    classCodes: noteData.classCodes.length > 0 ? noteData.classCodes : ['1/A'],
    imageUrl: noteData.imageUrl,
    teacherName: noteData.teacherName || 'Ders Öğretmeni',
    boardInfo: noteData.boardInfo || '1A-01',
    studentNote: noteData.studentNote,
    studentNoteUpdatedAt: noteData.studentNote ? Date.now() : undefined,
  }

  try {
    const current = getSavedBoardNotes()
    const updated = [newNote, ...current]
    localStorage.setItem(BOARD_NOTES_STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('oxonom_board_notes_updated', { detail: newNote }))

    // Async sync to Supabase (Single Source of Truth Database)
    if (typeof window !== 'undefined' && isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseBrowserClient()
        supabase
          .from('board_notes')
          .upsert({
            id: newNote.id,
            board_info: newNote.boardInfo || '1A-01',
            class_codes: newNote.classCodes,
            course_name: newNote.courseName,
            teacher_name: newNote.teacherName || 'Ders Öğretmeni',
            image_url: newNote.imageUrl,
            student_notes: newNote.studentNote ? { note: newNote.studentNote } : {},
            created_at: new Date(newNote.timestamp).toISOString(),
          })
          .then((res: any) => {
            if (res?.error) console.warn('[Supabase board_notes] upsert failed:', res.error)
          })
      } catch (_) {}
    }
  } catch (err) {
    console.error('Failed to save board note:', err)
    throw err
  }

  return newNote
}

export function updateStudentBoardNote(noteId: string, studentNote: string): SavedBoardNote | null {
  try {
    const current = getSavedBoardNotes()
    const index = current.findIndex((n) => n.id === noteId)
    if (index === -1) return null

    current[index] = {
      ...current[index],
      studentNote: studentNote.trim(),
      studentNoteUpdatedAt: Date.now(),
    }

    localStorage.setItem(BOARD_NOTES_STORAGE_KEY, JSON.stringify(current))
    window.dispatchEvent(new CustomEvent('oxonom_board_notes_updated', { detail: current[index] }))

    // Sync update to Supabase
    if (typeof window !== 'undefined' && isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseBrowserClient()
        supabase
          .from('board_notes')
          .update({
            student_notes: { note: studentNote.trim(), updatedAt: Date.now() },
          })
          .eq('id', noteId)
          .then((res: any) => {
            if (res?.error) console.warn('[Supabase board_notes] update failed:', res.error)
          })
      } catch (_) {}
    }
    return current[index]
  } catch (err) {
    console.error('Failed to update student board note:', err)
    return null
  }
}

export function deleteBoardNote(noteId: string): void {
  try {
    const current = getSavedBoardNotes()
    const filtered = current.filter((n) => n.id !== noteId)
    localStorage.setItem(BOARD_NOTES_STORAGE_KEY, JSON.stringify(filtered))
    window.dispatchEvent(new CustomEvent('oxonom_board_notes_updated', { detail: { deletedId: noteId } }))

    // Sync delete to Supabase
    if (typeof window !== 'undefined' && isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseBrowserClient()
        supabase
          .from('board_notes')
          .delete()
          .eq('id', noteId)
          .then((res: any) => {
            if (res?.error) console.warn('[Supabase board_notes] delete failed:', res.error)
          })
      } catch (_) {}
    }
  } catch (e) {
    console.error('Failed to delete board note:', e)
  }
}

