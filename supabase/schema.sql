-- Churches table
create table if not exists churches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  location text,
  denomination text,
  logo_url text,
  primary_color text default '#6B46C1',
  owner_id uuid references auth.users(id),
  auto_archive_days integer default 90,
  approval_required boolean default false,
  created_at timestamptz default now()
);

-- Church members
create table if not exists church_members (
  id uuid primary key default gen_random_uuid(),
  church_id uuid references churches(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text check (role in ('admin', 'coordinator', 'member')) default 'member',
  unique(church_id, user_id)
);

-- Prayer requests
create table if not exists prayer_requests (
  id uuid primary key default gen_random_uuid(),
  church_id uuid references churches(id) on delete cascade,
  author_name text,
  author_id uuid references auth.users(id),
  title text not null,
  description text,
  category text check (category in ('ziekte', 'familie', 'werk', 'geestelijk_leven', 'algemeen')) default 'algemeen',
  priority text check (priority in ('urgent', 'normaal', 'laag')) default 'normaal',
  visibility text check (visibility in ('openbaar', 'prive')) default 'openbaar',
  status text check (status in ('open', 'in_gebed', 'beantwoord', 'gearchiveerd')) default 'open',
  created_at timestamptz default now()
);

-- Prayer engagements (unique per user/anonymous)
create table if not exists prayer_engagements (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references prayer_requests(id) on delete cascade,
  user_id uuid references auth.users(id)
);

-- Prayer comments
create table if not exists prayer_comments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references prayer_requests(id) on delete cascade,
  author_name text not null,
  content text not null,
  created_at timestamptz default now()
);

-- Prayer events (calendar)
create table if not exists prayer_events (
  id uuid primary key default gen_random_uuid(),
  church_id uuid references churches(id) on delete cascade,
  title text not null,
  event_date date not null,
  created_at timestamptz default now()
);

-- RLS policies
alter table churches enable row level security;
alter table church_members enable row level security;
alter table prayer_requests enable row level security;
alter table prayer_engagements enable row level security;
alter table prayer_comments enable row level security;
alter table prayer_events enable row level security;

-- Public can read churches (for prayer wall)
create policy "Public read churches" on churches for select using (true);
create policy "Owner manage church" on churches for all using (auth.uid() = owner_id);

-- Public can read openbaar prayer requests
create policy "Public read openbaar requests" on prayer_requests for select using (visibility = 'openbaar');
create policy "Authenticated manage requests" on prayer_requests for all using (
  exists (select 1 from church_members where church_id = prayer_requests.church_id and user_id = auth.uid())
  or exists (select 1 from churches where id = prayer_requests.church_id and owner_id = auth.uid())
);

-- Public can insert prayer requests
create policy "Public insert requests" on prayer_requests for insert with check (visibility = 'openbaar');

-- Public can read/insert engagements
create policy "Public read engagements" on prayer_engagements for select using (true);
create policy "Public insert engagements" on prayer_engagements for insert with check (true);

-- Public can read/insert comments
create policy "Public read comments" on prayer_comments for select using (true);
create policy "Public insert comments" on prayer_comments for insert with check (true);

-- Public read events
create policy "Public read events" on prayer_events for select using (true);
create policy "Authenticated manage events" on prayer_events for all using (
  exists (select 1 from church_members where church_id = prayer_events.church_id and user_id = auth.uid())
  or exists (select 1 from churches where id = prayer_events.church_id and owner_id = auth.uid())
);

-- Members
create policy "Members read" on church_members for select using (true);
create policy "Authenticated manage members" on church_members for all using (auth.uid() = user_id or 
  exists (select 1 from churches where id = church_members.church_id and owner_id = auth.uid())
);
