'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

interface DashPageTransitionProps {
  children: React.ReactNode
  menuPosition?: 'left' | 'right'
}

/**
 * High-performance fluid page transition wrapper.
 * Keeps header and menus static while animating the switched route's
 * inner components smoothly from the menu direction (left-to-right on desktop).
 */
export default function DashPageTransition({
  children,
  menuPosition = 'left',
}: DashPageTransitionProps) {
  const pathname = usePathname()
  const offset = menuPosition === 'left' ? -22 : 22

  return (
    <div key={pathname} className="dash-stagger-container w-full min-h-0 flex-1">
      <motion.div
        initial={{ opacity: 0, x: offset }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.28,
          ease: [0.16, 1, 0.3, 1], // snappy Apple-like cubic bezier
        }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </div>
  )
}
