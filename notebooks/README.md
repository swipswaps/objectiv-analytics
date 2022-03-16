# Example Notebooks
This directory contains notebooks to demonstrate the use of Bach and ModelHub. They can be used as a 
starting point for your own analyses as well.

## Setup
Please see the ModelHub [README.md](../modelhub/README.md) to set up your environment. After that, execute 
the commands below in the same `venv` as where you did the ModelHub install. 

Now it should be as simple as:
```shell
pip install -r requirements.txt # install notebook specific requirements
jupyter-notebook [any notebook from this directory]
```

### Metabase
In order to use the Metabase integration in some of the example notebooks, make sure to also read the 
Metabase section in the modelhub [README.md](../modelhub/README.md).

## Notebooks 
This list aims to give an explanation of the notebooks contained here, but please refer to the notebook 
themselves as well, as all of them have a pretty decent introduction and this list is not exhaustive.

### The open taxonomy how-to notebook ([open-taxonomy-how-to.ipynb](open-taxonomy-how-to.ipynb))
This notebook demonstrates the contents and structure of the data in an interactive way. Also shows how you
can work with the using Bach, our pandas inspired interface that works directly with your data in the
database. The full reference of Bach is found [here](https://objectiv.io/docs/modeling/reference/).

### Model Hub demo notebook ([model-hub-demo-notebook.ipynb](model-hub-demo-notebook.ipynb))
This notebook shows how you can work with the data using standard models from the model hub. For the
conversion models to give sensible results the `add_conversion_event` paramaters need to be adjusted to your
own data. The full model hub reference is found
[here](https://objectiv.io/docs/modeling/Objectiv/modelhub.ModelHub/). The Metabase example is made
to work with our [quickstart demo](https://objectiv.io/docs/home/quickstart-guide/), in which Metabase is included.
See the section at the end of this readme for how to set up Metabaser integration for your data.
