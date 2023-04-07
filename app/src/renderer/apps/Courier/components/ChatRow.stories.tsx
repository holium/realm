import { ComponentStory, ComponentMeta } from '@storybook/react';
import { ChatRow } from './NewChatRow';

export default {
  title: 'ChatRow',
  component: ChatRow,
} as ComponentMeta<typeof ChatRow>;

export const DirectMessage: ComponentStory<typeof ChatRow> = () => (
  <div
    style={{
      padding: 20,
    }}
  >
    <ChatRow
      ourPatp="~lomder-librun"
      unreadCount={0}
      height={40}
      path={'/realm-chat/~zod/~/~zod'}
      title={'~zod'}
      isAdmin={true}
      peers={['~zod']}
      type={'dm'}
      timestamp={new Date().getTime()}
      lastMessage={null}
      isPinned={false}
      isMuted={false}
      avatarData={{
        title: '~zod',
        sigil: {
          patp: '~zod',
          color: ['#000000', '#ffffff'],
          nickname: 'zoddy',
        },
        image: '',
      }}
      metadata={{
        peer: '~zod',
        image: '',
        title: '~zod',
        description: '',
        timestamp: 1679605742372,
        creator: '~lomder-librun',
        reactions: true,
      }}
      peersGetBacklog={true}
      onClick={(evt) => {
        evt.stopPropagation();
      }}
      togglePinnedChat={(path, isPinned) => {
        console.log('togglePinnedChat', path, isPinned);
      }}
      toggleIsMuted={(path, isMuted) => {
        console.log('toggleIsMuted', path, isMuted);
      }}
      readPath={(app, path) => {
        console.log('readPath', app, path);
      }}
      openChatInfo={(path) => {
        console.log('openChatInfo', path);
      }}
    />
  </div>
);

// export const GroupChat: ComponentStory<typeof ChatRow> = () => (
//   <Flex
//     flexDirection="column"
//     justifyContent="flex-end"
//     p={2}
//     width="100%"
//     height="calc(100vh - 32px)"
//   >
//     <ChatRow
//       height={rowHeight}
//       path={chat.path}
//       title={chat.metadata.title}
//       isAdmin={isAdmin}
//       peers={chat.peers.map((peer) => peer.ship)}
//       type={chat.type}
//       timestamp={chat.createdAt || chat.metadata.timestamp}
//       metadata={chat.metadata}
//       peersGetBacklog={chat.peersGetBacklog}
//       muted={chat.muted}
//       onClick={(evt) => {
//         evt.stopPropagation();
//         setChat(chat.path);
//       }}
//     />
//   </Flex>
// );
