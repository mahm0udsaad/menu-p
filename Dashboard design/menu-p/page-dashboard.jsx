/* Dashboard: Overview, Menus, Restaurant Info, Languages tabs */

/* ============ OVERVIEW ============ */
function Overview() {
  const { go } = useNav();
  const [langDrawer, setLangDrawer] = React.useState(false);
  const quick = [
    { label: "إنشاء قائمة جديدة", icon: "plus", primary: true, onClick: () => go({ page: "editor" }) },
    { label: "استيراد قائمة بالذكاء", icon: "sparkles", onClick: () => go({ page: "import" }) },
    { label: "استوديو البوسترات", icon: "image", onClick: () => go({ page: "posters" }) },
    { label: "النشر الاجتماعي", icon: "share", onClick: () => go({ page: "social" }) },
    { label: "تحميل كود QR", icon: "qr", onClick: () => go({ page: "dashboard", tab: "qr" }) },
    { label: "إضافة لغة", icon: "languages", onClick: () => setLangDrawer(true) },
  ];
  return (
    <div className="page">
      {/* welcome */}
      <div className="page-head">
        <div>
          <h2>أهلاً بعودتك 👋</h2>
          <p>هذه نظرة سريعة على أداء <b style={{ color: "var(--text)" }}>Underground</b> هذا الأسبوع.</p>
        </div>
        <div className="ph-actions">
          <Btn variant="secondary" icon="refresh" onClick={() => toast({ title: "تم تحديث البيانات" })}>تحديث</Btn>
          <Btn variant="primary" icon="plus" onClick={() => go({ page: "editor" })}>قائمة جديدة</Btn>
        </div>
      </div>

      {/* quick actions */}
      <div className="card card-pad" style={{ marginBottom: 18 }}>
        <div className="section-title"><Icon name="zap" size={15} style={{ color: "var(--primary)" }} />إجراءات سريعة</div>
        <div className="grid grid-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))" }}>
          {quick.map(q => (
            <button key={q.label} onClick={q.onClick}
              className={["btn", q.primary ? "btn-primary" : "btn-secondary"].join(" ")}
              style={{ justifyContent: "flex-start", height: 50, paddingInline: 16, fontSize: 14 }}>
              <span className="stat-ico" style={{ width: 30, height: 30, background: q.primary ? "rgba(255,255,255,.18)" : "var(--primary-soft)", color: q.primary ? "#fff" : "var(--primary)" }}><Icon name={q.icon} size={17} /></span>
              {q.label}
              <Icon name="chevLeft" size={16} style={{ marginInlineStart: "auto", opacity: 0.5 }} />
            </button>
          ))}
        </div>
      </div>

      {/* stats */}
      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard icon="list" tone="primary" value="2" label="قوائم منشورة نشطة" sub="من أصل 3 قوائم" />
        <StatCard icon="eye" tone="info" value="1,284" label="مشاهدات هذا الأسبوع" trend={{ dir: "up", value: "18%" }} sub="المشاهدات هذا الأسبوع" />
        <StatCard icon="languages" tone="violet" value="3" label="اللغات المتاحة" sub="العربية، الإنجليزية، الفرنسية" />
        <StatCard icon="qr" tone="warning" value="3" label="بطاقات QR نشطة" sub="آخر تحميل قبل 4 أيام" />
      </div>

      <div className="grid split-grid" style={{ gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", alignItems: "start" }}>
        {/* published menus glance */}
        <div className="card">
          <div className="card-head"><Icon name="list" size={16} style={{ color: "var(--text-3)" }} /><h3>قوائمك</h3>
            <div className="ch-actions"><Btn variant="ghost" size="sm" iconEnd="chevLeft" onClick={() => go({ page: "dashboard", tab: "menus" })}>عرض الكل</Btn></div></div>
          {MENUS.map(m => (
            <div className="list-row" key={m.id}>
              <div style={{ width: 38, height: 50, flexShrink: 0, borderRadius: 6, overflow: "hidden", boxShadow: "var(--sh-xs)" }}>
                <div style={{ transform: "scale(0.19)", transformOrigin: "top right", width: 200 }}><MenuThumb menu={m} width={200} /></div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row" style={{ gap: 8 }}><span style={{ fontWeight: 650, fontSize: 13.5 }}>{m.name}</span><StatusChip status={m.status} /></div>
                <div className="row" style={{ gap: 6, marginTop: 4 }}>
                  {m.langs.map(c => <span key={c} className="lang-flag" style={{ fontSize: 14 }} title={LANGS[c].name}>{LANGS[c].flag}</span>)}
                  <span className="muted" style={{ fontSize: 11.5, marginInlineStart: 4 }} >· {m.views.toLocaleString("en")} مشاهدة</span>
                </div>
              </div>
              <Btn variant="ghost" size="sm" icon="edit" onClick={() => go({ page: "editor" })} />
            </div>
          ))}
        </div>

        {/* activity */}
        <div className="card">
          <div className="card-head"><Icon name="clock" size={16} style={{ color: "var(--text-3)" }} /><h3>آخر النشاطات</h3></div>
          <div style={{ padding: "6px 4px" }}>
            {ACTIVITY.map(a => (
              <div className="row" key={a.id} style={{ gap: 11, padding: "10px 14px", alignItems: "flex-start" }}>
                <div className="stat-ico" style={{ width: 32, height: 32, background: `var(--${a.tone}-soft)`, color: `var(--${a.tone}-fg)`, flexShrink: 0 }}><Icon name={a.icon} size={15} /></div>
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, lineHeight: 1.45 }}>{a.text}</div><div style={{ fontSize: 11.5, color: "var(--text-4)", marginTop: 2 }}>{a.time}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AddLanguageDrawer open={langDrawer} onClose={() => setLangDrawer(false)} menu={MENUS[0]} />
    </div>
  );
}

/* ============ MENUS ============ */
function MenusTab() {
  const { go } = useNav();
  const [langDrawer, setLangDrawer] = React.useState(null);
  const [delMenu, setDelMenu] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const doDelete = () => { setBusy(true); setTimeout(() => { setBusy(false); toast({ tone: "success", title: "تم حذف القائمة", msg: `«${delMenu.name}»` }); setDelMenu(null); }, 800); };
  return (
    <div className="page">
      <div className="page-head">
        <div><h2>القوائم</h2><p>أدر قوائمك المنشورة ونسخها اللغوية.</p></div>
        <div className="ph-actions">
          <Btn variant="secondary" icon="sparkles" onClick={() => go({ page: "import" })}>استيراد بالذكاء</Btn>
          <Btn variant="primary" icon="plus" onClick={() => go({ page: "editor" })}>قائمة جديدة</Btn>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))" }}>
        {MENUS.map(m => {
          const items = m.categories.reduce((s, c) => s + c.items.length, 0);
          return (
            <div className="card card-hover" key={m.id} style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ position: "relative", background: "var(--surface-2)", padding: 18, display: "grid", placeItems: "center", borderBottom: "1px solid var(--border)" }}>
                <MenuThumb menu={m} width={150} />
                <div style={{ position: "absolute", top: 11, insetInlineStart: 11 }}><StatusChip status={m.status} /></div>
                <div style={{ position: "absolute", top: 11, insetInlineEnd: 11 }}>
                  <Popover trigger={<button className="btn btn-secondary btn-icon btn-sm"><Icon name="more" size={16} /></button>}>
                    <div className="menu">
                      <MenuItem icon="edit" onClick={() => go({ page: "editor" })}>تحرير القائمة</MenuItem>
                      <MenuItem icon="download" onClick={() => toast({ title: "جارٍ تحميل PDF", msg: m.name })}>تحميل PDF</MenuItem>
                      <MenuItem icon="external" onClick={() => toast({ tone: "info", title: "فتح القائمة العامة" })}>عرض القائمة العامة</MenuItem>
                      <MenuItem icon="languages" onClick={() => setLangDrawer(m)}>إضافة لغة</MenuItem>
                      <div className="menu-sep" />
                      <MenuItem icon="trash" danger onClick={() => setDelMenu(m)}>حذف القائمة</MenuItem>
                    </div>
                  </Popover>
                </div>
              </div>
              <div className="card-pad" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <div className="row between"><h3 style={{ margin: 0, fontSize: 15 }}>{m.name}</h3></div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 3 }}>{m.categories.length} تصنيف · {items} عنصر</div>
                </div>
                <div className="row wrap" style={{ gap: 6 }}>
                  {m.langs.map(c => <span key={c} className="lang-badge"><span className="lang-flag">{LANGS[c].flag}</span>{LANGS[c].name}</span>)}
                  <button className="lang-badge" style={{ cursor: "pointer", borderStyle: "dashed", color: "var(--primary)" }} onClick={() => setLangDrawer(m)}><Icon name="plus" size={12} />لغة</button>
                </div>
                <div className="muted row" style={{ fontSize: 11.5, gap: 5 }}>
                  <Icon name="calendar" size={13} />{m.published ? `نُشرت ${m.published}` : "غير منشورة بعد"}
                </div>
                <div className="row" style={{ gap: 7, marginTop: "auto", paddingTop: 4 }}>
                  <Btn variant="secondary" size="sm" icon="download" onClick={() => toast({ title: "جارٍ تحميل PDF", msg: m.name })} style={{ flex: 1 }}>PDF</Btn>
                  <Btn variant="secondary" size="sm" icon="external" onClick={() => toast({ tone: "info", title: "عرض عام" })} style={{ flex: 1 }}>عرض</Btn>
                  <Btn variant="soft" size="sm" icon="edit" onClick={() => go({ page: "editor" })} style={{ flex: 1 }}>تحرير</Btn>
                </div>
              </div>
            </div>
          );
        })}

        {/* create card */}
        <button className="card card-hover" onClick={() => go({ page: "editor" })}
          style={{ border: "1.5px dashed var(--border-strong)", background: "var(--surface-2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, minHeight: 280, cursor: "pointer", color: "var(--text-2)" }}>
          <div className="stat-ico" style={{ width: 44, height: 44, background: "var(--primary-soft)", color: "var(--primary)" }}><Icon name="plus" size={22} /></div>
          <div style={{ fontWeight: 650, fontSize: 14 }}>إنشاء قائمة جديدة</div>
          <div className="muted" style={{ fontSize: 12 }}>ابدأ من قالب أو استورد بالذكاء</div>
        </button>
      </div>

      <AddLanguageDrawer open={!!langDrawer} onClose={() => setLangDrawer(null)} menu={langDrawer} />
      <ConfirmModal open={!!delMenu} onClose={() => setDelMenu(null)} onConfirm={doDelete} busy={busy} danger
        icon="trash" title="حذف القائمة؟" confirmLabel="حذف نهائياً"
        message={delMenu ? `سيتم حذف «${delMenu.name}» وجميع نسخها اللغوية وبطاقات QR المرتبطة بها. لا يمكن التراجع عن هذا الإجراء.` : ""} />
    </div>
  );
}

