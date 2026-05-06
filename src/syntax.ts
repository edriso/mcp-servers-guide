/* Tiny tokeniser. Not a real parser — good enough to make code blocks readable.
   Tokens: k=keyword, s=string, c=comment, t=tag, a=attribute, n=number, fn=function */

type Lang = 'json' | 'js' | 'ts' | 'html' | 'css' | 'bash' | 'text'
export type Tok = { text: string; kind?: string }

const JS_KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
  'do', 'switch', 'case', 'break', 'continue', 'new', 'try', 'catch',
  'finally', 'throw', 'typeof', 'instanceof', 'in', 'of', 'delete', 'void',
  'this', 'class', 'extends', 'super', 'import', 'export', 'from', 'as',
  'async', 'await', 'yield', 'true', 'false', 'null', 'undefined',
  'static', 'default', 'interface', 'type', 'enum', 'public', 'private',
  'protected', 'readonly',
])

const BASH_KEYWORDS = new Set([
  'if', 'then', 'else', 'fi', 'for', 'do', 'done', 'while', 'case', 'esac',
  'function', 'return', 'export', 'cd', 'echo', 'sudo',
])

function tokenizeJs(src: string): Tok[] {
  const out: Tok[] = []
  let i = 0
  const len = src.length

  const push = (text: string, kind?: string) => {
    if (text.length) out.push({ text, kind })
  }

  while (i < len) {
    const ch = src[i]

    // line comment
    if (ch === '/' && src[i + 1] === '/') {
      const end = src.indexOf('\n', i)
      const stop = end === -1 ? len : end
      push(src.slice(i, stop), 'c')
      i = stop
      continue
    }
    // block comment
    if (ch === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2)
      const stop = end === -1 ? len : end + 2
      push(src.slice(i, stop), 'c')
      i = stop
      continue
    }
    // strings
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch
      let j = i + 1
      while (j < len && src[j] !== quote) {
        if (src[j] === '\\') j++
        j++
      }
      j = Math.min(j + 1, len)
      push(src.slice(i, j), 's')
      i = j
      continue
    }
    // numbers
    if (/[0-9]/.test(ch) && (i === 0 || /[^A-Za-z_$]/.test(src[i - 1]))) {
      let j = i
      while (j < len && /[0-9._a-fxXoOnN]/.test(src[j])) j++
      push(src.slice(i, j), 'n')
      i = j
      continue
    }
    // identifiers
    if (/[A-Za-z_$]/.test(ch)) {
      let j = i
      while (j < len && /[A-Za-z0-9_$]/.test(src[j])) j++
      const word = src.slice(i, j)
      if (JS_KEYWORDS.has(word)) {
        push(word, 'k')
      } else if (src[j] === '(') {
        push(word, 'fn')
      } else {
        push(word)
      }
      i = j
      continue
    }
    // default — single char
    push(src[i])
    i++
  }
  return out
}

function tokenizeJson(src: string): Tok[] {
  const out: Tok[] = []
  let i = 0
  const len = src.length

  const push = (text: string, kind?: string) => {
    if (text.length) out.push({ text, kind })
  }

  while (i < len) {
    const ch = src[i]
    if (ch === '"') {
      let j = i + 1
      while (j < len && src[j] !== '"') {
        if (src[j] === '\\') j++
        j++
      }
      j = Math.min(j + 1, len)
      // is it a key? lookahead for :
      let k = j
      while (k < len && /\s/.test(src[k])) k++
      const isKey = src[k] === ':'
      push(src.slice(i, j), isKey ? 'a' : 's')
      i = j
      continue
    }
    if (/[0-9-]/.test(ch) && (i === 0 || /[^A-Za-z_$]/.test(src[i - 1]))) {
      let j = i
      if (src[j] === '-') j++
      while (j < len && /[0-9.eE+\-]/.test(src[j])) j++
      push(src.slice(i, j), 'n')
      i = j
      continue
    }
    if (/[A-Za-z]/.test(ch)) {
      let j = i
      while (j < len && /[A-Za-z]/.test(src[j])) j++
      const word = src.slice(i, j)
      if (word === 'true' || word === 'false' || word === 'null') {
        push(word, 'k')
      } else {
        push(word)
      }
      i = j
      continue
    }
    push(src[i])
    i++
  }
  return out
}

