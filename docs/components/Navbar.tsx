import Link from 'next/link'

export function Navbar() {
  return (
    <header className="border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">
          llm-mock
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/docs/getting-started"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            Docs
          </Link>
          <Link
            href="/playground"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            Playground
          </Link>
          <a
            href="https://github.com/Aswinsaipalakonda/llm-mock"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/llm-mock"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            npm
          </a>
        </nav>
      </div>
    </header>
  )
}
