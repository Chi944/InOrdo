-- Terminal proposal-action reconciliation assertions. Requires the migrations
-- and deterministic demo seed. Every mutation rolls back.

begin;

set local role service_role;
select pg_catalog.set_config(
  'request.jwt.claim.sub',
  '00000000-0000-4000-8000-000000000102',
  true
);
select pg_catalog.set_config(
  'request.jwt.claims',
  '{"role":"service_role","sub":"00000000-0000-4000-8000-000000000102","is_anonymous":false}',
  true
);

do $$
declare
  trigger_row pg_catalog.pg_trigger%rowtype;
begin
  if to_regprocedure(
       'private.reconcile_superseded_proposal_actions()'
     ) is null then
    raise exception 'superseded-action reconciliation function is missing';
  end if;

  select trigger.* into trigger_row
  from pg_catalog.pg_trigger as trigger
  where trigger.tgrelid = 'public.action_proposals'::regclass
    and trigger.tgname = 'action_proposals_reconcile_superseded_actions'
    and not trigger.tgisinternal;

  if not found
     or not trigger_row.tgdeferrable
     or not trigger_row.tginitdeferred then
    raise exception 'superseded-action reconciliation is not initially deferred';
  end if;

  if not exists (
       select 1
       from pg_catalog.pg_proc as procedure
       where procedure.oid =
         'private.reconcile_superseded_proposal_actions()'::regprocedure
         and procedure.prosecdef
         and procedure.proconfig @> array['search_path=""']::text[]
     ) then
    raise exception 'superseded-action reconciliation execution context is unsafe';
  end if;

  if has_function_privilege(
       'anon',
       'private.reconcile_superseded_proposal_actions()',
       'EXECUTE'
     )
     or has_function_privilege(
       'authenticated',
       'private.reconcile_superseded_proposal_actions()',
       'EXECUTE'
     )
     or has_function_privilege(
       'service_role',
       'private.reconcile_superseded_proposal_actions()',
       'EXECUTE'
     ) then
    raise exception 'superseded-action reconciliation is directly executable';
  end if;
end;
$$;

insert into public.source_documents (
  id, workspace_id, project_id, title, source_kind, raw_text, captured_by
) values (
  'a1140000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  'Superseded action verifier source',
  'manual_note',
  'Verify terminal proposal-action reconciliation.',
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
  pg_catalog.to_jsonb('Superseded action verifier'::text),
  'needs_confirmation',
  0.95,
  '00000000-0000-4000-8000-000000000102'
);

insert into public.action_proposals (
  id, workspace_id, project_id, change_event_id, state,
  title, rationale, created_by
) values
  (
    'a1140000-0000-4000-8000-000000000010',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'a1140000-0000-4000-8000-000000000002',
    'ready',
    'Terminal action reconciliation',
    'Stale only still-live child actions.',
    '00000000-0000-4000-8000-000000000102'
  ),
  (
    'a1140000-0000-4000-8000-000000000020',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'a1140000-0000-4000-8000-000000000002',
    'ready',
    'Temporary supersede reconciliation',
    'A final non-superseded parent must keep its children live.',
    '00000000-0000-4000-8000-000000000102'
  ),
  (
    'a1140000-0000-4000-8000-000000000030',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'a1140000-0000-4000-8000-000000000002',
    'superseded',
    'Unattributed stale shape',
    'System-staled actions do not fabricate a reviewer.',
    '00000000-0000-4000-8000-000000000102'
  );

