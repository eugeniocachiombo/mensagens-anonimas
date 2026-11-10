export interface Message {
  id: string
  text: string
  createdAt: string
  readAt: string | null
}

export interface Owner {
  slug: string
  ownerKey: string
}

/**
 * Contrato da API. Existem dois drivers:
 *  - mock: guarda tudo no localStorage (funciona sem backend)
 *  - http: fala com o backend Express + Prisma
 */
export interface Api {
  /** Cria um perfil anônimo. Recebe só o hash da chave secreta do dono. */
  createProfile(ownerHash: string): Promise<{ slug: string }>
  profileExists(slug: string): Promise<boolean>
  sendMessage(slug: string, text: string): Promise<void>
  listMessages(owner: Owner): Promise<Message[]>
  markRead(owner: Owner, id: string): Promise<void>
  removeMessage(owner: Owner, id: string): Promise<void>
  clearRead(owner: Owner): Promise<void>
}
