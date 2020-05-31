/* global HTMLElement, CustomEvent */

class AppForm extends HTMLElement {
  get style () {
    return `
    .${this._id} {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
    }
    .${this._id} label {
      color: var(--color-primary, steelblue);
      margin-top: 1rem;
    }
    .${this._id} label > [name] {
      margin-top: .3rem;
    }
    @media only screen and (max-width: 600px) {
      .${this._id} label {
        width: 100% !important;
      }
    }`
  }

  get name () { return this.getAttribute('name') }
  get title () { return this.getAttribute('title') !== 'false' ? this.getAttribute('title') : '' }
  get inline () { return this.getAttribute('inline') === 'true' }
  get onCloseEventName () { return this.getAttribute('on-close') || 'app-modal--close' }
  get onSaveEventName () { return this.getAttribute('on-save') || `${this._id}--save` }

  get data () {
    const data = {}
    Array.from(this.els.form.elements).forEach(el => {
      let value = el.value
      if (el.type === 'checkbox') value = el.checked
      data[el.name] = value
    })
    return data
  }

  set data (data) {
    Object.entries(data).forEach(entry => {
      const [key, value] = entry
      Array.from(this.els.form.elements).find(el => el.name === key).value = value
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
    const style = document.createElement('style')
    style.innerHTML = this.style
    form.appendChild(style)
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
      close.onclick = () => this.emit(this.onCloseEventName)
      row.appendChild(close)
    }
    const save = document.createElement('button')
    save.className = 'save'
    save.innerHTML = 'Save &check;'
    save.onclick = () => this.onSave()
    save.setAttribute('disabled', true)
    this.els.form.onchange = this.els.form.onkeyup = () => this.validate()
    row.appendChild(save)
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

  connectedCallback () {
    this._id = `app-form--${this.name}`
    this.els = {}
    this.on(`${this._id}--set`, data => (this.data = data))
    this.on(`${this._id}--error`, message => (this.error = message))
    this.els.form = this.createForm()
    this.innerHTML = ''
    this.appendChild(this.els.form)
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
