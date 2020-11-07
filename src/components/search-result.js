/* global HTMLElement, CustomEvent */

class AppSearchResult extends HTMLElement {
  get formContent () {
    const locations = this.data.locations.map(l => `<option value=${l} ${l.toLowerCase() === this.data.location.toLowerCase() ? 'selected' : ''}>${l}</option>`)
    const boxes = this.data.boxes.map(b => `<option value="${b}" ${b.toLowerCase() === this.data.box.toLowerCase() ? 'selected' : ''}>${b}</option>`)
    const statuses = this.data.statuses.map(s => `<option value="${s}" ${s.toLowerCase() === this.data.status.toLowerCase() ? 'selected' : ''}>${s}</option>`)
    const drawers = ['', 1, 2, 3, 4, 5, 6, 7].map(d => `<option value="${d}" ${d.toString().toLowerCase() === this.data.drawer.toLowerCase() ? 'selected' : ''}>${d}</option>`)
    return `
      ${this.hasImage ? `<div class="app-search-result--image" style="background-image: url('${this.data.photo[0].url}'); display: block;"></div>` : ''}
      <div class=col>
        <label>Name<input required name=name type=text value="${this.data.name}" /></label>
        <label>Brand<input name=brand type=text value="${this.data.brand}" /></label>
        <label>Details<input name=details type=text value="${this.data.details}" /></label>
        <label>Reference<input required name=reference type=text value="${this.data.reference}" /></label>
        <label>Ref printed ?<input class="push-left" type=checkbox name="ref-printed" ${this.data['ref-printed'] ? 'checked' : ''}></label>
      </div>
      <div class=col>
        <label>Status<select name=status>${statuses}</select></label>
        <label>Location <select required name=location>${locations}</select></label>
        <label>Box <select required name=box>${boxes}</select></label>
        <label>Drawer <select name=drawer>${drawers}</select></label>
      </div>
    `
  }

  get readContent () {
    return `<div class="col center">
      ${this.isSolo && this.hasImage ? `<img class="clickable mb1" style="max-height: 16rem" src="${this.data.photo[0].url}" />` : ''}
      <div>
        <a class=clickable>${(this.data.name + ' ' + this.data.brand).trim()}<span class="box">${this.data.box.toUpperCase() !== 'N/A' ? (this.data.box.toUpperCase() + this.data.drawer) : ''}</span></a>
      </div>
      <small class=ellipsis>${this.data.details}</small>
    </div>`
  }

  get hasImage () {
    return this.data.photo && this.data.photo.length
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
    document.querySelectorAll('.app-search-result button.close').forEach(element => element.click())
  }

  isElementInViewport (element) {
    const rect = element.getBoundingClientRect()
    return (
      rect.top >= 0 && rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  }

  scrollToForm () {
    const element = document.querySelector('.app-search-result.activated')
    if (this.isElementInViewport(element)) return
    element.scrollIntoView({ behavior: 'smooth' })
  }

  edit () {
    this.closeOtherForms()
    const formName = `result-${this.data.id}`
    const form = this.els.form = document.createElement('app-form')
    form.setAttribute('name', formName)
    form.setAttribute('columns', (this.hasImage ? '1fr ' : '') + '2fr 1fr')
    form.setAttribute('title', false)
    form.setAttribute('on-close', this.formCloseEvent)
    form.setAttribute('on-save', this.formSaveEvent)
    form.innerHTML = this.formContent
    this.els.wrapper.append(form)
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

  toggleEdit (active) {
    active = active || false
    console.log('toggleEdit', active)
    this.emit('app-search-results--edit', active)
    this.els.wrapper.classList.toggle('activated', active)
    this.els.read.classList.toggle('hidden', active)
    if (active) return
    this.els.read.innerHTML = this.readContent
    if (this.els.form) this.els.form.destroy()
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
    wrapper.className = 'app-search-result'
    const read = this.els.read = document.createElement('div')
    read.className = 'col'
    read.innerHTML = this.readContent
    read.addEventListener('click', this.edit.bind(this))
    wrapper.append(read)
    return wrapper
  }

  connectedCallback () {
    this.els = {}
    this.data = {}
    this.parentNode.replaceChild(this.createWrapper(), this)
  }
}

window.customElements.define('app-search-result', AppSearchResult)
