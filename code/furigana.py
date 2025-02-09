import re
import pykakasi

kks = pykakasi.kakasi()

def is_kana(ch):
    return ('\u3040' <= ch <= '\u309F') or ('\u30A0' <= ch <= '\u30FF')

def split_left(s):
    segments = []
    buf = ""
    buf_type = None  # 'kana' 或 'kanji'
    for ch in s:
        t = 'kana' if is_kana(ch) else 'kanji'
        if buf and t == buf_type:
            buf += ch
        else:
            if buf:
                if buf_type == 'kana':
                    # 將假名逐字拆分
                    segments.extend(list(buf))
                else:
                    segments.append(buf)
            buf = ch
            buf_type = t
    if buf:
        if buf_type == 'kana':
            segments.extend(list(buf))
        else:
            segments.append(buf)
    return segments

# 用遞迴方法為每個片段分配讀音。
# segments: 剩下要處理的左側片段（順序不可變）
# reading: 目前剩下的讀音字串
# 如果成功，回傳一個 list，每個元素是 (左側片段, 讀音分段)
def assign(segments, reading):
    # 若兩邊都空，成功
    if not segments and not reading:
        return []
    # 若左側用完但讀音還有，失敗
    if not segments:
        return None

    # 為後續片段計算最小所需長度：
    # 假名片段必須剛好1個讀音字元，
    # 漢字片段至少需要 len(片段) 個讀音字元
    def minreq(segs):
        r = 0
        for seg in segs:
            if len(seg) == 1 and is_kana(seg):
                r += 1
            else:
                r += len(seg)
        return r

    first, rest = segments[0], segments[1:]
    # 如果目前片段是單一假名，必須對應讀音的第一個字元（而且通常要求一致）
    if len(first) == 1 and is_kana(first):
        if reading and reading[0] == first:
            sol = assign(rest, reading[1:])
            if sol is not None:
                return [(first, reading[0])] + sol
        return None
    else:
        # 目前片段為漢字組，至少需要 len(first) 個讀音字元。
        # 嘗試從 len(first) 到「剩下讀音字串長度扣除後續最小需求」的各種可能長度
        for L in range(len(first), len(reading) - minreq(rest) + 1):
            candidate = reading[:L]
            sol = assign(rest, reading[L:])
            if sol is not None:
                return [(first, candidate)] + sol
        return None
    
def add_ruby(original, reading):
    result = ""
    rlist = assign(original, reading)
    if not rlist:
        print("### mismatch ###")
        print(original)
        print(reading)
        return f"<ruby>{original}<rt>{reading}</rt></ruby>" 

    # merge kanji
    n = len(rlist)
    rlist2 = []
    i = 0
    while i < n:
        kanji, kana = rlist[i]
        while i < n - 1:
            kanji2, kana2 = rlist[i+1]
            if is_kana(kanji) or is_kana(kanji2):
                break

            kanji += kanji2
            kana += kana2
            i += 1

        rlist2.append((kanji, kana))
        i += 1

    for kanji, kana in rlist2:
        if kanji==kana:
            result += kana
        else:
            result += f"<ruby>{kanji}<rt>{kana}</rt></ruby>"
    return result

def add_furigana(text):
    result = []
    
    for word in kks.convert(text):
        original = word["orig"]  # 原始日文
        reading = word["hira"]   # 轉換後的平假名

        # 只對漢字加 furigana（篩選出至少含有一個漢字的詞）
        if re.search(r'[\u4e00-\u9fff]', original):
            ruby_text = add_ruby(original, reading)
        else:
            ruby_text = original  # 非漢字部分不加 ruby
        
        result.append(ruby_text)
    
    return "".join(result)
