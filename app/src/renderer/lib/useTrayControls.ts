import { AppRegistry } from 'renderer/apps/registry';
import { ChatStoreInstance } from 'renderer/stores/chat.store';

export const openChatToPath = (
  chatStore: ChatStoreInstance,
  setActiveApp: any,
  path: string,
  msgId?: string
) => {
  chatStore.setChat(path);
  chatStore.setSubroute('chat');
  const { position, anchorOffset, dimensions } = AppRegistry['chat'];
  setActiveApp('messages-tray', {
    willOpen: true,
    anchorOffset,
    position,
    dimensions,
    innerNavigation: msgId, // this makes it scroll to the message in the list (app has to be smart enough to pay attention to innerNavigation)
  });
};
