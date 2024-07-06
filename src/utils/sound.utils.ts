/* eslint-disable jsdoc/require-jsdoc */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { sleep } from 'shuutils'
import { logger } from './logger.utils'

const audioContext = new window.AudioContext({ latencyHint: 'interactive' })

function playTone (frequency = 400, milliseconds = 1000) {
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()
  gain.gain.value = 0.5 // 50 %
  oscillator.connect(gain)
  oscillator.type = 'sine'
  oscillator.frequency.value = frequency
  gain.connect(audioContext.destination)
  oscillator.start(0)
  gain.gain.exponentialRampToValueAtTime(0.000_006, audioContext.currentTime + milliseconds / 1000)
  // another way to do : oscillator.stop(audioContext.currentTime + milliseconds / 1000)
}

type SequenceItemTone = readonly [number, number]
type SequenceItemWait = number
type SequenceItem = SequenceItemTone | SequenceItemWait
type Sequence = readonly SequenceItem[]

export async function playSequence (sequence: Sequence) {
  logger.debug('playing sequence', JSON.stringify(sequence))
  // eslint-disable-next-line no-await-in-loop, @typescript-eslint/no-confusing-void-expression
  for (const item of sequence) await (typeof item === 'number' ? sleep(item) : playTone(item[0], item[1]))
}

export const sequences = {
  error: [[200, 400], 100, [100, 700]],
  info: [[400, 700]],
  success: [[600, 400], 100, [800, 700]],
} as const

export function playInfoSound () { logger.debug('playing info sound'); void playSequence(sequences.info) }
export function playErrorSound () { logger.debug('playing error sound'); void playSequence(sequences.error) }

export type { Sequence, SequenceItem, SequenceItemTone, SequenceItemWait }

