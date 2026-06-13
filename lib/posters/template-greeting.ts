/**
 * Greeting-mode poster bodies (Phase 4): greeting-centered (bold, modern) and
 * greeting-elegant (Amiri serif, double frame). No products — occasion +
 * message + restaurant branding only. All text escaped, composited over art.
 */

import { escapeHtml, type GreetingPayload, type PosterSize } from "./poster-utils"

export function greetingCenteredBody(payload: GreetingPayload, size: PosterSize): string {
  return `
  <section class="greeting greeting-centered ${size === "story" ? "story" : "square"}">
    <div class="ornament">✦ ✦ ✦</div>
    <h1 class="occasion">${escapeHtml(payload.occasion.trim())}</h1>
    <div class="divider"></div>
    <p class="message">${escapeHtml(payload.message.trim())}</p>
    <div class="ornament">✦ ✦ ✦</div>
  </section>`
}

export function greetingElegantBody(payload: GreetingPayload, size: PosterSize): string {
  return `
  <section class="greeting greeting-elegant ${size === "story" ? "story" : "square"}">
    <div class="frame">
      <div class="frame-inner">
        <div class="corner tl"></div><div class="corner tr"></div>
        <div class="corner bl"></div><div class="corner br"></div>
        <p class="eyebrow">بكل الحب نهنئكم بمناسبة</p>
        <h1 class="occasion elegant">${escapeHtml(payload.occasion.trim())}</h1>
        <div class="divider gold"></div>
        <p class="message elegant">${escapeHtml(payload.message.trim())}</p>
      </div>
    </div>
  </section>`
}

export const GREETING_CSS = `
  .greeting {
    position: relative; flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center; text-align: center;
    padding: 40px 80px; gap: 34px;
  }
  .occasion {
    font-weight: 900; font-size: 110px; line-height: 1.25; color: #fff; margin: 0;
    text-shadow: 0 6px 24px rgba(0,0,0,.6); max-width: 920px;
  }
  .greeting.story .occasion { font-size: 124px; }
  .message {
    font-weight: 600; font-size: 46px; line-height: 1.7; color: rgba(255,255,255,.96);
    margin: 0; max-width: 860px; text-shadow: 0 3px 12px rgba(0,0,0,.55);
  }
  .greeting.story .message { font-size: 52px; }
  .divider {
    width: 280px; height: 6px; border-radius: 3px;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
  }
  .ornament { color: var(--accent); font-size: 40px; letter-spacing: 18px; text-shadow: 0 2px 10px rgba(0,0,0,.5); }

  .greeting-elegant { padding: 56px; }
  .frame {
    flex: 1; width: 100%; border: 3px solid var(--accent); border-radius: 8px;
    padding: 18px; display: flex; background: rgba(10, 5, 8, .28);
  }
  .frame-inner {
    position: relative; flex: 1; border: 1.5px solid var(--accent);
    border-radius: 4px; display: flex; flex-direction: column; align-items: center;
    justify-content: center; text-align: center; padding: 40px 60px; gap: 30px;
  }
  .corner { position: absolute; width: 56px; height: 56px; border: 5px solid var(--accent); }
  .corner.tl { top: -6px; right: -6px; border-left: 0; border-bottom: 0; }
  .corner.tr { top: -6px; left: -6px; border-right: 0; border-bottom: 0; }
  .corner.bl { bottom: -6px; right: -6px; border-left: 0; border-top: 0; }
  .corner.br { bottom: -6px; left: -6px; border-right: 0; border-top: 0; }
  .eyebrow {
    font-family: 'Amiri', 'Cairo', serif; font-size: 40px; color: var(--accent);
    margin: 0; text-shadow: 0 2px 8px rgba(0,0,0,.5);
  }
  .occasion.elegant { font-family: 'Amiri', 'Cairo', serif; font-weight: 700; font-size: 118px; }
  .message.elegant { font-family: 'Amiri', 'Cairo', serif; font-weight: 400; font-size: 50px; line-height: 1.85; }
  .divider.gold { width: 340px; }
`
