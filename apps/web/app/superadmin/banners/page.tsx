'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  LogOut,
  Sliders,
  Plus,
  Trash2,
  Edit3,
  MoveUp,
  MoveDown,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Image as ImageIcon,
  Upload,
  RefreshCw,
  Clock,
  Layers,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Star,
  Monitor,
  Smartphone,
  Save,
  X,
  Zap,
  PenTool,
  Award,
  School,
  Target,
  Rocket,
  Flame,
  GripVertical,
  FolderTree,
  Menu as MenuIcon,
  List,
  FileText,
  ChevronRight,
  Check,
  Languages,
  Users
} from 'lucide-react';
import {
  HeroBanner,
  HeroSliderSettings,
  READY_BADGE_ICONS,
  getHeroBanners,
  saveHeroBanners,
  getHeroSliderSettings,
  saveHeroSliderSettings,
  resetHeroBannersToDefault,
  subscribeToBannerUpdates
} from '@/lib/promo/heroBanners';
import {
  NavMenuItem,
  SubMenuItem,
  MenuItemType,
  getNavMenus,
  saveNavMenus,
  resetNavMenusToDefault,
  subscribeToNavMenuUpdates
} from '@/lib/promo/navMenu';
import {
  StudentShowcaseSettings,
  getStudentShowcaseSettings,
  saveStudentShowcaseSettings,
  resetStudentShowcaseSettings,
} from '@/lib/promo/studentShowcase';

function renderAdminBadgeIcon(iconKey?: string, defaultImg?: string) {
  const found = READY_BADGE_ICONS.find((item) => item.id === iconKey);
  if (found) {
    if (found.type === 'image') {
      return (
        <img
          src={found.value}
          alt={found.name}
          className="w-full h-full object-contain"
        />
      );
    }
    if (found.type === 'lucide') {
      const LucideIconsMap: Record<string, any> = {
        GraduationCap,
        Sparkles,
        Zap,
        PenTool,
        BookOpen,
        Award,
        School,
        Target,
        ShieldCheck,
        Rocket,
        Star,
        Flame,
      };
      const IconComp = LucideIconsMap[found.value] || Sparkles;
      return <IconComp className="w-3.5 h-3.5" style={{ color: found.color || '#4B075F' }} />;
    }
  }
  if (iconKey && (iconKey.startsWith('/') || iconKey.startsWith('http') || iconKey.startsWith('data:'))) {
    return <img src={iconKey} alt="Badge" className="w-full h-full object-contain" />;
  }
  return <img src={defaultImg || '/badge_14gun.png'} alt="Badge" className="w-full h-full object-contain" />;
}

const PRESET_IMAGES = [
  { label: '3D Bilge Maskot', url: '/oxonom-mascot.png' },
  { label: 'Laptop ile Çalışan', url: '/mascot/mascot-laptop.png' },
  { label: 'Kitap Okuyan', url: '/mascot/mascot-reading.png' },
  { label: 'Kalem Tutan', url: '/mascot/mascot-pencil.png' },
  { label: 'Fikir / Ampul', url: '/mascot/mascot-idea.png' },
  { label: 'Kutlama / Başarı', url: '/mascot/mascot-success-jumping.png' },
  { label: '14 Gün Rozetli', url: '/mascot/mascot-14gun-badge.png' },
  { label: 'Bilge Baykuş', url: '/oxonom-hero-owl.png' },
  { label: 'Sınıf Çizimi', url: '/theclassroom.png' },
  { label: 'Oxonom Edu Logo', url: '/oxonom-edu-logo-transparent.png' },
];

const AVAILABLE_SUB_ICONS = [
  { id: 'PenTool', label: 'Akıllı Tahta / Kalem', comp: PenTool },
  { id: 'Zap', label: 'Hızlı Okuma / Şimşek', comp: Zap },
  { id: 'School', label: 'Okul / Kampüs', comp: School },
  { id: 'Languages', label: 'Yabancı Dil', comp: Languages },
  { id: 'BookOpen', label: 'Kitap / Atölye', comp: BookOpen },
  { id: 'Award', label: 'Paket / Lisans / Başarı', comp: Award },
  { id: 'GraduationCap', label: 'Mezuniyet / Eğitim', comp: GraduationCap },
  { id: 'Users', label: 'Öğretmen & Zümre', comp: Users },
  { id: 'Target', label: 'Sınav / LGS / Hedef', comp: Target },
  { id: 'FileText', label: 'MEB / Müfredat', comp: FileText },
  { id: 'Sparkles', label: 'Yıldız / Özel', comp: Sparkles },
  { id: 'Layers', label: 'Entegrasyon / Katman', comp: Layers },
];

