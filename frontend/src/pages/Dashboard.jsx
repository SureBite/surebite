import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Camera, FileText, Plus, QrCode, ShieldCheck, Trash2 } from 'lucide-react'
import api, { getErrorMessage } from '../api/api'
import UndoToast from '../components/UndoToast'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils/constants'

const STATUS_PILLS = {
  published: { label: 'Published', className: 'pill-green' },
  draft: { label: 'Draft', className: 'pill-amber' },
  processing: { label: 'Processing', className: 'pill-grey' },
  failed: { label: 'Failed', className: 'pill-red' },
}

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function verifiedCount(menu) {
  return (menu.items || []).filter((dish) => dish.isVerified).length
}

function Stat({ label, value, note, delay = 0 }) {
  return (
    <div className="card card-hover animate-fade-up p-5" style={{ animationDelay: `${delay}ms` }}>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-3 font-serif text-3xl">{value}</p>
      <p className="mt-3 text-xs text-muted">{note}</p>
    </div>
  )
}

function MenuRow({ menu, onDelete }) {
  const items = menu.items || []
  const verified = verifiedCount(menu)
  const pill = STATUS_PILLS[menu.status] || STATUS_PILLS.draft
  const reviewable = menu.status === 'draft' || menu.status === 'published'
  const dateLabel = formatDate(menu.updatedAt || menu.createdAt)

  return (
    <li className="grid gap-4 border-t border-line px-5 py-5 transition-colors hover:bg-cream/60 md:grid-cols-[minmax(0,2.4fr)_7rem_minmax(0,1fr)_minmax(0,1.3fr)] md:items-center">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-9 shrink-0 items-center justify-center rounded border border-line bg-cream text-muted">
          <FileText size={16} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{menu.name}</p>
          <p className="mt-1 text-xs text-muted">
            {reviewable && `${items.length} ${items.length === 1 ? 'dish' : 'dishes'} · `}
            {menu.currency} · {menu.status === 'published' ? 'Public' : 'Private'}
          </p>
          {dateLabel && <p className="mt-0.5 text-xs text-muted">Updated {dateLabel}</p>}
        </div>
      </div>

      <div>
        <span className={`pill ${pill.className}`}>{pill.label}</span>
      </div>

      <div className="text-xs">
        {reviewable ? (
          <>
            <p className={verified === items.length ? 'text-muted' : 'font-semibold text-warn-text'}>
              {verified} / {items.length} verified
            </p>
            <div className="mt-2 h-1 w-full max-w-[9rem] rounded-full bg-line" aria-hidden="true">
              <div className="h-1 origin-left animate-grow-x rounded-full bg-brand" style={{ width: `${items.length ? (verified / items.length) * 100 : 0}%` }} />
            </div>
          </>
        ) : (
          <p className="text-muted">{menu.status === 'processing' ? 'Not ready for review' : 'Extraction unavailable'}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {menu.status === 'published' && (
          <>
            <Link to={`/menus/${menu._id}/qr`} className="btn btn-secondary btn-sm">
              View QR code
            </Link>
            <Link to={`/menus/${menu._id}/verify`} className="btn btn-ghost btn-sm">
              Edit
            </Link>
          </>
        )}
        {menu.status === 'draft' && (
          <Link to={`/menus/${menu._id}/verify`} className="btn btn-primary btn-sm">
            {verified === 0 ? 'Start verification' : 'Continue verification'}
          </Link>
        )}
        {menu.status === 'processing' && (
          <Link to={`/menus/${menu._id}/verify`} className="btn btn-secondary btn-sm">
            View progress
          </Link>
        )}
        {menu.status === 'failed' && (
          <Link to="/upload" className="btn btn-secondary btn-sm">
            Retry upload
          </Link>
        )}
        <button
          type="button"
          className="btn btn-ghost btn-sm text-muted hover:text-danger-text"
          onClick={() => onDelete(menu)}
          aria-label={`Delete ${menu.name}`}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </li>
  )
}

function Dashboard() {
  const { user } = useAuth()
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(null)
  const [selectedQrId, setSelectedQrId] = useState('')
  const pendingRef = useRef(null)

  useEffect(() => {
    api.menus
      .getAll()
      .then((data) => setMenus(data.menus || []))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  const restore = useCallback((entry) => {
    setMenus((current) => {
      const next = [...current]
      next.splice(Math.min(entry.index, next.length), 0, entry.menu)
      return next
    })
  }, [])

  const commitDelete = useCallback(() => {
    const entry = pendingRef.current
    if (!entry) return
    pendingRef.current = null
    setPending(null)
    api.menus.delete(entry.menu._id).catch((err) => {
      restore(entry)
      setError(getErrorMessage(err))
    })
  }, [restore])

  useEffect(() => () => commitDelete(), [commitDelete])

  function handleDelete(menu) {
    commitDelete()
    setError('')
    const entry = { menu, index: menus.findIndex((candidate) => candidate._id === menu._id) }
    pendingRef.current = entry
    setPending(entry)
    setMenus((current) => current.filter((candidate) => candidate._id !== menu._id))
  }

  function undoDelete() {
    const entry = pendingRef.current
    if (!entry) return
    pendingRef.current = null
    setPending(null)
    restore(entry)
  }

  if (loading) return <p className="page-loader" role="status">Loading your menus…</p>

  const published = menus.filter((menu) => menu.status === 'published')
  const drafts = menus.filter((menu) => menu.status === 'draft')
  const toVerify = drafts.reduce((total, menu) => total + ((menu.items || []).length - verifiedCount(menu)), 0)
  const firstName = (user?.name || '').split(' ')[0]
  const activeQrMenu = published.find((menu) => menu._id === selectedQrId) || published[0]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{user?.restaurantName} · Restaurant workspace</p>
          <h1 className="mt-2 text-4xl">
            {greeting()}
            {firstName && `, ${firstName}`}.
          </h1>
          <p className="mt-2 text-sm text-muted">A little care behind every dish. Manage your menus from photo to published.</p>
        </div>
        <Link to="/upload" className="btn btn-primary">
          <Plus size={16} aria-hidden="true" /> Upload a menu
        </Link>
      </div>

      {error && (
        <p className="notice notice-red" role="alert">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Menus in your workspace" value={menus.length} note="Published, in review and being extracted" />
        <Stat
          label={published.length === 1 ? 'Published menu' : 'Published menus'}
          value={published.length}
          note={published.length === 1 ? `${published[0].name} is available to your guests` : 'Available to your guests by QR code'}
          delay={80}
        />
        <Stat
          label="Dishes still to verify"
          value={toVerify}
          note={drafts.length === 1 ? `${drafts[0].name} remains private` : 'Drafts stay private until you publish'}
          delay={160}
        />
      </div>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-5">
          <h2 className="font-sans text-lg font-semibold tracking-normal">Your menus</h2>
          <span className="pill bg-brand text-white">All menus · {menus.length}</span>
        </div>

        {menus.length === 0 ? (
          <div className="border-t border-line px-5 py-14 text-center">
            <Camera size={28} className="mx-auto text-brand" aria-hidden="true" />
            <h3 className="mt-4 font-serif text-2xl">No menus yet</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              Upload a clear photo of your paper menu. AI prepares a first draft and you verify every dish before guests see it.
            </p>
            <Link to="/upload" className="btn btn-primary mt-5">
              Upload your first menu
            </Link>
          </div>
        ) : (
          <>
            <div className="hidden bg-brand-soft px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-ink md:grid md:grid-cols-[minmax(0,2.4fr)_7rem_minmax(0,1fr)_minmax(0,1.3fr)]">
              <span>Menu</span>
              <span>Status</span>
              <span>Staff review</span>
              <span>Actions</span>
            </div>
            <ul>
              {menus.map((menu) => (
                <MenuRow key={menu._id} menu={menu} onDelete={handleDelete} />
              ))}
            </ul>
          </>
        )}
      </section>

      {drafts.length > 0 && (
        <div className="notice notice-green">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
          <div>
            <p className="font-semibold">
              {published.length > 0 ? 'Your published menu stays separate from your draft.' : 'Drafts stay private.'}
            </p>
            <p className="mt-1 text-xs text-muted">
              {drafts.length === 1
                ? `Finish reviewing all ${(drafts[0].items || []).length} dishes in ${drafts[0].name} before publishing.`
                : 'Finish reviewing every dish before publishing.'}{' '}
              Unverified drafts are never visible to guests.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card card-hover flex gap-4 p-5">
          <Camera size={20} className="shrink-0 text-brand" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold">Start another menu</p>
            <p className="mt-1 text-xs text-muted">Upload a clear photo of your paper menu.</p>
            <Link to="/upload" className="mt-2 inline-block text-xs font-semibold text-brand">
              Upload menu →
            </Link>
          </div>
        </div>
        <div className="card card-hover flex gap-4 p-5">
          <QrCode size={20} className="shrink-0 text-brand" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Bring it to the table</p>
            {published.length === 0 ? (
              <p className="mt-1 text-xs text-muted">Your QR code is created when you publish a verified menu.</p>
            ) : published.length === 1 ? (
              <>
                <p className="mt-1 text-xs text-muted">Download or print the QR for “{published[0].name}”.</p>
                <Link to={`/menus/${published[0]._id}/qr`} className="mt-2 inline-block text-xs font-semibold text-brand">
                  Open QR &amp; print →
                </Link>
              </>
            ) : (
              <>
                <p className="mt-1 text-xs text-muted">Choose a published menu to download or print its table QR:</p>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <select
                    className="input max-w-[13rem] py-1 text-xs font-medium"
                    value={activeQrMenu?._id || ''}
                    onChange={(event) => setSelectedQrId(event.target.value)}
                    aria-label="Select menu to view QR code"
                  >
                    {published.map((menu) => (
                      <option key={menu._id} value={menu._id}>
                        {menu.name}
                      </option>
                    ))}
                  </select>
                  <Link
                    to={`/menus/${activeQrMenu?._id}/qr`}
                    className="btn btn-primary btn-sm"
                  >
                    Open QR &amp; print →
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {pending && (
        <UndoToast
          key={pending.menu._id}
          message={
            pending.menu.status === 'published'
              ? `“${pending.menu.name}” deleted. Its QR code will stop working.`
              : `“${pending.menu.name}” deleted.`
          }
          onUndo={undoDelete}
          onTimeout={commitDelete}
        />
      )}
    </div>
  )
}

export default Dashboard
