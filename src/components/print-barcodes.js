/* global HTMLElement, CustomEvent */
import 'webcomponent-qr-code'

class AppPrintBarcodes extends HTMLElement {
  get template () {
    return `
      <div class="icon" title="Print barcodes">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><defs/><path fill="currentColor" fill-rule="evenodd" d="M8 4h8v2H8V4zm10 2h4v12h-4v4H6v-4H2V6h4V2h12v4zm2 10h-2v-2H6v2H4V8h16v8zM8 16h8v4H8v-4zm0-6H6v2h2v-2z" clip-rule="evenodd"/></svg>
      </div>
      <app-modal name="print-barcodes" />`
  }

  get modalContentPrepare () {
    return `
    <h1>Prepare Barcodes</h1>
    <p class=mbs>Below is the list of non-printed items where valid ones have been pre-selected.</p>
    <div class="row even mb1">
      <a href="#" data-action="select-all">select all</a>
      <a href="#" data-action="select-valid">select all valid</a>
      <a href="#" data-action="select-none">select none</a>
    </div>
    <div class=list>
      ${this.barcodes.map(b => `<div class=row>
        <input type=checkbox id="${b.id}" data-action="select-one">
        <app-form name="${b.id}" inline=true title=false on-save="app-update--item">
          <input type=hidden name=id value="${b.id}" />
          <input style="width: 12rem" name=name placeholder=Name required minlength=3 maxlength=50 autofocus value="${b.name}">
          <input style="width: 9rem" name=brand placeholder=Brand value="${b.brand}">
          <input style="width: 9rem" name=reference placeholder=Reference required minlength=7 maxlength=20 value="${b.reference}">
          <select style="width: 4rem" required name=box>${b.boxes.map(l => `<option value="${l}" ${l.toLowerCase() === b.box.toLowerCase() ? 'selected' : ''}>${l}</option>`).join('')}</select>
          <select style="width: 4rem" name=drawer>${['', 1, 2, 3, 4, 5, 6, 7].map(d => `<option value="${d}" ${d.toString().toLowerCase() === b.drawer.toLowerCase() ? 'selected' : ''}>${d}</option>`).join('')}</select>
        </app-form>
      </div>`).join('\n')}
    </div>
    <div class=mt1>
      <button disabled class=preview>Preview</button>
    </div>
    <div class="error preview mts"></div>`
  }

  get modalContentPrint () {
    return `
    <h1>Print Barcodes</h1>
    <p>
      Below is a preview of the page that will be printed. <br>
      Make sure to remove any print margin after <a href="#" onclick="print()">clicking me</a>.
    </p>
    <div class="print-zone preview">
      <div class="a4-65">
        ${this.barcodes.map(b => `<div class=barcode>
          <qr-code data="${b.reference}" margin=0 modulesize=3></qr-code>
          <div class=col>
            <span class=name>${[b.name, b.brand, b.details].join(' ').trim()}</span>
            <span class=location>${b.box && b.box !== 'N/A' ? (b.box[0] + b.drawer) : b.location}</span>
          </div>
        </div>`).join('\n')}
      </div>
    </div>`
  }

  get style () {
    return `
    .${this._id} .icon {
      --size: 2.8rem;
      color: var(--color-grey, grey);
      cursor: pointer;
      height: var(--size);
      overflow: hidden;
      position: absolute;
      right: 6rem;
      top: 2rem;
      width: var(--size);
      z-index: var(--elevation-child, 30);
    }
    .${this._id} .icon svg {
      height: 100%;
      width: 100%;
    }
    .list {
      height: 30vh;
      overflow: auto;
    }
    .a4-65 {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      grid-template-rows: repeat(13, 1fr);
      grid-column-gap: 10px;
      width: 1190px;
      height: 1625px;
      margin: auto;
      background: white;
      padding: 62px 28px 0 31px;
    }
    .a4-65 > .barcode {
      height: 120px;
      overflow: hidden;
    }
    .barcode {
      display: flex;
      justify-content: space-evenly;
      align-items: center;
      border: 2px solid;
      border-radius: 8px;
      padding: 6px;
    }
    .barcode:nth-child(even){
      border-style: dashed;
    }
    .barcode .name {
      overflow: hidden;
      line-height: 1.2rem;
      padding-left: 10px;
      font-size: 0.8rem;
      font-family: sans-serif;
      letter-spacing: -0.5px;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .barcode .location {
      padding-top: 0.3rem;
      font-weight: bold;
      font-family: monospace;
      font-size: 1.2rem;
    }
    .print-zone {
      background: none;
      box-shadow: 0 0 1rem -0.3rem;
      height: 30vh;
      margin: 1rem;
      overflow: auto;
      position: inherit;
      width: 40vw;
    }
    @media print {
      .print-zone {
        background: grey;
        box-shadow: none;
        height: 100%;
        left: 0;
        margin: 0;
        overflow: visible;
        position: absolute;
        top: 0;
        width: 100%;
        z-index: 100;
      }
      .barcode {
        border-color: white;
      }
    }
    `
  }

