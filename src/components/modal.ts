import { div, emit, h2, link, on } from 'shuutils'

window.customElements.define('app-modal', class extends HTMLElement {
  backdrop = div('backdrop opacity-0 pointer-events-none transition-opacity z-20 fixed bg-black bg-opacity-50 top-0 left-0 w-full h-full flex flex-col items-center justify-center align-middle')
  createModal (id: string) {
    const modal = div(`${id} w-full shadow-md z-50 md:w-auto flex flex-col m-4 p-4 bg-white relative overflow-hidden rounded ${this.className}`, this.innerHTML)
    const close = link('close absolute text-4xl md:text-2xl opacity-50 font-mono top-2 right-5', 'x', '#')
    modal.append(close)
    if (this.dataset.title) modal.prepend(h2('header text-purple-700 text-2xl mb-4 mx-20 leading-7 text-center', this.dataset.title))
    close.addEventListener('click', () => this.toggle(false))
    return modal
  }
  toggle (active: boolean) {
    document.body.classList.toggle('overflow-hidden', active)
    this.backdrop.classList.toggle('opacity-0', !active)
    this.backdrop.classList.toggle('pointer-events-none', !active)
  }
  connectedCallback () {
    const id = `app-modal--${this.getAttribute('name')}`
    on(`${id}--open`, () => this.toggle(true))
    on(`${id}--close`, () => this.toggle(false))
    on('app-modal--close', () => this.toggle(false))
    this.backdrop.dataset.action = `${id}--close`
    this.backdrop.className = this.getAttribute('name') + ' ' + this.backdrop.className
    this.backdrop.append(this.createModal(id))
    this.parentNode.replaceChild(this.backdrop, this)
    emit(`${id}--ready`)
  }
})
