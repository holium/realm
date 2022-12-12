import { Instance, types } from 'mobx-state-tree';
import { createPost } from '@urbit/api';
import { patp2dec } from 'urbit-ob';
import { Patp } from 'os/types';
import { cleanNounColor } from '../../../lib/color';
import { LoaderModel } from '../../common.model';
import moment from 'moment';
import { pathToDmInbox } from '../../../lib/graph-store';

const MessagePosition = types.enumeration(['right', 'left']);

export const MessageContent = types.union(
  { eager: true },
  types.model('ContentText', { text: types.string }),
  types.model('ContentUrl', { url: types.string }),
  types.model('ContentMention', { mention: types.string }),
  types.model('ContentCode', {
    code: types.model({ expression: types.string }),
  }),
  types.model('ContentReference', {
    reference: types.string,
  }),
  types.model('ContentGroupReference', {
    reference: types.model({
      group: types.string,
    }),
  }),
  types.model('ContentAppReference', {
    reference: types.model({
      app: types.model({
        desk: types.string,
        ship: types.string,
        path: types.string,
      }),
    }),
  }),
  types.model('ContentGraphReference', {
    reference: types.model({
      graph: types.model({
        graph: types.string,
        group: types.string,
        index: types.string,
      }),
    }),
  })
);

export type ContentsType = Instance<typeof MessageContent>;

export const ChatMessage = types.union(
  { eager: false },
  types.model({
    type: 'text',
    index: types.maybe(types.string),
    pending: types.optional(types.boolean, false),
    position: MessagePosition,
    timeSent: types.number,
    author: types.string,
    content: types.model({ text: types.string }),
  }),
  types.model({
    type: 'url',
    index: types.maybe(types.string),
    pending: types.optional(types.boolean, false),
    position: MessagePosition,
    timeSent: types.number,
    author: types.string,
    content: types.model({ url: types.string }),
  }),
  types.model({
    type: 'mention',
    index: types.maybe(types.string),
    pending: types.optional(types.boolean, false),
    position: MessagePosition,
    author: types.string,
    timeSent: types.number,
    content: types.model({ mention: types.string }),
  }),
  types.model({
    type: 'code',
    index: types.maybe(types.string),
    pending: types.optional(types.boolean, false),
    position: MessagePosition,
    author: types.string,
    timeSent: types.number,
    content: types.model({ code: types.model({ expression: types.string }) }),
  }),
  types.model({
    type: 'reference',
    index: types.maybe(types.string),
    pending: types.optional(types.boolean, false),
    position: MessagePosition,
    author: types.string,
    timeSent: types.number,
    content: types.union(
      types.model({
        reference: types.string,
      }),
      types.model({
        reference: types.model({
          group: types.string,
        }),
      }),
      types.model({
        reference: types.model({
          app: types.model({
            desk: types.string,
            ship: types.string,
            path: types.string,
          }),
        }),
      }),
      types.model({
        reference: types.model({
          graph: types.model({
            graph: types.string,
            group: types.string,
            index: types.string,
          }),
        }),
      })
    ),
  })
);
export type ChatMessageType = Instance<typeof ChatMessage>;

export const GraphDM = types.model({
  index: types.maybe(types.string),
  author: types.string,
  timeSent: types.number,
  pending: types.optional(types.boolean, false),
  contents: types.array(MessageContent),
});

export type GraphDMType = Instance<typeof GraphDM>;

const ContactMetadata = types.model({
  avatar: types.maybeNull(types.string),
  color: types.maybeNull(types.string),
  nickname: types.maybeNull(types.string),
});

const GroupLog = types
  .model('GroupLog', {
    path: types.string,
    to: types.array(types.string),
    type: types.enumeration(['group', 'group-pending']),
    source: types.enumeration(['graph-store', 'talk']),
    messages: types.array(GraphDM),
    metadata: types.array(ContactMetadata),
    outgoing: types.array(GraphDM),
  })
  .views((self) => ({
    get list() {
      return Array.from(self.messages.values());
    },
  }))
  .actions((self) => ({
    receiveDM: (incomingDm: GraphDMType) => {
      // for some reason the indexes are different after group dm send
      const replaceIdx = self.messages.findIndex(
        (outDm: GraphDMType) => outDm.timeSent === incomingDm.timeSent
      );
      if (replaceIdx >= 0) {
        // a pending message we've already sent
        self.messages[replaceIdx].index = incomingDm.index;
        self.messages[replaceIdx].pending = false;
      } else {
        self.messages.unshift(incomingDm);
      }
    },
    sendDM: (patp: Patp, contents: any) => {
      const author = patp.substring(1);
      const post = createPost(author, contents);
      self.messages.unshift(
        GraphDM.create({
          index: post.index,
          author: `~${author}`,
          pending: true,
          timeSent: post['time-sent'],
          // @ts-expect-error
          contents: post.contents,
        })
      );
      return post;
    },
  }));
export type GroupLogType = Instance<typeof GroupLog>;

