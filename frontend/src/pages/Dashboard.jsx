import { Link } from 'react-router-dom'
import { Plus, ShieldCheck } from 'lucide-react'
import UndoToast from '../components/UndoToast'
import { useAuth } from '../context/AuthContext'
import useMenus from '../hooks/useMenus'
import DashboardStats from '../components/dashboard/DashboardStats'
import MenuRow from '../components/dashboard/MenuRow'
import EmptyMenus from '../components/dashboard/EmptyMenus'
import QuickActions from '../components/dashboard/QuickActions'

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function Dashboard() {
  const { user } = useAuth()
  const { menus, loading, error, pending, queueDelete, undoDelete, commitDelete } = useMenus()

  if (loading) {
    return <p className="page-loader" role="status">Loading your menus…</p>
  }

  const published = menus.filter((menu) => menu.status === 'published')
  const drafts = menus.filter((menu) => menu.status === 'draft')
  const toVerify = drafts.reduce(
    (total, menu) => total + ((menu.items || []).length - (menu.items || []).filter((d) => d.isVerified).length),
    0
  )
  const firstName = (user?.name || '').split(' ')[0]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{user?.restaurantName} · Restaurant workspace</p>
          <h1 className="mt-2 text-4xl">
            {greeting()}
            {firstName && `, ${firstName}`}.
          </h1>
          <p className="mt-2 text-sm text-muted">
            A little care behind every dish. Manage your menus from photo to published.
          </p>
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

      <DashboardStats
        totalMenus={menus.length}
        publishedCount={published.length}
        firstPublishedName={published[0]?.name || ''}
        toVerifyCount={toVerify}
        singleDraftName={drafts.length === 1 ? drafts[0].name : ''}
      />

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-5">
          <h2 className="font-sans text-lg font-semibold tracking-normal">Your menus</h2>
          <span className="pill bg-brand text-white">All menus · {menus.length}</span>
        </div>

        {menus.length === 0 ? (
          <EmptyMenus />
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
                <MenuRow key={menu._id} menu={menu} onDelete={queueDelete} />
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

      <QuickActions published={published} />

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
