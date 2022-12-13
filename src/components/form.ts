import { clone, debounce, div, dom, emit, h2, objectSum, on, sleep, text } from 'shuutils'
import { DEFAULT_IMAGE } from '../constants'
import type { AppFormChangeEvent, AppFormCloseEvent, AppFormData, AppFormDataValue, AppFormReadyEvent, FormIdErrorEvent, FormIdSetEvent, FormIdSuggestionsEvent, FormOnSaveEvent, FormSuggestions, ItemPhoto } from '../types'
import { ItemField } from '../types'
import { button, find, isVisible, logger, valuesToOptions } from '../utils'

export class AppForm extends HTMLElement {

  private _id = ''

  private readonly els = {
    error: text(''),
    header: h2('app-header mt-2 mb-4 text-center text-2xl text-purple-700', this.dataset['title']),
    form: dom('form'),
    footer: div(''),
    save: button(this.saveLabel, 'save ml-4'),
  }

  private initialData: AppFormData = { formValid: false }

  private emittedData: AppFormData = { formValid: false }

  private warmUp = true

  private readonly validate = debounce(this.validateSync.bind(this), 200)

  private readonly emitChange = debounce(this.emitChangeSync.bind(this), 200)

  private get allowSubmit (): boolean { return this.hasAttribute('allow-submit') }

  private get name (): string { return this.getAttribute('name') ?? 'unknown' }

  private get saveLabel (): string { return this.getAttribute('save-label') ?? 'Save' }

  private get cancelLabel (): string { return this.getAttribute('cancel-label') ?? 'Cancel' }


  private get inline (): boolean { return this.getAttribute('inline') === 'true' }

  private get hideActionsOnSubmit (): boolean { return this.hasAttribute('hide-actions-on-submit') }

  private get keepSaveActive (): boolean { return this.hasAttribute('keep-save-active') }

  private get onCloseEventName (): string { return this.getAttribute('on-close') ?? `${this._id}--close` }

  private get onSaveEventName (): string { return this.getAttribute('on-save') ?? `${this._id}--save` }

  private get inputs (): HTMLInputElement[] { return [...this.els.form.elements as unknown as HTMLInputElement[]] }

  private get data (): AppFormData {
    const data: AppFormData = { formValid: false }
    this.inputs.forEach(input => {
      let value: AppFormDataValue = input.value
      if (input.type === 'checkbox') value = input.checked
      else if (input.type === 'number') value = Number.parseFloat(value)
      data[input.name] = value
    })
    data.formValid = this.els.form.checkValidity()
    // logger.log('actual form data', data)
    return data
  }

  private set data (data) {
    logger.log('setting form data', data)
    Object.entries(data).forEach(entry => {
      const [key, value = ''] = entry
      const input = this.inputs.find(inputElement => inputElement.name === key)
      if (input) this.setInputValue(input, value)
    })
    if (this.warmUp) this.initialData = clone(this.data)
    logger.log(this.warmUp ? 'warming up, overwriting initial data' : 'NOT warming up, NOT overwriting initial data', { initialData: this.initialData })
    this.validateBecause('set-data')
  }

  public connectedCallback (): void {
    this._id = `app-form--${this.name}`
    on<FormIdSetEvent>(`${this._id}--set`, data => { this.data = data })
    on<FormIdErrorEvent>(`${this._id}--error`, this.setError.bind(this))
    on<FormIdSuggestionsEvent>(`${this._id}--suggestions`, this.addSuggestions.bind(this))
    this.els.form = dom('form', this.className, this.innerHTML)
    this.removeAttribute('class')
    this.innerHTML = ''
    this.append(this.els.form)
    this.els.error = text('app-error text-center')
    this.els.form.parentElement?.append(this.els.error)
    if (!this.inline && (this.dataset['title']?.length ?? 0) > 0) this.parentElement?.prepend(this.els.header)
    this.els.footer = this.createFooter()
    this.els.form.parentElement?.append(this.els.footer)
    this.els.form.addEventListener('submit', event => {
      event.preventDefault()
      if (this.allowSubmit) this.onSave()
    })
    logger.log(`form ${this.name} connected, setting initial data to`, clone(this.data))
    this.initialData = this.data
    this.validateBecause('connected-callback')
    emit<AppFormReadyEvent>(`${this._id}--ready`, this.data)
    void sleep(100).then(() => this.warmUp = false)
  }

  public validateBecause (reason: string): void {
    logger.log('validating because :', reason)
    void this.validate()
  }

