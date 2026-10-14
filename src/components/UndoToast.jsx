import { useEffect } from 'react'
import { RotateCcw } from 'lucide-react'

function UndoToast({ message, onUndo, onTimeout, duration = 6000 }) {
  useEffect(() => {
    const timer = setTimeout(onTimeout, duration)
    return () => clearTimeout(timer)
  }, [onTimeout, duration])

  return (
    <div className="no-print fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div
        role="status"
        aria-live="polite"
        className="relative flex animate-fade-up items-center gap-4 overflow-hidden rounded-xl bg-ink py-3 pl-4 pr-2 text-sm text-white shadow-xl"
      >
        <span>{message}</span>
        <button
          type="button"
          onClick={onUndo}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold text-brand-tint transition-colors hover:bg-white/10 hover:text-white"
        >
          <RotateCcw size={14} aria-hidden="true" /> Undo
        </button>
        <span
          className="absolute bottom-0 left-0 h-0.5 w-full origin-left bg-brand-tint/70"
          style={{ animation: `shrink-x ${duration}ms linear forwards` }}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}

export default UndoToast
