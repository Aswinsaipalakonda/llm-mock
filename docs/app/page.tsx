import Link from 'next/link'
import { Navbar } from '@/components/Navbar'

const installCmd = 'npm install --save-dev llm-mock'

const beforeCode = `import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

const response = await client.messages.create({
  model: 'claude-3-opus-20240229',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello!' }],
})

console.log(response.content[0].text)
// Makes a real API call — slow, costs money,
// flaky in CI, needs API key`

const afterCode = `import { MockAnthropic } from 'llm-mock'

const client = new MockAnthropic()
client.onPrompt('Hello').reply('Hi there!')

const response = await client.messages.create({
  model: 'claude-3-opus-20240229',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello!' }],
})

console.log(response.content[0].text)
// "Hi there!" — instant, free, deterministic`

const features = [
  {
    title: 'Zero Config',
    description: 'Works out of the box with no API keys, no network calls, and no setup. Just import and start testing.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    title: 'Pattern Matching',
    description: 'Match requests by keyword, regex, system prompt, or model name. Register rules and first match wins.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    gradient: 'from-purple-500 to-violet-600',
  },
  {
    title: 'Both SDKs',
    description: 'Drop-in replacements for both OpenAI and Anthropic client libraries with identical API surfaces.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Streaming',
    description: 'Full streaming support with async iterables. Test your real-time streaming handlers with no changes.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
      </svg>
    ),
    gradient: 'from-emerald-500 to-teal-600',
  },
]

const stats = [
  { value: '0', label: 'Runtime Deps' },
  { value: '39', label: 'Tests Passing' },
  { value: '2', label: 'SDK Mocks' },
  { value: '<1s', label: 'Test Suite' },
]

