import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import { useCallback } from 'react'
import type { FormFieldCheckbox } from '../utils/forms.utils'

type Properties = Readonly<{
  field: FormFieldCheckbox
  id: string
  updateField: (field: string, target: EventTarget | null, updateField?: boolean) => void
}>

function checkboxControl(isChecked: boolean | string) {
  return <Checkbox checked={Boolean(isChecked)} />
}

export function AppFormFieldCheckbox({ field, id, updateField }: Properties) {
  const onChange = useCallback(
    (event: React.SyntheticEvent, _checked: boolean) => {
      updateField(id, event.target)
    },
    [id, updateField],
  )

  return <FormControlLabel control={checkboxControl(field.value)} id={id} label={field.label} onChange={onChange} required={field.isRequired} />
}
