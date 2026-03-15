import { describe, it, expect } from 'vitest'
import { findMatch } from '../src/matcher'
import type { MockPattern } from '../src/types'

describe('findMatch', () => {
  it('matches keyword in user message', () => {
    const patterns: MockPattern[] = [
      { contains: 'weather', reply: 'Sunny' },
    ]
    const messages = [{ role: 'user', content: 'What is the weather today?' }]
    const result = findMatch(messages, undefined, undefined, patterns)
    expect(result).toBeDefined()
    expect(result?.reply).toBe('Sunny')
  })

  it('matches keyword in system prompt', () => {
    const patterns: MockPattern[] = [
      { systemPrompt: 'helpful', reply: 'I am helpful!' },
    ]
    const messages = [{ role: 'user', content: 'Hi' }]
    const result = findMatch(messages, 'You are a helpful assistant', undefined, patterns)
    expect(result).toBeDefined()
    expect(result?.reply).toBe('I am helpful!')
  })

  it('matches regex pattern', () => {
    const patterns: MockPattern[] = [
      { contains: /\d{3}-\d{4}/, reply: 'Phone number detected' },
    ]
    const messages = [{ role: 'user', content: 'Call 555-1234' }]
    const result = findMatch(messages, undefined, undefined, patterns)
    expect(result).toBeDefined()
    expect(result?.reply).toBe('Phone number detected')
  })

  it('matches model name', () => {
    const patterns: MockPattern[] = [
      { model: 'gpt-3.5-turbo', reply: 'Turbo response' },
    ]
    const messages = [{ role: 'user', content: 'anything' }]
    const result = findMatch(messages, undefined, 'gpt-3.5-turbo', patterns)
    expect(result).toBeDefined()
    expect(result?.reply).toBe('Turbo response')
  })

  it('returns undefined when no match is found', () => {
    const patterns: MockPattern[] = [
      { contains: 'weather', reply: 'Sunny' },
    ]
    const messages = [{ role: 'user', content: 'Tell me a joke' }]
    const result = findMatch(messages, undefined, undefined, patterns)
    expect(result).toBeUndefined()
  })

  it('first pattern wins on multiple matches', () => {
    const patterns: MockPattern[] = [
      { contains: 'hello', reply: 'First match' },
      { contains: 'hello', reply: 'Second match' },
    ]
    const messages = [{ role: 'user', content: 'hello world' }]
    const result = findMatch(messages, undefined, undefined, patterns)
    expect(result).toBeDefined()
    expect(result?.reply).toBe('First match')
  })

  it('matches keyword case-insensitively', () => {
    const patterns: MockPattern[] = [
      { contains: 'WEATHER', reply: 'Sunny' },
    ]
    const messages = [{ role: 'user', content: 'What is the weather today?' }]
    const result = findMatch(messages, undefined, undefined, patterns)
    expect(result).toBeDefined()
    expect(result?.reply).toBe('Sunny')
  })

  it('matches across multiple messages', () => {
    const patterns: MockPattern[] = [
      { contains: 'secret', reply: 'Found it' },
    ]
    const messages = [
      { role: 'user', content: 'First message' },
      { role: 'assistant', content: 'Reply' },
      { role: 'user', content: 'The secret word is here' },
    ]
    const result = findMatch(messages, undefined, undefined, patterns)
    expect(result).toBeDefined()
    expect(result?.reply).toBe('Found it')
  })

  it('handles array content blocks in messages', () => {
    const patterns: MockPattern[] = [
      { contains: 'image', reply: 'Image detected' },
    ]
    const messages = [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Please describe this image' },
          { type: 'image_url', url: 'http://example.com' },
        ],
      },
    ]
    const result = findMatch(messages, undefined, undefined, patterns)
    expect(result).toBeDefined()
    expect(result?.reply).toBe('Image detected')
  })
})
