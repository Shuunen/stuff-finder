import 'preact'

declare module '@camwiegert/typical'

declare module 'preact' {
  // biome-ignore lint/style/noNamespace: <explanation>
  // biome-ignore lint/style/useNamingConvention: <explanation>
  namespace JSX {
    interface IntrinsicElements {
      'app-modal': unknown
      'app-form': unknown
    }
  }
}
