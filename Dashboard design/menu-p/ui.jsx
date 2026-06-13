/* UI primitives */
const { useState, useEffect, useRef, useCallback, createContext, useContext } = React;

/* ---------- Button ---------- */
function Btn({ variant = "secondary", size, icon, iconEnd, children, className = "", block, ...rest }) {
  const cls = ["btn", `btn-${variant}`, size && `btn-${size}`, block && "btn-block",
    !children && "btn-icon", className].filter(Boolean).join(" ");
  return (
    <button className={cls} {...rest}>
      {icon && <Icon name={icon} size={size === "xs" ? 14 : size === "sm" ? 15 : 16} />}
      {children}
      {iconEnd && <Icon name={iconEnd} size={size === "sm" ? 15 : 16} />}
    </button>
  );
}

/* ---------- Chip / status ---------- */
function Chip({ tone = "", children, icon, dot, lg, className = "" }) {
  return (
    <span className={["chip", tone && `chip-${tone}`, lg && "chip-lg", className].filter(Boolean).join(" ")}>
      {dot && <i className="dot" />}
      {icon && <Icon name={icon} size={12} strokeWidth={2.2} />}
      {children}
    </span>
  );
}
const STATUS = {
  active:    { tone: "success", dot: true, label: "نشط" },
  published: { tone: "success", dot: true, label: "منشور" },
  draft:     { tone: "", dot: true, label: "مسودة" },
  scheduled: { tone: "info", dot: true, label: "مجدول" },
  posting:   { tone: "warning", dot: true, label: "جارٍ النشر" },
  posted:    { tone: "success", dot: true, label: "تم النشر" },
  failed:    { tone: "danger", dot: true, label: "فشل" },
  ready:     { tone: "success", dot: true, label: "جاهز" },
  generating:{ tone: "warning", dot: true, label: "قيد الإنشاء" },
  expired:   { tone: "warning", dot: true, label: "منتهٍ" },
  revoked:   { tone: "danger", dot: true, label: "ملغى" },
  connected: { tone: "success", dot: true, label: "متصل" },
};
function StatusChip({ status, label }) {
  const s = STATUS[status] || { tone: "", dot: true, label: status };
  return <Chip tone={s.tone} dot={s.dot}>{label || s.label}</Chip>;
}

/* ---------- Toggle ---------- */
function Toggle({ checked, onChange, ...rest }) {
  return <button type="button" className={["toggle", checked && "on"].filter(Boolean).join(" ")}
    onClick={() => onChange(!checked)} {...rest}><i /></button>;
}

