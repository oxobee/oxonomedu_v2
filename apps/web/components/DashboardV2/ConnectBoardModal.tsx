'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, QrCode } from 'lucide-react'
import Link from 'next/link'
import ConnectBoardClient from '@components/Dashboard/ConnectBoard/ConnectBoardClient'

interface ConnectBoardModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ConnectBoardModal({ isOpen, onClose }: ConnectBoardModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        />

        {/* Modal / Bottom Sheet */}
        <motion.div
          initial={{ y: '100%', opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-3xl shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col z-10 overflow-hidden pb-[env(safe-area-inset-bottom)]"
        >
          {/* Mobile Drag Indicator */}
          <div className="pt-2.5 pb-1 flex justify-center md:hidden">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
          </div>

          {/* Modal Header */}
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gray-900 text-white flex items-center justify-center shadow-xs">
                <QrCode size={16} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900">Tahtaya Bağlan</h3>
                <p className="text-[11px] text-gray-500">QR Kod veya 6 Haneli Kod ile Hızlı Eşleşme</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Link
                href="/dash/connect-board"
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                title="Tam Ekran Aç"
              >
                <ExternalLink size={16} />
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Kapat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* ConnectBoardClient Embedded Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            <ConnectBoardClient isModal={true} onSuccess={onClose} />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
