import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShieldCheck, X } from 'lucide-react'
import api, { getErrorMessage } from '../api/api'
import DishCard from '../components/DishCard'
import FilterBar from '../components/FilterBar'
import { Logo, stickyHeaderClass, useScrollHeader } from '../components/Navbar'
import { useMenuFilter } from '../hooks/useMenuFilter'
import { allergenLabel } from '../utils/constants'

const DISCLAIMER =
  'Allergen information is verified by restaurant staff. Cross-contact may occur in the kitchen. Please tell your server about your allergies before ordering.'

function plural(count, one, many) {
  return `${count} ${count === 1 ? one : many}`
}

function DinerMenu() {
  const { slug } = useParams()
  const [menu, setMenu] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const header = useScrollHeader()

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    api.diner
      .getMenu(slug)
      .then((data) => {
        if (!active) return
        setMenu(data.menu)
        api.diner.logScan(slug, {}).catch(() => {})
      })
      .catch((err) => active && setError(getErrorMessage(err)))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [slug])

  const items = useMemo(() => (menu?.items || []).filter((dish) => dish.isVerified !== false), [menu])
  const filter = useMenuFilter(items)
  const { dietaryPreference, selectedAllergens, filterMode, visibleItems, groupedByCategory, safeItemsCount, totalItems } = filter

  if (loading) {
    return (
      <div className="mx-auto min-h-screen max-w-lg bg-cream">
        <p className="page-loader" role="status">Loading the menu…</p>
      </div>
    )
  }

  if (!menu) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-4 bg-cream px-4">
        <Logo to="" />
        <h1 className="text-3xl">We couldn’t open this menu.</h1>
        <p className="notice notice-red" role="alert">
          {error}
        </p>
        <p className="text-sm text-muted">It may have been taken offline. Please ask the restaurant staff for a menu, and tell them about any allergies.</p>
      </main>
    )
  }

  const title = menu.restaurantName || menu.name
  const filtering = dietaryPreference !== 'all' || selectedAllergens.length > 0
  const conflictCount = visibleItems.length - safeItemsCount
  const hiddenCount = totalItems - visibleItems.length
  const categories = Object.keys(groupedByCategory)

  function resetFilters() {
    filter.setDietaryPreference('all')
    filter.clearAllergens()
  }

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-cream shadow-sm">
      <header className={`flex items-center justify-between px-4 py-3 ${stickyHeaderClass(header, { solidTop: true })}`} onFocusCapture={header.reveal}>
        <Logo to="" small />
        <span className="text-[11px] text-muted">No sign-in needed</span>
      </header>

      <div
        className="bg-brand-dark bg-cover bg-center px-4 pb-5 pt-16 text-white"
        style={{ backgroundImage: 'linear-gradient(rgba(34,58,48,0.45), rgba(34,58,48,0.9)), url(/images/restaurant-interior.jpg)' }}
      >
        <h1 className="text-3xl text-white">{title}</h1>
        <p className="mt-1.5 text-xs text-white/90">
          {menu.restaurantName ? `${menu.name} · ` : ''}Prices in {menu.currency}
        </p>
      </div>

      <main className="space-y-5 px-4 py-4">
        <div className="notice notice-green block">
          <p className="flex items-center gap-2 font-semibold">
            <ShieldCheck size={16} className="text-brand" aria-hidden="true" /> A note before you order
          </p>
          <p className="mt-2 text-xs text-muted">{DISCLAIMER}</p>
        </div>

        <FilterBar {...filter} />

        {selectedAllergens.length > 0 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider">Your filters</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedAllergens.map((allergen) => (
                <button
                  key={allergen}
                  type="button"
                  className="pill bg-brand text-white"
                  onClick={() => filter.toggleAllergen(allergen)}
                  aria-label={`Remove ${allergenLabel(allergen)} filter`}
                >
                  {allergenLabel(allergen)} <X size={11} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        )}

        {categories.length > 1 && (
          <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Menu sections">
            {categories.map((category) => (
              <a
                key={category}
                href={`#section-${category}`}
                className={`pill shrink-0 border border-line px-4 py-2 ${groupedByCategory[category].length > 0 ? 'bg-white text-ink' : 'bg-cream text-muted'}`}
              >
                {category} · {groupedByCategory[category].length}
              </a>
            ))}
          </nav>
        )}

        <div aria-live="polite">
          <h2 className="text-2xl">
            {filtering ? `${plural(safeItemsCount, 'dish matches', 'dishes match')} your filters` : plural(totalItems, 'dish', 'dishes')}
          </h2>
          <p className="mt-1 text-xs text-muted">
            {filterMode === 'mark' && conflictCount > 0
              ? `Showing ${hiddenCount === 0 ? 'all ' : ''}${plural(visibleItems.length, 'dish', 'dishes')} · ${conflictCount} ${conflictCount === 1 ? 'has' : 'have'} allergen conflicts`
              : `Showing ${visibleItems.length} of ${plural(totalItems, 'dish', 'dishes')}${hiddenCount > 0 ? ` · ${hiddenCount} hidden by your filters` : ''}`}
          </p>
        </div>

        {visibleItems.length === 0 ? (
          <div className="card animate-scale-in p-6 text-center">
            <h3 className="font-serif text-xl">{totalItems === 0 ? 'This menu has no dishes yet' : 'No matching dishes'}</h3>
            <p className="mt-2 text-sm text-muted">
              {totalItems === 0
                ? 'Please ask the restaurant staff for today’s menu.'
                : 'No dishes on this menu fit the filters you chose. The staff may be able to suggest or adapt a dish for you.'}
            </p>
            {totalItems > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button type="button" className="btn btn-primary btn-sm" onClick={resetFilters}>
                  Clear filters
                </button>
                {filterMode === 'hide' && selectedAllergens.length > 0 && (
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => filter.setFilterMode('mark')}>
                    Show dishes with warnings
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          categories
            .filter((category) => groupedByCategory[category].length > 0)
            .map((category) => (
              <section key={category} id={`section-${category}`} className="scroll-mt-20 space-y-3">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-sans text-base font-semibold tracking-normal">{category}</h2>
                  <span className="text-[11px] text-muted">{plural(groupedByCategory[category].length, 'dish', 'dishes')}</span>
                </div>
                {groupedByCategory[category].map((dish, index) => (
                  <div key={dish._id || `${category}-${index}`} className="animate-fade-up" style={{ animationDelay: `${Math.min(index, 6) * 50}ms` }}>
                    <DishCard dish={dish} currency={menu.currency} selectedAllergens={selectedAllergens} />
                  </div>
                ))}
              </section>
            ))
        )}
      </main>

      <footer className="mx-4 border-t border-line py-6 text-center">
        <p className="text-left text-xs text-muted">{DISCLAIMER}</p>
        <div className="mt-4 flex justify-center">
          <Logo to="" small />
        </div>
        {menu.restaurantName && <p className="mt-2 text-[11px] text-muted">Menu information verified by {menu.restaurantName}.</p>}
      </footer>
    </div>
  )
}

export default DinerMenu
