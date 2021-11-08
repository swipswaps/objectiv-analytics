# Objectiv Analysis
For now this readme is focussed on development. We'll replace this by an end-user targeted readme later on.

## Setup
```bash
virtualenv venv
source venv/bin/activate
export PYTHONPATH=.

# Install Bach in editting mode, that is we can edit Bach and changes will propagate.
# This will fail if the postgres lib development headers are not present if so, then on Ubuntu that can
# be fixed with: sudo apt-get install libpq-dev

pip install -e ../bach/
pip install jupyter plotly matplotlib # needed for the website_analytics.ipynb notebook
```


## PyCharm
* Mark the following directories as "Sources root":
   1. `/bach/`
   2. `/analysis/objectiv_bach/`
* Set `analysis/venv/bin/python` as the default interpreter for the project
