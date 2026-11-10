// Gerador de QR Code compacto (modo byte, correção M, versões 1–10).
// Sem dependências externas.

const EC_PER_BLOCK = [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26]
const NUM_BLOCKS = [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5]
const MAX_VERSION = 10

function rawModules(ver: number): number {
  let n = (16 * ver + 128) * ver + 64
  if (ver >= 2) {
    const a = Math.floor(ver / 7) + 2
    n -= (25 * a - 10) * a - 55
    if (ver >= 7) n -= 36
  }
  return n
}

function alignPositions(ver: number): number[] {
  if (ver === 1) return []
  const n = Math.floor(ver / 7) + 2
  const size = ver * 4 + 17
  const step = Math.ceil((ver * 4 + 4) / (n * 2 - 2)) * 2
  const res = [6]
  for (let pos = size - 7; res.length < n; pos -= step) res.splice(1, 0, pos)
  return res
}

function gfMul(x: number, y: number): number {
  let z = 0
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11D)
    z ^= ((y >>> i) & 1) * x
  }
  return z
}

function rsDivisor(degree: number): number[] {
  const res = new Array<number>(degree).fill(0)
  res[degree - 1] = 1
  let root = 1
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      res[j] = gfMul(res[j]!, root)
      if (j + 1 < degree) res[j]! ^= res[j + 1]!
    }
    root = gfMul(root, 2)
  }
  return res
}

function rsRemainder(data: number[], divisor: number[]): number[] {
  const res = divisor.map(() => 0)
  for (const b of data) {
    const factor = b ^ res.shift()!
    res.push(0)
    divisor.forEach((coef, i) => {
      res[i]! ^= gfMul(coef, factor)
    })
  }
  return res
}

function bit(x: number, i: number): boolean {
  return ((x >>> i) & 1) !== 0
}

function buildCodewords(bytes: number[], ver: number): number[] {
  const raw = Math.floor(rawModules(ver) / 8)
  const blocks = NUM_BLOCKS[ver]!
  const eccLen = EC_PER_BLOCK[ver]!
  const dataCap = raw - eccLen * blocks

  const bits: number[] = []
  const push = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1)
  }
  push(0b0100, 4)
  push(bytes.length, ver < 10 ? 8 : 16)
  bytes.forEach(b => push(b, 8))
  push(0, Math.min(4, dataCap * 8 - bits.length))
  while (bits.length % 8) bits.push(0)
  const data: number[] = []
  for (let i = 0; i < bits.length; i += 8) {
    data.push(bits.slice(i, i + 8).reduce((a, b) => (a << 1) | b, 0))
  }
  for (let pad = 0xEC; data.length < dataCap; pad ^= 0xEC ^ 0x11) data.push(pad)

  const shortBlocks = blocks - (raw % blocks)
  const shortLen = Math.floor(raw / blocks)
  const div = rsDivisor(eccLen)
  const all: number[][] = []
  for (let i = 0, k = 0; i < blocks; i++) {
    const len = shortLen - eccLen + (i < shortBlocks ? 0 : 1)
    const dat = data.slice(k, k + len)
    k += len
    const ecc = rsRemainder(dat, div)
    if (i < shortBlocks) dat.push(0)
    all.push(dat.concat(ecc))
  }
  const out: number[] = []
  for (let i = 0; i < all[0]!.length; i++) {
    all.forEach((blk, j) => {
      if (i !== shortLen - eccLen || j >= shortBlocks) out.push(blk[i]!)
    })
  }
  return out
}

