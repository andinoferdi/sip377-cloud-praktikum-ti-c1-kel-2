-- ============================================================
-- SIPOS RBAC Bootstrap SQL
-- Purpose:
-- 1) Build RBAC schema (DDL)
-- 2) Seed RBAC baseline data (workspace, roles, permissions, role map)
-- Notes:
-- - Staff user bootstrap is handled by `npm run db:seed`
-- - Script is idempotent and safe to run multiple times
-- ============================================================

-- === Section A: Schema bootstrap (DDL) ===
create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'role_code') then
    create type public.role_code as enum ('admin','fnb','fnb_manager','host');
  end if;
  if not exists (select 1 from pg_type where typname = 'permission_action') then
    create type public.permission_action as enum ('create','read','update','delete','approve','print','export');
  end if;
end $$;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.staff_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text not null,
  password_hash text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rbac_roles (
  id uuid primary key default gen_random_uuid(),
  code public.role_code not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.rbac_permissions (
  id uuid primary key default gen_random_uuid(),
  module text not null,
  action public.permission_action not null,
  permission_key text generated always as (module || ':' || action::text) stored,
  description text,
  created_at timestamptz not null default now(),
  unique(module, action),
  unique(permission_key)
);

create table if not exists public.rbac_role_permissions (
  role_id uuid not null references public.rbac_roles(id) on delete cascade,
  permission_id uuid not null references public.rbac_permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create table if not exists public.rbac_user_roles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.staff_users(id) on delete cascade,
  role_id uuid not null references public.rbac_roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(workspace_id, user_id, role_id)
);

create index if not exists idx_rbac_user_roles_workspace_user
on public.rbac_user_roles(workspace_id, user_id);

-- === Section B: Baseline RBAC data (DML) ===
insert into public.workspaces (code, name)
values ('main', 'Main Workspace')
on conflict (code) do nothing;

insert into public.rbac_roles (code, name, description) values
('admin','Admin','Akses penuh'),
('fnb','FnB','Operasional sales tanpa approval'),
('fnb_manager','FnB Manager','Sales, approval, purchase, stock management'),
('host','Host','Operasional dashboard dan create sales')
on conflict (code) do nothing;

with permission_catalog(module, action, description) as (
  values
  ('dashboard_pos','read','Akses dashboard operasional POS'),
  ('sales','create','Buat transaksi sale'),
  ('sales','read','Lihat transaksi sale'),
  ('sales','update','Ubah transaksi sale'),
  ('sales','delete','Hapus transaksi sale'),
  ('sales','print','Print struk sale'),
  ('sales','export','Export data sale'),
  ('sales_approval','read','Lihat antrian approval sale'),
  ('sales_approval','approve','Approve sale'),
  ('purchase','create','Buat purchase'),
  ('purchase','read','Lihat purchase'),
  ('purchase','update','Ubah purchase'),
  ('purchase','delete','Hapus purchase'),
  ('purchase','approve','Approve purchase'),
  ('purchase','print','Print dokumen purchase'),
  ('purchase','export','Export data purchase'),
  ('stock_management','create','Buat stock movement'),
  ('stock_management','read','Lihat stock movement'),
  ('stock_management','update','Ubah stock movement'),
  ('stock_management','delete','Hapus stock movement'),
  ('stock_management','export','Export stock movement'),
  ('inventory','create','Buat item inventory'),
  ('inventory','read','Lihat inventory'),
  ('inventory','update','Ubah inventory'),
  ('inventory','delete','Hapus inventory'),
  ('inventory','export','Export inventory'),
  ('category','create','Buat kategori'),
  ('category','read','Lihat kategori'),
  ('category','update','Ubah kategori'),
  ('category','delete','Hapus kategori'),
  ('category','export','Export kategori'),
  ('reports','read','Lihat laporan POS'),
  ('reports','print','Print laporan POS'),
  ('reports','export','Export laporan POS'),
  ('user_role','create','Buat user/role'),
  ('user_role','read','Lihat user/role'),
  ('user_role','update','Ubah user/role'),
  ('user_role','delete','Hapus user/role'),
  ('settings','create','Buat setting POS'),
  ('settings','read','Lihat setting POS'),
  ('settings','update','Ubah setting POS'),
  ('settings','delete','Hapus setting POS'),
  ('settings','export','Export setting POS')
)
insert into public.rbac_permissions(module, action, description)
select module, action::public.permission_action, description
from permission_catalog
on conflict (module, action) do nothing;

with role_permission_map(role_code, module, action) as (
  values
  ('admin','dashboard_pos','read'),
  ('admin','sales','create'),
  ('admin','sales','read'),
  ('admin','sales','update'),
  ('admin','sales','delete'),
  ('admin','sales','print'),
  ('admin','sales','export'),
  ('admin','sales_approval','read'),
  ('admin','sales_approval','approve'),
  ('admin','purchase','create'),
  ('admin','purchase','read'),
  ('admin','purchase','update'),
  ('admin','purchase','delete'),
  ('admin','purchase','approve'),
  ('admin','purchase','print'),
  ('admin','purchase','export'),
  ('admin','stock_management','create'),
  ('admin','stock_management','read'),
  ('admin','stock_management','update'),
  ('admin','stock_management','delete'),
  ('admin','stock_management','export'),
  ('admin','inventory','create'),
  ('admin','inventory','read'),
  ('admin','inventory','update'),
  ('admin','inventory','delete'),
  ('admin','inventory','export'),
  ('admin','category','create'),
  ('admin','category','read'),
  ('admin','category','update'),
  ('admin','category','delete'),
  ('admin','category','export'),
  ('admin','reports','read'),
  ('admin','reports','print'),
  ('admin','reports','export'),
  ('admin','user_role','create'),
  ('admin','user_role','read'),
  ('admin','user_role','update'),
  ('admin','user_role','delete'),
  ('admin','settings','create'),
  ('admin','settings','read'),
  ('admin','settings','update'),
  ('admin','settings','delete'),
  ('admin','settings','export'),

  ('fnb','dashboard_pos','read'),
  ('fnb','sales','create'),
  ('fnb','sales','read'),
  ('fnb','sales','print'),

  ('fnb_manager','dashboard_pos','read'),
  ('fnb_manager','sales','create'),
  ('fnb_manager','sales','read'),
  ('fnb_manager','sales','update'),
  ('fnb_manager','sales','delete'),
  ('fnb_manager','sales','print'),
  ('fnb_manager','sales','export'),
  ('fnb_manager','sales_approval','read'),
  ('fnb_manager','sales_approval','approve'),
  ('fnb_manager','purchase','create'),
  ('fnb_manager','purchase','read'),
  ('fnb_manager','purchase','update'),
  ('fnb_manager','purchase','delete'),
  ('fnb_manager','purchase','approve'),
  ('fnb_manager','purchase','print'),
  ('fnb_manager','purchase','export'),
  ('fnb_manager','stock_management','create'),
  ('fnb_manager','stock_management','read'),
  ('fnb_manager','stock_management','update'),
  ('fnb_manager','stock_management','delete'),
  ('fnb_manager','stock_management','export'),
  ('fnb_manager','inventory','read'),
  ('fnb_manager','category','read'),
  ('fnb_manager','reports','read'),
  ('fnb_manager','reports','print'),
  ('fnb_manager','reports','export'),

  ('host','dashboard_pos','read'),
  ('host','sales','create'),
  ('host','sales','read'),
  ('host','sales','print')
)
insert into public.rbac_role_permissions(role_id, permission_id)
select r.id, p.id
from role_permission_map rpm
join public.rbac_roles r on r.code = rpm.role_code::public.role_code
join public.rbac_permissions p
  on p.module = rpm.module
 and p.action = rpm.action::public.permission_action
on conflict (role_id, permission_id) do nothing;

-- === Section C: Cleanup stale mappings for locked RBAC policy ===
delete from public.rbac_role_permissions rrp
using public.rbac_roles rr, public.rbac_permissions rp
where rrp.role_id = rr.id
  and rrp.permission_id = rp.id
  and (
    (rr.code = 'fnb'::public.role_code and rp.module = 'sales' and rp.action = 'update'::public.permission_action)
    or (rr.code = 'fnb_manager'::public.role_code and rp.module = 'inventory' and rp.action = 'export'::public.permission_action)
    or (rr.code = 'fnb_manager'::public.role_code and rp.module = 'category' and rp.action = 'export'::public.permission_action)
  );
