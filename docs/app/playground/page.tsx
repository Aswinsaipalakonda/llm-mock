'use client'

import { useState } from 'react'
import { Navbar } from '@/components/Navbar'

const defaultCode = `import { MockAnthropic } from 'llm-mock'

const client = new MockAnthropic()
client.onPrompt('hello').reply('Hi there!')
client.onPrompt(/weather/i).reply('Sunny and 72F')

// Try changing the message content below:
const response = await client.messages.create({
  model: 'claude-3-opus-20240229',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'hello world' }],
})

console.log(response.content[0].text)
// Output: "Hi there!"`

export default function Playground() {
  const [code] = useState(defaultCode)

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Playground</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Explore how llm-mock works. Copy these examples into your project to try them out.
        </p>

        <div className="grid gap-8">
          {/* Code editor area */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-lg">Example Code</h2>
              <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                TypeScript
              </span>
            </div>
            <pre className="bg-gray-950 text-gray-300 rounded-lg p-6 text-sm overflow-x-auto leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>

          {/* Usage examples */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
              <h3 className="font-semibold mb-3">Pattern Matching</h3>
              <pre className="bg-gray-950 text-gray-300 rounded-lg p-4 text-xs overflow-x-auto">
                <code>{`client.onPrompt('keyword').reply('...')
client.onPrompt(/regex/).reply('...')
client.onSystemPrompt('text').reply('...')
client.onModel('gpt-4').reply('...')`}</code>
              </pre>
            </div>

            <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
              <h3 className="font-semibold mb-3">Streaming</h3>
              <pre className="bg-gray-950 text-gray-300 rounded-lg p-4 text-xs overflow-x-auto">
                <code>{`client
  .onPrompt('stream')
  .replyStream(['Hello', ' ', 'world!'])

const stream = client.messages.stream({
  model: 'claude-3-opus-20240229',
  messages: [{ role: 'user', content: 'stream' }],
  max_tokens: 1024,
})`}</code>
              </pre>
            </div>

            <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
              <h3 className="font-semibold mb-3">Error Testing</h3>
              <pre className="bg-gray-950 text-gray-300 rounded-lg p-4 text-xs overflow-x-auto">
                <code>{`client.throwOn('bad-input', new Error('400'))

// Also works with regex:
client.throwOn(/error/i)`}</code>
              </pre>
            </div>

            <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
              <h3 className="font-semibold mb-3">Call Inspection</h3>
              <pre className="bg-gray-950 text-gray-300 rounded-lg p-4 text-xs overflow-x-auto">
                <code>{`console.log(client.callCount)  // 3
console.log(client.lastCall)   // CallRecord
console.log(client.calls)      // CallRecord[]
client.reset()                 // clear history`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
