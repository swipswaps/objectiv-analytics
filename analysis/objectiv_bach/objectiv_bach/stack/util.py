"""
Copyright 2021 Objectiv B.V.
"""
from objectiv_bach.stack.basic_features import BasicFeatures
from objectiv_bach.stack.extracted_contexts import ExtractedContexts
from objectiv_bach.stack.sessionized_data import SessionizedData
from sql_models.model import SqlModel


def basic_feature_model(session_gap_seconds=1800) -> SqlModel:
    """ Give a linked BasicFeatures model"""
    # hashed_features = HashedFeatures(extracted_contexts=ExtractedContexts())
    extracted_contexts = ExtractedContexts()
    return BasicFeatures.build(
        sessionized_data=SessionizedData(
            session_gap_seconds=session_gap_seconds,
            extracted_contexts=extracted_contexts
        )
    )
