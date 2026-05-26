import 'preact'

declare module '@camwiegert/typical'

declare module 'preact' {
  namespace JSX {
    interface IntrinsicElements {
      'app-form': unknown
      'app-modal': unknown
    }
  }
}
