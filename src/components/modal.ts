import { div, emit, h2, link, on, tw } from 'shuutils'
import type { AppModalCloseEvent, AppModalOpenEvent, AppModalReadyEvent } from '../types'
import { fadeIn, fadeOut, find } from '../utils/browser.utils'

window.customElements.define('app-modal', class extends HTMLElement {

  private isActive = false

  private readonly backdrop = div('app-backdrop app-hide pointer-events-none fixed top-0 left-0 z-20 flex h-full w-full flex-col items-center justify-center bg-black/50 align-middle')

  private modal = div('app-modal')

  private get name () {
    return this.getAttribute('name') ?? 'no-name-provided'
  }

  // eslint-disable-next-line max-statements
  public connectedCallback () {
    const id = `app-modal--${this.name}`
    on<AppModalOpenEvent>(`${id}--open`, this.show.bind(this))
    on<AppModalCloseEvent>(`${id}--close`, this.hide.bind(this))
    on<AppModalCloseEvent>('app-modal--close', this.hide.bind(this))
    this.backdrop.dataset.action = `${id}--close`
    // eslint-disable-next-line unicorn/no-keyword-prefix
    this.backdrop.className = `${this.name} ${this.backdrop.className}`
    this.modal = this.createModal(id)
    this.backdrop.append(this.modal)
    if (!this.parentNode) throw new Error('no parentNode for app-modal')
    this.parentNode.replaceChild(this.backdrop, this)
    emit<AppModalReadyEvent>(`${id}--ready`)
  }

  private createModal (id: string) {
    const modal = div(`app-modal ${id} relative z-50 m-4 flex w-full flex-col overflow-hidden rounded bg-white p-4 shadow-md md:w-auto ${this.className}`, this.innerHTML)
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const close = link(tw('app-close absolute top-2 right-5 !border-b-0 font-mono text-4xl opacity-50 md:text-2xl'), 'x', '#')
    modal.append(close)
    const { title } = this.dataset
    if (title !== undefined) modal.prepend(h2('app-header mx-20 mb-4 text-center text-2xl leading-7 text-purple-700', title))
    close.dataset.action = `${id}--close`
    return modal
  }

  // eslint-disable-next-line max-statements
  private toggle (isActive: boolean) {
    if (isActive === this.isActive) return
    this.isActive = isActive
    document.body.classList.toggle('overflow-hidden', isActive)
    this.modal.classList.toggle('visible', isActive)
    this.modal.classList.toggle('hidden', !isActive)
    this.backdrop.classList.toggle('pointer-events-none', !isActive)
    if (!isActive) { void fadeOut(this.backdrop); return }
    void fadeIn(this.backdrop)
    const scrollable = find.oneOrNone('.overflow-auto, .overflow-y', this.modal)
    if (scrollable) scrollable.scrollTop = 0
  }

  private show () {
    this.toggle(true)
  }

  private hide () {
    this.toggle(false)
  }
})
