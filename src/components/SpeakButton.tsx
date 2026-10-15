import { canSpeak, speak } from '../lib/speak'

const SIZES = {
  sm: 'size-10 text-lg',
  md: 'size-12 text-xl',
}

export default function SpeakButton({
  text,
  label = 'Listen',
  size = 'md',
}: {
  text: string
  label?: string
  size?: keyof typeof SIZES
}) {
  if (!canSpeak) return null
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        speak(text)
      }}
      className={`grid shrink-0 place-items-center rounded-full bg-sky-100 text-sky-700 active:bg-sky-200 ${SIZES[size]}`}
    >
      🔊
    </button>
  )
}
