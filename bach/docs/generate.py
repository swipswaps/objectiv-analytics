import glob
import re
from os import path, makedirs
import json
from typing import Dict
from lxml import html, etree

"""
Copyright Objectiv B.V. 2021

Used to import Sphinx generated python docs into docusaurus. This script does the following:
- find all html pages in build/html
- extract the "body" from the page
- fix links in the "modules"
- extract toc from the html
- preserve order of left navbar, by extracting/saving that (using sidebar_order)
- write the static html to docusaurus/static/_{module}
- generate .mdx files, and write those to {docs}/{module}

"""

html_dir = 'build/html/'

docusaurus_dir = '../../../objectiv.io/docs'
docs = 'docs'
static = 'static'

module = 'modeling/api-reference'

docs_target = f'{docusaurus_dir}/{docs}/{module}'
static_target = f'{docusaurus_dir}/{static}/_{module}'

# whitelist of pages to consider
patterns = [
    '^index.html$'
]

modules = []
# list of special cases, where we have a subdir, with an introduction at toplevel
# eg /dataframe.html and /dataframe/
for fn in glob.glob(f'{html_dir}/*'):
    if path.isdir(fn) and path.isfile(f'{fn}.html'):
        modules.append(path.basename(fn))

# add modules to whitelist
patterns.extend([f'{m}.*' for m in modules])


def a_to_toc(a: html.Element, level: int) -> Dict:
    """
    provided an anchor HTML element, return a docusaurus toc item
    :param a: html.Element
    :param level: level of indentation in the toc, should be either 2 or 3
    :return: Dictionary with toc_item
    """
    return {
        'value': a.text.strip(),
        'id': a.get('href')[1:],
        'children': [],
        'level': level
    }


# build lookup table based on left navbar in sphinx doc
# to preserve the ordering of elements, based on the "index" pages
# for the modules
sidebar_position_lookup_table = {}
for m in modules:
    counter = 2
    doc = html.parse(f'{html_dir}/{m}.html')
    nav = doc.xpath('//nav[@id="bd-docs-nav"]/div/ul')
    for nav_block in nav:
        items = nav_block.findall('li/a')
        for item in items:
            href = item.get('href')
            sidebar_position_lookup_table[href] = counter
            counter += 1

# sort urls alphabetically, remove .html
urls = glob.glob(f"{html_dir}/**/*.html", recursive=True)
for url in urls:
    # this is the url to the original html fragment
    # it's an absolute url, docusaurus will take care of the rest
    real_url = url.replace(html_dir, "")
    page = path.basename(url).replace('.html', '')

    print(f'{url} -> {real_url}')

    match = False
    for pattern in patterns:
        if re.match(pattern, real_url):
            match = True
    if not match:
        print(f'ignoring {real_url}')
        continue

    # dir where .mdx will be stored
    if page in modules:
        docs_target_dir = f'{docs_target}/{page}/{path.dirname(real_url)}'
        mdx_path = f'{docs_target}/{page}/{real_url.replace(".html", ".mdx")}'
    else:
        docs_target_dir = f'{docs_target}/{path.dirname(real_url)}'
        mdx_path = f'{docs_target}/{real_url.replace(".html", ".mdx")}'

    static_target_dir = f'{static_target}/{path.dirname(real_url)}'

    # create dir if needed
    if not path.isdir(docs_target_dir):
        print(f'creating {docs_target_dir}')
        makedirs(docs_target_dir)

    # create dir if needed
    if not path.isdir(static_target_dir):
        print(f'creating {static_target_dir}')
        makedirs(static_target_dir)

    doc = html.parse(url)

    # here we get the body
    # we look for <main role="main"....>
    body_element: html.Element = doc.xpath('//main[@role="main"]/div')[0]

    if page in modules:
        # these pages are moved 1 dir down on disk
        # so we need to fix anchors that point to external documents
        def fix_links(link):
            # if the link starts with any of the modules,
            # go one dir up (as the file is moved one dir down)
            # eg: dataframe/bach.Dataframe.index -> ../dataframe/bach.Dataframe.index
            if max([link.startswith(m) for m in modules]) > 0:
                return f'../{link}'
            return link
        body_element.rewrite_links(fix_links)
    elif page == 'index':
        # because the moved files, we also need to fix the anchors in the index:
        # from dataframe.html#Usage -> dataframe/introduction.html#Usage
        # but keep away from  dataframe/bach.DataFrame.some_method.html
        def fix_links(link):
            for m in modules:
                if link.startswith(f'{m}.html'):
                    return link.replace(m, f'{m}/introduction')
            return link
        body_element.rewrite_links(fix_links)

    body = etree.tostring(body_element).decode('utf-8')

    # get title from <title> text </title>
    title = doc.xpath('//title/text()')[0]

    toc = []
    # get toc from:
    # <nav id="bd-toc-nav">/ul
    # contains an unordered list (<ul> of toc items)
    toc_containers = doc.xpath('//nav[@id="bd-toc-nav"]/ul')

    if len(toc_containers) > 0:
        toc_container = toc_containers[0]
        toc_item = None
        for l1_item in toc_container:
            children = []
            for l2_item in l1_item:
                if l2_item.tag == 'a':
                    # this is a toplevel menu item
                    toc_item = a_to_toc(l2_item, 2)
                elif l2_item.tag == 'ul':
                    for l3_item in l2_item.findall('li/a'):
                        children.append(a_to_toc(l3_item, 3))
            if toc_item:
                toc_item['children'] = children
                toc.append(toc_item)

    if page in modules + ['index']:
        # special case where we map the index to Introduction
        # and put it at the top of the list
        if page == 'index':
            slug = f'/{module}/introduction'
        else:
            slug = f'/{module}/{page}/introduction'
        sidebar_position = 1
        sidebar_label = 'Introduction'
    else:
        slug = f'/{module}/{real_url.replace(".html", "")}'

        # get position from lookup table, no checking, if we cannot find the URL we die!
        sidebar_position = sidebar_position_lookup_table[real_url]
        sidebar_label = path.basename(url).replace('.html', '')

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

    print(f'writing to {mdx_path}')
    with open(mdx_path, 'w') as target_handle:
        target_handle.write(mdx)

    # now write html body
    html_path = f'{static_target}/{real_url}'
    with open(html_path, 'w') as target_handle:
        target_handle.write(body)
