import { div, emit, h2, link, on, tw } from 'shuutils'
import { fadeIn, fadeOut } from '../utils'

window.customElements.define('app-modal', class extends HTMLElement {
  backdrop = div('app-backdrop app-hide pointer-events-none fixed top-0 left-0 z-20 flex h-full w-full flex-col items-center justify-center bg-black/50 align-middle')
  modal = div('app-modal')
  createModal (id: string): HTMLDivElement {
    const modal = div(`${id} relative z-50 m-4 flex w-full flex-col overflow-hidden rounded bg-white p-4 shadow-md md:w-auto ${this.className}`, this.innerHTML)
    const close = link(tw('app-close absolute top-2 right-5 font-mono text-4xl opacity-50 md:text-2xl'), 'x', '#')
    modal.append(close)
    if (this.dataset['title']) modal.prepend(h2('app-header mx-20 mb-4 text-center text-2xl leading-7 text-purple-700', this.dataset['title']))
    close.dataset['action'] = `${id}--close`
    return modal
  }
  toggle (active: boolean): void {
    document.body.classList.toggle('overflow-hidden', active)
    this.modal.classList.toggle('hidden', !active)
    this.backdrop.classList.toggle('pointer-events-none', !active)
    if (active) fadeIn(this.backdrop)
    else fadeOut(this.backdrop)
  }
  connectedCallback (): void {
    const id = `app-modal--${this.getAttribute('name')}`
    on(`${id}--open`, () => this.toggle(true))
    on(`${id}--close`, () => this.toggle(false))
    on('app-modal--close', () => this.toggle(false))
    this.backdrop.dataset['action'] = `${id}--close`
    this.backdrop.className = this.getAttribute('name') + ' ' + this.backdrop.className
    this.modal = this.createModal(id)
    this.backdrop.append(this.modal)
    if (!this.parentNode) throw new Error('no parentNode for app-modal')
    this.parentNode.replaceChild(this.backdrop, this)
    emit(`${id}--ready`)
  }
})
