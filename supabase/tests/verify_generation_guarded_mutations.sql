-- Generation-fenced native project-record mutation assertions. Requires the
-- migrations and deterministic demo seed. Every mutation rolls back.

begin;

do $$
declare
  signature text;
begin
  foreach signature in array array[
    'public.mutate_project_item_create(uuid,bigint,text,jsonb)',
    'public.mutate_project_item_update(uuid,uuid,bigint,bigint,text,jsonb)',
    'public.mutate_project_dependency_create(uuid,bigint,text,jsonb)',
    'public.mutate_project_dependency_remove(uuid,uuid,bigint,text)'
  ] loop
    if pg_catalog.to_regprocedure(signature) is null then
      raise exception 'project mutation RPC is missing: %', signature;
    end if;
    if not exists (
         select 1
         from pg_catalog.pg_proc as procedure
         where procedure.oid = signature::regprocedure
           and procedure.prosecdef
           and procedure.proconfig @> array['search_path=""']::text[]
       ) then
      raise exception 'project mutation RPC has unsafe execution context: %',
        signature;
    end if;
    if not pg_catalog.has_function_privilege(
         'authenticated', signature, 'EXECUTE'
       )
       or pg_catalog.has_function_privilege('anon', signature, 'EXECUTE')
       or pg_catalog.has_function_privilege(
         'service_role', signature, 'EXECUTE'
       ) then
      raise exception 'project mutation RPC privileges are unsafe: %', signature;
    end if;
  end loop;

  if pg_catalog.to_regclass('private.project_mutation_ledger') is null then
    raise exception 'private project mutation ledger is missing';
  end if;
  if not exists (
       select 1
       from pg_catalog.pg_class as relation
       where relation.oid = 'private.project_mutation_ledger'::regclass
         and relation.relrowsecurity
     )
     or not exists (
       select 1
       from pg_catalog.pg_trigger as trigger
       where trigger.tgrelid = 'private.project_mutation_ledger'::regclass
         and trigger.tgname = 'project_mutation_ledger_immutable'
         and not trigger.tgisinternal
     ) then
    raise exception 'project mutation ledger is not RLS-protected and append-only';
  end if;
  if pg_catalog.has_table_privilege(
       'anon', 'private.project_mutation_ledger', 'SELECT'
     )
     or pg_catalog.has_table_privilege(
       'authenticated', 'private.project_mutation_ledger', 'SELECT'
     )
     or pg_catalog.has_table_privilege(
       'service_role', 'private.project_mutation_ledger', 'SELECT'
     ) then
    raise exception 'project mutation ledger is directly readable';
  end if;

  if pg_catalog.has_table_privilege(
       'authenticated', 'public.project_items', 'INSERT'
     )
     or pg_catalog.has_table_privilege(
       'authenticated', 'public.project_items', 'UPDATE'
     )
     or pg_catalog.has_table_privilege(
       'authenticated', 'public.project_items', 'DELETE'
     )
     or pg_catalog.has_table_privilege(
       'authenticated', 'public.item_dependencies', 'INSERT'
     )
     or pg_catalog.has_table_privilege(
       'authenticated', 'public.item_dependencies', 'UPDATE'
     )
     or pg_catalog.has_table_privilege(
       'authenticated', 'public.item_dependencies', 'DELETE'
     ) then
    raise exception 'authenticated direct project-record DML remains granted';
  end if;
end;
$$;

-- Add a second project and item as privileged fixtures for cross-project checks.
set local role service_role;
insert into public.projects (
  id, workspace_id, name, slug, description, status, is_demo, created_by
) values (
  '2a140000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  'Generation guard second project',
  'generation-guard-second-project',
  'Rollback-only cross-project fixture.',
  'active', false,
  '00000000-0000-4000-8000-000000000101'
);
insert into public.project_items (
  id, workspace_id, project_id, item_key, item_type, title, created_by
) values (
  '3a140000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  '2a140000-0000-4000-8000-000000000001',
  'XPR-01', 'task', 'Cross-project mutation fixture',
  '00000000-0000-4000-8000-000000000101'
);
reset role;

-- A member may create a strictly validated item, and exact replay returns the
-- original receipt instead of applying the mutation twice.
set local role authenticated;
select pg_catalog.set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000103","role":"authenticated","is_anonymous":false}',
  true
);

