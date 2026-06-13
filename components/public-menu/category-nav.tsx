"use client"

/**
 * Horizontally scrollable category pill bar with scroll-spy:
 * the pill of the section currently in view is highlighted, and tapping a
 * pill smooth-scrolls to its section.
 */

import { useEffect, useRef, useState } from "react"

export interface NavCategory {
  id: string
  name: string
}

export default function CategoryNav({ categories }: { categories: NavCategory[] }) {
  const [active, setActive] = useState<string>(categories[0]?.id ?? "")
  const navRef = useRef<HTMLElement | null>(null)
  // While a tap-triggered smooth scroll is in flight, ignore observer noise.
  const lockUntil = useRef(0)

  useEffect(() => {
    const sections = categories
      .map((c) => document.getElementById(`pm-cat-${c.id}`))
      .filter((el): el is HTMLElement => Boolean(el))
    if (sections.length === 0) return

    const visible = new Map<string, number>()
    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < lockUntil.current) return
        for (const entry of entries) {
          const id = entry.target.id.replace("pm-cat-", "")
          if (entry.isIntersecting) visible.set(id, entry.intersectionRatio)
          else visible.delete(id)
        }
        if (visible.size > 0) {
          // Highest section in document order wins (stable while scrolling).
          const first = categories.find((c) => visible.has(c.id))
          if (first) setActive(first.id)
        }
      },
      { rootMargin: "-96px 0px -55% 0px", threshold: [0, 0.05, 0.5] },
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [categories])

  // Keep the active pill visible inside the scrollable bar.
  useEffect(() => {
    const pill = navRef.current?.querySelector<HTMLElement>(`[data-cat="${active}"]`)
    pill?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
  }, [active])

  const goTo = (id: string) => {
    setActive(id)
    lockUntil.current = Date.now() + 900
    document.getElementById(`pm-cat-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  if (categories.length === 0) return null

  return (
    <nav className="pm-nav" ref={navRef} aria-label="categories">
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          className="pm-pill"
          data-cat={cat.id}
          data-active={active === cat.id}
          onClick={() => goTo(cat.id)}
        >
          {cat.name}
        </button>
      ))}
    </nav>
  )
}