const usageExample = `import { describe, it, expect } from 'vitest'
import { MockAnthropic } from 'llm-mock'

describe('my AI feature', () => {
  it('returns a summary', async () => {
    const client = new MockAnthropic()
    client.onPrompt('summarize').reply('Brief summary.')

    const res = await client.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1024,
      messages: [{ role: 'user', content: 'summarize this' }],
    })

    expect(res.content[0].text).toBe('Brief summary.')
    expect(client.callCount).toBe(1)
  })
})`

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden">
      <Navbar />

      {/* Hero background glow */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-emerald-500/10 blur-3xl" />
        <div className="absolute top-[10%] left-[10%] w-[300px] h-[300px] rounded-full bg-purple-500/5 blur-3xl" />
        <div className="absolute top-[5%] right-[10%] w-[250px] h-[250px] rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-5 sm:px-6 pt-20 sm:pt-28 lg:pt-36 pb-16 sm:pb-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-200 dark:border-purple-800/40 bg-purple-50/80 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 text-xs sm:text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          v0.1.0 — Now available on npm
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
          Test your LLM apps
          <br />
          <span className="gradient-text">instantly.</span>
        </h1>

        <p className="text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Drop-in mock clients for OpenAI and Anthropic SDKs.
          Deterministic, pattern-matched responses in the exact SDK shape.
          No API keys. No network. No cost.
        </p>

        {/* Install command */}
        <div className="inline-flex items-center gap-3 rounded-xl px-5 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base code-block font-mono mb-10">
          <span className="text-purple-400">$</span>
          <code className="text-zinc-300">{installCmd}</code>
          <div className="w-px h-4 bg-zinc-700 mx-1" />
          <button
            className="text-zinc-500 hover:text-purple-400 transition-colors shrink-0"
            title="Copy to clipboard"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
          <Link
            href="/docs/getting-started"
            className="btn-primary text-white px-7 py-3 rounded-xl font-semibold text-sm sm:text-base w-full sm:w-auto text-center"
          >
            Get Started
          </Link>
          <a
            href="https://github.com/Aswinsaipalakonda/llm-mock"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary px-7 py-3 rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            View on GitHub
          </a>
        </div>
      </section>

      {/* Stats bar */}
      <section className="max-w-4xl mx-auto px-5 sm:px-6 pb-16 sm:pb-24">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center py-5 sm:py-6 rounded-2xl bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/40"
            >
              <div className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</div>
              <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Before / After comparison */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 pb-20 sm:pb-28">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
            See the difference
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto text-sm sm:text-base">
            Replace your real SDK client with a mock in one line. Same API, zero cost.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          {/* Before */}
          <div className="rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 bg-red-500/10 dark:bg-red-500/5 border border-red-200/40 dark:border-red-800/20 rounded-t-2xl">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
                Before &mdash; Real API
              </span>
            </div>
            <pre className="code-block rounded-t-none rounded-b-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed overflow-x-auto border-t-0">
              <code className="text-zinc-400">{beforeCode}</code>
            </pre>
          </div>

          {/* After */}
          <div className="rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-200/40 dark:border-emerald-800/20 rounded-t-2xl">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                After &mdash; llm-mock
              </span>
            </div>
            <pre className="code-block rounded-t-none rounded-b-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed overflow-x-auto border-t-0">
              <code className="text-zinc-400">{afterCode}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 pb-20 sm:pb-28">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
            Built for developer experience
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto text-sm sm:text-base">
            Everything you need to test LLM integrations with confidence.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="glow-card rounded-2xl p-6 bg-white/60 dark:bg-zinc-900/40"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-4`}>
                {feature.icon}
              </div>
              <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 pb-20 sm:pb-28">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
            Three steps. That&apos;s it.
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto text-sm sm:text-base">
            No configuration files. No complex setup. Just write your test.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {[
            {
              step: '01',
              title: 'Create a mock',
              code: "const client = new MockAnthropic()",
              desc: 'Instantiate a mock client. Same constructor, no API key needed.',
            },
            {
              step: '02',
              title: 'Set up patterns',
              code: "client.onPrompt('hello').reply('Hi!')",
              desc: 'Register what the mock should respond to. Keyword, regex, or model.',
            },
            {
              step: '03',
              title: 'Use in your tests',
              code: "expect(res.content[0].text).toBe('Hi!')",
              desc: 'Call it like the real SDK. Assert on responses and recorded calls.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="relative glow-card rounded-2xl p-6 sm:p-7 bg-white/60 dark:bg-zinc-900/40"
            >
              <div className="text-5xl sm:text-6xl font-extrabold text-zinc-100 dark:text-zinc-800/60 absolute top-4 right-5 select-none">
                {item.step}
              </div>
              <div className="relative">
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">{item.desc}</p>
                <code className="inline-block text-xs sm:text-sm font-mono px-3 py-1.5 rounded-lg bg-zinc-950 text-purple-300 border border-zinc-800/60">
                  {item.code}
                </code>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Full example */}
      <section className="max-w-4xl mx-auto px-5 sm:px-6 pb-20 sm:pb-28">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
            Real-world example
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto text-sm sm:text-base">
            A complete Vitest test using llm-mock. Copy, paste, and run.
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden gradient-border">
          <div className="flex items-center gap-2 px-5 py-3 bg-zinc-950 border-b border-zinc-800/50">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
            </div>
            <span className="text-xs text-zinc-500 font-mono ml-2">my-feature.test.ts</span>
          </div>
          <pre className="bg-zinc-950 p-4 sm:p-6 text-xs sm:text-sm leading-relaxed overflow-x-auto">
            <code className="text-zinc-400">{usageExample}</code>
          </pre>
        </div>
      </section>

      {/* Supported SDKs */}
      <section className="max-w-4xl mx-auto px-5 sm:px-6 pb-20 sm:pb-28">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
            Works with the SDKs you use
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          {/* Anthropic */}
          <div className="glow-card rounded-2xl p-6 sm:p-8 bg-white/60 dark:bg-zinc-900/40 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-white mx-auto mb-4 text-xl font-bold">
              A
            </div>
            <h3 className="font-bold text-lg mb-1">Anthropic</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Claude SDK &mdash; messages.create &amp; messages.stream</p>
            <code className="text-xs font-mono text-purple-400 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800/50">
              MockAnthropic
            </code>
          </div>

          {/* OpenAI */}
          <div className="glow-card rounded-2xl p-6 sm:p-8 bg-white/60 dark:bg-zinc-900/40 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white mx-auto mb-4 text-xl font-bold">
              O
            </div>
            <h3 className="font-bold text-lg mb-1">OpenAI</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">GPT SDK &mdash; chat.completions.create with stream support</p>
            <code className="text-xs font-mono text-emerald-400 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800/50">
              MockOpenAI
            </code>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-3xl mx-auto px-5 sm:px-6 pb-20 sm:pb-28 text-center">
        <div className="rounded-3xl gradient-border bg-white/40 dark:bg-zinc-900/30 p-8 sm:p-12 md:p-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Start testing <span className="gradient-text">smarter</span>
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-8 text-sm sm:text-base leading-relaxed">
            Stop paying for API calls in your test suite.
            llm-mock gives you instant, deterministic results with zero configuration.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/docs/getting-started"
              className="btn-primary text-white px-8 py-3.5 rounded-xl font-semibold text-sm sm:text-base"
            >
              Read the Docs
            </Link>
            <a
              href="https://github.com/Aswinsaipalakonda/llm-mock"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary px-8 py-3.5 rounded-xl font-semibold text-sm sm:text-base"
            >
              Star on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200/60 dark:border-zinc-800/40">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-emerald-400 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                llm-mock &middot; MIT License
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <Link
                href="/docs/getting-started"
                className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
              >
                Docs
              </Link>
              <a
                href="https://github.com/Aswinsaipalakonda/llm-mock"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://www.npmjs.com/package/llm-mock"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
              >
                npm
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
