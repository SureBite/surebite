import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

vi.mock('qrcode', () => ({
  default: {
    toDataURL: async (text) => `data:image/png;base64,${btoa(text)}`,
    toString: async (text) => `<svg xmlns="http://www.w3.org/2000/svg"><title>${text}</title></svg>`,
  },
}))

URL.createObjectURL = () => 'blob:preview'
URL.revokeObjectURL = () => {}

afterEach(() => {
  cleanup()
  localStorage.clear()
})
