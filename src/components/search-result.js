/* global HTMLElement */

class AppSearchResult extends HTMLElement {
  emit (eventName, eventData) {
    console.log(`emit event "${eventName}"`, eventData === undefined ? '' : eventData)
    window.dispatchEvent(new CustomEvent(eventName, { detail: eventData }))
  }

  on (eventName, callback) {
    window.addEventListener(eventName, event => callback.bind(this)(event.detail))
  }

  edit () {
    this.toggleEdit(true)
    const formName = `result-${this.data.id}`
    const form = this.els.form = document.createElement('app-form')
    form.setAttribute('name', formName)
    form.setAttribute('title', false)

    const formCloseEvent = `${formName}--close`
    const formSaveEvent = `${formName}--save`
    form.setAttribute('on-close', formCloseEvent)
    form.setAttribute('on-save', formSaveEvent)
    this.on(formCloseEvent, this.toggleEdit)
    this.on(formSaveEvent, this.save)

    const name = this.data.Nom
    const box = this.data.Boite || ''
    const drawer = this.data.Tiroir
    const boxes = Array.from(' abcdefghijklmnopqrstuvwxyz').map(l => `<option value=${l} ${l === box.toLowerCase() ? 'selected' : ''}>${l.toUpperCase()}</option>`)
    form.innerHTML = `<div class="row grow" style="justify-content: space-evenly">
      <label class="col">Name<input required name=name type=text value="${name}" /></label>
      <label class="col" style="width: 4rem">Box <select name=box>${boxes}</select></label>
      <label class="col" style="width: 4rem">Drawer <input name=drawer type=number value="${drawer}" min=0 max=100 /></label>
    </div>`
    this.els.wrapper.appendChild(form)
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

  createWrapper () {
    const data = this.data = JSON.parse(this.getAttribute('data'))
    const wrapper = this.els.wrapper = document.createElement('div')
    wrapper.className = `${this._id} ps`
    const read = this.els.read = document.createElement('div')
    read.className = 'col'
    read.innerHTML = `<div>${data.name}</div><small class="mbs">${data.details}</small>`
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
