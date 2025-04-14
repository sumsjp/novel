import os
import re 
import glob
from lxml import etree
from langdetect import detect, DetectorFactory
import translate
import furigana
import unicodedata

# 初始化分詞器 & 轉換器
DetectorFactory.seed = 0  # 保持结果一致性

ORIG = "../orig"
DOCS = "../docs"

POST_HTML = '''</body>
</html>
'''

##### region translate

def is_chinese_string(s):
    if "[TRANS]" in s:
        return True
    
    try:
        lang = detect(s)
        if lang[:2] in ["zh", "ko"]:
            return True
        print(f"lang={lang} ({s})")
        return False
    except:
        return False
    

##### end region

def get_title(fname):
    with open(fname, "r", encoding="utf-8") as f:
        content = f.read()

    # Use regex to extract text inside <title>...</title>
    match = re.search(r"<title>(.*?)</title>", content, re.S)
    return match.group(1) if match else ""

def create_subject_index(subject):
    pre_html = f'''<!DOCTYPE html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{subject}</title>
    <link rel="stylesheet" href="../novel.css">
</head>
<body>
'''
    
    index_html = f"{DOCS}/{subject}/index.html"
    os.makedirs(os.path.dirname(index_html), exist_ok=True)

    orig_path = f"{ORIG}/{subject}"
    docs = sorted(os.listdir(orig_path))
    docs = [doc[:-4] for doc in docs if doc[-4:] == '.xml']

    with open(index_html, "w") as fh:
        fh.write(pre_html)
        fh.write(f'    <h2>{subject}</h2>\n')
        fh.write(f'    <p><a href="../index.html">回到小說總表</a></p>\n')
        for doc in docs:
            doc_file = f"{orig_path}/{doc}.xml"
            doc_title = get_title(doc_file)
            fh.write(f'    <p><a href="{doc}.html">[{doc}]　{doc_title}</a></p>\n')
        fh.write(POST_HTML)

def create_root_index(dirs):
    pre_html = '''<!DOCTYPE html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Novels</title>
    <link rel="stylesheet" href="novel.css">
</head>
<body>
'''
    
    index_html = f"{DOCS}/index.html"
    with open(index_html, "w") as fh:
        fh.write(pre_html)
        fh.write(f'    <h2>小說總表</h2>\n')
        for subject in dirs:
            nfc = unicodedata.normalize("NFC", subject)
            if nfc != subject:
                print(f"NFC: {nfc}")
            fh.write(f'    <p><a href="{nfc}/index.html">{subject}</a></p>\n')
            create_subject_index(subject)
        fh.write(POST_HTML)

def translate_file(fname, model_id):
    orig_file = f"{ORIG}/{fname}.xml"
    docs_file = f"{DOCS}/{fname}.html"

    # Read the XML content from the file
    with open(orig_file, 'r', encoding='utf-8') as file:
        xml_content = file.read()

    # Preprocess to fix malformed <br> tags (add self-closing '/')
    xml_content = re.sub(r'<br(?!\s*/)>', r'', xml_content)
    xml_content = f"<div>{xml_content}</div>"

    tree = etree.HTML(xml_content)
    ps = tree.xpath('//div[1]//p')
    title = tree.xpath('//div[1]//title')
    title =  title[0].text if len(title) > 0 else "NO TITLE"

    # 把所有的非空白句子找出。
    src_dict = {}  # 存要翻譯的句字
    dst_dict = {}  # 存放已經翻譯的句子
    n = len(ps)
    for i in range(n):
        p = ps[i]
        if p.text and p.text.strip():
            src_dict[i+1] = p.text.strip()

    for idx in range(3):
        dst_dict = {k: v for k, v in dst_dict.items() if is_chinese_string(v)}
        if len(src_dict) == len(dst_dict):
            break
        translate.translate_list(idx+1, src_dict, dst_dict, model_id)

    print(f"Convert {len(src_dict)} lines to {len(src_dict)} lines")

    # create directory first
    os.makedirs(os.path.dirname(docs_file), exist_ok=True)

    write_html(docs_file, title, src_dict, dst_dict)

def write_navi(fh, file_index, n):
    s = f'<a href="index.html">目次</a> | <a href="{file_index+1:03d}.html">次へ</a> [{n}]'
    if file_index > 1:
        s = f'<a href="{file_index-1:03d}.html">前へ</a> | ' + s
    else:
        s = f'前へ | ' + s

    fh.write(' ' * 4 + f'<p>{s}</p>\n')

def write_html(docs_file, title, src_dict, dst_dict):
    head = f'''<!DOCTYPE html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <link rel="stylesheet" href="../novel.css">
    <script src="../novel.js"></script>
</head>
<body>
'''

    file_index = int(os.path.basename(docs_file)[:-5])

    with open(docs_file, "w", encoding="utf-8") as fh:
        fh.write(head)
        s = f'<h3>{title}</h3>'
        fh.write(' ' * 4 + f'{s}\n')

        nline = len(src_dict)
        write_navi(fh, file_index, nline)

        for pidx, (idx, src) in enumerate(src_dict.items()):
            if pidx % 5 == 0:
                fh.write(f'   <button class="right-button" onclick="speakText(this, {pidx}, 5)"><img src="../speaker.svg"/></button>\n')
            fh.write('    <details>\n')
            fh.write(f'        <summary id="L{pidx}">{src}</summary>\n')
            fh.write('        <div style="margin-left: 20px;">\n')
            if idx in dst_dict:
                # fh.write(f'  <details>\n')
                fh.write(f'            <p class="translate">{dst_dict[idx]}[{pidx+1}]</p>\n')
            
            furi = furigana.add_furigana(src)
            
            btn = f'<button onclick="speakText(this, {pidx}, 1)"><img src="../speaker.svg"/></button>'
            fh.write(f'            <p class="furigana">{furi} ' + btn + '</p>\n')
            fh.write('        </div>\n')
            fh.write('    </details>\n\n')

            if (pidx + 1) % 100 == 0:
                fh.write('    <hr/>\n')

        write_navi(fh, file_index, nline)

        fh.write(POST_HTML)


def translate_docs(model_id):
    orig_files = glob.glob(f"{ORIG}/**/*.xml")
    docs_files = glob.glob(f"{DOCS}/**/*.html")

    orig_basenames = {f[len(ORIG)+1:-4] for f in orig_files}
    docs_basenames = {f[len(DOCS)+1:-5] for f in docs_files}  

    todo_files = orig_basenames
    todo_files = [f for f in todo_files if f not in docs_basenames]
    todo_files = sorted(todo_files)

    n = len(todo_files)
    for i in range(n):
        fname = todo_files[i]
        print(f"({i+1}/{n}) {fname}")
        try:
            translate_file(fname, model_id)
        except Exception as ex:
            print(f"Exception: {ex}")

def main():
    dirs = sorted(os.listdir(ORIG))
    dirs = [dir for dir in dirs if os.path.isfile(f'{ORIG}/{dir}/001.xml')]
    
    create_root_index(dirs)
    translate_docs(0)

if __name__ == '__main__':
    main()
