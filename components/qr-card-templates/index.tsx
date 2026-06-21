import React from "react"
import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer"

Font.register({
  family: "Almarai",
  fonts: [
    { src: "/fonts/AR/Almarai/Almarai-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/AR/Almarai/Almarai-Bold.ttf", fontWeight: 700 },
    { src: "/fonts/AR/Almarai/Almarai-ExtraBold.ttf", fontWeight: 800 },
  ],
})

export interface RestaurantInfo {
  id: string
  name: string
  logo_url: string | null
}

export interface QrCardTemplateOptions {
  customText: string
  cardBgColor: string
  textColor: string
  qrCodeSize: number
  showBorder: boolean
  borderColor: string
  logoPosition: "none" | "top" | "middle" | "both"
  fontFamily?: string
}

export interface QrCardTemplateProps {
  restaurant: RestaurantInfo
  qrCodeDataUrl: string
  qrCodeUrl: string
  options: QrCardTemplateOptions
}

type TemplateKind = "classic" | "modern" | "elegant" | "minimal" | "playful" | "vintage"

const styles = StyleSheet.create({
  page: {
    position: "relative",
    padding: 28,
    fontFamily: "Almarai",
    textAlign: "center",
  },
  frame: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
    borderRadius: 18,
  },
  logo: {
    width: 62,
    height: 62,
    objectFit: "contain",
    marginBottom: 14,
  },
  monogram: {
    width: 58,
    height: 58,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  monogramText: {
    fontSize: 25,
    fontWeight: 800,
  },
  eyebrow: {
    fontSize: 8,
    letterSpacing: 2.4,
    marginBottom: 8,
  },
  title: {
    fontSize: 21,
    fontWeight: 800,
    lineHeight: 1.25,
    marginBottom: 8,
  },
  divider: {
    width: 42,
    height: 2,
    marginBottom: 18,
  },
  qrWrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    padding: 11,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  qr: {
    objectFit: "contain",
  },
  centerLogoWrap: {
    position: "absolute",
    left: "42%",
    top: "42%",
    width: "16%",
    height: "16%",
    padding: 3,
    borderRadius: 7,
    backgroundColor: "#FFFFFF",
  },
  centerLogo: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  message: {
    maxWidth: 210,
    marginTop: 18,
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1.55,
  },
  footer: {
    position: "absolute",
    bottom: 16,
    left: 28,
    right: 28,
    fontSize: 7,
    letterSpacing: 1.6,
    opacity: 0.55,
  },
  corner: {
    position: "absolute",
    width: 28,
    height: 28,
  },
})

function QrMark({
  restaurant,
  qrCodeDataUrl,
  options,
  paper,
}: QrCardTemplateProps & { paper: string }) {
  const qrSize = Math.max(112, Math.min(178, options.qrCodeSize * 0.72))
  const centerLogo =
    (options.logoPosition === "middle" || options.logoPosition === "both") &&
    restaurant.logo_url

  return (
    <View style={[styles.qrWrap, { backgroundColor: paper }]}>
      <Image src={qrCodeDataUrl} style={[styles.qr, { width: qrSize, height: qrSize }]} />
      {centerLogo ? (
        <View style={styles.centerLogoWrap}>
          <Image src={restaurant.logo_url!} style={styles.centerLogo} />
        </View>
      ) : null}
    </View>
  )
}

function BrandMark({
  restaurant,
  options,
  accent,
}: Pick<QrCardTemplateProps, "restaurant" | "options"> & { accent: string }) {
  if (options.logoPosition !== "top" && options.logoPosition !== "both") return null

  return restaurant.logo_url ? (
    <Image src={restaurant.logo_url} style={styles.logo} />
  ) : (
    <View style={[styles.monogram, { border: `1px solid ${accent}` }]}>
      <Text style={[styles.monogramText, { color: accent }]}>
        {restaurant.name.trim().slice(0, 1)}
      </Text>
    </View>
  )
}

function CardDocument(props: QrCardTemplateProps & { kind: TemplateKind }) {
  const { restaurant, options, kind } = props
  const isDark = kind === "modern" || kind === "elegant" || kind === "playful"
  const accent = options.borderColor
  const paper = isDark ? "#FFFFFF" : "#FFFDF9"
  const frameStyle = {
    backgroundColor: options.cardBgColor,
    color: options.textColor,
    border: options.showBorder ? `1.5px solid ${options.borderColor}` : undefined,
  }

  return (
    <Document
      title={`${restaurant.name} QR Card`}
      author="Menu-P"
      subject="Digital menu QR card"
    >
      <Page size="A6" style={[styles.page, { backgroundColor: isDark ? "#F1EEE9" : "#FFFFFF" }]}>
        <View style={[styles.frame, frameStyle]}>
          {kind === "elegant" ? (
            <>
              <View
                style={[
                  styles.corner,
                  { top: 14, right: 14, borderTop: `1px solid ${accent}`, borderRight: `1px solid ${accent}` },
                ]}
              />
              <View
                style={[
                  styles.corner,
                  { bottom: 14, left: 14, borderBottom: `1px solid ${accent}`, borderLeft: `1px solid ${accent}` },
                ]}
              />
            </>
          ) : null}

          <BrandMark restaurant={restaurant} options={options} accent={accent} />

          <Text style={[styles.eyebrow, { color: kind === "minimal" ? accent : options.textColor }]}>
            {kind === "playful" ? "ORDER • SCAN • ENJOY" : "DIGITAL MENU"}
          </Text>
          <Text style={[styles.title, { color: options.textColor }]}>{restaurant.name}</Text>
          <View style={[styles.divider, { backgroundColor: accent }]} />

          <QrMark {...props} paper={paper} />

          <Text style={[styles.message, { color: options.textColor }]}>{options.customText}</Text>
          <Text style={[styles.footer, { color: options.textColor }]}>POWERED BY MENU-P</Text>
        </View>
      </Page>
    </Document>
  )
}

export function ClassicTemplate(props: QrCardTemplateProps) {
  return <CardDocument {...props} kind="classic" />
}

export function ModernTemplate(props: QrCardTemplateProps) {
  return <CardDocument {...props} kind="modern" />
}

export function ElegantTemplate(props: QrCardTemplateProps) {
  return <CardDocument {...props} kind="elegant" />
}

export function MinimalTemplate(props: QrCardTemplateProps) {
  return <CardDocument {...props} kind="minimal" />
}

export function PlayfulTemplate(props: QrCardTemplateProps) {
  return <CardDocument {...props} kind="playful" />
}

export function VintageTemplate(props: QrCardTemplateProps) {
  return <CardDocument {...props} kind="vintage" />
}

export const qrCardTemplates = [
  { id: "classic", name: "كلاسيك", Component: ClassicTemplate },
  { id: "modern", name: "مودرن", Component: ModernTemplate },
  { id: "elegant", name: "أنيق", Component: ElegantTemplate },
  { id: "minimal", name: "بسيط", Component: MinimalTemplate },
  { id: "playful", name: "طاولات", Component: PlayfulTemplate },
  { id: "vintage", name: "تراثي", Component: VintageTemplate },
] as const

export type QrCardTemplateId = (typeof qrCardTemplates)[number]["id"]
