/* Shared visual widgets: QR glyph, QR card preview, menu preview, drawers */

/* deterministic faux-QR matrix (squares only) */
function QRGlyph({ size = 120, fg = "#1c1c1c", bg = "transparent", quiet = true }) {
  const N = 21;
  const cells = [];
  // finder pattern helper
  const isFinder = (r, c) => {
    const inBox = (br, bc) => r >= br && r < br + 7 && c >= bc && c < bc + 7;
    return inBox(0, 0) || inBox(0, N - 7) || inBox(N - 7, 0);
  };
  const finderOn = (r, c) => {
    const local = (br, bc) => { const rr = r - br, cc = c - bc; const edge = rr === 0 || rr === 6 || cc === 0 || cc === 6; const core = rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4; return edge || core; };
    if (r < 7 && c < 7) return local(0, 0);
    if (r < 7 && c >= N - 7) return local(0, N - 7);
    if (r >= N - 7 && c < 7) return local(N - 7, 0);
    return false;
  };
  let seed = 7;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    let on;
    if (isFinder(r, c)) on = finderOn(r, c);
    else on = rnd() > 0.52;
    if (on) cells.push(<rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill={fg} />);
  }
  const pad = quiet ? 2 : 0;
  return (
    <svg width={size} height={size} viewBox={`${-pad} ${-pad} ${N + pad * 2} ${N + pad * 2}`} style={{ display: "block" }}>
      {bg !== "transparent" && <rect x={-pad} y={-pad} width={N + pad * 2} height={N + pad * 2} fill={bg} />}
      {cells}
    </svg>
  );
}

/* vertical QR card artifact preview */
function QRCardPreview({ cfg, width = 220 }) {
  const { bg = "#faf8f6", fg = "#1c1c1c", border = true, borderColor = "#1c1c1c",
    size = 230, logoPos = "top", text = "امسح للاطّلاع على القائمة", name = "Underground", font = "Plex" } = cfg;
  const ratio = 1.5; // height/width
  const h = width * ratio;
  const qrPx = (size / 300) * (width * 0.62);
  const Logo = ({ s = 34 }) => (
    <div style={{ width: s, height: s, borderRadius: s * 0.26, background: fg, color: bg, display: "grid", placeItems: "center", fontWeight: 800, fontSize: s * 0.4 }}>U</div>
  );
  const fontFam = font === "Mono" ? "'IBM Plex Mono', monospace" : font === "Serif" ? "Georgia, serif" : "var(--font)";
  return (
    <div style={{ width, height: h, background: bg, color: fg, borderRadius: 14,
      border: border ? `2.5px solid ${borderColor}` : "none", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "space-between", padding: width * 0.09, boxSizing: "border-box",
      fontFamily: fontFam, boxShadow: "var(--sh-md)", overflow: "hidden" }}>
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        {(logoPos === "top" || logoPos === "both") && <Logo s={width * 0.18} />}
        <div style={{ fontWeight: 800, fontSize: width * 0.085, letterSpacing: "-0.01em" }}>{name}</div>
        <div style={{ fontSize: width * 0.05, opacity: 0.7, lineHeight: 1.4, maxWidth: "90%" }}>{text}</div>
      </div>
      <div style={{ position: "relative", padding: 6, background: "#fff", borderRadius: 10 }}>
        <QRGlyph size={qrPx} fg={fg === "#faf8f6" || fg === "#fff" ? "#1c1c1c" : fg} bg="#fff" />
        {(logoPos === "middle" || logoPos === "both") && (
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
            <div style={{ background: "#fff", padding: 3, borderRadius: 7 }}><Logo s={qrPx * 0.22} /></div>
          </div>
        )}
      </div>
      <div style={{ fontSize: width * 0.045, opacity: 0.55, letterSpacing: "0.04em", fontWeight: 600 }}>MENU‑P</div>
    </div>
  );
}

