// Read text aloud with the browser's built-in speech synthesis (if available).
export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window

export function speak(text: string): void {
  if (!canSpeak) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = 0.85
  window.speechSynthesis.speak(utterance)
}
