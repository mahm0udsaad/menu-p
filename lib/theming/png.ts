/**
 * Minimal pure-TS PNG decoder — just enough to sample logo colors on the
 * server without native deps (sharp is not a dependency of this project).
 *
 * Supports: 8-bit depth, color types 0 (gray), 2 (RGB), 3 (palette),
 * 4 (gray+alpha), 6 (RGBA), non-interlaced. Anything else throws and the
 * caller falls back to `restaurants.color_palette`.
 */

import { inflateSync } from "node:zlib"

export interface DecodedImage {
  width: number
  height: number
  /** RGBA, 4 bytes per pixel. */
  pixels: Uint8ClampedArray
}

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

export function isPng(bytes: Uint8Array): boolean {
  if (bytes.length < PNG_SIGNATURE.length) return false
  return PNG_SIGNATURE.every((b, i) => bytes[i] === b)
}

const CHANNELS: Record<number, number> = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c
  const pa = Math.abs(p - a)
  const pb = Math.abs(p - b)
  const pc = Math.abs(p - c)
  if (pa <= pb && pa <= pc) return a
  if (pb <= pc) return b
  return c
}

export function decodePng(bytes: Uint8Array): DecodedImage {
  if (!isPng(bytes)) throw new Error("not a png")
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)

  let width = 0
  let height = 0
  let bitDepth = 0
  let colorType = -1
  let interlace = 0
  let palette: Uint8Array | null = null
  let paletteAlpha: Uint8Array | null = null
  const idatParts: Uint8Array[] = []

  let offset = 8
  while (offset + 8 <= bytes.length) {
    const length = view.getUint32(offset)
    const type = String.fromCharCode(
      bytes[offset + 4],
      bytes[offset + 5],
      bytes[offset + 6],
      bytes[offset + 7],
    )
    const dataStart = offset + 8
    if (type === "IHDR") {
      width = view.getUint32(dataStart)
      height = view.getUint32(dataStart + 4)
      bitDepth = bytes[dataStart + 8]
      colorType = bytes[dataStart + 9]
      interlace = bytes[dataStart + 12]
    } else if (type === "PLTE") {
      palette = bytes.subarray(dataStart, dataStart + length)
    } else if (type === "tRNS") {
      paletteAlpha = bytes.subarray(dataStart, dataStart + length)
    } else if (type === "IDAT") {
      idatParts.push(bytes.subarray(dataStart, dataStart + length))
    } else if (type === "IEND") {
      break
    }
    offset = dataStart + length + 4 // skip CRC
  }

  if (width <= 0 || height <= 0) throw new Error("png: bad dimensions")
  if (width * height > 4_000_000) throw new Error("png: too large")
  if (bitDepth !== 8) throw new Error(`png: unsupported bit depth ${bitDepth}`)
  if (interlace !== 0) throw new Error("png: interlaced not supported")
  const channels = CHANNELS[colorType]
  if (!channels) throw new Error(`png: unsupported color type ${colorType}`)
  if (colorType === 3 && !palette) throw new Error("png: missing PLTE")
  if (idatParts.length === 0) throw new Error("png: no IDAT")

  const compressed = Buffer.concat(idatParts.map((p) => Buffer.from(p)))
  const raw = inflateSync(compressed)

  const stride = width * channels
  const expected = (stride + 1) * height
  if (raw.length < expected) throw new Error("png: truncated data")

  // Unfilter scanlines in place into `data`.
  const data = new Uint8Array(stride * height)
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)]
    const rowIn = y * (stride + 1) + 1
    const rowOut = y * stride
    for (let x = 0; x < stride; x++) {
      const rawByte = raw[rowIn + x]
      const left = x >= channels ? data[rowOut + x - channels] : 0
      const up = y > 0 ? data[rowOut - stride + x] : 0
      const upLeft = y > 0 && x >= channels ? data[rowOut - stride + x - channels] : 0
      let value: number
      switch (filter) {
        case 0:
          value = rawByte
          break
        case 1:
          value = rawByte + left
          break
        case 2:
          value = rawByte + up
          break
        case 3:
          value = rawByte + ((left + up) >> 1)
          break
        case 4:
          value = rawByte + paeth(left, up, upLeft)
          break
        default:
          throw new Error(`png: unknown filter ${filter}`)
      }
      data[rowOut + x] = value & 0xff
    }
  }

  // Expand to RGBA.
  const pixels = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < width * height; i++) {
    const src = i * channels
    const dst = i * 4
    switch (colorType) {
      case 0: // grayscale
        pixels[dst] = pixels[dst + 1] = pixels[dst + 2] = data[src]
        pixels[dst + 3] = 255
        break
      case 2: // RGB
        pixels[dst] = data[src]
        pixels[dst + 1] = data[src + 1]
        pixels[dst + 2] = data[src + 2]
        pixels[dst + 3] = 255
        break
      case 3: {
        // palette
        const idx = data[src] * 3
        pixels[dst] = palette![idx]
        pixels[dst + 1] = palette![idx + 1]
        pixels[dst + 2] = palette![idx + 2]
        pixels[dst + 3] = paletteAlpha && data[src] < paletteAlpha.length ? paletteAlpha[data[src]] : 255
        break
      }
      case 4: // gray + alpha
        pixels[dst] = pixels[dst + 1] = pixels[dst + 2] = data[src]
        pixels[dst + 3] = data[src + 1]
        break
      case 6: // RGBA
        pixels[dst] = data[src]
        pixels[dst + 1] = data[src + 1]
        pixels[dst + 2] = data[src + 2]
        pixels[dst + 3] = data[src + 3]
        break
    }
  }

  return { width, height, pixels }
}
