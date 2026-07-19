-- Prevent ambiguous proposal action sets and make create receipts canonical.

begin;

-- Keep analysis writers out for the duration of this transactional migration.
-- Without this lock, a transaction could commit an invalid action set after the
-- backfill snapshot but before the integrity trigger is installed.
lock table public.proposal_actions in share row exclusive mode;

-- Existing active proposals cannot be repaired without regenerating reviewer
-- intent. Supersede only active invalid proposals; immutable applied/rejected
-- history remains untouched.
with duplicate_update_proposals as (
  select
    action.workspace_id,
    action.project_id,
    action.proposal_id
  from public.proposal_actions as action
  where action.action_type = 'update_item'
  group by
    action.workspace_id,
    action.project_id,
    action.proposal_id,
    action.target_item_id,
    action.payload ->> 'field_name'
  having pg_catalog.count(*) > 1
),
date_candidates as (
  select
    action.workspace_id,
    action.project_id,
    action.proposal_id,
    action.target_item_id,
    action.payload ->> 'field_name' as field_name,
    action.payload ->> 'proposed_value' as proposed_value
  from public.proposal_actions as action
  where action.action_type = 'update_item'
    and action.payload ->> 'field_name' in ('start_date', 'due_date')
    and pg_catalog.jsonb_typeof(action.payload -> 'proposed_value') = 'string'
    and action.payload ->> 'proposed_value'
      ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
),
contradictory_date_proposals as (
  select
    candidate.workspace_id,
    candidate.project_id,
    candidate.proposal_id
  from date_candidates as candidate
  group by
    candidate.workspace_id,
    candidate.project_id,
    candidate.proposal_id,
    candidate.target_item_id
  having pg_catalog.max(candidate.proposed_value)
           filter (where candidate.field_name = 'start_date')
       > pg_catalog.min(candidate.proposed_value)
           filter (where candidate.field_name = 'due_date')
),
invalid_proposals as (
  select
    duplicate.workspace_id,
    duplicate.project_id,
    duplicate.proposal_id
  from duplicate_update_proposals as duplicate
  union
  select
    contradiction.workspace_id,
    contradiction.project_id,
    contradiction.proposal_id
  from contradictory_date_proposals as contradiction
)
update public.action_proposals as proposal
set state = 'superseded'
from invalid_proposals as invalid
where proposal.workspace_id = invalid.workspace_id
  and proposal.project_id = invalid.project_id
  and proposal.id = invalid.proposal_id
  and proposal.state in (
    'draft',
    'ready',
    'partially_approved',
    'approved'
  );

create or replace function private.guard_proposal_action_integrity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  proposed_start_date date;
  proposed_due_date date;
begin
  if new.action_type <> 'update_item' then
    return new;
  end if;

  -- Serialize action-set validation per proposal so concurrent inserts cannot
  -- each validate against a stale snapshot and persist an invalid pair.
  perform 1
  from public.action_proposals as proposal
  where proposal.workspace_id = new.workspace_id
    and proposal.project_id = new.project_id
    and proposal.id = new.proposal_id
  for update;

  if exists (
    select 1
    from public.proposal_actions as action
    where action.workspace_id = new.workspace_id
      and action.project_id = new.project_id
      and action.proposal_id = new.proposal_id
      and action.action_type = 'update_item'
      and action.target_item_id is not distinct from new.target_item_id
      and action.payload ->> 'field_name'
        is not distinct from new.payload ->> 'field_name'
      and action.id is distinct from new.id
  ) then
    raise exception
      'proposal contains duplicate updates for target % field %',
      new.target_item_id,
      new.payload ->> 'field_name'
      using errcode = '23514';
  end if;

  select
    pg_catalog.max(
      case
        when candidate.field_name = 'start_date'
          and candidate.value_type = 'string'
          then candidate.proposed_value::date
        else null
      end
    ),
    pg_catalog.min(
      case
        when candidate.field_name = 'due_date'
          and candidate.value_type = 'string'
          then candidate.proposed_value::date
        else null
      end
    )
  into proposed_start_date, proposed_due_date
  from (
    select
      action.payload ->> 'field_name' as field_name,
      action.payload ->> 'proposed_value' as proposed_value,
      pg_catalog.jsonb_typeof(
        action.payload -> 'proposed_value'
      ) as value_type
    from public.proposal_actions as action
    where action.workspace_id = new.workspace_id
      and action.project_id = new.project_id
      and action.proposal_id = new.proposal_id
      and action.action_type = 'update_item'
      and action.target_item_id is not distinct from new.target_item_id
      and action.id is distinct from new.id

    union all

    select
      new.payload ->> 'field_name',
      new.payload ->> 'proposed_value',
      pg_catalog.jsonb_typeof(new.payload -> 'proposed_value')
  ) as candidate;

  if proposed_start_date is not null
     and proposed_due_date is not null
     and proposed_start_date > proposed_due_date then
    raise exception
      'proposal start date % is after due date % for target %',
      proposed_start_date,
      proposed_due_date,
      new.target_item_id
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function private.guard_proposal_action_integrity()
from public, anon, authenticated, service_role;

drop trigger if exists proposal_actions_guard_integrity
on public.proposal_actions;
create trigger proposal_actions_guard_integrity
before insert or update of action_type, target_item_id, payload
on public.proposal_actions
for each row
execute function private.guard_proposal_action_integrity();

create or replace function private.enrich_create_item_receipt()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  committed_item public.project_items%rowtype;
begin
  if new.state <> 'succeeded'
     or new.proposal_action_id is null
     or new.item_id is null
     or not exists (
       select 1
       from public.proposal_actions as action
       where action.workspace_id = new.workspace_id
         and action.project_id = new.project_id
         and action.id = new.proposal_action_id
         and action.action_type = 'create_item'
     ) then
    return new;
  end if;

  select item.*
  into committed_item
  from public.project_items as item
  where item.workspace_id = new.workspace_id
    and item.project_id = new.project_id
    and item.id = new.item_id;

  if not found then
    raise exception
      'created project item % is unavailable for operation receipt',
      new.item_id
      using errcode = '23503';
  end if;

  new.after_state := pg_catalog.jsonb_build_object(
    'receipt_version', 2,
    'item_id', committed_item.id,
    'item_key', committed_item.item_key,
    'version', committed_item.version,
    'create_payload', pg_catalog.jsonb_build_object(
      'item_type', committed_item.item_type,
      'title', committed_item.title,
      'description', committed_item.description,
      'status', committed_item.status,
      'priority', committed_item.priority,
      'owner_id', committed_item.owner_id,
      'start_date', committed_item.start_date,
      'due_date', committed_item.due_date
    )
  );

  return new;
end;
$$;

revoke all on function private.enrich_create_item_receipt()
from public, anon, authenticated, service_role;

drop trigger if exists operation_items_enrich_create_receipt
on public.operation_items;
create trigger operation_items_enrich_create_receipt
before insert on public.operation_items
for each row
execute function private.enrich_create_item_receipt();

commit;
