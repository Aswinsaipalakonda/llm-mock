import { describe, it, expect } from 'vitest'
import { createAnthropicStream, createOpenAIStream } from '../src/stream'

describe('Anthropic Streaming', () => {
  it('yields correct content block delta chunks', async () => {
    const chunks = ['Hello', ' world', '!']
    const events: any[] = []

    for await (const event of createAnthropicStream(chunks)) {
      events.push(event)
    }

    expect(events).toHaveLength(4)

    expect(events[0]).toEqual({
      type: 'content_block_delta',
      index: 0,
      delta: { type: 'text_delta', text: 'Hello' },
    })
    expect(events[1]).toEqual({
      type: 'content_block_delta',
      index: 0,
      delta: { type: 'text_delta', text: ' world' },
    })
    expect(events[2]).toEqual({
      type: 'content_block_delta',
      index: 0,
      delta: { type: 'text_delta', text: '!' },
    })
  })

  it('ends with message_stop event', async () => {
    const events: any[] = []

    for await (const event of createAnthropicStream(['chunk'])) {
      events.push(event)
    }

    const lastEvent = events[events.length - 1]
    expect(lastEvent.type).toBe('message_stop')
  })

  it('handles empty chunks array', async () => {
    const events: any[] = []

    for await (const event of createAnthropicStream([])) {
      events.push(event)
    }

    expect(events).toHaveLength(1)
    expect(events[0].type).toBe('message_stop')
  })

  it('handles single chunk', async () => {
    const events: any[] = []

    for await (const event of createAnthropicStream(['Complete response'])) {
      events.push(event)
    }

    expect(events).toHaveLength(2)
    expect(events[0].delta?.text).toBe('Complete response')
    expect(events[1].type).toBe('message_stop')
  })
})

describe('OpenAI Streaming', () => {
  it('yields correct delta chunks', async () => {
    const chunks = ['Hello', ' world', '!']
    const events: any[] = []

    for await (const event of createOpenAIStream(chunks)) {
      events.push(event)
    }

    expect(events).toHaveLength(4)

    expect(events[0].choices[0].delta.content).toBe('Hello')
    expect(events[0].choices[0].finish_reason).toBeNull()
    expect(events[0].object).toBe('chat.completion.chunk')

    expect(events[1].choices[0].delta.content).toBe(' world')
    expect(events[2].choices[0].delta.content).toBe('!')
  })

  it('ends with finish_reason stop', async () => {
    const events: any[] = []

    for await (const event of createOpenAIStream(['chunk'])) {
      events.push(event)
    }

    const lastEvent = events[events.length - 1]
    expect(lastEvent.choices[0].finish_reason).toBe('stop')
    expect(lastEvent.choices[0].delta.content).toBeUndefined()
  })

  it('all chunks share the same id and created timestamp', async () => {
    const events: any[] = []

    for await (const event of createOpenAIStream(['a', 'b', 'c'])) {
      events.push(event)
    }

    const ids = events.map((e) => e.id)
    const createdTimes = events.map((e) => e.created)

    expect(new Set(ids).size).toBe(1)
    expect(new Set(createdTimes).size).toBe(1)
  })

  it('handles empty chunks array', async () => {
    const events: any[] = []

    for await (const event of createOpenAIStream([])) {
      events.push(event)
    }

    expect(events).toHaveLength(1)
    expect(events[0].choices[0].finish_reason).toBe('stop')
  })

  it('handles single chunk', async () => {
    const events: any[] = []

    for await (const event of createOpenAIStream(['Complete response'])) {
      events.push(event)
    }

    expect(events).toHaveLength(2)
    expect(events[0].choices[0].delta.content).toBe('Complete response')
    expect(events[1].choices[0].finish_reason).toBe('stop')
  })
})
