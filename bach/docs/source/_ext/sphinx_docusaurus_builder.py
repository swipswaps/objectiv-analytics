from codecs import open
from os import path
from setuptools import setup, find_packages
from subprocess import check_output
from .sphinx_docusaurus_builder.docusaurus_builder import DocusaurusBuilder

here = path.abspath(path.dirname(__file__))

check_output(
    'pandoc --from=markdown --to=rst --output=' + path.join(here, 'sphinx_docusaurus_builder/README.rst') + 
      ' ' + path.join(here, 'sphinx_docusaurus_builder/README.md'),
    shell=True
)

with open(path.join(here, 'sphinx_docusaurus_builder/README.md'), encoding='utf-8') as f:
    long_description = f.read()

install_requires = list()
with open(path.join(here, 'requirements.txt'), 'r', encoding='utf-8') as f:
    for line in f.readlines():
        install_requires.append(line)

def setup(app):
    app.add_builder(DocusaurusBuilder)

    return {
        'version': '0.0.1',
        'parallel_read_safe': True,
        'parallel_write_safe': True,
    }
