/* global HTMLElement, CustomEvent */

class AppSearchResult extends HTMLElement {
  get formContent () {
    const name = this.data.Nom
    const box = this.data.Boite || ''
    const drawer = this.data.Tiroir
    const boxes = Array.from(' abcdefghijklmnopqrstuvwxyz').map(l => `<option value=${l} ${l === box.toLowerCase() ? 'selected' : ''}>${l.toUpperCase()}</option>`)
    return `<div class="row grow wrap" style="justify-content: space-evenly">
      <em class="clickable disabled mts">${this.data.name}</em>
      <label class="col">Name<input required name=name type=text value="${name}" /></label>
      <label class="col" style="width: 4rem">Box <select name=box>${boxes}</select></label>
      <label class="col" style="width: 4rem">Drawer <input name=drawer type=number value="${drawer}" min=0 max=100 /></label>
    </div>`
  }

  emit (eventName, eventData) {
    console.log(`emit event "${eventName}"`, eventData === undefined ? '' : eventData)
    window.dispatchEvent(new CustomEvent(eventName, { detail: eventData }))
  }

  on (eventName, callback) {
    window.addEventListener(eventName, event => callback.bind(this)(event.detail))
  }

  closeOtherForms () {
    document.querySelectorAll('.app-search-result button.close').forEach(el => el.click())
  }

  scrollToForm () {
    document.querySelector('.app-search-result button.close').scrollIntoViewIfNeeded()
  }

  edit () {
    this.closeOtherForms()
    const formName = `result-${this.data.id}`
    const form = this.els.form = document.createElement('app-form')
    form.setAttribute('name', formName)
    form.setAttribute('title', false)
    form.setAttribute('on-close', this.formCloseEvent)
    form.setAttribute('on-save', this.formSaveEvent)
    form.innerHTML = this.formContent
    this.els.wrapper.appendChild(form)
    this.scrollToForm()
    this.toggleEdit(true)
  }

  save (data) {
    this.toggleEdit(false)
    this.data.Boite = data.box
    this.data.Tiroir = data.drawer
    console.info('TODO : save form data', data, '...')
    console.info('TODO : update view with new data, dont let main.js stylize name & box/drawer, all need to be done here to be updated properly')
  }

  toggleEdit (active = false) {
    console.log(active ? 'editing' : 'reading', 'result', this.data)
    this.els.wrapper.classList.toggle('highlight-accent-light', active)
    this.els.read.classList.toggle('hidden', active)
    if (!active) {
      this.els.form.destroy()
    }
  }

  setListeners () {
    this.formCloseEvent = `${this.data.id}--close`
    this.formSaveEvent = `${this.data.id}--save`
    this.on(this.formCloseEvent, this.toggleEdit)
    this.on(this.formSaveEvent, this.save)
  }

  createWrapper () {
    this.data = JSON.parse(this.getAttribute('data'))
    this.setListeners()
    const wrapper = this.els.wrapper = document.createElement('div')
    wrapper.className = `${this._id} ps`
    const read = this.els.read = document.createElement('div')
    read.className = 'col'
    read.innerHTML = `<div class="row center"><div class=clickable>${this.data.name}</div></div><small class="mbs">${this.data.details}</small>`
    read.addEventListener('click', this.edit.bind(this))
    wrapper.appendChild(read)
    return wrapper
  }

  connectedCallback () {
    this._id = 'app-search-result'
    this.els = {}
    this.data = {}
    this.parentNode.replaceChild(this.createWrapper(), this)
  }
}

window.customElements.define('app-search-result', AppSearchResult)
