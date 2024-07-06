/* eslint-disable @typescript-eslint/naming-convention */
import 'preact'

declare module '@camwiegert/typical'

declare module 'preact' {
  // biome-ignore lint/style/noNamespace: <explanation>
  // biome-ignore lint/style/useNamingConvention: <explanation>
  namespace JSX {
    interface IntrinsicElements {
      'app-form': unknown
      'app-modal': unknown
    }
  }
}