/* ============ RESTAURANT INFO ============ */
function InfoTab() {
  const [edit, setEdit] = React.useState(false);
  const [del, setDel] = React.useState(false);
  const [delBusy, setDelBusy] = React.useState(false);
  const [form, setForm] = React.useState({ ...RESTAURANT });
  const catLabel = { cafe: "مقهى", restaurant: "مطعم", both: "مقهى ومطعم" };
  const rows = [
    { icon: "store", label: "اسم المطعم", value: RESTAURANT.name },
    { icon: "coffee", label: "التصنيف", value: catLabel[RESTAURANT.category] },
    { icon: "phone", label: "الهاتف", value: RESTAURANT.phone, ltr: true },
    { icon: "mail", label: "البريد الإلكتروني", value: RESTAURANT.email, ltr: true },
    { icon: "mapPin", label: "العنوان", value: RESTAURANT.address },
    { icon: "coins", label: "العملة", value: CURRENCIES.find(c => c.value === RESTAURANT.currency).label },
  ];
  return (
    <div className="page">
      <div className="page-head">
        <div><h2>معلومات المطعم</h2><p>بيانات مطعمك الظاهرة في القوائم والبطاقات.</p></div>
        <div className="ph-actions"><Btn variant="primary" icon="edit" onClick={() => { setForm({ ...RESTAURANT }); setEdit(true); }}>تعديل المعلومات</Btn></div>
      </div>

      <div className="grid split-grid" style={{ gridTemplateColumns: "300px minmax(0,1fr)", alignItems: "start" }}>
        {/* logo + summary card */}
        <div className="card card-pad" style={{ textAlign: "center" }}>
          <div style={{ position: "relative", width: 110, height: 110, margin: "6px auto 14px", borderRadius: 24, overflow: "hidden", cursor: "pointer" }}
            className="logo-up" onClick={() => toast({ tone: "info", title: "رفع الشعار", msg: "اسحب صورة أو اختر ملفاً (تجريبي)" })}>
            <Avatar name="Underground" size={110} square />
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.5)", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, opacity: 0, transition: "opacity .15s" }} className="logo-overlay">
              <Icon name="camera" size={22} /><span style={{ fontSize: 11, fontWeight: 600 }}>تغيير الشعار</span>
            </div>
          </div>
          <h3 style={{ margin: "0 0 3px", fontSize: 18 }}>{RESTAURANT.name}</h3>
          <p className="muted" style={{ margin: "0 0 12px", fontSize: 13 }}>{RESTAURANT.tagline}</p>
          <div className="row" style={{ gap: 7, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip tone="success" dot>نشط</Chip>
            <Chip icon="coffee">{catLabel[RESTAURANT.category]}</Chip>
            <Chip tone="primary" icon="gift">مجاني</Chip>
          </div>
        </div>

        {/* details */}
        <div className="card">
          <div className="card-head"><h3>التفاصيل</h3></div>
          <div>
            {rows.map(r => (
              <div className="list-row" key={r.label}>
                <div className="stat-ico" style={{ width: 34, height: 34, background: "var(--surface-3)", color: "var(--text-3)", flexShrink: 0 }}><Icon name={r.icon} size={16} /></div>
                <div style={{ width: 140, flexShrink: 0, color: "var(--text-3)", fontSize: 12.5, fontWeight: 600 }}>{r.label}</div>
                <div className={r.ltr ? "ltr" : ""} style={{ fontWeight: 600, fontSize: 13.5, flex: 1, textAlign: "start" }}>{r.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* danger zone */}
      <div className="card" style={{ marginTop: 18, borderColor: "var(--danger-soft)" }}>
        <div className="card-pad row between wrap" style={{ gap: 14 }}>
          <div className="row" style={{ gap: 13 }}>
            <div className="stat-ico" style={{ width: 38, height: 38, background: "var(--danger-soft)", color: "var(--danger-fg)", flexShrink: 0 }}><Icon name="alert" size={19} /></div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14.5, color: "var(--danger-fg)" }}>منطقة الخطر</div>
              <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>حذف المطعم نهائياً مع كل بياناته. لا يمكن التراجع.</div>
            </div>
          </div>
          <Btn variant="danger-soft" icon="trash" onClick={() => setDel(true)}>حذف المطعم</Btn>
        </div>
      </div>

      {/* edit modal */}
      <Modal open={edit} onClose={() => setEdit(false)} size="lg">
        <ModalHead icon="edit" title="تعديل معلومات المطعم" sub="ستظهر هذه البيانات في قوائمك العامة" onClose={() => setEdit(false)} />
        <div className="modal-body">
          <div className="grid grid-2" style={{ gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="اسم المطعم"><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="التصنيف"><Select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              options={[{ value: "cafe", label: "مقهى" }, { value: "restaurant", label: "مطعم" }, { value: "both", label: "مقهى ومطعم" }]} /></Field>
            <Field label="الهاتف"><Input className="input ltr" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={{ textAlign: "start" }} /></Field>
            <Field label="البريد الإلكتروني"><Input className="input ltr" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ textAlign: "start" }} /></Field>
            <Field label="العملة"><Select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} options={CURRENCIES} /></Field>
            <div />
            <div style={{ gridColumn: "1 / -1" }}><Field label="العنوان"><Textarea rows={2} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} style={{ minHeight: 60 }} /></Field></div>
          </div>
        </div>
        <div className="modal-foot">
          <Btn variant="ghost" onClick={() => setEdit(false)}>إلغاء</Btn>
          <Btn variant="primary" icon="check" onClick={() => { setEdit(false); toast({ tone: "success", title: "تم حفظ التغييرات" }); }}>حفظ</Btn>
        </div>
      </Modal>

      <ConfirmModal open={del} onClose={() => setDel(false)} busy={delBusy} danger icon="trash"
        title="حذف المطعم نهائياً؟" confirmLabel="نعم، احذف المطعم"
        message="سيؤدي هذا إلى حذف كل ما يخص مطعمك بشكل دائم، ولا يمكن استعادته:"
        checklist={["جميع القوائم والعناصر", "بطاقات QR المنشورة", "البوسترات والتصاميم", "حسابات التواصل المرتبطة", "كل الملفات والوسائط"]}
        onConfirm={() => { setDelBusy(true); setTimeout(() => { setDelBusy(false); setDel(false); toast({ tone: "error", title: "تم حذف المطعم", msg: "(تجريبي)" }); }, 1100); }} />
    </div>
  );
}

