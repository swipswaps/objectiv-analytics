import pytest

from bach.describe import DataFrameDescriber, SupportedStats
from tests.unit.bach.util import get_fake_df


def test_process_params_percentile_error() -> None:
    with pytest.raises(ValueError, match=r'percentiles should'):
        DataFrameDescriber(
            df=get_fake_df(['a'], ['b']),
            include=None,
            exclude=None,
            datetime_is_numeric=False,
            percentiles=[123],
        )


def test_process_params_empty_df() -> None:
    with pytest.raises(ValueError, match=r'Cannot describe a Dataframe'):
        DataFrameDescriber(
            df=get_fake_df([], []),
            include=None,
            exclude=None,
            datetime_is_numeric=False,
            percentiles=None,
        )


def test_process_params_unsupported_type() -> None:
    with pytest.raises(ValueError, match=r'.* has no supported dtype to describe.'):
        DataFrameDescriber(
            df=get_fake_df([], ['a'], dtype='json'),
            include=None,
            exclude=None,
            datetime_is_numeric=False,
            percentiles=None,
        )


def test_invalid_include_exclude_params() -> None:
    df = get_fake_df([], ['a'], dtype='integer')
    with pytest.raises(ValueError, match=r'Unknown dtype: random'):
        DataFrameDescriber(
            df=df,
            include='random',
            exclude=None,
            datetime_is_numeric=False,
            percentiles=None,
        )

    with pytest.raises(ValueError, match=r'Unknown dtype: random2'):
        DataFrameDescriber(
            df=df,
            include=None,
            exclude='random2',
            datetime_is_numeric=False,
            percentiles=None,
        )


def test_process_params_main_stat() -> None:
    fake_df = get_fake_df(
        index_names=[],
        data_names=['a', 'b', 'c'],
        dtype={
            'a': 'string',
            'b': 'integer',
            'c': 'bool',
            'd': 'timestamp',
        },
    )

    num_describer = DataFrameDescriber(
        df=fake_df,
        include='integer',
        exclude=None,
        datetime_is_numeric=False,
        percentiles=None,
    )
    assert num_describer.main_stat == SupportedStats.NUMERICAL

    cat_describer = DataFrameDescriber(
        df=fake_df,
        include=None,
        exclude='integer',
        datetime_is_numeric=False,
        percentiles=None,
    )
    assert cat_describer.main_stat == SupportedStats.CATEGORICAL
