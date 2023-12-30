import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import Skeleton from '@mui/material/Skeleton'
import { signal, useSignalEffect } from '@preact/signals'
import { BrowserMultiFormatReader } from '@zxing/library/es2015/browser/BrowserMultiFormatReader'
import type Exception from '@zxing/library/es2015/core/Exception'
import notFoundException from '@zxing/library/es2015/core/NotFoundException'
import type Result from '@zxing/library/es2015/core/Result'
import { route } from 'preact-router'
import { useEffect, useRef } from 'preact/hooks'
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

  useSignalEffect(() => {
    if (video.value.current === null) return
    if (state.status !== 'loading') state.status = 'loading'
    logger.debug('starting video stream decoding...')
    void reader.decodeFromVideoDevice(null, video.value.current, (result, error) => onDecode(result, error) /* eslint-disable-line unicorn/no-null */)
  })

  useEffect(() => () => {
    // this runs when the component is about to unmount
    reader.reset()
  }, []) // empty dependency array means this effect runs once on mount and cleanup on unmount

  return (
    <div className="flex flex-col items-center gap-6" data-page="scan">
      <h1>Scan code</h1>
      <p className="flex items-center justify-center gap-4">Scan a QR Code or a barcode to search for it 👀</p>
      <div className="relative flex aspect-video h-44 flex-col items-center justify-center overflow-hidden rounded-xl shadow-lg">
        {/* eslint-disable-next-line react/forbid-component-props */}
        <Skeleton className="absolute left-0 top-0 h-full w-full" height={176} variant="rounded" />
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video className="w-full object-cover" ref={videoReference} />
      </div>
      {/* eslint-disable-next-line react/forbid-component-props */}
      <QrCodeScannerIcon className="text-purple-600/40" sx={{ fontSize: 60 }} />
    </div>
  )
}
