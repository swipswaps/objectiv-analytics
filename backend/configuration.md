# Configuration Options
All configuration options are set through environment variables.

## 1. Input Configuration

#### SCHEMA_EXTENSION_DIRECTORY
A directory with schema extension files. Each schema extension is a json file that described part
of the full schema. **TODO:** link to a schema explanation.

If not set the default schema is used.

## 2. Output Configuration
Currently, there are three output options supported:
1. Postgres (default)
2. Files on S3 (optional)
3. Files on disk (optional)

Enabling an output option is done by setting all relevant environment variables.

### 2.1 Output Configuration: Postgres

#### POSTGRES_HOSTNAME - Hostname on which the Postgres server can be reached, defaults to `localhost`.

#### POSTGRES_PORT
Port on which the Postgres server can be reached, defaults to `5432`

#### POSTGRES_DB
Name of the database, defaults to `objectiv`.

#### POSTGRES_USER
username, defaults to `objectiv`.
Make sure the user has write access to the relevant tables.

#### POSTGRES_PASSWORD
password, cannot be empty. By default empty.


### 2.2 Output Configuration: S3 - EXPERIMENTAL
#### AWS_ACCESS_KEY_ID
#### AWS_SECRET_ACCESS_KEY
#### AWS_REGION
Defaults to `eu-west-1`
#### AWS_BUCKET
#### AWS_S3_PREFIX


### 2.3 Output Configuration: Filesystem - EXPERIMENTAL
This option is mainly intended to be used for debugging and testing. Writing production loads of data to a
single  directory might not work on most filesystems.

#### JSON_OUTPUT_DIR
Directory to which files should be written


## 3. Asynchronous Worker options - EXPERIMENTAL
When activating the asynchronous mode, the collector will not write directly to the `data` table, but
instead write data directly to a queue, without the usual validating, enriching and de-duplication.
The `objectiv-workers` command can be used to start workers that read from the queue and perform those
activities.

#### ASYNC_MODE
When set to `true` this activates the asynchronous mode on the collector



