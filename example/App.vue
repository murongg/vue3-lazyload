<template>
  <main class="page-shell">
    <section class="hero-card">
      <div class="hero-copy">
        <p class="eyebrow">Vue 3 only</p>
        <h1>vue3-lazyload</h1>
        <p class="hero-text">
          An interactive playground for directive-based image loading, hook-driven source updates, and component-level lazy mounting.
        </p>
      </div>

      <div class="install-box">
        <span class="install-label">Install</span>
        <code>pnpm add vue3-lazyload</code>
      </div>

      <div class="feature-list">
        <span class="feature-pill">Directive API</span>
        <span class="feature-pill">Hook API</span>
        <span class="feature-pill">Delay tuning</span>
        <span class="feature-pill">Observer buffer presets</span>
        <span class="feature-pill">LazyComponent modes</span>
        <span class="feature-pill">Event console</span>
      </div>
    </section>

    <section class="overview-grid">
      <article class="overview-card">
        <p class="eyebrow">What this page proves</p>
        <h2>Real lazy-loading behavior, not a static gallery</h2>
        <p>
          The labs below intentionally show loading, loaded, and error states, runtime source switching, mode changes, and recent event flow.
        </p>
      </article>

      <article class="overview-card">
        <p class="eyebrow">Three usage paths</p>
        <h2>Directive for templates. Hook for image refs. LazyComponent for whole subtrees.</h2>
        <pre><code>app.use(VueLazyLoad, options)
&lt;img v-lazy="{ src, loading, error, delay }" /&gt;
const lazyRef = useLazyload(src, options)
&lt;LazyComponent&gt;...&lt;/LazyComponent&gt;</code></pre>
      </article>
    </section>

    <ControlCenter
      :delay="controls.delay"
      :mode="controls.mode"
      :root-margin="controls.rootMargin"
      @update:delay="updateDelay"
      @update:mode="updateMode"
      @update:root-margin="updateRootMargin"
    />

    <section class="demo-stack">
      <DirectiveDemo
        :delay="controls.delay"
        :root-margin="controls.rootMargin"
        @event="pushEvent"
        @state-change="handleDirectiveStateChange"
      />
      <HookDemo
        :key="hookDemoKey"
        :delay="controls.delay"
        :root-margin="controls.rootMargin"
        @event="pushEvent"
        @state-change="handleHookStateChange"
      />
      <LazyComponentDemo
        :delay="controls.delay"
        :mode="controls.mode"
        :root-margin="controls.rootMargin"
        @event="pushEvent"
        @state-change="handleLazyComponentStateChange"
      />
    </section>

    <EventConsole :entries="eventEntries" />

    <section class="state-panel">
      <header class="section-header">
        <div>
          <p class="eyebrow">State Panel</p>
          <h2>Live lifecycle states across the demo page</h2>
          <p class="section-copy">
            This panel reflects the same loading phases that the package writes to the `lazy` attribute.
          </p>
        </div>
      </header>

      <div class="state-grid">
        <article v-for="row in stateRows" :key="row.label" class="state-row">
          <div>
            <h3>{{ row.label }}</h3>
            <p>{{ row.description }}</p>
          </div>
          <StateBadge :state="row.state" />
        </article>
      </div>
    </section>

    <section class="edge-grid">
      <article class="mini-card">
        <p class="eyebrow">Edge Case</p>
        <h3>Delay tuning</h3>
        <p>Control center presets let you verify how slower or faster visibility delays change each lab.</p>
      </article>
      <article class="mini-card">
        <p class="eyebrow">Edge Case</p>
        <h3>Observer buffer</h3>
        <p>Root margin presets make it easier to understand when an image or component starts preparing before it fully enters view.</p>
      </article>
      <article class="mini-card">
        <p class="eyebrow">Edge Case</p>
        <h3>Source switching</h3>
        <p>The hook lab changes sources at runtime to prove updates still flow through the lazy pipeline.</p>
      </article>
      <article class="mini-card">
        <p class="eyebrow">Edge Case</p>
        <h3>Visibility modes</h3>
        <p>`LazyComponent` can keep loaded content mounted once, or mount and unload as the viewport changes.</p>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'
import type Lazy from '../src/lazy'
import type { DemoState, DirectiveDemoStates, PlaygroundControls } from './demo'
import ControlCenter from './components/control-center.vue'
import DirectiveDemo from './components/directive.vue'
import EventConsole from './components/event-console.vue'
import HookDemo from './components/hook.vue'
import LazyComponentDemo from './components/lazy-component-demo.vue'
import StateBadge from './components/state-badge.vue'

const directiveStates = ref<DirectiveDemoStates>({
  fallback: 'idle',
  primary: 'idle',
})

const hookState = ref<DemoState>('idle')
const lazyComponentState = ref<DemoState>('loading')
const lazy = inject<Lazy | null>('Lazyload', null)
const eventEntries = ref<string[]>([
  'playground ready',
  'control.delay 180ms',
  'control.mode once',
])
const controls = ref<PlaygroundControls>({
  delay: 180,
  mode: 'once',
  rootMargin: '120px',
})

