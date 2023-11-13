import 'preact'

declare module '@camwiegert/typical'
type TypicalArguments = (number | string)[]

declare module 'preact' {
  namespace JSX {
    interface IntrinsicElements {
      'app-prompter': unknown
      'app-toaster': unknown
      'app-loader': unknown
      'app-scan-code': unknown
      'app-search-button': unknown
      'app-search-results': unknown
      'app-edit-item': unknown
      'app-print-barcodes': unknown
      'app-print-one': unknown
      'app-settings-trigger': unknown
      'app-add-item-trigger': unknown
      'app-modal': unknown
      'app-form': unknown
    }
  }
}
