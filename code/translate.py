import zhconv
import re

def translate_text(input_text):
    return f"{input_text}"
    messages = [
            { 
                "role": "system", 
                "content": system_hint
            },
            {
                "role": "user",
                "content": remove_ruby_tags(input_text)
            },
        ]

    response = openai_client.chat.completions.create(
                model='deepseek-r1:14b',
                messages=messages
            )

    output = response.choices[0].message.content
    output = remove_think_tags(output)
    return output

def translate_list(idx, src_dict, dst_dict):   
    src_list = []
    for key, text in src_dict.items():
        if key not in dst_dict:
            src_list.append((key, text))

    src_txt = ""
    dst_txt = ""
    n = len(src_list)
    i = 0
    for key, text in src_list:
        src_txt += f'<p id="{key}">{text}</p>\n'
        i += 1
        if len(src_txt) > 1000:
            print(f"[{idx}] translate to lines {i}/{n}")
            dst_txt += translate_text(src_txt)
            src_txt = ""

    if len(src_txt) > 0:
        print(f"[{idx}] translate to final ({n})")
        dst_txt += translate_text(src_txt)
        src_txt = ""

    # convert to tranditional chinese
    dst_txt = zhconv.convert(dst_txt, 'zh-tw')

    # match tx
    # Regular expression to extract id and content
    matches = re.findall(r'<p\s+id.*?="?(\d+)"?>(.*?)(?:</p>|(?=<p id=|\Z))', dst_txt)

    # Convert id to integer and create the list of tuples
    dst_list = [(int(idx), content) for idx, content in matches]
    dst_dict.update(dst_list)
