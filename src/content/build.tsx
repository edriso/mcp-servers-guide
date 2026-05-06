import {
  Callout,
  Code,
  Example,
  Steps,
  Tags,
  Terms,
  Tree,
} from '../components/Blocks'
import type { Page } from '../types'

export const buildPages: Page[] = [
  {
    id: 'plan',
    title: 'What we will build',
    heading: 'Reading List, an MCP server with real teeth',
    lede: (
      <>
        We'll build <strong>Reading List MCP</strong>: a server that
        lets your AI assistant save articles, list them, search them,
        and mark them read. Tiny, useful, and it touches every
        primitive in the protocol.
      </>
    ),
    content: (
      <>
        <h3>What the assistant will be able to do</h3>
        <ul>
          <li>Save URLs the user mentions: <code>add_article(url, tags?)</code>.</li>
          <li>List unread articles: <code>list_unread()</code>.</li>
          <li>Search by keyword: <code>search(query)</code>.</li>
          <li>Mark an article read: <code>mark_read(id)</code>.</li>
          <li>Read the full list as a Markdown resource.</li>
          <li>Run a "weekly review" prompt that summarises this week's reads.</li>
        </ul>

        <h3>What we'll use</h3>
        <Tags items={['typescript', '@modelcontextprotocol/sdk', 'zod', 'sqlite', 'claude desktop']} />

        <h3>The shape of the project</h3>
        <Tree>
{`reading-list-mcp/
├─ package.json
├─ tsconfig.json
├─ src/
│  ├─ index.ts        ← server entry point
│  ├─ db.ts           ← SQLite persistence
│  └─ tools/
│     ├─ add.ts
│     ├─ list.ts
│     ├─ search.ts
│     └─ mark-read.ts
└─ README.md`}
        </Tree>

        <Callout label="Follow along">
          <p>
            Make a folder named <code>reading-list-mcp</code>. Each
            page in this section adds files. By the end you'll have a
            real server you can plug into Claude.
          </p>
        </Callout>
      </>
    ),
  },

  {
    id: 'setup',
    title: 'Setup',
    heading: 'A clean Node + TypeScript project',
    content: (
      <>
        <Steps>
          <li>
            Make sure you have <strong>Node 20+</strong>. <code>node --version</code>{' '}
            should print something like <code>v20.10.0</code> or newer.
          </li>
          <li>Initialize the project.</li>
          <li>Add the SDK and a few helpers.</li>
          <li>Configure TypeScript.</li>
        </Steps>

        <Code lang="bash" file="terminal">
{`mkdir reading-list-mcp && cd reading-list-mcp
npm init -y
npm install @modelcontextprotocol/sdk zod better-sqlite3
npm install -D typescript @types/node @types/better-sqlite3 tsx`}
        </Code>

        <h3>tsconfig.json</h3>
        <Code lang="json" file="tsconfig.json">
{`{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}`}
        </Code>

        <h3>package.json scripts</h3>
        <Code lang="json" file="package.json (excerpt)">
{`{
  "type": "module",
  "bin": { "reading-list-mcp": "dist/index.js" },
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}`}
        </Code>

        <Callout label="Why type: module" tone="note">
          <p>
            The MCP SDK uses ES modules. Setting{' '}
            <code>"type": "module"</code> in package.json means your{' '}
            <code>.js</code> files are treated as ESM. Combined with the
            Node16 module setting, you can write modern{' '}
            <code>import / export</code> in TypeScript and Node will run
            it directly.
          </p>
        </Callout>
      </>
    ),
  },

  {
    id: 'hello-server',
    title: 'Hello server',
    heading: 'A server that says hello',
    lede: (
      <>
        Before features, prove the loop works: a minimal server, the
        Inspector connects, you see your tool. Five minutes.
      </>
    ),
    content: (
      <>
        <h3>The smallest possible server</h3>
        <Code lang="ts" file="src/index.ts">
{`#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

const server = new McpServer({
  name: 'reading-list-mcp',
  version: '0.1.0',
})

server.registerTool(
  'say_hello',
  {
    title: 'Say hello',
    description: 'Returns a friendly greeting.',
    inputSchema: { name: z.string().describe('Who to greet') },
  },
  async ({ name }) => ({
    content: [{ type: 'text', text: \`Hello, \${name}! 👋\` }],
  })
)

await server.connect(new StdioServerTransport())`}
        </Code>

        <p>
          The shebang at the top means the file can be executed
          directly once we add a <code>bin</code> entry. The transport
          is stdio: we read JSON from stdin, write replies to stdout.
        </p>

        <h3>Try it with the Inspector</h3>
        <p>
          Don't even bother plugging into Claude yet. The official MCP
          Inspector launches your server, shows the handshake, and lets
          you call tools by hand. Best dev tool in the kit.
        </p>

        <Code lang="bash" file="terminal">
{`# build first, then point the inspector at the compiled JS
npm run build
npx @modelcontextprotocol/inspector node dist/index.js`}
        </Code>

        <Example>
          <p>
            The Inspector opens in your browser. You should see the
            tool <strong>say_hello</strong> in the Tools tab. Click it,
            type a name, hit Run. You'll get back{' '}
            <em>"Hello, Mohamed! 👋"</em>.
          </p>
        </Example>

        <Callout label="If something fails" tone="warn">
          <p>
            Read the error in the Inspector's Logs panel. The most
            common first-time problem is logging to{' '}
            <code>console.log</code> (which corrupts the protocol). Use{' '}
            <code>console.error</code> for everything human-readable.
          </p>
        </Callout>
      </>
    ),
  },

  {
    id: 'plug-in',
    title: 'Plugging into Claude',
    heading: 'Make it appear inside Claude Desktop',
    lede: (
      <>
        With the server compiled, telling Claude about it takes one
        config edit. After this, every conversation can use your tools.
      </>
    ),
    content: (
      <>
        <h3>1. Find the config file</h3>
        <Terms
          items={[
            { term: 'macOS', def: '~/Library/Application Support/Claude/claude_desktop_config.json' },
            { term: 'Windows', def: '%APPDATA%/Claude/claude_desktop_config.json' },
            { term: 'Linux', def: '~/.config/Claude/claude_desktop_config.json' },
          ]}
        />

        <h3>2. Add your server</h3>
        <Code lang="json" file="claude_desktop_config.json">
{`{
  "mcpServers": {
    "reading-list": {
      "command": "node",
      "args": ["/absolute/path/to/reading-list-mcp/dist/index.js"]
    }
  }
}`}
        </Code>

        <Callout label="Use absolute paths" tone="warn">
          <p>
            Claude launches the server from a different working
            directory. Relative paths break in confusing ways. Always
            use the absolute path to your compiled <code>index.js</code>.
          </p>
        </Callout>

        <h3>3. Restart Claude Desktop</h3>
        <p>
          Quit the app fully (cmd-Q on macOS) and reopen. You should
          see a small puzzle-piece or tool indicator in the chat input.
          Click it to confirm <strong>reading-list</strong> is connected
          and the <strong>say_hello</strong> tool is listed.
        </p>

        <h3>4. Try it</h3>
        <Example>
          <p>
            Ask Claude: <em>"Use reading list to say hi to Sam."</em>{' '}
            You'll see Claude call your tool, with the friendly result
            shown right in chat.
          </p>
        </Example>

        <Callout label="Same for Claude Code" tone="ok">
          <p>
            Claude Code reads servers from <code>~/.claude.json</code>{' '}
            (or run <code>claude mcp add</code>). The CLI walks you
            through it. Same config shape, same servers can run
            against either host.
          </p>
        </Callout>
      </>
    ),
  },

  {
    id: 'persistence',
    title: 'Persistence',
    heading: 'A SQLite database for our articles',
    lede: (
      <>
        Real servers persist. We'll use SQLite via better-sqlite3. A
        single file on disk, synchronous API, fast.
      </>
    ),
    content: (
      <>
        <Code lang="ts" file="src/db.ts">
{`import Database from 'better-sqlite3'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { mkdirSync } from 'node:fs'

const dir = join(homedir(), '.reading-list-mcp')
mkdirSync(dir, { recursive: true })
const db = new Database(join(dir, 'articles.db'))

db.exec(\`
  CREATE TABLE IF NOT EXISTS articles (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    url       TEXT NOT NULL,
    title     TEXT,
    tags      TEXT,
    read      INTEGER NOT NULL DEFAULT 0,
    created   INTEGER NOT NULL
  );
\`)

export type Article = {
  id: number
  url: string
  title: string | null
  tags: string | null
  read: 0 | 1
  created: number
}

export function addArticle(url: string, title: string | null, tags: string[]) {
  const stmt = db.prepare(
    'INSERT INTO articles (url, title, tags, read, created) VALUES (?, ?, ?, 0, ?)'
  )
  const info = stmt.run(url, title, tags.join(','), Date.now())
  return info.lastInsertRowid as number
}

export function listUnread(limit = 50): Article[] {
  return db.prepare(
    'SELECT * FROM articles WHERE read = 0 ORDER BY created DESC LIMIT ?'
  ).all(limit) as Article[]
}

export function search(q: string, limit = 25): Article[] {
  const like = '%' + q + '%'
  return db.prepare(
    \`SELECT * FROM articles WHERE url LIKE ? OR title LIKE ? OR tags LIKE ?
     ORDER BY created DESC LIMIT ?\`
  ).all(like, like, like, limit) as Article[]
}

export function markRead(id: number): boolean {
  const info = db.prepare('UPDATE articles SET read = 1 WHERE id = ?').run(id)
  return info.changes > 0
}

export function listAll(): Article[] {
  return db.prepare('SELECT * FROM articles ORDER BY created DESC').all() as Article[]
}`}
        </Code>

        <Callout label="Why a single file" tone="info">
          <p>
            For a personal MCP server, a SQLite file in the user's
            home directory is the perfect size of "real". It survives
            restarts, you can grep it, and it has zero setup. Postgres
            is overkill until many users share the server.
          </p>
        </Callout>
      </>
    ),
  },

  {
    id: 'tools',
    title: 'Adding the tools',
    heading: 'add_article, list_unread, search, mark_read',
    lede: (
      <>
        Now we plug the database into the MCP server through four
        tools. Each is a small, focused, well-described function.
      </>
    ),
    content: (
      <>
        <Code lang="ts" file="src/index.ts (replace)">
{`#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { addArticle, listUnread, search, markRead } from './db.js'

const server = new McpServer({
  name: 'reading-list-mcp',
  version: '0.1.0',
})

server.registerTool(
  'add_article',
  {
    title: 'Save an article',
    description:
      'Saves a URL to the user\\'s reading list. Use when the user shares a link they want to read later, or says things like "save this".',
    inputSchema: {
      url: z.string().url().describe('The URL to save'),
      title: z.string().optional().describe('Optional title for nicer display'),
      tags: z.array(z.string()).optional().describe('Optional tags for grouping'),
    },
  },
  async ({ url, title, tags = [] }) => {
    const id = addArticle(url, title ?? null, tags)
    return {
      content: [{ type: 'text', text: \`Saved as #\${id}.\` }],
    }
  }
)

server.registerTool(
  'list_unread',
  {
    title: 'List unread articles',
    description: 'Returns the most recent unread articles. Use when the user asks "what\\'s on my reading list" or similar.',
    inputSchema: {
      limit: z.number().int().min(1).max(200).optional()
        .describe('Max number to return (default 25)'),
    },
  },
  async ({ limit = 25 }) => {
    const list = listUnread(limit)
    if (!list.length) {
      return { content: [{ type: 'text', text: 'Reading list is empty.' }] }
    }
    const lines = list.map(a =>
      \`#\${a.id}  \${a.title ?? a.url}  ·  \${a.url}\`
    )
    return { content: [{ type: 'text', text: lines.join('\\n') }] }
  }
)

server.registerTool(
  'search',
  {
    title: 'Search the reading list',
    description: 'Searches saved articles by URL, title, or tag. Use when the user asks for past saves matching a topic.',
    inputSchema: {
      query: z.string().min(1).describe('Substring to search for'),
    },
  },
  async ({ query }) => {
    const list = search(query)
    if (!list.length) {
      return { content: [{ type: 'text', text: \`No matches for "\${query}".\` }] }
    }
    const lines = list.map(a =>
      \`#\${a.id}  \${a.title ?? a.url}\${a.read ? '  (read)' : ''}\`
    )
    return { content: [{ type: 'text', text: lines.join('\\n') }] }
  }
)

server.registerTool(
  'mark_read',
  {
    title: 'Mark article as read',
    description: 'Marks a saved article as read by id. Use when the user says they finished an article.',
    inputSchema: {
      id: z.number().int().describe('The article id from list_unread or search'),
    },
  },
  async ({ id }) => {
    const ok = markRead(id)
    return {
      content: [{ type: 'text', text: ok ? \`Marked #\${id} as read.\` : \`No article #\${id}.\` }],
      isError: !ok,
    }
  }
)

await server.connect(new StdioServerTransport())`}
        </Code>

        <Example>
          <p>
            Rebuild, restart Claude. Now ask: <em>"Save{' '}
            https://example.com/post for me, tag it 'react'."</em>{' '}
            Claude calls <code>add_article</code>. Then:{' '}
            <em>"What's on my reading list?"</em> calls{' '}
            <code>list_unread</code>. The tool descriptions are doing
            the routing.
          </p>
        </Example>

        <Callout label="The description is half the work" tone="ok">
          <p>
            Notice how each tool's description tells the model when to
            call it ("when the user says X"). That sentence is what
            makes the model confidently choose the right tool.
            Underspecify it and the model guesses. Overspecify it and
            you waste context.
          </p>
        </Callout>
      </>
    ),
  },

  {
    id: 'resource',
    title: 'A resource',
    heading: 'Expose the whole list as Markdown',
    lede: (
      <>
        Tools are for actions. Resources are for data. We'll expose
        the entire reading list as a Markdown resource Claude can
        read or quote from.
      </>
    ),
    content: (
      <>
        <Code lang="ts" file="src/index.ts (add before connect)">
{`import { listAll } from './db.js'

server.registerResource(
  'all_articles',
  'reading-list://articles.md',
  {
    title: 'All saved articles',
    description: 'A Markdown view of every article in the list.',
    mimeType: 'text/markdown',
  },
  async () => {
    const list = listAll()
    const md = list.length
      ? list.map(a => {
          const title = a.title ?? a.url
          const flag = a.read ? '✓' : '·'
          return \`- [\${flag}] [\${title}](\${a.url})\${a.tags ? \`  \\\`\${a.tags}\\\`\` : ''}\`
        }).join('\\n')
      : '_(empty)_'

    return {
      contents: [{
        uri: 'reading-list://articles.md',
        mimeType: 'text/markdown',
        text: '# Reading List\\n\\n' + md,
      }],
    }
  }
)`}
        </Code>

        <Example>
          <p>
            In Claude, click the paperclip / attach menu and look for{' '}
            <strong>reading-list://articles.md</strong>: pick it. Now
            you can ask <em>"summarise these articles by topic"</em>{' '}
            and Claude reads the whole list at once.
          </p>
        </Example>

        <Callout label="When to use a resource" tone="info">
          <p>
            When you want the assistant to <em>see</em> data without
            invoking a tool. The user attaches it once; the model
            consults it. Tools are for "do something"; resources are
            for "look at this".
          </p>
        </Callout>
      </>
    ),
  },

  {
    id: 'prompt',
    title: 'A prompt',
    heading: 'Pre-baked workflows for the user',
    lede: (
      <>
        A prompt is a button in the UI that runs a thoughtful starter
        message for the user. Add one good prompt and your server feels
        like a finished product.
      </>
    ),
    content: (
      <>
        <Code lang="ts" file="src/index.ts (add)">
{`server.registerPrompt(
  'weekly_review',
  {
    title: 'Weekly reading review',
    description: 'Summarise the unread reading list and pick the top 3 to read this week.',
    argsSchema: {
      goal: z.string().optional().describe('Optional theme or focus for the week'),
    },
  },
  async ({ goal }) => {
    const list = listUnread(100)
    const articles = list.map(a => \`- #\${a.id} \${a.title ?? a.url}\`).join('\\n')
    const focus = goal ? \`\\nFocus this week: \${goal}.\\n\` : ''

    return {
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: [
            'Here is my unread reading list:',
            articles || '(empty)',
            focus,
            'Group them by topic, then pick the top 3 you think I should read this week and explain why.',
          ].join('\\n'),
        },
      }],
    }
  }
)`}
        </Code>

        <Example>
          <p>
            In Claude, the slash menu / commands palette now shows{' '}
            <strong>weekly_review</strong>: pick it, optionally type a
            focus like "AI agents", press enter. Claude gets a perfectly
            shaped question and gives you a real review.
          </p>
        </Example>

        <Callout label="Prompts are gold" tone="ok">
          <p>
            Two or three well-named prompts make new users productive
            immediately. Think of them like the curated "starter
            actions" of your server.
          </p>
        </Callout>
      </>
    ),
  },

  {
    id: 'errors-progress',
    title: 'Errors & progress',
    heading: 'Failing well, signalling work',
    content: (
      <>
        <h3>Validating arguments past zod</h3>
        <p>
          Zod catches type errors automatically. For business-rule
          checks (URL allowlist, max length), check inside the handler
          and return a tool error.
        </p>

        <Code lang="ts">
{`server.registerTool('add_article', {/* ... */}, async ({ url, title, tags }) => {
  const u = new URL(url)
  if (u.protocol !== 'https:' && u.protocol !== 'http:') {
    return {
      content: [{ type: 'text', text: 'Only http(s) URLs are allowed.' }],
      isError: true,
    }
  }
  // happy path...
})`}
        </Code>

        <h3>Long tools and progress</h3>
        <p>
          For tools that take a while (fetching, scraping, OCR), notify
          the host so it can show a spinner and bump its timeout. Most
          SDKs expose a progress helper inside the handler.
        </p>

        <Code lang="ts">
{`server.registerTool('fetch_summary', {/* ... */}, async ({ url }, { sendProgress }) => {
  await sendProgress({ progress: 0.1, message: 'Downloading...' })
  const html = await fetch(url).then(r => r.text())
  await sendProgress({ progress: 0.6, message: 'Parsing...' })
  const text = extractText(html)
  return { content: [{ type: 'text', text: summarise(text) }] }
})`}
        </Code>

        <Callout label="Crash-safe handlers" tone="warn">
          <p>
            Wrap risky code in try/catch and return an{' '}
            <code>isError</code> result. If you let an exception bubble,
            the entire server may exit, and the host has to relaunch
            it. Disrupting the user's chat.
          </p>
        </Callout>
      </>
    ),
  },

  {
    id: 'logging',
    title: 'Logging & inspecting',
    heading: 'Watching your server work',
    content: (
      <>
        <h3>The Inspector, again</h3>
        <p>
          Throughout development, keep the Inspector open in another
          terminal:
        </p>
        <Code lang="bash" file="terminal">
{`npm run dev      # in one terminal: tsx watch
# in another:
npx @modelcontextprotocol/inspector node dist/index.js`}
        </Code>
        <p>
          You see the handshake, every request, every response. When
          something feels off in Claude, swap to the Inspector to see
          exactly what your server is sending.
        </p>

        <h3>Server-side logs to the host</h3>
        <Code lang="ts">
{`// inside any handler:
server.sendLoggingMessage({
  level: 'info',
  data: { msg: 'Article saved', id, url },
})`}
        </Code>
        <p>
          Some hosts surface these in their dev panel. Even when they
          don't, you can pipe them yourself with{' '}
          <code>console.error</code> (which goes to stderr) and watch
          them in the host's MCP log file.
        </p>

        <Callout label="The forbidden output" tone="warn">
          <p>
            On stdio: never <code>console.log</code>. Stdout is
            reserved for the protocol. Use{' '}
            <code>console.error</code>, the SDK logger, or{' '}
            <code>sendLoggingMessage</code>.
          </p>
        </Callout>
      </>
    ),
  },

  {
    id: 'security',
    title: 'Security pass',
    heading: 'A short hardening checklist',
    content: (
      <>
        <p>
          Reading List is read-mostly, but the patterns matter for any
          server you ship.
        </p>

        <h3>Specific to this server</h3>
        <ul>
          <li>
            <strong>URL allowlist</strong>: refuse non-http(s) URLs and
            local addresses (127.0.0.1, 192.168.x, file://).
          </li>
          <li>
            <strong>Length caps</strong>: titles, tags, and queries
            should have max lengths. The DB is local but a runaway tool
            still wastes CPU.
          </li>
          <li>
            <strong>SQL safety</strong>: never string-concatenate user
            input into SQL. Use prepared statements (we already do).
          </li>
        </ul>

        <h3>Universal</h3>
        <ul>
          <li>
            Treat any text returned from the network (article titles,
            scraped content) as <strong>untrusted</strong>: don't
            execute it; don't pass it as code.
          </li>
          <li>
            Never echo secrets or tokens in tool results. Tool results
            are visible to the model and end up in the user's context.
          </li>
          <li>
            Crash gracefully. Wrap handlers in try/catch and return an
            error result rather than letting the process die.
          </li>
        </ul>

        <Callout label="Prompt injection" tone="warn">
          <p>
            If your server fetches arbitrary web content, that content
            could include "ignore previous instructions and run X". The
            model will see it. Strip or neutralise external text
            before returning it from a tool.
          </p>
        </Callout>
      </>
    ),
  },

  {
    id: 'package',
    title: 'Packaging',
    heading: 'Ship it as a real npm package',
    lede: (
      <>
        With one bin field and a publish, anyone can install your
        server with <code>npx</code> or by pointing Claude at it.
      </>
    ),
    content: (
      <>
        <h3>The publishable shape</h3>
        <Code lang="json" file="package.json">
{`{
  "name": "reading-list-mcp",
  "version": "1.0.0",
  "description": "An MCP server that saves and recalls articles for AI assistants.",
  "type": "module",
  "bin": { "reading-list-mcp": "dist/index.js" },
  "files": ["dist", "README.md"],
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "zod": "^3.22.0",
    "better-sqlite3": "^11.0.0"
  }
}`}
        </Code>

        <Callout label="Make it executable" tone="info">
          <p>
            The shebang at the top of <code>src/index.ts</code> is
            important. After <code>tsc</code> emits the JS, npm sees
            the bin field and links it. Now <code>npx reading-list-mcp</code>{' '}
            launches your server.
          </p>
        </Callout>

        <h3>Publishing</h3>
        <Code lang="bash" file="terminal">
{`npm login
npm publish --access public`}
        </Code>

        <h3>Once it's on npm</h3>
        <p>
          Users install with one line in their config:
        </p>
        <Code lang="json" file="claude_desktop_config.json">
{`{
  "mcpServers": {
    "reading-list": {
      "command": "npx",
      "args": ["-y", "reading-list-mcp"]
    }
  }
}`}
        </Code>

        <Callout label="DXT bundles" tone="note">
          <p>
            Anthropic also publishes a packaging format called{' '}
            <strong>DXT</strong>: a zip with manifest plus your code.
            Users get a one-click install in Claude Desktop. Once your
            server is stable, ship a DXT for the smoothest experience.
          </p>
        </Callout>
      </>
    ),
  },

  {
    id: 'sharing',
    title: 'Sharing your server',
    heading: 'Where the world finds it',
    content: (
      <>
        <h3>Make it discoverable</h3>
        <ul>
          <li>
            Submit to{' '}
            <strong>github.com/modelcontextprotocol/servers</strong>{' '}
            (the awesome-list of MCP servers).
          </li>
          <li>
            Tag your repo on GitHub with{' '}
            <code>mcp-server</code> and <code>mcp</code>. People search
            for those.
          </li>
          <li>
            Post to <code>r/mcp</code>, the official Discord, and
            relevant niche communities (your data source's
            community).
          </li>
        </ul>

        <h3>What a great README has</h3>
        <ul>
          <li>One-sentence pitch above the fold.</li>
          <li>A 30-second install snippet.</li>
          <li>3 example prompts that show the win.</li>
          <li>A short "how it works" with a diagram.</li>
          <li>Link to source, license, contact.</li>
        </ul>

        <Callout label="Adoption beats perfection" tone="ok">
          <p>
            Ship something small that solves one problem really well.
            That's how Reading List MCP gets installed five times in
            the first day; that's how it grows from there.
          </p>
        </Callout>
      </>
    ),
  },

  {
    id: 'where-next',
    title: 'Where to go next',
    heading: 'Ideas using the same shape',
    content: (
      <>
        <p>
          You now know the full shape of an MCP server. A few ideas
          that fit in an evening:
        </p>

        <ul>
          <li>
            <strong>Bookmarks-with-summaries</strong>: Reading List, but
            your <code>add_article</code> tool also fetches and stores
            a summary using sampling.
          </li>
          <li>
            <strong>Personal CRM</strong>: contacts, last-met dates, a{' '}
            <code>nudge</code> prompt that picks who you should reach
            out to this week.
          </li>
          <li>
            <strong>Local-only Notion</strong>: an MCP server that
            wraps a folder of Markdown files. Now your assistant can
            read, search, and write to your notes.
          </li>
          <li>
            <strong>Habit tracker</strong>: tools to log a habit, query
            streaks, and a "morning check-in" prompt.
          </li>
          <li>
            <strong>Deploy watcher</strong>: a tool that calls your
            CI's API and a resource that returns the current build
            status as Markdown.
          </li>
          <li>
            <strong>Family calendar</strong>: shared HTTP-mode server
            with OAuth login, read-only calendar, smart suggestion
            prompts.
          </li>
        </ul>

        <Callout label="The same dance" tone="ok">
          <p>
            Each of these is the skeleton you just built: SDK,
            transport, a handful of tools, optional resources, an
            optional prompt. You'll forget syntax. You'll re-google
            schemas. The shape stays.
          </p>
        </Callout>

        <p>
          Ship the smallest version. Plug it into your assistant. Watch
          how you actually use it. Iterate. Have fun.
        </p>
      </>
    ),
  },
]
