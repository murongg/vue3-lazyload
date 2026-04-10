export type DemoState = 'idle' | 'loading' | 'loaded' | 'error'

export interface DirectiveDemoStates {
  fallback: DemoState
  primary: DemoState
}
