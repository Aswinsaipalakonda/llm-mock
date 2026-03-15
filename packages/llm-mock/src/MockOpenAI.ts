import type { MockPattern, MockConfig, CallRecord } from './types'
import { CallInspector } from './inspector'
import { findMatch } from './matcher'
import { buildOpenAIResponse } from './responder'
import { createOpenAIStream } from './stream'

const DEFAULT_REPLY = 'This is a mock response from MockOpenAI.'

export class MockOpenAI {
  private patterns: MockPattern[] = []
  private _inspector = new CallInspector()
  private config: MockConfig
  private _pendingPattern: Partial<MockPattern> = {}

  chat: {
    completions: {
      create: (params: any) => Promise<any>
    }
  }

  constructor(config?: MockConfig) {
    this.config = config ?? {}

    const self = this

    this.chat = {
      completions: {
        create: (params: any) => self._handleCreate(params),
      },
    }
  }

  onPrompt(pattern: string | RegExp): this {
    this._flushPending()
    this._pendingPattern = { contains: pattern }
    return this
  }

  onSystemPrompt(pattern: string | RegExp): this {
    this._flushPending()
    this._pendingPattern = { systemPrompt: pattern }
    return this
  }

  onModel(model: string): this {
    this._flushPending()
    this._pendingPattern = { model }
    return this
  }

  onTool(toolName: string): this {
    this._flushPending()
    this._pendingPattern = { toolName }
    return this
  }

  reply(text: string): this {
    this._pendingPattern.reply = text
    this._flushPending()
    return this
  }

  replyStream(chunks: string[]): this {
    this._pendingPattern.replyStream = chunks
    this._flushPending()
    return this
  }

  throwOn(pattern: string | RegExp, error?: Error): this {
    this._flushPending()
    this.patterns.push({
      contains: pattern,
      throwError: error ?? new Error(`Mock error for pattern: ${pattern}`),
    })
    return this
  }

  get calls(): CallRecord[] {
    return this._inspector.calls
  }

  get lastCall(): CallRecord | undefined {
    return this._inspector.lastCall
  }

  get callCount(): number {
    return this._inspector.callCount
  }

  reset(): void {
    this._inspector.reset()
    this.patterns = []
    this._pendingPattern = {}
  }

  private _flushPending(): void {
    if (
      this._pendingPattern.contains !== undefined ||
      this._pendingPattern.systemPrompt !== undefined ||
      this._pendingPattern.model !== undefined ||
      this._pendingPattern.toolName !== undefined
    ) {
      if (
        this._pendingPattern.reply !== undefined ||
        this._pendingPattern.replyStream !== undefined ||
        this._pendingPattern.throwError !== undefined ||
        this._pendingPattern.toolReply !== undefined
      ) {
        this.patterns.push(this._pendingPattern as MockPattern)
        this._pendingPattern = {}
      }
    }
  }

  private _extractSystemPrompt(
    messages: Array<{ role: string; content: string }>,
  ): string | undefined {
    const systemMsg = messages.find((m) => m.role === 'system')
    return systemMsg ? String(systemMsg.content) : undefined
  }

  private _recordCall(params: any): void {
    const messages = params.messages ?? []
    this._inspector.record({
      messages,
      model: params.model ?? 'unknown',
      system: this._extractSystemPrompt(messages),
      tools: params.tools,
      timestamp: Date.now(),
    })
  }

  private async _handleCreate(params: any): Promise<any> {
    this._recordCall(params)

    const messages = params.messages ?? []
    const systemPrompt = this._extractSystemPrompt(messages)
    const match = findMatch(messages, systemPrompt, params.model, this.patterns)

    if (match?.throwError) {
      throw match.throwError
    }

    if (params.stream === true) {
      const chunks = match?.replyStream ??
        (match?.reply ? [match.reply] : undefined) ??
        [this.config.defaultReply ?? DEFAULT_REPLY]

      return createOpenAIStream(chunks)
    }

    const replyText =
      match?.reply ?? this.config.defaultReply ?? DEFAULT_REPLY

    return buildOpenAIResponse(replyText, params.model ?? 'gpt-4')
  }
}
