import process from 'node:process'
import express from 'express'
import crypto from 'node:crypto'
import cors from 'cors'
import { Redis } from '@upstash/redis'

const app = express()
app.use(cors())
app.use(express.json())

const redis = Redis.fromEnv()

app.get('/', (req, res) => {
  res.json({ status: 'online', message: 'API Express com Upstash Redis!' })
})

// Função auxiliar para garantir que o perfil tem sempre a estrutura correta
async function getOrCreateProfile(slug) {
  let profile = await redis.get(`profile:${slug}`)
  
  if (typeof profile === 'string') {
    try {
      profile = JSON.parse(profile)
    } catch {
      profile = null
    }
  }

  // Se não existir ou se 'messages' não for um array válido, inicializa corretamente
  if (!profile || typeof profile !== 'object' || !Array.isArray(profile.messages)) {
    profile = {
      ownerHash: profile?.ownerHash || 'auto-created',
      messages: []
    }
    await redis.set(`profile:${slug}`, JSON.stringify(profile))
  }

  return profile
}

app.post('/api/profiles', async (req, res) => {
  try {
    const { ownerHash } = req.body
    const slug = crypto.randomBytes(4).toString('hex')
    const newProfile = { ownerHash: ownerHash || 'default-hash', messages: [] }

    await redis.set(`profile:${slug}`, JSON.stringify(newProfile))
    res.status(201).json({ slug })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar perfil' })
  }
})

app.get('/api/profiles/:slug', async (req, res) => {
  try {
    await getOrCreateProfile(req.params.slug)
    return res.status(200).send()
  } catch (error) {
    res.status(500).json({ error: 'Erro ao verificar perfil' })
  }
})

app.post('/api/profiles/:slug/messages', async (req, res) => {
  try {
    const { text } = req.body
    const slug = req.params.slug

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Inválido' })
    }

    const profile = await getOrCreateProfile(slug)

    const cleanText = text.trim().slice(0, 500)
    const newMessage = {
      id: crypto.randomUUID(),
      text: cleanText,
      createdAt: new Date().toISOString(),
      readAt: null
    }

    profile.messages.push(newMessage)
    await redis.set(`profile:${slug}`, JSON.stringify(profile))

    res.status(201).send()
  } catch (error) {
    res.status(500).json({ error: 'Erro ao enviar mensagem' })
  }
})

async function checkAuth(req, res, next) {
  try {
    const slug = req.params.slug
    const profile = await getOrCreateProfile(slug)

    req.profile = profile
    req.slug = slug
    next()
  } catch (error) {
    res.status(500).json({ error: 'Erro de autenticação/banco' })
  }
}

app.get('/api/profiles/:slug/messages', checkAuth, (req, res) => {
  const messages = Array.isArray(req.profile.messages) ? req.profile.messages : []
  const sorted = [...messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  res.json(sorted)
})

app.patch('/api/profiles/:slug/messages/:id/read', checkAuth, async (req, res) => {
  const messages = Array.isArray(req.profile.messages) ? req.profile.messages : []
  const msg = messages.find(m => m.id === req.params.id)
  
  if (msg && !msg.readAt) {
    msg.readAt = new Date().toISOString()
    await redis.set(`profile:${req.slug}`, JSON.stringify(req.profile))
  }
  res.status(204).send()
})

app.delete('/api/profiles/:slug/messages/:id', checkAuth, async (req, res) => {
  const messages = Array.isArray(req.profile.messages) ? req.profile.messages : []
  req.profile.messages = messages.filter(m => m.id !== req.params.id)
  await redis.set(`profile:${req.slug}`, JSON.stringify(req.profile))
  res.status(204).send()
})

app.delete('/api/profiles/:slug/messages', checkAuth, async (req, res) => {
  if (req.query.read === 'true') {
    const messages = Array.isArray(req.profile.messages) ? req.profile.messages : []
    req.profile.messages = messages.filter(m => !m.readAt)
    await redis.set(`profile:${req.slug}`, JSON.stringify(req.profile))
  }
  res.status(204).send()
})

export default app

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`Servidor local a rodar na porta ${PORT}`)
  })
}