"""
Copyright 2021 Objectiv B.V.
"""
from abc import abstractmethod
from typing import List, Optional

from bach import DataFrame, SeriesAbstractNumeric


class BaseScaler:
    """
    Abstract class that specifies the basic properties of scalers.

    Child classes should implement ``transform`` method, which scales values
    based on the child's score calculations.
    """
    training_df: DataFrame

    def __init__(self, training_df: 'DataFrame') -> None:
        self.training_df = training_df.copy()

    @property
    def feature_names(self) -> List[str]:
        """names of numeric columns in the DataFrame used as fitted dataset."""
        return [s.name for s in self.training_df.data.values() if isinstance(s, SeriesAbstractNumeric)]

    @property
    def n_features(self) -> int:
        """number for numeric columns in the DataFrame used as fitted dataset."""
        return len(self.feature_names)

    @abstractmethod
    def transform(self, df: Optional['DataFrame'] = None) -> 'DataFrame':
        """Returns a dataframe where each feature value shared with the fitted dataframe is scaled."""
        raise NotImplementedError()

    @abstractmethod
    def _get_score_variables_df(self) -> DataFrame:
        """Returns a dataframe with need variables for score calculation."""
        raise NotImplementedError()


class StandardScaler(BaseScaler):
    """
    Scaler class that standardizes features by removing the mean and scaling to unit variance.
    In order to instantiate this class you should provide the following params:
    training_df: A Dataframe containing the dataset to be used as training set.
    with_mean: if true, each feature value will be centered before scaling
    with_std: if true, each feature value will be scaled to unit variance

    The standard score per feature series is calculated as:

    z = (x - μ) / σ

    Where:
     * μ is the mean of the fitted feature series. I.e ``self.df[series].mean()``
     * σ is the variance of the fitted feature series. I.e ``self.df[series].var_pop()``
     * x is the series to be scaled.
     * z is the scaled series.
    """
    with_mean: bool
    with_std: bool

    training_df: 'DataFrame'

    def __init__(self, training_df: 'DataFrame', with_mean: bool = True, with_std: bool = True) -> None:
        self.with_mean = with_mean
        self.with_std = with_std
        super().__init__(training_df)

    def transform(self, testing_df: Optional['DataFrame'] = None) -> 'DataFrame':
        """
        Returns a new dataframe with scaled features. If a df is not provided, the DataFrame used as training
        will be returned instead.

        Scaled series are shared between both training and testing dataset.
        """
        df_cp = testing_df.copy() if testing_df is not None else self.training_df.copy()

        if not self.with_mean and not self.with_std:
            return df_cp

        valid_numeric_cols = [
            s.name for s in df_cp.data.values()
            if isinstance(s, SeriesAbstractNumeric) and s.name in self.feature_names
        ]
        if not valid_numeric_cols:
            raise ValueError('DataFrame has no numeric series to transform.')

        agg_df = self._get_score_variables_df()
        merged = agg_df.merge(df_cp, how='cross')

        for col in valid_numeric_cols:
            if self.with_mean:
                merged[col] -= merged[f'{col}_mean']
            if self.with_std:
                merged[col] /= merged[f'{col}_std_pop']

        return merged[df_cp.data_columns]

    def _get_score_variables_df(self) -> 'DataFrame':
        """
        Returns a DataFrame with information needed for score calculation:
        if with_mean, dataframe with calculated mean per feature
        if with_std, dataframe with calculated (population) standard deviation per  feature.
        """
        aggregations = []
        if self.with_mean:
            aggregations.append('mean')

        if self.with_std:
            aggregations.append('std_pop')

        agg_df = self.training_df.agg(func=list(aggregations), numeric_only=True)
        return agg_df
