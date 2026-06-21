"use client"

/**
 * Free-form banner canvas. Renders each element with the shared
 * geometry/visual styles (so it matches the export 1:1) and layers selection
 * chrome on top: drag the body to move, corner handles to resize, the top
 * handle to rotate. All math is in canvas-percentage space, so it is
 * resolution independent.
 */

import { useCallback, useEffect, useRef, type CSSProperties, type PointerEvent as RPointerEvent } from "react"
import { backgroundStyle, geometryStyle, innerHtml, visualStyle } from "@/lib/banners/render"
import { BANNER_SIZES, type BannerDoc, type BannerElement } from "@/lib/banners/types"

type Handle = "nw" | "ne" | "sw" | "se" | "rotate"

interface Interaction {
  mode: "move" | "resize" | "rotate"
  id: string
  handle?: Handle
  startXpct: number
  startYpct: number
  el: BannerElement
  centerPx: { x: number; y: number }
}

export interface BannerCanvasProps {
  doc: BannerDoc
  selectedId: string | null
  onSelect: (id: string | null) => void
  onChange: (id: string, patch: Partial<BannerElement>) => void
  /** called when a drag/resize/rotate gesture ends (for history/save) */
  onCommit?: () => void
}

export default function BannerCanvas({ doc, selectedId, onSelect, onChange, onCommit }: BannerCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const interaction = useRef<Interaction | null>(null)
  const { width, height } = BANNER_SIZES[doc.size] ?? BANNER_SIZES["screen-16x9"]

  const pointerToPct = useCallback((clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0 || rect.height === 0) return { x: 0, y: 0 }
    return { x: ((clientX - rect.left) / rect.width) * 100, y: ((clientY - rect.top) / rect.height) * 100 }
  }, [])

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      const it = interaction.current
      if (!it) return
      const p = pointerToPct(e.clientX, e.clientY)
      const dx = p.x - it.startXpct
      const dy = p.y - it.startYpct

      if (it.mode === "move") {
        onChange(it.id, { x: it.el.x + dx, y: it.el.y + dy })
        return
      }
      if (it.mode === "resize") {
        let { x, y, w, h } = it.el
        const minW = 3
        const minH = 3
        switch (it.handle) {
          case "se":
            w = it.el.w + dx
            h = it.el.h + dy
            break
          case "sw":
            x = it.el.x + dx
            w = it.el.w - dx
            h = it.el.h + dy
            break
          case "ne":
            y = it.el.y + dy
            w = it.el.w + dx
            h = it.el.h - dy
            break
          case "nw":
            x = it.el.x + dx
            y = it.el.y + dy
            w = it.el.w - dx
            h = it.el.h - dy
            break
        }
        if (w < minW) {
          if (it.handle === "sw" || it.handle === "nw") x = it.el.x + it.el.w - minW
          w = minW
        }
        if (h < minH) {
          if (it.handle === "nw" || it.handle === "ne") y = it.el.y + it.el.h - minH
          h = minH
        }
        onChange(it.id, { x, y, w, h })
        return
      }
      if (it.mode === "rotate") {
        const angle = (Math.atan2(e.clientY - it.centerPx.y, e.clientX - it.centerPx.x) * 180) / Math.PI + 90
        onChange(it.id, { rotation: Math.round(angle) })
      }
    },
    [onChange, pointerToPct]
  )

  const endInteraction = useCallback(() => {
    if (interaction.current) {
      interaction.current = null
      onCommit?.()
    }
  }, [onCommit])

  useEffect(() => {
    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerup", endInteraction)
    return () => {
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", endInteraction)
    }
  }, [onPointerMove, endInteraction])

  const beginMove = (e: RPointerEvent, el: BannerElement) => {
    if (el.locked) return
    e.stopPropagation()
    onSelect(el.id)
    const p = pointerToPct(e.clientX, e.clientY)
    interaction.current = { mode: "move", id: el.id, startXpct: p.x, startYpct: p.y, el, centerPx: { x: 0, y: 0 } }
  }

  const beginResize = (e: RPointerEvent, el: BannerElement, handle: Handle) => {
    e.stopPropagation()
    const p = pointerToPct(e.clientX, e.clientY)
    interaction.current = { mode: "resize", id: el.id, handle, startXpct: p.x, startYpct: p.y, el, centerPx: { x: 0, y: 0 } }
  }

  const beginRotate = (e: RPointerEvent, el: BannerElement) => {
    e.stopPropagation()
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const centerPx = {
      x: rect.left + ((el.x + el.w / 2) / 100) * rect.width,
      y: rect.top + ((el.y + el.h / 2) / 100) * rect.height,
    }
    const p = pointerToPct(e.clientX, e.clientY)
    interaction.current = { mode: "rotate", id: el.id, startXpct: p.x, startYpct: p.y, el, centerPx }
  }

  const elements = [...(doc.elements ?? [])].sort((a, b) => (a.z ?? 0) - (b.z ?? 0))

  return (
    <div
      ref={canvasRef}
      dir="rtl"
      onPointerDown={() => onSelect(null)}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: `${width} / ${height}`,
        containerType: "size",
        overflow: "hidden",
        borderRadius: 12,
        userSelect: "none",
        touchAction: "none",
        ...(backgroundStyle(doc.background) as CSSProperties),
      }}
    >
      {elements.map((el) => {
        const selected = el.id === selectedId
        return (
          <div key={el.id} style={geometryStyle(el) as CSSProperties}>
            {/* content — exact WYSIWYG */}
            <div
              onPointerDown={(e) => beginMove(e, el)}
              style={{ ...(visualStyle(el) as CSSProperties), cursor: el.locked ? "default" : "move" }}
              dangerouslySetInnerHTML={{ __html: innerHtml(el) }}
            />
            {/* selection chrome */}
            {selected && (
              <>
                <div
                  style={{
                    position: "absolute",
                    inset: -2,
                    border: "2px solid #6366f1",
                    borderRadius: 4,
                    pointerEvents: "none",
                  }}
                />
                {(["nw", "ne", "sw", "se"] as Handle[]).map((h) => (
                  <div
                    key={h}
                    onPointerDown={(e) => beginResize(e, el, h)}
                    style={{
                      position: "absolute",
                      width: 14,
                      height: 14,
                      background: "#fff",
                      border: "2px solid #6366f1",
                      borderRadius: 3,
                      top: h[0] === "n" ? -7 : undefined,
                      bottom: h[0] === "s" ? -7 : undefined,
                      left: h[1] === "w" ? -7 : undefined,
                      right: h[1] === "e" ? -7 : undefined,
                      cursor: h === "nw" || h === "se" ? "nwse-resize" : "nesw-resize",
                    }}
                  />
                ))}
                <div
                  onPointerDown={(e) => beginRotate(e, el)}
                  style={{
                    position: "absolute",
                    width: 16,
                    height: 16,
                    background: "#6366f1",
                    border: "2px solid #fff",
                    borderRadius: "50%",
                    left: "50%",
                    top: -34,
                    transform: "translateX(-50%)",
                    cursor: "grab",
                  }}
                />
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
