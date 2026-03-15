import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'llm-mock - Drop-in Mock for OpenAI & Anthropic',
  description:
    'Test your LLM-powered applications without making real API calls. Deterministic, pattern-matched fake responses in the exact SDK response shape.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased">
        {children}
      </body>
    </html>
  )
}
