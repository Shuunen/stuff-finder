import { signal } from '@preact/signals'
import { useRef } from 'preact/hooks'
import { logger } from '../utils/logger.utils'
import { state, watchState } from '../utils/state.utils'

// eslint-disable-next-line max-statements
export function AppSounds () {
  const barcodeReference = useRef<HTMLAudioElement>(null)
  const barcodeSound = signal(barcodeReference)
  const notifyReference = useRef<HTMLAudioElement>(null)
  const notifySound = signal(notifyReference)
  const startReference = useRef<HTMLAudioElement>(null)
  const startSound = signal(startReference)
  const stopReference = useRef<HTMLAudioElement>(null)
  const stopSound = signal(stopReference)
  const errorReference = useRef<HTMLAudioElement>(null)
  const errorSound = signal(errorReference)
  // eslint-disable-next-line complexity
  watchState('sound', () => {
    logger.info('sound to play', state.sound)
    if (state.sound === 'barcode') void barcodeSound.value.current?.play()
    if (state.sound === 'notify') void notifySound.value.current?.play()
    if (state.sound === 'start') void startSound.value.current?.play()
    if (state.sound === 'stop') void stopSound.value.current?.play()
    if (state.sound === 'error') void errorSound.value.current?.play()
  })
  return (<>
    <audio preload="auto" ref={barcodeReference} src="/assets/barcode-scan-beep-09.mp3" />
    <audio preload="auto" ref={notifyReference} src="/assets/windows-xp-notify.mp3" />
    <audio preload="auto" ref={startReference} src="/assets/windows-xp-start.mp3" />
    <audio preload="auto" ref={stopReference} src="/assets/windows-xp-stop-mod.mp3" />
    <audio preload="auto" ref={errorReference} src="/assets/windows-hardware-fail-mod.mp3" />
  </>
  )
}
