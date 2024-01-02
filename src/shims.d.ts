import 'preact'

declare module '@camwiegert/typical'
type TypicalArguments = (number | string)[]

declare module 'preact' {
  namespace JSX {
    interface IntrinsicElements {
      'app-modal': unknown
      'app-form': unknown
    }
  }
}
