<template>
  <section class="demo-card">
    <header class="section-header">
      <div>
        <p class="eyebrow">Lazy Component</p>
        <h2>Mount a whole subtree only when it reaches the viewport</h2>
        <p class="section-copy">
          `LazyComponent` can keep mounted content after the first reveal or mount and unmount with visibility. The control center switches the active mode.
        </p>
      </div>
      <StateBadge :state="componentState" label="Component" />
    </header>

    <div class="lazy-layout">
      <article class="preview-card">
        <div class="preview-header">
          <div>
            <h3>Deferred slot rendering</h3>
            <p>Mode: {{ props.mode }} • Delay {{ props.delay }}ms • Root margin {{ props.rootMargin }}</p>
          </div>
          <StateBadge :state="componentState" />
        </div>

        <LazyComponent
          :delay="props.delay"
          :mode="props.mode"
          :observer-options="{ rootMargin: props.rootMargin, threshold: 0 }"
          class="lazy-shell"
          @load="handleLoad"
          @unload="handleUnload"
          @visible-change="handleVisibleChange"
        >
          <template #placeholder>
            <div class="placeholder-card" data-test="lazy-component-placeholder">
              <strong>Placeholder slot is mounted first</strong>
              <p>
                The default slot stays out of the tree until this wrapper enters the viewport. That keeps initial work lower.
              </p>
            </div>
          </template>

          <LazyContentCard data-test="lazy-component-content" />
        </LazyComponent>

        <div class="stats-grid">
          <div class="stat-chip">
            <span>Visible</span>
            <strong>{{ visible ? 'true' : 'false' }}</strong>
          </div>
          <div class="stat-chip">
            <span>Loads</span>
            <strong>{{ loadCount }}</strong>
          </div>
          <div class="stat-chip">
            <span>Unloads</span>
            <strong>{{ unloadCount }}</strong>
          </div>
        </div>
      </article>

      <aside class="snippet-card">
        <p class="eyebrow">Usage Snapshot</p>
        <pre><code>&lt;LazyComponent
  :delay="delay"
  :mode="mode"
  @visible-change="onVisibleChange"
  @load="onLoad"
  @unload="onUnload"
&gt;
  &lt;template #placeholder&gt;Loading card...&lt;/template&gt;
  &lt;ExpensiveChart /&gt;
&lt;/LazyComponent&gt;</code></pre>

        <ul class="benefit-list">
          <li>`once` keeps content mounted after the first reveal.</li>
          <li>`visible` mounts on enter and unloads on leave.</li>
          <li>Events make it easy to log visibility and mount cycles.</li>
        </ul>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { DemoMode, DemoState } from '../demo'
import LazyContentCard from './lazy-content-card.vue'
import StateBadge from './state-badge.vue'

const props = defineProps<{
  delay: number
  mode: DemoMode
  rootMargin: string
}>()

const emit = defineEmits<{
  event: [string]
  'state-change': [DemoState]
}>()

const componentState = ref<DemoState>('loading')
const visible = ref(false)
const loadCount = ref(0)
const unloadCount = ref(0)

function handleLoad(): void {
  componentState.value = 'loaded'
  loadCount.value += 1
  emit('event', `lazy-component.${props.mode} load`)
}

function handleUnload(): void {
  componentState.value = 'loading'
  unloadCount.value += 1
  emit('event', `lazy-component.${props.mode} unload`)
}

function handleVisibleChange(nextValue: boolean): void {
  visible.value = nextValue
  emit('event', `lazy-component.${props.mode} visible-change ${nextValue}`)
}

watch(componentState, () => {
  emit('state-change', componentState.value)
}, { immediate: true })

watch(() => props.mode, (nextMode) => {
  emit('event', `lazy-component mode set to ${nextMode}`)
}, { immediate: true })
</script>

<style scoped>
.lazy-layout {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: 1.1fr 0.9fr;
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

.lazy-shell {
  display: block;
  margin-top: 1rem;
}

.stats-grid {
  display: grid;
  gap: 0.8rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 1rem;
}

.stat-chip {
  background: rgba(15, 23, 42, 0.04);
  border-radius: 1rem;
  padding: 0.85rem 0.95rem;
}

.stat-chip span,
.stat-chip strong {
  display: block;
  margin: 0;
}

.stat-chip span {
  color: #526072;
  font-size: 0.8rem;
  margin-bottom: 0.2rem;
}

.placeholder-card {
  background:
    linear-gradient(135deg, rgba(15, 23, 42, 0.04), rgba(37, 99, 235, 0.08)),
    #fff;
  border: 1px dashed rgba(59, 130, 246, 0.28);
  border-radius: 1.25rem;
  min-height: 220px;
  padding: 1.25rem;
}

.placeholder-card strong,
.placeholder-card p {
  display: block;
}

.placeholder-card p {
  color: #526072;
  line-height: 1.6;
  margin: 0.65rem 0 0;
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
  .lazy-layout {
    grid-template-columns: 1fr;
  }

  .preview-header {
    align-items: start;
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
