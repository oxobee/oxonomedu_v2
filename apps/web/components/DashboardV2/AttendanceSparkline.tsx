'use client'

import React from 'react'

interface AttendanceSparklineProps {
  data?: number[]
  className?: string
  width?: number
  height?: number
  strokeColor?: string
}

export default function AttendanceSparkline({
  data = [98, 94, 91, 96, 92],
  className = '',
  width = 90,
  height = 24,
  strokeColor = '#059669', // emerald-600
}: AttendanceSparklineProps) {
  if (!data || data.length < 2) return null

  const min = Math.min(...data) - 4
  const max = Math.max(...data) + 2
  const range = max - min || 1

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * (width - 6) + 3
    const y = height - ((val - min) / range) * (height - 8) - 4
    return { x, y, val }
  })

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`
  }, '')

  // Area path for gradient fill
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Fill area */}
        <path d={areaD} fill="url(#attendanceGradient)" />

        {/* Sparkline curve */}
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Last active point dot */}
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="2.5"
          fill="#FFFFFF"
          stroke={strokeColor}
          strokeWidth="2"
        />
      </svg>
    </div>
  )
}
