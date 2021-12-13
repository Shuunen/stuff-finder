import { debounce, div, dom, emit, h2, on, p } from 'shuutils'
import { button, showError } from '../utils'

class AppForm extends HTMLElement {
  _id = ''
  els: {
    error?: HTMLParagraphElement,
    header?: HTMLHeadingElement,
    form?: HTMLFormElement,
    footer?: HTMLDivElement,
    save?: HTMLButtonElement
  } = {}
  initialData: Record<string, string | boolean | number | string[]> = {}
  validate = debounce(() => this.validateSync(), 200) // eslint-disable-line unicorn/consistent-function-scoping
  get name () { return this.getAttribute('name') }
  get saveLabel () { return this.getAttribute('save-label') || 'Save' }
  get title (): string { return this.getAttribute('title') === 'false' ? '' : (this.getAttribute('title') || '') }
  get inline () { return this.getAttribute('inline') === 'true' }
  get onCloseEventName () { return this.getAttribute('on-close') || 'app-modal--close' }
  get onSaveEventName () { return this.getAttribute('on-save') || `${this._id}--save` }
  get inputs (): HTMLInputElement[] { return [...this.els.form?.elements as unknown as HTMLInputElement[]] }
  get data (): Record<string, string | boolean | number | string[]> {
    const data: Record<string, string | boolean | number> = {}
    this.inputs.forEach(input => {
      let value: string | boolean | number | string[] = input.value
      if (input.type === 'checkbox') value = input.checked
      else if (input.type === 'number') value = Number.parseFloat(value)
      data[input.name] = value
    })
    return data
  }
  set data (data) {
    Object.entries(data).forEach(entry => {
      const [key, value = ''] = entry
      const input = this.inputs.find(input => (input.name === key))
      if (input)
        if (key === 'photo') this.setPhoto(input, value)
        else if (input.type === 'checkbox') setTimeout(() => { input.checked = String(value) === 'true' }, 100) // need to be async ¯\_(ツ)_/¯
        else input.value = value as string
    })
    this.validateSync()
  }
  get dataChanged () {
    return JSON.stringify(this.initialData) !== JSON.stringify(this.data)
  }
  get error () {
    return this.els.error?.textContent
  }
  set error (message) {
    if (this.els.error) this.els.error.textContent = message || ''
  }
  createClose () {
    const element = button('Cancel', 'close', true)
    element.addEventListener('click', () => emit(this.onCloseEventName))
    return element
  }
  createFooter () {
    const row = div('footer flex justify-center mt-4')
    if (this.inline) row.classList.add('hidden')
    else row.append(this.createClose())
    const save = button(this.saveLabel, 'save ml-4')
    save.addEventListener('click', () => this.onSave())
    save.setAttribute('disabled', String(true))
    this.els.form?.addEventListener('keyup', () => this.validate())
    this.els.form?.addEventListener('change', () => this.validateSync())
    row.append(save)
    this.els.save = save
    return row
  }
  onSave () {
    emit(this.onSaveEventName, this.data)
    this.els.footer?.classList.add('hidden')
  }
  destroy () {
    this.els.form?.remove()
    this.els.header?.remove()
    this.els.footer?.remove()
    this.remove()
  }
  validateSync () {
    const isValid = this.els.form?.checkValidity()
    console.log(`form is ${isValid ? 'valid' : 'invalid'}`)
    if (isValid) this.els.save?.removeAttribute('disabled')
    else this.els.save?.setAttribute('disabled', String(true))
    if (this.inline) this.els.footer?.classList.toggle('hidden', !(this.dataChanged && isValid))
    this.setAttribute('valid', String(isValid))
  }
  setPhoto (input: HTMLInputElement, data: string | boolean | number | string[]) {
    if (['boolean', 'number'].includes(typeof data)) return console.error('photo data must be a string or array')
    let url = ''
    if (typeof data === 'string') url = data
    else if (Array.isArray(data)) {
      const photo = data[0] as unknown as ItemPhoto
      url = photo.url
    } else return showError('unhandled case where photo data is neither string or array')
    input.value = url
    console.log('set photo', url, input)
    const img = this.els.form.querySelector('img')
    if (!img) return showError(`wanted to set "${url}" but no img found`)
    img.src = url
  }
  connectedCallback () {
    this._id = `app-form--${this.name}`
    on(`${this._id}--set`, data => { this.data = data })
    on(`${this._id}--error`, message => { this.error = message })
    this.els.form = dom('form', this.className, this.innerHTML)
    this.removeAttribute('class')
    this.innerHTML = ''
    this.append(this.els.form)
    this.els.error = p('error')
    this.els.form.parentElement?.append(this.els.error)
    if (!this.inline && this.dataset.title) {
      this.els.header = h2('header text-purple-700 text-2xl mt-2 mb-4 text-center', this.dataset.title)
      this.parentElement?.prepend(this.els.header)
    }
    this.els.footer = this.createFooter()
    this.els.form.parentElement?.append(this.els.footer)
    this.els.form.addEventListener('submit', event => { event.preventDefault() })
    this.initialData = this.data
    this.validateSync()
    emit(`${this._id}--ready`)
  }
}

setTimeout(() => window.customElements.define('app-form', AppForm), 200)
