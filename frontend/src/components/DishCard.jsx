import { AlertTriangle, Check } from 'lucide-react'
import { DIETARY_LABELS, allergenLabel, formatAllergens, formatPrice } from '../utils/constants'

const MARK_STYLES = {
  veg: { border: 'border-green-700', text: 'text-green-800' },
  non_veg: { border: 'border-red-800', text: 'text-red-800' },
  egg: { border: 'border-amber-500', text: 'text-amber-700' },
}

export function DietaryMark({ dietaryType = 'veg', showLabel = true }) {
  const style = MARK_STYLES[dietaryType] || MARK_STYLES.veg
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${style.text}`}>
      <span className={`flex h-3.5 w-3.5 items-center justify-center border-[1.5px] bg-white ${style.border}`} aria-hidden="true">
        {dietaryType === 'veg' && <span className="h-1.5 w-1.5 rounded-full bg-green-700" />}
        {dietaryType === 'non_veg' && (
          <span className="h-0 w-0 border-x-[3.5px] border-b-[6px] border-x-transparent border-b-red-800" />
        )}
        {dietaryType === 'egg' && <span className="h-1.5 w-1.5 bg-amber-500" />}
      </span>
      {showLabel && (DIETARY_LABELS[dietaryType] || DIETARY_LABELS.veg)}
    </span>
  )
}

function DishCard({ dish, currency, selectedAllergens = [] }) {
  const allergens = dish.allergens || []
  const conflicts = allergens.filter((allergen) => selectedAllergens.includes(allergen))
  const hasConflict = conflicts.length > 0
  const filtering = selectedAllergens.length > 0

  return (
    <article className={`card p-4 transition-colors duration-300 ${hasConflict ? 'border-danger-line' : ''}`}>
      <div className="flex items-center justify-between gap-3">
        <DietaryMark dietaryType={dish.dietaryType} />
        {dish.isVerified !== false && (
          <span className="inline-flex items-center gap-1 text-[11px] text-muted">
            <Check size={11} aria-hidden="true" /> Staff verified
          </span>
        )}
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-4">
        <h3 className="font-serif text-lg text-ink">{dish.name}</h3>
        <span className="text-sm font-bold">{formatPrice(dish.price, currency)}</span>
      </div>

      {dish.description && <p className="mt-1.5 text-sm text-muted">{dish.description}</p>}

      <p className="mt-2 text-xs font-semibold text-ink">
        {allergens.length > 0 ? `Contains: ${formatAllergens(allergens)}` : 'No allergens listed by the restaurant'}
      </p>

      {hasConflict && (
        <p className="mt-3 flex animate-fade-in items-center gap-2 rounded-lg bg-danger-bg px-3 py-2 text-xs font-semibold text-danger-text">
          <AlertTriangle size={14} aria-hidden="true" />
          Allergen conflict: {conflicts.map(allergenLabel).join(', ')}
        </p>
      )}
      {filtering && !hasConflict && (
        <p className="mt-3 flex animate-fade-in items-center gap-2 rounded-lg bg-brand-soft px-3 py-2 text-xs font-semibold text-brand">
          <Check size={14} aria-hidden="true" />
          Matches your filters
        </p>
      )}
    </article>
  )
}

export default DishCard
