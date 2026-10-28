-- くらべっこ lessons: the two chords played against each other. Null for ordinary lessons.
alter table public.lessons add column if not exists focus text[];
