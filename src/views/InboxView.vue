<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import { useInboxStore } from '@/stores/inbox'
import { useProfileStore } from '@/stores/profile'
import { formatWhen } from '@/utils/time'
import { shareLink } from '@/utils/share'

const inbox = useInboxStore()
const me = useProfileStore()
const router = useRouter()
const confirm = useConfirm()
const toast = useToast()

const next = computed(() => inbox.unread[0])
const count = computed(() => inbox.unread.length)

onMounted(async () => {
  await me.ensure()
  await inbox.load()
})

function openNext() {
  if (next.value) router.push({ name: 'message', params: { id: next.value.id } })
}

function trash() {
  if (!inbox.read.length) {
    toast.add({ severity: 'info', summary: 'Nada para apagar', detail: 'Só mensagens já lidas são apagadas.', life: 2500 })
    return
  }
  confirm.require({
    header: 'Apagar mensagens lidas?',
    message: 'As mensagens anteriores serão removidas para sempre.',
    icon: 'pi pi-trash',
    rejectProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
    acceptProps: { label: 'Apagar', severity: 'danger' },
    accept: () => inbox.clearRead()
  })
}

async function onShare() {
  if (await shareLink(me.link) === 'copied') toast.add({ severity: 'success', summary: 'Link copiado!', life: 2000 })
}
</script>

<template>
  <header class="bar">
    <button type="button" class="icon-btn icon-btn--dark" :aria-label="count ? `${count} mensagens novas` : 'Sem mensagens novas'" @click="openNext">
      <i class="pi pi-bell" aria-hidden="true" />
      <span v-if="count" class="badge">{{ count }}</span>
    </button>
    <h2 class="bar-title">Minhas Mensagens</h2>
    <button type="button" class="icon-btn icon-btn--dark" aria-label="Apagar mensagens lidas" @click="trash">
      <i class="pi pi-trash" aria-hidden="true" />
    </button>
  </header>

  <section class="new-card mt-5" :class="{ 'new-card--empty': !count }">
    <div class="env-wrap">
      <svg viewBox="0 0 80 60" width="84" height="64" aria-hidden="true">
        <defs>
          <linearGradient id="ib-e" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#2f9bff" />
            <stop offset="1" stop-color="#2150f5" />
          </linearGradient>
        </defs>
        <rect x="4" y="8" width="72" height="48" rx="8" fill="url(#ib-e)" />
        <path d="M8 14l32 24 32-24" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <span v-if="count" class="badge badge--lg">{{ count }}</span>
    </div>

    <template v-if="count">
      <h2 class="card-title">{{ count > 1 ? 'Novas mensagens recebidas!' : 'Nova mensagem recebida!' }}</h2>
      <p class="card-text">Clique para ver o que alguém escreveu para você.</p>
      <Button class="btn-primary" icon="pi pi-eye" label="Abrir Mensagem" @click="openNext" />
    </template>
    <template v-else>
      <h2 class="card-title">{{ inbox.loading ? 'Procurando…' : 'Nenhuma mensagem nova' }}</h2>
      <p class="card-text">Compartilhe seu link e espere os sussurros chegarem.</p>
      <Button class="btn-primary" icon="pi pi-share-alt" label="Compartilhar Link" :disabled="!me.link" @click="onShare" />
    </template>
  </section>

  <h3 class="section-title mt-6"><i class="pi pi-history" aria-hidden="true" /> Mensagens Anteriores</h3>

  <ul v-if="inbox.read.length" class="stack mt-3 list">
    <li v-for="m in inbox.read" :key="m.id">
      <RouterLink :to="{ name: 'message', params: { id: m.id } }" class="glass prev-item">
        <i class="pi pi-envelope-open prev-icon" aria-hidden="true" />
        <span class="prev-body">
          <span class="prev-text">{{ m.text }}</span>
          <span class="prev-date">{{ formatWhen(m.createdAt) }}</span>
        </span>
        <i class="pi pi-chevron-right" aria-hidden="true" />
      </RouterLink>
    </li>
  </ul>
  <div v-else class="glass empty mt-3">
    <i class="pi pi-comment empty-icon" aria-hidden="true" />
    <p class="empty-title">Ainda não há mensagens anteriores.</p>
    <p class="empty-text">Compartilhe seu link para receber mensagens!</p>
  </div>
</template>
