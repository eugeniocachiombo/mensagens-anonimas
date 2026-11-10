<script setup lang="ts">
import { computed } from 'vue'
import { makeQr } from '@/utils/qr'

const props = defineProps<{ value: string }>()

const model = computed(() => {
  if (!props.value) return null
  try {
    const m = makeQr(props.value)
    let d = ''
    m.forEach((row, y) => row.forEach((on, x) => {
      if (on) d += `M${x} ${y}h1v1h-1z`
    }))
    return { size: m.length, d }
  } catch {
    return null
  }
})
</script>

<template>
  <svg v-if="model" :viewBox="`0 0 ${model.size} ${model.size}`" role="img" aria-label="QR Code do seu link" shape-rendering="crispEdges">
    <path :d="model.d" fill="#0b1236" />
  </svg>
  <div v-else class="qr-skeleton" aria-hidden="true" />
</template>
