import { Callout, CompareTable3, ProsCons } from '../components/Blocks'
import type { Page } from '../types'

export const comparePages: Page[] = [
  {
    id: 'verdict',
    title: 'Quick verdict',
    heading: 'When to use MCP',
    lede: (
      <>
        MCP shines when you want to give an AI assistant new powers
        with the smallest amount of code. If you'd rather build a
        chatbot from scratch with your own UI, you don't need MCP at
        all.
      </>
    ),
    content: (
      <>
        <p>
          MCP is for adding capabilities to{' '}
          <strong>existing AI hosts</strong>: the user already has
          Claude Desktop, Claude Code, Cursor, or another MCP-aware
          host. You write a small server. Their assistant inherits
          your server's powers.
        </p>

        <h3>Pick MCP when…</h3>
        <ul>
          <li>The user already has an AI host they like.</li>
          <li>You want to integrate a private API or local data into AI workflows.</li>
          <li>You'd rather not build a chat UI, billing, or memory.</li>
          <li>You want one server to work in many hosts.</li>
        </ul>

        <h3>Use something else when…</h3>
        <ul>
          <li>You're building a stand-alone product with its own chat UI. Use the model API directly.</li>
          <li>The integration belongs to one provider only. Their native plugin / function-calling system might be simpler.</li>
          <li>You need the AI to run server-side, on your servers, with no human host. Use the model API plus your own tool layer.</li>
        </ul>

        <Callout label="Both is fine" tone="ok">
          <p>
            Some teams build a hosted AI product <em>and</em> ship an
            MCP server that exposes the same data to other assistants.
            The user picks where to live; you meet them there.
          </p>
        </Callout>
      </>
    ),
  },

  {
    id: 'mcp-vs',
    title: 'MCP vs alternatives',
    heading: 'Other ways to give AI new powers',
    content: (
      <>
        <CompareTable3
          cols={['MCP', 'Provider tools', 'Custom integration']}
          rows={[
            {
              feature: 'What it is',
              a: 'Open protocol; one server, many clients',
              b: 'Each provider has its own tool / function-calling format',
              c: 'You build everything: client, model loop, tools',
            },
            {
              feature: 'Who can use it',
              a: 'Any MCP-aware host (Claude Desktop, Claude Code, Cursor, more)',
              b: 'Only that provider\'s product',
              c: 'Only your app',
            },
            {
              feature: 'Authentication',
              a: 'Local trust (stdio) or OAuth 2.1 (HTTP)',
              b: 'Provider-managed',
              c: 'You design it',
            },
            {
              feature: 'UI / chat surface',
              a: 'Reuses the host\'s UI',
              b: 'Reuses the provider\'s UI',
              c: 'You build it',
            },
            {
              feature: 'Effort to ship',
              a: 'Hours for a small server',
              b: 'Hours for tools + model setup',
              c: 'Days to weeks',
            },
            {
              feature: 'Sharing with other apps',
              a: 'Yes, just install in another host',
              b: 'No',
              c: 'No',
            },
            {
              feature: 'Best for',
              a: 'Personal & team integrations',
              b: 'Provider-specific deep features',
              c: 'Stand-alone AI products',
            },
          ]}
        />

        <Callout label="The big picture" tone="info">
          <p>
            MCP doesn't replace provider tools or custom integrations.
            It complements them. Use MCP for the things that should
            work everywhere; use provider tools for things tied to one
            ecosystem.
          </p>
        </Callout>
      </>
    ),
  },

  {
    id: 'transports-compared',
    title: 'Transports compared',
    heading: 'stdio vs streamable HTTP',
    content: (
      <>
        <CompareTable3
          cols={['stdio', 'Streamable HTTP', 'Notes']}
          rows={[
            {
              feature: 'Where it runs',
              a: 'On the user\'s machine, launched by host',
              b: 'On a server (yours or someone else\'s)',
              c: 'stdio is local-only',
            },
            {
              feature: 'Setup',
              a: 'None. Host runs your script',
              b: 'Domain, certs, hosting, deploy pipeline',
              c: 'stdio wins here',
            },
            {
              feature: 'Auth',
              a: 'Trust the local user',
              b: 'OAuth 2.1 with PKCE',
              c: 'HTTP needs real auth',
            },
            {
              feature: 'Sharing',
              a: 'Each user installs the server',
              b: 'One instance serves many users',
              c: 'HTTP scales',
            },
            {
              feature: 'Latency',
              a: 'Lowest (in-process)',
              b: 'Network round-trip',
              c: 'stdio feels faster',
            },
            {
              feature: 'Use cases',
              a: 'Personal dev tools, file access, local DBs',
              b: 'SaaS connectors, multi-user team servers',
              c: '',
            },
            {
              feature: 'Distribution',
              a: 'npm package, dxt bundle, git clone',
              b: 'A URL the host points at',
              c: 'Different shipping models',
            },
          ]}
        />

        <Callout label="Default to stdio" tone="ok">
          <p>
            Almost every server starts as stdio. You only graduate to
            HTTP when you have a real reason: shared data, OAuth, or
            multi-user. Don't pick HTTP for "future-proofing"; pick
            stdio and rewrite later if you need to. You probably
            won't.
          </p>
        </Callout>
      </>
    ),
  },

  {
    id: 'host-support',
    title: 'Host compatibility',
    heading: 'Where your server runs today',
    content: (
      <>
        <CompareTable3
          cols={['Tools', 'Resources', 'Prompts']}
          rows={[
            { feature: 'Claude Desktop', a: 'Yes', b: 'Yes', c: 'Yes' },
            { feature: 'Claude Code (CLI / IDE)', a: 'Yes', b: 'Yes', c: 'Yes' },
            { feature: 'Cursor', a: 'Yes', b: 'Partial', c: 'Yes' },
            { feature: 'Zed', a: 'Yes', b: 'Yes', c: 'Yes' },
            { feature: 'VS Code (Copilot Chat with MCP)', a: 'Yes', b: 'Partial', c: 'Partial' },
            { feature: 'Sampling support', a: 'Yes (Claude Desktop)', b: 'n/a', c: 'n/a' },
            { feature: 'Roots support', a: 'Yes (most hosts)', b: 'n/a', c: 'n/a' },
            { feature: 'OAuth (HTTP transport)', a: 'Yes', b: 'n/a', c: 'n/a' },
          ]}
        />

        <Callout label="Test in two hosts" tone="warn">
          <p>
            Hosts differ in subtle ways: how they show tool errors,
            whether they cache resource lists, how they treat tool
            timeouts. Build for one, then test in a second before
            calling your server "done". Bugs hide between assumptions.
          </p>
        </Callout>
      </>
    ),
  },

  {
    id: 'pros-cons',
    title: 'Pros & cons',
    heading: 'An honest summary',
    content: (
      <>
        <ProsCons
          pros={[
            'Tiny scope. You write one server, the host handles the rest.',
            'Open standard. Your server works in many AI hosts.',
            'Reuses an AI surface users already love.',
            'Free hosting for stdio servers (the user\'s own machine).',
            'OAuth 2.1 path for serious multi-user deployments.',
            'Sampling lets your tools call back into the model when they need help.',
            'Mature SDKs in Node, Python, Rust, Go, Swift, and more.',
          ]}
          cons={[
            'Newer. Host support varies and the spec still moves.',
            'Tool descriptions matter a lot; bad descriptions = bad model decisions.',
            'You don\'t control the LLM, the prompt, or the conversation flow.',
            'Debugging is "watch the model decide". Inspector helps but it is not magic.',
            'OAuth-based HTTP servers add real complexity.',
            'Prompt-injection risk if your tools fetch arbitrary content.',
          ]}
        />
      </>
    ),
  },

  {
    id: 'closing',
    title: 'Closing thoughts',
    heading: 'Build small, ship soon',
    content: (
      <>
        <p>
          MCP is the friendliest way to give an AI assistant new
          powers in 2026. The protocol is small. The SDKs are good.
          The hosts are getting better every month. And the docs market
          for MCP is barely written. There's room for great servers
          and good guides.
        </p>
        <p>
          Pick the smallest version of your idea you can stand. Ship
          it as a stdio server first. Plug it into Claude. Watch
          yourself use it. Decide what's next from there.
        </p>

        <p className="footnote">
          MCP details and tooling in this guide are accurate as of
          early 2026. The spec, the SDKs, and host support are all
          moving fast. When in doubt, check{' '}
          <code>modelcontextprotocol.io</code> and{' '}
          <code>github.com/modelcontextprotocol</code>.
        </p>
      </>
    ),
  },
]
