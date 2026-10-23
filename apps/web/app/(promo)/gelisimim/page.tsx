'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  TrendingUp,
  Activity,
  Award,
  BookOpen,
  Calendar,
  Clock,
  ShieldCheck,
  Check,
  GraduationCap,
  Users,
} from 'lucide-react';
import JsonLd from '@components/Promo/JsonLd';
import { Growth3DIcon } from '@components/Promo/StudentInteractiveTabs';

export default function GelisimimPage() {
  
  const gradeRows = [
    { name: 'Matematik', code: 'MAT-802', yazili1: 90, yazili2: 95, sozlu: 95, avg: 93.3, status: 'Pekiyi', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { name: 'Fen Bilimleri', code: 'FEN-804', yazili1: 85, yazili2: 92, sozlu: 90, avg: 89.0, status: 'Pekiyi', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { name: 'Türkçe', code: 'TUR-801', yazili1: 88, yazili2: 90, sozlu: 92, avg: 90.0, status: 'Pekiyi', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { name: 'İngilizce', code: 'ENG-803', yazili1: 95, yazili2: 98, sozlu: 100, avg: 97.6, status: 'Üstün Başarı', color: 'text-purple-700 bg-purple-50 border-purple-200' },
    { name: 'T.C. İnkılap Tarihi', code: 'INK-805', yazili1: 82, yazili2: 86, sozlu: 88, avg: 85.3, status: 'İyi', color: 'text-blue-700 bg-blue-50 border-blue-200' },
    { name: 'Din Kültürü', code: 'DIN-806', yazili1: 96, yazili2: 94, sozlu: 95, avg: 95.0, status: 'Pekiyi', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  ];

  return (
    <div className="pt-32 pb-24 bg-[#FCF9FD] min-h-screen relative overflow-hidden">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Oxonom Edu Gelişimim Modülü',
          applicationCategory: 'EducationalSoftware',
          description:
            'Canlı karne, akademik röntgen, ders bazlı başarı grafikleri ve MEB uyumlu öğrenci gelişim takip motoru.',
        }}
      />

      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-br from-emerald-500/10 via-[#8D49A6]/5 to-[#D914C8]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-[#8D49A6] uppercase tracking-wider mb-8">
          <Link href="/" className="hover:text-[#4B075F] transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-[#514458]">Öğrenci Özellikleri</span>
          <span>/</span>
          <span className="text-[#4B075F]">Gelişimim</span>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-[11px] font-bold uppercase tracking-widest mb-6 shadow-xs">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              CANLI AKADEMİK RÖNTGEN
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-[#241329] tracking-tight leading-[1.1] mb-6">
              Gelişimim: <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-[#8D49A6] to-[#D914C8]">
                Canlı ve Grafiksel Performans Takibi
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#514458] font-medium leading-relaxed mb-8">
              Eğitim serüveninizin röntgenini çekin! Sınavlar, sözlü notları, ders bazlı başarılar ve eksik olduğunuz konular dahil tüm akademik gelişiminizi istatistiksel ve grafiksel raporlarla anlık olarak izleyin. Gelişim sürecinizi somut verilerle canlı takip edin.
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
                <div className="text-2xl font-black text-emerald-600">89.4</div>
                <div className="text-xs text-[#716779] font-medium mt-0.5">Dönem Not Ortalaması</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#4B075F]">%100</div>
                <div className="text-xs text-[#716779] font-medium mt-0.5">Yoklama Katılımı</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#D914C8]">1. Dönem</div>
                <div className="text-xs text-[#716779] font-medium mt-0.5">Takdir Belgesi Adayı</div>
              </div>
            </div>
          </div>

          {/* Interactive Live Dashboard */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-[#E8DFEB] shadow-2xl shadow-[#4B075F]/15 overflow-hidden">
              <div className="bg-[#241329] px-5 py-4 flex items-center justify-between text-white border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-xs font-mono text-emerald-300 font-semibold ml-2">edu.oxonom.com/gelisimim</span>
                </div>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Canlı Rapor
                </span>
              </div>

              {/* 4 Quick Stat Cards */}
              <div className="grid grid-cols-2 gap-2.5 p-4 bg-[#FCF9FD] border-b border-[#E8DFEB]">
                <div className="p-3 rounded-xl bg-white border border-[#E8DFEB]">
                  <span className="text-[10px] text-[#716779] font-bold uppercase block">Genel Ortalama</span>
                  <span className="text-xl font-black text-[#4B075F]">89.4 / 100</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#E8DFEB]">
                  <span className="text-[10px] text-[#716779] font-bold uppercase block">Devamsızlık</span>
                  <span className="text-xl font-black text-emerald-600">0.0 Gün (Tam)</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#E8DFEB]">
                  <span className="text-[10px] text-[#716779] font-bold uppercase block">Ödev Tamamlama</span>
                  <span className="text-xl font-black text-blue-600">%96 (24/25)</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#E8DFEB]">
                  <span className="text-[10px] text-[#716779] font-bold uppercase block">Sınıf Derecesi</span>
                  <span className="text-xl font-black text-[#D914C8]">2 / 32 Öğrenci</span>
                </div>
              </div>

              {/* Course Grade Table */}
              <div className="p-4 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#241329]">Ders Bazlı Not Çizelgesi</span>
                  <span className="text-[10px] text-[#716779]">1. Dönem Güncel</span>
                </div>

                <div className="space-y-1.5 max-h-[260px] overflow-y-auto">
                  {gradeRows.map((row) => (
                    <div
                      key={row.code}
                      className="p-2.5 rounded-xl border border-[#E8DFEB] hover:bg-[#FCF9FD] flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <span className="font-bold text-[#241329] block">{row.name}</span>
                        <span className="text-[10px] text-[#716779]">
                          Y1: {row.yazili1} • Y2: {row.yazili2} • Sözlü: {row.sozlu}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-black text-[#241329] block">{row.avg}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${row.color}`}>
                          {row.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#FCF9FD] border-t border-[#E8DFEB] flex items-center justify-between text-xs font-bold text-[#4B075F]">
                <span>Veli Takip Bildirimleri Açık</span>
                <span className="text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Şeffaf Portföy
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Core Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          <div className="bg-white rounded-2xl border border-[#E8DFEB] p-6 shadow-xs hover:border-emerald-400/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#241329] mb-2">Canlı Gelişim Eğrisi</h3>
            <p className="text-sm text-[#514458] font-medium leading-relaxed">
              Haftalık ve aylık deneme sınavlarındaki puan artışınızı eğrilerle izleyin; hangi derste ne kadar ivme kazandığınızı somutlaştırın.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8DFEB] p-6 shadow-xs hover:border-[#8D49A6]/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#FCE8FA] text-[#4B075F] flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#241329] mb-2">Veli - Öğrenci Şeffaf Köprü</h3>
            <p className="text-sm text-[#514458] font-medium leading-relaxed">
              Veliler dönem sonu sürprizleriyle karşılaşmaz. Devamsızlık, ödev teslimi ve sınav notları anında veli paneline yansır.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8DFEB] p-6 shadow-xs hover:border-purple-400/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#241329] mb-2">Hedef Belgesi Simülasyonu</h3>
            <p className="text-sm text-[#514458] font-medium leading-relaxed">
              Takdir veya Teşekkür belgesi almak için hangi dersten kaç puan almanız gerektiğini otomatik hesaplayan hedef simülatörü.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white rounded-3xl border border-[#E8DFEB] p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="max-w-xl">
            <h3 className="text-2xl md:text-3xl font-display font-bold text-[#241329] mb-3">
              Kendi Başarınızı Canlı İzleyin
            </h3>
            <p className="text-sm text-[#514458] font-medium leading-relaxed">
              Oxonom Edu Gelişimim ile başarı tesadüf olmaktan çıkar, hedeflenen ve ölçülen bir serüvene dönüşür.
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
