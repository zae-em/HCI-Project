begin;

insert into public.households (id, name, demo_at)
values ('demo', 'Solar household', '2026-11-03 10:02:00+05')
on conflict (id) do update set demo_at = excluded.demo_at;

insert into public.appliances (household_id, id, name, power_kw, minutes) values
  ('demo', 'water-motor', 'Water motor', 1.50, 30),
  ('demo', 'washing-machine', 'Washing machine', 0.90, 60),
  ('demo', 'iron', 'Iron', 1.60, 30),
  ('demo', 'ac', 'AC', 2.20, 60),
  ('demo', 'geyser', 'Geyser', 3.00, 30)
on conflict (household_id, id) do nothing;

insert into public.tariffs values ('demo', 52.00, 11.00)
on conflict (household_id) do nothing;

-- Yesterday's history and today's simulated trace. Rows beyond demo_at
-- are the forecast proxy, with a sample every 15 minutes.
with slots as (
  select ts, extract(hour from ts at time zone 'Asia/Karachi')
    + extract(minute from ts at time zone 'Asia/Karachi') / 60 as hour
  from generate_series(
    '2026-11-02 00:00:00+05'::timestamptz,
    '2026-11-03 23:45:00+05'::timestamptz,
    interval '15 minutes'
  ) as slot(ts)
)
insert into public.readings (household_id, recorded_at, solar_kw, home_load_kw)
select 'demo', ts,
  case when hour > 6.5 and hour < 17.5
    then round(3.8 * power(sin(pi() * (hour - 6.5) / 11), 1.7)::numeric, 2)
    else 0 end,
  0.65 + case
    when hour between 9.75 and 10.25 then 2.0
    when hour between 18.5 and 19.5 then 1.7
    else 0 end
from slots
on conflict (household_id, recorded_at) do update
set solar_kw = excluded.solar_kw, home_load_kw = excluded.home_load_kw;

commit;
