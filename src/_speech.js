const App = require('./app')

class AppSpeech extends App {
  constructor () {
    super('speech')
    this.log('constructor')
    this.initRecognition()
    this.intent = ''
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
    recognition.onspeechend = () => (console.log('speech end') && recognition.stop())
    recognition.onnomatch = (event) => console.log('onnomatch')
    recognition.onerror = (event) => console.log('error occurred in recognition: ' + event.error)
    this.recognition = recognition
  }

  onRecognition (sentence, confidence) {
    this.log('sentence :', sentence)
    this.log('confidence : ' + confidence)
    this.emit('do-prompt-intent', { stuff: sentence, intent: this.intent })
  }

  start (intent = 'unknown') {
    this.intent = intent
    this.recognition.start()
    console.log('listening...')
  }
}

window.appSpeech = new AppSpeech()
