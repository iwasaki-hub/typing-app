begin;
select set_config('test.user_a',gen_random_uuid()::text,true), set_config('test.user_b',gen_random_uuid()::text,true);
insert into auth.users(id,email) values (current_setting('test.user_a')::uuid,'ranking-test-a@example.invalid'),(current_setting('test.user_b')::uuid,'ranking-test-b@example.invalid');
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.user_a'),'role','authenticated','is_anonymous',false)::text,true);
set local role authenticated;
insert into public.typing_scores(id,user_id,display_name,duration,elapsed,correct,attempts,mistakes,text_length,reason) values
(gen_random_uuid(),current_setting('test.user_a')::uuid,'test A',60,10,60,65,5,60,'completed'),
(gen_random_uuid(),current_setting('test.user_a')::uuid,'test A best',60,10,80,80,0,80,'completed'),
(gen_random_uuid(),current_setting('test.user_a')::uuid,'test A 30',30,10,60,60,0,60,'completed');
do $$ begin
  if (select count(*) from public.typing_leaderboard where user_id=current_setting('test.user_a')::uuid) <> 2 then raise exception 'best per duration failed'; end if;
  if not exists(select 1 from public.typing_leaderboard where user_id=current_setting('test.user_a')::uuid and duration=60 and wpm=96 and accuracy=100) then raise exception 'generated metrics failed'; end if;
  begin
    insert into public.typing_scores(id,user_id,display_name,duration,elapsed,correct,attempts,mistakes,text_length,reason) values(gen_random_uuid(),current_setting('test.user_b')::uuid,'spoof',60,10,60,60,0,60,'completed');
    raise exception 'owner check failed';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.typing_scores(id,user_id,display_name,duration,elapsed,correct,attempts,mistakes,text_length,reason) values(gen_random_uuid(),current_setting('test.user_a')::uuid,'invalid',60,1,60,60,0,60,'completed');
    raise exception 'timing check failed';
  exception when check_violation then null; end;
  begin
    insert into public.typing_scores(id,user_id,display_name,duration,elapsed,correct,attempts,mistakes,text_length,reason) values(gen_random_uuid(),current_setting('test.user_a')::uuid,'stopped',60,10,60,60,0,60,'stopped');
    raise exception 'manual stop check failed';
  exception when check_violation then null; end;
  begin
    update public.typing_scores set display_name='tampered' where user_id=current_setting('test.user_a')::uuid;
    raise exception 'update denied check failed';
  exception when insufficient_privilege then null; end;
  begin
    delete from public.typing_scores where user_id=current_setting('test.user_a')::uuid;
    raise exception 'delete denied check failed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role anon;
do $$ begin
  if (select count(*) from public.typing_leaderboard where user_id=current_setting('test.user_a')::uuid) <> 2 then raise exception 'public read failed'; end if;
  begin
    insert into public.typing_scores(id,user_id,display_name,duration,elapsed,correct,attempts,mistakes,text_length,reason) values(gen_random_uuid(),current_setting('test.user_a')::uuid,'anonymous',60,10,60,60,0,60,'completed');
    raise exception 'anonymous insert denied check failed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
select 'ranking permissions, metrics and best-score tests passed; test data rolled back' as result;
