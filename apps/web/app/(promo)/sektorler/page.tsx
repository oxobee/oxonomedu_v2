'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, CheckCircle2, ArrowUpRight, Sparkles, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { sectors } from '@lib/promo/constants';

export default function SectorsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  
  const filteredSectors = useMemo(() => {
    return sectors.filter(sector => {
      const matchesSearch = sector.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           sector.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [searchQuery]);

  return (
    <div className="pt-32 pb-24 bg-[#FCF9FD] min-h-screen relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[#4B075F]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E8DFEB] text-[#4B075F] rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D914C8]" />
            K-12 & KADEME ÇÖZÜMLERİ
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-bold text-[#241329] mb-6 tracking-tight leading-[1.1]"
          >
            Tüm Kademeler ve Roller İçin <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4B075F] via-[#8D49A6] to-[#D914C8]">
              Akıllı Eğitim
            </span> Çözümleri
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg text-[#514458] font-medium leading-relaxed"
          >
            İlkokul okuma-yazma temelinden LGS ve YKS hazırlığına, öğretmen işbirliğinden okul idaresi kütük ve yoklama yönetimine kadar hepsi bir arada.
          </motion.p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-16">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#716779]" />
            <input
              type="text"
              placeholder="Kademe, sınıf seviyesi veya modül ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-[#E8DFEB] text-sm font-medium focus:outline-none focus:border-[#4B075F] focus:ring-2 focus:ring-[#4B075F]/10 shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Sectors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredSectors.map((sector, index) => {
              const Icon = sector.icon;
              return (
                <motion.div
                  key={sector.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white rounded-3xl p-8 border border-[#E8DFEB] hover:border-[#8D49A6]/40 transition-all duration-300 premium-shadow-hover flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-[#FCF9FD] border border-[#E8DFEB] text-[#4B075F] flex items-center justify-center group-hover:bg-[#4B075F] group-hover:text-white transition-all duration-300 shadow-xs">
                        <Icon className="w-7 h-7" />
                      </div>
                      <span className="text-[10px] font-bold text-[#8D49A6] uppercase tracking-wider px-3 py-1 bg-[#FCE8FA] rounded-full border border-[#F0D8FA]">
                        {sector.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[#241329] mb-3 group-hover:text-[#4B075F] transition-colors">
                      {sector.name}
                    </h3>
                    
                    <p className="text-xs text-[#514458] leading-relaxed font-medium mb-6">
                      {sector.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-6 p-4 rounded-2xl bg-[#FCF9FD] border border-[#E8DFEB]">
                      {sector.stats.slice(0, 2).map((st, i) => (
                        <div key={i}>
                          <span className="block text-base font-black text-[#4B075F]">{st.value}</span>
                          <span className="text-[10px] font-bold text-[#716779]">{st.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link
                    href={`/sektorler/${sector.id}`}
                    className="inline-flex items-center justify-between w-full pt-4 border-t border-[#E8DFEB] text-xs font-bold text-[#4B075F] group-hover:text-[#D914C8] transition-colors"
                  >
                    <span>Çözüm Detayını İncele</span>
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
