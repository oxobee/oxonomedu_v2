/**
 * MEB Uyumlu Akıcı & Hızlı Okuma Atölyesi
 * - 20+ Zengin, Uzun ve Heyecan Verici Hikaye Kütüphanesi (1-4. Sınıf)
 * - Sevimli Kapak Görselli & Filtreli "Hikaye Kütüphanesi" Popup Modalı
 * - Anlaşılır Türkçe Terminoloji ("Hedef: Dakikada 45-65 Kelime", "Kelime/Dk")
 * - İnteraktif & Oyunlaştırılmış Göz Odaklı Piramit Okuma Modülü
 * - iframe Uyumlu Dahili Onay Penceresi (Confirm) ile Güvenilir Geçmiş Silme
 * - %100 Mobil ve Tablet Uyumlu Responsive Tasarım
 */

export const READING_MODULE_HTML = `<!DOCTYPE html>
<html lang="tr" class="h-full">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Akıcı & Hızlı Okuma Atölyesi</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Comic+Neue:wght@400;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    html, body {
      width: 100%; height: 100%; margin: 0; padding: 0;
      overflow-x: hidden;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      touch-action: manipulation;
      background: #f8fafc;
      color: #1e293b;
    }
    button {
      font-family: inherit;
      cursor: pointer;
      border: none;
      outline: none;
    }
    input, select, textarea {
      font-family: inherit;
    }
    .font-meb {
      font-family: 'Comic Neue', cursive, sans-serif;
      letter-spacing: 0.04em;
    }
    .touch-btn {
      min-height: 44px; min-width: 44px;
    }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: rgba(0,0,0,0.03); border-radius: 8px; }
    ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.18); border-radius: 8px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.3); }

    /* Word token styling */
    .word-token {
      position: relative;
      display: inline-block;
      cursor: pointer;
      border-radius: 6px;
      padding: 3px 5px;
      margin: 2px 1.5px;
      transition: all 0.15s ease;
      user-select: none;
      -webkit-user-select: none;
    }
    .word-token:hover {
      background-color: #fef3c7;
      transform: translateY(-1px);
    }
    .word-read {
      background-color: #ecfdf5;
      color: #064e3b;
      font-weight: 600;
    }
    .word-unread {
      color: #94a3b8;
      background-color: transparent;
      opacity: 0.65;
    }
    .word-last-read {
      background-color: #10b981 !important;
      color: #ffffff !important;
      font-weight: 800 !important;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
      transform: scale(1.06);
      z-index: 10;
    }
    .word-last-read::after {
      content: '📍';
      position: absolute;
      top: -15px;
      right: -8px;
      font-size: 14px;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
    }
    .word-error {
      background-color: #fee2e2 !important;
      color: #b91c1c !important;
      text-decoration: line-through;
      font-weight: 700;
      border-bottom: 2px dashed #ef4444;
    }

    /* Pyramid Game Styling */
    .pyramid-row {
      position: relative;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .pyramid-row.active {
      transform: scale(1.05);
      box-shadow: 0 0 20px rgba(245, 158, 11, 0.35);
      border-color: #f59e0b !important;
      background: linear-gradient(135deg, #fef3c7, #fde68a) !important;
      color: #78350f !important;
    }
    .pyramid-row.completed {
      opacity: 0.75;
      border-color: #a7f3d0 !important;
      background-color: #ecfdf5 !important;
      color: #065f46 !important;
    }
    .pyramid-center-dot {
      width: 6px;
      height: 6px;
      background-color: #ef4444;
      border-radius: 50%;
      display: inline-block;
      margin: 0 6px;
      vertical-align: middle;
      opacity: 0.6;
    }
  </style>
</head>
<body class="h-full w-full bg-slate-50 text-slate-800 flex flex-col overflow-y-auto md:overflow-hidden select-none">

  <!-- Header Bar -->
  <header class="bg-white border-b border-amber-200/80 p-3 sm:px-5 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs shrink-0 z-20">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
        ⏱️
      </div>
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-sm sm:text-base font-black text-slate-900 tracking-tight">Akıcı & Hızlı Okuma Atölyesi</h1>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">MEB 1-4. Sınıf</span>
        </div>
        <p class="text-[11px] text-amber-700 font-semibold">20+ Resimli Hikaye, Canlı Hız Analizi & İnteraktif Odaklanma Piramidi</p>
      </div>
    </div>

    <!-- Mode & Navigation Tabs -->
    <div class="flex items-center gap-2 flex-wrap w-full md:w-auto justify-between md:justify-end">
      <!-- Tab Buttons -->
      <div class="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
        <button id="navTabReading" onclick="switchNavTab('reading')" class="touch-btn px-3 py-1.5 rounded-xl bg-white text-amber-950 shadow-xs transition cursor-pointer flex items-center gap-1.5">
          <span>📖 Okuma & Sayaç</span>
        </button>
        <button id="navTabHistory" onclick="switchNavTab('history')" class="touch-btn px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 transition cursor-pointer flex items-center gap-1.5">
          <span>📊 Geçmiş Analizler</span>
          <span id="historyBadgeCount" class="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-extrabold hidden">0</span>
        </button>
        <button id="navTabPyramid" onclick="switchNavTab('pyramid')" class="touch-btn px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 transition cursor-pointer flex items-center gap-1.5">
          <span>🔺 Odak Piramidi</span>
        </button>
      </div>

      <!-- Font size controls -->
      <div class="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
        <button onclick="changeFontSize(-2)" title="Yazıyı Küçült" class="px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 touch-btn cursor-pointer">A-</button>
        <span id="fontSizeDisplay" class="text-[11px] font-bold text-slate-500 px-1">20px</span>
        <button onclick="changeFontSize(2)" title="Yazıyı Büyüt" class="px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 touch-btn cursor-pointer">A+</button>
      </div>
    </div>
  </header>

  <!-- ========================================== -->
  <!-- 1. MAIN READING & TIMER VIEW               -->
  <!-- ========================================== -->
  <main id="viewReading" class="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden p-3 md:p-5 gap-4">
    <!-- Left: Reading Canvas -->
    <div class="flex-1 bg-white rounded-3xl border border-amber-200 shadow-sm p-4 sm:p-6 flex flex-col justify-between overflow-y-auto min-h-[380px]">
      <div>
        <!-- Top Toolbar: Story Library Button + Grade + Duration + Click Mode -->
        <div class="pb-3 mb-3 border-b border-slate-100 space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 flex-wrap">
            
            <!-- Story Picker Button (Opens Library Modal) -->
            <button onclick="openLibraryModal()" class="touch-btn px-3.5 py-2 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-300 rounded-2xl flex items-center gap-2.5 shadow-2xs transition group text-left cursor-pointer">
              <span id="selectedStoryEmoji" class="text-2xl group-hover:scale-110 transition">🌲</span>
              <div class="leading-tight">
                <span class="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Hikaye Kütüphanesi</span>
                <span id="selectedStoryTitle" class="text-xs font-black text-slate-900 line-clamp-1">Güneşli Bir Orman Gezisi</span>
              </div>
              <span class="ml-1 px-2 py-0.5 rounded-lg bg-amber-500 text-white text-[10px] font-black shadow-xs shrink-0">Değiştir ➔</span>
            </button>

            <!-- Sınıf Seviyesi & Hedef Hız -->
            <div class="flex items-center gap-2 flex-wrap">
              <div class="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <label for="gradeSelect" class="text-[11px] font-bold text-slate-500">Sınıf:</label>
                <select id="gradeSelect" onchange="changeGradeTarget(this.value)" class="text-xs font-bold text-slate-900 bg-transparent outline-none cursor-pointer">
                  <option value="1">1. Sınıf</option>
                  <option value="2">2. Sınıf</option>
                  <option value="3">3. Sınıf</option>
                  <option value="4">4. Sınıf</option>
                </select>
              </div>

              <!-- Anlaşılır Türkçe Hedef Hız Kartı -->
              <div class="px-2.5 py-1.5 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] font-semibold text-amber-900 flex items-center gap-1.5" title="Milli Eğitim Bakanlığı tavsiye edilen dakikada okunan kelime aralığı">
                <span>🎯</span>
                <span id="targetSpeedLabel">Hedef: <strong>Dakikada 45–65 Kelime</strong></span>
              </div>
            </div>
          </div>

          <!-- Bottom Control Bar: Duration Picker & Marking Mode -->
          <div class="flex items-center justify-between flex-wrap gap-2 pt-1 text-xs">
            <!-- Duration Buttons -->
            <div class="flex items-center gap-1.5">
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Süre:</span>
              <div class="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                <button onclick="setTimerDuration(30)" id="durBtn_30" class="px-2.5 py-1 text-xs font-bold rounded-lg text-slate-600 hover:text-slate-900 transition cursor-pointer">30 sn</button>
                <button onclick="setTimerDuration(60)" id="durBtn_60" class="px-2.5 py-1 text-xs font-black rounded-lg bg-white text-amber-950 shadow-xs transition cursor-pointer">60 sn (1 Dk)</button>
                <button onclick="setTimerDuration(120)" id="durBtn_120" class="px-2.5 py-1 text-xs font-bold rounded-lg text-slate-600 hover:text-slate-900 transition cursor-pointer">2 Dk</button>
                <button onclick="setTimerDuration(0)" id="durBtn_0" class="px-2.5 py-1 text-xs font-bold rounded-lg text-slate-600 hover:text-slate-900 transition cursor-pointer">⏱️ Serbest</button>
              </div>
            </div>

            <!-- Click Mode: Last Word or Error Word -->
            <div class="flex items-center gap-1.5">
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">İşaretleme:</span>
              <div class="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                <button id="modeLastReadBtn" onclick="setClickMode('last_read')" class="px-2.5 py-1 text-xs font-black rounded-lg bg-white text-emerald-800 shadow-xs transition cursor-pointer flex items-center gap-1">
                  <span>📍 Kaldığım Yer</span>
                </button>
                <button id="modeErrorBtn" onclick="setClickMode('error')" class="px-2.5 py-1 text-xs font-bold rounded-lg text-slate-600 hover:text-rose-700 transition cursor-pointer flex items-center gap-1">
                  <span>❌ Hatalı Kelime</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Custom Text Input Container (Hidden unless custom is picked) -->
        <div id="customTextContainer" class="hidden mb-4 p-3 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-amber-900">✏️ Kendi Okuma Metnini Yapıştır veya Yaz:</span>
            <button onclick="applyCustomText()" class="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer">Metni Uygula</button>
          </div>
          <textarea id="customTextInput" rows="4" placeholder="Metninizi buraya yapıştırın..." class="w-full text-sm p-2.5 bg-white border border-amber-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 font-meb"></textarea>
        </div>

        <!-- Interactive Reading Text Container -->
        <div id="storyContainer" class="font-meb leading-loose p-2 sm:p-4 bg-slate-50/50 rounded-2xl border border-slate-100 min-h-[220px] transition-all select-none text-[20px]">
          <!-- Word tokens dynamically injected here -->
        </div>
      </div>

      <!-- Instructions & Fast Help Footer -->
      <div class="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2 shrink-0">
        <span class="flex items-center gap-1.5">
          <span class="text-emerald-600 font-bold">💡 İpucu:</span>
          <span>Süre bitince en son okuduğunuz kelimeye dokunarak okuma hızınızı ve harf analizinizi görün.</span>
        </span>
        <button onclick="resetLastReadWord()" class="text-amber-700 hover:text-amber-950 font-bold underline cursor-pointer text-[11px]">
          İşareti Sıfırla
        </button>
      </div>
    </div>

    <!-- Right: High-Tech Timer & Real-Time Analytics Panel -->
    <div class="w-full md:w-80 flex flex-col gap-4 shrink-0">
      
      <!-- Big Stopwatch & Controls Card -->
      <div class="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div class="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

        <span class="text-[11px] font-black text-amber-100 uppercase tracking-widest block mb-1">OKUMA SAYACI</span>

        <!-- Digital Big Display -->
        <div class="my-2">
          <span id="timerDisplay" class="text-5xl sm:text-6xl font-black tracking-tight font-mono drop-shadow-md">01:00</span>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-black/20 rounded-full h-3 mb-4 overflow-hidden p-0.5 border border-white/20">
          <div id="timerProgress" class="bg-white h-full rounded-full transition-all duration-300 shadow-inner" style="width: 100%;"></div>
        </div>

        <!-- Action Control Buttons -->
        <div class="grid grid-cols-2 gap-2 w-full">
          <button id="startBtn" onclick="toggleTimer()" class="touch-btn bg-white text-amber-950 hover:bg-amber-50 font-black rounded-2xl py-3 shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer">
            ▶️ Başlat
          </button>
          <button onclick="resetTimer()" class="touch-btn bg-amber-700/60 hover:bg-amber-700 text-white font-bold rounded-2xl py-3 flex items-center justify-center gap-1.5 transition cursor-pointer">
            🔄 Sıfırla
          </button>
        </div>
      </div>

      <!-- Real-Time Metrics & Live Evaluation -->
      <div class="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 class="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <span>🎯</span>
            <span>Canlı Okuma Analizi</span>
          </h3>
          <span id="liveAccuracyBadge" class="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            %100 Doğruluk
          </span>
        </div>

        <!-- 4-Grid Live Metrics (Clear Turkish Terminology) -->
        <div class="grid grid-cols-2 gap-2.5">
          <div class="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Okunan Kelime</span>
            <div class="flex items-baseline gap-1 mt-0.5">
              <span id="statWordsRead" class="text-2xl font-black text-slate-900">0</span>
              <span id="statTotalWords" class="text-xs text-slate-400 font-semibold">/ 0</span>
            </div>
          </div>
          <div class="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100">
            <span class="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">Okunan Harf</span>
            <div class="flex items-baseline gap-1 mt-0.5">
              <span id="statLettersRead" class="text-2xl font-black text-indigo-950">0</span>
              <span class="text-xs text-indigo-400 font-semibold">harf</span>
            </div>
          </div>
          
          <!-- Kelime Hızı (Türkçe) -->
          <div class="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Kelime Hızı</span>
              <span class="text-[9px] text-emerald-500 font-bold" title="1 Dakikada okunan kelime hızı">Dk/Hız</span>
            </div>
            <div class="flex items-baseline gap-1 mt-0.5">
              <span id="statWpm" class="text-2xl font-black text-emerald-700">0</span>
              <span class="text-[10px] text-emerald-600 font-bold">Kelime/Dk</span>
            </div>
          </div>

          <!-- Harf Hızı (Türkçe) -->
          <div class="p-3 rounded-2xl bg-amber-50/60 border border-amber-100">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Harf Hızı</span>
              <span class="text-[9px] text-amber-500 font-bold" title="1 Dakikada taranan toplam harf sayısı">Dk/Harf</span>
            </div>
            <div class="flex items-baseline gap-1 mt-0.5">
              <span id="statCpm" class="text-2xl font-black text-amber-800">0</span>
              <span class="text-[10px] text-amber-600 font-bold">Harf/Dk</span>
            </div>
          </div>
        </div>

        <!-- Errors Count Row -->
        <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
          <span class="text-slate-600 font-semibold flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-red-500"></span>
            Hatalı / Atlanan Kelime:
          </span>
          <span id="statErrorsCount" class="font-black text-red-600 text-sm">0</span>
        </div>

        <!-- Finish Session & Generate Report Button -->
        <button onclick="finishAndAnalyze()" class="touch-btn w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95">
          <span>🏁</span>
          <span>Okumayı Bitir & Karnemi Oluştur</span>
        </button>
      </div>
    </div>
  </main>

  <!-- ========================================== -->
  <!-- 2. HISTORY & ANALYTICS VIEW                -->
  <!-- ========================================== -->
  <section id="viewHistory" class="hidden flex-1 flex-col overflow-y-auto p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-5">
    <!-- Header of History -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
      <div>
        <h2 class="text-lg font-black text-slate-900 flex items-center gap-2">
          <span>📊</span>
          <span>Geçmiş Okuma Analizlerim & Gelişim Karnesi</span>
        </h2>
        <p class="text-xs text-slate-500 mt-0.5">Tamamladığınız tüm okuma seansları, kelime/harf hızlarınız ve başarı gelişiminiz.</p>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="switchNavTab('reading')" class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer">
          + Yeni Okuma Yap
        </button>
        <button onclick="openClearHistoryModal()" class="px-3 py-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 text-xs font-bold rounded-xl transition cursor-pointer">
          Geçmişi Temizle
        </button>
      </div>
    </div>

    <!-- Summary Stats Bar -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
      <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ortalama Hız</span>
        <span id="histAvgWpm" class="text-lg font-black text-emerald-600 mt-1 block">0 Kelime/Dk</span>
      </div>
      <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rekor Hız</span>
        <span id="histMaxWpm" class="text-lg font-black text-indigo-600 mt-1 block">0 Kelime/Dk</span>
      </div>
      <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Toplam Kelime</span>
        <span id="histTotalWords" class="text-lg font-black text-slate-800 mt-1 block">0</span>
      </div>
      <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Toplam Harf</span>
        <span id="histTotalLetters" class="text-lg font-black text-slate-800 mt-1 block">0</span>
      </div>
      <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ort. Doğruluk</span>
        <span id="histAvgAcc" class="text-lg font-black text-amber-600 mt-1 block">%0</span>
      </div>
      <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Toplam Oturum</span>
        <span id="histTotalSessions" class="text-lg font-black text-slate-800 mt-1 block">0</span>
      </div>
    </div>

    <!-- History Cards Feed -->
    <div class="space-y-3" id="historyCardsContainer">
      <!-- History session cards rendered via JS -->
    </div>
  </section>

  <!-- ========================================== -->
  <!-- 3. GAMIFIED EYE-EXPANSION PYRAMID VIEW    -->
  <!-- ========================================== -->
  <section id="viewPyramid" class="hidden flex-1 overflow-y-auto p-4 sm:p-6 max-w-4xl mx-auto w-full flex-col items-center justify-start space-y-4 font-meb">
    <div class="bg-white p-5 sm:p-7 rounded-3xl border border-amber-200 shadow-sm w-full max-w-2xl mx-auto space-y-5">
      
      <!-- Top Title & Controls -->
      <div class="flex flex-col sm:flex-row items-center justify-between pb-3 border-b border-amber-100 gap-3">
        <div class="text-center sm:text-left">
          <div class="flex items-center justify-center sm:justify-start gap-2">
            <span class="text-xs font-black text-amber-600 uppercase tracking-wider">Göz Genişletme & Odaklanma Oyunu</span>
            <span id="pyramidLevelBadge" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">1. Seviye</span>
          </div>
          <h2 id="pyramidTitle" class="text-xl font-black text-slate-900 mt-0.5">Ormanın Neşeli Kuşları</h2>
          <p class="text-xs text-slate-500 mt-0.5">Ortadaki kırmızı noktaya odaklanın ve kelimeleri tek bakışta okumaya çalışın!</p>
        </div>

        <!-- Controls: Mode Selector -->
        <div class="flex items-center gap-2">
          <button onclick="togglePyramidAutoPlay()" id="pyramidAutoBtn" class="touch-btn px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5">
            <span id="pyramidAutoIcon">▶️</span>
            <span id="pyramidAutoLabel">Otomatik Başlat</span>
          </button>
          <button onclick="nextPyramidExercise()" title="Sıradaki Piramit" class="touch-btn px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer">
            Sonraki ❯
          </button>
        </div>
      </div>

      <!-- Pyramid Visual Arena -->
      <div id="pyramidRows" class="space-y-3 py-4 flex flex-col items-center justify-center min-h-[260px] select-none">
        <!-- Rows dynamically injected -->
      </div>

      <!-- Step Navigator & Spacebar hint -->
      <div class="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2 text-slate-400">
          <span class="px-2 py-1 bg-slate-100 rounded-md font-mono text-[11px] font-bold text-slate-700">BOŞLUK</span>
          <span>veya</span>
          <span class="px-2 py-1 bg-slate-100 rounded-md font-mono text-[11px] font-bold text-slate-700">DOKUN</span>
          <span>tuşuyla sıradaki satıra geçin.</span>
        </div>

        <button onclick="stepPyramidRow()" class="touch-btn w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-xl shadow-md transition cursor-pointer active:scale-95 text-center">
          Sonraki Satıra Odaklan ➔
        </button>
      </div>
    </div>
  </section>

  <!-- ========================================== -->
  <!-- 4. STORY LIBRARY POPUP MODAL (20+ STORIES) -->
  <!-- ========================================== -->
  <div id="libraryModal" class="hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
    <div class="bg-white rounded-3xl max-w-4xl w-full h-[88vh] max-h-[750px] shadow-2xl flex flex-col overflow-hidden border border-amber-200 animate-scaleIn">
      
      <!-- Modal Header -->
      <div class="p-4 sm:px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-between gap-3 shrink-0">
        <div class="flex items-center gap-3">
          <span class="text-3xl">📚</span>
          <div>
            <h3 class="text-base sm:text-lg font-black tracking-tight">Oxonom Hikaye Kütüphanesi</h3>
            <p class="text-xs text-amber-100 font-medium">Hızlı ve akıcı okumayı geliştiren zengin MEB uyumlu metinler</p>
          </div>
        </div>
        <button onclick="closeLibraryModal()" class="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold text-lg transition cursor-pointer">
          ✕
        </button>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="p-3 sm:px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        <!-- Grade Pills -->
        <div class="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <button onclick="filterLibrary('all')" id="libFilter_all" class="px-3 py-1 rounded-xl text-xs font-black bg-amber-500 text-white shadow-2xs transition cursor-pointer">Tümü</button>
          <button onclick="filterLibrary('1')" id="libFilter_1" class="px-3 py-1 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-amber-50 transition cursor-pointer">1. Sınıf</button>
          <button onclick="filterLibrary('2')" id="libFilter_2" class="px-3 py-1 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-amber-50 transition cursor-pointer">2. Sınıf</button>
          <button onclick="filterLibrary('3')" id="libFilter_3" class="px-3 py-1 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-amber-50 transition cursor-pointer">3. Sınıf</button>
          <button onclick="filterLibrary('4')" id="libFilter_4" class="px-3 py-1 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-amber-50 transition cursor-pointer">4. Sınıf</button>
          <button onclick="filterLibrary('custom')" id="libFilter_custom" class="px-3 py-1 rounded-xl text-xs font-bold bg-white text-amber-800 border border-amber-300 hover:bg-amber-50 transition cursor-pointer">✏️ Kendi Metnim</button>
        </div>

        <!-- Search Input -->
        <div class="w-full sm:w-56 relative">
          <input type="text" id="libSearchInput" oninput="searchLibrary(this.value)" placeholder="Hikaye ara..." class="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-400">
        </div>
      </div>

      <!-- Stories Grid -->
      <div id="libraryGrid" class="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        <!-- Illustrated Story Cards injected via JS -->
      </div>
    </div>
  </div>

  <!-- ========================================== -->
  <!-- 5. DETAILED REPORT & SAVE MODAL            -->
  <!-- ========================================== -->
  <div id="reportModal" class="hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl text-center space-y-4 animate-scaleIn border border-slate-100">
      <div class="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center text-3xl shadow-inner">
        🎉
      </div>

      <div>
        <div class="inline-block px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 mb-1" id="repBadge">
          Üstün Akıcılık 🏆
        </div>
        <h3 class="text-xl font-black text-slate-900" id="repTitle">Okuma Raporun Hazırlandı!</h3>
        <p class="text-xs text-slate-500 mt-0.5" id="repSubtitle">İşaretlediğin kelimeye kadar yapılan detaylı analiz:</p>
      </div>

      <!-- 6-Box Metric Matrix (Türkçe) -->
      <div class="grid grid-cols-2 gap-2.5 text-left bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
        <div class="p-2.5 bg-white rounded-xl border border-slate-100">
          <span class="text-[10px] font-bold text-slate-400 block uppercase">Okunan Kelime</span>
          <span id="repWords" class="text-xl font-black text-slate-900">0</span>
        </div>
        <div class="p-2.5 bg-white rounded-xl border border-slate-100">
          <span class="text-[10px] font-bold text-indigo-400 block uppercase">Okunan Harf</span>
          <span id="repLetters" class="text-xl font-black text-indigo-700">0</span>
        </div>
        <div class="p-2.5 bg-white rounded-xl border border-slate-100">
          <span class="text-[10px] font-bold text-emerald-500 block uppercase">Kelime Hızı</span>
          <span id="repWpm" class="text-xl font-black text-emerald-600">0 Kelime/Dk</span>
        </div>
        <div class="p-2.5 bg-white rounded-xl border border-slate-100">
          <span class="text-[10px] font-bold text-amber-500 block uppercase">Harf Hızı</span>
          <span id="repCpm" class="text-xl font-black text-amber-700">0 Harf/Dk</span>
        </div>
        <div class="p-2.5 bg-white rounded-xl border border-slate-100">
          <span class="text-[10px] font-bold text-slate-400 block uppercase">Geçen Süre</span>
          <span id="repElapsed" class="text-base font-bold text-slate-800">0 sn</span>
        </div>
        <div class="p-2.5 bg-white rounded-xl border border-slate-100">
          <span class="text-[10px] font-bold text-slate-400 block uppercase">Doğruluk Oranı</span>
          <span id="repAccuracy" class="text-base font-bold text-emerald-600">%100</span>
        </div>
      </div>

      <!-- Pedagogical Feedback Box -->
      <div class="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-left">
        <span class="text-[11px] font-black text-amber-800 block">Öğretmen Değerlendirmesi:</span>
        <p id="repFeedback" class="text-xs text-amber-950 mt-1 leading-relaxed">
          Tebrikler! Belirlenen hedef seviyenin üzerinde akıcı ve hatasız bir okuma temposu yakaladın.
        </p>
      </div>

      <!-- Save & Action Buttons -->
      <div class="space-y-2 pt-2">
        <button id="saveAnalysisBtn" onclick="saveCurrentAnalysis()" class="touch-btn w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95">
          <span>💾</span>
          <span id="saveBtnText">Bu Analizi Gelişim Karneme Kaydet</span>
        </button>
        <button onclick="closeReportModal()" class="touch-btn w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-2xl transition cursor-pointer">
          Pencereyi Kapat
        </button>
      </div>
    </div>
  </div>

  <!-- ========================================== -->
  <!-- 6. IN-PAGE CONFIRMATION MODAL (NO WINDOW.CONFIRM) -->
  <!-- ========================================== -->
  <div id="confirmDialogModal" class="hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4 border border-slate-200 animate-scaleIn">
      <div class="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center text-2xl shadow-inner">
        🗑️
      </div>
      <div>
        <h4 id="confirmDialogTitle" class="text-base font-black text-slate-900">Kaydı Sil</h4>
        <p id="confirmDialogMessage" class="text-xs text-slate-600 mt-1">Bu okuma kaydını silmek istediğinize emin misiniz?</p>
      </div>
      <div class="grid grid-cols-2 gap-2 pt-1">
        <button onclick="closeConfirmModal()" class="touch-btn py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer">
          Vazgeç
        </button>
        <button id="confirmDialogActionBtn" onclick="executePendingConfirmAction()" class="touch-btn py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-sm transition cursor-pointer">
          Evet, Sil
        </button>
      </div>
    </div>
  </div>

  <!-- SCRIPT LOGIC -->
  <script>
    // ==========================================
    // 20+ RICH & ENGAGING STORY COLLECTION
    // ==========================================
    const STORIES = [
      // 1. Sınıf Hikayeleri
      {
        id: 0,
        grade: 1,
        gradeLabel: '1. Sınıf',
        category: 'Doğa',
        emoji: '🌲',
        title: 'Güneşli Bir Orman Gezisi',
        color: 'from-emerald-500 to-green-600',
        summary: 'Ali ve Ayşe güneşli bir pazar günü yeşil ormanda piknik yaparlar.',
        content: 'Ilık bir pazar sabahıydı. Güneş pırıl pırıl parlıyordu. Ali ile Ayşe sevimli köpekleri Karabaş ile birlikte ormana doğru yürüdüler. Ormanın içi rengarenk çiçeklerle doluydu. Ağaçların dallarında neşeli kuşlar cıvıldıyordu. Karabaş bir kelebeğin peşinden koşmaya başladı. Çimenlerin üstüne kırmızı bir örtü serip piknik yaptılar. Annelerinin hazırladığı taze elmalı kurabiyeleri afiyetle yediler. Gün batımında mutlu bir şekilde evlerine döndüler.'
      },
      {
        id: 1,
        grade: 1,
        gradeLabel: '1. Sınıf',
        category: 'Hayvanlar',
        emoji: '🐶',
        title: 'Sevimli Köpek Karabaş',
        color: 'from-amber-500 to-orange-600',
        summary: 'Bahçedeki kırmızı topun peşinde koşan neşeli bir köpeğin hikayesi.',
        content: 'Karabaş bahçede yaşayan çok oyuncu bir köpekti. Kulakları uzun, tüyleri yumuşacıktı. Sabah erkenden uyanır, evin etrafında neşeyle koşardı. Bir gün bahçede parlak kırmızı bir top buldu. Topu burnuyla itti, sonra patileriyle yakaladı. Ali bahçeye çıkınca Karabaş topu onun ayaklarının ucuna bıraktı. Ali topu uzağa fırlattı, Karabaş rüzgar gibi hızla koşup topu geri getirdi. Bütün öğleden sonra neşeyle oynadılar.'
      },
      {
        id: 2,
        grade: 1,
        gradeLabel: '1. Sınıf',
        category: 'Oyun',
        emoji: '🪁',
        title: 'Kırmızı Uçurtmanın Yolculuğu',
        color: 'from-rose-500 to-red-600',
        summary: 'Rüzgarlı tepede gökyüzüne yükselen rengarenk bir uçurtma.',
        content: 'Bahar rüzgarı tatlı tatlı esiyordu. Can babasıyla birlikte renkli çıtalardan büyük bir uçurtma yaptı. Uçurtmanın uzun ve neşeli bir kuyruğu vardı. Yeşil tepeye çıktılar. Can ipi tuttu, babası uçurtmayı havaya kaldırdı. Rüzgar esince uçurtma birden gökyüzüne doğru havalandı. Maviliklerin içinde adeta bir kuş gibi süzülüyordu. Bulutların arasından şehri seyreden uçurtma, gökyüzünün en mutlu uçurtması oldu.'
      },
      {
        id: 3,
        grade: 1,
        gradeLabel: '1. Sınıf',
        category: 'Doğa',
        emoji: '🐜',
        title: 'Çalışkan Minik Karınca',
        color: 'from-amber-600 to-yellow-600',
        summary: 'Kocaman bir buğday tanesini yuvasına taşıyan gayretli karınca.',
        content: 'Minik karınca Çıtı pıtı, sabahın ilk ışıklarıyla yuvasından çıktı. Bugün kış için yiyecek arayacaktı. Kocaman bir meşe ağacının altında altın sarısı bir buğday tanesi gördü. Buğday tanesi kendi boyundan çok daha büyüktü. Önce tek başına itmeye çalıştı ama başaramadı. Hemen arkadaşlarına haber verdi. Üç küçük karınca el ele verip buğdayı hep birlikte kaldırdılar ve güvenle yuvalarına taşıdılar.'
      },
      {
        id: 4,
        grade: 1,
        gradeLabel: '1. Sınıf',
        category: 'Hayvanlar',
        emoji: '🐰',
        title: 'Beyaz Tavşanın Havuç Bahçesi',
        color: 'from-teal-500 to-emerald-600',
        summary: 'Büyük yeşil vadide en tatlı havucu arayan Pamuk tavşan.',
        content: 'Pamuk, kulakları dik ve burnu kıpır kıpır bir tavşandı. Yeşil ormanın kıyısındaki çiftlik bahçesinde taptaze turuncu havuçlar yetişiyordu. Pamuk bahçe çitinin altından sessizce süzüldü. Topraktan yeni çıkmış en tatlı havucu seçti. Havucu çıtır çıtır yerken yanına küçük bir sincap geldi. Pamuk havucunun yarısını sincap arkadaşıyla paylaştı. İki dost neşeyle karınlarını doyurdular.'
      },

      // 2. Sınıf Hikayeleri
      {
        id: 5,
        grade: 2,
        gradeLabel: '2. Sınıf',
        category: 'Çiftlik',
        emoji: '🦆',
        title: 'Çiftlikteki Neşeli Ördekler',
        color: 'from-sky-500 to-blue-600',
        summary: 'Göldeki nilüferlerin arasında saklambaç oynayan yavru ördekler.',
        content: 'Büyük çiftliğin hemen yanında berrak sulu bir gölet vardı. Anne ördek her sabah beş yavrusunu sıraya dizer, yüzme dersi verirdi. Yavru ördek Vakvak en hareketli olanıydı. Bir sabah yeşil nilüfer yapraklarının arkasına saklanarak kardeşleriyle saklambaç oynamaya başladı. Suda küçük dalgalar oluşturarak daldı ve çıktı. Kardeşleri onu bulamayınca neşeli bir sesle bağırdı. Güneş göletin suyunu ısıtırken bütün ördekler hep bir ağızdan neşeyle şarkı söyledi.'
      },
      {
        id: 6,
        grade: 2,
        gradeLabel: '2. Sınıf',
        category: 'Gizem',
        emoji: '📖',
        title: 'Kütüphanedeki Büyülü Kitap',
        color: 'from-indigo-500 to-violet-600',
        summary: 'Sayfaları çevirdikçe içinden yıldızlar dökülen masal kitabı.',
        content: 'Okul kütüphanesinin en arka rafında deri kaplı, altın yaldızlı eski bir kitap duruyordu. Zeynep kitap okumayı çok seven meraklı bir öğrenciydi. Parmak uçlarında yükselerek o kitabı raftan indirdi. Kapağını yavaşça açtığında sayfalarından ılık bir ışık yayıldı. Kitapta uçan halılar, konuşan balıklar ve bulutların üstünde yaşayan kaleler anlatılıyordu. Zeynep sayfaları çevirdikçe kendini o masal dünyasının içinde hissetti. Zil çaldığında kitabı göğsüne bastırıp kütüphane öğretmenine teşekkür etti.'
      },
      {
        id: 7,
        grade: 2,
        gradeLabel: '2. Sınıf',
        category: 'Doğa',
        emoji: '🦋',
        title: 'Mavi Kanatlı Kelebeğin Rüyası',
        color: 'from-cyan-500 to-teal-600',
        summary: 'Rengarenk çiçek bahçesinde gökkuşağını arayan sevimli kelebek.',
        content: 'Kozasından yeni çıkan Maviş, parıldayan mavi kanatlarını ilk kez gökyüzüne açtı. Bahçedeki papatyalar ve laleler ona el sallıyordu. Maviş yağmurdan sonra gökyüzünde beliren yedi renkli gökkuşağını çok merak ediyordu. Küçük kanatlarını hızlı hızlı çırparak yüksek tepeye doğru uçtu. Tepeye vardığında yağmur durmuş ve gökyüzünde dev bir gökkuşağı belirmişti. Maviş bu harika renk cümbüşünün altında kanat çırparak dans etti.'
      },
      {
        id: 8,
        grade: 2,
        gradeLabel: '2. Sınıf',
        category: 'Teknoloji',
        emoji: '🤖',
        title: 'Robot Robi Okula Başlıyor',
        color: 'from-blue-600 to-indigo-700',
        summary: 'Çocuklara matematik ve kodlama öğreten sevimli minik robot.',
        content: 'Mert, fen laboratuvarında küçük metal parçalardan akıllı bir robot tasarladı. Adını Robi koydular. Robi mavi ışıkları yanan gözlere ve tekerlekli ayaklara sahipti. Mert onu sınıfa getirdiğinde bütün öğrenciler heyecanla etrafına toplandı. Robi çocuklara sorular soruyor, doğru cevap verildiğinde melodiler çalarak neşeyle etrafında dönüyordu. Teneffüste çocuklarla bahçede yarış yaptı. O günden sonra sınıfın en sevilen yardımcısı oldu.'
      },
      {
        id: 9,
        grade: 2,
        gradeLabel: '2. Sınıf',
        category: 'Deniz',
        emoji: '🐚',
        title: 'Deniz Kabuğundaki Fısıltı',
        color: 'from-amber-500 to-teal-600',
        summary: 'Kumsalda bulunan sedefli deniz kabuğunun anlattığı okyanus sırrı.',
        content: 'Yaz tatilinde Ece ailesiyle birlikte sahil kenarındaki küçük bir köye gitti. Sabah erkenden kumsalda yürüyüş yaparken altın sarısı kumların arasında parıldayan bir deniz kabuğu gördü. Kabuğu eline alıp kulağına dayadı. İçinden tatlı bir rüzgar sesi ve dalga şırıltısı geliyordu. Sanki derin okyanuslardaki yunuslar ve mercan resifleri ona şarkı söylüyordu. Ece o kabuğu masasının en güzel köşesine koydu ve her baktığında denizi hatırladı.'
      },

      // 3. Sınıf Hikayeleri
      {
        id: 10,
        grade: 3,
        gradeLabel: '3. Sınıf',
        category: 'Doğa',
        emoji: '🌱',
        title: 'Küçük Tohumun Büyük Meşe Rüyası',
        color: 'from-emerald-600 to-teal-700',
        summary: 'Toprağın altından gökyüzüne uzanan cesur bir meşe palamudunun serüveni.',
        content: 'Sonbahar rüzgarıyla meşe ağacından toprağa düşen küçük bir palamut tohumu vardı. Kış boyunca karın altında sessizce uyudu ve gökyüzünü düşledi. İlkbahar gelip yağmurlar toprağı ıslatınca içindeki yaşam kıvılcımı uyandı. Minik köklerini toprağın derinliklerine doğru uzattı, iki minik yeşil yaprağını güneşe doğru uzattı. Zamanla fırtınalara direndi, sıcağa dayandı. Yıllar geçtikçe gövdesi kalınlaştı, dalları kuşlara yuva oldu. Bir zamanlar minicik bir tohum olan palamut, artık ormanın en ulu ve saygıdeğer meşe ağacı haline gelmişti.'
      },
      {
        id: 11,
        grade: 3,
        gradeLabel: '3. Sınıf',
        category: 'Uzay',
        emoji: '🚀',
        title: 'Uzay Gemisiyle Ay Krateri Macerası',
        color: 'from-indigo-600 to-purple-800',
        summary: 'Genç astronotların Ay yüzeyinde keşfettiği gizemli kristal taşlar.',
        content: 'Kaptan Eren ve yardımcısı Elif, beyaz uzay giysilerini giyerek Ay Modülü Apollo-X ile Ay yüzeyine iniş yaptılar. Geminin kapısı açıldığında karşılarında sessiz, gri tozlarla kaplı ve kraterlerle dolu büyüleyici bir manzara vardı. Düşük yerçekimi sayesinde havada adeta yay gibi zıplayarak ilerliyorlardı. Büyük bir kraterin dibine indiklerinde parıldayan mavi kristal bir taş parçası buldular. Bu taş güneş ışığını içine hapsediyor ve karanlıkta fosforlu bir ışık yayıyordu. Numuneleri dikkatle tüplere koyup Dünya daki bilim merkezine götürmek üzere uzay gemilerine döndüler.'
      },
      {
        id: 12,
        grade: 3,
        gradeLabel: '3. Sınıf',
        category: 'Deniz',
        emoji: '🐬',
        title: 'Cesur Yunus Maya ve Mercan Kayalığı',
        color: 'from-cyan-600 to-blue-700',
        summary: 'Balık ağlarına takılan yavru kaplumbağayı kurtaran akıllı yunus.',
        content: 'Maya, turkuaz renkli sıcak sularda sürüsüyle birlikte yaşayan çok zeki bir yunustu. Bir sabah mercan resifinin yakınlarında yüzerken telaşlı sesler duydu. Küçük bir deniz kaplumbağası eski bir balık ağına takılmış ve su yüzeyine çıkamıyordu. Maya hiç tereddüt etmeden yanına yüzdü. Güçlü burnuyla ağın iplerini gevşetti ve kaplumbağanın başını sıkıştığı yerden kurtardı. Birlikte gökyüzüne doğru fırlayıp derin bir nefes aldılar. Bütün mercan sakinleri Maya nın bu cesur davranışını alkışladı.'
      },
      {
        id: 13,
        grade: 3,
        gradeLabel: '3. Sınıf',
        category: 'Macera',
        emoji: '⏳',
        title: 'Zaman Makinesinin İlk Denemesi',
        color: 'from-violet-600 to-fuchsia-700',
        summary: 'Tavan arasında kurulan çarklı saat makinesiyle geçmişe yolculuk.',
        content: 'Berk ile kardeşi Selin, dedelerinden kalan eski saat parçalarını ve bakır telleri birleştirerek tavan arasında bir icat geliştirdiler. Adına Zaman Pusulası koydular. Berk ibreyi yüz yıl öncesine çevirip büyük kırmızı düğmeye bastığında odanın etrafında parlak altın rengi ışıklar dönmeye başladı. Gözlerini açtıklarında eski ahşap trenlerin buhar çıkardığı ve at arabalarının sokaklarda dolaştığı eski bir kasaba meydanındaydılar. İki kardeş tarihin canlı sayfaları arasında unutulmaz bir keşif turu yaptılar.'
      },
      {
        id: 14,
        grade: 3,
        gradeLabel: '3. Sınıf',
        category: 'Kutup',
        emoji: '🐻‍❄️',
        title: 'Kutup Ayısı Boni ve Kuzey Işıkları',
        color: 'from-sky-600 to-teal-800',
        summary: 'Bembeyaz buzulların üzerinde yeşil ve mor gökyüzü dansını izleyen ayı.',
        content: 'Kuzey Kutbu nun sonsuz buzulları üzerinde yaşayan yavru kutup ayısı Boni, kış gecelerinin karanlığını çok severdi. Çünkü bu gecelerde gökyüzünde Aurora denilen büyüleyici Kuzey Işıkları dans ederdi. Annesiyle birlikte yüksek bir buz tepesine tırmandılar. Gökyüzü bir anda zümrüt yeşili, parlak mor ve pembe dalgalarla aydınlandı. Işıklar adeta gökte sallanan dev bir ipek perde gibi dalgalanıyordu. Boni patilerini havaya kaldırarak bu büyülü ışıkları yakalamaya çalıştı ve kutbun huzurlu sessizliğinde uykuya daldı.'
      },

      // 4. Sınıf Hikayeleri
      {
        id: 15,
        grade: 4,
        gradeLabel: '4. Sınıf',
        category: 'Deniz',
        emoji: '🗼',
        title: 'Deniz Fenerinin Fırtınalı Gece Bekçisi',
        color: 'from-slate-700 to-slate-900',
        summary: 'Azgın fırtınada gemilere yol gösteren bilge fener bekçisi Hasan Dede.',
        content: 'Sarp kayalıkların üzerine inşa edilmiş asırlık deniz feneri, Karadeniz in hırçın dalgalarına yıllardır meydan okuyordu. Hasan Dede elli yıldır bu fenerin dev merceğini her akşam titizlikle parlatır ve lambasını yakardı. O gece gökyüzü zifiri karanlığa bürünmüş, dev dalgalar kayalıkları dövüyordu. Telsizden rotasını kaybetmiş bir yük gemisinin kayalıklara doğru sürüklendiği anonsu geldi. Hasan Dede fırtınaya aldırmadan spiral merdivenleri hızla tırmandı. Fenerin güçlü ışığını geminin görebileceği en açık açıya çevirdi. Güçlü ışık huzmesi fırtınayı delip geçti ve kaptana güvenli limanın yolunu gösterdi. Sabah fırtına dindiğinde gemi limana güvenle demirlemişti.'
      },
      {
        id: 16,
        grade: 4,
        gradeLabel: '4. Sınıf',
        category: 'Masal',
        emoji: '🧓',
        title: 'Keloğlan ile Dev Çınarın Bilmecesi',
        color: 'from-amber-700 to-yellow-800',
        summary: 'Köyün kuruyan pınarını kurtarmak için akıl ve sabırla bilmece çözen Keloğlan.',
        content: 'Bir varmış bir yokmuş, evvel zaman içinde köylerin birinde iyi kalpli ve pratik zekalı bir Keloğlan yaşarmış. Bir yaz mevsiminde köyün tek su kaynağı olan ulu pınar birdenbire kurumuş. Köylüler çaresiz kalmış. Keloğlan heybesine biraz ekmek ve peynir koyup Kaf Dağı nın eteğindeki bin yıllık Bilge Çınar ağacına doğru yola koyulmuş. Günlerce yürümüş. Çınar ağacının huzuruna vardığında ağacın gür yaprakları hışırdamış ve ona üç zorlu bilmece sormuş. Keloğlan kibirle değil, alçakgönüllülük ve derin sevgiyle düşünerek her üç bilmeceye de doğru cevap vermiş. Bilge Çınar köklerini oynatarak yer altındaki gizli su damarını serbest bırakmış ve köy yeniden bereketli sulara kavuşmuş.'
      },
      {
        id: 17,
        grade: 4,
        gradeLabel: '4. Sınıf',
        category: 'Orman',
        emoji: '🌿',
        title: 'Amazon Ormanlarındaki Gizli Şelale',
        color: 'from-green-700 to-emerald-900',
        summary: 'Biyolog bir ekibin yağmur ormanlarında keşfettiği şifalı gizli gölet.',
        content: 'Dünyanın akciğerleri sayılan Amazon Yağmur Ormanları, henüz ayak basılmamış sayısız gizem barındırıyordu. Genç araştırmacı Defne ve ekibi, yerli rehberlerin fısıldadığı Kristal Şelale yi bulmak için nehir boyunca kanolarıyla ilerlediler. Dev sarmaşıklar, rengarenk papağanlar ve ağaçlarda zıplayan sevimli maymunlar onlara eşlik ediyordu. Üç günlük zorlu yürüyüşün ardından gürleyen bir su sesi duydular. Sık yaprakların arasından geçtiklerinde karşılarında gökkuşağı damlaları saçan devasa bir şelale duruyordu. Şelalenin döküldüğü turkuaz gölette daha önce bilim dünyasının hiç görmediği parlak pullu balıklar yüzüyordu.'
      },
      {
        id: 18,
        grade: 4,
        gradeLabel: '4. Sınıf',
        category: 'Bilim',
        emoji: '☄️',
        title: 'Göktaşı Avcısı İki Meraklı Araştırmacı',
        color: 'from-blue-800 to-slate-900',
        summary: 'Tuz Gölü nde düşen göktaşının izini süren teleskop meraklısı gençler.',
        content: 'Gece gökyüzünde parlak bir ateş topu halinde süzülen meteor, Tuz Gölü nün ıssız beyaz düzlüğüne düşmüştü. Astronomi kulübünden Kerem ile Aslı, hemen koordinatları belirleyip manyetik dedektörlerini aldılar. Uçsuz bucaksız beyaz tuz örtüsü üzerinde sabırla arama yaptılar. Birkaç saat sonra dedektör güçlü bir sinyal verdi. Tuz kabuğunun altında, üzeri yanık kabukla kaplı, yoğun demir ve nikel içeren siyah bir taş parçası buldular. Bu taş milyarlarca yıl önce Güneş Sistemi nin ilk oluşumundan arta kalmıştı. Üniversitedeki bilim insanları buldukları bu parçayı büyük bir heyecanla incelemeye aldılar.'
      },
      {
        id: 19,
        grade: 4,
        gradeLabel: '4. Sınıf',
        category: 'Okyanus',
        emoji: '🐋',
        title: 'Mavi Balinanın Okyanus Boyunca Şarkısı',
        color: 'from-blue-700 to-indigo-950',
        summary: 'Kutup denizlerinden sıcak lagünlere göç eden dev mavi balinanın ezgisi.',
        content: 'Mavi balinalar yeryüzünde yaşamış en büyük canlılardı. Okyanusun derinliklerinde yankılanan düşük frekanslı şarkıları yüzlerce kilometre öteden diğer balinalar tarafından duyulabilirdi. Okyanusun dev bekçisi Maviş, kutup denizlerindeki zengin besin alanlarından güneyin ılık lagünlerine doğru göç ediyordu. Yanında bu yıl doğan küçük yavrusu da vardı. Anne balina derin soluklarla su püskürtüyor, yavrusuna akıntıları ve tehlikeli kayalıkları şarkısıyla anlatıyordu. Okyanusun derinliklerinde yankılanan bu kadim melodi, doğanın kusursuz uyumunun en büyüleyici kanıtıydı.'
      }
    ];

    // ==========================================
    // GAMIFIED PYRAMID DATABASE (LEVELS)
    // ==========================================
    const PYRAMIDS = [
      {
        level: 1,
        title: 'Ormanın Neşeli Kuşları',
        grade: '1. Sınıf',
        rows: [
          ['Kuş'],
          ['Kuş', 'uçtu'],
          ['Kuş', 'ağaca', 'uçtu'],
          ['Küçük', 'kuş', 'ağaca', 'uçtu'],
          ['Küçük', 'kuş', 'yeşil', 'ağaca', 'uçtu'],
          ['Küçük', 'kuş', 'yüksek', 'yeşil', 'ağaca', 'uçtu']
        ]
      },
      {
        level: 2,
        title: 'Rüzgarlı Kırmızı Uçurtma',
        grade: '1-2. Sınıf',
        rows: [
          ['Uç'],
          ['Uç', 'yüksel'],
          ['Uçurtma', 'göğe', 'yüksel'],
          ['Kırmızı', 'uçurtma', 'göğe', 'yüksel'],
          ['Kırmızı', 'uçurtma', 'mavi', 'göğe', 'yüksel'],
          ['Sevimli', 'kırmızı', 'uçurtma', 'mavi', 'göğe', 'yüksel']
        ]
      },
      {
        level: 3,
        title: 'Denizdeki Neşeli Gemi',
        grade: '2. Sınıf',
        rows: [
          ['Gemi'],
          ['Büyük', 'gemi'],
          ['Büyük', 'beyaz', 'gemi'],
          ['Büyük', 'beyaz', 'gemi', 'yüzüyor'],
          ['Büyük', 'beyaz', 'gemi', 'denizde', 'yüzüyor'],
          ['Büyük', 'beyaz', 'gemi', 'mavi', 'denizde', 'yüzüyor'],
          ['Cesur', 'büyük', 'beyaz', 'gemi', 'mavi', 'denizde', 'yüzüyor']
        ]
      },
      {
        level: 4,
        title: 'Uzay Yolcusu Astronot',
        grade: '3. Sınıf',
        rows: [
          ['Yıldız'],
          ['Parlak', 'yıldız'],
          ['Parlak', 'kutup', 'yıldızı'],
          ['Gece', 'parlak', 'kutup', 'yıldızı'],
          ['Karanlık', 'gecede', 'parlak', 'kutup', 'yıldızı'],
          ['Sessiz', 'karanlık', 'gecede', 'parlak', 'kutup', 'yıldızı'],
          ['Sonsuz', 'sessiz', 'karanlık', 'gecede', 'parlak', 'kutup', 'yıldızı']
        ]
      },
      {
        level: 5,
        title: 'Bilge Ağacın Orman Masalı',
        grade: '4. Sınıf',
        rows: [
          ['Ağaç'],
          ['Yaşlı', 'ağaç'],
          ['Ulu', 'yaşlı', 'ağaç'],
          ['Ulu', 'yaşlı', 'çınar', 'ağacı'],
          ['Ormandaki', 'ulu', 'yaşlı', 'çınar', 'ağacı'],
          ['Kuşlarla', 'dolu', 'ulu', 'yaşlı', 'çınar', 'ağacı'],
          ['Yemyeşil', 'kuşlarla', 'dolu', 'ulu', 'yaşlı', 'çınar', 'ağacı'],
          ['Göklere', 'uzanan', 'kuşlarla', 'dolu', 'ulu', 'yaşlı', 'çınar', 'ağacı']
        ]
      }
    ];

    // ==========================================
    // GLOBAL STATE
    // ==========================================
    let currentStory = STORIES[0];
    let selectedDuration = 60; // seconds
    let targetGrade = 1;
    let timerInterval = null;
    let remainingSeconds = 60;
    let timerRunning = false;
    let lastReadIndex = -1;
    let errorIndices = new Set();
    let clickMode = 'last_read'; // 'last_read' | 'error'
    let fontSize = 20;

    // Pyramid state
    let activePyramidIdx = 0;
    let activePyramidRow = 0;
    let pyramidAutoInterval = null;

    // Confirm Modal Pending Action
    let pendingConfirmAction = null;

    // Audio Synth
    let audioCtx = null;
    function playAudioTone(freq, dur = 0.08, type = 'sine') {
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + dur);
      } catch (e) {}
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================
    function init() {
      loadHistoryFromStorage();
      loadStory(STORIES[0]);
      renderPyramid(0);
      setupKeyboardControls();
    }

    function setupKeyboardControls() {
      window.addEventListener('keydown', (e) => {
        // Spacebar triggers pyramid row step if pyramid tab is visible
        const pyramidTab = document.getElementById('viewPyramid');
        if (!pyramidTab.classList.contains('hidden') && e.code === 'Space') {
          e.preventDefault();
          stepPyramidRow();
        }
      });
    }

    // ==========================================
    // STORY & TOKEN RENDERING
    // ==========================================
    function loadStory(story) {
      currentStory = story;
      document.getElementById('selectedStoryTitle').textContent = story.title;
      document.getElementById('selectedStoryEmoji').textContent = story.emoji;
      
      // Update Grade selector to match
      if (story.grade) {
        document.getElementById('gradeSelect').value = String(story.grade);
        changeGradeTarget(story.grade);
      }

      document.getElementById('customTextContainer').classList.add('hidden');
      renderStoryTokens(story.content);
      resetTimer();
    }

    function renderStoryTokens(text) {
      const container = document.getElementById('storyContainer');
      container.innerHTML = '';
      lastReadIndex = -1;
      errorIndices.clear();

      const words = text.trim().split(/\\s+/);
      document.getElementById('statTotalWords').textContent = '/ ' + words.length;

      words.forEach((word, idx) => {
        const span = document.createElement('span');
        span.className = 'word-token';
        span.textContent = word;
        span.dataset.index = idx;
        span.onclick = () => handleWordClick(idx);
        container.appendChild(span);
      });

      updateTokensVisual();
      updateLiveMetrics();
    }

    function handleWordClick(idx) {
      playAudioTone(880, 0.05);

      if (clickMode === 'last_read') {
        if (lastReadIndex === idx) {
          lastReadIndex = -1;
        } else {
          lastReadIndex = idx;
        }
      } else if (clickMode === 'error') {
        if (errorIndices.has(idx)) {
          errorIndices.delete(idx);
        } else {
          errorIndices.add(idx);
        }
      }

      updateTokensVisual();
      updateLiveMetrics();
    }

    function updateTokensVisual() {
      const tokens = document.querySelectorAll('.word-token');
      tokens.forEach((token, idx) => {
        token.classList.remove('word-read', 'word-unread', 'word-last-read', 'word-error');

        if (errorIndices.has(idx)) {
          token.classList.add('word-error');
        }

        if (lastReadIndex !== -1) {
          if (idx < lastReadIndex) {
            token.classList.add('word-read');
          } else if (idx === lastReadIndex) {
            token.classList.add('word-last-read');
          } else {
            token.classList.add('word-unread');
          }
        }
      });
    }

    function resetLastReadWord() {
      lastReadIndex = -1;
      errorIndices.clear();
      updateTokensVisual();
      updateLiveMetrics();
    }

    function setClickMode(mode) {
      clickMode = mode;
      const readBtn = document.getElementById('modeLastReadBtn');
      const errBtn = document.getElementById('modeErrorBtn');
      if (mode === 'last_read') {
        readBtn.className = 'px-2.5 py-1 text-xs font-black rounded-lg bg-white text-emerald-800 shadow-xs transition cursor-pointer flex items-center gap-1';
        errBtn.className = 'px-2.5 py-1 text-xs font-bold rounded-lg text-slate-600 hover:text-rose-700 transition cursor-pointer flex items-center gap-1';
      } else {
        errBtn.className = 'px-2.5 py-1 text-xs font-black rounded-lg bg-white text-rose-800 shadow-xs transition cursor-pointer flex items-center gap-1';
        readBtn.className = 'px-2.5 py-1 text-xs font-bold rounded-lg text-slate-600 hover:text-emerald-800 transition cursor-pointer flex items-center gap-1';
      }
    }

    // ==========================================
    // TIMER & STOPWATCH LOGIC
    // ==========================================
    function setTimerDuration(sec) {
      selectedDuration = sec;
      ['0', '30', '60', '120'].forEach(s => {
        const btn = document.getElementById('durBtn_' + s);
        if (btn) {
          if (s === String(sec)) {
            btn.className = 'px-2.5 py-1 text-xs font-black rounded-lg bg-white text-amber-950 shadow-xs transition cursor-pointer';
          } else {
            btn.className = 'px-2.5 py-1 text-xs font-bold rounded-lg text-slate-600 hover:text-slate-900 transition cursor-pointer';
          }
        }
      });
      resetTimer();
    }

    function formatTime(s) {
      const m = Math.floor(s / 60);
      const rem = s % 60;
      return String(m).padStart(2, '0') + ':' + String(rem).padStart(2, '0');
    }

    function toggleTimer() {
      if (timerRunning) {
        pauseTimer();
      } else {
        startTimer();
      }
    }

    function startTimer() {
      if (timerRunning) return;
      timerRunning = true;
      document.getElementById('startBtn').innerHTML = '⏸️ Duraklat';
      document.getElementById('startBtn').className = 'touch-btn bg-amber-200 text-amber-950 hover:bg-amber-100 font-black rounded-2xl py-3 shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer';

      playAudioTone(520, 0.1);

      timerInterval = setInterval(() => {
        if (selectedDuration > 0) {
          remainingSeconds--;
          document.getElementById('timerDisplay').textContent = formatTime(remainingSeconds);
          const percent = (remainingSeconds / selectedDuration) * 100;
          document.getElementById('timerProgress').style.width = Math.max(0, percent) + '%';

          if (remainingSeconds <= 0) {
            timerFinished();
          }
        } else {
          // Free running count up
          remainingSeconds++;
          document.getElementById('timerDisplay').textContent = formatTime(remainingSeconds);
          document.getElementById('timerProgress').style.width = '100%';
        }
        updateLiveMetrics();
      }, 1000);
    }

    function pauseTimer() {
      timerRunning = false;
      clearInterval(timerInterval);
      document.getElementById('startBtn').innerHTML = '▶️ Devam Et';
      document.getElementById('startBtn').className = 'touch-btn bg-white text-amber-950 hover:bg-amber-50 font-black rounded-2xl py-3 shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer';
    }

    function resetTimer() {
      pauseTimer();
      remainingSeconds = selectedDuration > 0 ? selectedDuration : 0;
      document.getElementById('timerDisplay').textContent = formatTime(remainingSeconds);
      document.getElementById('timerProgress').style.width = '100%';
      document.getElementById('startBtn').innerHTML = '▶️ Başlat';
      updateLiveMetrics();
    }

    function timerFinished() {
      pauseTimer();
      playAudioTone(880, 0.3, 'triangle');
      setTimeout(() => playAudioTone(1100, 0.4, 'triangle'), 300);

      if (typeof confetti === 'function') {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.5 } });
      }

      // If user hasn't selected an end word yet, highlight the text container to invite them
      if (lastReadIndex === -1) {
        const cont = document.getElementById('storyContainer');
        cont.classList.add('ring-4', 'ring-amber-400');
        setTimeout(() => cont.classList.remove('ring-4', 'ring-amber-400'), 2500);
      }
    }

    // ==========================================
    // LIVE METRICS & MEB CALCULATIONS
    // ==========================================
    function calculateMetrics() {
      const tokens = document.querySelectorAll('.word-token');
      const totalWords = tokens.length;
      
      const wordsRead = lastReadIndex !== -1 ? lastReadIndex + 1 : 0;
      const errorsCount = errorIndices.size;
      const netWords = Math.max(0, wordsRead - errorsCount);

      // Letter count
      let lettersRead = 0;
      tokens.forEach((t, i) => {
        if (i <= lastReadIndex) {
          lettersRead += t.textContent.replace(/[^a-zA-Z0-9çÇğĞıİöÖşŞüÜ]/g, '').length;
        }
      });

      // Elapsed seconds calculation
      let elapsed = 0;
      if (selectedDuration > 0) {
        elapsed = selectedDuration - remainingSeconds;
      } else {
        elapsed = remainingSeconds;
      }
      if (elapsed <= 0) elapsed = 1;

      // Speed in Words per Minute & Letters per Minute
      const wpm = Math.round((netWords / elapsed) * 60);
      const cpm = Math.round((lettersRead / elapsed) * 60);

      // Accuracy
      const accuracy = wordsRead > 0 ? Math.max(0, Math.round(((wordsRead - errorsCount) / wordsRead) * 100)) : 100;

      return { totalWords, wordsRead, errorsCount, netWords, lettersRead, elapsed, wpm, cpm, accuracy };
    }

    function updateLiveMetrics() {
      const m = calculateMetrics();
      document.getElementById('statWordsRead').textContent = m.wordsRead;
      document.getElementById('statLettersRead').textContent = m.lettersRead;
      document.getElementById('statWpm').textContent = m.wpm;
      document.getElementById('statCpm').textContent = m.cpm;
      document.getElementById('statErrorsCount').textContent = m.errorsCount;
      document.getElementById('liveAccuracyBadge').textContent = '%' + m.accuracy + ' Doğruluk';
    }

    function changeGradeTarget(grade) {
      targetGrade = parseInt(grade, 10);
      const label = document.getElementById('targetSpeedLabel');
      const targets = {
        1: 'Hedef: Dakikada 45–65 Kelime',
        2: 'Hedef: Dakikada 65–90 Kelime',
        3: 'Hedef: Dakikada 80–110 Kelime',
        4: 'Hedef: Dakikada 100–130 Kelime'
      };
      label.innerHTML = 'Hedef: <strong>' + (targets[targetGrade] || 'Dakikada 45–65 Kelime') + '</strong>';
    }

    // ==========================================
    // REPORT MODAL & KARNE
    // ==========================================
    let lastGeneratedSession = null;

    function finishAndAnalyze() {
      const m = calculateMetrics();
      if (m.wordsRead === 0) {
        alert('Lütfen okuduğunuz son kelimeye dokunarak nerede kaldığınızı işaretleyin.');
        return;
      }

      document.getElementById('repWords').textContent = m.wordsRead;
      document.getElementById('repLetters').textContent = m.lettersRead;
      document.getElementById('repWpm').textContent = m.wpm + ' Kelime/Dk';
      document.getElementById('repCpm').textContent = m.cpm + ' Harf/Dk';
      document.getElementById('repElapsed').textContent = m.elapsed + ' sn';
      document.getElementById('repAccuracy').textContent = '%' + m.accuracy;

      // Pedagogical Feedback Logic
      const ranges = {
        1: { min: 45, max: 65 },
        2: { min: 65, max: 90 },
        3: { min: 80, max: 110 },
        4: { min: 100, max: 130 }
      };
      const r = ranges[targetGrade] || ranges[1];
      let badge = 'Harika İlerleme ⭐';
      let feedback = '';

      if (m.wpm < r.min) {
        badge = 'Geliştirilmeli 🌱';
        feedback = targetGrade + '. Sınıf hedefi dakikada ' + r.min + '-' + r.max + ' kelimedir. Bol bol hece ve göz genişletme piramidi çalışarak hızını kısa sürede artırabilirsin!';
      } else if (m.wpm <= r.max) {
        badge = 'Hedefe Tam Uygun 🎯';
        feedback = 'Tebrikler! ' + targetGrade + '. Sınıf MEB hedeflerine tam uygun, dengeli ve anlaşılır bir okuma temposuna sahipsin.';
      } else {
        badge = 'Üstün Hız & Akıcılık 🚀';
        feedback = 'Harikasın! Sınıf düzeyinin oldukça üzerinde, çok akıcı ve dikkatli bir okuma hızı yakaladın. Başarılarının devamını dileriz!';
      }

      document.getElementById('repBadge').textContent = badge;
      document.getElementById('repFeedback').textContent = feedback;

      // Prepare session object
      const tokens = document.querySelectorAll('.word-token');
      const lastWordText = (lastReadIndex >= 0 && tokens[lastReadIndex]) ? tokens[lastReadIndex].textContent : '';

      lastGeneratedSession = {
        id: 'sess_' + Date.now(),
        dateStr: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        storyTitle: currentStory.title,
        gradeLevel: targetGrade + '. Sınıf',
        durationLabel: selectedDuration > 0 ? selectedDuration + ' sn' : m.elapsed + ' sn',
        elapsedSeconds: m.elapsed,
        wordsRead: m.wordsRead,
        lettersRead: m.lettersRead,
        totalWordsInStory: m.totalWords,
        errorsCount: m.errorsCount,
        wpm: m.wpm,
        cpm: m.cpm,
        accuracy: m.accuracy,
        lastWord: lastWordText,
        badge: badge,
        feedback: feedback
      };

      document.getElementById('reportModal').classList.remove('hidden');
      document.getElementById('saveBtnText').textContent = 'Bu Analizi Gelişim Karneme Kaydet';
      document.getElementById('saveAnalysisBtn').className = 'touch-btn w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95';
      document.getElementById('saveAnalysisBtn').disabled = false;
    }

    function closeReportModal() {
      document.getElementById('reportModal').classList.add('hidden');
    }

    // ==========================================
    // STORY LIBRARY MODAL LOGIC
    // ==========================================
    function openLibraryModal() {
      renderLibraryGrid(STORIES);
      document.getElementById('libraryModal').classList.remove('hidden');
    }

    function closeLibraryModal() {
      document.getElementById('libraryModal').classList.add('hidden');
    }

    function renderLibraryGrid(storiesList) {
      const grid = document.getElementById('libraryGrid');
      grid.innerHTML = '';

      storiesList.forEach(s => {
        const wordCount = s.content.trim().split(/\\s+/).length;
        const estMin = Math.round((wordCount / 60) * 10) / 10;
        const card = document.createElement('div');
        card.className = 'p-4 rounded-3xl bg-white border border-slate-200/90 hover:border-amber-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between group';
        card.innerHTML = 
          '<div>' +
            '<div class="flex items-center justify-between mb-2">' +
              '<div class="w-12 h-12 rounded-2xl bg-gradient-to-br ' + (s.color || 'from-amber-400 to-orange-500') + ' text-white flex items-center justify-center text-2xl shadow-xs group-hover:scale-105 transition">' +
                s.emoji +
              '</div>' +
              '<div class="flex items-center gap-1.5">' +
                '<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-200">' + s.gradeLabel + '</span>' +
                '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">' + s.category + '</span>' +
              '</div>' +
            '</div>' +
            '<h4 class="text-sm font-black text-slate-900 leading-snug group-hover:text-amber-600 transition">' + s.title + '</h4>' +
            '<p class="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">' + s.summary + '</p>' +
          '</div>' +
          '<div class="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">' +
            '<span>' + wordCount + ' Kelime • ~' + estMin + ' dk</span>' +
            '<span class="text-amber-600 font-bold group-hover:translate-x-1 transition">Bu Metni Oku ➔</span>' +
          '</div>';
        card.onclick = () => {
          loadStory(s);
          closeLibraryModal();
        };
        grid.appendChild(card);
      });
    }

    function filterLibrary(gradeOrType) {
      ['all', '1', '2', '3', '4', 'custom'].forEach(t => {
        const btn = document.getElementById('libFilter_' + t);
        if (btn) {
          if (t === gradeOrType) {
            btn.className = 'px-3 py-1 rounded-xl text-xs font-black bg-amber-500 text-white shadow-2xs transition cursor-pointer';
          } else {
            btn.className = 'px-3 py-1 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-amber-50 transition cursor-pointer';
          }
        }
      });

      if (gradeOrType === 'custom') {
        closeLibraryModal();
        openCustomTextMode();
        return;
      }

      if (gradeOrType === 'all') {
        renderLibraryGrid(STORIES);
      } else {
        const filtered = STORIES.filter(s => s.grade === parseInt(gradeOrType, 10));
        renderLibraryGrid(filtered);
      }
    }

    function searchLibrary(query) {
      const q = query.trim().toLowerCase();
      if (!q) {
        renderLibraryGrid(STORIES);
        return;
      }
      const filtered = STORIES.filter(s => s.title.toLowerCase().includes(q) || s.summary.toLowerCase().includes(q) || s.content.toLowerCase().includes(q));
      renderLibraryGrid(filtered);
    }

    function openCustomTextMode() {
      document.getElementById('customTextContainer').classList.remove('hidden');
      document.getElementById('selectedStoryTitle').textContent = 'Özel Metin';
      document.getElementById('selectedStoryEmoji').textContent = '✏️';
    }

    function applyCustomText() {
      const txt = document.getElementById('customTextInput').value.trim();
      if (!txt) {
        alert('Lütfen bir metin yazınız veya yapıştırınız.');
        return;
      }
      currentStory = {
        id: 'custom',
        grade: targetGrade,
        gradeLabel: targetGrade + '. Sınıf',
        category: 'Özel',
        emoji: '✏️',
        title: 'Özel Eklenen Metin',
        summary: 'Kullanıcı tarafından yapıştırılan okuma metni',
        content: txt
      };
      renderStoryTokens(txt);
      document.getElementById('customTextContainer').classList.add('hidden');
      resetTimer();
    }

    // ==========================================
    // GAMIFIED PYRAMID ENGINE
    // ==========================================
    function renderPyramid(idx) {
      activePyramidIdx = idx % PYRAMIDS.length;
      activePyramidRow = 0;
      const p = PYRAMIDS[activePyramidIdx];

      document.getElementById('pyramidTitle').textContent = p.title;
      document.getElementById('pyramidLevelBadge').textContent = p.level + '. Seviye (' + p.grade + ')';

      const container = document.getElementById('pyramidRows');
      container.innerHTML = '';

      p.rows.forEach((words, rowIdx) => {
        const div = document.createElement('div');
        div.className = 'pyramid-row px-5 py-2.5 rounded-2xl border border-amber-200/80 bg-white font-bold text-slate-800 text-center shadow-xs cursor-pointer select-none';
        div.style.fontSize = (fontSize + rowIdx * 2) + 'px';
        div.id = 'pyr_row_' + rowIdx;

        // Insert red center eye dot between middle words to train peripheral vision
        if (words.length > 1) {
          const mid = Math.floor(words.length / 2);
          const leftPart = words.slice(0, mid).join(' ');
          div.innerHTML = leftPart + ' <span class="pyramid-center-dot"></span> ' + rightPart;
        } else {
          div.textContent = words[0];
        }

        div.onclick = () => focusPyramidRow(rowIdx);
        container.appendChild(div);
      });

      focusPyramidRow(0);
    }

    function focusPyramidRow(rowIdx) {
      activePyramidRow = rowIdx;
      const p = PYRAMIDS[activePyramidIdx];

      // Play soft harp sound ascending in pitch
      const noteFreqs = [440, 494, 554, 587, 659, 740, 831, 880];
      playAudioTone(noteFreqs[rowIdx % noteFreqs.length], 0.1, 'sine');

      p.rows.forEach((_, i) => {
        const rowEl = document.getElementById('pyr_row_' + i);
        if (!rowEl) return;
        rowEl.classList.remove('active', 'completed');
        if (i < rowIdx) {
          rowEl.classList.add('completed');
        } else if (i === rowIdx) {
          rowEl.classList.add('active');
        }
      });
    }

    function stepPyramidRow() {
      const p = PYRAMIDS[activePyramidIdx];
      if (activePyramidRow < p.rows.length - 1) {
        focusPyramidRow(activePyramidRow + 1);
      } else {
        // Level Complete!
        playAudioTone(980, 0.2);
        setTimeout(() => playAudioTone(1320, 0.3), 150);

        if (typeof confetti === 'function') {
          confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
        }

        setTimeout(() => {
          renderPyramid(activePyramidIdx + 1);
        }, 800);
      }
    }

    function nextPyramidExercise() {
      playAudioTone(660, 0.05);
      renderPyramid(activePyramidIdx + 1);
    }

    function togglePyramidAutoPlay() {
      const btn = document.getElementById('pyramidAutoBtn');
      const icon = document.getElementById('pyramidAutoIcon');
      const label = document.getElementById('pyramidAutoLabel');

      if (pyramidAutoInterval) {
        clearInterval(pyramidAutoInterval);
        pyramidAutoInterval = null;
        icon.textContent = '▶️';
        label.textContent = 'Otomatik Başlat';
        btn.className = 'touch-btn px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5';
      } else {
        icon.textContent = '⏸️';
        label.textContent = 'Durdur';
        btn.className = 'touch-btn px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5';
        pyramidAutoInterval = setInterval(stepPyramidRow, 1400);
      }
    }

    // ==========================================
    // HISTORY PERSISTENCE & IN-PAGE CONFIRM MODAL
    // ==========================================
    const STORAGE_KEY = 'oxonom_reading_history_v2';
    let readingHistory = [];

    function loadHistoryFromStorage() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          readingHistory = JSON.parse(raw);
        } else {
          // Default initial demonstration record
          readingHistory = [
            {
              id: 'read_seed_1',
              dateStr: 'Dün, 16:30',
              timestamp: Date.now() - 86400000,
              storyTitle: 'Güneşli Bir Orman Gezisi',
              gradeLevel: '1. Sınıf',
              durationLabel: '60 sn',
              elapsedSeconds: 60,
              wordsRead: 58,
              lettersRead: 312,
              totalWordsInStory: 95,
              errorsCount: 2,
              wpm: 56,
              cpm: 312,
              accuracy: 96,
              lastWord: 'piknik',
              badge: 'Hedefe Tam Uygun 🌟',
              feedback: '1. sınıf MEB standartlarına tam uygun, akıcı ve dengeli bir okuma temposu.'
            }
          ];
          saveHistoryToStorage();
        }
      } catch (err) {
        console.warn('Storage read failed:', err);
      }
      updateHistoryBadge();
    }

    function saveHistoryToStorage() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(readingHistory));
      } catch (err) {
        console.warn('Storage save failed:', err);
      }
      updateHistoryBadge();
    }

    function updateHistoryBadge() {
      const count = readingHistory.length;
      const badge = document.getElementById('historyBadgeCount');
      if (count > 0) {
        badge.textContent = count;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }

    function saveCurrentAnalysis() {
      if (!lastGeneratedSession) return;
      readingHistory.unshift(lastGeneratedSession);
      saveHistoryToStorage();

      try {
        window.parent.postMessage({
          type: 'OXONOM_READING_SAVED',
          payload: lastGeneratedSession
        }, '*');
      } catch (e) {}

      playAudioTone(1050, 0.2);
      document.getElementById('saveBtnText').textContent = '✅ Analiz Başarıyla Kaydedildi!';
      document.getElementById('saveAnalysisBtn').className = 'touch-btn w-full py-3 bg-slate-900 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-default';
      document.getElementById('saveAnalysisBtn').disabled = true;

      if (typeof confetti === 'function') {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      }

      setTimeout(() => {
        closeReportModal();
        switchNavTab('history');
      }, 900);
    }

    // Custom In-Page Confirmation (Safe for iframes without window.confirm)
    function openDeleteConfirmModal(id) {
      pendingConfirmAction = () => {
        readingHistory = readingHistory.filter(item => item.id !== id);
        saveHistoryToStorage();
        renderHistoryFeed();
      };
      document.getElementById('confirmDialogTitle').textContent = 'Okuma Kaydını Sil';
      document.getElementById('confirmDialogMessage').textContent = 'Bu okuma kaydını silmek istediğinize emin misiniz?';
      document.getElementById('confirmDialogModal').classList.remove('hidden');
    }

    function openClearHistoryModal() {
      pendingConfirmAction = () => {
        readingHistory = [];
        saveHistoryToStorage();
        renderHistoryFeed();
      };
      document.getElementById('confirmDialogTitle').textContent = 'Tüm Geçmişi Temizle';
      document.getElementById('confirmDialogMessage').textContent = 'Tüm geçmiş okuma analizlerinizi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.';
      document.getElementById('confirmDialogModal').classList.remove('hidden');
    }

    function closeConfirmModal() {
      pendingConfirmAction = null;
      document.getElementById('confirmDialogModal').classList.add('hidden');
    }

    function executePendingConfirmAction() {
      if (typeof pendingConfirmAction === 'function') {
        pendingConfirmAction();
      }
      closeConfirmModal();
    }

    function renderHistoryFeed() {
      const container = document.getElementById('historyCardsContainer');
      container.innerHTML = '';

      if (readingHistory.length === 0) {
        container.innerHTML = 
          '<div class="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-3">' +
            '<div class="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center text-3xl">📖</div>' +
            '<h3 class="text-base font-black text-slate-800">Henüz Kayıtlı Okuma Analiziniz Yok</h3>' +
            '<p class="text-xs text-slate-500 max-w-sm mx-auto">Bir okuma seansı başlatıp bitirdiğiniz kelimeyi işaretleyin ve "Analizi Kaydet" butonuna dokunun.</p>' +
            '<button onclick="switchNavTab(\\'reading\\')" class="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer">Hemen Okumaya Başla</button>' +
          '</div>';
        document.getElementById('histAvgWpm').textContent = '0 Kelime/Dk';
        document.getElementById('histMaxWpm').textContent = '0 Kelime/Dk';
        document.getElementById('histTotalWords').textContent = '0';
        document.getElementById('histTotalLetters').textContent = '0';
        document.getElementById('histAvgAcc').textContent = '%0';
        document.getElementById('histTotalSessions').textContent = '0';
        return;
      }

      let totalWords = 0;
      let totalLetters = 0;
      let totalWpm = 0;
      let maxWpm = 0;
      let totalAcc = 0;

      readingHistory.forEach(item => {
        totalWords += item.wordsRead || 0;
        totalLetters += item.lettersRead || 0;
        totalWpm += item.wpm || 0;
        if ((item.wpm || 0) > maxWpm) maxWpm = item.wpm;
        totalAcc += item.accuracy || 100;
      });

      const count = readingHistory.length;
      document.getElementById('histAvgWpm').textContent = Math.round(totalWpm / count) + ' Kelime/Dk';
      document.getElementById('histMaxWpm').textContent = maxWpm + ' Kelime/Dk';
      document.getElementById('histTotalWords').textContent = totalWords;
      document.getElementById('histTotalLetters').textContent = totalLetters;
      document.getElementById('histAvgAcc').textContent = '%' + Math.round(totalAcc / count);
      document.getElementById('histTotalSessions').textContent = count;

      readingHistory.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-3';
        card.innerHTML = 
          '<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">' +
            '<div>' +
              '<div class="flex items-center gap-2">' +
                '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-200">' + (item.gradeLevel || '1. Sınıf') + '</span>' +
                '<h4 class="text-sm font-black text-slate-900">' + item.storyTitle + '</h4>' +
              '</div>' +
              '<span class="text-[11px] text-slate-400 font-medium">Tarih: ' + item.dateStr + ' • Süre: ' + item.durationLabel + '</span>' +
            '</div>' +
            '<div class="flex items-center gap-2 self-start sm:self-auto">' +
              '<span class="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-xs">' + item.badge + '</span>' +
              '<button onclick="openDeleteConfirmModal(\\'' + item.id + '\\')" title="Bu kaydı sil" class="p-1.5 rounded-xl text-slate-300 hover:text-red-600 hover:bg-red-50 transition cursor-pointer">🗑️</button>' +
            '</div>' +
          '</div>' +
          '<div class="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">' +
            '<div class="p-2 rounded-xl bg-slate-50 border border-slate-100"><span class="text-[10px] font-bold text-slate-400 block">Okunan Kelime</span><span class="text-base font-black text-slate-800">' + item.wordsRead + '</span></div>' +
            '<div class="p-2 rounded-xl bg-indigo-50/50 border border-indigo-100"><span class="text-[10px] font-bold text-indigo-500 block">Okunan Harf</span><span class="text-base font-black text-indigo-900">' + item.lettersRead + '</span></div>' +
            '<div class="p-2 rounded-xl bg-emerald-50/50 border border-emerald-100"><span class="text-[10px] font-bold text-emerald-600 block">Kelime Hızı</span><span class="text-base font-black text-emerald-700">' + item.wpm + ' Kelime/Dk</span></div>' +
            '<div class="p-2 rounded-xl bg-amber-50/50 border border-amber-100"><span class="text-[10px] font-bold text-amber-600 block">Harf Hızı</span><span class="text-base font-black text-amber-800">' + item.cpm + ' Harf/Dk</span></div>' +
            '<div class="p-2 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1"><span class="text-[10px] font-bold text-slate-400 block">Doğruluk</span><span class="text-base font-black text-slate-700">%' + item.accuracy + '</span></div>' +
          '</div>' +
          '<div class="flex items-center justify-between pt-1 text-[11px] text-slate-500">' +
            '<span>İşaretlenen Son Kelime: <strong class="text-slate-800 font-bold">\\"' + item.lastWord + '\\"</strong></span>' +
            '<span class="italic text-amber-800 font-medium truncate max-w-xs sm:max-w-md">' + item.feedback + '</span>' +
          '</div>';
        container.appendChild(card);
      });
    }

    // ==========================================
    // NAVIGATION TABS & FONT SIZE
    // ==========================================
    function switchNavTab(tab) {
      document.getElementById('viewReading').classList.add('hidden');
      document.getElementById('viewHistory').classList.add('hidden');
      document.getElementById('viewPyramid').classList.add('hidden');

      const tabs = ['reading', 'history', 'pyramid'];
      tabs.forEach(t => {
        const btn = document.getElementById('navTab' + t.charAt(0).toUpperCase() + t.slice(1));
        if (btn) {
          if (t === tab) {
            btn.className = 'touch-btn px-3 py-1.5 rounded-xl bg-white text-amber-950 shadow-xs transition cursor-pointer flex items-center gap-1.5';
          } else {
            btn.className = 'touch-btn px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 transition cursor-pointer flex items-center gap-1.5';
          }
        }
      });

      if (tab === 'reading') {
        document.getElementById('viewReading').classList.remove('hidden');
      } else if (tab === 'history') {
        document.getElementById('viewHistory').classList.remove('hidden');
        renderHistoryFeed();
      } else if (tab === 'pyramid') {
        document.getElementById('viewPyramid').classList.remove('hidden');
        renderPyramid(activePyramidIdx);
      }
    }

    function changeFontSize(delta) {
      fontSize = Math.max(16, Math.min(32, fontSize + delta));
      document.getElementById('fontSizeDisplay').textContent = fontSize + 'px';
      document.getElementById('storyContainer').style.fontSize = fontSize + 'px';
      renderPyramid(activePyramidIdx);
    }

    function startApp() {
      init();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', startApp);
    } else {
      startApp();
    }
    window.addEventListener('load', startApp);
  </script>
</body>
</html>
`;
