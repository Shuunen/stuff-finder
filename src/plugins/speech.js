import { BaseModel } from '../model'

class PluginSpeech extends BaseModel {
  constructor () {
    super('speech')
    this.log('constructor')
    this.initRecognition()
    this.intent = ''
    this.isMobile = typeof window.orientation !== 'undefined'
  }

  afterLoad () {
    this.showLog((this.isMobile ? 'mobile' : 'desktop') + ' detected')
  }

  setupListeners () {
    this.on('speech-recognition', this.startRecognition)
  }

  initRecognition () {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'fr-FR'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1][0]
      this.onRecognition(result.transcript, result.confidence)
    }
    recognition.onspeechend = () => (this.log('speech end') && recognition.stop())
    recognition.onnomatch = (event) => this.log('onnomatch')
    recognition.onerror = (event) => this.log('error occurred in recognition: ' + event.error)
    this.recognition = recognition
  }

  onRecognition (sentence, confidence) {
    this.log('sentence :', sentence)
    this.log('confidence : ' + confidence)
    this.emit('do-prompt-intent', { stuff: sentence, intent: this.intent })
  }

  startRecognition (intent = 'unknown') {
    this.intent = intent
    this.recognition.start()
    this.emit('do-prompt-intent', { intent: this.intent })
    this.log('listening...')
  }
}

export const pluginSpeech = new PluginSpeech()
