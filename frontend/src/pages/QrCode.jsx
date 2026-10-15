import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Copy, Download, ExternalLink, Printer, ShieldCheck } from 'lucide-react'
import api, { getErrorMessage } from '../api/api'
import { Logo } from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils/constants'

const PRINT_CHECKS = [
  'Print at actual size on sturdy, matte card.',
  'Keep the white border around the QR clear.',
  'Check the printed QR on a phone before placing it.',
  'Fold along the guide to make a standing table tent.',
]

function download(href, filename) {
  const link = document.createElement('a')
  link.href = href
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
}

function QrCode() {
  const { id } = useParams()
  const { user } = useAuth()
  const [menu, setMenu] = useState(null)
  const [qr, setQr] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const { menu: found } = await api.menus.getById(id)
        if (!active) return
        setMenu(found)
        if (found.status === 'published') {
          const codes = await api.menus.getQr(id)
          if (active) setQr(codes)
        }
      } catch (err) {
        if (active) setError(getErrorMessage(err))
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [id])

  if (loading) return <p className="page-loader" role="status">Preparing your QR code…</p>

  if (!menu || (menu.status === 'published' && !qr)) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <p className="notice notice-red" role="alert">
          {error || 'We couldn’t load this QR code.'}
        </p>
        <Link to="/dashboard" className="btn btn-secondary">
          <ArrowLeft size={15} aria-hidden="true" /> Back to menus
        </Link>
      </div>
    )
  }

  if (menu.status !== 'published') {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <p className="eyebrow">{menu.name}</p>
        <h1 className="text-3xl">This menu isn’t published yet.</h1>
        <p className="notice notice-amber">A QR code is created once every dish has been verified and the menu is published.</p>
        <div className="flex flex-wrap gap-3">
          <Link to={`/menus/${id}/verify`} className="btn btn-primary">
            Review this menu
          </Link>
          <Link to="/dashboard" className="btn btn-secondary">
            Back to menus
          </Link>
        </div>
      </div>
    )
  }

  const items = menu.items || []
  const verified = items.filter((dish) => dish.isVerified).length
  const fileBase = `surebite-${menu.slug}`
  const publishedOn = formatDate(menu.publishedAt || menu.updatedAt)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(qr.publicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('We couldn’t copy the link. Select it and copy it by hand.')
    }
  }

  function downloadSvg() {
    const url = URL.createObjectURL(new Blob([qr.qrSvg], { type: 'image/svg+xml' }))
    download(url, `${fileBase}.svg`)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div className="space-y-6">
      <div className="no-print space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">
              {user?.restaurantName} · {menu.name}
            </p>
            <h1 className="mt-2 text-4xl">Your menu is ready for the table.</h1>
            <p className="mt-2 text-sm text-muted">
              {verified === items.length ? `All ${items.length} dishes are staff verified. ` : ''}Your published menu is now available to guests.
            </p>
          </div>
          <span className="pill pill-green">
            <Check size={11} aria-hidden="true" /> Published
          </span>
        </div>

        <div className="notice notice-green">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
          <div>
            <p className="font-semibold">Published after human review</p>
            <p className="mt-1 text-xs text-muted">
              {menu.name} · {verified} / {items.length} verified{publishedOn && ` · Published ${publishedOn}`} · {menu.currency}
            </p>
          </div>
        </div>

        {error && (
          <p className="notice notice-red" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="no-print space-y-6">
          <section className="card p-6">
            <h2 className="font-sans text-lg font-semibold tracking-normal">Share your {menu.name.toLowerCase()}</h2>
            <img src={qr.qrPng} alt={`QR code that opens ${qr.publicUrl}`} className="mx-auto mt-5 h-44 w-44 animate-scale-in" />
            <p className="mt-3 text-center text-xs text-muted">Scan with a phone camera to test before printing.</p>

            <label htmlFor="public-link" className="label mt-5">
              Public menu link
            </label>
            <div className="relative">
              <input id="public-link" className="input bg-cream pr-11" readOnly value={qr.publicUrl} onFocus={(event) => event.target.select()} />
              <button
                type="button"
                className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted transition-colors hover:bg-brand-soft hover:text-brand"
                onClick={handleCopy}
                aria-label={copied ? 'Link copied' : 'Copy public menu link'}
                title={copied ? 'Copied' : 'Copy link'}
              >
                {copied ? <Check size={15} className="animate-scale-in text-brand" /> : <Copy size={15} />}
              </button>
            </div>
            <p className="sr-only" aria-live="polite">
              {copied ? 'Link copied' : ''}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className="btn btn-secondary" onClick={() => download(qr.qrPng, `${fileBase}.png`)}>
                <Download size={15} aria-hidden="true" /> Download PNG
              </button>
              <button type="button" className="btn btn-secondary" onClick={downloadSvg}>
                <Download size={15} aria-hidden="true" /> Download SVG
              </button>
            </div>
            <Link to={`/m/${menu.slug}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-ink hover:text-brand">
              View public menu <ExternalLink size={12} aria-hidden="true" />
            </Link>
          </section>

          <section className="rounded-2xl bg-brand-soft p-6">
            <h2 className="font-sans text-sm font-semibold tracking-normal">A few checks before it goes on the table</h2>
            <ul className="mt-3 space-y-2.5 text-xs">
              {PRINT_CHECKS.map((check) => (
                <li key={check} className="flex items-center gap-2">
                  <Check size={13} className="text-brand" aria-hidden="true" /> {check}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="rounded-2xl bg-brand-soft p-6">
          <div className="no-print flex items-center justify-between gap-3">
            <h2 className="font-sans text-sm font-semibold tracking-normal">Printable table tent</h2>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => window.print()}>
              <Printer size={14} aria-hidden="true" /> Print card
            </button>
          </div>

          <div className="print-area mx-auto mt-5 w-full max-w-xs animate-fade-up bg-white text-center shadow-md transition-transform duration-300 [animation-delay:150ms] hover:-rotate-1 hover:scale-[1.01]">
            <div className="bg-brand px-6 py-7 text-white">
              <p className="font-serif text-3xl">{user?.restaurantName}</p>
              <p className="mt-2 text-xs">{menu.name}</p>
            </div>
            <div className="px-6 py-7">
              <p className="font-serif text-xl">A menu made for you.</p>
              <p className="mt-2 text-xs">Scan to view our menu and explore allergen information.</p>
              <img src={qr.qrPng} alt="" className="mx-auto mt-4 h-40 w-40" />
              <p className="mt-3 text-[11px] text-muted">No app. No account. Just your menu.</p>
              <p className="mt-4 border-t border-line pt-4 text-[10px] leading-relaxed text-muted">
                Allergen information is verified by restaurant staff. Cross-contact may occur in the kitchen. Please tell your server about your
                allergies before ordering.
              </p>
              <div className="mt-3 flex justify-center">
                <Logo to="" small />
              </div>
            </div>
            <p className="border-t border-dashed border-line bg-cream py-2 text-[9px] uppercase tracking-wider text-muted">Fold here · Table-tent base</p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default QrCode
