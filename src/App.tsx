import { useEffect, useMemo, useState } from 'react'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { Eyebrow, Lede } from './components/Blocks'
import { foundationsPages } from './content/foundations'
import { buildPages } from './content/build'
import { comparePages } from './content/compare'
import type { Page, Section, Theme } from './types'

const STORAGE = {
  theme: 'mcp-theme',
  section: 'mcp-section',
}

function readHash() {
  const h = window.location.hash.replace(/^#\/?/, '')
  if (!h) return null
  const [section, page] = h.split('/')
  return { section, page: page || null }
}

function writeHash(section: Section, page: string) {
  const next = `#/${section}/${page}`
  if (window.location.hash !== next) {
    history.replaceState(null, '', next)
  }
}

function getInitialTheme(): Theme {
  const saved = localStorage.getItem(STORAGE.theme) as Theme | null
  if (saved === 'dark' || saved === 'light') return saved
  return 'dark'
}

function getInitialSection(): Section {
  const fromHash = readHash()?.section as Section | undefined
  if (
    fromHash === 'foundations' ||
    fromHash === 'build' ||
    fromHash === 'compare'
  ) {
    return fromHash
  }
  const saved = localStorage.getItem(STORAGE.section)
  if (saved === 'foundations' || saved === 'build' || saved === 'compare') {
    return saved
  }
  return 'foundations'
}

function pagesFor(s: Section): Page[] {
  if (s === 'foundations') return foundationsPages
  if (s === 'build') return buildPages
  return comparePages
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [section, setSection] = useState<Section>(getInitialSection)
  const pages = useMemo(() => pagesFor(section), [section])

  const initialPage =
    readHash()?.page && pages.some((p) => p.id === readHash()!.page)
      ? readHash()!.page!
      : pages[0].id
  const [activeId, setActiveId] = useState<string>(initialPage)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(STORAGE.theme, theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.dataset.section = section
    localStorage.setItem(STORAGE.section, section)
  }, [section])

  useEffect(() => {
    writeHash(section, activeId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [section, activeId])

  useEffect(() => {
    const onPop = () => {
      const h = readHash()
      if (!h) return
      if (
        h.section === 'foundations' ||
        h.section === 'build' ||
        h.section === 'compare'
      ) {
        setSection(h.section)
        if (h.page) setActiveId(h.page)
      }
    }
    window.addEventListener('hashchange', onPop)
    return () => window.removeEventListener('hashchange', onPop)
  }, [])

  useEffect(() => {
    if (!pages.some((p) => p.id === activeId)) {
      setActiveId(pages[0].id)
    }
  }, [pages, activeId])

  const active = pages.find((p) => p.id === activeId) ?? pages[0]
  const idx = pages.findIndex((p) => p.id === active.id)
  const prev = idx > 0 ? pages[idx - 1] : null
  const next = idx < pages.length - 1 ? pages[idx + 1] : null

  const sectionLabel =
    section === 'foundations'
      ? 'Foundations'
      : section === 'build'
        ? 'Build'
        : 'Compare'

  const handleSection = (s: Section) => {
    setSection(s)
    const ps = pagesFor(s)
    setActiveId(ps[0].id)
    setMenuOpen(false)
  }

  const handlePage = (id: string) => {
    setActiveId(id)
    setMenuOpen(false)
  }

  return (
    <div className="app">
      <Header
        section={section}
        onSection={handleSection}
        theme={theme}
        onTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onMenu={() => setMenuOpen((o) => !o)}
      />
      <Sidebar
        section={section}
        pages={pages.map(({ id, title }) => ({ id, title }))}
        activeId={active.id}
        onSelect={handlePage}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
      <main className="main">
        <article className="content" key={`${section}-${active.id}`}>
          <Eyebrow>
            {sectionLabel} <span aria-hidden="true">/</span>{' '}
            {String(idx + 1).padStart(2, '0')} {active.title}
          </Eyebrow>
          <h1>{active.heading}</h1>
          {active.lede ? <Lede>{active.lede}</Lede> : null}
          {active.content}

          <div className="next-prev">
            {prev ? (
              <button
                className="np-btn"
                data-dir="prev"
                onClick={() => handlePage(prev.id)}
              >
                <span className="np-dir">← Previous</span>
                <span className="np-title">{prev.title}</span>
              </button>
            ) : (
              <span />
            )}
            {next ? (
              <button
                className="np-btn"
                data-dir="next"
                onClick={() => handlePage(next.id)}
              >
                <span className="np-dir">Next →</span>
                <span className="np-title">{next.title}</span>
              </button>
            ) : (
              <span />
            )}
          </div>
        </article>
      </main>
    </div>
  )
}
