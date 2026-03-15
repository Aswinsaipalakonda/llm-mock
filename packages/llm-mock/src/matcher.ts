import type { MockPattern } from './types'

function extractTextContent(
  content: string | Array<{ type: string; text?: string }>,
): string {
  if (typeof content === 'string') {
    return content
  }
  if (Array.isArray(content)) {
    return content
      .filter((block) => block.type === 'text' && typeof block.text === 'string')
      .map((block) => block.text!)
      .join(' ')
  }
  return ''
}

function matchesContains(
  text: string,
  pattern: string | RegExp,
): boolean {
  if (typeof pattern === 'string') {
    return text.toLowerCase().includes(pattern.toLowerCase())
  }
  return pattern.test(text)
}

export function findMatch(
  messages: Array<{ role: string; content: string | Array<{ type: string; text?: string }> }>,
  systemPrompt: string | undefined,
  model: string | undefined,
  patterns: MockPattern[],
): MockPattern | undefined {
  for (const pattern of patterns) {
    if (pattern.model !== undefined) {
      if (model !== undefined && model === pattern.model) {
        return pattern
      }
      continue
    }

    if (pattern.systemPrompt !== undefined && systemPrompt !== undefined) {
      if (matchesContains(systemPrompt, pattern.systemPrompt)) {
        return pattern
      }
      continue
    }

    if (pattern.toolName !== undefined) {
      continue
    }

    if (pattern.contains !== undefined) {
      const allText = messages
        .map((msg) => extractTextContent(msg.content))
        .join(' ')

      if (matchesContains(allText, pattern.contains)) {
        return pattern
      }
      continue
    }
  }
  return undefined
}
