/* eslint-disable import/exports-last */
import { clone, debounce, div, dom, emit, h2, objectSum, on, sleep, text, tw } from 'shuutils'
import { defaultImage, delays } from '../constants'
import { ItemField, type AppFormChangeEvent, type AppFormCloseEvent, type AppFormData, type AppFormDataValue, type AppFormFieldChangeEvent, type AppFormReadyEvent, type FormIdErrorEvent, type FormIdSetEvent, type FormIdSuggestionsEvent, type FormOnSaveEvent, type FormSuggestions } from '../types'
import { button, find, isVisible, valuesToOptions } from '../utils/browser.utils'
import { logger } from '../utils/logger.utils'

export class AppForm extends HTMLElement {

  private readonly els = {
    error: text(''),
    footer: div(''),
    form: dom('form'),
    header: h2('app-header mb-4 mt-2 text-center text-2xl text-purple-700', this.dataset.title),
    save: button(this.saveLabel, tw('app-save ml-4')),
  }

  private initialData: AppFormData = { hasValidForm: false }

  private emittedData: AppFormData = { hasValidForm: false }

  private isWarmedUp = true

  private readonly validate = debounce(this.validateSync.bind(this), delays.medium)

  private readonly emitChange = debounce(this.emitChangeSync.bind(this), delays.medium)

  private readonly emitFieldChange = debounce(this.emitFieldChangeSync.bind(this), delays.medium)

