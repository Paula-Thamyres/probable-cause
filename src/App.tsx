import { useState } from 'react'
import { ActionBar } from './components/ActionBar'
import { CluesPanel } from './components/CluesPanel'
import { DetectivePanel } from './components/DetectivePanel'
import { EventLog } from './components/EventLog'
import { Notebook } from './components/Notebook'
import { CIVILIANS } from './data/civilians'
import { getOutcome } from './game/outcome'
import type { Outcome } from './game/outcome'
import { getArrested, getEliminated, getPlayer, getTargets } from './game/selectors'
import { TARGETS_TO_WIN } from './game/state'
import { useGame } from './hooks/useGame'

const RESULT_MESSAGES: Record<Exclude<Outcome, 'playing'>, string> = {
  won: 'Você preencheu o caderno e escapou do detetive.',
  accused: 'O detetive acusou você. Fim de jogo.',
  cornered: 'Não restam alvos suficientes para completar o caderno. Fim de jogo.',
  timeout: 'Os turnos acabaram antes de você completar o caderno. Fim de jogo.',
}

export default function App() {
  const { state, error, play, restart } = useGame(CIVILIANS)
  const [hardMode, setHardMode] = useState(false)
  const player = getPlayer(state)
  const outcome = getOutcome(state)
  const result = outcome === 'playing' ? null : RESULT_MESSAGES[outcome]

  return (
    <main className="min-h-screen bg-black p-4 text-neutral-300 md:p-8">
      <header className="mb-6 font-mono">
        <h1 className="text-2xl text-neutral-200">probable-cause</h1>
        <p className="text-xs text-neutral-400">
          Você é {player.name} | Meta: eliminar {TARGETS_TO_WIN} alvos antes que o detetive descubra
          quem você é.
        </p>
        <label className="mt-3 flex items-center gap-2 text-sm text-neutral-300">
          <input
            type="checkbox"
            checked={hardMode}
            onChange={(event) => setHardMode(event.target.checked)}
          />
          modo difícil (esconde as porcentagens)
        </label>
      </header>
      <div className="grid gap-4 md:grid-cols-[1fr_1.2fr_0.8fr]">
        <DetectivePanel
          civilians={state.civilians}
          beliefs={state.beliefs}
          playerId={state.playerId}
          watches={state.watches}
          arrested={getArrested(state)}
          hardMode={hardMode}
        />
        <Notebook eliminated={getEliminated(state)} goal={TARGETS_TO_WIN} turn={state.turn} />
        <CluesPanel clues={state.clues} />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <ActionBar
          key={player.id}
          player={player}
          targets={getTargets(state)}
          disabled={result !== null}
          onPlay={play}
        />
        <EventLog events={state.events} civilians={state.civilians} />
      </div>
      {error && (
        <p role="alert" className="mt-3 font-mono text-xs text-[#e24b4a]">
          {error}
        </p>
      )}
      {result && (
        <div className="mt-4 rounded-lg border border-neutral-600 p-4 font-mono">
          <p className="text-neutral-200">{result}</p>
          <button
            type="button"
            className="mt-3 rounded border border-neutral-600 px-3 py-1 text-neutral-200 hover:bg-neutral-900"
            onClick={restart}
          >
            Jogar de novo
          </button>
        </div>
      )}
    </main>
  )
}
