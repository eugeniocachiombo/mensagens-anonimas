<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import TabBar from '@/components/TabBar.vue'
import { useProfileStore } from '@/stores/profile'
import { useInboxStore } from '@/stores/inbox'

const route = useRoute()
const me = useProfileStore()
const inbox = useInboxStore()
const theme = computed(() => route.meta.theme ?? 'dark')

const refresh = () => {
  if (document.visibilityState === 'visible' && me.ready) inbox.load()
}

onMounted(() => {
  refresh()
  document.addEventListener('visibilitychange', refresh)
})
onUnmounted(() => document.removeEventListener('visibilitychange', refresh))
</script>

<template>
  <div class="app" :class="`app--${theme}`">
    <div class="screen" :class="{ 'screen--tabs': route.meta.tabs }">
      <RouterView />
    </div>
    <TabBar v-if="route.meta.tabs" :variant="route.name === 'home' ? 'light' : 'dark'" />
  </div>
  <Toast position="top-center" />
  <ConfirmDialog />
</template>
