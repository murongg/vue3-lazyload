<template>
  <section class="demo-card">
    <header class="section-header">
      <div>
        <p class="eyebrow">Hook Demo</p>
        <h2>Switch image sources while keeping lifecycle state visible</h2>
        <p class="section-copy">
          `useLazyload` is useful when the image element lives in your component logic and you want stateful source changes.
        </p>
      </div>
      <StateBadge :state="hookState" label="Hook" />
    </header>

    <div class="hook-layout">
      <article class="preview-card">
        <div class="preview-header">
          <div>
            <h3>Hook-controlled element</h3>
            <p>{{ activeLabel }} • Delay {{ props.delay }}ms • Root margin {{ props.rootMargin }}</p>
          </div>
          <StateBadge :state="hookState" />
        </div>

        <img ref="lazyRef" alt="Hook lazyload demo" class="demo-image">

        <div class="hook-actions">
          <button data-test="hook-switch-source" class="demo-button" type="button" @click="switchSource">
            Switch source
          </button>
          <button class="secondary-button" type="button" @click="resetSource">
            Reset source
          </button>
        </div>
      </article>

      <aside class="snippet-card">
        <p class="eyebrow">Usage Snapshot</p>
        <pre><code>const src = ref('...')
const lazyRef = useLazyload(src, {
  delay,
  observerOptions: { rootMargin },
  lifecycle: { loading, loaded, error },
})</code></pre>

        <ul class="benefit-list">
          <li>Works well when the source is reactive.</li>
          <li>Lets the component own source switching logic.</li>
          <li>Can merge local overrides on top of plugin defaults.</li>
        </ul>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useLazyload } from '../../src'
import loadingAsset from '../assets/logo.png'
import type { DemoState } from '../demo'
import StateBadge from './state-badge.vue'

const props = defineProps<{
  delay: number
  rootMargin: string
}>()

const emit = defineEmits<{
  event: [string]
  'state-change': [DemoState]
}>()

const sources = [
  'https://picsum.photos/id/64/720/420',
  'https://picsum.photos/id/65/720/420',
]

const sourceIndex = ref(0)
const src = ref(sources[0])
const activeLabel = ref('Default source active')
const hookState = ref<DemoState>('idle')

const lazyRef = useLazyload(src, {
  delay: props.delay,
  loading: loadingAsset,
  observerOptions: {
    rootMargin: props.rootMargin,
    threshold: 0,
  },
  lifecycle: {
    error: () => {
      hookState.value = 'error'
      emit('event', 'hook error')
    },
    loaded: () => {
      hookState.value = 'loaded'
      emit('event', 'hook loaded')
    },
    loading: () => {
      hookState.value = 'loading'
      emit('event', 'hook loading')
    },
  },
})

function switchSource(): void {
  sourceIndex.value = sourceIndex.value === 0 ? 1 : 0
  src.value = sources[sourceIndex.value]
  activeLabel.value = sourceIndex.value === 0 ? 'Default source active' : 'Alternate source active'
  hookState.value = 'idle'
  emit('event', `hook source switched to ${sourceIndex.value === 0 ? 'default' : 'alternate'}`)
}

function resetSource(): void {
  sourceIndex.value = 0
  src.value = sources[0]
  activeLabel.value = 'Default source active'
  hookState.value = 'idle'
  emit('event', 'hook source reset')
}

watch(hookState, () => {
  emit('state-change', hookState.value)
}, { immediate: true })
</script>

<style scoped>
.hook-layout {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: 1.2fr 0.8fr;
}

.preview-card,
.snippet-card {
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 1.25rem;
  padding: 1.25rem;
}

.preview-header {
  align-items: center;
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
}

.preview-header h3,
.preview-header p,
.benefit-list {
  margin: 0;
}

.preview-header p {
  color: #526072;
}

.demo-image {
  aspect-ratio: 16 / 10;
  border-radius: 1rem;
  display: block;
  margin: 1rem 0;
  object-fit: cover;
  width: 100%;
}

.demo-image[lazy='loading'] {
  background: linear-gradient(135deg, #c4b5fd, #60a5fa);
}

.demo-image[lazy='loaded'] {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.16);
}

.hook-actions {
  display: flex;
  gap: 0.75rem;
}

.demo-button,
.secondary-button {
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  padding: 0.7rem 1rem;
}

.demo-button {
  background: #1d4ed8;
  color: #fff;
}

.secondary-button {
  background: #e2e8f0;
  color: #0f172a;
}

.snippet-card pre {
  background: #0f172a;
  border-radius: 1rem;
  color: #e2e8f0;
  margin: 0;
  overflow: auto;
  padding: 1rem;
}

.benefit-list {
  color: #334155;
  line-height: 1.6;
  margin-top: 1rem;
  padding-left: 1.1rem;
}

@media (max-width: 900px) {
  .hook-layout {
    grid-template-columns: 1fr;
  }

  .preview-header {
    align-items: start;
    flex-direction: column;
  }

  .hook-actions {
    flex-wrap: wrap;
  }
}
</style>
