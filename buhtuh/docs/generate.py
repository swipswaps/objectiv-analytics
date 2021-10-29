import glob
import re
from os import path, makedirs, remove
from shutil import copyfile
import json
from typing import List, Dict, Any
from lxml import html
from lxml.etree import ElementTree

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


def toc_from_links(html_doc: ElementTree, element_xpath: str, node_xpath: str, level: int) -> List[Dict[str, Any]]:
    """
    Parses Sphinx generated html fragment to construct part of the toc

    :param html_doc: lxml html parser
    :param element_xpath: xpath query that returns s list of anchor html fragments
    :param node_xpath: xpath query to determine value/name of link
    :param level: int level in menu structure
    :return: List of Dictionary with TOC items for docusaurus
    """
    links = html_doc.xpath(element_xpath)

    if links:
        entries = []
        for f in links:
            # get simple function name from span in table
            nodes = f.xpath(node_xpath)
            if len(nodes) > 0:
                node = nodes[0]
                simple_name = node.text
            else:
                simple_name = f.get('title')

            entries.append({
                'value': simple_name,
                'id': f.get('title') or f.get('id'),
                'children': [],
                'level': level
            })

        return entries
    return []


# make sure we can find docusaurus
if not path.isdir(docusaurus_dir):
    print(f'Could not find docusaurus here {docusaurus_dir}')
    exit(1)


position = 2

# sort urls alphabetically, remove .html
urls = sorted(glob.glob(f"{html_dir}/**/*.html", recursive=True), key=lambda k: k.replace('.html', ''))
for url in urls:
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

    title = path.basename(url).replace('.html', '')

    # table of contents
    toc = []
    doc = html.parse(url)
    headers = toc_from_links(doc, '//main//section', '*[self::h1 or self::h2 or self::h3]', 2)
    for header in headers:
        toc.append(header)

    modules = toc_from_links(doc, '//p[@class="rubric" and text()="Modules"]/following-sibling::*[1]//tr//a',
                             'code/span', 3)
    if modules:
        toc.append({
            'value': 'Modules',
            'id': '',
            'children': modules,
            'level': 2})

    functions = toc_from_links(doc, '//p[@class="rubric" and text()="Functions"]/following-sibling::*[1]//tr//a',
                               'code/span', 3)
    if functions:
        toc.append({
            'value': 'Functions',
            'id': '',
            'children': functions,
            'level': 2})

    classes = toc_from_links(doc, '//p[@class="rubric" and text()="Classes"]/following-sibling::*[1]//tr//a',
                             'code/span', 3)
    if classes:
        for c in classes:

            xpath = f'//dl[@class="py class"]/dt[@id="{c["id"]}"]/following-sibling::dd//dl[@class="py method" or ' \
                    f'@class="py attribute"]/dt'
            attrs = toc_from_links(doc, xpath, 'span/span', 3)
            for attr in attrs:
                c['children'].append(attr)
        toc.append({
            'value': 'Classes',
            'id': '',
            'children': classes,
            'level': 2})

    # little magic around the index:
    # make sure it comes first, and change the name to introduction
    if title == 'index':
        sidebar_label = 'Introduction'
        sidebar_position = 1
        slug = f'/{module}'
        toc = []
    else:
        sidebar_label = title
        sidebar_position = position
        position += 1
        slug = f'/{module}/{real_url.replace(".html", "")}'

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

export const toc = {json.dumps(toc, indent=4)};


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
