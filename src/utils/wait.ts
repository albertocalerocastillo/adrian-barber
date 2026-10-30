/**
 * Espera `ms` milisegundos. Es el único sitio con setTimeout: el resto del
 * código hace `await wait(...)`, como pide la wiki.
 *
 * Si se pasa `signal` y se aborta antes de tiempo, la espera termina en ese
 * momento (sin error); quien espera mira `signal.aborted` para no seguir.
 */
export const wait = (ms: number, signal?: AbortSignal): Promise<void> => {
  const result = new Promise<void>((resolve) => {
    if (signal?.aborted) {
      resolve()
      return
    }
    const id = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(id)
        resolve()
      },
      { once: true }
    )
  })
  return result
}
