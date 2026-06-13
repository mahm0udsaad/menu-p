/* QR Cards tab: grid + create panel (themed templates) + gallery */

const QR_FONTS = [{ value: "Plex", label: "بلكس (افتراضي)" }, { value: "Serif", label: "ترويسة كلاسيكية" }, { value: "Mono", label: "مونوسبيس" }];
const QR_BG = ["#f7f0e4", "#ffffff", "#15120f", "#143229", "#6e2230", "#1c2b3a"];
const QR_FG = ["#2c2118", "#1b1b1b", "#a06a37", "#c9a24b", "#e2b86c", "#f3ece1"];
const QR_BORDER = ["#ddc9a6", "#c9a24b", "#e2b86c", "#2c2118", "#ededed", "#d4af37"];
const LOGO_POS = [{ value: "none", label: "بدون" }, { value: "top", label: "أعلى" }, { value: "center", label: "وسط QR" }, { value: "both", label: "الاثنان" }];

function menuSlug(menu) {
  return "https://menu-p.app/m/" + (menu ? menu.id : "menu") + "-" + (menu ? encodeURIComponent(menu.nameEn || "menu").toLowerCase().replace(/%[0-9a-f]{2}/gi, "").replace(/\s+/g, "") : "");
}

function QRTab() {
  const [view, setView] = React.useState("grid"); // grid | create | gallery
  const [del, setDel] = React.useState(null);
  const [cards, setCards] = React.useState(QR_CARDS);
  const [seedTemplate, setSeedTemplate] = React.useState("classic");
  const publishedMenus = MENUS.filter(m => m.status === "published");

  if (view === "create") return <QRCreate seedTemplate={seedTemplate} onClose={() => setView("grid")} onSaved={(c) => { setCards(cs => [c, ...cs]); setView("grid"); }} publishedMenus={publishedMenus} />;
  if (view === "gallery") return <QRGallery onClose={() => setView("grid")} onUse={(id) => { setSeedTemplate(id); setView("create"); }} />;

  return (
    <div className="page">
      <div className="page-head">
        <div><h2>بطاقات QR</h2><p>بطاقات باركود قابلة للطباعة تربط زبائنك بقوائمك مباشرة.</p></div>
        <div className="ph-actions">
          <Btn variant="secondary" icon="layout" onClick={() => setView("gallery")}>معرض القوالب</Btn>
          <Btn variant="primary" icon="plus" onClick={() => { setSeedTemplate("classic"); setView("create"); }}>بطاقة QR جديدة</Btn>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="card"><EmptyState icon="qr" title="لا توجد بطاقات QR بعد"
          action={<Btn variant="primary" icon="plus" onClick={() => setView("create")}>أنشئ أول بطاقة</Btn>}>
          أنشئ بطاقة QR قابلة للطباعة لكل طاولة أو واجهة، واربطها بإحدى قوائمك المنشورة.
        </EmptyState></div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}>
          {cards.map(c => (
            <div className="card card-hover" key={c.id} style={{ overflow: "hidden" }}>
              <div style={{ background: "var(--surface-2)", padding: 22, display: "grid", placeItems: "center", position: "relative", borderBottom: "1px solid var(--border)" }}>
                <QRCardPreview cfg={c} width={138} />
                <div style={{ position: "absolute", top: 11, insetInlineStart: 11 }}><StatusChip status={c.status} /></div>
                <div style={{ position: "absolute", top: 11, insetInlineEnd: 11 }}><Chip tone="outline">{(QR_TEMPLATE_MAP[c.template] || {}).name || c.template}</Chip></div>
              </div>
              <div className="card-pad">
                <h3 style={{ margin: "0 0 4px", fontSize: 14.5 }}>{c.name}</h3>
                <div className="muted" style={{ fontSize: 12.5, marginBottom: 8 }}>{c.text}</div>
                <div className="row" style={{ gap: 6, fontSize: 11.5, color: "var(--text-3)", marginBottom: 12 }}>
                  <Icon name="link" size={13} /><span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.menuName}</span>
                  <Icon name="calendar" size={13} />{c.date}
                </div>
                <div className="row" style={{ gap: 7 }}>
                  <Btn variant="secondary" size="sm" icon="download" style={{ flex: 1 }} onClick={() => toast({ title: "جارٍ تحميل PDF", msg: c.name })}>PDF</Btn>
                  <Btn variant="secondary" size="sm" icon="external" style={{ flex: 1 }} onClick={() => toast({ tone: "info", title: "فتح رابط القائمة", msg: c.menuUrl })}>الرابط</Btn>
                  <Popover trigger={<button className="btn btn-secondary btn-icon btn-sm"><Icon name="more" size={16} /></button>}>
                    <div className="menu">
                      <MenuItem icon="copy" onClick={() => toast({ title: "تم نسخ الرابط", msg: c.menuUrl })}>نسخ رابط QR</MenuItem>
                      <MenuItem icon="external" onClick={() => toast({ tone: "info", title: "عرض القائمة المرتبطة" })}>عرض القائمة المرتبطة</MenuItem>
                      <div className="menu-sep" />
                      <MenuItem icon="trash" danger onClick={() => setDel(c)}>حذف البطاقة</MenuItem>
                    </div>
                  </Popover>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal open={!!del} onClose={() => setDel(null)} danger icon="trash"
        title="حذف بطاقة QR؟" confirmLabel="حذف"
        message={del ? `سيتم حذف بطاقة «${del.name}». البطاقات المطبوعة ستتوقف عن العمل.` : ""}
        onConfirm={() => { setCards(cs => cs.filter(x => x.id !== del.id)); toast({ tone: "success", title: "تم حذف البطاقة" }); setDel(null); }} />
    </div>
  );
}

/* ---- templates gallery ---- */
function QRGallery({ onClose, onUse }) {
  return (
    <div className="page page-wide">
      <div className="page-head">
        <div className="row" style={{ gap: 12 }}>
          <Btn variant="secondary" size="sm" icon="arrowRight" onClick={onClose}>رجوع</Btn>
          <div><h2 style={{ fontSize: 19 }}>معرض قوالب البطاقات</h2><p>خمسة قوالب جاهزة للطباعة، مصمّمة لأجواء مطاعم ومقاهي المنطقة.</p></div>
        </div>
      </div>

      <div className="banner banner-info" style={{ marginBottom: 18 }}>
        <Icon name="palette" size={17} style={{ flexShrink: 0, marginTop: 1 }} />
        <div className="banner-body">
          <b>قابلة لإعادة التلوين بالكامل.</b> كل قالب مبني على متغيّرات تصميم
          <span className="ltr" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}> (--qr-bg, --qr-ink, --qr-accent, --qr-surface, --qr-radius, --qr-font) </span>
          ورمز QR حقيقي قابل للمسح يشير إلى رابط القائمة — جاهزة لإعادة الاستخدام في الكود مع أي ثيم.
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
        {QR_CARD_TEMPLATES.map(t => (
          <div className="card card-pad" key={t.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div style={{ background: "var(--surface-2)", borderRadius: 14, padding: 22, width: "100%", display: "grid", placeItems: "center", border: "1px solid var(--border)" }}>
              <QRCard template={t.id} width={196} />
            </div>
            <div style={{ width: "100%" }}>
              <div className="row between">
                <h3 style={{ margin: 0, fontSize: 16 }}>{t.name}</h3>
                <span className="ltr muted" style={{ fontSize: 12, letterSpacing: "0.06em", fontWeight: 600 }}>{t.nameEn}</span>
              </div>
              <p className="muted" style={{ margin: "4px 0 0", fontSize: 12.5 }}>{t.tagline}</p>
              <div className="row" style={{ gap: 6, marginTop: 10 }}>
                <span className="swatch" style={{ background: t.theme.bg, width: 22, height: 22, cursor: "default" }} />
                <span className="swatch" style={{ background: t.theme.accent, width: 22, height: 22, cursor: "default" }} />
                <span className="swatch" style={{ background: t.theme.ink, width: 22, height: 22, cursor: "default" }} />
                <Btn variant="soft" size="sm" icon="check" style={{ marginInlineStart: "auto" }} onClick={() => onUse(t.id)}>استخدام</Btn>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- create panel ---- */
function QRCreate({ onClose, onSaved, publishedMenus, seedTemplate = "classic" }) {
  const seed = QR_TEMPLATE_MAP[seedTemplate].theme;
  const [cfg, setCfg] = React.useState({
    menuId: publishedMenus[0]?.id, name: "", text: seed.scanAr,
    template: seedTemplate, font: "Plex", bg: seed.bg, fg: seed.ink,
    logoPos: seed.logoPos, size: 230, border: seed.border, borderColor: seed.borderColor,
  });
  const [phase, setPhase] = React.useState("form");
  const set = (k, v) => setCfg(c => ({ ...c, [k]: v }));
  const menu = publishedMenus.find(m => m.id === cfg.menuId);
  const menuUrl = menuSlug(menu);
  const liveCfg = { ...cfg, menuUrl };

  const pickTemplate = (id) => {
    const th = QR_TEMPLATE_MAP[id].theme;
    setCfg(c => ({ ...c, template: id, bg: th.bg, fg: th.ink, border: th.border, borderColor: th.borderColor, logoPos: th.logoPos,
      text: (c.text === QR_TEMPLATE_MAP[c.template].theme.scanAr || !c.text) ? th.scanAr : c.text }));
  };

  if (publishedMenus.length === 0) {
    return (
      <div className="page">
        <div className="page-head"><Btn variant="ghost" size="sm" icon="arrowRight" onClick={onClose}>رجوع</Btn></div>
        <div className="card"><EmptyState icon="list" title="لا توجد قوائم منشورة"
          action={<Btn variant="primary" icon="plus">أنشئ قائمة أولاً</Btn>}>
          لإنشاء بطاقة QR، تحتاج أولاً إلى قائمة منشورة واحدة على الأقل لربط البطاقة بها.
        </EmptyState></div>
      </div>
    );
  }

  const save = () => { setPhase("saving"); setTimeout(() => setPhase("done"), 1400); };
  const newCard = { id: "q" + Date.now(), name: cfg.name || "بطاقة بدون اسم", menuId: cfg.menuId,
    menuName: menu?.name, text: cfg.text, status: "active", date: "2026-06-13", menuUrl,
    template: cfg.template, bg: cfg.bg, fg: cfg.fg, border: cfg.border, borderColor: cfg.borderColor,
    size: cfg.size, logoPos: cfg.logoPos, font: cfg.font };

  return (
    <div className="page page-wide">
      <div className="page-head">
        <div className="row" style={{ gap: 12 }}>
          <Btn variant="secondary" size="sm" icon="arrowRight" onClick={onClose}>رجوع</Btn>
          <div><h2 style={{ fontSize: 19 }}>بطاقة QR جديدة</h2><p>صمّم بطاقة قابلة للطباعة واربطها بقائمة منشورة.</p></div>
        </div>
      </div>

      {phase === "done" ? (
        <div className="card card-pad" style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
          <div className="stat-ico" style={{ width: 56, height: 56, borderRadius: 16, background: "var(--success-soft)", color: "var(--success-fg)", margin: "8px auto 14px" }}><Icon name="checkCircle" size={28} /></div>
          <h3 style={{ margin: "0 0 5px", fontSize: 18 }}>تم إنشاء البطاقة بنجاح!</h3>
          <p className="muted" style={{ margin: "0 0 18px" }}>بطاقة «{newCard.name}» جاهزة للتحميل والطباعة.</p>
          <div style={{ display: "grid", placeItems: "center", marginBottom: 18 }}><QRCardPreview cfg={liveCfg} width={180} /></div>
          <div className="row" style={{ gap: 9, justifyContent: "center" }}>
            <Btn variant="primary" icon="download" onClick={() => toast({ title: "جارٍ تحميل PDF" })}>تحميل PDF</Btn>
            <Btn variant="secondary" icon="qr" onClick={() => onSaved(newCard)}>عرض البطاقات</Btn>
          </div>
        </div>
      ) : (
        <div className="grid split-grid" style={{ gridTemplateColumns: "minmax(0,1fr) 340px", alignItems: "start", gap: 18 }}>
          {/* form */}
          <div className="col" style={{ gap: 16 }}>
            <div className="card card-pad col" style={{ gap: 14 }}>
              <div className="section-title"><Icon name="link" size={15} />الربط والمحتوى</div>
              <Field label="القائمة المنشورة" hint={`يشير رمز QR إلى: ${menuUrl}`}>
                <Select value={cfg.menuId} onChange={e => set("menuId", e.target.value)}
                  options={publishedMenus.map(m => ({ value: m.id, label: m.name }))} />
              </Field>
              <Field label="اسم البطاقة" hint="للتنظيم الداخلي فقط، لا يظهر للزبائن">
                <Input placeholder="مثال: بطاقة الطاولة — رئيسية" value={cfg.name} onChange={e => set("name", e.target.value)} />
              </Field>
              <Field label="النص المخصّص">
                <Textarea value={cfg.text} onChange={e => set("text", e.target.value)} style={{ minHeight: 60 }} />
              </Field>
            </div>

            <div className="card card-pad col" style={{ gap: 16 }}>
              <div className="section-title"><Icon name="layout" size={15} />القالب</div>
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(116px, 1fr))", gap: 10 }}>
                {QR_CARD_TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => pickTemplate(t.id)}
                    style={{ border: cfg.template === t.id ? "2px solid var(--primary)" : "2px solid var(--border)", borderRadius: 12, padding: "10px 8px 8px", background: cfg.template === t.id ? "var(--primary-soft)" : "var(--surface)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <QRCard template={t.id} width={84} />
                    <span style={{ fontSize: 12, fontWeight: 650 }}>{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="card card-pad col" style={{ gap: 16 }}>
              <div className="section-title"><Icon name="palette" size={15} />التخصيص</div>
              <Field label="الخط"><Select value={cfg.font} onChange={e => set("font", e.target.value)} options={QR_FONTS} /></Field>
              <Field label="لون الخلفية"><SwatchPicker value={cfg.bg} onChange={v => set("bg", v)} colors={QR_BG} /></Field>
              <Field label="لون النص الرئيسي"><SwatchPicker value={cfg.fg} onChange={v => set("fg", v)} colors={QR_FG} /></Field>
              <Field label="موضع الشعار" hint="يظهر شعار المطعم أعلى البطاقة أو داخل رمز QR"><Segmented block value={cfg.logoPos} onChange={v => set("logoPos", v)} options={LOGO_POS} /></Field>
              <Field label={`حجم رمز QR — ${cfg.size}px`}><Slider value={cfg.size} onChange={v => set("size", v)} min={150} max={300} step={10} suffix="px" /></Field>
              <div className="row between" style={{ paddingTop: 2 }}>
                <div><div style={{ fontWeight: 600, fontSize: 13 }}>إطار حول البطاقة</div><div className="muted" style={{ fontSize: 12 }}>حد ملوّن حول التصميم</div></div>
                <Toggle checked={cfg.border} onChange={v => set("border", v)} />
              </div>
              {cfg.border && <Field label="لون الإطار"><SwatchPicker value={cfg.borderColor} onChange={v => set("borderColor", v)} colors={QR_BORDER} /></Field>}
            </div>
          </div>

          {/* live preview (sticky) */}
          <div className="card card-pad" style={{ position: "sticky", top: 84 }}>
            <div className="section-title"><Icon name="eye" size={15} />معاينة حيّة</div>
            <div style={{ background: "var(--surface-2)", borderRadius: 12, padding: 24, display: "grid", placeItems: "center", border: "1px solid var(--border)" }}>
              <QRCardPreview cfg={liveCfg} width={210} />
            </div>
            <div className="muted" style={{ fontSize: 11.5, textAlign: "center", margin: "10px 0 0" }}>تُطبع بحجم A6 · 105×148 مم · رمز QR قابل للمسح</div>
            <Btn variant="primary" block icon={phase === "saving" ? null : "check"} style={{ marginTop: 14 }} disabled={phase === "saving"} onClick={save}>
              {phase === "saving" ? <><div className="spinner spinner-white" />جارٍ الحفظ…</> : "إنشاء وحفظ البطاقة"}
            </Btn>
            <Btn variant="ghost" block style={{ marginTop: 7 }} onClick={onClose}>إلغاء</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { QRTab });
