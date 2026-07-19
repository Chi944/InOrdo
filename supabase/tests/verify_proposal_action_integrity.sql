-- Proposal-action set integrity assertions. Requires the deterministic demo seed.
-- All fixture mutations roll back.

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
  'a1130000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  'Approval integrity verifier source',
  'manual_note',
  'Verify proposal action set integrity.',
  '00000000-0000-4000-8000-000000000102'
);

insert into public.change_events (
  id, workspace_id, project_id, source_document_id, subject_item_id,
  field_name, previous_value, proposed_value, state, confidence, created_by
) values (
  'a1130000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  'a1130000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000001',
  'title',
  pg_catalog.to_jsonb('Regional Climate Action Summit 2026'::text),
  pg_catalog.to_jsonb('Approval integrity verifier'::text),
  'needs_confirmation',
  0.95,
  '00000000-0000-4000-8000-000000000102'
);

insert into public.action_proposals (
  id, workspace_id, project_id, change_event_id, state,
  title, rationale, created_by
) values
  (
    'a1130000-0000-4000-8000-000000000010',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'a1130000-0000-4000-8000-000000000002',
    'draft', 'Duplicate field verifier',
    'Reject duplicate updates to one target field.',
    '00000000-0000-4000-8000-000000000102'
  ),
  (
    'a1130000-0000-4000-8000-000000000020',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'a1130000-0000-4000-8000-000000000002',
    'draft', 'Start-first date verifier',
    'Reject a due date before an already proposed start date.',
    '00000000-0000-4000-8000-000000000102'
  ),
  (
    'a1130000-0000-4000-8000-000000000030',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'a1130000-0000-4000-8000-000000000002',
    'draft', 'Due-first date verifier',
    'Reject a start date after an already proposed due date.',
    '00000000-0000-4000-8000-000000000102'
  ),
  (
    'a1130000-0000-4000-8000-000000000040',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'a1130000-0000-4000-8000-000000000002',
    'draft', 'Valid date verifier',
    'Allow an ordered start and due date pair.',
    '00000000-0000-4000-8000-000000000102'
  ),
  (
    'a1130000-0000-4000-8000-000000000050',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'a1130000-0000-4000-8000-000000000002',
    'draft', 'Nullable date verifier',
    'Allow an explicitly null date candidate.',
    '00000000-0000-4000-8000-000000000102'
  ),
  (
    'a1130000-0000-4000-8000-000000000060',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'a1130000-0000-4000-8000-000000000002',
    'draft', 'Different target verifier',
    'Keep date candidates for different targets independent.',
    '00000000-0000-4000-8000-000000000102'
  );

insert into public.proposal_actions (
  id, workspace_id, project_id, proposal_id, ordinal, action_type,
  target_item_id, payload, rationale
) values (
  'a1130000-0000-4000-8000-000000000011',
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  'a1130000-0000-4000-8000-000000000010', 1, 'update_item',
  '30000000-0000-4000-8000-000000000001',
  pg_catalog.jsonb_build_object(
    'field_name', 'title', 'proposed_value', 'First title'
  ),
  'The first update to this field is valid.'
);

do $$
declare
  rejected boolean := false;
begin
  begin
    insert into public.proposal_actions (
      id, workspace_id, project_id, proposal_id, ordinal, action_type,
      target_item_id, payload, rationale
    ) values (
      'a1130000-0000-4000-8000-000000000012',
      '10000000-0000-4000-8000-000000000001',
      '20000000-0000-4000-8000-000000000001',
      'a1130000-0000-4000-8000-000000000010', 2, 'update_item',
      '30000000-0000-4000-8000-000000000001',
      pg_catalog.jsonb_build_object(
        'field_name', 'title', 'proposed_value', 'Second title'
      ),
      'A duplicate target-field update must fail.'
    );
  exception when check_violation then
    rejected := true;
  end;

  if not rejected then
    raise exception 'duplicate target-field update was accepted';
  end if;
end;
$$;

insert into public.proposal_actions (
  id, workspace_id, project_id, proposal_id, ordinal, action_type,
  target_item_id, payload, rationale
) values (
  'a1130000-0000-4000-8000-000000000021',
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  'a1130000-0000-4000-8000-000000000020', 1, 'update_item',
  '30000000-0000-4000-8000-000000000001',
  pg_catalog.jsonb_build_object(
    'field_name', 'start_date', 'proposed_value', '2026-10-10'
  ),
  'Propose the start date first.'
);

do $$
declare
  rejected boolean := false;
begin
  begin
    insert into public.proposal_actions (
      id, workspace_id, project_id, proposal_id, ordinal, action_type,
      target_item_id, payload, rationale
    ) values (
      'a1130000-0000-4000-8000-000000000022',
      '10000000-0000-4000-8000-000000000001',
      '20000000-0000-4000-8000-000000000001',
      'a1130000-0000-4000-8000-000000000020', 2, 'update_item',
      '30000000-0000-4000-8000-000000000001',
      pg_catalog.jsonb_build_object(
        'field_name', 'due_date', 'proposed_value', '2026-10-09'
      ),
      'A due date before the proposed start date must fail.'
    );
  exception when check_violation then
    rejected := true;
  end;

  if not rejected then
    raise exception 'start-first contradictory date pair was accepted';
  end if;
end;
$$;

