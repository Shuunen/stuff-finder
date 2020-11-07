/* global HTMLElement, CustomEvent */

class AppForm extends HTMLElement {
  get name () { return this.getAttribute('name') }
  get columns () { return this.getAttribute('columns') || '1fr' }
  get title () { return this.getAttribute('title') !== 'false' ? this.getAttribute('title') : '' }
  get inline () { return this.getAttribute('inline') === 'true' }
  get onCloseEventName () { return this.getAttribute('on-close') || 'app-modal--close' }
  get onSaveEventName () { return this.getAttribute('on-save') || `${this._id}--save` }

  get style () {
    return `app-form form { display: grid; grid-gap: 1rem; }
    @media only screen and (max-width: 600px) {
      app-form form { grid-template-columns: 1fr !important; }
    }`
  }

  get data () {
    const data = {}
    ;[...this.els.form.elements].forEach(element => {
      let value = element.value
      if (element.type === 'checkbox') value = element.checked
      data[element.name] = value
    })
    return data
  }

  set data (data) {
    Object.entries(data).forEach(entry => {
      const [key, value] = entry
      ;[...this.els.form.elements].find(element => element.name === key).value = value
    })
    this.validate()
  }

  get dataChanged () {
    return JSON.stringify(this.initialData) !== JSON.stringify(this.data)
  }

  get error () { return this.els.error.textContent }
  set error (message) { this.els.error.textContent = message }

  emit (eventName, eventData) {
    console.log(`emit event "${eventName}"`, eventData === undefined ? '' : eventData)
    window.dispatchEvent(new CustomEvent(eventName, { detail: eventData }))
  }

  on (eventName, callback) {
    window.addEventListener(eventName, event => callback.bind(this)(event.detail))
  }

  createForm () {
    const form = document.createElement('form')
    form.innerHTML = this.innerHTML
    form.className = this._id
    form.style = 'grid-template-columns: ' + this.columns
    const style = document.createElement('style')
    style.innerHTML = this.style
    form.append(style)
    return form
  }

  createHeader () {
    const title = document.createElement('h2')
    title.textContent = this.title
    return title
  }

  createFooter () {
    const row = document.createElement('div')
    row.className = 'row center mts mb1'
    if (this.inline) {
      row.classList.add('hidden')
    } else {
      const close = document.createElement('button')
      close.className = 'close'
      close.innerHTML = '&times; Cancel'
      close.addEventListener('click', () => this.emit(this.onCloseEventName))
      row.append(close)
    }
    const save = document.createElement('button')
    save.className = 'save'
    save.innerHTML = 'Save &check;'
    save.addEventListener('click', () => this.onSave())
    save.setAttribute('disabled', true)
    this.els.form.addEventListener('change', this.els.form.addEventListener('keyup', () => this.validate()))
    row.append(save)
    this.els.save = save
    return row
  }

  onSave () {
    this.emit(this.onSaveEventName, this.data)
    this.els.footer.classList.add('hidden')
  }

  destroy () {
    this.els.form.remove()
    this.els.header.remove()
    this.els.footer.remove()
    this.remove()
  }

  validate () {
    const isValid = this.els.form.checkValidity()
    if (isValid) {
      this.els.save.removeAttribute('disabled')
    } else {
      this.els.save.setAttribute('disabled', true)
    }
    if (this.inline) this.els.footer.classList.toggle('hidden', !(this.dataChanged && isValid))
    this.setAttribute('valid', isValid)
  }

  // when copy pasting from a spreadsheet entry, values are like : "appABC keyXYZ tableName viewName"
  handleMultiPaste () {
    const input = this.els.form.querySelector('label > input[multi-paste]')
    if (!input) return
    const inputs = this.els.form.querySelectorAll('label > input')
    console.log('handle multi paste from', input, 'and others', inputs)
    input.removeAttribute('multi-paste')
    const multiRegex = /"(\w+) (\w+) ([\w-]+) ([\w-]+)"/
    input.addEventListener('change', () => { if (multiRegex.test(input.value)) this.onMultiPaste(input.value.match(multiRegex).splice(1, 4), inputs) })
  }

  onMultiPaste (values, inputs) {
    console.log('multi paste detected, applying values', values, 'to', inputs)
    inputs.forEach((input, index) => {
      if (values[index]) input.value = values[index]
    })
  }

  connectedCallback () {
    this._id = `app-form--${this.name}`
    this.els = {}
    this.on(`${this._id}--set`, data => (this.data = data))
    this.on(`${this._id}--error`, message => (this.error = message))
    this.els.form = this.createForm()
    this.innerHTML = ''
    this.append(this.els.form)
    this.handleMultiPaste()
    this.els.error = document.createElement('p')
    this.els.error.className = 'error'
    this.els.form.parentElement.append(this.els.error)
    if (!this.inline) {
      this.els.header = this.createHeader()
      this.parentElement.prepend(this.els.header)
    }
    this.els.footer = this.createFooter()
    this.els.form.parentElement.append(this.els.footer)
    this.initialData = this.data
    this.validate()
  }
}

setTimeout(() => window.customElements.define('app-form', AppForm), 200)
