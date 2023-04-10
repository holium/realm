export const chatInitSql = `
CREATE TABLE IF NOT EXISTS messages
(
    path         TEXT    NOT NULL,
    msg_id       TEXT    NOT NULL,
    msg_part_id  INTEGER NOT NULL,
    content_type TEXT,
    content_data TEXT,
    reply_to     TEXT,
    metadata     TEXT,
    sender       TEXT    NOT NULL,
    updated_at   INTEGER NOT NULL,
    created_at   INTEGER NOT NULL,
    expires_at   INTEGER,
    PRIMARY KEY (path, msg_id, msg_part_id)
);

CREATE TABLE IF NOT EXISTS paths
(
    path                    TEXT              NOT NULL,
    type                    TEXT              NOT NULL,
    metadata                TEXT,
    invites                 TEXT    DEFAULT 'host' NOT NULL,
    peers_get_backlog       INTEGER DEFAULT 1 NOT NULL,
    pins                    TEXT,
    max_expires_at_duration INTEGER,
    updated_at              INTEGER           NOT NULL,
    created_at              INTEGER           NOT NULL,
    PRIMARY KEY (path)
);

CREATE TABLE IF NOT EXISTS peers
(
    path       TEXT    NOT NULL,
    ship       TEXT    NOT NULL,
    role       TEXT DEFAULT 'member' NOT NULL,
    updated_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (path, ship)
);

CREATE TABLE IF NOT EXISTS delete_logs
(
    change        TEXT not null,
    timestamp  INTEGER not null,
    PRIMARY KEY (change, timestamp)
);

CREATE TRIGGER IF NOT EXISTS delete_related_peers
BEFORE DELETE ON paths
FOR EACH ROW
BEGIN
    DELETE FROM peers WHERE path = OLD.path;
END;

CREATE TRIGGER IF NOT EXISTS delete_related_messages
BEFORE DELETE ON paths
FOR EACH ROW
BEGIN
    DELETE FROM messages WHERE path = OLD.path;
END;

`;

export default chatInitSql;
