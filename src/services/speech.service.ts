import { emit, on, sleep } from 'shuutils'
import { delays } from '../constants'
import type { AppSoundErrorEvent, AppSoundInfoEvent, AppSpeechStartEvent, AppStatus, AppStatusEvent, RecognitionErrorEvent, SearchStartEvent } from '../types'
import { logger } from '../utils/logger.utils'

class AppSpeech {

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, etc/no-deprecated
  private readonly isMobile = window.orientation !== undefined

  private recognition!: SpeechRecognition

  private hasRecognitionSucceed = false

  public constructor () {
    this.initRecognition()
    on<AppSpeechStartEvent>('app-speech--start', this.onStart.bind(this))
  }

  private initRecognition () {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/strict-boolean-expressions, @typescript-eslint/naming-convention
    const AvailableSpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new AvailableSpeechRecognition()
    recognition.lang = navigator.language
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      logger.info('recognition results', event.results)
      // eslint-disable-next-line unicorn/prefer-spread
      const [result] = Array.from(event.results.item(event.resultIndex))
      logger.info('recognition result', result)
      if (!result) throw new Error('no recognition first result found')
      this.onSuccess(result.transcript, result.confidence)
    }
    recognition.onspeechend = async () => { await this.onEnd() }
    recognition.onnomatch = () => { this.onFail() }
    recognition.addEventListener('error', (event: RecognitionErrorEvent) => { this.onError(event.error) })
    this.recognition = recognition
  }

  private onStart () {
    this.recognition.start()
    this.hasRecognitionSucceed = false
    this.setStatus('listening')
  }

  private onSuccess (str: string, confidence: number) {
    this.hasRecognitionSucceed = true
    logger.info('confidence', confidence)
    emit<SearchStartEvent>('search-start', { str, origin: 'speech' })
  }

  private onError (reason: string) {
    logger.showError(`error occurred in recognition : ${reason}`)
    this.onFail()
  }

  private onFail () {
    this.setStatus('failed')
  }

  private setStatus (status: AppStatus) {
    emit<AppStatusEvent>('app-status', status)
    if (status === 'listening' && !this.isMobile) emit<AppSoundInfoEvent>('app-sound--info')
    else if (status === 'failed') emit<AppSoundErrorEvent>('app-sound--error')
    else logger.info('un-handled app status', status)
  }

  private async onEnd () {
    this.recognition.stop()
    // this delay the test on recognitionSucceed because onEnd is triggered just before onSuccess
    // this lead recognitionSucceed to be still false by default at this moment and this next line conclude that recognition has failed
    // when delayed this line is executed after a potential onSuccess which make use of recognitionSucceed state
    await sleep(delays.medium)
    this.setStatus(this.hasRecognitionSucceed ? 'ready' : 'failed')
  }

}

export const appSpeech = new AppSpeech()
