// Read text aloud with the browser's built-in Web Speech API (free, no network, no key).
// Available voices depend on the device; we pick the most natural standard English one.
export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window

// Novelty / robotic voices shipped on Apple devices: never use them.
const NOVELTY =
  /albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|ralph|kathy|princess|grandma|grandpa|rocko|shelley|eddy|flo|reed|sandy/i

// Natural-sounding voices, best first (Apple, Google, Microsoft).
const PREFERRED = [
  /ava/i,
  /samantha/i,
  /allison/i,
  /zoe/i,
  /evan/i,
  /nicky/i,
  /susan/i,
  /google us english/i,
  /microsoft (aria|jenny|guy|ava|andrew)/i,
]

function score(v: SpeechSynthesisVoice): number {
  if (NOVELTY.test(v.name)) return -1000
  let s = 0
  const lang = v.lang.replace('_', '-').toLowerCase()
  if (lang === 'en-us') s += 100
  else if (lang.startsWith('en')) s += 50
  else return -1000
  if (/premium/i.test(v.name)) s += 30
  else if (/enhanced|natural|neural/i.test(v.name)) s += 20
  const rank = PREFERRED.findIndex((re) => re.test(v.name))
  if (rank >= 0) s += 20 - rank
  if (v.localService) s += 1
  return s
}

let voice: SpeechSynthesisVoice | null = null

function pickVoice() {
  const voices = window.speechSynthesis.getVoices()
  voice = voices.reduce<SpeechSynthesisVoice | null>((best, v) => {
    const sv = score(v)
    return sv > 0 && (!best || sv > score(best)) ? v : best
  }, null)
}

if (canSpeak) {
  pickVoice()
  window.speechSynthesis.addEventListener?.('voiceschanged', pickVoice)
}

export function speak(text: string): void {
  if (!canSpeak) return
  if (!voice) pickVoice()
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  if (voice) utterance.voice = voice
  utterance.rate = 0.85
  utterance.pitch = 1
  window.speechSynthesis.speak(utterance)
}
