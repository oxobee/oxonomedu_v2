'use client'

import React, { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@components/ui/dialog'
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  GraduationCap,
  HelpCircle,
  Loader2,
  PenTool,
  Send,
  Sparkles,
  Upload,
  File,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  SchoolAssignmentItem,
  submitSchoolAssignment,
  formatDueDate,
} from '@services/school_assignments/school_assignments'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import AssignmentFileViewer from './AssignmentFileViewer'
import VoiceRecordingStudio from './VoiceRecordingStudio'
import AudioReviewPlayer from './AudioReviewPlayer'

interface DoAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  assignment: SchoolAssignmentItem | null
  accessToken: string
}

export default function DoAssignmentModal({
  isOpen,
  onClose,
  onSuccess,
  assignment,
  accessToken,
}: DoAssignmentModalProps) {
  const session = useLHSession() as any
  const user = session?.data?.user
  const studentId = user?.id || 101
  const studentName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Öğrenci' : 'Öğrenci'

  const [studentText, setStudentText] = useState('')
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({})
  const [studentFile, setStudentFile] = useState<{
    file_name: string
    file_size: number
    file_type: string
    file_url: string
  } | null>(null)
  const [studentAudio, setStudentAudio] = useState<{
    audio_url: string
    audio_name: string
    audio_duration: number
    audio_type: string
  } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const studentFileInputRef = useRef<HTMLInputElement | null>(null)

  if (!assignment) return null

  const submission = assignment.submission
  const isSubmitted = submission?.status === 'SUBMITTED' || submission?.status === 'GRADED'
  const isGraded = submission?.status === 'GRADED'

  // Individual Forked Student Board UUID
  const studentBoardUuid =
    submission?.student_content?.board_uuid ||
    `board_${assignment.assignment_uuid.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}_std_${studentId}`
  const studentBoardTitle = `${studentName} — ${assignment.title} Çözümü`

  const handleOpenBoard = () => {
    if (!assignment) return

    // Fork teacher's master board if not already forked in localStorage
    if (typeof window !== 'undefined') {
      try {
        const studentDataKey = `oxonom_board_data_${studentBoardUuid}`
        const existingStudentData = localStorage.getItem(studentDataKey)

        if (!existingStudentData && assignment.board_uuid) {
          const teacherDataKey = `oxonom_board_data_${assignment.board_uuid}`
          const masterData = localStorage.getItem(teacherDataKey)
          if (masterData) {
            localStorage.setItem(studentDataKey, masterData)
          }
        }

        // Register student personal board into local board catalogue
        const rawCustom = localStorage.getItem('oxonom_custom_boards')
        let customList: any[] = rawCustom ? JSON.parse(rawCustom) : []
        if (!customList.some((b) => b.board_uuid === studentBoardUuid)) {
          const newStudentBoard = {
            id: Date.now(),
            board_uuid: studentBoardUuid,
            title: studentBoardTitle,
            description: `${assignment.title} ödevi için ${studentName} kişisel çözüm tahtası`,
            is_encrypted: false,
            is_public: false,
            status: 'active',
            usergroup_id: assignment.usergroup_ids?.[0] || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          customList.unshift(newStudentBoard)
          localStorage.setItem('oxonom_custom_boards', JSON.stringify(customList))
          window.dispatchEvent(new CustomEvent('oxonom_boards_updated'))
        }
      } catch (_) {}
    }

    window.open(`/board/${studentBoardUuid}`, '_blank')
  }

  const handleStudentFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 25 * 1024 * 1024) {
      toast.error('Dosya boyutu 25 MB üzerinde olamaz.')
      return
    }
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => {
      setStudentFile({
        file_name: file.name,
        file_size: file.size,
        file_type: file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream'),
        file_url: reader.result as string,
      })
      toast.success(`${file.name} eklendi!`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (assignment.tool_type === 'READING' && !studentAudio && !submission?.student_content?.audio_url) {
      if (!studentText.trim()) {
        toast.error('Lütfen ses kaydınızı oluşturun veya bir okuma özeti/notu giriniz.')
        return
      }
    }

    setIsSubmitting(true)

    try {
      let content: Record<string, any> = {
        notes: studentText,
        submitted_at: new Date().toISOString(),
      }

      if (assignment.tool_type === 'WHITEBOARD') {
        content.board_uuid = studentBoardUuid
        content.board_title = studentBoardTitle
        content.student_id = studentId
        content.student_name = studentName
      } else if (assignment.tool_type === 'QUIZ') {
        content.quiz_answers = quizAnswers
      } else if (assignment.tool_type === 'WORKSHEET') {
        if (studentFile) {
          content.file_url = studentFile.file_url
          content.file_name = studentFile.file_name
          content.file_type = studentFile.file_type
          content.file_size = studentFile.file_size
        }
      } else if (assignment.tool_type === 'READING') {
        if (studentAudio) {
          content.audio_url = studentAudio.audio_url
          content.audio_name = studentAudio.audio_name
          content.audio_duration = studentAudio.audio_duration
          content.audio_type = studentAudio.audio_type
        }
      }

      await submitSchoolAssignment(
        assignment.assignment_uuid,
        {
          student_content: content,
        },
        accessToken
      )

      const now = new Date()
      const dueTime = assignment.due_date ? new Date(assignment.due_date).getTime() : null
      const isLate = dueTime ? now.getTime() > dueTime : false

      if (isLate) {
        toast.success('Ödeviniz başarıyla teslim edildi (Geç Teslim olarak kaydedildi).')
      } else {
        toast.success('Ödeviniz zamanında başarıyla teslim edildi!')
      }
      onSuccess()
      onClose()
    } catch (err) {
      console.error(err)
      toast.error('Ödev teslim edilirken bir hata oluştu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const quizQuestions: any[] = assignment.tool_data?.questions || []

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto bg-white p-6 sm:p-7 rounded-3xl shadow-2xl border border-gray-100">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md">
                  {assignment.subject}
                </span>
                <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                  {assignment.grade_level}
                </span>
                {isGraded ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <CheckCircle2 size={11} /> Notlandırıldı ({submission?.score} / {assignment.max_score})
                  </span>
                ) : submission?.is_late || submission?.status === 'LATE' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    <Clock size={11} /> Geç Teslim Edildi {submission?.late_duration_text ? `(${submission.late_duration_text})` : ''}
                  </span>
                ) : isSubmitted ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <CheckCircle2 size={11} /> Zamanında Teslim Edildi
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    <Clock size={11} /> Çözüm Bekleniyor
                  </span>
                )}
              </div>

              <DialogTitle className="text-xl font-bold text-gray-900 leading-snug">
                {assignment.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                <span>Öğretmen: {assignment.teacher_name || 'Ders Öğretmeni'}</span>
                <span>•</span>
                {assignment.due_date && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-950 font-bold text-[11px] shadow-2xs">
                    <Clock size={12} className="text-amber-600 animate-pulse shrink-0" />
                    <span>Son Teslim Tarihi:</span>
                    <span className="font-extrabold font-mono">{formatDueDate(assignment.due_date)}</span>
                  </span>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ÖĞRETMEN DEĞERLENDİRME & NOT KARTI (NOTLANDIRILMIŞSA) */}
        {isGraded && (
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                <GraduationCap size={16} className="text-emerald-600" />
                Öğretmen Değerlendirmesi
              </span>
              <span className="text-base font-black text-emerald-700">
                {submission?.score} / {assignment.max_score} Puan
              </span>
            </div>
            {submission?.teacher_feedback && (
              <p className="text-xs text-emerald-900 leading-relaxed bg-white/70 p-3 rounded-xl border border-emerald-100">
                "{submission.teacher_feedback}"
              </p>
            )}
          </div>
        )}

        {/* ÖDEV YÖNERGELERİ */}
        {assignment.description && (
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5">
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
              Ödev Açıklaması & Yönergeler
            </label>
            <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-line">
              {assignment.description}
            </p>
          </div>
        )}

        {/* ÖDEV ARACINA GÖRE ÇÖZÜM ALANI */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* 1. WHITEBOARD ÖDEVİ */}
          {assignment.tool_type === 'WHITEBOARD' && (
            <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-950 text-xs flex items-center gap-1.5">
                  <PenTool size={15} className="text-indigo-600" />
                  İnteraktif Akıllı Tahta Üzerinde Çözüm
                </span>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/90 border border-indigo-200 px-2 py-0.5 rounded-md">
                  Kişisel Tahtanız Tanımlandı
                </span>
              </div>

              <div className="p-3 bg-white/80 border border-indigo-100/80 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-xs">
                  <span>🎨 {studentBoardTitle}</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Öğretmeninizin hazırladığı ana tahta şablonu sizin adınıza bireysel olarak ayrılmıştır. Yaptığınız tüm çizimler ve çözüm adımları yalnızca size aittir; diğer öğrencilerle karışmaz.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenBoard}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Bireysel Çözüm Tahtamı Aç</span>
                <ExternalLink size={14} />
              </button>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Öğretmene Not / Çözüm Açıklaması (Opsiyonel)
                </label>
                <textarea
                  rows={2}
                  disabled={isSubmitted}
                  placeholder="Tahtadaki adımlara dair öğretmeninize iletmek istediğiniz notları yazabilirsiniz..."
                  value={studentText || submission?.student_content?.notes || ''}
                  onChange={(e) => setStudentText(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
            </div>
          )}

          {/* 2. WORKSHEET / ÇALIŞMA KAĞIDI ÖDEVİ */}
          {assignment.tool_type === 'WORKSHEET' && (
            <div className="space-y-4">
              {/* Öğretmenin yüklediği PDF veya Dosya */}
              {assignment.tool_data?.file_url && (
                <AssignmentFileViewer
                  fileUrl={assignment.tool_data.file_url}
                  fileName={assignment.tool_data.file_name}
                  fileType={assignment.tool_data.file_type}
                  fileSize={assignment.tool_data.file_size}
                  title="Ödev Çalışma Kağıdı / Eki"
                />
              )}

              {/* Öğrencinin teslim ettiği dosya varsa göster */}
              {submission?.student_content?.file_url && (
                <AssignmentFileViewer
                  fileUrl={submission.student_content.file_url}
                  fileName={submission.student_content.file_name || 'Öğrenci Yanıt Dosyası'}
                  fileType={submission.student_content.file_type}
                  fileSize={submission.student_content.file_size}
                  title="Teslim Edilen Çözüm Dosyanız"
                />
              )}

              {/* Öğrencinin dosya yükleme alanı (henüz teslim etmediyse) */}
              {!isSubmitted && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                      <FileText size={15} className="text-emerald-600" />
                      Çözüm Dosyası / Yanıtınızı Ekleyin (Opsiyonel)
                    </span>
                    <span className="text-[10px] text-emerald-700">PDF, Fotoğraf veya Doküman</span>
                  </div>

                  <input
                    ref={studentFileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    className="hidden"
                    onChange={handleStudentFileUpload}
                  />

                  {!studentFile ? (
                    <div
                      onClick={() => studentFileInputRef.current?.click()}
                      className="p-4 border-2 border-dashed border-emerald-300 rounded-xl bg-white hover:bg-emerald-50/40 text-center cursor-pointer transition-all space-y-1"
                    >
                      <Upload size={18} className="mx-auto text-emerald-600" />
                      <p className="font-bold text-gray-800 text-xs">Çözüm Dosyası veya Ödev Fotoğrafı Yükle</p>
                      <p className="text-[10px] text-gray-500">PDF, Word veya Fotoğraf (Maks. 25 MB)</p>
                    </div>
                  ) : (
                    <div className="p-3 bg-white border border-emerald-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText size={16} className="text-emerald-600 shrink-0" />
                        <span className="font-bold text-gray-900 text-xs truncate max-w-xs">
                          {studentFile.file_name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStudentFile(null)}
                        className="text-red-500 hover:text-red-700 cursor-pointer p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Çözüm metni / notlar */}
              <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-2">
                <label className="block font-bold text-emerald-950 text-xs">
                  Çözüm Notlarınız & Açıklama
                </label>
                <textarea
                  rows={4}
                  disabled={isSubmitted}
                  placeholder="Çözüm adımlarınızı, sorulara verdiğiniz yanıtları buraya detaylıca yazabilirsiniz..."
                  value={studentText || submission?.student_content?.notes || ''}
                  onChange={(e) => setStudentText(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-gray-100 disabled:text-gray-500 text-xs"
                />
              </div>
            </div>
          )}

          {/* 3. TEST / QUIZ ÖDEVİ */}
          {assignment.tool_type === 'QUIZ' && quizQuestions.length > 0 && (
            <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-2xl space-y-4">
              <span className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                <HelpCircle size={15} className="text-amber-600" />
                İnteraktif Test Soruları ({quizQuestions.length} Soru)
              </span>

              <div className="space-y-3">
                {quizQuestions.map((q, idx) => (
                  <div key={q.id || idx} className="p-3 bg-white border border-amber-200/80 rounded-xl space-y-2">
                    <p className="font-bold text-gray-900 text-xs">
                      {idx + 1}. {q.question}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {(q.options || []).map((opt: string, optIdx: number) => {
                        const isSelected = (quizAnswers[q.id] || submission?.student_content?.quiz_answers?.[q.id]) === opt
                        return (
                          <label
                            key={optIdx}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-amber-100/70 border-amber-300 font-bold text-amber-950'
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`quiz_${q.id}`}
                              disabled={isSubmitted}
                              checked={isSelected}
                              onChange={() => setQuizAnswers({ ...quizAnswers, [q.id]: opt })}
                              className="text-amber-600 focus:ring-amber-500"
                            />
                            <span>{opt}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. OKUMA & SESLİ GÖREV ÖDEVİ */}
          {assignment.tool_type === 'READING' && (
            <div className="space-y-4">
              {/* Okunacak Metin Parçası */}
              {assignment.tool_data?.text_to_read && (
                <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-950 text-xs flex items-center gap-1.5">
                      <BookOpen size={15} className="text-purple-600" />
                      Okunacak Metin Parçası
                    </span>
                    <span className="text-[10px] text-purple-700 font-semibold">Sesli Okuma Metni</span>
                  </div>
                  <div className="p-3.5 bg-white border border-purple-100 rounded-xl text-xs text-gray-800 leading-relaxed font-serif">
                    {assignment.tool_data.text_to_read}
                  </div>
                  {assignment.tool_data?.instructions && (
                    <p className="text-[11px] text-purple-800 font-medium italic">
                      💡 Yönerge: {assignment.tool_data.instructions}
                    </p>
                  )}
                </div>
              )}

              {/* Ses Kayıt Stüdyosu (veya daha önce teslim edildiyse ses dinleme) */}
              {submission?.student_content?.audio_url ? (
                <AudioReviewPlayer
                  audioUrl={submission.student_content.audio_url}
                  audioName={submission.student_content.audio_name || 'Teslim Ettiğiniz Ses Kaydı'}
                />
              ) : (
                <VoiceRecordingStudio
                  disabled={isSubmitted}
                  initialAudioUrl={studentAudio?.audio_url}
                  onAudioReady={(data) => setStudentAudio(data)}
                  onAudioClear={() => setStudentAudio(null)}
                />
              )}

              {/* Öğrenci Notu / Özet Metni */}
              <div className="p-3.5 bg-purple-50/40 border border-purple-100 rounded-2xl space-y-2">
                <label className="block font-bold text-purple-950 text-xs">
                  Özet / Metin Analizi Notlarınız (Opsiyonel)
                </label>
                <textarea
                  rows={3}
                  disabled={isSubmitted}
                  placeholder="Okuduğunuz metinle ilgili özet, ana fikir veya öğretmeninize notunuz..."
                  value={studentText || submission?.student_content?.notes || ''}
                  onChange={(e) => setStudentText(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 disabled:bg-gray-100 disabled:text-gray-500 text-xs"
                />
              </div>
            </div>
          )}

          <DialogFooter className="mt-6 flex justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
            >
              Kapat
            </button>

            {!isSubmitted && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                <span>Ödevimi Teslim Et</span>
              </button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
