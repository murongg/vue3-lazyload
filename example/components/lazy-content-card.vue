<template>
  <article class="loaded-card">
    <div class="loaded-header">
      <p class="eyebrow">Mounted On Demand</p>
      <span class="loaded-pill">ready</span>
    </div>

    <h3>Deferred component subtree</h3>
    <p class="loaded-copy">
      This card is mounted only after the wrapper intersects. Until then, the placeholder slot stays in the DOM.
    </p>

    <div class="metric-grid">
      <div class="metric-item">
        <strong>Slot lazy loading</strong>
        <span>Mount expensive subtrees later.</span>
      </div>
      <div class="metric-item">
        <strong>Placeholder support</strong>
        <span>Keep layout stable before reveal.</span>
      </div>
      <div class="metric-item">
        <strong>Delay support</strong>
        <span>Match the same delay behavior as `v-lazy`.</span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const emit = defineEmits<{
  ready: []
}>()

onMounted(() => {
  emit('ready')
})
</script>

<style scoped>
.loaded-card {
  background:
    radial-gradient(circle at top right, rgba(20, 184, 166, 0.18), transparent 35%),
    linear-gradient(160deg, rgba(255, 255, 255, 0.98), rgba(240, 249, 255, 0.98));
  border: 1px solid rgba(15, 118, 110, 0.18);
  border-radius: 1.25rem;
  padding: 1.25rem;
}

.loaded-header,
.metric-grid {
  display: grid;
  gap: 0.9rem;
}

.loaded-header {
  align-items: center;
  grid-template-columns: 1fr auto;
}

.loaded-header h3,
.loaded-copy,
.metric-item span {
  margin: 0;
}

.eyebrow {
  color: #0f766e;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  margin: 0;
  text-transform: uppercase;
}

.loaded-pill {
  background: rgba(15, 118, 110, 0.12);
  border-radius: 999px;
  color: #0f766e;
  font-size: 0.78rem;
  font-weight: 800;
  padding: 0.45rem 0.75rem;
  text-transform: uppercase;
}

.loaded-card h3 {
  margin: 1rem 0 0.6rem;
}

.loaded-copy {
  color: #526072;
  line-height: 1.6;
}

.metric-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 1rem;
}

.metric-item {
  background: rgba(255, 255, 255, 0.84);
  border-radius: 1rem;
  padding: 0.95rem;
}

.metric-item strong,
.metric-item span {
  display: block;
}

.metric-item span {
  color: #526072;
  line-height: 1.5;
  margin-top: 0.35rem;
}

@media (max-width: 900px) {
  .metric-grid {
    grid-template-columns: 1fr;
  }
}
</style>
