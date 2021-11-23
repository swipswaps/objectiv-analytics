import glob
import re
from os import path, makedirs, remove
from shutil import copyfile
from pathlib import Path


html_dir = 'build/html/'

docusaurus_dir = '../../../objectiv.io'
docs = 'docs'
static = 'static'

module = 'bach'
docs_target = f'{docusaurus_dir}/{docs}/{module}'
static_target = f'{docusaurus_dir}/{static}/{module}'

# whitelist of pages to consider
patterns = [
    '^index.html$',
    'api/.*?',
]

# make sure we can find docusaurus
if not path.isdir(docusaurus_dir):
    print(f'Could not find docusaurus here {docusaurus_dir}')
    exit(1)

for url in glob.glob(f"{html_dir}/**/*.html", recursive=True):
    # this is the url to the original html fragment
    # it's an absolute url, docusaurus will take care of the rest
    real_url = url.replace(html_dir, "")

    match = False
    for pattern in patterns:
        if re.match(pattern, real_url):
            match = True
    if not match:
        print(f'ignoring {real_url}')
        continue

    # dir where .mdx will be stored
    docs_target_dir = f'{docs_target}/{path.dirname(real_url)}'
    static_target_dir = f'{static_target}/{path.dirname(real_url)}'

    # create dir if needed
    if not path.isdir(docs_target_dir):
        print(f'creating {docs_target_dir}')
        makedirs(docs_target_dir)

    # create dir if needed
    if not path.isdir(static_target_dir):
        print(f'creating {static_target_dir}')
        makedirs(static_target_dir)

    target_file = f'{static_target}/{real_url}'
    if path.exists(target_file):
        remove(target_file)
    print(f'copy "{url}" -> {target_file}')
    copyfile(url, target_file)

    # little magic around the index:
    # make sure it comes first, and change the name to introduction
    title = path.basename(url).replace('.html', '')
    if title == 'index':
        sidebar_label = 'Introduction'
        sidebar_position = 1
        slug = f'/{module}'
    else:
        sidebar_label = title
        sidebar_position = 99
        slug = f'/{module}/{real_url.replace(".html", "")}'

    # load real_url file contents
    html_content = Path(url).read_text()

    # TODO process html_content
    """ 
    We need to process html_content so it's compatible with Docusaurus, basically what currently is done by SphinxPage.
    
    We have several options:
    
    1. run an external Node.JS script and use something like parse5 & cheerio (or even overkill jsdom)
    2. do the processing here in python with something like minidom or BeautifulSoup 
    3. or just use regex, since all we need to do is find/replace for the most part
    
    Either one probably works for the simple stuff we need to do
    
    """

    # template for the mdx file
    # please leave the whitespace as is (it's part of the markdown)
    mdx = \
        f"""---
id: {title}
hide_title: true
slug: {slug}
sidebar_position: {sidebar_position}
sidebar_label: {sidebar_label}
---

{html_content}

"""
    # set target path to generated .mdx file
    # target_path = url.replace(html_dir, '').replace('.html', '.mdx')
    target_path = f'{docs_target}/{real_url.replace(".html", ".mdx")}'

    print(f'writing to {target_path}')

    with open(target_path, 'w') as target_handle:
        target_handle.write(mdx)
