/* eslint-disable react/no-array-index-key */
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import PlayCircleFilledWhiteOutlinedIcon from '@mui/icons-material/PlayCircleFilledWhiteOutlined'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import Button from '@mui/material/Button'
import Slider from '@mui/material/Slider'
import { useSignalEffect } from '@preact/signals'
import { useEffect, useState } from 'preact/hooks'
import { copyToClipboard, debounce } from 'shuutils'
import { AppPageCard } from '../components/app-page-card'
import { delays } from '../constants'
import { logger } from '../utils/logger.utils'
import { playSequence, sequences, type Sequence } from '../utils/sound.utils'
import { state } from '../utils/state.utils'

const ranges = {
  tone: { max: 2000, min: 50 },
  wait: { max: 1000, min: 100 },
}

function copySequence (sequence: Sequence) {
  logger.debug('copySequence', { sequence })
  void copyToClipboard(JSON.stringify(sequence))
  state.message = { content: 'Sequence copied to clipboard', delay: delays.second, type: 'success' }
}

const playSequenceDebounced = debounce(playSequence, delays.medium)

export function PageSoundDesigner ({ ...properties }: { readonly [key: string]: unknown }) {

  const [sequence, setSequence] = useState<Sequence>(sequences.success)

  // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/naming-convention, @typescript-eslint/max-params, sonarjs/cognitive-complexity
  function onChange (_event: Event, value: number[] | number, index: number, type: 'tone-delay' | 'tone-value' | 'wait') {
    if (typeof value !== 'number') throw new Error('Weird case where value is not a number')
    if (type === 'wait') setSequence(sequence.map((item, itemIndex) => (itemIndex === index ? value : item)))
    // @ts-expect-error typings issue
    else if (type === 'tone-delay') setSequence(sequence.map((item, itemIndex) => (itemIndex === index ? [item[0], value] : item)))
    // @ts-expect-error typings issue
    else setSequence(sequence.map((item, itemIndex) => (itemIndex === index ? [value, item[1]] : item)))
  }

  useEffect(() => { void playSequenceDebounced(sequence) }, [sequence])
  useSignalEffect(() => { logger.debug('PageSoundDesigner mount', { properties: Object.keys(properties) }) })

  return (
    <AppPageCard cardTitle="Sound" icon={AddCircleOutlineIcon} pageCode="sound-designer" pageTitle="Sound designer">
      <div className="flex w-[50rem] flex-col">
        <h1>Sound designer</h1>
        <p>Play with the sliders to create a sound sequence 🎹</p>
        <form className="flex w-full flex-col items-start whitespace-nowrap">
          {sequence.map((item, index) => {
            if (typeof item === 'number') return (
              <div className="grid w-full grid-cols-4 gap-6" key={`wait-${index}`}>
                <p>{index} : Wait for {item}ms</p>
                <span className="col-span-2" />
                <Slider max={ranges.wait.max} min={ranges.wait.min} onChange={(event, value) => onChange(event, value, index, 'wait')} step={ranges.wait.min} value={item} />
              </div>
            )
            return (
              <div className="grid w-full grid-cols-4 gap-6" key={`sound-${index}`}>
                <p>{index} : Tone {item[0]}Hz for {item[1]}ms</p>
                {/* eslint-disable-next-line react/forbid-component-props */}
                <Slider className="col-span-2" max={ranges.tone.max} min={ranges.tone.min} onChange={(event, value) => onChange(event, value, index, 'tone-value')} step={ranges.tone.min} value={item[0]} />
                <Slider max={ranges.wait.max} min={ranges.wait.min} onChange={(event, value) => onChange(event, value, index, 'tone-delay')} step={ranges.wait.min} value={item[1]} />
              </div>
            )
          })}
        </form>
        <div className="mt-2 flex">
          {/* @ts-expect-error typings issue */}
          <Button onClick={() => setSequence(sequences.success)} startIcon={<RestartAltIcon />} variant="outlined">Reset</Button>
          {/* @ts-expect-error typings issue */ /* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
          <Button onClick={async () => await playSequence(sequence)} startIcon={<PlayCircleFilledWhiteOutlinedIcon />} variant="contained">Play</Button>
          {/* @ts-expect-error typings issue */}
          <Button onClick={() => copySequence(sequence)} startIcon={<ContentCopyIcon />} variant="outlined">Copy</Button>
        </div>
      </div>
    </AppPageCard>
  )
}
