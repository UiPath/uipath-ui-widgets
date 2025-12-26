/* eslint-disable react-refresh/only-export-components */
import { render, RenderOptions } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'

/**
 * Custom render function that wraps components with common providers
 * Extend this as needed when you add providers like Theme, Router, etc.
 */
type CustomRenderOptions = Omit<RenderOptions, 'wrapper'>

function AllTheProviders({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Add providers here as needed */}
      {children}
    </>
  )
}

function customRender(
  ui: ReactElement,
  options?: CustomRenderOptions,
) {
  return render(ui, { wrapper: AllTheProviders, ...options })
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

