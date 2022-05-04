from .depth import Depth
from .doctree2md import Translator, Writer
from docutils import nodes
from pydash import _
import html2text
from munch import munchify
import os
import sys
import yaml
# from docutils.parsers.rst import Directive, directives
from sphinx.util.docutils import SphinxDirective, directives
from docutils.nodes import Element, Node, Text

h = html2text.HTML2Text()

frontmatter = {}

class DocusaurusTranslator(Translator):
    depth = Depth()
    enumerated_count = {}
    section_depth = 0
    title = None
    visited_title = False
    current_desc_type = None # the current class or method or property being parsed (if any)
    in_signature = False # whether currently processing a signature (e.g. to not insert newlines)
    autosummary_shown = [] # holds for which class/method an autosummary has already been shown (if any)
    in_table = False # whether currently processing a table (e.g. to not insert newlines)
    table_entries = []
    table_rows = []
    tables = []
    tbodys = []
    theads = []
    in_reference = False # whether currently processing a reference (e.g. to not insert emphasis or bold)


    def __init__(self, document, builder=None):
        Translator.__init__(self, document, builder=builder)
        self.builder = builder
        self.frontmatter = frontmatter


    @property
    def rows(self):
        rows = []
        if not len(self.tables):
            return rows
        for node in self.tables[len(self.tables) - 1].children:
            if isinstance(node, nodes.row):
                rows.append(node)
            else:
                for node in node.children:
                    if isinstance(node, nodes.row):
                        rows.append(node)
        return rows


    # Writes the slug
    def get_slug(self, docname, doc_frontmatter):
        if doc_frontmatter and 'slug' in doc_frontmatter:
            return doc_frontmatter['slug']

        slug = docname

        # Format API reference slugs
        for api_pattern, config in self.builder.api_frontmatter.items():
            if docname.startswith(api_pattern):
                if 'slug_tree_levels' in config:
                    levels = config['slug_tree_levels']
                    # format the part after the last slash
                    index_last_part = docname.rfind('/') + 1
                    last_part = docname[index_last_part:]
                    parts = last_part.split('.')
                    last_part_formatted = '.'.join(parts[-levels:])
                    slug = docname[0:index_last_part] + last_part_formatted

        # add base path and trailing slash
        slug = '/modeling/' + slug + '/'
        if docname == 'index' or docname[-6:] == "/index":
            # this is an index page, so should just end in '/'
            slug = slug[:-6]
        return slug


    def visit_document(self, node):
        self.title = getattr(self.builder, 'current_docname')
        # if 'example-notebooks/index' in self.title: 
        #     print("DOCUMENT:", node)


    def depart_document(self, node):
        # write the frontmatter after being done with the doc
        current_doc = self.builder.current_docname
        
        # Format API reference titles
        title = self.title
        for api_pattern, config in self.builder.api_frontmatter.items():
            if current_doc.startswith(api_pattern):
                if 'title_tree_levels' in config:
                    levels = config['title_tree_levels']
                    parts = self.title.split('.')
                    title = '.'.join(parts[-levels:])

        ctx = self.builder.ctx
        doc_frontmatter = self.frontmatter[current_doc] if current_doc in self.frontmatter else None
        variables = munchify({
            'date': ctx.date,
            'id': _.snake_case(current_doc).replace('_', '-'),
            'title': title,
            'slug': self.get_slug(current_doc, doc_frontmatter),
        })
        if doc_frontmatter and 'position' in doc_frontmatter:
            variables['sidebar_position'] = int(doc_frontmatter['position'])
        variables_yaml = yaml.safe_dump(variables)
        frontmatter_content = '---\n' + variables_yaml + '---\n'
        self.add(frontmatter_content, section='head')

    
    def visit_title(self, node):
        if not self.visited_title:
            self.title = node.astext()
            self.visited_title = True
        for x in range(0, self.section_depth):
            self.add('#')
        self.add(' ')


    def visit_comment(self, node):
        # comment blocks generally break the Markdown, so skip it
        raise nodes.SkipNode


    def depart_comment(self, node):
        # comment blocks generally break the Markdown, so skip it
        raise nodes.SkipNode


    def visit_inline(self, node):
        # general inline nodes, no need for parsing
        pass


    def depart_inline(self, node):
        # general inline nodes, no need for parsing
        pass


    def visit_desc(self, node):
        # container for class and method descriptions
        desctype = node.attributes["desctype"] if "desctype" in node.attributes else None
        self.current_desc_type = desctype
        if (desctype == "class"):
            self.add('<div className="class">\n')
        elif (desctype == "method"):
            self.add('<div className="method">\n')
        elif (desctype == "property"):
            self.add('<div className="property">\n')
        else:
            self.add('<div>\n')


    def depart_desc(self, node):
        # container for class and method descriptions
        self.add('\n</div>\n\n')


    def visit_desc_signature(self, node):
        # the main signature (i.e. its name + parameters) of a class/method/property.
        self.in_signature = True
        if (self.current_desc_type == 'class'):
            self.add('\n<h2 className="signature-class">')
        elif (self.current_desc_type == 'property'):
            self.add('\n<h2 className="signature-property">')
        else:
            self.add('\n<h2 className="signature-method">')


    def depart_desc_signature(self, node):
        # the main signature (i.e. its name + parameters) of a class/method/property.
        if (self.current_desc_type != 'property'):
            self.add(')')
        self.add('</h2>\n\n')
        self.in_signature = False


    def visit_desc_annotation(self, node):
        # annotation, e.g 'method', 'class'
        self.add('<span className="type-annotation">')
        self.add('<em>')


    def depart_desc_annotation(self, node):
        # annotation, e.g 'method', 'class'

        # if this is a property and it has params, properly close it
        # otherwise, remove the last element (=")" in case of a class/method)
        if (self.current_desc_type == 'property' and node.children[0].astext() != 'property' and len(node.children) > 0):
            self.add('\n\n')
        else:
            self.get_current_output('body')[-1] = self.get_current_output('body')[-1][:-1]
        
        self.add('</em>')
        self.add('</span> ')


    def visit_desc_addname(self, node):
        # module preroll for class/method, e.g. 'classdomain' in 'classdomain.classname'
        self.add('<span className="additional-name">')


    def depart_desc_addname(self, node):
        # module preroll for class/method, e.g. 'classdomain' in 'classdomain.classname'
        self.add('</span>')


    def visit_desc_name(self, node):
        # name of the class/method
        # Escape "__" which is a formatting string for markdown
        self.add('<span className="name">')
        if node.rawsource.startswith("__"):
            self.add('\\')


    def depart_desc_name(self, node):
        # name of the class/method
        if (self.current_desc_type != 'property'):
            self.add('(')
        self.add('</span>')


    def visit_desc_parameterlist(self, node):
        # method/class param list
        self.add('<small className="parameter-list">')


    def depart_desc_parameterlist(self, node):
        # method/class param list
        self.add('</small>')


    def visit_desc_parameter(self, node):
        # single method/class param
        self.add('<span className="parameter" id="'+ node[0].astext() + '">')


    def depart_desc_parameter(self, node):
        # single method/class param
        # if there are additional params, include a comma
        self.add('</span>')
        if node.next_node(descend=False, siblings=True):
            self.add(', ')
            

    def visit_desc_content(self, node):
        # the description of the class/method
        self.add('\n<div className="content">\n\n')
        # leave current_desc_type, so there's no custom signature parsing (e.g. newlines for references)
        self.in_signature = False


    def depart_desc_content(self, node):
        # the description of the class/method
        self.add('\n</div>\n\n')


    # list of parameters/return values/exceptions
    #
    # field_list
    #   field
    #       field_name (e.g 'returns/parameters/raises')
    #           field_body (often a bulleted list)    #
    def visit_field_list(self, node):
        pass


    def depart_field_list(self, node):
        pass


    def visit_field(self, node):
        self.add('\n')


    def depart_field(self, node):
        self.add('\n')


    def visit_field_name(self, node):
        # field name, e.g 'returns', 'parameters'
        self.add('### ')


    def depart_field_name(self, node):
        self.add('\n\n')
        pass


    def visit_field_body(self, node):
        # container for the body of the field
        pass


    def depart_field_body(self, node):
        pass



    def visit_definition_list(self, node):
        # a list of terms and their definitions; used for glossaries, classification, or subtopics
        # generally already correctly parsed as a list or paragraphs, so passing here
        pass


    def depart_definition_list(self, node):
        # a list of terms and their definitions; used for glossaries, classification, or subtopics
        # generally already correctly parsed as a list or paragraphs, so passing here
        pass


    def visit_definition(self, node):
        # container for the body elements used to define a term in a definition_list
        # generally already correctly parsed as a list or paragraphs, so passing here
        self.add('\n')


    def depart_definition(self, node):
        # container for the body elements used to define a term in a definition_list
        # generally already correctly parsed as a list or paragraphs, so passing here
        self.add('\n')


    def visit_label(self, node):
        print("Unchecked 'label' directive found in document " + self.builder.current_docname + ":", node) 
        self.add('\n')


    def depart_label(self, node):
        self.add('\n')


    def visit_literal(self, node):
        self.add('`')
        for child in node.children:
            child.walkabout(self)
        self.add('`')
        raise nodes.SkipNode


    def depart_literal(self, node):
        pass


    def visit_literal_block(self, node):
        # code block, with optional language parameter
        if (node['language']):
            self.add('```' + node['language'] + '\n')
        else:
            self.add('```\n')
        for child in node.children:
            child.walkabout(self)
        self.add('\n```\n\n')
        raise nodes.SkipNode


    def depart_literal_block(self, node):
        pass


    def visit_literal_strong(self, node):
        # literal (e.g. `string`) to bolden
        self.add('**`')


    def depart_literal_strong(self, node):
        self.add('`**')


    def visit_literal_emphasis(self, node):
        # literal (e.g. `string`) to emphasize
        # do not add '_' if we're in a reference with a link
        if not self.in_reference:
            self.add('_')


    def depart_literal_emphasis(self, node):
        # literal (e.g. `string`) to emphasize
        # if in a reference with a link, remove the '_' at the end
        if self.in_reference:
            self.add('')

    
    def visit_title_reference(self, node):
        self.add('`')
        for child in node.children:
            child.walkabout(self)
        self.add('`')
        raise nodes.SkipNode


    def depart_title_reference(self, node):
        pass


    def visit_reference(self, node):
        # Docusaurus doesn't support MDXv2 yet: https://github.com/facebook/docusaurus/issues/4029
        # so we cannot add an MD-formatted link in a <span> element, as it won't get parsed.
        # therefore, for now, we add these on a newline.
        if(self.in_signature):
            self.add('\n\n ')

        # do the same for 'view source' links
        if('viewcode-link' in node.attributes['classes']):
            self.add('\n&#8203;<span className="view-source">')

        self.in_reference = True
        url = self._refuri2http(node)
        if url is None:
            return
        self.add('[')
        for child in node.children:
            child.walkabout(self)
        self.add(']({})'.format(url))

        if(self.in_signature):
            self.add('\n\n')

        if('viewcode-link' in node.attributes['classes']):
            self.add("</span>\n")

        raise nodes.SkipNode


    def depart_reference(self, node):
        self.in_reference = False
        pass


    def visit_versionmodified(self, node):
        # deprecation and compatibility messages
        # type will hold something like 'deprecated'
        print("Unchecked 'version' directive found in document " + self.builder.current_docname + ":", node) 
        self.add('**%s:** ' % node.attributes['type'].capitalize())


    def depart_versionmodified(self, node):
        # deprecation and compatibility messages
        pass


    def visit_note(self, node):
        """Sphinx note directive."""
        self.add(':::note\n\n')


    def depart_note(self, node):
        """Sphinx note directive."""
        self.add('\n:::\n\n')


    def visit_caution(self, node):
        """Sphinx caution directive."""
        self.add(':::caution\n\n')


    def depart_caution(self, node):
        """Sphinx caution directive."""
        self.add('\n:::\n\n')


    def visit_important(self, node):
        """Sphinx important directive."""
        self.add(':::caution important\n\n')


    def depart_important(self, node):
        """Sphinx important directive."""
        self.add('\n:::\n\n')


    def visit_warning(self, node):
        """Sphinx warning directive."""
        self.add(':::warning\n\n')


    def depart_warning(self, node):
        """Sphinx warning directive."""
        self.add('\n:::\n\n')


    def visit_seealso(self, node):
        self.add(':::tip see also\n\n')


    def depart_seealso(self, node):
        self.add('\n:::\n\n')


    def visit_section(self, node):
        # container for any section
        self.section_depth += 1


    def depart_section(self, node):
        self.section_depth -= 1


    def visit_rubric(self, node):
        """Sphinx Rubric, a heading without relation to the document sectioning
        http://docutils.sourceforge.net/docs/ref/rst/directives.html#rubric."""
        self.add('### ')


    def depart_rubric(self, node):
        """Sphinx Rubric, a heading without relation to the document sectioning
        http://docutils.sourceforge.net/docs/ref/rst/directives.html#rubric."""
        self.add('\n\n')


    def visit_image(self, node):
        """Image directive."""
        print("Unchecked 'image' directive found in document " + self.builder.current_docname + ":", node) 
        uri = node.attributes['uri']
        doc_folder = os.path.dirname(self.builder.current_docname)
        if uri.startswith(doc_folder):
            # drop docname prefix
            uri = uri[len(doc_folder):]
            if uri.startswith('/'):
                uri = '.' + uri
        self.add('\n\n![image](%s)\n\n' % uri)


    def depart_image(self, node):
        """Image directive."""
        pass


    def visit_autosummary_toc(self, node):
        # if an autosummary type (table or toc) is not yet shown, show the TOC list
        if self.current_desc_type not in self.autosummary_shown:
            self.autosummary_shown.append(self.current_desc_type)
        else:
            raise nodes.SkipNode


    def depart_autosummary_toc(self, node):
        self.add("\n\n")


    def visit_autosummary_table(self, node):
        """Sphinx autosummary See http://www.sphinx-
        doc.org/en/master/usage/extensions/autosummary.html."""
        self.table_entries = [] # reset the table_entries, so depart_thead doesn't generate redundant columns
        self.autosummary_shown.append(self.current_desc_type) # autosummary shown for this class/method
        # TODO: add table headers names as an optional attribute to the autosummary
        self.add('<div className="table-autosummary">\n\n')
        node.classes="autosummary"
        tgroup = nodes.tgroup(cols=2)
        thead = nodes.thead(classes="autosummary")
        tgroup += thead
        row = nodes.row()
        entry = nodes.entry()
        entry += nodes.inline(text=" ")
        row += entry
        entry = nodes.entry()
        entry += nodes.inline(text=" ")
        row += entry
        thead.append(row)
        node.insert(0, thead)
        self.tables.append(node)


    def depart_autosummary_table(self, node):
        """Sphinx autosummary See http://www.sphinx-
        doc.org/en/master/usage/extensions/autosummary.html."""
        self.add('\n</div>\n\n')


    ################################################################################
    # tables
    #
    # docutils.nodes.table
    #     docutils.nodes.tgroup [cols=x]
    #       docutils.nodes.colspec
    #
    #       docutils.nodes.thead
    #         docutils.nodes.row
    #         docutils.nodes.entry
    #         docutils.nodes.entry
    #         docutils.nodes.entry
    #
    #       docutils.nodes.tbody
    #         docutils.nodes.row
    #         docutils.nodes.entry

    
    def visit_table(self, node):
        self.in_table = True
        self.tables += node


    def depart_table(self, node):
        self.in_table = False
        if(len(self.tables) > 0):
            self.tables.pop()
        self.ensure_eol()
        self.add('\n')


    def visit_tabular_col_spec(self, node):
        pass


    def depart_tabular_col_spec(self, node):
        pass


    def visit_colspec(self, node):
        pass


    def depart_colspec(self, node):
        pass


    def visit_tgroup(self, node):
        self.descend('tgroup')


    def depart_tgroup(self, node):
        self.ascend('tgroup')


    def visit_thead(self, node):
        if not len(self.tables):
            raise nodes.SkipNode
        
        self.theads.append(node)


    def depart_thead(self, node):
        # end table head with as many "| -- |"s as there are table entries
        for i in range(len(self.table_entries)):
            length = 0
            for row in self.table_rows:
                if len(row.children) > i:
                    entry_length = len(row.children[i].astext())
                    if entry_length > length:
                        length = entry_length
            self.add('| ' + ''.join(_.map(range(length), lambda: '-')) + ' ')
        self.add('|\n')
        self.table_entries = []
        self.theads.pop()


    def visit_tbody(self, node):
        if not len(self.tables):
            raise nodes.SkipNode
        self.tbodys.append(node)


    def depart_tbody(self, node):
        self.tbodys.pop()


    def visit_row(self, node):
        if not len(self.theads) and not len(self.tbodys):
            raise nodes.SkipNode
        self.table_rows.append(node)


    def depart_row(self, node):
        self.add(' |\n')
        if not len(self.theads):
            self.table_entries = []


    def visit_math_block(self, node):
        print("Unchecked 'math_block' directive found in document " + self.builder.current_docname + ":", node) 
        pass


    def depart_math_block(self, node):
        pass


    def visit_raw(self, node):
        # indicates non-reStructuredText data that is to be passed untouched to the Writer, so we won't parse
        self.descend('raw')


    def depart_raw(self, node):
        self.ascend('raw')


    def visit_enumerated_list(self, node):
        self.depth.descend('list')
        self.depth.descend('enumerated_list')


    def depart_enumerated_list(self, node):
        self.enumerated_count[self.depth.get('list')] = 0
        self.depth.ascend('enumerated_list')
        self.depth.ascend('list')

    
    def visit_bullet_list(self, node):
        self.depth.descend('list')
        self.depth.descend('bullet_list')


    def depart_bullet_list(self, node):
        self.add('\n')
        self.depth.ascend('bullet_list')
        self.depth.ascend('list')


    def visit_list_item(self, node):
        # a bulleted or enumerated list item
        self.depth.descend('list_item')
        depth = self.depth.get('list')
        depth_padding = ''.join(['  ' for i in range(depth - 1)])
        marker = '*'
        if node.parent.tagname == 'enumerated_list':
            if depth not in self.enumerated_count:
                self.enumerated_count[depth] = 1
            else:
                self.enumerated_count[depth] = self.enumerated_count[depth] + 1
            marker = str(self.enumerated_count[depth]) + '.'
        self.add(depth_padding + marker + ' ')


    def depart_list_item(self, node):
        # a bulleted or enumerated list item
        self.add("\n")
        self.depth.ascend('list_item')


    def visit_entry(self, node):
        if not len(self.table_rows):
            raise nodes.SkipNode
        self.add("| ")
        self.table_entries.append(node)


    def depart_entry(self, node):
        length = 0
        i = len(self.table_entries) - 1
        for row in self.table_rows:
            if len(row.children) > i:
                entry_length = len(row.children[i].astext())
                if entry_length > length:
                    length = entry_length
        padding = ''.join(
            _.map(range(length - len(node.astext())), lambda: ' ')
        )
        self.add(padding + ' ')


    def visit_paragraph(self, node):
        pass


    def depart_paragraph(self, node):
        # Do not add a newline if processing a table, because it will break the markup
        if not self.in_table:
            self.ensure_eol()
            self.add('\n')


    def visit_compact_paragraph(self, node):
        # a paragraph that could be formatted more compactly; ignored here
        pass


    def depart_compact_paragraph(self, node):
        pass


    def descend(self, node_name):
        self.depth.descend(node_name)


    def ascend(self, node_name):
        self.depth.ascend(node_name)


class FrontMatterPositionDirective(SphinxDirective):
    required_arguments = 1
    optional_arguments = 0
    final_argument_whitespace = True
    option_spec = {}
    has_content = False


    def run(self):
        docname = self.env.docname
        reference = directives.uri(self.arguments[0])
        frontmatter.setdefault(docname, dict())
        frontmatter[docname]['position'] = reference
        empty_node = nodes.raw()
        return [empty_node]

class FrontMatterSlugDirective(SphinxDirective):
    required_arguments = 1
    optional_arguments = 0
    final_argument_whitespace = True
    option_spec = {}
    has_content = False


    def run(self):
        docname = self.env.docname
        reference = directives.uri(self.arguments[0])
        frontmatter.setdefault(docname, dict())
        frontmatter[docname]['slug'] = reference
        empty_node = nodes.raw()
        return [empty_node]

class DocusaurusWriter(Writer):
    directives.register_directive('frontmatterposition', FrontMatterPositionDirective)
    directives.register_directive('frontmatterslug', FrontMatterSlugDirective)
    translator_class = DocusaurusTranslator
