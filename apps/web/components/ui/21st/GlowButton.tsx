// apps/web/components/ui/21st/GlowButton.tsx
'use client'

import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'

export type GlowButtonVariant = 'primary' | 'secondary' | 'brand' | 'emerald' | 'ghost'

interface GlowButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode
  variant?: GlowButtonVariant
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  iconRight?: React.ReactNode
  glow?: boolean
  shimmer?: boolean
  isLoading?: boolean
  className?: string
}

const variantStyles: Record<GlowButtonVariant, string> = {
  brand: 'bg-gradient-to-r from-[#D914C8] to-[#600A5B] text-white hover:brightness-110 shadow-lg shadow-[#D914C8]/30 border border-[#D914C8]/40',
  primary: 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:brightness-110 shadow-lg shadow-indigo-500/25 border border-indigo-400/30',
  emerald: 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white hover:brightness-110 shadow-lg shadow-emerald-500/25 border border-emerald-400/30',
  secondary: 'bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-100 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm',
  ghost: 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/70',
}

const sizeStyles = {
  sm: 'text-xs px-3 py-1.5 rounded-xl gap-1.5 font-bold',
  md: 'text-sm px-4 py-2.5 rounded-2xl gap-2 font-bold',
  lg: 'text-base px-6 py-3.5 rounded-2xl gap-2.5 font-extrabold',
}

export default function GlowButton({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  glow = true,
  shimmer = true,
  isLoading = false,
  className = '',
  disabled,
  ...props
}: GlowButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      disabled={disabled || isLoading}
      className={`relative inline-flex items-center justify-center overflow-hidden transition-all duration-200 select-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {/* 21st Subtle Shimmer Line Animation */}
      {shimmer && !disabled && !isLoading && (
        <span className="absolute inset-0 pointer-events-none overflow-hidden rounded-inherit">
          <span className="absolute -inset-[100%] w-[300%] h-[300%] bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-[120%] animate-[shimmer_4s_infinite_linear]" />
        </span>
      )}

      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4 mr-2 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}

      <span className="relative z-10 flex items-center gap-1.5">{children}</span>

      {iconRight && !isLoading && <span className="shrink-0 relative z-10">{iconRight}</span>}
    </motion.button>
  )
}
