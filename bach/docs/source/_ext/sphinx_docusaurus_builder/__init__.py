from .docusaurus_builder import DocusaurusBuilder


def setup(app):
    app.add_builder(DocusaurusBuilder)
