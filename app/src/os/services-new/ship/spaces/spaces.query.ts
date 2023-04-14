export const spacesModelQuery = `
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
        LEFT JOIN stall_agg sa ON s.path = sa.space
`;
