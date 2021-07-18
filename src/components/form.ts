import { div, dom, emit, h2, on, p } from 'shuutils'
import { button } from '../utils'

class AppForm extends HTMLElement {
  _id: string
  els: {
    error?: HTMLParagraphElement,
    header?: HTMLHeadingElement,
    form?: HTMLFormElement,
    footer?: HTMLDivElement,
    save?: HTMLButtonElement
  } = {}
  initialData: Record<string, string> = {}

  get name () {
    return this.getAttribute('name')
  }

  get title () {
    return this.getAttribute('title') === 'false' ? '' : this.getAttribute('title')
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
    return [...this.els.form.elements as unknown as HTMLInputElement[]]
  }

  get data () {
    const data = {}
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
      this.inputs.find(input => (input.name === key)).value = value as string
    })
    this.validate()
  }

  get dataChanged () {
    return JSON.stringify(this.initialData) !== JSON.stringify(this.data)
  }

  get error () {
    return this.els.error.textContent
  }

  set error (message) {
    this.els.error.textContent = message
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
    this.els.form.addEventListener('keyup', () => this.validate())
    row.append(save)
    this.els.save = save
    return row
  }

  onSave () {
    emit(this.onSaveEventName, this.data)
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
    if (isValid) this.els.save.removeAttribute('disabled')
    else this.els.save.setAttribute('disabled', String(true))
    if (this.inline) this.els.footer.classList.toggle('hidden', !(this.dataChanged && isValid))
    this.setAttribute('valid', String(isValid))
  }

  // when copy pasting from a spreadsheet entry, values are like : "appABC keyXYZ tableName viewName"
  handleMultiPaste () {
    const input = this.els.form.querySelector('label > input[multi-paste]')
    if (!input) return
    const inputs = this.els.form.querySelectorAll('label > input')
    console.log('handle multi paste from', input, 'and others', inputs)
    input.removeAttribute('multi-paste')
    const multiRegex = /"(\w+) (\w+) ([\w-]+) ([\w-]+)"/
    input.addEventListener('change', () => {
      const value = (input as HTMLInputElement).value
      if (multiRegex.test(value)) this.onMultiPaste(value.match(multiRegex).splice(1, 4), inputs)
    })
  }

  onMultiPaste (values, inputs) {
    console.log('multi paste detected, applying values', values, 'to', inputs)
    inputs.forEach((input, index) => {
      if (values[index]) input.value = values[index]
    })
  }

  connectedCallback () {
    this._id = `app-form--${this.name}`
    on(`${this._id}--set`, data => {
      this.data = data
    })
    on(`${this._id}--error`, message => {
      this.error = message
    })
    this.els.form = dom('form', this.className, this.innerHTML)
    this.innerHTML = ''
    this.append(this.els.form)
    this.handleMultiPaste()
    this.els.error = p('error')
    this.els.form.parentElement.append(this.els.error)
    if (!this.inline && this.dataset.title) {
      this.els.header = h2('header text-purple-700 text-2xl mt-2 mb-4 text-center', this.dataset.title)
      this.parentElement.prepend(this.els.header)
    }
    this.els.footer = this.createFooter()
    this.els.form.parentElement.append(this.els.footer)
    this.initialData = this.data
    this.validate()
    emit(`${this._id}--ready`)
  }
}

setTimeout(() => window.customElements.define('app-form', AppForm), 200)
