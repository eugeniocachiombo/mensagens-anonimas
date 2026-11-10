import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import express from 'express'
import crypto from 'node:crypto'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

// No ambiente Serverless (Vercel), salva na pasta temporária /tmp
const DB_FILE = process.env.VERCEL ? path.join('/tmp', 'db.json') : path.resolve('db.json')

function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    return {}
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return {}
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error('Erro ao escrever no arquivo DB:', err)
  }
}

app.get('/', (req, res) => {
  res.json({ status: 'online', message: 'API Express a rodar na Vercel!' })
})

app.post('/api/profiles', (req, res) => {
  const { ownerHash } = req.body
  const db = readDb()
  const slug = crypto.randomBytes(4).toString('hex')
  db[slug] = { ownerHash: ownerHash || 'default-hash', messages: [] }
  writeDb(db)
  res.status(201).json({ slug })
})

app.get('/api/profiles/:slug', (req, res) => {
  const db = readDb()
  const slug = req.params.slug
  
  if (!db[slug]) {
    db[slug] = { ownerHash: 'auto-created', messages: [] }
    writeDb(db)
  }
  
  return res.status(200).send()
})

app.post('/api/profiles/:slug/messages', (req, res) => {
  const { text } = req.body
  const db = readDb()
  const slug = req.params.slug

  if (!db[slug]) {
    db[slug] = { ownerHash: 'auto-created', messages: [] }
  }

  const profile = db[slug]

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Inválido' })
  }

  const cleanText = text.trim().slice(0, 500)
  const newMessage = {
    id: crypto.randomUUID(),
    text: cleanText,
    createdAt: new Date().toISOString(),
    readAt: null
  }

  profile.messages.push(newMessage)
  writeDb(db)
  
  res.status(201).send()
})

function checkAuth(req, res, next) {
  const db = readDb()
  const slug = req.params.slug
  
  if (!db[slug]) {
    db[slug] = { ownerHash: 'auto-created', messages: [] }
    writeDb(db)
  }

  req.profile = db[slug]
  req.db = db
  next()
}

app.get('/api/profiles/:slug/messages', checkAuth, (req, res) => {
  const sorted = [...req.profile.messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  res.json(sorted)
})

app.patch('/api/profiles/:slug/messages/:id/read', checkAuth, (req, res) => {
  const msg = req.profile.messages.find(m => m.id === req.params.id)
  if (msg && !msg.readAt) {
    msg.readAt = new Date().toISOString()
    writeDb(req.db)
  }
  res.status(204).send()
})

app.delete('/api/profiles/:slug/messages/:id', checkAuth, (req, res) => {
  req.profile.messages = req.profile.messages.filter(m => m.id !== req.params.id)
  writeDb(req.db)
  res.status(204).send()
})

app.delete('/api/profiles/:slug/messages', checkAuth, (req, res) => {
  if (req.query.read === 'true') {
    req.profile.messages = req.profile.messages.filter(m => !m.readAt)
    writeDb(req.db)
  }
  res.status(204).send()
})

export default app

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`Servidor a rodar na porta ${PORT}`)
  })
}