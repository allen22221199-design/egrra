# -*- coding: utf-8 -*-
"""
把全站網址從 /products.html 改成 /products（去掉副檔名）。

為什麼一定要做：
  Cloudflare Pages 會「自動」把 /products.html 轉址到 /products —— 這不是
  選項，是預設行為（見 developers.cloudflare.com/pages/configuration/
  serving-pages/：「Pages will also redirect HTML pages to their
  extension-less counterparts」）。

  所以如果站內連結還寫 .html，搬過去之後每一次點選都會多繞一次 301，
  canonical 與 og:url 也會指向一個「會再轉走」的網址 —— 那對 Google 是
  壞訊號（canonical 應該指向最終網址，不是中繼站）。

為什麼現在做而不是搬完再做：
  我們本來就要換網域（egrra.vercel.app → egrra.com）。兩件事一起換是
  一次遷移，分開做就是兩次，Google 要重新認識兩遍，累積的收錄也要重來。

為什麼現在改不會弄壞線上的 Vercel 站：
  同時在 vercel.json 打開 "cleanUrls": true，Vercel 就會跟 Cloudflare 一樣
  接受 /products 並把 /products.html 轉過去。兩邊行為一致，搬家當天不會有
  「本來好好的連結突然 404」。

用法：python tools/clean-urls.py
"""
import glob
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

# 每一頁對應的乾淨路徑。index 特別處理成 "/"，
# 因為 Cloudflare 是把 /index.html 轉到 "/"，不是 "/index"。
PAGES = {
    "index.html": "/",
    "products.html": "/products",
    "cases.html": "/cases",
    "compare.html": "/compare",
    "certifications.html": "/certifications",
    "news.html": "/news",
    "media.html": "/media",
    "admin.html": "/admin",
    "maintenance.html": "/maintenance",
}

# 這些檔案不要動：Google Search Console 的驗證檔改了就失效，
# wp-embed-* 是給舊 WordPress 站嵌入用的片段，不屬於本站導覽。
SKIP = {"google213d2ce88af99897.html", "wp-embed-certifications.html", "wp-embed-substrate.html"}


def clean(url):
    """把一個含 .html 的網址轉成乾淨版，保留 #錨點 與 ?參數。"""
    m = re.match(r"^(.*?)([A-Za-z0-9_-]+\.html)([?#].*)?$", url)
    if not m:
        return None
    prefix, page, tail = m.group(1), m.group(2), m.group(3) or ""
    if page not in PAGES:
        return None
    path = PAGES[page]
    # 絕對網址（canonical / og:url）保留網域部分
    if prefix.startswith("http"):
        return prefix.rstrip("/") + ("" if path == "/" else path) + ("/" if path == "/" and not tail else "") + tail
    return path + tail


def rewrite(text):
    """把文字裡所有 xxx.html 的引用換成乾淨版，回傳 (新文字, 換掉幾處)。"""
    n = [0]

    def sub(m):
        q, url = m.group(1), m.group(2)
        c = clean(url)
        if c is None:
            return m.group(0)
        n[0] += 1
        return q + c + q

    # 涵蓋 href="..."、'...'（i18n-sub.js 的 CSS 選擇器）與 location.href = "..."
    out = re.sub(r"([\"'])([^\"']*?[A-Za-z0-9_-]+\.html(?:[?#][^\"']*)?)\1", sub, text)
    return out, n[0]


def main():
    os.chdir(ROOT)
    total = 0

    for f in sorted(glob.glob("*.html")) + sorted(glob.glob("*.js")) + ["sitemap.xml"]:
        if os.path.basename(f) in SKIP or not os.path.exists(f):
            continue
        src = open(f, encoding="utf-8").read()
        if f == "sitemap.xml":
            # sitemap 是 <loc>網址</loc>，不是引號包起來的
            def subloc(m):
                c = clean(m.group(1))
                return "<loc>" + (c or m.group(1)) + "</loc>"
            out = re.sub(r"<loc>([^<]+)</loc>", subloc, src)
            cnt = sum(1 for _ in re.finditer(r"<loc>[^<]*\.html", src))
        else:
            out, cnt = rewrite(src)
        if out != src:
            open(f, "w", encoding="utf-8", newline="").write(out)
            print(f"  {f:26s} 換掉 {cnt} 處")
            total += cnt

    print(f"\n  合計 {total} 處")
    print("  記得接著跑 tools/gen-redirects.py（轉址的目標也要改成乾淨網址）")


if __name__ == "__main__":
    main()
