<p align="center">
  <a href="https://oxonomedu.vercel.app">
    <img src=".github/images/learnhouse-github.png" alt="Oxonom Edu Logo" width="600" />
  </a>
</p>

<h1 align="center">🎓 Oxonom Edu (LearnHouze v2.0)</h1>

<p align="center">
  <b>Yeni Nesil Akıllı Okul Yönetim Sistemi, Dijital Kampüs ve İnteraktif Eğitim Platformu</b><br>
  <i>K-12 Okulları, Kolejler, Öğretmenler ve Öğrenciler İçin Tasarlanmış Hepsi Bir Arada Eğitim Ekosistemi</i>
</p>

<p align="center">
  <a href="https://oxonomedu.vercel.app"><img src="https://img.shields.io/badge/Production-Live%20on%20Vercel-success?style=for-the-badge&logo=vercel" alt="Vercel Live" /></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16%20(Turbopack)-black?style=for-the-badge&logo=nextdotjs" alt="Next.js" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React" /></a>
  <a href="https://fastapi.tiangolo.com"><img src="https://img.shields.io/badge/FastAPI-Python%203.11-009688?style=for-the-badge&logo=fastapi" alt="FastAPI" /></a>
  <a href="https://www.postgresql.org"><img src="https://img.shields.io/badge/PostgreSQL-16%20(pgvector)-336791?style=for-the-badge&logo=postgresql" alt="PostgreSQL" /></a>
  <a href="https://redis.io"><img src="https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis" alt="Redis" /></a>
</p>

---

## 📌 İçindekiler

