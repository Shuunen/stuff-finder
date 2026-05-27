import { nbDaysInWeek, sleep } from 'shuutils'

export const mockFetch = vi.fn(async (input: RequestInfo | URL, options?: RequestInit) => {
  await sleep(nbDaysInWeek)
  return {
    blob: async () => {
      await sleep(nbDaysInWeek)
      return { input, options }
    },
  } as unknown as Promise<Response>
})
