import { ref } from 'vue'

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
}

let deferred: InstallPromptEvent | null = null
export const canInstall = ref(false)

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferred = e as InstallPromptEvent
  canInstall.value = true
})

window.addEventListener('appinstalled', () => {
  deferred = null
  canInstall.value = false
})

export async function promptInstall() {
  if (!deferred) return
  await deferred.prompt()
  deferred = null
  canInstall.value = false
}
