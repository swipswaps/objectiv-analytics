"""
Copyright 2021 Objectiv B.V.
"""
from typing import List, Union

import bach
from bach.series import Series
from sql_models.constants import NotSet, not_set
from typing import List, Union, TYPE_CHECKING
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.linear_model import LogisticRegression as LogisticRegression_sklearn
from sklearn.model_selection import StratifiedKFold
import pandas as pd
from sklearn.metrics import roc_curve, auc

if TYPE_CHECKING:
    from modelhub import ModelHub


GroupByType = Union[List[Union[str, Series]], str, Series, NotSet]


class LogisticRegression(LogisticRegression):

    def decision_function(self, X, return_bach=False):
        X_p = X.to_pandas()
        values = super().decision_function(X_p)

        if return_bach:
            return self._return_series(X, values, name='confidence_score')

        return values

    def fit(self, X, y, *args, **kwargs):
        X_p = X.to_pandas()
        y_p = y.to_pandas()

        return super().fit(X_p, y_p, *args, **kwargs)

    def score(self, X, y):
        X_p = X.to_pandas()
        y_p = y.to_pandas()

        return super().score(X, y_p)

    def _return_series(self, X, values, name, classes=False):
        X_p = X.to_pandas()
        X_copy = X.copy()
        if classes:
            import pandas as pd
            pdf = pd.DataFrame(values, columns=[name + str(x) for x in self.classes_])
            for name in pdf.columns:
                X_p[name] = pdf[name].to_numpy()
                X_copy[name] = X_p[name]  # todo fix if name already exists (maybe only use index from X)
            return X_copy[list(pdf.columns)]

        else:
            X_p['values'] = values
            X_copy['__values'] = X_p['values']
            values = X_copy['__values']

            return values.copy_override(name=name)

    def predict(self, X):
        values = super().predict(X)
        return self._return_series(X, values, name='labels')

    def predict_log_proba(self, X):
        values = self.predict_proba(X, return_bach=False)
        values = np.log(values)
        return self._return_series(X, values, name='log_probability', classes=True)

    def predict_proba(self, X, return_bach=True):
        values = super().predict_proba(X)

        if return_bach:
            return self._return_series(X, values, name='probability', classes=True)
        return values

    def score(self, X, y, sample_weight=None):
        from sklearn.metrics import accuracy_score

        y_hat = self.predict(X).to_pandas()
        y_p = y.to_pandas()

        return accuracy_score(y_p, y_hat, sample_weight=sample_weight)


class FeatureImportance:
    def __init__(self, **kwargs):
        self._model = LogisticRegression(**kwargs)

    @property
    def underlyingmodel(self):
        return self._model

    def get_results(self):
        return self._model.coef_


