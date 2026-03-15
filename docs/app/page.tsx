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
    description: 'Works out of the box. No API keys, no network, no setup. Just import and test.',
    icon: '\u26A1',
  },
  {
    title: 'Pattern Matching',
    description:
      'Match requests by keyword, regex, system prompt, or model name. First match wins.',
    icon: '\uD83C\uDFAF',
  },
  {
    title: 'Both SDKs',
    description: 'Drop-in replacements for both OpenAI and Anthropic client libraries.',
    icon: '\uD83D\uDD00',
  },
  {
    title: 'Streaming',
    description: 'Full streaming support with async iterables. Test your streaming handlers too.',
    icon: '\uD83C\uDF0A',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
          Test your LLM apps instantly.
          <br />
          <span className="text-brand-500">Zero API calls.</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
          Drop-in mock clients for OpenAI and Anthropic SDKs. Deterministic, pattern-matched
          responses in the exact SDK shape. Perfect for unit tests and CI.
        </p>

        {/* Install command */}
        <div className="inline-flex items-center gap-3 bg-gray-900 dark:bg-gray-800 text-gray-100 rounded-lg px-6 py-3 font-mono text-sm mb-12">
          <span className="text-gray-500">$</span>
          <code>{installCmd}</code>
          <button
            className="text-gray-500 hover:text-white transition-colors"
            title="Copy to clipboard"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>

        {/* CTA */}
        <div className="flex gap-4 justify-center">
          <Link
            href="/docs/getting-started"
            className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Get Started
          </Link>
          <a
            href="https://github.com/Aswinsaipalakonda/llm-mock"
            className="border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            GitHub
          </a>
        </div>
      </section>

      {/* Before / After comparison */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-center mb-8">Before &amp; After</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm font-medium text-red-500 mb-2 uppercase tracking-wide">
              Before — Real API
            </div>
            <pre className="bg-gray-950 text-gray-300 rounded-lg p-4 text-sm overflow-x-auto leading-relaxed">
              <code>{beforeCode}</code>
            </pre>
          </div>
          <div>
            <div className="text-sm font-medium text-green-500 mb-2 uppercase tracking-wide">
              After — llm-mock
            </div>
            <pre className="bg-gray-950 text-gray-300 rounded-lg p-4 text-sm overflow-x-auto leading-relaxed">
              <code>{afterCode}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="border border-gray-200 dark:border-gray-800 rounded-lg p-6"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-sm text-gray-500">
          <span>MIT License</span>
          <div className="flex gap-6">
            <a
              href="https://github.com/Aswinsaipalakonda/llm-mock"
              className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/llm-mock"
              className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              npm
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
