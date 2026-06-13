/**
 * Critical CSS for the public menu, inlined server-side and themed entirely
 * through the `--menu-*` custom properties produced by lib/theming/theme.ts.
 */
export default function MenuStyles({ cssVars }: { cssVars: string }) {
  const css = `
.pm-root{${cssVars}}
.pm-root{
  min-height:100dvh;background:var(--menu-bg);color:var(--menu-text);
  font-family:var(--menu-font-ar);-webkit-font-smoothing:antialiased;
  font-size:16px;line-height:1.6;
}
.pm-root[dir="ltr"]{font-family:var(--menu-font-latin)}
.pm-root *{box-sizing:border-box;margin:0;padding:0}
.pm-root a{color:inherit;text-decoration:none}
.pm-root button{font:inherit;border:none;background:none;cursor:pointer;color:inherit}
html{scroll-behavior:smooth}

/* ---- sticky header + category nav ---- */
.pm-sticky{
  position:sticky;top:0;z-index:40;
  background:color-mix(in srgb,var(--menu-bg) 86%,transparent);
  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
  border-bottom:1px solid var(--menu-border);
}
.pm-header{
  display:flex;align-items:center;gap:.55rem;
  padding:.65rem 1rem .55rem;max-width:680px;margin:0 auto;
}
.pm-logo,.pm-logo-mono{
  width:40px;height:40px;border-radius:50%;flex-shrink:0;
  border:2px solid var(--menu-border);object-fit:cover;background:#fff;
}
.pm-logo-mono{
  display:flex;align-items:center;justify-content:center;border:none;
  background:linear-gradient(135deg,var(--menu-primary),var(--menu-secondary));
  color:var(--menu-on-primary);font-weight:800;font-size:1.15rem;
}
.pm-title{flex:1;min-width:0}
.pm-title h1{
  font-size:1rem;font-weight:var(--menu-heading-weight);line-height:1.3;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.pm-title p{font-size:.72rem;color:var(--menu-muted)}
.pm-actions{display:flex;gap:.4rem;flex-shrink:0}
.pm-action{
  display:inline-flex;align-items:center;gap:.25rem;
  font-size:.66rem;font-weight:700;color:var(--menu-primary);
  border:1px solid var(--menu-border);border-radius:999px;
  padding:.3rem .5rem;background:var(--menu-card);white-space:nowrap;
}
.pm-action svg{width:.8rem;height:.8rem}

.pm-nav{
  display:flex;gap:.45rem;overflow-x:auto;padding:.45rem 1rem .65rem;
  max-width:680px;margin:0 auto;scrollbar-width:none;
  -webkit-overflow-scrolling:touch;
}
.pm-nav::-webkit-scrollbar{display:none}
.pm-pill{
  flex-shrink:0;font-size:.82rem;font-weight:700;white-space:nowrap;
  padding:.38rem .95rem;border-radius:999px;
  border:1px solid var(--menu-border);background:var(--menu-card);
  color:var(--menu-text);transition:background .2s,color .2s;
}
.pm-pill[data-active="true"]{
  background:var(--menu-primary);color:var(--menu-on-primary);
  border-color:var(--menu-primary);
}

/* ---- sections ---- */
.pm-main{max-width:680px;margin:0 auto;padding:0 1rem 2rem}
.pm-section{scroll-margin-top:7.2rem;padding-top:1.4rem}
.pm-section-head{display:flex;align-items:center;gap:.7rem;margin-bottom:.35rem}
.pm-section-head h2{
  font-size:1.25rem;font-weight:var(--menu-heading-weight);color:var(--menu-primary);
}
.pm-section-head::after{
  content:"";flex:1;height:2px;border-radius:2px;
  background:linear-gradient(to var(--pm-flow,left),var(--menu-border),transparent);
}
.pm-root[dir="ltr"] .pm-section-head::after{--pm-flow:right}
.pm-section>p{font-size:.82rem;color:var(--menu-muted);margin-bottom:.6rem}

/* ---- item cards ---- */
.pm-items{display:flex;flex-direction:column;gap:.65rem;margin-top:.65rem}
.pm-card{
  position:relative;display:flex;gap:.8rem;align-items:stretch;
  background:var(--menu-card);border:1px solid var(--menu-border);
  border-radius:1rem;padding:.7rem;
  box-shadow:0 1px 2px color-mix(in srgb,var(--menu-text) 6%,transparent);
}
.pm-card[data-unavailable="true"]{opacity:.55;filter:grayscale(.5)}
.pm-card-img,.pm-card-mono{
  width:84px;height:84px;border-radius:.7rem;flex-shrink:0;object-fit:cover;
  background:var(--menu-border);
}
.pm-card-mono{
  display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,
    color-mix(in srgb,var(--menu-primary) 14%,var(--menu-card)),
    color-mix(in srgb,var(--menu-secondary) 18%,var(--menu-card)));
  color:var(--menu-primary);font-weight:800;font-size:1.5rem;
}
.pm-card-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:.15rem}
.pm-card-top{display:flex;align-items:baseline;gap:.5rem;justify-content:space-between}
.pm-card-top h3{font-size:.95rem;font-weight:700;line-height:1.35}
.pm-price{
  flex-shrink:0;font-size:.82rem;font-weight:800;white-space:nowrap;
  color:var(--menu-primary);
  background:color-mix(in srgb,var(--menu-primary) 10%,transparent);
  border-radius:999px;padding:.12rem .6rem;
}
.pm-unavail{
  flex-shrink:0;font-size:.7rem;font-weight:800;white-space:nowrap;
  color:var(--menu-muted);border:1px dashed var(--menu-muted);
  border-radius:999px;padding:.12rem .6rem;
}
.pm-card-desc{
  font-size:.78rem;color:var(--menu-muted);
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
}
.pm-tags{display:flex;flex-wrap:wrap;gap:.3rem;margin-top:auto;padding-top:.3rem}
.pm-tag{
  font-size:.62rem;font-weight:700;color:var(--menu-secondary);
  border:1px solid var(--menu-border);border-radius:999px;padding:.05rem .5rem;
}
.pm-featured{
  display:inline-flex;align-items:center;gap:.2rem;
  font-size:.62rem;font-weight:800;color:var(--menu-accent);
  background:color-mix(in srgb,var(--menu-accent) 12%,transparent);
  border-radius:999px;padding:.05rem .5rem;
}

/* ---- footer ---- */
.pm-footer{
  border-top:1px solid var(--menu-border);margin-top:2.5rem;
  padding:1.4rem 1rem 2.2rem;text-align:center;
  display:flex;flex-direction:column;gap:.55rem;align-items:center;
}
.pm-footer-name{font-weight:800;font-size:1rem;color:var(--menu-primary)}
.pm-footer-line{font-size:.8rem;color:var(--menu-muted);display:flex;gap:1rem;flex-wrap:wrap;justify-content:center}
.pm-footer-line a{color:var(--menu-secondary);font-weight:700}
.pm-made{font-size:.7rem;color:var(--menu-muted);margin-top:.5rem}
.pm-made a{color:var(--menu-primary);font-weight:800}
.pm-empty{text-align:center;color:var(--menu-muted);padding:4rem 1rem;font-size:.95rem}

/* ---- language picker overlay ---- */
.pm-langpick{
  position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;
  background:color-mix(in srgb,var(--menu-text) 45%,transparent);
  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);padding:1.2rem;
}
.pm-langpick-card{
  width:100%;max-width:380px;background:var(--menu-bg);
  border:1px solid var(--menu-border);border-radius:1.4rem;
  padding:1.8rem 1.4rem;text-align:center;
  box-shadow:0 24px 60px color-mix(in srgb,var(--menu-text) 25%,transparent);
}
.pm-langpick-card .pm-logo,.pm-langpick-card .pm-logo-mono{
  width:64px;height:64px;margin:0 auto .8rem;font-size:1.6rem;
}
.pm-langpick-card h2{
  font-size:1.2rem;font-weight:800;margin-bottom:.2rem;color:var(--menu-text);
}
.pm-langpick-card>p{font-size:.78rem;color:var(--menu-muted);margin-bottom:1.1rem}
.pm-langs{display:flex;flex-direction:column;gap:.55rem}
.pm-lang{
  display:flex;align-items:center;justify-content:center;
  font-size:1rem;font-weight:800;padding:.8rem 1rem;border-radius:.9rem;
  border:1.5px solid var(--menu-border);background:var(--menu-card);
  color:var(--menu-text);transition:transform .15s,background .2s,color .2s;
}
.pm-lang:active{transform:scale(.97)}
.pm-lang[data-current="true"]{
  background:var(--menu-primary);color:var(--menu-on-primary);border-color:var(--menu-primary);
}

@media (min-width:480px){
  .pm-card-img,.pm-card-mono{width:96px;height:96px}
  .pm-title h1{font-size:1.15rem}
}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
`
  return <style dangerouslySetInnerHTML={{ __html: css }} />
}
