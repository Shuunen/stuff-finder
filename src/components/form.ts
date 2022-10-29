import { copy, debounce, div, dom, emit, h2, objectSum, on, p } from 'shuutils'
import { DEFAULT_IMAGE } from '../constants'
import { button, find, logger, valuesToOptions } from '../utils'

export class AppForm extends HTMLElement {
  _id = ''
  els: {
    error?: HTMLParagraphElement,
    header?: HTMLHeadingElement,
    form?: HTMLFormElement,
    footer?: HTMLDivElement,
    save?: HTMLButtonElement
  } = {}
  initialData: AppFormData = { formValid: false }
  emittedData: AppFormData = { formValid: false }
  validate = debounce(this.validateSync.bind(this), 200)
  emitChange = debounce(this.emitChangeSync.bind(this), 200)
  get allowSubmit (): boolean { return this.hasAttribute('allow-submit') }
  get name (): string { return this.getAttribute('name') ?? 'unknown' }
  get saveLabel (): string { return this.getAttribute('save-label') || 'Save' }
  get cancelLabel (): string { return this.getAttribute('cancel-label') || 'Cancel' }
  override get title (): string { return this.getAttribute('title') === 'false' ? '' : (this.getAttribute('title') || '') }
  get inline (): boolean { return this.getAttribute('inline') === 'true' }
  get onCloseEventName (): string { return this.getAttribute('on-close') || `${this._id}--close` }
  get onSaveEventName (): string { return this.getAttribute('on-save') || `${this._id}--save` }
  get inputs (): HTMLInputElement[] { return [...this.els.form?.elements as unknown as HTMLInputElement[]] }
  get data (): AppFormData {
    const data: AppFormData = { formValid: false }
    this.inputs.forEach(input => {
      let value: AppFormDataValue = input.value
      if (input.type === 'checkbox') value = input.checked
      else if (input.type === 'number') value = Number.parseFloat(value)
      data[input.name] = value
    })
    data.formValid = this.els.form?.checkValidity() ?? false
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
    return objectSum(this.initialData) !== objectSum(this.data)
  }
  get error (): string {
    return this.els.error?.textContent ?? ''
  }
  set error (message) {
    if (this.els.error) this.els.error.textContent = message || ''
  }
  createClose (): HTMLButtonElement {
    const element = button(this.cancelLabel, 'close', true)
    logger.log('form cancel will emit close event :', this.onCloseEventName, element)
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
  emitChangeSync (): void {
    if (!this.els.form?.['checkVisibility']()) return logger.log('form is not visible, not emitting change')
    if (objectSum(this.emittedData) === objectSum(this.data)) return
    this.emittedData = copy(this.data)
    logger.log('emitting :', `${this._id}--change`, this.data)
    emit<AppFormData>(`${this._id}--change`, this.data)
  }
  validateSync (): void {
    const isValid = this.els.form?.checkValidity() ?? false
    this.data.formValid = isValid
    logger.log(`form is ${isValid ? 'valid' : 'invalid'}`)
    this.error = ''
    if (isValid)
      this.els.save?.removeAttribute('disabled')
    else {
      this.els.save?.setAttribute('disabled', String(true))
      const input = this.inputs.find(input => input.validationMessage.length > 0)
      if (input) this.error = `Field "${input.name}" is invalid. ${input.validationMessage}`
    }
    if (this.inline) this.els.footer?.classList.toggle('hidden', !(this.dataChanged && isValid))
    this.dataset['valid'] = String(isValid)
    this.emitChange()
  }
  setInputValue (input: HTMLInputElement, value: AppFormDataValue): void {
    if (input.name === 'photo') this.setPhoto(input, value)
    else if (input.type === 'checkbox') setTimeout(() => { input.checked = String(value) === 'true' }, 100) // need to be async ¯\_(ツ)_/¯
    else input.value = value as string
  }
  setPhoto (input: HTMLInputElement, data: string | boolean | number | string[]): void {
    if (['boolean', 'number'].includes(typeof data)) return logger.showError('photo data must be a string or array')
    let url = ''
    if (typeof data === 'string') url = data
    else if (Array.isArray(data)) {
      const photo = data[0] as unknown as ItemPhoto
      url = photo.url
    } else return logger.showError('unhandled case where photo data is neither string or array')
    input.value = url
    if (!this.els.form) throw new Error('No form found')
    const img = find.one<HTMLImageElement>('img', this.els.form)
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
    this.els.form.addEventListener('submit', event => {
      event.preventDefault()
      if (this.allowSubmit) this.onSave()
    })
    this.initialData = this.data
    this.validateSync()
    emit(`${this._id}--ready`, this.data)
  }
}

setTimeout(() => window.customElements.define('app-form', AppForm), 200)
