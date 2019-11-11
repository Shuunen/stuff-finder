class AppToaster extends HTMLElement {
  get style () {
    return `
    .${this._id} {
      bottom: 1rem;
      position: absolute;
      width: 100%;
      z-index: var(--elevation-child, 30);
    }
    .${this._id} .toast {
      font-weight: bold;
      margin: .5rem 0;
      padding: .2rem .4rem;
    }
    .${this._id} .toast.error {
      background-color: var(--color-error, #da0000);
      color: var(--color-white);
    }`
  }

  constructor () {
    super()
    this._id = 'app-toaster'
    this.els = {}
    this.on(`${this._id}--show`, this.show)
  }

  emit (eventName, eventData) {
    console.log(`emit event "${eventName}"`, eventData === undefined ? '' : eventData)
    window.dispatchEvent(new CustomEvent(eventName, { detail: eventData }))
  }

  on (eventName, callback) {
    window.addEventListener(eventName, event => callback.bind(this)(event.detail))
  }

  show (data) {
    const { type = 'info', message = 'no message provided', delay = 3000 } = data
    console.log(`show toast type "${type}" with a delay of ${delay}ms`)
    const toast = document.createElement('p')
    toast.classList.add('toast', type)
    toast.innerHTML = message
    if (type === 'success') {
      toast.innerHTML += '✔️'
    }
    this.els.wrapper.appendChild(toast)
    toast.addEventListener('click', () => this.emit('fade-out-destroy', toast))
    if (type === 'error') {
      return
    }
    setTimeout(() => this.emit('fade-out', toast), delay)
  }

  createWrapper () {
    const wrapper = document.createElement('div')
    wrapper.className = `${this._id} col center`
    const style = document.createElement('style')
    style.innerHTML = this.style
    wrapper.appendChild(style)
    return wrapper
  }

  connectedCallback () {
    this.els.wrapper = this.createWrapper()
    this.parentNode.replaceChild(this.els.wrapper, this)
  }
}

window.customElements.define('app-toaster', AppToaster)