do $$
declare
  first_result jsonb;
  replay_result jsonb;
  conflict_rejected boolean := false;
  duplicate_item_rejected boolean := false;
  direct_dml_rejected boolean := false;
  unsafe_generation_rejected boolean := false;
  scalar_payload_rejected boolean := false;
begin
  first_result := public.mutate_project_item_create(
    '20000000-0000-4000-8000-000000000001'::uuid,
    1,
    'verify-native-create-001',
    pg_catalog.jsonb_build_object(
      'item_key', 'TST-90',
      'item_type', 'task',
      'title', 'Generation guarded item',
      'description', 'Created by the native mutation verifier.',
      'status', 'not_started',
      'priority', 'high',
      'owner_id', '00000000-0000-4000-8000-000000000103',
      'start_date', '2026-08-01',
      'due_date', '2026-08-02',
      'event_date', null
    )
  );
  replay_result := public.mutate_project_item_create(
    '20000000-0000-4000-8000-000000000001'::uuid,
    1,
    'verify-native-create-001',
    pg_catalog.jsonb_build_object(
      'item_key', 'TST-90',
      'item_type', 'task',
      'title', 'Generation guarded item',
      'description', 'Created by the native mutation verifier.',
      'status', 'not_started',
      'priority', 'high',
      'owner_id', '00000000-0000-4000-8000-000000000103',
      'start_date', '2026-08-01',
      'due_date', '2026-08-02',
      'event_date', null
    )
  );

  if first_result ->> 'status' <> 'succeeded'
     or replay_result ->> 'status' <> 'duplicate'
     or first_result -> 'item' ->> 'id' <> replay_result -> 'item' ->> 'id'
     or (select pg_catalog.count(*) from public.project_items
         where item_key = 'TST-90'
           and project_id = '20000000-0000-4000-8000-000000000001'::uuid)
       <> 1 then
    raise exception 'item create replay was not exact: %, %',
      first_result, replay_result;
  end if;
  perform pg_catalog.set_config(
    'inordo.native_created_item_id',
    first_result -> 'item' ->> 'id',
    true
  );

  begin
    perform public.mutate_project_item_create(
      '20000000-0000-4000-8000-000000000001'::uuid,
      1,
      'verify-native-create-001',
      pg_catalog.jsonb_build_object(
        'item_key', 'TST-91',
        'item_type', 'task',
        'title', 'Conflicting idempotency request',
        'description', null,
        'status', 'not_started',
        'priority', 'medium',
        'owner_id', null,
        'start_date', null,
        'due_date', null,
        'event_date', null
      )
    );
  exception when serialization_failure then
    conflict_rejected := true;
  end;
  if not conflict_rejected then
    raise exception 'idempotency key mismatch was accepted';
  end if;

  begin
    perform public.mutate_project_item_create(
      '20000000-0000-4000-8000-000000000001'::uuid,
      1,
      'verify-native-create-duplicate',
      pg_catalog.jsonb_build_object(
        'item_key', 'TST-90',
        'item_type', 'task',
        'title', 'Generation guarded item',
        'description', 'Created by the native mutation verifier.',
        'status', 'not_started',
        'priority', 'high',
        'owner_id', '00000000-0000-4000-8000-000000000103',
        'start_date', '2026-08-01',
        'due_date', '2026-08-02',
        'event_date', null
      )
    );
  exception when unique_violation then
    duplicate_item_rejected := true;
  end;
  if not duplicate_item_rejected then
    raise exception 'duplicate active project item key was accepted';
  end if;

  begin
    update public.project_items
    set title = 'Direct DML must fail'
    where id = (first_result -> 'item' ->> 'id')::uuid;
  exception when insufficient_privilege then
    direct_dml_rejected := true;
  end;
  if not direct_dml_rejected then
    raise exception 'authenticated direct item DML was accepted';
  end if;

  begin
    perform public.mutate_project_item_create(
      '20000000-0000-4000-8000-000000000001'::uuid,
      9007199254740992,
      'verify-native-unsafe-generation',
      pg_catalog.jsonb_build_object(
        'item_key', 'TST-96', 'item_type', 'task', 'title', 'Denied',
        'description', null, 'status', 'not_started', 'priority', 'medium',
        'owner_id', null, 'start_date', null, 'due_date', null,
        'event_date', null
      )
    );
  exception when check_violation then
    unsafe_generation_rejected := true;
  end;
  if not unsafe_generation_rejected then
    raise exception 'unsafe JSON workflow generation was accepted';
  end if;

  begin
    perform public.mutate_project_item_create(
      '20000000-0000-4000-8000-000000000001'::uuid,
      1,
      'verify-native-scalar-create',
      '[]'::jsonb
    );
  exception when check_violation then
    scalar_payload_rejected := true;
  end;
  if not scalar_payload_rejected then
    raise exception 'scalar create payload did not fail as safe validation';
  end if;
