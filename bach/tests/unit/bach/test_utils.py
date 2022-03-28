from bach.utils import get_merged_series_dtype


def test_get_merged_series_dtype() -> None:
    assert get_merged_series_dtype({'string', 'int64'}) == 'string'
    assert get_merged_series_dtype({'int64'}) == 'int64'
    assert get_merged_series_dtype({'float64', 'int64'}) == 'float64'
