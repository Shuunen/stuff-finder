/* global window, document, navigator, HTMLElement */
import jsQR from 'jsqr'
import { emit, on } from 'shuutils'
import { SEARCH_ORIGIN } from '../constants.js'
import { dom, p } from '../utils.js'

class AppScanCode extends HTMLElement {
  constructor() {
    super()
    this.els = {}
    on('app-scan-code--start', () => this.start())
  }

  showCanvas() {
    this.els.message.textContent = 'Point your camera to a QR code and search will starts.'
    this.els.loading.hidden = true
    this.els.canvasElement.hidden = false
    this.els.canvasElement.height = this.els.video.videoHeight
    this.els.canvasElement.width = this.els.video.videoWidth
    this.els.canvasElement.style.maxWidth = 300
  }

  hideCanvas() {
    this.els.message.textContent = 'Please wait few seconds'
    this.els.loading.hidden = false
    this.els.canvasElement.hidden = true
  }

  tick() {
    if (this.modalClosed) return
    console.log('ticking')
    if (this.els.video.readyState !== this.els.video.HAVE_ENOUGH_DATA) return window.requestAnimationFrame(this.tick.bind(this))
    if (!this.els.loading.hidden) this.showCanvas()
    this.els.canvas.drawImage(this.els.video, 0, 0, this.els.canvasElement.width, this.els.canvasElement.height)
    const imageData = this.els.canvas.getImageData(0, 0, this.els.canvasElement.width, this.els.canvasElement.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' })
    if (!code) return window.requestAnimationFrame(this.tick.bind(this))
    console.log('found qr code value :', code.data)
    emit('app-modal--scan-code--close')
    emit('app-sound--success')
    emit('search-start', { str: code.data, origin: SEARCH_ORIGIN.scan })
  }

  onCameraReady(stream) {
    emit('app-sound--info')
    this.els.video.srcObject = stream
    this.els.video.play()
    this.els.loading.textContent = '⌛ Loading video...'
    window.requestAnimationFrame(this.tick.bind(this))
  }

  onModalClose() {
    this.modalClosed = true
    this.hideCanvas()
    const streams = this.els.video.srcObject.getTracks()
    console.log(streams.length > 0 ? streams.length : 'no', 'stream(s) to stop')
    if (streams.length === 0) return
    streams.forEach(s => s.stop())
  }

  start() {
    console.log('user wants to scan something')
    emit('app-modal--scan-code--open')
    this.modalClosed = false
    on('app-modal--scan-code--closed', () => this.onModalClose())
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(stream => this.onCameraReady(stream))
  }

  createWrapper() {
    const wrapper = dom('app-modal')
    wrapper.name = 'scan-code'
    return wrapper
  }

  addContent() {
    this.els.title = dom('h2', 'QR code scanner', 'mb1')
    this.els.wrapper.append(this.els.title)
    this.els.loading = dom('div', 'Unable to access video stream')
    this.els.wrapper.append(this.els.loading)
    this.els.canvasElement = dom('canvas')
    this.els.canvasElement.setAttribute('hidden', true)
    this.els.canvas = this.els.canvasElement.getContext('2d')
    this.els.video = dom('video')
    this.els.wrapper.append(this.els.canvasElement)
    this.els.message = p('You might not have video source or have declined access to it.')
    this.els.wrapper.append(this.els.message)
  }

  connectedCallback() {
    const wrapper = this.createWrapper()
    this.parentNode.replaceChild(wrapper, this)
    setTimeout(() => {
      this.els.wrapper = document.querySelector('.app-modal--scan-code')
      this.els.wrapper.classList.add('center')
      this.addContent()
    }, 500)
  }
}

window.customElements.define('app-scan-code', AppScanCode)
