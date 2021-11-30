"""
Copyright 2021 Objectiv B.V.
"""
from sql_models.model import SqlModelBuilder


class SessionizedData(SqlModelBuilder):

    @property
    def sql(self):
        return _SQL


_SQL = \
    '''
    with session_starts_{{id}} as (
        select
            *,
            case when coalesce(
                extract(
                    epoch from (moment - lag(moment, 1)
                        over (partition by cookie_id order by moment, event_id))
                ) > {session_gap_seconds},
                true
            ) then true end as is_start_of_session
        from {{extracted_contexts}}
    ),
    session_id_and_start_{{id}} as (
        select
            *,
            -- generates a session_id for each is_start_of_session
            case 
                when is_start_of_session then 
                    row_number() over (partition by is_start_of_session order by moment asc)
            end as session_id,
            -- generates a unique number for each session, but not in the right order.
            count(is_start_of_session) over (order by cookie_id, moment, event_id) as is_one_session
        from session_starts_{{id}}
    )
    select
        -- populates the correct session_id for all rows with the same value for is_one_session
        first_value(session_id) over (partition by is_one_session order by moment) as session_id,
        row_number() over (partition by is_one_session order by moment, event_id asc) as session_hit_number,
        cookie_id as user_id,
        event_id,
        day,
        moment,
        cookie_id,
        global_contexts,
        location_stack,
        event_type,
        stack_event_types
    from session_id_and_start_{{id}}
    '''
