"""
Copyright 2021 Objectiv B.V.
"""
from objectiv_bach.stack.basic_features import BasicFeatures
from objectiv_bach.stack.extracted_contexts import ExtractedContexts
from objectiv_bach.stack.feature_table import FeatureTable
from objectiv_bach.stack.hashed_features import HashedFeatures
from objectiv_bach.stack.sessionized_data import SessionizedData
from sql_models.model import SqlModel


def duplo_basic_features(session_gap_seconds=123) -> SqlModel[BasicFeatures]:
    """ Give a linked BasicFeatures model"""
    hashed_features = HashedFeatures(extracted_contexts=ExtractedContexts())
    return BasicFeatures.build(
        feature_table=FeatureTable(
            hashed_features=hashed_features
        ),
        sessionized_data=SessionizedData(
            session_gap_seconds=session_gap_seconds,
            hashed_features=hashed_features
        )
    )
