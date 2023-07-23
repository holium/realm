import log from 'electron-log';
import Database from 'better-sqlite3-multiple-ciphers';

import { cleanNounColor, removeHash } from '../../../lib/color';
import AbstractDataAccess from '../../abstract.db';
import { ServiceOptions } from '../../abstract.service';
import { APIConnection } from '../../api';

export type ContactResponse = {
  avatar: string | null;
  cover: string | null;
  bio: string | null;
  nickname: string | null;
  color: string | null;
};

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
      pKey: 'patp',
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
    if (!this.db?.open) return;
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

    // return response?.contact;
    const current = this.findOne(patp);
    if (current) {
      const compareObj = {
        avatar: current.avatar,
        cover: current.cover,
        bio: current.bio,
        nickname: current.nickname,
        color: current.color,
      };
      if (response !== compareObj) {
        this._updateLocalContact(patp, response);
      }
    }

    return response;
  }

  private _updateLocalContact(patp: string, contact: ContactResponse) {
    if (!this.db?.open) return;
    const update = this.db.prepare(
      `UPDATE friends SET
        nickname = @nickname,
        avatar = @avatar,
        bio = @bio,
        color = @color,
        cover = @cover
      WHERE patp = @patp`
    );
    update.run({
      patp,
      ...contact,
    });
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

    return APIConnection.getInstance().conduit.poke(payload);
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

export const friendsWipeSql = `
drop table if exists friends;
`;

export const friendsPreload = FriendsService.preload(
  new FriendsService({ preload: true })
);
