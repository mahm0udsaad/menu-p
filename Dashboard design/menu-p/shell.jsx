/* App shell — sidebar, topbar, navigation */
const NavCtx = React.createContext(null);
const useNav = () => React.useContext(NavCtx);

const NAV = [
  { group: "الرئيسية", items: [
    { id: "overview", page: "dashboard", tab: "overview", label: "نظرة عامة", icon: "grid" },
  ]},
  { group: "القوائم", items: [
    { id: "menus", page: "dashboard", tab: "menus", label: "القوائم", icon: "list", badge: () => MENUS.length },
    { id: "editor", page: "editor", label: "محرّر القوائم", icon: "edit" },
    { id: "import", page: "import", label: "استيراد بالذكاء", icon: "sparkles" },
    { id: "qr", page: "dashboard", tab: "qr", label: "بطاقات QR", icon: "qr", badge: () => QR_CARDS.length },
  ]},
  { group: "التسويق", items: [
    { id: "posters", page: "posters", label: "استوديو البوسترات", icon: "image" },
    { id: "social", page: "social", label: "النشر الاجتماعي", icon: "share" },
  ]},
  { group: "المطعم", items: [
    { id: "info", page: "dashboard", tab: "info", label: "معلومات المطعم", icon: "store" },
    { id: "languages", page: "dashboard", tab: "languages", label: "اللغات", icon: "languages", badge: () => 3 },
  ]},
];

