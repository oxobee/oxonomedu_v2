// apps/web/components/ui/21st/GlowBadge.tsx
'use client'

import React from 'react'
import { motion } from 'framer-motion'

export type GlowBadgeVariant = 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple' | 'cyan' | 'brand'

interface GlowBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  variant?: GlowBadgeVariant
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
  icon?: React.ReactNode
  className?: string
}

const variantStyles: Record<GlowBadgeVariant, {
  container: string
  dot: string
  glow: string
}> = {
  indigo: {
    container: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 shadow-indigo-500/10',
    dot: 'bg-indigo-500',
    glow: 'rgba(99, 102, 241, 0.4)',
  },
  emerald: {
    container: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 shadow-emerald-500/10',
    dot: 'bg-emerald-500',
    glow: 'rgba(16, 185, 129, 0.4)',
  },
  amber: {
    container: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 shadow-amber-500/10',
    dot: 'bg-amber-500',
    glow: 'rgba(245, 158, 11, 0.4)',
  },
  rose: {
    container: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 shadow-rose-500/10',
    dot: 'bg-rose-500',
    glow: 'rgba(244, 63, 94, 0.4)',
  },
  purple: {
    container: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20 shadow-purple-500/10',
    dot: 'bg-purple-500',
    glow: 'rgba(168, 85, 247, 0.4)',
  },
  cyan: {
    container: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20 shadow-cyan-500/10',
    dot: 'bg-cyan-500',
    glow: 'rgba(6, 182, 212, 0.4)',
  },
  brand: {
    container: 'bg-gradient-to-r from-[#D914C8]/10 to-[#8A0F82]/10 text-[#D914C8] dark:text-[#F0D8FA] border-[#D914C8]/25 shadow-[#D914C8]/15',
    dot: 'bg-[#D914C8]',
    glow: 'rgba(217, 20, 200, 0.4)',
  },
}

const sizeStyles = {
  sm: 'text-[10px] px-2 py-0.5 gap-1 font-semibold rounded-full',
  md: 'text-xs px-2.5 py-1 gap-1.5 font-bold rounded-xl',
  lg: 'text-sm px-3.5 py-1.5 gap-2 font-extrabold rounded-2xl',
}

export default function GlowBadge({
  children,
  variant = 'indigo',
  size = 'md',
  pulse = false,
  icon,
  className = '',
  ...props
}: GlowBadgeProps) {
  const v = variantStyles[variant] || variantStyles.indigo
  const s = sizeStyles[size] || sizeStyles.md

  return (
    <motion.span
      whileHover={{ scale: 1.04 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`inline-flex items-center backdrop-blur-md border shadow-sm transition-all duration-200 select-none ${v.container} ${s} ${className}`}
      {...(props as any)}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${v.dot}`}
          />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${v.dot}`} />
        </span>
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </motion.span>
  )
}