insert into public.proposal_actions (
  id, workspace_id, project_id, proposal_id, ordinal, action_type, state,
  target_item_id, expected_item_version, payload, rationale,
  reviewed_by, reviewed_at
) values
  (
    'a1140000-0000-4000-8000-000000000011',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'a1140000-0000-4000-8000-000000000010',
    1, 'update_item', 'pending',
    '30000000-0000-4000-8000-000000000002', 1,
    pg_catalog.jsonb_build_object(
      'field_name', 'title', 'proposed_value', 'Pending verifier'
    ),
    'A pending child becomes unattributed stale.',
    null, null
  ),
  (
    'a1140000-0000-4000-8000-000000000012',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'a1140000-0000-4000-8000-000000000010',
    2, 'update_item', 'approved',
    '30000000-0000-4000-8000-000000000003', 1,
    pg_catalog.jsonb_build_object(
      'field_name', 'priority', 'proposed_value', 'critical'
    ),
    'An approved child becomes stale without losing attribution.',
    '00000000-0000-4000-8000-000000000102', now()
  ),
  (
    'a1140000-0000-4000-8000-000000000013',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'a1140000-0000-4000-8000-000000000010',
    3, 'update_item', 'rejected',
    '30000000-0000-4000-8000-000000000004', 1,
    pg_catalog.jsonb_build_object(
      'field_name', 'status', 'proposed_value', 'cancelled'
    ),
    'Rejected history remains terminal.',
    '00000000-0000-4000-8000-000000000102', now()
  ),
  (
    'a1140000-0000-4000-8000-000000000014',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'a1140000-0000-4000-8000-000000000010',
    4, 'update_item', 'applied',
    '30000000-0000-4000-8000-000000000005', 1,
    pg_catalog.jsonb_build_object(
      'field_name', 'description', 'proposed_value', 'Applied verifier'
    ),
    'Applied history remains terminal.',
    '00000000-0000-4000-8000-000000000102', now()
  ),
  (
    'a1140000-0000-4000-8000-000000000021',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'a1140000-0000-4000-8000-000000000020',
    1, 'update_item', 'pending',
    '30000000-0000-4000-8000-000000000006', 1,
    pg_catalog.jsonb_build_object(
      'field_name', 'title', 'proposed_value', 'Temporary verifier'
    ),
    'A temporary supersede must not stale this action.',
    null, null
  ),
  (
    'a1140000-0000-4000-8000-000000000031',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'a1140000-0000-4000-8000-000000000030',
    1, 'update_item', 'stale',
    '30000000-0000-4000-8000-000000000007', 1,
    pg_catalog.jsonb_build_object(
      'field_name', 'title', 'proposed_value', 'System stale verifier'
    ),
    'An unattributed stale state is valid.',
    null, null
  );

do $$
declare
  rejected boolean;
begin
  rejected := false;
  begin
    insert into public.proposal_actions (
      id, workspace_id, project_id, proposal_id, ordinal, action_type, state,
      target_item_id, expected_item_version, payload, rationale,
      reviewed_by, reviewed_at
    ) values (
      'a1140000-0000-4000-8000-000000000032',
      '10000000-0000-4000-8000-000000000001',
      '20000000-0000-4000-8000-000000000001',
      'a1140000-0000-4000-8000-000000000030',
      2, 'update_item', 'stale',
      '30000000-0000-4000-8000-000000000008', 1,
      pg_catalog.jsonb_build_object(
        'field_name', 'title', 'proposed_value', 'One-sided verifier'
      ),
      'One-sided reviewer attribution is invalid.',
      '00000000-0000-4000-8000-000000000102', null
    );
  exception when check_violation then
    rejected := true;
  end;
  if not rejected then
    raise exception 'stale action accepted one-sided reviewer attribution';
  end if;

  rejected := false;
  begin
    insert into public.proposal_actions (
      id, workspace_id, project_id, proposal_id, ordinal, action_type, state,
      target_item_id, expected_item_version, payload, rationale,
      reviewed_by, reviewed_at
    ) values (
      'a1140000-0000-4000-8000-000000000033',
      '10000000-0000-4000-8000-000000000001',
      '20000000-0000-4000-8000-000000000001',
      'a1140000-0000-4000-8000-000000000030',
      3, 'update_item', 'stale',
      '30000000-0000-4000-8000-000000000009', 1,
      pg_catalog.jsonb_build_object(
        'field_name', 'title', 'proposed_value', 'Timestamp-only verifier'
      ),
      'One-sided reviewer timestamp is invalid.',
      null, now()
    );
  exception when check_violation then
    rejected := true;
  end;
  if not rejected then
    raise exception 'stale action accepted one-sided reviewer timestamp';
  end if;
end;
$$;

update public.action_proposals
set state = 'superseded'
where id = 'a1140000-0000-4000-8000-000000000010'::uuid;

-- The deferred trigger must observe final parent state, not an intermediate
-- state produced during an apply transaction.
update public.action_proposals
set state = 'superseded'
where id = 'a1140000-0000-4000-8000-000000000020'::uuid;
update public.action_proposals
set state = 'applied'
where id = 'a1140000-0000-4000-8000-000000000020'::uuid;

set constraints action_proposals_reconcile_superseded_actions immediate;

