-- Add phone number to profiles (collected at signup)

alter table public.profiles
  add column if not exists phone text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'user'),
    nullif(trim(coalesce(new.raw_user_meta_data->>'phone', '')), '')
  );
  return new;
end;
$$;
