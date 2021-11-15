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

paths = [
    os.path.dirname(os.path.dirname(os.path.join(os.path.dirname(__file__)))),
    os.path.dirname(os.path.dirname(os.path.join(os.path.dirname(__file__)))) + '/series',
]
print(paths)
sys.path.extend(paths)

# -- Project information -----------------------------------------------------

project = 'Bach'
copyright = '2021, Objectiv'
author = 'Objectiv B.V.'


#ipython_execlines = [
#    'sys.path.insert(0, os.path.abspath("../../bach"))',
#    'import bach',
#    'import quote_string from expression',
#    'import sys'
#]


doctest_global_setup = '''
from bach.dataframe import Dataframe
'''

# Add any Sphinx extension module names here, as strings. They can be
# extensions coming with Sphinx (named 'sphinx.ext.*') or your custom
# ones.
extensions = [
    'sphinx.ext.autodoc',           # generate summaries based on docstrings
    'sphinx.ext.autosummary',       # auto generate autodoc directives
    # 'sphinx.ext.intersphinx',       # generate links to external sphinx projects
    'sphinx.ext.linkcode',          # generate [source] links to GH
    'sphinx.ext.doctest',           # run examples /tests
    'numpydoc',                     # use numpy style docs
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

autodoc_typehints = 'none'

# numpydoc
numpydoc_attributes_as_param_list = False
numpydoc_show_class_members = False

# autosummary
autosummary_generate = True

autosummary_imported_members = True
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

# html_sidebars = {'**': 'sidebar-nav-bs.html'}
# Theme options are theme-specific and customize the look and feel of a theme
# further.  For a list of options available for each theme, see the
# documentation.
html_theme_options = {
    "external_links": [],
    "github_url": "https://github.com/objectiv-analytics/bach/",
    "twitter_url": "https://twitter.com/objectiv",
    "google_analytics_id": ""
}

# Add any paths that contain custom static files (such as style sheets) here,
# relative to this directory. They are copied after the builtin static files,
# so a file named "default.css" will overwrite the builtin "default.css".
# html_static_path = ['_static']


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

    filename = info['module'].replace('.', '/') + '/' + os.path.basename(fn)

    return f"https://github.com/objectiv/objectiv-analytics/blob/main/bach/{filename}{linespec}"


from sphinx.ext.autosummary import Autosummary  # isort:skip


class ObjectivAutosummary(Autosummary):
    def get_items(self, names):
        items = Autosummary.get_items(self, names)
        return items


def remove_copyright_string(app, what, name, obj, options, lines):
    if len(lines) > 0 and lines[0] == 'Copyright 2021 Objectiv B.V.':
        del lines[0]

def repair_classmethod_docstring(app, what, name, obj, options, lines):
    # If a property is annotated as a classmethod, there is confusion. Resolve that here
    if isinstance(obj, property) and isinstance(obj.fget, classmethod):
        lines.clear()
        obj_lines = obj.fget.__func__.__doc__
        if obj_lines:
            lines.extend(obj_lines.split("\n"))

def autodoc_skip_member_bach_internal(app, what, name, obj, skip, options):
    # Skip some private API methods & attributes that can't easily be renamed to _func or _attr
    # by checking whether the docstring starts with "INTERNAL"
    if obj.__doc__:
        # This method is called before repair_classmethod_docstring(), so we have to do the same dance
        if (isinstance(obj, property)
                and isinstance(obj.fget, classmethod)
                and obj.fget.__func__.__doc__.strip().startswith('INTERNAL')):
            return True
        elif obj.__doc__.strip().startswith('INTERNAL'):
            return True
    return None

def setup(app):
    app.connect("autodoc-process-docstring", remove_copyright_string)
    app.connect("autodoc-process-docstring", repair_classmethod_docstring)
    app.connect("autodoc-skip-member", autodoc_skip_member_bach_internal)
