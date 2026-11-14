/* ProofLaunch schema. Flyway owns it; Hibernate never alters it. */

create table users (
    id            bigserial primary key,
    email         varchar(254) not null,
    display_name  varchar(60)  not null,
    password_hash varchar(100) not null,
    created_at    timestamptz  not null default now(),
    constraint uq_users_email unique (email)
);

create table categories (
    id         bigserial primary key,
    slug       varchar(60) not null,
    name       varchar(60) not null,
    sort_order integer     not null default 0,
    constraint uq_categories_slug unique (slug)
);

create table products (
    id                  bigserial primary key,
    slug                varchar(80)   not null,
    name                varchar(80)   not null,
    tagline             varchar(140)  not null,
    description         varchar(4000),
    website_url         varchar(500)  not null,
    logo_url            varchar(500),
    category_id         bigint        not null references categories (id),
    maker_id            bigint        not null references users (id) on delete cascade,
    launch_date         date          not null,
    upvote_count        integer       not null default 0,
    try_started_count   integer       not null default 0,
    try_count           integer       not null default 0,
    avg_rating          double precision not null default 0,
    upvote_points       double precision not null default 0,
    try_points          double precision not null default 0,
    score               double precision not null default 0,
    created_at          timestamptz   not null default now(),
    updated_at          timestamptz   not null default now(),
    constraint uq_products_slug unique (slug),
    constraint uq_products_website unique (website_url)
);

/* leaderboard: filter by launch window, order by score */
create index idx_products_launch_score on products (launch_date, score desc);
create index idx_products_category     on products (category_id);
create index idx_products_maker        on products (maker_id, created_at desc);

create table votes (
    id         bigserial primary key,
    user_id    bigint           not null references users (id)    on delete cascade,
    product_id bigint           not null references products (id) on delete cascade,
    weight     double precision not null,
    created_at timestamptz      not null default now(),
    constraint uq_votes_user_product unique (user_id, product_id)
);
create index idx_votes_product on votes (product_id);

create table product_tries (
    id           bigserial primary key,
    user_id      bigint        not null references users (id)    on delete cascade,
    product_id   bigint        not null references products (id) on delete cascade,
    status       varchar(12)   not null,
    started_at   timestamptz   not null,
    completed_at timestamptz,
    rating       integer,
    feedback     varchar(1000),
    weight       double precision,
    constraint uq_tries_user_product unique (user_id, product_id),
    constraint ck_tries_status check (status in ('STARTED', 'COMPLETED')),
    constraint ck_tries_rating check (rating is null or (rating between 1 and 5)),
    constraint ck_tries_completed check (
        status = 'STARTED' or (rating is not null and feedback is not null and completed_at is not null and weight is not null)
    )
);
create index idx_tries_product_status on product_tries (product_id, status, completed_at desc);
