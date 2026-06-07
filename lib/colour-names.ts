// Colour anchor table: [name, r, g, b]
const ANCHORS: [string, number, number, number][] = [
  ['red', 220, 38, 38],
  ['crimson', 185, 28, 28],
  ['rose', 244, 63, 94],
  ['pink', 236, 72, 153],
  ['fuchsia', 192, 38, 211],
  ['purple', 126, 34, 206],
  ['violet', 109, 40, 217],
  ['indigo', 67, 56, 202],
  ['blue', 37, 99, 235],
  ['sky blue', 14, 165, 233],
  ['cyan', 6, 182, 212],
  ['teal', 20, 184, 166],
  ['green', 34, 197, 94],
  ['lime', 132, 204, 22],
  ['yellow', 234, 179, 8],
  ['amber', 245, 158, 11],
  ['orange', 249, 115, 22],
  ['coral', 251, 113, 133],
  ['gold', 202, 138, 4],
  ['brown', 120, 53, 15],
  ['tan', 180, 140, 100],
  ['white', 255, 255, 255],
  ['silver', 203, 213, 225],
  ['light grey', 156, 163, 175],
  ['grey', 107, 114, 128],
  ['charcoal', 55, 65, 81],
  ['dark grey', 31, 41, 55],
  ['black', 15, 15, 15],
  ['navy', 30, 58, 138],
  ['slate', 51, 65, 85],
  ['stone', 120, 113, 108],
  ['cream', 254, 252, 232],
  ['ivory', 255, 251, 235],
  ['mint', 167, 243, 208],
  ['sage', 134, 161, 125],
  ['olive', 101, 120, 36],
  ['forest green', 22, 101, 52],
  ['turquoise', 20, 184, 166],
  ['lavender', 167, 139, 250],
  ['lilac', 196, 181, 253],
  ['magenta', 217, 70, 239],
  ['maroon', 127, 29, 29],
  ['burgundy', 100, 17, 17],
  ['peach', 253, 186, 116],
  ['salmon', 252, 165, 165],
  ['mauve', 167, 94, 121],
  ['taupe', 143, 122, 102],
  ['beige', 254, 243, 199],
  ['caramel', 180, 90, 30],
  ['copper', 180, 120, 60],
]

function hexToRgb(hex: string): [number, number, number] | null {
  const cleaned = hex.replace('#', '')
  const full =
    cleaned.length === 3
      ? cleaned
          .split('')
          .map((c) => c + c)
          .join('')
      : cleaned
  if (full.length !== 6) return null
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null
  return [r, g, b]
}

export function nearestColourName(hex: string): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return 'colour'
  const [r, g, b] = rgb
  let best = ANCHORS[0][0]
  let bestDist = Infinity
  for (const [name, ar, ag, ab] of ANCHORS) {
    const dist = (r - ar) ** 2 + (g - ag) ** 2 + (b - ab) ** 2
    if (dist < bestDist) {
      bestDist = dist
      best = name
    }
  }
  return best
}
