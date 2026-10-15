import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Camera, Check, RotateCcw, X } from 'lucide-react'

function cameraError(error) {
  if (error?.name === 'NotAllowedError') return 'Camera access was blocked. Allow the camera from the icon in your browser’s address bar, or choose an image instead.'
  if (error?.name === 'NotFoundError' || error?.name === 'OverconstrainedError') return 'No camera was found on this device. Choose an image instead.'
  if (error?.name === 'NotReadableError') return 'Your camera is being used by another app. Close it and try again.'
  return 'We couldn’t start the camera. Choose an image instead.'
}

function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [status, setStatus] = useState('starting')
  const [error, setError] = useState('')
  const [shot, setShot] = useState(null)

  useEffect(() => {
    let active = true
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false })
      .then((stream) => {
        if (!active) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        videoRef.current.srcObject = stream
        setStatus('live')
      })
      .catch((err) => {
        if (!active) return
        setError(cameraError(err))
        setStatus('error')
      })
    return () => {
      active = false
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  useEffect(() => {
    const onKey = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => () => shot && URL.revokeObjectURL(shot.url), [shot])

  function takePhoto() {
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const file = new File([blob], `menu-photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
        setShot({ file, url: URL.createObjectURL(blob) })
      },
      'image/jpeg',
      0.92,
    )
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="camera-title"
      onClick={onClose}
    >
      <div className="card w-full max-w-2xl animate-scale-in overflow-hidden shadow-xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id="camera-title" className="font-sans text-base font-semibold tracking-normal">
            Take a photo of your menu
          </h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close camera">
            <X size={16} />
          </button>
        </div>

        <div className="relative aspect-video bg-ink">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`h-full w-full object-contain ${shot ? 'hidden' : ''}`}
          />
          {shot && <img src={shot.url} alt="Captured menu photo" className="h-full w-full object-contain" />}
          {status === 'starting' && (
            <p className="absolute inset-0 flex items-center justify-center text-sm text-white/80" role="status">
              Starting the camera…
            </p>
          )}
          {status === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
              <Camera size={28} className="text-white/70" aria-hidden="true" />
              <p className="max-w-sm text-sm text-white" role="alert">
                {error}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <p className="text-xs text-muted">Keep the whole menu in frame, with even light and no glare.</p>
          <div className="flex gap-2">
            {shot ? (
              <>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShot(null)}>
                  <RotateCcw size={14} aria-hidden="true" /> Retake
                </button>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => onCapture(shot.file)}>
                  <Check size={14} aria-hidden="true" /> Use this photo
                </button>
              </>
            ) : (
              <button type="button" className="btn btn-primary btn-sm" onClick={takePhoto} disabled={status !== 'live'}>
                <Camera size={14} aria-hidden="true" /> Take photo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default CameraCapture
