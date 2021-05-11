/* global window */

import { on, sleep } from 'shuutils'

class AppSound {
  constructor() {
    this.audioContext = null
    on('app-sound--info', () => this.onInfo())
    on('app-sound--error', () => this.onError())
    on('app-sound--success', () => this.onSuccess())
  }

  onInfo() {
    this.playTone(400, 0.7)
  }

  async onError() {
    this.playTone(200, 0.4)
    await sleep(100)
    this.playTone(100, 0.7)
  }

  async onSuccess() {
    this.playTone(600, 0.4)
    await sleep(100)
    this.playTone(800, 0.7)
  }

  playTone(frequency = 400, seconds = 1) {
    if (!this.audioContext) this.audioContext = new window.AudioContext({ latencyHint: 'interactive' })
    const o = this.audioContext.createOscillator()
    const g = this.audioContext.createGain()
    o.connect(g)
    o.type = 'sine'
    o.frequency.value = frequency
    g.connect(this.audioContext.destination)
    o.start(0)
    g.gain.exponentialRampToValueAtTime(0.000006, this.audioContext.currentTime + seconds)
  }
}

export const appSound = new AppSound()
