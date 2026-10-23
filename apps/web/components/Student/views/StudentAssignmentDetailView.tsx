'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Upload,
  FileText,
  Paperclip,
  Send,
  Download,
  Sparkles,
  Award,
} from 'lucide-react'
import {
  type SchoolAssignmentItem,
} from '@services/school_assignments/school_assignments'
import {
  getSynchronizedStudentAssignments,
  getStudentSubmissions,
  saveStudentSubmission,
  type StudentSubmission,
} from '@/lib/student/studentData'
import StudentInteractiveQuizSolver from '@components/Student/views/StudentInteractiveQuizSolver'
import toast from 'react-hot-toast'

interface StudentAssignmentDetailViewProps {
  assignmentId: string
}

export default function StudentAssignmentDetailView({
  assignmentId,
}: StudentAssignmentDetailViewProps) {
  const [assignment, setAssignment] = useState<SchoolAssignmentItem | null>(null)
  const [submission, setSubmission] = useState<StudentSubmission | null>(null)
  const [responseText, setResponseText] = useState('')
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load target assignment
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const allAsgs = getSynchronizedStudentAssignments()
      const found = allAsgs.find(
        (a: any) =>
          String(a.assignment_uuid) === assignmentId ||
          String(a.id) === assignmentId ||
          String(a.title).toLowerCase().replace(/\s+/g, '-') === assignmentId
      )
      if (found) {
        setAssignment(found)
      } else if (allAsgs.length > 0) {
        setAssignment(allAsgs[0])
      }

      // Load existing submission
      const subs = getStudentSubmissions()
      if (subs[assignmentId]) {
        setSubmission(subs[assignmentId])
        setResponseText(subs[assignmentId].content)
        if (subs[assignmentId].fileName) {
          setSelectedFileName(subs[assignmentId].fileName || null)
        }
      }
    }
  }, [assignmentId])

  const handleFakeFilePick = () => {
    // Generate simulated homework file
    const sampleFileName = `9A_Ercil_Ugurlu_Odev_${new Date().toISOString().slice(0, 10)}.pdf`
    setSelectedFileName(sampleFileName)
    toast.success(`Dosya seçildi: ${sampleFileName}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!responseText.trim() && !selectedFileName) {
      toast.error('Lütfen ödev yanıtınızı yazın veya bir dosya ekleyin.')
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      const newSub: StudentSubmission = {
        assignmentId,
        submittedAt: new Date().toLocaleString('tr-TR'),
        content: responseText.trim(),
        fileName: selectedFileName || undefined,
        status: 'submitted',
        score: undefined, // Real state: waiting for teacher evaluation
        feedback: undefined,
      }

      saveStudentSubmission(newSub)
      setSubmission(newSub)
      setIsSubmitting(false)
      toast.success('Ödeviniz başarıyla öğretmeninize iletildi! Değerlendirme bekleniyor.')
    }, 400)
  }

  if (!assignment) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center text-gray-400">
        Ödev bilgisi yükleniyor...
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top back navigation */}
      <Link
        href="/student/assignments"
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Ödevlerime Geri Dön</span>
      </Link>

      {/* Main Assignment Banner */}
      <div className="p-6 lg:p-8 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
                {(assignment as any).subject_name || assignment.subject || 'Türkçe / Edebiyat'}
              </span>
              {submission ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  <span>Teslim Edildi</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Clock size={12} />
                  <span>Teslim Bekleniyor</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {assignment.title}
            </h1>
            <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl">
              {assignment.description ||
                'Bu ödev kapsamında verilen soruları çözüp açıklamalarınızı aşağıya yazınız veya çalışma kağıdını PDF/Word olarak sisteme yükleyiniz.'}
            </p>
          </div>

          {/* Teacher and Date details box */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 space-y-2 text-xs shrink-0 w-full md:w-64">
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
              <span>Ders Öğretmeni:</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {assignment.teacher_name || 'Bahar ÇETİN'}
              </span>
            </div>
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
              <span>Son Teslim Tarihi:</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {assignment.due_date ? String(assignment.due_date).slice(0, 10) : '24 Ekim 2026'}
              </span>
            </div>
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
              <span>Maksimum Puan:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">100 Puan</span>
            </div>
          </div>
        </div>

        {/* Attached Worksheet if present */}
        {Boolean((assignment as any).attached_file_name) && (
          <div className="p-3.5 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200/50 dark:border-cyan-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-300">
              <FileText size={16} className="text-cyan-600 dark:text-cyan-400" />
              <span className="font-bold">Öğretmen Çalışma Dosyası:</span>
              <span>{(assignment as any).attached_file_name}</span>
            </div>
            <button
              type="button"
              onClick={() => toast.success(`"${(assignment as any).attached_file_name}" indiriliyor...`)}
              className="px-3 py-1.5 rounded-xl bg-cyan-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-cyan-500 transition-colors cursor-pointer"
            >
              <Download size={13} />
              <span>İndir</span>
            </button>
          </div>
        )}
      </div>

      {/* Interactive Quiz Solver or Standard Submission */}
      {Boolean(
        assignment.tool_type === 'QUIZ' ||
          (assignment.quiz_questions && assignment.quiz_questions.length > 0) ||
          (assignment.tool_data?.quizQuestions && assignment.tool_data.quizQuestions.length > 0)
      ) ? (
        <StudentInteractiveQuizSolver
          assignment={assignment}
          questions={
            assignment.quiz_questions && assignment.quiz_questions.length > 0
              ? assignment.quiz_questions
              : assignment.tool_data?.quizQuestions || []
          }
          existingSubmission={submission}
          onSubmit={(newSub) => {
            saveStudentSubmission(newSub)
            setSubmission(newSub)
          }}
        />
      ) : submission ? (
        <div className="p-6 lg:p-8 rounded-3xl bg-white dark:bg-[#0E1526] border border-emerald-500/30 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={22} />
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                Ödeviniz Teslim Edildi
              </h2>
            </div>
            <span className="text-xs text-gray-400 font-semibold">
              Teslim Tarihi: {submission.submittedAt}
            </span>
          </div>

          {/* Student Response */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 space-y-2">
            <div className="text-[11px] font-bold text-gray-400 uppercase">Gönderilen Yanıtınız</div>
            <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
              {submission.content || '(Dosya eki ile gönderildi)'}
            </p>
            {submission.fileName && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0E1526] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 mt-2">
                <Paperclip size={13} />
                <span>{submission.fileName}</span>
              </div>
            )}
          </div>

          {/* Teacher Grading & Feedback */}
          {submission.score !== undefined && (
            <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-extrabold text-sm">
                  <Award size={18} />
                  <span>Öğretmen Değerlendirmesi</span>
                </div>
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {submission.score} / 100
                </div>
              </div>
              {submission.feedback && (
                <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed italic">
                  "{submission.feedback}"
                </p>
              )}
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setSubmission(null)
                toast.success('Ödev yanıtı düzenleme moduna alındı.')
              }}
              className="text-xs font-bold text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Yanıtı Yeniden Düzenle veya Dosyayı Değiştir →
            </button>
          </div>
        </div>
      ) : (
        /* Submission Form */
        <form
          onSubmit={handleSubmit}
          className="p-6 lg:p-8 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-5"
        >
          <div>
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
              Ödevi Yanıtla ve Teslim Et
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Çözümlerinizi doğrudan metin alanına yazabilir veya hazırladığınız belgeyi ekleyebilirsiniz.
            </p>
          </div>

          {/* Answer text area */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Ödev Yanıtınız / Çözüm Adımları:
            </label>
            <textarea
              rows={6}
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Ödev sorularına ait yanıtlarınızı, metin analizini veya formül çözümlerinizi buraya yazınız..."
              className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 leading-relaxed"
            />
          </div>

          {/* File attachment area */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Dosya / Çalışma Kağıdı Ekle:
            </label>
            <div className="p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center gap-2 text-center">
              <Upload size={24} className="text-gray-400" />
              <div className="text-xs text-gray-600 dark:text-gray-400">
                PDF, Word, Excel veya Görsel formatında dosya yükleyebilirsiniz.
              </div>
              <button
                type="button"
                onClick={handleFakeFilePick}
                className="mt-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-emerald-600 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Paperclip size={14} />
                <span>{selectedFileName ? 'Farklı Dosya Seç' : 'Dosya Seç'}</span>
              </button>
              {selectedFileName && (
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  Seçilen: {selectedFileName}
                </div>
              )}
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-2xl bg-brand-gradient hover:opacity-95 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-purple-950/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send size={15} className="text-white" />
              <span className="text-white">{isSubmitting ? 'Gönderiliyor...' : 'Ödevi Öğretmene Teslim Et'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
