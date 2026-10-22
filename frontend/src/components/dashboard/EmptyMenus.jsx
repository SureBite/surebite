import { Link } from 'react-router-dom'
import { Camera } from 'lucide-react'

export function EmptyMenus() {
  return (
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
  )
}

export default EmptyMenus
