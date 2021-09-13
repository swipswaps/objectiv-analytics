# Objectiv Data
For now this readme is focussed on development. We'll replace this by an end-user targeted readme later on.

## Setup
The main dependency for the analysis is BuhTuh. BuhTuh is not yet installable as a python package, so for
now it is easiest to include it in the python path and install its requirements.
```bash
virtualenv venv
source venv/bin/activate
export PYTHONPATH=${PYTHONPATH}:.:../buhtuh
# the following command fails if the postgres lib development headers are not present
# if so, then on ubuntu that can be fixed with: sudo apt-get install libpq-dev
pip install -r ../buhtuh/requirements.txt
pip install plotly matplotlib # needed for the website_analytics.ipynb notebook
```


## PyCharm
* Mark the following directories as "Sources root":
   1. `/buhtuh/`
   2. `/analysis/objectiv_buhtuh/`
* Set `analysis/venv/bin/python` as the default interpreter for the project
