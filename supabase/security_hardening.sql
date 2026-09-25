-- ConsultaMed security hardening baseline
-- REVIEW BEFORE APPLYING IN PRODUCTION.
--
-- This file is intentionally stored outside an automatic migration chain so a
-- normal git pull cannot unexpectedly change production database permissions.
-- Apply manually in the Supabase SQL editor only after confirming table/column
-- names match the active schema.

begin;

-- Helper used by policies. SECURITY DEFINER avoids recursive RLS checks on
-- profiles while exposing only the role of the currently authenticated user.
create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role::text from public.profiles where id = auth.uid()
$$;

revoke all on function public.current_app_role() from public;
grant execute on function public.current_app_role() to authenticated;

alter table if exists public.profiles enable row level security;
alter table if exists public.patients enable row level security;
alter table if exists public.appointments enable row level security;
alter table if exists public.specialties enable row level security;
alter table if exists public.locations enable row level security;
alter table if exists public.rooms enable row level security;
alter table if exists public.doctor_shifts enable row level security;

-- PROFILES
drop policy if exists "profiles_authenticated_read" on public.profiles;
create policy "profiles_authenticated_read"
on public.profiles for select
to authenticated
using (true);

drop policy if exists "profiles_secretary_insert_doctor" on public.profiles;
create policy "profiles_secretary_insert_doctor"
on public.profiles for insert
to authenticated
with check (
  public.current_app_role() = 'secretaria'
  and role::text = 'medico'
);

drop policy if exists "profiles_secretary_update" on public.profiles;
create policy "profiles_secretary_update"
on public.profiles for update
to authenticated
using (public.current_app_role() = 'secretaria')
with check (public.current_app_role() = 'secretaria');

drop policy if exists "profiles_secretary_delete" on public.profiles;
create policy "profiles_secretary_delete"
on public.profiles for delete
to authenticated
using (public.current_app_role() = 'secretaria');

-- PATIENTS
drop policy if exists "patients_staff_read" on public.patients;
create policy "patients_staff_read"
on public.patients for select
to authenticated
using (
  public.current_app_role() in ('secretaria', 'secretaria_pacientes')
  or (
    public.current_app_role() = 'medico'
    and exists (
      select 1
      from public.appointments a
      where a.patient_id = patients.id
        and a.doctor_id = auth.uid()
    )
  )
);

drop policy if exists "patients_staff_insert" on public.patients;
create policy "patients_staff_insert"
on public.patients for insert
to authenticated
with check (public.current_app_role() in ('secretaria', 'secretaria_pacientes'));

drop policy if exists "patients_secretary_update" on public.patients;
create policy "patients_secretary_update"
on public.patients for update
to authenticated
using (public.current_app_role() = 'secretaria')
with check (public.current_app_role() = 'secretaria');

drop policy if exists "patients_secretary_delete" on public.patients;
create policy "patients_secretary_delete"
on public.patients for delete
to authenticated
using (public.current_app_role() = 'secretaria');

-- APPOINTMENTS
drop policy if exists "appointments_role_read" on public.appointments;
create policy "appointments_role_read"
on public.appointments for select
to authenticated
using (
  public.current_app_role() in ('secretaria', 'secretaria_pacientes')
  or (public.current_app_role() = 'medico' and doctor_id = auth.uid())
);

drop policy if exists "appointments_staff_insert" on public.appointments;
create policy "appointments_staff_insert"
on public.appointments for insert
to authenticated
with check (public.current_app_role() in ('secretaria', 'secretaria_pacientes'));

drop policy if exists "appointments_secretary_or_doctor_update" on public.appointments;
create policy "appointments_secretary_or_doctor_update"
on public.appointments for update
to authenticated
using (
  public.current_app_role() = 'secretaria'
  or (public.current_app_role() = 'medico' and doctor_id = auth.uid())
)
with check (
  public.current_app_role() = 'secretaria'
  or (public.current_app_role() = 'medico' and doctor_id = auth.uid())
);

drop policy if exists "appointments_secretary_delete" on public.appointments;
create policy "appointments_secretary_delete"
on public.appointments for delete
to authenticated
using (public.current_app_role() = 'secretaria');

-- REFERENCE / SCHEDULING TABLES
drop policy if exists "specialties_authenticated_read" on public.specialties;
create policy "specialties_authenticated_read"
on public.specialties for select to authenticated using (true);

drop policy if exists "locations_authenticated_read" on public.locations;
create policy "locations_authenticated_read"
on public.locations for select to authenticated using (true);

drop policy if exists "rooms_authenticated_read" on public.rooms;
create policy "rooms_authenticated_read"
on public.rooms for select to authenticated using (true);

drop policy if exists "shifts_authenticated_read" on public.doctor_shifts;
create policy "shifts_authenticated_read"
on public.doctor_shifts for select to authenticated using (true);

drop policy if exists "specialties_secretary_write" on public.specialties;
create policy "specialties_secretary_write"
on public.specialties for all
to authenticated
using (public.current_app_role() = 'secretaria')
with check (public.current_app_role() = 'secretaria');

drop policy if exists "locations_secretary_write" on public.locations;
create policy "locations_secretary_write"
on public.locations for all
to authenticated
using (public.current_app_role() = 'secretaria')
with check (public.current_app_role() = 'secretaria');

drop policy if exists "rooms_secretary_write" on public.rooms;
create policy "rooms_secretary_write"
on public.rooms for all
to authenticated
using (public.current_app_role() = 'secretaria')
with check (public.current_app_role() = 'secretaria');

drop policy if exists "shifts_secretary_write" on public.doctor_shifts;
create policy "shifts_secretary_write"
on public.doctor_shifts for all
to authenticated
using (public.current_app_role() = 'secretaria')
with check (public.current_app_role() = 'secretaria');

commit;
