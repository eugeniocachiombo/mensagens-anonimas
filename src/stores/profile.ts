import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import CryptoJS from 'crypto-js'
import SHA256 from 'crypto-js/sha256'
import { api } from '@/services/api'
import type { Owner } from '@/types'

const KEY = 'ma:me'

function load(): Owner | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Owner) : null
  } catch {
    return null
  }
}

/** Sem login: o "dono" é identificado por uma chave secreta guardada só neste aparelho. */
export const useProfileStore = defineStore('profile', () => {
  const saved = load()
  const slug = ref(saved?.slug ?? '')
  const ownerKey = ref(saved?.ownerKey ?? '')
  const creating = ref(false)

  const ready = computed(() => Boolean(slug.value && ownerKey.value))
  const owner = computed<Owner>(() => ({ slug: slug.value, ownerKey: ownerKey.value }))
  const link = computed(() => (slug.value ? `${location.origin}/u/${slug.value}` : ''))

  async function create() {
    creating.value = true
    try {
      const key = CryptoJS.lib.WordArray.random(24).toString()
      const res = await api.createProfile(SHA256(key).toString())
      slug.value = res.slug
      ownerKey.value = key
      localStorage.setItem(KEY, JSON.stringify({ slug: res.slug, ownerKey: key }))
    } finally {
      creating.value = false
    }
  }

  async function ensure() {
    if (ready.value || creating.value) return
    await create()
  }

  return { slug, ownerKey, owner, ready, link, creating, ensure, renew: create }
})
