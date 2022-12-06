import { FC } from 'react';
import { observer } from 'mobx-react';
import { ThemeModelType } from 'os/services/theme.model';
import { Grid, Flex, Spinner } from 'renderer/components';
import { DMs } from './DMs';
import { ChatView } from './ChatView';
import { NewChat } from './NewChat';
import { DMPreviewType } from 'os/services/ship/models/courier';
import { useTrayApps } from '../store';

interface ChatProps {
  theme: ThemeModelType;
  dimensions: {
    height: number;
    width: number;
  };
}

export const MessagesTrayApp: FC<any> = observer((props: ChatProps) => {
  const { dimensions } = props;
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
          theme={props.theme}
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
          theme={props.theme}
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
          theme={props.theme}
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
