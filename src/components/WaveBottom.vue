<script setup lang="ts">
defineProps<{ variant?: 'light' | 'dark' }>()
</script>

<template>
  <svg class="wave" viewBox="0 0 430 130" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <linearGradient id="wv-a" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#4f9bff" />
        <stop offset="1" stop-color="#8f6bff" />
      </linearGradient>
    </defs>
    <template v-if="variant === 'dark'">
      <path d="M0 60C80 20 150 90 240 60s140-50 190-20v90H0z" fill="#2c4bd8" opacity=".55" />
      <path d="M0 85C90 50 170 110 260 84s120-30 170-6v52H0z" fill="url(#wv-a)" opacity=".8" />
      <path d="M0 108c80-26 150 14 240-4s130-20 190-4v30H0z" fill="#9fb4ff" opacity=".7" />
    </template>
    <template v-else>
      <path d="M0 40C80 0 160 70 250 40s130-40 180-10v100H0z" fill="#cfe0ff" />
      <path d="M0 70C90 30 170 100 260 70s120-30 170-8v68H0z" fill="#8fb3ff" />
      <path d="M0 98c80-28 150 10 240-6s130-20 190-6v44H0z" fill="url(#wv-a)" />
    </template>
  </svg>
</template>
