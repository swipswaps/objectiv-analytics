import pytest

from bach.describe import DataFrameDescriber, SupportedStats, _get_casted_filtering_dtypes
from tests.unit.bach.util import get_fake_df


def test_process_params_percentile_error() -> None:
    with pytest.raises(ValueError, match=r'percentiles should'):
        DataFrameDescriber(
            df=get_fake_df(['a'], ['b']),
            include=(),
            exclude=(),
            datetime_is_numeric=False,
            percentiles=[123],
        )


def test_process_params_empty_df() -> None:
    with pytest.raises(ValueError, match=r'Cannot describe a Dataframe'):
        DataFrameDescriber(
            df=get_fake_df([], []),
            include=(),
            exclude=(),
            datetime_is_numeric=False,
            percentiles=None,
        )


def test_process_params_unsupported_type() -> None:
    with pytest.raises(ValueError, match=r'.* has no supported dtype to describe.'):
        DataFrameDescriber(
            df=get_fake_df([], ['a'], dtype='json'),
            include=(),
            exclude=(),
            datetime_is_numeric=False,
            percentiles=None,
        )


def test_get_casted_filtering_dtypes() -> None:
    df = get_fake_df([], ['a'], dtype='integer')
    with pytest.raises(ValueError, match=r'Unknown dtype: random'):
        _get_casted_filtering_dtypes(filtering_dtypes='random')


def test_process_params_main_stat() -> None:
    fake_df = get_fake_df(
        index_names=['e'],
        data_names=['a', 'b', 'c', 'd'],
        dtype={
            'a': 'string',
            'b': 'integer',
            'c': 'bool',
            'd': 'timestamp',
            'e': 'uuid',
        },
    )

    num_describer = DataFrameDescriber(
        df=fake_df,
        include=_get_casted_filtering_dtypes('integer'),
        exclude=(),
        datetime_is_numeric=False,
        percentiles=None,
    )
    assert num_describer.main_stat == SupportedStats.NUMERICAL

    cat_describer = DataFrameDescriber(
        df=fake_df,
        include=(),
        exclude=_get_casted_filtering_dtypes('integer'),
        datetime_is_numeric=False,
        percentiles=None,
    )
    assert cat_describer.main_stat == SupportedStats.CATEGORICAL
