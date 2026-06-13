"use client"

/**
 * Language chip + minimal typographic language splash.
 *
 * First visit with multiple versions → full-screen splash ("العربية / English").
 * The choice is remembered in localStorage; explicit ?lang= URLs always win
 * and refresh the stored preference. Renders nothing for single-language menus.
 */

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { LANG_STORAGE_KEY, isRtl, type MenuStrings } from "./i18n"

export interface LanguageOption {
  code: string
  label: string
  href: string
}

interface LanguageControlProps {
  options: LanguageOption[]
  current: string
  /** True when the URL carried an explicit ?lang= (no splash, persist it). */
  hasExplicitLang: boolean
  restaurantName: string
  logoUrl: string | null
  strings: MenuStrings
  /** Preview/testing: open the splash immediately. */
  forceSplash?: boolean
}

function readStored(): string | null {
  try {
    return window.localStorage.getItem(LANG_STORAGE_KEY)
  } catch {
    return null
  }
}

function persist(code: string): void {
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, code)
  } catch {
    /* private mode — preference just won't stick */
  }
}

export default function LanguageControl({
  options,
  current,
  hasExplicitLang,
  restaurantName,
  logoUrl,
  strings,
  forceSplash = false,
}: LanguageControlProps) {
  const [open, setOpen] = useState(false)
  const multiple = options.length > 1

  useEffect(() => {
    if (!multiple) return
    if (forceSplash) {
      setOpen(true)
      return
    }
    if (hasExplicitLang) {
      persist(current)
      return
    }
    const stored = readStored()
    if (!stored) {
      setOpen(true)
      return
    }
    if (stored !== current) {
      const target = options.find((o) => o.code === stored)
      if (target) window.location.replace(target.href)
    }
  }, [multiple, forceSplash, hasExplicitLang, current, options])

  if (!multiple) return null

  const select = (option: LanguageOption) => {
    persist(option.code)
    if (option.code === current) {
      setOpen(false)
    } else {
      window.location.href = option.href
    }
  }

  const currentLabel = options.find((o) => o.code === current)?.label ?? current.toUpperCase()
  const initial = restaurantName.trim().charAt(0) || "م"
  const dir = isRtl(current) ? "rtl" : "ltr"

  return (
    <>
      <button
        type="button"
        className="pm-action"
        onClick={() => setOpen(true)}
        aria-label={strings.changeLanguage}
        aria-haspopup="dialog"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M3.6 9h16.8M3.6 15h16.8M12 3a17 17 0 010 18M12 3a17 17 0 000 18" />
        </svg>
        {currentLabel}
      </button>

      {/* Portal: the sticky header's backdrop-filter would otherwise become
          the containing block for this fixed overlay and pin it to the top.
          `pm-root` is repeated so the theme variables + font follow it out. */}
      {open &&
        createPortal(
          <div
            className="pm-root pm-langpick"
            dir={dir}
            role="dialog"
            aria-modal="true"
            aria-label={strings.chooseLanguage}
          >
            <div className="pm-langpick-card">
              {logoUrl ? (
                <img className="pm-logo" src={logoUrl} alt={restaurantName} width={64} height={64} />
              ) : (
                <div className="pm-logo-mono" aria-hidden="true">
                  {initial}
                </div>
              )}
              <h2>{restaurantName}</h2>
              <p>{strings.chooseLanguageHint}</p>
              <div className="pm-langs">
                {options.map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    className="pm-lang"
                    data-current={option.code === current}
                    lang={option.code}
                    onClick={() => select(option)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
