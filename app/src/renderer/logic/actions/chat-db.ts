import { ChatService } from 'os/services/chat/chat.service';
type ChatDBActionType = typeof ChatService.preload;
export const ChatDBActions: ChatDBActionType = window.electron.os.chat;
