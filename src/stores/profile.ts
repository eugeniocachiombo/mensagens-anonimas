import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import CryptoJS from 'crypto-js'
import SHA256 from 'crypto-js/sha256'
import { api } from '@/services/api'
import type { Owner } from '@/types'

const KEY = 'ma:me'

// Perfil fixo a partir de uma única variável no formato "slug:ownerKey"
const [FIXED_SLUG, FIXED_OWNER_KEY] = (import.meta.env.VITE_OWNER || '').split(':')

function load(): Owner | null {
  if (FIXED_SLUG && FIXED_OWNER_KEY) {
    return { slug: FIXED_SLUG, ownerKey: FIXED_OWNER_KEY }
  }

  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Owner) : null
  } catch {
    return null
  }
}

export const useProfileStore = defineStore('profile', () => {
  const saved = load()
  const slug = ref(saved?.slug ?? '')
  const ownerKey = ref(saved?.ownerKey ?? '')
  const creating = ref(false)

  const ready = computed(() => Boolean(slug.value && ownerKey.value))
  const owner = computed<Owner>(() => ({ slug: slug.value, ownerKey: ownerKey.value }))
  const link = computed(() => (slug.value ? `${location.origin}/u/${slug.value}` : ''))

  async function create() {
    if (FIXED_SLUG && FIXED_OWNER_KEY) {
      slug.value = FIXED_SLUG
      ownerKey.value = FIXED_OWNER_KEY
      return
    }

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

  function setCustomProfile(customSlug: string, customOwnerKey: string) {
    slug.value = customSlug
    ownerKey.value = customOwnerKey
    localStorage.setItem(KEY, JSON.stringify({ slug: customSlug, ownerKey: customOwnerKey }))
  }

  return { slug, ownerKey, owner, ready, link, creating, ensure, renew: create, setCustomProfile }
})