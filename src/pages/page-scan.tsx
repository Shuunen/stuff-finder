import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import { Alert, Collapse } from '@mui/material'
import Skeleton from '@mui/material/Skeleton'
import { signal, useSignalEffect } from '@preact/signals'
import { BrowserMultiFormatReader } from '@zxing/library/es2015/browser/BrowserMultiFormatReader'
import type Exception from '@zxing/library/es2015/core/Exception'
import notFoundException from '@zxing/library/es2015/core/NotFoundException'
import type Result from '@zxing/library/es2015/core/Result'
import { route } from 'preact-router'
import { useCallback, useRef, useState } from 'preact/hooks'
import { sleep } from 'shuutils'
import { AppPageCard } from '../components/app-page-card'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'

const reader = new BrowserMultiFormatReader()
const waitDelay = 200

function onDecodeSuccess (result: Result) {
  const code = result.getText()
  logger.info('found qr or barcode :', code)
  route(`/search/${code}`)
}

/**
 * This function is called every 25ms by the zxing library, seems to be the result of every decoded frame from the video stream
 * @param result the result of the scan or null if no result was found
 * @param error the error that occurred if any
 * @returns {void} nothing
 */
async function onDecode (result: null | Result, error?: Exception) {
  if (error && !(error instanceof notFoundException)) { logger.showError(error.message, error); return }
  if (result === null) return // if no result was found, do nothing
  state.sound = 'barcode'
  await sleep(waitDelay)
  onDecodeSuccess(result)
}

export function PageScan ({ ...properties }: Readonly<Record<string, unknown>>) {

  logger.debug('PageScan', { properties })
  const videoReference = useRef<HTMLVideoElement>(null)
  const video = signal(videoReference)
  const [status, setStatus] = useState<'error' | 'loading' | 'need-perm' | 'ready'>('loading')

  useSignalEffect(useCallback(() => {
    // this run once, when the component is mounted
    if (video.value.current === null) { logger.showError('video element is null'); return () => ({}) }
    logger.debug('starting video stream decoding...')
    state.sound = 'start'
    void reader.decodeFromVideoDevice(null, video.value.current, (result, error) => { /* eslint-disable-line unicorn/no-null */
      if (status === 'loading') void sleep(waitDelay).then(() => { setStatus('ready') })
      void onDecode(result, error)
    })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()
        state.sound = 'error'
        logger.error('error starting video stream decoding :', error)
        setStatus(message.includes('permission') ? 'need-perm' : 'error')
      })
    return () => { reader.reset() } // this run once, when the component is about to unmount
  }, [video.value, status]))

  return (
    <AppPageCard cardTitle="Scan" icon={QrCodeScannerIcon} pageCode="scan" pageTitle="Scan QR Code or Barcode">
      <div class="text-center">
        <h2 class="mb-6">Scan a QR Code or a barcode to search for it 👀</h2>
        <Collapse in={status === 'loading'}>
          <Skeleton animation="wave" height={320} variant="rounded" />
        </Collapse>
        <Collapse in={status === 'ready'}>
          <div class="aspect-video max-h-80 overflow-hidden rounded-xl shadow-lg">
            <video class="w-full object-cover" ref={videoReference} />
          </div>
        </Collapse>
        <Collapse in={status === 'need-perm'}>
          <Alert severity="error">Permission needed, allow access to your camera to scan QR codes and barcodes.</Alert>
        </Collapse>
        <Collapse in={status === 'error'}>
          <Alert severity="error">An unknown error occurred while starting the video stream, check the logs.</Alert>
        </Collapse>
      </div>
    </AppPageCard>
  )
}
