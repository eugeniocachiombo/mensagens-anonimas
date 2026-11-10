<script setup lang="ts">
import { onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import BrandLogo from '@/components/BrandLogo.vue'
import QrCode from '@/components/QrCode.vue'
import HeartEnvelope from '@/components/HeartEnvelope.vue'
import WaveBottom from '@/components/WaveBottom.vue'
import { useProfileStore } from '@/stores/profile'
import { copyText, shareLink } from '@/utils/share'

const me = useProfileStore()
const toast = useToast()

onMounted(() => me.ensure())

async function onCopy() {
  if (!me.link) return
  if (await copyText(me.link)) toast.add({ severity: 'success', summary: 'Link copiado!', life: 2000 })
}

async function onShare() {
  if (!me.link) return
  if (await shareLink(me.link) === 'copied') toast.add({ severity: 'success', summary: 'Link copiado!', life: 2000 })
}
</script>

<template>
  <header class="center">
    <BrandLogo :size="92" />
    <h1 class="title mt-5">
      Deixe alguém te enviar uma
      <span class="grad-text">mensagem anônima!</span>
    </h1>
    <p class="lead">Compartilhe este link com um amigo ou publique no seu perfil.</p>
  </header>

  <section class="stack mt-6">
    <div class="link-pill">
      <span class="link-text">{{ me.link || 'Gerando seu link…' }}</span>
      <button type="button" class="pill-btn" aria-label="Copiar link" :disabled="!me.link" @click="onCopy">
        <i class="pi pi-copy" aria-hidden="true" />
      </button>
    </div>

    <Button class="btn-primary" icon="pi pi-share-alt" label="Compartilhar Link" :disabled="!me.link" @click="onShare" />

    <div class="or">ou</div>

    <div class="glass qr-card">
      <div class="qr-box"><QrCode :value="me.link" /></div>
      <div>
        <strong class="qr-title">Use o QR Code</strong>
        <p class="qr-text">Aponte a câmera e acesse facilmente.</p>
      </div>
    </div>
  </section>

  <div class="home-art" aria-hidden="true">
    <WaveBottom variant="dark" />
    <HeartEnvelope class="home-env" />
  </div>
</template>
