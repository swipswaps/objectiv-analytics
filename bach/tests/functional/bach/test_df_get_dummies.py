import pandas as pd

from tests.functional.bach.test_data_and_utils import get_from_df, assert_equals_data


def test_basic_get_dummies() -> None:
    pdf = pd.DataFrame(
        {'A': ['a', 'b', 'a'], 'B': ['b', 'a', 'c'], 'C': [1, 2, 3]},
    )

    df = get_from_df('get_dummies', pdf)
    expected = pd.get_dummies(pdf, dtype='int')
    expected.index.name = '_index_0'
    expected_columns = ['C', 'A_a', 'A_b', 'B_a', 'B_b', 'B_c']

    result = df.get_dummies().sort_index()[expected_columns]
    assert set(expected_columns) == set(result.data_columns)
    assert_equals_data(
        result[expected_columns],
        expected_columns=['_index_0'] + expected_columns,
        expected_data=[
            [0, 1, 1, 0, 0, 1, 0],
            [1, 2, 0, 1, 1, 0, 0],
            [2, 3, 1, 0, 0, 0, 1]
        ],
    )
    pd.testing.assert_frame_equal(
        expected,
        result.to_pandas(),
    )


def test_basic_get_dummies_prefix() -> None:
    pdf = pd.DataFrame(
        {'A': ['a', 'b', 'a'], 'B': ['b', 'a', 'c'], 'C': [1, 2, 3]},
    )

    df = get_from_df('get_dummies', pdf)
    prefix = ['col1', 'col2']

    expected = pd.get_dummies(pdf, prefix=prefix, dtype='int')
    expected.index.name = '_index_0'
    expected_columns = ['C', 'col1_a', 'col1_b', 'col2_a', 'col2_b', 'col2_c']

    result = df.get_dummies(prefix=prefix).sort_index()
    result = result[expected_columns]
    assert set(expected_columns) == set(result.data_columns)
    assert_equals_data(
        result,
        expected_columns=['_index_0'] + expected_columns,
        expected_data=[
            [0, 1, 1, 0, 0, 1, 0],
            [1, 2, 0, 1, 1, 0, 0],
            [2, 3, 1, 0, 0, 0, 1]
        ],
    )

    pd.testing.assert_frame_equal(
        pdf,
        result.sort_index().to_pandas(),
    )
