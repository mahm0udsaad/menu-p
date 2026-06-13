/* ============================================================
   Menu-P · QR TABLE-CARD TEMPLATES
   ------------------------------------------------------------
   Reusable, fully themeable QR cards for restaurant tables (MENA).
   Each template is driven by ONE `theme` object. Every visual
   token is also written to the card root as a CSS custom property
   (--qr-*), so another agent can re-skin a rendered card purely
   from CSS, or by passing a new theme object.

   THEME SCHEMA  (all keys optional — fall back to template default)
   ----------------------------------------------------------------
   identity
     brand        string   display name (e.g. "Underground")
     brandEn      string   latin/secondary name
     logo         string   1-letter monogram OR image url (.png/.svg)
     menuUrl      string   value the QR encodes (the live menu link)
     tableNo      string   table label (Table-Tent template only)
   copy
     scanAr       string   primary call-to-action (Arabic)
     scanEn       string   secondary call-to-action (Latin)
     footer       string   small footer line
   color  ( --qr-bg --qr-ink --qr-accent --qr-surface --qr-qrfg --qr-qrbg --qr-border )
     bg, ink, accent, surface, qrFg, qrBg, borderColor
   shape  ( --qr-radius --qr-borderw )
     radius (px), border (bool), borderW (px)
   type   ( --qr-font --qr-display )
     font, fontDisplay
   qr
     logoPos      "none" | "top" | "center" | "both"
     dotStyle     "rounded" | "dots" | "square"
     qrScale      0.4 – 1   (relative QR size inside the card)

   API
     <QRCard template="classic" theme={...} width={240} />
     QR_CARD_TEMPLATES   → [{ id, name, nameEn, tagline, theme(default) }]
     qrTheme(id, overrides) → merged theme object
   ============================================================ */

/* ---------- real, scannable QR matrix (qrcode-generator) ---------- */
function buildMatrix(value, ecl = "H") {
  if (!window.qrcode) return null;
  try {
    const qr = window.qrcode(0, ecl);
    qr.addData(value || "https://menu-p.app");
    qr.make();
    const n = qr.getModuleCount();
    const m = [];
    for (let r = 0; r < n; r++) { const row = []; for (let c = 0; c < n; c++) row.push(qr.isDark(r, c)); m.push(row); }
    return { n, m };
  } catch (e) { return null; }
}

function RealQR({ value, size = 160, fg = "#111", bg = "#fff", dotStyle = "rounded", logo, logoBg, quiet = 3 }) {
  const data = React.useMemo(() => buildMatrix(value, "H"), [value]);
  if (!data) return <QRGlyph size={size} fg={fg} bg={bg} />;
  const { n, m } = data;
  const total = n + quiet * 2;
  const cell = size / total;
  const px = (i) => (quiet + i) * cell;
  const inFinder = (r, c) =>
    (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);

  const rects = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (!m[r][c] || inFinder(r, c)) continue;
    const x = px(c), y = px(r);
    if (dotStyle === "dots") rects.push(<circle key={r + "_" + c} cx={x + cell / 2} cy={y + cell / 2} r={cell * 0.42} fill={fg} />);
    else rects.push(<rect key={r + "_" + c} x={x + cell * 0.07} y={y + cell * 0.07} width={cell * 0.86} height={cell * 0.86} rx={dotStyle === "square" ? 0 : cell * 0.3} fill={fg} />);
  }

  const Eye = ({ r0, c0 }) => {
    const x = px(c0), y = px(r0), s = cell * 7;
    return (
      <g>
        <rect x={x} y={y} width={s} height={s} rx={cell * 2} fill={fg} />
        <rect x={x + cell} y={y + cell} width={cell * 5} height={cell * 5} rx={cell * 1.35} fill={bg} />
        <rect x={x + cell * 2} y={y + cell * 2} width={cell * 3} height={cell * 3} rx={cell * 0.9} fill={fg} />
      </g>
    );
  };
  const isImg = logo && /[\/.]/.test(logo);
  const logoSize = size * 0.2;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block", borderRadius: cell * 1.2 }}>
        <rect x="0" y="0" width={size} height={size} fill={bg} />
        {rects}
        <Eye r0={0} c0={0} /><Eye r0={0} c0={n - 7} /><Eye r0={n - 7} c0={0} />
      </svg>
      {logo && (logoPosShowsCenter(logo) || true) && logoBg !== "skip" && (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
          <div style={{ background: logoBg || bg, padding: logoSize * 0.16, borderRadius: logoSize * 0.28, lineHeight: 0, boxShadow: "0 1px 4px rgba(0,0,0,.12)" }}>
            {isImg
              ? <img src={logo} alt="" style={{ width: logoSize, height: logoSize, objectFit: "contain", borderRadius: logoSize * 0.2 }} />
              : <div style={{ width: logoSize, height: logoSize, borderRadius: logoSize * 0.24, background: fg, color: bg, display: "grid", placeItems: "center", fontWeight: 800, fontSize: logoSize * 0.5, fontFamily: "var(--qr-font, sans-serif)" }}>{logo}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
function logoPosShowsCenter() { return false; }

/* ---------- decorative bits (simple geometry only) ---------- */
function StarMotif({ size = 26, color = "currentColor", opacity = 1 }) {
  // 8-point star = two overlapping squares
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ opacity }}>
      <rect x="5" y="5" width="14" height="14" fill={color} />
      <rect x="5" y="5" width="14" height="14" fill={color} transform="rotate(45 12 12)" />
    </svg>
  );
}
function DiamondRule({ color = "currentColor" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", justifyContent: "center", color }}>
      <span style={{ flex: 1, height: 1, background: "currentColor", opacity: 0.35 }} />
      <span style={{ width: 6, height: 6, background: "currentColor", transform: "rotate(45deg)" }} />
      <span style={{ flex: 1, height: 1, background: "currentColor", opacity: 0.35 }} />
    </div>
  );
}

