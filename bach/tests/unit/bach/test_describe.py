import pytest

from bach.describe import DescribeOperation, SupportedStats, _get_casted_filtering_dtypes
from tests.unit.bach.util import get_fake_df


def test_process_params_percentile_error() -> None:
    with pytest.raises(ValueError, match=r'percentiles should'):
        DescribeOperation(
            obj=get_fake_df(['a'], ['b']),
            include=(),
            exclude=(),
            datetime_is_numeric=False,
            percentiles=[123],
        )


def test_process_params_empty_df() -> None:
    with pytest.raises(ValueError, match=r'Cannot describe a Dataframe'):
        DescribeOperation(
            obj=get_fake_df([], []),
            include=(),
            exclude=(),
            datetime_is_numeric=False,
            percentiles=None,
        )


def test_get_series_per_type_unsupported_type() -> None:
    with pytest.raises(ValueError, match=r'.* has no supported dtype to describe.'):
        DescribeOperation(
            obj=get_fake_df([], ['a'], dtype='json'),
            include=(),
            exclude=(),
            datetime_is_numeric=False,
            percentiles=None,
        )._get_series_to_aggregate()


def test_get_casted_filtering_dtypes() -> None:
    with pytest.raises(ValueError, match=r'Unknown dtype: random'):
        _get_casted_filtering_dtypes(filtering_dtypes='random')

