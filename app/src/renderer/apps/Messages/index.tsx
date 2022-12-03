import { observer } from 'mobx-react';
import { Grid, Flex, Spinner } from 'renderer/components';
import { DMs } from './DMs';
import { ChatView } from './ChatView';
import { NewChat } from './NewChat';
import { DMPreviewType } from 'os/services/ship/models/courier';
import { useTrayApps } from '../store';
import { useServices } from '../../logic/store';

export const MessagesTrayApp = observer(() => {
  const { theme } = useServices();
  const { dimensions } = useTrayApps();
  const { dmApp } = useTrayApps();

  const headerSize = 50;
  let viewSwitcher: React.ReactElement = (
    <Grid.Column
      gap={2}
      mt={1}
      mb={3}
      noGutter
      expand
      height={dimensions.height}
      overflowY="auto"
    >
      <Flex flex={1} alignItems="center" justifyContent="center">
        <Spinner size={2} />
      </Flex>
    </Grid.Column>
  );
  const view = dmApp.currentView;
  switch (view) {
    case 'new-chat':
      viewSwitcher = (
        <NewChat
          theme={theme.currentTheme}
          headerOffset={headerSize}
          height={dimensions.height}
          onBack={() => {
            dmApp.setView('dm-list');
          }}
          onCreateNewDm={(newDm: DMPreviewType) => {
            dmApp.setSelectedChat(newDm);
            dmApp.setView('dm-chat');
          }}
        />
      );
      break;
    case 'dm-list':
      viewSwitcher = (
        <DMs
          theme={theme.currentTheme}
          headerOffset={headerSize}
          height={dimensions.height}
          onNewChat={(evt: any) => {
            evt.stopPropagation();
            dmApp.setView('new-chat');
          }}
          onSelectDm={(dm: any) => {
            dmApp.setView('dm-chat');
            dmApp.setSelectedChat(dm);
          }}
        />
      );
      break;
    case 'dm-chat':
      viewSwitcher = (
        <ChatView
          headerOffset={headerSize}
          height={dimensions.height}
          dimensions={dimensions}
          theme={theme.currentTheme}
          // s3Client={s3Client}
          selectedChat={dmApp.selectedChat!}
          setSelectedChat={(chat: any) => {
            if (!chat) dmApp.setView('dm-list');
            dmApp.setSelectedChat(chat);
          }}
          onSend={(message: any) => {
            console.log('dm message', message);
          }}
        />
      );
      break;
  }

  return viewSwitcher;
});
