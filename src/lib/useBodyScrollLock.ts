import { useEffect } from 'react'

/**
 * Keep the page behind a dialog from scrolling while the calling component is mounted.
 * Pinning the body with position: fixed is the variant that also works on iOS Safari
 * (overflow: hidden alone does not).
 */
export function useBodyScrollLock(): void {
  useEffect(() => {
    const { body } = document
    const y = window.scrollY
    const prev = body.style.cssText
    body.style.cssText += `;position:fixed;top:-${y}px;left:0;right:0;overflow:hidden`
    return () => {
      body.style.cssText = prev
      window.scrollTo(0, y)
    }
  }, [])
}