  constructor () {
    super()
    this._id = 'app-print-barcodes'
    this.barcodes = []
    this.els = {}
    this.on('barcodes-to-print', this.prepareBarcodes)
  }

  on (eventName, callback) {
    window.addEventListener(eventName, event => callback.bind(this)(event.detail))
  }

  emit (eventName, eventData) {
    console.log(`emit event "${eventName}"`, eventData === undefined ? '' : eventData)
    window.dispatchEvent(new CustomEvent(eventName, { detail: eventData }))
  }

  showModal (active) {
    console.log('print barcodes toggle', active ? 'show' : 'hide')
    this.els.wrapper.querySelector('.backdrop').classList.toggle('hidden', !active)
    this.emit('get-barcodes-to-print')
  }

  previewBarcodes () {
    this.barcodes = this.barcodes.filter(b => this.selection.includes(b.id))
    this.els.modal.innerHTML = this.modalContentPrint
  }

  prepareBarcodes (barcodes) {
    this.barcodes = barcodes.sort(a => a.reference ? -1 : 1)
    this.els.modal = this.els.wrapper.querySelector('.app-modal--print-barcodes')
    this.els.modal.innerHTML = this.modalContentPrepare
    this.els.modal.addEventListener('click', event => this.onModalPrepareClick(event))
    this.els.previewBtn = this.els.modal.querySelector('button.preview')
    this.els.previewBtn.onclick = () => this.previewBarcodes()
    this.els.previewError = this.els.modal.querySelector('.error.preview')
    this.selectValidItems()
  }

  onModalPrepareClick (event) {
    const action = event.target.getAttribute('data-action')
    if (!action) return
    if (action === 'select-all') this.setAllItems(true)
    if (action === 'select-none') this.setAllItems(false)
    if (action === 'select-valid') this.selectValidItems()
    console.log('action clicked :', action)
    this.updatePreviewButton()
  }

  setAllItems (selected = true) {
    document.querySelectorAll('input[data-action="select-one"]').forEach(el => (el.checked = selected))
  }

  selectValidItems () {
    const forms = Array.from(this.els.wrapper.querySelectorAll('.list app-form'))
    forms.forEach(form => {
      // check valid form related checkbox
      if (form.getAttribute('valid') === 'true') document.getElementById(form.name).checked = true
    })
    this.updatePreviewButton()
  }

  updatePreviewButton () {
    this.selection = Array.from(document.querySelectorAll('input[data-action="select-one"]:checked')).map(e => e.id)
    this.els.previewBtn.disabled = this.selection.length <= 0 || this.selection.length > 65
    this.els.previewBtn.textContent = `Preview ${this.selection.length} barcodes`
    this.els.previewError.textContent = ''
    if (!this.els.previewBtn.disabled) return
    if (this.selection.length <= 0) this.els.previewError.textContent = 'You need to select at least one item'
    if (this.selection.length > 65) this.els.previewError.textContent = 'You cannot select more than 65 items'
  }

  createWrapper () {
    const wrapper = document.createElement('div')
    wrapper.className = `${this._id}`
    wrapper.innerHTML = this.template
    this.els.icon = wrapper.querySelector('.icon')
    this.els.icon.onclick = () => this.showModal(true)
    const style = document.createElement('style')
    style.innerHTML = this.style
    wrapper.appendChild(style)
    return wrapper
  }

  connectedCallback () {
    this.els.wrapper = this.createWrapper()
    this.parentNode.replaceChild(this.els.wrapper, this)
  }
}

window.customElements.define('app-print-barcodes', AppPrintBarcodes)