insert into public.proposal_actions (
  id, workspace_id, project_id, proposal_id, ordinal, action_type,
  target_item_id, payload, rationale
) values (
  'a1130000-0000-4000-8000-000000000031',
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  'a1130000-0000-4000-8000-000000000030', 1, 'update_item',
  '30000000-0000-4000-8000-000000000001',
  pg_catalog.jsonb_build_object(
    'field_name', 'due_date', 'proposed_value', '2026-10-09'
  ),
  'Propose the due date first.'
);

do $$
declare
  rejected boolean := false;
begin
  begin
    insert into public.proposal_actions (
      id, workspace_id, project_id, proposal_id, ordinal, action_type,
      target_item_id, payload, rationale
    ) values (
      'a1130000-0000-4000-8000-000000000032',
      '10000000-0000-4000-8000-000000000001',
      '20000000-0000-4000-8000-000000000001',
      'a1130000-0000-4000-8000-000000000030', 2, 'update_item',
      '30000000-0000-4000-8000-000000000001',
      pg_catalog.jsonb_build_object(
        'field_name', 'start_date', 'proposed_value', '2026-10-10'
      ),
      'A start date after the proposed due date must fail.'
    );
  exception when check_violation then
    rejected := true;
  end;

  if not rejected then
    raise exception 'due-first contradictory date pair was accepted';
  end if;
end;
$$;

-- Ordered dates, null candidates, and cross-target dates remain valid.
insert into public.proposal_actions (
  id, workspace_id, project_id, proposal_id, ordinal, action_type,
  target_item_id, payload, rationale
) values
  (
    'a1130000-0000-4000-8000-000000000041',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'a1130000-0000-4000-8000-000000000040', 1, 'update_item',
    '30000000-0000-4000-8000-000000000001',
    pg_catalog.jsonb_build_object(
      'field_name', 'start_date', 'proposed_value', '2026-10-09'
    ),
    'An ordered start date is valid.'
  ),
  (
    'a1130000-0000-4000-8000-000000000042',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'a1130000-0000-4000-8000-000000000040', 2, 'update_item',
    '30000000-0000-4000-8000-000000000001',
    pg_catalog.jsonb_build_object(
      'field_name', 'due_date', 'proposed_value', '2026-10-10'
    ),
    'An ordered due date is valid.'
  ),
  (
    'a1130000-0000-4000-8000-000000000051',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'a1130000-0000-4000-8000-000000000050', 1, 'update_item',
    '30000000-0000-4000-8000-000000000001',
    pg_catalog.jsonb_build_object(
      'field_name', 'start_date', 'proposed_value', null
    ),
    'An explicitly null start date is valid.'
  ),
  (
    'a1130000-0000-4000-8000-000000000052',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'a1130000-0000-4000-8000-000000000050', 2, 'update_item',
    '30000000-0000-4000-8000-000000000001',
    pg_catalog.jsonb_build_object(
      'field_name', 'due_date', 'proposed_value', '2026-01-01'
    ),
    'A due date is valid when the paired start date is null.'
  ),
  (
    'a1130000-0000-4000-8000-000000000061',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'a1130000-0000-4000-8000-000000000060', 1, 'update_item',
    '30000000-0000-4000-8000-000000000001',
    pg_catalog.jsonb_build_object(
      'field_name', 'start_date', 'proposed_value', '2026-12-31'
    ),
    'This start candidate belongs to the first target.'
  ),
  (
    'a1130000-0000-4000-8000-000000000062',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'a1130000-0000-4000-8000-000000000060', 2, 'update_item',
    '30000000-0000-4000-8000-000000000002',
    pg_catalog.jsonb_build_object(
      'field_name', 'due_date', 'proposed_value', '2026-01-01'
    ),
    'This due candidate belongs to a different target.'
  );

do $$
declare
  trigger_definition text;
begin
  if to_regprocedure('private.guard_proposal_action_integrity()') is null then
    raise exception 'proposal action integrity guard function is missing';
  end if;

  if not exists (
       select 1
       from pg_catalog.pg_proc as procedure
       where procedure.oid =
         'private.guard_proposal_action_integrity()'::regprocedure
         and procedure.prosecdef
         and procedure.proconfig @> array['search_path=""']::text[]
     ) then
    raise exception 'proposal action integrity guard execution context is unsafe';
  end if;

  select pg_catalog.pg_get_triggerdef(trigger.oid)
  into trigger_definition
  from pg_catalog.pg_trigger as trigger
  where trigger.tgrelid = 'public.proposal_actions'::regclass
    and trigger.tgname = 'proposal_actions_guard_integrity'
    and not trigger.tgisinternal;

  if trigger_definition is null
     or trigger_definition not ilike '%before insert or update of%'
     or trigger_definition not ilike '%action_type%'
     or trigger_definition not ilike '%target_item_id%'
     or trigger_definition not ilike '%payload%' then
    raise exception 'proposal action integrity trigger coverage is incomplete';
  end if;

  if has_function_privilege(
       'anon', 'private.guard_proposal_action_integrity()', 'EXECUTE'
     )
     or has_function_privilege(
       'authenticated', 'private.guard_proposal_action_integrity()', 'EXECUTE'
     )
     or has_function_privilege(
       'service_role', 'private.guard_proposal_action_integrity()', 'EXECUTE'
     ) then
    raise exception 'proposal action integrity guard is directly executable';
  end if;
end;
$$;

rollback;
