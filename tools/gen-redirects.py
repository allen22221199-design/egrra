# -*- coding: utf-8 -*-
"""
產生 vercel.json 裡的舊站 301 轉址表。

背景：舊站 egrra.com 是 WordPress，網址帶中文並且是百分比編碼的。
搬到新站之後這些網址不能直接死掉 —— Google 累積的權重要靠 301 轉過來，
客戶、建商存在書籤或報價單上的舊連結也要還能點。

★★ 三個踩過的坑，改這支程式前先看 ★★

1. 百分比編碼的大小寫
   舊站 Yoast 產出的 sitemap 用「小寫」十六進位（%e8%81%af），
   Python 的 urllib.parse.quote() 產出「大寫」（%E8%81%AF）。
   RFC 3986 說兩者等價，但 Vercel 是逐字比對，不同就是不同。
   只放大寫的話，7 個最重要的中文頁面全部 404，而 portfolio-item
   會靜靜掉進萬用規則、丟掉 ?case= 精準度（301 數字看起來還是漂亮的，
   所以一定要逐條看 Location，不能只看狀態碼）。
   → 三種寫法（原文／大寫／小寫）都要放。

2. 結尾斜線
   舊站網址全部以 / 結尾。path-to-regexp 的 :x* 吃不到結尾斜線，
   萬用規則等於從來沒生效過。→ 萬用規則用 (.*)，明確規則則同時
   放有斜線與沒斜線兩種。

3. permanent:true 回的是 308 不是 301
   Google 說等同，但舊爬蟲和多數 SEO 檢測工具對 308 支援參差不齊。
   → 明確寫 statusCode: 301。

改完請執行：python tools/gen-redirects.py
然後務必跑一次全站掃描驗證（見檔案最後的說明）。
"""
import json, os, urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

# ── 有把握的對照：舊 slug → 新站案例 id ───────────────────────────
# 只放我確認過是同一件的。名稱相近但不確定的一律不放，讓它走萬用規則
# 進案例列表 —— 轉到錯的案例比轉到列表頁糟糕得多。
CASE = {
    "portfolio-item": {
        "京懋-朗庭會-2": "c4",  "京懋-防火門": "c4",
        "三輝-保生": "c2",      "三輝歌劇苑": "c2",
        "宏璟-土城日月光-商場": "c8", "宏璟-土城日月光-集合住宅": "c8",
        "宏普-川普park": "c10", "哲人-德林": "c13",
        "揚昇-君悅": "c15",     "昇陽-防火門": "c17",
        "正隆-天第": "c18",     "璟都柏悅": "c19",
        "新北新店-碧波白": "c20", "華山33": "c21",
        "賓陽-悦容莊": "c22",   "賓陽-悦容莊a": "c22",
        "石紋電視牆": "c25",    "山發-正隆one富饒": "c12",
        "礁溪-park-one": "c27", "礁溪-park-one-2": "c27",
    },
    "product": {
        "北市-中山區-ted": "c3",   "北市-中山區-ted-2": "c3",
        "北市-中正區-正隆天第": "c18", "新北-土城區-日月光": "c8",
        "新北-新莊區-amax": "c9",  "新北-新莊區-amax-2": "c9",
        "新北-新莊區-悅容莊": "c22", "桃市-桃園區-柏悅": "c19",
        "高雄-中正大樓01": "c7",   "高雄-中正大樓02": "c7",
        "宜蘭-礁溪鄉": "c27",
    },
}

# 舊站放在 /product/ 底下、但內容其實是「案場」的網址。
# 新站沒有對應那一件（或我沒把握是同一件），送到案例列表。
# 不能讓它們掉進 /product/(.*) → 花色庫，客戶會落在完全不相干的頁面。
PROD_AS_CASE = [
    "北市-中正區-廈門街案", "北市-中正區", "北市-北投區-某宅", "北市-大同區-三匯",
    "北市-大同區", "北市-大安區-國證", "北市-大安區-2", "北市-大安區",
    "北市-大直區-水綠清翫-2", "北市-大直區", "北市-文山區-微山丘",
    "北市-松山區-2", "北市-松山區", "北市-松山區02", "台中-南屯-大聚",
    "台中-某廠辦", "新北-三重區-左岸京站", "新北-板橋區-府中心", "新北-板橋區",
    "新北-永和區-仁愛柏麗01", "新北-汐止區-春田吉市", "桃市-桃園區-京懋會",
]

# 花色名稱 → 花色庫
HUE = [
    "克里特灰", "加里奧金", "卡拉拉", "安格拉", "帝寶米黃", "帝諾", "抽象紋理",
    "深灰石紋", "琥珀", "琥珀-2", "白玉蘭", "紫丁黑", "聖羅蘭黑", "銀狐",
    "鏽蝕", "鏽蝕-1", "鏽蝕-2", "鏽蝕-3", "鏽蝕-4", "鏽蝕-6", "鏽蝕-6-2",
    "雅仕白", "雕刻白", "雪白細紋", "黃金雕刻白", "黑網石",
]

