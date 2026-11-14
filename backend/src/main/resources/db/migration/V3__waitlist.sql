create table waitlist_entries (
    id         bigserial primary key,
    email      varchar(254) not null,
    plan       varchar(20)  not null,
    created_at timestamptz  not null default now(),
    constraint uq_waitlist_email_plan unique (email, plan)
);
