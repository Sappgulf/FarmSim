import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

export function GameDialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    const element = dialog.current!
    element.showModal()
    element.querySelector<HTMLElement>('[data-dialog-close]')?.focus()
    return () => {
      element.close()
      if (opener?.isConnected) opener.focus({ preventScroll: true })
    }
  }, [])

  return <dialog ref={dialog} className="game-dialog" aria-labelledby="game-dialog-title" onCancel={(event) => { event.preventDefault(); onClose() }}>
    <div className="game-dialog-heading"><h2 id="game-dialog-title">{title}</h2><button type="button" className="icon-button" aria-label="Close dialog" onClick={onClose} data-dialog-close><X size={22} /></button></div>
    {children}
  </dialog>
}