/* ---------- Segmented ---------- */
function Segmented({ value, onChange, options, block }) {
  return (
    <div className={["segmented", block && "seg-block"].filter(Boolean).join(" ")}>
      {options.map(o => (
        <button key={o.value} className={value === o.value ? "on" : ""} onClick={() => onChange(o.value)}>
          {o.icon && <Icon name={o.icon} size={14} />}{o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Form fields ---------- */
function Field({ label, hint, children, error }) {
  return (
    <div className="field">
      {label && <label>{label}</label>}
      {children}
      {hint && !error && <span className="hint">{hint}</span>}
      {error && <span className="hint" style={{ color: "var(--danger-fg)" }}>{error}</span>}
    </div>
  );
}
const Input = (p) => <input className="input" {...p} />;
const Textarea = (p) => <textarea className="textarea" {...p} />;
function Select({ options, ...p }) {
  return <select className="select" {...p}>{options.map(o =>
    <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}</select>;
}

/* ---------- Slider ---------- */
function Slider({ value, onChange, min = 0, max = 100, step = 1, suffix = "", showVal = true }) {
  return (
    <div className="row" style={{ gap: 12 }}>
      <input type="range" className="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))} />
      {showVal && <span className="tnum" style={{ fontSize: 12.5, fontWeight: 700, minWidth: 52, textAlign: "end", color: "var(--text-2)" }}>{value}{suffix}</span>}
    </div>
  );
}

/* ---------- Color swatches ---------- */
function SwatchPicker({ value, onChange, colors }) {
  return (
    <div className="swatches">
      {colors.map(c => (
        <button key={c} type="button" className={["swatch", value === c && "on"].filter(Boolean).join(" ")}
          style={{ background: c }} onClick={() => onChange(c)} aria-label={c} />
      ))}
    </div>
  );
}

/* ---------- Choice (radio card) ---------- */
function Choice({ on, onClick, children }) {
  return (
    <div className={["choice", on && "on"].filter(Boolean).join(" ")} onClick={onClick}>
      <div className="ch-radio" />
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}

/* ---------- Avatar ---------- */
function Avatar({ name, src, size = 40, square }) {
  const initials = (name || "?").trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  return (
    <div className="avatar" style={{ width: size, height: size, borderRadius: square ? size * 0.28 : "50%", fontSize: size * 0.36 }}>
      {src ? <img src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : initials}
    </div>
  );
}

/* ---------- Placeholder ---------- */
function Placeholder({ label, w = "100%", h = 120, radius, className = "", style }) {
  return (
    <div className={`ph ${className}`} style={{ width: w, height: h, borderRadius: radius, ...style }}>
      {label && <span className="ph-label">{label}</span>}
    </div>
  );
}

/* ---------- Banner ---------- */
function Banner({ tone = "info", icon, title, children, onClose, action }) {
  const ic = icon || { info: "info", warn: "alert", success: "checkCircle", danger: "xCircle" }[tone];
  return (
    <div className={`banner banner-${tone}`}>
      {ic && <Icon name={ic} size={17} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />}
      <div className="banner-body">{title && <b>{title}</b>}{title && children && " "}{children}</div>
      {action}
      {onClose && <button className="btn btn-ghost btn-icon btn-xs" onClick={onClose} style={{ color: "inherit", margin: -4 }}><Icon name="x" size={14} /></button>}
    </div>
  );
}

/* ---------- Empty state ---------- */
function EmptyState({ icon = "layers", title, children, action }) {
  return (
    <div className="empty">
      <div className="empty-ico"><Icon name={icon} size={26} strokeWidth={1.7} /></div>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </div>
  );
}

/* ---------- Modal ---------- */
function Modal({ open, onClose, children, size, closeOnBackdrop = true }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return ReactDOM.createPortal(
    <div className="overlay" onMouseDown={(e) => { if (closeOnBackdrop && e.target === e.currentTarget) onClose && onClose(); }}>
      <div className={["modal", size && `modal-${size}`].filter(Boolean).join(" ")}>{children}</div>
    </div>, document.body);
}
function ModalHead({ icon, iconTone, title, sub, onClose }) {
  return (
    <div className="modal-head">
      {icon && <div className="stat-ico" style={{ background: `var(--${iconTone || "primary"}-soft)`, color: `var(--${iconTone === "primary" || !iconTone ? "primary" : iconTone + "-fg"})`, flexShrink: 0 }}><Icon name={icon} size={19} /></div>}
      <div style={{ flex: 1 }}><h3>{title}</h3>{sub && <p>{sub}</p>}</div>
      {onClose && <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose} style={{ margin: -4 }}><Icon name="x" size={17} /></button>}
    </div>
  );
}

/* ---------- Drawer ---------- */
function Drawer({ open, onClose, children, wide }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return ReactDOM.createPortal(
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className={["drawer", wide && "drawer-wide"].filter(Boolean).join(" ")}>{children}</div>
    </>, document.body);
}
function DrawerHead({ icon, title, sub, onClose }) {
  return (
    <div className="drawer-head">
      {icon && <div className="stat-ico" style={{ background: "var(--primary-soft)", color: "var(--primary)", flexShrink: 0 }}><Icon name={icon} size={18} /></div>}
      <div style={{ flex: 1 }}><h3>{title}</h3>{sub && <p>{sub}</p>}</div>
      <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><Icon name="x" size={17} /></button>
    </div>
  );
}

/* ---------- Popover / dropdown ---------- */
function Popover({ trigger, children, align = "end", width }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  return (
    <div className="popwrap" ref={ref}>
      {React.cloneElement(trigger, { onClick: (e) => { e.stopPropagation(); setOpen(o => !o); } })}
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", [align === "end" ? "insetInlineEnd" : "insetInlineStart"]: 0, width }}
          onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
}
function MenuItem({ icon, danger, children, ...rest }) {
  return <div className={["menu-item", danger && "danger"].filter(Boolean).join(" ")} {...rest}>
    {icon && <Icon name={icon} size={15} />}{children}</div>;
}

/* ---------- Stat card ---------- */
function StatCard({ icon, tone = "primary", value, label, sub, trend }) {
  const iconColor = tone === "primary" ? "var(--primary)" : `var(--${tone}-fg)`;
  const iconBg = tone === "primary" ? "var(--primary-soft)" : `var(--${tone}-soft)`;
  return (
    <div className="stat">
      <div className="row between">
        <div className="stat-ico" style={{ background: iconBg, color: iconColor }}><Icon name={icon} size={19} /></div>
        {trend && <span className={`stat-trend ${trend.dir === "up" ? "trend-up" : "trend-down"}`}>
          <Icon name={trend.dir === "up" ? "trendUp" : "trendDown"} size={13} strokeWidth={2.3} />{trend.value}</span>}
      </div>
      <div>
        <div className="stat-val tnum">{value}</div>
        <div className="stat-label" style={{ marginTop: 4 }}>{label}</div>
        {sub && <div className="stat-sub" style={{ marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

/* ---------- Progress steps ---------- */
function ProgressSteps({ steps }) {
  return (
    <div className="steplist">
      {steps.map((s, i) => (
        <div key={i} className={`step ${s.state}`}>
          <div className="step-dot">
            {s.state === "done" ? <Icon name="check" size={14} strokeWidth={3} />
              : s.state === "active" ? <div className="spinner" />
              : i + 1}
          </div>
          <div className="step-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Confirm modal ---------- */
function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = "تأكيد", danger, icon, checklist, busy }) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <ModalHead icon={icon || (danger ? "alert" : "info")} iconTone={danger ? "danger" : "primary"} title={title} onClose={onClose} />
      <div className="modal-body">
        <p style={{ margin: "0 0 8px", color: "var(--text-2)", fontSize: 13.5, lineHeight: 1.6 }}>{message}</p>
        {checklist && (
          <div className="banner banner-danger" style={{ flexDirection: "column", alignItems: "stretch", gap: 7 }}>
            {checklist.map((c, i) => <div key={i} className="row" style={{ gap: 8, fontSize: 12.5 }}><Icon name="x" size={13} strokeWidth={2.4} />{c}</div>)}
          </div>
        )}
      </div>
      <div className="modal-foot">
        <Btn variant="ghost" onClick={onClose}>إلغاء</Btn>
        <Btn variant={danger ? "danger" : "primary"} onClick={onConfirm} disabled={busy}>
          {busy && <div className="spinner spinner-white" />}{confirmLabel}
        </Btn>
      </div>
    </Modal>
  );
}

/* ---------- Toast system ---------- */
const ToastCtx = createContext(null);
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((t) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(ts => [...ts, { id, ...t }]);
    setTimeout(() => setToasts(ts => ts.filter(x => x.id !== id)), t.duration || 3200);
  }, []);
  useEffect(() => { window.__toast = push; }, [push]);
  const toneMap = { success: { bg: "var(--success-soft)", fg: "var(--success-fg)", ic: "checkCircle" },
    error: { bg: "var(--danger-soft)", fg: "var(--danger-fg)", ic: "xCircle" },
    info: { bg: "var(--info-soft)", fg: "var(--info-fg)", ic: "info" },
    warn: { bg: "var(--warning-soft)", fg: "var(--warning-fg)", ic: "alert" } };
  return (
    <ToastCtx.Provider value={push}>
      {children}
      {ReactDOM.createPortal(
        <div className="toast-wrap">
          {toasts.map(t => { const m = toneMap[t.tone || "success"]; return (
            <div className="toast" key={t.id}>
              <div className="toast-ico" style={{ background: m.bg, color: m.fg }}><Icon name={t.icon || m.ic} size={16} strokeWidth={2.2} /></div>
              <div style={{ flex: 1 }}><div className="toast-title">{t.title}</div>{t.msg && <div className="toast-msg">{t.msg}</div>}</div>
            </div>
          ); })}
        </div>, document.body)}
    </ToastCtx.Provider>
  );
}
function toast(t) { if (window.__toast) window.__toast(typeof t === "string" ? { title: t } : t); }

Object.assign(window, {
  Btn, Chip, StatusChip, STATUS, Toggle, Segmented, Field, Input, Textarea, Select, Slider,
  SwatchPicker, Choice, Avatar, Placeholder, Banner, EmptyState, Modal, ModalHead, Drawer,
  DrawerHead, Popover, MenuItem, StatCard, ProgressSteps, ConfirmModal, ToastProvider, toast,
});
