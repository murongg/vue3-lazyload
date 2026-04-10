<template>
  <span class="state-badge" :data-state="state">
    {{ content }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DemoState } from '../demo'

const props = defineProps<{
  label?: string
  state: DemoState
}>()

const content = computed(() => props.label ?? props.state)
</script>

<style scoped>
.state-badge {
  align-items: center;
  border-radius: 999px;
  display: inline-flex;
  font-size: 0.75rem;
  font-weight: 700;
  justify-content: center;
  letter-spacing: 0.04em;
  min-height: 2rem;
  min-width: 5.25rem;
  padding: 0.25rem 0.75rem;
  text-transform: uppercase;
}

.state-badge[data-state='idle'] {
  background: #e8edff;
  color: #3346b0;
}

.state-badge[data-state='loading'] {
  background: #fff3d6;
  color: #8a5b00;
}

.state-badge[data-state='loaded'] {
  background: #dff8e5;
  color: #146534;
}

.state-badge[data-state='error'] {
  background: #ffe0de;
  color: #b3261e;
}
</style>
