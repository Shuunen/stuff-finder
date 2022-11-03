import { emit, on, sleep } from 'shuutils'
import { logger } from '../utils'

class AppSpeech {

  private readonly isMobile = typeof window.orientation !== 'undefined'

  private recognition!: SpeechRecognition

  private recognitionSucceed = false

  public constructor () {
    this.initRecognition()
    on<AppSpeechStartEvent>('app-speech--start', this.onStart.bind(this))
  }

  private initRecognition (): void {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/strict-boolean-expressions
    const availableSpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new availableSpeechRecognition()
    recognition.lang = navigator.language
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = (event: SpeechRecognitionEvent): void => {
      logger.log('recognition results', event.results)
      const result = event.results.item(event.resultIndex)[0]
      logger.log('recognition result', result)
      if (!result) throw new Error('no recognition first result found')
      this.onSuccess(result.transcript, result.confidence)
    }
    recognition.onspeechend = async (): Promise<void> => this.onEnd()
    recognition.onnomatch = (): void => { this.onFail() }
    recognition.addEventListener('error', (event: RecognitionErrorEvent) => { this.onError(event.error) })
    this.recognition = recognition
  }

  private onStart (): void {
    this.recognition.start()
    this.recognitionSucceed = false
    this.setStatus('listening')
  }

  private onSuccess (sentence: string, confidence: number): void {
    this.recognitionSucceed = true
    logger.log('confidence', confidence)
    emit<SearchStartEvent>('search-start', { str: sentence, origin: 'speech' })
  }

  private async onEnd (): Promise<void> {
    this.recognition.stop()
    // this delay the test on recognitionSucceed because onEnd is triggered just before onSuccess
    // this lead recognitionSucceed to be still false by default at this moment and this next line conclude that recognition has failed
    // when delayed this line is executed after a potential onSuccess which make use of recognitionSucceed state
    await sleep(200)
    this.setStatus(this.recognitionSucceed ? 'ready' : 'failed')
  }

  private onError (reason: string): void {
    logger.showError('error occurred in recognition : ' + reason)
    this.onFail()
  }

  private onFail (): void {
    this.setStatus('failed')
  }

  private setStatus (status: AppStatus): void {
    emit<AppStatusEvent>('app-status', status)
    if (status === 'listening' && !this.isMobile) emit<AppSoundInfoEvent>('app-sound--info')
    else if (status === 'failed') emit<AppSoundErrorEvent>('app-sound--error')
  }
}

export const appSpeech = new AppSpeech()
