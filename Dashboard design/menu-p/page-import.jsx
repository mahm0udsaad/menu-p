/* AI Menu Import — upload → processing → review → success */

const IMPORTED = [
  { id: "ic1", name: "القهوة الساخنة", open: true, items: [
    { id: "ii1", name: "إسبريسو", desc: "جرعة مركّزة", price: "14", flag: false },
    { id: "ii2", name: "كابتشينو", desc: "إسبريسو مع رغوة حليب", price: "18", flag: false },
    { id: "ii3", name: "موكا", desc: "شوكولاتة وحليب", price: "21", flag: true },
  ]},
  { id: "ic2", name: "القهوة الباردة", open: true, items: [
    { id: "ii4", name: "آيس أمريكانو", desc: "إسبريسو وماء بارد", price: "16", flag: false },
    { id: "ii5", name: "آيس سبانش لاتيه", desc: "حليب مكثّف", price: "23", flag: false },
    { id: "ii6", name: "فرابتشينو", desc: "—", price: "0", flag: true },
  ]},
  { id: "ic3", name: "حلويات", open: false, items: [
    { id: "ii7", name: "تشيز كيك", desc: "نيويورك", price: "26", flag: false },
    { id: "ii8", name: "براوني", desc: "شوكولاتة داكنة", price: "19", flag: false },
  ]},
];

