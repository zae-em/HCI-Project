create table public.households (
  id text primary key,
  name text not null,
  demo_at timestamptz not null
);

create table public.appliances (
  household_id text references public.households on delete cascade,
  id text,
  name text not null,
  power_kw numeric not null check (power_kw > 0),
  minutes integer not null check (minutes between 1 and 720),
  primary key (household_id, id)
);

create table public.tariffs (
  household_id text primary key references public.households on delete cascade,
  import_rate numeric not null check (import_rate > 0),
  export_rate numeric not null check (export_rate >= 0)
);

create table public.readings (
  household_id text references public.households on delete cascade,
  recorded_at timestamptz,
  solar_kw numeric not null check (solar_kw >= 0),
  home_load_kw numeric not null check (home_load_kw >= 0),
  grid_import_kw numeric generated always as (greatest(home_load_kw - solar_kw, 0)) stored,
  grid_export_kw numeric generated always as (greatest(solar_kw - home_load_kw, 0)) stored,
  primary key (household_id, recorded_at)
);

alter table public.households enable row level security;
alter table public.appliances enable row level security;
alter table public.tariffs enable row level security;
alter table public.readings enable row level security;

grant select on public.households, public.appliances, public.tariffs, public.readings to anon;
create policy demo_household on public.households for select to anon using (id = 'demo');
create policy demo_appliances on public.appliances for select to anon using (household_id = 'demo');
create policy demo_tariffs on public.tariffs for select to anon using (household_id = 'demo');
create policy demo_readings on public.readings for select to anon using (household_id = 'demo');
