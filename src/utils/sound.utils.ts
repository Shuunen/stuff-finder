/* eslint-disable @typescript-eslint/no-magic-numbers */
import { sleep } from 'shuutils'
import { logger } from './logger.utils'

const audioContext = new window.AudioContext({ latencyHint: 'interactive' })

function playTone (frequency = 400, seconds = 1) {
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()
  oscillator.connect(gain)
  oscillator.type = 'sine'
  oscillator.frequency.value = frequency
  gain.connect(audioContext.destination)
  oscillator.start(0)
  gain.gain.exponentialRampToValueAtTime(0.000_006, audioContext.currentTime + seconds)
}

export function playInfoSound () {
  logger.debug('playing info sound')
  playTone(400, 0.7)
}

export async function playErrorSound () {
  logger.debug('playing error sound')
  playTone(200, 0.4)
  await sleep(100)
  playTone(100, 0.7)
}

export async function playSuccessSound () {
  logger.debug('playing success sound')
  playTone(600, 0.4)
  await sleep(100)
  playTone(800, 0.7)
}
