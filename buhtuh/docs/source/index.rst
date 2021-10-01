

Welcome to BuhTuh's documentation!
==================================

.. toctree::
   :maxdepth: 4
   :caption: Contents:
   
   api



Indices and tables
==================

* :ref:`genindex`
* :ref:`modindex`



.. ipython::

    In [1]: from sql_models.util import extract_format_fields

    In [2]: assert extract_format_fields('{test}') == {'test'}
    
    In [3]: assert extract_format_fields('{test} more text {test}') == {'test'}
    
    @doctest
    In [4]: assert extract_format_fields('text{test} more {{text}} {test2} te{x}t{test}') == {'test', 'test2', 'x'}
    Out [4]: bier
    
.. autosummary:: 
	:recursive:
	:members:
	:inherited-members:
	:toctree: api

    sql_models
    buhtuh
