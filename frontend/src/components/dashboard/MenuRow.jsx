import { Link } from 'react-router-dom'
import { FileText, Trash2 } from 'lucide-react'
import { formatDate } from '../../utils/constants'

const STATUS_PILLS = {
  published: { label: 'Published', className: 'pill-green' },
  draft: { label: 'Draft', className: 'pill-amber' },
  processing: { label: 'Processing', className: 'pill-grey' },
  failed: { label: 'Failed', className: 'pill-red' },
}

export function MenuRow({ menu, onDelete }) {
  const items = menu.items || []
  const verified = items.filter((dish) => dish.isVerified).length
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
              <div
                className="h-1 origin-left animate-grow-x rounded-full bg-brand"
                style={{ width: `${items.length ? (verified / items.length) * 100 : 0}%` }}
              />
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

export default MenuRow
