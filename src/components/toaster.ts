import { on, sleep, text, tw } from 'shuutils'
import type { AppToasterShowEvent } from '../types'
import { fadeIn, fadeOut } from '../utils/browser.utils'

window.customElements.define('app-toaster', class extends HTMLElement {

  public connectedCallback () {
    // eslint-disable-next-line unicorn/no-keyword-prefix
    this.className = tw('absolute bottom-5 z-50')
    on<AppToasterShowEvent>('app-toaster--show', this.showToast.bind(this))
  }

  private async showToast (event: AppToasterShowEvent) {
    const { type = 'info', message = 'no message provided', delay = 3000 } = event
    const custom = tw(type === 'info' ? 'from-purple-400 to-purple-700' : 'from-red-400 to-red-700')
    const toast = text(`app-toast app-hide bg-gradient-to-tr ${custom} mt-2 rounded px-4 py-1 text-center font-mono text-white shadow`, message)
    if (type === 'success') toast.innerHTML += '✔️'
    this.append(toast)
    await fadeIn(toast)
    toast.addEventListener('click', () => { void fadeOut(toast, true) })
    if (type === 'error') return
    await sleep(delay)
    await fadeOut(toast, true)
  }
})
