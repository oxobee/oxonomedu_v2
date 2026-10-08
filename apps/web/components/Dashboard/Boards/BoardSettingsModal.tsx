'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Settings2,
  Calendar,
  Lock,
  Unlock,
  Globe,
  Shield,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Save,
  RotateCw,
  AlertTriangle,
  Type,
  Share2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { updateBoard, updateBoardShareSettings } from '@services/boards/boards'

interface BoardSettingsModalProps {
  board: any | null
  isOpen: boolean
  onClose: () => void
  accessToken?: string
  orgslug: string
  onDeleteBoard: (boardUuid: string) => Promise<void>
  onBoardUpdated?: (updatedBoard: any) => void
}

export default function BoardSettingsModal({
  board,
  isOpen,
  onClose,
  accessToken = '',
  orgslug,
  onDeleteBoard,
  onBoardUpdated,
}: BoardSettingsModalProps) {
  const [name, setName] = useState('')
  const [boardDate, setBoardDate] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [hasPin, setHasPin] = useState(false)
  const [pin, setPin] = useState('')
  const [copiedLink, setCopiedLink] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Initialize values when board changes
  useEffect(() => {
    if (board) {
      setName(board.name || '')

      // Resolve board date
      const initialDate =
        board.board_date ||
        board.creation_date?.slice(0, 10) ||
        new Date().toISOString().slice(0, 10)
      setBoardDate(initialDate.slice(0, 10))

      // Resolve public/private
      const isPub = board.public !== false && board.share_type !== 'private'
      setIsPublic(isPub)

      // Resolve PIN protection
      const isProtected = Boolean(
        board.share_type === 'code' ||
        board.has_code ||
        board.share_code ||
        board.features?.requires_pin
      )
      setHasPin(isProtected)
      setPin(board.share_code || board.features?.pin || '')
      setCopiedLink(false)
      setConfirmDelete(false)
    }
  }, [board])

  if (!isOpen || !board) return null

  const cleanUuid = board.board_uuid.replace('board_', '')
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/board/${cleanUuid}`
    : `/board/${cleanUuid}`

  const handleCopyLink = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl)
        setCopiedLink(true)
        toast.success('Paylaşım linki panoya kopyalandı!')
        setTimeout(() => setCopiedLink(false), 2500)
      }
    } catch (_) {
      toast.error('Link kopyalanamadı.')
    }
  }

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!name.trim()) {
      toast.error('Lütfen bir tahta adı girin.')
      return
    }

    if (hasPin && !pin.trim()) {
      toast.error('Lütfen şifre / PIN alanını doldurun veya şifre korumasını kapatın.')
      return
    }

    setIsSaving(true)
    try {
      const shareType = hasPin ? 'code' : isPublic ? 'public' : 'private'
      const shareCode = hasPin && pin.trim() ? pin.trim() : null

      const updatedPayload = {
        name: name.trim(),
        board_date: boardDate || new Date().toISOString().slice(0, 10),
        public: isPublic,
        share_type: shareType,
        share_code: shareCode,
        has_code: hasPin,
        features: {
          ...(board.features || {}),
          board_date: boardDate,
          requires_pin: hasPin,
          pin: shareCode,
        },
      }

      await updateBoard(board.board_uuid, updatedPayload, accessToken)
      await updateBoardShareSettings(board.board_uuid, shareType, shareCode, accessToken).catch(() => {})

      toast.success('Tahta ayarları başarıyla kaydedildi!')
      if (onBoardUpdated) {
        onBoardUpdated({
          ...board,
          ...updatedPayload,
        })
      }
      onClose()
    } catch (err) {
      console.error('[BoardSettingsModal] Save error:', err)
      toast.error('Ayarlar kaydedilirken bir hata oluştu.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDeleteBoard(board.board_uuid)
      onClose()
    } catch (err) {
      console.error('[BoardSettingsModal] Delete error:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="w-full max-w-xl bg-white dark:bg-[#18181b] rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden text-slate-900 dark:text-white my-auto max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-indigo-300 shrink-0">
                <Settings2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  Tahta Ayarları
                </h3>
                <p className="text-xs text-slate-300 truncate max-w-[260px] sm:max-w-sm">
                  {board.usergroup_name || 'Akıllı Tahta'} • {board.name}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer relative z-10"
              title="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Form */}
          <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
            {/* 1. TAHTA ADI */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-indigo-500" />
                <span>Tahta Adı</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: 1-A Matematik - Kesirler"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/30 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                required
              />
            </div>

            {/* 2. DERS / TAHTA TARİHİ */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>Ders / Tahta Tarihi</span>
              </label>
              <input
                type="date"
                value={boardDate}
                onChange={(e) => setBoardDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/30 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* 3. ERİŞİM DURUMU (HERKESE AÇIK / ÖZEL) */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-500" />
                <span>Erişim Durumu</span>
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={`p-3 rounded-2xl border text-start transition-all cursor-pointer flex flex-col gap-1 ${
                    isPublic
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/20'
                      : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Herkese Açık</span>
                    </span>
                    {isPublic && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    Sınıftaki tüm öğrenciler doğrudan tahtayı açabilir.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPublic(false)}
                  className={`p-3 rounded-2xl border text-start transition-all cursor-pointer flex flex-col gap-1 ${
                    !isPublic
                      ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-100 ring-2 ring-indigo-500/20'
                      : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Özel (Kısıtlı)</span>
                    </span>
                    {!isPublic && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    Yalnızca yetkili öğretmenler görebilir.
                  </span>
                </button>
              </div>
            </div>

            {/* 4. ŞİFRELE / ŞİFRESİZ HALE GETİRME (PIN KORUMASI) */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-black/25 border border-gray-200/80 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${hasPin ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-gray-200 dark:bg-white/10 text-gray-500'}`}>
                    {hasPin ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Şifreleme / PIN Koruması
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {hasPin
                        ? 'Tahtaya giriş için 4 haneli PIN şifresi zorunlu.'
                        : 'Şifresiz doğrudan giriş aktif.'}
                    </p>
                  </div>
                </div>

                {/* Toggle switch */}
                <button
                  type="button"
                  onClick={() => {
                    const next = !hasPin
                    setHasPin(next)
                    if (!next) setPin('')
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    hasPin ? 'bg-amber-500' : 'bg-gray-300 dark:bg-white/20'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                      hasPin ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {hasPin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-2 border-t border-gray-200 dark:border-white/10 space-y-1.5"
                >
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Giriş Şifresi / PIN:</span>
                    <span className="text-[10px] text-slate-400">Örn: 1234 veya parola</span>
                  </label>
                  <input
                    type="text"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="PIN veya şifre girin..."
                    className="w-full px-3.5 py-2 rounded-xl border border-amber-300 dark:border-amber-600/40 bg-white dark:bg-black/50 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </motion.div>
              )}
            </div>

            {/* 5. PAYLAŞIM LİNKİ KOPYALAMA */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Paylaşım Bağlantısı</span>
              </label>

              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300 truncate font-mono select-all">
                  {shareUrl}
                </div>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Kopyalandı' : 'Kopyala'}</span>
                </button>

                <a
                  href={`/board/${cleanUuid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-gray-200 dark:border-white/10 transition-all cursor-pointer shrink-0"
                  title="Tahtayı Yeni Sekmede Aç"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* 6. TEHLİKELİ BÖLGE: TAHTAYI SİL */}
            <div className="pt-2 border-t border-gray-100 dark:border-white/10">
              {confirmDelete ? (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-2.5">
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Bu tahtayı silmek istediğinize emin misiniz?</span>
                  </div>
                  <p className="text-[11px] text-rose-600 dark:text-rose-400">
                    Tahta üzerindeki tüm çizimler, sayfalar ve içerikler kalıcı olarak silinecektir.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isDeleting ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      <span>Evet, Kalıcı Olarak Sil</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="py-2 px-3 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-white/10 text-slate-700 dark:text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      Vazgeç
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-900/40 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Tahtayı Sil</span>
                </button>
              )}
            </div>
          </form>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 bg-gray-50 dark:bg-black/30 border-t border-gray-100 dark:border-white/5 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              Vazgeç
            </button>

            <button
              type="button"
              onClick={() => handleSave()}
              disabled={isSaving}
              className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <RotateCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Değişiklikleri Kaydet</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
