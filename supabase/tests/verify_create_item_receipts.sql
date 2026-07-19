-- Successful create-item receipts must be canonical snapshots of the committed
-- project item, not copies of proposal payload data. All mutations roll back.

begin;

set local role service_role;
select pg_catalog.set_config(
  'request.jwt.claim.sub',
  '00000000-0000-4000-8000-000000000102',
  true
);
select pg_catalog.set_config(
  'request.jwt.claims',
  '{"role":"service_role","sub":"00000000-0000-4000-8000-000000000102"}',
  true
);

insert into public.source_documents (
  id, workspace_id, project_id, title, source_kind, raw_text, captured_by
) values (
  'a1140000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  'Create receipt verifier source',
  'manual_note',
  'Verify canonical create-item operation receipts.',
  '00000000-0000-4000-8000-000000000102'
);

insert into public.change_events (
  id, workspace_id, project_id, source_document_id, subject_item_id,
  field_name, previous_value, proposed_value, state, confidence, created_by
) values (
  'a1140000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  'a1140000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000001',
  'title',
  pg_catalog.to_jsonb('Regional Climate Action Summit 2026'::text),
  pg_catalog.to_jsonb('Create receipt verifier'::text),
  'needs_confirmation',
  0.95,
  '00000000-0000-4000-8000-000000000102'
);

insert into public.action_proposals (
  id, workspace_id, project_id, change_event_id, state,
  title, rationale, created_by
) values (
  'a1140000-0000-4000-8000-000000000010',
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  'a1140000-0000-4000-8000-000000000002',
  'draft',
  'Create receipt verifier proposal',
  'Verify receipt values are loaded from the committed row.',
  '00000000-0000-4000-8000-000000000102'
);

-- Deliberately keep the proposal payload different from the committed item.
insert into public.proposal_actions (
  id, workspace_id, project_id, proposal_id, ordinal, action_type,
  target_item_id, expected_item_version, payload, rationale
) values (
  'a1140000-0000-4000-8000-000000000011',
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  'a1140000-0000-4000-8000-000000000010',
  1, 'create_item', null, null,
  pg_catalog.jsonb_build_object(
    'item_type', 'risk',
    'title', 'Untrusted proposal title',
    'description', null,
    'status', 'not_started',
    'priority', 'low',
    'owner_id', null,
    'start_date', null,
    'due_date', null
  ),
  'Only the committed item may populate the successful receipt.'
);

insert into public.project_items (
  id, workspace_id, project_id, item_key, item_type, title, description,
  status, priority, owner_id, start_date, due_date, metadata, created_by
) values (
  'a1140000-0000-4000-8000-000000000080',
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  'TSK-99',
  'task',
  'Canonical committed task',
  'Canonical database value.',
  'in_progress',
  'critical',
  '00000000-0000-4000-8000-000000000102',
  '2026-09-03',
  '2026-09-07',
  '{}'::jsonb,
  '00000000-0000-4000-8000-000000000102'
);

insert into public.operation_logs (
  id, workspace_id, project_id, operation_type, state, idempotency_key,
  request_hash, proposal_id, initiated_by, result_metadata, reversible
) values (
  'a1140000-0000-4000-8000-000000000090',
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  'apply_proposal', 'succeeded', 'verify-create-receipt-001',
  pg_catalog.repeat('a', 64),
  'a1140000-0000-4000-8000-000000000010',
  '00000000-0000-4000-8000-000000000102',
  '{}'::jsonb,
  false
);

insert into public.operation_items (
  id, workspace_id, project_id, operation_id, proposal_action_id, item_id,
  ordinal, state, after_state, resulting_item_version, reversible
) values (
  'a1140000-0000-4000-8000-000000000091',
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  'a1140000-0000-4000-8000-000000000090',
  'a1140000-0000-4000-8000-000000000011',
  'a1140000-0000-4000-8000-000000000080',
  1, 'succeeded',
  pg_catalog.jsonb_build_object('untrusted', 'caller supplied'),
  1,
  false
);

do $$
declare
  actual_receipt jsonb;
  expected_receipt jsonb;
begin
  select operation_item.after_state
  into actual_receipt
  from public.operation_items as operation_item
  where operation_item.id = 'a1140000-0000-4000-8000-000000000091';

  expected_receipt := pg_catalog.jsonb_build_object(
    'receipt_version', 2,
    'item_id', 'a1140000-0000-4000-8000-000000000080'::uuid,
    'item_key', 'TSK-99',
    'version', 1,
    'create_payload', pg_catalog.jsonb_build_object(
      'item_type', 'task',
      'title', 'Canonical committed task',
      'description', 'Canonical database value.',
      'status', 'in_progress',
      'priority', 'critical',
      'owner_id', '00000000-0000-4000-8000-000000000102'::uuid,
      'start_date', '2026-09-03'::date,
      'due_date', '2026-09-07'::date
    )
  );

  if actual_receipt is distinct from expected_receipt then
    raise exception 'create receipt was not canonical: expected %, got %',
      expected_receipt, actual_receipt;
  end if;

  if to_regprocedure('private.enrich_create_item_receipt()') is null then
    raise exception 'create-item receipt trigger function is missing';
  end if;

  if not exists (
       select 1
       from pg_catalog.pg_proc as procedure
       where procedure.oid =
         'private.enrich_create_item_receipt()'::regprocedure
         and procedure.prosecdef
         and procedure.proconfig @> array['search_path=""']::text[]
     ) then
    raise exception 'create-item receipt helper execution context is unsafe';
  end if;

  if not exists (
       select 1
       from pg_catalog.pg_trigger as trigger
       where trigger.tgrelid = 'public.operation_items'::regclass
         and trigger.tgname = 'operation_items_enrich_create_receipt'
         and not trigger.tgisinternal
     ) then
    raise exception 'create-item receipt trigger is missing';
  end if;

  if has_function_privilege(
       'anon', 'private.enrich_create_item_receipt()', 'EXECUTE'
     )
     or has_function_privilege(
       'authenticated', 'private.enrich_create_item_receipt()', 'EXECUTE'
     )
     or has_function_privilege(
       'service_role', 'private.enrich_create_item_receipt()', 'EXECUTE'
     ) then
    raise exception 'create-item receipt helper is directly executable';
  end if;
end;
$$;

rollback;
