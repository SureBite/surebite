import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Camera, QrCode } from 'lucide-react'

export function QuickActions({ published = [] }) {
  const [selectedQrId, setSelectedQrId] = useState(published[0]?._id || '')
  const activeQrMenu = published.find((menu) => menu._id === selectedQrId) || published[0]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="card card-hover flex gap-4 p-5">
        <Camera size={20} className="shrink-0 text-brand" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold">Start another menu</p>
          <p className="mt-1 text-xs text-muted">Upload a clear photo of your paper menu.</p>
          <Link to="/upload" className="mt-2 inline-block text-xs font-semibold text-brand hover:underline">
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
              <Link
                to={`/menus/${published[0]._id}/qr`}
                className="mt-2 inline-block text-xs font-semibold text-brand hover:underline"
              >
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
                <Link to={`/menus/${activeQrMenu?._id}/qr`} className="btn btn-primary btn-sm">
                  Open QR &amp; print →
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuickActions
