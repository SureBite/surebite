export const ALLERGENS = [
  'dairy',
  'gluten',
  'eggs',
  'peanuts',
  'tree_nuts',
  'soy',
  'fish',
  'shellfish',
  'sesame',
  'mustard',
  'celery',
  'lupin',
  'molluscs',
  'sulfites',
]

export const ALLERGEN_LABELS = {
  dairy: 'Dairy',
  gluten: 'Gluten',
  eggs: 'Eggs',
  peanuts: 'Peanuts',
  tree_nuts: 'Tree nuts',
  soy: 'Soy',
  fish: 'Fish',
  shellfish: 'Shellfish',
  sesame: 'Sesame',
  mustard: 'Mustard',
  celery: 'Celery',
  lupin: 'Lupin',
  molluscs: 'Molluscs',
  sulfites: 'Sulfites',
}

export const DIETARY_TYPES = ['veg', 'non_veg', 'egg']
export const DIETARY_LABELS = { veg: 'Veg', non_veg: 'Non-Veg', egg: 'Egg' }
export const DIETARY_PREFERENCES = ['all', 'veg', 'non_veg']
export const DIETARY_PREFERENCE_LABELS = { all: 'All', veg: 'Veg', non_veg: 'Non-Veg' }

export const FILTER_MODES = ['hide', 'mark']

export const MENU_STATUSES = ['processing', 'draft', 'published', 'failed']
export const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP']
export const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£' }
export const DEFAULT_CURRENCY = 'INR'

export const DEFAULT_CATEGORIES = ['Starters', 'Mains', 'Rice', 'Breads', 'Desserts', 'Drinks']

export const TOKEN_KEY = 'surebite_token'

export function allergenLabel(id) {
  return ALLERGEN_LABELS[id] || id
}

export function formatAllergens(ids = []) {
  return ids.map(allergenLabel).join(', ')
}

export function formatPrice(price, currency = DEFAULT_CURRENCY) {
  const symbol = CURRENCY_SYMBOLS[currency] || ''
  const amount = Number(price)
  if (Number.isNaN(amount)) return `${symbol}${price ?? ''}`
  return `${symbol}${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

export function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
