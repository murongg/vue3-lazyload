<template>
  <section class="demo-card">
    <header class="section-header">
      <div>
        <p class="eyebrow">Directive Demo</p>
        <h2>Object payloads, error fallback, delayed lists, and source updates</h2>
        <p class="section-copy">
          `v-lazy` supports simple values, object payloads, lifecycle hooks, and state-driven styling in one place.
        </p>
      </div>
      <StateBadge :state="primaryState" label="Primary" />
    </header>

    <div class="directive-grid">
      <article class="preview-card">
        <div class="preview-header">
          <div>
            <h3>Primary image</h3>
            <p>Delay + loading placeholder + source switching</p>
          </div>
          <StateBadge :state="primaryState" />
        </div>

        <img
          v-lazy="{
            src: primarySource,
            loading: loadingAsset,
            delay: 180,
            lifecycle: primaryLifecycle,
          }"
          alt="Primary directive demo"
          class="demo-image"
        >

        <div class="preview-actions">
          <button class="demo-button" type="button" @click="switchPrimarySource">
            Switch directive source
          </button>
          <p class="status-copy">{{ primaryLabel }}</p>
        </div>
      </article>

      <article class="preview-card">
        <div class="preview-header">
          <div>
            <h3>Error fallback</h3>
            <p>Broken src recovers into a visible fallback image</p>
          </div>
          <StateBadge :state="fallbackState" label="Fallback" />
        </div>

        <img
          v-lazy="{
            src: fallbackBrokenSource,
            error: fallbackImage,
            loading: loadingAsset,
            lifecycle: fallbackLifecycle,
          }"
          alt="Broken directive demo with fallback"
          class="demo-image"
        >

        <div class="preview-actions">
          <button class="demo-button" type="button" @click="retryFallback">
            Retry broken source
          </button>
          <p class="status-copy">Fallback image stays visible when the requested image fails.</p>
        </div>
      </article>
    </div>

    <div class="snippet-card">
      <p class="eyebrow">Usage Snapshot</p>
      <pre><code>&lt;img
  v-lazy="{ src, loading, error, delay, lifecycle }"
/&gt;</code></pre>
    </div>

    <section class="mini-section">
      <div class="mini-section-header">
        <h3>Delayed list rendering</h3>
        <p>These items only load after remaining visible long enough to pass the configured delay.</p>
      </div>

      <div class="gallery-grid">
        <article v-for="item in delayedImages" :key="item.id" class="gallery-card">
          <img
            v-lazy="{
              src: item.src,
              loading: loadingAsset,
              delay: 320,
            }"
            :alt="item.title"
            class="gallery-image"
          >
          <div class="gallery-copy">
            <strong>{{ item.title }}</strong>
            <span>{{ item.note }}</span>
          </div>
        </article>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import loadingAsset from '../assets/logo.png'
import type { DemoState, DirectiveDemoStates } from '../demo'
import StateBadge from './state-badge.vue'

const emit = defineEmits<{
  'state-change': [DirectiveDemoStates]
}>()

const primarySources = [
  'https://picsum.photos/id/28/720/420',
  'https://picsum.photos/id/42/720/420',
]

const primaryIndex = ref(0)
const fallbackAttempt = ref(0)
const primaryState = ref<DemoState>('idle')
const fallbackState = ref<DemoState>('idle')

const primarySource = computed(() => primarySources[primaryIndex.value])
const primaryLabel = computed(() => primaryIndex.value === 0 ? 'Default source active' : 'Alternate source active')
const fallbackBrokenSource = computed(() => `https://example.invalid/vue3-lazyload-demo-${fallbackAttempt.value}.jpg`)
const fallbackImage = 'https://picsum.photos/id/48/720/420'

const delayedImages = [
  {
    id: 'delay-1',
    note: 'Demonstrates delayed loading inside a list.',
    src: 'https://picsum.photos/id/1015/320/220',
    title: 'Delayed card 01',
  },
  {
    id: 'delay-2',
    note: 'Uses the same directive API with object payloads.',
    src: 'https://picsum.photos/id/1025/320/220',
    title: 'Delayed card 02',
  },
  {
    id: 'delay-3',
    note: 'Keeps the demo readable while showing list support.',
    src: 'https://picsum.photos/id/1035/320/220',
    title: 'Delayed card 03',
  },
]

const primaryLifecycle = {
  error: () => { primaryState.value = 'error' },
  loaded: () => { primaryState.value = 'loaded' },
  loading: () => { primaryState.value = 'loading' },
}

const fallbackLifecycle = {
  error: () => { fallbackState.value = 'error' },
  loaded: () => { fallbackState.value = 'loaded' },
  loading: () => { fallbackState.value = 'loading' },
}

function switchPrimarySource(): void {
  primaryState.value = 'idle'
  primaryIndex.value = primaryIndex.value === 0 ? 1 : 0
}

function retryFallback(): void {
  fallbackState.value = 'idle'
  fallbackAttempt.value += 1
}

watch([primaryState, fallbackState], () => {
  emit('state-change', {
    fallback: fallbackState.value,
    primary: primaryState.value,
  })
}, { immediate: true })
</script>

<style scoped>
.directive-grid {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.preview-card,
.snippet-card,
.gallery-card {
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 1.25rem;
}

.preview-card,
.snippet-card {
  padding: 1.25rem;
}

.preview-header,
.preview-actions,
.gallery-copy,
.mini-section-header {
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
}

.preview-header,
.preview-actions {
  align-items: center;
}

.preview-header h3,
.mini-section-header h3 {
  margin: 0;
}

.preview-header p,
.preview-actions p,
.mini-section-header p,
.gallery-copy span {
  color: #526072;
  margin: 0;
}

.demo-image,
.gallery-image {
  aspect-ratio: 16 / 10;
  border-radius: 1rem;
  display: block;
  margin: 1rem 0;
  object-fit: cover;
  width: 100%;
}

.demo-image[lazy='loading'],
.gallery-image[lazy='loading'] {
  background: linear-gradient(135deg, #f6d365, #fda085);
}

.demo-image[lazy='loaded'],
.gallery-image[lazy='loaded'] {
  box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.16);
}

.demo-image[lazy='error'] {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.16);
}

.demo-button {
  background: #0f766e;
  border: 0;
  border-radius: 999px;
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  padding: 0.7rem 1rem;
}

.status-copy {
  flex: 1;
  text-align: right;
}

.snippet-card pre {
  background: #0f172a;
  border-radius: 1rem;
  color: #e2e8f0;
  margin: 0;
  overflow: auto;
  padding: 1rem;
}

.mini-section {
  margin-top: 1.5rem;
}

.mini-section-header {
  align-items: end;
  margin-bottom: 0.9rem;
}

.gallery-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.gallery-card {
  overflow: hidden;
}

.gallery-copy {
  align-items: start;
  flex-direction: column;
  padding: 0 1rem 1rem;
}

@media (max-width: 900px) {
  .directive-grid,
  .gallery-grid {
    grid-template-columns: 1fr;
  }

  .preview-header,
  .preview-actions,
  .mini-section-header {
    align-items: start;
    flex-direction: column;
  }

  .status-copy {
    text-align: left;
  }
}
</style>
