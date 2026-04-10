<template>
  <section class="demo-card">
    <header class="section-header">
      <div>
        <p class="eyebrow">Lazy Component</p>
        <h2>Mount a whole subtree only when it reaches the viewport</h2>
        <p class="section-copy">
          `LazyComponent` keeps placeholder UI mounted first, then reveals the default slot after intersection and optional delay.
        </p>
      </div>
      <StateBadge :state="componentState" label="Component" />
    </header>

    <div class="lazy-layout">
      <article class="preview-card">
        <div class="preview-header">
          <div>
            <h3>Deferred slot rendering</h3>
            <p>Useful when you want to postpone mounting expensive cards, charts, or nested components.</p>
          </div>
          <StateBadge :state="componentState" />
        </div>

        <LazyComponent
          :delay="220"
          :observer-options="{ rootMargin: '120px 0px' }"
          class="lazy-shell"
        >
          <template #placeholder>
            <div class="placeholder-card" data-test="lazy-component-placeholder">
              <strong>Placeholder slot is mounted first</strong>
              <p>
                The default slot stays out of the tree until this wrapper enters the viewport. That keeps initial work lower.
              </p>
            </div>
          </template>

          <LazyContentCard data-test="lazy-component-content" @ready="handleReady" />
        </LazyComponent>
      </article>

      <aside class="snippet-card">
        <p class="eyebrow">Usage Snapshot</p>
        <pre><code>&lt;LazyComponent :delay="220"&gt;
  &lt;template #placeholder&gt;Loading card...&lt;/template&gt;
  &lt;ExpensiveChart /&gt;
&lt;/LazyComponent&gt;</code></pre>

        <ul class="benefit-list">
          <li>Defers the whole slot subtree instead of only swapping image sources.</li>
          <li>Supports placeholders so the layout remains stable before reveal.</li>
          <li>Uses the same observer and delay model as the image directive path.</li>
        </ul>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { DemoState } from '../demo'
import LazyContentCard from './lazy-content-card.vue'
import StateBadge from './state-badge.vue'

const emit = defineEmits<{
  'state-change': [DemoState]
}>()

const componentState = ref<DemoState>('loading')

function handleReady(): void {
  componentState.value = 'loaded'
}

watch(componentState, () => {
  emit('state-change', componentState.value)
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
}
</style>
