import { on, p, sleep, tw } from 'shuutils'
import { fadeIn, fadeOut } from '../utils'

window.customElements.define('app-toaster', class extends HTMLElement {
  async showToast (event: AppToasterShowEvent): Promise<void> {
    const { type = 'info', message = 'no message provided', delay = 3000 } = event
    const custom = tw(type === 'info' ? 'from-purple-400 to-purple-700' : 'from-red-400 to-red-700')
    const toast = p(`app-toast app-hide bg-gradient-to-tr ${custom} mt-2 rounded px-4 py-1 text-center font-mono text-white shadow`, message)
    if (type === 'success') toast.innerHTML += '✔️'
    this.append(toast)
    fadeIn(toast)
    toast.addEventListener('click', () => fadeOut(toast, true))
    if (type === 'error') return
    await sleep(delay)
    fadeOut(toast, true)
  }
  connectedCallback (): void {
    this.className = tw('absolute bottom-5 z-50')
    on<AppToasterShowEvent>('app-toaster--show', this.showToast.bind(this))
  }
})
