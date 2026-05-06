import type { ReactNode } from 'react'

export type Section = 'foundations' | 'build' | 'compare'

export type Theme = 'dark' | 'light'

export type PageMeta = {
  id: string
  title: string
}

export type Page = PageMeta & {
  heading: string
  lede?: ReactNode
  content: ReactNode
}
