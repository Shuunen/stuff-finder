import { Alert, Collapse } from '@mui/material'
import Skeleton from '@mui/material/Skeleton'
import { BrowserMultiFormatReader } from '@zxing/library/es2015/browser/BrowserMultiFormatReader'
import type Exception from '@zxing/library/es2015/core/Exception'
import notFoundException from '@zxing/library/es2015/core/NotFoundException'
import type Result from '@zxing/library/es2015/core/Result'
import { useEffect, useRef, useState } from 'react'
// oxlint-disable prefer-await-to-then
import { functionReturningVoid, sleep } from 'shuutils'
import { AppPageCard } from '../components/app-page-card'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'
import { navigateToSearch } from './page-search.const'

const reader = new BrowserMultiFormatReader()
const waitDelay = 200

function onDecodeSuccess(result: Result) {
  const code = result.getText()
  logger.info('found qr or barcode :', { code, result })
  void navigateToSearch(code)
}

function renderScanStatus(status: 'error' | 'loading' | 'need-perm' | 'ready', videoReference: React.RefObject<HTMLVideoElement | null>) {
  return (
    <>
      <Collapse in={status === 'loading'}>
        <Skeleton animation="wave" height={320} variant="rounded" />
      </Collapse>
      <Collapse in={status === 'ready'}>
        <div className="aspect-video max-h-80 overflow-hidden rounded-xl shadow-lg">
          <video className="w-full object-cover" ref={videoReference} />
        </div>
      </Collapse>
      <Collapse in={status === 'need-perm'}>
        <Alert severity="error">Permission needed, allow access to your camera to scan QR codes and barcodes.</Alert>
      </Collapse>
      <Collapse in={status === 'error'}>
        <Alert severity="error">An unknown error occurred while starting the video stream, check the logs.</Alert>
      </Collapse>
    </>
  )
}

/**
 * This function is called every 25ms by the zxing library, seems to be the result of every decoded frame from the video stream
 * @param result the result of the scan or null if no result was found
 * @param error the error that occurred if any
 * @returns {void} nothing
 */
async function onDecode(result: null | Result, error?: Exception) {
  if (error && !(error instanceof notFoundException)) {
    logger.showError(error.message, error)
    return
  }
  if (!result?.getText()) return // if no result was found, do nothing
  state.sound = 'barcode'
  await sleep(waitDelay)
  onDecodeSuccess(result)
}

export function PageScan({ ...properties }: Readonly<Record<string, unknown>>) {
  logger.debug('PageScan', { properties })
  const videoReference = useRef<HTMLVideoElement>(null)
  const [status, setStatus] = useState<'error' | 'loading' | 'need-perm' | 'ready'>('loading')

  useEffect(() => {
    // this run once, when the component is mounted
    if (!videoReference.current) {
      logger.showError('video element is null')
      return functionReturningVoid
    }
    logger.debug('starting video stream decoding...')
    state.sound = 'start'
    reader
      // oxlint-disable-next-line unicorn/no-null
      .decodeFromVideoDevice(null, videoReference.current, (result, error) => {
        if (status === 'loading')
          void sleep(waitDelay).then(() => {
            setStatus('ready')
            return undefined
          })
        onDecode(result, error).catch((decodeError: unknown) => {
          logger.showError('error decoding video stream :', decodeError)
        })
      })
      // oxlint-disable-next-line promise/prefer-await-to-callbacks
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()
        state.sound = 'error'
        logger.error('error starting video stream decoding :', error)
        setStatus(message.includes('permission') ? 'need-perm' : 'error')
      })
    return () => {
      reader.reset()
    } // this run once, when the component is about to unmount
  }, [status])

  return (
    <AppPageCard cardTitle="Scan" pageCode="scan" pageTitle="Scan QR Code or Barcode">
      <div className="text-center">
        <h2 className="mb-6">Scan a QR Code or a barcode to search for it 👀</h2>
        {renderScanStatus(status, videoReference)}
      </div>
    </AppPageCard>
  )
}