function penalty(m: boolean[][]): number {
  const n = m.length
  let score = 0
  const lines: boolean[][] = []
  for (let i = 0; i < n; i++) {
    lines.push(m[i]!)
    lines.push(m.map(r => r[i]!))
  }
  for (const line of lines) {
    let run = 1
    for (let i = 1; i <= n; i++) {
      if (i < n && line[i] === line[i - 1]) run++
      else {
        if (run >= 5) score += 3 + (run - 5)
        run = 1
      }
    }
    const s = line.map(v => (v ? '1' : '0')).join('')
    for (const pat of ['10111010000', '00001011101']) {
      let idx = s.indexOf(pat)
      while (idx !== -1) {
        score += 40
        idx = s.indexOf(pat, idx + 1)
      }
    }
  }
  for (let y = 0; y < n - 1; y++) {
    for (let x = 0; x < n - 1; x++) {
      const c = m[y]![x]
      if (c === m[y]![x + 1] && c === m[y + 1]![x] && c === m[y + 1]![x + 1]) score += 3
    }
  }
  const dark = m.flat().filter(Boolean).length
  const total = n * n
  score += (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * 10
  return score
}

function maskBit(mask: number, x: number, y: number): boolean {
  switch (mask) {
    case 0: return (x + y) % 2 === 0
    case 1: return y % 2 === 0
    case 2: return x % 3 === 0
    case 3: return (x + y) % 3 === 0
    case 4: return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0
    case 5: return ((x * y) % 2) + ((x * y) % 3) === 0
    case 6: return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0
    default: return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0
  }
}

export function makeQr(text: string): boolean[][] {
  const bytes = Array.from(new TextEncoder().encode(text))
  let ver = 1
  for (; ver <= MAX_VERSION; ver++) {
    const cap = Math.floor(rawModules(ver) / 8) - EC_PER_BLOCK[ver]! * NUM_BLOCKS[ver]!
    if (4 + (ver < 10 ? 8 : 16) + 8 * bytes.length <= cap * 8) break
  }
  if (ver > MAX_VERSION) throw new Error('Texto longo demais para o QR Code')

  const size = ver * 4 + 17
  const mod: boolean[][] = Array.from({ length: size }, () => new Array<boolean>(size).fill(false))
  const fn: boolean[][] = Array.from({ length: size }, () => new Array<boolean>(size).fill(false))
  const setFn = (x: number, y: number, v: boolean) => {
    mod[y]![x] = v
    fn[y]![x] = true
  }

  for (let i = 0; i < size; i++) {
    setFn(6, i, i % 2 === 0)
    setFn(i, 6, i % 2 === 0)
  }
  const finder = (cx: number, cy: number) => {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy))
        const x = cx + dx
        const y = cy + dy
        if (x >= 0 && x < size && y >= 0 && y < size) setFn(x, y, dist !== 2 && dist !== 4)
      }
    }
  }
  finder(3, 3)
  finder(size - 4, 3)
  finder(3, size - 4)
  const pos = alignPositions(ver)
  pos.forEach((py, i) => pos.forEach((px, j) => {
    if ((i === 0 && j === 0) || (i === 0 && j === pos.length - 1) || (i === pos.length - 1 && j === 0)) return
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) setFn(px + dx, py + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1)
    }
  }))

  const formatBits = (mask: number) => {
    const data = (0 << 3) | mask // nível M = 00
    let rem = data
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537)
    const bits = ((data << 10) | rem) ^ 0x5412
    for (let i = 0; i <= 5; i++) setFn(8, i, bit(bits, i))
    setFn(8, 7, bit(bits, 6))
    setFn(8, 8, bit(bits, 7))
    setFn(7, 8, bit(bits, 8))
    for (let i = 9; i < 15; i++) setFn(14 - i, 8, bit(bits, i))
    for (let i = 0; i < 8; i++) setFn(size - 1 - i, 8, bit(bits, i))
    for (let i = 8; i < 15; i++) setFn(8, size - 15 + i, bit(bits, i))
    setFn(8, size - 8, true)
  }
  formatBits(0)
  if (ver >= 7) {
    let rem = ver
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25)
    const bits = (ver << 12) | rem
    for (let i = 0; i < 18; i++) {
      const a = size - 11 + (i % 3)
      const b = Math.floor(i / 3)
      setFn(a, b, bit(bits, i))
      setFn(b, a, bit(bits, i))
    }
  }

  const code = buildCodewords(bytes, ver)
  let k = 0
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j
        const y = ((right + 1) & 2) === 0 ? size - 1 - vert : vert
        if (!fn[y]![x] && k < code.length * 8) {
          mod[y]![x] = bit(code[k >>> 3]!, 7 - (k & 7))
          k++
        }
      }
    }
  }

  const applyMask = (mask: number) => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (!fn[y]![x] && maskBit(mask, x, y)) mod[y]![x] = !mod[y]![x]
      }
    }
  }
  let best = 0
  let bestScore = Infinity
  for (let mask = 0; mask < 8; mask++) {
    applyMask(mask)
    formatBits(mask)
    const s = penalty(mod)
    if (s < bestScore) {
      bestScore = s
      best = mask
    }
    applyMask(mask)
  }
  applyMask(best)
  formatBits(best)
  return mod
}
