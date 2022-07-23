import { emit, on, sleep } from 'shuutils'

class AppSpeech {
  isMobile = typeof window.orientation !== 'undefined'
  recognition: any // eslint-disable-line @typescript-eslint/no-explicit-any
  recognitionSucceed = false
  constructor () {
    this.initRecognition()
    on('app-speech--start', () => this.onStart())
  }
  initRecognition (): void {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new Recognition()
    recognition.lang = navigator.language
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = (event: RecognitionResultEvent): void => {
      const result = event.results[event.results.length - 1][0]
      this.onSuccess(result.transcript, result.confidence)
    }
    recognition.onspeechend = (): Promise<void> => this.onEnd()
    recognition.onnomatch = (): void => this.onFail()
    recognition.addEventListener('error', event => this.onError(event.error))
    this.recognition = recognition
  }
  onStart (): void {
    this.recognition.start()
    this.recognitionSucceed = false
    this.setStatus('listening')
  }
  onSuccess (sentence, confidence): void {
    this.recognitionSucceed = true
    console.log('confidence : ' + confidence)
    emit('search-start', { str: sentence, origin: 'speech' } as SearchStartEvent)
  }
  async onEnd (): Promise<void> {
    this.recognition.stop()
    // this delay the test on recognitionSucceed because onEnd is triggered just before onSuccess
    // this lead recognitionSucceed to be still false by default at this moment and this next line conclude that recognition has failed
    // when delayed this line is executed after a potential onSuccess which make use of recognitionSucceed state
    await sleep(200)
    this.setStatus(this.recognitionSucceed ? 'ready' : 'failed')
  }
  onError (reason): void {
    console.error('error occurred in recognition : ' + reason)
    this.onFail()
  }
  onFail (): void {
    this.setStatus('failed')
  }
  setStatus (status): void {
    emit('app-status', status)
    if (status === 'listening' && !this.isMobile) emit('app-sound--info')
    else if (status === 'failed') emit('app-sound--error')
  }
}

export const appSpeech = new AppSpeech()
