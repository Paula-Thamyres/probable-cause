import type { ReactNode } from 'react'

interface TerminalPanelProps {
  title: string
  children: ReactNode
}

export function TerminalPanel({ title, children }: TerminalPanelProps) {
  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 font-mono text-xs text-neutral-300">
      <h2 className="mb-2 text-neutral-200">{title}</h2>
      {children}
    </section>
  )
}
