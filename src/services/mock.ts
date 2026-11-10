import SHA256 from 'crypto-js/sha256'
import CryptoJS from 'crypto-js'
import type { Api, Message, Owner } from '@/types'

interface Row {
  ownerHash: string
  messages: Message[]
}
type Db = Record<string, Row>

const KEY = 'ma:db'
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'

function read(): Db {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Db
  } catch {
    return {}
  }
}
const write = (db: Db) => localStorage.setItem(KEY, JSON.stringify(db))
const wait = (ms = 220) => new Promise(resolve => setTimeout(resolve, ms))
const rid = () => CryptoJS.lib.WordArray.random(8).toString()

function randomSlug(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  return Array.from(bytes, b => ALPHABET[b % ALPHABET.length]).join('')
}

function newSlug(db: Db): string {
  const slug = randomSlug()
  return db[slug] ? newSlug(db) : slug
}

function auth(db: Db, owner: Owner): Row {
  const row = db[owner.slug]
  if (!row || row.ownerHash !== SHA256(owner.ownerKey).toString()) throw new Error('unauthorized')
  return row
}

export const mockApi: Api = {
  async createProfile(ownerHash) {
    await wait()
    const db = read()
    const slug = newSlug(db)
    db[slug] = { ownerHash, messages: [] }
    write(db)
    return { slug }
  },
  async profileExists(slug) {
    await wait(120)
    return Boolean(read()[slug])
  },
  async sendMessage(slug, text) {
    await wait()
    const db = read()
    const row = db[slug]
    const clean = text.trim().slice(0, 500)
    if (!row || !clean) throw new Error('invalid')
    row.messages.push({ id: rid(), text: clean, createdAt: new Date().toISOString(), readAt: null })
    write(db)
  },
  async listMessages(owner) {
    await wait(120)
    const row = auth(read(), owner)
    return [...row.messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },
  async markRead(owner, id) {
    const db = read()
    const msg = auth(db, owner).messages.find(m => m.id === id)
    if (msg && !msg.readAt) msg.readAt = new Date().toISOString()
    write(db)
  },
  async removeMessage(owner, id) {
    const db = read()
    const row = auth(db, owner)
    row.messages = row.messages.filter(m => m.id !== id)
    write(db)
  },
  async clearRead(owner) {
    const db = read()
    const row = auth(db, owner)
    row.messages = row.messages.filter(m => !m.readAt)
    write(db)
  }
}
