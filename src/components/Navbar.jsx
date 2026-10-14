import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ArrowRight, Info, Leaf, LogOut, X } from 'lucide-react'
import { API_URL, USE_MOCK } from '../api/api'
import { useAuth } from '../context/AuthContext'

export function Logo({ to = '/', light = false, small = false, large = false }) {
  const mark = (
    <>
      <span
        className={`inline-flex items-center justify-center rounded-lg ${small ? 'h-6 w-6' : large ? 'h-10 w-10 rounded-xl' : 'h-8 w-8'} ${
          light ? 'bg-white text-brand' : 'bg-brand text-white'
        }`}
      >
        <Leaf size={small ? 14 : large ? 22 : 18} aria-hidden="true" />
      </span>
      <span className={`${small ? 'text-sm' : large ? 'text-[22px]' : 'text-lg'} font-medium ${light ? 'text-white' : 'text-ink'}`}>SureBite</span>
    </>
  )
  const gap = large ? 'gap-2.5' : 'gap-2'
  if (!to) return <span className={`inline-flex items-center ${gap}`}>{mark}</span>
  return (
    <Link to={to} className={`inline-flex items-center ${gap}`} aria-label="SureBite home">
      {mark}
    </Link>
  )
}

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

function AiStatusModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-status-title"
      onClick={onClose}
    >
      <div className="card w-full max-w-md animate-scale-in p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <h2 id="ai-status-title" className="text-2xl">
            AI status
          </h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="font-semibold">Menu extraction</dt>
            <dd className="text-muted">
              {USE_MOCK
                ? 'Demo mode. Uploads return sample dishes; no photo is sent to an AI service.'
                : 'Handled by the SureBite server when you upload a menu photo.'}
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Data source</dt>
            <dd className="break-all text-muted">{USE_MOCK ? 'Mock data saved in this browser' : API_URL}</dd>
          </div>
        </dl>
        <p className="notice notice-amber mt-5">
          AI allergen tags are preliminary suggestions. Nothing reaches your guests until your staff verify every dish
          and publish.
        </p>
      </div>
    </div>
  )
}

export function useScrollHeader({ offset = 8, hideAfter = 120 } = {}) {
  const [state, setState] = useState({ scrolled: false, hidden: false })
  const lastY = useRef(0)

  useEffect(() => {
    let frame = 0
    function update() {
      frame = 0
      const y = window.scrollY
      const delta = y - lastY.current
      if (Math.abs(delta) < 6 && y > offset) return
      lastY.current = y
      setState((current) => {
        const next = { scrolled: y > offset, hidden: y > hideAfter && delta > 0 }
        return next.scrolled === current.scrolled && next.hidden === current.hidden ? current : next
      })
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    lastY.current = window.scrollY
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [offset, hideAfter])

  const reveal = () => setState((current) => (current.hidden ? { ...current, hidden: false } : current))
  return { ...state, reveal }
}

export function stickyHeaderClass({ scrolled, hidden }, { solidTop = false } = {}) {
  return `sticky top-0 z-40 transition-[transform,background-color,box-shadow,border-color] duration-300 ease-out ${
    hidden ? '-translate-y-full shadow-none' : 'translate-y-0'
  } ${
    scrolled
      ? `border-b border-line/60 bg-cream/70 backdrop-blur-xl backdrop-saturate-150 ${hidden ? '' : 'shadow-[0_8px_24px_-16px_rgba(31,42,36,0.35)]'}`
      : solidTop
        ? 'border-b border-line bg-white'
        : 'border-b border-transparent bg-transparent'
  }`
}

const PUBLIC_LINKS = [
  { id: 'how-it-works', label: 'How it works' },
  { id: 'for-restaurants', label: 'For restaurants' },
  { id: 'faqs', label: 'FAQs' },
]

function useActiveSection(ids, enabled) {
  const [active, setActive] = useState('')
  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === 'undefined') return
    const visible = new Map()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => visible.set(entry.target.id, entry.isIntersecting))
        setActive(ids.find((id) => visible.get(id)) || '')
      },
      { rootMargin: '-30% 0px -55% 0px' },
    )
    ids.forEach((id) => {
      const node = document.getElementById(id)
      if (node) observer.observe(node)
    })
    return () => observer.disconnect()
  }, [ids, enabled])
  return active
}

