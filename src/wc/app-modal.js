import Model from './model'

class AppModal extends Model {
  get name () {
    return this.getAttribute('name')
  }

  constructor () {
    super()
    this.id = `app-modal--${this.name}`
    this.els = {}
    this.on(`${this.id}--open`, this.open)
    this.on('app-modal--close', this.close)
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
    return wrapper
  }

  createModal () {
    const modal = document.createElement('div')
    modal.className = 'app-modal col'
    modal.onclick = event => event.stopPropagation()
    return modal
  }

  connectedCallback () {
    this.log('connectedCallback')
    this.els.wrapper = this.createWrapper()
    this.els.modal = this.createModal()
    this.els.modal.innerHTML = this.innerHTML
    this.innerHTML = ''
    this.els.wrapper.appendChild(this.els.modal)
    this.appendChild(this.els.wrapper)
  }
}

window.customElements.define('app-modal', AppModal)
