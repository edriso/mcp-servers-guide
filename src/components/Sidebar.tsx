import { useEffect, useRef } from 'react'
import {
  BuildIcon,
  CloseIcon,
  CompareIcon,
  FoundationsIcon,
} from './Icons'
import type { PageMeta, Section } from '../types'

type Props = {
  section: Section
  pages: PageMeta[]
  activeId: string
  onSelect: (id: string) => void
  open: boolean
  onClose: () => void
}

export function Sidebar({
  section,
  pages,
  activeId,
  onSelect,
  open,
  onClose,
}: Props) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current?.querySelector<HTMLElement>(
      `[data-page-id="${activeId}"]`
    )
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeId])

  const Icon =
    section === 'foundations'
      ? FoundationsIcon
      : section === 'build'
        ? BuildIcon
        : CompareIcon

  const label =
    section === 'foundations'
      ? 'Foundations'
      : section === 'build'
        ? 'Build'
        : 'Compare'

  return (
    <>
      <aside
        className={`sidebar ${open ? 'open' : ''}`}
        ref={ref}
        aria-label="Section navigation"
      >
        <div className="sidebar-platform">
          <Icon />
          <span>{label}</span>
          <button
            className="theme-toggle"
            onClick={onClose}
            aria-label="Close navigation"
            style={{ marginLeft: 'auto' }}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="sidebar-eyebrow">Pages</div>
        <ul className="toc">
          {pages.map((p, i) => (
            <li key={p.id}>
              <button
                className={`toc-link ${activeId === p.id ? 'active' : ''}`}
                data-page-id={p.id}
                onClick={() => onSelect(p.id)}
              >
                <span>{p.title}</span>
                <span className="toc-num">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <div
        className={`sidebar-backdrop ${open ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
    </>
  )
}
