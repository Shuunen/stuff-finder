/* global window, navigator */
import { emit, on } from 'shuutils'
import { SEARCH_ORIGIN } from '../constants.js'

class AppSpeech {
  constructor() {
    this.initRecognition()
    this.isMobile = typeof window.orientation !== 'undefined'
    on('app-speech--start', this.onStart)
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = navigator.language || navigator.userLanguage
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = event => {
      const result = event.results[event.results.length - 1][0]
      this.onSuccess(result.transcript, result.confidence)
    }
    recognition.onspeechend = () => this.onEnd()
    recognition.onnomatch = () => this.onFail()
    recognition.addEventListener('error', event => this.onError(event.error))
    this.recognition = recognition
  }

  onStart() {
    this.recognition.start()
    this.recognitionSucceed = false
    this.setStatus('listening')
  }

  onSuccess(sentence, confidence) {
    this.recognitionSucceed = true
    console.log('confidence : ' + confidence)
    emit('search-start', { str: sentence, origin: SEARCH_ORIGIN.speech })
  }

  onEnd() {
    this.recognition.stop()
    // this delay the test on recognitionSucceed because onEnd is triggered just before onSuccess
    // this lead recognitionSucceed to be still false by default at this moment and this next line conclude that recognition has failed
    // when delayed this line is executed after a potential onSuccess which make use of recognitionSucceed state
    setTimeout(() => this.setStatus(this.recognitionSucceed ? 'ready' : 'failed'), 200)
  }

  onError(reason) {
    this.error('error occurred in recognition : ' + reason)
    this.onFail()
  }

  onFail() {
    this.setStatus('failed')
  }

  setStatus(status) {
    emit('app-speech--status', status)
    if (status === 'listening' && !this.isMobile) emit('app-sound--info')
    else if (status === 'failed') emit('app-sound--error')
  }
}

export const appSpeech = new AppSpeech()
