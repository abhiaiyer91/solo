/**
 * Navigation Mock
 * Mocks expo-router for testing
 */

import type { ReactNode } from 'react'

interface LinkProps {
  children: ReactNode
  href: string
  [key: string]: unknown
}

interface RedirectProps {
  href: string
}

interface LayoutProps {
  children?: ReactNode
}

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn().mockReturnValue(true),
  setParams: jest.fn(),
  navigate: jest.fn(),
}

const mockParams: Record<string, string> = {}
const mockSegments: string[] = ['index']
const mockPathname = '/'

export const mockExpoRouter = {
  // Router hook
  useRouter: jest.fn().mockReturnValue(mockRouter),
  
  // Route params
  useLocalSearchParams: jest.fn().mockReturnValue(mockParams),
  useGlobalSearchParams: jest.fn().mockReturnValue(mockParams),
  
  // Segments
  useSegments: jest.fn().mockReturnValue(mockSegments),
  
  // Pathname
  usePathname: jest.fn().mockReturnValue(mockPathname),
  
  // Navigation state
  useNavigation: jest.fn().mockReturnValue({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  }),
  
  // Link component
  Link: ({ children }: LinkProps) => children,
  
  // Redirect component
  Redirect: (_props: RedirectProps) => null,
  
  // Stack
  Stack: ({ children }: LayoutProps) => children,
  
  // Tabs
  Tabs: ({ children }: LayoutProps) => children,
  
  // Slot
  Slot: () => null,
  
  // Screen
  Screen: () => null,
}

// Helper to set up specific route
export function mockRoute(pathname: string, params: Record<string, string> = {}) {
  mockExpoRouter.usePathname.mockReturnValue(pathname)
  mockExpoRouter.useLocalSearchParams.mockReturnValue(params)
  mockExpoRouter.useGlobalSearchParams.mockReturnValue(params)
}

// Helper to verify navigation was called
export function expectNavigation(method: 'push' | 'replace' | 'back', path?: string) {
  if (path) {
    expect(mockRouter[method]).toHaveBeenCalledWith(path)
  } else {
    expect(mockRouter[method]).toHaveBeenCalled()
  }
}

// Helper to reset navigation state
export function resetNavigation() {
  Object.values(mockRouter).forEach((fn) => {
    if (typeof fn === 'function' && 'mockClear' in fn) {
      fn.mockClear()
    }
  })
}