const DMLog = types
  .model('DMLog', {
    path: types.string,
    to: types.string,
    type: types.enumeration(['dm', 'pending']),
    source: types.enumeration(['graph-store', 'talk']),
    messages: types.array(GraphDM),
    metadata: ContactMetadata,
    outgoing: types.array(GraphDM),
  })
  .views((self) => ({
    get list() {
      return Array.from(self.messages.values());
    },
  }))
  .actions((self) => ({
    receiveDM: (incomingDm: GraphDMType) => {
      const replaceIdx = self.messages.findIndex(
        (outDm: GraphDMType) => outDm.index === incomingDm.index
      );
      if (replaceIdx >= 0) {
        // a pending message we've already sent
        self.messages[replaceIdx].pending = false;
      } else {
        self.messages.unshift(incomingDm);
      }
    },
    sendDM: (patp: Patp, contents: any) => {
      const author = patp.substring(1);
      const post = createPost(author, contents, `/${patp2dec(self.to)}`);
      self.messages.unshift(
        GraphDM.create({
          index: post.index,
          author: `~${author}`,
          pending: true,
          timeSent: post['time-sent'],
          // @ts-expect-error
          contents: post.contents,
        })
      );

      return post;
    },
  }));

export type DMLogType = Instance<typeof DMLog>;

const CourierLog = types.union({ eager: true }, DMLog, GroupLog);

export type CourierLogType = Instance<typeof CourierLog>;

const PreviewDM = types
  .model('PreviewDM', {
    path: types.string,
    to: types.string,
    type: types.enumeration(['dm', 'pending']),
    source: types.enumeration(['graph-store', 'talk']),
    lastTimeSent: types.number,
    lastMessage: types.array(MessageContent),
    metadata: ContactMetadata,
    inviteId: types.maybeNull(types.string),
    pending: types.optional(types.boolean, false),
    isNew: types.optional(types.boolean, false),
    unreadCount: types.optional(types.number, 0),
  })
  .actions((self) => ({
    receiveDM: (dm: GraphDMType) => {
      self.lastMessage = dm.contents;
      self.lastTimeSent = dm.timeSent;
    },
    setUnread: (count: number) => {
      self.unreadCount = count;
    },
    clearUnread: () => {
      self.unreadCount = 0;
    },
    incrementUnread: (count: number) => {
      self.unreadCount = self.unreadCount + count;
    },
  }));

export type PreviewDMType = Instance<typeof PreviewDM>;

const PreviewGroupDM = types
  .model('PreviewGroupDM', {
    path: types.string,
    to: types.array(types.string),
    type: types.enumeration(['group', 'group-pending']),
    source: types.enumeration(['graph-store', 'talk']),
    lastTimeSent: types.number,
    lastMessage: types.array(MessageContent),
    metadata: types.array(ContactMetadata),
    inviteId: types.maybeNull(types.string),
    pending: types.optional(types.boolean, false),
    isNew: types.optional(types.boolean, false),
    unreadCount: types.optional(types.number, 0),
  })
  .actions((self) => ({
    receiveDM: (dm: GraphDMType) => {
      // add the sender
      // @ts-expect-error
      self.lastMessage = [{ mention: dm.author }, ...dm.contents];
      self.lastTimeSent = dm.timeSent;
    },
    setUnread: (count: number) => {
      self.unreadCount = count;
    },
    clearUnread: () => {
      self.unreadCount = 0;
    },
    incrementUnread: (count: number) => {
      self.unreadCount = self.unreadCount + count;
    },
  }));

export type PreviewGroupDMType = Instance<typeof PreviewGroupDM>;

export const DMPreview = types.union(
  { eager: true },
  PreviewDM,
  PreviewGroupDM
);

export type DMPreviewType = Instance<typeof DMPreview>;

