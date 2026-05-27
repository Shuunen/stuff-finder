import { useRef } from 'react'
import { logger } from '../utils/logger.utils'
import { state, watchState } from '../utils/state.utils'

export function AppSounds() {
  const barcodeReference = useRef<HTMLAudioElement>(null)
  const notifyReference = useRef<HTMLAudioElement>(null)
  const startReference = useRef<HTMLAudioElement>(null)
  const stopReference = useRef<HTMLAudioElement>(null)
  const errorReference = useRef<HTMLAudioElement>(null)

  watchState('sound', () => {
    logger.info('sound to play', state.sound)
    if (state.sound === 'barcode') barcodeReference.current?.play()
    if (state.sound === 'notify') notifyReference.current?.play()
    if (state.sound === 'start') startReference.current?.play()
    if (state.sound === 'stop') stopReference.current?.play()
    if (state.sound === 'error') errorReference.current?.play()
  })
  return (
    <>
      <audio preload="auto" ref={barcodeReference} src="/assets/barcode-scan-beep-09.mp3" />
      <audio preload="auto" ref={notifyReference} src="/assets/windows-xp-notify.mp3" />
      <audio preload="auto" ref={startReference} src="/assets/windows-xp-start.mp3" />
      <audio preload="auto" ref={stopReference} src="/assets/windows-xp-stop-mod.mp3" />
      <audio preload="auto" ref={errorReference} src="/assets/windows-hardware-fail-mod.mp3" />
    </>
  )
}
