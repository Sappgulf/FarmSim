import { useCallback, useEffect, useRef, useState } from 'react'
import type { FarmState } from '../data'
import { STORAGE_KEY } from '../state'
import { writeFarmState, type FarmSession } from '../storage'

export function useFarmSave(state: FarmState, session: FarmSession) {
  const [warning, setWarning] = useState(session.warning)
  const [canRetry, setCanRetry] = useState(false)
  const [canRestore, setCanRestore] = useState(session.canSave)
  const expectedValue = useRef(session.savedValue)
  const blocked = useRef(!session.canSave)

  const persist = useCallback((farm: FarmState, backupExisting = false) => {
    const unavailable = () => {
      setWarning('Changes are not saving. Download a backup or retry when storage is available.')
      setCanRetry(true)
      return false
    }
    const commit = () => {
      if (blocked.current) return false
      const result = writeFarmState(farm, expectedValue.current, undefined, backupExisting)
      if (result.status === 'saved') {
        expectedValue.current = result.value
        setWarning((current) => current.startsWith('Changes are not saving') ? '' : current)
        setCanRetry(false)
        return true
      }
      if (result.status === 'unavailable') return unavailable()
      blocked.current = true
      setCanRetry(false)
      setCanRestore(false)
      setWarning(result.status === 'conflict'
        ? 'Your saved farm changed in another tab. Saving is paused here. Download this session before reloading the saved farm.'
        : 'This save belongs to another game version. This session will not overwrite it. Download a backup to keep your progress.')
      return false
    }
    // Cooperating tabs serialize the read/compare/write sequence when Web Locks is available.
    return navigator.locks ? navigator.locks.request(STORAGE_KEY, commit).catch(unavailable) : commit()
  }, [])

  useEffect(() => { void persist(state) }, [state, persist])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY && event.key !== null) return
      try { if (event.storageArea && event.storageArea !== window.localStorage) return } catch { return }
      if (event.newValue === expectedValue.current) return
      blocked.current = true
      setCanRetry(false)
      setCanRestore(false)
      setWarning('Your saved farm changed in another tab. Saving is paused here. Download this session before reloading the saved farm.')
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return { warning, canRetry, canRestore, retry: () => persist(state), restore: (farm: FarmState) => persist(farm, true) }
}
