# BuhTuh: Pandas-like DataFrames backed by SQL

## What is it?
BuhTuh offers an interface that is compatible with a subset of the Pandas API, but under the hood directly
interacts with a SQL backend.

BuhTuh under the hood uses sql_models, which makes it possible to easily build graphs of sql-models and
generate sql for the resulting composite sql-models. See sql_models/README.md for more information on that.

### Why?
* The database does the heavy lifting
  * Your dataset doesn't need to fit into memory
  * You can use the same code on small test datasets and the real production dataset
* Use the well known Pandas syntax when wanted
* Use SQL when wanted

## Getting Started
TODO: make this true

```bash
pip install buhtuh
```
TODO: more information for a first time user of the library. Examples, Links to API documentation etc.


## See Also
* [Pandas](https://github.com/pandas-dev/pandas): the inspiration for the API.
   Pandas has excellent [documentation](https://pandas.pydata.org/docs/) for its API.
* SQL-models: Related project that is used for generating the underlying sql-queries.

## License
TODO

## Contributing
TODO

