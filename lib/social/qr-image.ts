/**
 * QR PNG generation for social posts — platforms pull media from public
 * URLs, so the menu QR is rendered server-side (qrcode package, 1080px,
 * brand rose) and stored in menu-images/social/{restaurantId}/.
 * Deterministic path + upsert ⇒ repeat posts reuse the same object.
 */

import { toBuffer } from "qrcode"

const BUCKET = "menu-images"

/** Structural storage client (same pattern as lib/posters/renderer.ts). */
export interface QrStoreClient {
  storage: {
    from(bucket: string): {
      upload(
        path: string,
        body: Buffer,
        options?: { contentType?: string; upsert?: boolean }
      ): Promise<{ error: { message: string } | null }>
      getPublicUrl(path: string): { data: { publicUrl: string } }
    }
  }
}

export async function renderQrPng(link: string): Promise<Buffer> {
  return toBuffer(link, {
    type: "png",
    width: 1080,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#9f1239", light: "#ffffff" },
  })
}

/** Renders + stores the QR for a menu link, returns its public URL. */
export async function ensureMenuQrImage(
  client: QrStoreClient,
  restaurantId: string,
  menuId: string,
  link: string
): Promise<string> {
  const png = await renderQrPng(link)
  const path = `social/${restaurantId}/qr-${menuId}.png`
  const bucket = client.storage.from(BUCKET)
  const { error } = await bucket.upload(path, png, { contentType: "image/png", upsert: true })
  if (error) throw new Error(`QR upload failed: ${error.message}`)
  return bucket.getPublicUrl(path).data.publicUrl
}
