import type { AnthropicMessage, OpenAIChatCompletion } from './types'

function randomId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export function buildAnthropicResponse(
  replyText: string,
  model: string,
): AnthropicMessage {
  return {
    id: 'msg_mock_' + randomId(),
    type: 'message',
    role: 'assistant',
    content: [{ type: 'text', text: replyText }],
    model,
    stop_reason: 'end_turn',
    stop_sequence: null,
    usage: { input_tokens: 10, output_tokens: 20 },
  }
}

export function buildOpenAIResponse(
  replyText: string,
  model: string,
): OpenAIChatCompletion {
  return {
    id: 'chatcmpl_mock_' + randomId(),
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        message: { role: 'assistant', content: replyText },
        finish_reason: 'stop',
        logprobs: null,
      },
    ],
    usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
  }
}
