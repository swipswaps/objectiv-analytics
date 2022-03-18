# Snowplow pipeline support

The Objectiv collector supports using the Snowplow pipeline as a sink for Objectiv events. Currently, there is support 
for Google PubSub, using Thrift messages. This means we by-pass the Snowplow collector, but hook directly into the
enrichment step.

## Architecture
The Snowplow pipeline roughly consists of the following components:
1. `Collector` - http(s) endpoint that receives events
2. `Enrichment` - process that validates incoming events, potentially enriches them (adds metadata)
3. `Loader` - final step, where the validated and enriched events are loaded into persistent storage
4. `iglu` - central repository, used by other components to pull schema to do validation on events, contexts, etc.
The Snowplow pipeline uses message queues and Thrift messages to communicate between the components.

Objectiv uses its own collector (which also handles validation), so bypasses the Snowplow collector, but pushes events 
directly into the message queue that is read by the `enrichment`. Snowplow allows for so-called structured custom 
contexts to be added to events. This is exactly what Objectiv uses. As with all contexts, they must pass validation in 
the enrichment step, which is why a schema for the Objectiv custom context must be added to iglu.

This way Snowplow knows how to validate the context. Furthermore, it also infers the database schema to be able to persist
the context. How this is handled depends on the loader chosen (e.g. Postgres uses a different, more relational schema 
than for instance Big Query).

## Setup
In this setup, we assume you already have a fully functional Snowplow pipeline running, including enrichment, loader 
and iglu repository. Enabling Objectiv involves two steps:
1. Add the Objectiv Taxonomy schema to the iglu repository.
2. Enable the collector output

### Add the Objectiv schema to the iglu repo
This explains how to get the Objectiv schema into iglu. This is necessary, so the Snowplow pipeline (enrichment) can 
validate the incoming custom contexts.
#### Preparation

- copy the Objectiv iglu schema (see `1-0-0` in this dir) into `schemas/io.objectiv/taxonomy/jsonschema/1-0-0` in your local repo
- get the address / URL of your iglu repository
- get the uuid of the repo

#### Pushing the schema
```shell
java -jar igluctl static push --public <path to schemas> <url to repo> <uuid>

## example:
java -jar igluctl static push --public ./schemas https://iglu.example.com myuuid-abcd-abcd-abcd-abcdef12345
``` 


### Enabling the collector output
Before starting up the collector, some preparation is required.

#### Preparation
To be able to push events into the message queue the following needs to be set up:
- A GCP service account (`json`) with permission to write to PubSub
- The `id` of the GCP project that holds the PubSub topic
- The `id` of the PubSub topic (message queue)

These will be used to configure the collector in the next step.

#### Starting the collector
The configuration for the collector is controlled through environment variables. They allow you to configure which outputs
will be used. Settings specific to the PubSub sin are:

- `SP_GCP_PROJECT` This is the id of the project on GCP where the PubSub topic is located
- `SP_GCP_PUBSUB_TOPIC_RAW` This is the id of the PubSub topic to publish events to
- `GOOGLE_APPLICATION_CREDENTIALS` This is the path to a `json` containing a service account on GCP that allows publishing
 to the PubSub topic.

Additionally, the collector checks `SP_GCP_PROJECT`. If it is set, the snowplow sink is automatically enabled.

#### Using docker-compose
To run this setup in docker, make sure that the aforementioned environment variables are properly set and available in the
container. Also take care that the path to the credentials is actually available in the container.

When using `docker-compose`, the following yaml snippet would do the trick:
```yaml
  objectiv_collector:
    container_name: objectiv_collector
    depends_on:
      - objectiv_postgres
    image: ${OBJECTIV_CONTAINER_URL-objectiv}/backend:${OBJECTIV_CONTAINER_TAG-latest}
    working_dir: /services
    entrypoint: bash -c "objectiv-db-init; ./entry_point.sh"
    ports:
      - "127.0.0.1:5000:5000"
    networks:
      - obj
    volumes:
      - /home/user/secrets/snowplow-pubsub-serviceaccount-askjhda8734.json:/sa.json
    environment:
      SP_GCP_PROJECT: some-gcp-project
      SP_GCP_PUBSUB_TOPIC_RAW: sp-raw
      SP_GCP_PUBSUB_TOPIC_BAD: sp-bad
      GOOGLE_APPLICATION_CREDENTIALS: /sa.json
```

The important parts here are:
- using a volume to make the service account available inside the container
- assigning the path of the volume-mapped file correctly to the environment variable
- setting the 2 GCP variables, to make sure the collector knows where to push the events to

#### Running locally
Running the collector locally, in a dev setup is pretty similar:

```sh
# setup environment
virtualenv objectiv-venv
source objectiv-venv/bin/activate
pip install -r requirements.in

# start flask app
cd objectiv_backend
export PYTHONPATH=.:$PYTHONPATH
GOOGLE_APPLICATION_CREDENTIALS=path-to-json.json SP_GCP_PROJECT=some-gcp-project SP_GCP_PUBSUB_TOPIC_RAW=sp-raw-topic flask run
```

## Testing
The collector will display a message if the Snowplow config is loaded:
`Snowplow config enabled`.
This indicated that the collector will try to push events. If this fails, logging should hint what's happening. If there 
are no errors in the collector logs, the events should be

# Maintenance

## Thrift schema
Compiling the Thrift schema into Python (should normally not be needed). The schema looks like this:
```java
namespace java com.snowplowanalytics.snowplow.CollectorPayload.thrift.model1

struct CollectorPayload {
  31337: string schema

  // Required fields which are intrinsic properties of HTTP
  100: string ipAddress

  // Required fields which are Snowplow-specific
  200: i64 timestamp
  210: string encoding
  220: string collector

  // Optional fields which are intrinsic properties of HTTP
  300: optional string userAgent
  310: optional string refererUri
  320: optional string path
  330: optional string querystring
  340: optional string body
  350: optional list<string> headers
  360: optional string contentType

  // Optional fields which are Snowplow-specific
  400: optional string hostname
  410: optional string networkUserId
}
```
source: https://github.com/snowplow/snowplow/blob/master/2-collectors/thrift-schemas/collector-payload-1/src/main/thrift/collector-payload.thrift

The Python code can then be generated using:
```shell
  curl https://raw.githubusercontent.com/snowplow/snowplow/master/2-collectors/thrift-schemas/collector-payload-1/src/main/thrift/collector-payload.thrift
  thrift --gen py  collector-payload.thrift
```
This will create a dir `gen-py/schema/`, containing `constants.py` and `ttypes.py`. These need to be copied into 
`backend/objeciv_bach/snowplow/schema`.