end;
$$;

-- An admin may update an item with one optimistic version check. Immutable or
-- cross-field-invalid patches, stale versions, and invalid owners fail closed.
select pg_catalog.set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000102","role":"authenticated","is_anonymous":false}',
  true
);

do $$
declare
  item_id uuid := pg_catalog.current_setting(
    'inordo.native_created_item_id'
  )::uuid;
  update_result jsonb;
  replay_result jsonb;
  stale_rejected boolean := false;
  owner_rejected boolean := false;
  cross_project_rejected boolean := false;
  invalid_shape_rejected boolean := false;
  scalar_patch_rejected boolean := false;
begin
  update_result := public.mutate_project_item_update(
    '20000000-0000-4000-8000-000000000001'::uuid,
    item_id,
    1,
    1,
    'verify-native-update-001',
    pg_catalog.jsonb_build_object(
      'item_key', 'TST-92',
      'item_type', 'event',
      'title', 'Generation guarded event',
      'start_date', '2026-08-03',
      'due_date', '2026-08-03',
      'event_date', '2026-08-03'
    )
  );
  if update_result ->> 'status' <> 'succeeded'
     or update_result -> 'item' ->> 'item_key' <> 'TST-92'
     or update_result -> 'item' ->> 'item_type' <> 'event'
     or (update_result -> 'item' ->> 'version')::bigint <> 2 then
    raise exception 'valid item update failed: %', update_result;
  end if;
  replay_result := public.mutate_project_item_update(
    '20000000-0000-4000-8000-000000000001'::uuid,
    item_id,
    1,
    1,
    'verify-native-update-001',
    pg_catalog.jsonb_build_object(
      'item_key', 'TST-92',
      'item_type', 'event',
      'title', 'Generation guarded event',
      'start_date', '2026-08-03',
      'due_date', '2026-08-03',
      'event_date', '2026-08-03'
    )
  );
  if replay_result ->> 'status' <> 'duplicate'
     or replay_result -> 'item' ->> 'id' <> item_id::text
     or replay_result -> 'item' ->> 'version' <> '2' then
    raise exception 'item update replay was not exact: %', replay_result;
  end if;

  begin
    perform public.mutate_project_item_update(
      '20000000-0000-4000-8000-000000000001'::uuid,
      item_id, 1, 1, 'verify-native-update-stale',
      pg_catalog.jsonb_build_object('title', 'Stale update')
    );
  exception when serialization_failure then
    stale_rejected := true;
  end;
  if not stale_rejected then
    raise exception 'stale item version was accepted';
  end if;

  begin
    perform public.mutate_project_item_update(
      '20000000-0000-4000-8000-000000000001'::uuid,
      item_id, 2, 1, 'verify-native-update-owner',
      pg_catalog.jsonb_build_object(
        'owner_id', 'ffffffff-ffff-4fff-8fff-ffffffffffff'
      )
    );
  exception when foreign_key_violation then
    owner_rejected := true;
  end;
  if not owner_rejected then
    raise exception 'nonmember item owner was accepted';
  end if;

  begin
    perform public.mutate_project_item_update(
      '20000000-0000-4000-8000-000000000001'::uuid,
      '3a140000-0000-4000-8000-000000000001'::uuid,
      1, 1, 'verify-native-update-cross-project',
      pg_catalog.jsonb_build_object('title', 'Cross-project update')
    );
  exception when foreign_key_violation then
    cross_project_rejected := true;
  end;
  if not cross_project_rejected then
    raise exception 'cross-project item update was accepted';
  end if;

  begin
    perform public.mutate_project_item_update(
      '20000000-0000-4000-8000-000000000001'::uuid,
      item_id, 2, 1, 'verify-native-update-shape',
      pg_catalog.jsonb_build_object('item_type', 'task')
    );
  exception when check_violation then
    invalid_shape_rejected := true;
  end;
  if not invalid_shape_rejected then
    raise exception 'non-event item retained an event date';
  end if;

  begin
    perform public.mutate_project_item_update(
      '20000000-0000-4000-8000-000000000001'::uuid,
      item_id, 2, 1, 'verify-native-scalar-update', '"bad"'::jsonb
    );
  exception when check_violation then
    scalar_patch_rejected := true;
  end;
  if not scalar_patch_rejected then
    raise exception 'scalar update patch did not fail as safe validation';
  end if;
