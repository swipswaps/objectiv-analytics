"""
Copyright Objectiv B.V. 2022

Copies Sphinx generated python docs into Docusaurus. 
"""

from shutil import copytree, rmtree

# html build dir / output of sphinx
html_dir = 'build/docusaurus/'
# root of docusaurus install
docusaurus_dir = '../../../objectiv.io/docs'
# where are the docs at
docs = 'docs'
# base dir of these docs (relative to docusaurus_dir/docs/
module = 'modeling'

docs_source = f'{html_dir}'
docs_target = f'{docusaurus_dir}/{docs}/{module}'

# Copy all API reference files to the right directory
copytree(docs_source, docs_target, dirs_exist_ok=True)
