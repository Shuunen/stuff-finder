import { div, emit, h2, link, on } from 'shuutils'

window.customElements.define('app-modal', class extends HTMLElement {
  createModal (id: string) {
    const modal = div(`${id} flex flex-col bg-white relative overflow-hidden rounded`, this.innerHTML)
    const close = link('close absolute text-2xl font-mono top-2 right-5', 'x', '#')
    modal.append(close)
    if (this.dataset.title) modal.append(h2('header text-2xl my-2 text-center', this.dataset.title))
    close.addEventListener('click', () => emit('app-modal--close'))
    modal.addEventListener('click', event => event.stopPropagation())
    return modal
  }
  connectedCallback () {
    const id = `app-modal--${this.getAttribute('name')}`
    const wrapper = div('backdrop hidden z-20 fixed bg-black bg-opacity-50 top-0 left-0 w-full h-full flex flex-col items-center justify-center align-middle')
    wrapper.addEventListener('click', () => emit('app-modal--close'))
    on(`${id}--open`, () => wrapper.classList.remove('hidden'))
    on('app-modal--close', () => emit('fade-out', wrapper))
    wrapper.append(this.createModal(id))
    this.parentNode.replaceChild(wrapper, this)
    emit(`${id}--ready`)
  }
})
