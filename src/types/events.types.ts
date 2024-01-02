/* eslint-disable sonar/redundant-type-aliases */
/* eslint-disable @typescript-eslint/no-use-before-define */
import type { Item, ItemField } from './item.types'
import type { AppCredentials } from './settings.types'
import type { AppStatus } from './status.types'

export type AppActionEvent = HTMLElement | object | string
export type AppCloneItemEvent = string
export type AppFormChangeEvent = AppFormData
export type AppFormCloseEvent = undefined
export type AppFormData = Record<string, AppFormDataValue> & { hasValidForm: boolean }
export type AppFormDataValue = boolean | number | string
export type AppFormEditItemChangeEvent = FormEditFormData
export type AppFormEditItemSaveEvent = FormEditFormData
export type AppFormEditItemSetEvent = Partial<FormEditFormData>
export type AppFormEditItemSuggestionsEvent = FormSuggestions
export type AppFormFieldChangeEvent = AppFormDataValue
export type AppFormReadyEvent = AppFormData
export type AppFormSettingsErrorEvent = string
export type AppFormSettingsReadyEvent = undefined
export type AppFormSettingsSaveEvent = AppCredentials
export type AppFormSettingsSetEvent = AppCredentials
export type AppImgLoadingErrorEvent = undefined
export type AppModalAddItemCloseEvent = undefined
export type AppModalAddItemOpenEvent = HTMLElement
export type AppModalCloseEvent = undefined
export type AppModalEditItemCloseEvent = undefined
export type AppModalEditItemOpenEvent = undefined
export type AppModalOpenEvent = undefined
export type AppModalPrepareBarcodesOpenEvent = undefined
export type AppModalReadyEvent = undefined
export type AppModalScanCodeCloseEvent = undefined
export type AppModalScanCodeOpenEvent = undefined
export type AppModalSearchResultsCloseEvent = undefined
export type AppModalSearchResultsOpenEvent = undefined
export type AppModalSettingsCloseEvent = undefined
export type AppModalSettingsOpenEvent = undefined
export type AppScanCodeStartEvent = undefined
export type AppSearchItemEvent = AppFormData
export type AppSettingsTriggerAnimateEvent = boolean
export type AppSpeechStartEvent = undefined
export type AppStatusEvent = AppStatus
export type EditItemEvent = Item
export type FormEditFormData = AppFormData & Partial<Omit<Item, ItemField.Photo> & { photo: string }>
export type FormIdErrorEvent = string
export type FormIdSetEvent = AppFormData
export type FormIdSuggestionsEvent = FormSuggestions
export type FormOnSaveEvent = AppFormData
export type FormSuggestions = Record<string, string[]>
export type RecognitionErrorEvent = { error: string }
export type SearchOrigin = 'default' | 'scan' | 'search-results' | 'speech' | 'type' | 'url'
export type SearchResultsEvent = { input: string; isReference: boolean; results: Item[]; title: string; willScrollTop: boolean }
export type SearchRetryEvent = undefined
export type SearchStartEvent = { origin: SearchOrigin; str: string; willScrollTop?: boolean }
export type SelectResultEvent = string // the id of the selected item
