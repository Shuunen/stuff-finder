/* eslint-disable sonar/redundant-type-aliases */
import type { AppStatus } from './status.types'

type SearchOrigin = 'default' | 'scan' | 'search-results' | 'speech' | 'type' | 'url'

export type AppSpeechStartEvent = undefined
export type AppStatusEvent = AppStatus
export type RecognitionErrorEvent = { error: string }
export type SearchStartEvent = { origin: SearchOrigin; str: string; willScrollTop?: boolean }
