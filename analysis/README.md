# Objectiv Analysis

## Setup Objectiv for data analysis
Clone this repository and install the following packages with `pip -e` from the root of the repository:
```bash
pip install -e bach
pip install -e analysis/bach_open_taxonomy
```

You can now import the package and work with your data in python. This can be done with the ObjectivFrame
object. 
```python
from bach_open_taxonomy import ObjectivFrame
of = ObjectivFrame.from_objectiv_data(db_url='postgresql://user:pass@localhost:5433/database',
                                      table_name='data',
                                      time_aggregation='YYYY-MM-DD')
```

We have two notebooks in the 
[analysis/notebooks/](https://github.com/objectiv/objectiv-analytics/tree/main/analysis/notebooks) folder of
the repository that demonstrate how you can work with the data in Python. Both notebooks can run on _your_
collected data. The only thing that might need to be adjusted is how the connection to the database is made
(as per above).

### The open taxonomy how-to notebook ([open-taxonomy-how-to.ipynb](https://github.com/objectiv/objectiv-analytics/blob/main/analysis/notebooks/open-taxonomy-how-to.ipynb))
This notebook demonstrates the contents and structure of the data in an interactive way. Also shows how you
can work with the using Bach, our pandas inspired interface that works directly with your data in the
database. The full reference of Bach is found [here](https://objectiv.io/docs/modeling/reference/).

### Model Hub demo notebook ([model-hub-demo-notebook.ipynb](https://github.com/objectiv/objectiv-analytics/blob/main/analysis/notebooks/model-hub-demo-notebook.ipynb))
This notebook shows how you can work with the data using standard models from the model hub. For the
conversion models to give sensible results the `add_conversion_event` paramaters need to be adjusted to your
own data. The full model hub reference is found
[here](https://objectiv.io/docs/modeling/Objectiv/bach_open_taxonomy.ModelHub/). The Metabase example is made
to work with our [quickstart demo](https://objectiv.io/docs/quickstart-guide/), in which Metabase is included.

## Setup development environment
```bash
virtualenv venv
source venv/bin/activate
export PYTHONPATH=.

# This will fail if the postgres lib development headers are not present if so, then on Ubuntu that can
# be fixed with: sudo apt-get install libpq-dev
pip install -r requirements.txt

# in case your notebook can not find all of the packages you just installed
# you may also need to create a kernel config for this venv:

ipython kernel install --user --name=objectiv_venv
# now restart the notebook server, and from the kernel menu select 'objectiv_venv'

```

### PyCharm
* Mark the following directories as "Sources root":
   1. `/bach/`
   2. `/analysis/bach_open_taxonomy/`
* Set `analysis/venv/bin/python` as the default interpreter for the project
