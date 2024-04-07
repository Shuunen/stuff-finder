import Autocomplete, { type AutocompleteRenderInputParams } from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import { useCallback } from 'preact/hooks'
import type { Form, FormFieldText } from '../utils/forms.utils'

type Properties = Readonly<{
  field: FormFieldText
  form: Form
  id: string
  suggestions?: Record<string, string[]>
  updateField: (field: string, target: EventTarget | null, updateField?: boolean) => void
}>

export function AppFormFieldText ({ field, form, id, suggestions, updateField }: Properties) {

  const onChange = useCallback((event: Event) => { updateField(id, event.target) }, [id, updateField])

  // eslint-disable-next-line arrow-body-style
  const renderInput = useCallback((parameters: AutocompleteRenderInputParams) => {
    // @ts-expect-error typing issue
    return <TextField // eslint-disable-next-line react/jsx-props-no-spreading
      {...parameters}
      error={Boolean(form.isTouched) && !field.isValid}
      label={field.label}
      onChange={onChange}
      required={field.isRequired}
      value={field.value}
      variant="standard"
    />
  }, [form.isTouched, field.isValid, field.isRequired, field.label, onChange, field.value])

  const emptySuggestions: string[] = []

  const options = suggestions?.[id] ?? emptySuggestions

  return <Autocomplete
    freeSolo
    id={id}
    onChange={onChange}
    options={options}
    renderInput={renderInput}
    value={field.value}
  />
}
