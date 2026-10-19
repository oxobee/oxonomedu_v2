// Public face of the Quickdraw engine. The React and React Native SDKs build
// boards through here — same editor, same UI, same feel — and so can any
// plain web page: every module is dependency-free ESM.

export { Editor, TOOLS } from './editor.js'
export { Store, newId, isDiffEmpty, invertDiff, composeDiff, packDiff, unpackDiff, streamDiffs } from './store.js'
export { buildUI } from './ui.js'
export {
  themeOf, THEMES, COLOR_IDS, SIZE_IDS, DASH_IDS, FILL_IDS, GEO_IDS, GRID_IDS,
  SIZES, FONT_SIZES, FONTS,
} from './palette.js'
export { pageBounds, localBounds, drawShape, hitShape } from './shapes.js'
export { strokeOutline, inkOptions } from './freehand.js'

import { Editor } from './editor.js'
import { buildUI } from './ui.js'

// The Oxonom mark in the board's corner. Hosts that need it gone pass watermark: false.
export function buildWatermark(editor) {
  const a = document.createElement('a')
  a.className = 'qd-watermark'
  a.href = '/pano'
  a.setAttribute('aria-label', 'Oxonom Pano Ekranına Dön')
  a.innerHTML =
    `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true" style="width:18px;height:18px;border-radius:6px;overflow:hidden">` +
    `<rect width="32" height="32" rx="8" fill="url(#ox-wm-g)" />` +
    `<circle cx="16" cy="16" r="3.5" fill="white" />` +
    `<path d="M9 16C9 12.134 12.134 9 16 9C19.866 9 23 12.134 23 16" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="24 6" />` +
    `<defs><linearGradient id="ox-wm-g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">` +
    `<stop stop-color="#4B075F"/><stop offset="0.55" stop-color="#8D49A6"/><stop offset="1" stop-color="#D914C8"/>` +
    `</linearGradient></defs></svg><span>OXONOM</span>`
  a.addEventListener('pointerdown', (e) => e.stopPropagation())
  editor.container.appendChild(a)
  return a
}

// One call: editor + chrome in a container.
// opts: { container, store?, theme?, grid?, readonly?, hideUi?, camera?, styles?,
//         onSave?, themeToggle?, gridControl?, watermark? }
export function createQuickdraw(opts) {
  const editor = new Editor(opts)
  editor.container.dataset.qdTheme = editor.theme.id
  const ui = buildUI(editor, {
    hidden: opts.hideUi || opts.readonly,
    onSave: opts.onSave,
    themeToggle: opts.themeToggle,
    gridControl: opts.gridControl,
  })
  const watermark = opts.watermark === false ? null : buildWatermark(editor)
  return {
    editor,
    ui,
    destroy() {
      watermark?.remove()
      ui.destroy()
      editor.destroy()
    },
  }
}
