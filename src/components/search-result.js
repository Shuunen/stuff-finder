/* global HTMLElement, CustomEvent */

class AppSearchResult extends HTMLElement {
  get box () {
    return this.data.Boite || ''
  }

  get drawer () {
    return this.data.Tiroir || ''
  }

  get name () {
    return (this.data.Nom || '').trim()
  }

  get brand () {
    return (this.data.Marque || '').trim()
  }

  get details () {
    return (this.data.Référence || '').trim()
  }

  get location () {
    return this.data.Pièce || ''
  }

  get formContent () {
    const locations = this.data.locations.map(l => `<option value=${l} ${l.toLowerCase() === this.location.toLowerCase() ? 'selected' : ''}>${l}</option>`)
    const boxes = Array.from(' abcdefghijklmnopqrstuvwxyz').map(l => `<option value=${l.toUpperCase()} ${l === this.box.toLowerCase() ? 'selected' : ''}>${l.toUpperCase()}</option>`)
    const drawers = ['', 1, 2, 3, 4, 5, 6, 7].map(d => `<option value=${d} ${d.toString().toLowerCase() === this.drawer.toLowerCase() ? 'selected' : ''}>${d}</option>`)
    return `<div class="row grow wrap" style="justify-content: space-evenly">
      <div class="full-width mts"><em class="clickable disabled">${this.name}</em></div>
      <label class="col">Name<input required name=name type=text value="${this.name}" /></label>
      <label class="col">Brand<input name=brand type=text value="${this.brand}" /></label>
      <label class="col" style="width: 50%">Location <select name=location>${locations}</select></label>
      <label class="col" style="width: 25%">Box <select class=center name=box>${boxes}</select></label>
      <label class="col" style="width: 25%">Drawer <select class=center name=drawer>${drawers}</select></label>
    </div>`
  }

  get readContent () {
    return `<div class="col center">
      <div>
        <div class=clickable>${(this.name + ' ' + this.brand).trim()}<span class="box">${this.box.toUpperCase() + this.drawer}</span></div>
      </div>
      <small>${this.details}</small>
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
    document.querySelector('.app-search-result.activated').scrollIntoView()
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
    this.toggleEdit(true)
    this.scrollToForm()
  }

  save (data) {
    const locationChanged = (this.data.Pièce !== data.location)
    if (locationChanged) {
      setTimeout(() => this.emit('fade-out', this.els.wrapper), 1000)
    }
    this.data.Nom = data.name
    this.data.Marque = data.brand
    this.data.Boite = data.box
    this.data.Tiroir = data.drawer
    this.data.Pièce = data.location
    this.emit('app-update--item', this.data)
    // TODO: emit also a success event so toggleEdit below will be done only if update succeed
    this.toggleEdit(false)
  }

  toggleEdit (active = false) {
    this.els.wrapper.classList.toggle('activated', active)
    this.els.wrapper.classList.toggle('highlight-accent-light', active)
    this.els.read.classList.toggle('hidden', active)
    if (!active) {
      this.els.read.innerHTML = this.readContent
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
    read.innerHTML = this.readContent
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