/* ---------- theme defaults per template (MENA palettes) ---------- */
const QR_BASE = {
  brand: "Underground", brandEn: "UNDERGROUND", logo: "U",
  menuUrl: "https://menu-p.app/m/underground",
  scanAr: "امسح للاطّلاع على القائمة", scanEn: "Scan to view our menu",
  footer: "MENU-P", border: true, borderW: 2, radius: 16,
  font: "'IBM Plex Sans Arabic', sans-serif", fontDisplay: "'IBM Plex Sans Arabic', sans-serif",
  logoPos: "top", dotStyle: "rounded", qrScale: 0.62,
};

const QR_CARD_TEMPLATES = [
  { id: "classic", name: "كلاسيك", nameEn: "Classic", tagline: "كريمي دافئ، أنيق وواضح",
    theme: { ...QR_BASE, bg: "#f7f0e4", ink: "#2c2118", accent: "#a06a37", surface: "#ffffff", qrFg: "#2c2118", qrBg: "#ffffff", borderColor: "#ddc9a6", borderW: 2, radius: 18, logoPos: "top" } },
  { id: "noir", name: "نوار", nameEn: "Noir", tagline: "أسود فاخر مع ذهبي",
    theme: { ...QR_BASE, bg: "#15120f", ink: "#f3ece1", accent: "#cba35d", surface: "#ffffff", qrFg: "#15120f", qrBg: "#ffffff", border: false, borderColor: "#cba35d", radius: 20, logoPos: "center", qrScale: 0.66 } },
  { id: "royal", name: "ملكي", nameEn: "Royal", tagline: "أخضر زمردي وذهب، بزخارف",
    theme: { ...QR_BASE, bg: "#143229", ink: "#efe4c9", accent: "#c9a24b", surface: "#efe4c9", qrFg: "#143229", qrBg: "#efe4c9", border: true, borderColor: "#c9a24b", borderW: 2, radius: 14, logoPos: "center", dotStyle: "dots", qrScale: 0.6 } },
  { id: "minimal", name: "مينيمال", nameEn: "Minimal", tagline: "أبيض نظيف، حد أدنى",
    theme: { ...QR_BASE, bg: "#ffffff", ink: "#1b1b1b", accent: "#b03a2e", surface: "#ffffff", qrFg: "#1b1b1b", qrBg: "#ffffff", border: true, borderColor: "#ededed", borderW: 1.5, radius: 20, logoPos: "none", dotStyle: "square", qrScale: 0.56 } },
  { id: "tent", name: "طاولة", nameEn: "Table Tent", tagline: "عنابي وذهبي + رقم الطاولة",
    theme: { ...QR_BASE, bg: "#6e2230", ink: "#f7e8d5", accent: "#e2b86c", surface: "#f7e8d5", qrFg: "#6e2230", qrBg: "#f7e8d5", border: false, borderColor: "#e2b86c", radius: 16, logoPos: "top", tableNo: "٧", scanAr: "اطلب من طاولتك", scanEn: "Order from your table", qrScale: 0.6 } },
];
const QR_TEMPLATE_MAP = Object.fromEntries(QR_CARD_TEMPLATES.map(t => [t.id, t]));
function qrTheme(id, overrides = {}) {
  const base = (QR_TEMPLATE_MAP[id] || QR_CARD_TEMPLATES[0]).theme;
  return { ...base, ...Object.fromEntries(Object.entries(overrides).filter(([, v]) => v != null && v !== "")) };
}

