<template>
  <section class="control-card">
    <header class="control-header">
      <div>
        <p class="eyebrow">Control Center</p>
        <h2>One panel to tune delay, observer buffer, and component mode</h2>
        <p class="control-copy">
          These controls drive the playground below so you can verify how the same config changes directive, hook, and component behavior.
        </p>
      </div>

      <div class="summary-grid">
        <div class="summary-pill">
          <span>Delay</span>
          <strong>{{ delay }}ms</strong>
        </div>
        <div class="summary-pill">
          <span>Root margin</span>
          <strong>{{ rootMargin }}</strong>
        </div>
        <div class="summary-pill">
          <span>Mode</span>
          <strong>Mode: {{ mode }}</strong>
        </div>
      </div>
    </header>

    <div class="controls-grid">
      <article class="control-group">
        <h3>Delay</h3>
        <div class="control-options">
          <button
            v-for="option in delayOptions"
            :key="option"
            :data-active="option === delay"
            class="option-button"
            type="button"
            @click="$emit('update:delay', option)"
          >
            {{ option }}ms
          </button>
        </div>
      </article>

      <article class="control-group">
        <h3>Root Margin</h3>
        <div class="control-options">
          <button
            v-for="option in rootMarginOptions"
            :key="option"
            :data-active="option === rootMargin"
            class="option-button"
            type="button"
            @click="$emit('update:rootMargin', option)"
          >
            {{ option }}
          </button>
        </div>
      </article>

      <article class="control-group">
        <h3>LazyComponent Mode</h3>
        <div class="control-options">
          <button
            data-test="mode-once"
            :data-active="mode === 'once'"
            class="option-button"
            type="button"
            @click="$emit('update:mode', 'once')"
          >
            once
          </button>
          <button
            data-test="mode-visible"
            :data-active="mode === 'visible'"
            class="option-button"
            type="button"
            @click="$emit('update:mode', 'visible')"
          >
            visible
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { DemoMode } from '../demo'

defineProps<{
  delay: number
  mode: DemoMode
  rootMargin: string
}>()

defineEmits<{
  'update:delay': [number]
  'update:mode': [DemoMode]
  'update:rootMargin': [string]
}>()

const delayOptions = [0, 180, 320]
const rootMarginOptions = ['0px', '120px', '240px']
</script>

<style scoped>
.control-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 1.75rem;
  box-shadow: 0 18px 60px rgba(15, 23, 42, 0.08);
  padding: 1.5rem;
}

.control-header,
.summary-grid,
.controls-grid {
  display: grid;
  gap: 1rem;
}

.control-header {
  grid-template-columns: 1.3fr 0.7fr;
  margin-bottom: 1.25rem;
}

.eyebrow {
  color: #0f766e;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  margin: 0 0 0.55rem;
  text-transform: uppercase;
}

.control-header h2,
.control-group h3,
.summary-pill strong,
.summary-pill span,
.control-copy {
  margin: 0;
}

.control-copy {
  color: #526072;
  line-height: 1.6;
}

.summary-grid {
  align-content: start;
  grid-template-columns: 1fr;
}

.summary-pill {
  background: rgba(15, 23, 42, 0.04);
  border-radius: 1rem;
  padding: 0.9rem 1rem;
}

.summary-pill span {
  color: #526072;
  display: block;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
}

.controls-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.control-group {
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 1.25rem;
  padding: 1rem;
}

.control-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin-top: 0.8rem;
}

.option-button {
  background: #edf2f7;
  border: 0;
  border-radius: 999px;
  color: #0f172a;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  padding: 0.7rem 0.95rem;
}

.option-button[data-active='true'] {
  background: #0f766e;
  color: #fff;
}

@media (max-width: 900px) {
  .control-header,
  .controls-grid {
    grid-template-columns: 1fr;
  }
}
</style>
