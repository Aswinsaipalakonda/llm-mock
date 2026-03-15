import type { CallRecord } from './types'

export class CallInspector {
  private _calls: CallRecord[] = []

  record(call: CallRecord): void {
    this._calls.push(call)
  }

  get calls(): CallRecord[] {
    return [...this._calls]
  }

  get lastCall(): CallRecord | undefined {
    return this._calls.length > 0 ? this._calls[this._calls.length - 1] : undefined
  }

  get callCount(): number {
    return this._calls.length
  }

  reset(): void {
    this._calls = []
  }
}
