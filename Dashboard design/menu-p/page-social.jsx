/* Social Publishing — connected accounts, composer, history */

function PlatformIcon({ platform, size = 18 }) {
  const m = platformMeta(platform);
  return <span style={{ color: m.color, display: "inline-flex" }}><Icon name={m.icon} size={size} fill={platform === "tiktok" ? "none" : "currentColor"} stroke={platform === "tiktok" ? "currentColor" : "none"} strokeWidth={platform === "tiktok" ? 1.9 : 0} /></span>;
}

const CAPTIONS = {
  menu: "اكتشف قائمتنا الكاملة 📋 امسح الكود أو اضغط الرابط لتصفّح كل أطباقنا ومشروباتنا المختصة في Underground ☕️ #الرياض #قهوة_مختصة",
  page: "جرّب أصنافنا المميّزة 🍽️ تصفّح قائمتنا واطلب ما يناسبك — Underground، حي حطين، الرياض.",
  poster: "عرض القهوة المختصة لفترة محدودة ☕️ خصم خاص على أطباقنا المفضّلة — لا تفوّت الفرصة! #عروض #Underground",
  qr: "امسح وابدأ 📱 قائمتنا الرقمية بين يديك — سرعة وسهولة في Underground.",
};

function SocialPage() {
  const { go } = useNav();
  const [accounts, setAccounts] = React.useState(ACCOUNTS);
  const [target, setTarget] = React.useState("menu");
  const [menuId, setMenuId] = React.useState(MENUS[0].id);
  const [posterId, setPosterId] = React.useState(POSTERS.find(p => p.status === "ready")?.id);
  const [caption, setCaption] = React.useState(CAPTIONS.menu);
  const [selAcc, setSelAcc] = React.useState(["a1", "a2"]);
  const [publishing, setPublishing] = React.useState(false);
  const [results, setResults] = React.useState(null);
  const [discon, setDiscon] = React.useState(null);
  const [banner, setBanner] = React.useState({ tone: "success", text: "تم ربط حساب إنستغرام @underground.cafe بنجاح." });

  React.useEffect(() => { setCaption(CAPTIONS[target]); setResults(null); }, [target]);
  const readyPosters = POSTERS.filter(p => p.status === "ready");
  const toggleAcc = (id) => setSelAcc(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const publish = () => {
    setPublishing(true); setResults(null);
    setTimeout(() => {
      const res = selAcc.map(id => {
        const a = accounts.find(x => x.id === id);
        const ok = a.status === "connected";
        return { id, name: a.name, platform: a.platform, ok, msg: ok ? "تم النشر بنجاح" : "انتهت صلاحية الاتصال — أعد الربط" };
      });
      setResults(res); setPublishing(false);
      const okN = res.filter(r => r.ok).length;
      toast({ tone: okN === res.length ? "success" : "warn", title: `نُشر على ${okN} من ${res.length} حسابات` });
    }, 2000);
  };

  return (
    <div className="page page-wide">
      <div className="page-head">
        <div className="row" style={{ gap: 12 }}>
          <Btn variant="secondary" size="sm" icon="arrowRight" onClick={() => go({ page: "dashboard", tab: "overview" })}>لوحة التحكم</Btn>
          <div><h2 style={{ fontSize: 19 }}>النشر الاجتماعي</h2><p>اربط حساباتك وانشر قوائمك وبوستراتك مباشرة.</p></div>
        </div>
      </div>

      {banner && <div style={{ marginBottom: 16 }}><Banner tone={banner.tone} title={banner.tone === "success" ? "تم الربط:" : "تنبيه:"} onClose={() => setBanner(null)}>{banner.text}</Banner></div>}

      <div className="grid split-grid" style={{ gridTemplateColumns: "minmax(0,1fr) 360px", alignItems: "start", gap: 18 }}>
        {/* composer */}
        <div className="col" style={{ gap: 16 }}>
          <div className="card card-pad col" style={{ gap: 16 }}>
            <div className="section-title"><Icon name="send" size={15} />إنشاء منشور</div>
            <Field label="نوع المحتوى">
              <div className="segmented seg-block">
                {[["menu", "القائمة + QR", "qr"], ["page", "صفحة قائمة", "fileText"], ["poster", "بوستر", "image"], ["qr", "كود QR", "qr"]].map(t => (
                  <button key={t[0]} className={target === t[0] ? "on" : ""} onClick={() => setTarget(t[0])}><Icon name={t[2]} size={14} />{t[1]}</button>
                ))}
              </div>
            </Field>

            {(target === "menu" || target === "page" || target === "qr") && (
              <Field label="اختر القائمة"><Select value={menuId} onChange={e => setMenuId(e.target.value)} options={MENUS.filter(m => m.status === "published").map(m => ({ value: m.id, label: m.name }))} /></Field>
            )}
            {target === "page" && <Banner tone="info"><b>ملاحظة:</b> روابط صفحات القوائم المفردة مدعومة على فيسبوك فقط حالياً.</Banner>}

            {target === "poster" && (
              <Field label="اختر بوستراً">
                <div className="row wrap" style={{ gap: 10 }}>
                  {readyPosters.map(p => (
                    <button key={p.id} onClick={() => setPosterId(p.id)} style={{ border: posterId === p.id ? "2px solid var(--primary)" : "2px solid var(--border)", borderRadius: 10, padding: 4, background: "none", cursor: "pointer" }}>
                      <PosterPreview poster={p} width={p.size === "story" ? 64 : 84} />
                    </button>
                  ))}
                </div>
              </Field>
            )}

            <Field label="النص (تم توليده تلقائياً بالعربية)">
              <Textarea value={caption} onChange={e => setCaption(e.target.value)} style={{ minHeight: 100 }} />
              <div className="row between" style={{ marginTop: 2 }}>
                <span className="hint">{caption.length} حرف</span>
                <Btn variant="ghost" size="xs" icon="sparkles" onClick={() => { setCaption(CAPTIONS[target] + " ✨"); toast({ title: "تم توليد نص جديد" }); }}>إعادة توليد النص</Btn>
              </div>
            </Field>

            <Field label="انشر على">
              <div className="col" style={{ gap: 8 }}>
                {accounts.map(a => (
                  <button key={a.id} className={["choice", selAcc.includes(a.id) && "on"].filter(Boolean).join(" ")} style={{ padding: 11, alignItems: "center", gap: 11, opacity: a.status === "connected" ? 1 : 0.7 }} onClick={() => a.status === "connected" && toggleAcc(a.id)} disabled={a.status !== "connected"}>
                    <div style={{ width: 18, height: 18, borderRadius: 5, border: selAcc.includes(a.id) ? "none" : "2px solid var(--border-strong)", background: selAcc.includes(a.id) ? "var(--primary)" : "transparent", display: "grid", placeItems: "center", flexShrink: 0 }}>{selAcc.includes(a.id) && <Icon name="check" size={12} strokeWidth={3} style={{ color: "#fff" }} />}</div>
                    <PlatformIcon platform={a.platform} size={20} />
                    <div className="ltr" style={{ textAlign: "start", flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{a.name}</div></div>
                    <StatusChip status={a.status} />
                  </button>
                ))}
              </div>
            </Field>

            {results && (
              <div className="col" style={{ gap: 8 }}>
                <div className="section-title">نتائج النشر</div>
                {results.map(r => (
                  <div key={r.id} className={`banner banner-${r.ok ? "success" : "danger"}`}>
                    <PlatformIcon platform={r.platform} size={17} />
                    <div className="banner-body"><b className="ltr">{r.name}</b> — {r.msg}</div>
                    {r.ok ? <Icon name="checkCircle" size={17} /> : <Btn variant="danger-soft" size="xs" onClick={() => toast({ title: "إعادة الربط…" })}>إعادة الربط</Btn>}
                  </div>
                ))}
              </div>
            )}

            <Btn variant="primary" size="lg" block icon={publishing ? null : "send"} disabled={publishing || selAcc.length === 0} onClick={publish}>
              {publishing ? <><div className="spinner spinner-white" />جارٍ النشر على {selAcc.length} حسابات…</> : `انشر الآن (${selAcc.length})`}
            </Btn>
          </div>

          {/* history */}
          <div className="card">
            <div className="card-head"><Icon name="clock" size={16} style={{ color: "var(--text-3)" }} /><h3>سجلّ المنشورات</h3></div>
            <div className="tbl-wrap" style={{ border: "none", borderRadius: 0 }}>
              <table className="tbl">
                <thead><tr><th>المنصّة</th><th>النوع</th><th>الحالة</th><th>التاريخ</th><th>النص</th><th>المعرّف</th></tr></thead>
                <tbody>
                  {POST_HISTORY.map(h => (
                    <tr key={h.id}>
                      <td><div className="row" style={{ gap: 8 }}><PlatformIcon platform={h.platform} size={17} /><span className="ltr" style={{ fontSize: 12.5, fontWeight: 600 }}>{h.account}</span></div></td>
                      <td><Chip>{KIND_LABEL[h.kind]}</Chip></td>
                      <td><StatusChip status={h.status} /></td>
                      <td className="ltr muted" style={{ fontSize: 12, whiteSpace: "nowrap", textAlign: "start" }}>{h.date}</td>
                      <td style={{ maxWidth: 200 }}><div style={{ fontSize: 12, color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.caption}</div></td>
                      <td className="ltr" style={{ fontSize: 11.5, color: h.status === "failed" ? "var(--danger-fg)" : "var(--text-4)", textAlign: "start" }}>{h.ref}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* connected accounts */}
        <div className="card card-pad" style={{ position: "sticky", top: 84 }}>
          <div className="section-title"><Icon name="link" size={15} />الحسابات المرتبطة</div>
          <div className="col" style={{ gap: 11 }}>
            {accounts.map(a => {
              const m = platformMeta(a.platform);
              return (
                <div key={a.id} className="card card-pad" style={{ padding: 13, boxShadow: "none", background: "var(--surface-2)" }}>
                  <div className="row" style={{ gap: 10 }}>
                    <div className="stat-ico" style={{ width: 36, height: 36, background: "#fff", border: "1px solid var(--border)", flexShrink: 0 }}><PlatformIcon platform={a.platform} size={19} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="ltr" style={{ fontWeight: 650, fontSize: 13, textAlign: "start" }}>{a.name}</div>
                      <div className="muted" style={{ fontSize: 11.5 }}>{m.label} · {a.followers} متابع</div>
                    </div>
                    <StatusChip status={a.status} />
                  </div>
                  <div className="row" style={{ gap: 7, marginTop: 11 }}>
                    {a.status === "connected"
                      ? <Btn variant="secondary" size="sm" block icon="slash" onClick={() => setDiscon(a)}>قطع الربط</Btn>
                      : <Btn variant="primary" size="sm" block icon="refresh" onClick={() => { setAccounts(acc => acc.map(x => x.id === a.id ? { ...x, status: "connected" } : x)); toast({ tone: "success", title: "تم إعادة الربط", msg: a.name }); }}>إعادة الربط</Btn>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="divider" style={{ margin: "14px 0" }} />
          <div className="section-title">ربط حساب جديد</div>
          <div className="col" style={{ gap: 8 }}>
            <Btn variant="secondary" block icon="meta" onClick={() => { setBanner({ tone: "success", text: "تم بدء ربط حساب Meta (فيسبوك + إنستغرام)." }); toast({ tone: "info", title: "ربط Meta", msg: "نافذة الربط تجريبية" }); }}>ربط Meta (فيسبوك + إنستغرام)</Btn>
            <Btn variant="secondary" block icon="tiktok" onClick={() => { setBanner({ tone: "success", text: "تم بدء ربط حساب TikTok." }); toast({ tone: "info", title: "ربط TikTok" }); }}>ربط TikTok</Btn>
          </div>
        </div>
      </div>

      <ConfirmModal open={!!discon} onClose={() => setDiscon(null)} danger icon="slash" title="قطع ربط الحساب؟" confirmLabel="قطع الربط"
        message={discon ? `سيتم إيقاف النشر التلقائي إلى ${discon.name}. يمكنك إعادة الربط في أي وقت.` : ""}
        onConfirm={() => { setAccounts(acc => acc.map(x => x.id === discon.id ? { ...x, status: "revoked" } : x)); setSelAcc(s => s.filter(id => id !== discon.id)); toast({ tone: "success", title: "تم قطع الربط" }); setDiscon(null); }} />
    </div>
  );
}

Object.assign(window, { SocialPage, PlatformIcon });
