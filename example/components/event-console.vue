<template>
  <section class="console-card">
    <header class="console-header">
      <div>
        <p class="eyebrow">Event Console</p>
        <h2>Recent behavior across the playground</h2>
      </div>
      <span class="console-count">{{ entries.length }} entries</span>
    </header>

    <ol v-if="entries.length" class="console-list">
      <li v-for="entry in entries" :key="entry" class="console-item">
        {{ entry }}
      </li>
    </ol>
    <p v-else class="console-empty">
      Interact with the demos to populate the event stream.
    </p>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  entries: string[]
}>()
</script>

<style scoped>
.console-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 1.75rem;
  box-shadow: 0 18px 60px rgba(15, 23, 42, 0.08);
  padding: 1.5rem;
}

.console-header {
  align-items: center;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.eyebrow {
  color: #0f766e;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  margin: 0 0 0.55rem;
  text-transform: uppercase;
}

.console-header h2,
.console-empty,
.console-count {
  margin: 0;
}

.console-count {
  background: rgba(15, 118, 110, 0.12);
  border-radius: 999px;
  color: #0f766e;
  font-size: 0.78rem;
  font-weight: 800;
  padding: 0.45rem 0.7rem;
  text-transform: uppercase;
}

.console-list {
  display: grid;
  gap: 0.7rem;
  list-style: none;
  margin: 1rem 0 0;
  padding: 0;
}

.console-item {
  background: #0f172a;
  border-radius: 1rem;
  color: #e2e8f0;
  font-family: 'SFMono-Regular', 'SF Mono', 'Menlo', monospace;
  font-size: 0.88rem;
  padding: 0.85rem 0.95rem;
}

.console-empty {
  color: #526072;
  line-height: 1.6;
  margin-top: 1rem;
}
</style>
