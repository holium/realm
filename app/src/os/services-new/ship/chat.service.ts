import log from 'electron-log';
import { Database } from 'better-sqlite3-multiple-ciphers';
import AbstractService, { ServiceOptions } from '../abstract.service';
import APIConnection from '../conduit';
import { chatDBPreload, ChatDB } from './models/chat.model';
import { ChatPathMetadata, ChatPathType } from './models/chat.types';
import { InvitePermissionType } from 'renderer/apps/Courier/models';

export class ChatService extends AbstractService {
  public chatDB?: ChatDB;
  constructor(options?: ServiceOptions, db?: Database) {
    super('chatService', options);
    if (options?.preload) {
      return;
    }
    this.chatDB = new ChatDB({ preload: false, db });
  }

  async sendMessage(path: string, fragments: any[]) {
    const payload = {
      app: 'realm-chat',
      mark: 'chat-action',
      json: {
        'send-message': {
          path: path,
          fragments,
          'expires-in': null,
        },
      },
    };
    await APIConnection.getInstance().conduit.poke(payload);
    return {
      path,
      pending: true,
      content: fragments,
    };
  }

  async toggleMutedChat(path: string, mute: boolean) {
    const payload = {
      app: 'realm-chat',
      mark: 'chat-action',
      json: {
        'mute-chat': {
          path,
          mute,
        },
      },
    };
    try {
      await APIConnection.getInstance().conduit.poke(payload);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to toggle muted chat');
    }
  }

  async setPinnedMessage(path: string, msgId: string) {
    const payload = {
      app: 'realm-chat',
      mark: 'chat-action',
      json: {
        'pin-message': {
          'msg-id': msgId,
          path: path,
          pin: true,
        },
      },
    };
    try {
      await APIConnection.getInstance().conduit.poke(payload);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to pin chat');
    }
  }

  async clearPinnedMessage(path: string) {
    const payload = {
      app: 'realm-chat',
      mark: 'chat-action',
      json: {
        'clear-pinned-messages': {
          path: path,
        },
      },
    };
    try {
      await APIConnection.getInstance().conduit.poke(payload);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to unpin chat');
    }
  }

  async editMessage(path: string, msgId: string, fragments: any[]) {
    const payload = {
      app: 'realm-chat',
      mark: 'chat-action',
      json: {
        'edit-message': {
          'msg-id': msgId,
          path,
          fragments,
        },
      },
    };
    try {
      await APIConnection.getInstance().conduit.poke(payload);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to edit message');
    }
  }

  async deleteMessage(path: string, msgId: string) {
    const payload = {
      app: 'realm-chat',
      mark: 'chat-action',
      json: {
        'delete-message': {
          'msg-id': msgId,
          path,
        },
      },
    };
    try {
      await APIConnection.getInstance().conduit.poke(payload);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to delete message');
    }
  }

  async clearChatBacklog(_evnt: any, path: string) {
    const payload = {
      app: 'realm-chat',
      mark: 'chat-action',
      json: {
        'delete-backlog': {
          path,
        },
      },
    };
    try {
      await APIConnection.getInstance().conduit.poke(payload);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to delete chat backlog');
    }
  }

  async createChat(
    _evt: any,
    peers: string[],
    type: ChatPathType,
    metadata: ChatPathMetadata
  ) {
    let dmPeer = '';
    if (type === 'dm') {
      // store the peer in metadata in the case the peer leaves
      dmPeer =
        peers.filter(
          (p) => p !== `~${APIConnection.getInstance().conduit?.ship}`
        )[0] || '';
      metadata.peer = dmPeer;
    }
    const payload = {
      app: 'realm-chat',
      mark: 'chat-action',
      reaction: '',
      json: {
        'create-chat': {
          type,
          metadata,
          peers,
          invites: 'anyone',
          'max-expires-at-duration': null,
        },
      },
    };
    try {
      await APIConnection.getInstance().conduit.poke(payload);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to create chat');
    }
  }

  // readChat(path: string) {
  //   if (! APIConnection.getInstance().conduit) throw new Error('No conduit connection');
  //   //  APIConnection.getInstance().conduit.readChat(path);
  // }

  async togglePinnedChat(path: string, pinned: boolean) {
    const payload = {
      app: 'realm-chat',
      mark: 'chat-action',
      reaction: '',
      json: {
        'pin-chat': {
          path,
          pin: pinned,
        },
      },
    };
    try {
      await APIConnection.getInstance().conduit.poke(payload);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to pin chat');
    }
  }

  async editChatMetadata(
    _evt: any,
    path: string,
    metadata: ChatPathMetadata,
    invites: InvitePermissionType,
    peersGetBacklog: boolean,
    expiresDuration: number
  ) {
    console.log('editChatMetadata', path, invites, peersGetBacklog);
    const payload = {
      app: 'realm-chat',
      mark: 'chat-action',
      reaction: '',
      json: {
        'edit-chat': {
          path,
          metadata,
          invites,
          'peers-get-backlog': peersGetBacklog,
          'max-expires-at-duration': expiresDuration,
        },
      },
    };
    try {
      await APIConnection.getInstance().conduit.poke(payload);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to edit chat');
    }
  }

  async addPeerToChat(path: string, ship: string) {
    const payload = {
      app: 'realm-chat',
      mark: 'chat-action',
      reaction: '',
      json: {
        'add-ship-to-chat': {
          ship,
          path,
        },
      },
    };
    try {
      await APIConnection.getInstance().conduit.poke(payload);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to create chat');
    }
  }

  async removePeerFromChat(path: string, ship: string) {
    const payload = {
      app: 'realm-chat',
      mark: 'chat-action',
      reaction: '',
      json: {
        'remove-ship-from-chat': {
          ship,
          path,
        },
      },
    };
    try {
      await APIConnection.getInstance().conduit.poke(payload);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to create chat');
    }
  }

  /**
   * leaveChat
   *
   * @description calls remove-ship-from-chat with our ship
   * which will remove us from the chat and delete it if we
   * are the host
   *
   * @param _evt
   * @param path
   */
  async leaveChat(path: string) {
    const payload = {
      app: 'realm-chat',
      mark: 'chat-action',
      reaction: '',
      json: {
        'remove-ship-from-chat': {
          ship: `~${APIConnection.getInstance().conduit?.ship}`,
          path,
        },
      },
    };
    try {
      await APIConnection.getInstance().conduit.poke(payload);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to leave chat');
    }
  }
}

export default ChatService;

// Generate preload
const chatServiceInstance = ChatService.preload(
  new ChatService({ preload: true })
);

export const chatPreload = {
  ...chatDBPreload,
  ...chatServiceInstance,
};
