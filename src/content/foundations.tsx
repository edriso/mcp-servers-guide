import {
  Callout,
  Code,
  Limits,
  Tags,
  Terms,
} from '../components/Blocks'
import type { Page } from '../types'

export const foundationsPages: Page[] = [
  {
    id: 'intro',
    title: 'What is MCP',
    heading: 'MCP, in plain words',
    lede: (
      <>
        MCP is a small, open standard for connecting AI assistants to
        the tools and data they need. You write a tiny server. The
        assistant gains new powers.
      </>
    ),
    content: (
      <>
        <p>
          MCP stands for <strong>Model Context Protocol</strong>: think
          of it as USB for AI: one shape that fits many things. You make
          a server that exposes tools, data, or prompts. Any MCP-aware
          assistant (Claude Desktop, Claude Code, Cursor, Zed, and
          others) can plug into it and use what you exposed.
        </p>

        <h3>What you can give the assistant</h3>
        <ul>
          <li>
            <strong>Tools</strong>: functions the assistant can call,
            like <code>add_article(url)</code> or{' '}
            <code>search_jira(query)</code>.
          </li>
          <li>
            <strong>Resources</strong>: read-only data the assistant can
            browse and quote, like a file, a webpage, or a snapshot of
            your database.
          </li>
          <li>
            <strong>Prompts</strong>: reusable templates the user can
            invoke, like a "summarize this PR" workflow.
          </li>
        </ul>

        <h3>Why this matters</h3>
        <p>
          Before MCP, every team rebuilt the same wheel: shaping data,
          authenticating, marshalling tool calls, parsing responses.
          With MCP, you write one server. It now works in every
          MCP-compatible assistant. The assistant on the other end
          handles the LLM, the user interface, the conversation flow.
        </p>

        <Callout label="Mental model">
          <p>
            You write a small program that says <em>"I have these
            tools and data"</em>. The assistant says <em>"great, I'll
            call them when the user needs them"</em>. The protocol
            in between is JSON-RPC over a transport (usually a pipe or
            HTTP).
          </p>
        </Callout>
      </>
    ),
  },

  {
    id: 'use-cases',
    title: 'What people build',
    heading: 'Real-world MCP servers',
    lede: (
      <>
        MCP is useful anywhere you'd say "I wish my AI assistant could
        just do this thing for me."
      </>
    ),
    content: (
      <>
        <h3>Everyday examples</h3>
        <Terms
          items={[
            { term: 'Notes / wiki', def: 'Let the assistant read and update your Notion, Obsidian, or Apple Notes.' },
            { term: 'GitHub', def: 'Read repos, list PRs, comment, create issues, run reviews.' },
            { term: 'Calendar', def: 'See your free time, book meetings, send invites.' },
            { term: 'Linear / Jira', def: 'Triage tickets, write release notes, check sprint status.' },
            { term: 'Slack / Discord', def: 'Post messages, summarise channels, react to mentions.' },
            { term: 'Files', def: 'Read or modify files in a folder you choose. The official "filesystem" server is a great starting point.' },
            { term: 'Database', def: 'Run read-only queries against Postgres or SQLite.' },
            { term: 'Custom internal tools', def: 'Anything your team uses through a private API can become an MCP server.' },
          ]}
        />

        <h3>The tutorial we'll build</h3>
        <p>
          In the <em>Build</em> section we'll make a{' '}
          <strong>Reading List</strong> server. The assistant gains tools
          like <code>add_article</code>, <code>list_unread</code>, and{' '}
          <code>mark_read</code>, plus a resource that exposes the whole
          list as Markdown. It is small, useful, and touches every
          primitive in the protocol.
        </p>

        <Callout label="The vibe" tone="info">
          <p>
            Most useful MCP servers are tiny. A few hundred lines is a
            lot. The win is that they slot right into your existing AI
            workflow without you building a chat UI.
          </p>
        </Callout>
      </>
    ),
  },

  {
    id: 'skills',
    title: 'Skills you need',
    heading: 'What you should know before starting',
    content: (
      <>
        <h3>Required</h3>
        <Terms
          items={[
            { term: 'JavaScript or TypeScript', def: 'Plain JS works. TypeScript is recommended once your server has more than two tools.' },
            { term: 'Node.js (or Bun / Deno)', def: 'Node 20+ runs the official SDK without surprises.' },
            { term: 'JSON', def: 'You will define schemas and read responses in JSON.' },
            { term: 'Async / await', def: 'Almost everything is async. Promises are your friend.' },
            { term: 'A terminal', def: 'You run servers from there during development.' },
          ]}
        />

        <h3>Helpful but not required</h3>
        <Terms
          items={[
            { term: 'Zod', def: 'A small library for declaring input schemas. The official SDK uses it.' },
            { term: 'A persistence library', def: 'better-sqlite3 for SQLite, or just JSON files for tiny servers.' },
            { term: 'fetch', def: 'For talking to external APIs. Built into Node 20+.' },
            { term: 'Claude Desktop or Claude Code', def: 'The easiest places to plug your server in and try it.' },
          ]}
        />

        <Callout label="You do not need" tone="ok">
          <p>
            A backend, a server-with-uptime, a domain, or any cloud
            account. The simplest MCP server is a local Node script that
            speaks over stdin and stdout. The assistant launches it for
            you.
          </p>
        </Callout>

        <Tags items={['javascript', 'typescript', 'node', 'json', 'async']} />
      </>
    ),
  },

  {
    id: 'architecture',
    title: 'Architecture',
    heading: 'Host, client, server',
    lede: (
      <>
        Three roles, one conversation. Once you see the shape, every
        diagram in the docs starts to make sense.
      </>
    ),
    content: (
      <>
        <Terms
          items={[
            { term: 'Host', def: 'The application the user sits in. Examples: Claude Desktop, Claude Code, Cursor, Zed. The host runs the LLM and the chat UI.' },
            { term: 'Client', def: 'The piece of the host that speaks MCP. One client per server connection. The host can have many clients at once.' },
            { term: 'Server', def: 'Your code. Exposes tools, resources, and prompts. Run by the host as a child process or reached over HTTP.' },
          ]}
        />

        <h3>Diagram</h3>
        <pre className="diagram">
{`┌────────────────────────────────────────┐
│              HOST  (Claude)            │
│                                        │
│   ┌──────────┐    ┌──────────┐         │
│   │  client  │ ←→ │  client  │ ...     │
│   └────┬─────┘    └────┬─────┘         │
└────────┼───────────────┼───────────────┘
         │ MCP           │ MCP
   (JSON-RPC)      (JSON-RPC)
         │               │
   ┌─────▼─────┐   ┌─────▼─────┐
   │ server #1 │   │ server #2 │  ...
   │ (Reading  │   │ (Github)  │
   │  list)    │   │           │
   └───────────┘   └───────────┘`}
        </pre>

        <p>
          Each server runs as a separate process. They don't know about
          each other. The host orchestrates: it asks the LLM what to do,
          calls the right tool on the right server, returns the result
          back to the model.
        </p>

        <Callout label="One server per concern">
          <p>
            Don't try to make one giant server that does everything.
            Make a small server per integration: one for your notes, one
            for GitHub, one for your dev DB. Easier to install, share,
            and reason about.
          </p>
        </Callout>
      </>
    ),
  },

  {
    id: 'protocol',
    title: 'The protocol',
    heading: 'JSON-RPC over a transport',
    lede: (
      <>
        Underneath, MCP is plain JSON. Two sides exchange numbered
        request and response messages. Same shape as any JSON-RPC API
        you've seen.
      </>
    ),
    content: (
      <>
        <h3>A message</h3>
        <Code lang="json">
{`{
  "jsonrpc": "2.0",
  "id": 7,
  "method": "tools/call",
  "params": {
    "name": "add_article",
    "arguments": { "url": "https://example.com/post" }
  }
}`}
        </Code>

        <p>
          And a response:
        </p>

        <Code lang="json">
{`{
  "jsonrpc": "2.0",
  "id": 7,
  "result": {
    "content": [
      { "type": "text", "text": "Saved! 3 unread now." }
    ]
  }
}`}
        </Code>

        <h3>The handshake</h3>
        <p>
          When the host starts your server, the client sends an{' '}
          <code>initialize</code> request. You reply with what protocol
          version you speak, what capabilities you support (tools,
          resources, prompts), and your name and version. After that,
          the conversation is open.
        </p>

        <Code lang="json">
{`{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2025-06-18",
    "capabilities": { "tools": {}, "resources": {} },
    "clientInfo": { "name": "Claude Desktop", "version": "1.4.0" }
  }
}`}
        </Code>

        <Callout label="You won't write this by hand" tone="note">
          <p>
            The official SDKs handle the wire format for you. But it
            helps to remember that MCP is just JSON requests and
            responses on a stream. When something breaks, you can
            usually <code>console.error</code> the raw payload and read
            what's happening.
          </p>
        </Callout>
      </>
    ),
  },

  {
    id: 'transports',
    title: 'Transports',
    heading: 'How the bytes actually travel',
    lede: (
      <>
        MCP doesn't care how the JSON moves. Two transports are
        commonly supported: stdio and streamable HTTP.
      </>
    ),
    content: (
      <>
        <h3>The two transports</h3>
        <Terms
          items={[
            { term: 'stdio', def: 'The host launches your server as a child process. Messages flow on stdin / stdout. Logs and errors go to stderr. Simple, secure (no network), perfect for local servers.' },
            { term: 'Streamable HTTP', def: 'Your server runs as an HTTP service. The client makes a POST and the server replies (or streams). Used for servers that live on a remote machine, are shared between users, or do work that needs scaling.' },
          ]}
        />

        <h3>Pick stdio when…</h3>
        <ul>
          <li>The server runs locally on the user's machine.</li>
          <li>You want zero network setup. No port, no auth, just code.</li>
          <li>You're building for a single user (yourself, your team).</li>
        </ul>

        <h3>Pick HTTP when…</h3>
        <ul>
          <li>The server is shared (one instance serves many users).</li>
          <li>You need OAuth or other web auth flows.</li>
          <li>The server runs on a different machine than the host.</li>
          <li>You want to deploy it like any other small web service.</li>
        </ul>

        <Callout label="The old SSE transport" tone="warn">
          <p>
            Earlier MCP versions used a Server-Sent Events transport.
            It's deprecated. New servers should use stdio for local or
            streamable HTTP for remote. If you read about "SSE
            transport" anywhere, that's the legacy one.
          </p>
        </Callout>
      </>
    ),
  },

  {
    id: 'primitive-tools',
    title: 'Tools',
    heading: 'Tools: actions the assistant can take',
    lede: (
      <>
        Tools are the most-used MCP primitive. Each tool is a named
        function with a JSON schema for its arguments. The assistant
        decides when to call it.
      </>
    ),
    content: (
      <>
        <h3>What a tool needs</h3>
        <Terms
          items={[
            { term: 'name', def: 'A short, unique identifier. snake_case. The model sees this.' },
            { term: 'title', def: 'A short, human-readable label shown in UI.' },
            { term: 'description', def: 'A clear sentence telling the model when to call this. Spend time here. The better the description, the smarter the calls.' },
            { term: 'inputSchema', def: 'A JSON Schema describing the arguments. Required vs optional, types, descriptions.' },
            { term: 'handler', def: 'Your code. Called when the model invokes the tool. Returns content blocks (text, image, or resource references).' },
          ]}
        />

        <h3>Shape of the response</h3>
        <p>
          A tool returns a list of content blocks. The most common is a
          text block; you can also return images or links to resources.
        </p>

        <Code lang="json">
{`{
  "content": [
    { "type": "text", "text": "Saved! You have 3 unread articles." }
  ],
  "isError": false
}`}
        </Code>

        <h3>Errors</h3>
        <p>
          If something goes wrong, return <code>isError: true</code>{' '}
          with a human-readable explanation in a text block. The
          assistant will see it and can decide what to tell the user or
          retry differently.
        </p>

        <Callout label="Write descriptions for the model, not for the user" tone="info">
          <p>
            "Saves an article URL to the user's reading list. Use this
            when the user shares a link they want to read later, or
            when they say things like 'save this for later'." That
            kind of clear, situational sentence makes the model 10x
            better at picking the right tool.
          </p>
        </Callout>
      </>
    ),
  },

  {
    id: 'primitive-resources',
    title: 'Resources',
    heading: 'Resources: data the assistant can read',
    lede: (
      <>
        Resources are read-only blobs (text, JSON, images) the
        assistant can fetch by URI. Think files, webpages, or
        snapshots. Anything the assistant might want to quote or
        consider, not act on.
      </>
    ),
    content: (
      <>
        <h3>The shape of a resource</h3>
        <Terms
          items={[
            { term: 'uri', def: 'A unique address. You pick the scheme. Common: file://, http://, or your own like reading-list://articles.' },
            { term: 'name', def: 'A short label.' },
            { term: 'description', def: 'What this resource is. Same model-friendly tone as tool descriptions.' },
            { term: 'mimeType', def: 'text/plain, text/markdown, application/json, image/png, etc.' },
          ]}
        />

        <h3>Listing vs reading</h3>
        <p>
          Servers expose two flows: <strong>list</strong> (what
          resources do you have?) and <strong>read</strong> (give me
          the contents of one). Listing returns metadata; reading
          returns bytes.
        </p>

        <h3>Resource templates</h3>
        <p>
          For dynamic resources, you expose a <em>template</em> like{' '}
          <code>reading-list://articles/{`{id}`}</code>. The assistant
          can read any specific article by filling in the id.
        </p>

        <Callout label="Tools vs resources" tone="note">
          <p>
            Use a <strong>resource</strong> for "read this thing" and a{' '}
            <strong>tool</strong> for "do this thing". A resource that
            could change the world is a tool. A tool that only returns
            data could be a resource. When in doubt: state-changing →
            tool, pure data → resource.
          </p>
        </Callout>
      </>
    ),
  },

  {
    id: 'primitive-prompts',
    title: 'Prompts',
    heading: 'Prompts: reusable templates the user can run',
    lede: (
      <>
        Prompts are pre-written conversation starters. The user picks
        one from a menu in the host UI, fills in variables, and the
        assistant runs with it.
      </>
    ),
    content: (
      <>
        <h3>What they're for</h3>
        <p>
          You as the developer know what your server is good at. A
          prompt encodes that knowledge so users get great answers
          without having to phrase the question perfectly.
        </p>

        <h3>The shape</h3>
        <Terms
          items={[
            { term: 'name', def: 'Short identifier. snake_case.' },
            { term: 'description', def: 'What this prompt does.' },
            { term: 'arguments', def: 'List of variables the user fills in. Each has a name, description, and required flag.' },
            { term: 'messages', def: 'The actual prompt content, returned when the user runs it. A list of role + content blocks the host injects into the conversation.' },
          ]}
        />

        <h3>Example: weekly review</h3>
        <Code lang="json">
{`{
  "name": "weekly_review",
  "description": "Summarize your unread reading list for the week.",
  "arguments": [
    { "name": "week_of", "description": "The Monday of the week.", "required": true }
  ]
}`}
        </Code>

        <p>
          When the user picks "weekly_review" and types a date, your
          server returns the prompt content (questions for the model,
          the relevant data, etc.). The host pastes it as the next user
          message. The assistant takes it from there.
        </p>

        <Callout label="Optional but loved" tone="ok">
          <p>
            Prompts are the most underused primitive. Even one good
            prompt makes your server feel like a finished product
            instead of a pile of tools.
          </p>
        </Callout>
      </>
    ),
  },

  {
    id: 'sampling-roots',
    title: 'Sampling & roots',
    heading: 'Two advanced primitives',
    lede: (
      <>
        Both flow from server back to client. Sampling lets your
        server ask the model a question. Roots tell your server what
        files or paths the user has shared.
      </>
    ),
    content: (
      <>
        <h3>Sampling (server → model)</h3>
        <p>
          Most servers respond to the model. Sampling reverses the
          arrow: your server asks the host's model to think about
          something, then returns the answer to the calling tool. Useful
          when your tool needs creative help mid-execution (writing a
          summary, naming a thing).
        </p>

        <Code lang="ts">
{`// inside a tool handler
const reply = await server.sample({
  messages: [{ role: 'user', content: 'Write a one-line title for: ' + text }],
  maxTokens: 30,
})
const title = reply.content[0].text`}
        </Code>

        <Callout label="Not all clients support it" tone="warn">
          <p>
            Sampling support varies. Claude Desktop supports it; many
            other hosts don't yet. Treat sampling as a nice-to-have, not
            something your server depends on.
          </p>
        </Callout>

        <h3>Roots (client → server)</h3>
        <p>
          A <strong>root</strong> is a file path or directory the user
          has explicitly shared with your server. The host tells you the
          roots; your server can list and read inside them. This is how
          file-aware servers stay sandboxed: they only see what the user
          has shared, never the whole disk.
        </p>
      </>
    ),
  },

  {
    id: 'auth',
    title: 'Authentication',
    heading: 'How servers know who is calling',
    lede: (
      <>
        Local servers usually don't authenticate; they trust the host
        that launched them. Remote HTTP servers need real auth. MCP
        leans on OAuth 2.1 for that.
      </>
    ),
    content: (
      <>
        <h3>Local stdio servers</h3>
        <p>
          The user installed your server. The host runs it. Whatever
          you do, you do as the user's local process. Trust the
          environment. If you connect to external APIs, store keys in
          the user's environment variables, not in the server itself.
        </p>

        <h3>Remote HTTP servers</h3>
        <p>
          Anyone on the internet could send your server requests. You
          need authentication. MCP's spec uses{' '}
          <strong>OAuth 2.1</strong> with PKCE. The host walks the user
          through a normal browser-based login, gets a token, then
          includes the token in HTTP headers on every request.
        </p>

        <Callout label="If this sounds like a lot" tone="info">
          <p>
            For your first MCP server, build it as stdio. You skip the
            entire auth chapter. Move to HTTP only when you need to
            share a server between users or run it on a server you
            control.
          </p>
        </Callout>
      </>
    ),
  },

  {
    id: 'errors',
    title: 'Errors & cancellation',
    heading: 'When things go wrong',
    content: (
      <>
        <h3>How to fail well</h3>
        <ul>
          <li>
            For protocol-level errors (bad request, missing method), let
            the SDK handle it. It returns a JSON-RPC error object.
          </li>
          <li>
            For tool failures (URL didn't fetch, file not found), return
            a normal tool result with{' '}
            <code>isError: true</code> and a clear human message. The
            model can read it and adjust.
          </li>
          <li>
            Don't crash the process. An unhandled error kills your
            server and the host has to restart it.
          </li>
        </ul>

        <Code lang="ts" file="example tool error">
{`return {
  content: [{
    type: 'text',
    text: 'Could not save: the URL was unreachable. Try again later.',
  }],
  isError: true,
}`}
        </Code>

        <h3>Cancellation</h3>
        <p>
          When the user stops a long tool call, the client sends a
          cancellation. Most SDKs surface this through an{' '}
          <code>AbortSignal</code> on the handler. Pass it to{' '}
          <code>fetch</code> and any other awaitable, and clean up
          gracefully when it fires.
        </p>
      </>
    ),
  },

  {
    id: 'logging',
    title: 'Logging & debugging',
    heading: 'Keeping the lights on',
    content: (
      <>
        <h3>The first rule of stdio</h3>
        <Callout label="Never write logs to stdout" tone="warn">
          <p>
            On stdio, stdout is the protocol channel. Writing
            unstructured logs there will confuse the client and break
            your server. Always use <code>console.error</code> (which
            goes to stderr) or the SDK's logger.
          </p>
        </Callout>

        <h3>Structured logging via the protocol</h3>
        <p>
          MCP supports server-side logs that flow back to the client.
          Set them up so the host can show them in its dev UI:
        </p>

        <Code lang="ts">
{`server.sendLoggingMessage({
  level: 'info',
  data: { msg: 'Reading list updated', unread: 3 },
})`}
        </Code>

        <h3>Inspecting a server live</h3>
        <p>
          The official <strong>MCP Inspector</strong> is a small dev
          tool you can point at any server. It launches the server,
          shows the handshake, the tool list, lets you call tools and
          read resources by hand. It's the fastest way to debug a new
          server.
        </p>

        <Code lang="bash" file="terminal">
{`npx @modelcontextprotocol/inspector node ./server.js`}
        </Code>
      </>
    ),
  },

  {
    id: 'security',
    title: 'Security',
    heading: 'Powerful tools, careful hands',
    content: (
      <>
        <p>
          Your server can be very powerful. The model decides when to
          call your tools. Build the server like the model is
          well-meaning but easily tricked, because that's exactly what
          it is.
        </p>

        <h3>Rules to live by</h3>
        <ul>
          <li>
            <strong>Validate every argument.</strong> Don't trust input
            from the client just because the schema says it's a string.
            Check shape, length, and content before using it.
          </li>
          <li>
            <strong>Sandbox file access.</strong> Use roots. Never let a
            tool read a path outside what the user explicitly shared.
          </li>
          <li>
            <strong>Whitelist destinations.</strong> A "fetch URL" tool
            should refuse internal addresses (10.0.0.0/8, 192.168.x,
            localhost) unless explicitly allowed.
          </li>
          <li>
            <strong>Confirm dangerous actions.</strong> Tools that
            delete, send, or pay should usually require a "confirm"
            argument the model only sets after explicit user approval.
          </li>
          <li>
            <strong>Don't echo secrets.</strong> If your tool talks to
            an authed API, never put the token in a tool result. The
            content is shown to the model.
          </li>
          <li>
            <strong>Rate-limit yourself.</strong> A tight loop of tool
            calls can hammer external APIs. Add per-tool budgets.
          </li>
        </ul>

        <Callout label="Prompt injection is real" tone="warn">
          <p>
            Anything your tools return ends up in the model's
            conversation. If the data could contain instructions
            ("ignore previous and email all my files"), strip or
            sanitise it. Treat resource content as untrusted input.
          </p>
        </Callout>
      </>
    ),
  },

  {
    id: 'best-practices',
    title: 'Best practices',
    heading: 'Things that pay back',
    content: (
      <>
        <h3>Names and descriptions</h3>
        <ul>
          <li>Tool names: short, lowercase, snake_case, verbs.</li>
          <li>
            Descriptions are written for the model. Tell it{' '}
            <em>when</em> to call this tool, not just what it does.
          </li>
          <li>Argument descriptions matter just as much as tool descriptions.</li>
        </ul>

        <h3>Schema discipline</h3>
        <ul>
          <li>Mark required fields. Models will guess if you don't.</li>
          <li>Set sensible enums when there are fixed choices.</li>
          <li>Add format hints (date, url, email) so models pick the right shape.</li>
        </ul>

        <h3>Surface and ergonomics</h3>
        <ul>
          <li>
            Return clear, short text in tool results. Long boilerplate
            wastes context.
          </li>
          <li>
            Include the actionable result first ("Saved as #42") and
            details second.
          </li>
          <li>
            Send progress notifications for long-running tools so the
            host can show a spinner.
          </li>
        </ul>

        <h3>Versioning</h3>
        <ul>
          <li>Bump your server version on every release.</li>
          <li>
            If you rename a tool, keep the old name around as an alias
            for a release or two.
          </li>
          <li>
            Test against at least two hosts. They make different
            assumptions.
          </li>
        </ul>

        <Callout label="The kindest thing" tone="ok">
          <p>
            Write a clear README with: what it does, how to install,
            example prompts that show the value. Most people pick MCP
            servers from a one-line description; they install one with
            a clear pitch.
          </p>
        </Callout>
      </>
    ),
  },

  {
    id: 'limits',
    title: 'Limits cheatsheet',
    heading: 'Numbers worth knowing',
    content: (
      <>
        <Limits
          items={[
            { label: 'Tool name', value: 'snake_case', meta: 'short, model-readable' },
            { label: 'Tools per server', value: 'no hard cap', meta: 'practical: 5–20 well-named' },
            { label: 'Resources per server', value: 'no hard cap', meta: 'thousands work; list lazily' },
            { label: 'Tool result text', value: '~50–100 KB', meta: 'practical; longer wastes context' },
            { label: 'Tool timeout', value: '~30 s', meta: 'host default; raise via progress events' },
            { label: 'Transport', value: 'stdio / HTTP', meta: 'pick stdio for local' },
            { label: 'Protocol version', value: '2025-06-18', meta: 'current as of early 2026; check spec' },
            { label: 'Server processes', value: 'one per server', meta: 'host launches; you handle one connection' },
          ]}
        />

        <Callout label="When something feels wrong" tone="note">
          <p>
            The MCP spec is small and very readable. When the SDK does
            something surprising, check{' '}
            <code>modelcontextprotocol.io</code>. The page you're
            looking at almost certainly exists.
          </p>
        </Callout>
      </>
    ),
  },

  {
    id: 'closing',
    title: 'Closing thoughts',
    heading: 'You are very close to your first server',
    content: (
      <>
        <p>
          MCP servers are a tiny abstraction with disproportionate
          payoff. Once you grasp tools, resources, and prompts, the
          rest is just thinking about what your assistant should be
          able to do that it can't yet. The gap is your idea.
        </p>
        <p>
          Move on to the <em>Build</em> tab. We'll wire up a real
          server, plug it into Claude Desktop, watch the assistant use
          it, and end the session with a publishable npm package.
        </p>
      </>
    ),
  },
]
