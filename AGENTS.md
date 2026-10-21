# 🧠 OXONOM EDU — AGENT RUNTIME RULES & PROJECT MEMORY
> **Kritik Kural:** Bu dosya, bu depoda çalışan tüm yapay zeka ajanları (Antigravity, Claude, Cursor vb.) için **BAĞLAYICI VE BİRİNCİL DOKÜMANDIR**. Asla bu kuralların dışına çıkılamaz, başka projelerle (AgenaPOS vb.) karıştırılamaz.

---

## 1. 🎯 Proje Kimliği ve Marka
- **Proje Adı:** Oxonom Edu (LearnHouze v2.0)
- **Kapsam:** K-12 Akıllı Okul Yönetim Platformu ve Akıllı Tahta (Pano OS & Quickdraw Whiteboard).
- **Okul Yapısı:** Necla Görer İlkokulu & Şair Fevzi Kutlu Kalkancı Ortaokulu.
- **Şubeler:** 32 Şube (1/A'dan 8/D'ye kadar).
- **Amiral Gemisi Şube & Öğrenci:** 1/A Sınıfı, Öğrenci: **Erçil UĞURLU** (No: 101), Baba: **Dr. Uğur UĞURLU** (Okul Müdürü), Anne: **Ebru UĞURLU**, Sınıf Rehber Öğretmeni: **Ebru TEKNECİ**.
- **ASLA YAPILMAYACAK:** Bu proje bir POS / restoran sistemi değildir! AgenaPOS ile veya başka projelerle kesinlikle karıştırılamaz.

---

## 2. 🗄️ Veritabanı Mimarisi (TEK VE RESMİ VERİTABANI: SUPABASE)
- **Tek Veritabanı Kuralı:** Projede tek bir veritabanı vardır, o da **Supabase (PostgreSQL)**'dir.
- **Supabase Proje Bilgisi:**
  - Proje: `Oxonom Edu`
  - Ref ID: `crkoeptnoheiqxukxpig`
  - URL: `https://crkoeptnoheiqxukxpig.supabase.co`
- **Tablolar:**
  - `classes` (32 Şube)
  - `students` (Öğrenci Kütüğü)
  - `teachers` (Öğretmen Kadrosu)
  - `announcements` (Okul Duyuruları)
  - `board_notes` (Akıllı Tahta Notları)
  - `daily_attendance` (Canlı Yoklama)
  - `pano_pairing_sessions` (Pano QR / OTP Kumanda Oturumları)
  - `exams_and_tests` & `student_test_results` (Sınavlar ve Sonuçlar)
- **MongoDB veya Diğerleri:** MongoDB veya harici DB kullanılmaz; tüm yeni veri ihtiyaçları Supabase tablolarına eklenir.

---

## 3. 🌐 Dağıtım ve Git Altyapısı
- **GitHub Reposu:** `oxobee/oxonomedu_v2` (ve `oxobee/oxonom`) — `main` dalı.
- **Frontend Barındırma:** Vercel projesi `oxonomedu_v2` (`https://learnhouze.vercel.app` / `https://oxonom.com`).
- **Canlıya Dağıtım:** `main` dalına git push yapıldığında Vercel otomatik olarak derler ve canlıya alır.

---

## 4. 🛠️ Kodlama ve Mimari Kuralları
1. **Her Şeyden Önce Kontrol:** Tahminde bulunma; veritabanı, ortam değişkenleri ve dosya yollarını doğrudan dosyalardan kontrol et.
2. **Korumacı Yaklaşım:** Çalışan UI, mobil uyumlu ekranlar, Pano sınıf geçiş döngüsü guard'ları ve 3 nokta menüsü asla bozulamaz.
3. **Supabase İlk:** Yeni bir veri kaydedilecek veya okunacaksa doğrudan `@/lib/supabase/schoolService` veya `@/lib/supabase/client` üzerinden Supabase tablolarına bağlanır.
