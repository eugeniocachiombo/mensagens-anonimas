<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConfirm } from 'primevue/useconfirm'
import Button from 'primevue/button'
import { useInboxStore } from '@/stores/inbox'
import { useProfileStore } from '@/stores/profile'
import { formatWhen } from '@/utils/time'

const route = useRoute()
const router = useRouter()
const confirm = useConfirm()
const inbox = useInboxStore()
const me = useProfileStore()

const id = computed(() => String(route.params.id))
const msg = computed(() => inbox.messages.find(m => m.id === id.value))

onMounted(async () => {
  if (!me.ready) return router.replace('/inbox')
  if (!inbox.loaded) await inbox.load()
  if (!msg.value) return router.replace('/inbox')
  await inbox.open(id.value)
})

function remove() {
  confirm.require({
    header: 'Apagar esta mensagem?',
    message: 'Esta ação não pode ser desfeita.',
    icon: 'pi pi-trash',
    rejectProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
    acceptProps: { label: 'Apagar', severity: 'danger' },
    accept: async () => {
      await inbox.remove(id.value)
      router.replace('/inbox')
    }
  })
}
</script>

<template>
  <header class="bar">
    <RouterLink to="/inbox" class="icon-btn icon-btn--dark" aria-label="Voltar"><i class="pi pi-arrow-left" aria-hidden="true" /></RouterLink>
    <h2 class="bar-title">Mensagem anônima</h2>
    <button type="button" class="icon-btn icon-btn--dark" aria-label="Apagar mensagem" @click="remove">
      <i class="pi pi-trash" aria-hidden="true" />
    </button>
  </header>

  <article v-if="msg" class="msg-card mt-6">
    <i class="pi pi-comment msg-icon" aria-hidden="true" />
    <p class="msg-text">{{ msg.text }}</p>
    <time class="msg-date" :datetime="msg.createdAt">{{ formatWhen(msg.createdAt) }}</time>
  </article>

  <p class="note note--dark mt-6">
    <i class="pi pi-lock" aria-hidden="true" />
    <span>Quem escreveu continua em sigilo. Nós não guardamos nenhuma identificação.</span>
  </p>

  <Button class="btn-ghost mt-6" icon="pi pi-arrow-left" label="Voltar para as mensagens" @click="router.push('/inbox')" />
</template>
