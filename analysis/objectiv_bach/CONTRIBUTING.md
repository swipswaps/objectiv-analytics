# Extensions - Development

Here you'll find instructions for development on Bach Extensions. If you want to contribute (Thank you!), please take a look at the [Contribution Guide](https://www.objectiv.io/docs/the-project/contributing) in our Docs. It contains information about our contribution process and where you can fit in.

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
