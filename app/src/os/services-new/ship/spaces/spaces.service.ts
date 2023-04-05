import AbstractService, { ServiceOptions } from '../../abstract.service';
import { Database } from 'better-sqlite3-multiple-ciphers';
import log from 'electron-log';
import APIConnection from '../../conduit';
import { SpacesDB } from './tables/spaces.model';
import { MembersDB } from './tables/members.model';

const pathToObj = (path: string) => {
  const pathArr = path.split('/');
  const pathObj = {
    ship: pathArr[1],
    space: pathArr[2],
  };
  return pathObj;
};

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
          this.membersDB?.insertAll(data['initial'].membership);
          this.spacesDB?.setCurrent(data['initial'].current.path);
          break;
        case 'add':
          // this.spacesDB?.insert(data['add']);
          break;
        case 'remove':
          // this.spacesDB?.remove(data['remove']);
          break;
        case 'replace':
          // this.spacesDB?.replace(data['replace']);
          break;
        case 'remote-space':
          // when a remote space is added, we need to add it to our local db
          // this.spacesDB?.remove(data['remote-space']);
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
              WHEN COUNT(docks.id) > 0 THEN json_array(json_object(
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
                      'gridIndex', ag.idx
                      )
                  )
              ELSE json('[]')
            END AS dock
          FROM docks
          LEFT JOIN app_catalog ac ON docks.id = ac.id
          LEFT JOIN app_grid ag ON ac.id = ag.appId
                WHERE ag.idx IS NOT NULL
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
    const result = query.all();
    const currentSpace = result.filter((row) => row.current === 1)[0];

    return {
      current: currentSpace ? currentSpace.path : null,
      spaces: result.map((row) => {
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

  // public poke(payload: PokeParams) {
  //   return APIConnection.getInstance().conduit.poke(payload);
  // }
  // public scry(payload: Scry) {
  //   console.log('scry', payload);
  //   return APIConnection.getInstance().conduit.scry(payload);
  // }
}

export default SpacesService;

// Generate preload
export const spacesPreload = SpacesService.preload(
  new SpacesService({ preload: true })
);
