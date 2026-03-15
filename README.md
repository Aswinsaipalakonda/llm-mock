<div align="center">

<br/>

<img src="https://img.shields.io/badge/llm--mock-v0.1.0-blue?style=for-the-badge" alt="version" />

# llm-mock

### Drop-in mock clients for OpenAI and Anthropic SDKs

Test your LLM-powered applications without making real API calls.<br/>
Deterministic, pattern-matched fake responses in the exact SDK response shape.

<br/>

[![npm version](https://img.shields.io/npm/v/llm-mock?style=flat-square&color=cb3837&logo=npm&logoColor=white)](https://www.npmjs.com/package/llm-mock)
[![npm downloads](https://img.shields.io/npm/dm/llm-mock?style=flat-square&color=cb3837&logo=npm&logoColor=white)](https://www.npmjs.com/package/llm-mock)
[![CI](https://img.shields.io/github/actions/workflow/status/Aswinsaipalakonda/llm-mock/test.yml?style=flat-square&logo=github&label=tests)](https://github.com/Aswinsaipalakonda/llm-mock/actions/workflows/test.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)](./LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen?style=flat-square)](./packages/llm-mock/package.json)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](https://github.com/Aswinsaipalakonda/llm-mock/pulls)

<br/>

[Getting Started](#-getting-started) &nbsp;&bull;&nbsp;
[Architecture](#-architecture) &nbsp;&bull;&nbsp;
[API Reference](#-api-reference) &nbsp;&bull;&nbsp;
[Examples](#-examples) &nbsp;&bull;&nbsp;
[Docs Site](https://llm-mock.vercel.app) &nbsp;&bull;&nbsp;
[Contributing](#-contributing)

<br/>

</div>

---

## Why llm-mock?

| Problem with real API calls | How llm-mock solves it |
|:---|:---|
| **Slow** — network round-trips of 1-30s per call | **Instant** — in-memory, zero latency |
| **Expensive** — costs real money per token | **Free** — no tokens consumed ever |
| **Non-deterministic** — different answer each time | **Deterministic** — same pattern always returns same reply |
| **Flaky in CI** — rate limits, network errors, key rotation | **Reliable** — no network, no keys, no flakes |
| **Requires API keys** — can't commit to repos | **Zero config** — no env vars, no secrets |

---

## Table of Contents

- [Getting Started](#-getting-started)
- [Architecture](#-architecture)
- [How It Works](#-how-it-works)
- [API Reference](#-api-reference)
  - [MockAnthropic](#mockanthropic)
  - [MockOpenAI](#mockopenai)
  - [Shared API](#shared-api-both-clients)
  - [Types](#types)
- [Examples](#-examples)
  - [Anthropic Mock](#anthropic)
  - [OpenAI Mock](#openai)
  - [Pattern Matching](#pattern-matching)
  - [Streaming](#streaming)
  - [Error Simulation](#error-simulation)
  - [Call Inspection](#call-inspection)
  - [Using with Vitest](#using-with-vitest)
  - [Using with Jest](#using-with-jest)
- [Response Shapes](#-response-shapes)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

---

## :rocket: Getting Started

### Installation

```bash
# npm
npm install --save-dev llm-mock

# yarn
yarn add -D llm-mock

# pnpm
pnpm add -D llm-mock
```

### 30-Second Quick Start

```typescript
import { MockAnthropic } from 'llm-mock'

// 1. Create a mock client (replaces real Anthropic SDK)
const client = new MockAnthropic()

// 2. Define what it should respond to
client.onPrompt('weather').reply('Sunny and 72F.')

// 3. Use it exactly like the real SDK
const response = await client.messages.create({
  model: 'claude-3-opus-20240229',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'What is the weather?' }],
})

console.log(response.content[0].text)  // "Sunny and 72F."
console.log(response.type)             // "message"
console.log(response.stop_reason)      // "end_turn"
```

> Your production code calls `client.messages.create(...)` — that same call works identically whether `client` is the real `Anthropic` or `MockAnthropic`. Swap it in your test setup, and everything just works.

---

## :building_construction: Architecture

### High-Level Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                         YOUR TEST FILE                               │
│                                                                      │
│   const client = new MockAnthropic()                                 │
│   client.onPrompt('weather').reply('Sunny')                          │
│   const res = await client.messages.create({ messages, model })      │
│                                                                      │
└──────────────────────┬───────────────────────────────────────────────┘
                       │
                       │  messages.create(params) or
                       │  messages.stream(params)
                       │
                       ▼
  ┌──────────────────────────────────────────────────────────────────┐
  │               MockAnthropic / MockOpenAI                         │
  │                                                                  │
  │   Fluent API: onPrompt() → reply() → stores MockPattern[]       │
  │   Receives SDK-shaped call params                                │
  │                                                                  │
  │   ┌─────────────┐                                                │
  │   │ _recordCall  │──────────────────────────┐                    │
  │   └──────┬──────┘                           │                    │
  │          │                                  ▼                    │
  │          │                     ┌──────────────────────┐          │
  │          │                     │   CallInspector       │          │
  │          │                     │   (inspector.ts)      │          │
  │          │                     │                       │          │
  │          │                     │   .calls              │          │
  │          │                     │   .lastCall           │          │
  │          │                     │   .callCount          │          │
  │          │                     │   .reset()            │          │
  │          │                     └──────────────────────┘          │
  │          │                                                       │
  │          ▼                                                       │
  │   ┌─────────────────────────────────────────┐                    │
  │   │           findMatch()                    │                    │
  │   │           (matcher.ts)                   │                    │
  │   │                                          │                    │
  │   │   Iterates patterns[] in order:          │                    │
  │   │     1. model match                       │                    │
  │   │     2. systemPrompt match                │                    │
  │   │     3. contains (keyword/regex) match    │                    │
  │   │                                          │                    │
  │   │   Returns: MockPattern | undefined       │                    │
  │   └─────────────┬───────────────────────────┘                    │
  │                 │                                                 │
  │        ┌────────┴────────────────┐                                │
  │        │                         │                                │
  │        ▼                         ▼                                │
  │   Match found?              throwError?                           │
  │   ┌──────┐  ┌──────┐       ┌──────────┐                          │
  │   │  No  │  │ Yes  │       │  throw!  │                          │
  │   └──┬───┘  └──┬───┘       └──────────┘                          │
  │      │         │                                                  │
  │      ▼         ▼                                                  │
  │   Default    Has replyStream?                                     │
  │   Reply    ┌─────┴──────┐                                         │
  │      │     │ No         │ Yes                                     │
  │      │     ▼            ▼                                         │
  │      │  ┌──────────┐  ┌────────────────┐                          │
  │      │  │ responder │  │    stream.ts   │                          │
  │      └──│  .ts      │  │                │                          │
  │         │           │  │ Async generator│                          │
  │         │ Builds a  │  │ yields chunks  │                          │
  │         │ complete  │  │ one-by-one     │                          │
  │         │ response  │  │                │                          │
  │         │ object    │  │ Final: stop    │                          │
  │         └─────┬─────┘  └───────┬────────┘                          │
  │               │                │                                   │
  └───────────────┼────────────────┼───────────────────────────────────┘
                  │                │
                  ▼                ▼
         ┌───────────────┐  ┌──────────────────────┐
         │  SDK-shaped   │  │  AsyncIterable of     │
         │  response     │  │  SDK-shaped stream    │
         │  object       │  │  events               │
         └───────────────┘  └──────────────────────┘
```

### Internal Call Flow (Step by Step)

```
     ┌─────────┐
     │  START  │   client.messages.create({ model, messages, ... })
     └────┬────┘
          │
          ▼
  ┌───────────────┐    Logs: messages, model, system,
  │  _recordCall  │    tools, timestamp → CallInspector
  └───────┬───────┘
          │
          ▼
  ┌───────────────┐    Iterates patterns[] in registration
  │  findMatch()  │    order. First match wins.
  └───────┬───────┘
          │
    ┌─────┴──────┐
    │            │
    ▼            ▼
  match?      no match
    │            │
    │            ▼
    │     ┌──────────────┐
    │     │ Use default  │  config.defaultReply or
    │     │    reply     │  hardcoded fallback string
    │     └──────┬───────┘
    │            │
    ▼            │
  ┌──────────┐   │
  │throwError│   │
  │ set?     │   │
  └──┬───┬───┘   │
  Yes│   │No     │
     │   │       │
     ▼   ▼       │
  throw  Has     │
  error  reply   │
         Stream? │
     ┌───┴───┐   │
     │       │   │
     ▼       ▼   │
   Yes      No   │
     │       │   │
     ▼       │   │
  stream.ts  │   │
  (async     │   │
  generator) │   │
     │       ▼   │
     │  responder.ts
     │  (builds    ◄──┘
     │  response
     │  object)
     │       │
     ▼       ▼
  ┌──────────────┐
  │   RESPONSE   │   Returned to your test code
  └──────────────┘
```

### Module Dependency Graph

```
index.ts (public exports)
  │
  ├── MockAnthropic.ts ─────┬── matcher.ts
  │                         ├── responder.ts
  │                         ├── stream.ts
  │                         ├── inspector.ts
  │                         └── types.ts
  │
  ├── MockOpenAI.ts ────────┬── matcher.ts
  │                         ├── responder.ts
  │                         ├── stream.ts
  │                         ├── inspector.ts
  │                         └── types.ts
  │
  └── types.ts (shared interfaces)
```

### What Each Module Does

| Module | Responsibility | Pure? | Lines |
|:---|:---|:---:|:---:|
| **`types.ts`** | Shared TypeScript interfaces (`MockPattern`, `CallRecord`, `MockConfig`, SDK response shapes) | - | 65 |
| **`matcher.ts`** | Scans messages against pattern rules. First match wins. Supports keyword (case-insensitive), RegExp, system prompt, and model matching | Yes | 52 |
| **`responder.ts`** | Two pure functions that build exact-shape response objects for Anthropic and OpenAI SDKs | Yes | 40 |
| **`stream.ts`** | Async generators that yield SDK-formatted stream events chunk-by-chunk | Yes | 54 |
| **`inspector.ts`** | `CallInspector` class — append-only log of every API call for test assertions | No | 24 |
| **`MockAnthropic.ts`** | Fluent builder + `messages.create()` / `messages.stream()` interface matching Anthropic SDK | No | 166 |
| **`MockOpenAI.ts`** | Fluent builder + `chat.completions.create()` interface matching OpenAI SDK, with `stream: true` support | No | 157 |
| **`index.ts`** | Re-exports all public classes, functions, and types | - | 14 |

---

## :gear: How It Works

### 1. Pattern Registration (Fluent API)

When you chain `.onPrompt('keyword').reply('text')`, internally:

```
onPrompt('weather')  →  _pendingPattern = { contains: 'weather' }
.reply('Sunny')      →  _pendingPattern.reply = 'Sunny'
                     →  flush to patterns[] array
                     →  patterns = [{ contains: 'weather', reply: 'Sunny' }]
```

Multiple patterns are stored in order. **First match wins** at call time.

### 2. Call Handling Pipeline

When `client.messages.create(params)` is called:

| Step | Action | Module |
|:---:|:---|:---|
| 1 | Record the call (messages, model, system, tools, timestamp) | `inspector.ts` |
| 2 | Run `findMatch(messages, systemPrompt, model, patterns)` | `matcher.ts` |
| 3a | If match has `throwError` → throw the error | Mock client |
| 3b | If match has `replyStream` → return async generator | `stream.ts` |
| 3c | If match has `reply` → build full response object | `responder.ts` |
| 3d | No match → build response with `config.defaultReply` or hardcoded default | `responder.ts` |

### 3. Pattern Matching Priority

The `findMatch()` function processes patterns **in registration order**. Within each pattern, it checks:

| Priority | Matcher | How it matches |
|:---:|:---|:---|
| 1 | `pattern.model` | Exact string comparison with `params.model` |
| 2 | `pattern.systemPrompt` | Keyword (case-insensitive) or regex against system prompt text |
| 3 | `pattern.contains` | Keyword (case-insensitive) or regex against all message content concatenated |

### 4. Difference Between MockAnthropic and MockOpenAI

| | MockAnthropic | MockOpenAI |
|:---|:---|:---|
| **SDK method** | `messages.create(params)` | `chat.completions.create(params)` |
| **Stream method** | `messages.stream(params)` | `chat.completions.create({stream: true})` |
| **System prompt** | `params.system` (string or content blocks) | `messages` array entry with `role: 'system'` |
| **Response shape** | `AnthropicMessage` | `OpenAIChatCompletion` |
| **Stream events** | `content_block_delta` + `message_stop` | `delta.content` chunks + `finish_reason: 'stop'` |

---

## :book: API Reference

### MockAnthropic

```typescript
import { MockAnthropic } from 'llm-mock'
```

#### Constructor

| Signature | Description |
|:---|:---|
| `new MockAnthropic()` | Create with default config |
| `new MockAnthropic({ defaultReply: '...' })` | Custom fallback reply when no pattern matches |

#### SDK Interface

| Method | Returns | Description |
|:---|:---|:---|
| `messages.create(params)` | `Promise<AnthropicMessage>` | Standard message creation — returns full response object |
| `messages.stream(params)` | `AsyncIterable<AnthropicStreamEvent>` | Streaming — yields `content_block_delta` events then `message_stop` |

---

### MockOpenAI

```typescript
import { MockOpenAI } from 'llm-mock'
```

#### Constructor

| Signature | Description |
|:---|:---|
| `new MockOpenAI()` | Create with default config |
| `new MockOpenAI({ defaultReply: '...' })` | Custom fallback reply when no pattern matches |

#### SDK Interface

| Method | Returns | Description |
|:---|:---|:---|
| `chat.completions.create(params)` | `Promise<OpenAIChatCompletion>` | Standard chat completion — returns full response object |
| `chat.completions.create({ stream: true, ... })` | `AsyncIterable<OpenAIStreamChunk>` | Streaming mode — yields delta chunks then `finish_reason: 'stop'` |

---

### Shared API (Both Clients)

#### Pattern Registration

All pattern methods return `this` for fluent chaining.

| Method | Description | Example |
|:---|:---|:---|
| `.onPrompt(pattern)` | Match keyword or regex in any message content | `.onPrompt('weather')` `.onPrompt(/\d+/)` |
| `.onSystemPrompt(pattern)` | Match keyword or regex in system prompt | `.onSystemPrompt('helpful')` |
| `.onModel(model)` | Match exact model name | `.onModel('gpt-4')` |
| `.onTool(toolName)` | Match tool name | `.onTool('get_weather')` |
| `.reply(text)` | Set static reply for the preceding pattern | `.reply('Sunny and 72F')` |
| `.replyStream(chunks)` | Set streaming reply chunks | `.replyStream(['Hello', ' World'])` |
| `.throwOn(pattern, error?)` | Throw error when pattern matches | `.throwOn('forbidden', new Error('403'))` |

#### Call Inspection

| Property / Method | Type | Description |
|:---|:---|:---|
| `.calls` | `CallRecord[]` | Array of all recorded calls (defensive copy) |
| `.lastCall` | `CallRecord \| undefined` | Most recent call record |
| `.callCount` | `number` | Total number of calls made |
| `.reset()` | `void` | Clears all call history **and** registered patterns |

---

### Types

#### `MockPattern`

```typescript
interface MockPattern {
  contains?: string | RegExp     // Match in message content
  systemPrompt?: string | RegExp // Match in system prompt
  model?: string                 // Exact model name match
  reply?: string                 // Static reply text
  replyStream?: string[]         // Streaming reply chunks
  throwError?: Error             // Error to throw
  toolName?: string              // Tool name match
  toolReply?: unknown            // Tool call reply
}
```

#### `CallRecord`

```typescript
interface CallRecord {
  messages: Array<{
    role: string
    content: string | Array<{ type: string; text?: string }>
  }>
  model: string
  system?: string
  tools?: Array<{ name: string; [key: string]: unknown }>
  timestamp: number              // Date.now() at call time
}
```

#### `MockConfig`

```typescript
interface MockConfig {
  defaultReply?: string          // Fallback when no pattern matches
}
```

#### `AnthropicMessage`

```typescript
interface AnthropicMessage {
  id: string                     // "msg_mock_<random>"
  type: 'message'
  role: 'assistant'
  content: Array<{ type: 'text'; text: string }>
  model: string
  stop_reason: 'end_turn' | 'tool_use' | 'max_tokens' | 'stop_sequence'
  stop_sequence: string | null
  usage: { input_tokens: number; output_tokens: number }
}
```

#### `OpenAIChatCompletion`

```typescript
interface OpenAIChatCompletion {
  id: string                     // "chatcmpl_mock_<random>"
  object: 'chat.completion'
  created: number                // Unix timestamp
  model: string
  choices: Array<{
    index: number
    message: { role: 'assistant'; content: string }
    finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter'
    logprobs: null
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}
```

---

## :test_tube: Examples

### Anthropic

```typescript
import { MockAnthropic } from 'llm-mock'

const client = new MockAnthropic()
client.onPrompt('weather').reply('Sunny and 72F.')
client.onPrompt(/translate/i).reply('Hola mundo!')

const response = await client.messages.create({
  model: 'claude-3-opus-20240229',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'What is the weather?' }],
})

console.log(response.content[0].text)  // "Sunny and 72F."
console.log(response.type)             // "message"
console.log(response.id)               // "msg_mock_abc123..."
console.log(response.stop_reason)      // "end_turn"
console.log(response.usage)            // { input_tokens: 10, output_tokens: 20 }
```

### OpenAI

```typescript
import { MockOpenAI } from 'llm-mock'

const client = new MockOpenAI()
client.onPrompt('joke').reply('Why did the chicken cross the road?')

const response = await client.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Tell me a joke' }],
})

console.log(response.choices[0].message.content) // "Why did the chicken cross the road?"
console.log(response.object)                     // "chat.completion"
console.log(response.id)                          // "chatcmpl_mock_abc123..."
console.log(response.choices[0].finish_reason)   // "stop"
console.log(response.usage)                       // { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 }
```

### Pattern Matching

```typescript
const client = new MockAnthropic()

// Keyword match (case-insensitive)
client.onPrompt('weather').reply('Sunny and 72F.')

// Regex match
client.onPrompt(/\d{3}-\d{4}/).reply('That looks like a phone number.')

// System prompt match
client.onSystemPrompt('helpful assistant').reply('I am very helpful!')

// Model-specific match
client.onModel('claude-3-haiku-20240307').reply('Fast and light response.')

// First match wins — order matters!
client.onPrompt('hello').reply('First rule wins')
client.onPrompt('hello').reply('This is never reached')
```

### Streaming

#### Anthropic Streaming

```typescript
const client = new MockAnthropic()
client.onPrompt('story').replyStream(['Once upon ', 'a time, ', 'in a land ', 'far away...'])

const stream = client.messages.stream({
  model: 'claude-3-opus-20240229',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Tell me a story' }],
})

for await (const event of stream) {
  if (event.type === 'content_block_delta') {
    process.stdout.write(event.delta.text)
    // Yields: "Once upon " → "a time, " → "in a land " → "far away..."
  }
  if (event.type === 'message_stop') {
    console.log('\n[Stream ended]')
  }
}
```

#### OpenAI Streaming

```typescript
const client = new MockOpenAI()
client.onPrompt('story').replyStream(['Once upon ', 'a time, ', 'in a land ', 'far away...'])

const stream = await client.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Tell me a story' }],
  stream: true,
})

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content
  if (content) {
    process.stdout.write(content)
  }
  if (chunk.choices[0]?.finish_reason === 'stop') {
    console.log('\n[Stream ended]')
  }
}
```

### Error Simulation

```typescript
const client = new MockAnthropic()

// Throw a custom error when "forbidden" appears in any message
client.throwOn('forbidden', new Error('API rate limit exceeded'))

try {
  await client.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 1024,
    messages: [{ role: 'user', content: 'This is forbidden content' }],
  })
} catch (error) {
  console.log(error.message) // "API rate limit exceeded"
}

// Throw a default error (auto-generated message)
client.throwOn(/badrequest/i)
```

### Call Inspection

```typescript
const client = new MockAnthropic()

await client.messages.create({
  model: 'claude-3-opus-20240229',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'First call' }],
})

await client.messages.create({
  model: 'claude-3-sonnet-20240229',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Second call' }],
})

console.log(client.callCount)            // 2
console.log(client.lastCall?.model)      // "claude-3-sonnet-20240229"
console.log(client.lastCall?.messages)   // [{ role: "user", content: "Second call" }]
console.log(client.lastCall?.timestamp)  // 1700000000000
console.log(client.calls.length)         // 2 (full history)

client.reset()                           // clears calls AND patterns
console.log(client.callCount)            // 0
```

### Using with Vitest

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { MockAnthropic } from 'llm-mock'
import { summarize } from '../src/summarizer'

describe('summarize()', () => {
  let client: MockAnthropic

  beforeEach(() => {
    client = new MockAnthropic()
    client.onPrompt('summarize').reply('Brief summary of the text.')
  })

  it('sends the correct prompt to the API', async () => {
    await summarize(client, 'A very long article about TypeScript...')

    expect(client.callCount).toBe(1)
    expect(client.lastCall?.model).toBe('claude-3-opus-20240229')
    expect(client.lastCall?.messages[0].content).toContain('summarize')
  })

  it('returns the AI-generated summary', async () => {
    const result = await summarize(client, 'A very long article...')
    expect(result).toBe('Brief summary of the text.')
  })

  it('handles API errors gracefully', async () => {
    client.throwOn('summarize', new Error('Service unavailable'))

    await expect(summarize(client, 'summarize this')).rejects.toThrow('Service unavailable')
  })
})
```

### Using with Jest

```typescript
import { MockOpenAI } from 'llm-mock'
import { generateTitle } from '../src/title-generator'

describe('generateTitle()', () => {
  let client: MockOpenAI

  beforeEach(() => {
    client = new MockOpenAI()
    client.onPrompt('title').reply('10 Tips for Better Code')
  })

  test('generates a title for the given article', async () => {
    const title = await generateTitle(client, 'An article about coding...')

    expect(title).toBe('10 Tips for Better Code')
    expect(client.callCount).toBe(1)
    expect(client.lastCall?.model).toBe('gpt-4')
  })
})
```

---

## :package: Response Shapes

### Anthropic Response

Every call to `MockAnthropic.messages.create()` returns this exact structure:

```json
{
  "id": "msg_mock_k8f2j9x3m1p",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "Your matched reply text here"
    }
  ],
  "model": "claude-3-opus-20240229",
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "usage": {
    "input_tokens": 10,
    "output_tokens": 20
  }
}
```

### OpenAI Response

Every call to `MockOpenAI.chat.completions.create()` returns this exact structure:

```json
{
  "id": "chatcmpl_mock_k8f2j9x3m1p",
  "object": "chat.completion",
  "created": 1700000000,
  "model": "gpt-4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Your matched reply text here"
      },
      "finish_reason": "stop",
      "logprobs": null
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

### Anthropic Stream Events

```typescript
// Content chunks (one per replyStream[] entry):
{ type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "chunk" } }

// Final event:
{ type: "message_stop" }
```

### OpenAI Stream Chunks

```typescript
// Content chunks (one per replyStream[] entry):
{
  id: "chatcmpl_mock_...", object: "chat.completion.chunk",
  created: 1700000000, model: "mock-model",
  choices: [{ index: 0, delta: { content: "chunk" }, finish_reason: null }]
}

// Final chunk:
{ ..., choices: [{ index: 0, delta: {}, finish_reason: "stop" }] }
```

---

## :file_folder: Project Structure

```
llm-mock/
│
├── packages/
│   └── llm-mock/                        # The npm package
│       ├── src/
│       │   ├── index.ts                 # Public exports
│       │   ├── MockAnthropic.ts         # Anthropic SDK mock client
│       │   ├── MockOpenAI.ts            # OpenAI SDK mock client
│       │   ├── matcher.ts              # Pattern matching engine
│       │   ├── responder.ts            # Response object builders
│       │   ├── stream.ts              # Async stream generators
│       │   ├── inspector.ts           # Call recording / inspection
│       │   └── types.ts              # TypeScript interfaces
│       ├── tests/
│       │   ├── anthropic.test.ts       # MockAnthropic tests (10 tests)
│       │   ├── openai.test.ts          # MockOpenAI tests (11 tests)
│       │   ├── matcher.test.ts         # Matcher engine tests (9 tests)
│       │   └── streaming.test.ts       # Stream generator tests (9 tests)
│       ├── dist/                        # Build output
│       │   ├── index.js                # CommonJS
│       │   ├── index.mjs               # ES Modules
│       │   ├── index.d.ts              # Type declarations
│       │   └── *.map                   # Source maps
│       ├── package.json
│       ├── tsconfig.json
│       ├── tsup.config.ts
│       └── README.md
│
├── docs/                                # Next.js 14 docs site
│   ├── app/
│   │   ├── layout.tsx                  # Root layout
│   │   ├── page.tsx                    # Landing page
│   │   ├── docs/[[...slug]]/page.tsx   # Documentation pages
│   │   └── playground/page.tsx         # Interactive playground
│   ├── components/
│   │   ├── CodeBlock.tsx               # Code blocks with copy button
│   │   └── Navbar.tsx                  # Site navigation
│   ├── content/
│   │   └── getting-started.mdx         # Documentation content
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── vercel.json
│   └── package.json
│
├── .github/
│   └── workflows/
│       ├── test.yml                    # CI: test on Node 18/20/22
│       ├── publish.yml                 # CD: npm publish on release
│       └── deploy-docs.yml            # CD: deploy docs to Vercel
│
├── .eslintrc.json                       # ESLint configuration
├── .prettierrc                          # Prettier configuration
├── LICENSE                              # MIT License
└── README.md                            # This file
```

---

## :wrench: Development

### Prerequisites

- Node.js >= 18
- npm >= 9

### Setup

```bash
git clone https://github.com/Aswinsaipalakonda/llm-mock.git
cd llm-mock/packages/llm-mock
npm install
```

### Commands

| Command | Description |
|:---|:---|
| `npm test` | Run all 39 tests once |
| `npm run test:watch` | Run tests in watch mode (re-runs on file change) |
| `npm run build` | Build CJS + ESM + type declarations via tsup |
| `npm run typecheck` | Run TypeScript compiler type checking |
| `npm run lint` | Lint source files with ESLint |

### Test Suite

```
 ✓ tests/matcher.test.ts      (9 tests)   — pattern matching engine
 ✓ tests/streaming.test.ts    (9 tests)   — stream generators
 ✓ tests/anthropic.test.ts    (10 tests)  — MockAnthropic client
 ✓ tests/openai.test.ts       (11 tests)  — MockOpenAI client

 Test Files  4 passed (4)
      Tests  39 passed (39)
```

### Build Output

```
dist/
├── index.js         11.40 KB   CommonJS
├── index.mjs        10.09 KB   ES Modules
├── index.d.ts        4.67 KB   TypeScript declarations (CJS)
├── index.d.mts       4.67 KB   TypeScript declarations (ESM)
├── index.js.map               Source map (CJS)
└── index.mjs.map              Source map (ESM)
```

### Docs Site

```bash
cd docs
npm install
npm run dev          # http://localhost:3000
npm run build        # Production build
```

---

## :handshake: Contributing

Contributions are welcome! Here's how to get involved:

### Quick Steps

1. **Fork** this repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/llm-mock.git`
3. **Branch**: `git checkout -b feat/my-feature`
4. **Install**: `cd packages/llm-mock && npm install`
5. **Develop** and write tests
6. **Test**: `npm test`
7. **Build**: `npm run build`
8. **Commit**: `git commit -m "feat: description of change"`
9. **Push**: `git push origin feat/my-feature`
10. **Open a Pull Request**

### Guidelines

- All code must pass strict TypeScript (`tsc --noEmit`)
- All new features must include tests
- Zero runtime dependencies — dev dependencies only
- Follow existing code style (Prettier + ESLint)
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/)

### Ideas for Contributions

| Area | Examples |
|:---|:---|
| **New SDK support** | Cohere, Mistral, Google Gemini mock clients |
| **Tool call mocking** | Full tool_use / tool_calls response simulation |
| **Response delays** | `client.onPrompt('slow').reply('...').withDelay(1000)` |
| **Request validation** | Warn when required params are missing |
| **Framework helpers** | `vitest-llm-mock`, `jest-llm-mock` integrations |
| **Documentation** | More examples, guides, API reference improvements |

---

## :bulb: Design Principles

| Principle | Detail |
|:---|:---|
| **Zero dependencies** | Ships with zero runtime dependencies. Only dev deps for building and testing. |
| **Exact SDK shapes** | Responses match real Anthropic / OpenAI SDK response objects field-by-field. |
| **First match wins** | Patterns are evaluated in registration order. First matching rule produces the response. |
| **Fluent API** | Builder pattern with chain-able methods: `.onPrompt('x').reply('y')`. |
| **Test-framework agnostic** | Works with Vitest, Jest, Mocha, node:test, or any runner. No framework coupling. |
| **Strict TypeScript** | Written with `strict: true`. Uses `any` only at SDK adapter boundaries. |

---

## :page_facing_up: License

[MIT](./LICENSE) -- free for personal and commercial use.

```
MIT License - Copyright (c) 2026 llm-mock contributors
```

---

<div align="center">

<br/>

**[Documentation](https://llm-mock.vercel.app)** &nbsp;&bull;&nbsp;
**[npm](https://www.npmjs.com/package/llm-mock)** &nbsp;&bull;&nbsp;
**[GitHub](https://github.com/Aswinsaipalakonda/llm-mock)** &nbsp;&bull;&nbsp;
**[Report Issues](https://github.com/Aswinsaipalakonda/llm-mock/issues)**

<br/>

If this project helps you, consider giving it a star on GitHub.

<br/>

</div>
