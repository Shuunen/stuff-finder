import type { NavigateFunction } from 'react-router-dom'
import { navigate, setNavigate } from './navigation.utils'

describe('navigation.utils', () => {
  let navigateSpy = vi.fn<(path: string, options?: unknown) => void>()
  let mockNavigate = (to: unknown, options?: unknown) => {
    if (typeof to !== 'string') return
    navigateSpy(to, options)
  }

  beforeEach(() => {
    navigateSpy = vi.fn<(path: string, options?: unknown) => void>()
    mockNavigate = (to: unknown, options?: unknown) => {
      if (typeof to !== 'string') return
      navigateSpy(to, options)
    }
    setNavigate(undefined as unknown as NavigateFunction)
  })

  it('setNavigate A should store the navigate function', () => {
    setNavigate(mockNavigate)
    navigate('/test')
    expect(navigateSpy).toHaveBeenCalledWith('/test', { replace: false })
  })

  it('navigate A should call navigate with path and default replace false when navigate is set', () => {
    setNavigate(mockNavigate)
    navigate('/dashboard')
    expect(navigateSpy).toHaveBeenCalledWith('/dashboard', { replace: false })
  })

  it('navigate B should call navigate with path and replace true when specified', () => {
    setNavigate(mockNavigate)
    navigate('/login', true)
    expect(navigateSpy).toHaveBeenCalledWith('/login', { replace: true })
  })

  it('navigate C should not call navigate when navigate is not set', () => {
    navigate('/test')
    expect(navigateSpy).not.toHaveBeenCalled()
  })

  it('navigate D should handle multiple calls with different parameters', () => {
    setNavigate(mockNavigate)
    navigate('/first')
    navigate('/second', true)
    navigate('/third', false)
    expect(navigateSpy).toHaveBeenCalledTimes(3)
    expect(navigateSpy).toHaveBeenNthCalledWith(1, '/first', { replace: false })
    expect(navigateSpy).toHaveBeenNthCalledWith(2, '/second', { replace: true })
    expect(navigateSpy).toHaveBeenNthCalledWith(3, '/third', { replace: false })
  })

  it('navigate E should pass state to the navigate function', () => {
    setNavigate(mockNavigate)
    const routeState = { header: 'test', results: [] }
    navigate('/search/foo', false, routeState)
    expect(navigateSpy).toHaveBeenCalledWith('/search/foo', { replace: false, state: routeState })
  })
})
