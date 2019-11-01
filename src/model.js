export class BaseModel {
  constructor (name = 'unknown') {
    this.name = name
    this.on('load', this.beforeLoad)
  }

  log () {
    console.log.apply(console.log, [this.name, ':', ...arguments])
  }

  showLog (message, data) {
    this.log(message, data || '')
    this.emit('show-toast', { type: 'info', message })
  }

  warn () {
    console.warn.apply(console.warn, [this.name, ':', ...arguments])
  }

  error () {
    console.error.apply(console.error, [this.name, ':', ...arguments])
  }

  showError (message) {
    this.error(message)
    this.emit('show-toast', { type: 'error', message })
  }

  emit (eventName, eventData) {
    this.log(`emit event "${eventName}"`, eventData || '')
    window.dispatchEvent(new CustomEvent(eventName, { detail: eventData }))
  }

  on (eventName, callback) {
    window.addEventListener(eventName, event => callback.bind(this)(event.detail))
  }

  beforeLoad () {
    this.setupElements()
    this.setupListeners()
    this.onLoad()
    setTimeout(() => this.afterLoad(), 200)
  }

  onLoad () { }

  afterLoad () { }

  setupElements () { }

  setupListeners () { }

  async fadeIn (el) {
    this.log('fadeIn')
    if (!el.classList.contains('hide')) {
      return this.warn('please add "hide" class before mounting dom element and then call fade-in')
    }
    await this.sleep(10)
    el.style.opacity = 1
  }

  async fadeOut (el, destroy = false) {
    this.log('fadeOut')
    el.classList.add('hide')
    await this.sleep(350)
    el.classList.remove('hide')
    el.classList.add('hidden')
    if (!destroy) {
      return
    }
    await this.sleep(350)
    el.remove()
  }

  async sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, (ms || 1000)))
  }
}
