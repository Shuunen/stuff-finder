import { on, sleep, text, tw } from 'shuutils'
import type { AppToasterShowEvent } from '../types'
import { fadeIn, fadeOut } from '../utils/browser.utils'

window.customElements.define('app-toaster', class extends HTMLElement {

  public connectedCallback () {
    // eslint-disable-next-line unicorn/no-keyword-prefix
    this.className = tw('absolute bottom-5 left-0 z-50 flex w-full justify-center')
    on<AppToasterShowEvent>('app-toaster--show', this.showToast.bind(this))
  }

  private async showToast (event: AppToasterShowEvent) {
    const { delay = 3000, message = 'no message provided', type = 'info' } = event
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
