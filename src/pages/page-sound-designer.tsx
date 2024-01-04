/* eslint-disable react/no-multi-comp */

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteIcon from '@mui/icons-material/Delete'
import PlayCircleFilledWhiteOutlinedIcon from '@mui/icons-material/PlayCircleFilledWhiteOutlined'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Slider from '@mui/material/Slider'
import { useSignalEffect } from '@preact/signals'
import { useEffect, useState } from 'preact/hooks'
import { copyToClipboard, debounce } from 'shuutils'
import { AppPageCard } from '../components/app-page-card'
import { delays } from '../constants'
import { logger } from '../utils/logger.utils'
import { playSequence, sequences, type Sequence, type SequenceItem, type SequenceItemTone, type SequenceItemWait } from '../utils/sound.utils'
import { state } from '../utils/state.utils'

const ranges = {
  toneDelay: { max: 3000, min: 25 },
  toneValue: { max: 3000, min: 50 },
  waitDelay: { max: 1000, min: 25 },
}

function copySequence (sequence: Sequence) {
  logger.debug('copySequence', { sequence })
  void copyToClipboard(JSON.stringify(sequence))
  state.message = { content: 'Sequence copied to clipboard', delay: delays.second, type: 'success' }
}

const playSequenceDebounced = debounce(playSequence, delays.medium)

function AppSequenceItemTone ({ index, item, onChange }: { readonly index: number; readonly item: SequenceItemTone; readonly onChange: (event: Event, value: number[] | number, index: number, type: 'tone-delay' | 'tone-value' | 'wait-delay') => void }) {
  return <>
    <div className="w-2/3">
      <Slider max={ranges.toneValue.max} min={ranges.toneValue.min} onChange={(event, value) => onChange(event, value, index, 'tone-value')} step={ranges.toneValue.min} value={item[0]} />
    </div>
    <div className="w-1/3">
      <Slider max={ranges.toneDelay.max} min={ranges.toneDelay.min} onChange={(event, value) => onChange(event, value, index, 'tone-delay')} step={ranges.toneDelay.min} value={item[1]} />
    </div>
  </>
}

function AppSequenceItemWait ({ index, item, onChange }: { readonly index: number; readonly item: SequenceItemWait; readonly onChange: (event: Event, value: number[] | number, index: number, type: 'tone-delay' | 'tone-value' | 'wait-delay') => void }) {
  return <>
    <div className="w-2/3" />
    <div className="w-1/3">
      <Slider max={ranges.waitDelay.max} min={ranges.waitDelay.min} onChange={(event, value) => onChange(event, value, index, 'wait-delay')} step={ranges.waitDelay.min} value={item} />
    </div>
  </>
}

function AppSequenceItem ({ index, item, onChange, onDelete }: { readonly index: number; readonly item: SequenceItem; readonly onChange: (event: Event, value: number[] | number, index: number, type: 'tone-delay' | 'tone-value' | 'wait-delay') => void; readonly onDelete: (index: number) => void }) {
  const label = typeof item === 'number' ? `${index} : Wait for ${item}ms` : `${index} : Tone ${item[0]}Hz for ${item[1]}ms`
  return (
    <div className="flex w-full">
      <p className="w-1/3">{label}</p>
      {typeof item === 'number' && <AppSequenceItemWait index={index} item={item} onChange={onChange} />}
      {typeof item !== 'number' && <AppSequenceItemTone index={index} item={item} onChange={onChange} />}
      {/* @ts-expect-error typings issue */}
      <IconButton aria-label="delete" onClick={() => onDelete(index)}><DeleteIcon /></IconButton>
    </div>
  )
}

export function PageSoundDesigner ({ ...properties }: { readonly [key: string]: unknown }) {

  const [sequence, setSequence] = useState<Sequence>(sequences.success)

  // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/naming-convention, @typescript-eslint/max-params, sonarjs/cognitive-complexity
  function onChange (_event: Event, value: number[] | number, index: number, type: 'tone-delay' | 'tone-value' | 'wait-delay') {
    if (typeof value !== 'number') throw new Error('Weird case where value is not a number')
    if (type === 'wait-delay') setSequence(sequence.map((item, itemIndex) => (itemIndex === index ? value : item))) /* @ts-expect-error typings issue */
    else if (type === 'tone-delay') setSequence(sequence.map((item, itemIndex) => (itemIndex === index ? [item[0], value] : item))) /* @ts-expect-error typings issue */
    else setSequence(sequence.map((item, itemIndex) => (itemIndex === index ? [value, item[1]] : item)))
  }

  function onDelete (index: number) {
    logger.debug('onDelete', { index })
    // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/naming-convention
    setSequence(sequence.filter((_item, itemIndex) => itemIndex !== index))
  }

  useEffect(() => { void playSequenceDebounced(sequence) }, [sequence])
  useSignalEffect(() => { logger.debug('PageSoundDesigner mount', { properties: Object.keys(properties) }) })

  return (
    <AppPageCard cardTitle="Sound" icon={AddCircleOutlineIcon} pageCode="sound-designer" pageTitle="Sound designer">
      <div className="flex w-[50rem] flex-col">
        <h1>Sound designer</h1>
        <p>Play with the sliders to create a sound sequence 🎹</p>
        <form className="flex w-full flex-col items-start whitespace-nowrap">
          {/* eslint-disable-next-line react/no-array-index-key */}
          {sequence.map((item, index) => <AppSequenceItem index={index} item={item} key={`${typeof item === 'number' ? 'wait' : 'tone'}-${index}`} onChange={onChange} onDelete={onDelete} />)}
        </form>
        <div className="my-2 flex">
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
