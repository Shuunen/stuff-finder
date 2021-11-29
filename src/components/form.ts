import { debounce, div, dom, emit, h2, on, p } from 'shuutils'
import { button } from '../utils'

class AppForm extends HTMLElement {
  _id = ''
  els: {
    error?: HTMLParagraphElement,
    header?: HTMLHeadingElement,
    form?: HTMLFormElement,
    footer?: HTMLDivElement,
    save?: HTMLButtonElement
  } = {}
  initialData: Record<string, string | boolean> = {}
  // eslint-disable-next-line unicorn/consistent-function-scoping
  validate = debounce(() => this.validateSync(), 200)

  get name () {
    return this.getAttribute('name')
  }

  get title (): string {
    return this.getAttribute('title') === 'false' ? '' : (this.getAttribute('title') || '')
  }

  get inline () {
    return this.getAttribute('inline') === 'true'
  }

  get onCloseEventName () {
    return this.getAttribute('on-close') || 'app-modal--close'
  }

  get onSaveEventName () {
    return this.getAttribute('on-save') || `${this._id}--save`
  }

  get inputs (): HTMLInputElement[] {
    return [...this.els.form?.elements as unknown as HTMLInputElement[]]
  }

  get data (): Record<string, string | boolean> {
    const data: Record<string, string | boolean> = {}
    this.inputs.forEach(input => {
      let value: string | boolean = input.value
      if (input.type === 'checkbox') value = input.checked
      data[input.name] = value
    })
    return data
  }

  set data (data) {
    Object.entries(data).forEach(entry => {
      const [key, value = ''] = entry
      const input = this.inputs.find(input => (input.name === key))
      if (input) input.value = value as string
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
    const row = div('flex justify-center mt-4')
    if (this.inline) row.classList.add('hidden')
    else row.append(this.createClose())
    const save = button('Save', 'save ml-4')
    save.addEventListener('click', () => this.onSave())
    save.setAttribute('disabled', String(true))
    this.els.form?.addEventListener('keyup', () => this.validate())
    this.els.form?.addEventListener('change', () => this.validate())
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
    this.initialData = this.data
    this.validateSync()
    emit(`${this._id}--ready`)
  }
}

setTimeout(() => window.customElements.define('app-form', AppForm), 200)
