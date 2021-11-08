# Bach: Pandas-like DataFrames backed by SQL

Bach is Objectiv's data modeling library. With Bach, you can compose models with familiar Pandas-like dataframe operations in your notebook. It uses an SQL abstraction layer that enables models to run on the full dataset. It includes a set of operations that enable effective feature creation for datasets that embrace the [open taxonomy of analytics](/schema/README.md).

Bach uses sql_models under the hood, which makes it possible to easily build graphs of sql-models and generate sql for the resulting composite sql-models. See sql_models/README.md for more information.

## Running Bach
To run Bach, use the following command: TODO:MAKE THIS TRUE
```bash
pip install bach
```

For detailed installation & usage instructions, visit [Objectiv Docs](https://www.objectiv.io/docs).


## See Also
* [Pandas](https://github.com/pandas-dev/pandas): the inspiration for the API.
   Pandas has excellent [documentation](https://pandas.pydata.org/docs/) for its API.
* SQL-models: Sub-project that is used for generating the underlying sql-queries. Can be found in the
              `sql_models` package

## License
TODO

## Contributing
TODO