export const CourierStore = types
  .model('CourierStore', {
    dms: types.map(CourierLog),
    previews: types.map(DMPreview),
    loader: types.optional(LoaderModel, { state: 'initial' }),
  })
  .views((self) => ({
    get list() {
      return Array.from(self.previews.values()).sort(
        (a, b) => b.lastTimeSent - a.lastTimeSent
      );
    },
  }))
  .actions((self) => ({
    rejectDmInvite: (path: string) => {},
    setNewPreview: (preview: DMPreviewType) => {
      let prev;
      if (preview.type === 'group' || preview.type === 'group-pending') {
        prev = preview as PreviewGroupDMType;
        prev.metadata.forEach((mtd: any) => {
          mtd.color = cleanNounColor(mtd.color);
        });
      } else {
        prev = preview as PreviewDMType;
        prev.metadata.color = prev.metadata.color
          ? cleanNounColor(prev.metadata.color)
          : '#000';
      }
      self.previews.set(preview.path, preview);
    },
    setNotificationUpdates: (update: any) => {
      if (update.more.length === 1) {
        if (update.more[0]['read-count']) {
          const place = update.more[0]['read-count'];
          if (place.path.includes('dm-inbox')) {
            const dmPath = pathToDmInbox(place.path);
            const dmPreview = self.previews.get(dmPath);
            dmPreview?.clearUnread();
          } else {
            // is likely group-dm
            const pathArr = place.path.split('/').splice(2);
            const groupDmPath = `/${pathArr.join('/')}`;
            const dmPreview = self.previews.get(groupDmPath);
            dmPreview?.clearUnread();
          }
        }
      }
      if (update.more.length === 2) {
        if (update.more[0]['read-count']) {
          const place = update.more[0]['read-count'];
          if (place.path.includes('dm-inbox')) {
            const dmPath = pathToDmInbox(place.path);
            const dmPreview = self.previews.get(dmPath);
            dmPreview?.clearUnread();
          } else {
            // is likely group-dm
            const pathArr = place.path.split('/').splice(2);
            const groupDmPath = `/${pathArr.join('/')}`;
            const dmPreview = self.previews.get(groupDmPath);
            dmPreview?.clearUnread();
          }
        }
        // then it is [{'opened'}]
        if (update.more[0]['unread-count']) {
          const stats = update.more[0]['unread-count'];
          if (stats.place.path.includes('dm-inbox')) {
            const dmPath = pathToDmInbox(stats.place.path);
            const dmPreview = self.previews.get(dmPath);
            if (stats.inc) {
              dmPreview?.incrementUnread(stats.count);
            }
          } else {
            // is likely group-dm
            const pathArr = stats.place.path.split('/').splice(2);
            const groupDmPath = `/${pathArr.join('/')}`;
            const dmPreview = self.previews.get(groupDmPath);
            if (stats.inc) {
              dmPreview?.incrementUnread(stats.count);
            }
          }
        }
        // this is returned after opened is poked
      }
    },
    setPreviews: (dmPreviews: any) => {
      Object.keys(dmPreviews).forEach((key: string) => {
        const preview: any = dmPreviews[key];
        if (preview.type === 'group' || preview.type === 'group-pending') {
          preview.metadata.forEach((mtd: any) => {
            mtd.color = cleanNounColor(mtd.color);
          });
        } else {
          preview.metadata.color = cleanNounColor(preview.metadata.color);
        }
        self.previews.set(preview.path, preview);
      });
      self.loader.set('loaded');
    },
    draftDM: (patps: Patp[], metadata: any[]) => {
      const path = `/dm-inbox/${patps[0]}`;
      self.dms.set(
        path,
        DMLog.create({
          path: `/dm-inbox/${patps[0]}`,
          to: patps[0],
          type: 'dm',
          source: 'talk',
          messages: [],
          metadata: ContactMetadata.create(metadata[0] || {}),
        })
      );
      self.previews.set(
        path,
        DMPreview.create({
          path: `/dm-inbox/${patps[0]}`,
          to: patps[0],
          type: 'dm',
          source: 'talk',
          lastTimeSent: moment().unix() * 1000,
          lastMessage: [{ text: '' }],
          metadata: ContactMetadata.create(metadata[0] || {}),
          pending: false,
          isNew: true,
        })
      );
      return self.previews.get(path);
    },
    draftGroupDM: (preview: PreviewGroupDMType) => {
      preview.metadata.forEach((mtd: any) => {
        mtd.color = cleanNounColor(mtd.color);
      });
      self.previews.set(
        preview.path,
        DMPreview.create({
          path: preview.path,
          to: preview.to,
          type: preview.type,
          source: preview.source,
          lastTimeSent: preview.lastTimeSent,
          lastMessage: preview.lastMessage,
          metadata: preview.metadata,
          pending: false,
          isNew: true,
        })
      );
      self.dms.set(
        preview.path,
        GroupLog.create({
          path: preview.path,
          to: preview.to,
          type: preview.type,
          source: preview.source,
          messages: [],
          metadata: preview.metadata,
        })
      );
      return self.previews.get(preview.path);
    },
    setDMLog: (dmLog: DMLogType) => {
      self.dms.set(dmLog.path, dmLog);
    },
    setReceivedDM: (dmLog: DMLogType) => {
      if (self.dms.has(dmLog.path)) {
        // if the received message already has a log entry
        const newMessage = dmLog.messages[0];
        self.dms.get(dmLog.path)?.receiveDM(newMessage);
        self.previews.get(dmLog.path)?.receiveDM(newMessage);
      } else {
        // set a new log entry
        self.dms.set(dmLog.path, dmLog);
        self.previews.set(
          dmLog.path,
          DMPreview.create({
            path: dmLog.path,
            to: dmLog.to,
            type: dmLog.type,
            source: dmLog.source,
            lastTimeSent: dmLog.messages[0].timeSent,
            lastMessage: dmLog.messages[0].contents,
            metadata: dmLog.metadata,
            pending: false,
          })
        );
      }
    },
    declineDm: (path: string) => {
      self.previews.delete(path);
    },
  }));

export type CourierStoreType = Instance<typeof CourierStore>;
