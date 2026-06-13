/**
 * Greeting-mode occasions (Phase 4 — Poster Studio).
 * Pure data: Arabic labels + smart default messages + English art subjects
 * for the AI background prompt (keeps generated art reusable across years).
 */

export interface PosterOccasion {
  id: string
  /** Arabic label shown on chips and rendered on the poster. */
  label: string
  /** Smart default greeting message (owner can edit). */
  defaultMessage: string
  /** English subject for the AI art prompt — NEVER rendered as text. */
  artSubjectEn: string
  /** Extra art direction appended to the prompt style. */
  artStyleEn: string
}

export const POSTER_OCCASIONS: PosterOccasion[] = [
  {
    id: "eid_fitr",
    label: "عيد الفطر",
    defaultMessage: "عيد فطر مبارك! كل عام وأنتم بخير، نتمنى لكم أياماً مليئة بالفرح والسعادة",
    artSubjectEn: "Eid al-Fitr celebration",
    artStyleEn:
      "glowing golden lanterns, crescent moon, elegant Islamic geometric ornaments, festive night sky, warm celebratory mood, no food",
  },
  {
    id: "eid_adha",
    label: "عيد الأضحى",
    defaultMessage: "عيد أضحى مبارك! تقبل الله طاعتكم وكل عام وأنتم بخير",
    artSubjectEn: "Eid al-Adha celebration",
    artStyleEn:
      "golden crescent moon, mosque silhouette, ornamental Islamic arabesque patterns, festive warm lighting, no food",
  },
  {
    id: "ramadan",
    label: "رمضان",
    defaultMessage: "رمضان كريم! أعاده الله عليكم بالخير واليمن والبركات",
    artSubjectEn: "Ramadan holy month",
    artStyleEn:
      "hanging Ramadan lanterns (fanous), crescent moon and stars, deep blue and gold night ambiance, Islamic ornaments, no food",
  },
  {
    id: "christmas",
    label: "الكريسماس",
    defaultMessage: "أعياد ميلاد مجيدة! نتمنى لكم عاماً جديداً مليئاً بالمحبة والسلام",
    artSubjectEn: "Christmas holiday celebration",
    artStyleEn: "decorated Christmas tree, warm string lights, snowflakes, cozy festive red and gold mood, no food",
  },
  {
    id: "national_day",
    label: "اليوم الوطني",
    defaultMessage: "كل عام والوطن بخير! أجمل التهاني بمناسبة اليوم الوطني",
    artSubjectEn: "National Day patriotic celebration",
    artStyleEn: "festive fireworks, celebratory confetti and ribbons, elegant patriotic atmosphere, no flags with text, no food",
  },
]

/** Find by id or by (trimmed) Arabic label; null for custom occasions. */
export function findOccasion(idOrLabel: string): PosterOccasion | null {
  const needle = idOrLabel.trim()
  return POSTER_OCCASIONS.find((o) => o.id === needle || o.label === needle) ?? null
}

/** Default message for a known occasion, or a generic blessing for custom ones. */
export function defaultGreetingMessage(occasion: string): string {
  return findOccasion(occasion)?.defaultMessage ?? `كل عام وأنتم بخير بمناسبة ${occasion.trim()}`
}
