class App {
  constructor (name = 'unknown') {
    this.name = name
    window.onload = () => this.beforeLoad()
  }

  log () {
    console.log.apply(console.log, [this.name, ':', ...arguments])
  }

  emit (eventName, eventData) {
    console.log(`%c${eventName}`, 'color: blue', eventData)
    window.dispatchEvent(new CustomEvent(eventName, { detail: eventData }))
  }

  on (eventName, callback) {
    window.addEventListener(eventName, event => callback.bind(this)(event.detail))
  }

  beforeLoad () {
    this.setupElements()
    this.setupListeners()
    this.onLoad()
  }

  onLoad () { }

  setupElements () { }

  setupListeners () { }
}

module.exports = App
