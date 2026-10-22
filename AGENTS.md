# 🧠 OXONOM EDU — AGENT RUNTIME RULES & PROJECT MEMORY
> **Kritik Kural:** Bu dosya, bu depoda çalışan tüm yapay zeka ajanları (Antigravity, Claude, Cursor vb.) için **BAĞLAYICI VE BİRİNCİL DOKÜMANDIR**. Asla bu kuralların dışına çıkılamaz, başka projelerle (AgenaPOS vb.) karıştırılamaz.

---

## 1. 🎯 Proje Kimliği ve Marka
- **Proje Adı:** Oxonom Edu (LearnHouze v2.0)
- **Kapsam:** K-12 Akıllı Okul Yönetim Platformu ve Akıllı Tahta (Pano OS & Quickdraw Whiteboard).
- **%100 Dinamik Varlık Kuralı:** Okul adı, kurum bilgisi, şubeler, sınıflar, öğretmenler, öğrenciler, veliler ve profiller **KESİNLİKLE SABİT (HARDCODED) DEĞİLDİR**. 
  - Kullanıcı (Müdür / Yönetici) panelden dilediği zaman yeni okul oluşturabilir, yeni sınıf/şube açabilir (Örn: 9/A, Anaokulu, 5/F vb.), öğrenci ekleyebilir, güncelleyebilir veya silebilir.
  - Kod tabanında görünen mevcut isimler (Necla Görer, Erçil Uğurlu, Ebru Tekneci, 32 şube vb.) sadece sistem ilk kurulduğunda veritabanı boş kalmasın diye konulan **başlangıç tohum verisidir (seed data)**. Kod hiçbir zaman bu verilere bağımlı veya sabit kalamaz.
- **ASLA YAPILMAYACAK:** Bu proje bir POS / restoran sistemi değildir! AgenaPOS ile veya başka projelerle kesinlikle karıştırılamaz.

---

## 2. 🗄️ Veritabanı Mimarisi (TEK VE RESMİ VERİTABANI: SUPABASE)
- **Tek Veritabanı Kuralı:** Projede tek bir veritabanı vardır, o da **Supabase (PostgreSQL)**'dir.
- **Tüm Varlıklar Dinamik CRUD:** Okul listesi, sınıflar, öğrenciler, yoklamalar, tahta notları doğrudan Supabase'den okunur ve yazılır (`SchoolService` üzerinden).
- **Supabase Proje Bilgisi:**
  - Proje: `Oxonom Edu`
  - Ref ID: `crkoeptnoheiqxukxpig`
  - URL: `https://crkoeptnoheiqxukxpig.supabase.co`
- **Tablolar (Kullanıcı Tarafından Yönetilen Dinamik Tablolar):**
  - `schools` (Dinamik Okul Tanımları)
  - `classes` (Dinamik Sınıflar & Şubeler)
  - `students` (Dinamik Öğrenci Kütüğü)
  - `teachers` (Dinamik Öğretmen Kadrosu)
  - `profiles` (Dinamik Kullanıcı Profilleri)
  - `announcements` (Okul Duyuruları)
  - `board_notes` (Akıllı Tahta Notları)
  - `daily_attendance` (Canlı Yoklama)
  - `pano_pairing_sessions` (Pano QR / OTP Kumanda Oturumları)
  - `exams_and_tests` & `student_test_results` (Sınavlar ve Sonuçlar)
- **MongoDB veya Diğerleri:** MongoDB veya harici DB kullanılmaz; tüm dinamik veri ihtiyaçları Supabase tablolarında yaşar.

---

## 3. 🌐 Dağıtım ve Domain Kuralları (RESMİ DOMAIN: edu.oxonom.com)
- **Birincil ve Resmi Canlı Domain:** `https://edu.oxonom.com` (Tüm güncel geliştirmeler ve canlı bağlantılar doğrudan bu domain altında çalışır).
- **GitHub Reposu:** `oxobee/oxonomedu_v2` (ve `oxobee/oxonom`) — `main` dalı.
- **Frontend Barındırma:** Vercel projesi `oxonomedu_v2` (oxobee-studio ekibi altında).
- **Yedek / Dahili Domainler:** `https://oxonomeduv2.vercel.app`, `https://oxonomedu-v2.vercel.app`.
- **Canlıya Dağıtım:** `main` dalına git push yapıldığında Vercel otomatik olarak derler veya `vercel --prod --yes` ile anında canlıya alınır.

---

## 4. 🛠️ Kodlama ve Mimari Kuralları
1. **Her Şeyden Önce Kontrol:** Tahminde bulunma; veritabanı, ortam değişkenleri ve dosya yollarını doğrudan dosyalardan kontrol et.
2. **Korumacı Yaklaşım:** Çalışan UI, mobil uyumlu ekranlar, Pano sınıf geçiş döngüsü guard'ları ve 3 nokta menüsü asla bozulamaz.
3. **Supabase İlk:** Yeni bir veri kaydedilecek veya okunacaksa doğrudan `@/lib/supabase/schoolService` veya `@/lib/supabase/client` üzerinden Supabase tablolarına bağlanır.
