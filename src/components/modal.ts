import { div, emit, h2, link, on, tw } from 'shuutils'
import { fadeIn, fadeOut, find } from '../utils'

window.customElements.define('app-modal', class extends HTMLElement {

  private active = false

  private backdrop = div('app-backdrop app-hide pointer-events-none fixed top-0 left-0 z-20 flex h-full w-full flex-col items-center justify-center bg-black/50 align-middle')

  private modal = div('app-modal')

  private get name (): string {
    return this.getAttribute('name') ?? 'no-name-provided'
  }

  public connectedCallback (): void {
    const id = `app-modal--${this.name}`
    on<AppModalOpenEvent>(`${id}--open`, this.show.bind(this))
    on<AppModalCloseEvent>(`${id}--close`, this.hide.bind(this))
    on<AppModalCloseEvent>('app-modal--close', this.hide.bind(this))
    this.backdrop.dataset['action'] = `${id}--close`
    // eslint-disable-next-line unicorn/no-keyword-prefix
    this.backdrop.className = this.name + ' ' + this.backdrop.className
    this.modal = this.createModal(id)
    this.backdrop.append(this.modal)
    if (!this.parentNode) throw new Error('no parentNode for app-modal')
    this.parentNode.replaceChild(this.backdrop, this)
    emit<AppModalReadyEvent>(`${id}--ready`)
  }

  private createModal (id: string): HTMLDivElement {
    const modal = div(`app-modal ${id} relative z-50 m-4 flex w-full flex-col overflow-hidden rounded bg-white p-4 shadow-md md:w-auto ${this.className}`, this.innerHTML)
    const close = link(tw('app-close absolute !border-b-0 top-2 right-5 font-mono text-4xl opacity-50 md:text-2xl'), 'x', '#')
    modal.append(close)
    const title = this.dataset['title']
    if (title !== undefined) modal.prepend(h2('app-header mx-20 mb-4 text-center text-2xl leading-7 text-purple-700', title))
    close.dataset['action'] = `${id}--close`
    return modal
  }

  private toggle (active: boolean): void {
    if (active === this.active) return
    this.active = active
    document.body.classList.toggle('overflow-hidden', active)
    this.modal.classList.toggle('visible', active)
    this.modal.classList.toggle('hidden', !active)
    this.backdrop.classList.toggle('pointer-events-none', !active)
    if (!active) return void fadeOut(this.backdrop)
    void fadeIn(this.backdrop)
    const scrollable = find.oneOrNone('.overflow-auto, .overflow-y', this.modal)
    if (scrollable) scrollable.scrollTop = 0
  }

  private show (): void {
    this.toggle(true)
  }

  private hide (): void {
    this.toggle(false)
  }
})
