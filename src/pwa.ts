import { registerSW } from 'virtual:pwa-register'

export function setupPwa(): void {
  registerSW({ immediate: true })
}