const navItemClass = (active) =>
  `rounded-xl px-5 py-2.5 text-[15px] transition-all duration-200 ${
    active ? 'bg-white font-semibold text-ink shadow-sm' : 'text-muted hover:text-ink'
  }`

function NavBox({ label, children }) {
  return (
    <nav
      className="flex items-center gap-1 rounded-2xl border border-line bg-white/50 p-1.5 backdrop-blur-sm"
      aria-label={label}
    >
      {children}
    </nav>
  )
}

function Navbar({ variant = 'public' }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showAiStatus, setShowAiStatus] = useState(false)
  const header = useScrollHeader()
  const activeSection = useActiveSection(
    PUBLIC_LINKS.map((link) => link.id),
    variant === 'public',
  )

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className={`no-print ${stickyHeaderClass(header)}`} onFocusCapture={header.reveal}>
      <div className="page grid min-h-[5.75rem] grid-cols-[1fr_auto] items-center gap-x-6 gap-y-2 py-4 md:grid-cols-[1fr_auto_1fr]">
        <Logo to={variant === 'manager' ? '/dashboard' : '/'} large />

        {variant === 'manager' ? (
          <>
            <div className="order-3 col-span-2 flex justify-center md:order-none md:col-span-1">
              <NavBox label="Workspace">
                <NavLink to="/dashboard" className={({ isActive }) => navItemClass(isActive)}>
                  Menus
                </NavLink>
                <NavLink to="/upload" className={({ isActive }) => navItemClass(isActive)}>
                  Upload menu
                </NavLink>
                <button type="button" className={`${navItemClass(false)} inline-flex items-center gap-1.5`} onClick={() => setShowAiStatus(true)}>
                  <span className={`h-2 w-2 rounded-full ${USE_MOCK ? 'bg-warn-text' : 'bg-brand'}`} aria-hidden="true" />
                  AI status
                  <Info size={14} aria-hidden="true" />
                </button>
              </NavBox>
            </div>
            <div className="flex items-center justify-end gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand">
                {initials(user?.name)}
              </span>
              <span className="hidden text-[15px] font-medium sm:inline">{user?.name}</span>
              <button type="button" className="ml-2 inline-flex items-center gap-1.5 text-[15px] text-muted transition-colors hover:text-ink" onClick={handleLogout}>
                <LogOut size={16} aria-hidden="true" /> Log out
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="hidden justify-center md:flex">
              <NavBox label="Main">
                {PUBLIC_LINKS.map((link) => (
                  <a
                    key={link.id}
                    href={`/#${link.id}`}
                    className={navItemClass(activeSection === link.id)}
                    aria-current={activeSection === link.id ? 'location' : undefined}
                  >
                    {link.label}
                  </a>
                ))}
              </NavBox>
            </div>
            <div className="flex items-center justify-end gap-6">
              {user ? (
                <Link to="/dashboard" className="btn btn-primary rounded-full px-6 py-3 text-[15px]">
                  Go to dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/auth?mode=register"
                    className="group inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand-soft px-6 py-3 text-[15px] font-semibold text-brand transition-all duration-200 hover:border-brand hover:bg-brand hover:text-white active:scale-[0.97]"
                  >
                    Get started
                    <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                  <Link to="/auth" className="text-[15px] font-semibold text-ink transition-colors hover:text-brand">
                    Manager sign in
                  </Link>
                </>
              )}
            </div>
          </>
        )}
      </div>
      {showAiStatus && <AiStatusModal onClose={() => setShowAiStatus(false)} />}
    </header>
  )
}

export default Navbar
