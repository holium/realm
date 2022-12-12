import { Instance, types } from 'mobx-state-tree';
import { DMPreview, DMPreviewType } from 'os/services/ship/models/courier';
import { toJS } from 'mobx';

export type DmViewType = 'dm-list' | 'dm-chat' | 'new-chat' | 'loading';

export const DmApp = types
  .model('DMApp', {
    currentPath: types.maybeNull(types.string),
    currentView: types.enumeration([
      'dm-list',
      'dm-chat',
      'new-chat',
      'loading',
    ]),
    selectedChat: types.maybeNull(DMPreview),
  })
  .actions((self) => ({
    setView(view: DmViewType) {
      self.currentView = view;
    },
    setSelectedChat(chat: DMPreviewType | null) {
      if (chat) {
        self.selectedChat = toJS(chat);
        self.currentPath = chat.path;
        self.currentView = 'dm-chat';
      } else {
        self.selectedChat = null;
        self.currentPath = null;
        self.currentView = 'dm-list';
      }
      self.currentPath = null;
    },
    setPath(path: string) {
      if (!self.currentPath) {
        self.currentView = 'dm-list';
      }
      self.currentPath = path;
    },
  }));

export type DmAppInstance = Instance<typeof DmApp>;
