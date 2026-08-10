# -*- coding: utf-8 -*-
"""
Cloudflare Pages Functions 的粗略檢查。

這台機器沒有 Node，做不了真正的語法解析，所以只檢查兩件最容易在手改時
出錯的事：括號配對，以及「用到大寫常數但沒有 import 也沒有定義」。

（後者是真的踩過：把 news.js 的 import 區塊整段換掉時，順手把同一段裡的
  CORS 定義也刪了，六處用到它的地方全變成未定義。)

真正的語法檢查要等 Pages 部署 —— 這支只是先擋掉低級錯誤。

用法：python tools/check-functions.py
"""
import re
import glob
import sys

# 去掉註解、字串與正規表示式字面值，避免把它們裡面的括號算進來。
#
# ★ 正規表示式字面值一定要處理 ★
#   少了這條，/"([^"]+)"/ 裡的兩個雙引號會被當成一段字串吃掉，
#   連帶把 [^ 也吃掉，於是整個檔案的括號統計全錯 —— 第一版就是這樣
#   把 published.js 和 news-fetch.js 誤報成括號不配對。
#
#   要分辨 / 是除法還是正規表示式開頭，看它前面是什麼：
#   前面若是運算子或開括號，那就是正規表示式。這是啟發式，不是完整剖析，
#   但對這個專案的寫法夠用。
STRIP = re.compile(
    r"/\*[\s\S]*?\*/"                       # 區塊註解
    r"|//[^\n]*"                            # 行註解
    r'|"(?:[^"\\\n]|\\.)*"'                 # 雙引號字串
    r"|'(?:[^'\\\n]|\\.)*'"                 # 單引號字串
    r"|`(?:[^`\\]|\\.)*`"                   # 樣板字串
    r"|(?<=[(,=:\[!&|?{;+\n])\s*"           # 前面是運算子／開括號 → 後面的 / 是正規表示式
    r"/(?![*/])"                            # 但 /* 與 // 是註解，不是正規表示式
    r"(?:[^/\\\n\[]|\\.|\[(?:[^\]\\]|\\.)*\])+/[gimsuy]*"
)
# ↑ (?![*/]) 這個否定前瞻是必要的：少了它，「\n   /* U+2028 / U+2029：…」
#   會從換行後的縮排開始，把 "/* U+2028 /" 當成一段正規表示式吃掉，
#   註解剩下的部分就沒被剝離，裡面的英文字會被誤報成未定義的常數。

BUILTIN = {
    "JSON", "Object", "Array", "String", "Number", "Math", "Date", "Set", "Map",
    "Promise", "Response", "Request", "URL", "URLSearchParams", "Error",
    "Uint8Array", "Boolean", "RegExp", "AbortController", "TextEncoder", "TextDecoder",
}


def main():
    ok = True
    files = sorted(glob.glob("functions/**/*.js", recursive=True))
    if not files:
        print("  找不到 functions/**/*.js")
        return 1

    for f in files:
        src = open(f, encoding="utf-8").read()
        code = STRIP.sub(" ", src)
        probs = []

        for open_ch, close_ch, name in (("{", "}", "大括號"), ("(", ")", "小括號"), ("[", "]", "中括號")):
            a, b = code.count(open_ch), code.count(close_ch)
            if a != b:
                probs.append(f"{name}不配對 {a}/{b}")

        imported = set()
        for m in re.finditer(r"import\s*\{([^}]*)\}", src):
            imported |= {x.strip().split(" as ")[-1] for x in m.group(1).split(",") if x.strip()}

        defined = set(re.findall(r"(?:export\s+)?(?:async\s+)?function\s+(\w+)", src))
        defined |= set(re.findall(r"(?:export\s+)?(?:const|let|var)\s+(\w+)", src))

        # 函式參數也算已定義（例如 PROMPT(list, TOPIC_KEYS) 裡的 TOPIC_KEYS）
        for m in re.finditer(r"(?:function\s+\w+|=>|\()\s*\(?([^)]*)\)?\s*(?:=>|\{)", src):
            defined |= set(re.findall(r"\b([A-Za-z_]\w*)\b", m.group(1)))

        # 只看「裸的」識別字。env.ADMIN_PASSWORD 這種屬性存取不是變數，
        # 前面有點號就跳過，否則每支都會誤報一堆環境變數名稱。
        used = set(re.findall(r"(?<![.\w])([A-Z][A-Z_0-9]{2,})\b", code))
        missing = sorted(used - imported - defined - BUILTIN)
        if missing:
            probs.append("用到但沒定義：" + ", ".join(missing))

        if probs:
            ok = False
            print(f"  ★ {f}")
            for p in probs:
                print(f"      {p}")
        else:
            print(f"  ✓ {f}")

    print()
    print("  " + ("括號配對與常數引用都通過（真正的語法檢查要等部署）" if ok else "★ 上面有問題，先修掉再部署"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
