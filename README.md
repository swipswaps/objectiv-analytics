Go to [Objectiv Docs](https://objectiv.io/docs/) for detailed installation & usage instructions

![Objectiv Logo](https://objectiv.io/docs/img/logo-objectiv-large.svg "Objectiv Logo")

Objectiv is a data collection & modeling library that puts the data scientist first. It is built around 
[the open taxonomy of analytics](https://objectiv.io/docs/taxonomy), which is our proposal for a common way to collect, 
structure and validate data. With Objectiv, you create a 
[contextual layer for your application](https://objectiv.io/docs/tracking/core-concepts/tagging) by mapping it to the taxonomy, 
with the goal of collecting better data and more effective modeling.

#### Key features

* [Event & context classes are predefined](https://objectiv.io/docs/taxonomy), designed to ensure the collected data 
  covers a wide range of common analytics use cases. 
* Instrumentation gets validated against the taxonomy to provide 
  [live feedback in your IDE and console while you’re developing](https://objectiv.io/docs/tracking/core-concepts/validation).
* Tracked events can carry multiple contexts, including the 
  [exact location in the UI](https://objectiv.io/docs/tracking/core-concepts/locations) from where they were triggered.
* Collected data is well-structured, self-descriptive and gets validated at the first step of the pipeline.
* [Familiar Pandas-like dataframe operations can be used](https://objectiv.io/docs/modeling) on the full data set, straight from a notebook. 
* Models can be built by taking parts of other models. Models can be reused for other projects by changing a 
  single line of code.

- - -

## Quick Start

### Play with Objectiv
We’ve set up a [sandboxed notebook with real data from objectiv.io](https://notebook.objectiv.io/lab?path=product_analytics.ipynb) for you to 
play with. Give it a try and see what Objectiv can do.

### Running all Objectiv components Dockerized
This is a great way to run Objectiv locally and to see what it is about. With some additional work this
setup can also be used for low-traffic sites and apps.

The below commands assume that you have `docker-compose` [installed](https://docs.docker.com/compose/install/).
```bash
docker-compose pull  # pull pre-built images from gcr
docker-compose up    # spin up Objective pipeline
```
This will spin up three images:
* `objectiv_collector` - Endpoint that the Objectiv-tracker can send events to (http://localhost:5000).
* `objectiv_postgres` - Database to store data.
* `objectiv_notebook` - Jupyter notebook that can be used to query the data (http://localhost:8888).

SECURITY WARNING: The above `docker-compose` commands start a postgres container that allows connections
without verifying passwords. Do not use this in production or on a shared system!

### Instrumenting Objectiv
To immediately jump into instrumenting your application, there are detailed How-to Guides for multiple 
platforms and frameworks.

[Follow the step-by-step Tracking How-to Guides](https://objectiv.io/docs//tracking/how-to-guides)

- - -

## Support & Troubleshooting
If you need help using or installing Objectiv, join our [Slack channel](https://join.slack.com/t/objectiv-io/shared_invite/zt-u6xma89w-DLDvOB7pQer5QUs5B_~5pg) and post your question there. 

## Bug Reports & Feature Requests
If you’ve found an issue or have a feature request, please check out the [Contribution Guide](https://www.objectiv.io/docs/the-project/contributing).

## Security Disclosure
Found a security issue? Please don’t use the issue tracker but contact us directly. See [SECURITY.md](../SECURITY.md) for details.

## Roadmap
Future plans for Objectiv can be found on our [Github Roadmap](https://github.com/objectiv/objectiv-analytics/projects/2).

## Custom Development & Contributing Code
If you want to contribute to Objectiv or use it as a base for custom development, take a look at [CONTRIBUTING.md](CONTRIBUTING.md). It contains detailed development instructions and a link to information about our contribution process and where you can fit in.

## License
This repository is part of the source code for Objectiv, which is released under the Apache 2.0 License. Please refer to [LICENSE.md](../LICENSE.md) for details.

Unless otherwise noted, all files © 2021 Objectiv B.V.
