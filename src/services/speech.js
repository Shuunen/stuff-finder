/* global AudioContext, CustomEvent */

class AppSpeech {
  constructor () {
    this._id = 'app-speech'
    this.initRecognition()
    this.isMobile = typeof window.orientation !== 'undefined'
    this.audioContext = new AudioContext()
    this.on(`${this._id}--start`, this.onStart)
  }

  emit (eventName, eventData) {
    console.log(`emit event "${eventName}"`, eventData === undefined ? '' : eventData)
    window.dispatchEvent(new CustomEvent(eventName, { detail: eventData }))
  }

  on (eventName, callback) {
    window.addEventListener(eventName, event => callback.bind(this)(event.detail))
  }

  initRecognition () {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'fr-FR' // TODO: not generic ^^"
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1][0]
      this.onSuccess(result.transcript, result.confidence)
    }
    recognition.onspeechend = () => this.onEnd()
    recognition.onnomatch = () => this.onFail()
    recognition.onerror = (event) => this.onError(event.error)
    this.recognition = recognition
  }

  onStart () {
    this.recognition.start()
    this.recognitionSucceed = false
    this.setStatus('listening')
  }

  onSuccess (sentence, confidence) {
    this.recognitionSucceed = true
    console.log('confidence : ' + confidence)
    this.emit(`${this._id}--recognition-success`, sentence)
  }

  onEnd () {
    this.recognition.stop()
    // this delay the test on recognitionSucceed because onEnd is triggered just before onSuccess
    // this lead recognitionSucceed to be still false by default at this moment and this next line conclude that recognition has failed
    // when delayed this line is executed after a potential onSuccess which make use of recognitionSucceed state
    setTimeout(() => this.setStatus(this.recognitionSucceed ? 'ready' : 'failed'), 200)
  }

  onError (reason) {
    this.error('error occurred in recognition : ' + reason)
    this.onFail()
  }

  onFail () {
    this.setStatus('failed')
  }

  setStatus (status) {
    this.emit(`${this._id}--status`, status)
    if (status === 'listening' && !this.isMobile) {
      this.notify(400, 0.7)
    } else if (status === 'failed') {
      this.notify(200, 1.4)
    }
  }

  notify (frequency = 400, seconds = 1) {
    const o = this.audioContext.createOscillator()
    const g = this.audioContext.createGain()
    o.connect(g)
    o.type = 'sine'
    o.frequency.value = frequency
    g.connect(this.audioContext.destination)
    o.start(0)
    g.gain.exponentialRampToValueAtTime(0.000006, this.audioContext.currentTime + seconds)
  }
}

export const appSpeech = new AppSpeech()
