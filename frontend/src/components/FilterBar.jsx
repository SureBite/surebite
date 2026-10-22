import { Check, Plus } from 'lucide-react'
import { ALLERGENS, DIETARY_PREFERENCES, DIETARY_PREFERENCE_LABELS, allergenLabel } from '../utils/constants'

function Segmented({ label, options, value, onChange }) {
  return (
    <div className="flex gap-1 rounded-xl bg-brand-soft p-1" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.97] ${
            value === option.value ? 'bg-brand text-white' : 'text-ink hover:bg-brand-tint'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function FilterBar({
  dietaryPreference,
  setDietaryPreference,
  selectedAllergens,
  toggleAllergen,
  clearAllergens,
  filterMode,
  setFilterMode,
}) {
  return (
    <div className="space-y-5">
      <section>
        <h2 className="mb-2 font-sans text-sm font-semibold tracking-normal">What would you like to explore?</h2>
        <Segmented
          label="Dietary preference"
          value={dietaryPreference}
          onChange={setDietaryPreference}
          options={DIETARY_PREFERENCES.map((value) => ({ value, label: DIETARY_PREFERENCE_LABELS[value] }))}
        />
        <p className="mt-2 text-xs text-muted">Veg excludes egg and meat. Egg shows egg dishes. Non-Veg shows meat and fish.</p>
      </section>

      <section className="card p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-sans text-sm font-semibold tracking-normal">Allergens to avoid</h2>
          <button
            type="button"
            className="text-xs font-semibold text-brand disabled:opacity-40"
            onClick={clearAllergens}
            disabled={selectedAllergens.length === 0}
          >
            Clear all
          </button>
        </div>
        <p className="mt-1 text-xs text-muted">Select any of the 14 allergen groups.</p>

        <div className="mt-3 grid grid-cols-2 gap-2 min-[380px]:grid-cols-3">
          {ALLERGENS.map((allergen) => {
            const selected = selectedAllergens.includes(allergen)
            return (
              <button
                key={allergen}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleAllergen(allergen)}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-2.5 text-left text-xs font-medium transition-all duration-200 active:scale-95 ${
                  selected ? 'border-brand bg-brand text-white' : 'border-line bg-white text-ink hover:border-brand'
                }`}
              >
                {selected ? <Check size={12} className="animate-scale-in" aria-hidden="true" /> : <Plus size={12} className="text-muted" aria-hidden="true" />}
                {allergenLabel(allergen)}
              </button>
            )
          })}
        </div>

        <div className="mt-4 border-t border-line pt-4">
          <h3 className="mb-2 text-xs font-semibold">Dishes with selected allergens</h3>
          <Segmented
            label="Dishes with selected allergens"
            value={filterMode}
            onChange={setFilterMode}
            options={[
              { value: 'hide', label: 'Hide' },
              { value: 'mark', label: 'Mark' },
            ]}
          />
          <p className="mt-2 text-xs text-muted">
            {filterMode === 'hide'
              ? 'Hide removes dishes containing your selections.'
              : 'Mark keeps all dishes and flags allergen conflicts.'}
          </p>
        </div>
      </section>
    </div>
  )
}

export default FilterBar
