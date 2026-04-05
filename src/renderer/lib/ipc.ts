// Re-export the API type for convenience
// The actual API is exposed via contextBridge in preload
// Access it via window.api

export type { Api } from '../../preload/index'

// Helper to check if API is available
export function isApiAvailable(): boolean {
  return typeof window !== 'undefined' && 'api' in window
}
