import { useEffect } from 'react'

export function useSmartPolling(callback, intervalMs = 5000) {
  useEffect(() => {
    let intervalId
    let isStopped = false
    let isRunning = false

    const run = async () => {
      if (document.hidden || isRunning || isStopped) return

      try {
        isRunning = true
        await callback()
      } finally {
        isRunning = false
      }
    }

    // Executa ao entrar na tela e depois respeita se a aba estiver ativa.
    run()
    intervalId = setInterval(run, intervalMs)

    const handleVisibilityChange = () => {
      run()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isStopped = true
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [callback, intervalMs])
}
