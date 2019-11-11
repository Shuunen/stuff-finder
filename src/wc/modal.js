class AppModal extends HTMLElement {
  get style () {
    return `
    .${this._id} {
      background-color: var(--color-white, whitesmoke);
      border: .3rem solid var(--color-primary, steelblue);
      border-radius: var(--border-radius, .3rem);
      max-height: 90%;
      max-width: 50rem;
      overflow: auto;
      padding: .7rem 2rem 1rem;
      width: var(--settings-width, 80vw);
      z-index: var(--elevation-giraffe, 100);
    }
    @media only screen and (max-width: 600px) {
      .${this._id} {
        max-height: inherit;
        max-width: inherit;
        min-width: var(--settings-width, 80vw);
        padding: 0 .5rem;
        width: auto;
      }
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
    if (!this.els.wrapper.classList.contains('hidden')) {
      return this.warn('cannot open an already visible modal')
    }
    this.els.wrapper.classList.remove('hidden')
  }

  close () {
    if (this.els.wrapper.classList.contains('hidden')) {
      return // this.warn('cannot close an already hidden modal')
    }
    this.emit('fade-out', this.els.wrapper)
  }

  createWrapper () {
    const wrapper = document.createElement('div')
    wrapper.className = 'backdrop hidden'
    wrapper.onclick = () => this.emit('app-modal--close')
    const style = document.createElement('style')
    style.innerHTML = this.style
    wrapper.appendChild(style)
    return wrapper
  }

  createModal () {
    const modal = document.createElement('div')
    modal.className = `${this._id} col`
    modal.onclick = event => event.stopPropagation()
    return modal
  }

  connectedCallback () {
    this.els.wrapper = this.createWrapper()
    this.els.modal = this.createModal()
    this.els.modal.innerHTML = this.innerHTML
    this.els.wrapper.appendChild(this.els.modal)
    this.parentNode.replaceChild(this.els.wrapper, this)
  }
}

window.customElements.define('app-modal', AppModal)
