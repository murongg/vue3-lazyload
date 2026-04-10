export type DemoState = 'idle' | 'loading' | 'loaded' | 'error'
export type DemoMode = 'once' | 'visible'

export interface PlaygroundControls {
  delay: number
  mode: DemoMode
  rootMargin: string
}

export interface DirectiveDemoStates {
  fallback: DemoState
  primary: DemoState
}
