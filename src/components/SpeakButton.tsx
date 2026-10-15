import { canSpeak, speak } from '../lib/speak'

export default function SpeakButton({ text, label = 'Listen' }: { text: string; label?: string }) {
  if (!canSpeak) return null
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        speak(text)
      }}
      className="grid size-14 shrink-0 place-items-center rounded-full bg-sky-100 text-2xl text-sky-700 active:bg-sky-200"
    >
      🔊
    </button>
  )
}
