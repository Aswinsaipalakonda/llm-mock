import Link from 'next/link'
import { Navbar } from '@/components/Navbar'

const sidebarLinks = [
  { href: '/docs/getting-started', label: 'Getting Started' },
  { href: '/docs/mock-anthropic', label: 'MockAnthropic' },
  { href: '/docs/mock-openai', label: 'MockOpenAI' },
  { href: '/docs/streaming', label: 'Streaming' },
  { href: '/docs/error-simulation', label: 'Error Simulation' },
]

const docsContent: Record<string, { title: string; content: string }> = {
  'getting-started': {
    title: 'Getting Started',
    content: `## Installation

\`\`\`bash
npm install --save-dev llm-mock
\`\`\`

## Quick Start — Anthropic

\`\`\`typescript
import { MockAnthropic } from 'llm-mock'

const client = new MockAnthropic()

// Set up pattern-matched responses
client.onPrompt('weather').reply('It will be sunny tomorrow.')
client.onPrompt(/translate/i).reply('Hola mundo!')

// Use exactly like the real Anthropic SDK
const response = await client.messages.create({
  model: 'claude-3-opus-20240229',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'What is the weather?' }],
})

console.log(response.content[0].text) // "It will be sunny tomorrow."
\`\`\`

## Quick Start — OpenAI

\`\`\`typescript
import { MockOpenAI } from 'llm-mock'

const client = new MockOpenAI()
client.onPrompt('joke').reply('Why did the chicken cross the road?')

const response = await client.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Tell me a joke' }],
})

console.log(response.choices[0].message.content)
// "Why did the chicken cross the road?"
\`\`\`

## Inspecting Calls

Both mock clients record every call made:

\`\`\`typescript
console.log(client.callCount) // 1
console.log(client.lastCall?.model) // "gpt-4"
console.log(client.calls) // Array of all call records
\`\`\`
`,
  },
  'mock-anthropic': {
    title: 'MockAnthropic',
    content: `## Overview

\`MockAnthropic\` is a drop-in replacement for the \`@anthropic-ai/sdk\` client.

## API

### Constructor

\`\`\`typescript
const client = new MockAnthropic({ defaultReply: 'Hello!' })
\`\`\`

### Pattern Matching

\`\`\`typescript
client.onPrompt('keyword').reply('Response for keyword')
client.onPrompt(/regex/).reply('Response for regex')
client.onSystemPrompt('assistant').reply('Response for system prompt')
client.onModel('claude-3-haiku-20240307').reply('Haiku response')
\`\`\`

### Streaming

\`\`\`typescript
client.onPrompt('stream').replyStream(['Hello', ' ', 'world!'])

const stream = client.messages.stream({
  model: 'claude-3-opus-20240229',
  messages: [{ role: 'user', content: 'stream this' }],
  max_tokens: 1024,
})

for await (const event of stream) {
  if (event.type === 'content_block_delta') {
    process.stdout.write(event.delta.text)
  }
}
\`\`\`

### Error Simulation

\`\`\`typescript
client.throwOn('forbidden', new Error('Rate limited'))
\`\`\`

### Response Shape

Returns the exact Anthropic message shape:

\`\`\`json
{
  "id": "msg_mock_abc123",
  "type": "message",
  "role": "assistant",
  "content": [{ "type": "text", "text": "..." }],
  "model": "claude-3-opus-20240229",
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "usage": { "input_tokens": 10, "output_tokens": 20 }
}
\`\`\`
`,
  },
  'mock-openai': {
    title: 'MockOpenAI',
    content: `## Overview

\`MockOpenAI\` is a drop-in replacement for the \`openai\` client.

## API

### Constructor

\`\`\`typescript
const client = new MockOpenAI({ defaultReply: 'Hello!' })
\`\`\`

### Pattern Matching

\`\`\`typescript
client.onPrompt('keyword').reply('Response for keyword')
client.onPrompt(/regex/).reply('Response for regex')
client.onSystemPrompt('assistant').reply('Response for system prompt')
client.onModel('gpt-3.5-turbo').reply('Turbo response')
\`\`\`

### Streaming

\`\`\`typescript
client.onPrompt('stream').replyStream(['Hello', ' ', 'world!'])

const stream = await client.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'stream this' }],
  stream: true,
})

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content ?? '')
}
\`\`\`

### Response Shape

Returns the exact OpenAI chat completion shape:

\`\`\`json
{
  "id": "chatcmpl_mock_abc123",
  "object": "chat.completion",
  "created": 1700000000,
  "model": "gpt-4",
  "choices": [{
    "index": 0,
    "message": { "role": "assistant", "content": "..." },
    "finish_reason": "stop",
    "logprobs": null
  }],
  "usage": { "prompt_tokens": 10, "completion_tokens": 20, "total_tokens": 30 }
}
\`\`\`
`,
  },
  streaming: {
    title: 'Streaming',
    content: `## Streaming Responses

Both \`MockAnthropic\` and \`MockOpenAI\` support streaming.

### Setting Up Stream Responses

\`\`\`typescript
// Anthropic
const anthropic = new MockAnthropic()
anthropic.onPrompt('story').replyStream([
  'Once upon ',
  'a time, ',
  'in a land ',
  'far away...',
])

// OpenAI
const openai = new MockOpenAI()
openai.onPrompt('story').replyStream([
  'Once upon ',
  'a time, ',
  'in a land ',
  'far away...',
])
\`\`\`

### Consuming Anthropic Streams

\`\`\`typescript
const stream = anthropic.messages.stream({
  model: 'claude-3-opus-20240229',
  messages: [{ role: 'user', content: 'Tell me a story' }],
  max_tokens: 1024,
})

for await (const event of stream) {
  if (event.type === 'content_block_delta') {
    process.stdout.write(event.delta.text)
  }
}
\`\`\`

### Consuming OpenAI Streams

\`\`\`typescript
const stream = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Tell me a story' }],
  stream: true,
})

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content
  if (content) process.stdout.write(content)
}
\`\`\`

### Stream Events

Anthropic streams yield events with \`type: "content_block_delta"\` containing text deltas, followed by a final \`type: "message_stop"\` event.

OpenAI streams yield chunks with \`choices[0].delta.content\` containing text, followed by a final chunk with \`finish_reason: "stop"\`.
`,
  },
  'error-simulation': {
    title: 'Error Simulation',
    content: `## Simulating Errors

Test your error handling by configuring mock clients to throw errors.

### Basic Error

\`\`\`typescript
const client = new MockAnthropic()
client.throwOn('forbidden')

try {
  await client.messages.create({
    model: 'claude-3-opus-20240229',
    messages: [{ role: 'user', content: 'This is forbidden' }],
    max_tokens: 1024,
  })
} catch (error) {
  console.log(error.message) // "Mock error for pattern: forbidden"
}
\`\`\`

### Custom Error

\`\`\`typescript
const rateLimitError = new Error('Rate limit exceeded')
client.throwOn('rapid', rateLimitError)
\`\`\`

### Testing with Vitest

\`\`\`typescript
import { describe, it, expect } from 'vitest'
import { MockAnthropic } from 'llm-mock'

describe('error handling', () => {
  it('handles API errors gracefully', async () => {
    const client = new MockAnthropic()
    client.throwOn('bad-input', new Error('400 Bad Request'))

    await expect(
      myFunction(client, 'bad-input data')
    ).rejects.toThrow('400 Bad Request')
  })
})
\`\`\`
`,
  },
}

function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold mt-8 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-10 mb-4">$1</h2>')
    .replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      '<pre class="bg-gray-950 text-gray-300 rounded-lg p-4 text-sm overflow-x-auto my-4 leading-relaxed"><code>$2</code></pre>',
    )
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">$1</code>')
    .replace(/^(?!<[hp])(.*\S.*)$/gm, '<p class="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">$1</p>')
}

export default function DocsPage({ params }: { params: { slug?: string[] } }) {
  const slug = params.slug?.[0] ?? 'getting-started'
  const doc = docsContent[slug]

  if (!doc) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400">
            The documentation page you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/docs/getting-started" className="text-brand-600 hover:underline mt-4 inline-block">
            Go to Getting Started
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-12 flex gap-12">
        {/* Sidebar */}
        <aside className="hidden md:block w-56 shrink-0">
          <nav className="sticky top-24 space-y-1">
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                  link.href === `/docs/${slug}`
                    ? 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <h1 className="text-4xl font-bold mb-8">{doc.title}</h1>
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(doc.content) }}
          />
        </main>
      </div>
    </div>
  )
}
