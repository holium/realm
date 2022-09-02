import { Instance, types, applySnapshot } from 'mobx-state-tree';
import { createPost } from '@urbit/api';
import { patp2dec } from 'urbit-ob';
import { Patp } from 'os/types';
import { toJS } from 'mobx';
import { cleanNounColor } from '../../../lib/color';
import { LoaderModel } from '../../common.model';
import moment from 'moment';

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
    source: types.enumeration(['graph-store', 'chatstead']),
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
    receiveDM: (dm: GraphDMType) => {
      // console.log(dm);
      self.messages.unshift(dm);
      // self.outgoing
    },
    sendDM: (patp: Patp, contents: any) => {
      const author = patp.substring(1);
      const post = createPost(author, contents);
      self.outgoing.unshift(
        GraphDM.create({
          index: post.index,
          author: author,
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
    source: types.enumeration(['graph-store', 'chatstead']),
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
    receiveDM: (dm: GraphDMType) => {
      // console.log(dm);
      self.messages.unshift(dm);
    },
    sendDM: (patp: Patp, contents: any) => {
      const author = patp.substring(1);
      const post = createPost(author, contents, `/${patp2dec(self.to)}`);
      self.outgoing.unshift(
        GraphDM.create({
          index: post.index,
          author: author,
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
    source: types.enumeration(['graph-store', 'chatstead']),
    lastTimeSent: types.number,
    lastMessage: types.array(MessageContent),
    metadata: ContactMetadata,
    pending: types.optional(types.boolean, false),
    isNew: types.optional(types.boolean, false),
  })
  .actions((self) => ({
    receiveDM: (dm: GraphDMType) => {
      self.lastMessage = dm.contents;
      self.lastTimeSent = dm.timeSent;
    },
  }));

export type PreviewDMType = Instance<typeof PreviewDM>;

const PreviewGroupDM = types
  .model('PreviewGroupDM', {
    path: types.string,
    to: types.array(types.string),
    type: types.enumeration(['group']),
    source: types.enumeration(['graph-store', 'chatstead']),
    lastTimeSent: types.number,
    lastMessage: types.array(MessageContent),
    metadata: types.array(ContactMetadata),
    pending: types.optional(types.boolean, false),
    isNew: types.optional(types.boolean, false),
  })
  .actions((self) => ({
    receiveDM: (dm: GraphDMType) => {
      // add the sender
      dm.contents.unshift({ mention: dm.author });
      self.lastMessage = dm.contents;
      self.lastTimeSent = dm.timeSent;
    },
  }));

export type PreviewGroupDMType = Instance<typeof PreviewGroupDM>;

const DMPreview = types.union({ eager: true }, PreviewDM, PreviewGroupDM);

export type DMPreviewType = Instance<typeof DMPreview>;

export const CourierStore = types
  .model('CourierStore', {
    dms: types.map(CourierLog),
    previews: types.map(DMPreview),
    loader: types.optional(LoaderModel, { state: 'initial' }),
  })
  .views((self) => ({
    get list() {
      return Array.from(self.previews.values()).sort((a, b) => {
        // @ts-ignore
        return b.pending - a.pending || b.lastTimeSent - a.lastTimeSent;
      });
    },
  }))
  .actions((self) => ({
    setPreviews: (dmPreviews: any) => {
      // console.log(dmPreviews);
      Object.keys(dmPreviews).forEach((key: string) => {
        const preview: any = dmPreviews[key];
        if (preview.type === 'group') {
          preview.metadata.forEach((mtd: any) => {
            mtd.color = cleanNounColor(mtd.color);
          });
        } else {
          preview.metadata.color = cleanNounColor(preview.metadata.color);
        }
      });
      applySnapshot(self.previews, dmPreviews);
      self.loader.set('loaded');
    },
    draftNew: (patps: Patp[], metadata: any[]) => {
      const type = patps.length === 1 ? 'dm' : 'group';
      if (type === 'dm') {
        self.dms.set(
          patps[0],
          DMLog.create({
            path: `/dm-inbox/${patps[0]}`,
            to: patps[0],
            type: type,
            source: 'graph-store',
            messages: [],
            metadata: ContactMetadata.create(metadata[0] || {}),
            outgoing: [],
          })
        );
        self.previews.set(
          patps[0],
          DMPreview.create({
            path: `/dm-inbox/${patps[0]}`,
            to: patps[0],
            type: 'type',
            source: 'graph-store',
            lastTimeSent: moment().unix() * 1000,
            lastMessage: [{ text: 'Drafting...' }],
            metadata: ContactMetadata.create(metadata[0] || {}),
            pending: false,
            isNew: true,
          })
        );
        return self.previews.get(patps[0]);
      } else {
        // is group
        return;
      }
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
          dmLog.to,
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
  }));

export type CourierStoreType = Instance<typeof CourierStore>;
