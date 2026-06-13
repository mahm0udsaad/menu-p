/**
 * Sticky public-menu header: logo, restaurant name + menu name, PDF download
 * and the language chip (passed in as a client-component slot).
 */

import type { ReactNode } from "react"
import type { MenuStrings } from "./i18n"
import type { PublicRestaurant } from "./types"

export default function MenuHeader({
  restaurant,
  menuName,
  pdfUrl,
  strings,
  languageSlot,
}: {
  restaurant: PublicRestaurant
  menuName: string
  pdfUrl: string | null
  strings: MenuStrings
  languageSlot?: ReactNode
}) {
  const initial = restaurant.name.trim().charAt(0) || "م"
  return (
    <div className="pm-header">
      {restaurant.logo_url ? (
        <img
          className="pm-logo"
          src={restaurant.logo_url}
          alt={restaurant.name}
          width={44}
          height={44}
          decoding="async"
        />
      ) : (
        <div className="pm-logo-mono" aria-hidden="true">
          {initial}
        </div>
      )}
      <div className="pm-title">
        <h1>{restaurant.name}</h1>
        <p>{menuName || strings.menu}</p>
      </div>
      <div className="pm-actions">
        {pdfUrl && (
          <a
            className="pm-action"
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            aria-label={strings.downloadPdf}
            title={strings.downloadPdf}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5M4 19.5h16" />
            </svg>
            PDF
          </a>
        )}
        {languageSlot}
      </div>
    </div>
  )
}