do $$
begin
  if not exists (
       select 1
       from public.proposal_actions
       where id = 'a1140000-0000-4000-8000-000000000011'::uuid
         and state = 'stale'
         and reviewed_by is null
         and reviewed_at is null
     ) then
    raise exception 'pending action did not become unattributed stale';
  end if;

  if not exists (
       select 1
       from public.proposal_actions
       where id = 'a1140000-0000-4000-8000-000000000012'::uuid
         and state = 'stale'
         and reviewed_by = '00000000-0000-4000-8000-000000000102'::uuid
         and reviewed_at is not null
     ) then
    raise exception 'approved action lost attribution while becoming stale';
  end if;

  if (select state from public.proposal_actions
      where id = 'a1140000-0000-4000-8000-000000000013'::uuid)
       <> 'rejected'::public.proposal_action_state
     or (select state from public.proposal_actions
         where id = 'a1140000-0000-4000-8000-000000000014'::uuid)
       <> 'applied'::public.proposal_action_state then
    raise exception 'terminal rejected/applied action history was rewritten';
  end if;

  if (select state from public.proposal_actions
      where id = 'a1140000-0000-4000-8000-000000000021'::uuid)
       <> 'pending'::public.proposal_action_state then
    raise exception 'temporary supersede incorrectly staled a live action';
  end if;
end;
$$;

set constraints action_proposals_reconcile_superseded_actions deferred;

-- Exercise the real apply path: its item update temporarily supersedes its own
-- parent, but the deferred reconciliation must observe the final applied state.
do $$
declare
  target_version bigint;
  apply_result jsonb;
begin
  select version into strict target_version
  from public.project_items
  where id = '30000000-0000-4000-8000-000000000010'::uuid;

  insert into public.impact_runs (
    id, workspace_id, project_id, change_event_id, state, max_depth,
    started_by, completed_at
  ) values (
    'a1140000-0000-4000-8000-000000000040',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'a1140000-0000-4000-8000-000000000002',
    'completed', 5,
    '00000000-0000-4000-8000-000000000102', now()
  );
  insert into public.action_proposals (
    id, workspace_id, project_id, change_event_id, impact_run_id, state,
    title, rationale, created_by
  ) values (
    'a1140000-0000-4000-8000-000000000041',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'a1140000-0000-4000-8000-000000000002',
    'a1140000-0000-4000-8000-000000000040',
    'ready',
    'Actual apply reconciliation',
    'The final applied parent must win over its temporary superseded state.',
    '00000000-0000-4000-8000-000000000102'
  );
  insert into public.proposal_actions (
    id, workspace_id, project_id, proposal_id, ordinal, action_type,
    target_item_id, expected_item_version, payload, rationale
  ) values (
    'a1140000-0000-4000-8000-000000000042',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'a1140000-0000-4000-8000-000000000041',
    1, 'update_item',
    '30000000-0000-4000-8000-000000000010', target_version,
    pg_catalog.jsonb_build_object(
      'prompt_action_type', 'update_item_field',
      'field_name', 'title',
      'proposed_value', 'Attendee schedule — apply reconciliation verifier',
      'linked_impact_item_id', '30000000-0000-4000-8000-000000000010',
      'confidence', 0.95,
      'requires_human_input', false
    ),
    'Exercise the real apply transaction before forcing deferred constraints.'
  );

  apply_result := public.apply_project_proposal(
    '00000000-0000-4000-8000-000000000102'::uuid,
    '20000000-0000-4000-8000-000000000001'::uuid,
    'a1140000-0000-4000-8000-000000000041'::uuid,
    array['a1140000-0000-4000-8000-000000000042'::uuid],
    '[]'::jsonb,
    'verify-actual-apply-reconciliation-001'
  );
  if apply_result ->> 'status' <> 'succeeded' then
    raise exception 'actual apply reconciliation fixture failed: %', apply_result;
  end if;
end;
$$;

set constraints action_proposals_reconcile_superseded_actions immediate;
set constraints action_proposals_reconcile_superseded_actions deferred;

do $$
begin
  if (select state from public.action_proposals
      where id = 'a1140000-0000-4000-8000-000000000041'::uuid)
       <> 'applied'::public.proposal_state
     or (select state from public.proposal_actions
         where id = 'a1140000-0000-4000-8000-000000000042'::uuid)
       <> 'applied'::public.proposal_action_state then
    raise exception 'actual apply was corrupted by deferred stale reconciliation';
  end if;
end;
$$;

reset role;
rollback;
