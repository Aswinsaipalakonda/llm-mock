import { describe, it, expect, beforeEach } from 'vitest'
import { MockOpenAI } from '../src/MockOpenAI'

describe('MockOpenAI', () => {
  let mock: MockOpenAI

  beforeEach(() => {
    mock = new MockOpenAI()
  })

  it('returns default response with correct shape when no pattern matches', async () => {
    const response = await mock.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Hello' }],
    })

    expect(response.id).toMatch(/^chatcmpl_mock_/)
    expect(response.object).toBe('chat.completion')
    expect(typeof response.created).toBe('number')
    expect(response.model).toBe('gpt-4')
    expect(response.choices).toHaveLength(1)
    expect(response.choices[0].index).toBe(0)
    expect(response.choices[0].message.role).toBe('assistant')
    expect(typeof response.choices[0].message.content).toBe('string')
    expect(response.choices[0].finish_reason).toBe('stop')
    expect(response.choices[0].logprobs).toBeNull()
    expect(response.usage).toEqual({
      prompt_tokens: 10,
      completion_tokens: 20,
      total_tokens: 30,
    })
  })

  it('returns matched response for keyword pattern', async () => {
    mock.onPrompt('weather').reply('It is sunny today.')

    const response = await mock.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'What is the weather like?' }],
    })

    expect(response.choices[0].message.content).toBe('It is sunny today.')
  })

  it('returns matched response for regex pattern', async () => {
    mock.onPrompt(/\d{3}-\d{4}/).reply('That looks like a phone number.')

    const response = await mock.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Call me at 555-1234' }],
    })

    expect(response.choices[0].message.content).toBe('That looks like a phone number.')
  })

  it('records calls correctly in inspector', async () => {
    expect(mock.callCount).toBe(0)

    await mock.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'First call' }],
    })

    await mock.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Second call' }],
    })

    expect(mock.callCount).toBe(2)
    expect(mock.calls).toHaveLength(2)
    expect(mock.calls[0].model).toBe('gpt-4')
    expect(mock.calls[1].model).toBe('gpt-3.5-turbo')
    expect(mock.lastCall?.model).toBe('gpt-3.5-turbo')
    expect(mock.lastCall?.messages[0]).toEqual({ role: 'user', content: 'Second call' })
    expect(typeof mock.lastCall?.timestamp).toBe('number')
  })

  it('throws error when throwOn matches', async () => {
    const customError = new Error('API rate limit exceeded')
    mock.throwOn('danger', customError)

    await expect(
      mock.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'This is a danger zone' }],
      }),
    ).rejects.toThrow('API rate limit exceeded')
  })

  it('throws default error when throwOn matches without custom error', async () => {
    mock.throwOn('forbidden')

    await expect(
      mock.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'This is forbidden content' }],
      }),
    ).rejects.toThrow()
  })

  it('reset() clears call history and patterns', async () => {
    mock.onPrompt('hello').reply('Hi there!')

    await mock.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'hello world' }],
    })

    expect(mock.callCount).toBe(1)

    mock.reset()

    expect(mock.callCount).toBe(0)
    expect(mock.calls).toEqual([])
    expect(mock.lastCall).toBeUndefined()

    const response = await mock.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'hello again' }],
    })

    expect(response.choices[0].message.content).toBe('This is a mock response from MockOpenAI.')
  })

  it('uses custom default reply from config', async () => {
    const customMock = new MockOpenAI({ defaultReply: 'Custom default' })

    const response = await customMock.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'anything' }],
    })

    expect(response.choices[0].message.content).toBe('Custom default')
  })

  it('matches on system prompt', async () => {
    mock.onSystemPrompt('helpful assistant').reply('I am helpful!')

    const response = await mock.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hi' },
      ],
    })

    expect(response.choices[0].message.content).toBe('I am helpful!')
  })

  it('matches on model name', async () => {
    mock.onModel('gpt-3.5-turbo').reply('I am GPT-3.5!')

    const response = await mock.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'anything' }],
    })

    expect(response.choices[0].message.content).toBe('I am GPT-3.5!')
  })

  it('returns streaming response when stream: true', async () => {
    mock.onPrompt('stream').replyStream(['Hello', ' world', '!'])

    const stream = await mock.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Please stream this' }],
      stream: true,
    })

    const chunks: string[] = []
    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        chunks.push(chunk.choices[0].delta.content)
      }
    }

    expect(chunks).toEqual(['Hello', ' world', '!'])
  })
})
