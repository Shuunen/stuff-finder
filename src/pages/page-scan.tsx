import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import Skeleton from '@mui/material/Skeleton'
import { signal, useSignalEffect } from '@preact/signals'
import { BrowserMultiFormatReader } from '@zxing/library/es2015/browser/BrowserMultiFormatReader'
import type Exception from '@zxing/library/es2015/core/Exception'
import notFoundException from '@zxing/library/es2015/core/NotFoundException'
import type Result from '@zxing/library/es2015/core/Result'
import { route } from 'preact-router'
import { useCallback, useRef } from 'preact/hooks'
import { sleep } from 'shuutils'
import { AppPageCard } from '../components/app-page-card'
import { delays } from '../constants'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'

const reader = new BrowserMultiFormatReader()

function onDecodeSuccess (result: Result) {
  const code = result.getText()
  logger.info('found qr or barcode :', code)
  route(`/search/${code}`)
}

/**
 * This function is called every 25ms by the zxing library, seems to be the result of every decoded frame from the video stream
 * @param result the result of the scan or null if no result was found
 * @param sound the sound element
 * @param error the error that occurred if any
 * @returns {void} nothing
 */
async function onDecode (result: Result | null, sound: HTMLAudioElement | null, error?: Exception) {
  if (state.status !== 'ready') state.status = 'ready'
  if (error && !(error instanceof notFoundException)) { logger.showError(error.message, error); return }
  if (result === null) return // if no result was found, do nothing
  await sound?.play()
  await sleep(delays.medium)
  onDecodeSuccess(result)
}

export function PageScan ({ ...properties }: Readonly<Record<string, unknown>>) {

  logger.debug('PageScan', { properties })
  const videoReference = useRef<HTMLVideoElement>(null)
  const video = signal(videoReference)
  const soundReference = useRef<HTMLAudioElement>(null)
  const sound = signal(soundReference)

  useSignalEffect(useCallback(() => {
    // this run once, when the component is mounted
    if (video.value.current === null) throw new Error('video element is null')
    if (state.status !== 'loading') state.status = 'loading'
    logger.debug('starting video stream decoding...')
    void reader.decodeFromVideoDevice(null, video.value.current, (result, error) => { void onDecode(result, sound.value.current, error) } /* eslint-disable-line unicorn/no-null */)
    return () => { reader.reset() } // this run once, when the component is about to unmount
  }, [sound.value, video.value]))

  return (
    <AppPageCard cardTitle="Scan" icon={QrCodeScannerIcon} pageCode="scan" pageTitle="Scan QR Code or Barcode">
      <div class="flex flex-col">
        <h2 class="text-center">Scan a QR Code or a barcode to search for it 👀</h2>
        <div class="relative flex aspect-video h-44 flex-col overflow-hidden rounded-xl shadow-lg">
          <Skeleton class="absolute left-0 top-0 size-full" height={176} variant="rounded" />
          <video class="w-full object-cover" ref={videoReference} />
          <audio preload="auto" ref={soundReference} src="/assets/barcode-scan-beep-09.mp3" />
        </div>
      </div>
    </AppPageCard>
  )
}