end;
$$;

-- A member may add a same-project edge; self, cross-project, and duplicate
-- edges fail safely. An owner may remove it, and exact remove replay is stable.
select pg_catalog.set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000103","role":"authenticated","is_anonymous":false}',
  true
);

do $$
declare
  create_result jsonb;
  replay_result jsonb;
  dependency_id uuid;
  self_rejected boolean := false;
  cross_project_rejected boolean := false;
  duplicate_rejected boolean := false;
  direct_dml_rejected boolean := false;
  empty_rationale_rejected boolean := false;
  long_rationale_rejected boolean := false;
  scalar_payload_rejected boolean := false;
begin
  begin
    perform public.mutate_project_dependency_create(
      '20000000-0000-4000-8000-000000000001'::uuid,
      1,
      'verify-native-scalar-edge',
      'null'::jsonb
    );
  exception when check_violation then
    scalar_payload_rejected := true;
  end;
  if not scalar_payload_rejected then
    raise exception 'scalar dependency payload did not fail as safe validation';
  end if;

  begin
    perform public.mutate_project_dependency_create(
      '20000000-0000-4000-8000-000000000001'::uuid,
      1,
      'verify-native-edge-empty-rationale',
      pg_catalog.jsonb_build_object(
        'from_item_id', '30000000-0000-4000-8000-000000000024',
        'to_item_id', '30000000-0000-4000-8000-000000000003',
        'relationship', 'depends_on',
        'rationale', '   '
      )
    );
  exception when check_violation then
    empty_rationale_rejected := true;
  end;
  if not empty_rationale_rejected then
    raise exception 'blank dependency rationale was accepted';
  end if;

  begin
    perform public.mutate_project_dependency_create(
      '20000000-0000-4000-8000-000000000001'::uuid,
      1,
      'verify-native-edge-long-rationale',
      pg_catalog.jsonb_build_object(
        'from_item_id', '30000000-0000-4000-8000-000000000024',
        'to_item_id', '30000000-0000-4000-8000-000000000004',
        'relationship', 'informs',
        'rationale', pg_catalog.repeat('r', 2001)
      )
    );
  exception when check_violation then
    long_rationale_rejected := true;
  end;
  if not long_rationale_rejected then
    raise exception 'overlong dependency rationale was accepted';
  end if;

  create_result := public.mutate_project_dependency_create(
    '20000000-0000-4000-8000-000000000001'::uuid,
    1,
    'verify-native-edge-001',
    pg_catalog.jsonb_build_object(
      'from_item_id', '30000000-0000-4000-8000-000000000024',
      'to_item_id', '30000000-0000-4000-8000-000000000002',
      'relationship', 'informs',
      'rationale', '  Generation guard verifier edge.  '
    )
  );
  dependency_id := (create_result -> 'dependency' ->> 'id')::uuid;
  if create_result ->> 'status' <> 'succeeded'
     or dependency_id is null
     or create_result -> 'dependency' ->> 'rationale'
       <> 'Generation guard verifier edge.' then
    raise exception 'valid dependency create failed: %', create_result;
  end if;
  replay_result := public.mutate_project_dependency_create(
    '20000000-0000-4000-8000-000000000001'::uuid,
    1,
    'verify-native-edge-001',
    pg_catalog.jsonb_build_object(
      'from_item_id', '30000000-0000-4000-8000-000000000024',
      'to_item_id', '30000000-0000-4000-8000-000000000002',
      'relationship', 'informs',
      'rationale', '  Generation guard verifier edge.  '
    )
  );
  if replay_result ->> 'status' <> 'duplicate'
     or replay_result -> 'dependency' ->> 'id' <> dependency_id::text then
    raise exception 'dependency create replay was not exact: %', replay_result;
  end if;
  perform pg_catalog.set_config(
    'inordo.native_dependency_id', dependency_id::text, true
  );

  begin
    perform public.mutate_project_dependency_create(
      '20000000-0000-4000-8000-000000000001'::uuid,
      1,
      'verify-native-edge-self',
      pg_catalog.jsonb_build_object(
        'from_item_id', '30000000-0000-4000-8000-000000000024',
        'to_item_id', '30000000-0000-4000-8000-000000000024',
        'relationship', 'informs',
        'rationale', null
      )
    );
  exception when check_violation then
    self_rejected := true;
  end;
  if not self_rejected then
    raise exception 'self dependency was accepted';
  end if;

  begin
    perform public.mutate_project_dependency_create(
      '20000000-0000-4000-8000-000000000001'::uuid,
      1,
      'verify-native-edge-cross-project',
      pg_catalog.jsonb_build_object(
        'from_item_id', '30000000-0000-4000-8000-000000000024',
        'to_item_id', '3a140000-0000-4000-8000-000000000001',
        'relationship', 'informs',
        'rationale', null
      )
    );
  exception when foreign_key_violation then
    cross_project_rejected := true;
  end;
  if not cross_project_rejected then
    raise exception 'cross-project dependency was accepted';
  end if;

  begin
    perform public.mutate_project_dependency_create(
      '20000000-0000-4000-8000-000000000001'::uuid,
      1,
      'verify-native-edge-duplicate',
      pg_catalog.jsonb_build_object(
        'from_item_id', '30000000-0000-4000-8000-000000000024',
        'to_item_id', '30000000-0000-4000-8000-000000000002',
        'relationship', 'informs',
        'rationale', 'A second idempotency key must not duplicate the edge.'
      )
    );
  exception when unique_violation then
    duplicate_rejected := true;
  end;
  if not duplicate_rejected then
    raise exception 'duplicate dependency was accepted';
  end if;

  begin
    delete from public.item_dependencies where id = dependency_id;
  exception when insufficient_privilege then
    direct_dml_rejected := true;
  end;
  if not direct_dml_rejected then
    raise exception 'authenticated direct dependency DML was accepted';
  end if;
