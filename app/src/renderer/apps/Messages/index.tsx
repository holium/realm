import { observer } from 'mobx-react';
import { Flex, Spinner } from '@holium/design-system';
import { Grid } from 'renderer/components';
import { DMs } from './DMs';
import { ChatView } from './ChatView';
import { NewChat } from './NewChat';
import { DMPreviewType } from 'os/services/ship/models/courier';
import { useTrayApps } from '../store';
import { useServices } from '../../logic/store';
import { useStorage } from 'renderer/logic/lib/useStorage';

const MessagesTrayAppPresenter = () => {
  const { theme } = useServices();
  const { dimensions } = useTrayApps();
  const { dmApp } = useTrayApps();
  const storage = useStorage();

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
          theme={theme.currentTheme as any}
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
          theme={theme.currentTheme as any}
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
          height={dimensions.height}
          theme={theme.currentTheme as any}
          storage={storage}
          selectedChat={dmApp.selectedChat as DMPreviewType}
        />
      );
      break;
  }

  return viewSwitcher;
};

export const MessagesTrayApp = observer(MessagesTrayAppPresenter);
