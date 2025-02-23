import { Result } from 'shuutils'
import { logger } from './logger.utils'
import { state } from './state.utils'

/**
 * Listen user speech
 * @param onSuccess the function to call when the speech is recognized
 */
export function listenUserSpeech (onSuccess: (transcript: string, confidence: number) => void) {
  let isSuccess = false
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/strict-boolean-expressions
  const recognition = new (globalThis.webkitSpeechRecognition || globalThis.SpeechRecognition)()
  recognition.lang = 'fr-FR'
  recognition.interimResults = false
  recognition.maxAlternatives = 1
  /**
   * Called when the speech is recognized
   * @param event the speech recognition event
   * @returns the result of the recognition
   */
  // biome-ignore lint/correctness/noUndeclaredVariables: it's ok buddy
  recognition.onresult = (event: SpeechRecognitionEvent) => {
    isSuccess = true
    const [result] = Array.from(event.results.item(event.resultIndex))
    if (!result) return Result.error('no recognition result found')
    onSuccess(result.transcript, result.confidence)
    return Result.ok('speech recognized successfully')
  }
  /**
   * Called when the speech is not recognized
   */
  recognition.onnomatch = () => {
    logger.warn('speech : no match found')
    state.sound = 'error'
  }
  /**
   * Called when the speech recognition end
   */
  recognition.onend = () => { state.sound = isSuccess ? 'stop' : 'error' }
  // start the speech recognition, listen to the user
  state.sound = 'start'
  recognition.start()
}
