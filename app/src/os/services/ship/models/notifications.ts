import { NotificationApi } from '../../../api/notifications';
import { cast, Instance, types, flow } from 'mobx-state-tree';
import { daToUnix, decToUd, udToDec, unixToDa } from '@urbit/api';
import bigInt from 'big-integer';

const NotificationContentTypes = types.union(
  { eager: true },
  types.model('ContentTextTitle', {
    text: types.string,
  }),
  types.model('ContentShipTitle', { ship: types.string })
);

const PlaceModel = types.model({
  desk: types.string,
  path: types.string,
});

export type PlaceModelType = Instance<typeof PlaceModel>;

export const NotificationModel = types
  .model('NotificationModel', {
    // index: types.identifier,
    timebox: types.maybe(types.number),
    seen: types.optional(types.boolean, false),
    dismissed: types.optional(types.boolean, false),
    link: types.string,
    title: types.array(NotificationContentTypes),
    time: types.number,
    content: types.array(NotificationContentTypes),
    place: PlaceModel,
    // config: types.model({}),
  })
  .actions((self) => ({
    setSeen: flow(function* () {
      // ::  %saw-place: Update last-updated for .place to now.bowl
      // [%saw-place =place time=(unit time)]
      // const response = yield NotificationApi.sawPlace(
      //   self.place,
      //   decToUd(unixToDa(Date.now() * 1000).toString())
      // );
      // console.log(response);
      self.seen = true;
    }),
    setRead() {
      //  ::  %read-count: set unread count to zero
      //  [%read-count =place]
    },
    archive(lid: string, bin: PlaceModelType) {
      // ::  %archive: archive single notification
      // ::  if .time is ~, then archiving unread notification
      // ::  else, archiving read notification
      // [%archive =lid =bin]
    },
  }));

export type NotificationModelType = Instance<typeof NotificationModel>;

const AllStatsModel = types.model('AllStats', {
  place: PlaceModel,
  stats: types.model({
    count: types.number,
    each: types.array(types.frozen()),
    last: types.number,
  }),
});
export type AllStatsModelType = Instance<typeof AllStatsModel>;

