import log from 'electron-log';
import { Database } from 'better-sqlite3-multiple-ciphers';
import AbstractService, { ServiceOptions } from '../abstract.service';
import APIConnection from '../conduit';
import { NotificationsDB } from './models/notifications.model';
import { ChatDB } from './models/chat.model';

export class ChatService extends AbstractService {
  protected chatDB?: ChatDB;
  constructor(options?: ServiceOptions, db?: Database) {
    super('chatService', options);
    if (options?.preload) {
      return;
    }
    this.chatDB = new ChatDB(false, db);
  }
}

export default ChatService;

// Generate preload
export const chatPreload = ChatService.preload(
  new ChatService({ preload: true })
);