- [🌍 Canlı Bağlantılar ve Servisler](#-canlı-bağlantılar-ve-servisler)
- [✨ Öne Çıkan İnteraktif Eğitim Atölyeleri](#-öne-çıkan-i̇nteraktif-eğitim-atölyeleri)
  - [1. 1 Dk Okuma & Hızlı Okuma Atölyesi](#1--1-dk-okuma--hızlı-okuma-atölyesi)
  - [2. İngilizce Kelime & Görsel Macera Atölyesi](#2--i̇ngilizce-kelime--görsel-macera-atölyesi)
  - [3. MEB Kılavuz Çizgili Harf Çizgi & Yazılış Yönü Atölyesi](#3--meb-kılavuz-çizgili-harf-çizgi--yazılış-yönü-atölyesi)
- [🏫 K-12 Akıllı Okul Yönetimi & LMS Özellikleri](#-k-12-akıllı-okul-yönetimi--lms-özellikleri)
  - [Yeni Nesil Akıllı İnteraktif Tahta (Infinite Whiteboard)](#-yeni-nesil-akıllı-i̇nteraktif-tahta-infinite-whiteboard)
  - [Ödev ve Değerlendirme Merkezi](#-ödev-ve-değerlendirme-merkezi)
  - [Sınıf, Şube ve Kütük Yönetimi](#-sınıf-şube-ve-kütük-yönetimi)
  - [Adım Adım Öğrenci Kayıt ve Sınıfa Katılım](#-adım-adım-öğrenci-kayıt-ve-sınıfa-katılım)
- [👥 Roller ve Yetkilendirme Matrisi (RBAC)](#-roller-ve-yetkilendirme-matrisi-rbac)
- [🔑 Hazır Demo Hesap Bilgileri](#-hazır-demo-hesap-bilgileri)
- [🛠️ Sistem Mimarisi ve Teknoloji Yığını](#️-sistem-mimarisi-ve-teknoloji-yığını)
- [🚀 Kurulum ve Çalıştırma Kılavuzu](#-kurulum-ve-çalıştırma-kılavuzu)
  - [1. macOS / Yerel Hızlı Başlatma](#seçenek-1-yerel-hızlı-başlatma-macos--linux)
  - [2. Docker ile Kurulum (Bulut & VPS)](#seçenek-2-docker-compose-ile-tam-kurulum)
  - [3. Otomatik Kurulum Betiği](#seçenek-3-tek-komutla-otomatik-kurulum)
- [📁 Proje Dizin Yapısı](#-proje-dizin-yapısı)
- [🔒 Güvenlik Politikası](#-güvenlik-politikası)
- [📄 Lisans](#-lisans)

---

## 🌍 Canlı Bağlantılar ve Servisler

| Servis | Bağlantı / Adres | Açıklama |
|---|---|---|
| **Canlı Üretim (Production)** | [https://oxonomedu.vercel.app](https://oxonomedu.vercel.app) | Vercel üzerinde aktif çalışan güncel canlı web portalı |
| **Giriş Paneli (Login)** | `http://lvh.me:3010/login` | Tüm roller için birleşik kimlik doğrulama ekranı |
| **Örnek Okul (Riverbend Academy)** | `http://demo.lvh.me:3010/dash` | Hazır kurslar, atölyeler ve sınıflarla canlı demo okul |
| **Organizasyon Seçici** | `http://lvh.me:3010/home` | Çok kiracılı (multi-tenant) okul ve organizasyon seçimi |
| **Backend REST API (Swagger)** | `http://lvh.me:1348/docs` | FastAPI interaktif OpenAPI Swagger dokümantasyonu |
| **Canlı İşbirliği (Collab WS)** | `ws://localhost:4000` | Hocuspocus v4 & Yjs gerçek zamanlı senkronizasyon sunucusu |

> 💡 **İpucu:** `lvh.me` ve tüm alt alan adları (örn. `demo.lvh.me`) otomatik olarak `127.0.0.1` (localhost) adresine çözümlenir; yerel testlerde `hosts` dosyasını değiştirmeniz gerekmez.

---

## ✨ Öne Çıkan İnteraktif Eğitim Atölyeleri

Oxonom Edu, öğrencilerin okuma-yazma, dil ve temel becerilerini geliştiren yerleşik interaktif pedagojik modüllerle donatılmıştır:

### 1. 📖 1 Dk Okuma & Hızlı Okuma Atölyesi
* **60 Saniye Geri Sayım & Canlı WPM:** Okuma hızını Kelime/Dakika (WPM) cinsinden anlık ölçer, toplam okunan kelime ve başarı skorunu hesaplar.
* **MEB Dik Temel Abece Tipografisi:** İlkokul çağındaki çocukların göz sağlığına ve müfredata uygun font ve satır aralıkları.
* **Kelime & Hece Piramidi Egzersizi:** Göz sıçrama aralığını (sakkadik hareketler) ve çevresel odak alanını genişleten oyunlaştırılmış piramit modu.
* **Sevimli Hikaye Kütüphanesi:** Açılır kapak görselleriyle zenginleştirilmiş, yaş seviyelerine göre kategorize edilmiş geniş hikaye koleksiyonu.
* **Sesli Metin Okuma & Kalıcı Geçmiş:** Web Speech API ile telaffuz desteği, öğrencinin önceki okuma performanslarını kayıt altına alan ve istendiğinde temizlenebilen geçmiş listesi.
* **%100 Mobil & Tablet Uyumu:** Dokunmatik ekranlar için optimize edilmiş sezgisel arayüz.

### 2. 🎨 İngilizce Kelime & Görsel Macera Atölyesi
* **8 Tematik Kategori (100+ Kelime):** Hayvanlar, Meyve & Sebzeler, Renkler, Okul Eşyaları, Sayılar, Aile Bireyleri, Meslekler ve Taşıtlar.
* **Doğal `en-US` Telaffuz:** Kartlara dokunulduğunda akıcı Amerikan İngilizcesi ses motoru ve işitsel pekiştirme.
* **4 Seçenekli Mini Test Oyunu:** Eğlenceli skor tablosu, doğru/yanlış ses efektleri ve dinamik soru akışı.
* **Kopya Önleyici Bulanıklık Kilidi (Anti-Cheat Blur):** Mini oyun başladığında kelime kartları otomatik bulanıklaşarak öğrencinin ezberden kopya çekmesini engeller, kalıcı öğrenmeyi zorunlu kılar.
* **Mobil Sekmeli Geçiş (Segmented Switcher):** Küçük ekranlarda *🃏 Kelime Kartları* ve *🎮 Mini Oyun* arasında tek tıkla geçiş olanağı.

### 3. ✍️ MEB Kılavuz Çizgili Harf Çizgi & Yazılış Yönü Atölyesi
* **4 Çizgili, 3 Aralıklı MEB Kılavuz Satır Standardı:** İlkokul 1. sınıf yazı defterinin birebir dijital karşılığı.
* **Doğru Tipografik Harf Taslakları:** Türkçe alfabedeki tüm büyük ve küçük harfler (A-Z, Ç, Ğ, I, İ, Ö, Ş, Ü) nizami oranlarla yer alır.
* **Adım Adım Kalem Simülasyonu:** Harflerin hangi noktadan başlayıp hangi yönde çizileceğini gösteren kılavuz oklar ve animasyonlu yazım demosu.
* **Türkçe Sesli Yönergeler:** *"Yukarıdan başla, aşağıya dik çizgi çek..."* şeklinde pedagojik sesli anlatım.
* **Dokunmatik & Fare Serbest Çizim Tuvali:** HTML5 Canvas ve PointerEvents API ile gecikmesiz, hassas serbest el çizimi.
* **Otomatik Yeniden Boyutlandırma:** `ResizeObserver` motoru sayesinde ekran döndürme ve boyut değişikliklerinde tuval kalitesi bozulmaz.

---

## 🏫 K-12 Akıllı Okul Yönetimi & LMS Özellikleri

### 📋 Yeni Nesil Akıllı İnteraktif Tahta (Infinite Whiteboard)
Promethean, SMART Board, iPad ve dokunmatik bilgisayarlar için özel geliştirilmiş sınırsız kanvas:
- **Sıfır Not Kaybı:** Tahtaya yazılan her formül, çizim ve açıklama anında buluta kaydedilir.
- **Evden Kesintisiz Tekrar:** Öğrenci eve gittiğinde sınıf tahtasını kendi profilinden açabilir, zumlayarak eksik notlarını tamamlayabilir.
- **Ders Arşivi:** Matematik, Fen, Türkçe gibi derslere göre tarihsel sıralı tahta arşivi.

### 📝 Ödev ve Değerlendirme Merkezi
- MEB kazanım kodlarıyla entegre ödev oluşturma.
- Öğrencilerin doğrudan sistem üzerinden veya tahta kanvasında interaktif ödev teslimi.
- Öğretmenler için tek ekranda toplu inceleme, puanlama ve geri bildirim sistemi.

### 👥 Sınıf, Şube ve Kütük Yönetimi
- Şubeli yapı desteği (örn. 9-A, 10-A, 11-B).
- **Hızlı K-12 Yoklama Motoru:** Geldi, Gelmedi, Geç, İzinli statüleri ile tek tıkla devamsızlık işleme.
- **GNO (Genel Not Ortalaması) Motoru:** Dönemlik ağırlıklı ortalama ve gelişim karnesi hesabı.
- Öğretmen rehberlik ve gelişim notları arşivi.

### 🔐 Adım Adım Öğrenci Kayıt ve Sınıfa Katılım
- Modern, animasyonlu çok adımlı kayıt sihirbazı.
- Telefon ve e-posta doğrulama desteği.
- **Sınıf Katılım Kodu (`Class Code`):** Öğrenci tek bir kod ile doğrudan kendi okuluna, şubesine ve öğretmenine otomatik bağlanır.

---

## 👥 Roller ve Yetkilendirme Matrisi (RBAC)

Oxonom platformu çok kiracılı (multi-tenant) rol tabanlı erişim kontrolü ile çalışır:

| Rol | Kapsam | Temel Yetkiler |
|---|---|---|
| **Sistem Yöneticisi (Superadmin)** | Platform Geneli | Tüm okulları/organizasyonları yönetme, küresel ayarlar, modül kütüphanesi eşitlemesi, sistem sağlığı |
| **Okul Müdürü / İdare (Admin)** | Okul / Kurum | Şube yapılandırması, öğretmen kadrosu atamaları, öğrenci işleri kütüğü, okul devamsızlık ve başarı raporları |
| **Öğretmen (Instructor)** | Sınıf & Dersler | Sınıf yönetimi, yoklama alma, akıllı tahta kullanımı, ödev ve sınav oluşturma, öğrenci değerlendirme |
| **Öğrenci (Learner)** | Şube & Kişisel | Dersleri izleme, tahtaları zumlayarak tekrar etme, interaktif ödev teslimi, eğitim atölyeleri ve oyunlar |

---

## 🔑 Hazır Demo Hesap Bilgileri

Tüm yerel demo hesaplar için geçerli varsayılan şifre: **`Ugur2803*`**

| Rol | E-posta | Kullanıcı Adı | Açıklama |
|---|---|---|---|
| 👑 **Superadmin** | `admin@oxonom.com` | `admin` | Tam sistem yöneticisi paneli |
| 🏫 **Okul Müdürü** | `idare@oxonom.com` | `idare` | Okul idaresi ve şube yönetim ekranı |
| 👨‍🏫 **Öğretmen** | `ogretmen@oxonom.com` / `teacher@oxonom.com` | `ogretmen` | 10-A ve sınıflar için öğretmen paneli |
| 🎒 **Öğrenci** | `ogrenci@oxonom.com` / `student@oxonom.com` | `ogrenci` | Öğrenci ders, ödev ve atölye ekranı |

---

## 🛠️ Sistem Mimarisi ve Teknoloji Yığını

```
                           ┌────────────────────────┐
                           │   Next.js 16 Web App   │
                           │ React 19 / TailwindCSS │
                           └───────────┬────────────┘
                                       │
                 ┌─────────────────────┴─────────────────────┐
                 ▼                                           ▼
      ┌────────────────────┐                       ┌───────────────────┐
      │  FastAPI (Python)  │                       │ Hocuspocus Server │
      │  REST API Service  │                       │ Yjs WebSocket WS  │
      └──────────┬─────────┘                       └─────────┬─────────┘
                 │                                           │
                 ├─────────────────────┬─────────────────────┤
                 ▼                     ▼                     ▼
      ┌────────────────────┐ ┌───────────────────┐ ┌───────────────────┐
      │   PostgreSQL 16    │ │      Redis 7      │ │ Vercel Production │
      │     (pgvector)     │ │   Önbellek & Pub  │ │  Edge Dağıtımı    │
      └────────────────────┘ └───────────────────┘ └───────────────────┘
```

- **Ön Yüz (Frontend):** Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS, Radix UI Primitives, Lucide Icons, Tiptap Editör.
- **Arka Yüz (Backend API):** FastAPI (Python 3.11+), SQLModel, Pydantic v2, AsyncPG, Alembic migrasyonları.
- **Gerçek Zamanlı İşbirliği (Collab):** Node.js, Hocuspocus Server v4, Yjs (CRDT mimarisi), WebSocket.
- **Veri Depolama:** PostgreSQL 16 (`pgvector` vektörel arama eklentisiyle), Redis 7 (önbellek, oturumlar ve mesaj kuyruğu).
- **Dağıtım (Deployment):** Vercel (Frontend), Docker & Docker Compose (Tüm servisler), macOS / Linux Native betikleri.

---

## 🚀 Kurulum ve Çalıştırma Kılavuzu

Depoyu yerel makinenize klonlayın:
```bash
git clone https://github.com/oxobee/oxonom.git
cd oxonom
```

### Seçenek 1: Yerel Hızlı Başlatma (macOS / Linux)
Sistemde kurulu servisleri (Postgres, Redis, API, Collab, Web) tek tıkla ayağa kaldırmak için:

```bash
# Tüm servisleri arka planda başlatır
./start.sh

# Çalışan servisleri güvenle durdurur
./stop.sh
```
> Çalışma günlükleri `logs/` dizininde (`web.log`, `api.log`, `collab.log`) saklanır.

---

### Seçenek 2: Docker Compose ile Tam Kurulum
Docker ve Docker Compose kurulu olan tüm sunucu ve makinelerde sıfır konfigürasyonla başlatma:

```bash
# 1. Ortam değişkenlerini kopyalayın
cp .env.example .env

# 2. Konteynerleri derleyin ve ayağa kaldırın
docker compose up -d --build
```
*Bu komut PostgreSQL 16'yı başlatır, `database/learnhouse_dump.sql` yedeğini otomatik olarak içeri aktarır ve Web, API ile Collab sunucularını ayağa kaldırır.*

---

### Seçenek 3: Tek Komutla Otomatik Kurulum
Sıfır bir Ubuntu / Debian veya macOS sunucusunda eksik paketleri tespit edip bağımlılıkları yüklemek için:

```bash
bash install.sh
```

---

### 🌐 Vercel Üretim Dağıtımı
Frontend arayüzünü canlıya almak için:

```bash
npx vercel --prod --yes
```

---

## 📁 Proje Dizin Yapısı

```text
LearnHouze_v2.0/
├── apps/
│   ├── web/                     # Next.js 16 Web arayüzü
│   │   ├── app/                 # App Router sayfaları (admin, orgs, auth, editor)
│   │   ├── components/          # Radix UI & özel arayüz bileşenleri
│   │   └── services/
│   │       └── playgrounds/     # İnteraktif atölyeler (Hızlı Okuma, İngilizce, Çizgi)
│   ├── api/                     # FastAPI Python arka uç servisi
│   │   ├── app/                 # Modeller, rotalar, SQLModel şemaları
│   │   └── run_demo_api.sh      # API demo çalıştırma betiği
│   ├── collab/                  # Hocuspocus v4 & Yjs WebSocket sunucusu
│   │   └── src/index.ts         # Canlı tahta ve eşzamanlı düzenleme motoru
│   └── cli/                     # LearnHouse yönetim ve kurulum CLI aracı
├── database/
│   ├── learnhouse_dump.sql      # Hazır demo okulu ve içerikleri barındıran SQL dökümü
│   └── restore.sh               # Veritabanı geri yükleme aracı
├── docs/                        # Kapsamlı okul yönetim ve mimari kılavuzları
├── docker-compose.yml           # Çoklu servis Docker orkestrasyonu
├── start.sh                     # Tek tıkla yerel başlatma betiği
├── stop.sh                      # Tek tıkla yerel durdurma betiği
├── install.sh                   # Otomatik ortam hazırlama ve kurulum betiği
└── README.md                    # Proje ana başvuru dokümanı
```

---

## 🔒 Güvenlik Politikası

- Rol bazlı erişim denetimi (RBAC) ile izole edilmiş organizasyon ve şube verileri.
- JWT tabanlı oturum yönetimi ve güvenli parola şifreleme algoritmaları.
- Cross-Origin Resource Sharing (CORS) kısıtlamaları ve güvenli iframe sanal alanları (sandbox).
- Güvenlik açığı bildirimleri için lütfen doğrudan proje yöneticisiyle iletişime geçiniz.

### 🛡️ Pano Eşleşme Güvenliği & Hassas Bilgi Rotasyonu

1. **MongoDB Atlas Parola Rotasyonu:**
   - Eski versiyonlarda test amaçlı yer alan bağlantı dizesi kod tabanından tamamen kaldırılmış olup dinamik `MONGODB_URI` ortam değişkenine geçirilmiştir.
   - Güvenlik gereği MongoDB Atlas panelinden ilgili veritabanı kullanıcısının şifresini derhal yenileyiniz ve yeni bağlantı dizesini sadece `.env` dosyasında ve Vercel / Render Environment Variables panelinde tanımlayınız.

2. **Git Geçmişinden Eski Bağlantı Dizesini Temizleme:**
   - Depo geçmişindeki eski referansları tamamen arındırmak için `git-filter-repo` veya `BFG Repo-Cleaner` çalıştırabilirsiniz:
     ```bash
     # git-filter-repo ile:
     git filter-repo --replace-text <(echo 'mongodb+srv://...==>REDACTED')

     # veya BFG ile:
     bfg --replace-text passwords.txt
     git reflog expire --expire=now --all && git gc --prune=now --aggressive
     git push origin main --force
     ```

---

## 📄 Lisans

Bu proje [AGPL-3.0](LICENSE) lisansı altında sunulmaktadır.
Kurumsal (Enterprise) özellikler ve özel dağıtım modelleri için ayrı lisanslama uygulanmaktadır.

---

<p align="center">
  <b>Oxonom Edu</b> — <i>Eğitimi interaktif, erişilebilir ve keyifli kılmak için tasarlandı.</i> 💜
</p>
