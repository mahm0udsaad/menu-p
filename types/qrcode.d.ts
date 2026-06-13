/**
 * Minimal typings for the `qrcode` package (server-side PNG generation in
 * lib/social/qr-image.ts). The package ships untyped; @types/qrcode is not
 * installed — same pattern as types/pdfjs-dist.d.ts.
 */
declare module "qrcode" {
  export interface QRCodeToBufferOptions {
    type?: "png"
    width?: number
    margin?: number
    errorCorrectionLevel?: "L" | "M" | "Q" | "H"
    color?: { dark?: string; light?: string }
  }
  export function toBuffer(text: string, options?: QRCodeToBufferOptions): Promise<Buffer>
  export function toDataURL(text: string, options?: Record<string, unknown>): Promise<string>
  const QRCode: { toBuffer: typeof toBuffer; toDataURL: typeof toDataURL }
  export default QRCode
}