end;
$$;

select pg_catalog.set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000101","role":"authenticated","is_anonymous":false}',
  true
);

do $$
declare
  first_result jsonb;
  replay_result jsonb;
  missing_rejected boolean := false;
begin
  first_result := public.mutate_project_dependency_remove(
    '20000000-0000-4000-8000-000000000001'::uuid,
    pg_catalog.current_setting('inordo.native_dependency_id')::uuid,
    1,
    'verify-native-edge-remove-001'
  );
  replay_result := public.mutate_project_dependency_remove(
    '20000000-0000-4000-8000-000000000001'::uuid,
    pg_catalog.current_setting('inordo.native_dependency_id')::uuid,
    1,
    'verify-native-edge-remove-001'
  );
  if first_result ->> 'status' <> 'succeeded'
     or replay_result ->> 'status' <> 'duplicate'
     or first_result ->> 'dependency_id' <>
       replay_result ->> 'dependency_id' then
    raise exception 'dependency remove replay was not exact: %, %',
      first_result, replay_result;
  end if;

  begin
    perform public.mutate_project_dependency_remove(
      '20000000-0000-4000-8000-000000000001'::uuid,
      pg_catalog.current_setting('inordo.native_dependency_id')::uuid,
      1,
      'verify-native-edge-remove-missing'
    );
  exception when foreign_key_violation then
    missing_rejected := true;
  end;
  if not missing_rejected then
    raise exception 'missing dependency removal was accepted';
  end if;
end;
$$;

-- Viewer, anonymous Auth, and cross-workspace identities cannot call any
-- mutation path even though anonymous Auth uses the authenticated DB role.
select pg_catalog.set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000108","role":"authenticated","is_anonymous":false}',
  true
);
do $$
begin
  perform public.mutate_project_item_create(
    '20000000-0000-4000-8000-000000000001'::uuid,
    1, 'verify-native-viewer-denied',
    pg_catalog.jsonb_build_object(
      'item_key', 'TST-93', 'item_type', 'task', 'title', 'Denied',
      'description', null, 'status', 'not_started', 'priority', 'medium',
      'owner_id', null, 'start_date', null, 'due_date', null,
      'event_date', null
    )
  );
  raise exception 'viewer project mutation was accepted';
