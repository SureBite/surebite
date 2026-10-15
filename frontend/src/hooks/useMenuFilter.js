import { useCallback, useMemo, useState } from 'react'

export function filterDishes(items, { dietaryPreference, selectedAllergens, filterMode }) {
  return items.filter((dish) => {
    const itemDietary = dish.dietaryType || 'veg'
    if (dietaryPreference === 'veg' && itemDietary !== 'veg') {
      return false
    }
    if (dietaryPreference === 'non_veg' && itemDietary !== 'non_veg') {
      return false
    }

    if (selectedAllergens.length === 0) return true

    const dishAllergens = dish.allergens || []
    const hasConflict = selectedAllergens.some((a) => dishAllergens.includes(a))

    if (filterMode === 'hide') {
      return !hasConflict
    }
    return true
  })
}

export function useMenuFilter(items) {
  const [dietaryPreference, setDietaryPreference] = useState('all')
  const [selectedAllergens, setSelectedAllergens] = useState([])
  const [filterMode, setFilterMode] = useState('hide')

  const toggleAllergen = useCallback((allergen) => {
    setSelectedAllergens((current) =>
      current.includes(allergen) ? current.filter((a) => a !== allergen) : [...current, allergen],
    )
  }, [])

  const clearAllergens = useCallback(() => setSelectedAllergens([]), [])

  const list = useMemo(() => items || [], [items])

  const visibleItems = useMemo(
    () => filterDishes(list, { dietaryPreference, selectedAllergens, filterMode }),
    [list, dietaryPreference, selectedAllergens, filterMode],
  )

  const groupedByCategory = useMemo(() => {
    const groups = {}
    list.forEach((dish) => {
      groups[dish.category || 'Other'] = []
    })
    visibleItems.forEach((dish) => {
      groups[dish.category || 'Other'].push(dish)
    })
    return groups
  }, [list, visibleItems])

  const safeItemsCount = useMemo(
    () => filterDishes(list, { dietaryPreference, selectedAllergens, filterMode: 'hide' }).length,
    [list, dietaryPreference, selectedAllergens],
  )

  return {
    dietaryPreference,
    setDietaryPreference,
    selectedAllergens,
    toggleAllergen,
    clearAllergens,
    filterMode,
    setFilterMode,
    visibleItems,
    groupedByCategory,
    safeItemsCount,
    totalItems: list.length,
  }
}

export default useMenuFilter