/* PDF-like menu page preview */
function MenuThumb({ menu, width = 200, full = false }) {
  const ratio = 1.414;
  const h = width * ratio;
  const accent = menu.accent || "#1c1c1c";
  const cats = full ? menu.categories : menu.categories.slice(0, 2);
  return (
    <div style={{ width, height: full ? "auto" : h, minHeight: full ? h : undefined, background: "#fff",
      borderRadius: 8, boxShadow: "var(--sh-sm)", border: "1px solid var(--border)", overflow: "hidden",
      fontFamily: "var(--font)", display: "flex", flexDirection: "column" }}>
      <div style={{ background: accent, color: "#fff", padding: `${width * 0.07}px ${width * 0.08}px`, textAlign: "center" }}>
        <div style={{ fontWeight: 800, fontSize: width * 0.085, letterSpacing: "-0.01em" }}>{menu.name}</div>
        <div style={{ fontSize: width * 0.042, opacity: 0.8, marginTop: 2 }}>Underground · قائمة رقمية</div>
      </div>
      <div style={{ padding: width * 0.08, display: "flex", flexDirection: "column", gap: width * 0.06, flex: 1 }}>
        {cats.map(c => (
          <div key={c.id}>
            <div style={{ fontWeight: 700, fontSize: width * 0.058, color: accent, borderBottom: `1.5px solid ${accent}22`, paddingBottom: 3, marginBottom: width * 0.03 }}>{c.name}</div>
            {(full ? c.items : c.items.slice(0, 3)).map(it => (
              <div key={it.id} style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: width * 0.05, marginBottom: width * 0.022 }}>
                <span style={{ color: "#333", fontWeight: 500 }}>{it.name}</span>
                <span style={{ color: accent, fontWeight: 700, flexShrink: 0 }}>{it.price}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* Add-language drawer */
function AddLanguageDrawer({ open, onClose, menu, onAdd }) {
  const existing = menu ? menu.langs : [];
  const [picked, setPicked] = React.useState(null);
  React.useEffect(() => { if (open) setPicked(null); }, [open]);
  const available = Object.values(LANGS).filter(l => !existing.includes(l.code));
  return (
    <Drawer open={open} onClose={onClose}>
      <DrawerHead icon="languages" title="إضافة لغة جديدة" sub={menu ? `إلى «${menu.name}»` : ""} onClose={onClose} />
      <div className="drawer-body">
        <Banner tone="info">سيتم إنشاء نسخة جديدة من القائمة باللغة المختارة. يمكنك ترجمتها تلقائياً بالذكاء الاصطناعي بعد الإضافة.</Banner>
        <div style={{ marginTop: 16 }} className="section-title">اللغات الحالية</div>
        <div className="row wrap" style={{ gap: 7 }}>
          {existing.map(c => <span key={c} className="lang-badge"><span className="lang-flag">{LANGS[c].flag}</span>{LANGS[c].name}</span>)}
        </div>
        <div style={{ marginTop: 18 }} className="section-title">اختر لغة لإضافتها</div>
        <div className="col" style={{ gap: 8 }}>
          {available.map(l => (
            <Choice key={l.code} on={picked === l.code} onClick={() => setPicked(l.code)}>
              <div className="row between">
                <div className="row" style={{ gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{l.flag}</span>
                  <div><div style={{ fontWeight: 650, fontSize: 13.5 }}>{l.name}</div><div className="ltr" style={{ fontSize: 12, color: "var(--text-3)", textAlign: "start" }}>{l.native}</div></div>
                </div>
              </div>
            </Choice>
          ))}
          {available.length === 0 && <EmptyState icon="check" title="كل اللغات مضافة" >تمت إضافة جميع اللغات المتاحة لهذه القائمة.</EmptyState>}
        </div>
      </div>
      <div className="drawer-foot">
        <Btn variant="ghost" onClick={onClose} block>إلغاء</Btn>
        <Btn variant="primary" block disabled={!picked} icon="plus"
          onClick={() => { onAdd && onAdd(picked); toast({ tone: "success", title: "تمت إضافة اللغة", msg: `${LANGS[picked].name} — جاهزة للترجمة` }); onClose(); }}>
          إضافة اللغة
        </Btn>
      </div>
    </Drawer>
  );
}

/* AI translation drawer (streaming sim) */
function TranslateDrawer({ open, onClose, menu }) {
  const [src, setSrc] = React.useState("ar");
  const [targets, setTargets] = React.useState(["en"]);
  const [phase, setPhase] = React.useState("config"); // config | running | done | error
  const [prog, setProg] = React.useState(0);
  React.useEffect(() => { if (open) { setPhase("config"); setProg(0); setTargets(["en"]); } }, [open]);
  const catCount = menu ? menu.categories.length : 3;
  const itemCount = menu ? menu.categories.reduce((s, c) => s + c.items.length, 0) : 10;
  const toggleTarget = (c) => setTargets(t => t.includes(c) ? t.filter(x => x !== c) : [...t, c]);
  const run = () => {
    setPhase("running"); setProg(0);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 16 + 6;
      if (p >= 100) { p = 100; clearInterval(iv); setProg(100); setTimeout(() => setPhase("done"), 400); }
      setProg(Math.min(100, p));
    }, 280);
  };
  const targetLangs = Object.values(LANGS).filter(l => l.code !== src);
  return (
    <Drawer open={open} onClose={onClose} wide>
      <DrawerHead icon="sparkles" title="الترجمة بالذكاء الاصطناعي" sub={menu ? `«${menu.name}»` : "ترجمة القائمة"} onClose={onClose} />
      <div className="drawer-body">
        {phase === "config" && <>
          <div className="grid grid-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div className="stat" style={{ padding: 14 }}><div className="stat-val" style={{ fontSize: 22 }}>{catCount}</div><div className="stat-label">تصنيف</div></div>
            <div className="stat" style={{ padding: 14 }}><div className="stat-val" style={{ fontSize: 22 }}>{itemCount}</div><div className="stat-label">عنصر</div></div>
          </div>
          <div className="field" style={{ marginTop: 16 }}>
            <label>اللغة المصدر</label>
            <Select value={src} onChange={e => { setSrc(e.target.value); setTargets(t => t.filter(x => x !== e.target.value)); }}
              options={Object.values(LANGS).map(l => ({ value: l.code, label: `${l.flag}  ${l.name}` }))} />
          </div>
          <div className="field" style={{ marginTop: 14 }}>
            <label>اللغات الهدف <span className="muted">(يمكن اختيار أكثر من لغة)</span></label>
            <div className="row wrap" style={{ gap: 8 }}>
              {targetLangs.map(l => (
                <button key={l.code} className={["chip", "chip-lg", targets.includes(l.code) ? "chip-primary" : "chip-outline"].join(" ")}
                  style={{ cursor: "pointer", border: targets.includes(l.code) ? "1px solid var(--primary)" : undefined }} onClick={() => toggleTarget(l.code)}>
                  {targets.includes(l.code) && <Icon name="check" size={12} strokeWidth={3} />}<span style={{ fontSize: 14 }}>{l.flag}</span>{l.name}
                </button>
              ))}
            </div>
          </div>
          <Banner tone="info" title="ترجمة ذكية:" >تحافظ على أسماء الأطباق والعلامات التجارية، وتراعي السياق المحلي للنكهات والمكوّنات.</Banner>
        </>}

        {phase === "running" && (
          <div style={{ padding: "8px 0" }}>
            <div className="row between" style={{ marginBottom: 10 }}>
              <span style={{ fontWeight: 650, fontSize: 14 }}>جارٍ الترجمة…</span>
              <span className="tnum" style={{ fontWeight: 700, color: "var(--primary)" }}>{Math.round(prog)}%</span>
            </div>
            <div className="progress"><i style={{ width: `${prog}%` }} /></div>
            <div className="steplist" style={{ marginTop: 16 }}>
              <ProgressSteps steps={[
                { label: "تحليل بنية القائمة", state: prog > 5 ? "done" : "active" },
                { label: `ترجمة ${itemCount} عنصر إلى ${targets.length} لغة`, state: prog > 70 ? "done" : prog > 5 ? "active" : "pending" },
                { label: "مراجعة الجودة والاتساق", state: prog >= 100 ? "done" : prog > 70 ? "active" : "pending" },
              ]} />
            </div>
            <div className="banner banner-warn" style={{ marginTop: 14 }}><Icon name="info" size={16} />لا تُغلق هذه النافذة حتى تكتمل الترجمة.</div>
          </div>
        )}

        {phase === "done" && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div className="stat-ico" style={{ width: 56, height: 56, borderRadius: 16, background: "var(--success-soft)", color: "var(--success-fg)", margin: "0 auto 14px" }}><Icon name="checkCircle" size={28} /></div>
            <h3 style={{ margin: "0 0 5px", fontSize: 17 }}>تمت الترجمة بنجاح</h3>
            <p className="muted" style={{ margin: "0 0 16px", fontSize: 13 }}>تُرجمت {itemCount} عنصر إلى {targets.length} لغة.</p>
            <div className="row wrap" style={{ gap: 7, justifyContent: "center" }}>
              {targets.map(c => <span key={c} className="lang-badge"><span className="lang-flag">{LANGS[c].flag}</span>{LANGS[c].name}<Icon name="check" size={12} style={{ color: "var(--success-fg)" }} /></span>)}
            </div>
          </div>
        )}
      </div>
      <div className="drawer-foot">
        {phase === "config" && <>
          <Btn variant="ghost" onClick={onClose}>إلغاء</Btn>
          <Btn variant="primary" block icon="sparkles" disabled={targets.length === 0} onClick={run}>ترجمة الآن ({targets.length})</Btn>
        </>}
        {phase === "running" && <Btn variant="ghost" block disabled><div className="spinner" />جارٍ المعالجة…</Btn>}
        {phase === "done" && <Btn variant="primary" block icon="check" onClick={onClose}>تم</Btn>}
      </div>
    </Drawer>
  );
}

Object.assign(window, { QRGlyph, QRCardPreview, MenuThumb, AddLanguageDrawer, TranslateDrawer });
