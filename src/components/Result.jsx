import Shell, { BigButton } from './Shell.jsx'

export default function Result({ results, onHome, onRetryMissed }) {
  const correct = results.filter((r) => r.correct).length
  const total = results.length
  const percent = total ? Math.round((correct / total) * 100) : 0
  const missed = results.filter((r) => !r.correct).map((r) => r.word)
  const emoji = percent === 100 ? '🏆' : percent >= 70 ? '🌟' : '💪'

  return (
    <Shell
      onHome={onHome}
      progress={1}
      label={`${total}/${total}`}
      footer={
        <div className="flex gap-3 pt-2">
          <BigButton tone="light" onClick={onHome}>
            Home
          </BigButton>
          {missed.length > 0 && <BigButton onClick={() => onRetryMissed(missed)}>Retry missed</BigButton>}
        </div>
      }
    >
      <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        <div className="text-6xl">{emoji}</div>
        <p className="mt-3 text-6xl font-extrabold text-sky-700">{percent}%</p>
        <p className="mt-2 text-xl text-slate-600">
          {correct} of {total} correct
        </p>
      </div>

      {missed.length > 0 && (
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 text-lg font-bold text-slate-800">Words to practice</h2>
          <div className="flex flex-wrap gap-2">
            {missed.map((w) => (
              <span key={w} className="rounded-full bg-rose-100 px-4 py-2 text-lg font-semibold text-rose-800">
                {w}
              </span>
            ))}
          </div>
        </div>
      )}
    </Shell>
  )
}