function tokenizeHtml(src: string): Tok[] {
  const out: Tok[] = []
  let i = 0
  const len = src.length
  const push = (text: string, kind?: string) => {
    if (text.length) out.push({ text, kind })
  }

  while (i < len) {
    const ch = src[i]
    if (ch === '<' && src[i + 1] === '!' && src[i + 2] === '-' && src[i + 3] === '-') {
      const end = src.indexOf('-->', i + 4)
      const stop = end === -1 ? len : end + 3
      push(src.slice(i, stop), 'c')
      i = stop
      continue
    }
    if (ch === '<') {
      // tag
      let j = i + 1
      while (j < len && src[j] !== '>' && src[j] !== '\n') j++
      j = Math.min(j + 1, len)
      const tagSrc = src.slice(i, j)
      // tokenize within tag
      const inner = tagSrc.replace(/^</, '').replace(/>$/, '')
      push('<', 't')
      // tag name
      const m = inner.match(/^\/?[A-Za-z0-9-]+/)
      if (m) {
        push(m[0], 't')
        let rest = inner.slice(m[0].length)
        // attributes: name="value" or name='value' or name
        while (rest.length) {
          const ws = rest.match(/^\s+/)
          if (ws) {
            push(ws[0])
            rest = rest.slice(ws[0].length)
            continue
          }
          const slash = rest.match(/^\/\s*$/)
          if (slash) {
            push(rest, 't')
            rest = ''
            continue
          }
          const at = rest.match(/^([A-Za-z@:_-]+)(?:=("[^"]*"|'[^']*'|[^\s>]+))?/)
          if (at) {
            push(at[1], 'a')
            if (at[2]) {
              push('=')
              push(at[2], 's')
            }
            rest = rest.slice(at[0].length)
            continue
          }
          push(rest[0])
          rest = rest.slice(1)
        }
      } else {
        push(inner)
      }
      if (src[j - 1] === '>') push('>', 't')
      i = j
      continue
    }
    push(src[i])
    i++
  }
  return out
}

function tokenizeBash(src: string): Tok[] {
  const out: Tok[] = []
  const lines = src.split('\n')
  lines.forEach((line, idx) => {
    if (line.trimStart().startsWith('#')) {
      out.push({ text: line, kind: 'c' })
    } else {
      // strings
      let i = 0
      const len = line.length
      while (i < len) {
        const ch = line[i]
        if (ch === '"' || ch === "'") {
          const quote = ch
          let j = i + 1
          while (j < len && line[j] !== quote) {
            if (line[j] === '\\') j++
            j++
          }
          j = Math.min(j + 1, len)
          out.push({ text: line.slice(i, j), kind: 's' })
          i = j
          continue
        }
        if (/[A-Za-z_-]/.test(ch)) {
          let j = i
          while (j < len && /[A-Za-z0-9_-]/.test(line[j])) j++
          const word = line.slice(i, j)
          if (BASH_KEYWORDS.has(word)) {
            out.push({ text: word, kind: 'k' })
          } else if (i === 0 || /\s/.test(line[i - 1] ?? '')) {
            // command at start of line
            out.push({ text: word, kind: 'fn' })
          } else {
            out.push({ text: word })
          }
          i = j
          continue
        }
        out.push({ text: line[i] })
        i++
      }
    }
    if (idx < lines.length - 1) out.push({ text: '\n' })
  })
  return out
}

export function highlight(src: string, lang: Lang): Tok[] {
  switch (lang) {
    case 'json':
      return tokenizeJson(src)
    case 'js':
    case 'ts':
      return tokenizeJs(src)
    case 'html':
      return tokenizeHtml(src)
    case 'bash':
      return tokenizeBash(src)
    default:
      return [{ text: src }]
  }
}
