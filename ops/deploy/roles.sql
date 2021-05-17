begin;

-- used by collector to write incoming events
create role obj_collector_role noinherit;
grant select,update,insert on public.queue_entry to obj_collector_role;
-- we also add the "worker" permissions here, to make sure
-- the synchronous mode properly works
grant select,update,delete on public.queue_entry to obj_collector_role;
grant select,update,insert,delete on public.queue_enrichment, public.queue_finalize to obj_collector_role;
grant insert on public.data to obj_collector_role;

-- used by worker to read/write queues
-- update priv is needed because of the `select for update` queries
create role obj_worker_role noinherit;
grant select,update,delete on public.queue_entry to obj_worker_role;
grant select,update,insert,delete on public.queue_enrichment, public.queue_finalize to obj_worker_role;
grant insert on public.data to obj_worker_role;

-- used by for example notebook to query session data
create role obj_reader_role noinherit;
grant select on public.data,public.data_with_sessions to obj_reader_role;

commit;