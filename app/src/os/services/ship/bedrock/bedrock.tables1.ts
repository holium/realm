export const voteInitSql = `
create table if not exists votes
(
    received_at       INTEGER not NULL,
    parent_path       TEXT not NULL,
    updated_at        INTEGER not NULL,
    revision        NULL,
    id       TEXT not NULL PRIMARY KEY,
    creator     TEXT not NULL,
    created_at       INTEGER not NULL,
    up     INTEGER not NULL,
    path        TEXT not NULL,
    type    TEXT not NULL,
    parent_id  TEXT not NULL,
    parent_type  TEXT INTEGER not NULL,
    v     INTEGER not NULL
);
`;

export const generalInitSql = (tableName: string) => {
  return `create table if not exists ${tableName}
(
    id              TEXT not NULL PRIMARY KEY,
    path            TEXT not NULL,
    received_at     INTEGER not NULL,
    updated_at      INTEGER not NULL,
    created_at      INTEGER not NULL,
    type            TEXT not NULL,
    v               INTEGER not NULL,
    creator         TEXT not NULL,
    data            TEXT not NULL
);
`;
};
export const definitionInitSql = `
create table if not exists lexicon_definitions
(
    received_at       INTEGER not NULL,
    definition       TEXT not NULL,
    updated_at        INTEGER not NULL,
    revision        NULL,
    id       TEXT not NULL PRIMARY KEY,
    created_at       INTEGER not NULL,
    path        TEXT not NULL,
    type    TEXT not NULL,
    word_id     TEXT not NULL,
    v     INTEGER not NULL
);
`;
export const sentenceInitSql = `
create table if not exists lexicon_sentences
(
    received_at       INTEGER not NULL,
    sentence       TEXT not NULL,
    updated_at        INTEGER not NULL,
    revision        NULL,
    id       TEXT not NULL PRIMARY KEY,
    created_at       INTEGER not NULL,
    path        TEXT not NULL,
    type    TEXT not NULL,
    word_id     TEXT not NULL,
    v     INTEGER not NULL
);
`;

export const lexiconInitSql = `
${voteInitSql}
${wordInitSql}
${definitionInitSql}
${sentenceInitSql}
`;

export const lexiconWipeSql = `
drop table if exists votes;
drop table if exists lexicon_words;
drop table if exists lexicon_definitions;
drop table if exists lexicon_sentences;
`;
