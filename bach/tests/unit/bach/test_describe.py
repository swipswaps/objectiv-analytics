import pytest

from bach.describe import DataFrameDescriber
from tests.functional.bach.test_data_and_utils import get_bt_with_test_data
from tests.unit.bach.util import get_fake_df_test_data


@pytest.fixture()
def df_describer() -> DataFrameDescriber:
    return DataFrameDescriber(
        df=get_fake_df_test_data(),
        include=None,
        exclude=None,
        datetime_is_numeric=False,
        percentiles=None,
    )


def test_df_categorical_describe() -> None:
    df = get_bt_with_test_data()[['city', 'municipality']]
    df_describer = DataFrameDescriber(
        df=df,
        include=None,
        exclude=None,
        datetime_is_numeric=False,
        percentiles=None,
    )
    result = df_describer.describe()


def test_df_numerical_describe() -> None:
    df = get_bt_with_test_data()[['city', 'skating_order', 'inhabitants']]
    df_describer = DataFrameDescriber(
        df=df,
        include=None,
        exclude=None,
        datetime_is_numeric=False,
        percentiles=None,
    )
    result = df_describer.describe()
    print(result)