class Aggregate:
    """
    Models that return aggregated data in some form from the original DataFrame with Objectiv data.
    """

    def __init__(self, mh: 'ModelHub'):
        self._mh = mh

    def _check_groupby(self,
                       data: bach.DataFrame,
                       groupby: Union[List[Union[str, Series]], str, Series],
                       not_allowed_in_groupby: str = None
                       ):

        if data.group_by:
            raise ValueError("can't run model hub models on a grouped DataFrame, please use parameters "
                             "(ie groupby of the model")

        groupby_list = groupby if isinstance(groupby, list) else [groupby]
        groupby_list = [] if groupby is None else groupby_list

        if not_allowed_in_groupby is not None and not_allowed_in_groupby not in data.data_columns:
            raise ValueError(f'{not_allowed_in_groupby} column is required for this model but it is not in '
                             f'the DataFrame')

        if not_allowed_in_groupby:
            for key in groupby_list:
                new_key = data[key] if isinstance(key, str) else key
                if new_key.equals(data[not_allowed_in_groupby]):
                    raise KeyError(f'"{not_allowed_in_groupby}" is in groupby but is needed for aggregation: '
                                   f'not allowed to group on that')

        grouped_data = data.groupby(groupby_list)
        return grouped_data

    def _generic_aggregation(self,
                             data: bach.DataFrame,
                             groupby: Union[List[Union[str, Series]], str, Series],
                             column: str,
                             name: str):

        self._mh._check_data_is_objectiv_data(data)

        data = self._check_groupby(data=data,
                                   groupby=groupby,
                                   not_allowed_in_groupby=column)

        series = data[column].nunique()
        return series.copy_override(name=name)

    def unique_users(self,
                     data: bach.DataFrame,
                     groupby: GroupByType = not_set) -> bach.SeriesInt64:
        """
        Calculate the unique users in the Objectiv ``data``.

        :param data: :py:class:`bach.DataFrame` to apply the method on.
        :param groupby: sets the column(s) to group by.

            - if not_set it defaults to using :py:attr:`ModelHub.time_agg`.
            - if None it aggregates over all data.
        :returns: series with results.
        """

        groupby = [self._mh.time_agg(data)] if groupby is not_set else groupby

        return self._generic_aggregation(data=data,
                                         groupby=groupby,
                                         column='user_id',
                                         name='unique_users')

    def unique_sessions(self,
                        data: bach.DataFrame,
                        groupby: GroupByType = not_set) -> bach.SeriesInt64:
        """
        Calculate the unique sessions in the Objectiv ``data``.

        :param data: :py:class:`bach.DataFrame` to apply the method on.
        :param groupby: sets the column(s) to group by.

            - if not_set it defaults to using :py:attr:`ModelHub.time_agg`.
            - if None it aggregates over all data.
        :returns: series with results.
        """

        groupby = [self._mh.time_agg(data)] if groupby is not_set else groupby

        return self._generic_aggregation(data=data,
                                         groupby=groupby,
                                         column='session_id',
                                         name='unique_sessions')

    def session_duration(self,
                         data: bach.DataFrame,
                         groupby: GroupByType = not_set,
                         exclude_bounces: bool = True) -> bach.SeriesInt64:
        """
        Calculate the average duration of sessions.

        :param data: :py:class:`bach.DataFrame` to apply the method on.
        :param groupby: sets the column(s) to group by.

            - if not_set it defaults to using :py:attr:`ModelHub.time_agg`.
            - if None it aggregates over all data.
        :returns: series with results.
        """

        self._mh._check_data_is_objectiv_data(data)

        if groupby is not_set:
            groupby = self._mh.time_agg(data)

        if groupby is None:
            new_groupby = []
        elif not isinstance(groupby, list):
            new_groupby = [groupby]
        else:
            new_groupby = groupby
        new_groupby.append(data.session_id.copy_override(name='_session_id'))

        gdata = self._check_groupby(data=data, groupby=new_groupby)
        session_duration = gdata.aggregate({'moment': ['min', 'max']})
        session_duration['session_duration'] = session_duration['moment_max']-session_duration['moment_min']

        if exclude_bounces:
            session_duration = session_duration[(session_duration['session_duration'] > '0')]

        return session_duration.groupby(session_duration.index_columns[:-1]).session_duration.mean()

    def frequency(self, data: bach.DataFrame) -> bach.SeriesInt64:
        """
        Calculate a frequency table for the number of users by number of sessions.

        :param data: :py:class:`bach.DataFrame` to apply the method on.
        :returns: series with results.
        """

        self._mh._check_data_is_objectiv_data(data)

        total_sessions_user = data.groupby(['user_id']).aggregate({'session_id': 'nunique'})
        frequency = total_sessions_user.groupby(['session_id_nunique']).aggregate({'user_id': 'nunique'})

        return frequency.user_id_nunique

    def create_feature_usage_data_set(self,
                                      data: bach.DataFrame,
                                      name: str,
                                      feature_column: str,
                                      partition: str ='user_id'):

        features = data.groupby(partition)[feature_column].value_counts()
        features_unstacked = features.unstack(fill_value=0)

        # y
        df_copy = data.copy()
        df_copy['is_converted'] = self._mh.map.conversions_counter(data=df_copy, name=name,
                                                                  partition=partition) > 0

        user_conversion = df_copy[['is_converted', partition]].drop_duplicates()

        # combine
        features_set = features_unstacked.merge(user_conversion, left_index=True, right_on='user_id')
        # pdf = features_set.to_pandas()

        y = features_set.is_converted
        X = features_set.drop(columns=['is_converted'])

        return X, y

    def LogisticRegression(self, *args, **kwargs):
        return LogisticRegression(*args, **kwargs)

    def feature_importance(self, data, name, feature_column, **kwargs):
        X, y = self._mh.agg.create_feature_usage_data_set(
            data=data,
            name=name,
            feature_column=feature_column)
        model = FeatureImportance(**kwargs)
        model.underlyingmodel.fit(X, y)

        return X, y, model

    def feature_importance_proto(self, X,y, print_report=False):
        kf = StratifiedKFold(5, shuffle=True, random_state=42)

        # todo now just a method that returns a dict, but could be improved returning a class with the
        #  models and metrics etc

        result_dict = {}

        coef = pd.DataFrame(columns=X.columns)
        i = 1
        # todo split based on bach: maybe save a last test set of complete unseen data in the database (the
        #  biggest set)
        for train, test in kf.split(X, y):
            X_train, X_test, y_train, y_test = X.iloc[train], X.iloc[test], y[train], y[test]

            report = f"fold {i}\n"
            report += "==============================\n"
            report += f"{y_test.value_counts()=}\n"
            report += f"{y_train.value_counts()=}\n"

            lr = LogisticRegression_sklearn()
            lr.fit(X_train, y_train)

            report += f"score: {lr.score(X_test, y_test)}\n"

            cr = self._mh.metrics.get_classification_report(y_test, lr.predict(X_test), output_dict=True)

            x_results = X_test.copy()
            x_results['is_converted'] = y_test
            x_results['yhat'] = lr.predict(X_test)

            proba = lr.predict_proba(X_test)[:, 1]
            fpr, tpr, thresholds = roc_curve(y_test, proba)

            report += f"\npredicted converted correct: " \
                f"{len(x_results[(x_results['yhat'] == 1) & (x_results['is_converted'] == 1)])}\n"
            report += f"recall: {cr[True]['recall']}\n"
            report += f"precision: {cr[True]['precision']}\n"
            report += f"roc auc: {auc(fpr, tpr)}\n"

            coef_fold = pd.DataFrame(lr.coef_, columns=X.columns)

            coef = pd.concat([coef, coef_fold])

            result_dict[f'fold {i}'] = {'classification_report': cr,
                                        'auc': auc(fpr, tpr),
                                        'coef': coef_fold}

            i += 1
            report += "==============================\n\n"
            if print_report:
                print(report)
        result_dict['coef'] = coef

        feature = pd.DataFrame([coef.mean(), coef.std()], index=['mean', 'std']).T.sort_values(
            'mean')

        result_dict['feature'] = feature

        result_dict['auc_mean'] = np.mean([y['auc'] for x, y in result_dict.items() if x[:4] == 'fold'])

        return result_dict
