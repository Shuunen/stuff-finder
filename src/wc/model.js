module.exports = class extends HTMLElement {
  constructor (id = 'unknown') {
    super()
    this.id = id
  }

  log () {
    console.log.apply(console.log, [this.id, ':', ...arguments])
  }

  showLog (message, data) {
    this.log(message, data || '')
    this.emit('show-toast', { type: 'info', message })
  }

  warn () {
    console.warn.apply(console.warn, [this.id, ':', ...arguments])
  }

  error () {
    console.error.apply(console.error, [this.id, ':', ...arguments])
  }

  showError (message) {
    this.error(message)
    this.emit('show-toast', { type: 'error', message })
  }

  emit (eventName, eventData) {
    if (eventName instanceof Array) {
      // this allows to use emit(['an-event', 'another-one']) but same data will be passed
      eventName.forEach(name => this.emit(name, eventData))
      return
    }
    this.log(`emit event "${eventName}"`, eventData || '')
    window.dispatchEvent(new CustomEvent(eventName, { detail: eventData }))
  }

  on (eventName, callback) {
    window.addEventListener(eventName, event => callback.bind(this)(event.detail))
  }
}
