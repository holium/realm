import log from 'electron-log';
import Database from 'better-sqlite3-multiple-ciphers';

import { cleanNounColor, removeHash } from '../../lib/color';
import { ServiceOptions } from '../abstract.service';
import AbstractDataAccess from '../abstract.db';
import { APIConnection } from '../api';

export interface Friend {
  patp: string;
  pinned: boolean;
  tags: string;
  status: string;
  nickname: string;
  avatar: string;
  bio: string;
  color: string;
  cover: string;
  // createdAt: number;
  // updatedAt: number;
}

export class FriendsService extends AbstractDataAccess<Friend, any> {
  constructor(options: ServiceOptions, db?: Database) {
    super({
      preload: options.preload,
      db,
      name: 'friends',
      tableName: 'friends',
    });
    if (options.preload) {
      return;
    } else {
      this._init();
    }
    if (options.verbose) {
      log.info('friends.service.ts:', 'Constructed.');
    }
  }

  protected mapRow(row: any): Friend {
    return {
      patp: row.patp,
      pinned: row.pinned === 1,
      tags: row.tags ? JSON.parse(row.tags) : [],
      status: row.status,
      nickname: row.nickname,
      avatar: row.avatar,
      bio: row.bio,
      color: row.color,
      cover: row.cover,
      // updatedAt: row.updatedAt,
      // createdAt: row.createdAt,
    };
  }

  private async _init() {
    const friends: any[] = await this._fetchFriends();
    if (!friends) return;
    if (!this.db) throw new Error('No db connection');
    const insert = this.db.prepare(
      `REPLACE INTO friends (
        patp,
        pinned,
        tags,
        status,
        nickname,
        avatar,
        bio,
        color,
        cover
      ) VALUES (
        @patp,
        @pinned,
        @tags,
        @status,
        @nickname,
        @avatar,
        @bio,
        @color,
        @cover
      )`
    );
    const insertMany = this.db.transaction((friends: any) => {
      Object.entries<any>(friends).forEach(([patp, friend]) => {
        insert.run({
          patp,
          pinned: friend.pinned ? 1 : 0,
          tags: JSON.stringify(friend.tags),
          status: friend.status,
          nickname: friend.contactInfo ? friend.contactInfo.nickname : '',
          avatar: friend.contactInfo ? friend.contactInfo.avatar : '',
          bio: friend.contactInfo ? friend.contactInfo.bio : '',
          color: friend.contactInfo
            ? cleanNounColor(friend.contactInfo.color)
            : '#000',
          cover: friend.contactInfo ? friend.contactInfo.cover : '',
        });
      });
    });
    insertMany(friends);
  }

  async fetchOne(patp: string) {
    // Get last timestamp
    const response = await APIConnection.getInstance().conduit.scry({
      app: 'friends',
      path: `/contact/${patp}`,
    });
    return response;
  }

  private async _fetchFriends() {
    // Get last timestamp
    const response = await APIConnection.getInstance().conduit.scry({
      app: 'friends',
      path: '/all',
    });
    return response?.friends;
  }

  public async getFriends() {
    return this.find();
  }

  public async addFriend(patp: string) {
    const response = await APIConnection.getInstance().conduit.poke({
      app: 'friends',
      mark: 'friends-action',
      json: {
        'add-friend': {
          ship: patp,
        },
      },
    });
    return response;
  }

  public async editFriend(
    patp: string,
    payload: { pinned: boolean; tags: string[] }
  ) {
    const response = await APIConnection.getInstance().conduit.poke({
      app: 'friends',
      mark: 'friends-action',
      json: {
        'edit-friend': {
          ship: patp,
          pinned: payload.pinned,
          tags: payload.tags || [],
        },
      },
    });
    return response;
  }

  public async removeFriend(patp: string) {
    const response = await APIConnection.getInstance().conduit.poke({
      app: 'friends',
      mark: 'friends-action',
      json: {
        'remove-friend': {
          ship: patp,
        },
      },
    });
    return response;
  }

  saveContact(
    patp: string,
    data: {
      nickname: string;
      avatar?: string;
      color?: string;
      bio?: string;
      cover?: string;
    }
  ) {
    const preparedData: Record<string, any> = {
      nickname: data.nickname,
      color: data.color ? removeHash(data.color) : null,
      avatar: data.avatar ?? null,
      bio: data.bio || null,
      cover: data.cover ?? null,
    };
    const payload = {
      app: 'friends',
      mark: 'friends-action',
      json: {
        'set-contact': {
          ship: patp,
          'contact-info': preparedData,
        },
      },
    };
    APIConnection.getInstance().conduit.poke(payload);
  }

  public findOne(patp: string): Friend | null {
    const query = `SELECT * FROM ${this.tableName} WHERE patp = ?`;
    const stmt = this.prepare(query);
    const row = stmt.get(patp);
    return row ? this.mapRow(row) : null;
  }

  public create(values: Partial<Friend>): Friend {
    const columns = Object.keys(values).join(', ');
    const placeholders = Object.keys(values)
      .map(() => '?')
      .join(', ');
    const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`;
    const stmt = this.prepare(query);

    stmt.run(Object.values(values));
    if (!values.patp) throw new Error('Failed to create new record');
    const created = this.findOne(values.patp);
    if (!created) throw new Error('Failed to create new record');
    return created;
  }

  public update(patp: string, values: Partial<Friend>): Friend {
    const setClause = Object.keys(values)
      .map((key) => `${key} = ?`)
      .join(', ');
    const query = `UPDATE ${this.tableName} SET ${setClause} WHERE patp = ?`;
    const stmt = this.prepare(query);

    stmt.run([...Object.values(values), patp]);
    const updated = this.findOne(patp);
    if (!updated) throw new Error('Failed to update record');
    return updated;
  }

  public delete(patp: string): void {
    const query = `DELETE FROM ${this.tableName} WHERE patp = ?`;
    const stmt = this.prepare(query);

    const result = stmt.run(patp);
    if (result.changes !== 1) throw new Error('Failed to delete record');
  }
}

export const friendsInitSql = `
  create table if not exists friends (
    patp text PRIMARY KEY not null,
    pinned integer not null default 0,
    tags text not null default '[]',
    status text not null default '',
    nickname text default '',
    avatar text default '',
    bio text default '',
    color text default '#000',
    cover text default ''
  );
  create unique index if not exists friends_patp_uindex on friends (patp);
`;

export const friendsPreload = FriendsService.preload(
  new FriendsService({ preload: true })
);
