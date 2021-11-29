import { emit, on, p, sleep } from 'shuutils'

window.customElements.define('app-toaster', class extends HTMLElement {
  async show (data) {
    const { type = 'info', message = 'no message provided', delay = 3000 } = data
    const custom = type === 'info' ? 'from-purple-400 to-purple-700' : 'from-red-400 to-red-700'
    const toast = p(`toast shadow bg-gradient-to-tr text-center text-white px-4 py-1 rounded mt-2 font-mono ${custom}`, message)
    if (type === 'success') toast.innerHTML += '✔️'
    this.append(toast)
    toast.addEventListener('click', () => emit('fade-out-destroy', toast))
    if (type === 'error') return
    await sleep(delay)
    emit('fade-out-destroy', toast)
  }
  connectedCallback () {
    this.className = 'absolute bottom-5'
    on('app-toaster--show', data => this.show(data))
  }
})
