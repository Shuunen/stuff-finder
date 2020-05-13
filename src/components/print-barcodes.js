/* global HTMLElement, CustomEvent */

class AppPrintBarcodes extends HTMLElement {
  get template () {
    return `
      <div class="icon" title="Print barcodes">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><defs/><path fill="currentColor" fill-rule="evenodd" d="M8 4h8v2H8V4zm10 2h4v12h-4v4H6v-4H2V6h4V2h12v4zm2 10h-2v-2H6v2H4V8h16v8zM8 16h8v4H8v-4zm0-6H6v2h2v-2z" clip-rule="evenodd"/></svg>
      </div>
      <app-modal name="print-barcodes" />`
  }

  get modalContent () {
    return `
    <h1>Print Barcodes</h1>
    <p>
      Below is a preview of the page that will be printed. <br>
      Make sure to remove any print margin after <a href="#" onclick="print()">clicking me</a>.
    </p>
    <div class="print-zone preview">
      <div class="a4-65">
        ${this.barcodes.map(b => `<div class=barcode>${b.name}<br>${b.reference}</div>`).join('\n')}
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
      justify-content: center;
      align-items: center;
      border: 2px solid;
      border-radius: 8px;
    }
    .barcode:nth-child(even){
      border-style: dashed;
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
    }
    `
  }

  constructor () {
    super()
    this._id = 'app-print-barcodes'
    this.barcodes = []
    this.els = {}
    this.on('barcodes-to-print', this.showBarcodes)
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

  showBarcodes (barcodes = []) {
    this.barcodes = barcodes.slice(0, 65)
    this.els.wrapper.querySelector('.app-modal--print-barcodes').innerHTML = this.modalContent
    // this.els.wrapper.querySelector('a.print').onclick = () => this.startPrint()
  }

  startPrint () {

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