/* ---------- shared shell: writes every token as a CSS variable ---------- */
function cardVars(t) {
  return {
    "--qr-bg": t.bg, "--qr-ink": t.ink, "--qr-accent": t.accent, "--qr-surface": t.surface,
    "--qr-qrfg": t.qrFg, "--qr-qrbg": t.qrBg, "--qr-border": t.borderColor,
    "--qr-radius": (t.radius ?? 16) + "px", "--qr-borderw": (t.borderW ?? 2) + "px",
    "--qr-font": t.font, "--qr-display": t.fontDisplay || t.font,
  };
}
function Shell({ t, width, children, padScale = 0.085, align = "center" }) {
  const H = width * 1.414;
  return (
    <div style={{
      width, height: H, background: "var(--qr-bg)", color: "var(--qr-ink)",
      borderRadius: "var(--qr-radius)", fontFamily: "var(--qr-font)",
      border: t.border ? "var(--qr-borderw) solid var(--qr-border)" : "none",
      position: "relative", overflow: "hidden", boxShadow: "var(--sh-md)",
      display: "flex", flexDirection: "column", alignItems: align === "center" ? "center" : "stretch",
      padding: width * padScale, boxSizing: "border-box", ...cardVars(t),
    }}>{children}</div>
  );
}
function Monogram({ t, s, ring }) {
  const isImg = t.logo && /[\/.]/.test(t.logo);
  return (
    <div style={{ width: s, height: s, borderRadius: s * 0.28, background: ring ? "transparent" : "var(--qr-accent)",
      border: ring ? `2px solid var(--qr-accent)` : "none", color: ring ? "var(--qr-accent)" : "var(--qr-bg)",
      display: "grid", placeItems: "center", fontWeight: 800, fontSize: s * 0.46, flexShrink: 0, overflow: "hidden" }}>
      {isImg ? <img src={t.logo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (t.logo || "U")}
    </div>
  );
}
const qrPx = (t, w) => w * (t.qrScale ?? 0.62);

/* ============ TEMPLATE 1 · CLASSIC ============ */
function ClassicCard({ t, width }) {
  const qp = qrPx(t, width);
  return (
    <Shell t={t} width={width}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: width * 0.025, marginTop: width * 0.02 }}>
        {(t.logoPos === "top" || t.logoPos === "both") && <Monogram t={t} s={width * 0.2} ring />}
        <div style={{ fontFamily: "var(--qr-display)", fontWeight: 800, fontSize: width * 0.105, letterSpacing: "-0.01em" }}>{t.brand}</div>
        <div className="ltr" style={{ fontSize: width * 0.04, letterSpacing: "0.32em", color: "var(--qr-accent)", fontWeight: 600 }}>{t.brandEn}</div>
      </div>
      <div style={{ width: "62%", margin: `${width * 0.05}px 0` }}><DiamondRule color="var(--qr-accent)" /></div>
      <div style={{ background: "var(--qr-surface)", padding: width * 0.05, borderRadius: width * 0.05, boxShadow: "0 6px 18px rgba(0,0,0,.08)" }}>
        <RealQR value={t.menuUrl} size={qp} fg={t.qrFg} bg={t.qrBg} dotStyle={t.dotStyle}
          logo={(t.logoPos === "center" || t.logoPos === "both") ? t.logo : null} />
      </div>
      <div style={{ textAlign: "center", marginTop: width * 0.05 }}>
        <div style={{ fontWeight: 700, fontSize: width * 0.052 }}>{t.scanAr}</div>
        <div className="ltr" style={{ fontSize: width * 0.04, opacity: 0.6, marginTop: 2 }}>{t.scanEn}</div>
      </div>
      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 6, color: "var(--qr-accent)", opacity: 0.7 }}>
        <span style={{ width: 4, height: 4, background: "currentColor", transform: "rotate(45deg)" }} />
        <span className="ltr" style={{ fontSize: width * 0.034, letterSpacing: "0.2em", fontWeight: 600 }}>{t.footer}</span>
        <span style={{ width: 4, height: 4, background: "currentColor", transform: "rotate(45deg)" }} />
      </div>
    </Shell>
  );
}

