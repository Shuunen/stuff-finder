/* global HTMLElement, CustomEvent */
import jsQR from 'jsqr'
import { SEARCH_ORIGIN } from '../constants'

class AppScanCode extends HTMLElement {
  constructor () {
    super()
    this.els = {}
    this.on('app-scan-code--start', this.start)
  }

  emit (eventName, eventData) {
    console.log(`emit event "${eventName}"`, eventData === undefined ? '' : eventData)
    window.dispatchEvent(new CustomEvent(eventName, { detail: eventData }))
  }

  on (eventName, callback) {
    window.addEventListener(eventName, event => callback.bind(this)(event.detail))
  }

  showCanvas () {
    this.els.message.textContent = 'Point your camera to a QR code and search will starts.'
    this.els.loading.hidden = true
    this.els.canvasElement.hidden = false
    this.els.canvasElement.height = this.els.video.videoHeight
    this.els.canvasElement.width = this.els.video.videoWidth
    this.els.canvasElement.style.maxWidth = 300
  }

  hideCanvas () {
    this.els.message.textContent = 'Please wait few seconds'
    this.els.loading.hidden = false
    this.els.canvasElement.hidden = true
  }

  tick () {
    if (this.modalClosed) return
    console.log('ticking')
    if (this.els.video.readyState !== this.els.video.HAVE_ENOUGH_DATA) return window.requestAnimationFrame(this.tick.bind(this))
    if (!this.els.loading.hidden) this.showCanvas()
    this.els.canvas.drawImage(this.els.video, 0, 0, this.els.canvasElement.width, this.els.canvasElement.height)
    const imageData = this.els.canvas.getImageData(0, 0, this.els.canvasElement.width, this.els.canvasElement.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' })
    if (!code) return window.requestAnimationFrame(this.tick.bind(this))
    console.log('found qr code value :', code.data)
    this.emit('app-modal--scan-code--close')
    this.emit('app-sound--success')
    this.emit('search-start', { str: code.data, origin: SEARCH_ORIGIN.scan })
  }

  onCameraReady (stream) {
    this.emit('app-sound--info')
    this.els.video.srcObject = stream
    this.els.video.play()
    this.els.loading.innerText = '⌛ Loading video...'
    window.requestAnimationFrame(this.tick.bind(this))
  }

  onModalClose () {
    this.modalClosed = true
    this.hideCanvas()
    const streams = this.els.video.srcObject.getTracks()
    console.log(streams.length || 'no', 'stream(s) to stop')
    if (!streams.length) return
    streams.forEach(s => s.stop())
  }

  start () {
    console.log('user wants to scan something')
    this.emit('app-modal--scan-code--open')
    this.modalClosed = false
    this.on('app-modal--scan-code--closed', () => this.onModalClose())
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(stream => this.onCameraReady(stream))
  }

  createWrapper () {
    const wrapper = document.createElement('app-modal')
    wrapper.name = 'scan-code'
    return wrapper
  }

  addContent () {
    const title = this.els.title = document.createElement('h2')
    title.textContent = 'QR code scanner'
    title.classList.add('mb1')
    this.els.wrapper.appendChild(title)
    const loading = this.els.loading = document.createElement('div')
    loading.textContent = 'Unable to access video stream'
    this.els.wrapper.appendChild(loading)
    const canvasElement = this.els.canvasElement = document.createElement('canvas')
    canvasElement.setAttribute('hidden', true)
    this.els.canvas = canvasElement.getContext('2d')
    this.els.video = document.createElement('video')
    this.els.wrapper.appendChild(canvasElement)
    const message = this.els.message = document.createElement('p')
    message.textContent = 'You might not have video source or have declined access to it.'
    this.els.wrapper.appendChild(message)
  }

  connectedCallback () {
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
