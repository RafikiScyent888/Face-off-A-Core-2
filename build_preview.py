#!/usr/bin/env python3
"""Bundle the whole game into ONE self-contained HTML file.

  build_preview.py app     -> FACE-OFF-A-Core-2.html   (single-file game, drop anywhere)
  build_preview.py preview -> FACE-OFF-PREVIEW.html    (host + 2 student devices side by side)
"""
import html, re, sys, pathlib

D = pathlib.Path(__file__).parent
read = lambda n: (D / n).read_text()


def bundle_app() -> str:
    page = read("index.html")
    for src in ["questions-core2.js", "firebase-config.js", "qr.js", "app.js"]:
        js = read(src).replace("</script>", "<\\/script>")
        page = page.replace(f'<script src="{src}"></script>',
                            f"<script>\n/* ---- {src} ---- */\n{js}\n</script>")
    assert "<script src=" not in page, "an external script was left un-inlined"
    return page


PREVIEW_SHELL = """<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>FACE-OFF: A+ Core 2 — Live Preview</title>
<style>
:root{--yellow:#eab308;--orange:#c2410c;--line:rgba(255,255,255,.18)}
*{box-sizing:border-box}
body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
 color:#f5f7ff;background:#0a1436;height:100vh;display:flex;flex-direction:column;overflow:hidden}
header{display:flex;align-items:center;gap:13px;padding:8px 14px;background:rgba(15,31,77,.92);
 border-bottom:1px solid var(--line);flex:none;flex-wrap:wrap}
.mark{width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,var(--yellow),var(--orange));
 display:grid;place-items:center;color:#16192e;font-weight:900;font-size:15px;flex:none}
h1{font-size:14px;margin:0;letter-spacing:.05em}
.sub{font-size:10px;opacity:.62;letter-spacing:.11em}
.steps{font-size:11.5px;opacity:.9;margin-left:auto;line-height:1.55;text-align:right}
.steps b{color:var(--yellow)}
main{flex:1;display:flex;gap:9px;padding:9px;min-height:0}
.pane{display:flex;flex-direction:column;min-height:0;border:1px solid var(--line);
 border-radius:11px;overflow:hidden;background:#0f1f4d}
.lbl{font-size:10px;letter-spacing:.15em;text-transform:uppercase;padding:5px 9px;
 background:rgba(255,255,255,.07);border-bottom:1px solid var(--line);flex:none;display:flex;gap:7px;align-items:center}
.dot{width:7px;height:7px;border-radius:99px;background:var(--yellow);flex:none}
iframe{flex:1;width:100%;border:0;background:#0f1f4d}
#hostpane{flex:1 1 auto;min-width:0}
.phones{display:flex;gap:9px;flex:0 0 600px;min-width:0}
.phones .pane{flex:1;min-width:0}
@media (max-width:1450px){.phones{flex:0 0 500px}}
@media (max-width:1100px){main{flex-direction:column}.phones{flex:0 0 400px}}
</style></head>
<body>
<header>
  <div class="mark">&#9876;</div>
  <div><h1>FACE-OFF &mdash; LIVE PREVIEW</h1><div class="sub">A+ CORE 2 &middot; 220-1102</div></div>
  <div class="steps">
    <b>1.</b> Host panel: <b>Fill demo teams</b> &rarr; <b>Start Game</b> &nbsp;&middot;&nbsp;
    <b>2.</b> Click any point value &nbsp;&middot;&nbsp;
    <b>3.</b> Hit <b>BUZZ</b> on a phone, type an answer, judge it on the host<br>
    <span style="opacity:.68">Both phone panels are real student devices talking to the host live. Find the hidden Daily Double.</span>
  </div>
</header>
<main>
  <div class="pane" id="hostpane">
    <div class="lbl"><span class="dot"></span>HOST SCREEN &mdash; what the projector shows</div>
    <iframe title="Host screen" srcdoc="__HOST__"></iframe>
  </div>
  <div class="phones">
    <div class="pane"><div class="lbl"><span class="dot" style="background:#15803d"></span>STUDENT DEVICE 1</div>
      <iframe title="Student device 1" srcdoc="__P1__"></iframe></div>
    <div class="pane"><div class="lbl"><span class="dot" style="background:#b91c1c"></span>STUDENT DEVICE 2</div>
      <iframe title="Student device 2" srcdoc="__P2__"></iframe></div>
  </div>
</main>
</body></html>
"""


def bundle_preview() -> str:
    app = bundle_app()
    # srcdoc iframes have no URL hash, so hard-code each frame's route
    def routed(route):
        return app.replace("/* boot */\nroute();",
                           f"/* boot */\nlocation.__forced = '{route}';\nrouteForced('{route}');")
    shim = """
/* single-file preview: frames have no address bar, so route explicitly */
function routeForced(h) {
  var mh = h.match(/^\\/host\\/?([A-Za-z0-9]*)/);
  var m  = h.match(/^\\/play\\/?([A-Za-z0-9]*)\\/?([0-9]*)/);
  if (mh) { currentTeardown = Host((mh[1] || '').toUpperCase() || null); }
  else if (m) { currentTeardown = Player((m[1] || '').toUpperCase(), m[2] || ''); }
}
"""
    app = app.replace("/* boot */\nroute();", shim + "/* boot */\nroute();")
    frames = {
        "__HOST__": routed("/host/DEMO"),
        "__P1__":   routed("/play/DEMO/1"),
        "__P2__":   routed("/play/DEMO/2"),
    }
    out = PREVIEW_SHELL
    for key, doc in frames.items():
        out = out.replace(key, html.escape(doc, quote=True))
    return out


if __name__ == "__main__":
    what = sys.argv[1] if len(sys.argv) > 1 else "app"
    if what == "app":
        (D / "FACE-OFF-A-Core-2.html").write_text(bundle_app())
        print("wrote FACE-OFF-A-Core-2.html")
    else:
        (D / "FACE-OFF-PREVIEW.html").write_text(bundle_preview())
        print("wrote FACE-OFF-PREVIEW.html")
