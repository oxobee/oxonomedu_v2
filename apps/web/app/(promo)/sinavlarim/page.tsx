'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  FileText,
  AlertTriangle,
  Award,
  BarChart3,
  Check,
  X,
} from 'lucide-react';
import JsonLd from '@components/Promo/JsonLd';
import { Exams3DIcon } from '@components/Promo/StudentInteractiveTabs';

export default function SinavlarimPage() {
  
  const [selectedExam, setSelectedExam] = useState(0);

  const exams = [
    {
      title: 'MEB 1. Dönem 2. Zümre Ortak Yazılısı',
      course: 'Matematik',
      date: '14 Kasım 2026',
      status: 'Tamamlandı',
      score: 92,
      classAvg: 74,
      rank: '3 / 32 Öğrenci',
      breakdown: [
        { topic: 'Üslü İfadeler', correct: 4, total: 4, status: 'Tam' },
        { topic: 'Kareköklü İfadeler', correct: 3, total: 4, status: 'Eksik Var' },
        { topic: 'Veri Analizi', correct: 4, total: 4, status: 'Tam' },
      ],
    },
    {
      title: 'Aylık Kazanım Değerlendirme Denemesi #4',
      course: 'Genel Tarama',
      date: '28 Kasım 2026',
      status: 'Tamamlandı',
      score: 476.5,
      classAvg: 412.0,
      rank: '1 / 120 Şube',
      breakdown: [
        { topic: 'Türkçe Paragraf', correct: 19, total: 20, status: 'Mükemmel' },
        { topic: 'Fen Deney Soruları', correct: 18, total: 20, status: 'Çok İyi' },
        { topic: 'İnkılap & Din', correct: 20, total: 20, status: 'Tam' },
      ],
    },
    {
      title: 'MEB Senaryo 2 Açık Uçlu Prova Sınavı',
      course: 'Fen Bilimleri',
      date: '12 Aralık 2026',
      status: 'Yaklaşıyor',
      score: null,
      classAvg: null,
      rank: 'Hazırlık Sürüyor',
      breakdown: [
        { topic: 'Mevsimler ve İklim', correct: null, total: 5, status: 'Çalışılıyor' },
        { topic: 'DNA ve Genetik Kod', correct: null, total: 5, status: 'Hazır' },
      ],
    },
  ];

  return (
    <div className="pt-32 pb-24 bg-[#FCF9FD] min-h-screen relative overflow-hidden">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Oxonom Edu Sınavlarım Modülü',
          applicationCategory: 'EducationalSoftware',
          description:
            'Açık uçlu sınavlar, deneme analizleri, eksik konu tespiti ve hedef puan takip platformu.',
        }}
      />

      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-br from-amber-500/10 via-[#8D49A6]/5 to-[#D914C8]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-[#8D49A6] uppercase tracking-wider mb-8">
          <Link href="/" className="hover:text-[#4B075F] transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-[#514458]">Öğrenci Özellikleri</span>
          <span>/</span>
          <span className="text-[#4B075F]">Sınavlarım</span>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-[11px] font-bold uppercase tracking-widest mb-6 shadow-xs">
              <Target className="w-3.5 h-3.5 text-amber-600" />
              NET VE HEDEF PUAN YÖNETİMİ
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-[#241329] tracking-tight leading-[1.1] mb-6">
              Sınavlarım: <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-[#8D49A6] to-[#D914C8]">
                Performans Analizi ve Hedef Takibi
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#514458] font-medium leading-relaxed mb-8">
              Geçmiş ve yaklaşan tüm sınavlarınızı tek bir merkezden yönetin. Sınav sonuçlarınızı detaylı raporlarla inceleyin, başarı oranınızı takip edin ve eksik konularınızı hızla tespit ederek bir sonraki sınava çok daha güçlü hazırlanın.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-8">
              <a
                href="https://edu.oxonom.com/login"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#4B075F] to-[#8D49A6] text-white font-bold text-sm shadow-lg shadow-[#4B075F]/20 hover:opacity-95 transition-all flex items-center gap-2"
              >
                <span>Demo Hesap İncele</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <Link
                href="/paketler"
                className="px-6 py-3.5 rounded-xl bg-white border border-[#E8DFEB] text-[#4B075F] font-bold text-sm hover:border-[#8D49A6] transition-all flex items-center gap-2 shadow-xs"
              >
                <span>Paketleri ve Fiyatları Gör</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#E8DFEB]">
              <div>
                <div className="text-2xl font-black text-amber-600">MEB Zümre</div>
                <div className="text-xs text-[#716779] font-medium mt-0.5">Açık Uçlu Yazılı Provaları</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#4B075F]">Madde Analizi</div>
                <div className="text-xs text-[#716779] font-medium mt-0.5">Soru Bazlı Başarı Oranı</div>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-600">%100 Net</div>
                <div className="text-xs text-[#716779] font-medium mt-0.5">Zayıf Konu Teşhisi</div>
              </div>
            </div>
          </div>

          {/* Interactive Exam Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-[#E8DFEB] shadow-2xl shadow-[#4B075F]/15 overflow-hidden">
              <div className="bg-[#241329] px-5 py-4 flex items-center justify-between text-white border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-xs font-mono text-amber-300 font-semibold ml-2">Sınav Raporu</span>
                </div>
                <span className="text-[11px] text-white/60 font-mono">ID: SNV-2026-92</span>
              </div>

              {/* Exam Selector */}
              <div className="p-3 bg-[#FCF9FD] border-b border-[#E8DFEB] flex gap-2">
                {exams.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedExam(i)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                      selectedExam === i
                        ? 'bg-[#4B075F] text-white shadow-xs'
                        : 'bg-white text-[#514458] border border-[#E8DFEB] hover:bg-gray-50'
                    }`}
                  >
                    {ex.course}
                  </button>
                ))}
              </div>

              {/* Selected Exam Body */}
              <div className="p-6 bg-white space-y-5">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      {exams[selectedExam].status}
                    </span>
                    <span className="text-xs text-[#716779] font-mono">
                      {exams[selectedExam].date}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#241329]">
                    {exams[selectedExam].title}
                  </h3>
                </div>

                {/* Score Big Display */}
                {exams[selectedExam].score !== null ? (
                  <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#FCF9FD] border border-[#E8DFEB] text-center">
                    <div>
                      <div className="text-2xl font-black text-[#4B075F]">
                        {exams[selectedExam].score}
                      </div>
                      <div className="text-[10px] text-[#716779] font-bold uppercase mt-0.5">Puanın</div>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-[#514458]">
                        {exams[selectedExam].classAvg}
                      </div>
                      <div className="text-[10px] text-[#716779] font-bold uppercase mt-0.5">Sınıf Ort.</div>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-emerald-600">
                        {exams[selectedExam].rank}
                      </div>
                      <div className="text-[10px] text-[#716779] font-bold uppercase mt-0.5">Sıralama</div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 text-center text-xs font-medium text-amber-900">
                    Bu sınav için prova denemeleri ve geri sayım takvimi başlatılmıştır.
                  </div>
                )}

                {/* Breakdown List */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#241329] block">Kazanım ve Konu Dağılımı</span>
                  {exams[selectedExam].breakdown.map((b, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white border border-[#E8DFEB] flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-[#241329]">{b.topic}</span>
                      <div className="flex items-center gap-2">
                        {b.correct !== null && (
                          <span className="font-mono font-bold text-[#514458]">
                            {b.correct} / {b.total}
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            b.status === 'Eksik Var'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-[#FCF9FD] border-t border-[#E8DFEB] flex items-center justify-between text-xs">
                <span className="text-[#716779]">Eksik konu için çalışma planı oluşturuldu</span>
                <span className="text-[#4B075F] font-bold flex items-center gap-1 cursor-pointer hover:underline">
                  Raporu Yazdır <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Core Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          <div className="bg-white rounded-2xl border border-[#E8DFEB] p-6 shadow-xs hover:border-amber-400/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#241329] mb-2">Akıllı Sınav Ajandası</h3>
            <p className="text-sm text-[#514458] font-medium leading-relaxed">
              Tüm yazılı sınavlar, denemeler ve quiz tarihleri takviminizde otomatik işaretlenir. Yaklaşan sınavlar için bildirim alırsınız.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8DFEB] p-6 shadow-xs hover:border-[#8D49A6]/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#241329] mb-2">Detaylı Madde & Net Analizi</h3>
            <p className="text-sm text-[#514458] font-medium leading-relaxed">
              Sadece kaç puan aldığınızı değil; hangi soruda neden hata yaptığınızı, hangi kazanımda zorlandığınızı grafiklerle görürsünüz.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8DFEB] p-6 shadow-xs hover:border-emerald-400/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#241329] mb-2">Eksik Konu Telafi Planı</h3>
            <p className="text-sm text-[#514458] font-medium leading-relaxed">
              Sınav sonucuna göre yapay zekâ, eksik kazandığınız konuları Notlarım ve Derslerim modülüne doğrudan telafi ödevi olarak aktarır.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white rounded-3xl border border-[#E8DFEB] p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="max-w-xl">
            <h3 className="text-2xl md:text-3xl font-display font-bold text-[#241329] mb-3">
              Sınavlarda Sürprizlere Yer Bırakmayın
            </h3>
            <p className="text-sm text-[#514458] font-medium leading-relaxed">
              Oxonom Edu ile MEB senaryolarına tam uyumlu denemeler çözün, hedefinize emin adımlarla ilerleyin.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 shrink-0">
            <a
              href="https://edu.oxonom.com/login"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-[#4B075F] hover:bg-[#620B79] text-white font-bold text-sm shadow-lg shadow-[#4B075F]/20 transition-all flex items-center gap-2"
            >
              <span>Demo Girişi Yap</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <Link
              href="/paketler"
              className="px-6 py-3.5 rounded-xl bg-[#FCF9FD] border border-[#E8DFEB] text-[#4B075F] font-bold text-sm hover:border-[#8D49A6] transition-all"
            >
              Paketleri İncele
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