export default function SuperAdminPage() {
  // Active Tab
  const [activeTab, setActiveTab] = useState<'hero' | 'menus' | 'student'>('hero');

  // Student Showcase State
  const [studentSettings, setStudentSettings] = useState<StudentShowcaseSettings>(() =>
    getStudentShowcaseSettings()
  );
  const studentFileInputRef = useRef<HTMLInputElement>(null);

  // Hero Banners & Settings
  const [banners, setBanners] = useState<HeroBanner[]>(getHeroBanners());
  const [settings, setSettings] = useState<HeroSliderSettings>(getHeroSliderSettings());
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Editing / Creating Banner State
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview Simulator State
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [previewSlideIndex, setPreviewSlideIndex] = useState(0);

  // Nav Menus State
  const [navMenus, setNavMenus] = useState<NavMenuItem[]>(() => getNavMenus());
  const [draggedMenuIndex, setDraggedMenuIndex] = useState<number | null>(null);
  const [dragOverMenuIndex, setDragOverMenuIndex] = useState<number | null>(null);

  // Menu Modal State
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<NavMenuItem | null>(null);

  // Sub-Item Editor Modal State
  const [isSubItemsModalOpen, setIsSubItemsModalOpen] = useState(false);
  const [selectedMenuForSubItems, setSelectedMenuForSubItems] = useState<NavMenuItem | null>(null);
  const [editingSubItem, setEditingSubItem] = useState<SubMenuItem | null>(null);
  const [isAddingSubItem, setIsAddingSubItem] = useState(false);

  // Sync banners across updates
  useEffect(() => {
    const unsubscribe = subscribeToBannerUpdates(() => {
      setBanners(getHeroBanners());
      setSettings(getHeroSliderSettings());
    });
    return unsubscribe;
  }, []);

  // Sync nav menus across updates
  useEffect(() => {
    const unsub = subscribeToNavMenuUpdates(() => {
      setNavMenus(getNavMenus());
    });
    return unsub;
  }, []);

  const triggerSuccess = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // -------------------------------------------------------------
  // HERO BANNER ACTIONS
  // -------------------------------------------------------------
  const handleSaveSettings = () => {
    saveHeroSliderSettings(settings);
    triggerSuccess('Slider geçiş ayarları başarıyla güncellendi!');
  };

  const handleToggleBannerActive = (id: string) => {
    const updated = banners.map((b) => (b.id === id ? { ...b, active: !b.active } : b));
    setBanners(updated);
    saveHeroBanners(updated);
    triggerSuccess('Banner durumu güncellendi.');
  };

  const handleDeleteBanner = (id: string) => {
    if (banners.length <= 1) {
      alert('En az 1 adet banner bulunmalıdır.');
      return;
    }
    if (confirm('Bu bannerı silmek istediğinize emin misiniz?')) {
      const updated = banners.filter((b) => b.id !== id);
      setBanners(updated);
      saveHeroBanners(updated);
      triggerSuccess('Banner silindi.');
    }
  };

  const handleMoveBanner = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;
    const newBanners = [...banners];
    const [moved] = newBanners.splice(index, 1);
    newBanners.splice(targetIndex, 0, moved);
    
    const ordered = newBanners.map((b, i) => ({ ...b, order: i + 1 }));
    setBanners(ordered);
    saveHeroBanners(ordered);
    triggerSuccess('Banner sıralaması güncellendi.');
  };

  const handleOpenAddBannerModal = () => {
    setEditingBanner({
      id: 'banner-' + Date.now(),
      badge: '🎓 YENİ NESİL DİJİTAL EĞİTİM',
      badgeIcon: 'trial-14',
      title: 'Geleceğin eğitimini',
      highlightText: 'birlikte inşa edin.',
      description: 'Öğretmenler, öğrenciler ve okul idaresi için hepsi bir arada yeni nesil pedagojik yönetim ve canlı sınıf platformu.',
      primaryCtaText: 'Hemen Başlayın',
      primaryCtaUrl: 'https://edu.oxonom.com/login',
      secondaryCtaText: 'Modülleri Keşfet',
      secondaryCtaUrl: '/web-site',
      imageUrl: '/oxonom-mascot.png',
      active: true,
      order: banners.length + 1,
    });
    setIsEditingModalOpen(true);
  };

  const handleOpenEditBannerModal = (banner: HeroBanner) => {
    setEditingBanner({ ...banner });
    setIsEditingModalOpen(true);
  };

  const handleSaveBannerModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;

    const exists = banners.some((b) => b.id === editingBanner.id);
    let updated: HeroBanner[];
    if (exists) {
      updated = banners.map((b) => (b.id === editingBanner.id ? editingBanner : b));
    } else {
      updated = [...banners, editingBanner];
    }

    setBanners(updated);
    saveHeroBanners(updated);
    setIsEditingModalOpen(false);
    setEditingBanner(null);
    triggerSuccess('Hero Banner başarıyla kaydedildi ve ana sayfada güncellendi!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingBanner) return;

    if (!file.type.includes('png') && !file.type.includes('image/')) {
      alert('Lütfen şeffaf arka planlı bir PNG veya görsel dosyası seçin.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setEditingBanner({
        ...editingBanner,
        imageUrl: base64,
      });
      triggerSuccess('Görsel başarıyla yüklendi.');
    };
    reader.readAsDataURL(file);
  };

  const handleResetBanners = () => {
    if (confirm('Tüm bannerları orijinal fabrika ayarlarına sıfırlamak istediğinize emin misiniz?')) {
      resetHeroBannersToDefault();
      setBanners(getHeroBanners());
      setSettings(getHeroSliderSettings());
      triggerSuccess('Tüm bannerlar varsayılan ayarlara sıfırlandı.');
    }
  };

  // -------------------------------------------------------------
  // MENU MANAGEMENT ACTIONS (Drag & Drop, Add, Edit, Delete)
  // -------------------------------------------------------------
  const handleToggleMenuActive = (id: string) => {
    const updated = navMenus.map((m) => (m.id === id ? { ...m, active: !m.active } : m));
    setNavMenus(updated);
    saveNavMenus(updated);
    triggerSuccess('Menü görünürlük durumu güncellendi.');
  };

  const handleDeleteMenu = (id: string) => {
    if (navMenus.length <= 1) {
      alert('En az 1 adet menü bulunmalıdır.');
      return;
    }
    const target = navMenus.find((m) => m.id === id);
    if (confirm(`"${target?.title || 'Bu menü'}" menüsünü silmek istediğinize emin misiniz?`)) {
      const updated = navMenus.filter((m) => m.id !== id).map((m, i) => ({ ...m, order: i + 1 }));
      setNavMenus(updated);
      saveNavMenus(updated);
      triggerSuccess('Menü başarıyla silindi.');
    }
  };

  const handleMoveMenu = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= navMenus.length) return;
    const newMenus = [...navMenus];
    const [moved] = newMenus.splice(index, 1);
    newMenus.splice(targetIndex, 0, moved);

    const ordered = newMenus.map((m, i) => ({ ...m, order: i + 1 }));
    setNavMenus(ordered);
    saveNavMenus(ordered);
    triggerSuccess('Menü sırası güncellendi.');
  };

  // HTML5 Drag and Drop handlers
  const handleMenuDragStart = (e: React.DragEvent, index: number) => {
    setDraggedMenuIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleMenuDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverMenuIndex !== index) {
      setDragOverMenuIndex(index);
    }
  };

  const handleMenuDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedMenuIndex === null || draggedMenuIndex === dropIndex) {
      setDraggedMenuIndex(null);
      setDragOverMenuIndex(null);
      return;
    }

    const reordered = [...navMenus];
    const [moved] = reordered.splice(draggedMenuIndex, 1);
    reordered.splice(dropIndex, 0, moved);

    const ordered = reordered.map((m, i) => ({ ...m, order: i + 1 }));
    setNavMenus(ordered);
    saveNavMenus(ordered);
    setDraggedMenuIndex(null);
    setDragOverMenuIndex(null);
    triggerSuccess('Menü sıralaması sürükle-bırak ile güncellendi!');
  };

  const handleMenuDragEnd = () => {
    setDraggedMenuIndex(null);
    setDragOverMenuIndex(null);
  };

  const handleOpenAddMenuModal = () => {
    setEditingMenu({
      id: 'menu-' + Date.now(),
      title: 'Yeni Menü',
      path: '/yeni-sayfa',
      type: 'link',
      active: true,
      order: navMenus.length + 1,
      badge: '',
      subItems: [],
    });
    setIsMenuModalOpen(true);
  };

  const handleOpenEditMenuModal = (menu: NavMenuItem) => {
    setEditingMenu({ ...menu });
    setIsMenuModalOpen(true);
  };

  const handleSaveMenuModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMenu) return;

    const exists = navMenus.some((m) => m.id === editingMenu.id);
    let updated: NavMenuItem[];
    if (exists) {
      updated = navMenus.map((m) => (m.id === editingMenu.id ? editingMenu : m));
    } else {
      updated = [...navMenus, editingMenu];
    }

    const ordered = updated.sort((a, b) => a.order - b.order);
    setNavMenus(ordered);
    saveNavMenus(ordered);
    setIsMenuModalOpen(false);
    setEditingMenu(null);
    triggerSuccess('Menü ayarları kaydedildi ve üst barda canlı güncellendi!');
  };

  const handleResetNavMenus = () => {
    if (confirm('Tüm menüleri ve alt ögeleri varsayılan fabrika ayarlarına sıfırlamak istediğinize emin misiniz?')) {
      resetNavMenusToDefault();
      setNavMenus(getNavMenus());
      triggerSuccess('Menüler varsayılan düzene sıfırlandı.');
    }
  };

  // -------------------------------------------------------------
  // SUB-ITEMS & MEGA MENU EDITOR
  // -------------------------------------------------------------
  const handleOpenSubItemsModal = (menu: NavMenuItem) => {
    setSelectedMenuForSubItems({ ...menu, subItems: menu.subItems ? [...menu.subItems] : [] });
    setIsAddingSubItem(false);
    setEditingSubItem(null);
    setIsSubItemsModalOpen(true);
  };

  const handleStartAddSubItem = () => {
    setEditingSubItem({
      id: 'sub-' + Date.now(),
      title: '',
      description: '',
      path: '/',
      icon: 'PenTool',
      badge: '',
      category: 'Genel',
    });
    setIsAddingSubItem(true);
  };

  const handleSaveSubItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMenuForSubItems || !editingSubItem) return;

    if (!editingSubItem.title.trim()) {
      alert('Lütfen bir alt menü başlığı girin.');
      return;
    }

    const currentSubItems = selectedMenuForSubItems.subItems || [];
    const exists = currentSubItems.some((s) => s.id === editingSubItem.id);
    let updatedSubItems: SubMenuItem[];

    if (exists) {
      updatedSubItems = currentSubItems.map((s) => (s.id === editingSubItem.id ? editingSubItem : s));
    } else {
      updatedSubItems = [...currentSubItems, editingSubItem];
    }

    const updatedMenu = { ...selectedMenuForSubItems, subItems: updatedSubItems };
    setSelectedMenuForSubItems(updatedMenu);

    const updatedNavMenus = navMenus.map((m) => (m.id === updatedMenu.id ? updatedMenu : m));
    setNavMenus(updatedNavMenus);
    saveNavMenus(updatedNavMenus);

    setIsAddingSubItem(false);
    setEditingSubItem(null);
    triggerSuccess('Alt menü ögesi kaydedildi.');
  };

  const handleDeleteSubItem = (subId: string) => {
    if (!selectedMenuForSubItems) return;
    if (confirm('Bu alt menü ögesini silmek istediğinize emin misiniz?')) {
      const updatedSubItems = (selectedMenuForSubItems.subItems || []).filter((s) => s.id !== subId);
      const updatedMenu = { ...selectedMenuForSubItems, subItems: updatedSubItems };
      setSelectedMenuForSubItems(updatedMenu);

      const updatedNavMenus = navMenus.map((m) => (m.id === updatedMenu.id ? updatedMenu : m));
      setNavMenus(updatedNavMenus);
      saveNavMenus(updatedNavMenus);
      triggerSuccess('Alt menü ögesi silindi.');
    }
  };

  // Student Showcase Handlers
  const handleStudentFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Lütfen geçerli bir resim dosyası seçin (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const result = loadEvent.target?.result as string;
      if (result) {
        setStudentSettings((prev) => ({ ...prev, portalImageUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveStudentShowcase = (e: React.FormEvent) => {
    e.preventDefault();
    const saved = saveStudentShowcaseSettings(studentSettings);
    setStudentSettings(saved);
    setSaveSuccessMsg('Öğrenci portalı ekran görseli ve ayarları başarıyla kaydedildi!');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const handleResetStudentShowcase = () => {
    if (confirm('Öğrenci portalı ekran görselini varsayılana sıfırlamak istediğinize emin misiniz?')) {
      const reset = resetStudentShowcaseSettings();
      setStudentSettings(reset);
      setSaveSuccessMsg('Öğrenci portalı görseli varsayılana sıfırlandı!');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    }
  };

  // -------------------------------------------------------------
  // ADMIN DASHBOARD
  // -------------------------------------------------------------
  const activeBanners = banners.filter((b) => b.active);
  const currentPreviewBanner = activeBanners[previewSlideIndex % (activeBanners.length || 1)] || banners[0];

  return (
    <div className="space-y-6 text-[#241329]">
      <div className="space-y-6">
        {/* Welcome & Info Banner */}
        <div className="bg-gradient-to-r from-[#4B075F] via-[#350444] to-[#241329] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D914C8]/30 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs font-bold text-[#FCE8FA] mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#D914C8]" />
              <span>Gelişmiş Yönetim & Özelleştirme</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Oxonom Edu Yönetim Merkezi
            </h2>
            <p className="text-xs sm:text-sm text-white/80 mt-2 leading-relaxed">
              Hero bannerlarını, geçiş sürelerini ve animasyonlarını yönetin; üst menüyü ve çok sütunlu mega menüleri sürükle bırak yöntemiyle dilediğiniz gibi düzenleyin.
            </p>
          </div>
        </div>

        {/* Success Alert Toast */}
        {saveSuccessMsg && (
          <div className="p-4 rounded-2xl bg-[#E4F5ED] border border-[#16805D]/30 text-[#16805D] text-xs sm:text-sm font-bold flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#16805D]" />
              <span>{saveSuccessMsg}</span>
            </div>
            <button onClick={() => setSaveSuccessMsg('')} className="text-[#16805D]/70 hover:text-[#16805D]">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Primary Tabs Switcher */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-[#E8DFEB] shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab('hero')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'hero'
                ? 'bg-[#4B075F] text-white shadow-md shadow-[#4B075F]/20'
                : 'text-[#716779] hover:text-[#241329] hover:bg-[#FCF9FD]'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Hero Banner Yönetimi</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'hero' ? 'bg-[#D914C8] text-white' : 'bg-[#FCF9FD] text-[#4B075F]'
            }`}>
              {banners.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('menus')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'menus'
                ? 'bg-[#4B075F] text-white shadow-md shadow-[#4B075F]/20'
                : 'text-[#716779] hover:text-[#241329] hover:bg-[#FCF9FD]'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Menü & Mega Menü Yönetimi</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'menus' ? 'bg-[#D914C8] text-white' : 'bg-[#FCF9FD] text-[#4B075F]'
            }`}>
              {navMenus.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('student')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'student'
                ? 'bg-[#4B075F] text-white shadow-md shadow-[#4B075F]/20'
                : 'text-[#716779] hover:text-[#241329] hover:bg-[#FCF9FD]'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Öğrenci Portalı Görseli</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'student' ? 'bg-[#D914C8] text-white' : 'bg-[#FCF9FD] text-[#4B075F]'
            }`}>
              Canlı
            </span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: HERO BANNER YÖNETİMİ                              */}
        {/* ========================================================= */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            {/* Grid: Slider Settings & Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Slider Timing & Transitions Settings */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E8DFEB] p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-[#E8DFEB] pb-4">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-[#4B075F]" />
                    <h3 className="font-black text-base text-[#241329]">Otomatik Geçiş & Süre Ayarları</h3>
                  </div>
                  <span className="text-xs font-bold text-[#8D49A6] bg-[#FCE8FA] px-2.5 py-1 rounded-full">
                    Canlı Ayarlar
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* AutoPlay Toggle */}
                  <div className="p-4 rounded-2xl bg-[#FCF9FD] border border-[#E8DFEB] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-[#241329] block">Otomatik Geçiş (AutoPlay)</span>
                      <span className="text-xs text-[#716779]">Slaytlar belirlenen sürede otomatik dönsün.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, autoPlay: !settings.autoPlay })}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                        settings.autoPlay ? 'bg-[#16805D]' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          settings.autoPlay ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Interval Duration */}
                  <div className="p-4 rounded-2xl bg-[#FCF9FD] border border-[#E8DFEB] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#241329]">Geçiş Süresi</span>
                      <span className="text-xs font-black text-[#4B075F] bg-white px-2.5 py-1 rounded-lg border border-[#E8DFEB]">
                        {settings.intervalSeconds} Saniye
                      </span>
                    </div>
                    <input
                      type="range"
                      min={3}
                      max={20}
                      step={1}
                      value={settings.intervalSeconds}
                      onChange={(e) => setSettings({ ...settings, intervalSeconds: Number(e.target.value) })}
                      className="w-full accent-[#4B075F] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-[#716779] font-medium">
                      <span>3 sn (Hızlı)</span>
                      <span>8 sn (Standart)</span>
                      <span>20 sn (Yavaş)</span>
                    </div>
                  </div>

                  {/* Animation Style */}
                  <div className="p-4 rounded-2xl bg-[#FCF9FD] border border-[#E8DFEB] space-y-2">
                    <span className="font-bold text-sm text-[#241329] block">Animasyon Tarzı</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, transitionEffect: 'slide' })}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                          settings.transitionEffect === 'slide'
                            ? 'bg-[#4B075F] text-white border-[#4B075F]'
                            : 'bg-white text-[#716779] border-[#E8DFEB] hover:bg-slate-50'
                        }`}
                      >
                        Yatay Kayma (Slide)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, transitionEffect: 'fade' })}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                          settings.transitionEffect === 'fade'
                            ? 'bg-[#4B075F] text-white border-[#4B075F]'
                            : 'bg-white text-[#716779] border-[#E8DFEB] hover:bg-slate-50'
                        }`}
                      >
                        Yumuşak Solma (Fade)
                      </button>
                    </div>
                  </div>

                  {/* Save Settings Button */}
                  <div className="p-4 rounded-2xl bg-[#FCF9FD] border border-[#E8DFEB] flex flex-col justify-between">
                    <div>
                      <span className="font-bold text-sm text-[#241329] block">Ayarları Canlıya Al</span>
                      <span className="text-xs text-[#716779]">Değişiklikleri ana sayfada anında uygulayın.</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      className="mt-3 w-full py-2.5 px-4 bg-[#4B075F] hover:bg-[#620B79] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Süre Ayarlarını Kaydet
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Info & Actions */}
              <div className="bg-white rounded-3xl border border-[#E8DFEB] p-6 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 border-b border-[#E8DFEB] pb-3 mb-4">
                    <Layers className="w-5 h-5 text-[#8D49A6]" />
                    <h3 className="font-black text-base text-[#241329]">Özet Bilgiler</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#FCF9FD]">
                      <span className="text-xs text-[#716779]">Toplam Hero Banner:</span>
                      <span className="font-black text-sm text-[#241329]">{banners.length} Adet</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#FCF9FD]">
                      <span className="text-xs text-[#716779]">Aktif (Yayındaki) Banner:</span>
                      <span className="font-black text-sm text-[#16805D]">{activeBanners.length} Adet</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#FCF9FD]">
                      <span className="text-xs text-[#716779]">Geçiş Süresi:</span>
                      <span className="font-black text-sm text-[#4B075F]">{settings.intervalSeconds} Saniye</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={handleOpenAddBannerModal}
                    className="w-full py-3 bg-gradient-to-r from-[#4B075F] to-[#D914C8] hover:opacity-95 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-[#D914C8]/20 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Yeni Hero Banner Ekle
                  </button>
                  <button
                    type="button"
                    onClick={handleResetBanners}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Varsayılan Bannerlara Sıfırla
                  </button>
                </div>
              </div>
            </div>

            {/* Banner List */}
            <div className="bg-white rounded-3xl border border-[#E8DFEB] p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DFEB] pb-4">
                <div>
                  <h3 className="font-black text-lg text-[#241329]">Mevcut Hero Bannerlar</h3>
                  <p className="text-xs text-[#716779] mt-0.5">
                    Sıralamayı ok butonları ile değiştirebilir, düzenleyebilir veya yayından kaldırabilirsiniz.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddBannerModal}
                  className="px-4 py-2 bg-[#4B075F] hover:bg-[#620B79] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" /> Yeni Banner Ekle
                </button>
              </div>

              <div className="space-y-3">
                {banners.map((banner, index) => (
                  <div
                    key={banner.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      banner.active
                        ? 'bg-white border-[#E8DFEB] shadow-xs hover:border-[#4B075F]/30'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    {/* Left: Reorder & Image & Info */}
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      {/* Sort Buttons */}
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveBanner(index, 'up')}
                          disabled={index === 0}
                          className="p-1 rounded bg-[#FCF9FD] border border-[#E8DFEB] text-[#4B075F] hover:bg-[#FCE8FA] disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Yukarı Taşı"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveBanner(index, 'down')}
                          disabled={index === banners.length - 1}
                          className="p-1 rounded bg-[#FCF9FD] border border-[#E8DFEB] text-[#4B075F] hover:bg-[#FCE8FA] disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Aşağı Taşı"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Image Thumbnail */}
                      <div className="w-16 h-16 rounded-xl bg-[#241329] border border-[#4B075F]/20 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                          src={banner.imageUrl}
                          alt={banner.title}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Text info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FCE8FA] text-[#4B075F]">
                            #{banner.order} · {banner.badge}
                          </span>
                          {banner.active ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E4F5ED] text-[#16805D]">
                              ● Yayında
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                              Pasif
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-[#241329] truncate">
                          {banner.title} <span className="text-[#D914C8]">{banner.highlightText}</span>
                        </h4>
                        <p className="text-xs text-[#716779] line-clamp-1 mt-0.5">
                          {banner.description}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleBannerActive(banner.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          banner.active
                            ? 'bg-[#E4F5ED] text-[#16805D] hover:bg-emerald-100'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {banner.active ? 'Yayından Kaldır' : 'Yayına Al'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditBannerModal(banner)}
                        className="p-2 bg-[#FCE8FA] text-[#4B075F] hover:bg-[#F0D8FA] rounded-xl transition-all"
                        title="Düzenle"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Simulator Preview Box */}
            <div className="bg-[#241329] text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D914C8] block mb-1">
                    CANLI SİMÜLATÖR
                  </span>
                  <h3 className="font-black text-lg text-white">Hero Banner Canlı Önizleme</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      previewDevice === 'desktop'
                        ? 'bg-[#D914C8] text-white'
                        : 'bg-white/10 text-white/70 hover:text-white'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    Masaüstü
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      previewDevice === 'mobile'
                        ? 'bg-[#D914C8] text-white'
                        : 'bg-white/10 text-white/70 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    Mobil
                  </button>

                  <div className="h-4 w-px bg-white/20 mx-1" />

                  {/* Prev / Next Slide in Preview */}
                  <button
                    type="button"
                    onClick={() => setPreviewSlideIndex((p) => Math.max(0, p - 1))}
                    className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs"
                  >
                    ←
                  </button>
                  <span className="text-xs text-white/70 font-mono">
                    {(previewSlideIndex % (activeBanners.length || 1)) + 1} / {activeBanners.length || 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewSlideIndex((p) => p + 1)}
                    className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs"
                  >
                    →
                  </button>
                </div>
              </div>

              {/* Simulator Screen */}
              <div
                className={`mx-auto transition-all duration-300 rounded-2xl border border-white/15 bg-gradient-to-br from-[#241329] via-[#350444] to-[#4B075F] p-6 relative overflow-hidden ${
                  previewDevice === 'mobile' ? 'max-w-sm' : 'w-full'
                }`}
              >
                {currentPreviewBanner ? (
                  <div
                    className={`grid items-center gap-6 ${
                      previewDevice === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'
                    }`}
                  >
                    {/* Visual (Mobilde Üstte) */}
                    <div
                      className={`flex justify-center relative ${
                        previewDevice === 'mobile' ? 'order-1' : 'order-1 lg:order-2 lg:col-span-6'
                      }`}
                    >
                      <div className="w-32 h-32 sm:w-44 sm:h-44 bg-[#D914C8]/30 rounded-full blur-2xl absolute pointer-events-none" />
                      <img
                        src={currentPreviewBanner.imageUrl}
                        alt="Önizleme Görseli"
                        className="w-48 sm:w-64 max-h-56 object-contain relative z-10 drop-shadow-xl"
                      />
                    </div>

                    {/* Texts (Mobilde Altta) */}
                    <div
                      className={`flex flex-col ${
                        previewDevice === 'mobile'
                          ? 'order-2 text-center items-center'
                          : 'order-2 lg:order-1 lg:col-span-6 text-left items-start'
                      }`}
                    >
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 pl-1.5 pr-3 py-0.5 text-[10px] font-bold text-white mb-2">
                        <div className="w-5 h-5 rounded-full bg-white p-0.5 flex items-center justify-center">
                          {renderAdminBadgeIcon(currentPreviewBanner.badgeIcon, currentPreviewBanner.imageUrl)}
                        </div>
                        <span>{currentPreviewBanner.badge}</span>
                      </div>
                      <h4 className="text-lg sm:text-xl font-black text-white leading-tight">
                        {currentPreviewBanner.title}{' '}
                        <span className="text-[#D914C8]">{currentPreviewBanner.highlightText}</span>
                      </h4>
                      <p className="text-xs text-white/70 mt-2 line-clamp-3 leading-relaxed">
                        {currentPreviewBanner.description}
                      </p>
                      <div className="flex gap-2 mt-4 flex-wrap">
                        <span className="px-3 py-1.5 rounded-lg bg-[#4B075F] text-white text-[11px] font-bold">
                          {currentPreviewBanner.primaryCtaText}
                        </span>
                        {currentPreviewBanner.secondaryCtaText && (
                          <span className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-[11px] font-bold border border-white/20">
                            {currentPreviewBanner.secondaryCtaText}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-xs text-white/50">Görüntülenecek aktif banner bulunamadı.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: MENÜ & MEGA MENÜ YÖNETİMİ                         */}
        {/* ========================================================= */}
        {activeTab === 'menus' && (
          <div className="space-y-6">
            {/* Header / Intro Card */}
            <div className="bg-white rounded-3xl border border-[#E8DFEB] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FolderTree className="w-5 h-5 text-[#4B075F]" />
                  <h3 className="font-black text-lg text-[#241329]">Üst Navigasyon & Mega Menü Yapılandırması</h3>
                </div>
                <p className="text-xs text-[#716779] max-w-2xl leading-relaxed">
                  Menü ögelerini <strong>sürükle bırak</strong> yöntemiyle dilediğiniz sıraya dizin.
                  İsimlerini değiştirebilir, yeni bağlantılar veya açılır kategorili mega menüler tanımlayabilirsiniz.
                  Değişiklikler sitede anında canlıya yansır.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleResetNavMenus}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Varsayılana Sıfırla
                </button>
                <button
                  type="button"
                  onClick={handleOpenAddMenuModal}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#4B075F] to-[#D914C8] hover:opacity-95 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Yeni Menü Ekle
                </button>
              </div>
            </div>

            {/* Draggable Menus List */}
            <div className="bg-white rounded-3xl border border-[#E8DFEB] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8DFEB] pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-[#716779]">
                  Menü Sıralaması (Sürükle & Bırak)
                </span>
                <span className="text-xs text-[#8D49A6] font-bold">
                  {navMenus.filter((m) => m.active).length} / {navMenus.length} Menü Aktif
                </span>
              </div>

              <div className="space-y-3">
                {navMenus.map((menu, index) => {
                  const isDragging = draggedMenuIndex === index;
                  const isDragOver = dragOverMenuIndex === index;
                  const subItemsCount = menu.subItems?.length || 0;

                  return (
                    <div
                      key={menu.id}
                      draggable={true}
                      onDragStart={(e) => handleMenuDragStart(e, index)}
                      onDragOver={(e) => handleMenuDragOver(e, index)}
                      onDrop={(e) => handleMenuDrop(e, index)}
                      onDragEnd={handleMenuDragEnd}
                      className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-grab active:cursor-grabbing select-none ${
                        isDragging
                          ? 'opacity-40 scale-[0.98] border-dashed border-[#4B075F] bg-[#FCF9FD]'
                          : isDragOver
                          ? 'border-[#D914C8] ring-2 ring-[#D914C8]/30 bg-[#FCE8FA]/30'
                          : menu.active
                          ? 'bg-white border-[#E8DFEB] shadow-xs hover:border-[#4B075F]/40'
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      {/* Left Side: Drag Handle, Order, Type Badge, Title */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="p-1.5 rounded-lg bg-[#FCF9FD] border border-[#E8DFEB] text-[#716779] hover:text-[#4B075F] cursor-grab">
                          <GripVertical className="w-4 h-4" />
                        </div>

                        <span className="text-xs font-black text-[#4B075F] bg-[#FCE8FA] px-2 py-1 rounded-lg shrink-0">
                          #{menu.order}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm text-[#241329] truncate">
                              {menu.title}
                            </h4>
                            {menu.badge && (
                              <span className="px-1.5 py-0.5 bg-[#D914C8] text-white text-[9px] font-black uppercase rounded-md tracking-wider">
                                {menu.badge}
                              </span>
                            )}
                            {/* Type Pill */}
                            {menu.type === 'megamenu' ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FCE8FA] text-[#8D49A6] border border-[#F0D8FA]">
                                Mega Menü {menu.megaMenuType ? `(${menu.megaMenuType})` : ''}
                              </span>
                            ) : menu.type === 'dropdown' ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                Açılır Dropdown
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                Direkt Link
                              </span>
                            )}

                            {menu.active ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E4F5ED] text-[#16805D]">
                                ● Yayında
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                                Pasif
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-[#716779] mt-0.5 font-medium">
                            <span>Bağlantı: <code className="text-[#4B075F] bg-[#FCF9FD] px-1 py-0.5 rounded">{menu.path || '#'}</code></span>
                            {(menu.type === 'megamenu' || menu.type === 'dropdown') && (
                              <span>· {subItemsCount} alt öge</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Reorder buttons & Action buttons */}
                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        {/* Up/Down buttons for mobile or precise click */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveMenu(index, 'up')}
                            disabled={index === 0}
                            className="p-1.5 rounded-lg bg-[#FCF9FD] border border-[#E8DFEB] text-[#4B075F] hover:bg-[#FCE8FA] disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Yukarı Taşı"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveMenu(index, 'down')}
                            disabled={index === navMenus.length - 1}
                            className="p-1.5 rounded-lg bg-[#FCF9FD] border border-[#E8DFEB] text-[#4B075F] hover:bg-[#FCE8FA] disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Aşağı Taşı"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Sub-items manager button for megamenu / dropdown */}
                        {(menu.type === 'megamenu' || menu.type === 'dropdown') && (
                          <button
                            type="button"
                            onClick={() => handleOpenSubItemsModal(menu)}
                            className="px-3 py-1.5 bg-[#FCF9FD] hover:bg-[#FCE8FA] border border-[#E8DFEB] text-[#4B075F] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            <List className="w-3.5 h-3.5" />
                            <span>Alt Ögeleri Yönet ({subItemsCount})</span>
                          </button>
                        )}

                        {/* Active toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleMenuActive(menu.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            menu.active
                              ? 'bg-[#E4F5ED] text-[#16805D] hover:bg-emerald-100'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          {menu.active ? 'Aktif' : 'Pasif'}
                        </button>

                        {/* Edit Menu */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditMenuModal(menu)}
                          className="p-2 bg-[#FCE8FA] text-[#4B075F] hover:bg-[#F0D8FA] rounded-xl transition-all"
                          title="Menüyü Düzenle"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete Menu */}
                        <button
                          type="button"
                          onClick={() => handleDeleteMenu(menu.id)}
                          className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: ÖĞRENCİ PORTALI GÖRSELİ YÖNETİMİ                   */}
        {/* ========================================================= */}
        {activeTab === 'student' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form & Controls */}
              <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-[#E8DFEB] shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="p-2 rounded-xl bg-[#FCE8FA] text-[#4B075F]">
                      <GraduationCap className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="font-black text-lg text-[#241329]">
                        Öğrenci Portalı Görseli
                      </h3>
                      <p className="text-xs text-[#716779]">
                        Ana sayfadaki 3D ekran görüntüsünü ve bağlantıları güncelleyin.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveStudentShowcase} className="space-y-4 mt-4">
                    {/* File Upload / Image URL */}
                    <div>
                      <label className="block font-bold text-xs text-[#241329] mb-1.5">
                        Portal Ekran Görüntüsü
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={studentSettings.portalImageUrl}
                          onChange={(e) =>
                            setStudentSettings({
                              ...studentSettings,
                              portalImageUrl: e.target.value,
                            })
                          }
                          placeholder="/student-portal-desktop.png veya görsel URL"
                          className="flex-1 bg-[#FCF9FD] border border-[#E8DFEB] rounded-xl px-3.5 py-2.5 font-medium text-xs focus:outline-none focus:border-[#4B075F]"
                        />
                        <button
                          type="button"
                          onClick={() => studentFileInputRef.current?.click()}
                          className="px-3.5 py-2.5 rounded-xl bg-[#FCF9FD] hover:bg-[#FCE8FA] text-[#4B075F] border border-[#E8DFEB] hover:border-[#D914C8]/40 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
                          title="Bilgisayardan PNG/JPG Seç"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Yükle</span>
                        </button>
                      </div>

                      <input
                        ref={studentFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleStudentFileUpload}
                      />

                      <div className="flex items-center justify-between text-[11px] text-[#716779]">
                        <span>Tavsiye: 16:9 veya 1024x570 net PNG</span>
                        <button
                          type="button"
                          onClick={() =>
                            setStudentSettings({
                              ...studentSettings,
                              portalImageUrl: '/student-portal-desktop.png',
                            })
                          }
                          className="text-[#4B075F] font-bold underline hover:text-[#D914C8]"
                        >
                          Varsayılan Görseli Yükle
                        </button>
                      </div>
                    </div>

                    {/* Section Title */}
                    <div>
                      <label className="block font-bold text-xs text-[#241329] mb-1">
                        Bölüm Başlığı (Tek Sıra)
                      </label>
                      <input
                        type="text"
                        value={studentSettings.sectionTitle}
                        onChange={(e) =>
                          setStudentSettings({
                            ...studentSettings,
                            sectionTitle: e.target.value,
                          })
                        }
                        placeholder="Öğrenciler İçin Tasarlanmış Akıllı Eğitim Ekranı"
                        className="w-full bg-[#FCF9FD] border border-[#E8DFEB] rounded-xl px-3.5 py-2.5 font-medium text-xs focus:outline-none focus:border-[#4B075F]"
                      />
                    </div>

                    {/* Badge Text */}
                    <div>
                      <label className="block font-bold text-xs text-[#241329] mb-1">
                        Üst Rozet Yazısı
                      </label>
                      <input
                        type="text"
                        value={studentSettings.badgeText}
                        onChange={(e) =>
                          setStudentSettings({
                            ...studentSettings,
                            badgeText: e.target.value,
                          })
                        }
                        placeholder="YENİ NESİL ÖĞRENCİ PORTALI"
                        className="w-full bg-[#FCF9FD] border border-[#E8DFEB] rounded-xl px-3.5 py-2.5 font-medium text-xs focus:outline-none focus:border-[#4B075F]"
                      />
                    </div>

                    {/* CTA Text & URL */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-xs text-[#241329] mb-1">
                          Buton Metni
                        </label>
                        <input
                          type="text"
                          value={studentSettings.ctaText}
                          onChange={(e) =>
                            setStudentSettings({
                              ...studentSettings,
                              ctaText: e.target.value,
                            })
                          }
                          placeholder="Demo Hesap İncele"
                          className="w-full bg-[#FCF9FD] border border-[#E8DFEB] rounded-xl px-3.5 py-2.5 font-medium text-xs focus:outline-none focus:border-[#4B075F]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-xs text-[#241329] mb-1">
                          Giriş Linki (URL)
                        </label>
                        <input
                          type="text"
                          value={studentSettings.ctaUrl}
                          onChange={(e) =>
                            setStudentSettings({
                              ...studentSettings,
                              ctaUrl: e.target.value,
                            })
                          }
                          placeholder="https://edu.oxonom.com/login"
                          className="w-full bg-[#FCF9FD] border border-[#E8DFEB] rounded-xl px-3.5 py-2.5 font-medium text-xs focus:outline-none focus:border-[#4B075F]"
                        />
                      </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="pt-4 border-t border-[#E8DFEB] flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={handleResetStudentShowcase}
                        className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all"
                      >
                        Sıfırla
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-5 py-2.5 rounded-xl bg-[#4B075F] hover:bg-[#620B79] text-white text-xs font-bold transition-all shadow-md shadow-[#4B075F]/20 flex items-center justify-center gap-2 active:scale-95"
                      >
                        <Save className="w-4 h-4" />
                        <span>Kaydet & Canlıya Al</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Live Preview Simulator */}
              <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-[#E8DFEB] shadow-sm flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8DFEB] mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-xs text-[#241329]">
                      Canlı 3D Mockup Önizlemesi
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#716779]">
                    Görünüm: Masaüstü Ekranı
                  </span>
                </div>

                {/* Simulated Window Container */}
                <div className="flex-1 rounded-2xl border border-[#E8DFEB] shadow-lg overflow-hidden bg-[#241329] flex flex-col">
                  {/* Chrome header */}
                  <div className="px-4 py-3 flex items-center justify-between border-b border-white/10 select-none">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
                      <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                      <span className="w-3 h-3 rounded-full bg-[#10B981]" />
                      <div className="h-3.5 w-px bg-white/20 mx-2" />
                      <span className="text-[11px] text-white/80 font-mono">
                        edu.oxonom.com/ogrenci-portali
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#16805D]/30 text-[#45C7A2] border border-[#16805D]/40 font-bold text-[10px]">
                      ● Canlı Öğrenci Portalı
                    </span>
                  </div>

                  {/* Rendered Image */}
                  <div className="relative bg-[#F9F7FA] overflow-hidden flex items-center justify-center min-h-[260px]">
                    {studentSettings.portalImageUrl ? (
                      <img
                        src={studentSettings.portalImageUrl}
                        alt="Öğrenci Portalı Önizleme"
                        className="w-full h-auto block object-cover max-h-[420px]"
                      />
                    ) : (
                      <div className="text-center p-8 text-[#716779]">
                        <ImageIcon className="w-12 h-12 mx-auto text-[#8D49A6]/40 mb-2" />
                        <p className="text-xs font-bold">Görsel seçilmedi</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-[#716779]">
                  <span>Ana sayfada 3D perspektif eğim efektiyle sergilenir.</span>
                  <a
                    href="/"
                    target="_blank"
                    className="text-[#4B075F] font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Ana Sayfada Gör</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: HERO SLIDER EKLE / DÜZENLE                       */}
      {/* ========================================================= */}
      {isEditingModalOpen && editingBanner && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-[#E8DFEB] flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E8DFEB] px-5 sm:px-7 py-4 shrink-0 bg-white">
              <div>
                <h3 className="font-black text-lg sm:text-xl text-[#241329]">
                  {banners.some((b) => b.id === editingBanner.id) ? 'Hero Slider Düzenle' : 'Yeni Hero Slider Ekle'}
                </h3>
                <p className="text-[11px] sm:text-xs text-[#716779] mt-0.5">
                  Görsel şeffaf PNG formatında olmalı ve sağ sütunda mor arkaplan üstünde parlayacaktır.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingModalOpen(false)}
                className="p-2 text-[#716779] hover:text-[#241329] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBannerModal} className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="overflow-y-auto px-5 sm:px-7 py-5 space-y-4 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#241329] mb-1">Üst Rozet (Badge) Metni</label>
                  <input
                    type="text"
                    value={editingBanner.badge}
                    onChange={(e) => setEditingBanner({ ...editingBanner, badge: e.target.value })}
                    placeholder="Örn: 14 GÜN ÜCRETSİZ DENEYİN — YENİ NESİL PLATFORM"
                    required
                    className="w-full bg-[#FCF9FD] border border-[#E8DFEB] rounded-xl px-3.5 py-2.5 font-medium text-xs focus:outline-none focus:border-[#4B075F]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#241329] mb-1">Vurgulanacak Kelime (Gradient)</label>
                  <input
                    type="text"
                    value={editingBanner.highlightText}
                    onChange={(e) => setEditingBanner({ ...editingBanner, highlightText: e.target.value })}
                    placeholder="Örn: yeni nesli."
                    required
                    className="w-full bg-[#FCF9FD] border border-[#E8DFEB] rounded-xl px-3.5 py-2.5 font-medium text-xs focus:outline-none focus:border-[#4B075F]"
                  />
                </div>
              </div>

              {/* Ready Badge Icons Selector */}
              <div className="p-3.5 bg-[#FCF9FD] rounded-2xl border border-[#E8DFEB] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-[#241329]">
                    Rozet İkonu (Hazır İkonlardan Seçin)
                  </label>
                  <span className="text-[10px] text-[#8D49A6] font-bold">14 Hazır Seçenek</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {READY_BADGE_ICONS.map((iconItem) => {
                    const isSelected = (editingBanner.badgeIcon || 'trial-14') === iconItem.id;
                    return (
                      <button
                        key={iconItem.id}
                        type="button"
                        onClick={() => setEditingBanner({ ...editingBanner, badgeIcon: iconItem.id })}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                          isSelected
                            ? 'bg-white border-[#4B075F] ring-2 ring-[#4B075F]/30 shadow-sm'
                            : 'bg-white/60 border-[#E8DFEB] hover:bg-white hover:border-[#8D49A6]'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-full bg-white border border-[#E8DFEB] p-1 flex items-center justify-center shadow-xs overflow-hidden">
                          {renderAdminBadgeIcon(iconItem.id)}
                        </div>
                        <span className="text-[9px] font-bold text-[#241329] line-clamp-1 w-full">
                          {iconItem.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#241329] mb-1">Ana Başlık (İlk Kısım)</label>
                <input
                  type="text"
                  value={editingBanner.title}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                  placeholder="Örn: Geleceğin eğitimini"
                  required
                  className="w-full bg-[#FCF9FD] border border-[#E8DFEB] rounded-xl px-3.5 py-2.5 font-medium text-xs focus:outline-none focus:border-[#4B075F]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#241329] mb-1">Açıklama Paragrafı</label>
                <textarea
                  rows={3}
                  value={editingBanner.description}
                  onChange={(e) => setEditingBanner({ ...editingBanner, description: e.target.value })}
                  placeholder="Banner açıklama metni..."
                  required
                  className="w-full bg-[#FCF9FD] border border-[#E8DFEB] rounded-xl px-3.5 py-2.5 font-medium text-xs focus:outline-none focus:border-[#4B075F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#241329] mb-1">1. Buton Metni</label>
                  <input
                    type="text"
                    value={editingBanner.primaryCtaText}
                    onChange={(e) => setEditingBanner({ ...editingBanner, primaryCtaText: e.target.value })}
                    required
                    className="w-full bg-[#FCF9FD] border border-[#E8DFEB] rounded-xl px-3.5 py-2.5 font-medium text-xs focus:outline-none focus:border-[#4B075F]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#241329] mb-1">1. Buton Hedef URL</label>
                  <input
                    type="text"
                    value={editingBanner.primaryCtaUrl}
                    onChange={(e) => setEditingBanner({ ...editingBanner, primaryCtaUrl: e.target.value })}
                    required
                    className="w-full bg-[#FCF9FD] border border-[#E8DFEB] rounded-xl px-3.5 py-2.5 font-medium text-xs focus:outline-none focus:border-[#4B075F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#241329] mb-1">2. Buton Metni (İsteğe Bağlı)</label>
                  <input
                    type="text"
                    value={editingBanner.secondaryCtaText || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, secondaryCtaText: e.target.value })}
                    className="w-full bg-[#FCF9FD] border border-[#E8DFEB] rounded-xl px-3.5 py-2.5 font-medium text-xs focus:outline-none focus:border-[#4B075F]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#241329] mb-1">2. Buton Hedef URL</label>
                  <input
                    type="text"
                    value={editingBanner.secondaryCtaUrl || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, secondaryCtaUrl: e.target.value })}
                    className="w-full bg-[#FCF9FD] border border-[#E8DFEB] rounded-xl px-3.5 py-2.5 font-medium text-xs focus:outline-none focus:border-[#4B075F]"
                  />
                </div>
              </div>

              {/* PNG Image Picker & Upload */}
              <div className="p-4 bg-[#FCF9FD] rounded-2xl border border-[#E8DFEB] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-[#241329]">
                    Hero Sağ Sütun PNG Görseli
                  </label>
                  <span className="text-[10px] text-[#16805D] font-bold">✓ Şeffaf PNG Destekli</span>
                </div>

                {/* Preset Options */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setEditingBanner({ ...editingBanner, imageUrl: preset.url })}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                        editingBanner.imageUrl === preset.url
                          ? 'bg-white border-[#4B075F] ring-2 ring-[#4B075F]/30 shadow-sm'
                          : 'bg-white/60 border-[#E8DFEB] hover:bg-white hover:border-[#8D49A6]'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg bg-[#241329] p-1 flex items-center justify-center overflow-hidden">
                        <img src={preset.url} alt={preset.label} className="w-full h-full object-contain" />
                      </div>
                      <span className="text-[10px] font-bold text-[#241329] truncate w-full">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Custom Upload or URL */}
                <div className="pt-2 border-t border-[#E8DFEB] grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <span className="text-[11px] text-[#716779] block mb-1">Cihazdan PNG Yükleyin:</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 px-3 rounded-xl border border-dashed border-[#8D49A6] bg-white hover:bg-[#FCE8FA]/40 text-[#4B075F] text-xs font-bold flex items-center justify-center gap-2 transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      PNG Dosyası Seç
                    </button>
                  </div>

                  <div>
                    <span className="text-[11px] text-[#716779] block mb-1">Veya PNG URL Girin:</span>
                    <input
                      type="text"
                      value={editingBanner.imageUrl}
                      onChange={(e) => setEditingBanner({ ...editingBanner, imageUrl: e.target.value })}
                      placeholder="https://... veya /oxonom-mascot.png"
                      className="w-full bg-white border border-[#E8DFEB] rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                {/* Live Image Preview */}
                <div className="pt-2 flex items-center gap-4 bg-[#241329] p-3 rounded-xl border border-white/10">
                  <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 p-1 flex items-center justify-center shrink-0">
                    <img
                      src={editingBanner.imageUrl}
                      alt="Önizleme"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-white text-xs">
                    <span className="font-bold text-[#FCE8FA] block">Seçilen Görsel Önizlemesi</span>
                    <span className="text-white/60 text-[11px]">
                      Koyu mor arayüz üzerinde şeffaf PNG olarak kusursuz görünecektir.
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FCF9FD] border border-[#E8DFEB]">
                <span className="font-bold text-[#241329]">Bu Banner Yayında Olsun mu?</span>
                <button
                  type="button"
                  onClick={() => setEditingBanner({ ...editingBanner, active: !editingBanner.active })}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    editingBanner.active ? 'bg-[#16805D]' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      editingBanner.active ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              </div>

              {/* Modal Buttons (Fixed at bottom) */}
              <div className="flex items-center justify-end gap-3 px-5 sm:px-7 py-4 border-t border-[#E8DFEB] bg-[#FCF9FD] shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditingModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-all text-xs cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#D914C8] hover:bg-[#620B79] text-white font-bold transition-all shadow-md text-xs flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Sliderı Kaydet & Yayınla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: MENÜ EKLE / DÜZENLE                              */}
      {/* ========================================================= */}
      {isMenuModalOpen && editingMenu && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-[#E8DFEB] flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E8DFEB] px-5 sm:px-7 py-4 shrink-0 bg-white">
              <div>
                <h3 className="font-black text-lg sm:text-xl text-[#241329]">
                  {navMenus.some((m) => m.id === editingMenu.id) ? 'Menüyü Düzenle' : 'Yeni Menü Ekle'}
                </h3>
                <p className="text-[11px] sm:text-xs text-[#716779] mt-0.5">
                  Menü tipini seçin (Direkt Bağlantı, Dropdown Açılır Menü veya Mega Menü).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuModalOpen(false)}
                className="p-2 text-[#716779] hover:text-[#241329] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMenuModal} className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="overflow-y-auto px-5 sm:px-7 py-5 space-y-4 flex-1">
              <div>
                <label className="block font-bold text-xs text-[#241329] mb-1">Menü Başlığı</label>
                <input
                  type="text"
                  value={editingMenu.title}
                  onChange={(e) => setEditingMenu({ ...editingMenu, title: e.target.value })}
                  placeholder="Örn: Modüller & Atölyeler, Paketler, Hakkımızda"
                  required
                  className="w-full bg-[#FCF9FD] border border-[#E8DFEB] rounded-xl px-3.5 py-2.5 font-medium text-xs focus:outline-none focus:border-[#4B075F]"
                />
              </div>

              {/* Menu Type Selector */}
              <div>
                <label className="block font-bold text-xs text-[#241329] mb-1.5">Menü Türü</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingMenu({ ...editingMenu, type: 'link' })}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all text-center ${
                      editingMenu.type === 'link'
                        ? 'bg-[#4B075F] text-white border-[#4B075F] shadow-sm'
                        : 'bg-[#FCF9FD] border-[#E8DFEB] text-[#716779] hover:bg-white'
                    }`}
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Direkt Link</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingMenu({ ...editingMenu, type: 'dropdown' })}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all text-center ${
                      editingMenu.type === 'dropdown'
                        ? 'bg-[#4B075F] text-white border-[#4B075F] shadow-sm'
                        : 'bg-[#FCF9FD] border-[#E8DFEB] text-[#716779] hover:bg-white'
                    }`}
                  >
                    <List className="w-4 h-4" />
                    <span>Dropdown Menü</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingMenu({ ...editingMenu, type: 'megamenu' })}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all text-center ${
                      editingMenu.type === 'megamenu'
                        ? 'bg-[#4B075F] text-white border-[#4B075F] shadow-sm'
                        : 'bg-[#FCF9FD] border-[#E8DFEB] text-[#716779] hover:bg-white'
                    }`}
                  >
                    <FolderTree className="w-4 h-4" />
                    <span>Mega Menü</span>
                  </button>
                </div>
              </div>

              {/* Built-in MegaMenu Preset if type is megamenu */}
              {editingMenu.type === 'megamenu' && (
                <div className="p-3 bg-[#FCF9FD] rounded-xl border border-[#E8DFEB] space-y-1.5">
                  <label className="block font-bold text-xs text-[#241329]">Mega Menü Şablonu</label>
                  <select
                    value={editingMenu.megaMenuType || 'custom'}
                    onChange={(e) => setEditingMenu({ ...editingMenu, megaMenuType: e.target.value as any })}
                    className="w-full bg-white border border-[#E8DFEB] rounded-lg px-3 py-2 text-xs font-medium"
                  >
                    <option value="products">Zengin Atölyeler Vitrini (Oxonom Edu Modüller)</option>
                    <option value="sectors">Kademeler & Çözümler (MEB K-12 Grid)</option>
                    <option value="packages">Paketler & Lisanslar (3 Sütunlu Kartlar)</option>
                    <option value="custom">Özel Çok Sütunlu Mega Menü</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-xs text-[#241329] mb-1">Bağlantı Yolu (Path / URL)</label>
                  <input
                    type="text"
                    value={editingMenu.path || ''}
                    onChange={(e) => setEditingMenu({ ...editingMenu, path: e.target.value })}
                    placeholder="/entegrasyonlar veya https://..."
                    className="w-full bg-[#FCF9FD] border border-[#E8DFEB] rounded-xl px-3.5 py-2.5 font-medium text-xs focus:outline-none focus:border-[#4B075F]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-xs text-[#241329] mb-1">Rozet / Tag (İsteğe Bağlı)</label>
                  <input
                    type="text"
                    value={editingMenu.badge || ''}
                    onChange={(e) => setEditingMenu({ ...editingMenu, badge: e.target.value })}
                    placeholder="Örn: Yeni, Popüler, Avantajlı"
                    className="w-full bg-[#FCF9FD] border border-[#E8DFEB] rounded-xl px-3.5 py-2.5 font-medium text-xs focus:outline-none focus:border-[#4B075F]"
                  />
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FCF9FD] border border-[#E8DFEB]">
                <span className="font-bold text-xs text-[#241329]">Menü Yayında Olsun mu?</span>
                <button
                  type="button"
                  onClick={() => setEditingMenu({ ...editingMenu, active: !editingMenu.active })}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    editingMenu.active ? 'bg-[#16805D]' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      editingMenu.active ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              </div>

              {/* Modal Buttons (Fixed at bottom) */}
              <div className="flex items-center justify-end gap-3 px-5 sm:px-7 py-4 border-t border-[#E8DFEB] bg-[#FCF9FD] shrink-0">
                <button
                  type="button"
                  onClick={() => setIsMenuModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-all text-xs cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#4B075F] hover:bg-[#620B79] text-white font-bold transition-all shadow-md text-xs flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Menüyü Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: ALT ÖGELER / MEGA MENÜ İÇERİK YÖNETİCİSİ         */}
      {/* ========================================================= */}
      {isSubItemsModalOpen && selectedMenuForSubItems && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-[#E8DFEB] flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E8DFEB] px-5 sm:px-7 py-4 shrink-0 bg-white">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-[#8D49A6] bg-[#FCE8FA] px-2 py-0.5 rounded-md">
                    {selectedMenuForSubItems.title}
                  </span>
                  <h3 className="font-black text-lg sm:text-xl text-[#241329]">Alt Menü & İçerik Yönetimi</h3>
                </div>
                <p className="text-[11px] sm:text-xs text-[#716779] mt-0.5">
                  Bu menünün altındaki linkleri, açıklamaları ve ikonları yönetin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSubItemsModalOpen(false)}
                className="p-2 text-[#716779] hover:text-[#241329] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto px-5 sm:px-7 py-5 space-y-4 flex-1">
              {/* Add New SubItem Form Toggle */}
              {!isAddingSubItem ? (
                <button
                  type="button"
                  onClick={handleStartAddSubItem}
                  className="w-full py-3 bg-[#FCF9FD] border-2 border-dashed border-[#8D49A6]/40 hover:border-[#4B075F] text-[#4B075F] font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all hover:bg-[#FCE8FA]/30"
                >
                  <Plus className="w-4 h-4" />
                  Yeni Alt Menü / Öge Ekle
                </button>
              ) : (
                <form onSubmit={handleSaveSubItem} className="p-4 rounded-2xl bg-[#FCF9FD] border border-[#8D49A6]/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E8DFEB] pb-2">
                    <span className="font-bold text-xs text-[#4B075F]">
                      {editingSubItem?.title ? 'Alt Ögeyi Düzenle' : 'Yeni Alt Öge Formu'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingSubItem(false)}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      Kapat
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#241329] mb-1">Başlık</label>
                      <input
                        type="text"
                        value={editingSubItem?.title || ''}
                        onChange={(e) => editingSubItem && setEditingSubItem({ ...editingSubItem, title: e.target.value })}
                        placeholder="Örn: 1 Dk Hızlı Okuma"
                        required
                        className="w-full bg-white border border-[#E8DFEB] rounded-lg px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#241329] mb-1">Bağlantı Yolu (Path)</label>
                      <input
                        type="text"
                        value={editingSubItem?.path || ''}
                        onChange={(e) => editingSubItem && setEditingSubItem({ ...editingSubItem, path: e.target.value })}
                        placeholder="/web-site"
                        required
                        className="w-full bg-white border border-[#E8DFEB] rounded-lg px-3 py-2 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#241329] mb-1">Açıklama (İsteğe Bağlı)</label>
                    <input
                      type="text"
                      value={editingSubItem?.description || ''}
                      onChange={(e) => editingSubItem && setEditingSubItem({ ...editingSubItem, description: e.target.value })}
                      placeholder="Örn: 60 saniye canlı WPM sayacı ve MEB dik yazı"
                      className="w-full bg-white border border-[#E8DFEB] rounded-lg px-3 py-2 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#241329] mb-1">Rozet (Tag)</label>
                      <input
                        type="text"
                        value={editingSubItem?.badge || ''}
                        onChange={(e) => editingSubItem && setEditingSubItem({ ...editingSubItem, badge: e.target.value })}
                        placeholder="Örn: Popüler, Yeni"
                        className="w-full bg-white border border-[#E8DFEB] rounded-lg px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#241329] mb-1">Kategori / Grup</label>
                      <input
                        type="text"
                        value={editingSubItem?.category || ''}
                        onChange={(e) => editingSubItem && setEditingSubItem({ ...editingSubItem, category: e.target.value })}
                        placeholder="Örn: Temel Atölyeler, İlkokul"
                        className="w-full bg-white border border-[#E8DFEB] rounded-lg px-3 py-2 text-xs"
                      />
                    </div>
                  </div>

                  {/* Icon Selector */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#241329] mb-1.5">İkon Seçin</label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {AVAILABLE_SUB_ICONS.map((ic) => {
                        const isSel = (editingSubItem?.icon || 'PenTool') === ic.id;
                        const IconC = ic.comp;
                        return (
                          <button
                            key={ic.id}
                            type="button"
                            onClick={() => editingSubItem && setEditingSubItem({ ...editingSubItem, icon: ic.id })}
                            className={`p-2 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                              isSel
                                ? 'bg-[#4B075F] text-white border-[#4B075F] shadow-sm'
                                : 'bg-white border-[#E8DFEB] text-[#716779] hover:bg-[#FCF9FD]'
                            }`}
                          >
                            <IconC className="w-4 h-4" />
                            <span className="text-[9px] truncate w-full font-bold">{ic.id}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingSubItem(false)}
                      className="px-3 py-1.5 rounded-lg border text-xs font-bold text-slate-600 hover:bg-slate-100"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-[#4B075F] text-white text-xs font-bold hover:bg-[#620B79] flex items-center gap-1.5 shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Ögeyi Kaydet
                    </button>
                  </div>
                </form>
              )}

              {/* Existing Sub-Items List */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#716779] block">
                  Kayıtlı Alt Ögeler ({selectedMenuForSubItems.subItems?.length || 0})
                </span>

                {(!selectedMenuForSubItems.subItems || selectedMenuForSubItems.subItems.length === 0) ? (
                  <div className="p-6 text-center bg-[#FCF9FD] rounded-2xl border border-[#E8DFEB] text-xs text-[#716779]">
                    Henüz eklenmiş alt menü ögesi bulunmuyor. Yukarıdaki butonla ekleyebilirsiniz.
                  </div>
                ) : (
                  selectedMenuForSubItems.subItems.map((sub) => {
                    const foundIcon = AVAILABLE_SUB_ICONS.find((i) => i.id === sub.icon);
                    const SubIconComp = foundIcon?.comp || Sparkles;

                    return (
                      <div
                        key={sub.id}
                        className="p-3 bg-white rounded-xl border border-[#E8DFEB] flex items-center justify-between gap-3 shadow-xs hover:border-[#4B075F]/30 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#FCE8FA] text-[#4B075F] flex items-center justify-center shrink-0">
                            <SubIconComp className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-[#241329] truncate">{sub.title}</span>
                              {sub.badge && (
                                <span className="text-[8px] px-1.5 py-0.2 bg-[#D914C8] text-white rounded font-bold">
                                  {sub.badge}
                                </span>
                              )}
                              {sub.category && (
                                <span className="text-[8px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                                  {sub.category}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#716779] truncate">{sub.description || sub.path}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSubItem(sub);
                              setIsAddingSubItem(true);
                            }}
                            className="p-1.5 text-[#4B075F] hover:bg-[#FCE8FA] rounded-lg transition-colors"
                            title="Düzenle"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSubItem(sub.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="px-5 sm:px-7 py-4 border-t border-[#E8DFEB] bg-[#FCF9FD] flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsSubItemsModalOpen(false)}
                className="px-6 py-2.5 bg-[#4B075F] text-white rounded-xl text-xs font-bold hover:bg-[#620B79] transition-all shadow-md cursor-pointer"
              >
                Tamamla & Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
