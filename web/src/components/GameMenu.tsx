import { useEffect, useRef, useState } from 'react'
import { Download, Upload } from 'lucide-react'
import { farmLevel, formatMoney, type FarmState } from '../data'
import { parseFarmBackup } from '../storage'
import { GameDialog } from './GameDialog'

type Props = { state: FarmState; warning: string; canRestore: boolean; onClose: () => void; onDownload: () => void; onDownloadSaved: () => void; onRestore: (farm: FarmState) => Promise<boolean> }

export function GameMenu({ state, warning, canRestore, onClose, onDownload, onDownloadSaved, onRestore }: Props) {
  const [candidate, setCandidate] = useState<FarmState | null>(null)
  const [error, setError] = useState('')
  const request = useRef(0)
  const [confirmReload, setConfirmReload] = useState(false)
  const [restoring, setRestoring] = useState(false)
  useEffect(() => () => { request.current += 1 }, [])

  return <GameDialog title="Farm guide & saves" onClose={onClose}>
    <p className="menu-intro">Day {state.day} · {state.season} · Level {farmLevel(state)} · {formatMoney(state.money)}</p>
    <section className="menu-section" aria-labelledby="farm-guide-title">
      <h3 id="farm-guide-title">Your next harvest</h3>
      <ol className="farm-guide">
        <li><strong>Plant.</strong> Open Fields, choose a crop, and select empty plots. Each plot uses one seed.</li>
        <li><strong>Care.</strong> Water each growing day, or let rain help. Dry crops wait safely; they do not wither.</li>
        <li><strong>End the day.</strong> Time advances only when you choose it. Wheat takes 4 growing days, corn 5, and tomato 6.</li>
        <li><strong>Harvest & sell.</strong> Ready plots glow gold. Sell at the farm stall or fill town orders, then restock seeds.</li>
      </ol>
      <p>Each season lasts 28 days. Harvesting a crop in its preferred season yields one extra unit. Earn XP by planting, harvesting, and selling; land expansion unlocks at level 2 and costs $500 per parcel.</p>
    </section>
    <section className="menu-section" aria-labelledby="barn-guide-title">
      <h3 id="barn-guide-title">Keep the barn moving</h3>
      <p>Chickens produce 2 eggs per day (up to 12); cows produce 1 milk (up to 6). Collect before the storage fills. Up to 5 workshop batches run together and finish after 2 days. Cancelling before the first day returns ingredients; cancelling later spends them.</p>
    </section>
    <section className="menu-section" aria-labelledby="farm-save-title">
      <h3 id="farm-save-title">Save & recovery</h3>
      <p>{warning || 'Your farm saves automatically in this browser. Keep a downloaded backup when switching devices or clearing browser data.'}</p>
      <div className="menu-actions"><button type="button" className="secondary-button" onClick={onDownload}><Download size={18} />Download this farm</button><button type="button" className="secondary-button" onClick={onDownloadSaved}>Download saved file</button></div>
      {warning && <div className="backup-preview">{confirmReload ? <><p>Download this farm first if you want to keep unsaved progress. Reloading opens the saved file and discards changes in this tab.</p><div className="menu-actions"><button className="primary-button" type="button" onClick={() => window.location.reload()}>Reload saved farm now</button><button className="secondary-button" type="button" onClick={() => setConfirmReload(false)}>Keep this session</button></div></> : <button className="secondary-button" type="button" onClick={() => setConfirmReload(true)}>Reload saved farm</button>}</div>}
      <label className="backup-file-label"><Upload size={18} />Choose a backup to restore
        <input type="file" accept=".json,application/json" disabled={!canRestore} onChange={async (event) => {
          const file = event.currentTarget.files?.[0]
          const token = ++request.current
          event.currentTarget.value = ''
          setCandidate(null)
          setError('')
          if (!file) return
          if (file.size > 1_000_000) { setError('This file is too large for a FarmSim backup.'); return }
          try {
            const farm = parseFarmBackup(await file.text())
            if (token === request.current) setCandidate(farm)
          } catch (failure) {
            if (token === request.current) setError(failure instanceof SyntaxError ? 'This file is not valid JSON. Choose a FarmSim backup.' : failure instanceof Error ? failure.message : 'The backup could not be read.')
          }
        }} />
      </label>
      {!canRestore && <p>Reload the saved farm before restoring a backup. Download this session first to keep its progress.</p>}
      {error && <p role="alert" className="menu-error">{error}</p>}
      {candidate && <div className="backup-preview"><h4>Restore day {candidate.day}?</h4><p>{candidate.season} · Level {farmLevel(candidate)} · {formatMoney(candidate.money)}. This replaces the farm in this tab. A recovery copy of the current saved file will be kept.</p><div className="menu-actions"><button type="button" className="primary-button" disabled={!canRestore || restoring} onClick={async () => { setRestoring(true); if (await onRestore(candidate)) onClose(); else { setRestoring(false); setError('The backup was not restored. Check the save warning and keep your current farm open.') } }}>{restoring ? 'Restoring…' : 'Restore this farm'}</button><button type="button" className="secondary-button" disabled={restoring} onClick={() => setCandidate(null)}>Keep current farm</button></div></div>}
      <p className="menu-shortcut">Keyboard: Tab moves between controls, Enter or Space activates them, and Escape closes this guide. Press F to toggle fullscreen.</p>
    </section>
  </GameDialog>
}
