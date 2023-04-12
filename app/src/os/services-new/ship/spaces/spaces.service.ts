import AbstractService, { ServiceOptions } from '../../abstract.service';
import { Database } from 'better-sqlite3-multiple-ciphers';
import log from 'electron-log';
import APIConnection from '../../conduit';
import { SpacesDB, spacesInitSql } from './tables/spaces.table';
import { MembersDB, spacesMembersInitSql } from './tables/members.table';
import { humanFriendlySpaceNameSlug } from '../../../lib/text';
import { snakeify } from '../../../lib/obj';
import { pathToObj } from '../../..//lib/path';
import { spacesInvitationsInitSql } from './tables/visas.table';

export class SpacesService extends AbstractService {
  private shipDB?: Database;
  public spacesDB?: SpacesDB;
  public membersDB?: MembersDB;

  constructor(options?: ServiceOptions, db?: Database) {
    super('spacesService', options);
    if (options?.preload) {
      return;
    }
    this.shipDB = db;
    this.spacesDB = new SpacesDB(false, db);
    this.membersDB = new MembersDB(false, db);

    this._onEvent = this._onEvent.bind(this);
    APIConnection.getInstance().conduit.watch({
      app: 'spaces',
      path: `/updates`,
      onEvent: this._onEvent,
      onQuit: this._onQuit,
      onError: this._onError,
    });
  }

  reset(): void {
    super.reset();
    this.spacesDB?.reset();
    this.membersDB?.reset();
  }

  private _onEvent = (data: any, _id?: number, mark?: string) => {
    if (mark === 'spaces-reaction') {
      const spacesType = Object.keys(data)[0];
      switch (spacesType) {
        case 'initial':
          this.spacesDB?.insertAll(data['initial'].spaces);
          this.spacesDB?.setCurrent(data['initial'].current.path);
          this.membersDB?.insertAll(data['initial'].membership);
          break;
        case 'add':
          const addedSpace = data['add'];
          addedSpace.current = 1;
          const addedPath = addedSpace.space.path;
          this.spacesDB?.insertAll({ [addedPath]: addedSpace.space });
          this.spacesDB?.setCurrent(addedPath);
          this.membersDB?.insertAll({
            [addedPath]: addedSpace.members,
          });
          // TODO: send members update to the frontend
          break;
        case 'remove':
          this.spacesDB?.delete(data['remove']['space-path']);
          break;
        case 'replace':
          // this.spacesDB?.replace(data['replace']);
          const replacePayload = data['replace'];
          log.info('replace', replacePayload);
          // todo update spaces
          break;
        case 'remote-space':
          // when a remote space is added, we need to add it to our local db
          const remoteSpace = data['remote-space'];
          this.spacesDB?.insertAll({ [remoteSpace.path]: remoteSpace.space });
          this.spacesDB?.setCurrent(remoteSpace.path);
          this.membersDB?.insertAll({
            [remoteSpace.path]: remoteSpace.members,
          });
          // todo insert members
          // todo insert spaces
          break;
        default:
          break;
      }
    }
    if (mark === 'visa-reaction') {
      const visaType = Object.keys(data)[0];
      switch (visaType) {
        case 'invite-sent':
          break;
        case 'invite-accepted':
          break;
        case 'invite-received':
          break;
        case 'invite-removed':
          break;
        case 'kicked':
          break;
        case 'edited':
          break;
        case 'invite-declined':
          break;
        case 'invite-expired':
          break;
        default:
          break;
      }
    }
  };

  private _onQuit = () => {
    log.warn('Spaces subscription quit');
  };

  private _onError = (err: any) => {
    log.warn('Spaces subscription error', err);
  };

