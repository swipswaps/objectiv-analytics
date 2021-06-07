# Configuration Options
All configuration options are set through environment variables.

## 1. Input Configuration

Input configuration variable:

- `SCHEMA_EXTENSION_DIRECTORY` - A directory with schema extension files. Each schema extension is a json file that described part
of the full schema. **TODO:** link to a schema explanation.
If not set the default schema is used.


## 2. Output Configuration
Currently, there are three output options supported:
1. Postgres (default)
2. Files on S3 (optional) - Experimental
3. Files on disk (optional) - Experimental

Enabling an output option is done by setting the `OUTPUT_ENABLE_<option>` variable to 'true'.

### 2.1 Output Configuration: Postgres
This is the default output option, and what we recommend for all deployments.

Relevant variables:
- `OUTPUT_ENABLE_PG` - Default `true`
- `PG_HOSTNAME`      - Default: `localhost`
- `PG_PORT`          - Default: `5432`
- `PG_DATABASE_NAME` - Default: `objectiv`
- `PG_USER`          - Default: `objectiv`
- `PG_PASSWORD`

### 2.2 Output Configuration: S3 - EXPERIMENTAL
This is an experimental feature.

Relevant variables:
- `OUTPUT_ENABLE_AWS` - Default: `false`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` - Default: `eu-west-1`
- `AWS_BUCKET`
- `AWS_S3_PREFIX`

### 2.3 Output Configuration: Filesystem - EXPERIMENTAL
This is an experimental feature.

This option is mainly intended to be used for debugging and testing.
Writing production loads of data to a single directory might not work well on common filesystems.

Relevant variables:
- `OUTPUT_ENABLE_FILESYSTEM`  - Default: `false`
- `FILESYSTEM_OUTPUT_DIR`


## 3. Asynchronous Worker options - EXPERIMENTAL
This is an experimental feature.

When activating the asynchronous mode, the collector will not write directly to the `data` table, but
instead write data directly to a queue, without the usual validating, enriching and de-duplication.
The `objectiv-workers` command can be used to start workers that read from the queue and perform those
activities.

Async mode configuration variable:
- `ASYNC_MODE` - When set to `true` this activates the asynchronous mode on the collector



