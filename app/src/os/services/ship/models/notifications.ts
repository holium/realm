import {
  applySnapshot,
  castToSnapshot,
  getSnapshot,
  Instance,
  types,
} from 'mobx-state-tree';
import { toJS } from 'mobx';

export const NotificationModel = types.model({
  body: types.array(
    types.model({
      link: types.string,
      title: types.array(
        types.model({
          text: types.string,
        })
      ),
      time: types.number,
    })
  ),
  bin: types.model({
    place: types.model({
      desk: types.string,
      path: types.string,
    }),
    path: types.string,
  }),
  time: types.number,
});

export const HarkStats = types.model({
  place: types.model({
    desk: types.string,
    path: types.string,
  }),
  stats: types.model({
    count: types.number,
    each: types.array(types.string),
    last: types.number,
  }),
});

export const HarkTimeboxModel = {
  lid: types.union(
    types.model({
      unseen: types.null,
    }),
    types.model({ seen: types.null })
  ),
  notifications: types.array(NotificationModel),
};

export const HarkItemModel = types.union(
  {
    eager: true,
  },
  types.model({
    timebox: types.model(HarkTimeboxModel),
  }),
  types.model({
    'all-stats': types.array(HarkStats),
  })
);

export type HarkItemModelType = Instance<typeof HarkItemModel>;

export const NotificationsStore = types
  .model({ more: types.array(HarkItemModel) })
  .views((self) => {
    return {
      get list() {
        return getSnapshot(self.more);
      },
      timeboxes() {
        return self.more
          .filter((item: HarkItemModelType) => item.timebox)
          .map((item) => toJS(item));
      },
    };
  })
  .actions((self) => ({
    initial(more: typeof self.more) {
      applySnapshot(self.more, castToSnapshot(more));
    },
    // setAllStats(data: any) {
    //   const allStats = data['more'][0]['all-stats'];
    //   let allStatsList: AllStatsModelType[] = allStats.map(
    //     (statsData: AllStatsModelType) => ({
    //       place: statsData.place,
    //       stats: statsData.stats,
    //     })
    //   );
    //   self.all = cast(allStatsList);
    // },
  }));

export type NotificationsType = Instance<typeof NotificationsStore>;

// ---------------------------------------------------------
// ----------- Using raw sample to derive type -------------
// ---------------------------------------------------------
const RawTimeBox = {
  lid: {
    archive: '170.141.184.505.695.783.140.383.789.785.529.974.784',
  },
  notifications: [
    {
      body: [
        {
          link: '/graph-validator-dm/~labruc-dillyx-lomder-librun/dm-inbox/14221824/170141184505695782988185766278450905088',
          title: [
            {
              text: 'New messages from ',
            },
            {
              ship: '~datryn-ribdun',
            },
          ],
          time: 1655772688591,
          content: [
            {
              text: 'nice',
            },
          ],
        },
      ],
      bin: {
        place: {
          desk: 'landscape',
          path: '/graph/~labruc-dillyx-lomder-librun/dm-inbox/14221824',
        },
        path: '/',
      },
      time: 1655772688591,
    },
  ],
};

// 👇️ type Values = 1 | "James Doe" | 100
export type RawTimeBoxType = typeof RawTimeBox;
// 👇️ type Values = 1 | "James Doe" | 100
export type RawNotificationType = typeof RawTimeBox.notifications[0];

export type RawNotificationBody = typeof RawTimeBox.notifications[0]['body'][0];
