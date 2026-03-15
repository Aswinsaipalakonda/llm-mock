import { describe, it, expect, beforeEach } from 'vitest'
import { MockAnthropic } from '../src/MockAnthropic'

describe('MockAnthropic', () => {
  let mock: MockAnthropic

  beforeEach(() => {
    mock = new MockAnthropic()
  })

  it('returns default response with correct shape when no pattern matches', async () => {
    const response = await mock.messages.create({
      model: 'claude-3-opus-20240229',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 1024,
    })

    expect(response.id).toMatch(/^msg_mock_/)
    expect(response.type).toBe('message')
    expect(response.role).toBe('assistant')
    expect(response.content).toHaveLength(1)
    expect(response.content[0].type).toBe('text')
    expect(typeof response.content[0].text).toBe('string')
    expect(response.model).toBe('claude-3-opus-20240229')
    expect(response.stop_reason).toBe('end_turn')
    expect(response.stop_sequence).toBeNull()
    expect(response.usage).toEqual({ input_tokens: 10, output_tokens: 20 })
  })

  it('returns matched response for keyword pattern', async () => {
    mock.onPrompt('weather').reply('It is sunny today.')

    const response = await mock.messages.create({
      model: 'claude-3-opus-20240229',
      messages: [{ role: 'user', content: 'What is the weather like?' }],
      max_tokens: 1024,
    })

    expect(response.content[0].text).toBe('It is sunny today.')
  })

  it('returns matched response for regex pattern', async () => {
    mock.onPrompt(/\d{3}-\d{4}/).reply('That looks like a phone number.')

    const response = await mock.messages.create({
      model: 'claude-3-opus-20240229',
      messages: [{ role: 'user', content: 'Call me at 555-1234' }],
      max_tokens: 1024,
    })

    expect(response.content[0].text).toBe('That looks like a phone number.')
  })

  it('records calls correctly in inspector', async () => {
    expect(mock.callCount).toBe(0)

    await mock.messages.create({
      model: 'claude-3-opus-20240229',
      messages: [{ role: 'user', content: 'First call' }],
      max_tokens: 1024,
    })

    await mock.messages.create({
      model: 'claude-3-sonnet-20240229',
      messages: [{ role: 'user', content: 'Second call' }],
      max_tokens: 1024,
    })

    expect(mock.callCount).toBe(2)
    expect(mock.calls).toHaveLength(2)
    expect(mock.calls[0].model).toBe('claude-3-opus-20240229')
    expect(mock.calls[1].model).toBe('claude-3-sonnet-20240229')
    expect(mock.lastCall?.model).toBe('claude-3-sonnet-20240229')
    expect(mock.lastCall?.messages[0]).toEqual({ role: 'user', content: 'Second call' })
    expect(typeof mock.lastCall?.timestamp).toBe('number')
  })

  it('throws error when throwOn matches', async () => {
    const customError = new Error('API rate limit exceeded')
    mock.throwOn('danger', customError)

    await expect(
      mock.messages.create({
        model: 'claude-3-opus-20240229',
        messages: [{ role: 'user', content: 'This is a danger zone' }],
        max_tokens: 1024,
      }),
    ).rejects.toThrow('API rate limit exceeded')
  })

  it('throws default error when throwOn matches without custom error', async () => {
    mock.throwOn('forbidden')

    await expect(
      mock.messages.create({
        model: 'claude-3-opus-20240229',
        messages: [{ role: 'user', content: 'This is forbidden content' }],
        max_tokens: 1024,
      }),
    ).rejects.toThrow()
  })

  it('reset() clears call history and patterns', async () => {
    mock.onPrompt('hello').reply('Hi there!')

    await mock.messages.create({
      model: 'claude-3-opus-20240229',
      messages: [{ role: 'user', content: 'hello world' }],
      max_tokens: 1024,
    })

    expect(mock.callCount).toBe(1)

    mock.reset()

    expect(mock.callCount).toBe(0)
    expect(mock.calls).toEqual([])
    expect(mock.lastCall).toBeUndefined()

    const response = await mock.messages.create({
      model: 'claude-3-opus-20240229',
      messages: [{ role: 'user', content: 'hello again' }],
      max_tokens: 1024,
    })

    expect(response.content[0].text).toBe('This is a mock response from MockAnthropic.')
  })

  it('uses custom default reply from config', async () => {
    const customMock = new MockAnthropic({ defaultReply: 'Custom default' })

    const response = await customMock.messages.create({
      model: 'claude-3-opus-20240229',
      messages: [{ role: 'user', content: 'anything' }],
      max_tokens: 1024,
    })

    expect(response.content[0].text).toBe('Custom default')
  })

  it('matches on system prompt', async () => {
    mock.onSystemPrompt('helpful assistant').reply('I am helpful!')

    const response = await mock.messages.create({
      model: 'claude-3-opus-20240229',
      system: 'You are a helpful assistant.',
      messages: [{ role: 'user', content: 'Hi' }],
      max_tokens: 1024,
    })

    expect(response.content[0].text).toBe('I am helpful!')
  })

  it('matches on model name', async () => {
    mock.onModel('claude-3-haiku-20240307').reply('I am Haiku!')

    const response = await mock.messages.create({
      model: 'claude-3-haiku-20240307',
      messages: [{ role: 'user', content: 'anything' }],
      max_tokens: 1024,
    })

    expect(response.content[0].text).toBe('I am Haiku!')
  })
})
