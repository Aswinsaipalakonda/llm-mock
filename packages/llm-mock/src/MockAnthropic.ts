import type { MockPattern, MockConfig, CallRecord } from './types'
import { CallInspector } from './inspector'
import { findMatch } from './matcher'
import { buildAnthropicResponse } from './responder'
import { createAnthropicStream } from './stream'

const DEFAULT_REPLY = 'This is a mock response from MockAnthropic.'

export class MockAnthropic {
  private patterns: MockPattern[] = []
  private _inspector = new CallInspector()
  private config: MockConfig
  private _pendingPattern: Partial<MockPattern> = {}

  messages: {
    create: (params: any) => Promise<any>
    stream: (params: any) => AsyncIterable<any>
  }

  constructor(config?: MockConfig) {
    this.config = config ?? {}

    const self = this

    this.messages = {
      create: (params: any) => self._handleCreate(params),
      stream: (params: any) => self._handleStream(params),
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

  private _extractSystem(params: any): string | undefined {
    if (typeof params.system === 'string') return params.system
    if (Array.isArray(params.system)) {
      return params.system
        .filter((b: any) => b.type === 'text')
        .map((b: any) => b.text)
        .join(' ')
    }
    return undefined
  }

  private _recordCall(params: any): void {
    this._inspector.record({
      messages: params.messages ?? [],
      model: params.model ?? 'unknown',
      system: this._extractSystem(params),
      tools: params.tools,
      timestamp: Date.now(),
    })
  }

  private async _handleCreate(params: any): Promise<any> {
    this._recordCall(params)

    const systemPrompt = this._extractSystem(params)
    const match = findMatch(params.messages ?? [], systemPrompt, params.model, this.patterns)

    if (match?.throwError) {
      throw match.throwError
    }

    const replyText =
      match?.reply ?? this.config.defaultReply ?? DEFAULT_REPLY

    return buildAnthropicResponse(replyText, params.model ?? 'claude-3-opus-20240229')
  }

  private _handleStream(params: any): AsyncIterable<any> {
    this._recordCall(params)

    const systemPrompt = this._extractSystem(params)
    const match = findMatch(params.messages ?? [], systemPrompt, params.model, this.patterns)

    if (match?.throwError) {
      throw match.throwError
    }

    const chunks = match?.replyStream ??
      (match?.reply ? [match.reply] : undefined) ??
      [this.config.defaultReply ?? DEFAULT_REPLY]

    return createAnthropicStream(chunks)
  }
}
