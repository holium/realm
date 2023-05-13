export enum CHAT_TABLES {
  MESSAGES = 'chat_messages',
  PATHS = 'chat_paths',
  PEERS = 'chat_peers',
  PATHS_FLAGS = 'chat_paths_flags',
  DELETE_LOGS = 'chat_delete_logs',
}

export const chatInitSql = `
create table if not exists ${CHAT_TABLES.MESSAGES}
(
    path         TEXT    not null,
    msg_id       TEXT    NOT NULL,
    msg_part_id  INTEGER NOT NULL,
    content_type TEXT,
    content_data TEXT,
    reply_to     TEXT,
    metadata     text,
    sender       text    NOT NULL,
    updated_at   INTEGER NOT NULL,
    created_at   INTEGER NOT NULL,
    expires_at   INTEGER,
    received_at   INTEGER NOT NULL
);

create unique index if not exists ${CHAT_TABLES.MESSAGES}_path_msg_id_msg_part_id_uindex
    on ${CHAT_TABLES.MESSAGES} (path, msg_id, msg_part_id);

    
create table if not exists ${CHAT_TABLES.PATHS}
(
    path                        TEXT NOT NULL,
    type                        TEXT NOT NULL,
    metadata                    TEXT,
    invites                     TEXT default 'host' NOT NULL,
    peers_get_backlog           INTEGER default 1 NOT NULL,
    pins                        TEXT,
    max_expires_at_duration     INTEGER,
    pinned                      INTEGER default 0 NOT NULL,
    muted                       INTEGER default 0 NOT NULL,
    updated_at                  INTEGER NOT NULL,
    created_at                  INTEGER NOT NULL,
    received_at                 INTEGER NOT NULL
);

create unique index if not exists ${CHAT_TABLES.PATHS}_path_uindex
    on ${CHAT_TABLES.PATHS} (path);

CREATE TABLE IF NOT EXISTS ${CHAT_TABLES.PATHS_FLAGS} 
(
    path             TEXT NOT NULL,
    pinned           INTEGER default 0 NOT NULL,
    muted            INTEGER default 0 NOT NULL
);

create table if not exists ${CHAT_TABLES.PEERS}
(
    path        TEXT NOT NULL,
    ship        text NOT NULL,
    role        TEXT default 'member' NOT NULL,
    updated_at  INTEGER NOT NULL,
    created_at  INTEGER NOT NULL,
    received_at  INTEGER NOT NULL
);

create unique index if not exists ${CHAT_TABLES.PEERS}_path_ship_uindex
    on ${CHAT_TABLES.PEERS} (path, ship);

create table if not exists ${CHAT_TABLES.DELETE_LOGS}
(
    change        TEXT NOT NULL,
    timestamp  INTEGER NOT NULL
);

create unique index if not exists ${CHAT_TABLES.DELETE_LOGS}_change_uindex
    on ${CHAT_TABLES.DELETE_LOGS} (timestamp, change);

`;
