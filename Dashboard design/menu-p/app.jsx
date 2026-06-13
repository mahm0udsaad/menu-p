/* Dashboard wrapper (tabs) + App root + routing */

function Dashboard({ route, go }) {
  const tab = route.tab || "overview";
  const tabs = [
    { id: "overview", label: "نظرة عامة", icon: "grid" },
    { id: "menus", label: "القوائم", icon: "list", count: MENUS.length },
    { id: "qr", label: "بطاقات QR", icon: "qr", count: QR_CARDS.length },
    { id: "info", label: "معلومات المطعم", icon: "store" },
    { id: "languages", label: "اللغات", icon: "languages", count: 3 },
  ];
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ padding: "16px 24px 0", maxWidth: "var(--maxw)", margin: "0 auto" }}>
        <div className="tabs" style={{ marginBottom: 0 }}>
          {tabs.map(t => (
            <button key={t.id} className={["tab", tab === t.id && "on"].filter(Boolean).join(" ")} onClick={() => go({ page: "dashboard", tab: t.id })}>
              <Icon name={t.icon} size={16} />{t.label}{t.count != null && <span className="tab-count tnum">{t.count}</span>}
            </button>
          ))}
        </div>
      </div>
      {tab === "overview" && <Overview />}
      {tab === "menus" && <MenusTab />}
      {tab === "qr" && <QRTab />}
      {tab === "info" && <InfoTab />}
      {tab === "languages" && <LanguagesTab />}
    </div>
  );
}

function App() {
  const [route, setRoute] = React.useState({ page: "dashboard", tab: "overview" });
  const [navOpen, setNavOpen] = React.useState(false);

  const [t, setTweak] = useTweaks(/*EDITMODE-BEGIN*/{
    "accent": "#c2403c",
    "font": "'IBM Plex Sans Arabic', sans-serif",
    "density": "compact",
    "radius": "medium"
  }/*EDITMODE-END*/);

  React.useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty("--primary", t.accent);
    r.style.setProperty("--font", t.font);
    r.classList.toggle("density-compact", t.density === "compact");
    const radii = {
      sharp:  { xs: "3px", sm: "4px", md: "6px",  lg: "8px",  xl: "11px", "2xl": "14px" },
      medium: { xs: "6px", sm: "8px", md: "11px", lg: "14px", xl: "18px", "2xl": "24px" },
      soft:   { xs: "9px", sm: "12px", md: "15px", lg: "20px", xl: "26px", "2xl": "32px" },
    };
    const rr = radii[t.radius] || radii.medium;
    Object.entries(rr).forEach(([k, v]) => r.style.setProperty(`--r-${k}`, v));
  }, [t]);

  const go = React.useCallback((r) => {
    setRoute(prev => ({ page: r.page || prev.page, tab: r.tab }));
    const el = document.querySelector(".main");
    if (el) el.scrollTop = 0;
    window.scrollTo(0, 0);
  }, []);
  React.useEffect(() => { window.__go = go; }, [go]);

  let content;
  if (route.page === "dashboard") content = <Dashboard route={route} go={go} />;
  else if (route.page === "editor") content = <EditorPage />;
  else if (route.page === "import") content = <ImportPage />;
  else if (route.page === "posters") content = <PostersPage />;
  else if (route.page === "social") content = <SocialPage />;
  else content = <Dashboard route={{ page: "dashboard", tab: "overview" }} go={go} />;

  return (
    <NavCtx.Provider value={{ route, go }}>
      <ToastProvider>
        <div className="app">
          {navOpen && <div className="scrim mobile-only" onClick={() => setNavOpen(false)} />}
          <Sidebar route={route} go={go} open={navOpen} onClose={() => setNavOpen(false)} />
          <div className="main">
            <Topbar route={route} go={go} onMenu={() => setNavOpen(true)} />
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
              {content}
            </div>
          </div>
        </div>

        <TweaksPanel title="Tweaks">
          <TweakSection label="الهوية البصرية" />
          <TweakColor label="لون العلامة" value={t.accent}
            options={["#c2403c", "#a32a35", "#c25c3a", "#9b4a6b", "#2b6b5b"]}
            onChange={(v) => setTweak("accent", v)} />
          <TweakSelect label="الخط" value={t.font}
            options={[
              { value: "'IBM Plex Sans Arabic', sans-serif", label: "IBM Plex Sans Arabic" },
              { value: "'Cairo', sans-serif", label: "Cairo" },
              { value: "'Tajawal', sans-serif", label: "Tajawal" },
            ]}
            onChange={(v) => setTweak("font", v)} />
          <TweakSection label="التخطيط" />
          <TweakRadio label="الكثافة" value={t.density}
            options={[{ value: "compact", label: "مدمج" }, { value: "comfortable", label: "مريح" }]}
            onChange={(v) => setTweak("density", v)} />
          <TweakRadio label="الحواف" value={t.radius}
            options={[{ value: "sharp", label: "حاد" }, { value: "medium", label: "متوسط" }, { value: "soft", label: "ناعم" }]}
            onChange={(v) => setTweak("radius", v)} />
        </TweaksPanel>
      </ToastProvider>
    </NavCtx.Provider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