/* ============ TEMPLATE 2 · NOIR ============ */
function NoirCard({ t, width }) {
  const qp = qrPx(t, width);
  return (
    <Shell t={t} width={width} align="stretch">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: "var(--qr-display)", fontWeight: 800, fontSize: width * 0.105, lineHeight: 1 }}>{t.brand}</div>
          <div style={{ width: width * 0.18, height: 3, background: "var(--qr-accent)", marginTop: width * 0.025, borderRadius: 2 }} />
        </div>
        <div className="ltr" style={{ fontSize: width * 0.038, letterSpacing: "0.3em", color: "var(--qr-accent)", fontWeight: 600, marginTop: 4 }}>MENU</div>
      </div>
      <div style={{ flex: 1, display: "grid", placeItems: "center" }}>
        <div style={{ background: "var(--qr-surface)", padding: width * 0.055, borderRadius: width * 0.06 }}>
          <RealQR value={t.menuUrl} size={qp} fg={t.qrFg} bg={t.qrBg} dotStyle={t.dotStyle}
            logo={(t.logoPos === "center" || t.logoPos === "both") ? t.logo : null} />
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontWeight: 700, fontSize: width * 0.055 }}>{t.scanAr}</div>
        <div className="ltr" style={{ fontSize: width * 0.04, color: "var(--qr-accent)", marginTop: 3, letterSpacing: "0.04em" }}>{t.scanEn}</div>
      </div>
      <div style={{ marginTop: width * 0.05, paddingTop: width * 0.035, borderTop: "1px solid rgba(255,255,255,.12)", display: "flex", justifyContent: "space-between", alignItems: "center", opacity: 0.65 }}>
        <span className="ltr" style={{ fontSize: width * 0.034, letterSpacing: "0.24em", fontWeight: 600 }}>{t.brandEn}</span>
        <span className="ltr" style={{ fontSize: width * 0.034, letterSpacing: "0.2em" }}>{t.footer}</span>
      </div>
    </Shell>
  );
}

/* ============ TEMPLATE 3 · ROYAL ============ */
function RoyalCard({ t, width }) {
  const qp = qrPx(t, width);
  const Corner = ({ style }) => <div style={{ position: "absolute", color: "var(--qr-accent)", ...style }}><StarMotif size={width * 0.085} color="var(--qr-accent)" opacity={0.9} /></div>;
  return (
    <Shell t={t} width={width}>
      <Corner style={{ top: width * 0.04, insetInlineStart: width * 0.04 }} />
      <Corner style={{ top: width * 0.04, insetInlineEnd: width * 0.04 }} />
      <Corner style={{ bottom: width * 0.04, insetInlineStart: width * 0.04 }} />
      <Corner style={{ bottom: width * 0.04, insetInlineEnd: width * 0.04 }} />
      <div style={{ position: "absolute", inset: width * 0.03, border: "1px solid var(--qr-accent)", borderRadius: width * 0.04, opacity: 0.5, pointerEvents: "none" }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: width * 0.02, marginTop: width * 0.06 }}>
        <div style={{ fontFamily: "var(--qr-display)", fontWeight: 800, fontSize: width * 0.1, letterSpacing: "0.02em" }}>{t.brand}</div>
        <div className="ltr" style={{ fontSize: width * 0.036, letterSpacing: "0.35em", color: "var(--qr-accent)", fontWeight: 600 }}>{t.brandEn}</div>
      </div>
      <div style={{ width: "50%", margin: `${width * 0.038}px 0` }}><DiamondRule color="var(--qr-accent)" /></div>
      <div style={{ background: "var(--qr-surface)", padding: width * 0.04, borderRadius: width * 0.04, border: "2px solid var(--qr-accent)" }}>
        <RealQR value={t.menuUrl} size={width * 0.55} fg={t.qrFg} bg={t.qrBg} dotStyle={t.dotStyle}
          logo={(t.logoPos === "center" || t.logoPos === "both") ? t.logo : null} logoBg={t.surface} />
      </div>
      <div style={{ textAlign: "center", marginTop: width * 0.04, display: "flex", flexDirection: "column", gap: width * 0.012 }}>
        <div style={{ fontWeight: 700, fontSize: width * 0.046, lineHeight: 1.3 }}>{t.scanAr}</div>
        <div className="ltr" style={{ fontSize: width * 0.036, opacity: 0.7, letterSpacing: "0.06em" }}>{t.scanEn}</div>
      </div>
    </Shell>
  );
}

