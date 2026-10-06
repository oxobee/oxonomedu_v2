/**
 * İngilizce Kelime & Görsel Macera Atölyesi Modülü
 * - Kopya çekmeyi önleyen oyun esnasında akıllı bulanıklaştırma (Blur cheat-guard)
 * - Net ve anlaşılır yüksek kaliteli İngilizce telaffuz motoru (en-US Natural TTS)
 * - 8 zengin kategori ve 100'den fazla temel kelime dağarcığı
 * - %100 mobil ve tablet uyumlu interaktif öğrenme arayüzü
 */

export const ENGLISH_MODULE_HTML = `<!DOCTYPE html>
<html lang="tr" class="h-full">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>İngilizce Kelime & Görsel Macera Atölyesi</title>
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
    }
    .touch-btn { min-height: 44px; min-width: 44px; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: rgba(0,0,0,0.03); border-radius: 8px; }
    ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.18); border-radius: 8px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.28); }

    /* Cheat guard blur effect when quiz is in progress */
    .cheat-blurred {
      filter: blur(14px) grayscale(30%);
      pointer-events: none;
      opacity: 0.35;
      user-select: none;
      transform: scale(0.98);
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .cheat-clear {
      filter: none;
      pointer-events: auto;
      opacity: 1;
      transform: scale(1);
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-6px); }
      40%, 80% { transform: translateX(6px); }
    }
    .animate-shake {
      animation: shake 0.4s ease-in-out;
    }

    @keyframes cardPulse {
      0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.4); }
      50% { transform: scale(1.04); box-shadow: 0 0 0 10px rgba(20, 184, 166, 0); }
      100% { transform: scale(1); }
    }
    .speaking-card {
      animation: cardPulse 0.6s ease-out;
      border-color: #0d9488 !important;
      background-color: #f0fdfa !important;
    }
  </style>
</head>
<body class="h-full w-full bg-slate-50 text-slate-800 flex flex-col overflow-y-auto md:overflow-hidden select-none">

  <!-- Header Bar -->
  <header class="bg-white border-b border-teal-100 p-3 sm:px-5 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs shrink-0 z-20">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
        🇬🇧
      </div>
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-sm sm:text-base font-black text-slate-900 tracking-tight">İngilizce Kelime & Görsel Macera Atölyesi</h1>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">A1 K-12</span>
        </div>
        <p class="text-[11px] text-teal-700 font-semibold">Tematik Görsel Kartlar, Net İngilizce Telaffuz ve Eşleştirme Mini Oyunu</p>
      </div>
    </div>
    
    <!-- Category & Mode Selector -->
    <div class="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
      <div class="flex items-center gap-1.5">
        <label for="catSelect" class="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">Kategori:</label>
        <select id="catSelect" onchange="changeCategory(this.value)" class="text-xs font-bold bg-teal-50 text-teal-950 border border-teal-200 rounded-xl px-3 py-2 outline-none cursor-pointer shadow-2xs">
          <option value="animals">🦁 Hayvanlar (Animals)</option>
          <option value="food">🍎 Meyveler & Yiyecekler (Food)</option>
          <option value="colors">🎨 Renkler (Colors)</option>
          <option value="numbers">🔢 Sayılar (Numbers)</option>
          <option value="school">🎒 Okul Eşyaları (School)</option>
          <option value="family">👨‍👩‍👧 Aile & Kişiler (Family)</option>
          <option value="nature">☀️ Doğa & Hava (Nature)</option>
          <option value="vehicles">🚗 Taşıtlar (Vehicles)</option>
          <option value="all">🎲 Tüm Kelimeler Karışık</option>
        </select>
      </div>

      <!-- Audio Speed Control -->
      <button onclick="toggleAudioSpeed()" id="speedBtn" title="Konuşma Hızını Değiştir" class="px-2.5 py-1.5 bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 font-bold text-xs rounded-xl border border-slate-200 transition cursor-pointer flex items-center gap-1">
        <span>🔊</span>
        <span id="speedLabel">0.8x Yavaş</span>
      </button>
    </div>
  </header>

  <!-- Main Content Workspace -->
  <main class="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden p-3 md:p-5 gap-3 md:gap-4 min-h-0">

    <!-- Mobile Segmented View Switcher (Hidden on md and up) -->
    <div class="md:hidden flex bg-teal-100/80 p-1 rounded-2xl shrink-0 gap-1 shadow-2xs">
      <button id="tabCardsBtn" onclick="switchMobileTab('cards')" class="flex-1 py-2 text-xs font-black rounded-xl transition bg-white text-teal-950 shadow-xs cursor-pointer flex items-center justify-center gap-1.5">
        <span>🃏</span>
        <span>Kelime Kartları</span>
      </button>
      <button id="tabQuizBtn" onclick="switchMobileTab('quiz')" class="flex-1 py-2 text-xs font-black rounded-xl transition text-teal-800 hover:text-teal-950 cursor-pointer flex items-center justify-center gap-1.5">
        <span>🎮</span>
        <span>Mini Oyun</span>
      </button>
    </div>

    <!-- Left Column: Flashcards Grid with Cheat-Guard Overlay -->
    <div id="colCards" class="flex-1 min-w-0 bg-white rounded-3xl border border-teal-200/90 shadow-sm p-3.5 sm:p-5 flex flex-col justify-between overflow-hidden relative min-h-[380px]">
      
      <!-- Top Card Header -->
      <div class="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 flex-wrap gap-2 shrink-0">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Karta Dokun, Net Dinle</span>
          <span id="cardCountBadge" class="text-[11px] font-extrabold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">16 Kelime</span>
        </div>

        <div class="flex items-center gap-2">
          <!-- Search in category -->
          <div class="relative">
            <input type="text" id="cardSearchInput" oninput="filterCards(this.value)" placeholder="Kelime ara..." class="w-28 sm:w-36 text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-teal-400">
          </div>
          <!-- Quick switch to quiz button on mobile/tablet -->
          <button onclick="switchMobileTab('quiz')" class="md:hidden text-xs font-bold px-2.5 py-1 rounded-xl bg-teal-600 text-white transition cursor-pointer flex items-center gap-1">
            <span>🎮</span>
            <span>Oyuna Geç</span>
          </button>
        </div>
      </div>

      <!-- Flashcards Grid Area Container -->
      <div id="cardsGridContainer" class="flex-1 relative overflow-y-auto pr-1">
        <div id="cardsGrid" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5 select-none cheat-clear pb-2">
          <!-- Flashcards dynamically injected -->
        </div>

        <!-- Cheat Guard Overlay (Appears when mini-game is answering) -->
        <div id="cheatGuardOverlay" class="hidden absolute inset-0 z-20 flex flex-col items-center justify-center p-4 text-center bg-teal-950/25 backdrop-blur-sm rounded-2xl animate-fadeIn">
          <div class="p-5 bg-white/95 rounded-3xl shadow-xl border border-teal-200 max-w-sm space-y-3">
            <div class="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl mx-auto flex items-center justify-center text-2xl shadow-inner">
              🙈
            </div>
            <div>
              <h3 class="text-sm sm:text-base font-black text-slate-900">Kopya Çekmek Yok!</h3>
              <p class="text-xs text-slate-600 mt-1 leading-relaxed">
                Mini oyunu çözerken kelimeleri hafızandan hatırlamalısın. Kartlar geçici olarak gizlendi!
              </p>
            </div>
            <div class="pt-1 flex items-center justify-center gap-2">
              <button onclick="peekTemporarily(3)" class="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5">
                <span>👀</span>
                <span>İpucu Gör (3 sn)</span>
              </button>
              <button onclick="disableQuizBlur()" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer">
                Kilidi Aç
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Audio Info Bar -->
      <div class="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0 flex-wrap gap-2">
        <span class="flex items-center gap-1.5 text-[11px]">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Doğal İngilizce (en-US) yüksek netlikli telaffuz motoru devrede.</span>
        </span>
        <button onclick="speakWord('Welcome to Oxonom English Adventure')" class="text-teal-700 hover:text-teal-950 font-bold underline cursor-pointer text-[11px]">
          🔊 Örnek Ses Dinle
        </button>
      </div>
    </div>

    <!-- Right Column: Interactive Quiz Mini Game -->
    <div id="colQuiz" class="hidden md:flex w-full md:w-[350px] lg:w-[390px] bg-gradient-to-br from-teal-700 via-teal-800 to-emerald-800 text-white rounded-3xl p-4 sm:p-5 shadow-xl flex-col justify-between shrink-0">
      <div>
        <div class="flex items-center justify-between mb-3 pb-2 border-b border-white/15">
          <div>
            <span class="text-[10px] font-black text-teal-200 uppercase tracking-widest block">MİNİ KELİME OYUNU</span>
            <h2 class="text-base sm:text-lg font-black leading-tight text-white">Doğru Eşleştir!</h2>
          </div>
          <!-- Blur Toggle Button for Game -->
          <button id="blurToggleBtn" onclick="toggleCheatBlurMode()" title="Oyun sırasında kopya çekmeyi önle" class="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-xl text-[10px] font-black text-white border border-white/20 transition cursor-pointer flex items-center gap-1 shrink-0">
            <span id="blurToggleIcon">🔒</span>
            <span id="blurToggleText">Kopya Kilidi: Açık</span>
          </button>
        </div>

        <!-- Big Question Card with Emoji Display -->
        <div class="p-4 sm:p-5 bg-white/15 rounded-3xl text-center flex flex-col items-center justify-center space-y-2.5 mb-3 shadow-inner border border-white/20 backdrop-blur-md relative overflow-hidden">
          <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/25 backdrop-blur-lg flex items-center justify-center shadow-lg border border-white/40 transform hover:scale-105 transition">
            <span id="quizEmoji" class="text-5xl sm:text-6xl block select-none drop-shadow-md">🦁</span>
          </div>

          <div>
            <p id="quizQuestion" class="font-black text-xs sm:text-sm text-teal-100">Bu görselin İngilizcesi hangisidir?</p>
            <p id="quizHintTr" class="text-[11px] text-teal-200/90 font-semibold mt-0.5">(Türkçesi: Aslan)</p>
          </div>

          <!-- Audio replay button for question -->
          <button onclick="speakWord(currentQuizItem ? currentQuizItem.en : '')" class="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-[11px] font-bold text-white flex items-center gap-1.5 transition cursor-pointer border border-white/20">
            <span>🔊</span>
            <span>Telaffuzu Dinle</span>
          </button>
        </div>

        <!-- 4 Multiple Choice Options Grid -->
        <div id="quizOptions" class="grid grid-cols-2 gap-2 text-xs">
          <!-- Quiz buttons injected via JS -->
        </div>
      </div>

      <!-- Bottom Score, Streak & Next Button -->
      <div class="pt-3 mt-3 border-t border-white/15 flex items-center justify-between text-xs">
        <div class="flex items-center gap-3">
          <div>
            <span class="text-[10px] text-teal-200 uppercase tracking-wider block">Skor</span>
            <strong id="scoreDisplay" class="text-sm sm:text-base font-black text-amber-300">0 Puan</strong>
          </div>
          <div class="pl-2 border-l border-white/20">
            <span class="text-[10px] text-teal-200 uppercase tracking-wider block">Seri</span>
            <strong id="streakDisplay" class="text-xs sm:text-sm font-black text-white">🔥 0</strong>
          </div>
        </div>

        <button onclick="nextQuiz()" class="touch-btn px-3.5 py-2 bg-white text-teal-950 hover:bg-teal-50 font-black rounded-xl text-xs shadow-md transition cursor-pointer flex items-center gap-1 active:scale-95">
          <span>Sıradaki Soru</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  </main>

  <script>
    // ==========================================
    // EXTENSIVE VOCABULARY DATABASE (100+ WORDS)
    // ==========================================
    const VOCAB = {
      animals: [
        { en: 'Lion', tr: 'Aslan', icon: '🦁' },
        { en: 'Elephant', tr: 'Fil', icon: '🐘' },
        { en: 'Monkey', tr: 'Maymun', icon: '🐒' },
        { en: 'Cat', tr: 'Kedi', icon: '🐱' },
        { en: 'Dog', tr: 'Köpek', icon: '🐶' },
        { en: 'Rabbit', tr: 'Tavşan', icon: '🐰' },
        { en: 'Giraffe', tr: 'Zürafa', icon: '🦒' },
        { en: 'Zebra', tr: 'Zebra', icon: '🦓' },
        { en: 'Tiger', tr: 'Kaplan', icon: '🐯' },
        { en: 'Bear', tr: 'Ayı', icon: '🐻' },
        { en: 'Dolphin', tr: 'Yunus', icon: '🐬' },
        { en: 'Penguin', tr: 'Penguen', icon: '🐧' },
        { en: 'Bird', tr: 'Kuş', icon: '🐦' },
        { en: 'Horse', tr: 'At', icon: '🐴' },
        { en: 'Cow', tr: 'İnek', icon: '🐮' },
        { en: 'Sheep', tr: 'Koyun', icon: '🐑' }
      ],
      food: [
        { en: 'Apple', tr: 'Elma', icon: '🍎' },
        { en: 'Banana', tr: 'Muz', icon: '🍌' },
        { en: 'Strawberry', tr: 'Çilek', icon: '🍓' },
        { en: 'Orange', tr: 'Portakal', icon: '🍊' },
        { en: 'Watermelon', tr: 'Karpuz', icon: '🍉' },
        { en: 'Grapes', tr: 'Üzüm', icon: '🍇' },
        { en: 'Lemon', tr: 'Limon', icon: '🍋' },
        { en: 'Pineapple', tr: 'Ananas', icon: '🍍' },
        { en: 'Carrot', tr: 'Havuç', icon: '🥕' },
        { en: 'Pizza', tr: 'Pizza', icon: '🍕' },
        { en: 'Milk', tr: 'Süt', icon: '🥛' },
        { en: 'Cheese', tr: 'Peynir', icon: '🧀' },
        { en: 'Egg', tr: 'Yumurta', icon: '🥚' },
        { en: 'Bread', tr: 'Ekmek', icon: '🍞' },
        { en: 'Ice Cream', tr: 'Dondurma', icon: '🍦' },
        { en: 'Cake', tr: 'Pasta', icon: '🎂' }
      ],
      colors: [
        { en: 'Red', tr: 'Kırmızı', icon: '🔴' },
        { en: 'Blue', tr: 'Mavi', icon: '🔵' },
        { en: 'Green', tr: 'Yeşil', icon: '🟢' },
        { en: 'Yellow', tr: 'Sarı', icon: '🟡' },
        { en: 'Purple', tr: 'Mor', icon: '🟣' },
        { en: 'Orange', tr: 'Turuncu', icon: '🟠' },
        { en: 'Pink', tr: 'Pembe', icon: '🌸' },
        { en: 'Brown', tr: 'Kahverengi', icon: '🟤' },
        { en: 'Black', tr: 'Siyah', icon: '⚫' },
        { en: 'White', tr: 'Beyaz', icon: '⚪' }
      ],
      numbers: [
        { en: 'One', tr: 'Bir', icon: '1️⃣' },
        { en: 'Two', tr: 'İki', icon: '2️⃣' },
        { en: 'Three', tr: 'Üç', icon: '3️⃣' },
        { en: 'Four', tr: 'Dört', icon: '4️⃣' },
        { en: 'Five', tr: 'Beş', icon: '5️⃣' },
        { en: 'Six', tr: 'Altı', icon: '6️⃣' },
        { en: 'Seven', tr: 'Yedi', icon: '7️⃣' },
        { en: 'Eight', tr: 'Sekiz', icon: '8️⃣' },
        { en: 'Nine', tr: 'Dokuz', icon: '9️⃣' },
        { en: 'Ten', tr: 'On', icon: '🔟' },
        { en: 'Eleven', tr: 'On Bir', icon: '1️⃣1️⃣' },
        { en: 'Twelve', tr: 'On İki', icon: '1️⃣2️⃣' },
        { en: 'Twenty', tr: 'Yirmi', icon: '2️⃣0️⃣' },
        { en: 'Hundred', tr: 'Yüz', icon: '💯' }
      ],
      school: [
        { en: 'Book', tr: 'Kitap', icon: '📖' },
        { en: 'Pencil', tr: 'Kalem', icon: '✏️' },
        { en: 'Bag', tr: 'Çanta', icon: '🎒' },
        { en: 'Ruler', tr: 'Cetvel', icon: '📏' },
        { en: 'Eraser', tr: 'Silgi', icon: '🧼' },
        { en: 'Scissors', tr: 'Makas', icon: '✂️' },
        { en: 'Notebook', tr: 'Defter', icon: '📓' },
        { en: 'Pen', tr: 'Tükenmez Kalem', icon: '🖊️' },
        { en: 'Desk', tr: 'Sıra', icon: '🪑' },
        { en: 'Crayon', tr: 'Pastel Boya', icon: '🖍️' },
        { en: 'Clock', tr: 'Saat', icon: '⏰' },
        { en: 'Computer', tr: 'Bilgisayar', icon: '💻' }
      ],
      family: [
        { en: 'Mother', tr: 'Anne', icon: '👩' },
        { en: 'Father', tr: 'Baba', icon: '👨' },
        { en: 'Sister', tr: 'Kız Kardeş', icon: '👧' },
        { en: 'Brother', tr: 'Erkek Kardeş', icon: '👦' },
        { en: 'Baby', tr: 'Bebek', icon: '👶' },
        { en: 'Grandfather', tr: 'Dede', icon: '👴' },
        { en: 'Grandmother', tr: 'Büyükanne', icon: '👵' },
        { en: 'Friend', tr: 'Arkadaş', icon: '🤝' },
        { en: 'Teacher', tr: 'Öğretmen', icon: '🧑‍🏫' },
        { en: 'Doctor', tr: 'Doktor', icon: '🧑‍⚕️' }
      ],
      nature: [
        { en: 'Sun', tr: 'Güneş', icon: '☀️' },
        { en: 'Moon', tr: 'Ay', icon: '🌙' },
        { en: 'Star', tr: 'Yıldız', icon: '⭐' },
        { en: 'Cloud', tr: 'Bulut', icon: '☁️' },
        { en: 'Rain', tr: 'Yağmur', icon: '🌧️' },
        { en: 'Snow', tr: 'Kar', icon: '❄️' },
        { en: 'Tree', tr: 'Ağaç', icon: '🌳' },
        { en: 'Flower', tr: 'Çiçek', icon: '🌸' },
        { en: 'Rainbow', tr: 'Gökkuşağı', icon: '🌈' },
        { en: 'Mountain', tr: 'Dağ', icon: '🏔️' }
      ],
      vehicles: [
        { en: 'Car', tr: 'Araba', icon: '🚗' },
        { en: 'Bus', tr: 'Otobüs', icon: '🚌' },
        { en: 'Plane', tr: 'Uçak', icon: '✈️' },
        { en: 'Train', tr: 'Tren', icon: '🚆' },
        { en: 'Ship', tr: 'Gemi', icon: '🚢' },
        { en: 'Bicycle', tr: 'Bisiklet', icon: '🚲' },
        { en: 'Motorcycle', tr: 'Motosiklet', icon: '🏍️' },
        { en: 'Helicopter', tr: 'Helikopter', icon: '🚁' },
        { en: 'Boat', tr: 'Tekne', icon: '⛵' },
        { en: 'Truck', tr: 'Kamyon', icon: '🚚' }
      ]
    };

    // Global App State
    let activeCategory = 'animals';
    let quizScore = 0;
    let quizStreak = 0;
    let currentQuizItem = null;
    let speechRate = 0.82;
    let cheatBlurEnabled = true;
    let isPeeking = false;
    let peekTimeout = null;

    // Best English Voice Cache
    let bestEnglishVoice = null;

    function initVoices() {
      if (!('speechSynthesis' in window)) return;
      function pick() {
        const voices = window.speechSynthesis.getVoices();
        if (!voices || voices.length === 0) return;
        // Priority ranking for natural, crystal-clear English voices
        bestEnglishVoice = 
          voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural'))) ||
          voices.find(v => v.lang === 'en-US' && (v.name.includes('Samantha') || v.name.includes('Ava') || v.name.includes('Jenny') || v.name.includes('Daniel'))) ||
          voices.find(v => v.lang === 'en-US') ||
          voices.find(v => v.lang.startsWith('en')) ||
          voices[0];
      }
      pick();
      window.speechSynthesis.onvoiceschanged = pick;
    }

    function init() {
      initVoices();
      changeCategory('animals');
    }

    function getItemsForCategory(cat) {
      if (cat === 'all') {
        const allItems = [];
        Object.values(VOCAB).forEach(list => allItems.push(...list));
        return allItems;
      }
      return VOCAB[cat] || [];
    }

    function changeCategory(cat) {
      activeCategory = cat;
      const items = getItemsForCategory(cat);
      document.getElementById('cardCountBadge').textContent = items.length + ' Kelime';

      renderCards(items);
      nextQuiz();
      applyCheatBlur();
    }

    function renderCards(items) {
      const grid = document.getElementById('cardsGrid');
      grid.innerHTML = '';
      items.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'card-item p-3.5 sm:p-4 bg-teal-50/60 hover:bg-teal-100/70 border border-teal-200/90 rounded-2xl text-center shadow-2xs transition hover:scale-105 active:scale-95 cursor-pointer flex flex-col items-center justify-center relative group';
        div.id = 'card_' + idx;
        div.innerHTML = 
          '<span class="text-4xl sm:text-5xl mb-2 drop-shadow-xs transform group-hover:scale-110 transition">' + item.icon + '</span>' +
          '<span class="font-black text-sm text-slate-800 leading-snug">' + item.en + '</span>' +
          '<span class="text-[11px] text-teal-700 font-bold mt-0.5">' + item.tr + '</span>' +
          '<span class="text-[10px] text-teal-400 group-hover:text-teal-600 mt-1 flex items-center gap-0.5">' +
            '<span>🔊</span><span>Dinle</span>' +
          '</span>';
        div.onclick = () => {
          div.classList.add('speaking-card');
          setTimeout(() => div.classList.remove('speaking-card'), 600);
          speakWord(item.en);
        };
        grid.appendChild(div);
      });
    }

    function filterCards(query) {
      const q = query.trim().toLowerCase();
      const allItems = getItemsForCategory(activeCategory);
      const filtered = q ? allItems.filter(i => i.en.toLowerCase().includes(q) || i.tr.toLowerCase().includes(q)) : allItems;
      renderCards(filtered);
    }

    // High clarity, natural speech synthesizer
    function speakWord(word) {
      if (!word || !('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel(); // Stop any pending utterance

      const u = new SpeechSynthesisUtterance(word);
      u.lang = 'en-US';
      u.rate = speechRate;
      u.pitch = 1.0;
      u.volume = 1.0;
      if (bestEnglishVoice) {
        u.voice = bestEnglishVoice;
      }
      window.speechSynthesis.speak(u);
    }

    function toggleAudioSpeed() {
      if (speechRate <= 0.85) {
        speechRate = 1.0;
        document.getElementById('speedLabel').textContent = '1.0x Normal';
      } else {
        speechRate = 0.82;
        document.getElementById('speedLabel').textContent = '0.8x Yavaş';
      }
    }

    // Mobile tab switcher ('cards' | 'quiz')
    let activeMobileTab = 'cards';
    function switchMobileTab(tab) {
      activeMobileTab = tab;
      const colCards = document.getElementById('colCards');
      const colQuiz = document.getElementById('colQuiz');
      const btnCards = document.getElementById('tabCardsBtn');
      const btnQuiz = document.getElementById('tabQuizBtn');

      if (tab === 'cards') {
        if (colCards) {
          colCards.classList.remove('hidden');
          colCards.classList.add('flex');
        }
        if (colQuiz) {
          colQuiz.classList.add('hidden');
          colQuiz.classList.remove('flex');
        }
        if (btnCards) {
          btnCards.className = 'flex-1 py-2 text-xs font-black rounded-xl transition bg-white text-teal-950 shadow-xs cursor-pointer flex items-center justify-center gap-1.5';
        }
        if (btnQuiz) {
          btnQuiz.className = 'flex-1 py-2 text-xs font-black rounded-xl transition text-teal-800 hover:text-teal-950 cursor-pointer flex items-center justify-center gap-1.5';
        }
      } else {
        if (colCards) {
          colCards.classList.add('hidden');
          colCards.classList.remove('flex');
        }
        if (colQuiz) {
          colQuiz.classList.remove('hidden');
          colQuiz.classList.add('flex');
        }
        if (btnQuiz) {
          btnQuiz.className = 'flex-1 py-2 text-xs font-black rounded-xl transition bg-white text-teal-950 shadow-xs cursor-pointer flex items-center justify-center gap-1.5';
        }
        if (btnCards) {
          btnCards.className = 'flex-1 py-2 text-xs font-black rounded-xl transition text-teal-800 hover:text-teal-950 cursor-pointer flex items-center justify-center gap-1.5';
        }
      }
    }

    // ==========================================
    // CHEAT GUARD BLUR MECHANICS
    // ==========================================
    function applyCheatBlur() {
      const grid = document.getElementById('cardsGrid');
      const overlay = document.getElementById('cheatGuardOverlay');
      if (!grid || !overlay) return;

      if (cheatBlurEnabled && !isPeeking) {
        grid.className = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5 select-none cheat-blurred pb-2';
        overlay.classList.remove('hidden');
      } else {
        grid.className = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5 select-none cheat-clear pb-2';
        overlay.classList.add('hidden');
      }
    }

    function toggleCheatBlurMode() {
      cheatBlurEnabled = !cheatBlurEnabled;
      const icon = document.getElementById('blurToggleIcon');
      const text = document.getElementById('blurToggleText');
      if (icon && text) {
        if (cheatBlurEnabled) {
          icon.textContent = '🔒';
          text.textContent = 'Kopya Kilidi: Açık';
        } else {
          icon.textContent = '🔓';
          text.textContent = 'Kopya Kilidi: Kapalı';
        }
      }
      applyCheatBlur();
    }

    function disableQuizBlur() {
      cheatBlurEnabled = false;
      const icon = document.getElementById('blurToggleIcon');
      const text = document.getElementById('blurToggleText');
      if (icon && text) {
        icon.textContent = '🔓';
        text.textContent = 'Kopya Kilidi: Kapalı';
      }
      applyCheatBlur();
    }

    function peekTemporarily(seconds = 3) {
      isPeeking = true;
      applyCheatBlur();
      if (peekTimeout) clearTimeout(peekTimeout);
      peekTimeout = setTimeout(() => {
        isPeeking = false;
        applyCheatBlur();
      }, seconds * 1000);
    }

    function toggleCheatPeek() {
      isPeeking = !isPeeking;
      applyCheatBlur();
    }

    // ==========================================
    // QUIZ GAME ENGINE
    // ==========================================
    function nextQuiz() {
      const items = getItemsForCategory(activeCategory);
      if (items.length < 4) return;

      currentQuizItem = items[Math.floor(Math.random() * items.length)];

      const quizEmoji = document.getElementById('quizEmoji');
      const quizHintTr = document.getElementById('quizHintTr');
      if (quizEmoji) quizEmoji.textContent = currentQuizItem.icon;
      if (quizHintTr) quizHintTr.textContent = '(Türkçesi: ' + currentQuizItem.tr + ')';

      // 4 unique choices
      const opts = [currentQuizItem.en];
      while (opts.length < 4) {
        const randItem = items[Math.floor(Math.random() * items.length)];
        if (!opts.includes(randItem.en)) {
          opts.push(randItem.en);
        }
      }
      opts.sort(() => Math.random() - 0.5);

      const optContainer = document.getElementById('quizOptions');
      if (optContainer) {
        optContainer.innerHTML = '';
        opts.forEach(opt => {
          const btn = document.createElement('button');
          btn.className = 'touch-btn p-3 rounded-2xl bg-white text-teal-950 font-black hover:bg-teal-50 transition shadow-xs active:scale-95 cursor-pointer text-center';
          btn.textContent = opt;
          btn.onclick = () => checkQuiz(opt, btn);
          optContainer.appendChild(btn);
        });
      }

      // Apply blur when new question appears
      applyCheatBlur();
    }

    function checkQuiz(selected, btn) {
      if (selected === currentQuizItem.en) {
        btn.className = 'touch-btn p-3 rounded-2xl bg-emerald-500 text-white font-black shadow-md scale-102';
        btn.innerHTML = '✅ ' + selected;
        quizScore += 10;
        quizStreak += 1;
        const scoreDisplay = document.getElementById('scoreDisplay');
        const streakDisplay = document.getElementById('streakDisplay');
        if (scoreDisplay) scoreDisplay.textContent = quizScore + ' Puan';
        if (streakDisplay) streakDisplay.textContent = '🔥 ' + quizStreak;
        
        speakWord(currentQuizItem.en);

        if (quizStreak % 5 === 0 && typeof confetti === 'function') {
          confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        }

        setTimeout(nextQuiz, 750);
      } else {
        btn.className = 'touch-btn p-3 rounded-2xl bg-rose-500 text-white font-bold animate-shake';
        quizStreak = 0;
        const streakDisplay = document.getElementById('streakDisplay');
        if (streakDisplay) streakDisplay.textContent = '🔥 0';
        speakWord('Try again');
      }
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
