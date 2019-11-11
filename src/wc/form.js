class AppForm extends HTMLElement {
  get name () {
    return this.getAttribute('name')
  }

  get title () {
    return this.getAttribute('title')
  }

  get data () {
    const data = {}
    Array.from(this.els.form.elements).forEach(el => (data[el.name] = el.value))
    return data
  }

  set data (data) {
    Object.entries(data).forEach(entry => {
      const [key, value] = entry
      Array.from(this.els.form.elements).find(el => el.name === key).value = value
    })
    this.validate()
  }

  set error (message) {
    this.els.error.textContent = message
  }

  constructor () {
    super()
    this._id = `app-form--${this.name}`
    this.els = {}
    this.on(`${this._id}--set`, data => (this.data = data))
    this.on(`${this._id}--error`, message => (this.error = message))
  }

  emit (eventName, eventData) {
    console.log(`emit event "${eventName}"`, eventData || '')
    window.dispatchEvent(new CustomEvent(eventName, { detail: eventData }))
  }

  on (eventName, callback) {
    window.addEventListener(eventName, event => callback.bind(this)(event.detail))
  }

  createForm () {
    const form = document.createElement('form')
    form.innerHTML = this.innerHTML
    form.className = 'app-form'
    return form
  }

  createHeader () {
    const row = document.createElement('div')
    const title = document.createElement('h2')
    title.textContent = this.title || this.name
    row.appendChild(title)
    const error = document.createElement('p')
    error.className = 'error'
    row.appendChild(error)
    this.els.error = error
    return row
  }

  createFooter () {
    const row = document.createElement('div')
    row.className = 'row center mts'
    const close = document.createElement('button')
    close.innerHTML = '&times; Close'
    close.onclick = () => this.emit('app-modal--close')
    row.appendChild(close)
    const save = document.createElement('button')
    save.innerHTML = 'Save &check;'
    save.onclick = () => this.emit(`${this._id}--save`, this.data)
    save.setAttribute('disabled', true)
    this.els.form.onchange = this.els.form.onkeyup = () => this.validate()
    row.appendChild(save)
    this.els.save = save
    return row
  }

  validate () {
    if (this.els.form.checkValidity()) {
      this.els.save.removeAttribute('disabled')
    } else {
      this.els.save.setAttribute('disabled', true)
    }
  }

  connectedCallback () {
    this.els.form = this.createForm()
    this.els.header = this.createHeader()
    this.els.footer = this.createFooter()
    this.innerHTML = ''
    this.appendChild(this.els.form)
    this.parentElement.prepend(this.els.header)
    this.parentElement.append(this.els.footer)
  }
}

window.customElements.define('app-form', AppForm)