export const NotificationStore = types
  .model('NotificationStore', {
    unseen: types.array(NotificationModel),
    seen: types.array(NotificationModel),
    all: types.array(AllStatsModel),
    recent: types.array(NotificationModel),
  })
  .actions((self) => ({
    setInitial(data: any) {
      let allTimeboxes: NotificationModelType[] = [];
      data.more.forEach(({ timebox }: { timebox: RawTimeBoxType }) => {
        const timeboxId = daToUnix(bigInt(udToDec(timebox.lid.archive)));
        timebox.notifications.forEach((notification: RawNotificationType) => {
          notification.body.forEach((body: RawNotificationBody) => {
            allTimeboxes.push(
              NotificationModel.create({
                timebox: timeboxId,
                link: body.link,
                title: body.title,
                time: body.time,
                content: body.content,
                place: notification.bin.place,
              })
            );
          });
        });
      });
      allTimeboxes = Array.from<NotificationModelType>(new Set(allTimeboxes));
      self.recent = cast(allTimeboxes);
    },
    setAllStats(data: any) {
      const allStats = data.more[0]['all-stats'];
      const allStatsList: AllStatsModelType[] = allStats.map(
        (statsData: AllStatsModelType) => ({
          place: statsData.place,
          stats: statsData.stats,
        })
      );
      self.all = cast(allStatsList);
    },
    setWatchUpdate(data: any) {
      //  'opened' is returned when the notification
      if (data.more.length === 1) {
        // then it is [{'opened'}]
        if (data.more[0].opened) {
          self.seen.concat(self.unseen);
          self.unseen.clear();
        }
        if (data.more[0].added) {
          // when a new post is added
          const notification = data.more[0].added;
          notification.body.forEach((body: RawNotificationBody) => {
            // console.log(body.title, body.content);
            self.unseen.unshift(
              NotificationModel.create({
                link: body.link,
                title: body.title,
                time: body.time,
                content: body.content,
                place: notification.bin.place,
              })
            );
          });
          self.unseen = self.unseen.sort((a, b) => b.time - a.time);
          return;
        }
        // if (data['more'][0]['read-count']) {
        //   const place = data['more'][0]['read-count'];
        //   if (place.path.includes('dm-inbox')) {
        //     const pathArr = place.path.split('/').splice(3);
        //     const dmPath = `/${pathArr.join('/')}`;
        //     console.log(dmPath);
        //   } else {
        //     // is likely group-dm
        //     const pathArr = place.path.split('/').splice(2);
        //     const groupDmPath = `/${pathArr.join('/')}`;
        //     console.log(groupDmPath);
        //   }
        // }
        // this is returned after opened is poked
      }
      if (data.more.length === 2) {
        // then it is [{'opened'}]
        if (data.more[0]['unread-count']) {
          // console.log(data['more'][0]['unread-count']);
        }
        // this is returned after opened is poked
      }
      if (data.more.length === 3) {
        if (data.more[0]['read-count']) {
          // console.log(
          //   "[{'read-count'}, {'archived'}, {'archived'}]",
          //   data['more']
          // );
        }
        if (data.more[0].timebox) {
          // console.log(
          //   "[{'timebox'}, {'timebox'}, {'all-stats'}]",
          //   data['more']
          // );
          // then it is the initial [{'timebox'}, {'timebox'}, {'all-stats'}]
          const unseenTimebox: RawTimeBoxType = data.more[0]?.timebox;
          let unseenTimeboxes: NotificationModelType[] = [];
          if (unseenTimebox) {
            unseenTimebox.notifications.forEach(
              (notification: RawNotificationType) => {
                notification.body.forEach((body: RawNotificationBody) => {
                  unseenTimeboxes.unshift(
                    NotificationModel.create({
                      link: body.link,
                      title: body.title,
                      time: body.time,
                      content: body.content,
                      place: notification.bin.place,
                    })
                  );
                });
              }
            );
          }
          const seenTimebox = data.more[1]?.timebox;
          let seenTimeboxes: NotificationModelType[] = [];
          if (seenTimebox) {
            seenTimebox.notifications.forEach(
              (notification: RawNotificationType) => {
                notification.body.forEach((body: RawNotificationBody) => {
                  seenTimeboxes.unshift(
                    NotificationModel.create({
                      link: body.link,
                      title: body.title,
                      time: body.time,
                      content: body.content,
                      place: notification.bin.place,
                    })
                  );
                });
              }
            );
          }
          const allStats = data.more[2] && data.more[2]['all-stats'];
          // console.log(allStats);
          const allStatsList: AllStatsModelType[] = allStats.map(
            (statsData: AllStatsModelType) => ({
              place: statsData.place,
              stats: statsData.stats,
            })
          );

          unseenTimeboxes = Array.from<NotificationModelType>(
            new Set(unseenTimeboxes)
          );

          self.unseen = cast(unseenTimeboxes);
          self.unseen = self.unseen.sort((a, b) => b.time - a.time);

          seenTimeboxes = Array.from<NotificationModelType>(
            new Set(seenTimeboxes)
          );
          self.seen = cast(
            seenTimeboxes.sort(
              (notifA: any, notifB: any) => notifB.time - notifA.time
            )
          );
          self.all = cast(allStatsList);
        }
      }
    },
    setSeen: flow(function* (link: string) {
      // ::  %saw-place: Update last-updated for .place to now.bowl
      // [%saw-place =place time=(unit time)]
      const notif = self.recent.find(
        (notification: NotificationModelType) => notification.link === link
      );
      // Only set as seen if it is unseen
      if (notif) {
        const response = yield NotificationApi.sawPlace(
          notif?.place,
          decToUd(unixToDa(Date.now() * 1000).toString())
        );
      }
      // if (unseen) {
      // const response = yield NotificationApi.sawPlace(
      //   unseen?.place,
      //   decToUd(unixToDa(Date.now() * 1000).toString())
      // );
      //   console.log(response);
      //   unseen?.setSeen();
      //   // self.unseen.remove(unseen);
      //   // self.seen.unshift(unseen);
      // }
    }),
    setDismissed: flow(function* (link: string) {
      const unseen = self.unseen.find(
        (notification: NotificationModelType) => notification.link === link
      );
      const seen = self.seen.find(
        (notification: NotificationModelType) => notification.link === link
      );
      const notif = unseen || seen;
    }),
    getByLink(link: string) {
      const unseen = self.unseen.find(
        (notification: NotificationModelType) => notification.link === link
      );
      const seen = self.seen.find(
        (notification: NotificationModelType) => notification.link === link
      );
      return unseen || seen;
    },
  }));

export type NotificationStoreType = Instance<typeof NotificationStore>;

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

// Notes
//
// new notification received
// [{'added'}] {
//   body: [
//     {
//       link: '/graph-validator-dm/~rilmyl-soltyd-lomder-librun/dm-inbox/3794141858/170141184505825689191024443210495688704',
//       title: [Array],
//       time: 1662814917958,
//       content: [Array]
//     }
//   ],
//   bin: {
//     place: {
//       desk: 'landscape',
//       path: '/graph/~rilmyl-soltyd-lomder-librun/dm-inbox/3794141858'
//     },
//     path: '/'
//   },
//   time: 1662814917958
// }
//
// If it is a DM it sends an update to increase the unread count
//
// [{'unread-count'},{'saw-place'}] => {
//   count: 1,
//   place: {
//     desk: 'landscape',
//     path: '/graph/~rilmyl-soltyd-lomder-librun/dm-inbox/3794141858'
//   },
//   inc: true
// }
