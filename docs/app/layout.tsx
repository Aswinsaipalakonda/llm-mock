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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
