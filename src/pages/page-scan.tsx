import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import Skeleton from '@mui/material/Skeleton'
import { signal, useSignalEffect } from '@preact/signals'
import { BrowserMultiFormatReader } from '@zxing/library/es2015/browser/BrowserMultiFormatReader'
import type Exception from '@zxing/library/es2015/core/Exception'
import notFoundException from '@zxing/library/es2015/core/NotFoundException'
import type Result from '@zxing/library/es2015/core/Result'
import { route } from 'preact-router'
import { useRef } from 'preact/hooks'
import { AppPageBottom } from '../components/app-page-bottom'
import { setTitle } from '../utils/browser.utils'
import { logger } from '../utils/logger.utils'
import { playSuccessSound } from '../utils/sound.utils'
import { state } from '../utils/state.utils'

const reader = new BrowserMultiFormatReader()

function onDecodeSuccess (result: Result) {
  const code = result.getText()
  logger.info('found qr or barcode :', code)
  void playSuccessSound()
  route(`/search/${code}`)
}

/**
 * This function is called every 25ms by the zxing library, seems to be the result of every decoded frame from the video stream
 * @param result the result of the scan or null if no result was found
 * @param error the error that occurred if any
 * @returns {void} nothing
 */
function onDecode (result: Result | null, error?: Exception) {
  if (state.status !== 'ready') state.status = 'ready'
  if (error && !(error instanceof notFoundException)) { logger.showError(error.message, error); return }
  if (result === null) return // if no result was found, do nothing
  onDecodeSuccess(result)
}

export function PageScan ({ ...properties }: { readonly [key: string]: unknown }) {

  logger.debug('PageScan', { properties })
  const videoReference = useRef<HTMLVideoElement>(null)
  const video = signal(videoReference)
  setTitle('Scan QR Code or Barcode')

  useSignalEffect(() => {
    // this run once, when the component is mounted
    if (video.value.current === null) throw new Error('video element is null')
    if (state.status !== 'loading') state.status = 'loading'
    logger.debug('starting video stream decoding...')
    void reader.decodeFromVideoDevice(null, video.value.current, (result, error) => onDecode(result, error) /* eslint-disable-line unicorn/no-null */)
    return () => { reader.reset() } // this run once, when the component is about to unmount
  })

  return (
    <div className="flex flex-col" data-page="scan">
      <h1>Scan code</h1>
      <h2 className="text-center">Scan a QR Code or a barcode to search for it 👀</h2>
      <div className="relative flex aspect-video h-44 flex-col overflow-hidden rounded-xl shadow-lg">
        {/* eslint-disable-next-line react/forbid-component-props */}
        <Skeleton className="absolute left-0 top-0 h-full w-full" height={176} variant="rounded" />
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video className="w-full object-cover" ref={videoReference} />
      </div>
      <AppPageBottom icon={QrCodeScannerIcon} />
    </div>
  )
}
