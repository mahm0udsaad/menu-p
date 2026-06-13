/* Poster Studio — gallery + create wizard */

const POSTER_TEMPLATES = [
  { id: "pt1", name: "جريء", accent: "#b03a2e" },
  { id: "pt2", name: "أنيق", accent: "#1c1c1c" },
  { id: "pt3", name: "دافئ", accent: "#7a4a2b" },
  { id: "pt4", name: "احتفالي", accent: "#1c5c3a" },
];

/* visual poster preview */
function PosterPreview({ poster, width = 200 }) {
  const isStory = poster.size === "story";
  const ratio = isStory ? 16 / 9 : 1;
  const h = width * ratio;
  const accent = poster.accent || "#1c1c1c";
  return (
    <div style={{ width, height: h, borderRadius: 12, overflow: "hidden", position: "relative",
      background: `linear-gradient(155deg, ${accent}, ${accent}cc)`, color: "#fff", boxShadow: "var(--sh-md)",
      display: "flex", flexDirection: "column", justifyContent: "space-between", padding: width * 0.09, fontFamily: "var(--font)" }}>
      <div className="row between" style={{ alignItems: "flex-start" }}>
        <div style={{ fontWeight: 800, fontSize: width * 0.06, opacity: 0.9 }}>Underground</div>
        {poster.type === "offer" && <div style={{ background: "#fff", color: accent, fontWeight: 800, fontSize: width * 0.07, padding: `${width * 0.02}px ${width * 0.04}px`, borderRadius: 99 }}>−{poster.discount || 20}%</div>}
      </div>
      <div style={{ textAlign: "center" }}>
        {poster.type === "offer" ? <>
          <div style={{ fontSize: width * 0.05, opacity: 0.85, marginBottom: 4 }}>{poster.headline || "عرض خاص"}</div>
          <div style={{ fontWeight: 800, fontSize: width * 0.1, lineHeight: 1.1 }}>{poster.itemName || "قهوة مختصة"}</div>
          <div className="row" style={{ gap: 8, justifyContent: "center", marginTop: 8 }}>
            {poster.oldPrice && <span style={{ fontSize: width * 0.06, textDecoration: "line-through", opacity: 0.6 }}>{poster.oldPrice}</span>}
            <span style={{ fontSize: width * 0.09, fontWeight: 800 }}>{poster.newPrice || 14} {CUR_SYM}</span>
          </div>
        </> : <>
          <div style={{ fontSize: width * 0.05, opacity: 0.85, marginBottom: 6 }}>{poster.occasion || "بمناسبة"}</div>
          <div style={{ fontWeight: 800, fontSize: width * 0.085, lineHeight: 1.25 }}>{poster.message || "كل عام وأنتم بخير"}</div>
        </>}
      </div>
      <div style={{ textAlign: "center", fontSize: width * 0.04, opacity: 0.7, letterSpacing: "0.05em" }}>{poster.size === "story" ? "1080 × 1920" : "1080 × 1080"}</div>
    </div>
  );
}