/* ============ TEMPLATE 4 · MINIMAL ============ */
function MinimalCard({ t, width }) {
  const qp = qrPx(t, width);
  return (
    <Shell t={t} width={width} align="stretch" padScale={0.1}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="ltr" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: width * 0.036, letterSpacing: "0.18em", color: "var(--qr-accent)", fontWeight: 600 }}>MENU / القائمة</span>
        <span style={{ width: width * 0.045, height: width * 0.045, borderRadius: "50%", background: "var(--qr-accent)" }} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: width * 0.07 }}>
        <div style={{ fontWeight: 800, fontSize: width * 0.1, letterSpacing: "-0.01em" }}>{t.brand}</div>
        <RealQR value={t.menuUrl} size={qp} fg={t.qrFg} bg={t.qrBg} dotStyle={t.dotStyle}
          logo={(t.logoPos === "center" || t.logoPos === "both") ? t.logo : null} />
        <div style={{ fontWeight: 600, fontSize: width * 0.05 }}>{t.scanAr}</div>
      </div>
      <div className="ltr" style={{ display: "flex", justifyContent: "space-between", fontSize: width * 0.034, fontFamily: "'IBM Plex Mono', monospace", color: "var(--qr-ink)", opacity: 0.4 }}>
        <span>{t.brandEn}</span><span>{t.footer}</span>
      </div>
    </Shell>
  );
}

/* ============ TEMPLATE 5 · TABLE TENT ============ */
function TentCard({ t, width }) {
  const qp = qrPx(t, width);
  return (
    <Shell t={t} width={width}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: width * 0.02 }}>
        <div style={{ display: "flex", alignItems: "center", gap: width * 0.03, background: "var(--qr-accent)", color: "var(--qr-bg)", padding: `${width * 0.02}px ${width * 0.055}px`, borderRadius: 999, fontWeight: 800 }}>
          <span style={{ fontSize: width * 0.045, opacity: 0.85, fontWeight: 600 }}>طاولة</span>
          <span style={{ fontSize: width * 0.075 }}>{t.tableNo || "٧"}</span>
        </div>
        <div style={{ fontFamily: "var(--qr-display)", fontWeight: 800, fontSize: width * 0.095, marginTop: width * 0.02 }}>{t.brand}</div>
      </div>
      <div style={{ flex: 1, display: "grid", placeItems: "center" }}>
        <div style={{ background: "var(--qr-surface)", padding: width * 0.05, borderRadius: width * 0.05, boxShadow: "0 8px 22px rgba(0,0,0,.22)" }}>
          <RealQR value={t.menuUrl} size={qp} fg={t.qrFg} bg={t.qrBg} dotStyle={t.dotStyle}
            logo={(t.logoPos === "center" || t.logoPos === "both") ? t.logo : null} logoBg={t.surface} />
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontWeight: 800, fontSize: width * 0.058, color: "var(--qr-accent)" }}>{t.scanAr}</div>
        <div className="ltr" style={{ fontSize: width * 0.04, opacity: 0.8, marginTop: 2 }}>{t.scanEn}</div>
      </div>
      <div style={{ marginTop: width * 0.045 }} className="ltr"><span style={{ fontSize: width * 0.034, letterSpacing: "0.22em", opacity: 0.6 }}>{t.footer}</span></div>
    </Shell>
  );
}

const QR_RENDERERS = { classic: ClassicCard, noir: NoirCard, royal: RoyalCard, minimal: MinimalCard, tent: TentCard };

/* public component */
function QRCard({ template = "classic", theme, width = 240 }) {
  const Comp = QR_RENDERERS[template] || ClassicCard;
  const t = theme || qrTheme(template);
  return <Comp t={t} width={width} />;
}

/* ---- back-compat: legacy QRCardPreview(cfg) used across the app ---- */
function QRCardPreview({ cfg, width = 220 }) {
  const id = cfg.template && QR_TEMPLATE_MAP[cfg.template] ? cfg.template : (cfg.templateId || "classic");
  const theme = qrTheme(id, {
    bg: cfg.bg, ink: cfg.fg,
    border: cfg.border, borderColor: cfg.borderColor, logoPos: cfg.logoPos,
    scanAr: cfg.text, menuUrl: cfg.menuUrl, qrScale: cfg.size ? cfg.size / 360 : undefined,
    font: cfg.font === "Mono" ? "'IBM Plex Mono', monospace" : cfg.font === "Serif" ? "Georgia, serif" : undefined,
  });
  return <QRCard template={id} theme={theme} width={width} />;
}

Object.assign(window, {
  RealQR, QRCard, QRCardPreview, QR_CARD_TEMPLATES, QR_TEMPLATE_MAP, qrTheme, StarMotif,
});