# 固定頁面
PAGE = {
    "/實績案例": "/cases.html", "/實績案例-2-2": "/cases.html",
    "/煌盛興業股份有限公司": "/#about", "/about-us": "/#about",
    "/產品介紹-product": "/products.html", "/石紋系列": "/products.html",
    "/shop": "/products.html",
    "/聯絡我們": "/#contact", "/contact-us": "/#contact",
    "/藝格板": "/#tech", "/qa": "/#qa", "/blog": "/news.html",
    "/product-category/消防箱": "/cases.html",
    "/product-category/防火門": "/cases.html",
    "/product-category/藝格板": "/products.html",
    "/product-category/藝格板/木紋系列": "/products.html",
    "/product-category/藝格板/石紋系列": "/products.html",
    "/product-category/藝格板/繡蝕系列": "/products.html",
    "/portfolio-tag/藝格板": "/products.html",
}

# 萬用收尾。一定要排在所有明確規則之後 —— Vercel 由上往下比，先中先贏。
FALLBACK = [
    ("/portfolio-item/(.*)", "/cases.html"),
    ("/portfolio-item",      "/cases.html"),
    ("/product/(.*)",        "/products.html"),
    ("/product",             "/products.html"),
    ("/product-category/(.*)", "/products.html"),
    ("/shop/(.*)",           "/products.html"),
]


def lower_pct(s):
    """把 %E8 之類的十六進位轉成小寫，路徑其餘部分不動。"""
    out, i = [], 0
    while i < len(s):
        if s[i] == "%" and i + 2 < len(s):
            out.append(s[i:i + 3].lower()); i += 3
        else:
            out.append(s[i]); i += 1
    return "".join(out)


def variants(path):
    """一條來源路徑要涵蓋的所有寫法：原文／大寫編碼／小寫編碼 × 有無結尾斜線。"""
    enc = urllib.parse.quote(path, safe="/")
    for base in {path, enc, lower_pct(enc)}:
        yield base
        yield base + "/"


def build():
    pairs = []
    for kind, mp in CASE.items():
        for slug, cid in mp.items():
            pairs.append((f"/{kind}/{slug}", f"/cases.html?case={cid}"))
    for slug in PROD_AS_CASE:
        pairs.append((f"/product/{slug}", "/cases.html"))
    for h in HUE:
        pairs.append((f"/product/{h}", "/products.html"))
    pairs.extend(PAGE.items())

    seen, redirects = set(), []
    for src, dst in pairs:
        for v in variants(src):
            if v in seen:
                continue
            seen.add(v)
            redirects.append({"source": v, "destination": dst, "statusCode": 301})
    for src, dst in FALLBACK:
        redirects.append({"source": src, "destination": dst, "statusCode": 301})
    return redirects


def write_vercel(rules):
    p = os.path.join(ROOT, "vercel.json")
    cfg = json.load(open(p, encoding="utf-8"))
    cfg["redirects"] = rules
    with open(p, "w", encoding="utf-8", newline="\n") as f:
        f.write(json.dumps(cfg, ensure_ascii=False, indent=2) + "\n")
    print(f"vercel.json：{len(rules)} 條（Vercel 上限 1024）")
    if len(rules) > 1024:
        raise SystemExit("★ 超過 Vercel 上限，需要改用萬用規則收斂")


def write_cloudflare(rules):
    """
    Cloudflare Pages 的 _redirects。搬到 Cloudflare 之後 vercel.json 不會被讀，
    這 574 條轉址全部會消失 —— 兩份一起產，才不會搬家搬到一半才發現。

    格式差異：
      Vercel      {"source": "/a", "destination": "/b", "statusCode": 301}
      Cloudflare  /a  /b  301          （空白分隔的純文字，一行一條）
    萬用字元也不同：Vercel 用 (.*)，Cloudflare 用 *。
    額度：免費方案 2000 條靜態 + 100 條動態（含 * 的算動態）。
    """
    lines = [
        "# 舊站 egrra.com 的 301 轉址（Cloudflare Pages 格式）",
        "# 這個檔由 tools/gen-redirects.py 產生，不要手改 —— 改了下次重跑就沒了。",
        "# 對照表與踩過的坑都寫在那支程式裡。",
        "",
    ]
    static, dynamic = 0, 0
    for r in rules:
        src = r["source"].replace("(.*)", "*")
        if "*" in src:
            dynamic += 1
        else:
            static += 1
        lines.append(f'{src}  {r["destination"]}  301')
    p = os.path.join(ROOT, "_redirects")
    with open(p, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(lines) + "\n")
    print(f"_redirects：靜態 {static} 條（上限 2000）、動態 {dynamic} 條（上限 100）")
    if static > 2000 or dynamic > 100:
        raise SystemExit("★ 超過 Cloudflare Pages 上限")


def main():
    rules = build()
    write_vercel(rules)
    write_cloudflare(rules)


if __name__ == "__main__":
    main()

# 驗證方式（改完一定要跑）：
#   抓 https://egrra.com 的各支 sitemap，把每個網址原封不動打到新站，
#   逐條檢查狀態碼「以及 Location」。只看狀態碼會被騙 —— 掉進萬用規則
#   一樣是 301，但 ?case= 已經丟了。
