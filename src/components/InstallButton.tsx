"use client"

import { useEffect, useState } from "react"

// Botão "Instalar app". Android/Chrome: usa o beforeinstallprompt nativo.
// iOS (sem prompt): mostra dica de "Compartilhar → Adicionar à Tela de Início".
// Se já estiver instalado (standalone), não renderiza nada.
interface BIPEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export default function InstallButton() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [standalone, setStandalone] = useState(false)
  const [dicaIOS, setDicaIOS] = useState(false)

  useEffect(() => {
    const nav = window.navigator as Navigator & { standalone?: boolean }
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true
    // detecção de ambiente só roda no cliente, uma vez no mount
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStandalone(isStandalone)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent))

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BIPEvent)
    }
    window.addEventListener("beforeinstallprompt", onPrompt)
    const onInstalled = () => setStandalone(true)
    window.addEventListener("appinstalled", onInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  // já instalado → some
  if (standalone) return null
  // sem prompt nativo e não-iOS (ex: desktop já instalável vem por prompt) → some
  if (!deferred && !isIOS) return null

  async function instalar() {
    if (deferred) {
      await deferred.prompt()
      await deferred.userChoice
      setDeferred(null)
    } else if (isIOS) {
      setDicaIOS((v) => !v)
    }
  }

  return (
    <div className="mt-4">
      <button
        onClick={instalar}
        className="zine-edge w-full py-3 bg-grafite-2 border-2 border-laranja text-creme brand-lockup text-lg rounded-2xl active:scale-95 active:shadow-none transition-all flex items-center justify-center gap-2"
      >
        📲 Instalar app
      </button>
      {dicaIOS && (
        <p className="text-creme-soft/70 text-xs font-mono mt-2 text-center leading-relaxed">
          no iPhone: toca em <span className="text-laranja">Compartilhar ⬆️</span> → <span className="text-laranja">Adicionar à Tela de Início</span>
        </p>
      )}
    </div>
  )
}