  private validateSync (): void {
    const isValid = this.els.form.checkValidity()
    this.data.formValid = isValid
    const dataChanged = objectSum(this.initialData) !== objectSum(this.data)
    logger.log(`form is ${isValid ? 'valid' : 'invalid'}`)
    this.clearError()
    if (!isValid) {
      this.els.save.disabled = true
      const input = this.inputs.find(inputElement => inputElement.validationMessage.length > 0)
      if (input) this.setError(`Field "${input.name}" is invalid. ${input.validationMessage}`)
    } else if (dataChanged && !this.keepSaveActive) {
      logger.log(`form ${this.name} is valid and changed, reactivating save button`, this.els.save)
      logger.log('before and after', { bfr: this.initialData, aft: this.data })
      this.els.save.disabled = false
    }
    if (this.inline) this.els.footer.classList.toggle('hidden', !dataChanged && isValid)
    this.dataset['valid'] = String(isValid)
    void this.emitChange()
  }

  private clearError (): void {
    this.setError('')
  }

  private setError (message = ''): string {
    this.els.error.textContent = message
    return message
  }

  private createClose (): HTMLButtonElement {
    const element = button(this.cancelLabel, 'close', true)
    logger.log(`form ${this.name} cancel will emit close event :`, this.onCloseEventName)
    element.addEventListener('click', () => emit<AppFormCloseEvent>(this.onCloseEventName))
    return element
  }

  private createFooter (): HTMLDivElement {
    const row = div('app-footer mt-4 flex justify-center')
    if (this.inline) row.classList.add('hidden')
    else row.append(this.createClose())
    if (!this.keepSaveActive) this.els.save.disabled = true
    this.els.save.addEventListener('click', this.onSave.bind(this))
    this.els.form.addEventListener('keyup', () => { this.validateBecause('keyup') })
    this.els.form.addEventListener('change', () => { this.validateBecause('change') })
    row.append(this.els.save)
    return row
  }

  private onSave (): void {
    emit<FormOnSaveEvent>(this.onSaveEventName, this.data)
    if (this.hideActionsOnSubmit) this.els.footer.classList.add('hidden')
  }

  private emitChangeSync (): void {
    if (!isVisible(this.els.form)) { logger.log(`form ${this.name} is not visible, not emitting change`); return }
    if (objectSum(this.emittedData) === objectSum(this.data)) { logger.log(`form ${this.name} data has not changed, not emitting change`); return }
    this.emittedData = clone(this.data)
    logger.log('emitting :', `${this._id}--change`)
    emit<AppFormChangeEvent>(`${this._id}--change`, this.emittedData)
  }

  private setInputValue (input: HTMLInputElement, value: AppFormDataValue): void {
    if (input.name === ItemField.photo) this.setPhoto(input, value)
    else if (input.type === 'checkbox') input.checked = String(value) === 'true' // setTimeout(() => { input.checked = String(value) === 'true' }, 100) // need to be async ¯\_(ツ)_/¯
    else input.value = value as string
  }

  private setPhoto (input: HTMLInputElement, data: string[] | boolean | number | string): void {
    logger.log('setting photo', { input, data })
    if (['boolean', 'number'].includes(typeof data)) { logger.showError('photo data must be a string or array'); return }
    let url = ''
    if (typeof data === 'string') url = data
    else if (Array.isArray(data)) {
      const photo = data[0] as unknown as ItemPhoto
      url = photo.url
    } else { logger.showError('unhandled case where photo data is neither string or array'); return }
    input.value = url
    const img = find.one<HTMLImageElement>('img', this.els.form)
    img.addEventListener('error', () => {
      img.src = DEFAULT_IMAGE
      input.value = ''
    })
    img.src = url
  }

  private addSuggestions (suggestions: FormSuggestions): void {
    this.inputs.forEach(input => {
      let suggestionsForInput = (suggestions[input.name] ?? []).filter(value => value !== '')
      if (input.type === 'number') suggestionsForInput = suggestionsForInput.filter(value => value !== '0')
      if (suggestionsForInput.length === 0) return
      const value = suggestionsForInput[0]
      if (value === undefined) throw new Error('no value found')
      this.setInputValue(input, value)
      if (suggestionsForInput.length === 1) return
      const select = dom('select', `suggestions suggestions--${input.name}`, valuesToOptions(suggestionsForInput))
      input.after(select)
      select.addEventListener('change', () => { this.setInputValue(input, select.value) })
    })
    this.validateBecause('added-suggestions')
  }

}

setTimeout(() => { window.customElements.define('app-form', AppForm) }, 200)
