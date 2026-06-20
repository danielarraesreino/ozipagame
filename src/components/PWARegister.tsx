"use client"

import { useEffect } from "react"

// Registra o service worker (/sw.js). Sem UI. Montado no layout raiz.
export default function PWARegister() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return
    const reg = () => navigator.serviceWorker.register("/sw.js").catch(() => {})
    if (document.readyState === "complete") reg()
    else {
      window.addEventListener("load", reg)
      return () => window.removeEventListener("load", reg)
    }
  }, [])
  return null
}
