# llm-mock

> Drop-in mock clients for OpenAI and Anthropic SDKs. Test your LLM-powered apps without making real API calls.

## Install

```bash
npm install --save-dev llm-mock
```

## Usage

```typescript
import { MockAnthropic, MockOpenAI } from 'llm-mock'

// Anthropic
const anthropic = new MockAnthropic()
anthropic.onPrompt('weather').reply('Sunny and 72F.')

const response = await anthropic.messages.create({
  model: 'claude-3-opus-20240229',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'What is the weather?' }],
})
// response.content[0].text === "Sunny and 72F."

// OpenAI
const openai = new MockOpenAI()
openai.onPrompt('joke').reply('Why did the chicken cross the road?')

const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Tell me a joke' }],
})
// completion.choices[0].message.content === "Why did the chicken cross the road?"
```

## Features

- Zero runtime dependencies
- Pattern matching by keyword, regex, system prompt, or model
- Streaming support for both SDKs
- Call inspection and recording
- Error simulation with `throwOn()`
- Exact SDK response shapes

## Documentation

Full docs: [llm-mock.vercel.app](https://llm-mock.vercel.app)

## License

MIT