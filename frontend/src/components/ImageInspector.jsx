import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ImageOff, Maximize2, X, ZoomIn, ZoomOut } from 'lucide-react'

const MIN_ZOOM = 100
const MAX_ZOOM = 300
const STEP = 25

function ZoomControls({ zoom, setZoom }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-line bg-white px-2 py-1.5">
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => setZoom(Math.max(MIN_ZOOM, zoom - STEP))}
        disabled={zoom <= MIN_ZOOM}
        aria-label="Zoom out"
      >
        <ZoomOut size={15} />
      </button>
      <button type="button" className="text-xs text-muted hover:text-ink" onClick={() => setZoom(100)} aria-label="Reset zoom">
        {zoom}%
      </button>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => setZoom(Math.min(MAX_ZOOM, zoom + STEP))}
        disabled={zoom >= MAX_ZOOM}
        aria-label="Zoom in"
      >
        <ZoomIn size={15} />
      </button>
    </div>
  )
}

function ZoomableImage({ imageUrl, alt, zoom, className }) {
  return (
    <div className={`overflow-auto rounded-xl border border-line bg-white ${className}`}>
      <img src={imageUrl} alt={alt} style={{ width: `${zoom}%`, maxWidth: 'none' }} className="block" />
    </div>
  )
}

function ImageInspector({ imageUrl, images = [], alt = 'Original menu photo', caption }) {
  const [zoom, setZoom] = useState(100)
  const [open, setOpen] = useState(false)
  const [drawerZoom, setDrawerZoom] = useState(100)
  const [currentIndex, setCurrentIndex] = useState(0)

  const list = images?.length
    ? images.map((img) => (typeof img === 'string' ? img : img?.url)).filter(Boolean)
    : (imageUrl ? [imageUrl] : [])
  const currentImg = list[currentIndex] || imageUrl || ''

  useEffect(() => {
    if (!open) return
    const onKey = (event) => event.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const pageSelector = list.length > 1 && (
    <div className="mb-2 flex items-center gap-1.5 overflow-x-auto text-xs">
      <span className="font-medium text-muted">Page:</span>
      {list.map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => setCurrentIndex(i)}
          className={`pill px-2.5 py-0.5 text-xs font-medium transition-colors ${
            currentIndex === i ? 'bg-brand text-white' : 'bg-brand-soft text-ink hover:bg-brand-tint'
          }`}
          aria-label={`View page ${i + 1}`}
        >
          {i + 1}
        </button>
      ))}
    </div>
  )

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-sans text-sm font-semibold tracking-normal">Original menu</h2>
        {currentImg && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(true)} aria-label="Open the original menu in a larger view">
            <Maximize2 size={14} />
          </button>
        )}
      </div>

      {pageSelector}

      {currentImg ? (
        <>
          <ZoomableImage imageUrl={currentImg} alt={`${alt} (Page ${currentIndex + 1})`} zoom={zoom} className="max-h-[32rem]" />
          <div className="mt-2">
            <ZoomControls zoom={zoom} setZoom={setZoom} />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line bg-white px-4 py-12 text-center">
          <ImageOff size={28} className="text-muted" aria-hidden="true" />
          <p className="text-sm font-semibold">No photo available</p>
          <p className="text-xs text-muted">Keep your printed menu at hand while you review.</p>
        </div>
      )}
      {caption && <p className="mt-2 text-xs text-muted">{caption}</p>}

      {open &&
        createPortal(
        <div className="fixed inset-0 z-50 flex animate-fade-in justify-end bg-ink/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Original menu" onClick={() => setOpen(false)}>
          <div className="flex h-full w-full max-w-3xl animate-slide-in-right flex-col gap-3 bg-cream p-4 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl">Original menu</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setOpen(false)}>
                <X size={14} /> Close
              </button>
            </div>
            {pageSelector}
            <ZoomableImage imageUrl={currentImg} alt={`${alt} (Page ${currentIndex + 1})`} zoom={drawerZoom} className="min-h-0 flex-1" />
            <ZoomControls zoom={drawerZoom} setZoom={setDrawerZoom} />
          </div>
        </div>,
          document.body,
        )}
    </div>
  )
}

export default ImageInspector
