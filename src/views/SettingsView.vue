<script setup lang="ts">
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import { useProfileStore } from '@/stores/profile'
import { useInboxStore } from '@/stores/inbox'
import { copyText } from '@/utils/share'
import { canInstall, promptInstall } from '@/utils/install'
import { useMock } from '@/services/api'

const me = useProfileStore()
const inbox = useInboxStore()
const confirm = useConfirm()
const toast = useToast()

async function copy() {
  if (await copyText(me.link)) toast.add({ severity: 'success', summary: 'Link copiado!', life: 2000 })
}

function renew() {
  confirm.require({
    header: 'Gerar um novo link?',
    message: 'O link atual deixa de funcionar e as mensagens recebidas nele serão perdidas.',
    icon: 'pi pi-refresh',
    rejectProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
    acceptProps: { label: 'Gerar novo link', severity: 'danger' },
    accept: async () => {
      await me.renew()
      inbox.reset()
      toast.add({ severity: 'success', summary: 'Novo link criado', life: 2200 })
    }
  })
}
</script>

<template>
  <header class="bar">
    <span class="icon-btn icon-btn--static" aria-hidden="true" />
    <h2 class="bar-title">Configurações</h2>
    <span class="icon-btn icon-btn--static" aria-hidden="true" />
  </header>

  <section class="stack mt-5">
    <div class="glass setting">
      <strong>Seu link</strong>
      <p class="setting-text link-text">{{ me.link || '—' }}</p>
      <Button class="btn-ghost" icon="pi pi-copy" label="Copiar link" :disabled="!me.link" @click="copy" />
    </div>

    <div class="glass setting">
      <strong>Gerar novo link</strong>
      <p class="setting-text">Use se o seu link se espalhou demais. O antigo para de funcionar.</p>
      <Button class="btn-ghost" icon="pi pi-refresh" label="Gerar novo link" @click="renew" />
    </div>

    <div v-if="canInstall" class="glass setting">
      <strong>Instalar aplicativo</strong>
      <p class="setting-text">Tenha o app na tela inicial do seu celular.</p>
      <Button class="btn-primary" icon="pi pi-download" label="Instalar" @click="promptInstall" />
    </div>

    <div class="glass setting">
      <strong>Privacidade</strong>
      <p class="setting-text">Sem cadastro e sem login. Nenhum dado de quem escreve é guardado. Sua chave de acesso fica só neste aparelho.</p>
      <p v-if="useMock" class="setting-text setting-warn">Modo de demonstração: as mensagens ficam só neste navegador.</p>
    </div>
  </section>
</template>
