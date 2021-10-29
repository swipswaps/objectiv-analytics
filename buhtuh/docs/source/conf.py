# Configuration file for the Sphinx documentation builder.
#
# This file only contains a selection of the most common options. For a full
# list see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Path setup --------------------------------------------------------------

# If extensions (or modules to document with autodoc) are in another directory,
# add these directories to sys.path here. If the directory is relative to the
# documentation root, use os.path.abspath to make it absolute, like shown here.
#
import os
import sys
import inspect
sys.path.insert(0, os.path.abspath('.'))

sys.path.extend([
    os.path.join(os.path.dirname(__file__), "../../"),
    '../buhtuh/'
])


# -- Project information -----------------------------------------------------

project = 'BuhTuh'
copyright = '2021, Objectiv'
author = 'Objectiv BV'


autosummary_generate = True
add_function_parentheses = True
add_module_names = True

# -- General configuration ---------------------------------------------------


ipython_execlines = [
    'from buhtuh.expression import *',
    'sys.path.insert(0, os.path.abspath("../buhtuh"))',
    'import buhtuh',
    'import quote_string from expression',
    'import sys'
]


doctest_global_setup = '''
from buhtuh import *
'''

# Add any Sphinx extension module names here, as strings. They can be
# extensions coming with Sphinx (named 'sphinx.ext.*') or your custom
# ones.
extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.autosummary',
    'sphinx.ext.intersphinx',
    'sphinx.ext.linkcode',
    'sphinx.ext.doctest',
    #'sphinx.ext.viewcode',
    #'IPython.sphinxext.ipython_directive',
    #'IPython.sphinxext.ipython_console_highlighting',
    'sphinx_markdown_builder'
]

intersphinx_mapping = {
    "dateutil": ("https://dateutil.readthedocs.io/en/latest/", None),
    "matplotlib": ("https://matplotlib.org/stable/", None),
    "numpy": ("https://numpy.org/doc/stable/", None),
    "pandas-gbq": ("https://pandas-gbq.readthedocs.io/en/latest/", None),
    "pandas": ("https://pandas.pydata.org/docs/", None),
    "py": ("https://pylib.readthedocs.io/en/latest/", None),
    "python": ("https://docs.python.org/3/", None),
    "scipy": ("https://docs.scipy.org/doc/scipy/reference/", None),
    "statsmodels": ("https://www.statsmodels.org/devel/", None),
    "pyarrow": ("https://arrow.apache.org/docs/", None),
}

autodoc_default_options = {
    'members': True,
    'inherited-members': True,
    'undoc-members': True,
    'inherited-members': True,
    'recursive': True
    }
# Add any paths that contain templates here, relative to this directory.
templates_path = ['_templates']

# List of patterns, relative to source directory, that match files and
# directories to ignore when looking for source files.
# This pattern also affects html_static_path and html_extra_path.
exclude_patterns = []


# -- Options for HTML output -------------------------------------------------

# The theme to use for HTML and HTML Help pages.  See the documentation for
# a list of builtin themes.
#
# html_theme = 'alabaster'


# -- Options for HTML output ---------------------------------------------

# The theme to use for HTML and HTML Help pages.  Major themes that come with
# Sphinx are currently 'default' and 'sphinxdoc'.
html_theme = "pydata_sphinx_theme"

# The style sheet to use for HTML and HTML Help pages. A file of that name
# must exist either in Sphinx' static/ path, or in one of the custom paths
# given in html_static_path.
# html_style = 'statsmodels.css'

html_sidebars = {'**': 'sidebar-nav-bs.html'}
# Theme options are theme-specific and customize the look and feel of a theme
# further.  For a list of options available for each theme, see the
# documentation.
html_theme_options = {
    "external_links": [],
    "github_url": "https://github.com/objectiv-analytics/buhtuh/",
    "twitter_url": "https://twitter.com/objectiv",
    "google_analytics_id": "",
    "navbar_start": [],
    "navbar_center": [],
    "navbar_end": []
}

# Add any paths that contain custom static files (such as style sheets) here,
# relative to this directory. They are copied after the builtin static files,
# so a file named "default.css" will overwrite the builtin "default.css".
html_static_path = ['_static']


# resolve URL to GitHub
# part of this code is inspired by https://github.com/pandas-dev/pandas/blob/master/doc/source/conf.py
def linkcode_resolve(domain, info):
    if domain != 'py':
        return None
    
    modname = info["module"]
    fullname = info["fullname"]

    submod = sys.modules.get(modname)
    if submod is None:
        return None
    
    obj = submod
    for part in fullname.split("."):
        try:
            obj = getattr(obj, part)
        except AttributeError:
            return None
    try:
        fn = inspect.getsourcefile(inspect.unwrap(obj))
    except TypeError:
        return None

    try:
        source, lineno = inspect.getsourcelines(obj)
    except OSError:
        lineno = None

    if lineno:
        linespec = f"#L{lineno}-L{lineno + len(source) - 1}"
    else:
        linespec = ""

    filename = info['module'].replace('.', '/')
    return f"https://github.com/objectiv/objectiv-analytics/blob/main/buhtuh/{filename}.py{linespec}"

suppress_warnings = [
    # We "overwrite" autosummary with our PandasAutosummary, but
    # still want the regular autosummary setup to run. So we just
    # suppress this warning.
    "app.add_directive"
]

from sphinx.ext.autosummary import Autosummary  # isort:skip


class ObjectivAutosummary(Autosummary):
    def get_items(self, names):
        items = Autosummary.get_items(self, names)
        return items


def remove_copyright_string(app, what, name, obj, options, lines):
    if len(lines) > 0 and lines[0] == 'Copyright 2021 Objectiv B.V.':
        del lines[0]

def process_class_docstrings(app, what, name, obj, options, lines):
    """
    For those classes for which we use ::

    :template: autosummary/class_without_autosummary.rst

    the documented attributes/methods have to be listed in the class
    docstring. However, if one of those lists is empty, we use 'None',
    which then generates warnings in sphinx / ugly html output.
    This "autodoc-process-docstring" event connector removes that part
    from the processed docstring.

    """
    if what == "class":
        print(f'found a class: {name}')
        joined = "\n".join(lines)

        templates = [
            """.. rubric:: Attributes

.. autosummary::
   :toctree:

   None
""",
            """.. rubric:: Methods

.. autosummary::
   :toctree:

   None
""",
        ]

        for template in templates:
            if template in joined:
                joined = joined.replace(template, "")
        lines[:] = joined.split("\n")


def get_doctree(app, doctree, docname):
    print(f'jow: {docname}  dus')
    pass


def setup(app):
    app.connect("autodoc-process-docstring", process_class_docstrings)
    app.connect("autodoc-process-docstring", remove_copyright_string)
    app.connect("doctree-resolved", get_doctree)
    app.add_directive("autosummary", ObjectivAutosummary)


