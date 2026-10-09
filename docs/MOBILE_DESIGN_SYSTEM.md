# 📱 Oxonom EDU — Mobil Tasarım & Mimari Standartları (Mobile Design System)

> **KURAL:** Bu kılavuzdaki tüm kurallar, Oxonom EDU bünyesinde geliştirilen **tüm mobil ekranlar** için bağlayıcıdır. Yeni bir mobil ekran eklenirken veya mevcut bir ekran düzenlenirken bu standartların dışına kesinlikle çıkılamaz.

---

## 1. Ana Çerçeve ve Kabuk Mimarisi (Shell Architecture)

* **Genişlik ve Yükseklik:**
  * Bütün mobil sayfalar **tam olarak `390px`** çerçeve standardındadır (`w-full sm:max-w-[390px] min-h-[100dvh]`).
  * Masaüstü önizlemede ekranı ortalamak için dış taşıyıcı: `flex justify-center bg-[#0A0D15] sm:bg-[#E2E8F0] sm:dark:bg-[#06090F]`.
  * Kenar çizgileri: `sm:border-x border-gray-200/60 dark:border-gray-800/80 sm:shadow-2xl`.
  * Alt boşluk (Floating Dock payı): `pb-24`.

* **Tekil Kabuk (`MobileAppShell.tsx`):**
  * Tüm mobil gezinme tek bir kabuk üzerinden yönetilir.
  * Sayfa geçişlerinde ekranlar unmount edilmez (`display: block / none`), böylece 0ms gecikmesiz, zıplamasız geçiş ve kaydırma pozisyonu (scroll position) korunur.
  * `MobileAppShell` içerisinde yer alan sayfalar `hideHeader={true}` ve `hideDock={true}` alarak içeriklerini (`pageContent`) render eder.

---

## 2. Sabit ve Tekil Mobil Header (`MobileHeader.tsx`)

* **Konum:** Sayfanın en üstünde yapışık/sabit (`sticky top-0 z-40 backdrop-blur-md`).
* **Yükseklik & Güvenli Alan:** `pt-[max(0.65rem,env(safe-area-inset-top))] pb-2.5 px-4 sm:px-5`. Yükseklik sabittir, sayfa aşağı kaydırıldığında zıplamaz.
* **Arka Plan & Çizgiler:**
  * **Karanlık Mod:** `bg-[#0A0D15]/95 text-white border-b border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.4)]` + grid dokusu (`24px 24px`).
  * **Aydınlık Mod:** `bg-white/95 text-gray-900 border-b border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)]`.
* **Logo Standardı:**
  * **Karanlık Mod:** `/oxonom-edu-logo-transparent.png`
  * **Aydınlık Mod:** `/oxonom_edu_logo_black.png`
  * Boyut: `h-11 sm:h-12 max-h-[46px] w-auto object-contain`.
* **Sağ Aksiyonlar:**
  1. **Tema Değiştirici:** `w-[40px] h-[40px] rounded-[13px]` Güneş/Ay ikonu.
  2. **Bildirim Butonu:** `w-[42px] h-[42px] rounded-[13px]` Zil ikonu. Tıklandığında kategorize mobil açılır çekmece (`MobileNotificationSheet`) açılır.

---

## 3. Sabit Gezinme Menüsü (`MobileFloatingDock.tsx`)

* **Konum:** Ekranın altında yüzen `fixed bottom-3 left-1/2 -translate-x-1/2 w-[94%] max-w-[365px] z-40 rounded-[30px] p-1.5`.
* **Arka Plan:** `bg-white/95 dark:bg-[#0E131F]/95 backdrop-blur-md border border-gray-200/90 dark:border-gray-800/90 shadow-2xl`.
* **Sekmeler (5 Temel Sekme):**
  1. `home` — Ana Sayfa (`/dashv2`)
  2. `student` — Öğrenciler (`/m-student`)
  3. `boards` — Tahtalar (`/m-boards`)
  4. `assignments` — Ödevler (`/m-homework`)
  5. `profile` — Profil (`/m-profile`)
* **Aktif Buton Efekti:**
  * Ortak `layoutId="dock-active-pill"` animasyonu ile akıcı yay (`spring damping: 32, stiffness: 420`) geçişi.
  * Aktif pill siyah/beyaz kontrast ve mikro ızgara arka planına sahiptir.

---

## 4. Renk Paleti ve Tema Uyumu (`useMobileTheme.ts`)

* **Renkler:**
  * **Ana Vurgu (Accent):** Zümrüt/Nane Yeşili `#34D399` ve `#10B981`.
  * **Koyu Zeminler:** Ana gövde `#0A0D15`, Kartlar `#121826` / `#0E131F`.
  * **Açık Zeminler:** Ana gövde `#F8FAFC`, Kartlar `#FFFFFF` / `#F1F4F9`.
  * **Bordürler:** Koyu modda `border-gray-800/80` veya `border-white/10`; Açık modda `border-gray-200/80`.
* **Tema Senkronizasyonu:**
  * Bütün ekranlar `useMobileTheme` hook'unu kullanır.
  * Tema anahtarı `localStorage('oxonom_dash_theme')` olup, `oxonom_theme_change` eventi ile tüm sekmeler ve header aynı anda güncellenir. Bağımsız/ayrık tema tutulamaz.

---

## 5. Animasyon ve Geçiş Prensipleri

* **Soldan Sağa / Stagger Geçişi:** Sayfa içi kartlar ve öğeler `motion.div` ile `.dash-stagger-items` akıcı soldan-sağa veya hafif yukarı süzülme animasyonuyla gelir.
* **Dokunma Tepkileri (Tactile Feedback):** Tüm buton ve kartlarda `whileTap={{ scale: 0.98 }}` veya `whileTap={{ scale: 0.92 }}` native mobil hissi veren mikro-etkileşimler kullanılır.
* **Header & Dock Dokunulmazlığı:** Sayfalar arası geçişlerde Header ve Dock asla yeniden yüklenmez, titremez, zıplamaz.
