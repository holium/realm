import { Instance, types, applySnapshot } from 'mobx-state-tree';
import { cleanNounColor } from '../../../lib/color';
import { LoaderModel } from '../../common.model';

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
  contents: types.array(MessageContent),
});

export type GraphDMType = Instance<typeof GraphDM>;

const ContactMetadata = types.model({
  avatar: types.maybeNull(types.string),
  color: types.maybeNull(types.string),
  nickname: types.maybeNull(types.string),
});

const DMLog = types.model('DMLog', {
  path: types.string,
  to: types.string,
  type: types.enumeration(['group', 'dm']),
  source: types.enumeration(['graph-store', 'chatstead']),
  messages: types.array(GraphDM),
  metadata: ContactMetadata,
});

export type DMLogType = Instance<typeof DMLog>;

const DMPreview = types.model('DmPreview', {
  path: types.string,
  to: types.string,
  type: types.enumeration(['group', 'dm']),
  source: types.enumeration(['graph-store', 'chatstead']),
  lastTimeSent: types.number,
  lastMessage: types.array(MessageContent),
  metadata: ContactMetadata,
  pending: types.optional(types.boolean, false),
});

export type DMPreviewType = Instance<typeof DMPreview>;

export const CourierStore = types
  .model('CourierStore', {
    dms: types.map(DMLog),
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
      Object.keys(dmPreviews).forEach((key: string) => {
        const preview: any = dmPreviews[key];
        preview.metadata.color = cleanNounColor(preview.metadata.color);
      });
      applySnapshot(self.previews, dmPreviews);
      self.loader.set('loaded');
    },
    setDMLog: (dmLog: DMLogType) => {
      self.dms.set(dmLog.to, dmLog);
    },
  }));

export type CourierStoreType = Instance<typeof CourierStore>;
