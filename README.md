# MCP Field Guide

A friendly, hands-on guide to building MCP (Model Context Protocol)
servers in JavaScript or TypeScript. From "what is MCP" to a real,
publishable Reading List server you can plug into Claude.

## What's inside

- **Foundations** — what MCP is, what people build, skills you need,
  architecture (host / client / server), the JSON-RPC protocol,
  transports (stdio + streamable HTTP), the three primitives
  (tools, resources, prompts), sampling and roots, authentication,
  errors, logging, security, best practices, limits.
- **Build** — a real, end-to-end tutorial. We build *Reading List
  MCP*, a server that lets your AI assistant save articles, list
  them, search them, and run a weekly review. Real code,
  TypeScript, SQLite persistence, Claude Desktop integration, and
  publishing to npm.
- **Compare** — MCP vs provider tools vs custom integrations,
  stdio vs streamable HTTP, host compatibility (Claude Desktop,
  Claude Code, Cursor, Zed, VS Code), pros and cons.

## Stack

React 19 + TypeScript + Vite. Source Serif display + Outfit body.
Hash-based routing, dark/light themes, and a tiny bespoke syntax
highlighter for the code blocks.

## Run it

```sh
pnpm install
pnpm dev      # local dev at http://localhost:5173
pnpm build    # production build into dist/
```

## How content is organised

Each section has its own file in `src/content/`. Pages are TSX
objects with `id`, `title`, `heading`, `lede`, and `content`.

```ts
{
  id: 'something',
  title: 'Sidebar label',
  heading: 'Page heading',
  lede: <>One line summary.</>,
  content: <>JSX content...</>,
}
```

Reusable building blocks live in `src/components/Blocks.tsx`:

- `Callout` (info, warn, note, ok tones)
- `Example`, `Steps`
- `Terms`, `Limits`, `Tags`
- `Code` with file label and lang chip
- `Tree` for ASCII file trees
- `ProsCons`, `CompareTable3`

## Notes on accuracy

MCP is moving fast. Numbers, host support, and tooling here are
accurate as of early 2026. When in doubt, check the official spec
and SDK at `modelcontextprotocol.io` and
`github.com/modelcontextprotocol`.
