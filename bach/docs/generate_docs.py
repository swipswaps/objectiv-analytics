"""
Copyright Objectiv B.V. 2022

Used to import Sphinx generated python docs into Docusaurus. This script does the following:
- TODO
"""

# html build dir / output of sphinx
html_dir = 'build/docusaurus/'
# root of docusaurus install
docusaurus_dir = '../../../objectiv.io/docs'
# where are the docs at
docs = 'docs'
# base dir of these docs (relative to docusaurus_dir/docs/
module = 'modeling'

docs_target = f'{docusaurus_dir}/{docs}/{module}'

# TODO: copy the right files to the right directories

