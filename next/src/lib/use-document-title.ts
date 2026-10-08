'use client'

import { useEffect } from 'react'

/** Client-page replacement for Nuxt's useHead({ title }). */
export function useDocumentTitle(title: string) {
  useEffect(() => { document.title = title }, [title])
}
