import axios, { isAxiosError } from 'axios'
import type { Api, Message, Owner } from '@/types'
import { mockApi } from './mock'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  timeout: 15000
})

const auth = (owner: Owner) => ({ headers: { 'x-owner-key': owner.ownerKey } })
const inbox = (owner: Owner) => `/profiles/${owner.slug}/messages`

const httpApi: Api = {
  async createProfile(ownerHash) {
    const { data } = await http.post<{ slug: string }>('/profiles', { ownerHash })
    return data
  },
  async profileExists(slug) {
    try {
      await http.get(`/profiles/${slug}`)
      return true
    } catch (e) {
      if (isAxiosError(e) && e.response?.status === 404) return false
      throw e
    }
  },
  async sendMessage(slug, text) {
    await http.post(`/profiles/${slug}/messages`, { text })
  },
  async listMessages(owner) {
    const { data } = await http.get<Message[]>(inbox(owner), auth(owner))
    return data
  },
  async markRead(owner, id) {
    await http.patch(`${inbox(owner)}/${id}/read`, null, auth(owner))
  },
  async removeMessage(owner, id) {
    await http.delete(`${inbox(owner)}/${id}`, auth(owner))
  },
  async clearRead(owner) {
    await http.delete(inbox(owner), { ...auth(owner), params: { read: true } })
  }
}

export const useMock = import.meta.env.VITE_USE_MOCK !== 'false'
export const api: Api = useMock ? mockApi : httpApi