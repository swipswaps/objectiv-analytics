"""
Copyright 2021 Objectiv B.V.
"""

# Custom Schema Extensions to load
import os

# Custom Schema Extensions to load
from typing import NamedTuple, Optional

SCHEMA_EXTENSION_EVENT = os.environ.get('SCHEMA_EXTENSION_EVENT')
SCHEMA_EXTENSION_CONTEXT = os.environ.get('SCHEMA_EXTENSION_CONTEXT')

# Maximum number of events that a worker will process in a single batch
WORKER_BATCH_SIZE = 200
# Time to sleep, if there is no work to do for the workers
WORKER_SLEEP_SECONDS = 5


class AwsOutputConfig(NamedTuple):
    access_key_id: str
    secret_access_key: str
    region: str
    bucket: str
    s3_prefix: str


class DiskOutputConfig(NamedTuple):
    path: str


class PostgresOutputConfig(NamedTuple):
    todo: str


class OutputConfig(NamedTuple):
    postgres: Optional[PostgresOutputConfig]
    aws: Optional[AwsOutputConfig]
    disk: Optional[DiskOutputConfig]


def get_config_output_aws() -> Optional[AwsOutputConfig]:
    # default access keys to an empty string, otherwise the boto library will default ot user defaults.
    access_key_id = os.environ.get('AWS_ACCESS_KEY_ID', '')
    secret_access_key = os.environ.get('AWS_SECRET_ACCESS_KEY', '')
    region = os.environ.get('AWS_ACCESS_KEY_ID', 'eu-west-1')
    bucket = os.environ.get('AWS_BUCKET', '')
    s3_prefix = os.environ.get('AWS_S3_PREFIX', 'test-prefix')
    if region and access_key_id and secret_access_key and bucket and s3_prefix:
        return AwsOutputConfig(
            access_key_id=access_key_id,
            secret_access_key=secret_access_key,
            region=region,
            bucket=bucket,
            s3_prefix=s3_prefix
        )
    return None


def get_config_output_disk() -> Optional[DiskOutputConfig]:
    json_dir: Optional[str] = os.environ.get('JSON_DIR')
    if json_dir:
        return DiskOutputConfig(path=json_dir)
    return None


def get_config_output_postgres() -> Optional[PostgresOutputConfig]:
    return None


def get_config_output() -> OutputConfig:
    return OutputConfig(
        postgres=get_config_output_postgres(),
        aws=get_config_output_aws(),
        disk=get_config_output_disk()
    )