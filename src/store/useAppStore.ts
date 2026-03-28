import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '@/types'
import { supabase } from '@/lib/supabase'

// ── Auth store ────────────────────────────────────────────────────────────────

interface AuthStore {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  reset: () => void
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ user: null, session: null, profile: null, isLoading: false }),
  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    set({ user: session?.user ?? null, session: session ?? null, isLoading: false })

    supabase.auth.onAuthStateChange((_event, newSession) => {
      set({
        user: newSession?.user ?? null,
        session: newSession ?? null,
        isLoading: false,
      })
    })
  },
}))

// ── Upload store ──────────────────────────────────────────────────────────────

type UploadStatus = 'idle' | 'uploading' | 'analyzing' | 'done' | 'error'

interface UploadStore {
  file: File | null
  status: UploadStatus
  progress: number
  errorMessage: string | null
  setFile: (file: File | null) => void
  setStatus: (status: UploadStatus) => void
  setProgress: (progress: number) => void
  setError: (message: string) => void
  reset: () => void
}

export const useUploadStore = create<UploadStore>((set) => ({
  file: null,
  status: 'idle',
  progress: 0,
  errorMessage: null,
  setFile: (file) => set({ file }),
  setStatus: (status) => set({ status }),
  setProgress: (progress) => set({ progress }),
  setError: (message) => set({ status: 'error', errorMessage: message }),
  reset: () => set({ file: null, status: 'idle', progress: 0, errorMessage: null }),
}))
