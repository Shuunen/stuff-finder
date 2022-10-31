import { emit, on, sleep } from 'shuutils'
import { logger } from '../utils'

class AppSpeech {
  isMobile = typeof window.orientation !== 'undefined'
  recognition: any // eslint-disable-line @typescript-eslint/no-explicit-any
  recognitionSucceed = false
  constructor () {
    this.initRecognition()
    on<AppSpeechStartEvent>('app-speech--start', this.onStart.bind(this))
  }
  initRecognition (): void {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new Recognition()
    recognition.lang = navigator.language
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = (event: RecognitionResultEvent): void => {
      const results = event.results[event.results.length - 1]
      if (!results) throw new Error('no recognition results found')
      const result = results[0]
      if (!result) throw new Error('no recognition first result found')
      this.onSuccess(result.transcript, result.confidence)
    }
    recognition.onspeechend = (): Promise<void> => this.onEnd()
    recognition.onnomatch = (): void => this.onFail()
    recognition.addEventListener('error', (event: RecognitionErrorEvent) => this.onError(event.error))
    this.recognition = recognition
  }
  onStart (): void {
    this.recognition.start()
    this.recognitionSucceed = false
    this.setStatus('listening')
  }
  onSuccess (sentence: string, confidence: number): void {
    this.recognitionSucceed = true
    logger.log('confidence : ' + confidence)
    emit<SearchStartEvent>('search-start', { str: sentence, origin: 'speech' })
  }
  async onEnd (): Promise<void> {
    this.recognition.stop()
    // this delay the test on recognitionSucceed because onEnd is triggered just before onSuccess
    // this lead recognitionSucceed to be still false by default at this moment and this next line conclude that recognition has failed
    // when delayed this line is executed after a potential onSuccess which make use of recognitionSucceed state
    await sleep(200)
    this.setStatus(this.recognitionSucceed ? 'ready' : 'failed')
  }
  onError (reason: string): void {
    logger.showError('error occurred in recognition : ' + reason)
    this.onFail()
  }
  onFail (): void {
    this.setStatus('failed')
  }
  setStatus (status: AppStatus): void {
    emit<AppStatusEvent>('app-status', status)
    if (status === 'listening' && !this.isMobile) emit<AppSoundInfoEvent>('app-sound--info')
    else if (status === 'failed') emit<AppSoundErrorEvent>('app-sound--error')
  }
}

export const appSpeech = new AppSpeech()
