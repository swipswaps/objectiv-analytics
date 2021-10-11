import glob
import re
from os import path, makedirs, remove
from shutil import copyfile

html_dir = 'build/html/'

docusaurus_dir = '../../../objectiv.io'
docs = 'docs'
static = 'static'

buhtuh = 'buhtuh'
docs_target = f'{docusaurus_dir}/{docs}/{buhtuh}'
static_target = f'{docusaurus_dir}/{static}/{buhtuh}'

"""
generated=src/generated/buhtuh
target=static/buhtuh

rm -rf $generated
mkdir -p $generated
cp -r ../objectiv-analytics/buhtuh/docs/build/html/* $generated
cp -r $generated/_images docs/buhtuh
"""

patterns = [
    '^index.html$',
    'api/.*?',
]

for url in glob.glob(f"{html_dir}/**/*.html", recursive=True):


    # this is the url to the original html fragment
    # it's an absolute url, docusaurus will take care of the rest
    real_url = url.replace(html_dir, "")

    print(f'checking: {real_url}')
    match = False
    for pattern in patterns:
        if re.match(pattern, real_url):
            print(f'match {pattern} for {real_url}')
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
    else:
        sidebar_label = title
        sidebar_position = 99

    # template for the mdx file
    # please leave the whitespace as is (it's part of the markdown)
    mdx = \
f"""---
id: {title}
hide_title: true
sidebar_position: {sidebar_position}
sidebar_label: {sidebar_label}
---


import SphinxPages from '@site/src/components/sphinx-page'
import useBaseUrl from '@docusaurus/useBaseUrl'


<SphinxPages url={{useBaseUrl('{buhtuh}/{real_url}')}} />
"""
    # set target path to generated .mdx file
    #target_path = url.replace(html_dir, '').replace('.html', '.mdx')
    target_path = f'{docs_target}/{real_url.replace(".html", ".mdx")}'

    print(f'writing to {target_path}')

    with open(target_path, 'w') as target_handle:
        target_handle.write(mdx)

