'use client'

import React, { useState, useEffect } from 'react'
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  User,
  Heart,
  School,
  GraduationCap,
  Sparkles,
  ArrowRight,
  RefreshCw,
  X,
} from 'lucide-react'
import { validateTcKimlik, lookupTcRecord, fetchMernisData, DEMO_STUDENT } from '@services/demo/schoolDirectory'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@components/ui/dialog'
import toast from 'react-hot-toast'

interface TcKimlikModalProps {
  isOpen: boolean
  onClose: () => void
  onVerified?: (record: any) => void
  initialTc?: string
}

export default function TcKimlikModal({
  isOpen,
  onClose,
  onVerified,
  initialTc = '',
}: TcKimlikModalProps) {
  const [tcInput, setTcInput] = useState(initialTc)
  const [status, setStatus] = useState<'idle' | 'valid' | 'invalid'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [record, setRecord] = useState<any>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    if (initialTc) {
      setTcInput(initialTc)
      runVerification(initialTc)
    } else {
      setTcInput('')
      setStatus('idle')
      setErrorMessage('')
      setRecord(null)
    }
  }, [initialTc, isOpen])

  const runVerification = (value: string) => {
    const clean = value.trim()
    if (!clean) {
      setStatus('idle')
      setErrorMessage('')
      setRecord(null)
      return
    }

    if (clean.length < 11) {
      setStatus('idle')
      setErrorMessage('')
      setRecord(null)
      return
    }

    setIsVerifying(true)
    setTimeout(() => {
      const check = validateTcKimlik(clean)
      if (!check.valid) {
        setStatus('invalid')
        setErrorMessage(check.message || 'Geçersiz T.C. Kimlik Numarası.')
        setRecord(null)
      } else {
        const found = lookupTcRecord(clean)
        setStatus('valid')
        setErrorMessage('')
        setRecord(found)
        if (onVerified) {
          onVerified(found)
        }
      }
      setIsVerifying(false)
    }, 200)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 11)
    setTcInput(onlyDigits)
    if (onlyDigits.length === 11) {
      runVerification(onlyDigits)
    } else {
      setStatus('idle')
      setErrorMessage('')
      setRecord(null)
    }
  }

  const fillDemoTc = () => {
    const demoTc = DEMO_STUDENT.tcNo
    setTcInput(demoTc)
    runVerification(demoTc)
    toast.success('Demo T.C. Kimlik No dolduruldu!')
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-white border border-gray-200 shadow-xl rounded-3xl">
        {/* Header Banner */}
        <div className="bg-brand-gradient px-6 py-5 text-white relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
              <ShieldCheck size={22} className="text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>T.C. Kimlik No Doğrulama</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                  MEB & Nüfus
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-purple-100 mt-0.5 font-medium">
                Öğrenci, veli ve öğretmen kimlik doğrulama & otomatik kayıt sorgulama sistemi
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Input Block */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
              <span>T.C. Kimlik Numarası (11 Hane)</span>
              <button
                type="button"
                onClick={fillDemoTc}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles size={12} />
                <span>Demo T.C. Kullan ({DEMO_STUDENT.tcNo})</span>
              </button>
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                maxLength={11}
                value={tcInput}
                onChange={handleInputChange}
                placeholder="Örn: 10000000146"
                className={`w-full px-4 py-3 text-base font-mono font-bold tracking-widest rounded-2xl border transition-all outline-none ${
                  status === 'valid'
                    ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950 focus:ring-2 focus:ring-emerald-500/20'
                    : status === 'invalid'
                    ? 'border-rose-400 bg-rose-50/40 text-rose-950 focus:ring-2 focus:ring-rose-500/20'
                    : 'border-gray-200 bg-gray-50/60 text-gray-900 focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-900/10'
                }`}
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {isVerifying ? (
                  <RefreshCw size={18} className="animate-spin text-gray-400" />
                ) : status === 'valid' ? (
                  <CheckCircle2 size={20} className="text-emerald-600" />
                ) : status === 'invalid' ? (
                  <ShieldAlert size={20} className="text-rose-500" />
                ) : null}
              </div>
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5">
              11 haneli T.C. Kimlik numaranızı girdiğinizde algoritma kontrolü ve otomatik nüfus sorgulaması anında yapılır.
            </p>
          </div>

          {/* TATLI UYARI EKRANI: Invalid State */}
          {status === 'invalid' && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50 via-amber-50/40 to-rose-50/80 border border-rose-200/80 space-y-3 animate-in fade-in-50 zoom-in-95 duration-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-rose-950 flex items-center gap-1.5">
                    <span>T.C. Kimlik No Doğrulanamadı</span>
                    <span className="text-base">💛</span>
                  </h4>
                  <p className="text-xs text-rose-900/90 mt-1 leading-relaxed">
                    {errorMessage}
                  </p>
                  <p className="text-[11px] text-rose-800/80 mt-1">
                    Girdiğiniz numara resmi T.C. Kimlik algoritması sağlama toplamına uymuyor. Lütfen kimlik kartınızdaki 11 haneyi kontrol ederek tekrar deneyiniz.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between">
                <span className="text-[11px] font-medium text-rose-700">
                  Test etmek için geçerli demo kimliği kullanabilirsiniz:
                </span>
                <button
                  type="button"
                  onClick={fillDemoTc}
                  className="px-3 py-1.5 rounded-xl bg-white border border-rose-300 text-rose-900 text-xs font-bold hover:bg-rose-100 transition-colors shadow-xs shrink-0 cursor-pointer"
                >
                  Demo T.C. Yazdır
                </button>
              </div>
            </div>
          )}

          {/* DOĞRULANDI EKRANI: Valid State */}
          {status === 'valid' && record && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 via-fuchsia-50/30 to-purple-50/80 border border-purple-200/90 space-y-3 animate-in fade-in-50 zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#4B075F] text-white flex items-center justify-center shadow-xs">
                    <CheckCircle2 size={18} className="text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-purple-950 block">
                      T.C. Nüfus & Okul Kaydı Doğrulandı
                    </span>
                    <span className="text-[11px] text-[#4B075F] font-medium">
                      Aktif MEB Öğrenci Kütük Bilgisi
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#F0D8FA] text-[#4B075F] text-[10px] font-extrabold uppercase border border-[#E8DFEB]">
                  {record.role || 'Öğrenci'}
                </span>
              </div>

              {/* Record Details Card */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3.5 border border-purple-100 shadow-xs space-y-2">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Adı Soyadı
                    </span>
                    <span className="font-extrabold text-gray-900 text-sm">
                      {record.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      T.C. Kimlik No
                    </span>
                    <span className="font-mono font-bold text-emerald-800">
                      {tcInput}
                    </span>
                  </div>
                </div>

                {(record.motherName || record.fatherName) && (
                  <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Anne Adı
                      </span>
                      <span className="font-bold text-gray-800">
                        {record.motherName || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Baba Adı
                      </span>
                      <span className="font-bold text-gray-800">
                        {record.fatherName || '—'}
                      </span>
                    </div>
                  </div>
                )}

                {record.birthDate && (
                  <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Doğum Tarihi / Yaş
                      </span>
                      <span className="font-semibold text-gray-800">
                        {record.birthDate} {record.age ? `(${record.age} Yaşında)` : ''}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Kan Grubu
                      </span>
                      <span className="font-bold text-emerald-800">
                        {record.bloodType || 'A Rh+'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Okulu
                    </span>
                    <span className="font-semibold text-gray-800">
                      {record.school || 'Necla Görer İlkokulu'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Şubesi / Durumu
                    </span>
                    <span className="font-bold text-indigo-700">
                      {record.classroom || (record.role === 'Öğrenci' ? '1-A Şubesi' : 'Veli')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    setIsVerifying(true)
                    const res = await fetchMernisData(tcInput)
                    setIsVerifying(false)
                    if (res.success && res.record) {
                      setRecord(res.record)
                      if (onVerified) onVerified(res.record)
                      toast.success(`✨ MERNİS üzerinden güncellendi: ${res.record.name} (${res.record.role})`)
                    } else {
                      toast.error(res.message)
                    }
                  }}
                  disabled={isVerifying}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-900 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                  title="MERNİS Nüfus ve Vatandaşlık İşleri (NVİ) üzerinden en güncel resmi kütük bilgilerini çek"
                >
                  <RefreshCw size={13} className={isVerifying ? 'animate-spin text-emerald-600' : 'text-emerald-700'} />
                  <span>{isVerifying ? 'MERNİS Sorgulanıyor...' : 'MERNİS Üzerinden Güncelle'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onVerified && record) onVerified(record)
                    toast.success(`${record.name} bilgileri onaylandı!`)
                    onClose()
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <span>Kaydı Onayla ve Devam Et</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* Close Footer */}
          <div className="pt-2 flex items-center justify-between border-t border-gray-100">
            <span className="text-[11px] text-gray-400">
              Oxonom Edu Güvenli Kimlik Doğrulama
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
