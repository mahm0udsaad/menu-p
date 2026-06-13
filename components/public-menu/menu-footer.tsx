/**
 * Public menu footer: contact deep links (tel / WhatsApp / address) and the
 * "صُنع بواسطة Menu-P" attribution line.
 */

import { whatsappHref, type MenuStrings } from "./i18n"
import type { PublicRestaurant } from "./types"

export default function MenuFooter({
  restaurant,
  strings,
}: {
  restaurant: PublicRestaurant
  strings: MenuStrings
}) {
  const wa = whatsappHref(restaurant.phone)
  return (
    <footer className="pm-footer">
      <div className="pm-footer-name">{restaurant.name}</div>
      {(restaurant.phone || wa) && (
        <div className="pm-footer-line">
          {restaurant.phone && (
            <a href={`tel:${restaurant.phone.replace(/\s+/g, "")}`}>
              ☏ <span dir="ltr">{restaurant.phone}</span>
            </a>
          )}
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          )}
        </div>
      )}
      {restaurant.address && <div className="pm-footer-line">{restaurant.address}</div>}
      <p className="pm-made">
        {strings.madeBy}{" "}
        <a href="https://menu-p.com" target="_blank" rel="noopener noreferrer">
          Menu-P
        </a>
      </p>
    </footer>
  )
}
