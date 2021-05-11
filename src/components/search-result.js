/* global window, document, HTMLElement */

import { emit, on } from 'shuutils'
import { div, dom } from '../utils.js'

class AppSearchResult extends HTMLElement {
  get formContent() {
    const locations = this.data.locations.map(l => `<option value=${l} ${l.toLowerCase() === this.data.location.toLowerCase() ? 'selected' : ''}>${l}</option>`)
    const boxes = this.data.boxes.map(b => `<option value="${b}" ${b.toLowerCase() === this.data.box.toLowerCase() ? 'selected' : ''}>${b}</option>`)
    const statuses = this.data.statuses.map(s => `<option value="${s}" ${s.toLowerCase() === this.data.status.toLowerCase() ? 'selected' : ''}>${s}</option>`)
    const drawers = ['', 1, 2, 3, 4, 5, 6, 7].map(d => `<option value="${d}" ${d.toString().toLowerCase() === this.data.drawer.toLowerCase() ? 'selected' : ''}>${d}</option>`)
    return `
      ${this.hasImage ? `<img src="${this.data.photo[0].url}" />` : ''}
      <div class=col>
        <label>Name<input required name=name type=text value="${this.data.name}" /></label>
        <label>Brand<input name=brand type=text value="${this.data.brand}" /></label>
        <label>Details<input name=details type=text value="${this.data.details}" /></label>
        <label>Reference<input name=reference type=text value="${this.data.reference}" /></label>
        <label>Barcode<input name=barcode type=text value="${this.data.barcode}" /></label>
      </div>
      <div class=col>
        <label>Status<select name=status>${statuses}</select></label>
        <label>Location <select required name=location>${locations}</select></label>
        <label>Box <select required name=box>${boxes}</select></label>
        <label>Drawer <select name=drawer>${drawers}</select></label>
        <label>Printed ?<input class="push-left" type=checkbox name="ref-printed" ${this.data['ref-printed'] ? 'checked' : ''}></label>
      </div>
    `
  }

  get readContent() {
    return `<div class="col center">
      ${this.isSolo ? `<img class="clickable mb1" src="${this.hasImage ? this.data.photo[0].url : 'assets/no-view.svg'}" />` : ''}
      <div>
        <a class=clickable>
          <span class=ellipsis>${(this.data.name + ' ' + this.data.brand).trim()}</span>
          <span class="box">${this.data.box.toUpperCase() === 'N/A' ? '' : (this.data.box.toUpperCase() + this.data.drawer)}</span>
        </a>
      </div>
      <small class=ellipsis>${this.data.details}</small>
    </div>`
  }

  get hasImage() {
    return this.data.photo && this.data.photo.length > 0
  }

  get isSolo() {
    return this.getAttribute('solo') === 'true'
  }

  closeOtherForms() {
    document.querySelectorAll('.app-search-result button.close').forEach(element => element.click())
  }

  isElementInViewport(element) {
    const rect = element.getBoundingClientRect()
    return (
      rect.top >= 0 && rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  }

  scrollToForm() {
    const element = document.querySelector('.app-search-result.activated')
    if (this.isElementInViewport(element)) return
    element.scrollIntoView({ behavior: 'smooth' })
  }

  edit() {
    this.closeOtherForms()
    const formName = `result-${this.data.id}`
    const form = dom('app-form', this.formContent, formName)
    this.els.form = form
    form.setAttribute('name', formName)
    form.setAttribute('columns', (this.hasImage ? '1fr ' : '') + '2fr 1fr')
    form.setAttribute('title', false)
    form.setAttribute('on-close', this.formCloseEvent)
    form.setAttribute('on-save', this.formSaveEvent)
    this.els.wrapper.append(form)
    this.toggleEdit(true)
    this.scrollToForm()
  }

  save(data) {
    Object.assign(this.data, data)
    emit('app-update--item', this.data)
    // should also emit a success event so toggleEdit below will be done only if update succeed
    this.toggleEdit(false)
    this.els.read.innerHTML = this.readContent
  }

  toggleEdit(active = false) {
    console.log('toggleEdit', active)
    emit('app-search-results--edit', active)
    this.els.wrapper.classList.toggle('activated', active)
    this.els.read.classList.toggle('hidden', active)
    if (active) return
    this.els.read.innerHTML = this.readContent
    if (this.els.form) this.els.form.destroy()
  }

  setListeners() {
    this.formCloseEvent = `${this.data.id}--close`
    this.formSaveEvent = `${this.data.id}--save`
    on(this.formCloseEvent, active => this.toggleEdit(active))
    on(this.formSaveEvent, data => this.save(data))
  }

  createWrapper() {
    Object.assign(this.data, JSON.parse(this.getAttribute('data')))
    if (this.isSolo) console.log(this.data)
    this.setListeners()
    this.els.wrapper = div('app-search-result p')
    this.els.read = div('col', this.readContent)
    this.els.read.addEventListener('click', this.edit.bind(this))
    this.els.wrapper.append(this.els.read)
    return this.els.wrapper
  }

  connectedCallback() {
    this.els = {}
    this.data = {}
    this.parentNode.replaceChild(this.createWrapper(), this)
  }
}

window.customElements.define('app-search-result', AppSearchResult)
