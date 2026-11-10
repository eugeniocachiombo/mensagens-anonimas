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

// 1. Criar perfil
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

// 2. Verificar perfil (Cria automaticamente se não existir)
app.get('/api/profiles/:slug', async (req, res) => {
  try {
    const slug = req.params.slug
    const profile = await redis.get(`profile:${slug}`)

    if (!profile) {
      const autoCreated = { ownerHash: 'auto-created', messages: [] }
      await redis.set(`profile:${slug}`, JSON.stringify(autoCreated))
    }

    return res.status(200).send()
  } catch (error) {
    res.status(500).json({ error: 'Erro ao verificar perfil' })
  }
})

// 3. Enviar mensagem (público)
app.post('/api/profiles/:slug/messages', async (req, res) => {
  try {
    const { text } = req.body
    const slug = req.params.slug

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Inválido' })
    }

    let profile = await redis.get(`profile:${slug}`)
    if (typeof profile === 'string') profile = JSON.parse(profile)

    if (!profile) {
      profile = { ownerHash: 'auto-created', messages: [] }
    }

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

// Middleware de Autenticação / Carregamento
async function checkAuth(req, res, next) {
  try {
    const slug = req.params.slug
    let profile = await redis.get(`profile:${slug}`)
    if (typeof profile === 'string') profile = JSON.parse(profile)

    if (!profile) {
      profile = { ownerHash: 'auto-created', messages: [] }
      await redis.set(`profile:${slug}`, JSON.stringify(profile))
    }

    req.profile = profile
    req.slug = slug
    next()
  } catch (error) {
    res.status(500).json({ error: 'Erro de autenticação/banco' })
  }
}

// 4. Listar mensagens
app.get('/api/profiles/:slug/messages', checkAuth, (req, res) => {
  const sorted = [...req.profile.messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  res.json(sorted)
})

// 5. Marcar mensagem como lida
app.patch('/api/profiles/:slug/messages/:id/read', checkAuth, async (req, res) => {
  const msg = req.profile.messages.find(m => m.id === req.params.id)
  if (msg && !msg.readAt) {
    msg.readAt = new Date().toISOString()
    await redis.set(`profile:${req.slug}`, JSON.stringify(req.profile))
  }
  res.status(204).send()
})

// 6. Apagar mensagem específica
app.delete('/api/profiles/:slug/messages/:id', checkAuth, async (req, res) => {
  req.profile.messages = req.profile.messages.filter(m => m.id !== req.params.id)
  await redis.set(`profile:${req.slug}`, JSON.stringify(req.profile))
  res.status(204).send()
})

// 7. Limpar mensagens lidas
app.delete('/api/profiles/:slug/messages', checkAuth, async (req, res) => {
  if (req.query.read === 'true') {
    req.profile.messages = req.profile.messages.filter(m => !m.readAt)
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