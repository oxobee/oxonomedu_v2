'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Folder,
  FolderOpen,
  Download,
  Share2,
  Trash2,
  Upload,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Tv,
  Eye,
  ArrowLeft,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  BookOpen,
  Layers,
  Plus,
  X,
  ExternalLink,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Printer,
  Send,
  Radio,
  FileCheck,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  TeacherFileItem,
  TeacherFolderCategory,
  getStoredTeacherFolders,
  saveStoredTeacherFolders,
  addTeacherFile,
  updateFileSharing,
  deleteTeacherFile,
  dispatchFileToSmartboard,
  getSmartboardQueue,
} from '@/lib/files/teacherFilesStorage'
import { ALL_CLASSROOMS, normalizeClassCode } from '@services/demo/schoolDirectory'

export default function TeacherFilesView() {
  const [folders, setFolders] = useState<TeacherFolderCategory[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Modals state
  const [previewFile, setPreviewFile] = useState<TeacherFileItem | null>(null)
  const [previewPdfPage, setPreviewPdfPage] = useState<number>(1)
  const [previewZoom, setPreviewZoom] = useState<number>(100)

  // Upload Modal State
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false)
  const [selectedFileObj, setSelectedFileObj] = useState<File | null>(null)
  const [customFileName, setCustomFileName] = useState<string>('')
  const [targetFolderForUpload, setTargetFolderForUpload] = useState<string>('folder-presentations')
  const [uploadClassShare, setUploadClassShare] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('oxonom_selected_class')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed.code) return parsed.code
        }
      } catch (_) {}
    }
    return ALL_CLASSROOMS[0]?.code || '1/A'
  })
  const [fileDataUrl, setFileDataUrl] = useState<string>('')

  // Share Modal State
  const [shareModalFile, setShareModalFile] = useState<TeacherFileItem | null>(null)
  const [shareSelectedClasses, setShareSelectedClasses] = useState<string[]>([])
  const [copiedShareLink, setCopiedShareLink] = useState(false)

  // Smartboard Send Modal State
  const [smartboardModalFile, setSmartboardModalFile] = useState<TeacherFileItem | null>(null)
  const [targetBoardId, setTargetBoardId] = useState<string>(() =>
    ALL_CLASSROOMS[0] ? `PANO-${ALL_CLASSROOMS[0].code.replace(/[\/\s]/g, '')}` : 'PANO-1A'
  )
  const [boardProjectionMode, setBoardProjectionMode] = useState<'card' | 'fullscreen'>('card')

  // Load folders on mount and listen to changes
  useEffect(() => {
    setFolders(getStoredTeacherFolders())

    const handleUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setFolders(e.detail)
      } else {
        setFolders(getStoredTeacherFolders())
      }
    }

    window.addEventListener('oxonom_teacher_files_updated', handleUpdate)
    return () => window.removeEventListener('oxonom_teacher_files_updated', handleUpdate)
  }, [])

  const activeFolder = folders.find((f) => f.id === selectedFolderId)
  const totalFilesCount = folders.reduce((acc, f) => acc + f.files.length, 0)

  // Filtered files
  const displayedFiles = activeFolder
    ? activeFolder.files.filter((file) =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (file.description && file.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : []

  // Global search when not in a folder
  const globalSearchResults = !activeFolder && searchTerm.trim().length > 1
    ? folders.flatMap((f) =>
        f.files
          .filter((file) =>
            file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (file.description && file.description.toLowerCase().includes(searchTerm.toLowerCase()))
          )
          .map((file) => ({ ...file, folderName: f.name, folderId: f.id }))
      )
    : []

  // ── Native File Input Picker ──
  const handleOpenNativePicker = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFileObj(file)
    setCustomFileName(file.name)
    setTargetFolderForUpload(selectedFolderId || folders[0]?.id || 'folder-presentations')

    // Read as Data URL for authentic previewing
    const reader = new FileReader()
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string
      setFileDataUrl(result || '')
    }
    if (file.type.startsWith('image/') || file.type === 'application/pdf' || file.type.startsWith('text/')) {
      reader.readAsDataURL(file)
    } else {
      setFileDataUrl('')
    }

    setIsUploadModalOpen(true)
    // reset input so picking same file again triggers change
    e.target.value = ''
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    const kb = bytes / 1024
    if (kb < 1024) return kb.toFixed(1) + ' KB'
    const mb = kb / 1024
    return mb.toFixed(1) + ' MB'
  }

  const handleSaveUploadedFile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customFileName.trim()) {
      toast.error('Lütfen geçerli bir dosya adı girin.')
      return
    }

    const extMatch = customFileName.includes('.') ? customFileName.split('.').pop()?.toLowerCase() : 'pdf'
    const validExts: TeacherFileItem['extension'][] = ['pdf', 'png', 'jpg', 'jpeg', 'docx', 'pptx', 'xlsx', 'txt']
    const safeExt = (validExts.includes(extMatch as any) ? extMatch : 'pdf') as TeacherFileItem['extension']

    const finalName = customFileName.includes('.') ? customFileName : `${customFileName}.${safeExt}`

    const newFile: TeacherFileItem = {
      id: `f-${Date.now()}`,
      name: finalName,
      extension: safeExt,
      size: selectedFileObj ? formatFileSize(selectedFileObj.size) : '1.8 MB',
      updatedAt: 'Şimdi',
      author: 'Ebru TEKNECİ',
      sharedWithClass: uploadClassShare === 'none' ? undefined : uploadClassShare,
      downloadsCount: 0,
      dataUrl: fileDataUrl || undefined,
      description: `Cihazdan yüklenen ${safeExt.toUpperCase()} ders materyali.`,
    }

    const updatedFolders = addTeacherFile(targetFolderForUpload, newFile)
    setFolders(updatedFolders)

    const folderName = folders.find((f) => f.id === targetFolderForUpload)?.name || 'Seçilen klasöre'
    toast.success(`"${newFile.name}" başarıyla ${folderName} klasörüne kaydedildi.`, {
      icon: '📁',
    })

    setIsUploadModalOpen(false)
    setSelectedFileObj(null)
    setCustomFileName('')
    setFileDataUrl('')
  }

  // ── Share Modal Actions ──
  const handleOpenShareModal = (file: TeacherFileItem) => {
    setShareModalFile(file)
    const existing = file.sharedWithClass
      ? file.sharedWithClass.split(',').map((s) => s.trim())
      : [ALL_CLASSROOMS[0]?.code || '1/A']
    setShareSelectedClasses(existing)
    setCopiedShareLink(false)
  }

  const handleToggleShareClass = (className: string) => {
    setShareSelectedClasses((prev) =>
      prev.includes(className) ? prev.filter((c) => c !== className) : [...prev, className]
    )
  }

  const handleSaveShare = () => {
    if (!shareModalFile) return
    const sharedString = shareSelectedClasses.length > 0 ? shareSelectedClasses.join(', ') : ''
    const updated = updateFileSharing(shareModalFile.id, sharedString)
    setFolders(updated)

    // Dispatch event so student panel receives updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('oxonom_file_shared', {
          detail: { fileId: shareModalFile.id, sharedWith: sharedString },
        })
      )
    }

    toast.success(
      sharedString
        ? `"${shareModalFile.name}" ${sharedString} sınıfları ile paylaşıldı.`
        : `"${shareModalFile.name}" paylaşımı kaldırıldı (Gizli).`,
      { icon: '🔗' }
    )
    setShareModalFile(null)
  }

  const handleCopyShareLink = () => {
    if (!shareModalFile) return
    const url = `${typeof window !== 'undefined' ? window.location.origin : 'https://agenapos.vercel.app'}/student/library?file=${shareModalFile.id}`
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url)
      setCopiedShareLink(true)
      toast.success('Paylaşım bağlantısı panoya kopyalandı!')
      setTimeout(() => setCopiedShareLink(false), 2500)
    }
  }

  // ── Smartboard Dispatch Actions ──
  const handleOpenSmartboardModal = (file: TeacherFileItem) => {
    setSmartboardModalFile(file)
    // Pre-populate with last dispatched or 9-A board
    if (typeof window !== 'undefined') {
      const last = localStorage.getItem('oxonom_last_dispatched_board_id')
      if (last) setTargetBoardId(last)
    }
  }

  const handleSendToSmartboardConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!smartboardModalFile) return
    if (!targetBoardId.trim()) {
      toast.error('Lütfen geçerli bir Akıllı Tahta ID numarası girin.')
      return
    }

    const cleanBoardId = targetBoardId.trim().toUpperCase()
    dispatchFileToSmartboard(cleanBoardId, smartboardModalFile, boardProjectionMode)

    toast.success(`🚀 "${smartboardModalFile.name}" [${cleanBoardId}] ID'li tahtaya başarıyla gönderildi!`, {
      icon: '🖥️',
      duration: 5000,
    })

    setSmartboardModalFile(null)
  }

  const handleDownload = (file: TeacherFileItem) => {
    toast.success(`${file.name} cihazınıza indirildi.`, { icon: '📥' })
  }

  const handleDeleteFile = (fileId: string, fileName: string) => {
    if (confirm(`"${fileName}" dosyasını silmek istediğinize emin misiniz?`)) {
      const updated = deleteTeacherFile(fileId)
      setFolders(updated)
      toast.success('Dosya silindi.')
    }
  }

  const getExtensionBadge = (ext: TeacherFileItem['extension']) => {
    switch (ext) {
      case 'pdf':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">PDF</span>
      case 'pptx':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40">PPTX</span>
      case 'docx':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40">DOCX</span>
      case 'xlsx':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">XLSX</span>
      case 'png':
      case 'jpg':
      case 'jpeg':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400 border border-teal-200 dark:border-teal-900/40">GÖRSEL</span>
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-gray-100 text-gray-700">BELGE</span>
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 font-jakarta space-y-6">
      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileInputChange}
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.docx,.pptx,.xlsx,.txt"
      />

      {/* ── HEADER BANNER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-1">
            <Layers size={15} />
            <span>Kişisel & Sınıf Dosya Kütüphanesi</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Dosyalarım ve Paylaşımlar
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Ders sunumları, çalışma yaprakları, tahta çizimleri ve resmi evraklar klasör bazlı organize edilmiştir
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleOpenNativePicker}
            className="h-10 px-4 rounded-xl bg-brand-gradient hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs shadow-purple-950/20"
          >
            <Upload size={15} />
            <span>Yeni Dosya Yükle</span>
          </button>
        </div>
      </div>

      {/* ── BREADCRUMB & SEARCH ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setSelectedFolderId(null)
              setSearchTerm('')
            }}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
              selectedFolderId === null
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Folder size={15} />
            <span>Kök Klasörler ({folders.length})</span>
          </button>

          {activeFolder && (
            <>
              <ChevronRight size={14} className="text-gray-400" />
              <span className="text-gray-900 dark:text-white flex items-center gap-1.5 font-black">
                <FolderOpen size={15} className={activeFolder.iconColor} />
                <span>{activeFolder.name}</span>
              </span>
            </>
          )}
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={activeFolder ? 'Bu klasörde dosya ara...' : 'Tüm dosyalarda ara...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-4 text-xs bg-gray-50 dark:bg-[#161D2E] border border-gray-200 dark:border-gray-700/80 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* ── ROOT VIEW: FOLDER CARDS ── */}
      {selectedFolderId === null && searchTerm.trim().length <= 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.map((folder) => {
            const fileCount = folder.files.length
            return (
              <motion.div
                key={folder.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.15 }}
                onClick={() => setSelectedFolderId(folder.id)}
                className={`group bg-white dark:bg-[#121826] border ${folder.color} rounded-3xl p-6 shadow-xs cursor-pointer flex flex-col justify-between transition-all`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-12 h-12 rounded-2xl ${folder.bgLight} flex items-center justify-center shrink-0`}>
                      <Folder size={24} className={folder.iconColor} />
                    </div>
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-gray-800/80 px-2.5 py-1 rounded-xl">
                      {fileCount} Dosya
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {folder.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                    {folder.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <span>Klasörü Aç</span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* ── GLOBAL SEARCH RESULTS ── */}
      {selectedFolderId === null && searchTerm.trim().length > 1 && (
        <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-5 shadow-xs">
          <div className="text-xs font-bold text-gray-500 mb-4">
            &quot;{searchTerm}&quot; için bulunan dosyalar ({globalSearchResults.length}):
          </div>
          {globalSearchResults.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">
              Arama kriterinize uygun dosya bulunamadı.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800/80">
              {globalSearchResults.map((file) => (
                <div key={file.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#161D2E] border border-gray-200/60 dark:border-gray-800 flex items-center justify-center shrink-0">
                      <FileText size={18} className="text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {file.name}
                        </span>
                        {getExtensionBadge(file.extension)}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-2">
                        <span className="text-indigo-600 font-semibold">{file.folderName}</span>
                        <span>•</span>
                        <span>{file.size}</span>
                        <span>•</span>
                        <span>{file.updatedAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewFile(file)}
                      className="h-8 px-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>Önizle</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenSmartboardModal(file)}
                      className="h-8 px-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 hover:bg-teal-100 flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                    >
                      <Tv size={13} />
                      <span>Tahtaya Gönder</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenShareModal(file)}
                      className="h-8 px-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                    >
                      <Share2 size={13} />
                      <span>Paylaş</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── FOLDER DETAIL VIEW ── */}
      {activeFolder && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setSelectedFolderId(null)
                setSearchTerm('')
              }}
              className="text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-indigo-600 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Geri (Tüm Klasörler)</span>
            </button>

            <span className="text-xs font-bold text-gray-400">
              {displayedFiles.length} / {activeFolder.files.length} dosya listeleniyor
            </span>
          </div>

          <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-5 shadow-xs divide-y divide-gray-100 dark:divide-gray-800/80">
            {displayedFiles.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">
                Bu klasörde aradığınız kriterde dosya bulunamadı.
              </div>
            ) : (
              displayedFiles.map((file) => (
                <div
                  key={file.id}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  {/* File Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-gray-50 dark:bg-[#161D2E] border border-gray-200/60 dark:border-gray-800 flex items-center justify-center shrink-0">
                      <FileText size={20} className="text-gray-600 dark:text-gray-300" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {file.name}
                        </span>
                        {getExtensionBadge(file.extension)}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1 flex-wrap">
                        <span className="font-semibold text-gray-600 dark:text-gray-300">{file.author}</span>
                        <span>•</span>
                        <span>{file.size}</span>
                        <span>•</span>
                        <span>{file.updatedAt}</span>
                        {file.sharedWithClass && (
                          <>
                            <span>•</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded">
                              {file.sharedWithClass} ile Paylaşıldı
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                    {/* Önizle Button */}
                    <button
                      type="button"
                      onClick={() => setPreviewFile(file)}
                      className="h-8 px-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer"
                      title="Önizle"
                    >
                      <Eye size={13} />
                      <span className="hidden sm:inline">Önizle</span>
                    </button>

                    {/* Tahtaya Gönder Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenSmartboardModal(file)}
                      className="h-8 px-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 text-teal-600 dark:text-teal-400 flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer border border-teal-200/50"
                      title="Akıllı Tahtaya Gönder"
                    >
                      <Tv size={13} />
                      <span className="hidden sm:inline">Tahtaya Gönder</span>
                    </button>

                    {/* Paylaş Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenShareModal(file)}
                      className="h-8 px-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer border border-indigo-200/50"
                      title="Sınıfla Paylaş"
                    >
                      <Share2 size={13} />
                      <span className="hidden sm:inline">Paylaş</span>
                    </button>

                    {/* İndir Button */}
                    <button
                      type="button"
                      onClick={() => handleDownload(file)}
                      className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors cursor-pointer"
                      title="İndir"
                    >
                      <Download size={14} />
                    </button>

                    {/* Sil Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteFile(file.id, file.name)}
                      className="w-8 h-8 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-gray-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: YENİ DOSYA YÜKLE ── */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-[#121826] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
                    <Upload size={16} />
                  </div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                    Dosya Yükle & Kaydet
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveUploadedFile} className="space-y-4">
                {/* Selected File Card */}
                {selectedFileObj ? (
                  <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText size={20} className="text-indigo-600 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {selectedFileObj.name}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {formatFileSize(selectedFileObj.size)} • Seçildi
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenNativePicker}
                      className="text-[11px] font-bold text-indigo-600 hover:underline shrink-0"
                    >
                      Değiştir
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={handleOpenNativePicker}
                    className="p-6 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-500 text-center cursor-pointer space-y-2 transition-colors"
                  >
                    <Upload size={24} className="mx-auto text-gray-400" />
                    <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Cihazınızdan dosya seçmek için tıklayın
                    </div>
                    <div className="text-[10px] text-gray-400">PDF, PNG, JPG, DOCX, PPTX, XLSX</div>
                  </div>
                )}

                {/* Dosya Adı (İsterse isim versin) */}
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Dosya Adı (İsteğe Bağlı Değiştirilebilir)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: 9-A_Edebiyat_Siir_Tahlili_Ders_Notu.pdf"
                    value={customFileName}
                    onChange={(e) => setCustomFileName(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-gray-50 dark:bg-[#161D2E] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Kaydedileceği Klasör / Konum Seçimi (Dropdown) */}
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Kaydedilecek Klasör / Konum
                  </label>
                  <select
                    value={targetFolderForUpload}
                    onChange={(e) => setTargetFolderForUpload(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-gray-50 dark:bg-[#161D2E] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
                  >
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.files.length} dosya)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sınıfla Paylaşım (Opsiyonel) */}
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Sınıf Paylaşımı
                  </label>
                  <select
                    value={uploadClassShare}
                    onChange={(e) => setUploadClassShare(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-gray-50 dark:bg-[#161D2E] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
                  >
                    <option value="none">Paylaşma (Yalnızca Ben)</option>
                    {ALL_CLASSROOMS.map((cls) => (
                      <option key={cls.id} value={cls.code}>
                        {cls.name} ({cls.grade_level})
                      </option>
                    ))}
                    <option value="Tüm Şubeler">Tüm Okul Şubeleri</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="h-10 px-4 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-5 rounded-xl text-xs font-bold bg-brand-gradient hover:opacity-95 text-white transition-all cursor-pointer shadow-xs shadow-purple-950/20"
                  >
                    Klasöre Kaydet ve Yükle
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: SINIFLA PAYLAŞ ── */}
      <AnimatePresence>
        {shareModalFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShareModalFile(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-[#121826] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
                    <Share2 size={16} />
                  </div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                    Dosyayı Sınıflarla Paylaş
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShareModalFile(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* File Info */}
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#161D2E] border border-gray-200 dark:border-gray-800 flex items-center gap-3">
                <FileText size={20} className="text-indigo-600 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    {shareModalFile.name}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    Boyut: {shareModalFile.size} • Yazar: {shareModalFile.author}
                  </div>
                </div>
              </div>

              {/* Class Checkboxes */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                  Erişim Yetkisi Verilecek Sınıflar:
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {[...ALL_CLASSROOMS.map((c) => c.code), 'Öğretmen Zümresi', 'Tüm Okul'].map((cls) => {
                    const isChecked = shareSelectedClasses.includes(cls)
                    return (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => handleToggleShareClass(cls)}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                          isChecked
                            ? 'bg-[#F0D8FA]/50 dark:bg-[#4B075F]/30 border-[#4B075F] text-gray-900 dark:text-white'
                            : 'bg-white dark:bg-[#161D2E] border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                            isChecked
                              ? 'bg-brand-gradient border-[#4B075F] text-white'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {isChecked && <Check size={12} className="text-white" />}
                        </div>
                        <span>{cls}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Direct Share Link */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                  Doğrudan Öğrenci Bağlantısı:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://oxonomeduv2.vercel.app/student/library?file=${shareModalFile.id}`}
                    className="flex-1 h-9 px-3 text-[11px] bg-gray-50 dark:bg-[#161D2E] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyShareLink}
                    className="h-9 px-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {copiedShareLink ? <Check size={13} className="text-[#16805D]" /> : <Copy size={13} />}
                    <span>{copiedShareLink ? 'Kopyalandı' : 'Kopyala'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShareModalFile(null)}
                  className="h-10 px-4 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Kapat
                </button>
                <button
                  type="button"
                  onClick={handleSaveShare}
                  className="h-10 px-5 rounded-xl text-xs font-bold bg-brand-gradient hover:opacity-95 text-white transition-all cursor-pointer shadow-xs shadow-purple-950/20"
                >
                  Paylaşımı Güncelle
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: TAHTAYA GÖNDER (BOARD ID İLE) ── */}
      <AnimatePresence>
        {smartboardModalFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSmartboardModalFile(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-[#121826] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
                    <Tv size={16} />
                  </div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                    Akıllı Tahtaya İçerik Gönder
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSmartboardModalFile(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Target File Card */}
              <div className="p-3 rounded-2xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/50 flex items-center gap-3">
                <FileText size={20} className="text-teal-600 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    {smartboardModalFile.name}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    Boyut: {smartboardModalFile.size} • Tahtada anında belirecek
                  </div>
                </div>
              </div>

              <form onSubmit={handleSendToSmartboardConfirm} className="space-y-4">
                {/* Board ID Input */}
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Akıllı Tahta ID No:
                  </label>
                  <div className="relative">
                    <Tv size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-600" />
                    <input
                      type="text"
                      required
                      placeholder="Örn: PANO-9A veya TAHTA-901"
                      value={targetBoardId}
                      onChange={(e) => setTargetBoardId(e.target.value.toUpperCase())}
                      className="w-full h-11 pl-10 pr-4 text-xs font-mono font-bold bg-gray-50 dark:bg-[#161D2E] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-teal-500 uppercase text-gray-900 dark:text-white tracking-wider"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                    Açık olan her akıllı tahtanın sol üst köşesinde bir <strong>Tahta ID</strong> bulunur.
                  </p>
                </div>

                {/* Quick Select Board IDs */}
                <div>
                    <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block mb-1.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Hızlı Seçim (Yalnızca Açık & Çevrim İçi Tahtalar):</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                      {[
                        ...ALL_CLASSROOMS.slice(0, 10).map((c) => ({
                          id: `PANO-${c.code.replace(/[\/\s]/g, '')}`,
                          label: `${c.name}`,
                          active: true,
                        })),
                        { id: 'TAHTA-901', label: 'Çalışma Tahtam', active: true },
                      ]
                        .filter((b) => b.active)
                        .map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setTargetBoardId(b.id)}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              targetBoardId === b.id
                                ? 'bg-[#F0D8FA]/50 dark:bg-[#4B075F]/30 border-[#4B075F] text-gray-900 dark:text-white font-bold shadow-xs ring-2 ring-[#8D49A6]/20'
                                : 'bg-white dark:bg-[#161D2E] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-black">{b.id}</span>
                              <span className="w-2 h-2 rounded-full bg-[#8D49A6] animate-ping" />
                            </div>
                            <div className="text-[10px] text-[#4B075F] dark:text-[#C58ADB] font-medium truncate mt-0.5">{b.label}</div>
                          </button>
                        ))}
                    </div>
                </div>

                {/* Placement Mode */}
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1.5">
                    Tahtada Gösterim Modu:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBoardProjectionMode('card')}
                      className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-colors cursor-pointer ${
                        boardProjectionMode === 'card'
                          ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-500 text-teal-800 dark:text-teal-200'
                          : 'bg-white dark:bg-[#161D2E] border-gray-200 dark:border-gray-700 text-gray-600'
                      }`}
                    >
                      <div>📌 Not Kartı Olarak</div>
                      <div className="text-[10px] font-normal text-gray-400 mt-0.5">Tahtaya kart olarak eklenir</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBoardProjectionMode('fullscreen')}
                      className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-colors cursor-pointer ${
                        boardProjectionMode === 'fullscreen'
                          ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-500 text-teal-800 dark:text-teal-200'
                          : 'bg-white dark:bg-[#161D2E] border-gray-200 dark:border-gray-700 text-gray-600'
                      }`}
                    >
                      <div>🖥️ Tam Ekran Sunum</div>
                      <div className="text-[10px] font-normal text-gray-400 mt-0.5">Doğrudan ekrana yansıtılır</div>
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setSmartboardModalFile(null)}
                    className="h-10 px-4 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs shadow-teal-500/20"
                  >
                    <Send size={13} />
                    <span>Tahtaya Canlı Gönder</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: DETAYLI & GERÇEKÇİ DOSYA ÖNİZLEME (PDF / GÖRSEL / METİN / TABLO) ── */}
      <AnimatePresence>
        {previewFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewFile(null)}
              className="absolute inset-0 bg-black/75 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl max-h-[92vh] bg-white dark:bg-[#121826] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center shrink-0">
                    <Eye size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-gray-900 dark:text-white truncate">
                        {previewFile.name}
                      </h3>
                      {getExtensionBadge(previewFile.extension)}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {previewFile.size} • {previewFile.author} • {previewFile.updatedAt}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Tahtaya Gönder Shortcut */}
                  <button
                    type="button"
                    onClick={() => {
                      const f = previewFile
                      setPreviewFile(null)
                      handleOpenSmartboardModal(f)
                    }}
                    className="h-8 px-3 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 hover:bg-teal-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Tv size={13} />
                    <span>Tahtaya Gönder</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewFile(null)}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-700 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Dynamic Content Preview Viewer */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/70 dark:bg-[#0B0F19]">
                {/* ── CASE 1: PDF DOCUMENT PREVIEW ── */}
                {previewFile.extension === 'pdf' && (
                  <div className="space-y-4 max-w-3xl mx-auto">
                    {/* PDF Reader Toolbar */}
                    <div className="bg-white dark:bg-[#121826] border border-gray-200 dark:border-gray-800 rounded-2xl p-2.5 flex items-center justify-between text-xs font-bold shadow-xs">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={previewPdfPage <= 1}
                          onClick={() => setPreviewPdfPage((p) => Math.max(1, p - 1))}
                          className="h-7 px-2 rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-40 flex items-center gap-1 text-[11px] cursor-pointer"
                        >
                          <ChevronLeft size={14} />
                          <span>Önceki</span>
                        </button>
                        <span className="text-gray-600 dark:text-gray-300 font-mono text-[11px]">
                          Sayfa {previewPdfPage} / 4
                        </span>
                        <button
                          type="button"
                          disabled={previewPdfPage >= 4}
                          onClick={() => setPreviewPdfPage((p) => Math.min(4, p + 1))}
                          className="h-7 px-2 rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-40 flex items-center gap-1 text-[11px] cursor-pointer"
                        >
                          <span>Sonraki</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewZoom((z) => Math.max(75, z - 25))}
                          className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 hover:bg-gray-200 cursor-pointer"
                          title="Uzaklaştır"
                        >
                          <ZoomOut size={13} />
                        </button>
                        <span className="text-[11px] font-mono">{previewZoom}%</span>
                        <button
                          type="button"
                          onClick={() => setPreviewZoom((z) => Math.min(150, z + 25))}
                          className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 hover:bg-gray-200 cursor-pointer"
                          title="Yakınlaştır"
                        >
                          <ZoomIn size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 hover:bg-gray-200 cursor-pointer ml-1"
                          title="Yazdır"
                        >
                          <Printer size={13} />
                        </button>
                      </div>
                    </div>

                    {/* PDF Authentic Page Canvas */}
                    <div
                      className="bg-white text-gray-900 border border-gray-300 shadow-xl rounded-xl p-8 sm:p-12 min-h-[560px] font-serif transition-transform origin-top"
                      style={{ transform: `scale(${previewZoom / 100})` }}
                    >
                      {/* Page Header */}
                      <div className="border-b-2 border-red-800 pb-4 mb-6 text-center">
                        <div className="text-[11px] font-sans font-black tracking-widest text-red-800 uppercase">
                          T.C. MİLLÎ EĞİTİM BAKANLIĞI
                        </div>
                        <div className="text-[9px] font-sans text-gray-500 uppercase tracking-wider mt-0.5">
                          ORTAÖĞRETİM GENEL MÜDÜRLÜĞÜ • 2026-2027 EĞİTİM VE ÖĞRETİM YILI
                        </div>
                        <div className="text-sm font-sans font-black text-gray-900 mt-2 uppercase tracking-wide">
                          9. SINIF TÜRK DİLİ VE EDEBİYATI DERSİ ÇALIŞMA FORMU
                        </div>
                      </div>

                      {/* Content According to Page Number */}
                      {previewPdfPage === 1 && (
                        <div className="space-y-4 text-xs leading-relaxed text-gray-800">
                          <div className="font-sans font-bold text-xs bg-gray-100 p-2.5 rounded-lg border border-gray-200 flex justify-between">
                            <span>Kazanım: A.1.4. Şiirde ahengi sağlayan unsurları belirler.</span>
                            <span className="font-mono text-red-700">Ders Kodu: TDE-09</span>
                          </div>

                          <h4 className="font-sans font-black text-sm text-gray-900 pt-2">
                            Bölüm I: Şiirde Ahenk ve Yapı Unsurları İncelemesi
                          </h4>
                          <p>
                            Şiirde ahenk; ses tekrarları, ritim, ölçü, uyak ve rediflerle sağlanır. Şair, duygularını aktarırken kelimelerin musikisinden ve dizelerin diziliş geometrisinden yararlanır.
                          </p>

                          <div className="p-4 bg-amber-50/60 border-l-4 border-amber-600 rounded-r-lg italic text-[11px]">
                            &quot;Korkma, sönmez bu şafaklarda yüzen al sancak;<br />
                            Sönmeden yurdumun üstünde tüten en son ocak.<br />
                            O benim milletimin yıldızıdır, parlayacak;<br />
                            O benimdir, o benim milletimindir ancak.&quot;
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-2 text-[11px]">
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                              <span className="font-sans font-bold block text-gray-900 mb-1">Ölçü Tahlili:</span>
                              Aruz Vezni (Mef&apos;ûlü / Mefâ&apos;îlü / Mefâ&apos;îlü / Fe&apos;ûlün)
                            </div>
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                              <span className="font-sans font-bold block text-gray-900 mb-1">Kafiye Düzeni:</span>
                              Düz kafiye (a-a-a-a), &quot;-acak&quot; zengin kafiye unsuru.
                            </div>
                          </div>
                        </div>
                      )}

                      {previewPdfPage === 2 && (
                        <div className="space-y-4 text-xs leading-relaxed text-gray-800">
                          <h4 className="font-sans font-black text-sm text-gray-900 border-b pb-2">
                            Bölüm II: Edebi Sanatlar ve Anlamsal Çözümleme
                          </h4>
                          <table className="w-full border-collapse border border-gray-300 text-[11px]">
                            <thead>
                              <tr className="bg-gray-100 font-sans font-bold">
                                <th className="border border-gray-300 p-2 text-left">Sanat Adı</th>
                                <th className="border border-gray-300 p-2 text-left">Dizedeki Karşılığı</th>
                                <th className="border border-gray-300 p-2 text-left">İşlevi</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="border border-gray-300 p-2 font-bold font-sans">Teşhis (Kişileştirme)</td>
                                <td className="border border-gray-300 p-2">&quot;Çatma, kurban olayım çehreni ey nazlı hilal!&quot;</td>
                                <td className="border border-gray-300 p-2">Bayrağa canlı insan özellikleri yüklenmiştir.</td>
                              </tr>
                              <tr>
                                <td className="border border-gray-300 p-2 font-bold font-sans">İstiare (Eğretileme)</td>
                                <td className="border border-gray-300 p-2">&quot;Ben ezelden beridir hür yaşadım, hür yaşarım&quot;</td>
                                <td className="border border-gray-300 p-2">Millet adına konuşan güçlü benlik kurgusu.</td>
                              </tr>
                              <tr>
                                <td className="border border-gray-300 p-2 font-bold font-sans">Nida (Seslenme)</td>
                                <td className="border border-gray-300 p-2">&quot;Ey nazlı hilal!&quot; / &quot;Arkadaş!&quot;</td>
                                <td className="border border-gray-300 p-2">Heyecanı ve vatanperver coşkuyu artırır.</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}

                      {previewPdfPage === 3 && (
                        <div className="space-y-4 text-xs leading-relaxed text-gray-800">
                          <h4 className="font-sans font-black text-sm text-gray-900 border-b pb-2">
                            Bölüm III: Kazanım Kavrama ve Uygulama Soruları
                          </h4>
                          <div className="space-y-3 text-[11px]">
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                              <span className="font-sans font-bold text-gray-900 block mb-1">
                                Soru 1: Aşağıdaki dizelerin hangisinde tam kafiye kullanılmıştır?
                              </span>
                              <div className="space-y-1 pl-2">
                                <div>A) Derinden derine ırmaklar ağlar / Uzaktan uzağa çoban çeşmesi</div>
                                <div>B) Bir zafer müjdesi burda her keder / Kalpleri ferahlatan tatlı ezgiler</div>
                                <div>C) Yollar köyleri bağlar birbirine / Işık saçar her bir hanesine</div>
                              </div>
                            </div>

                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                              <span className="font-sans font-bold text-gray-900 block mb-1">
                                Soru 2: &quot;Aliterasyon&quot; ile &quot;Asonans&quot; arasındaki temel farkı birer örnek dize ile açıklayınız.
                              </span>
                              <div className="h-14 border border-dashed border-gray-300 rounded p-2 text-gray-400 italic">
                                Öğrenci çalışma ve cevaplama alanı...
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {previewPdfPage === 4 && (
                        <div className="space-y-4 text-xs leading-relaxed text-gray-800">
                          <h4 className="font-sans font-black text-sm text-gray-900 border-b pb-2">
                            Bölüm IV: Öğretmen Değerlendirme Rubriği ve Onay
                          </h4>
                          <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
                            <div className="flex items-center justify-between font-sans font-bold text-emerald-900">
                              <span>MEB Ortak Sınav Kapsam İndeksi</span>
                              <span>Puan: 100</span>
                            </div>
                            <p className="text-[11px] text-emerald-800">
                              Bu çalışma formu, 1. Dönem 1. Ortak Edebiyat Sınavı öncesi 9-A ve 9-B şubelerinde kavrama amaçlı dağıtılmak üzere onaylanmıştır.
                            </p>
                          </div>

                          <div className="pt-12 flex justify-between items-end font-sans">
                            <div>
                              <div className="text-[10px] text-gray-400">Tarih: 14 Ekim 2026</div>
                              <div className="text-[10px] text-gray-400">Şube: 9-A / 9-B</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-xs">Ebru TEKNECİ</div>
                              <div className="text-[10px] text-gray-500">Türk Dili ve Edebiyatı Zümre Başkanı</div>
                              <div className="w-24 h-0.5 bg-gray-400 mx-auto mt-2" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Footer Page Number */}
                      <div className="border-t border-gray-200 mt-8 pt-3 flex justify-between text-[10px] font-sans text-gray-400">
                        <span>Oxonom EDU MEB Dijital Kütüphane</span>
                        <span>Sayfa {previewPdfPage} / 4</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── CASE 2: IMAGE / SMARTBOARD DIAGRAM PREVIEW ── */}
                {(previewFile.extension === 'png' || previewFile.extension === 'jpg' || previewFile.extension === 'jpeg') && (
                  <div className="space-y-4 max-w-3xl mx-auto">
                    {previewFile.dataUrl ? (
                      <div className="bg-black/90 rounded-2xl p-4 flex items-center justify-center min-h-[460px] overflow-hidden">
                        <img
                          src={previewFile.dataUrl}
                          alt={previewFile.name}
                          className="max-h-[500px] max-w-full object-contain rounded-xl shadow-2xl"
                        />
                      </div>
                    ) : (
                      /* High-resolution Smartboard Drawing Mockup */
                      <div className="bg-[#10141D] rounded-2xl border-2 border-teal-500/30 p-6 sm:p-8 text-white min-h-[480px] shadow-2xl relative overflow-hidden font-sans">
                        {/* Canvas Grid Background */}
                        <div
                          className="absolute inset-0 opacity-15 pointer-events-none"
                          style={{
                            backgroundImage: 'radial-gradient(circle, #2dd4bf 1px, transparent 1px)',
                            backgroundSize: '24px 24px',
                          }}
                        />

                        {/* Top Smartboard Banner */}
                        <div className="relative z-10 flex items-center justify-between pb-4 border-b border-gray-800">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="font-mono text-xs font-bold text-teal-400">
                              VESTEL 75&quot; AKILLI TAHTA ÇIKTISI • 9/A DERSİ
                            </span>
                          </div>
                          <span className="font-mono text-[11px] text-gray-400">
                            14 Ekim 2026 • 11:45
                          </span>
                        </div>

                        {/* Whiteboard Drawing Schema Content */}
                        <div className="relative z-10 py-8 space-y-6">
                          <div className="text-center space-y-1">
                            <div className="inline-block px-4 py-1 rounded-full bg-teal-500/20 border border-teal-400/40 text-teal-300 font-extrabold text-sm tracking-wide">
                              ŞİİRDE AHENK UNSURLARI ZİHİN HARİTASI
                            </div>
                            <div className="text-xs text-gray-400">Ebru Öğretmen Canlı Ders Çizimi</div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                            <div className="p-4 rounded-xl bg-teal-950/40 border border-teal-500/40 space-y-2">
                              <div className="font-black text-teal-300 text-xs flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-teal-400" />
                                1. Ses Tekrarları
                              </div>
                              <ul className="text-[11px] text-gray-300 space-y-1 list-disc list-inside">
                                <li><strong>Aliterasyon:</strong> Ünsüz ses tekrarı (s, r, l)</li>
                                <li><strong>Asonans:</strong> Ünlü ses tekrarı (a, e, i)</li>
                                <li><strong>Vurgu ve Tonlama:</strong> Duygu aktarımı</li>
                              </ul>
                            </div>

                            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40 space-y-2">
                              <div className="font-black text-indigo-300 text-xs flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                                2. Ölçü Çeşitleri
                              </div>
                              <ul className="text-[11px] text-gray-300 space-y-1 list-disc list-inside">
                                <li><strong>Hece Ölçüsü:</strong> 7&apos;li, 8&apos;li, 11&apos;li kalıplar</li>
                                <li><strong>Aruz Ölçüsü:</strong> Açık / kapalı heceler</li>
                                <li><strong>Serbest Ölçü:</strong> Kural ve kalıpsız</li>
                              </ul>
                            </div>

                            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-2">
                              <div className="font-black text-amber-300 text-xs flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-400" />
                                3. Kafiye ve Redif
                              </div>
                              <ul className="text-[11px] text-gray-300 space-y-1 list-disc list-inside">
                                <li><strong>Yarım:</strong> 1 ses benzerliği</li>
                                <li><strong>Tam:</strong> 2 ses benzerliği</li>
                                <li><strong>Zengin:</strong> 3+ ses benzerliği</li>
                                <li><strong>Cinaslı:</strong> Eş sesli kelimeler</li>
                              </ul>
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-gray-900/80 border border-dashed border-gray-700 text-center text-xs text-gray-400">
                            ✍️ <span className="text-gray-300 font-semibold">Öğretmen Notu:</span> Sınavda kafiye örgüsü (çapraz, sarma, düz) şemaları kesinlikle sorulacaktır!
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── CASE 3: DOCX / TEXT DOCUMENT PREVIEW ── */}
                {(previewFile.extension === 'docx' || previewFile.extension === 'txt') && (
                  <div className="space-y-4 max-w-3xl mx-auto">
                    <div className="bg-white text-gray-900 border border-gray-300 shadow-xl rounded-xl p-8 sm:p-12 min-h-[500px] font-sans">
                      <div className="flex items-center justify-between border-b pb-4 mb-6">
                        <div>
                          <div className="text-xs font-bold text-blue-600">Microsoft Word Belgesi</div>
                          <div className="text-base font-black text-gray-900 mt-1">{previewFile.name}</div>
                        </div>
                        <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[10px]">
                          Düzenlenebilir
                        </span>
                      </div>

                      <div className="space-y-4 text-xs leading-relaxed text-gray-800">
                        <h4 className="font-black text-sm text-gray-900">
                          1. DÖNEM ZÜMRE ÖĞRETMENLER KURULU KARAR METNİ
                        </h4>
                        <p>
                          2026-2027 Eğitim Öğretim Yılı 1. Dönem Türk Dili ve Edebiyatı zümresi toplantısında alınan resmi kararlar aşağıda maddeler halinde belirtilmiştir:
                        </p>
                        <ol className="list-decimal list-inside space-y-2 pl-2">
                          <li><strong>MEB Ortak Sınavları:</strong> 1. Dönem 1. Yazılı Sınavı 11-12 Kasım 2026 tarihlerinde MEB ortak takvimine uygun olarak uygulanacaktır.</li>
                          <li><strong>Ders Kitabı ve Kaynaklar:</strong> Derslerde Bakanlığımızın yayımladığı 9. Sınıf Türk Dili ve Edebiyatı Ders Kitabı esas alınacaktır.</li>
                          <li><strong>Akıllı Tahta Kullanımı:</strong> Her ders saatinin en az 20 dakikasında interaktif sunumlar ve Oxonom tahta araçları aktif kullanılacaktır.</li>
                          <li><strong>Ödev Takibi:</strong> Haftalık olarak sisteme yüklenen okuma parçaları öğrencilere atanacak ve dijital kütüphane üzerinden teslim alınacaktır.</li>
                        </ol>

                        <div className="pt-8 border-t mt-8 flex justify-between items-center text-xs text-gray-500">
                          <span>Hazırlayan: Ebru TEKNECİ</span>
                          <span>Tutanak No: 2026/04</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── CASE 4: EXCEL / SPREADSHEET PREVIEW ── */}
                {previewFile.extension === 'xlsx' && (
                  <div className="space-y-4 max-w-4xl mx-auto">
                    <div className="bg-white dark:bg-[#121826] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                      {/* Excel Ribbon Top */}
                      <div className="bg-emerald-700 text-white p-3 flex items-center justify-between text-xs font-bold">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet size={16} />
                          <span>Excel Tablosu: {previewFile.name}</span>
                        </div>
                        <span className="font-mono text-[10px] bg-emerald-800 px-2 py-0.5 rounded">
                          Sayfa 1 (Aktif)
                        </span>
                      </div>

                      {/* Spreadsheet Table Grid */}
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-xs">
                          <thead>
                            <tr className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold border-b border-gray-300 dark:border-gray-700">
                              <th className="p-2 border-r border-gray-300 dark:border-gray-700 w-10 text-center font-mono">#</th>
                              <th className="p-2 border-r border-gray-300 dark:border-gray-700 text-left font-mono">A (Kazanım No)</th>
                              <th className="p-2 border-r border-gray-300 dark:border-gray-700 text-left font-mono">B (Kazanım Başlığı)</th>
                              <th className="p-2 border-r border-gray-300 dark:border-gray-700 text-center font-mono">C (Haftalık Saat)</th>
                              <th className="p-2 border-r border-gray-300 dark:border-gray-700 text-center font-mono">D (Soru Ağırlığı)</th>
                              <th className="p-2 text-center font-mono">E (Hedef Başarı %)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-gray-900 dark:text-white">
                            <tr>
                              <td className="p-2 text-center bg-gray-50 dark:bg-gray-900 text-gray-400 font-mono">1</td>
                              <td className="p-2 font-mono font-bold text-indigo-600">TDE-09.1.1</td>
                              <td className="p-2">Edebiyatın güzel sanatlarla ilişkisini kavrar</td>
                              <td className="p-2 text-center font-mono">4 Saat</td>
                              <td className="p-2 text-center font-mono font-bold text-emerald-600">%15</td>
                              <td className="p-2 text-center font-mono">85%</td>
                            </tr>
                            <tr>
                              <td className="p-2 text-center bg-gray-50 dark:bg-gray-900 text-gray-400 font-mono">2</td>
                              <td className="p-2 font-mono font-bold text-indigo-600">TDE-09.1.2</td>
                              <td className="p-2">Metin tahlili ve edebi türleri sınıflandırır</td>
                              <td className="p-2 text-center font-mono">6 Saat</td>
                              <td className="p-2 text-center font-mono font-bold text-emerald-600">%25</td>
                              <td className="p-2 text-center font-mono">80%</td>
                            </tr>
                            <tr>
                              <td className="p-2 text-center bg-gray-50 dark:bg-gray-900 text-gray-400 font-mono">3</td>
                              <td className="p-2 font-mono font-bold text-indigo-600">TDE-09.1.3</td>
                              <td className="p-2">Şiirde ahenk unsurları (ölçü, kafiye, redif) tahlili</td>
                              <td className="p-2 text-center font-mono">8 Saat</td>
                              <td className="p-2 text-center font-mono font-bold text-emerald-600">%35</td>
                              <td className="p-2 text-center font-mono">75%</td>
                            </tr>
                            <tr>
                              <td className="p-2 text-center bg-gray-50 dark:bg-gray-900 text-gray-400 font-mono">4</td>
                              <td className="p-2 font-mono font-bold text-indigo-600">TDE-09.1.4</td>
                              <td className="p-2">Yazım kuralları ve noktalama işaretleri uygulamaları</td>
                              <td className="p-2 text-center font-mono">4 Saat</td>
                              <td className="p-2 text-center font-mono font-bold text-emerald-600">%25</td>
                              <td className="p-2 text-center font-mono">90%</td>
                            </tr>
                            <tr className="bg-emerald-50/60 dark:bg-emerald-950/30 font-bold">
                              <td className="p-2 text-center bg-emerald-100/50 dark:bg-emerald-900/50 text-gray-500 font-mono">∑</td>
                              <td className="p-2 font-mono">TOPLAM</td>
                              <td className="p-2">1. Dönem Ortak Sınav Kazanım Çerçevesi</td>
                              <td className="p-2 text-center font-mono">22 Saat</td>
                              <td className="p-2 text-center font-mono text-emerald-600">%100</td>
                              <td className="p-2 text-center font-mono">82.5%</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Preview Footer Actions */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121826] shrink-0">
                <div className="text-xs text-gray-400">
                  MEB E-Müfredat ve Akıllı Tahta Uyumlu Doküman
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const f = previewFile
                      setPreviewFile(null)
                      handleOpenSmartboardModal(f)
                    }}
                    className="h-10 px-4 rounded-xl text-xs font-bold bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 hover:bg-teal-100 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Tv size={14} />
                    <span>Tahtaya Yansıt</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownload(previewFile)}
                    className="h-10 px-5 rounded-xl text-xs font-bold bg-brand-gradient hover:opacity-95 text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-xs shadow-purple-950/20"
                  >
                    <Download size={14} />
                    <span>İndir</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
