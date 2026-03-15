'use client'

import { useState } from 'react'

interface CodeBlockProps {
  code: string
  language?: string
}

export function CodeBlock({ code, language = 'typescript' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group">
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleCopy}
          className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs px-2 py-1 rounded transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      {language && (
        <div className="absolute top-3 left-4 text-xs text-gray-500">{language}</div>
      )}
      <pre className="bg-gray-950 text-gray-300 rounded-lg p-4 pt-9 text-sm overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  )
}
