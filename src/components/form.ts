import { debounce, div, dom, emit, h2, on, p } from 'shuutils'
import { DEFAULT_IMAGE } from '../constants'
import { button, showError, valuesToOptions } from '../utils'

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
  get name (): string { return this.getAttribute('name') ?? 'unknown' }
  get saveLabel (): string { return this.getAttribute('save-label') || 'Save' }
  override get title (): string { return this.getAttribute('title') === 'false' ? '' : (this.getAttribute('title') || '') }
  get inline (): boolean { return this.getAttribute('inline') === 'true' }
  get onCloseEventName (): string { return this.getAttribute('on-close') || `${this._id}--close` }
  get onSaveEventName (): string { return this.getAttribute('on-save') || `${this._id}--save` }
  get inputs (): HTMLInputElement[] { return [...this.els.form?.elements as unknown as HTMLInputElement[]] }
  get data (): AppFormData {
    const data: AppFormData = {}
    this.inputs.forEach(input => {
      let value: AppFormDataValue = input.value
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
      if (input) this.setInputValue(input, value)
    })
    this.validateSync()
  }
  get dataChanged (): boolean {
    return JSON.stringify(this.initialData) !== JSON.stringify(this.data)
  }
  get error (): string {
    return this.els.error?.textContent ?? ''
  }
  set error (message) {
    if (this.els.error) this.els.error.textContent = message || ''
  }
  createClose (): HTMLButtonElement {
    const element = button('Cancel', 'close', true)
    console.log('form cancel will emit close event :', this.onCloseEventName, element)
    element.addEventListener('click', () => emit(this.onCloseEventName))
    return element
  }
  createFooter (): HTMLDivElement {
    const row = div('app-footer mt-4 flex justify-center')
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
  onSave (): void {
    emit<FormOnSaveEvent>(this.onSaveEventName, this.data)
    // this.els.footer?.classList.add('hidden') // not sure if needed
  }
  destroy (): void {
    this.els.form?.remove()
    this.els.header?.remove()
    this.els.footer?.remove()
    this.remove()
  }
  validateSync (): void {
    const isValid = this.els.form?.checkValidity()
    console.log(`form is ${isValid ? 'valid' : 'invalid'}`)
    this.error = ''
    if (isValid) {
      this.els.save?.removeAttribute('disabled')
      console.log('emitting :', `${this._id}--change`, this.data)
      emit(`${this._id}--change`, this.data)
    } else {
      this.els.save?.setAttribute('disabled', String(true))
      const input = this.inputs.find(input => input.validationMessage.length > 0)
      if (input) this.error = `Field "${input.name}" is invalid. ${input.validationMessage}`
    }
    if (this.inline) this.els.footer?.classList.toggle('hidden', !(this.dataChanged && isValid))
    this.setAttribute('valid', String(isValid))
  }
  setInputValue (input: HTMLInputElement, value: AppFormDataValue): void {
    if (input.name === 'photo') this.setPhoto(input, value)
    else if (input.type === 'checkbox') setTimeout(() => { input.checked = String(value) === 'true' }, 100) // need to be async ¯\_(ツ)_/¯
    else input.value = value as string
  }
  setPhoto (input: HTMLInputElement, data: string | boolean | number | string[]): void {
    if (['boolean', 'number'].includes(typeof data)) return console.error('photo data must be a string or array')
    let url = ''
    if (typeof data === 'string') url = data
    else if (Array.isArray(data)) {
      const photo = data[0] as unknown as ItemPhoto
      url = photo.url
    } else return showError('unhandled case where photo data is neither string or array')
    input.value = url
    if (!this.els.form) throw new Error('No form found')
    const img = this.els.form.querySelector('img')
    if (!img) return showError(`wanted to set "${url}" but no img found`)
    img.addEventListener('error', () => {
      img.src = DEFAULT_IMAGE
      input.value = ''
    })
    img.src = url
  }
  addSuggestions (suggestions: FormSuggestions): void {
    this.inputs.forEach(input => {
      let suggestionsForInput = (suggestions[input.name] || []).filter(value => value !== '')
      if (input.type === 'number') suggestionsForInput = suggestionsForInput.filter(value => value !== '0')
      if (!suggestionsForInput || suggestionsForInput.length === 0) return
      const value = suggestionsForInput[0]
      if (!value) throw new Error('no value found')
      this.setInputValue(input, value)
      if (suggestionsForInput.length === 1) return
      const select = dom('select', `suggestions suggestions--${input.name}`, valuesToOptions(suggestionsForInput))
      input.after(select)
      select.addEventListener('change', () => this.setInputValue(input, select.value))
    })
  }
  connectedCallback (): void {
    this._id = `app-form--${this.name}`
    on<FormIdSetEvent>(`${this._id}--set`, data => { this.data = data })
    on<FormIdErrorEvent>(`${this._id}--error`, message => { this.error = message })
    on<FormIdSuggestionsEvent>(`${this._id}--suggestions`, suggestions => this.addSuggestions(suggestions))
    this.els.form = dom('form', this.className, this.innerHTML)
    this.removeAttribute('class')
    this.innerHTML = ''
    this.append(this.els.form)
    this.els.error = p('app-error text-center')
    this.els.form.parentElement?.append(this.els.error)
    if (!this.inline && this.dataset['title']) {
      this.els.header = h2('app-header mt-2 mb-4 text-center text-2xl text-purple-700', this.dataset['title'])
      this.parentElement?.prepend(this.els.header)
    }
    this.els.footer = this.createFooter()
    this.els.form.parentElement?.append(this.els.footer)
    this.els.form.addEventListener('submit', event => { event.preventDefault() })
    this.initialData = this.data
    this.validateSync()
    emit(`${this._id}--ready`, this.data)
  }
}

setTimeout(() => window.customElements.define('app-form', AppForm), 200)
