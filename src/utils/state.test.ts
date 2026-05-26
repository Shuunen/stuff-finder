import { state } from './state.utils'

describe('state.utils', () => {
  it('state A default', () => {
    expect(state).toMatchSnapshot()
  })
})