function ImportPage() {
  const { go } = useNav();
  const [step, setStep] = React.useState("upload"); // upload | processing | review | done
  const [tab, setTab] = React.useState("file"); // file | url | sa
  const [drag, setDrag] = React.useState(false);
  const [cats, setCats] = React.useState(IMPORTED);
  const [procStep, setProcStep] = React.useState(0);

  const startProcessing = () => {
    setStep("processing"); setProcStep(0);
    let i = 0;
    const iv = setInterval(() => { i++; setProcStep(i); if (i >= 3) { clearInterval(iv); setTimeout(() => setStep("review"), 600); } }, 1100);
  };
  const totalItems = cats.reduce((s, c) => s + c.items.length, 0);
  const flagged = cats.reduce((s, c) => s + c.items.filter(i => i.flag).length, 0);

  const updItem = (cid, iid, k, v) => setCats(cs => cs.map(c => c.id !== cid ? c : { ...c, items: c.items.map(it => it.id !== iid ? it : { ...it, [k]: v }) }));
  const delItem = (cid, iid) => setCats(cs => cs.map(c => c.id !== cid ? c : { ...c, items: c.items.filter(it => it.id !== iid) }));
  const delCat = (cid) => setCats(cs => cs.filter(c => c.id !== cid));
  const toggleCat = (cid) => setCats(cs => cs.map(c => c.id !== cid ? c : { ...c, open: !c.open }));
  const updCatName = (cid, v) => setCats(cs => cs.map(c => c.id !== cid ? c : { ...c, name: v }));

  return (
    <div className="page">
      <div className="page-head">
        <div className="row" style={{ gap: 12 }}>
          <Btn variant="secondary" size="sm" icon="arrowRight" onClick={() => go({ page: "dashboard", tab: "menus" })}>لوحة التحكم</Btn>
          <div><h2 style={{ fontSize: 19 }}>استيراد قائمة بالذكاء الاصطناعي</h2><p>حوّل قائمتك القديمة (PDF أو صورة) إلى قائمة رقمية قابلة للتحرير.</p></div>
        </div>
      </div>

      {/* progress header */}
      <div className="card card-pad" style={{ marginBottom: 18 }}>
        <div className="row between" style={{ maxWidth: 560, margin: "0 auto" }}>
          {[["رفع", "upload"], ["معالجة", "processing"], ["مراجعة", "review"], ["تم", "done"]].map((s, i, arr) => {
            const order = ["upload", "processing", "review", "done"];
            const cur = order.indexOf(step), me = order.indexOf(s[1]);
            const state = me < cur ? "done" : me === cur ? "active" : "pending";
            return (
              <React.Fragment key={s[1]}>
                <div className="col" style={{ alignItems: "center", gap: 6 }}>
                  <div className="step-dot" style={{ width: 32, height: 32, ...(state === "done" ? { background: "var(--success)", borderColor: "var(--success)", color: "#fff" } : state === "active" ? { borderColor: "var(--primary)", color: "var(--primary)" } : {}) }}>
                    {state === "done" ? <Icon name="check" size={15} strokeWidth={3} /> : i + 1}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: state === "pending" ? "var(--text-4)" : "var(--text)" }}>{s[0]}</span>
                </div>
                {i < arr.length - 1 && <div style={{ flex: 1, height: 2, background: me < cur ? "var(--success)" : "var(--border)", margin: "0 6px", marginBottom: 20 }} />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {step === "upload" && (
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div className="segmented seg-block" style={{ marginBottom: 16 }}>
            {[["file", "رفع ملف", "upload"], ["url", "من رابط", "link"], ["sa", "menus.sa", "globe"]].map(t => (
              <button key={t[0]} className={tab === t[0] ? "on" : ""} onClick={() => setTab(t[0])}><Icon name={t[2]} size={15} />{t[1]}</button>
            ))}
          </div>

          {tab === "file" && (
            <div className={["upload-zone", drag && "drag"].filter(Boolean).join(" ")}
              onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); startProcessing(); }}
              onClick={startProcessing}>
              <div className="stat-ico" style={{ width: 52, height: 52, borderRadius: 14, background: "var(--primary-soft)", color: "var(--primary)", margin: "0 auto 12px" }}><Icon name="upload" size={26} /></div>
              <div style={{ fontWeight: 650, fontSize: 15 }}>اسحب وأفلِت ملف القائمة هنا</div>
              <div className="muted" style={{ fontSize: 13, margin: "4px 0 12px" }}>أو اضغط للاختيار من جهازك</div>
              <div className="row" style={{ gap: 7, justifyContent: "center" }}>
                <Chip icon="file">PDF</Chip><Chip icon="image">JPG</Chip><Chip icon="image">PNG</Chip><Chip>حتى 10 ميغابايت</Chip>
              </div>
            </div>
          )}
          {tab === "url" && (
            <div className="card card-pad col" style={{ gap: 14 }}>
              <Field label="رابط القائمة" hint="رابط مباشر لملف PDF أو صورة أو صفحة قائمة على الويب">
                <Input placeholder="https://example.com/menu.pdf" className="input ltr" style={{ textAlign: "start" }} />
              </Field>
              <Btn variant="primary" icon="sparkles" onClick={startProcessing}>استيراد من الرابط</Btn>
            </div>
          )}
          {tab === "sa" && (
            <div className="card card-pad col" style={{ gap: 14 }}>
              <Banner tone="info" title="وضع menus.sa:" >نستورد قائمتك مباشرة من حسابك على منصّة menus.sa مع التصنيفات والصور والأسعار.</Banner>
              <Field label="رابط أو معرّف المطعم على menus.sa">
                <div className="input-affix"><Input placeholder="underground" className="input ltr" style={{ textAlign: "start" }} /><span className="affix">menus.sa/</span></div>
              </Field>
              <Btn variant="primary" icon="download" onClick={startProcessing}>استيراد من menus.sa</Btn>
            </div>
          )}
          <div className="row" style={{ gap: 7, justifyContent: "center", marginTop: 14, color: "var(--text-3)", fontSize: 12.5 }}>
            <Icon name="lock" size={13} />ملفاتك تُعالَج بأمان وتُحذف بعد الاستيراد.
          </div>
        </div>
      )}

      {step === "processing" && (
        <div className="card card-pad" style={{ maxWidth: 520, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <div className="stat-ico" style={{ width: 56, height: 56, borderRadius: 16, background: "var(--primary-soft)", color: "var(--primary)", margin: "0 auto 12px" }}><div className="spinner spinner-lg" /></div>
            <h3 style={{ margin: 0, fontSize: 17 }}>جارٍ معالجة قائمتك…</h3>
            <p className="muted" style={{ margin: "4px 0 0", fontSize: 13 }}>يحلّل الذكاء الاصطناعي الملف ويستخرج العناصر.</p>
          </div>
          <ProgressSteps steps={[
            { label: "رفع الملف", state: procStep > 0 ? "done" : "active" },
            { label: "استخراج العناصر بالذكاء الاصطناعي", state: procStep > 1 ? "done" : procStep === 1 ? "active" : "pending" },
            { label: "التحقّق من الأسعار والعناصر", state: procStep > 2 ? "done" : procStep === 2 ? "active" : "pending" },
          ]} />
          <div className="banner banner-warn" style={{ marginTop: 14 }}><Icon name="alert" size={16} />لا تُغلق هذه الصفحة حتى تكتمل المعالجة.</div>
        </div>
      )}

      {step === "review" && (
        <div style={{ maxWidth: 760, margin: "0 auto", paddingBottom: 80 }}>
          <div className="grid grid-3" style={{ marginBottom: 16 }}>
            <StatCard icon="layers" tone="primary" value={cats.length} label="تصنيف" />
            <StatCard icon="list" tone="info" value={totalItems} label="عنصر" />
            <StatCard icon="alert" tone="warning" value={flagged} label="بحاجة لمراجعة" />
          </div>
          {flagged > 0 && <Banner tone="warn" title="عناصر منخفضة الثقة:" >{`راجع ${flagged} عنصر — قد تكون الأسعار أو الأسماء غير دقيقة. المعلَّمة بـ`} <Icon name="alert" size={12} style={{ verticalAlign: "middle" }} /> {"تحتاج انتباهك."}</Banner>}

          <div className="col" style={{ gap: 12, marginTop: 16 }}>
            {cats.map(c => (
              <div className="card" key={c.id}>
                <div className="row" style={{ gap: 10, padding: "12px 14px", borderBottom: c.open ? "1px solid var(--border)" : "none" }}>
                  <button className="btn btn-ghost btn-icon btn-xs" onClick={() => toggleCat(c.id)}><Icon name={c.open ? "chevDown" : "chevLeft"} size={16} /></button>
                  <Input value={c.name} onChange={e => updCatName(c.id, e.target.value)} className="input" style={{ height: 34, fontWeight: 650, maxWidth: 280, border: "1px solid transparent", background: "transparent", paddingInline: 8 }} />
                  <Chip>{c.items.length} عنصر</Chip>
                  <div style={{ marginInlineStart: "auto" }} />
                  <Btn variant="ghost" size="xs" icon="trash" onClick={() => delCat(c.id)} style={{ color: "var(--danger-fg)" }} />
                </div>
                {c.open && (
                  <div>
                    {c.items.map(it => (
                      <div key={it.id} className="row" style={{ gap: 10, padding: "11px 14px", borderBottom: "1px solid var(--border)", alignItems: "flex-start", background: it.flag ? "var(--warning-soft)" : "transparent" }}>
                        <div style={{ width: 42, height: 42, flexShrink: 0 }}><Placeholder label="صورة" h={42} radius={8} style={{ fontSize: 9 }} /></div>
                        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1.3fr 1.6fr 90px", gap: 8 }}>
                          <Input value={it.name} onChange={e => updItem(c.id, it.id, "name", e.target.value)} placeholder="اسم العنصر" style={{ height: 34 }} />
                          <Input value={it.desc} onChange={e => updItem(c.id, it.id, "desc", e.target.value)} placeholder="الوصف" style={{ height: 34 }} />
                          <div className="input-affix"><Input value={it.price} onChange={e => updItem(c.id, it.id, "price", e.target.value)} className="input tnum" style={{ height: 34, paddingInlineEnd: 38, textAlign: "start" }} /><span className="affix">{CUR_SYM}</span></div>
                        </div>
                        {it.flag && <span title="بحاجة لمراجعة" style={{ color: "var(--warning-fg)", marginTop: 8 }}><Icon name="alert" size={16} /></span>}
                        <Btn variant="ghost" size="xs" icon="x" onClick={() => delItem(c.id, it.id)} style={{ marginTop: 4 }} />
                      </div>
                    ))}
                    <button className="btn btn-ghost btn-sm" style={{ margin: 8 }} onClick={() => setCats(cs => cs.map(x => x.id !== c.id ? x : { ...x, items: [...x.items, { id: "n" + Date.now(), name: "", desc: "", price: "", flag: false }] }))}><Icon name="plus" size={14} />إضافة عنصر</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* sticky CTA */}
          <div style={{ position: "sticky", bottom: 0, marginTop: 16, padding: "14px 0" }}>
            <div className="card card-pad row between" style={{ boxShadow: "var(--sh-lg)", gap: 12, flexWrap: "wrap" }}>
              <Btn variant="ghost" icon="refresh" onClick={() => { setStep("upload"); setCats(IMPORTED); }}>البدء من جديد</Btn>
              <div className="row" style={{ gap: 9 }}>
                <span className="muted" style={{ fontSize: 13 }}>{cats.length} تصنيف · {totalItems} عنصر</span>
                <Btn variant="primary" icon="check" onClick={() => setStep("done")}>استيراد إلى قائمة</Btn>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="card card-pad" style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
          <div className="stat-ico" style={{ width: 56, height: 56, borderRadius: 16, background: "var(--success-soft)", color: "var(--success-fg)", margin: "8px auto 14px" }}><Icon name="checkCircle" size={28} /></div>
          <h3 style={{ margin: "0 0 5px", fontSize: 18 }}>تم الاستيراد بنجاح!</h3>
          <p className="muted" style={{ margin: "0 0 18px" }}>أُنشئت قائمة جديدة بـ {cats.length} تصنيف و {totalItems} عنصر.</p>
          <div className="row" style={{ gap: 9, justifyContent: "center" }}>
            <Btn variant="primary" icon="edit" onClick={() => go({ page: "editor" })}>فتح محرّر القائمة</Btn>
            <Btn variant="secondary" icon="upload" onClick={() => { setStep("upload"); setCats(IMPORTED); }}>استيراد قائمة أخرى</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ImportPage });
