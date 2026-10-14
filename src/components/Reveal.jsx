import { useEffect, useRef, useState } from 'react'

const supported = typeof IntersectionObserver !== 'undefined'

function Reveal({ as: Tag = 'div', variant = 'up', delay = 0, className = '', style, children, ...props }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(!supported)
  const [settled, setSettled] = useState(!supported)
  const [from, setFrom] = useState('bottom')

  useEffect(() => {
    if (!supported) return
    const node = ref.current

    const show = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { rootMargin: '-8% 0px -12% 0px' },
    )

    const reset = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) return
      setFrom(entry.boundingClientRect.top < 0 ? 'top' : 'bottom')
      setVisible(false)
      setSettled(false)
    })

    show.observe(node)
    reset.observe(node)
    return () => {
      show.disconnect()
      reset.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!visible || settled) return
    const timer = setTimeout(() => setSettled(true), delay + 1200)
    return () => clearTimeout(timer)
  }, [visible, settled, delay])

  if (settled) {
    return (
      <Tag ref={ref} className={className} style={style} {...props}>
        {children}
      </Tag>
    )
  }

  return (
    <Tag
      ref={ref}
      data-reveal={variant}
      data-from={from}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms`, ...style } : style}
      {...props}
    >
      {children}
    </Tag>
  )
}

export default Reveal
