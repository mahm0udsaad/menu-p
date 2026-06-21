/**
 * Minimal typings for the `qrcode` package. It is used in both browser
 * previews (`toDataURL`) and server-side social assets (`toBuffer`).
 */
declare module "qrcode" {
  export interface QRCodeOptions {
    type?: "png"
    width?: number
    margin?: number
    errorCorrectionLevel?: "L" | "M" | "Q" | "H"
    color?: { dark?: string; light?: string }
  }

  export function toBuffer(text: string, options?: QRCodeOptions): Promise<Buffer>
  export function toDataURL(text: string, options?: QRCodeOptions): Promise<string>

  const QRCode: {
    toBuffer: typeof toBuffer
    toDataURL: typeof toDataURL
  }
  export default QRCode
}