/* ============ LANGUAGES ============ */
function LanguagesTab() {
  const [translate, setTranslate] = React.useState(false);
  const [langDrawer, setLangDrawer] = React.useState(false);
  const active = ["ar", "en", "fr"];
  const coverage = { ar: 100, en: 100, fr: 64 };
  return (
    <div className="page">
      <div className="page-head">
        <div><h2>اللغات</h2><p>أدر لغات قوائمك وترجمها تلقائياً بالذكاء الاصطناعي.</p></div>
        <div className="ph-actions">
          <Btn variant="secondary" icon="sparkles" onClick={() => setTranslate(true)}>ترجمة بالذكاء</Btn>
          <Btn variant="primary" icon="plus" onClick={() => setLangDrawer(true)}>إضافة لغة</Btn>
        </div>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 18 }}>
        <StatCard icon="globe" tone="primary" value="3" label="لغات نشطة" />
        <StatCard icon="check2" tone="success" value="88%" label="اكتمال الترجمة" />
        <StatCard icon="sparkles" tone="violet" value="2" label="ترجمات بالذكاء هذا الشهر" />
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-head"><Icon name="languages" size={16} style={{ color: "var(--text-3)" }} /><h3>اللغات النشطة</h3></div>
        {active.map(c => (
          <div className="list-row" key={c}>
            <span style={{ fontSize: 26 }}>{LANGS[c].flag}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="row" style={{ gap: 8 }}><span style={{ fontWeight: 650, fontSize: 14 }}>{LANGS[c].name}</span>
                {c === "ar" && <Chip tone="primary">افتراضية</Chip>}
                <span className="ltr muted" style={{ fontSize: 12 }}>{LANGS[c].native}</span></div>
              <div className="row" style={{ gap: 9, marginTop: 6 }}>
                <div className="progress" style={{ width: 160, height: 6 }}><i style={{ width: `${coverage[c]}%` }} /></div>
                <span className="muted tnum" style={{ fontSize: 11.5 }}>{coverage[c]}% مترجم</span>
              </div>
            </div>
            {coverage[c] < 100 && <Btn variant="soft" size="sm" icon="sparkles" onClick={() => setTranslate(true)}>إكمال الترجمة</Btn>}
            <Popover trigger={<button className="btn btn-ghost btn-icon btn-sm"><Icon name="more" size={16} /></button>}>
              <div className="menu">
                <MenuItem icon="sparkles" onClick={() => setTranslate(true)}>ترجمة بالذكاء</MenuItem>
                <MenuItem icon="eye" onClick={() => toast({ tone: "info", title: "معاينة" })}>معاينة هذه اللغة</MenuItem>
                {c !== "ar" && <><div className="menu-sep" /><MenuItem icon="trash" danger onClick={() => toast({ tone: "error", title: "تمت إزالة اللغة" })}>إزالة اللغة</MenuItem></>}
              </div>
            </Popover>
          </div>
        ))}
      </div>

      {/* coming soon: redesigned placeholder for advanced language mgmt */}
      <div className="card card-pad" style={{ background: "linear-gradient(135deg, var(--violet-soft), var(--surface))" }}>
        <div className="row between wrap" style={{ gap: 16 }}>
          <div className="row" style={{ gap: 14 }}>
            <div className="stat-ico" style={{ width: 44, height: 44, background: "var(--violet-soft)", color: "var(--violet)", flexShrink: 0 }}><Icon name="globe" size={22} /></div>
            <div>
              <div className="row" style={{ gap: 8 }}><h3 style={{ margin: 0, fontSize: 15.5 }}>قاموس المصطلحات الخاص بك</h3><Chip tone="violet">قريباً</Chip></div>
              <p className="muted" style={{ margin: "4px 0 0", fontSize: 13, maxWidth: 520 }}>ثبّت ترجمات أسماء أطباقك وعلامتك التجارية ليستخدمها الذكاء الاصطناعي في كل قائمة، مع لهجات إقليمية وضبط نبرة الكتابة.</p>
            </div>
          </div>
          <Btn variant="secondary" onClick={() => toast({ tone: "info", title: "سنعلمك عند الإطلاق" })}>أعلمني عند الإطلاق</Btn>
        </div>
      </div>

      <TranslateDrawer open={translate} onClose={() => setTranslate(false)} menu={MENUS[0]} />
      <AddLanguageDrawer open={langDrawer} onClose={() => setLangDrawer(false)} menu={MENUS[0]} />
    </div>
  );
}

Object.assign(window, { Overview, MenusTab, InfoTab, LanguagesTab });
