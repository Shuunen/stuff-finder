/* global HTMLElement, CustomEvent */

class AppModal extends HTMLElement {
  get style () {
    return `.${this._id} {
      background-color: var(--color-white, whitesmoke);
      border: .3rem solid var(--color-primary, steelblue);
      border-radius: var(--border-radius, .3rem);
      max-height: 90%;
      max-width: 70rem;
      overflow: auto;
      z-index: var(--elevation-giraffe, 100);
    }`
  }

  get name () {
    return this.getAttribute('name')
  }

  constructor () {
    super()
    this._id = `app-modal--${this.name}`
    this.els = {}
    this.on(`${this._id}--open`, this.open)
    this.on(`${this._id}--close`, this.close)
    this.on('app-modal--close', this.close)
  }

  emit (eventName, eventData) {
    console.log(`emit event "${eventName}"`, eventData === undefined ? '' : eventData)
    window.dispatchEvent(new CustomEvent(eventName, { detail: eventData }))
  }

  on (eventName, callback) {
    window.addEventListener(eventName, event => callback.bind(this)(event.detail))
  }

  open () {
    this.els.wrapper.classList.remove('hidden')
  }

  close () {
    if (this.els.wrapper.classList.contains('hidden')) {
      return // this.warn('cannot close an already hidden modal')
    }
    this.emit(`${this._id}--closed`)
    this.emit('fade-out', this.els.wrapper)
  }

  createWrapper () {
    const wrapper = document.createElement('div')
    wrapper.className = 'backdrop hidden'
    wrapper.addEventListener('click', () => this.emit('app-modal--close'))
    const style = document.createElement('style')
    style.innerHTML = this.style
    wrapper.append(style)
    return wrapper
  }

  createModal () {
    const modal = document.createElement('div')
    modal.className = `${this._id} col`
    modal.addEventListener('click', event => event.stopPropagation())
    return modal
  }

  connectedCallback () {
    this.els.wrapper = this.createWrapper()
    this.els.modal = this.createModal()
    this.els.modal.innerHTML = this.innerHTML
    this.els.wrapper.append(this.els.modal)
    this.parentNode.replaceChild(this.els.wrapper, this)
  }
}

setTimeout(() => window.customElements.define('app-modal', AppModal), 10)
