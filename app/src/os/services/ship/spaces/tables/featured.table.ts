// import log from 'electron-log';
import Database from 'better-sqlite3-multiple-ciphers';
import AbstractDataAccess from '../../../abstract.db';
import APIConnection from '../../../conduit';

export interface FeaturedSpace {
  path: string;
  name: string;
  description: string;
  picture?: string;
  color?: string;
  // createdAt: number;
  // updatedAt: number;
}

export class FeaturedSpacesDB extends AbstractDataAccess<FeaturedSpace, any> {
  constructor(preload: boolean, db?: Database) {
    super({
      preload: preload,
      db,
      name: 'FeaturedSpaceDB',
      tableName: 'spaces_featured',
    });
    if (preload) {
      return;
    }

    APIConnection.getInstance().conduit.watch({
      app: 'bulletin',
      path: `/ui`,
      onEvent: async (data: any) => {
        const [action, payload] = Object.entries<any>(data)[0];
        switch (action) {
          case 'initial':
            this.insertAll(payload.spaces);
            break;
          case 'space-added':
            // store._spaceAdded(payload.space);
            break;
          case 'space-removed':
            // store._spaceRemoved(payload);
            break;
        }
      },
      // onSubscribed: () => {
      //   store.setSubscriptionStatus('subscribed');
      // },
      // onError: () => {
      //   console.error('Subscription to %bulletin rejected');
      //   store.setSubscriptionStatus('unsubscribed');
      // },
      // onQuit: () => {
      //   console.error('Kicked from %bulletin subscription');
      //   store.setSubscriptionStatus('unsubscribed');
      // },
    });
  }

  protected mapRow(row: any): FeaturedSpace {
    return {
      path: row.path,
      name: row.name,
      description: row.type,
      picture: row.picture,
      color: row.color,
      // updatedAt: row.updatedAt,
      // createdAt: row.createdAt,
    };
  }

  public getFeaturedSpaces(): { [path: string]: FeaturedSpace } {
    if (!this.db) throw new Error('No db connection');
    const query = this.db.prepare(
      `
      SELECT 
      json_group_object(
        path,
        json_object(
          'path', path,
          'name', name,
          'description', description,
          'picture', picture,
          'color', color
        )
      ) as spaces
      FROM spaces_featured`
    );
    const spaces: any = query.all();
    if (!spaces.length) return {};
    return JSON.parse(spaces[0].spaces);
  }

  public insertAll(featuredSpaces: { [key: string]: FeaturedSpace }) {
    if (!this.db) throw new Error('No db connection');
    const insert = this.db.prepare(
      `REPLACE INTO spaces_featured (
        path,
        name,
        description,
        picture,
        color
      ) VALUES (
        @path,
        @name,
        @description,
        @picture,
        @color
      )`
    );

    const insertMany = this.db.transaction((featured: any) => {
      Object.entries<FeaturedSpace>(featured).forEach(([space, entry]) => {
        insert.run({
          path: space,
          name: entry.name,
          description: entry.description,
          picture: entry.picture,
          color: entry.color,
        });
      });
    });
    insertMany(featuredSpaces);
    return featuredSpaces;
  }
}

export const spacesFeaturedInitSql = `
  create table if not exists spaces_featured (
      path text not null,
      name text not null,
      description text not null,
      picture text,
      color text,
      primary key (path)
  );
  create unique index if not exists spaces_featured_uindex on spaces_featured (path);
`;

export const spacesFeaturedDBPreload = FeaturedSpacesDB.preload(
  new FeaturedSpacesDB(true)
);
