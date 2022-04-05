import numpy as np
import pandas as pd

from tests.functional.bach.test_data_and_utils import get_from_df


def test_plot_hist_basic() -> None:
    pdf = pd.DataFrame(
        np.random.randint(1, 7, 6000),
        columns=['one'])
    pdf['two'] = pdf['one'] + np.random.randint(1, 7, 6000)

    df = get_from_df('hist_plot', pdf)
    result = df.plot.hist(bins=12)