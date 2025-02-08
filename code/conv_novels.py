import os

ORIG = "../orig"
DOCS = "../docs"

PRE_HTML = '''<!DOCTYPE html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Novels</title>
</head>
<body>
'''

POST_HTML = '''</body>
</html>
'''


def create_subject_index(subject):
    index_html = f"{DOCS}/{subject}/index.html"
    os.makedirs(os.path.dirname(index_html), exist_ok=True)

    with open(index_html, "w") as fh:
        fh.write(PRE_HTML)
        fh.write(f'    <h2>{subject}</h2>\n')
        fh.write(f'    <p><a href="../index.html">回到小說總表</a></p>\n')
        fh.write(POST_HTML)

def create_root_index(dirs):

    index_html = f"{DOCS}/index.html"
    
    with open(index_html, "w") as fh:
        fh.write(PRE_HTML)
        fh.write(f'    <h2>小說總表</h2>\n')
        for subject in dirs:
            fh.write(f'    <p><a href="{subject}/index.html">{subject}</a></p>\n')
            create_subject_index(subject)
        fh.write(POST_HTML)

def main():
    dirs = os.listdir(ORIG)
    dirs = [dir for dir in dirs if os.path.isfile(f'{ORIG}/{dir}/001.xml')]
    
    create_root_index(dirs)


if __name__ == '__main__':
    main()

