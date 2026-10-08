'use client'

import React, { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@components/ui/dialog'
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  Loader2,
  PenTool,
  Save,
  Search,
  User,
  XCircle,
} from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  getAssignmentSubmissions,
  gradeSubmission,
  formatDueDate,
  SchoolAssignmentItem,
  StudentSubmissionRow,
} from '@services/school_assignments/school_assignments'
import AssignmentFileViewer from './AssignmentFileViewer'
import AudioReviewPlayer from './AudioReviewPlayer'

interface AssignmentSubmissionsModalProps {
  isOpen: boolean
  onClose: () => void
  assignment: SchoolAssignmentItem | null
  accessToken: string
  onGraded?: () => void
}

export default function AssignmentSubmissionsModal({
  isOpen,
  onClose,
  assignment,
  accessToken,
  onGraded,
}: AssignmentSubmissionsModalProps) {
  const queryClient = useQueryClient()
  const [selectedUsergroupId, setSelectedUsergroupId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [submissionFilter, setSubmissionFilter] = useState<'all' | 'ontime' | 'late' | 'pending'>('all')
  const [selectedStudent, setSelectedStudent] = useState<StudentSubmissionRow | null>(null)

  // Grading form state
  const [gradeScore, setGradeScore] = useState<number>(100)
  const [gradeFeedback, setGradeFeedback] = useState<string>('')
  const [isGrading, setIsGrading] = useState(false)

  const { data: submissionsData, isLoading, refetch } = useQuery({
    queryKey: ['school-assignment-submissions', assignment?.assignment_uuid, selectedUsergroupId],
    queryFn: () =>
      getAssignmentSubmissions(assignment!.assignment_uuid, selectedUsergroupId, accessToken || ''),
    enabled: !!(isOpen && assignment?.assignment_uuid),
  })

  const students: StudentSubmissionRow[] = useMemo(() => {
    return Array.isArray(submissionsData?.students) ? submissionsData.students : []
  }, [submissionsData?.students])

  const onTimeStudents = useMemo(() => {
    return students.filter((s) => s && (s.status === 'SUBMITTED' || s.status === 'GRADED') && !s.is_late)
  }, [students])

  const lateStudents = useMemo(() => {
    return students.filter((s) => s && (s.is_late || s.status === 'LATE'))
  }, [students])

  const pendingStudents = useMemo(() => {
    return students.filter((s) => s && (s.status === 'PENDING' || !s.submission_id))
  }, [students])

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (!s) return false
      if (submissionFilter === 'ontime') {
        if (!((s.status === 'SUBMITTED' || s.status === 'GRADED') && !s.is_late)) return false
      } else if (submissionFilter === 'late') {
        if (!(s.is_late || s.status === 'LATE')) return false
      } else if (submissionFilter === 'pending') {
        if (s.status !== 'PENDING' && s.submission_id) return false
      }

      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      const sName = s.name || ''
      const sUsername = s.username || ''
      return sName.toLowerCase().includes(q) || sUsername.toLowerCase().includes(q)
    })
  }, [students, submissionFilter, searchQuery])

  if (!isOpen || !assignment) return null

  const handleSelectStudent = (s: StudentSubmissionRow) => {
    if (!s) return
    setSelectedStudent(s)
    setGradeScore(s.score ?? 100)
    setGradeFeedback(s.teacher_feedback || '')
  }

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) return

    const subId = selectedStudent.submission_id || 500 + selectedStudent.user_id

    setIsGrading(true)
    try {
      await gradeSubmission(
        subId,
        {
          score: Number(gradeScore),
          teacher_feedback: gradeFeedback,
          assignment_uuid: assignment.assignment_uuid,
          user_id: selectedStudent.user_id,
        },
        accessToken
      )

      toast.success('Puan ve geri bildirim başarıyla kaydedildi!')
      refetch()
      onGraded?.()
      queryClient.invalidateQueries({ queryKey: ['school-assignments'] })
      queryClient.invalidateQueries({ queryKey: ['school-assignment-submissions'] })
      // Update local state
      setSelectedStudent({
        ...selectedStudent,
        submission_id: subId,
        status: 'GRADED',
        score: Number(gradeScore),
        teacher_feedback: gradeFeedback,
      })
    } catch (err) {
      console.error(err)
      toast.error('Puan kaydedilirken bir hata oluştu.')
    } finally {
      setIsGrading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white p-6 sm:p-7 rounded-3xl shadow-2xl border border-gray-100">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md">
                  {assignment.subject}
                </span>
                <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                  {assignment.grade_level}
                </span>
                {assignment.due_date && (
                  <span className="text-[11px] font-extrabold text-amber-950 bg-amber-100/90 border border-amber-300 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs">
                    <Clock size={13} className="text-amber-700 animate-pulse shrink-0" />
                    <span>Son Teslim:</span>
                    <span className="font-mono">{formatDueDate(assignment.due_date)}</span>
                  </span>
                )}
              </div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {assignment.title} — Teslim ve Değerlendirme
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 mt-0.5">
                Sınıftaki öğrencilerin teslim durumlarını inceleyin, tahta çözümlerini açın ve puanlayın.
              </DialogDescription>
            </div>

            {/* Quick stats pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-center">
                <span className="block text-[9px] text-gray-400 font-bold uppercase">Toplam</span>
                <span className="text-xs font-black text-gray-900">{students.length}</span>
              </div>
              <div className="px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <span className="block text-[9px] text-emerald-600 font-bold uppercase">Zamanında</span>
                <span className="text-xs font-black text-emerald-800">{onTimeStudents.length}</span>
              </div>
              <div className="px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-center">
                <span className="block text-[9px] text-amber-600 font-bold uppercase">Geç Teslim</span>
                <span className="text-xs font-black text-amber-800">{lateStudents.length}</span>
              </div>
              <div className="px-2.5 py-1.5 bg-rose-50 border border-rose-200 rounded-xl text-center">
                <span className="block text-[9px] text-rose-600 font-bold uppercase">Teslim Etmeyen</span>
                <span className="text-xs font-black text-rose-800">{pendingStudents.length}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-4 text-xs">
          {/* LEFT COLUMN: Student List & Categorical Tabs */}
          <div className="md:col-span-5 space-y-2.5 border-r border-gray-100 pr-0 md:pr-4">
            {/* Categorical Tabs */}
            <div className="flex items-center gap-1 p-1 bg-gray-100/90 rounded-xl overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setSubmissionFilter('all')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                  submissionFilter === 'all'
                    ? 'bg-white text-gray-900 shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Tümü ({students.length})
              </button>
              <button
                type="button"
                onClick={() => setSubmissionFilter('ontime')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  submissionFilter === 'ontime'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <CheckCircle2 size={10} />
                Zamanında ({onTimeStudents.length})
              </button>
              <button
                type="button"
                onClick={() => setSubmissionFilter('late')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  submissionFilter === 'late'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-amber-700 hover:bg-amber-50'
                }`}
              >
                <Clock size={10} />
                Geç ({lateStudents.length})
              </button>
              <button
                type="button"
                onClick={() => setSubmissionFilter('pending')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  submissionFilter === 'pending'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                <XCircle size={10} />
                Etmeyenler ({pendingStudents.length})
              </button>
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Öğrenci ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {isLoading ? (
              <div className="py-10 text-center text-gray-400 flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span>Öğrenci listesi yükleniyor...</span>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="py-8 text-center text-gray-400">Bu kategoride öğrenci bulunamadı.</div>
            ) : (
              <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1">
                {filteredStudents.map((s) => {
                  const isSelected = selectedStudent?.user_id === s.user_id
                  const isGraded = s.status === 'GRADED'
                  const isLate = s.is_late || s.status === 'LATE'
                  const isPending = s.status === 'PENDING' || !s.submission_id

                  return (
                    <div
                      key={s.user_id}
                      onClick={() => handleSelectStudent(s)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-gray-600 shrink-0">
                          {(s.name || 'Ö').charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate">{s.name || 'Öğrenci'}</p>
                          <p className="text-[10px] text-gray-400 truncate">
                            {s.submission_date ? `Teslim: ${formatDueDate(s.submission_date)}` : `Son Teslim: ${formatDueDate(assignment.due_date)}`}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {isLate ? (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              <Clock size={10} />
                              Geç Teslim
                            </span>
                            {s.late_duration_text && (
                              <span className="block text-[9px] text-amber-600 font-semibold mt-0.5">
                                {s.late_duration_text}
                              </span>
                            )}
                          </div>
                        ) : isGraded ? (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <CheckCircle2 size={10} />
                              {s.score} Puan
                            </span>
                            <span className="block text-[9px] text-emerald-600 font-semibold mt-0.5">
                              Zamanında
                            </span>
                          </div>
                        ) : !isPending ? (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <CheckCircle2 size={10} />
                              Zamanında
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            Teslim Etmedi
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Student Submission Review & Grading Form */}
          <div className="md:col-span-7 space-y-4">
            {selectedStudent ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 text-base">{selectedStudent.name}</h4>
                      <p className="text-[11px] text-gray-500">
                        Sınıf: {selectedStudent.classroom_name} • Kullanıcı Adı: @{selectedStudent.username}
                      </p>
                    </div>
                    {selectedStudent.status === 'GRADED' ? (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs border border-emerald-200">
                        Notlandı ({selectedStudent.score} / {assignment.max_score})
                      </span>
                    ) : selectedStudent.is_late || selectedStudent.status === 'LATE' ? (
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold rounded-xl text-xs border border-amber-200 flex items-center gap-1">
                        <Clock size={12} /> Geç Teslim
                      </span>
                    ) : selectedStudent.status === 'SUBMITTED' ? (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 font-bold rounded-xl text-xs border border-blue-200">
                        Zamanında Teslim Edildi
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-rose-100 text-rose-800 font-bold rounded-xl text-xs border border-rose-200">
                        Teslim Edilmedi
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200/80 text-[11px]">
                    <div>
                      <span className="text-gray-400 block font-medium">Son Teslim Tarihi:</span>
                      <span className="font-bold text-gray-800">{formatDueDate(assignment.due_date)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-medium">Teslim Zamanı:</span>
                      <span className="font-bold text-gray-800">
                        {selectedStudent.submission_date ? formatDueDate(selectedStudent.submission_date) : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Status Banner */}
                  {selectedStudent.is_late || selectedStudent.status === 'LATE' ? (
                    <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold">
                      <Clock size={15} className="text-amber-600 shrink-0" />
                      <span>
                        Geç Teslim: Bu ödev son teslim saatinden sonra teslim edilmiştir
                        {selectedStudent.late_duration_text ? ` (${selectedStudent.late_duration_text})` : ''}.
                      </span>
                    </div>
                  ) : selectedStudent.submission_date ? (
                    <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                      <span>Zamanında Teslim: Ödev son teslim tarihinden önce eksiksiz iletilmiştir.</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
                      <XCircle size={15} className="text-rose-600 shrink-0" />
                      <span>Ödev Henüz Teslim Edilmedi — Son teslim tarihi: {formatDueDate(assignment.due_date)}</span>
                    </div>
                  )}
                </div>

                {/* ÖĞRENCİ ÇÖZÜM İÇERİĞİ */}
                <div className="space-y-3 p-4 bg-white border border-gray-200 rounded-2xl">
                  <span className="font-bold text-gray-800 uppercase tracking-wider text-[11px]">
                    Öğrenci Yanıtı & Çözüm Detayları
                  </span>

                  {/* WHITEBOARD ÖDEVİ TAHTA BAĞLANTISI */}
                  {assignment.tool_type === 'WHITEBOARD' && (
                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2 text-indigo-950 font-bold">
                        <PenTool size={16} className="text-indigo-600" />
                        <span>Akıllı Tahta Çözümü</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const boardUuid =
                            selectedStudent.student_content?.board_uuid || assignment.board_uuid
                          if (boardUuid) {
                            window.open(`/board/${boardUuid}`, '_blank')
                          } else {
                            toast.error('Tahta bağlantısı bulunamadı.')
                          }
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        <span>Tahtayı Aç ve İncele</span>
                        <ExternalLink size={13} />
                      </button>
                    </div>
                  )}

                  {/* ÖĞRENCİ SES KAYDI (SESLİ GÖREV / OKUMA) */}
                  {selectedStudent.student_content?.audio_url && (
                    <AudioReviewPlayer
                      audioUrl={selectedStudent.student_content.audio_url}
                      audioName={selectedStudent.student_content.audio_name || 'Öğrenci Ses Kaydı'}
                      studentName={selectedStudent.name}
                    />
                  )}

                  {/* ÖĞRENCİ ÇALIŞMA DOSYASI / PDF / GÖRSEL */}
                  {selectedStudent.student_content?.file_url && (
                    <AssignmentFileViewer
                      fileUrl={selectedStudent.student_content.file_url}
                      fileName={selectedStudent.student_content.file_name || 'Öğrenci Teslim Dosyası'}
                      fileType={selectedStudent.student_content.file_type}
                      fileSize={selectedStudent.student_content.file_size}
                      title={`${selectedStudent.name} — Çözüm Dosyası`}
                    />
                  )}

                  {/* METİN CEVABI */}
                  {selectedStudent.student_content?.notes ? (
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl whitespace-pre-line text-gray-800 leading-relaxed">
                      {selectedStudent.student_content.notes}
                    </div>
                  ) : selectedStudent.status === 'PENDING' ? (
                    <p className="text-gray-400 italic">Öğrenci henüz bir çözüm veya not girmedi.</p>
                  ) : !selectedStudent.student_content?.audio_url && !selectedStudent.student_content?.file_url ? (
                    <p className="text-gray-400 italic">Metin açıklaması eklenmedi.</p>
                  ) : null}
                </div>

                {/* PUANLAMA VE GERİ BİLDİRİM FORMU */}
                <form onSubmit={handleSaveGrade} className="space-y-3 p-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <GraduationCap size={15} className="text-indigo-600" />
                      Değerlendirme & Puanlama
                    </span>
                    {selectedStudent.status === 'PENDING' && (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        Sınıf içi / Fiziksel Teslim Notlandırma
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">
                        Puan (Max: {assignment.max_score}) *
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        max={assignment.max_score}
                        value={gradeScore}
                        onChange={(e) => setGradeScore(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-bold text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block font-semibold text-gray-700 mb-1">
                        Öğretmen Geri Bildirim Notu
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Öğrenciye çözümüne dair yönlendirici geri bildirim yazın..."
                        value={gradeFeedback}
                        onChange={(e) => setGradeFeedback(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={isGrading}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isGrading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                      <span>Puan ve Geri Bildirimi Kaydet</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-2xl text-center text-gray-400 space-y-2">
                <User size={36} className="text-gray-300" />
                <p className="font-semibold">İncelemek istediğiniz öğrenciyi soldaki listeden seçiniz.</p>
                <p className="text-[11px] text-gray-400">Öğrencinin çözümü, tahta çizimleri ve notlandırma formu burada görüntülenecektir.</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
          >
            Kapat
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
