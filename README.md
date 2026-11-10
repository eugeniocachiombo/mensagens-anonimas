# Mensagens Anônimas

App de mensagens anônimas **sem login**. Você compartilha um link (ou QR Code), a pessoa abre,
escreve sem se identificar e você recebe a mensagem, clica em **Abrir** e lê.

Stack: Vue 3 + Vite + TypeScript + Pinia + Vue Router + PrimeVue (Aura) + Tailwind v4 + PWA.

## Rodar

```bash
npm install --legacy-peer-deps   # o package.json mistura peers de ESLint 9 e 10
npm run dev                      # http://localhost:5173
npm run build                    # vue-tsc + vite build
npm run lint
```

## Como funciona sem login

Ao abrir o app pela primeira vez é criado um perfil com um **link público** (`/u/:slug`) e uma
**chave secreta** guardada só no aparelho (`localStorage`). O servidor recebe apenas o hash
SHA-256 da chave (`crypto-js`). Quem lê a caixa de entrada prova que é o dono enviando a chave
no header `x-owner-key`. Quem envia mensagens não precisa de nada e nada dele é guardado.

> Limite do modelo sem login: se o dono limpar os dados do navegador, perde a chave.

## Modo demo x API real

`.env`:

| Variável | Efeito |
|---|---|
| `VITE_USE_MOCK=true` | Tudo no `localStorage` (padrão). Só funciona no mesmo navegador. |
| `VITE_USE_MOCK=false` | Usa a API Express. `VITE_API_URL` (padrão `/api`; em dev há proxy para `localhost:3333`). |

Para um amigo conseguir te enviar mensagens de outro aparelho, use a API real.

### Contrato da API (Express + Prisma)

```
POST   /profiles                          { ownerHash }        -> { slug }
GET    /profiles/:slug                    -> 200 | 404
POST   /profiles/:slug/messages           { text <= 500 }      -> 201   (público)
GET    /profiles/:slug/messages           header x-owner-key   -> Message[]
PATCH  /profiles/:slug/messages/:id/read  header x-owner-key
DELETE /profiles/:slug/messages/:id       header x-owner-key
DELETE /profiles/:slug/messages?read=true header x-owner-key
```

`Message = { id, text, createdAt, readAt | null }`. No servidor: compare `sha256(x-owner-key)`
com `ownerHash` e aplique rate-limit no POST público.

```prisma
model Profile {
  slug      String    @id
  ownerHash String
  createdAt DateTime  @default(now())
  messages  Message[]
}

model Message {
  id        String    @id @default(cuid())
  profile   Profile   @relation(fields: [slug], references: [slug], onDelete: Cascade)
  slug      String
  text      String
  createdAt DateTime  @default(now())
  readAt    DateTime?

  @@index([slug, createdAt])
}
```

## PWA

`public/manifest.webmanifest`, ícones em `public/icons` e service worker simples em `public/sw.js`
(registrado só em produção). O servidor precisa devolver `index.html` para rotas como `/u/abc123`
(fallback de SPA).

## Observações

- `typescript` está em `~6.0.3` (no JSON original era `^7.0.2`): `vue-tsc` e `typescript-eslint`
  ainda não funcionam com o TS 7.
- O QR Code é gerado por `src/utils/qr.ts`, sem dependência extra.
- As fontes vêm do Google Fonts (Inter). Offline, caem na fonte do sistema.
