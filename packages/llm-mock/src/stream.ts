import type { AnthropicStreamEvent, OpenAIStreamChunk } from './types'

function randomId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export async function* createAnthropicStream(
  chunks: string[],
): AsyncGenerator<AnthropicStreamEvent> {
  for (let i = 0; i < chunks.length; i++) {
    yield {
      type: 'content_block_delta',
      index: 0,
      delta: { type: 'text_delta', text: chunks[i] },
    }
  }
  yield { type: 'message_stop' }
}

export async function* createOpenAIStream(
  chunks: string[],
): AsyncGenerator<OpenAIStreamChunk> {
  const id = 'chatcmpl_mock_' + randomId()
  const created = Math.floor(Date.now() / 1000)

  for (let i = 0; i < chunks.length; i++) {
    yield {
      id,
      object: 'chat.completion.chunk',
      created,
      model: 'mock-model',
      choices: [
        {
          index: 0,
          delta: { content: chunks[i] },
          finish_reason: null,
        },
      ],
    }
  }

  yield {
    id,
    object: 'chat.completion.chunk',
    created,
    model: 'mock-model',
    choices: [
      {
        index: 0,
        delta: {},
        finish_reason: 'stop',
      },
    ],
  }
}
