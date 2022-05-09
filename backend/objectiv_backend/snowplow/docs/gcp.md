# Configuring the Objectiv Collector to work with GCP
The Objectiv Collector can be configured to work with Snowplow on GCP. The Snowplow GCP setup uses GCP PubSub topics 
(message queue) to connect various stages in the pipeline. The setup works as follows:
- Events arrive at the Objectiv Collector, and are validated.
- Good events are published on the `raw` topic on PubSub (which is read by the Enrich process)
- Bad events (invalid) are published on the `bad` topic on PubSub.

Before starting up the Objectiv Collector, some preparation is required. The following sections assume there's already
a running and functional Snowplow pipeline setup on GCP. If you don't, Snowplow has a 
[quick start installation guide](https://docs.snowplowanalytics.com/docs/open-source-quick-start/quick-start-installation-guide-on-gcp/)
to get you up and running.

#### Starting the collector
The configuration for the collector is controlled through environment variables. They allow you to configure which outputs
will be used. Settings specific to the PubSub sin are:

- `SP_GCP_PROJECT` This is the `id` of the project on GCP where the PubSub topic is located
- `SP_GCP_PUBSUB_TOPIC_RAW` This is the `id` of the PubSub topic to publish events to
- `SP_GCP_PUBSUB_TOPIC_BAD` This is the `id` of the PubSub topic to publish bad/invalid events to
- `GOOGLE_APPLICATION_CREDENTIALS` This is the path to a `json` containing a service account on GCP that allows publishing
 to the PubSub topic.

If these are set, the snowplow sink is automatically enabled.

#### Using docker-compose
To run this setup in docker, make sure that the aforementioned environment variables are properly set and available in the
container. Also take care that the path to the credentials is actually available in the container.

When using `docker-compose`, the following yaml snippet would do the trick:
```yaml
  objectiv_collector:
    container_name: objectiv_collector
    image: objectiv/backend
    working_dir: /services
    ports:
      - "127.0.0.1:5000:5000"
    volumes:
      - /path/to/YOUR_SERVICE_ACCOUNT.json:/sa.json
    environment:
      SP_GCP_PROJECT: some-gcp-project
      SP_GCP_PUBSUB_TOPIC_RAW: sp-raw
      SP_GCP_PUBSUB_TOPIC_BAD: sp-bad
      GOOGLE_APPLICATION_CREDENTIALS: /sa.json
      OUTPUT_ENABLE_PG: false
```

The important parts here are:
- using a volume to make the service account available inside the container
- assigning the path of the volume-mapped file correctly to the environment variable
- setting the 2 GCP/PubSub variables, to make sure the collector knows where to push the events to

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
GOOGLE_APPLICATION_CREDENTIALS=/path/to/YOUR_SERVICE_ACCOUNT.json \
 SP_GCP_PROJECT=some-gcp-project \
 SP_GCP_PUBSUB_TOPIC_RAW=sp-raw \
 SP_GCP_PUBSUB_TOPIC_BAD=sp-bad \
 flask run
```

## Testing
The collector will display a message if the Snowplow config is loaded:
`Enabled Snowplow: GCP pipeline`.
This indicates that the collector will try to push events. If this fails, logging should hint what's happening. If there 
are no errors in the collector logs, the events should be successfully pushed into the raw topic, to be picked up by 
Snowplow's enrichment.
To check if messages have been successfully received by the PuSub topic, please refer to the monitoring of that specific 
topic in the GCP console. The `Publish message request count` monitoring topic should show more than 0 requests/sec.