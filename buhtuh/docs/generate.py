import glob
import re
from os import path, makedirs, remove
from shutil import copyfile
import json
from typing import List
from lxml import html

html_dir = 'build/html/'

docusaurus_dir = '../../../objectiv.io'
docs = 'docs'
static = 'static'

module = 'modeling'
docs_target = f'{docusaurus_dir}/{docs}/{module}'
static_target = f'{docusaurus_dir}/{static}/{module}'

# whitelist of pages to consider
patterns = [
    '^index.html$',
    'buhtuh/.*?',
    'sql_models/.*?'
]


def toc_from_links(html_doc, xpath, node_xpath) -> List:
    """
    Parses Sphinx generated html fragment to construct part of the toc

    :param html_doc: lxml html parser
    :param xpath: xpath query that returns s list of anchor html fragments
    :param scope: should be Function or Classes
    :return: dictionary with TOC items for docusaurus
    """
    links = html_doc.xpath(xpath)

    if links:
        entries = []
        for f in links:
            # get simple function name from span in table
            nodes = f.xpath(node_xpath)
            if len(nodes) > 0:
                node = nodes[0]
                simple_name = ''.join(node.itertext()).strip()
            else:
                simple_name = f.get('title')

            print(f'jow: -> {f.get("titlle")} -- {f.get("id")}')
            entries.append({
                'value': simple_name,
                'id': f.get('title') or f.get('id'),
                'children': [],
                'level': 2
            })

        return entries

    print('no links')
    return []


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

    # table of contents
    toc = [{
        'value': title,
        'id': '',
        'children': [],
        'level': 2
    }]
    doc = html.parse(url)
    functions = toc_from_links(doc, '//p[@class="rubric" and text()="Functions"]/following-sibling::*[1]//tr//a', 'code/span')
    if functions:
        toc.append({
            'value': 'Functions',
            'id': '',
            'children': functions,
            'level': 2})
    classes = toc_from_links(doc, '//p[@class="rubric" and text()="Classes"]/following-sibling::*[1]//tr//a', 'code/span')
    if classes:
        for c in classes:

            xpath = f'//dl[@class="py class"]/dt[@id="{c["id"]}"]/following-sibling::dd//dl[@class="py method" or @class="py attribute"]/dt'
            print(f'cheking class: {c["id"]} with {xpath}')
            p = toc_from_links(doc, xpath, 'span')
            print(f'dusL: {p}')
            for method in p:
                c['children'].append(method)
                # c['children'].append(toc_from_links(doc, xpath, ''))
        #print(classes)
        toc.append({
            'value': 'Classes',
            'id': '',
            'children': classes,
            'level': 2})

    print(json.dumps(toc, indent=4))

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

export const toc = {json.dumps(toc)};


import SphinxPages from '@site/src/components/sphinx-page'
import useBaseUrl from '@docusaurus/useBaseUrl'


<SphinxPages url={{useBaseUrl('{module}/{real_url}')}} />
"""
    # set target path to generated .mdx file
    # target_path = url.replace(html_dir, '').replace('.html', '.mdx')
    target_path = f'{docs_target}/{real_url.replace(".html", ".mdx")}'

    print(f'writing to {target_path}')

    with open(target_path, 'w') as target_handle:
        target_handle.write(mdx)
