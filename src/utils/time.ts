const day = 86_400_000
const hm = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })
const dm = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })

export function formatWhen(iso: string): string {
  const d = new Date(iso)
  const start = new Date().setHours(0, 0, 0, 0)
  if (d.getTime() >= start) return `Hoje, ${hm.format(d)}`
  if (d.getTime() >= start - day) return `Ontem, ${hm.format(d)}`
  return `${dm.format(d).replace('.', '')}, ${hm.format(d)}`
}
