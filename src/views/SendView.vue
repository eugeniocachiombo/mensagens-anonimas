<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import MaskEnvelope from '@/components/MaskEnvelope.vue'
import WaveBottom from '@/components/WaveBottom.vue'
import { api } from '@/services/api'

const MAX = 500
const route = useRoute()
const toast = useToast()
const slug = computed(() => String(route.params.slug))
const status = ref<'loading' | 'ready' | 'invalid' | 'sent'>('loading')
const text = ref('')
const sending = ref(false)

onMounted(async () => {
  try {
    const exists = await api.profileExists(slug.value)
    status.value = exists ? 'ready' : 'invalid'
  } catch {
    status.value = 'invalid'
  }
})

async function send() {
  const clean = text.value.trim()
  if (!clean || sending.value) return
  sending.value = true
  try {
    await api.sendMessage(slug.value, clean)
    text.value = ''
    status.value = 'sent'
  } catch {
    toast.add({ severity: 'error', summary: 'Não foi possível enviar', detail: 'Tente novamente em instantes.', life: 3500 })
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <header class="bar">
    <!-- <RouterLink to="/" class="icon-btn" aria-label="Voltar"><i class="pi pi-arrow-left" aria-hidden="true" /></RouterLink> -->
    <h2 class="bar-title">Enviar Mensagem</h2>
    <span class="icon-btn icon-btn--static" aria-hidden="true"><i class="pi pi-shield" /></span>
  </header>

  <template v-if="status === 'sent'">
    <section class="center mt-8">
      <MaskEnvelope />
      <h1 class="title title--sm">Mensagem enviada!</h1>
      <p class="lead lead--dark">Ela chegou em segredo. Ninguém saberá que foi você.</p>
      <Button class="btn-blue mt-6" icon="pi pi-send" label="Enviar outra mensagem" @click="status = 'ready'" />
      <!-- <RouterLink to="/" class="text-link">Quero receber mensagens também</RouterLink> -->
    </section>
  </template>

  <template v-else-if="status === 'invalid'">
    <section class="center mt-8">
      <MaskEnvelope />
      <h1 class="title title--sm">Link inválido</h1>
      <p class="lead lead--dark">Não encontramos este perfil. Peça um novo link ao seu amigo.</p>
      <!-- <RouterLink to="/" class="text-link">Criar o meu link</RouterLink> -->
    </section>
  </template>

  <template v-else>
    <section class="center mt-2">
      <MaskEnvelope />
      <h1 class="title title--sm">
        Deixe sua mensagem
        <span class="grad-text-blue">(anônima)</span>
      </h1>
    </section>

    <form class="stack mt-5" @submit.prevent="send">
      <div class="field">
        <label for="msg" class="sr-only">Sua mensagem</label>
        <Textarea id="msg" v-model="text" :maxlength="MAX" rows="6" placeholder="Escreva aqui o que deseja dizer..." :disabled="status === 'loading'" />
        <span class="counter">{{ text.length }}/{{ MAX }}</span>
      </div>
      <Button type="submit" class="btn-blue" icon="pi pi-send" label="Enviar Mensagem" :loading="sending" :disabled="!text.trim() || status === 'loading'" />
      <p class="note">
        <i class="pi pi-lock" aria-hidden="true" />
        <span>Sua identidade será totalmente mantida em sigilo.</span>
      </p>
    </form>
  </template>

  <div class="send-wave" aria-hidden="true"><WaveBottom variant="light" /></div>
</template>