  public async getInitial() {
    if (!this.shipDB) return;
    const query = this.shipDB.prepare(`
        WITH member_agg AS (
          SELECT
            space,
            json_group_array(
              json_object(
                'patp', patp,
                'roles', json(roles),
                'alias', alias,
                'status', status
              )
            ) AS members
          FROM spaces_members
          GROUP BY space
        ),
        dock_agg AS (
          SELECT
              space,
              CASE
                WHEN COUNT(id) > 0
                  THEN json_group_array(
                      json_object(
                        'id', id,
                        'title', title,
                        'href', json(href),
                        'favicon', favicon,
                        'type', type,
                        'config', json(config),
                        'installStatus', installStatus,
                        'info', info,
                        'color', color,
                        'image', image,
                        'version', version,
                        'website', website,
                        'license', license,
                        'host', host,
                        'icon', icon,
                        'dockIndex', docks.idx
                      )
                    )
                ELSE json('[]')
              END AS dock
          FROM (
                SELECT
                  docks.space,
                  docks.idx,
                  ac.*
                FROM docks
                LEFT JOIN app_catalog ac ON docks.id = ac.id
                LEFT JOIN app_grid ag ON ac.id = ag.appId
                WHERE ag.idx IS NOT NULL
                ORDER BY docks.space, docks.idx
          ) AS docks
          GROUP BY space
        ),
        ranked_apps AS (
          SELECT
            space,
            sub.key,
            sub.value,
            ROW_NUMBER() OVER (PARTITION BY space ORDER BY sub.value DESC) as rank
          FROM stalls,
            json_each(json(stalls.recommended)) as sub
          ORDER BY sub.value DESC
        ),
        recs_agg AS (
            SELECT
              space,
              json_group_array(
                  json_object(
                      'id', ac.id,
                      'title', ac.title,
                      'href', json(ac.href),
                      'favicon', ac.favicon,
                      'type', ac.type,
                      'config', json(ac.config),
                      'installStatus', ac.installStatus,
                      'info', ac.info,
                      'color', ac.color,
                      'image', ac.image,
                      'version', ac.version,
                      'website', ac.website,
                      'license', ac.license,
                      'host', ac.host,
                      'icon', ac.icon,
                      'rank', rank
                  )) recommended
            FROM ranked_apps
              LEFT JOIN app_catalog ac ON key = ac.id
            WHERE rank <= 4
            GROUP BY space
        ),
        joined_suite AS (
            SELECT
              space,
              sub.key,
              sub.value,
              json_object(
                  'id', ac.id,
                  'title', ac.title,
                  'href', json(ac.href),
                  'favicon', ac.favicon,
                  'type', ac.type,
                  'config', json(ac.config),
                  'installStatus', ac.installStatus,
                  'info', ac.info,
                  'color', ac.color,
                  'image', ac.image,
                  'version', ac.version,
                  'website', ac.website,
                  'license', ac.license,
                  'host', ac.host,
                  'icon', ac.icon
              ) app
            FROM stalls,
              json_each(json(stalls.suite)) as sub
              LEFT JOIN app_catalog ac ON sub.value = ac.id
            GROUP BY sub.key, space
        ),
        suite_agg as (
            SELECT space, json_group_object(key, json(app)) suite
            FROM joined_suite
            GROUP BY space
        ),
        stall_agg AS (
          SELECT
            stalls.space,
            json_object(
              'suite', ifnull(json(suite_agg.suite), json('{}')),
              'recommended', ifnull(json(recs_agg.recommended), json('[]'))
            ) AS stall
          FROM stalls
          LEFT JOIN recs_agg ON recs_agg.space = stalls.space
          LEFT JOIN suite_agg ON suite_agg.space = stalls.space
          GROUP BY stalls.space
        )
        SELECT
          s.current,
          s.path,
          s.name,
          s.description,
          s.color,
          s.type,
          s.archetype,
          s.picture,
          s.access,
          json(s.theme) as theme,
          ifnull(ma.members, json('[]')) AS members,
          ifnull(da.dock, json('[]')) AS dock,
          ifnull(sa.stall, json('{"suite": {}, "recommended": []}')) AS stall
        FROM spaces s
        LEFT JOIN member_agg ma ON s.path = ma.space
        LEFT JOIN dock_agg da ON s.path = da.space
        LEFT JOIN stall_agg sa ON s.path = sa.space;
    `);
    const result: any = query.all();
    const currentSpace = result.filter((row: any) => row.current === 1)[0];

    return {
      current: currentSpace ? currentSpace.path : null,
      spaces: result.map((row: any) => {
        return {
          ...row,
          current: row.current === 1,
          archetype: row.archetype || 'community',
          theme: row.theme ? JSON.parse(row.theme) : null,
          members: row.members ? JSON.parse(row.members) : null,
          dock: row.dock ? JSON.parse(row.dock) : [],
          stall: row.stall
            ? JSON.parse(row.stall)
            : { suite: {}, recommended: {} },
        };
      }),
    };
  }

