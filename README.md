![objectiv_logo_light](https://user-images.githubusercontent.com/82152911/159266790-19e0e3d4-0d10-4c58-9da7-16edde9ec05a.svg#gh-light-mode-only "Objectiv Logo")
![objectiv_logo_dark](https://user-images.githubusercontent.com/82152911/159266895-39f52604-83c1-438d-96bd-9a6d66e74b08.svg#gh-dark-mode-only "Objectiv Logo")

### Open-source infrastructure for product analytics

* Collect model-ready user behavior data and feed it straight into your data warehouse
* Use pandas-like operations and pre-built models that run on the full SQL dataset
* Instantly convert models to SQL to feed all data consumers from a single source of truth

Objectiv is self-hosted, 100% free to use and fully open source.

### Getting Started

Follow our step-by-step [Quickstart Guide](https://objectiv.io/docs/home/quickstart-guide) to set up a fully functional dockerized demo pipeline in under 5 minutes.

### Resources

* [Objectiv Docs](https://www.objectiv.io/docs) - Objectiv's official documentation.
* [Objectiv on Slack](https://objectiv.io/join-slack) - Get help & join the discussion on where to take Objectiv next.
* [Contribution Guide](https://www.objectiv.io/docs/home/the-project/contribute) - Report bugs, request features and contribution information.
* [Objectiv.io](https://www.objectiv.io) - Objectiv's official website.

---

## What's in the box?
![objectiv-stack](https://user-images.githubusercontent.com/82152911/159297021-2b5e8d50-2d25-47b8-9326-cea8e5e0e2f4.svg#gh-light-mode-only "Objectiv Stack")
![objectiv-stack-dark](https://user-images.githubusercontent.com/82152911/159297039-33b32dd2-23dc-41ba-b17a-aa1237953c7a.svg#gh-dark-mode-only "Objectiv Stack")

### Open analytics taxonomy

| [![image](https://user-images.githubusercontent.com/82152911/159288731-a6351cd2-13ff-4cdc-890a-37efff0be076.png)](https://www.objectiv.io/docs/taxonomy)| 
| --- |
| _hi_ |

Our proposal for [a common way to collect & structure analytics data](https://www.objectiv.io/docs/taxonomy). Describes classes for common user interactions and their contexts. 

* Used as an instrument of validation by Objectiv's Tracker SDK
* Designed to ensure collected data is model-ready without cleaning, transformation or tracking plans
* Enables models to be shared and reused as a result of consistent data collection

Supports a wide range of product analytics use cases. We're currently working on extending the range of marketing related use cases.

### Tracking SDK

Supports front-end engineers to [implement tracking instrumentation](https://www.objectiv.io/docs/tracking) that embraces the open analytics taxonomy.

* Provides guidance and validation to help setting up error-free instrumentation
* Support for React, React Native, Angular and Browser
 
### Open model hub

A [growing collection of pre-built models](https://www.objectiv.io/docs/modeling/models) that you run, combine or customize to quickly build in-depth analyses.

* All models work with any dataset that embraces the open analytics taxonomy
* Currently covers a handful of common product analytics operations
* More advanced models coming soon (i.e. impact attribution of product features on conversion)

### Bach modeling library

Python-based [modeling library](https://www.objectiv.io/docs/modeling/bach) that enables using pandas-like operations on the full SQL dataset

* Includes optimized operations for datasets that embrace the open analytics taxonomy
* Pandas-compatible: Use popular pandas ML libraries in your models
* Output your entire model to SQL with a single command


For more information, visit [objectiv.io](https://www.objectiv.io) or [Objectiv Docs](https://www.objectiv.io/docs) - Objectiv's official documentation..

---

This repository is part of the source code for Objectiv, which is released under the Apache 2.0 License. Please refer to [LICENSE.md](LICENSE.md) for details. Unless otherwise noted, all files © 2021 Objectiv B.V.



