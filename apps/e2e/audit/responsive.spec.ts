import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

const VIEWPORTS = [
  { width: 320, height: 640, label: '320px-mobile-mini' },
  { width: 360, height: 740, label: '360px-mobile-compact' },
  { width: 375, height: 812, label: '375px-mobile-iphone-se' },
  { width: 390, height: 844, label: '390px-mobile-iphone-13' },
  { width: 430, height: 932, label: '430px-mobile-iphone-max' },
  { width: 768, height: 1024, label: '768px-tablet-portrait' },
  { width: 1024, height: 768, label: '1024px-tablet-landscape' },
  { width: 1280, height: 800, label: '1280px-laptop' },
  { width: 1440, height: 900, label: '1440px-desktop-hd' },
  { width: 1920, height: 1080, label: '1920px-desktop-fullhd' },
]

const ROUTES = [
  { path: '/principal/dashboard', name: 'principal-dashboard' },
  { path: '/principal/classes', name: 'principal-classes' },
  { path: '/principal/curriculum', name: 'principal-curriculum' },
  { path: '/principal/announcements', name: 'principal-announcements' },
  { path: '/teacher/dashboard', name: 'teacher-dashboard' },
  { path: '/teacher/assignments', name: 'teacher-assignments' },
  { path: '/teacher/classes', name: 'teacher-classes' },
  { path: '/student/dashboard', name: 'student-dashboard' },
  { path: '/student/courses', name: 'student-courses' },
  { path: '/student/communication', name: 'student-communication' },
]

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'audit-screenshots')
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
}

test.describe('Responsive Layout & Visual QA Audit', () => {
  for (const route of ROUTES) {
    test.describe(`Route: ${route.path}`, () => {
      for (const vp of VIEWPORTS) {
        test(`Responsive check @ ${vp.width}px (${vp.label})`, async ({ page }) => {
          const consoleErrors: string[] = []
          page.on('console', (msg) => {
            if (msg.type() === 'error') {
              consoleErrors.push(msg.text())
            }
          })
          page.on('pageerror', (err) => {
            consoleErrors.push(err.message)
          })

          await page.addInitScript(() => {
            try {
              sessionStorage.setItem('oxonom_pwa_splash_seen', 'true')
            } catch (_) {}
          })

          await page.setViewportSize({ width: vp.width, height: vp.height })
          await page.goto(route.path, { waitUntil: 'domcontentloaded', timeout: 25000 })
          // Allow full hydration, data restore, and motion transitions
          await page.waitForTimeout(2000)

          // Check horizontal overflow
          const overflowInfo = await page.evaluate(() => {
            const doc = document.documentElement
            const body = document.body
            const scrollWidth = Math.max(doc.scrollWidth, body ? body.scrollWidth : 0)
            const clientWidth = window.innerWidth
            const hasOverflow = scrollWidth > clientWidth + 1
            let offendingElement = ''

            if (hasOverflow && body) {
              const all = body.querySelectorAll('*')
              for (let i = 0; i < all.length; i++) {
                const el = all[i] as HTMLElement
                if (el.offsetWidth > clientWidth + 1) {
                  offendingElement = `${el.tagName.toLowerCase()}.${(el.className || '').toString().slice(0, 50)} (width: ${el.offsetWidth}px)`
                  break
                }
              }
            }

            return {
              hasOverflow,
              scrollWidth,
              clientWidth,
              offendingElement,
            }
          })

          // Save representative screenshots at mobile, tablet, and desktop
          if (vp.width === 375 || vp.width === 768 || vp.width === 1440) {
            const screenshotPath = path.join(
              SCREENSHOT_DIR,
              `${route.name}-${vp.label}.png`
            )
            await page.screenshot({ path: screenshotPath, fullPage: false })
          }

          if (overflowInfo.hasOverflow) {
            console.warn(
              `[OVERFLOW DETECTED] ${route.path} @ ${vp.width}px: scrollWidth=${overflowInfo.scrollWidth} > clientWidth=${overflowInfo.clientWidth}. Offender: ${overflowInfo.offendingElement}`
            )
          }

          expect(
            overflowInfo.hasOverflow,
            `Page ${route.path} has horizontal overflow at ${vp.width}px (${overflowInfo.scrollWidth} > ${overflowInfo.clientWidth}). Culprit: ${overflowInfo.offendingElement}`
          ).toBe(false)
        })
      }
    })
  }
})
