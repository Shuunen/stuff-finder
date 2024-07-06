/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
/* eslint-disable jsdoc/require-jsdoc */
import { emit, on, sleep } from 'shuutils'
import { delays } from '../constants'
import type { AppSpeechStartEvent, AppStatusEvent, RecognitionErrorEvent, SearchStartEvent } from '../types/events.types'
import type { AppStatus } from '../types/status.types'
import { logger } from '../utils/logger.utils'
import { playErrorSound, playInfoSound } from '../utils/sound.utils'
import { state } from '../utils/state.utils'

// eslint-disable-next-line no-restricted-syntax
class AppSpeech {

  private hasRecognitionSucceed = false

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  private readonly isMobile = window.orientation !== undefined

  // biome-ignore lint/correctness/noUndeclaredVariables: it's a global variable
  private recognition!: SpeechRecognition

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
    // biome-ignore lint/correctness/noUndeclaredVariables: it's a global variable
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      logger.info('recognition results', event.results)
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

  private async onEnd () {
    this.recognition.stop()
    // this delay the test on recognitionSucceed because onEnd is triggered just before onSuccess
    // this lead recognitionSucceed to be still false by default at this moment and this next line conclude that recognition has failed
    // when delayed this line is executed after a potential onSuccess which make use of recognitionSucceed state
    await sleep(delays.medium)
    this.setStatus(this.hasRecognitionSucceed ? 'ready' : 'failed')
  }

  private onError (reason: string) {
    logger.showError(`error occurred in recognition : ${reason}`)
    this.onFail()
  }

  private onFail () {
    this.setStatus('failed')
  }

  private onStart () {
    this.recognition.start()
    this.hasRecognitionSucceed = false
    this.setStatus('listening')
  }

  private onSuccess (message: string, confidence: number) {
    this.hasRecognitionSucceed = true
    logger.info('confidence', confidence)
    emit<SearchStartEvent>('search-start', { origin: 'speech', str: message })
  }

  private setStatus (status: AppStatus) {
    emit<AppStatusEvent>('app-status', status)
    state.status = status
    if (status === 'listening' && !this.isMobile) playInfoSound()
    else if (status === 'failed') playErrorSound()
    else logger.info('un-handled app status', status)
  }

}

// eslint-disable-next-line no-new
new AppSpeech()

