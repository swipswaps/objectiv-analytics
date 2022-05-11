.. _open_model_hub_version_check:

.. currentmodule:: modelhub

.. frontmatterposition:: 5

=============
Version check
=============

The Objectiv Modelhub package comes with a built-in version checker. During import, it automatically checks to see if the loaded version is the most recent version.

**Why?**

We are adding new models and taxonomy operation in a rapid pace, so the goal of this version check is to notify you if when models & operations are available to use.

**How?**

An asynchronous http request to http://versioncheck.objectiv.io on package import.

**What data is being sent?**

Your current version of the model hub and from which python package the request is made. No cookies, IPs or any other PII is being sent.

**Disable the version check**

Disable the check by setting the environment variable *OBJECTIV_VERSION_CHECK_DISABLE* to *true* prior to importing objectiv-modelhub.

**Source code**

For more detailed information, check the source code in `__init__.py <https://github.com/objectiv/objectiv-analytics/edit/add-version-checking/modelhub/modelhub/__init__.py?>`_
