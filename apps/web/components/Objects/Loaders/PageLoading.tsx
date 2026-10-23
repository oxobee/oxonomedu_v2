'use client'
import React from 'react'
import { motion } from 'framer-motion'

function PageLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#08050D]/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative flex flex-col items-center justify-center"
      >
        <div className="relative w-16 h-16 flex items-center justify-center mb-3">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#D914C8]/30 to-[#4B075F]/30 animate-pulse blur-md" />
          <div className="relative w-14 h-14 rounded-2xl bg-white/5 border border-white/10 p-2.5 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/oxonom-icon-colored.png"
              alt="Oxonom"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        <div className="w-24 h-0.5 rounded-full bg-white/10 overflow-hidden relative">
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-full h-full bg-gradient-to-r from-transparent via-[#D914C8] to-transparent"
          />
        </div>
      </motion.div>
    </div>
  )
}

export default PageLoading
