/* global window */

import { on } from 'shuutils'

class AppSound {
  constructor() {
    this.audioContext = new window.AudioContext({ latencyHint: 'interactive' })
    on('app-sound--info', () => this.onInfo())
    on('app-sound--error', () => this.onError())
    on('app-sound--success', () => this.onSuccess())
  }

  onInfo() {
    this.playTone(400, 0.7)
  }

  onError() {
    this.playTone(200, 0.4)
    setTimeout(() => this.playTone(100, 0.7), 100)
  }

  onSuccess() {
    this.playTone(600, 0.4)
    setTimeout(() => this.playTone(800, 0.7), 100)
  }

  playTone(frequency = 400, seconds = 1) {
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
