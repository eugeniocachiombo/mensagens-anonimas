import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/services/api'
import { useProfileStore } from './profile'
import type { Message } from '@/types'

export const useInboxStore = defineStore('inbox', () => {
  const messages = ref<Message[]>([])
  const loading = ref(false)
  const loaded = ref(false)

  const unread = computed(() => messages.value.filter(m => !m.readAt))
  const read = computed(() => messages.value.filter(m => m.readAt))

  async function load() {
    const me = useProfileStore()
    if (!me.ready) return
    loading.value = true
    try {
      messages.value = await api.listMessages(me.owner)
      loaded.value = true
    } catch {
      // mantém a lista atual se a rede falhar
    } finally {
      loading.value = false
    }
  }

  async function open(id: string) {
    const me = useProfileStore()
    const msg = messages.value.find(m => m.id === id)
    if (msg && !msg.readAt) {
      msg.readAt = new Date().toISOString()
      await api.markRead(me.owner, id).catch(() => {})
    }
  }

  async function remove(id: string) {
    const me = useProfileStore()
    messages.value = messages.value.filter(m => m.id !== id)
    await api.removeMessage(me.owner, id)
  }

  async function clearRead() {
    const me = useProfileStore()
    messages.value = messages.value.filter(m => !m.readAt)
    await api.clearRead(me.owner)
  }

  function reset() {
    messages.value = []
    loaded.value = false
  }

  return { messages, loading, loaded, unread, read, load, open, remove, clearRead, reset }
})
