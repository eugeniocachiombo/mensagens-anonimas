import type { Owner } from '@/types'

const API_BASE = '/api' // ou a URL completa da sua API na Vercel, ex: 'https://sua-api.vercel.app/api'

export const api = {
  async createProfile(ownerHash: string) {
    const res = await fetch(`${API_BASE}/profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ownerHash })
    })
    if (!res.ok) throw new Error('Falha ao criar perfil')
    return res.json() // Retorna { slug }
  },

  async profileExists(slug: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/profiles/${slug}`)
      return res.status === 200
    } catch {
      return false
    }
  },

  async listMessages(owner: Owner) {
    const res = await fetch(`${API_BASE}/profiles/${owner.slug}/messages`, {
      headers: {
        'x-owner-key': owner.ownerKey // Caso utilize autenticação por header
      }
    })
    if (!res.ok) return [] // Se falhar, retorna array vazio em vez de quebrar
    const data = await res.json()
    // BLINDAGEM MÁXIMA: Garante obrigatoriamente que o resultado é um array
    return Array.isArray(data) ? data : []
  },

  async sendMessage(slug: string, text: string) {
    const res = await fetch(`${API_BASE}/profiles/${slug}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    })
    if (!res.ok) throw new Error('Falha ao enviar mensagem')
    return true
  },

  async markRead(owner: Owner, id: string) {
    await fetch(`${API_BASE}/profiles/${owner.slug}/messages/${id}/read`, {
      method: 'PATCH'
    })
  },

  async removeMessage(owner: Owner, id: string) {
    await fetch(`${API_BASE}/profiles/${owner.slug}/messages/${id}`, {
      method: 'DELETE'
    })
  },

  async clearRead(owner: Owner) {
    await fetch(`${API_BASE}/profiles/${owner.slug}/messages?read=true`, {
      method: 'DELETE'
    })
  }
}