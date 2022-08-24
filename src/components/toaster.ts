import { on, p, sleep } from 'shuutils'
import { fadeIn, fadeOut } from '../utils'

window.customElements.define('app-toaster', class extends HTMLElement {
  async show (event: AppToasterShowEvent): Promise<void> {
    const { type = 'info', message = 'no message provided', delay = 3000 } = event
    const custom = type === 'info' ? 'from-purple-400 to-purple-700' : 'from-red-400 to-red-700'
    const toast = p(`toast hide bg-gradient-to-tr ${custom} px-4 py-1 mt-2 font-mono text-center text-white rounded shadow`, message)
    if (type === 'success') toast.innerHTML += '✔️'
    this.append(toast)
    fadeIn(toast)
    toast.addEventListener('click', () => fadeOut(toast, true))
    if (type === 'error') return
    await sleep(delay)
    fadeOut(toast, true)
  }
  connectedCallback (): void {
    this.className = 'bottom-5 absolute z-50'
    on<AppToasterShowEvent>('app-toaster--show', event => this.show(event))
  }
})
