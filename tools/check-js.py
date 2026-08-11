# -*- coding: utf-8 -*-
"""
JS／HTML 內嵌腳本的括號配對粗查（本機沒有 Node，這是唯一的擋網）。

★ 一定要剝離正規表示式字面值 ★
  少了這一條，/[一-鿿]{2,20}/ 這種寫法裡的大括號會被算進去，
  好好的檔案會被誤判成不配對 —— 然後就會花時間去修一個不存在的問題。
  （2026-08-11 就是這樣：i18n-dict.js 抽字典時被自己的檢查器騙了兩次。）

  另外 (?![*/]) 也是必要的：沒有它，「\\n  /* 註解 */」會從換行後的縮排
  開始，把 "/* …… /" 當成一段正規表示式吃掉，後面整段就沒被剝離。

用法：python tools/check-js.py [檔案...]
      不給參數就檢查全站的 .js 與 .html 內嵌腳本。
      加 --git 會同時比對 HEAD 版本，看是「本來就這樣」還是「這次改壞的」。
"""
import glob
import os
import re
import subprocess
import sys

STRIP = re.compile(
    r"/\*[\s\S]*?\*/"                       # 區塊註解
    r"|//[^\n]*"                            # 行註解
    r'|"(?:[^"\\\n]|\\.)*"'                 # 雙引號字串
    r"|'(?:[^'\\\n]|\\.)*'"                 # 單引號字串
    r"|`(?:[^`\\]|\\.)*`"                   # 樣板字串
    r"|(?<=[(,=:\[!&|?{;+\n])\s*"           # 前面是運算子／開括號 → 後面的 / 是正規表示式
    r"/(?![*/])"                            # 但 /* 與 // 是註解
    r"(?:[^/\\\n\[]|\\.|\[(?:[^\]\\]|\\.)*\])+/[gimsuy]*"
)

SCRIPT = re.compile(r"<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)</script>", re.I)


def js_of(path, src):
    return "\n".join(SCRIPT.findall(src)) if path.lower().endswith((".html", ".htm")) else src


def balance(code):
    c = STRIP.sub(" ", code)
    return (c.count("{") - c.count("}"), c.count("(") - c.count(")"), c.count("[") - c.count("]"))


def head_version(path):
    r = subprocess.run(["git", "show", f"HEAD:{path}"], capture_output=True)
    return r.stdout.decode("utf-8", "ignore") if r.returncode == 0 else None


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    use_git = "--git" in sys.argv
    files = args or (sorted(glob.glob("*.js")) + sorted(glob.glob("*.html")))
    bad = 0
    for f in files:
        if not os.path.exists(f):
            continue
        cur = balance(js_of(f, open(f, encoding="utf-8").read()))
        note = ""
        if use_git:
            old = head_version(f)
            if old is not None:
                prev = balance(js_of(f, old))
                note = "  (HEAD %s)" % (",".join(map(str, prev)))
                if prev == cur:
                    note += "  ← 與改動前相同，不是這次弄壞的"
        ok = cur == (0, 0, 0)
        if not ok:
            bad += 1
        print(f"  {'✓' if ok else '★'} {f:26s} {{}}={cur[0]:+d}  ()={cur[1]:+d}  []={cur[2]:+d}{note}")
    print()
    print("  " + ("全部配對" if not bad else f"★ {bad} 個檔案不配對"))
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
