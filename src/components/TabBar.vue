<script setup lang="ts">
import { useInboxStore } from '@/stores/inbox'

defineProps<{ variant: 'light' | 'dark' }>()
const inbox = useInboxStore()

const tabs = [
  { to: '/', label: 'Início', icon: 'pi-home' },
  { to: '/inbox', label: 'Minhas Mensagens', icon: 'pi-envelope' },
  { to: '/settings', label: 'Configurações', icon: 'pi-cog' }
]
</script>

<template>
  <nav class="tabbar" :class="`tabbar--${variant}`" aria-label="Navegação principal">
    <RouterLink v-for="t in tabs" :key="t.to" :to="t.to" class="tab" active-class="" exact-active-class="tab--on">
      <span class="tab-icon">
        <i class="pi" :class="t.icon" aria-hidden="true" />
        <span v-if="t.to === '/inbox' && inbox.unread.length" class="badge" :aria-label="`${inbox.unread.length} novas`">{{ inbox.unread.length }}</span>
      </span>
      {{ t.label }}
    </RouterLink>
  </nav>
</template>
