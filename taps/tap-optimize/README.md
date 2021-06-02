# Experiment tap-optimize poc

`tap-optimize` is a Singer tap for GoogleOptimize.

## Architecture: how does it work?
This uses the basic singer.io architecture. The pipeline basically consists of a `tap` that fetches data and a `target` 
that sincs / stores data. This is a `tap` meaning it fetches data, more specifically, it attempts to fetch Google 
Optimize meta data, using the Google Analytics v4 API.

## What does it do?
Query the GAv4 API to get info on running Optimize experiments, and their variants


## How to use?
Basic use of meltano taps:
```asciidoc
tap --config tap-config.json | target --config target-config.json 
```
In this case, a little preparation is needed:
1. Install `poetry`; `pip install poetry`
1. Enable the GAv4 API on Google Cloud
2. Create a service account in IAM
3. Grant access to GA to the service account
4. Populate `optimize-config.json`:
    - add the view_id of the GA property
    - add the path to the service account json
5. and finally, setup a target, for example for postgres:
    - `pip install target-postgres`
    - create a `postgres-config.json`, with something like:
   ```json
     {
            "schema": "public",
            "dbname": "objectiv",
            "user": "someuser",
            "password": "somepassword",
            "host": "127.0.0.1",
            "port": 5432
      }
    ```

Now we can try to run it, with something like
```bash
  ./tap-optimize --config optimize-config.json | target-postgres --config postgres-config.json
```