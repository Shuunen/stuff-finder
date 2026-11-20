import { Alert, Collapse } from '@mui/material'
import Skeleton from '@mui/material/Skeleton'
import { BrowserMultiFormatReader } from '@zxing/library/es2015/browser/BrowserMultiFormatReader'
import ChecksumException from '@zxing/library/es2015/core/ChecksumException'
import type Exception from '@zxing/library/es2015/core/Exception'
import FormatException from '@zxing/library/es2015/core/FormatException'
import notFoundException from '@zxing/library/es2015/core/NotFoundException'
import ReaderException from '@zxing/library/es2015/core/ReaderException'
import type ZxingResult from '@zxing/library/es2015/core/Result'
import { useEffect, useRef, useState } from 'react'
import { functionReturningVoid, Result } from 'shuutils'
import { AppPageCard } from '../components/app-page-card'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'
import { navigateToSearch } from './page-search.const'

// zxing 0.23 only ignores ReaderException in MultiFormatReader, but these normal "nothing found in this frame" errors do not extend it, so it logs a console.warn on every frame
for (const exceptionClass of [ChecksumException, FormatException, notFoundException]) Object.setPrototypeOf(exceptionClass.prototype, ReaderException.prototype)

type ScanStatus = 'error' | 'loading' | 'need-perm' | 'ready'

const reader = new BrowserMultiFormatReader()
const waitDelay = 200

function onDecodeSuccess(result: ZxingResult) {
  const code = result.getText()
  logger.info('found qr or barcode :', { code, result })
  void navigateToSearch(code)
}

function renderScanStatus(status: ScanStatus, videoReference: React.RefObject<HTMLVideoElement | null>) {
  return (
    <>
      <Collapse data-testid="scan-loading" in={status === 'loading'}>
        <Skeleton animation="wave" height={320} variant="rounded" />
      </Collapse>
      <Collapse data-testid="scan-ready" in={status === 'ready'}>
        <div className="aspect-video max-h-80 overflow-hidden rounded-xl shadow-lg">
          <video data-testid="scan-video" height={360} width={640} className="w-full object-cover" ref={videoReference} />
        </div>
      </Collapse>
      <Collapse data-testid="scan-need-perm" in={status === 'need-perm'}>
        <Alert severity="error">Permission needed, allow access to your camera to scan QR codes and barcodes.</Alert>
      </Collapse>
      <Collapse data-testid="scan-error" in={status === 'error'}>
        <Alert severity="error">An unknown error occurred while starting the video stream, check the logs.</Alert>
      </Collapse>
    </>
  )
}

/**
 * Handle an error given by the zxing library for a decoded frame
 * @param error the error to handle, the ReaderException ones (nothing found, bad checksum or format) are normal for most frames
 * @returns {void} nothing
 */
function onDecodeError(error: Exception) {
  if (error instanceof ReaderException) return
  logger.showError(error.message, error)
}

/**
 * Update the status of the page once the camera stream started or failed to start, never rejects so it can safely be called without awaiting it
 * @param decoding the promise from zxing, resolved once the stream is displayed and the decoding loop started
 * @param setStatus to update the status of the scan page
 * @param isDone to know if the scan was already stopped
 * @returns {Promise<void>} nothing
 */
async function updateStatusFromStream(decoding: Promise<void>, setStatus: (status: ScanStatus) => void, isDone: () => boolean) {
  const result = await Result.trySafe(decoding)
  if (result.ok) {
    if (!isDone()) setStatus('ready')
    return
  }
  state.sound = 'error'
  logger.error('error starting video stream decoding :', result.error)
  setStatus(result.error instanceof Error && result.error.name === 'NotAllowedError' ? 'need-perm' : 'error')
}

/**
 * Start decoding the video stream of the camera
 * @param video the video element to display the camera in
 * @param setStatus to update the status of the scan page
 * @returns the function to stop the decoding
 */
function startScanning(video: HTMLVideoElement, setStatus: (status: ScanStatus) => void) {
  state.sound = 'start'
  let isDone = false // true once a code was found or the page is left, to ignore the frames still being decoded
  let navigationTimer: ReturnType<typeof setTimeout> | undefined = undefined
  const decoding = reader.decodeFromVideoDevice(null, video, (result, error) => {
    if (isDone) return
    if (result?.getText()) {
      isDone = true
      reader.reset() // stop decoding now, otherwise the same code is found again and the loop fails once the video is gone
      state.sound = 'barcode'
      navigationTimer = setTimeout(() => {
        onDecodeSuccess(result)
      }, waitDelay)
      return
    }
    if (error) onDecodeError(error)
  })
  // not awaited on purpose, the effect needs the stop function right away and the status is updated later
  void updateStatusFromStream(decoding, setStatus, () => isDone)
  return () => {
    isDone = true
    clearTimeout(navigationTimer)
    reader.reset()
  }
}

export function PageScan({ ...properties }: Readonly<Record<string, unknown>>) {
  logger.debug('PageScan', { properties })
  const videoReference = useRef<HTMLVideoElement>(null)
  const [status, setStatus] = useState<ScanStatus>('loading')

  useEffect(() => {
    // this run once, when the component is mounted, and the returned function when it is about to unmount
    if (!videoReference.current) {
      logger.showError('video element is null')
      return functionReturningVoid
    }
    const video = videoReference.current
    let stopScanning = functionReturningVoid
    // delayed so the mount/unmount/mount done by StrictMode in dev does not start two decoding loops on the same reader, only one would be stopped by reset
    const timer = setTimeout(() => {
      logger.debug('starting video stream decoding...')
      stopScanning = startScanning(video, setStatus)
    }, 0)
    return () => {
      clearTimeout(timer)
      stopScanning()
    }
  }, [])

  return (
    <AppPageCard cardTitle="Scan" pageCode="scan" pageTitle="Scan QR Code or Barcode">
      <div className="text-center">
        <h2 className="mb-6">Scan a QR Code or a barcode to search for it 👀</h2>
        {renderScanStatus(status, videoReference)}
      </div>
    </AppPageCard>
  )
}
