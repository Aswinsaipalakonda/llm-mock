export interface MockPattern {
  contains?: string | RegExp
  systemPrompt?: string | RegExp
  model?: string
  reply?: string
  replyStream?: string[]
  throwError?: Error
  toolName?: string
  toolReply?: unknown
}

export interface CallRecord {
  messages: Array<{ role: string; content: string | Array<{ type: string; text?: string }> }>
  model: string
  system?: string
  tools?: Array<{ name: string; [key: string]: unknown }>
  timestamp: number
}

export interface MockConfig {
  defaultReply?: string
}

export interface AnthropicMessage {
  id: string
  type: 'message'
  role: 'assistant'
  content: Array<{ type: 'text'; text: string }>
  model: string
  stop_reason: 'end_turn' | 'tool_use' | 'max_tokens' | 'stop_sequence'
  stop_sequence: string | null
  usage: { input_tokens: number; output_tokens: number }
}

export interface OpenAIChatCompletion {
  id: string
  object: 'chat.completion'
  created: number
  model: string
  choices: Array<{
    index: number
    message: { role: 'assistant'; content: string }
    finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter'
    logprobs: null
  }>
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
}

export interface AnthropicStreamEvent {
  type: 'content_block_delta' | 'message_stop' | 'message_start' | 'content_block_start'
  index?: number
  delta?: { type: 'text_delta'; text: string }
}

export interface OpenAIStreamChunk {
  id: string
  object: 'chat.completion.chunk'
  created: number
  model: string
  choices: Array<{
    index: number
    delta: { role?: string; content?: string }
    finish_reason: 'stop' | null
  }>
}