function Sidebar({ route, go, open, onClose }) {
  const activeId = route.page === "dashboard" ? route.tab : route.page;
  return (
    <aside className={["sidebar", open && "open"].filter(Boolean).join(" ")}>
      <div className="sidebar-brand">
        <div className="brand-mark"><Icon name="qr" size={21} strokeWidth={2} /></div>
        <div style={{ flex: 1 }}>
          <div className="brand-name">Menu‑P</div>
          <div className="brand-sub">منصّة القوائم الرقمية</div>
        </div>
        <button className="btn btn-ghost btn-icon btn-sm mobile-only" onClick={onClose}><Icon name="x" size={18} /></button>
      </div>

      <nav style={{ flex: 1, overflowY: "auto" }}>
        {NAV.map(grp => (
          <div className="nav-group" key={grp.group}>
            <div className="nav-label">{grp.group}</div>
            {grp.items.map(it => {
              const active = activeId === it.id;
              return (
                <button key={it.id} className={["nav-item", active && "active"].filter(Boolean).join(" ")}
                  onClick={() => { go({ page: it.page, tab: it.tab }); onClose && onClose(); }}>
                  <span className="nav-ico"><Icon name={it.icon} size={18} /></span>
                  <span>{it.label}</span>
                  {it.badge && <span className="nav-badge tnum">{it.badge()}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-foot">
        <div className="plan-card">
          <div className="pc-top">
            <div className="row" style={{ gap: 7 }}>
              <Icon name="gift" size={15} style={{ color: "var(--primary)" }} />
              <span style={{ fontWeight: 700, fontSize: 13 }}>الخطة المجانية</span>
            </div>
            <Chip tone="success" dot>نشط</Chip>
          </div>
          <div className="plan-meter"><i style={{ width: "66%" }} /></div>
          <div className="row between" style={{ marginTop: 7, fontSize: 11.5, color: "var(--text-3)" }}>
            <span>2 من 3 قوائم</span>
            <span>تجديد بعد 18 يوم</span>
          </div>
          <Btn variant="cta" size="sm" block style={{ marginTop: 11 }} icon="crown"
            onClick={() => toast({ tone: "info", title: "ترقية الخطة", msg: "صفحة الترقية تجريبية في هذا النموذج" })}>
            الترقية إلى المميّزة
          </Btn>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ route, go, onMenu }) {
  const titles = {
    overview: { t: "نظرة عامة", s: "ملخّص أداء مطعمك" },
    menus: { t: "القوائم", s: "إدارة قوائمك المنشورة ولغاتها" },
    qr: { t: "بطاقات QR", s: "أنشئ وأدر بطاقات الباركود" },
    info: { t: "معلومات المطعم", s: "بيانات وإعدادات المطعم" },
    languages: { t: "اللغات", s: "إدارة وترجمة لغات القوائم" },
    editor: { t: "محرّر القوائم", s: "صمّم وحرّر قوائمك مباشرة" },
    import: { t: "استيراد بالذكاء", s: "حوّل قائمتك القديمة إلى رقمية" },
    posters: { t: "استوديو البوسترات", s: "صمّم بوسترات تسويقية" },
    social: { t: "النشر الاجتماعي", s: "انشر إلى منصّات التواصل" },
  };
  const key = route.page === "dashboard" ? route.tab : route.page;
  const meta = titles[key] || titles.overview;
  return (
    <header className="topbar">
      <button className="btn btn-ghost btn-icon btn-sm mobile-only" onClick={onMenu}><Icon name="menu" size={19} /></button>
      <div>
        <h1>{meta.t}</h1>
        <div className="sub desktop-only">{meta.s}</div>
      </div>
      <div className="topbar-spacer" />
      <div className="searchbox desktop-only">
        <Icon name="search" size={15} />
        <input placeholder="ابحث عن قائمة، بطاقة، أو إجراء…" />
        <span className="kbd">⌘K</span>
      </div>
      <Popover trigger={<button className="btn btn-secondary btn-icon btn-sm" style={{ position: "relative" }}>
        <Icon name="bell" size={17} />
        <span style={{ position: "absolute", top: 6, insetInlineEnd: 6, width: 7, height: 7, borderRadius: 99, background: "var(--primary)", border: "1.5px solid var(--surface)" }} />
      </button>} width={300}>
        <div className="menu" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "11px 13px", borderBottom: "1px solid var(--border)", fontWeight: 650, fontSize: 13 }}>الإشعارات</div>
          {ACTIVITY.slice(0, 3).map(a => (
            <div key={a.id} className="row" style={{ gap: 10, padding: "10px 13px", borderBottom: "1px solid var(--border)" }}>
              <div className="stat-ico" style={{ width: 30, height: 30, background: `var(--${a.tone}-soft)`, color: `var(--${a.tone}-fg)`, flexShrink: 0 }}><Icon name={a.icon} size={15} /></div>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12.5, lineHeight: 1.4 }}>{a.text}</div><div style={{ fontSize: 11, color: "var(--text-4)", marginTop: 2 }}>{a.time}</div></div>
            </div>
          ))}
        </div>
      </Popover>

      <Popover trigger={<button className="row" style={{ gap: 9, background: "none", border: "none", cursor: "pointer", padding: "3px 5px 3px 3px", borderRadius: 99 }}>
        <Avatar name="UG" size={34} square />
        <div className="desktop-only" style={{ textAlign: "start" }}>
          <div style={{ fontWeight: 650, fontSize: 13, lineHeight: 1.1 }}>{RESTAURANT.name}</div>
          <div style={{ fontSize: 11, color: "var(--text-3)" }}>الخطة المجانية</div>
        </div>
        <Icon name="chevDown" size={15} className="desktop-only" style={{ color: "var(--text-3)" }} />
      </button>} width={216}>
        <div className="menu">
          <div className="row" style={{ gap: 10, padding: "6px 9px 10px" }}>
            <Avatar name="UG" size={38} square />
            <div><div style={{ fontWeight: 650, fontSize: 13 }}>{RESTAURANT.name}</div><div style={{ fontSize: 11.5, color: "var(--text-3)" }}>{RESTAURANT.email}</div></div>
          </div>
          <div className="menu-sep" />
          <MenuItem icon="store" onClick={() => go({ page: "dashboard", tab: "info" })}>معلومات المطعم</MenuItem>
          <MenuItem icon="settings" onClick={() => toast({ tone: "info", title: "الإعدادات", msg: "تجريبية في هذا النموذج" })}>الإعدادات</MenuItem>
          <MenuItem icon="crown" onClick={() => toast({ tone: "info", title: "ترقية الخطة" })}>ترقية الخطة</MenuItem>
          <div className="menu-sep" />
          <MenuItem icon="logout" danger onClick={() => toast({ tone: "info", title: "تسجيل الخروج", msg: "تجريبي في هذا النموذج" })}>تسجيل الخروج</MenuItem>
        </div>
      </Popover>
    </header>
  );
}

Object.assign(window, { NavCtx, useNav, Sidebar, Topbar });
