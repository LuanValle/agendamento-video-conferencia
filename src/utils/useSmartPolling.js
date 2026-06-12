import { useEffect } from 'react'

export function useSmartPolling(callback, intervalMs = 5000) {
  useEffect(() => {
    let intervalId
    let isStopped = false

    const run = () => {
      if (!document.hidden) callback()
    }

    // Executa ao entrar na tela e depois respeita se a aba estiver ativa.
    run()
    intervalId = setInterval(run, intervalMs)

    const handleVisibilityChange = () => {
      if (!document.hidden && !isStopped) callback()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isStopped = true
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [callback, intervalMs])
}