function PostersPage() {
  const { go } = useNav();
  const [creating, setCreating] = React.useState(false);
  const [del, setDel] = React.useState(null);
  const [posters, setPosters] = React.useState(POSTERS);

  if (creating) return <PosterWizard onClose={() => setCreating(false)} onDone={(p) => { setPosters(ps => [p, ...ps]); setCreating(false); }} />;

  return (
    <div className="page">
      <div className="page-head">
        <div className="row" style={{ gap: 12 }}>
          <Btn variant="secondary" size="sm" icon="arrowRight" onClick={() => go({ page: "dashboard", tab: "overview" })}>لوحة التحكم</Btn>
          <div><h2 style={{ fontSize: 19 }}>استوديو البوسترات</h2><p>صمّم بوسترات عروض ومناسبات جاهزة للنشر.</p></div>
        </div>
        <div className="ph-actions"><Btn variant="primary" icon="plus" onClick={() => setCreating(true)}>بوستر جديد</Btn></div>
      </div>

      {posters.length === 0 ? (
        <div className="card"><EmptyState icon="image" title="لا توجد بوسترات بعد"
          action={<Btn variant="primary" icon="plus" onClick={() => setCreating(true)}>أنشئ أول بوستر</Btn>}>
          صمّم بوستر عرض أو تهنئة بالمناسبات خلال دقائق، وشاركه مباشرة على حساباتك.
        </EmptyState></div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          {posters.map(p => (
            <div className="card card-hover" key={p.id} style={{ overflow: "hidden" }}>
              <div style={{ background: "var(--surface-2)", padding: 18, display: "grid", placeItems: "center", position: "relative", borderBottom: "1px solid var(--border)", minHeight: 220 }}>
                {p.status === "generating" ? (
                  <div className="col" style={{ alignItems: "center", gap: 10 }}><div className="spinner spinner-lg" /><span className="muted" style={{ fontSize: 12.5 }}>جارٍ الإنشاء…</span></div>
                ) : p.status === "failed" ? (
                  <div className="col" style={{ alignItems: "center", gap: 8, color: "var(--danger-fg)" }}><Icon name="xCircle" size={32} /><span style={{ fontSize: 12.5, fontWeight: 600 }}>فشل الإنشاء</span><Btn variant="danger-soft" size="xs" icon="refresh" onClick={() => toast({ title: "إعادة المحاولة…" })}>إعادة المحاولة</Btn></div>
                ) : (
                  <PosterPreview poster={p} width={p.size === "story" ? 120 : 160} />
                )}
                <div style={{ position: "absolute", top: 10, insetInlineStart: 10 }}><Chip tone={p.type === "offer" ? "primary" : "violet"} icon={p.type === "offer" ? "tag" : "gift"}>{p.type === "offer" ? "عرض" : "تهنئة"}</Chip></div>
                <div style={{ position: "absolute", top: 10, insetInlineEnd: 10 }}><StatusChip status={p.status} /></div>
              </div>
              <div className="card-pad">
                <h3 style={{ margin: "0 0 3px", fontSize: 14 }}>{p.title}</h3>
                <div className="muted row" style={{ fontSize: 11.5, gap: 5, marginBottom: 11 }}><Icon name="calendar" size={12} />{p.date} · {p.size === "story" ? "ستوري" : "مربّع"}</div>
                <div className="row" style={{ gap: 7 }}>
                  <Btn variant="secondary" size="sm" icon="download" style={{ flex: 1 }} disabled={p.status !== "ready"} onClick={() => toast({ title: "جارٍ التحميل", msg: p.title })}>تحميل</Btn>
                  <Btn variant="soft" size="sm" icon="share" style={{ flex: 1 }} disabled={p.status !== "ready"} onClick={() => go({ page: "social" })}>نشر</Btn>
                  <Btn variant="secondary" size="sm" icon="trash" onClick={() => setDel(p)} style={{ color: "var(--danger-fg)" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal open={!!del} onClose={() => setDel(null)} danger icon="trash" title="حذف البوستر؟" confirmLabel="حذف"
        message={del ? `سيتم حذف بوستر «${del.title}» نهائياً.` : ""}
        onConfirm={() => { setPosters(ps => ps.filter(x => x.id !== del.id)); toast({ tone: "success", title: "تم حذف البوستر" }); setDel(null); }} />
    </div>
  );
}

/* ---- wizard ---- */
function PosterWizard({ onClose, onDone }) {
  const [step, setStep] = React.useState(1); // 1 mode, 2 content, 3 style
  const [mode, setMode] = React.useState("offer");
  const [picked, setPicked] = React.useState(["i1"]);
  const [offer, setOffer] = React.useState({ oldPrice: "18", newPrice: "14", discount: "22", headline: "عرض القهوة المختصة" });
  const [greet, setGreet] = React.useState({ occasion: "عيد الأضحى", custom: "", message: "عيدكم مبارك وكل عام وأنتم بخير من فريق Underground ☕️" });
  const [style, setStyle] = React.useState({ template: "pt1", size: "square", prompt: "" });
  const [gen, setGen] = React.useState(false);
  const items = allMenuItems();
  const togglePick = (id) => setPicked(p => p.includes(id) ? p.filter(x => x !== id) : p.length < 4 ? [...p, id] : p);
  const accent = POSTER_TEMPLATES.find(t => t.id === style.template).accent;
  const firstItem = items.find(i => i.id === picked[0]);
  const previewPoster = mode === "offer"
    ? { type: "offer", size: style.size, accent, discount: offer.discount, headline: offer.headline, itemName: firstItem?.name, oldPrice: offer.oldPrice, newPrice: offer.newPrice }
    : { type: "greeting", size: style.size, accent, occasion: greet.custom || greet.occasion, message: greet.message };

  const generate = () => {
    setGen(true);
    setTimeout(() => {
      onDone({ id: "p" + Date.now(), type: mode, title: mode === "offer" ? (offer.headline || "عرض جديد") : (greet.custom || greet.occasion), status: "ready", date: "2026-06-13", size: style.size, accent });
      toast({ tone: "success", title: "تم إنشاء البوستر!" });
    }, 1900);
  };

  return (
    <div className="page page-wide">
      <div className="page-head">
        <div className="row" style={{ gap: 12 }}>
          <Btn variant="secondary" size="sm" icon="arrowRight" onClick={onClose}>رجوع</Btn>
          <div><h2 style={{ fontSize: 19 }}>بوستر جديد</h2><p>الخطوة {step} من 3</p></div>
        </div>
      </div>

      <div className="grid split-grid" style={{ gridTemplateColumns: "minmax(0,1fr) 320px", alignItems: "start", gap: 18 }}>
        <div className="col" style={{ gap: 16 }}>
          {/* step 1 */}
          {step === 1 && (
            <div className="card card-pad">
              <div className="section-title">اختر نوع البوستر</div>
              <div className="grid grid-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
                {[["offer", "بوستر عرض", "tag", "روّج لأطباق بخصومات وأسعار مميّزة"], ["greeting", "بوستر تهنئة", "gift", "هنّئ زبائنك بالمناسبات والأعياد"]].map(m => (
                  <button key={m[0]} className={["choice", mode === m[0] && "on"].filter(Boolean).join(" ")} style={{ flexDirection: "column", alignItems: "center", textAlign: "center", padding: 24, gap: 10 }} onClick={() => setMode(m[0])}>
                    <div className="stat-ico" style={{ width: 48, height: 48, borderRadius: 14, background: mode === m[0] ? "var(--primary-soft)" : "var(--surface-3)", color: mode === m[0] ? "var(--primary)" : "var(--text-3)" }}><Icon name={m[2]} size={24} /></div>
                    <div><div style={{ fontWeight: 700, fontSize: 15 }}>{m[1]}</div><div className="muted" style={{ fontSize: 12.5, marginTop: 3 }}>{m[3]}</div></div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* step 2 — offer */}
          {step === 2 && mode === "offer" && (
            <>
              <div className="card card-pad">
                <div className="section-title">اختر العناصر <span className="muted">({picked.length}/4)</span></div>
                <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 9, maxHeight: 240, overflow: "auto", paddingInlineEnd: 4 }}>
                  {items.map(it => (
                    <button key={it.id} className={["choice", picked.includes(it.id) && "on"].filter(Boolean).join(" ")} style={{ padding: 10, gap: 9, alignItems: "center" }} onClick={() => togglePick(it.id)}>
                      <div style={{ width: 18, height: 18, borderRadius: 5, border: picked.includes(it.id) ? "none" : "2px solid var(--border-strong)", background: picked.includes(it.id) ? "var(--primary)" : "transparent", display: "grid", placeItems: "center", flexShrink: 0 }}>{picked.includes(it.id) && <Icon name="check" size={12} strokeWidth={3} style={{ color: "#fff" }} />}</div>
                      <div style={{ textAlign: "start", minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.name}</div><div className="muted" style={{ fontSize: 11 }}>{it.cat} · {it.price} {CUR_SYM}</div></div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="card card-pad col" style={{ gap: 14 }}>
                <div className="section-title">تفاصيل العرض</div>
                <div className="grid grid-3" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <Field label="السعر القديم"><div className="input-affix"><Input value={offer.oldPrice} onChange={e => setOffer({ ...offer, oldPrice: e.target.value })} className="input tnum" style={{ textAlign: "start", paddingInlineEnd: 38 }} /><span className="affix">{CUR_SYM}</span></div></Field>
                  <Field label="السعر الجديد"><div className="input-affix"><Input value={offer.newPrice} onChange={e => setOffer({ ...offer, newPrice: e.target.value })} className="input tnum" style={{ textAlign: "start", paddingInlineEnd: 38 }} /><span className="affix">{CUR_SYM}</span></div></Field>
                  <Field label="نسبة الخصم"><div className="input-affix"><Input value={offer.discount} onChange={e => setOffer({ ...offer, discount: e.target.value })} className="input tnum" style={{ textAlign: "start", paddingInlineEnd: 32 }} /><span className="affix">%</span></div></Field>
                </div>
                <Field label="عنوان رئيسي (اختياري)"><Input value={offer.headline} onChange={e => setOffer({ ...offer, headline: e.target.value })} /></Field>
              </div>
            </>
          )}

          {/* step 2 — greeting */}
          {step === 2 && mode === "greeting" && (
            <div className="card card-pad col" style={{ gap: 16 }}>
              <div>
                <div className="section-title">المناسبة</div>
                <div className="row wrap" style={{ gap: 8 }}>
                  {OCCASIONS.map(o => (
                    <button key={o} className={["chip", "chip-lg", greet.occasion === o && !greet.custom ? "chip-primary" : "chip-outline"].join(" ")} style={{ cursor: "pointer", border: greet.occasion === o && !greet.custom ? "1px solid var(--primary)" : undefined }} onClick={() => setGreet({ ...greet, occasion: o, custom: "" })}>{o}</button>
                  ))}
                </div>
              </div>
              <Field label="أو مناسبة مخصّصة"><Input placeholder="اكتب اسم المناسبة…" value={greet.custom} onChange={e => setGreet({ ...greet, custom: e.target.value })} /></Field>
              <Field label="نص التهنئة"><Textarea value={greet.message} onChange={e => setGreet({ ...greet, message: e.target.value })} /></Field>
            </div>
          )}

          {/* step 3 — style */}
          {step === 3 && (
            <div className="card card-pad col" style={{ gap: 16 }}>
              <div>
                <div className="section-title">القالب</div>
                <div className="grid grid-4" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
                  {POSTER_TEMPLATES.map(t => (
                    <button key={t.id} className={["choice", style.template === t.id && "on"].filter(Boolean).join(" ")} style={{ flexDirection: "column", padding: 10, gap: 8, alignItems: "stretch" }} onClick={() => setStyle({ ...style, template: t.id })}>
                      <div style={{ height: 54, borderRadius: 8, background: `linear-gradient(155deg, ${t.accent}, ${t.accent}bb)` }} />
                      <div style={{ fontWeight: 600, fontSize: 12.5, textAlign: "center" }}>{t.name}</div>
                    </button>
                  ))}
                </div>
              </div>
              <Field label="المقاس"><Segmented block value={style.size} onChange={v => setStyle({ ...style, size: v })}
                options={[{ value: "square", label: "مربّع 1080×1080", icon: "layout" }, { value: "story", label: "ستوري 1080×1920", icon: "smartphone" }]} /></Field>
              <Field label="وصف الخلفية / النمط الفني (اختياري)" hint="صف الجو الذي تريده وسيولّده الذكاء الاصطناعي">
                <Input placeholder="مثال: حبوب قهوة على خلفية داكنة وإضاءة دافئة" value={style.prompt} onChange={e => setStyle({ ...style, prompt: e.target.value })} />
              </Field>
            </div>
          )}

          {/* nav */}
          <div className="row between">
            <Btn variant="ghost" onClick={() => step === 1 ? onClose() : setStep(step - 1)}>{step === 1 ? "إلغاء" : "السابق"}</Btn>
            {step < 3
              ? <Btn variant="primary" iconEnd="chevLeft" onClick={() => setStep(step + 1)} disabled={step === 2 && mode === "offer" && picked.length === 0}>التالي</Btn>
              : <Btn variant="primary" icon={gen ? null : "sparkles"} onClick={generate} disabled={gen}>{gen ? <><div className="spinner spinner-white" />جارٍ الإنشاء…</> : "توليد البوستر"}</Btn>}
          </div>
        </div>

        {/* live preview */}
        <div className="card card-pad" style={{ position: "sticky", top: 84 }}>
          <div className="section-title"><Icon name="eye" size={15} />معاينة</div>
          <div style={{ background: "var(--surface-2)", borderRadius: 12, padding: 20, display: "grid", placeItems: "center", border: "1px solid var(--border)" }}>
            {gen ? <div className="col" style={{ alignItems: "center", gap: 12, padding: 30 }}><div className="spinner spinner-lg" /><span className="muted" style={{ fontSize: 12.5 }}>يولّد الذكاء الاصطناعي…</span></div>
              : <PosterPreview poster={previewPoster} width={style.size === "story" ? 150 : 210} />}
          </div>
          <div className="muted" style={{ fontSize: 11.5, textAlign: "center", marginTop: 10 }}>{mode === "offer" ? "بوستر عرض" : "بوستر تهنئة"} · {style.size === "story" ? "ستوري" : "مربّع"}</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PostersPage, PosterPreview });
