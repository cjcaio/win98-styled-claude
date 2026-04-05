import { create } from 'zustand'

export interface FileEntry {
  id: string
  name: string
  parent_id: string | null
  type: 'folder' | 'chat' | 'note' | 'file'
  created_at: string
  updated_at: string
}

interface FilesystemState {
  currentPath: string[]  // stack of folder IDs for breadcrumb
  currentFolderId: string
  entries: FileEntry[]
  isLoading: boolean

  loadFolder: (folderId: string) => Promise<void>
  navigateTo: (folderId: string) => void
  navigateUp: () => void
  createFolder: (name: string) => Promise<void>
}

export const useFilesystemStore = create<FilesystemState>((set, get) => ({
  currentPath: ['root', 'my-documents'],
  currentFolderId: 'my-documents',
  entries: [],
  isLoading: false,

  loadFolder: async (folderId) => {
    set({ isLoading: true })
    const entries = await window.api.listFiles(folderId)
    set({ entries, isLoading: false, currentFolderId: folderId })
  },

  navigateTo: (folderId) => {
    const state = get()
    set({ currentPath: [...state.currentPath, folderId] })
    state.loadFolder(folderId)
  },

  navigateUp: () => {
    const state = get()
    if (state.currentPath.length <= 1) return
    const newPath = state.currentPath.slice(0, -1)
    const parentId = newPath[newPath.length - 1]
    set({ currentPath: newPath })
    state.loadFolder(parentId)
  },

  createFolder: async (name) => {
    const state = get()
    await window.api.createFolder(name, state.currentFolderId)
    state.loadFolder(state.currentFolderId)
  }
}))
