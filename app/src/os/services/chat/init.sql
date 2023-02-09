create table if not exists messages
(
    path         TEXT    not null,
    msg_id       TEXT    not null,
    msg_part_id  integer not null,
    content_type TEXT    not null,
    content_data TEXT    not null,
    reply_to     TEXT,
    metadata     text,
    timestamp    text not null,
    sender       text    not null
);

create unique index if not exists messages_path_msg_id_msg_part_id_uindex
    on messages (path, msg_id, msg_part_id);

create table if not exists  paths
(
    path     TEXT not null,
    type     TEXT not null,
    metadata TEXT
);

create unique index if not exists paths_path_uindex
    on paths (path);

create table if not exists  peers
(
    role TEXT default 'member' not null,
    ship text                  not null,
    path TEXT                  not null
);

create unique index if not exists peers_path_ship_uindex
    on peers (path, ship);
