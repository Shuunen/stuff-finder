import { on, p, sleep } from 'shuutils'
import { fadeIn, fadeOut } from '../utils'

window.customElements.define('app-toaster', class extends HTMLElement {
  async show (data): Promise<void> {
    const { type = 'info', message = 'no message provided', delay = 3000 } = data
    const custom = type === 'info' ? 'from-purple-400 to-purple-700' : 'from-red-400 to-red-700'
    const toast = p(`toast hide shadow bg-gradient-to-tr text-center text-white px-4 py-1 rounded mt-2 font-mono ${custom}`, message)
    if (type === 'success') toast.innerHTML += '✔️'
    this.append(toast)
    fadeIn(toast)
    toast.addEventListener('click', () => fadeOut(toast, true))
    if (type === 'error') return
    await sleep(delay)
    fadeOut(toast, true)
  }
  connectedCallback (): void {
    this.className = 'absolute bottom-5'
    on('app-toaster--show', data => this.show(data))
  }
})
