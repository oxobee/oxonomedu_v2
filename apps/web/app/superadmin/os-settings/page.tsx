'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sliders,
  Image as ImageIcon,
  Tv,
  Plus,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  Upload,
  ExternalLink,
  Eye,
  Monitor,
  Smartphone,
  Sparkles,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertCircle,
  X,
  Palette,
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import {
  DesktopOSConfig,
  DesktopHeroSlide,
  DesktopShortcutItem,
  ShortcutCategory,
  SHORTCUT_CATEGORIES,
  CURATED_POSTER_PRESETS,
  getDesktopOSConfig,
  saveDesktopOSConfig,
  resetDesktopOSConfig,
  DEFAULT_DESKTOP_OS_CONFIG,
} from '@/lib/os/desktopOsStorage'

export default function SuperadminOSSettingsPage() {
  const [config, setConfig] = useState<DesktopOSConfig>(DEFAULT_DESKTOP_OS_CONFIG)
  const [activeTab, setActiveTab] = useState<'shortcuts' | 'slider' | 'preview'>('shortcuts')
  const [selectedCategory, setSelectedCategory] = useState<ShortcutCategory | 'all'>('all')

  // Editing state for shortcut
  const [editingShortcut, setEditingShortcut] = useState<DesktopShortcutItem | null>(null)
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false)
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false)
  const [targetForPreset, setTargetForPreset] = useState<'shortcut' | 'slide-web' | 'slide-mobile' | null>(null)

  // Editing state for slide
  const [editingSlide, setEditingSlide] = useState<DesktopHeroSlide | null>(null)
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false)

  // Preview device mode
  const [previewDevice, setPreviewDevice] = useState<'web' | 'mobile'>('web')

  // Load config on mount
  useEffect(() => {
    const loaded = getDesktopOSConfig()
    setConfig(loaded)
  }, [])

  // Save changes handler
  const handleSave = () => {
    saveDesktopOSConfig(config)
    toast.success('Öğretmen OS ayarları başarıyla kaydedildi ve yayınlandı!')
  }

  // Reset to defaults
  const handleReset = () => {
    if (confirm('Tüm ayarları varsayılan film afişleri ve slider içeriğine döndürmek istediğinize emin misiniz?')) {
      const reset = resetDesktopOSConfig()
      setConfig(reset)
      toast.success('Ayarlar varsayılana sıfırlandı!')
    }
  }

  // File upload to Base64
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen geçerli bir görsel dosyası seçin (PNG, JPG, WebP).')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      if (result) {
        onSuccess(result)
        toast.success('Görsel başarıyla yüklendi!')
      }
    }
    reader.readAsDataURL(file)
  }

  // Save shortcut modal
  const handleSaveShortcut = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingShortcut) return

    const exists = config.shortcuts.some((s) => s.id === editingShortcut.id)
    let updatedShortcuts: DesktopShortcutItem[]

    if (exists) {
      updatedShortcuts = config.shortcuts.map((s) =>
        s.id === editingShortcut.id ? editingShortcut : s
      )
    } else {
      updatedShortcuts = [...config.shortcuts, editingShortcut]
    }

    const newConfig = { ...config, shortcuts: updatedShortcuts }
    setConfig(newConfig)
    saveDesktopOSConfig(newConfig)
    setIsShortcutModalOpen(false)
    setEditingShortcut(null)
    toast.success('Kısayol afişi güncellendi!')
  }

  // Delete shortcut
  const handleDeleteShortcut = (id: string) => {
    if (confirm('Bu kısayolu kaldırmak istediğinize emin misiniz?')) {
      const updatedShortcuts = config.shortcuts.filter((s) => s.id !== id)
      const newConfig = { ...config, shortcuts: updatedShortcuts }
      setConfig(newConfig)
      saveDesktopOSConfig(newConfig)
      toast.success('Kısayol silindi!')
    }
  }

  // Save slide modal
  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSlide) return

    const exists = config.heroSlides.some((s) => s.id === editingSlide.id)
    let updatedSlides: DesktopHeroSlide[]

    if (exists) {
      updatedSlides = config.heroSlides.map((s) =>
        s.id === editingSlide.id ? editingSlide : s
      )
    } else {
      updatedSlides = [...config.heroSlides, editingSlide]
    }

    const newConfig = { ...config, heroSlides: updatedSlides }
    setConfig(newConfig)
    saveDesktopOSConfig(newConfig)
    setIsSlideModalOpen(false)
    setEditingSlide(null)
    toast.success('Hero Slider slaytı güncellendi!')
  }

  // Delete slide
  const handleDeleteSlide = (id: string) => {
    if (confirm('Bu slaytı kaldırmak istediğinize emin misiniz?')) {
      const updatedSlides = config.heroSlides.filter((s) => s.id !== id)
      const newConfig = { ...config, heroSlides: updatedSlides }
      setConfig(newConfig)
      saveDesktopOSConfig(newConfig)
      toast.success('Slayt silindi!')
    }
  }

  // Filtered shortcuts
  const filteredShortcuts = config.shortcuts.filter((s) => {
    if (selectedCategory === 'all') return true
    return s.category === selectedCategory
  })

  return (
    <div className="space-y-8 pb-20">
      <Toaster position="top-right" />

      {/* ── TOP HEADER & PUBLISH BAR ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#141926] border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-wider mb-1">
            <Sliders size={14} />
            <span>SUPERADMIN · OS SETTINGS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Öğretmen Masaüstü (OS) Yönetimi
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Film afişi kısayolları, Web & Mobil Hero Slider bannerları ve pencere içeriklerini yapılandırın.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            className="h-10 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold flex items-center gap-2 transition-colors border border-white/10 cursor-pointer"
            title="Tüm ayarları orijinal haline sıfırla"
          >
            <RotateCcw size={14} />
            <span>Varsayılana Sıfırla</span>
          </button>

          <Link
            href="/teacher/desktop-os"
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-black flex items-center gap-2 transition-transform hover:scale-105"
          >
            <Monitor size={14} />
            <span>Canlı OS'i Aç</span>
            <ExternalLink size={12} />
          </Link>

          <button
            type="button"
            onClick={handleSave}
            className="h-10 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Check size={16} />
            <span>Kaydet & Yayınla</span>
          </button>
        </div>
      </div>

      {/* ── CRITICAL DIMENSION GUIDE BANNER ── */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10 border-2 border-amber-500/30 space-y-4">
        <div className="flex items-center gap-2 text-amber-400 font-black text-sm uppercase tracking-wider">
          <Info size={18} />
          <span>ÖNERİLEN GÖRSEL BOYUTLARI VE FORMAT REHBERİ</span>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          Öğretmen OS ekranının tıpkı Netflix / Peacock / Apple TV arayüzlerindeki gibi pürüzsüz ve yüksek çözünürlüklü görünmesi için yükleyeceğiniz görsellerde aşağıdaki boyutları tercih ediniz:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
            <div className="text-amber-300 font-extrabold text-xs flex items-center gap-1.5">
              <span>🎬 Dikey Film Afişi</span>
            </div>
            <div className="text-lg font-black text-white font-mono">600 x 900 px</div>
            <p className="text-[11px] text-gray-400">
              Yoklama Al, Akıllı Tahta, Sınav vb. 2:3 dikey poster formatı.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
            <div className="text-cyan-300 font-extrabold text-xs flex items-center gap-1.5">
              <span>🖼️ Yatay Kart / Arşiv</span>
            </div>
            <div className="text-lg font-black text-white font-mono">1280 x 720 px</div>
            <p className="text-[11px] text-gray-400">
              MEB Kitapları, Dosyalar & Materyal için 16:9 yatay kart formatı.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
            <div className="text-purple-300 font-extrabold text-xs flex items-center gap-1.5">
              <span>💻 Web Hero Slider</span>
            </div>
            <div className="text-lg font-black text-white font-mono">1920 x 800 px</div>
            <p className="text-[11px] text-gray-400">
              Geniş masaüstü ekranlarında en üstte sinematik vitrin bannerı.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
            <div className="text-rose-300 font-extrabold text-xs flex items-center gap-1.5">
              <span>📱 Mobil Hero Slider</span>
            </div>
            <div className="text-lg font-black text-white font-mono">800 x 1200 px</div>
            <p className="text-[11px] text-gray-400">
              Akıllı telefonlarda tam ekran dikey afiş vitrini (2:3 veya 3:4).
            </p>
          </div>
        </div>
      </div>

      {/* ── TAB NAVIGATION ── */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('shortcuts')}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'shortcuts'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
              : 'bg-white/5 hover:bg-white/10 text-gray-300'
          }`}
        >
          <ImageIcon size={15} />
          <span>Menü Film Afişleri ({config.shortcuts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('slider')}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'slider'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
              : 'bg-white/5 hover:bg-white/10 text-gray-300'
          }`}
        >
          <Tv size={15} />
          <span>Web & Mobil Hero Slider ({config.heroSlides.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'preview'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
              : 'bg-white/5 hover:bg-white/10 text-gray-300'
          }`}
        >
          <Eye size={15} />
          <span>Canlı Önizleme Simülatörü</span>
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 1: MENU SHORTCUTS POSTER ART MANAGEMENT                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'shortcuts' && (
        <div className="space-y-6">
          {/* Categories Pill Filter & Add Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {SHORTCUT_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-amber-500 text-black font-black shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300'
                  }`}
                >
                  {cat.title}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingShortcut({
                  id: `custom-${Date.now()}`,
                  title: 'Yeni Menü Kısayolu',
                  subtitle: 'Kısayol açıklaması',
                  category: 'core',
                  posterImage: CURATED_POSTER_PRESETS[0].url,
                  format: 'portrait',
                  badge: 'YENİ',
                  badgeColor: 'bg-emerald-500 text-white',
                  tagInfo: 'HD',
                  windowId: 'attendance',
                  order: config.shortcuts.length + 1,
                  isFeatured: false,
                })
                setIsShortcutModalOpen(true)
              }}
              className="h-9 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-black flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Yeni Film Afişi Ekle</span>
            </button>
          </div>

          {/* Grid of Posters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredShortcuts.map((item) => {
              const isLandscape = item.format === 'landscape'

              return (
                <div
                  key={item.id}
                  className={`group relative rounded-2xl bg-[#141926] border border-white/10 hover:border-amber-400/60 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 ${
                    isLandscape ? 'col-span-2' : ''
                  }`}
                >
                  {/* Poster Image Container */}
                  <div
                    className={`relative w-full overflow-hidden bg-black/60 ${
                      isLandscape ? 'aspect-[16/9]' : 'aspect-[2/3]'
                    }`}
                  >
                    <img
                      src={item.posterImage}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                    {/* Badges on Top */}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none">
                      {item.badge && (
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded shadow-md ${
                            item.badgeColor || 'bg-emerald-500 text-white'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {item.tagInfo && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-black/70 text-gray-200 border border-white/20">
                          {item.tagInfo}
                        </span>
                      )}
                    </div>

                    {/* Window Type Indicator */}
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="text-[10px] font-mono text-amber-300 font-bold bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs inline-block">
                        Pencere: {item.windowId}
                      </div>
                    </div>
                  </div>

                  {/* Info & Edit Actions */}
                  <div className="p-3 bg-[#111520] space-y-2">
                    <div>
                      <h2 className="font-black text-xs text-white truncate">{item.title}</h2>
                      <p className="text-[10px] text-gray-400 truncate">{item.subtitle}</p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-white/10">
                      <span className="text-[9px] text-gray-400 font-bold uppercase">
                        {item.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingShortcut(item)
                            setIsShortcutModalOpen(true)
                          }}
                          className="w-7 h-7 rounded-lg bg-white/10 hover:bg-amber-500 hover:text-black text-gray-200 flex items-center justify-center transition-colors cursor-pointer"
                          title="Afişi ve Bilgileri Düzenle"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteShortcut(item.id)}
                          className="w-7 h-7 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                          title="Kısayolu Sil"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 2: HERO SLIDER MANAGEMENT (WEB & MOBILE)                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'slider' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white">Hero Slider Slaytları</h2>
              <p className="text-xs text-gray-400">
                Hem Web (1920x800px) hem de Mobil (800x1200px) için özel afiş ve aksiyon linki tanımlayın.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingSlide({
                  id: `slide-${Date.now()}`,
                  title: 'Yeni Duyuru & Etkinlik',
                  subtitle: 'Açıklama ve detay metni buraya gelecek.',
                  badge: 'DUYURU',
                  webImage: CURATED_POSTER_PRESETS[13].url,
                  mobileImage: CURATED_POSTER_PRESETS[0].url,
                  actionText: 'Hemen İncele',
                  actionLink: 'smartboard',
                  order: config.heroSlides.length + 1,
                  isActive: true,
                })
                setIsSlideModalOpen(true)
              }}
              className="h-9 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-black flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Yeni Slayt Ekle</span>
            </button>
          </div>

          <div className="space-y-4">
            {config.heroSlides.map((slide, idx) => (
              <div
                key={slide.id}
                className="p-5 rounded-3xl bg-[#141926] border border-white/10 hover:border-amber-400/40 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
              >
                {/* Left: Web & Mobile Previews */}
                <div className="flex items-center gap-3 w-full lg:w-auto">
                  {/* Web Banner Preview (16:9 approx) */}
                  <div className="relative w-40 sm:w-48 aspect-[16/9] rounded-xl overflow-hidden bg-black/60 border border-white/20 shrink-0">
                    <img
                      src={slide.webImage}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-black bg-black/75 text-amber-300">
                      WEB 1920x800
                    </span>
                  </div>

                  {/* Mobile Banner Preview (2:3 approx) */}
                  <div className="relative w-16 sm:w-20 aspect-[2/3] rounded-xl overflow-hidden bg-black/60 border border-white/20 shrink-0">
                    <img
                      src={slide.mobileImage}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1 left-1 px-1 py-0.5 rounded text-[7px] font-black bg-black/75 text-rose-300">
                      MOBİL
                    </span>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {slide.badge || 'SLAYT'}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">Sıra: {slide.order}</span>
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                          slide.isActive
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {slide.isActive ? 'Yayında' : 'Pasif'}
                      </span>
                    </div>
                    <h3 className="font-black text-sm text-white truncate max-w-md">
                      {slide.title}
                    </h3>
                    <p className="text-xs text-gray-400 truncate max-w-md">{slide.subtitle}</p>
                    <div className="text-[11px] font-mono text-cyan-300 pt-0.5">
                      Buton: &quot;{slide.actionText}&quot; ➔ Açılacak: <span className="font-bold underline">{slide.actionLink}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSlide(slide)
                      setIsSlideModalOpen(true)
                    }}
                    className="h-9 px-3.5 rounded-xl bg-white/10 hover:bg-amber-500 hover:text-black text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit2 size={13} />
                    <span>Düzenle</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteSlide(slide.id)}
                    className="h-9 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Sil</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 3: LIVE PREVIEW SIMULATOR                                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#141926] border border-white/10">
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-amber-400" />
              <span className="font-black text-sm text-white">Canlı Önizleme Cihazı:</span>
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('web')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    previewDevice === 'web'
                      ? 'bg-amber-500 text-black font-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Monitor size={14} />
                  <span>Web / Masaüstü (1920px)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    previewDevice === 'mobile'
                      ? 'bg-amber-500 text-black font-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Smartphone size={14} />
                  <span>Mobil Telefon (iPhone / Android)</span>
                </button>
              </div>
            </div>

            <Link
              href="/teacher/desktop-os"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-black text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Yeni Sekmede Tam Ekran Aç</span>
              <ExternalLink size={12} />
            </Link>
          </div>

          {/* Simulator Box */}
          <div className="flex justify-center p-4 bg-black/80 rounded-3xl border border-white/10 min-h-[500px] overflow-hidden">
            {previewDevice === 'web' ? (
              // Web Simulator
              <div className="w-full max-w-5xl rounded-2xl overflow-hidden border border-white/20 bg-[#0B0D13] p-4 space-y-6">
                {/* Hero Slide Preview */}
                {config.heroSlides[0] && (
                  <div className="relative aspect-[21/9] rounded-2xl overflow-hidden border border-white/10">
                    <img
                      src={config.heroSlides[0].webImage}
                      alt={config.heroSlides[0].title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-6 flex flex-col justify-end">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500 text-black w-fit mb-2">
                        {config.heroSlides[0].badge}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-white">
                        {config.heroSlides[0].title}
                      </h2>
                      <p className="text-xs text-gray-300 max-w-lg mt-1">
                        {config.heroSlides[0].subtitle}
                      </p>
                      <div className="mt-3">
                        <button className="h-8 px-4 rounded-xl bg-amber-500 text-black font-black text-xs">
                          {config.heroSlides[0].actionText}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Posters Row Preview */}
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider mb-3">
                    Öne Çıkan Hızlı İşlemler
                  </h3>
                  <div className="grid grid-cols-5 gap-3">
                    {config.shortcuts.slice(0, 5).map((s) => (
                      <div
                        key={s.id}
                        className="rounded-xl overflow-hidden bg-[#141926] border border-white/10"
                      >
                        <div className="aspect-[2/3] relative">
                          <img
                            src={s.posterImage}
                            alt={s.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                        </div>
                        <div className="p-2">
                          <div className="text-xs font-black text-white truncate">{s.title}</div>
                          <div className="text-[9px] text-gray-400 truncate">{s.subtitle}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Mobile Simulator (Image 1 style)
              <div className="w-[340px] rounded-[36px] overflow-hidden border-4 border-gray-700 bg-[#0B0D13] p-3 space-y-4 shadow-2xl">
                {/* Mobile Top Notch bar */}
                <div className="flex items-center justify-between text-[11px] text-gray-400 px-2">
                  <span>9:41</span>
                  <div className="w-16 h-4 bg-black rounded-full" />
                  <span>5G 100%</span>
                </div>

                {/* Mobile Hero Banner */}
                {config.heroSlides[0] && (
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10">
                    <img
                      src={config.heroSlides[0].mobileImage}
                      alt={config.heroSlides[0].title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-4 flex flex-col justify-end">
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500 text-black w-fit mb-1">
                        {config.heroSlides[0].badge}
                      </span>
                      <h2 className="text-base font-black text-white leading-tight">
                        {config.heroSlides[0].title}
                      </h2>
                      <button className="mt-2 h-7 w-full rounded-xl bg-amber-500 text-black font-black text-xs">
                        {config.heroSlides[0].actionText}
                      </button>
                    </div>
                  </div>
                )}

                {/* Mobile Poster row */}
                <div>
                  <div className="text-[11px] font-black text-white mb-2">Öne Çıkanlar</div>
                  <div className="grid grid-cols-3 gap-2">
                    {config.shortcuts.slice(0, 3).map((s) => (
                      <div
                        key={s.id}
                        className="rounded-xl overflow-hidden bg-[#141926] border border-white/10 aspect-[2/3] relative"
                      >
                        <img
                          src={s.posterImage}
                          alt={s.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                        <div className="absolute bottom-1 left-1 right-1 text-[9px] font-bold text-white truncate">
                          {s.title}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SHORTCUT EDIT MODAL                                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isShortcutModalOpen && editingShortcut && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-xl rounded-3xl bg-[#141926] border border-white/20 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon size={18} className="text-amber-400" />
                  <h3 className="font-black text-base text-white">Film Afişi & Menü Düzenle</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsShortcutModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveShortcut} className="space-y-4">
                {/* Poster Image Preview and Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300 flex items-center justify-between">
                    <span>Afiş Görseli (Film Afişi Formatı)</span>
                    <span className="text-[10px] text-amber-300 font-mono">
                      Önerilen: 600x900px (2:3)
                    </span>
                  </label>

                  <div className="flex items-start gap-4">
                    {/* Thumbnail preview */}
                    <div
                      className={`relative rounded-xl overflow-hidden bg-black/60 border border-white/20 shrink-0 ${
                        editingShortcut.format === 'landscape'
                          ? 'w-32 aspect-[16/9]'
                          : 'w-24 aspect-[2/3]'
                      }`}
                    >
                      <img
                        src={editingShortcut.posterImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={editingShortcut.posterImage}
                        onChange={(e) =>
                          setEditingShortcut({ ...editingShortcut, posterImage: e.target.value })
                        }
                        placeholder="https://images.unsplash.com/..."
                        className="w-full h-9 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-mono focus:border-amber-400 outline-hidden"
                      />

                      <div className="flex flex-wrap items-center gap-2">
                        {/* File Upload button */}
                        <label className="h-8 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                          <Upload size={13} />
                          <span>Bilgisayardan Yükle</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleFileUpload(e, (dataUrl) =>
                                setEditingShortcut({ ...editingShortcut, posterImage: dataUrl })
                              )
                            }
                            className="hidden"
                          />
                        </label>

                        {/* Presets Gallery button */}
                        <button
                          type="button"
                          onClick={() => {
                            setTargetForPreset('shortcut')
                            setIsPresetModalOpen(true)
                          }}
                          className="h-8 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Palette size={13} />
                          <span>Hazır Afiş Galerisi</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">
                      Menü Adı (Title)
                    </label>
                    <input
                      type="text"
                      required
                      value={editingShortcut.title}
                      onChange={(e) =>
                        setEditingShortcut({ ...editingShortcut, title: e.target.value })
                      }
                      className="w-full h-9 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-bold focus:border-amber-400 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">
                      Alt Başlık / Detay
                    </label>
                    <input
                      type="text"
                      value={editingShortcut.subtitle}
                      onChange={(e) =>
                        setEditingShortcut({ ...editingShortcut, subtitle: e.target.value })
                      }
                      className="w-full h-9 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:border-amber-400 outline-hidden"
                    />
                  </div>
                </div>

                {/* Category & Card Format */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">
                      Kategori Grubu
                    </label>
                    <select
                      value={editingShortcut.category}
                      onChange={(e) =>
                        setEditingShortcut({
                          ...editingShortcut,
                          category: e.target.value as ShortcutCategory,
                        })
                      }
                      className="w-full h-9 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-bold focus:border-amber-400 outline-hidden"
                    >
                      <option value="core">Hızlı İşlemler & Ders</option>
                      <option value="students">Sınıf & Öğrenci Yönetimi</option>
                      <option value="materials">Eğitim & Dijital Materyaller</option>
                      <option value="assessments">Ölçme & Değerlendirme</option>
                      <option value="planning">Planlama & Takvim</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">
                      Kart Formatı (En-Boy Oranı)
                    </label>
                    <select
                      value={editingShortcut.format || 'portrait'}
                      onChange={(e) =>
                        setEditingShortcut({
                          ...editingShortcut,
                          format: e.target.value as 'portrait' | 'landscape',
                        })
                      }
                      className="w-full h-9 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-bold focus:border-amber-400 outline-hidden"
                    >
                      <option value="portrait">Dikey Film Afişi (2:3 — 600x900px)</option>
                      <option value="landscape">Yatay Kart / Arşiv (16:9 — 1280x720px)</option>
                    </select>
                  </div>
                </div>

                {/* Window Id (Action) & Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">
                      Tıklanınca Açılacak OS Penceresi
                    </label>
                    <select
                      value={editingShortcut.windowId}
                      onChange={(e) =>
                        setEditingShortcut({ ...editingShortcut, windowId: e.target.value })
                      }
                      className="w-full h-9 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-mono font-bold focus:border-amber-400 outline-hidden"
                    >
                      <option value="attendance">attendance (Yoklama Alma)</option>
                      <option value="smartboard">smartboard (Akıllı Tahta / Pano)</option>
                      <option value="schedule">schedule (Ders Programı)</option>
                      <option value="assignments">assignments (Ödevler & Takip)</option>
                      <option value="assessments">assessments (Sınav & Quiz Hazırla)</option>
                      <option value="classes">classes (Sınıf & Öğrenci Listesi)</option>
                      <option value="courses">courses (MEB Ders Kitapları)</option>
                      <option value="files">files (Dosyalar & Materyal)</option>
                      <option value="reports">reports (Başarı & Raporlar)</option>
                      <option value="progress">progress (Öğrenci Gelişimi)</option>
                      <option value="agenda">agenda (Ajanda & Notlar)</option>
                      <option value="academicCalendar">academicCalendar (Akademik Takvim)</option>
                      <option value="settings">settings (Profil & Ayarlar)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">
                      Afiş Rozeti (Badge)
                    </label>
                    <input
                      type="text"
                      placeholder="HER DERS, CANLI, MEB vb."
                      value={editingShortcut.badge || ''}
                      onChange={(e) =>
                        setEditingShortcut({ ...editingShortcut, badge: e.target.value })
                      }
                      className="w-full h-9 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:border-amber-400 outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsShortcutModalOpen(false)}
                    className="h-10 px-4 rounded-xl bg-white/10 text-gray-300 text-xs font-bold"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black"
                  >
                    Kaydet
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* HERO SLIDE EDIT MODAL                                         */}
      {/* ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isSlideModalOpen && editingSlide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl rounded-3xl bg-[#141926] border border-white/20 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Tv size={18} className="text-amber-400" />
                  <h3 className="font-black text-base text-white">Hero Slider Slaytı Düzenle</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSlideModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveSlide} className="space-y-4">
                {/* 1. Web Banner Image (1920x800) */}
                <div className="space-y-2 p-3 rounded-2xl bg-black/40 border border-white/10">
                  <label className="text-xs font-bold text-amber-300 flex items-center justify-between">
                    <span>1. Web Banner Görseli (Masaüstü Ekranlar)</span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      Önerilen: 1920 x 800 px (16:9 / Geniş)
                    </span>
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-28 aspect-[16/9] rounded-lg overflow-hidden bg-black shrink-0 border border-white/20">
                      <img
                        src={editingSlide.webImage}
                        alt="Web Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <input
                        type="text"
                        value={editingSlide.webImage}
                        onChange={(e) =>
                          setEditingSlide({ ...editingSlide, webImage: e.target.value })
                        }
                        placeholder="https://..."
                        className="w-full h-8 px-2.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs font-mono"
                      />
                      <div className="flex items-center gap-2">
                        <label className="h-7 px-2.5 rounded bg-white/10 hover:bg-white/20 text-gray-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer">
                          <Upload size={12} />
                          <span>Yükle</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleFileUpload(e, (url) =>
                                setEditingSlide({ ...editingSlide, webImage: url })
                              )
                            }
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setTargetForPreset('slide-web')
                            setIsPresetModalOpen(true)
                          }}
                          className="h-7 px-2.5 rounded bg-amber-500/20 text-amber-300 text-[11px] font-bold"
                        >
                          Hazır Görsel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Mobile Banner Image (800x1200) */}
                <div className="space-y-2 p-3 rounded-2xl bg-black/40 border border-white/10">
                  <label className="text-xs font-bold text-rose-300 flex items-center justify-between">
                    <span>2. Mobil Banner Görseli (Telefon Ekranları)</span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      Önerilen: 800 x 1200 px (2:3 veya 3:4 Dikey)
                    </span>
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 aspect-[2/3] rounded-lg overflow-hidden bg-black shrink-0 border border-white/20">
                      <img
                        src={editingSlide.mobileImage}
                        alt="Mobile Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <input
                        type="text"
                        value={editingSlide.mobileImage}
                        onChange={(e) =>
                          setEditingSlide({ ...editingSlide, mobileImage: e.target.value })
                        }
                        placeholder="https://..."
                        className="w-full h-8 px-2.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs font-mono"
                      />
                      <div className="flex items-center gap-2">
                        <label className="h-7 px-2.5 rounded bg-white/10 hover:bg-white/20 text-gray-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer">
                          <Upload size={12} />
                          <span>Yükle</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleFileUpload(e, (url) =>
                                setEditingSlide({ ...editingSlide, mobileImage: url })
                              )
                            }
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setTargetForPreset('slide-mobile')
                            setIsPresetModalOpen(true)
                          }}
                          className="h-7 px-2.5 rounded bg-rose-500/20 text-rose-300 text-[11px] font-bold"
                        >
                          Hazır Görsel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">
                      Slayt Başlığı (Title)
                    </label>
                    <input
                      type="text"
                      required
                      value={editingSlide.title}
                      onChange={(e) =>
                        setEditingSlide({ ...editingSlide, title: e.target.value })
                      }
                      className="w-full h-9 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">
                      Alt Başlık / Açıklama (Subtitle)
                    </label>
                    <input
                      type="text"
                      value={editingSlide.subtitle}
                      onChange={(e) =>
                        setEditingSlide({ ...editingSlide, subtitle: e.target.value })
                      }
                      className="w-full h-9 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs"
                    />
                  </div>
                </div>

                {/* Actions & Link */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">
                      Aksiyon Butonu Metni
                    </label>
                    <input
                      type="text"
                      value={editingSlide.actionText}
                      onChange={(e) =>
                        setEditingSlide({ ...editingSlide, actionText: e.target.value })
                      }
                      placeholder="Hemen Başlat, Tahtayı Aç vb."
                      className="w-full h-9 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">
                      Aksiyon Linki / Açılacak Pencere
                    </label>
                    <input
                      type="text"
                      value={editingSlide.actionLink}
                      onChange={(e) =>
                        setEditingSlide({ ...editingSlide, actionLink: e.target.value })
                      }
                      placeholder="smartboard, attendance, schedule vb."
                      className="w-full h-9 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-center">
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">
                      Rozet (Badge)
                    </label>
                    <input
                      type="text"
                      value={editingSlide.badge || ''}
                      onChange={(e) =>
                        setEditingSlide({ ...editingSlide, badge: e.target.value })
                      }
                      placeholder="YENİ SEZON, CANLI vb."
                      className="w-full h-9 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">
                      Sıralama (Order)
                    </label>
                    <input
                      type="number"
                      value={editingSlide.order}
                      onChange={(e) =>
                        setEditingSlide({ ...editingSlide, order: parseInt(e.target.value) || 1 })
                      }
                      className="w-full h-9 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="slideActive"
                      checked={editingSlide.isActive}
                      onChange={(e) =>
                        setEditingSlide({ ...editingSlide, isActive: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-amber-500"
                    />
                    <label htmlFor="slideActive" className="text-xs font-bold text-gray-200">
                      Slayt Yayında Olsun
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsSlideModalOpen(false)}
                    className="h-10 px-4 rounded-xl bg-white/10 text-gray-300 text-xs font-bold"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black"
                  >
                    Slaytı Kaydet
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* CURATED PRESET GALLERY MODAL                                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isPresetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl rounded-3xl bg-[#141926] border border-white/20 p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Palette size={18} className="text-amber-400" />
                  <h3 className="font-black text-base text-white">
                    Önceden Seçilmiş Yüksek Çözünürlüklü Afiş Galerisi
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPresetModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs text-gray-400">
                Aşağıdaki hazır sinematik eğitim ve afiş görsellerinden birine tıklayarak tek dokunuşla seçebilirsiniz:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {CURATED_POSTER_PRESETS.map((preset, pIdx) => (
                  <div
                    key={pIdx}
                    onClick={() => {
                      if (targetForPreset === 'shortcut' && editingShortcut) {
                        setEditingShortcut({ ...editingShortcut, posterImage: preset.url })
                      } else if (targetForPreset === 'slide-web' && editingSlide) {
                        setEditingSlide({ ...editingSlide, webImage: preset.url })
                      } else if (targetForPreset === 'slide-mobile' && editingSlide) {
                        setEditingSlide({ ...editingSlide, mobileImage: preset.url })
                      }
                      setIsPresetModalOpen(false)
                      toast.success(`"${preset.name}" görseli seçildi!`)
                    }}
                    className="group cursor-pointer rounded-2xl overflow-hidden bg-black/60 border border-white/10 hover:border-amber-400 transition-all p-1.5 space-y-1.5 hover:scale-102"
                  >
                    <div
                      className={`relative w-full rounded-xl overflow-hidden ${
                        preset.type === 'landscape' ? 'aspect-[16/9]' : 'aspect-[2/3]'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-black bg-black/70 text-amber-300">
                        {preset.type === 'landscape' ? '16:9 Yatay' : '2:3 Afiş'}
                      </span>
                    </div>
                    <div className="text-[10px] font-black text-white truncate px-1">
                      {preset.name}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
