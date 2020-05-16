/* global HTMLElement, CustomEvent */

class AppSearchResult extends HTMLElement {
  get formContent () {
    const locations = this.data.locations.map(l => `<option value=${l} ${l.toLowerCase() === this.data.location.toLowerCase() ? 'selected' : ''}>${l}</option>`)
    const boxes = this.data.boxes.map(l => `<option value="${l}" ${l.toLowerCase() === this.data.box.toLowerCase() ? 'selected' : ''}>${l}</option>`)
    const drawers = ['', 1, 2, 3, 4, 5, 6, 7].map(d => `<option value="${d}" ${d.toString().toLowerCase() === this.data.drawer.toLowerCase() ? 'selected' : ''}>${d}</option>`)
    return `<div class="row grow wrap" style="justify-content: space-evenly">
      <div class="full-width mts"><em class="clickable disabled">${this.data.name}</em></div>
      <label class="col" style="width: 50%; margin-top: 0;">Name<input required name=name type=text value="${this.data.name}" /></label>
      <label class="col" style="width: 50%; margin-top: 0;">Brand<input name=brand type=text value="${this.data.brand}" /></label>
      <label class="col" style="width: 50%">Details<input name=details type=text value="${this.data.details}" /></label>
      <label class="col" style="width: 50%">Reference<input name=reference type=text value="${this.data.reference}" /></label>
      <label class="col" style="width: 50%">Location <select name=location>${locations}</select></label>
      <label class="col" style="width: 25%">Box <select name=box>${boxes}</select></label>
      <label class="col" style="width: 25%">Drawer <select class=center name=drawer>${drawers}</select></label>
    </div>`
  }

  get readContent () {
    return `<div class="col center">
      ${this.isSolo && this.data.photo && this.data.photo.length ? `<img class=mb1 style="max-height: 20rem; max-width: 20rem" src="${this.data.photo[0].url}" />` : ''}
      <div>
        <div class=clickable>${(this.data.name + ' ' + this.data.brand).trim()}<span class="box">${this.data.box.toUpperCase() + this.data.drawer}</span></div>
      </div>
      <small class=ellipsis>${this.data.details}</small>
    </div>`
  }

  get isSolo () {
    return this.getAttribute('solo') === 'true'
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
    const locationChanged = (this.data.location !== data.location)
    if (locationChanged) setTimeout(() => this.emit('fade-out', this.els.wrapper), 1000)
    Object.assign(this.data, data)
    this.emit('app-update--item', this.data)
    // TODO: emit also a success event so toggleEdit below will be done only if update succeed
    this.toggleEdit(false)
    this.els.read.innerHTML = this.readContent
  }

  toggleEdit (active = false) {
    this.els.wrapper.classList.toggle('activated', active)
    this.els.wrapper.classList.toggle('highlight-accent-light', active)
    this.els.read.classList.toggle('hidden', active)
    if (active) return
    this.els.read.innerHTML = this.readContent
    if (this.els.form) {
      console.warn('wtf is this case ?')
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
    Object.assign(this.data, JSON.parse(this.getAttribute('data')))
    if (this.isSolo) console.log(this.data)
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