exception when insufficient_privilege then null;
end;
$$;

select pg_catalog.set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000103","role":"authenticated","is_anonymous":true}',
  true
);
do $$
begin
  perform public.mutate_project_item_create(
    '20000000-0000-4000-8000-000000000001'::uuid,
    1, 'verify-native-anonymous-denied',
    pg_catalog.jsonb_build_object(
      'item_key', 'TST-94', 'item_type', 'task', 'title', 'Denied',
      'description', null, 'status', 'not_started', 'priority', 'medium',
      'owner_id', null, 'start_date', null, 'due_date', null,
      'event_date', null
    )
  );
  raise exception 'anonymous Auth project mutation was accepted';
exception when insufficient_privilege then null;
end;
$$;

-- Advance the generation as the reset workflow would. An exact successful
-- replay remains stable, while a new stale request consumes no key and can be
-- retried with the corrected generation.
reset role;
update public.projects
set workflow_generation = workflow_generation + 1
where id = '20000000-0000-4000-8000-000000000001'::uuid;

set local role authenticated;
select pg_catalog.set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000103","role":"authenticated","is_anonymous":false}',
  true
);

do $$
declare
  replay_result jsonb;
  corrected_result jsonb;
  stale_rejected boolean := false;
begin
  replay_result := public.mutate_project_item_create(
    '20000000-0000-4000-8000-000000000001'::uuid,
    1,
    'verify-native-create-001',
    pg_catalog.jsonb_build_object(
      'item_key', 'TST-90',
      'item_type', 'task',
      'title', 'Generation guarded item',
      'description', 'Created by the native mutation verifier.',
      'status', 'not_started',
      'priority', 'high',
      'owner_id', '00000000-0000-4000-8000-000000000103',
      'start_date', '2026-08-01',
      'due_date', '2026-08-02',
      'event_date', null
    )
  );
  if replay_result ->> 'status' <> 'duplicate'
     or replay_result -> 'item' ->> 'id' <>
       pg_catalog.current_setting('inordo.native_created_item_id') then
    raise exception 'successful replay failed after generation advance: %',
      replay_result;
  end if;

  begin
    perform public.mutate_project_item_create(
      '20000000-0000-4000-8000-000000000001'::uuid,
      1,
      'verify-native-stale-reuse-001',
      pg_catalog.jsonb_build_object(
        'item_key', 'TST-95', 'item_type', 'task',
        'title', 'Stale generation request', 'description', null,
        'status', 'not_started', 'priority', 'medium', 'owner_id', null,
        'start_date', null, 'due_date', null, 'event_date', null
      )
    );
  exception when serialization_failure then
    stale_rejected := true;
  end;
  if not stale_rejected then
    raise exception 'stale workflow generation was accepted';
  end if;

  corrected_result := public.mutate_project_item_create(
    '20000000-0000-4000-8000-000000000001'::uuid,
    2,
    'verify-native-stale-reuse-001',
    pg_catalog.jsonb_build_object(
      'item_key', 'TST-95', 'item_type', 'task',
      'title', 'Stale generation request', 'description', null,
      'status', 'not_started', 'priority', 'medium', 'owner_id', null,
      'start_date', null, 'due_date', null, 'event_date', null
    )
  );
  if corrected_result ->> 'status' <> 'succeeded'
     or corrected_result ->> 'workflow_generation' <> '2' then
    raise exception 'stale request key was consumed before correction: %',
      corrected_result;
  end if;
end;
$$;

reset role;

-- Even privileged SQL cannot rewrite or delete the successful mutation ledger.
do $$
declare
  update_rejected boolean := false;
  delete_rejected boolean := false;
begin
  begin
    update private.project_mutation_ledger
    set result_payload = '{}'::jsonb
    where idempotency_key = 'verify-native-create-001';
  exception when object_not_in_prerequisite_state then
    update_rejected := true;
  end;
  begin
    delete from private.project_mutation_ledger
    where idempotency_key = 'verify-native-create-001';
  exception when object_not_in_prerequisite_state then
    delete_rejected := true;
  end;
  if not update_rejected or not delete_rejected then
    raise exception 'project mutation ledger was not append-only';
  end if;
end;
$$;

rollback;
