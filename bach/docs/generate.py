import glob
import re
from os import path, makedirs
import json
from typing import Dict, List, Callable
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

module = 'modeling'

docs_target = f'{docusaurus_dir}/{docs}/{module}'
static_target = f'{docusaurus_dir}/{static}/_{module}'

index_page = 'intro'

# whitelist of pages to consider
patterns = [
    '^intro.html$'
]

modules = []
# list of special cases, where we have a subdir, with an introduction at toplevel
# eg /dataframe.html and /dataframe/
for fn in glob.glob(f'{html_dir}/*'):
    dir = fn.replace('.html', '').lower()
    if path.isfile(fn) and path.isdir(dir):
        modules.append(path.basename(dir))
        patterns.extend([f'{path.basename(dir)}.*', f'{path.basename(fn).replace(".html", "")}.*'])


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


"""
structure:
<div id=bd-docs-nav>
    <div>
        <ul>
            <li>
                <a href=#>
                    DataFrame
                </a>
                <ul>
                    <li>
                        <a href=dataframe/bach.DataFrame.html>
                            bach.DataFrame
                        </a>
                        <ul>
                            <li>
                                <a href=dataframe/bach.DataFrame.agg.html>
                                    bach.DataFrame.agg
                                </a>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <a href=dataframe/bach.DataFrame.from_table.html>
                            bach.DataFrame.from_table
                        </a>
                    </li>
                </ul>
            </li>
        </ul>
    </div>k
</div>

"""


def parse_ul_menu(ul: html.Element) -> List:
    menu = []
    for element in ul:
        item = {
            'children': []
        }
        if element.tag == 'ul':
            return parse_ul_menu(element)
        if element.tag == 'li':
            for sub_element in element:
                if sub_element.tag == 'a':
                    item['href'] = sub_element.get('href')
                    item['text'] = sub_element.text.strip()
                elif sub_element.tag == 'ul':
                    item['children'] += parse_ul_menu(sub_element)
                else:
                    print(f'unknown tag in sub_element: {sub_element.tag}')
        else:
            print(f'unknown tag in element: {element.tag}')
        menu.append(item)
    return menu


def menu_list_to_sidebar(menu_list: list, level: int = 0) -> dict:

    skip_categories = ['Introduction', 'Core Concepts', 'Examples']

    sb = []
    for menu_item in menu_list:
        items = []
        href = menu_item['href']
        if '#' in href:
            if menu_item['href'].startswith('intro'):
                # intro is the "index" page, so correct path
                href = menu_item['href'].replace('intro', '')

            if level > 0 or len(menu_item['children']) == 0 or menu_item['text'] in skip_categories:
                items = [{
                    'type': 'link',
                    'label': menu_item['text'],
                    'href': f"/modeling/{href.replace('.html', '')}",
                }]
        else:
            href = href.replace('.html', '')
            if href.lower() in modules:
                href = f'{href.lower()}/{href}'
            items = [{
                'type': 'doc',
                'label': menu_item['text'],
                'id': f'modeling/{href}'
            }]
        if len(menu_item['children']) > 0 and menu_item['text'] not in skip_categories:
            children = []
            if level > 0:
                print(f'moving parent {menu_item["text"]} into children')
                # get parent, and put in here

                children = [i for i in items]
                items = []
            children += menu_list_to_sidebar(menu_item['children'], level=level + 1)

            items.append({
                'type': 'category',
                'label': menu_item['text'],
                'items': children
            })
        if len(items) > 0:
            sb += items
    return sb


# generate docusaurus sidebar
doc = html.parse(f'{html_dir}/index.html')

menu_list = doc.xpath('//div[@class="toctree-wrapper compound"]/ul')
menu = parse_ul_menu(menu_list)

sidebar = menu_list_to_sidebar(menu)
sidebars = [{
    'type': 'link',
    'href': '/modeling/',
    'label': 'Introduction'
}]
sidebar_js = f"""
module.exports = {json.dumps(sidebar, indent=4)}
"""



# now write html body
html_path = f'{docs_target}/sidebar.js'
with open(html_path, 'w') as target_handle:
    target_handle.write(sidebar_js)

# sort urls alphabetically, remove .html
urls = glob.glob(f"{html_dir}/**/*.html", recursive=True)
for url in urls:
    # this is the url to the original html fragment
    # it's an absolute url, docusaurus will take care of the rest
    real_url = url.replace(html_dir, "")
    page = path.basename(url).replace('.html', '')

    print(f'{url} -> {real_url} {page}')

    match = False
    for pattern in patterns:
        if re.match(pattern, real_url):
            match = True
    if not match:
        print(f'ignoring {real_url}')
        continue

    # dir where .mdx will be stored
    if page.lower() in modules:
        docs_target_dir = f'{docs_target}/{page.lower()}/{path.dirname(real_url)}'
        mdx_path = f'{docs_target}/{page.lower()}/{real_url.replace(".html", ".mdx")}'
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

    if page.lower() in modules:
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
    elif page == index_page:
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

    if page.lower() in modules + [index_page]:
        # special case where we map the index to Introduction
        # and put it at the top of the list
        if page == index_page:
            slug = f'/{module}/'
            sidebar_label = 'Introduction'

        else:
            sidebar_label = page
            slug = f'/{module}/{page.lower()}/{page}'
        sidebar_position = 1
    else:
        slug = f'/{module}/{real_url.replace(".html", "")}'

        # get position from lookup table, no checking, if we cannot find the URL we die!
        sidebar_label = path.basename(url).replace('.html', '')

    # template for the mdx file
    # please leave the whitespace as is (it's part of the markdown)
    mdx = \
        f"""---
id: {real_url.replace('.html', '').split('/')[-1]}
hide_title: true
slug: {slug}
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