  public async setSelectedSpace(path: string) {
    this.spacesDB?.setCurrent(path);
    console.log('setting current space to', path, pathToObj(path));
    APIConnection.getInstance().conduit.poke({
      app: 'spaces',
      mark: 'spaces-action',
      json: {
        current: {
          path: pathToObj(path),
        },
      },
    });
  }

  public async createSpace(newSpace: NewSpace) {
    const members = newSpace.members;
    const slug = humanFriendlySpaceNameSlug(newSpace.name);
    const spacePath: string = await new Promise((resolve, reject) => {
      APIConnection.getInstance().conduit.poke({
        app: 'spaces',
        mark: 'spaces-action',
        json: {
          add: {
            slug,
            payload: snakeify({
              name: newSpace.name,
              description: newSpace.description,
              type: newSpace.type,
              access: newSpace.access,
              picture: newSpace.picture,
              color: newSpace.color,
              archetype: newSpace.archetype,
            }),
            members,
          },
        },
        reaction: 'spaces-reaction.add',
        onReaction: (data: any) => {
          // TODO: add to db
          log.info('created space', data.add.space.path);
          resolve(data.add.space.path);
        },
        onError: (e: any) => {
          reject(e);
        },
      });
    });
    return spacePath;
  }

  public async joinSpace(path: string): Promise<void> {
    return await new Promise((resolve, reject) => {
      APIConnection.getInstance().conduit.poke({
        app: 'spaces',
        mark: 'spaces-action',
        json: {
          join: {
            path: pathToObj(path),
          },
        },
        reaction: 'spaces-reaction.remote-space',
        onReaction: (data: any) => {
          console.log('joined space -> success');
          // TODO: add to db
          // check if matches path
          resolve(data);
        },
        onError: (e: any) => {
          log.info('failed to join space', e);
          reject(e);
        },
      });
    });
  }

  public async updateSpace(path: string, payload: any): Promise<string> {
    return await new Promise((resolve, reject) => {
      console.log({
        path: pathToObj(path),
        payload: {
          name: payload.name,
          description: payload.description,
          access: payload.access,
          picture: payload.picture,
          color: payload.color,
          theme: snakeify(payload.theme),
        },
      });
      APIConnection.getInstance().conduit.poke({
        app: 'spaces',
        mark: 'spaces-action',
        json: {
          update: {
            path: pathToObj(path),
            payload: {
              name: payload.name,
              description: payload.description,
              access: payload.access,
              picture: payload.picture,
              color: payload.color,
              theme: snakeify(payload.theme),
            },
          },
        },
        reaction: 'spaces-reaction.replace',
        onReaction: (data: any) => {
          // TODO: update the db
          console.log('updated space -> success');
          resolve(data);
        },
        onError: (e: any) => {
          reject(e);
        },
      });
    });
  }

  public async deleteSpace(path: string): Promise<void> {
    return await new Promise((resolve, reject) => {
      APIConnection.getInstance().conduit.poke({
        app: 'spaces',
        mark: 'spaces-action',
        json: {
          remove: {
            path: pathToObj(path),
          },
        },
        reaction: 'spaces-reaction.remove',
        onReaction: (data: any) => {
          // TODO: remove from db
          console.log('deleted space -> success');
          resolve(data);
        },
        onError: (e: any) => {
          reject(e);
          log.info('failed to delete space', e);
        },
      });
    });
  }

  public async leaveSpace(path: string): Promise<void> {
    return await new Promise((resolve, reject) => {
      APIConnection.getInstance().conduit.poke({
        app: 'spaces',
        mark: 'spaces-action',
        json: {
          leave: {
            path: pathToObj(path),
          },
        },
        reaction: 'spaces-reaction.delete',
        onReaction: (data: any) => {
          // TODO: remove from db
          console.log('deleted space -> success');
          resolve(data);
        },
        onError: (e: any) => {
          reject(e);
        },
      });
    });
  }
}

export default SpacesService;

// Generate preload
export const spacesPreload = SpacesService.preload(
  new SpacesService({ preload: true })
);

export const spacesTablesInitSql = `
 ${spacesInitSql}
 ${spacesInvitationsInitSql}
 ${spacesMembersInitSql}
`;

export type NewSpace = {
  name: string;
  description: string;
  color?: string;
  picture?: string;
  access: 'public' | 'antechamber' | 'private';
  archetype: 'home' | 'community';
  archetypeTitle?: 'Home' | 'Community';
  members: { [patp: string]: 'owner' | 'initiate' | 'admin' | 'member' };
  type: 'our' | 'group' | 'space';
};
