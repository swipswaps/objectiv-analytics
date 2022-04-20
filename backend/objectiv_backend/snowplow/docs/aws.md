# Configuring the Objectiv Collector to work with AWS
The Objectiv Collector can be configured to work with Snowplow on AWS. The Snowplow AWS setup uses either SQS 
(message queue) or Kinesis to connect various stages in the pipeline. The setup works as follows:
- Events arrive at the Objectiv Collector, and are validated.
- Good events are published on the `raw` topic on Kinesis or SQS (which in turn is processes by Enrich)
- Bad events (invalid) are published on the `bad` topic on Kinesis.

Before starting up the Objectiv Collector, some preparation is required. The following sections assume there's already
a running and functional Snowplow pipeline setup on GCP.

#### Preparation
To be able to push events into the message queue the following needs to be set up:
- The `id` of the raw Kinesis stream _or_ the URL to the SQS raw stream topic
- The `id` og the bad Kinesis stream

Optionally some AWS iAM credentials:
- AWS credentials with permission to publish to the appropriate Kinesis/SQS topics
  - `AWS_ACCESS_KEY`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_REGION`
These will be used to configure the collector in the next step.

#### Starting the collector
The configuration for the collector is controlled through environment variables. They allow you to configure which outputs
will be used. Settings specific to the AWS output are

- `SP_AWS_MESSAGE_TOPIC_RAW` - this can be either the id of a Kinesis stream (eg. sp-raw-stream) _or_ a URL to an SQS queue
- `SP_AWS_MESSAGE_TOPIC_BAD` - this should be the id of the Kinesis bad stream (eg. sp-bad-stream)

The AWS integration uses the boto3 python library, this means authentication is also provided through that library 
(As detailed [here](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/credentials.html)). 
The simplest way to make it work, is by setting the following environment variables:
- `AWS_ACCESS_KEY` - iAM key of the account used to access AWS services
- `AWS_SECRET_ACCESS_KEY` - iAM secret key
- `AWS_REGION` - Optionally specify the AWS region in which the Kinesis/SQS resources are deployed.

Once the appropriate environment variables (TOPICS) have been set, the Objectiv Collector can be started, and the Snowplow AWS 
output will be enabled.

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
    environment:
      AWS_ACCESS_KEY: AKIA-some-key
      AWS_SECRET_ACCESS_KEY: some-secret-key
      AWS_REGION: some-awesregion
      SP_AWS_MESSAGE_TOPIC_RAW: sp-raw-topic
      SP_AWS_MESSAGE_TOPIC_BAD: sp-bad-topic
```

The important parts here are:
- providing the AWS credentials (using the env is only one way of doing so)
- providing the Kinesis stream id's

#### Running locally
Running the collector locally, in a dev setup is pretty similar:

```sh
# setup environment
virtualenv objectiv-venv
source objectiv-venv/bin/activate
pip install -r requirements.in

# start flask app, using SQS queue
cd objectiv_backend
export PYTHONPATH=.:$PYTHONPATH
SP_AWS_MESSAGE_TOPIC_RAW="https://sqs.someregion.amazonaws.com/123455/sp-raw-queue" \
  SP_AWS_MESSAGE_TOPIC_BAD=sp-bad-topic \
  flask run
```

## Testing
The collector will display a message if the Snowplow config is loaded:
`Enabled Snowplow: AWS pipeline ($SP_AWS_MESSAGE_TOPIC_`.
This indicates that the collector will try to push events. If this fails, logging should hint what's happening. If there 
are no errors in the collector logs, the events should be successfully pushed into the raw topic, to be picked up by 
Snowplow's enrichment.