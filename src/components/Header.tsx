import {
  BuildIcon,
  CompareIcon,
  FoundationsIcon,
  MenuIcon,
  MoonIcon,
  SunIcon,
} from './Icons'
import type { Section, Theme } from '../types'

type Props = {
  section: Section
  onSection: (s: Section) => void
  theme: Theme
  onTheme: () => void
  onMenu: () => void
}

export function Header({
  section,
  onSection,
  theme,
  onTheme,
  onMenu,
}: Props) {
  return (
    <header className="header">
      <button
        className="menu-btn"
        onClick={onMenu}
        aria-label="Toggle navigation"
      >
        <MenuIcon />
      </button>
      <a
        className="brand"
        href="#"
        onClick={(e) => {
          e.preventDefault()
          onSection('foundations')
        }}
      >
        <span className="brand-glyph" aria-hidden="true" />
        MCP Field Guide
        <em>&nbsp;a hands-on notebook</em>
      </a>

      <nav className="nav" aria-label="Primary">
        <button
          className={`nav-link ${section === 'foundations' ? 'active' : ''}`}
          data-section="foundations"
          onClick={() => onSection('foundations')}
        >
          <FoundationsIcon />
          <span>Foundations</span>
        </button>
        <button
          className={`nav-link ${section === 'build' ? 'active' : ''}`}
          data-section="build"
          onClick={() => onSection('build')}
        >
          <BuildIcon />
          <span>Build</span>
        </button>
        <button
          className={`nav-link ${section === 'compare' ? 'active' : ''}`}
          onClick={() => onSection('compare')}
        >
          <CompareIcon />
          <span>Compare</span>
        </button>
        <button
          className="theme-toggle"
          onClick={onTheme}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </nav>
    </header>
  )
}
