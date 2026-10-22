export function Stat({ label, value, note, delay = 0 }) {
  return (
    <div className="card card-hover animate-fade-up p-5" style={{ animationDelay: `${delay}ms` }}>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-3 font-serif text-3xl">{value}</p>
      <p className="mt-3 text-xs text-muted">{note}</p>
    </div>
  )
}

export function DashboardStats({ totalMenus, publishedCount, firstPublishedName, toVerifyCount, singleDraftName }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Stat
        label="Menus in your workspace"
        value={totalMenus}
        note="Published, in review and being extracted"
      />
      <Stat
        label={publishedCount === 1 ? 'Published menu' : 'Published menus'}
        value={publishedCount}
        note={publishedCount === 1 ? `${firstPublishedName} is available to your guests` : 'Available to your guests by QR code'}
        delay={80}
      />
      <Stat
        label="Dishes still to verify"
        value={toVerifyCount}
        note={singleDraftName ? `${singleDraftName} remains private` : 'Drafts stay private until you publish'}
        delay={160}
      />
    </div>
  )
}

export default DashboardStats
