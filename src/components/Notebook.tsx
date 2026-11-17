import type { Civilian } from '../game/types'

interface NotebookProps {
  eliminated: readonly Civilian[]
  goal: number
  turn: number
}

const LINE_STYLE = 'h-8 whitespace-nowrap border-b border-neutral-300 leading-8'

function rowText(index: number, civilian: Civilian | undefined, nextIndex: number): string {
  if (civilian) {
    return `${index + 1}. ${civilian.name}`
  }

  return index === nextIndex ? `${index + 1}. ________` : ''
}

export function Notebook({ eliminated, goal, turn }: NotebookProps) {
  const rows = Array.from({ length: goal }, (_, index) => eliminated[index])

  return (
    <section
      aria-label="Caderno"
      className="relative overflow-hidden rounded-md bg-[#fafafa] py-3 pl-12 pr-4 font-serif text-lg italic text-[#111111] before:absolute before:inset-y-0 before:left-9 before:w-px before:bg-[#e24b4a]"
    >
      <div
        aria-hidden="true"
        className="absolute left-2 top-0 flex h-full flex-col justify-around py-6"
      >
        <span className="size-2.5 rounded-full bg-neutral-950" />
        <span className="size-2.5 rounded-full bg-neutral-950" />
        <span className="size-2.5 rounded-full bg-neutral-950" />
      </div>
      <h2 className={`${LINE_STYLE} font-mono text-xs not-italic text-neutral-500`}>
        caderno · turno {turn} · {eliminated.length}/{goal}
      </h2>
      <ol>
        {rows.map((civilian, index) => (
          <li key={`line-${index + 1}`} className={LINE_STYLE}>
            {rowText(index, civilian, eliminated.length)}
          </li>
        ))}
      </ol>
    </section>
  )
}
