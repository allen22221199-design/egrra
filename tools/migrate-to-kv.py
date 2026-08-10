# -*- coding: utf-8 -*-
"""
把 Vercel Blob 上的資料搬進 Cloudflare KV。

搬什麼：
  1. site-data.json —— 後台「發布上線」的內容快照（209 個花色、37 件案例、39 家客戶）
  2. 後台上傳的照片 —— 存在 Blob 上，資料裡記的是絕對網址

★ 為什麼照片一定要一起搬 ★
  資料裡存的是 https://xxx.public.blob.vercel-storage.com/uploads/... 這種
  絕對網址。Vercel 那邊一停，那些圖就全黑了 —— 而且是「網站看起來好好的、
  只有圖不見」，最不容易發現的壞法。所以搬資料的同時一定要把圖也搬過來，
  並把網址改寫成 /f/uploads/xxx。

★ 為什麼改寫成「相對路徑」 ★
  /f/uploads/xxx 不帶網域。同一份資料在 pages.dev 預覽站與正式的 egrra.com
  上都能用，日後換網域也不必再改一次資料。

用法：
  set CF_TOKEN=...   （或放在 scratchpad/.cf_token）
  python tools/migrate-to-kv.py --dry     先看會做什麼，不寫入
  python tools/migrate-to-kv.py           實際執行
"""
import json
import mimetypes
import os
import re
import sys
import time
import urllib.request
import uuid

ACCOUNT = "b9b7123e1a603da6edbf05b31338e3e7"
NAMESPACE = "dc382523468c427984e667205d257d8c"          # KV：egrra-kv
SRC = "https://egrra.vercel.app"
SCRATCH = os.environ.get("EGRRA_SCRATCH", ".")

BLOB_RE = re.compile(r"https://[a-z0-9]+\.public\.blob\.vercel-storage\.com/[^\"'\\\s)]+")


def token():
    t = os.environ.get("CF_TOKEN") or os.environ.get("CLOUDFLARE_API_TOKEN")
    if not t:
        p = os.path.join(SCRATCH, ".cf_token")
        if os.path.exists(p):
            t = open(p, encoding="utf-8").read().strip()
    if not t:
        sys.exit("★ 找不到 API token（設 CF_TOKEN 環境變數）")
    return t


def get(url, timeout=60, tries=4):
    """
    下載。一定要重試 —— 實測 36 張圖有 5 張會逾時（Vercel Blob 偶發），
    而這裡漏一張，搬完之後那張圖就永遠是黑的，還很難發現是哪一張。
    """
    last = None
    for i in range(tries):
        try:
            r = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(r, timeout=timeout + i * 30) as f:
                return f.read(), f.headers.get("Content-Type", "")
        except Exception as e:
            last = e
            time.sleep(2 * (i + 1))
    raise last


def kv_put(tok, key, value, content_type, name=""):
    """
    寫一筆進 KV。API 要 multipart/form-data，欄位是 value 與 metadata。
    metadata 的形狀要跟 functions/_lib/store.js 的 put() 對齊，
    否則 /f/ 端點吐圖片時會拿不到 contentType。
    """
    boundary = "----egrra" + uuid.uuid4().hex
    meta = json.dumps({"contentType": content_type, "ts": 0, "name": name}, ensure_ascii=False)
    body = b""
    body += f'--{boundary}\r\nContent-Disposition: form-data; name="metadata"\r\n\r\n'.encode()
    body += meta.encode("utf-8") + b"\r\n"
    body += f'--{boundary}\r\nContent-Disposition: form-data; name="value"\r\n\r\n'.encode()
    body += (value if isinstance(value, bytes) else value.encode("utf-8")) + b"\r\n"
    body += f"--{boundary}--\r\n".encode()

    url = (f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}"
           f"/storage/kv/namespaces/{NAMESPACE}/values/{urllib.parse.quote(key, safe='')}")
    req = urllib.request.Request(url, data=body, method="PUT", headers={
        "Authorization": "Bearer " + tok,
        "Content-Type": "multipart/form-data; boundary=" + boundary,
    })
    with urllib.request.urlopen(req, timeout=90) as f:
        return json.loads(f.read().decode("utf-8"))


def kv_key_for(blob_url, content_type):
    """
    Blob 的檔名沒有副檔名（例如 uploads/IMG20251030155711-z3MMt1F8yrFMhsNkEa）。
    /f/ 端點是靠 metadata 的 contentType 決定回應標頭的，副檔名只是給人看的，
    但補上去比較不容易誤會，也方便日後在 KV 後台辨認。
    """
    name = blob_url.rsplit("/", 1)[-1].split("?")[0]
    if "." not in name:
        ext = mimetypes.guess_extension((content_type or "").split(";")[0].strip()) or ".jpg"
        if ext == ".jpe":
            ext = ".jpg"
        name += ext
    return "uploads/" + name


def main():
    dry = "--dry" in sys.argv
    tok = token()

    print("═══ 一、抓取 Vercel 上的現況 ═══")
    raw, _ = get(SRC + "/api/published?raw=1")
    text = raw.decode("utf-8")
    data = json.loads(text)
    print(f"  site-data.json  {len(text)/1024:.0f} KB  dataVersion {data.get('dataVersion')}")
    print(f"    products {len(data.get('products', []))}"
          f"  cases {len(data.get('cases', []))}"
          f"  clients {len(data.get('clients', []))}")

    urls = sorted(set(BLOB_RE.findall(text)))
    print(f"  Blob 圖片        {len(urls)} 個")

    print("\n═══ 二、搬圖片 ═══")
    mapping = {}
    failed = []
    for i, u in enumerate(urls, 1):
        try:
            blob, ct = get(u)
        except Exception as e:
            failed.append((u, str(e)))
            print(f"  {i:3d}/{len(urls)} ★ 下載失敗 {u[-40:]}  {e}")
            continue
        key = kv_key_for(u, ct)
        if not dry:
            r = kv_put(tok, key, blob, (ct or "image/jpeg").split(";")[0].strip(),
                       name=key.rsplit("/", 1)[-1])
            if not r.get("success"):
                failed.append((u, str(r.get("errors"))))
                print(f"  {i:3d}/{len(urls)} ★ 寫入失敗 {key}  {r.get('errors')}")
                continue
        mapping[u] = "/f/" + key
        print(f"  {i:3d}/{len(urls)} {len(blob)//1024:>5} KB  {ct.split(';')[0]:<12} → /f/{key}")

    print("\n═══ 三、改寫資料裡的圖片網址 ═══")
    out = text
    for old, new in mapping.items():
        out = out.replace(old, new)
    left = BLOB_RE.findall(out)
    print(f"  換掉 {len(mapping)} 個網址；仍殘留 Blob 網址 {len(left)} 個")
    if left:
        print("  ★ 殘留的（搬完 Vercel 停掉後這些圖會變黑）：")
        for u in sorted(set(left))[:10]:
            print("     ", u)

    print("\n═══ 四、寫入 site-data.json ═══")
    if dry:
        print("  （--dry，未寫入）")
    else:
        r = kv_put(tok, "site-data.json", out, "application/json; charset=utf-8")
        print("  " + ("成功" if r.get("success") else "★ 失敗 " + str(r.get("errors"))))

    if failed:
        print(f"\n★ 有 {len(failed)} 個失敗，見上方")
        return 1
    print("\n  完成")
    return 0


if __name__ == "__main__":
    import urllib.parse  # noqa: E402  （kv_put 需要，放這裡避免頂部匯入順序看起來雜亂）
    sys.exit(main())
