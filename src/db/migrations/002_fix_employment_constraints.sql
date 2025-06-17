create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text check(role in ('admin', 'user')) not null,
  name text not null,
  municipal_mayor text not null,
  address text not null
);