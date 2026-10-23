// apps/web/components/ui/21st/InteractiveCard.tsx
'use client'

import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface InteractiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  glowColor?: string
  clickable?: boolean
}

export default function InteractiveCard({
  children,
  className = '',
  glowColor = 'rgba(217, 20, 200, 0.15)',
  clickable = false,
  onClick,
  ...props
}: InteractiveCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => {
    setIsHovered(false)
    setMousePos({ x: -1000, y: -1000 })
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={clickable ? { y: -3, scale: 1.01 } : {}}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`relative overflow-hidden rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900/90 shadow-sm transition-shadow duration-300 ${clickable ? 'cursor-pointer hover:shadow-xl' : ''} ${className}`}
      {...(props as any)}
    >
      {/* 21st Radial Spotlight Glow */}
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(450px circle at ${mousePos.x}px ${mousePos.y}px, ${glowColor}, transparent 65%)`,
        }}
      />

      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
