/* eslint-disable @typescript-eslint/no-magic-numbers */
import { on, sleep } from 'shuutils'
import type { AppSoundErrorEvent, AppSoundInfoEvent, AppSoundSuccessEvent } from '../types'

class AppSound {

  private audioContext: AudioContext | undefined

  public constructor () {
    on<AppSoundInfoEvent>('app-sound--info', this.onInfo.bind(this))
    on<AppSoundErrorEvent>('app-sound--error', this.onError.bind(this))
    on<AppSoundSuccessEvent>('app-sound--success', this.onSuccess.bind(this))
  }

  private onInfo () {
    this.playTone(400, 0.7)
  }

  private playTone (frequency = 400, seconds = 1) {
    if (!this.audioContext) this.audioContext = new window.AudioContext({ latencyHint: 'interactive' })
    const oscillator = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()
    oscillator.connect(gain)
    oscillator.type = 'sine'
    oscillator.frequency.value = frequency
    gain.connect(this.audioContext.destination)
    oscillator.start(0)
    gain.gain.exponentialRampToValueAtTime(0.000_006, this.audioContext.currentTime + seconds)
  }

  private async onError () {
    this.playTone(200, 0.4)
    await sleep(100)
    this.playTone(100, 0.7)
  }

  private async onSuccess () {
    this.playTone(600, 0.4)
    await sleep(100)
    this.playTone(800, 0.7)
  }

}

export const appSound = new AppSound()
