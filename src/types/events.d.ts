type SearchOrigin = 'default' | 'type' | 'scan' | 'search-results' | 'speech' | 'url'

interface SearchResultEvent {
  byReference: boolean
  input: string
  results: SearchResult[]
  scrollTop: boolean
  title: string
}

interface SearchStartEvent {
  origin: SearchOrigin
  scrollTop: boolean
  str: string
}

interface RecognitionResultEvent {
  results: RecognitionResult[]
}
