// apps/web/components/ui/21st/StatCounterCard.tsx
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import InteractiveCard from './InteractiveCard'
import GlowBadge, { GlowBadgeVariant } from './GlowBadge'

interface StatCounterCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: string
    isPositive?: boolean
  }
  badge?: {
    text: string
    variant?: GlowBadgeVariant
  }
  icon: React.ReactNode
  iconColor?: string
  glowColor?: string
  className?: string
  onClick?: () => void
}

export default function StatCounterCard({
  title,
  value,
  subtitle,
  trend,
  badge,
  icon,
  iconColor = 'from-[#D914C8] to-[#4B075F]',
  glowColor = 'rgba(217, 20, 200, 0.12)',
  className = '',
  onClick,
}: StatCounterCardProps) {
  return (
    <InteractiveCard
      glowColor={glowColor}
      clickable={!!onClick}
      onClick={onClick}
      className={`p-5 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {value}
            </span>
            {trend && (
              <span
                className={`text-xs font-extrabold px-1.5 py-0.5 rounded-lg ${
                  trend.isPositive !== false
                    ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
                    : 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60'
                }`}
              >
                {trend.value}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-400 dark:text-gray-500 pt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <div
            className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${iconColor} flex items-center justify-center text-white shadow-md border border-white/20`}
          >
            {icon}
          </div>
          {badge && (
            <GlowBadge variant={badge.variant || 'brand'} size="sm">
              {badge.text}
            </GlowBadge>
          )}
        </div>
      </div>
    </InteractiveCard>
  )
}