  private get data () {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const data = { hasValidForm: false } as AppFormData
    this.inputs.forEach(input => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      let value = input.value as AppFormDataValue
      if (input.type === 'checkbox') value = input.checked
      // eslint-disable-next-line sonarjs/elseif-without-else
      else if (input.type === 'number') value = Number.parseFloat(value.toString())
      data[input.name] = value
    })
    data.hasValidForm = this.els.form.checkValidity()
    return data
  }

  private set data (data) {
    logger.info('setting form data', data)
    Object.entries(data).forEach(entry => {
      const [key, value = ''] = entry
      const input = this.inputs.find(inputElement => inputElement.name === key)
      if (input) this.setInputValue(input, value)
    })
    if (this.isWarmedUp) this.initialData = clone(this.data)
    logger.info(this.isWarmedUp ? 'warming up, overwriting initial data' : 'NOT warming up, NOT overwriting initial data', { initialData: this.initialData })
    this.validateBecause('set-data')
  }

  private get willAllowSubmit () { return this.hasAttribute('allow-submit') }

  private get name () { return this.getAttribute('name') ?? 'unknown' }

  private get saveLabel () { return this.getAttribute('save-label') ?? 'Save' }

  private get cancelLabel () { return this.getAttribute('cancel-label') ?? 'Cancel' }

  private get isInline () { return this.getAttribute('inline') === 'true' }

  private get willHideActionsOnSubmit () { return this.hasAttribute('hide-actions-on-submit') }

  private get willKeepSaveActive () { return this.hasAttribute('keep-save-active') }

  private get onCloseEventName () { return this.getAttribute('on-close') ?? `${this.id}--close` }

  private get onSaveEventName () { return this.getAttribute('on-save') ?? `${this.id}--save` }

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, unicorn/prefer-spread
  private get inputs () { return Array.from(this.els.form.elements as unknown as HTMLInputElement[]) }

  public validateBecause (reason: string) {
    logger.info('validating because :', reason)
    void this.validate()
  }

  // eslint-disable-next-line max-statements
  private validateSync () {
    const isValid = this.els.form.checkValidity()
    this.data.hasValidForm = isValid
    const hasChangedData = objectSum(this.initialData) !== objectSum(this.data)
    logger.info(`form is ${isValid ? 'valid' : 'invalid'}`)
    this.clearError()
    if (!isValid) {
      this.els.save.disabled = true
      const input = this.inputs.find(inputElement => inputElement.validationMessage.length > 0)
      if (input) this.setError(`Field "${input.name}" is invalid. ${input.validationMessage}`)
    } else if (hasChangedData && !this.willKeepSaveActive) {
      logger.info(`form ${this.name} is valid and changed, reactivating save button`, this.els.save)
      logger.info('before and after', { aft: this.data, bfr: this.initialData })
      this.els.save.disabled = false
    } else logger.info(`form ${this.name} is valid and unchanged, keeping save button disabled`)
    if (this.isInline) this.els.footer.classList.toggle('hidden', !hasChangedData && isValid)
    this.dataset.valid = String(isValid)
    void this.emitChange()
  }

  private clearError () {
    this.setError('')
  }

  private setError (message = '') {
    this.els.error.textContent = message
    this.els.save.disabled = true
  }

  private createClose () {
    const element = button(this.cancelLabel, 'close', true)
    logger.info(`form ${this.name} cancel will emit close event :`, this.onCloseEventName)
    element.addEventListener('click', () => emit<AppFormCloseEvent>(this.onCloseEventName))
    return element
  }

  private createFooter () {
    const row = div('app-footer mt-4 flex justify-center')
    if (this.isInline) row.classList.add('hidden')
    else row.append(this.createClose())
    if (!this.willKeepSaveActive) this.els.save.disabled = true
    this.els.save.addEventListener('click', this.onSave.bind(this))
    this.els.form.addEventListener('keyup', () => { this.validateBecause('keyup') })
    this.els.form.addEventListener('change', () => { this.validateBecause('change') })
    row.append(this.els.save)
    return row
  }

  private onSave () {
    emit<FormOnSaveEvent>(this.onSaveEventName, this.data)
    if (this.willHideActionsOnSubmit) this.els.footer.classList.add('hidden')
  }

  private emitChangeSync () {
    if (!isVisible(this.els.form)) { logger.info(`form ${this.name} is not visible, not emitting change`); return }
    if (objectSum(this.emittedData) === objectSum(this.data)) { logger.info(`form ${this.name} data has not changed, not emitting change`); return }
    this.emittedData = clone(this.data)
    logger.info('emitting :', `${this.id}--change`)
    emit<AppFormChangeEvent>(`${this.id}--change`, this.emittedData)
  }

  private emitFieldChangeSync (field: string, value: AppFormDataValue) {
    const name = `${this.id}--${field}--change`
    logger.debug('input change ! emitting :', name)
    emit<AppFormFieldChangeEvent>(name, value)
  }

  private setInputValue (input: HTMLInputElement, value: AppFormDataValue) {
    /* eslint-disable no-param-reassign */
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    if (input.name === ItemField.Photo) this.setPhoto(input, value)
    else if (input.type === 'checkbox') input.checked = String(value) === 'true'
    else input.value = String(value)
    /* eslint-enable no-param-reassign */
  }

  private getPhotoUrl (data: unknown) {
    if (typeof data === 'string') return data
    if (typeof data === 'object' && Array.isArray(data) && data.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const [photo] = data
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (typeof photo === 'object' && photo.url !== undefined) return String(photo.url)
    }
    logger.showError('unhandled case where photo data is neither string or array')
    return ''
  }

  private setPhoto (input: HTMLInputElement, data: unknown) {
    logger.info('setting photo', { data, input })
    if (['boolean', 'number'].includes(typeof data)) { logger.showError('photo data must be a string or array'); return }
    const url = this.getPhotoUrl(data)
    input.value = url // eslint-disable-line no-param-reassign
    const img = find.one<HTMLImageElement>('img', this.els.form)
    img.addEventListener('error', () => {
      img.src = defaultImage
      input.value = '' // eslint-disable-line no-param-reassign
    })
    img.src = url
  }

  private addSuggestions (suggestions: FormSuggestions) {
    this.inputs.forEach(input => {
      let suggestionsForInput = (suggestions[input.name] ?? []).filter(value => value !== '')
      if (input.type === 'number') suggestionsForInput = suggestionsForInput.filter(value => value !== '0')
      if (suggestionsForInput.length === 0) return
      const [value] = suggestionsForInput
      if (value === undefined) throw new Error('no value found')
      this.setInputValue(input, value)
      if (suggestionsForInput.length === 1) return
      const select = dom('select', `suggestions suggestions--${input.name}`, valuesToOptions(suggestionsForInput))
      input.after(select)
      select.addEventListener('change', () => { this.setInputValue(input, select.value) })
    })
    this.validateBecause('added-suggestions')
  }

  private setChangeEvents () {
    this.inputs.forEach(input => {
      input.addEventListener('change', () => { void this.emitFieldChange(input.name, input.value) })
      input.addEventListener('keyup', () => { void this.emitFieldChange(input.name, input.value) })
    })
  }

  // eslint-disable-next-line max-statements
  public async connectedCallback () {
    this.id = `app-form--${this.name}`
    on<FormIdSetEvent>(`${this.id}--set`, data => { this.data = data })
    on<FormIdErrorEvent>(`${this.id}--error`, this.setError.bind(this))
    on<FormIdSuggestionsEvent>(`${this.id}--suggestions`, this.addSuggestions.bind(this))
    this.els.form = dom('form', this.className, this.innerHTML)
    this.removeAttribute('class')
    this.innerHTML = ''
    this.append(this.els.form)
    this.els.error = text('app-error text-center')
    this.els.form.parentElement?.append(this.els.error)
    if (!this.isInline && (this.dataset.title?.length ?? 0) > 0) this.parentElement?.prepend(this.els.header)
    this.els.footer = this.createFooter()
    this.els.form.parentElement?.append(this.els.footer)
    this.els.form.addEventListener('submit', event => {
      event.preventDefault()
      if (this.willAllowSubmit) this.onSave()
    })
    logger.info(`form ${this.name} connected, setting initial data to`, clone(this.data))
    this.initialData = this.data
    this.validateBecause('connected-callback')
    this.setChangeEvents()
    emit<AppFormReadyEvent>(`${this.id}--ready`, this.data)
    await sleep(delays.small)
    this.isWarmedUp = false
  }

}

setTimeout(() => { window.customElements.define('app-form', AppForm) }, delays.medium)
