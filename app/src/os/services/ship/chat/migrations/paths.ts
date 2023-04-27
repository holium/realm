export const pathsMigration1 = `
ALTER TABLE paths
  ADD COLUMN pinned integer default 0 not null;
ALTER TABLE paths
  ADD COLUMN muted integer default 0 not null;
`;
