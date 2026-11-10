import process from 'node:process'
import express from 'express'
import crypto from 'node:crypto'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ status: 'online', message: 'API Express com Prisma e PostgreSQL!' })
})

// 1. Criar perfil
app.post('/api/profiles', async (req, res) => {
  try {
    const { ownerHash } = req.body
    const slug = crypto.randomBytes(4).toString('hex')

    const profile = await prisma.profile.create({
      data: {
        slug,
        ownerHash: ownerHash || 'default-hash'
      }
    })

    res.status(201).json({ slug: profile.slug })
  } catch (error) {
    console.error('Erro ao criar perfil:', error)
    res.status(500).json({ error: 'Erro ao criar perfil' })
  }
})

// 2. Verificar/Criar perfil automaticamente (Garante que nunca dá 404)
app.get('/api/profiles/:slug', async (req, res) => {
  try {
    const { slug } = req.params

    let profile = await prisma.profile.findUnique({
      where: { slug }
    })

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          slug,
          ownerHash: 'auto-created'
        }
      })
    }

    return res.status(200).send()
  } catch (error) {
    console.error('Erro ao verificar perfil:', error)
    res.status(500).json({ error: 'Erro ao verificar perfil' })
  }
})

// 3. Enviar mensagem (Público)
app.post('/api/profiles/:slug/messages', async (req, res) => {
  try {
    const { text } = req.body
    const { slug } = req.params

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Texto inválido' })
    }

    let profile = await prisma.profile.findUnique({
      where: { slug }
    })

    if (!profile) {
      profile = await prisma.profile.create({
        data: { slug, ownerHash: 'auto-created' }
      })
    }

    const cleanText = text.trim().slice(0, 500)

    await prisma.message.create({
      data: {
        profileId: profile.id,
        text: cleanText
      }
    })

    res.status(201).send()
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
    res.status(500).json({ error: 'Erro ao enviar mensagem' })
  }
})

// Middleware de Autenticação
async function checkAuth(req, res, next) {
  try {
    const { slug } = req.params
    let profile = await prisma.profile.findUnique({
      where: { slug },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!profile) {
      profile = await prisma.profile.create({
        data: { slug, ownerHash: 'auto-created' },
        include: { messages: true }
      })
    }

    req.profile = profile
    next()
  } catch (error) {
    console.error('Erro de autenticação:', error)
    res.status(500).json({ error: 'Erro de autenticação' })
  }
}

// 4. Listar mensagens
app.get('/api/profiles/:slug/messages', checkAuth, (req, res) => {
  res.json(req.profile.messages)
})

// 5. Marcar mensagem como lida
app.patch('/api/profiles/:slug/messages/:id/read', checkAuth, async (req, res) => {
  try {
    const { id } = req.params
    await prisma.message.updateMany({
      where: { id, profileId: req.profile.id, readAt: null },
      data: { readAt: new Date() }
    })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar mensagem' })
  }
})

// 6. Apagar mensagem específica
app.delete('/api/profiles/:slug/messages/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params
    await prisma.message.deleteMany({
      where: { id, profileId: req.profile.id }
    })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Erro ao apagar mensagem' })
  }
})

// 7. Limpar mensagens lidas
app.delete('/api/profiles/:slug/messages', checkAuth, async (req, res) => {
  try {
    if (req.query.read === 'true') {
      await prisma.message.deleteMany({
        where: { profileId: req.profile.id, readAt: { not: null } }
      })
    }
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Erro ao limpar mensagens' })
  }
})

export default app

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`Servidor local com Prisma a rodar na porta ${PORT}`)
  })
}