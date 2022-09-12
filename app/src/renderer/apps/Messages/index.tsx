import { FC, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { ThemeModelType } from 'os/services/shell/theme.model';
import { Grid, Flex, Spinner } from 'renderer/components';
import { DMs } from './DMs';
import { ChatView } from './ChatView';
import { NewChat } from './NewChat';
import { ShipActions } from 'renderer/logic/actions/ship';
import S3Client from 'renderer/logic/s3/S3Client';
import { DMPreviewType } from 'os/services/ship/models/courier';
import { useTrayApps } from '../store';
import { DmViewType } from './store';

type ChatProps = {
  theme: ThemeModelType;
  dimensions: {
    height: number;
    width: number;
  };
};

// enum ChatViewTypes {
//   New = 'new-chat',
//   List = 'chat-list',
//   Chat = 'chat',
// }
type ChatViewType = 'dm-list' | 'dm-chat' | 'new-chat' | 'loading';

export const MessagesTrayApp: FC<any> = observer((props: ChatProps) => {
  const { dimensions } = props;
  // const [currentView, setCurrentView] = useState<ChatViewType>('dm-list');
  // const [selectedChat, setSelectedChat] = useState<DMPreviewType | undefined>(
  //   undefined
  // );
  const { dmApp } = useTrayApps();
  const [s3Config, setS3Config] = useState<any>();
  // const [s3Client, setS3Client] = useState<any>();

  // useEffect(() => {
  //   ShipActions.getS3Bucket().then((response) => {
  //     setS3Config(response);
  //     setS3Client(
  //       new S3Client({
  //         credentials: response.credentials,
  //         endpoint: response.credentials.endpoint,
  //         signatureVersion: 'v4',
  //       })
  //     );
  //   });
  // }, []);

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

  // return (
  //   <>
  //     {selectedChat ? (
  //       <Grid.Column
  //         style={{ position: 'relative', color: textColor }}
  //         expand
  //         noGutter
  //         overflowY="hidden"
  //       >
  //         {/* <Grid.Row
  //           style={{
  //             position: 'absolute',
  //             zIndex: 5,
  //             top: 0,
  //             left: 0,
  //             right: 0,
  //             height: headerSize,
  //             background: rgba(lighten(0.23, backgroundColor), 0.9),
  //             backdropFilter: 'blur(8px)',
  //             borderBottom: `1px solid ${rgba(backgroundColor, 0.7)}`,
  //           }}
  //           expand
  //           noGutter
  //           align="center"
  //         > */}
  //         <Titlebar
  //           hasBlur
  //           closeButton={false}
  //           hasBorder
  //           zIndex={5}
  //           theme={{
  //             ...props.theme,
  //             windowColor: rgba(lighten(0.225, props.theme.windowColor), 0.8),
  //           }}
  //         >
  //           <Flex pl={3} pr={4} justifyContent="center" alignItems="center">
  //             <IconButton
  //               className="realm-cursor-hover"
  //               size={26}
  //               style={{ cursor: 'none' }}
  //               customBg={dockColor}
  //               onClick={(evt: any) => {
  //                 evt.stopPropagation();
  //                 setSelectedChat(null);
  //               }}
  //             >
  //               <Icons name="ArrowLeftLine" />
  //             </IconButton>
  //           </Flex>
  //           <Flex flex={1} gap={10} alignItems="center" flexDirection="row">
  //             <Box>
  //               <Sigil
  //                 simple
  //                 size={28}
  //                 avatar={null}
  //                 patp={selectedChat.contact}
  //                 color={['#000000', 'white']}
  //               />
  //             </Box>
  //             <Text fontSize={3} fontWeight={500}>
  //               {selectedChat.contact}
  //             </Text>
  //           </Flex>
  //           <Flex pl={2} pr={2} mr={3}>
  //             <IconButton
  //               className="realm-cursor-hover"
  //               customBg={dockColor}
  //               style={{ cursor: 'none' }}
  //               size={26}
  //             >
  //               <Icons name="Phone" />
  //             </IconButton>
  //           </Flex>
  //         </Titlebar>
  //         <Flex
  //           style={{
  //             zIndex: 4,
  //             position: 'relative',
  //             bottom: 0,
  //             left: 0,
  //             right: 0,
  //             backfaceVisibility: 'hidden',
  //             transform: 'translate3d(0, 0, 0)',
  //           }}
  //           overflowY="hidden"
  //         >
  //           <ChatView
  //             headerOffset={headerSize}
  //             dimensions={dimensions}
  //             theme={props.theme}
  //             contact={selectedChat.contact}
  //             height={dimensions.height}
  //             onSend={(message: any) => {
  //               console.log('dm message', message);
  //             }}
  //           />
  //         </Flex>
  //       </Grid.Column>
  //     ) : (
  //       <DMs
  //         theme={props.theme}
  //         headerOffset={headerSize}
  //         height={dimensions.height}
  //         onSelectDm={(dm: any) => {
  //           setSelectedChat(dm);
  //         }}
  //       />
  //     )}
  //   </>
  // );
});
