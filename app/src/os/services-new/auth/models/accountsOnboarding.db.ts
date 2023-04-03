import { Database } from 'better-sqlite3';
import AbstractDataAccess from '../../abstract.db';

interface AccountOnboarding {
  id: number;
  currentStep: string;
  selfHosted: boolean;
  inviteCode: string;
  email: string;
  verifyToken: string;
  selfPatp: string;
  selfUrl: string;
  selfCode: string;
  nickname: string;
  color: string;
  avatar: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  completedAt: number;
}

export class AccountsOnboarding extends AbstractDataAccess<AccountOnboarding> {
  constructor(db: Database) {
    super({
      preload: false,
      db,
      name: 'accountsOnboarding',
      tableName: 'accountsOnboarding',
    });
  }

  protected mapRow(row: any): AccountOnboarding {
    return {
      id: row.id,
      currentStep: row.currentStep,
      selfHosted: row.selfHosted,
      inviteCode: row.inviteCode,
      email: row.email,
      verifyToken: row.verifyToken,
      selfPatp: row.selfPatp,
      selfUrl: row.selfUrl,
      selfCode: row.selfCode,
      nickname: row.nickname,
      color: row.color,
      avatar: row.avatar,
      description: row.description,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      completedAt: row.completedAt,
    };
  }
}

export const accountsOnboardingInit = `
  create table if not exists accounts_onboarding (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    currentStep   TEXT NOT NULL DEFAULT 'DISCLAIMER',
    selfHosted    INTEGER NOT NULL DEFAULT 0,
    inviteCode    TEXT,
    email         TEXT,
    verifyToken   TEXT,
    selfPatp      TEXT,
    selfUrl       TEXT,
    selfCode      TEXT,
    nickname      TEXT,
    color         TEXT DEFAULT '#000000',
    avatar        TEXT,
    description   TEXT,
    createdAt     INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
    updatedAt     INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
    completedAt   INTEGER
  );
`;