const hookDemoKey = computed(() => `${controls.value.delay}-${controls.value.rootMargin}`)

const stateRows = computed(() => [
  {
    description: 'Object payload with loading placeholder and source switching.',
    label: 'Directive primary',
    state: directiveStates.value.primary,
  },
  {
    description: 'Broken source path that resolves into a visible fallback image.',
    label: 'Directive fallback',
    state: directiveStates.value.fallback,
  },
  {
    description: 'Reactive source changes driven through useLazyload.',
    label: 'Hook demo',
    state: hookState.value,
  },
  {
    description: 'Slot subtree mounts only after its wrapper intersects.',
    label: 'LazyComponent',
    state: lazyComponentState.value,
  },
])

watch(() => controls.value.rootMargin, (rootMargin) => {
  lazy?.config({
    observerOptions: {
      rootMargin,
      threshold: 0,
    },
  })
}, { immediate: true })

function pushEvent(entry: string): void {
  eventEntries.value = [entry, ...eventEntries.value].slice(0, 10)
}

function updateDelay(delay: number): void {
  controls.value = {
    ...controls.value,
    delay,
  }
  pushEvent(`control.delay ${delay}ms`)
}

function updateMode(mode: PlaygroundControls['mode']): void {
  controls.value = {
    ...controls.value,
    mode,
  }
  pushEvent(`control.mode ${mode}`)
}

function updateRootMargin(rootMargin: string): void {
  controls.value = {
    ...controls.value,
    rootMargin,
  }
  pushEvent(`control.rootMargin ${rootMargin}`)
}

function handleDirectiveStateChange(nextStates: DirectiveDemoStates): void {
  directiveStates.value = nextStates
}

function handleHookStateChange(nextState: DemoState): void {
  hookState.value = nextState
}

function handleLazyComponentStateChange(nextState: DemoState): void {
  lazyComponentState.value = nextState
}
</script>

<style>
:root {
  color: #0f172a;
  font-family: 'Avenir Next', 'Segoe UI', sans-serif;
}

body {
  background:
    radial-gradient(circle at top, rgba(20, 184, 166, 0.12), transparent 38%),
    linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
  margin: 0;
}

* {
  box-sizing: border-box;
}

code,
pre {
  font-family: 'SFMono-Regular', 'SF Mono', 'Menlo', monospace;
}

.page-shell {
  display: grid;
  gap: 1.5rem;
  margin: 0 auto;
  max-width: 1180px;
  padding: 3rem 1.25rem 5rem;
}

.hero-card,
.overview-card,
.control-card,
.demo-card,
.console-card,
.state-panel,
.mini-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 1.75rem;
  box-shadow: 0 18px 60px rgba(15, 23, 42, 0.08);
}

.hero-card,
.demo-card,
.control-card,
.console-card,
.state-panel {
  padding: 1.75rem;
}

.hero-card {
  overflow: hidden;
  position: relative;
}

.hero-card::after {
  background: linear-gradient(120deg, rgba(15, 118, 110, 0.16), rgba(37, 99, 235, 0.08));
  content: '';
  inset: 0;
  pointer-events: none;
  position: absolute;
}

.hero-copy,
.install-box,
.feature-list {
  position: relative;
  z-index: 1;
}

.hero-copy h1,
.overview-card h2,
.state-row h3 {
  margin: 0;
}

.hero-text,
.section-copy,
.overview-card p,
.state-row p,
.mini-card p {
  color: #526072;
  line-height: 1.6;
}

.eyebrow {
  color: #0f766e;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  margin: 0 0 0.55rem;
  text-transform: uppercase;
}

.install-box {
  align-items: center;
  background: #0f172a;
  border-radius: 1.25rem;
  color: #e2e8f0;
  display: inline-flex;
  gap: 0.8rem;
  margin-top: 1rem;
  padding: 0.9rem 1rem;
}

.install-label {
  color: #94a3b8;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.feature-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

.feature-pill {
  background: rgba(15, 23, 42, 0.07);
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.6rem 0.9rem;
}

.overview-grid,
.edge-grid,
.state-grid {
  display: grid;
  gap: 1rem;
}

.overview-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.overview-card,
.mini-card {
  padding: 1.35rem;
}

.overview-card pre {
  background: #0f172a;
  border-radius: 1rem;
  color: #e2e8f0;
  margin: 1rem 0 0;
  overflow: auto;
  padding: 1rem;
}

.demo-stack {
  display: grid;
  gap: 1.5rem;
}

.section-header {
  align-items: start;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.section-header h2 {
  margin: 0;
}

.state-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.state-row {
  align-items: center;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 1.25rem;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  padding: 1rem 1.1rem;
}

.edge-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (max-width: 900px) {
  .overview-grid,
  .state-grid,
  .edge-grid {
    grid-template-columns: 1fr;
  }

  .hero-card,
  .demo-card,
  .state-panel,
  .overview-card,
  .mini-card {
    padding: 1.25rem;
  }

  .section-header,
  .state-row {
    align-items: start;
    flex-direction: column;
  }
}
</style>
