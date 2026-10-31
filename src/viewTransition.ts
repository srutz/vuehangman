import { nextTick } from 'vue'

/**
 * Runs a state change inside a browser View Transition, so elements that enter
 * or leave the DOM are animated. Falls back to a plain update when the API is
 * unavailable or the user prefers reduced motion.
 */
export function withTransition(update: () => void) {
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (!document.startViewTransition || reduceMotion) {
    update()
    return
  }
  document.startViewTransition(async () => {
    update()
    await nextTick()
  })
}
