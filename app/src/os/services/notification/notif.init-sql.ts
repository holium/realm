export const notifInitSql = `
create table if not exists  notifications
(
    id          integer not null,
    app         TEXT not null,
    path        TEXT not null,
    type        TEXT not null,
    title       TEXT,
    content     TEXT,
    image       TEXT,
    buttons     text,
    link        TEXT,
    metadata    text,
    created_at  integer not null,
    updated_at  integer not null,
    read_at     integer,
    read        boolean,
    dismissed_at  integer,
    dismissed     boolean
);

create unique index if not exists notifications_id_uindex
    on notifications (id);

create index if not exists notifications_read_dismissed_index
    on notifications (read, dismissed);

`;

export default notifInitSql;
