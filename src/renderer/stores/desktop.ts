import { create } from 'zustand'

export type AppId = 'chat' | 'explorer' | 'recycle-bin' | 'settings'

export interface WindowState {
  id: string
  appId: AppId
  title: string
  x: number
  y: number
  width: number
  height: number
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
}

interface DesktopState {
  windows: WindowState[]
  nextZIndex: number
  startMenuOpen: boolean
  booted: boolean

  // Actions
  openApp: (appId: AppId) => void
  closeWindow: (windowId: string) => void
  focusWindow: (windowId: string) => void
  minimizeWindow: (windowId: string) => void
  maximizeWindow: (windowId: string) => void
  restoreWindow: (windowId: string) => void
  updateWindowPosition: (windowId: string, x: number, y: number) => void
  updateWindowSize: (windowId: string, width: number, height: number) => void
  toggleStartMenu: () => void
  closeStartMenu: () => void
  setBoot: (booted: boolean) => void
}

const APP_DEFAULTS: Record<AppId, { title: string; width: number; height: number }> = {
  chat: { title: 'Claude Chat', width: 700, height: 500 },
  explorer: { title: 'My Documents', width: 600, height: 450 },
  'recycle-bin': { title: 'Recycle Bin', width: 500, height: 400 },
  settings: { title: 'Control Panel', width: 450, height: 380 }
}

let windowCounter = 0

export const useDesktopStore = create<DesktopState>((set, get) => ({
  windows: [],
  nextZIndex: 100,
  startMenuOpen: false,
  booted: false,

  openApp: (appId) => {
    const state = get()
    // If app already open and not minimized, focus it
    const existing = state.windows.find((w) => w.appId === appId && !w.isMinimized)
    if (existing) {
      get().focusWindow(existing.id)
      return
    }

    // If minimized, restore it
    const minimized = state.windows.find((w) => w.appId === appId && w.isMinimized)
    if (minimized) {
      get().restoreWindow(minimized.id)
      return
    }

    const defaults = APP_DEFAULTS[appId]
    const id = `window-${++windowCounter}`
    const offset = (state.windows.length % 8) * 28

    set((s) => ({
      windows: [
        ...s.windows,
        {
          id,
          appId,
          title: defaults.title,
          x: 80 + offset,
          y: 40 + offset,
          width: defaults.width,
          height: defaults.height,
          isMinimized: false,
          isMaximized: false,
          zIndex: s.nextZIndex
        }
      ],
      nextZIndex: s.nextZIndex + 1,
      startMenuOpen: false
    }))
  },

  closeWindow: (windowId) => {
    set((s) => ({
      windows: s.windows.filter((w) => w.id !== windowId)
    }))
  },

  focusWindow: (windowId) => {
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === windowId ? { ...w, zIndex: s.nextZIndex } : w
      ),
      nextZIndex: s.nextZIndex + 1,
      startMenuOpen: false
    }))
  },

  minimizeWindow: (windowId) => {
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === windowId ? { ...w, isMinimized: true } : w
      )
    }))
  },

  maximizeWindow: (windowId) => {
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === windowId ? { ...w, isMaximized: true, zIndex: s.nextZIndex } : w
      ),
      nextZIndex: s.nextZIndex + 1
    }))
  },

  restoreWindow: (windowId) => {
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === windowId
          ? { ...w, isMinimized: false, isMaximized: false, zIndex: s.nextZIndex }
          : w
      ),
      nextZIndex: s.nextZIndex + 1
    }))
  },

  updateWindowPosition: (windowId, x, y) => {
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === windowId ? { ...w, x, y } : w
      )
    }))
  },

  updateWindowSize: (windowId, width, height) => {
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === windowId ? { ...w, width, height } : w
      )
    }))
  },

  toggleStartMenu: () => {
    set((s) => ({ startMenuOpen: !s.startMenuOpen }))
  },

  closeStartMenu: () => {
    set({ startMenuOpen: false })
  },

  setBoot: (booted) => {
    set({ booted })
  }
}))
