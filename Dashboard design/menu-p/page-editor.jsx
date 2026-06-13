/* Menu Editor — template selection + live editor + publish */

function EditorPage() {
  const { go } = useNav();
  const [mode, setMode] = React.useState("templates"); // templates | editor
  const [tpl, setTpl] = React.useState(TEMPLATES[0]);
  const [preview, setPreviewTpl] = React.useState(null);

  if (mode === "editor") return <EditorCanvas tpl={tpl} onBack={() => setMode("templates")} onExit={() => go({ page: "dashboard", tab: "menus" })} />;

  return (
    <div className="page page-wide">
      <div className="page-head">
        <div className="row" style={{ gap: 12 }}>
          <Btn variant="secondary" size="sm" icon="arrowRight" onClick={() => go({ page: "dashboard", tab: "menus" })}>لوحة التحكم</Btn>
          <div><h2 style={{ fontSize: 19 }}>اختر قالباً</h2><p>ابدأ تصميم قائمتك من أحد القوالب الجاهزة.</p></div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}>
        {TEMPLATES.map(t => {
          const demoMenu = { name: "قائمتك", accent: t.accent, categories: MENUS[0].categories };
          const sel = tpl.id === t.id;
          return (
            <div key={t.id} className="card card-hover" style={{ overflow: "hidden", border: sel ? "2px solid var(--primary)" : undefined }}>
              <div style={{ background: "var(--surface-2)", padding: 18, display: "grid", placeItems: "center", position: "relative", borderBottom: "1px solid var(--border)" }}>
                <MenuThumb menu={demoMenu} width={150} />
                <div style={{ position: "absolute", top: 11, insetInlineStart: 11 }}><Chip>{t.cat}</Chip></div>
                {sel && <div style={{ position: "absolute", top: 11, insetInlineEnd: 11 }}><div className="stat-ico" style={{ width: 26, height: 26, background: "var(--primary)", color: "#fff" }}><Icon name="check" size={15} strokeWidth={3} /></div></div>}
              </div>
              <div className="card-pad">
                <div className="row between"><h3 style={{ margin: 0, fontSize: 15 }}>{t.name}</h3><span style={{ width: 16, height: 16, borderRadius: 5, background: t.accent }} /></div>
                <div className="muted" style={{ fontSize: 12.5, margin: "4px 0 12px" }}>{t.desc}</div>
                <div className="row" style={{ gap: 7 }}>
                  <Btn variant="secondary" size="sm" icon="eye" style={{ flex: 1 }} onClick={() => setPreviewTpl(t)}>معاينة</Btn>
                  <Btn variant={sel ? "primary" : "soft"} size="sm" style={{ flex: 1 }} icon={sel ? "check" : null} onClick={() => { setTpl(t); setMode("editor"); }}>{sel ? "متابعة" : "اختيار"}</Btn>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* preview drawer */}
      <Drawer open={!!preview} onClose={() => setPreviewTpl(null)} wide>
        {preview && <>
          <DrawerHead icon="eye" title={`معاينة قالب «${preview.name}»`} sub={preview.desc} onClose={() => setPreviewTpl(null)} />
          <div className="drawer-body" style={{ background: "var(--surface-2)", display: "grid", placeItems: "start center", paddingTop: 24 }}>
            <MenuThumb menu={{ name: "القائمة الرئيسية", accent: preview.accent, categories: MENUS[0].categories }} width={280} full />
          </div>
          <div className="drawer-foot">
            <Btn variant="ghost" onClick={() => setPreviewTpl(null)} block>إغلاق</Btn>
            <Btn variant="primary" block icon="check" onClick={() => { setTpl(preview); setPreviewTpl(null); setMode("editor"); }}>اختيار هذا القالب</Btn>
          </div>
        </>}
      </Drawer>
    </div>
  );
}

/* ---- editor canvas ---- */
function EditorCanvas({ tpl, onBack, onExit }) {
  const [cats, setCats] = React.useState(() => JSON.parse(JSON.stringify(MENUS[0].categories)));
  const [accent, setAccent] = React.useState(tpl.accent);
  const [lang, setLang] = React.useState("ar");
  const [view, setView] = React.useState("edit"); // edit | preview
  const [panel, setPanel] = React.useState(null); // font | rows | bg | template | null
  const [publish, setPublish] = React.useState(null); // null | progress | done
  const [gate, setGate] = React.useState(false);
  const [pubStep, setPubStep] = React.useState(0);
  const [dragItem, setDragItem] = React.useState(null);
  const [bg, setBg] = React.useState("#ffffff");
  const [font, setFont] = React.useState("Plex");
  const [density, setDensity] = React.useState("normal");

  const usage = { used: 2, total: 3 };
  const itemCount = cats.reduce((s, c) => s + c.items.length, 0);

  const addCat = () => setCats(cs => [...cs, { id: "nc" + Date.now(), name: "تصنيف جديد", items: [] }]);
  const delCat = (id) => setCats(cs => cs.filter(c => c.id !== id));
  const updCat = (id, k, v) => setCats(cs => cs.map(c => c.id === id ? { ...c, [k]: v } : c));
  const addItem = (cid) => setCats(cs => cs.map(c => c.id !== cid ? c : { ...c, items: [...c.items, { id: "ni" + Date.now(), name: "عنصر جديد", desc: "", price: 0 }] }));
  const delItem = (cid, iid) => setCats(cs => cs.map(c => c.id !== cid ? c : { ...c, items: c.items.filter(i => i.id !== iid) }));
  const updItem = (cid, iid, k, v) => setCats(cs => cs.map(c => c.id !== cid ? c : { ...c, items: c.items.map(i => i.id !== iid ? i : { ...i, [k]: v }) }));

  const onDrop = (cid, targetId) => {
    if (!dragItem || dragItem.cid !== cid) return;
    setCats(cs => cs.map(c => {
      if (c.id !== cid) return c;
      const arr = [...c.items];
      const from = arr.findIndex(i => i.id === dragItem.iid);
      const to = arr.findIndex(i => i.id === targetId);
      if (from < 0 || to < 0) return c;
      const [m] = arr.splice(from, 1); arr.splice(to, 0, m);
      return { ...c, items: arr };
    }));
    setDragItem(null);
  };

  const startPublish = () => {
    setPublish("progress"); setPubStep(0);
    let i = 0;
    const iv = setInterval(() => { i++; setPubStep(i); if (i >= 3) { clearInterval(iv); setTimeout(() => setPublish("done"), 600); } }, 1000);
  };

  const fontFam = font === "Mono" ? "'IBM Plex Mono', monospace" : font === "Serif" ? "Georgia, 'Times New Roman', serif" : "var(--font)";
  const rowGap = density === "compact" ? 6 : density === "roomy" ? 16 : 10;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - var(--topbar-h))" }}>
      {/* sticky control bar */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "10px 18px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", position: "sticky", top: 0, zIndex: 20 }}>
        <Btn variant="ghost" size="sm" icon="arrowRight" onClick={onBack}>القوالب</Btn>
        <div style={{ width: 1, height: 24, background: "var(--border)" }} />
        <div className="row" style={{ gap: 7 }}>
          <span className="muted" style={{ fontSize: 12 }}>اللغة:</span>
          <Select value={lang} onChange={e => setLang(e.target.value)} options={MENUS[0].langs.map(c => ({ value: c, label: `${LANGS[c].flag} ${LANGS[c].name}` }))} style={{ height: 34, width: "auto", paddingInlineStart: 30, paddingInlineEnd: 12 }} />
        </div>
        <Btn variant="secondary" size="sm" icon="sparkles" onClick={() => window.__openTranslate && window.__openTranslate()}>ترجمة AI</Btn>
        <div className="topbar-spacer" />
        <Chip tone={usage.used >= usage.total ? "warning" : ""} icon="layers">{usage.used}/{usage.total} قوائم</Chip>
        <Btn variant="secondary" size="sm" icon="refresh" onClick={() => toast({ title: "تم التحديث" })} />
        <Btn variant="secondary" size="sm" icon="fileText" onClick={() => setGate(true)}>معاينة PDF</Btn>
        <Segmented value={view} onChange={setView} options={[{ value: "edit", label: "تحرير", icon: "edit" }, { value: "preview", label: "معاينة", icon: "eye" }]} />
        <Btn variant="primary" size="sm" icon="upload" onClick={() => usage.used >= usage.total ? setGate(true) : startPublish()}>نشر القائمة</Btn>
      </div>

      {/* canvas */}
      <div style={{ flex: 1, overflow: "auto", background: "var(--surface-2)", position: "relative" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 20px 120px" }}>
          {/* live menu paper */}
          <div style={{ background: bg, borderRadius: 14, boxShadow: "var(--sh-lg)", overflow: "hidden", fontFamily: fontFam }}>
            <div style={{ background: accent, color: "#fff", padding: "32px 28px", textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: 28, letterSpacing: "-0.02em" }}>القائمة الرئيسية</div>
              <div style={{ opacity: 0.85, fontSize: 14, marginTop: 4 }}>Underground · {LANGS[lang].name}</div>
            </div>
            <div style={{ padding: "24px 28px" }}>
              {cats.map(c => (
                <div key={c.id} style={{ marginBottom: 26 }}>
                  <div className="row between" style={{ borderBottom: `2px solid ${accent}22`, paddingBottom: 7, marginBottom: 12 }}>
                    {view === "edit"
                      ? <input value={c.name} onChange={e => updCat(c.id, "name", e.target.value)} style={{ fontWeight: 700, fontSize: 19, color: accent, border: "none", background: "transparent", outline: "none", fontFamily: "inherit", flex: 1, padding: 0 }} />
                      : <div style={{ fontWeight: 700, fontSize: 19, color: accent }}>{c.name}</div>}
                    {view === "edit" && <Btn variant="ghost" size="xs" icon="trash" onClick={() => delCat(c.id)} style={{ color: "var(--danger-fg)" }} />}
                  </div>
                  <div className="col" style={{ gap: rowGap }}>
                    {c.items.map(it => (
                      <div key={it.id} draggable={view === "edit"}
                        onDragStart={() => setDragItem({ cid: c.id, iid: it.id })}
                        onDragOver={e => e.preventDefault()} onDrop={() => onDrop(c.id, it.id)}
                        className={dragItem?.iid === it.id ? "dragging" : ""}
                        style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: view === "edit" ? "6px 8px" : 0, borderRadius: 8, transition: "background .1s", cursor: view === "edit" ? "grab" : "default" }}
                        onMouseEnter={e => view === "edit" && (e.currentTarget.style.background = "rgba(0,0,0,.025)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        {view === "edit" && <span style={{ color: "var(--text-4)", marginTop: 5, cursor: "grab" }}><Icon name="grip" size={15} /></span>}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {view === "edit" ? <>
                            <input value={it.name} onChange={e => updItem(c.id, it.id, "name", e.target.value)} placeholder="اسم العنصر" style={{ fontWeight: 600, fontSize: 15.5, border: "none", background: "transparent", outline: "none", width: "100%", fontFamily: "inherit", padding: 0, color: "#1a1a1a" }} />
                            <input value={it.desc} onChange={e => updItem(c.id, it.id, "desc", e.target.value)} placeholder="وصف (اختياري)" style={{ fontSize: 13, color: "#888", border: "none", background: "transparent", outline: "none", width: "100%", fontFamily: "inherit", padding: "2px 0 0" }} />
                          </> : <>
                            <div style={{ fontWeight: 600, fontSize: 15.5, color: "#1a1a1a" }}>{it.name}</div>
                            {it.desc && <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>{it.desc}</div>}
                          </>}
                        </div>
                        {view === "edit"
                          ? <div className="input-affix" style={{ width: 92 }}><input value={it.price} onChange={e => updItem(c.id, it.id, "price", e.target.value)} className="tnum" style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 7, padding: "5px 8px", paddingInlineEnd: 32, fontFamily: "inherit", fontWeight: 700, color: accent, outline: "none", textAlign: "start" }} /><span style={{ position: "absolute", insetInlineEnd: 8, top: 6, fontSize: 11, color: "#aaa" }}>{CUR_SYM}</span></div>
                          : <div style={{ fontWeight: 700, fontSize: 15.5, color: accent, flexShrink: 0 }}>{it.price} {CUR_SYM}</div>}
                        {view === "edit" && <Btn variant="ghost" size="xs" icon="x" onClick={() => delItem(c.id, it.id)} style={{ marginTop: 2 }} />}
                      </div>
                    ))}
                  </div>
                  {view === "edit" && <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => addItem(c.id)}><Icon name="plus" size={14} />إضافة عنصر</button>}
                </div>
              ))}
              {view === "edit" && (
                <button className="btn btn-secondary btn-block" style={{ borderStyle: "dashed", marginTop: 8 }} onClick={addCat}><Icon name="plus" size={15} />إضافة تصنيف</button>
              )}
            </div>
          </div>
        </div>

        {/* floating quick actions */}
        {view === "edit" && (
          <div style={{ position: "sticky", bottom: 20, marginInlineEnd: 20, display: "flex", justifyContent: "flex-end", pointerEvents: "none" }}>
            <div className="card" style={{ display: "inline-flex", gap: 3, padding: 6, boxShadow: "var(--sh-lg)", pointerEvents: "auto", borderRadius: 99 }}>
              {[["font", "type", "الخط والتصميم"], ["rows", "rows", "تنسيق الصفوف"], ["bg", "paint", "خلفية الصفحة"], ["template", "layers", "تبديل القالب"], ["demo", "sparkles", "بيانات تجريبية"]].map(a => (
                <button key={a[0]} className="btn btn-ghost btn-icon btn-sm" title={a[2]} onClick={() => a[0] === "demo" ? toast({ title: "تمت إضافة بيانات تجريبية" }) : setPanel(panel === a[0] ? null : a[0])}
                  style={{ background: panel === a[0] ? "var(--primary-soft)" : undefined, color: panel === a[0] ? "var(--primary)" : undefined }}><Icon name={a[1]} size={18} /></button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* quick action panels (drawer) */}
      <Drawer open={!!panel} onClose={() => setPanel(null)}>
        {panel === "font" && <><DrawerHead icon="type" title="الخط والتصميم" onClose={() => setPanel(null)} />
          <div className="drawer-body col" style={{ gap: 18 }}>
            <Field label="عائلة الخط"><div className="col" style={{ gap: 8 }}>
              {[["Plex", "بلكس عربي — حديث"], ["Serif", "ترويسة كلاسيكية"], ["Mono", "مونوسبيس"]].map(f => (
                <Choice key={f[0]} on={font === f[0]} onClick={() => setFont(f[0])}><div style={{ fontFamily: f[0] === "Mono" ? "monospace" : f[0] === "Serif" ? "Georgia, serif" : "var(--font)", fontWeight: 600 }}>{f[1]}</div></Choice>
              ))}
            </div></Field>
            <Field label="لون التمييز"><SwatchPicker value={accent} onChange={setAccent} colors={["#1c1c1c", "#7a4a2b", "#2b6b5b", "#b03a2e", "#2c2456", "#a8763a"]} /></Field>
          </div></>}
        {panel === "rows" && <><DrawerHead icon="rows" title="تنسيق الصفوف" onClose={() => setPanel(null)} />
          <div className="drawer-body col" style={{ gap: 18 }}>
            <Field label="كثافة الصفوف"><Segmented block value={density} onChange={setDensity} options={[{ value: "compact", label: "مدمج" }, { value: "normal", label: "عادي" }, { value: "roomy", label: "واسع" }]} /></Field>
            <Banner tone="info">يؤثّر هذا على المسافات بين عناصر القائمة في المعاينة و الـ PDF.</Banner>
          </div></>}
        {panel === "bg" && <><DrawerHead icon="paint" title="خلفية الصفحة" onClose={() => setPanel(null)} />
          <div className="drawer-body col" style={{ gap: 18 }}>
            <Field label="لون خلفية القائمة"><SwatchPicker value={bg} onChange={setBg} colors={["#ffffff", "#faf8f6", "#f3ede3", "#f6f3ee", "#fdf6f3", "#f4f6f3"]} /></Field>
          </div></>}
        {panel === "template" && <><DrawerHead icon="layers" title="تبديل القالب" onClose={() => setPanel(null)} />
          <div className="drawer-body grid grid-2" style={{ gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {TEMPLATES.map(t => (
              <button key={t.id} className={["choice", accent === t.accent && "on"].filter(Boolean).join(" ")} style={{ flexDirection: "column", padding: 10, gap: 8, alignItems: "stretch" }} onClick={() => { setAccent(t.accent); toast({ title: `تم تطبيق قالب «${t.name}»` }); }}>
                <div style={{ height: 60, borderRadius: 8, background: t.accent }} /><div style={{ fontWeight: 600, fontSize: 13, textAlign: "center" }}>{t.name}</div>
              </button>
            ))}
          </div></>}
      </Drawer>

      {/* publish progress */}
      <Modal open={publish === "progress"} closeOnBackdrop={false} size="sm">
        <ModalHead icon="upload" title="جارٍ نشر القائمة…" sub="لا تُغلق هذه النافذة" />
        <div className="modal-body" style={{ paddingBottom: 16 }}>
          <ProgressSteps steps={[
            { label: "تجهيز بيانات القائمة", state: pubStep > 0 ? "done" : "active" },
            { label: `نشر النسخ اللغوية (${MENUS[0].langs.length})`, state: pubStep > 1 ? "done" : pubStep === 1 ? "active" : "pending" },
            { label: "اللمسات الأخيرة", state: pubStep > 2 ? "done" : pubStep === 2 ? "active" : "pending" },
          ]} />
        </div>
      </Modal>

      {/* publish success */}
      <Modal open={publish === "done"} onClose={() => setPublish(null)} size="sm">
        <div style={{ textAlign: "center", padding: "26px 22px 8px" }}>
          <div className="stat-ico" style={{ width: 56, height: 56, borderRadius: 16, background: "var(--success-soft)", color: "var(--success-fg)", margin: "0 auto 14px" }}><Icon name="checkCircle" size={28} /></div>
          <h3 style={{ margin: "0 0 5px", fontSize: 18 }}>تم نشر قائمتك! 🎉</h3>
          <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>القائمة الرئيسية متاحة الآن للزبائن بـ {MENUS[0].langs.length} لغات.</p>
        </div>
        <div className="modal-body col" style={{ gap: 8, paddingTop: 14 }}>
          <Btn variant="primary" block icon="fileText" onClick={() => { setPublish(null); toast({ title: "فتح PDF" }); }}>عرض ملف PDF</Btn>
          <Btn variant="secondary" block icon="qr" onClick={() => { setPublish(null); window.__go && window.__go({ page: "dashboard", tab: "qr" }); }}>تصميم بطاقة QR</Btn>
          <Btn variant="ghost" block icon="list" onClick={() => { setPublish(null); onExit(); }}>عرض القوائم المنشورة</Btn>
        </div>
        <div style={{ height: 14 }} />
      </Modal>

      {/* gated PDF / upgrade modal */}
      <Modal open={gate} onClose={() => setGate(false)} size="sm">
        <ModalHead icon="crown" iconTone="primary" title="ميزة الخطة المميّزة" sub="تحميل PDF عالي الجودة والنشر غير المحدود" onClose={() => setGate(false)} />
        <div className="modal-body">
          <div className="gated" style={{ marginBottom: 14 }}>
            <div className="gated-blur" style={{ display: "grid", placeItems: "center", padding: 12, background: "var(--surface-2)", borderRadius: 12 }}>
              <MenuThumb menu={{ name: "القائمة الرئيسية", accent, categories: cats }} width={150} />
            </div>
            <div className="gate-overlay"><div className="stat-ico" style={{ width: 44, height: 44, background: "var(--primary)", color: "#fff" }}><Icon name="lock" size={20} /></div></div>
          </div>
          <div className="col" style={{ gap: 9 }}>
            {["تحميل PDF بدقة طباعة عالية", "قوائم ولغات غير محدودة", "إزالة شعار Menu‑P", "بطاقات QR وبوسترات مميّزة"].map(f => (
              <div className="row" key={f} style={{ gap: 9, fontSize: 13.5 }}><Icon name="check" size={15} strokeWidth={2.6} style={{ color: "var(--success-fg)" }} />{f}</div>
            ))}
          </div>
        </div>
        <div className="modal-foot">
          <Btn variant="ghost" onClick={() => setGate(false)}>لاحقاً</Btn>
          <Btn variant="cta" icon="crown" onClick={() => { setGate(false); toast({ tone: "info", title: "صفحة الترقية تجريبية" }); }}>الترقية الآن</Btn>
        </div>
      </Modal>

      <TranslateMount cats={cats} />
    </div>
  );
}

/* small mount to wire AI translate from control bar */
function TranslateMount({ cats }) {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => { window.__openTranslate = () => setOpen(true); return () => { delete window.__openTranslate; }; }, []);
  return <TranslateDrawer open={open} onClose={() => setOpen(false)} menu={{ name: "القائمة الرئيسية", categories: cats }} />;
}

Object.assign(window, { EditorPage });
